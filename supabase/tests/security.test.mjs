// Security tests for the CMS database, storage and auth rules.
//
// Run against a LOCAL Supabase only (supabase start), never production: the
// tests create and delete users and content.
//
//   SUPABASE_URL=http://localhost:54321 \
//   SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
//   node --test supabase/tests/security.test.mjs
//
// The service-role key is used only here, to create test users.

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceKey) throw new Error("Set SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.");
if (!/localhost|127\.0\.0\.1/.test(url)) throw new Error("Refusing to run against a non-local Supabase.");

const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, serviceKey, options);
const anon = createClient(url, anonKey, options);
const password = "Test-password-123!";
const stamp = Date.now();
const emails = { owner: `owner-${stamp}@test.local`, editor: `editor-${stamp}@test.local`, nobody: `nobody-${stamp}@test.local` };
const clients = {};
const ids = {};

async function signedIn(email) {
  const client = createClient(url, anonKey, options);
  const { error } = await client.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  return client;
}

const published = async () => (await anon.rpc("get_published_content")).data;
const png = () =>
  new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64")], {
    type: "image/png",
  });

before(async () => {
  for (const [role, email] of Object.entries(emails)) {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    assert.ifError(error);
    ids[role] = data.user.id;
  }
  // As the SQL editor would: the first owner, then the owner promotes an editor.
  await admin.from("profiles").update({ role: "owner" }).eq("id", ids.owner);
  clients.owner = await signedIn(emails.owner);
  const { error } = await clients.owner.from("profiles").update({ role: "editor" }).eq("id", ids.editor);
  assert.ifError(error);
  clients.editor = await signedIn(emails.editor);
  clients.nobody = await signedIn(emails.nobody);
});

after(async () => {
  for (const id of Object.values(ids)) await admin.auth.admin.deleteUser(id);
});

describe("visitors (anon)", () => {
  test("can read published content", async () => {
    const data = await published();
    assert.ok(data.pages.home.sections.hero.title);
    assert.ok(Array.isArray(data.equipment));
  });

  test("cannot read any table directly", async () => {
    for (const table of ["pages", "page_sections", "equipment", "site_settings", "media", "content_revisions", "profiles"]) {
      const { data, error } = await anon.from(table).select("*").limit(1);
      assert.ok(error || data.length === 0, `${table} readable by anon`);
    }
  });

  test("cannot write or publish", async () => {
    const insert = await anon.from("equipment").insert({ slug: "hack", draft: { title: "x" } });
    assert.ok(insert.error);
    const publish = await anon.rpc("cms_publish_all");
    assert.ok(publish.error);
  });

  test("cannot sign up", async () => {
    const { error } = await anon.auth.signUp({ email: `walk-in-${stamp}@test.local`, password });
    assert.ok(error, "public sign-up should be disabled");
  });

  test("cannot upload images", async () => {
    const { error } = await anon.storage.from("site-media").upload(`anon-${stamp}.png`, png());
    assert.ok(error);
  });
});

describe("signed-in users without a role", () => {
  test("see no content rows", async () => {
    const { data } = await clients.nobody.from("page_sections").select("id");
    assert.equal(data.length, 0);
  });

  test("cannot edit, publish or give themselves a role", async () => {
    const { data: rows } = await clients.nobody
      .from("page_sections")
      .update({ draft: { title: "hacked" } })
      .neq("section_key", "")
      .select("id");
    assert.equal(rows?.length ?? 0, 0);
    assert.ok((await clients.nobody.rpc("cms_publish_all")).error);
    const promote = await clients.nobody.from("profiles").update({ role: "owner" }).eq("id", ids.nobody);
    assert.ok(promote.error, "self-promotion must fail");
  });

  test("cannot upload images", async () => {
    const { error } = await clients.nobody.storage.from("site-media").upload(`nobody-${stamp}.png`, png());
    assert.ok(error);
  });
});

