/* ==========================================================================
   BLACKTOP — motion & interaction
   Stack: GSAP 3.15 + ScrollTrigger + MotionPathPlugin + Lenis (self-hosted)
   Rules of this file:
   - Every hidden/initial animation state is applied HERE, never in CSS.
     If this file fails to run, the page stays a complete static document.
   - prefers-reduced-motion gets a coherent static experience (no pins,
     no parallax, no smooth-scroll), not just fewer tweens.
   ========================================================================== */

const gsap = window.gsap;
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = window.matchMedia("(pointer: fine)").matches;

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

const preloader = $("#preloader");
if (window.__btFailsafe) clearTimeout(window.__btFailsafe);

/* ---- Bail-out path: vendor libs missing → ship the static document ------- */
if (!gsap || !window.ScrollTrigger) {
  if (preloader) {
    preloader.dataset.done = "1";
    preloader.style.display = "none";
  }
  throw new Error("BLACKTOP: GSAP failed to load — static fallback engaged.");
}

gsap.registerPlugin(window.ScrollTrigger, window.MotionPathPlugin);
gsap.defaults({ ease: "power3.out", duration: 1 });

/* Sticky header veil — shared by both motion modes */
const nav = $("#nav");
const navPaint = () =>
  nav.classList.toggle("is-scrolled", (window.scrollY || 0) > 40);
window.addEventListener("scroll", navPaint, { passive: true });
navPaint();

/* ==========================================================================
   Reduced motion — coherent static experience
   ========================================================================== */
