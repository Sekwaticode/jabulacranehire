// End-to-end test of the dashboard and public site against a LOCAL Supabase.
// It creates and deletes users and content, so never point it at production.
//
//   npm run build && npx vite preview --port 4173      (built with .env.local -> local Supabase)
//   SITE_URL=http://localhost:4173 SUPABASE_URL=http://localhost:54321 \
//   SUPABASE_ANON_KEY=<local key> SUPABASE_SERVICE_ROLE_KEY=<local key> CHROMIUM_PATH=<optional> \
//   node supabase/tests/dashboard.e2e.mjs
//
// Needs `playwright` and `pngjs` installed (npm i -D playwright pngjs). The service-role key is the
// local stack's, used only to create test users.
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { PNG } from "pngjs";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SITE = process.env.SITE_URL ?? "http://localhost:4173";
const SB = process.env.SUPABASE_URL ?? "http://localhost:54321";
if (!/localhost|127\.0\.0\.1/.test(SB + SITE)) throw new Error("Refusing to run against a non-local site or Supabase.");
const env = { SERVICE: process.env.SUPABASE_SERVICE_ROLE_KEY, ANON: process.env.SUPABASE_ANON_KEY };
if (!env.SERVICE || !env.ANON) throw new Error("Set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANON_KEY (local stack).");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jch-e2e-"));
const admin = createClient(SB, env.SERVICE, { auth: { persistSession: false } });
const password = "Test-password-123!";
const users = { owner: "owner@test.local", editor: "editor@test.local", nobody: "nobody@test.local" };
for (const [role, email] of Object.entries(users)) {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  if (role !== "nobody") await admin.from("profiles").update({ role }).eq("id", data.user.id);
}
// A real 1200x800 PNG to upload.
const png = new PNG({ width: 1200, height: 800 });
for (let i = 0; i < png.data.length; i += 4) png.data.set([40, 120, 200, 255], i);
fs.writeFileSync(`${tmp}/test-photo.png`, PNG.sync.write(png));
fs.writeFileSync(`${tmp}/fake.png`, "<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>");

const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(["PASS", name]);
    console.log("PASS", name);
  } catch (e) {
    results.push(["FAIL", name, e.message.split("\n")[0]]);
    console.log("FAIL", name, "\n   ", e.message.split("\n").slice(0, 3).join("\n    "));
  }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const errors = [];
async function newPage(viewport = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.setDefaultTimeout(10000);
  page.on("pageerror", (e) => errors.push(e.message));
  return page;
}
async function publicText(path, selector = "h1") {
  const page = await newPage();
  await page.goto(SITE + path, { waitUntil: "networkidle" });
  const text = await page.locator(selector).first().textContent();
  await page.context().close();
  return text.replace(/\s+/g, " ").trim();
}
async function signIn(page, email) {
  await page.goto(SITE + "/admin");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}
const toast = (page, text) => page.getByRole("status").filter({ hasText: text }).first().waitFor({ timeout: 8000 });
const dialog = (page) => page.getByRole("dialog");

const originalTitle = await publicText("/");
console.log("Original home title:", originalTitle);

await step("Signed-out visitors see the sign-in form, not the dashboard", async () => {
  const page = await newPage();
  await page.goto(SITE + "/admin/settings");
  await page.getByRole("button", { name: "Sign in", exact: true }).waitFor();
  expect(!(await page.getByText("Business details & settings").count()), "dashboard visible");
  await page.context().close();
});

await step("Wrong password is refused", async () => {
  const page = await newPage();
  await page.goto(SITE + "/admin");
  await page.getByLabel("Email").fill(users.owner);
  await page.getByLabel("Password").fill("nope-nope-nope");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByText("That email and password don't match.").waitFor();
  await page.context().close();
});

await step("A signed-in account with no role gets 'No dashboard access'", async () => {
  const page = await newPage();
  await signIn(page, users.nobody);
  await page.getByText("No dashboard access yet").waitFor();
  await page.context().close();
});

await step("Editors can edit but have no Users screen", async () => {
  const page = await newPage();
  await signIn(page, users.editor);
  await page.getByRole("heading", { name: "Overview" }).waitFor();
  expect(!(await page.getByRole("link", { name: "Users" }).count()), "Users link shown to editor");
  await page.goto(SITE + "/admin/users");
  await page.getByText("That dashboard page doesn't exist.").waitFor();
  await page.context().close();
});

const page = await newPage();
await step("Owner signs in and sees the overview stats", async () => {
  await signIn(page, users.owner);
  await page.getByRole("heading", { name: "Overview" }).waitFor();
  await page.getByText("Editable items").waitFor();
  await page.getByRole("link", { name: "Users" }).waitFor();
});

