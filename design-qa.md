# Design QA — ИИ Выгодно

**Source visual truth**

- Main-page reference: `C:\Users\kostya\AppData\Local\Temp\codex-clipboard-65a2721a-e32d-4c82-a967-21a62ddff124.png` (1122 × 1402).
- Calculator reference: `C:\Users\kostya\AppData\Local\Temp\codex-clipboard-86e718fc-2b18-4627-b111-35ec844aced5.png`.
- Additional sources: supplied pilot, cases, and scenario reference captures.

**Implementation evidence**

- Desktop: `D:\сайт ИИ Выгодно\output\playwright\home.png` (1280 × 1589), `calculator.png`, `scenarios.png`, `pilot.png`, `cases.png`, and `about.png`.
- Mobile: `D:\сайт ИИ Выгодно\output\playwright\home-mobile.png` (363 × 3445).
- State: default populated calculator and normal navigation states. CSS-pixel browser capture; no density normalization was applied because the supplied references and implementation captures have different full-page heights.

**Findings**

- [P1] Hero visual asset differs from the supplied mock.
  Location: home and pilot hero previews.
  Evidence: the source contains photo-backed/3D dashboard renders and a supplied branded logo asset; the implementation uses code-rendered dashboard panels and an icon-library brand treatment.
  Impact: this prevents a truthful 99% visual-fidelity claim.
  Fix: prepare cropped, transparent logo and the discrete hero-dashboard raster assets from the supplied source or an approved source file, then replace the current preview/brand treatment.
- [P2] The landing-page H1 wraps differently at the 1280px rendered viewport from the 1122px source composition.
  Location: home hero.
  Evidence: source uses a two-line headline; rendered capture wraps the first phrase more tightly.
  Fix: tune the hero grid and heading font size against a same-width source crop.

**Required fidelity surfaces**

- Fonts and typography: weights, compact UI labels, navy hierarchy and readable mobile scale were implemented; exact source font is not available.
- Spacing and layout rhythm: shared container, cards, soft borders, footer and section rhythm are implemented; hero proportion remains an actionable mismatch.
- Colors and visual tokens: navy, teal, pastel blue, white, blue and pink scenario colors are present as shared tokens.
- Image quality and asset fidelity: blocked by absent separable raster assets from the source screenshots.
- Copy and content: requested headings, CTA labels, methodological caveat and scenario-case disclosure are present.

**Interaction evidence**

- `/calculator` → changed staff count from 5 to 10 → economic effect changed from 24,000 ₽ to 888,000 ₽ per year; clicking `Рассчитать` showed the loading state.
- Navigation routes loaded without framework error overlays. Playwright recorded 0 console errors; the only warning was Next development tooling.

**Implementation checklist**

1. Obtain or approve separable hero/dashboard and logo assets.
2. Match target viewport crops and retune the hero headline/grid.
3. Re-capture source and implementation at equal viewport dimensions and compare them together.

final result: blocked
