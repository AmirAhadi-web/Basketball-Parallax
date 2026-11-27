# BLACKTOP — Basketball-Parallax

**A GSAP parallax love letter to street basketball — rebuilt as a premium, anti-slop editorial experience.**

- [Live Demo](https://amirahadi-web.github.io/Basketball-Parallax/)
- Developed by AmirMohammad Ahadi
- 🤖 Technologies — HTML, Tailwind CSS v4, Vanilla JS, GSAP (ScrollTrigger, MotionPath), Lenis

---

## The experience

| # | Section | What happens |
|---|---------|--------------|
| — | Preloader | Panel wipe, BLACKTOP word reveal, progress counter (with fail-safe — never traps the page) |
| — | Hero | Layered parallax (court arcs, ghost type, hero ball), mouse drift, cinematic headline |
| 01 | The Game | Pinned scroll-driven word reveal, ghost strip drift |
| 02 | Asphalt Cathedrals | Staggered parallax photo collage, editorial captions, orange poster block |
| 03 | House Rules | Typographic numbered index of streetball law |
| — | The Ledger | Real numbers of the game, animated counters |
| 04 | Anatomy of a Poster | Pinned MotionPath dunk sequence: Approach → Takeoff → Extension → Poster |
| 05 | Legends | Editorial index of hardwood gods & blacktop deities (real hardware only) |
| — | Quote | "Ball don't lie." — Rasheed Wallace, on film grain |
| — | Overtime | Marquee, RUN IT BACK, return-to-top, giant ghost sign-off |

Respects `prefers-reduced-motion` (full static experience), keyboard-focus states,
semantic markup, lazy-loaded imagery with explicit dimensions, and mid-range mobile.

## Project structure

```
index.html               — the page (semantic markup, Tailwind utility classes)
assets/
  src/input.css          — Tailwind v4 design system (tokens + components)
  css/blacktop.css       — built stylesheet (committed; run build:css after edits)
  js/main.js             — all motion & interaction (readable source, no bundler)
  vendor/                — self-hosted gsap / ScrollTrigger / MotionPath / lenis
hoops/ img/              — imagery
```

## Develop

```bash
npm install            # installs Tailwind CLI + gsap/lenis (source of vendored files)
npm run build:css      # rebuild assets/css/blacktop.css from assets/src/input.css
npm run watch:css      # watch mode while designing
npm run serve          # local static server on :8080
```

No CDN, no build step required to ship — `index.html` + `assets/` is fully self-hosted.
GSAP and Lenis are vendored from npm into `assets/vendor/`.

---

How to reach me: [Instagram](https://www.instagram.com/amirahadi_web) ·
[LinkedIn](https://www.linkedin.com/in/amirmohammad-ahadi) ·
[GitHub](https://github.com/AmirAhadi-web)