describe("editors", () => {
  let hero;
  before(async () => {
    const { data } = await clients.editor
      .from("page_sections")
      .select("id, draft, published, pages!inner(slug)")
      .eq("section_key", "hero")
      .eq("pages.slug", "home")
      .single();
    hero = data;
  });

  test("saving a draft does not change the live site", async () => {
    const draft = { ...hero.draft, title: `Draft heading ${stamp}` };
    const { error } = await clients.editor.from("page_sections").update({ draft }).eq("id", hero.id);
    assert.ifError(error);
    assert.equal((await published()).pages.home.sections.hero.title, hero.published.title);
  });

  test("publishing makes the draft live and keeps a revision", async () => {
    const { error } = await clients.editor.rpc("cms_publish", { p_table: "page_sections", p_id: hero.id });
    assert.ifError(error);
    assert.equal((await published()).pages.home.sections.hero.title, `Draft heading ${stamp}`);
    const { data: revisions } = await clients.editor.from("content_revisions").select("id, content").eq("entity_id", hero.id);
    assert.ok(revisions.some((r) => r.content.title === `Draft heading ${stamp}`));
  });

  test("restoring a revision and publishing brings the original back", async () => {
    await clients.editor.from("page_sections").update({ draft: hero.published }).eq("id", hero.id);
    await clients.editor.rpc("cms_publish", { p_table: "page_sections", p_id: hero.id });
    assert.equal((await published()).pages.home.sections.hero.title, hero.published.title);
  });

  test("cannot write the published copy directly", async () => {
    const { error } = await clients.editor.from("page_sections").update({ published: { title: "sneaky" } }).eq("id", hero.id);
    assert.ok(error, "published must only change through cms_publish");
  });

  test("cannot add or delete page sections", async () => {
    const insert = await clients.editor.from("page_sections").insert({ page_id: hero.id, section_key: "x", section_type: "x" });
    assert.ok(insert.error);
    const { data } = await clients.editor.from("page_sections").delete().eq("id", hero.id).select("id");
    assert.equal(data?.length ?? 0, 0);
  });

  test("unsafe links and image sources are refused", async () => {
    for (const href of ["javascript:alert(1)", "http://insecure.example", "//evil.example", "data:text/html,hi"]) {
      const draft = { ...hero.draft, primary: { label: "x", href } };
      const { error } = await clients.editor.from("page_sections").update({ draft }).eq("id", hero.id);
      assert.ok(error, `link ${href} was accepted`);
    }
    const draft = { ...hero.draft, image: { src: "javascript:alert(1)", alt: "" } };
    assert.ok((await clients.editor.from("page_sections").update({ draft }).eq("id", hero.id)).error);
  });

  test("oversized text and odd field names are refused", async () => {
    const long = { ...hero.draft, title: "x".repeat(6000) };
    assert.ok((await clients.editor.from("page_sections").update({ draft: long }).eq("id", hero.id)).error);
    const odd = { ...hero.draft, "<script>": "x" };
    assert.ok((await clients.editor.from("page_sections").update({ draft: odd }).eq("id", hero.id)).error);
  });

  test("cannot change roles", async () => {
    const { error } = await clients.editor.from("profiles").update({ role: "owner" }).eq("id", ids.editor);
    assert.ok(error);
  });

  describe("equipment", () => {
    let item;
    test("add, publish, unpublish and delete", async () => {
      const { data, error } = await clients.editor
        .from("equipment")
        .insert({ slug: `test-${stamp}`, draft: { title: "Test machine", intro: "", specs: [] }, draft_sort_order: 99 })
        .select()
        .single();
      assert.ifError(error);
      item = data;
      const isLive = async () => (await published()).equipment.some((e) => e.id === item.slug);
      assert.equal(await isLive(), false, "new items start unpublished");
      assert.ifError((await clients.editor.rpc("cms_publish", { p_table: "equipment", p_id: item.id })).error);
      assert.equal(await isLive(), true);
      assert.ifError((await clients.editor.rpc("cms_unpublish_equipment", { p_id: item.id })).error);
      assert.equal(await isLive(), false);
      const { data: gone } = await clients.editor.from("equipment").delete().eq("id", item.id).select("id");
      assert.equal(gone.length, 1);
    });

    test("cannot publish an item without a name", async () => {
      const { data } = await clients.editor
        .from("equipment")
        .insert({ slug: `nameless-${stamp}`, draft: { title: " " } })
        .select()
        .single();
      assert.ok((await clients.editor.rpc("cms_publish", { p_table: "equipment", p_id: data.id })).error);
      await clients.editor.from("equipment").delete().eq("id", data.id);
    });
  });

  describe("images", () => {
    const path = `uploads/test-${stamp}.png`;
    test("upload works for images and refuses other files", async () => {
      assert.ifError((await clients.editor.storage.from("site-media").upload(path, png())).error);
      const html = new Blob(["<script>alert(1)</script>"], { type: "text/html" });
      assert.ok((await clients.editor.storage.from("site-media").upload(`uploads/x-${stamp}.html`, html)).error);
      const big = new Blob([new Uint8Array(5 * 1024 * 1024 + 10)], { type: "image/png" });
      assert.ok((await clients.editor.storage.from("site-media").upload(`uploads/big-${stamp}.png`, big)).error);
    });

    test("an image in use cannot be deleted", async () => {
      const { error } = await clients.editor
        .from("media")
        .insert({ file_path: path, original_filename: "t.png", mime_type: "image/png", file_size: 70 });
      assert.ifError(error);
      const src = clients.editor.storage.from("site-media").getPublicUrl(path).data.publicUrl;
      const { data: section } = await clients.editor
        .from("page_sections")
        .select("id, draft")
        .eq("section_key", "safety")
        .single();
      const original = section.draft;
      const set = await clients.editor
        .from("page_sections")
        .update({ draft: { ...original, photo: { src, alt: "Test" } } })
        .eq("id", section.id);
      assert.ifError(set.error);

      const removed = await clients.editor.storage.from("site-media").remove([path]);
      assert.equal(removed.data?.length ?? 0, 0, "storage delete of an in-use image must do nothing");
      const { data: rows } = await clients.editor.from("media").delete().eq("file_path", path).select("id");
      assert.equal(rows.length, 0, "media row in use must not delete");

      await clients.editor.from("page_sections").update({ draft: original }).eq("id", section.id);
      const { data: rows2 } = await clients.editor.from("media").delete().eq("file_path", path).select("id");
      assert.equal(rows2.length, 1);
      const removed2 = await clients.editor.storage.from("site-media").remove([path]);
      assert.equal(removed2.data?.length, 1);
    });
  });
});

describe("owners", () => {
  test("the last owner cannot be demoted", async () => {
    const { error } = await clients.owner.from("profiles").update({ role: "editor" }).eq("id", ids.owner);
    assert.ok(error);
  });

  test("can take access away from an editor", async () => {
    assert.ifError((await clients.owner.from("profiles").update({ role: "none" }).eq("id", ids.editor)).error);
    const { data } = await clients.editor.from("page_sections").select("id");
    assert.equal(data.length, 0);
    await clients.owner.from("profiles").update({ role: "editor" }).eq("id", ids.editor);
  });
});