const hero = () => page.locator("section#hero");
async function openHero() {
  await page.goto(SITE + "/admin/pages/home");
  const toggle = page.getByRole("button", { name: /1\. Hero/ });
  await toggle.waitFor();
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
}

await step("Saving a draft does not change the live site", async () => {
  await openHero();
  await hero().getByLabel("Main heading").fill("E2E draft heading");
  await hero().getByRole("button", { name: "Save draft" }).click();
  await toast(page, "Draft saved");
  expect((await publicText("/")) === originalTitle, "live title changed after draft save");
});

await step("Admin routes survive a refresh and the draft is still there", async () => {
  await page.reload();
  const toggle = page.getByRole("button", { name: /1\. Hero/ });
  await toggle.click();
  expect((await hero().getByLabel("Main heading").inputValue()) === "E2E draft heading", "draft lost after reload");
  await hero().getByText("Unpublished changes").waitFor();
});

await step("Preview shows the draft with a 'not live' badge", async () => {
  const [popup] = await Promise.all([page.waitForEvent("popup"), page.getByRole("button", { name: "Preview drafts" }).click()]);
  await popup.getByText("Draft preview · not live").waitFor({ timeout: 10000 });
  await popup.waitForFunction(() => document.querySelector("h1")?.textContent?.includes("E2E draft heading"), null, { timeout: 10000 });
  await popup.close();
  expect((await publicText("/")) === originalTitle, "preview leaked to live site");
});

await step("Unsafe links are refused before saving", async () => {
  await hero().getByLabel("Goes to").first().fill("javascript:alert(1)");
  await hero().getByRole("button", { name: "Save draft" }).click();
  await hero().getByRole("alert").first().waitFor();
  await hero().getByRole("button", { name: "Discard unsaved edits" }).click();
});

await step("The database also refuses unsafe links sent directly", async () => {
  const c = createClient(SB, env.ANON, { auth: { persistSession: false } });
  await c.auth.signInWithPassword({ email: users.owner, password });
  const { data: row } = await c.from("page_sections").select("id, draft").eq("section_key", "hero").limit(1).single();
  const { error } = await c.from("page_sections").update({ draft: { ...row.draft, primary: { label: "x", href: "javascript:alert(1)" } } }).eq("id", row.id);
  expect(error, "database accepted a javascript: link");
});

await step("Publishing updates the live site without a rebuild", async () => {
  await hero().getByRole("button", { name: "Publish", exact: true }).click();
  await toast(page, "Published");
  const live = await publicText("/");
  expect(live.includes("E2E draft heading"), `live title is "${live}"`);
});

await step("History restores an earlier published version", async () => {
  await hero().getByLabel("Main heading").fill("E2E second heading");
  await hero().getByRole("button", { name: "Save and publish" }).click();
  await toast(page, "Published");
  expect((await publicText("/")).includes("E2E second heading"), "second publish not live");
  await hero().getByRole("button", { name: "History" }).click();
  await dialog(page).getByRole("button", { name: "Restore as draft" }).first().click();
  await toast(page, "That version is now your draft");
  expect((await hero().getByLabel("Main heading").inputValue()) === "E2E draft heading", "restore didn't load the earlier version");
  expect((await publicText("/")).includes("E2E second heading"), "restore changed live site before publish");
  await hero().getByRole("button", { name: "Publish", exact: true }).click();
  await toast(page, "Published");
  expect((await publicText("/")).includes("E2E draft heading"), "restored version not live");
});

await step("Non-image files are rejected on upload", async () => {
  await hero().getByRole("button", { name: "Add image" }).click();
  await dialog(page).getByLabel("Upload a new image").setInputFiles(`${tmp}/fake.png`);
  await page.getByRole("alert").filter({ hasText: /JPEG|PNG|WebP|image/i }).first().waitFor({ timeout: 8000 });
});

let photoUrl;
await step("Uploading an image and publishing shows it on the live site", async () => {
  await dialog(page).getByLabel("Upload a new image").setInputFiles(`${tmp}/test-photo.png`);
  await toast(page, "Image uploaded");
  await hero().getByLabel("Image description (alt text)").fill("Blue test photo");
  await hero().getByRole("button", { name: "Save and publish" }).click();
  await toast(page, "Published");
  const p = await newPage();
  await p.goto(SITE + "/", { waitUntil: "networkidle" });
  photoUrl = await p.locator('img[alt="Blue test photo"]').first().getAttribute("src");
  expect(photoUrl?.startsWith(SB + "/storage/v1/object/public/site-media/uploads/"), `img src ${photoUrl}`);
  const res = await p.request.get(photoUrl);
  expect(res.ok(), "image URL not served");
  await p.context().close();
});

