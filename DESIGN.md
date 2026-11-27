# BLACKTOP — Design System Notes

The visual identity of this redesign, for future maintainers.

## Palette — asphalt court

| Token | Hex | Role |
|---------------|---------|------|
| `asphalt` | `#111111` | Page ground. Blacktop itself. |
| `coal` | `#1A1A18` | Raised surfaces, bordered panels. |
| `concrete` | `#82807A` | Metadata, captions, quiet labels. |
| `bone` | `#EAE6DC` | Primary type, hairline borders. |
| `cream` | `#D8CFBE` | Secondary type, editorial body. |
| `orange` | `#D86B32` | The single accent. Numbers, kicks, the rim. |
| `rust` | `#9D492B` | Deep shade of the accent, borders. |

Orange is a controlled accent (numbers, kickers, small fills) — never a background wash.

## Type

- **Anton** (`font-display`) — oversized condensed headlines, all caps, tight leading (0.82–0.95).
- **Archivo** (`font-sans`) — body copy, humanist and plain.
- **Space Mono** (`font-mono`) — metadata, captions, coordinates, rules. Uppercase, wide tracking (0.2–0.45em).

Hierarchy = size + tracking + color contrast, not weight inflation.

## Motifs

- Hairline borders (`bone/10`) instead of cards with shadows. No rounded corners, no glows.
- Mono kickers with a 40px orange rule introduce every section (no section numbering).
- Editorial figure captions: mono caption under each photo (`GOLDEN HOUR — THE DAY SHIFT`).
- Film grain overlay + halftone dot field = analog documentary atmosphere.
- Outline type (`text-outline`) for words that share space with imagery.

## Motion principles

1. Motion supports the story; nothing loops without purpose (grain, marquees, scroll cue only).
2. Parallax = meaningful layers at different depths (hero layers, court figures, ghost type).
3. Two pinned moments only: The Game word-reveal and The Dunk sequence.
4. All initial hidden states are applied in `assets/js/main.js`, never in CSS — the page is a complete static document without JS.
5. `prefers-reduced-motion` disables Lenis, pins, parallax, loops; counters and progress degrade gracefully.

## Content integrity

No invented stats, quotes, or attributions. Legends list only verifiable hardware
(rings, MVPs, eras). "Ball don't lie." is attributed to Rasheed Wallace.
Player imagery is deliberately omitted rather than substituting inauthentic photos.