if (REDUCED) {
  if (preloader) {
    preloader.dataset.done = "1";
    preloader.style.display = "none";
  }

  // Progress bar without animation
  const bar = $("#progress-bar");
  if (bar) {
    const paint = () =>
      (bar.style.transform = `scaleX(${
        window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)
      })`);
    window.addEventListener("scroll", paint, { passive: true });
    paint();
  }

  // Anchor jumps, natively
  $$("[data-scroll]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const t = document.querySelector(el.getAttribute("data-scroll"));
      if (t) t.scrollIntoView();
    })
  );
  const toTop = $("#to-top");
  if (toTop)
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "auto" })
    );
} else {
  /* ========================================================================
     Smooth scroll (Lenis) — wheel only; touch stays native
     ======================================================================== */
  const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.stop();
  lenis.on("scroll", window.ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  $$("[data-scroll]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      lenis.scrollTo(el.getAttribute("data-scroll"), { duration: 1.7 });
    })
  );
  $("#to-top").addEventListener("click", () =>
    lenis.scrollTo(0, { duration: 2 })
  );

  /* ========================================================================
     Initial states (page is covered by the preloader at this point)
     ======================================================================== */
  gsap.set(".hero-layer", { autoAlpha: 0, yPercent: 9 });
  gsap.set("[data-hero-ui]", { autoAlpha: 0, y: 42 });
  gsap.set(".hero-word", { yPercent: 114 });
  gsap.set("#dunk .stage", { opacity: 0.2 });

  /* ========================================================================
     Preloader — short, deterministic, no stuck states
     ======================================================================== */
  const num = { v: 0 };
  const plNum = $("#pl-num");
  gsap
    .timeline({ defaults: { ease: "power2.inOut" } })
    .fromTo("#pl-word", { yPercent: 115 }, { yPercent: 0, duration: 0.8, ease: "power4.out" }, 0.1)
    .to("#pl-line", { scaleX: 1, duration: 1.5 }, 0.2)
    .to(
      num,
      {
        v: 100,
        duration: 1.5,
        onUpdate: () => (plNum.textContent = String(Math.round(num.v))),
      },
      0.2
    )
    .to(["#pl-center", "#pl-num-wrap"], { opacity: 0, y: -24, duration: 0.4, ease: "power2.in" }, "+=0.15")
    .to(".pl-panel", { yPercent: -100, duration: 0.85, ease: "power4.inOut", stagger: 0.07 }, "<")
    .call(finishIntro, [], "-=0.45")
    .set("#preloader", { display: "none" });

  function finishIntro() {
    preloader.dataset.done = "1";
    heroIntro();
    lenis.start();
    requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  function heroIntro() {
    gsap
      .timeline()
      .to(".hero-layer", { autoAlpha: 1, yPercent: 0, duration: 1.5, ease: "power4.out", stagger: 0.1 })
      .to(".hero-word", { yPercent: 0, duration: 1.15, stagger: 0.1, ease: "power4.out" }, 0.2)
      .to("[data-hero-ui]", { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.65);
  }

  /* ========================================================================
     Scroll progress
     ======================================================================== */
  gsap.fromTo(
    "#progress-bar",
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3, invalidateOnRefresh: true },
    }
  );

  /* ========================================================================
     Hero — layered parallax + mouse drift
     ======================================================================== */
  $$(".hero-layer").forEach((layer) => {
    const depth = parseFloat(layer.dataset.depth || "0");
    gsap.to(layer, {
      y: () => depth * window.innerHeight,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });

  gsap.to("#hero-content", {
    y: () => -0.16 * window.innerHeight,
    autoAlpha: 0,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "72% top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  if (FINE) {
    const movers = $$(".hero-layer[data-mouse]")
      .filter((l) => parseFloat(l.dataset.mouse) > 0)
      .map((l) => ({
        m: parseFloat(l.dataset.mouse),
        xTo: gsap.quickTo(l, "x", { duration: 1.1, ease: "power3" }),
      }));
    window.addEventListener("mousemove", (e) => {
      const n = e.clientX / window.innerWidth - 0.5;
      movers.forEach(({ m, xTo }) => xTo(-n * m * 80));
    });
  }

  /* ========================================================================
     01 · The Game — pinned word reveal + ghost strip
     ======================================================================== */
  const splitEl = $("#game [data-split]");
  const HOT = new Set(["PEACH", "BASKET", "ASPHALT", "TRUTH"]);
  splitEl.innerHTML = splitEl.textContent
    .trim()
    .split(/\s+/)
    .map((w) => {
      const key = w.replace(/[^A-Za-z']/g, "").toUpperCase();
      return `<span class="mword${HOT.has(key) ? " is-hot" : ""}">${w}&nbsp;</span>`;
    })
    .join("");

  gsap.fromTo(
    "#game .mword",
    { opacity: 0.13, y: 18 },
    {
      opacity: 1,
      y: 0,
      ease: "none",
      stagger: 0.1,
      scrollTrigger: {
        trigger: "#game",
        start: "top top",
        end: "+=150%",
        scrub: 0.4,
        pin: true,
        anticipatePin: 1,
      },
    }
  );

  gsap.fromTo(
    "#game-ghost",
    { xPercent: 6 },
    {
      xPercent: -6,
      ease: "none",
      scrollTrigger: { trigger: "#game", start: "top bottom", end: "bottom top", scrub: true },
    }
  );

  /* ========================================================================
     02 · The Courts — staggered parallax collage
     ======================================================================== */
  $$("#courts .rellax").forEach((el) => {
    const drift = (parseFloat(el.dataset.speed || "1") - 1) * -700;
    gsap.fromTo(
      el,
      { y: -drift },
      {
        y: drift,
        ease: "none",
        scrollTrigger: {
          trigger: "#courts",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  });

  $$("#courts .rimg").forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -7 },
      {
        yPercent: 7,
        ease: "none",
        scrollTrigger: {
          trigger: img.closest("figure"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });

  gsap.from(
    "#courts figure, #courts .poster",
    {
      autoAlpha: 0,
      duration: 1.1,
      stagger: 0.12,
      scrollTrigger: { trigger: "#courts", start: "top 70%" },
    }
  );

  /* ========================================================================
     The Ledger — counters + rules
     ======================================================================== */
  $$("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count || "0");
    const obj = { v: 0 };
    el.textContent = "0";
    gsap.to(obj, {
      v: target,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: () => (el.textContent = String(Math.round(obj.v))),
    });
  });

  $$(".stat-line").forEach((line, i) => {
    gsap.to(line, {
      scaleX: 1,
      duration: 1,
      delay: i * 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: line, start: "top 92%" },
    });
  });

  gsap.from(".rule-row", {
    y: 40,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.07,
    scrollTrigger: { trigger: "#rules ol", start: "top 80%" },
  });

  /* ========================================================================
     04 · The Dunk — pinned MotionPath sequence
     ======================================================================== */
  const ball = $("#ball-g");
  const arc = $("#arc");
  gsap.set(ball, {
    motionPath: { path: "#arc", align: "#arc", alignOrigin: [0.5, 0.5], start: 0, end: 0 },
  });
  gsap.set("#slam", { opacity: 0, scale: 2.4, rotate: -16 });
  arc.setAttribute("stroke-dasharray", "100");
  arc.setAttribute("stroke-dashoffset", "100");

  gsap
    .matchMedia()
    .add(
      { isDesktop: "(min-width: 768px)", isMobile: "(max-width: 767px)" },
      (ctx) => {
        const { isMobile } = ctx.conditions;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: "#dunk",
            start: "top top",
            end: isMobile ? "+=200%" : "+=260%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        tl.to(arc, { strokeDashoffset: 0, duration: 0.3 }, 0)
          .to(
            ball,
            {
              motionPath: { path: "#arc", align: "#arc", alignOrigin: [0.5, 0.5], start: 0, end: 1 },
              duration: 0.78,
              ease: "power1.inOut",
            },
            0.04
          )
          .to(ball, { rotation: 1080, transformOrigin: "50% 50%", duration: 0.78, ease: "power1.inOut" }, 0.04)
          .to(ball, { y: "+=72", scale: 0.86, transformOrigin: "50% 50%", duration: 0.09, ease: "power1.in" }, 0.82)
          .fromTo(
            "#net",
            { scaleY: 1, transformOrigin: "top center" },
            { scaleY: 1.25, duration: 0.05, yoyo: true, repeat: 1, ease: "power2.out" },
            0.85
          )
          .to("#board", { x: -5, duration: 0.035, yoyo: true, repeat: 3 }, 0.84)
          .fromTo(
            "#rim",
            { scaleY: 1, transformOrigin: "center" },
            { scaleY: 1.4, duration: 0.04, yoyo: true, repeat: 1 },
            0.84
          )
          .fromTo(
            "#slam",
            { opacity: 0, scale: 2.4, rotate: -16 },
            { opacity: 1, scale: 1, rotate: -8, duration: 0.1, ease: "power4.out" },
            0.86
          )
          .fromTo("#dunk-flash", { opacity: 0 }, { opacity: 0.3, duration: 0.05, yoyo: true, repeat: 1 }, 0.85);

        [0, 1, 2].forEach((i) =>
          tl.fromTo(
            `#stage-${i}`,
            { opacity: 0.2 },
            { opacity: 1, duration: 0.1, yoyo: true, repeat: 1 },
            0.04 + i * 0.24
          )
        );
        tl.to("#stage-3", { opacity: 1, duration: 0.08 }, 0.86)
          .to("#slam", { scale: 1.05, duration: 0.07, yoyo: true, repeat: 1 }, 0.94);
      }
    );

  /* ========================================================================
     05 · Legends — editorial index reveal
     ======================================================================== */
  gsap.from(".legend-row", {
    y: 50,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.08,
    scrollTrigger: { trigger: "#legend-list", start: "top 85%" },
  });

  /* ========================================================================
     Quote — typographic moment (no image reuse)
     ======================================================================== */
  gsap.fromTo(
    "#quote-ghost",
    { xPercent: -4 },
    {
      xPercent: 4,
      ease: "none",
      scrollTrigger: { trigger: "#quote", start: "top bottom", end: "bottom top", scrub: true },
    }
  );

  gsap.from(".q-line-inner", {
    yPercent: 115,
    duration: 1.2,
    stagger: 0.14,
    ease: "power4.out",
    scrollTrigger: { trigger: "#quote", start: "top 58%" },
  });

  gsap.from(".q-foot", {
    opacity: 0,
    y: 24,
    duration: 1,
    scrollTrigger: { trigger: "#quote", start: "top 40%" },
  });

  /* ========================================================================
     Overtime — CTA + giant foot mark
     ======================================================================== */
  gsap.from("#end-cta > *", {
    y: 60,
    autoAlpha: 0,
    stagger: 0.09,
    duration: 1.1,
    scrollTrigger: { trigger: "#end-cta", start: "top 84%", toggleActions: "play none none reverse" },
  });

  gsap.fromTo(
    ".foot-mark",
    { yPercent: 34 },
    {
      yPercent: 0,
      ease: "none",
      scrollTrigger: { trigger: ".foot-mark", start: "top bottom", end: "bottom bottom", scrub: true },
    }
  );

  /* ========================================================================
     Custom cursor — fine pointers only
     ======================================================================== */
  if (FINE) {
    document.body.classList.add("has-cursor");
    const ring = document.createElement("div");
    const dot = document.createElement("div");
    ring.className =
      "pointer-events-none fixed left-0 top-0 z-[210] size-9 border border-bone/60";
    dot.className = "pointer-events-none fixed left-0 top-0 z-[210] size-1.5 bg-orange";
    document.body.append(ring, dot);
    gsap.set([ring, dot], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dx = gsap.quickTo(dot, "x", { duration: 0.07, ease: "power2" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.07, ease: "power2" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3" });
    let shown = false;

    window.addEventListener("mousemove", (e) => {
      if (!shown) {
        shown = true;
        gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    });

    document.addEventListener("mouseover", (e) => {
      const interactive = e.target.closest("a, button, [data-hover]");
      gsap.to(ring, {
        scale: interactive ? 2.4 : 1,
        borderColor: interactive ? "#D86B32" : "rgb(234 230 220 / 0.6)",
        duration: 0.35,
        overwrite: "auto",
      });
      gsap.to(dot, { scale: interactive ? 0.4 : 1, duration: 0.35, overwrite: "auto" });
    });
  }

  /* ========================================================================
     Refresh hooks — late layout shifts from fonts / images
     ======================================================================== */
  window.addEventListener("load", () => window.ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(() => window.ScrollTrigger.refresh());
}