await step("An image in use can't be deleted", async () => {
  await page.goto(SITE + "/admin/media");
  await page.getByRole("button", { name: "Delete", exact: true }).first().click();
  await page.getByRole("alert").filter({ hasText: "still used in" }).first().waitFor();
});

await step("Replacing the image: remove from hero, then delete it from the library", async () => {
  await openHero();
  await hero().getByRole("button", { name: "Remove", exact: true }).click();
  await hero().getByLabel("Main heading").fill(originalTitle);
  await hero().getByRole("button", { name: "Save and publish" }).click();
  await toast(page, "Published");
  await page.goto(SITE + "/admin/media");
  await page.getByRole("button", { name: "Delete", exact: true }).first().click();
  await dialog(page).getByRole("button", { name: "Delete image" }).click();
  await toast(page, "Image deleted");
  const res = await page.request.get(photoUrl);
  expect(!res.ok(), "deleted image still served");
  const live = await publicText("/");
  expect(live === originalTitle, `title not restored: ${live}`);
});

await step("Settings: a new phone number updates every call link", async () => {
  await page.goto(SITE + "/admin/settings");
  const section = page.locator("section#business");
  await section.getByRole("button", { name: /Business details/ }).click();
  const phone = section.getByLabel("Office number");
  const old = await phone.inputValue();
  await phone.fill("013 000 0000");
  await section.getByRole("button", { name: "Save and publish" }).click();
  await toast(page, "Published");
  const p = await newPage();
  await p.goto(SITE + "/contact", { waitUntil: "networkidle" });
  expect(await p.locator('a[href="tel:+27130000000"]').count() > 0, "new tel link missing");
  expect((await p.locator(`a[href="tel:+27${old.replace(/\D/g, "").slice(1)}"]`).count()) === 0, "old tel link still present");
  await p.context().close();
  await phone.fill(old);
  await section.getByRole("button", { name: "Save and publish" }).click();
  await toast(page, "Published");
});

let eqUrl;
await step("Add equipment, publish it: card and quote option appear", async () => {
  await page.goto(SITE + "/admin/equipment");
  await page.getByRole("button", { name: "Add equipment" }).click();
  await dialog(page).getByLabel("Name").fill("E2E Lift");
  await dialog(page).getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("heading", { name: "E2E Lift" }).waitFor();
  eqUrl = page.url();
  await page.getByLabel("Short description").fill("A test machine.");
  await page.getByRole("button", { name: "Save and publish" }).click();
  await toast(page, "Published");
  const p = await newPage();
  await p.goto(SITE + "/equipment", { waitUntil: "networkidle" });
  await p.getByText("E2E Lift").first().waitFor({ timeout: 5000 });
  await p.goto(SITE + "/contact", { waitUntil: "networkidle" });
  const opts = await p.locator('select[name="equipment"] option').allTextContents();
  expect(opts.includes("E2E Lift"), `quote options: ${opts.join(", ")}`);
  await p.context().close();
});

await step("Reorder equipment and publish the new order", async () => {
  await page.goto(SITE + "/admin/equipment");
  await page.getByRole("button", { name: "Move E2E Lift up" }).click();
  await page.waitForTimeout(800);
  const titles = await page.locator("ol li a span.font-semibold").allTextContents();
  expect(titles.at(-2) === "E2E Lift", `admin order ${titles}`);
  await page.goto(SITE + "/admin");
  await page.getByRole("button", { name: /Publish all changes/ }).click();
  await dialog(page).getByRole("button", { name: "Publish all" }).click();
  await toast(page, "Published");
  const p = await newPage();
  await p.goto(SITE + "/contact", { waitUntil: "networkidle" });
  const opts = (await p.locator('select[name="equipment"] option').allTextContents()).filter((o) => o && !/not sure|choose|select/i.test(o));
  expect(opts.at(-2) === "E2E Lift", `live order ${opts}`);
  await p.context().close();
});

await step("Hiding equipment removes it from the live site", async () => {
  await page.goto(eqUrl);
  await page.getByRole("button", { name: "Hide from website" }).click();
  await dialog(page).getByRole("button", { name: "Hide from website" }).click();
  await toast(page, "hidden from the website");
  const p = await newPage();
  await p.goto(SITE + "/equipment", { waitUntil: "networkidle" });
  expect((await p.getByText("E2E Lift").count()) === 0, "hidden item still shows");
  await p.context().close();
});

await step("Deleting equipment", async () => {
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await dialog(page).getByRole("button", { name: "Delete for good" }).click();
  await toast(page, "deleted");
  await page.getByRole("heading", { name: "Equipment" }).waitFor();
  expect((await page.locator("main").getByText("E2E Lift").count()) === 0, "deleted item listed");
});

