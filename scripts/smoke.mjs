/* Runtime smoke test: boots index.html in jsdom with the real vendored
   scripts and verifies the preloader completes, GSAP initializes and the
   DOM reaches its animated baseline. Run: npm test */
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const root = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const html = fs
  .readFileSync(path.join(root, "index.html"), "utf8")
  .replace(/<link[^>]*fonts[^>]*>/g, "") // skip Google Fonts (no network in CI)
  .replace(/<script type="module" src="\.\/assets\/js\/main.js[^"]*"><\/script>/,
    '<script defer src="./assets/js/main.js"></script>'); // jsdom has no ES-module support; main.js is import/export-free

const errors = [];
let failed = 0; // shared tally across both passes

const dom = new JSDOM(html, {
  url: "http://localhost:8080/",
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
  beforeParse(window) {
    const mq = (q) => ({
      matches: false,
      media: q,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    });
    window.matchMedia = mq;
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    window.scrollTo = () => {};
    // jsdom lacks SVG layout APIs that MotionPathPlugin's align uses in real browsers
    const ctm = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    // jsdom lacks SVGAnimatedTransformList; real browsers have it
    Object.defineProperty(window.SVGElement.prototype, "transform", {
      configurable: true,
      get() {
        return { baseVal: { numberOfItems: 0, consolidate: () => ({ matrix: ctm }) } };
      },
    });
    [window.SVGElement, window.SVGGElement, window.SVGPathElement].forEach((C) => {
      if (!C) return;
      C.prototype.getCTM = function () { return ctm; };
      C.prototype.getBBox = function () { return { x: 0, y: 0, width: 100, height: 100 }; };
    });
    window.addEventListener("error", (e) => errors.push("error: " + e.message));
    window.addEventListener("unhandledrejection", (e) => errors.push("rejection: " + e.reason));
  },
});

const { window } = dom;
window.document.addEventListener("DOMContentLoaded", () => {});

setTimeout(() => {
  const d = window.document;
  const checks = {
    "gsap loaded": !!window.gsap,
    "ScrollTrigger loaded": !!window.ScrollTrigger,
    "Lenis loaded": !!window.Lenis,
    "preloader marked done": d.getElementById("preloader")?.dataset.done === "1",
    "preloader hidden": window.getComputedStyle(d.getElementById("preloader")).display === "none",
    "game split into words": d.querySelectorAll("#game .mword").length,
    "game hot words": d.querySelectorAll("#game .mword.is-hot").length,
    "counter 1891 animated/valid": ["0", "1891"].includes(d.querySelector('[data-count="1891"]')?.textContent),
    "legend rows present": d.querySelectorAll(".legend-row").length === 6,
    "rule rows present": d.querySelectorAll(".rule-row").length === 6,
    "court figures present": d.querySelectorAll("#courts figure").length === 3,
    "dunk stages dimmed by JS": Array.from(d.querySelectorAll("#dunk .stage")).every((el) => el.style.opacity === "0.2"),
    "no runtime errors": errors.length === 0,
  };

  for (const [k, v] of Object.entries(checks)) {
    const ok = v === true || (typeof v === "number" && v > 0);
    console.log(`${ok ? "PASS" : "FAIL"}  ${k}${typeof v === "number" ? ` (${v})` : ""}`);
    if (!ok) failed++;
  }
  if (errors.length) {
    const unique = [...new Set(errors)];
    console.log("ERRORS:", unique.slice(0, 5).join("\n"), `(total ${errors.length})`);
  }
  window.close();
}, 6500);

/* ---- Second pass: prefers-reduced-motion — static experience ------------- */
const dom2 = new JSDOM(html, {
  url: "http://localhost:8080/",
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
  beforeParse(window) {
    const mq = (q) => ({
      matches: q.includes("prefers-reduced-motion"),
      media: q, onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; },
    });
    window.matchMedia = mq;
    window.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
    window.scrollTo = () => {};
    const errors2 = [];
    window.addEventListener("error", (e) => errors2.push(e.message));
    window.__btGetErrors = () => errors2;
  },
});

setTimeout(() => {
  const d2 = dom2.window.document;
  const checks2 = {
    "RM: preloader hidden instantly": d2.getElementById("preloader").style.display === "none",
    "RM: no word split (plain copy)": d2.querySelectorAll("#game .mword").length === 0,
    "RM: counters left at true values": d2.querySelector('[data-count="1891"]')?.textContent === "1891",
    "RM: no custom cursor": !d2.body.classList.contains("has-cursor"),
    "RM: no lenis smooth class": !d2.documentElement.classList.contains("lenis-smooth"),
    "RM: no runtime errors": (dom2.window.__btGetErrors?.() || []).length === 0,
  };
  let failed2 = 0;
  for (const [k, v] of Object.entries(checks2)) {
    console.log(`${v ? "PASS" : "FAIL"}  ${k}`);
    if (!v) failed2++;
  }
  dom2.window.close();
  process.exit(failed || failed2 ? 1 : 0);
}, 8500);

