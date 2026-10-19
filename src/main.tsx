import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import App from "./App";
import { ContentContext } from "./content/ContentContext";
import { loadContent } from "./content/load";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

if (/^\/admin(\/|$)/.test(window.location.pathname)) {
  // The dashboard is its own bundle, so visitors never download it, and it
  // skips the public site's smooth scrolling and page animations.
  const AdminApp = lazy(() => import("./admin/AdminApp"));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    </StrictMode>,
  );
} else {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  void loadContent().then(({ content, preview }) => {
    root.render(
      <StrictMode>
        <ContentContext value={content}>
          <App />
        </ContentContext>
        {preview && (
          <div
            role="status"
            className="fixed bottom-4 left-4 z-50 rounded-md bg-white px-3 py-1.5 font-tight text-xs font-bold tracking-[0.08em] text-jch-bg uppercase shadow-lg"
          >
            Draft preview · not live
          </div>
        )}
      </StrictMode>,
    );
  });
}