await step("Owner changes a user's role; last owner can't be removed", async () => {
  await page.goto(SITE + "/admin/users");
  const nobody = page.getByRole("combobox", { name: `Role for ${users.nobody}` });
  await nobody.selectOption("editor");
  await toast(page, "is now");
  await nobody.selectOption("none");
  await toast(page, "is now");
  const me = page.getByRole("combobox", { name: `Role for ${users.owner}` });
  await me.selectOption("editor");
  await dialog(page).getByRole("button", { name: "Change my role" }).click();
  await page.getByRole("alert").filter({ hasText: "at least one owner" }).waitFor();
});

await step("Dashboard works on a phone-size screen", async () => {
  const p = await newPage({ width: 390, height: 844 });
  await signIn(p, users.owner);
  await p.getByRole("heading", { name: "Overview" }).waitFor();
  await p.getByRole("button", { name: "Open menu" }).click();
  await p.locator('.fixed.inset-0 a[href="/admin/equipment"]').click();
  await p.getByRole("heading", { name: "Equipment" }).waitFor();
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(!overflow, "horizontal scroll on mobile");
  await p.screenshot({ path: `${tmp}/admin-mobile.png` });
  await p.context().close();
});

await step("Quote form still opens WhatsApp with the request", async () => {
  const p = await newPage();
  await p.goto(SITE + "/contact", { waitUntil: "networkidle" });
  const form = p.locator("form").filter({ has: p.locator('select[name="equipment"]') }).first();
  await form.locator('input[name="name"]').fill("Test Person");
  await form.locator('input[name="phone"]').fill("0820000000");
  await form.locator('select[name="equipment"]').selectOption({ index: 1 });
  await form.locator('input[name="operator"]').first().check();
  await form.locator('input[name="location"]').fill("Middelburg");
  await form.locator('select[name="duration"]').selectOption({ index: 1 });
  await form.locator('[name="details"]').fill("3 t load, 20 m radius");
  // This sandbox can't reach WhatsApp, so record the address the form opens.
  await p.evaluate(() => { window.open = (url) => { window.__opened = String(url); return null; }; });
  await form.getByRole("button", { name: "Submit quote request" }).click();
  const opened = await p.evaluate(() => window.__opened);
  expect(/wa\.me|whatsapp/.test(opened ?? ""), `opened ${opened}`);
  expect(decodeURIComponent(opened).includes("Test Person"), "message missing details");
  await p.getByText("Thank you").waitFor();
  await p.context().close();
});

await step("Public interactions: menu, equipment pop-up, FAQ", async () => {
  const p = await newPage();
  await p.goto(SITE + "/", { waitUntil: "networkidle" });
  await p.getByRole("button", { name: /menu/i }).first().click();
  await p.waitForTimeout(600);
  await p.keyboard.press("Escape");
  await p.goto(SITE + "/equipment", { waitUntil: "networkidle" });
  await p.locator('#page button[aria-haspopup="dialog"]').first().click();
  await p.getByRole("dialog").waitFor();
  await p.keyboard.press("Escape");
  await p.goto(SITE + "/contact", { waitUntil: "networkidle" });
  const faq = p.locator("#page button[aria-expanded]").filter({ hasText: "?" }).first();
  const before = await faq.getAttribute("aria-expanded");
  await faq.click();
  await p.waitForTimeout(300);
  expect((await faq.getAttribute("aria-expanded")) !== before, "FAQ didn't toggle");
  await p.context().close();
});

await step("If Supabase is down, the site falls back to built-in content", async () => {
  const p = await newPage();
  await p.route(SB + "/**", (r) => r.abort());
  const t0 = Date.now();
  await p.goto(SITE + "/", { waitUntil: "load" });
  await p.locator("h1").first().waitFor();
  const t = (await p.locator("h1").first().textContent()).replace(/\s+/g, " ").trim();
  expect(t === originalTitle, `fallback title ${t}`);
  console.log("    fallback render after", Date.now() - t0, "ms");
  await p.context().close();
});

await step("If Supabase is down after a visit, the cached content is used", async () => {
  const p = await newPage();
  await p.goto(SITE + "/", { waitUntil: "networkidle" });
  const cached = await p.evaluate(() => !!localStorage.getItem("jch-published-content-v1"));
  expect(cached, "no cache written");
  await p.route(SB + "/**", (r) => r.abort());
  await p.reload({ waitUntil: "load" });
  await p.locator("h1").first().waitFor();
  await p.context().close();
});

await page.context().close();
await browser.close();
const testEmails = new Set(Object.values(users));
for (const u of (await admin.auth.admin.listUsers()).data.users) if (testEmails.has(u.email)) await admin.auth.admin.deleteUser(u.id);
console.log("\nPage errors:", errors.length ? errors : "none");
const failed = results.filter((r) => r[0] === "FAIL");
console.log(`${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
