# 16px root refactor — region-by-region review checklist

**What changed:** root font-size 18px→16px (desktop), 17px→16px (mobile).
**Effect:** every `rem`-based value scaled ×0.889 (desktop) / ×0.941 (mobile). Pinned
`px` (`text-[16px]`, `w-[13px]`, `px-[32px]`…), keyword sizes (`large`/`medium`), and
`em` values (relative to parent) are UNCHANGED. `calc(N/--rem-base*1rem)` dims keep
exact px (navbar, nav/TOC width, doc max-width).

**How to read this:** all-rem spacing scaled uniformly, so proportions are preserved —
low risk. Focus on ⚠️ = a rem value sitting next to a pinned-px value, where the
*relationship* shifted. px shown as old→new (desktop).

---

## 1. Left-side nav  (`left-side-nav.hbs`, `navigation-tree.hbs`)
- [ ] Link text stays 16px (`text-[16px]`) — confirm unchanged
- [ ] Row vertical padding `py-[8px]` — pinned px, unchanged
- [ ] `space-x-2` gap toggle↔text: 9→8  ⚠️ sits next to `w-[6px]` chevron (px, unchanged)
- [ ] `my-1` row gap: 4.5→4 · `p-1` toggle button: 4.5→4
- [ ] `gap-1.5` link↔badge: 6.75→6 · badge `py-0.5 px-1.5`: 2.25→2 / 6.75→6
- [ ] Child indent `pl-6`: 27→24 · `pr-2`: 9→8
- [ ] `-ml-[1.3rem]` chevron offset: 23.4→20.8  ⚠️ chevron alignment vs text
- [ ] Active-item `rounded-lg bg-fog` pill — check padding still wraps text cleanly

## 2. Right-hand TOC  (`toc.css`)
- [ ] Top-level `font-size: large`, sub `medium` — keywords, unchanged
- [ ] Heading font `calc(15/16*1rem)` = 15px — preserved
- [ ] Header row `height: 2.5rem`: 45→40  ⚠️ contains a fixed-size icon
- [ ] `margin-top: -2.1rem`: 37.8→33.6 (negative pull-up — check it still aligns)
- [ ] `margin-right: 0.75rem`: 13.5→12 · `margin-bottom: 1.2rem/1.25rem`: 21.6→19.2 / 22.5→20
- [ ] Indent levels `padding-left` 1.25/2/2.75/3.5rem: 22.5→20 / 36→32 / 49.5→44 / 63→56
- [ ] Item `padding: 0.6rem 0 0.6rem 0.8rem`: 10.8→9.6 / 14.4→12.8

## 3. Tabs  (`tabs.css`)
- [ ] Tab list `margin-bottom: 1.25rem`: 22.5→20
- [ ] Tab `padding: 1rem 1px`: 18→16 vertical  ⚠️ 1px horizontal is pinned — vertical/horizontal ratio moved
- [ ] Tab `margin-right: 1.5rem` / `margin: 0 1.5rem 0 0`: 27→24 (spacing between tabs)
- [ ] Panel `padding: calc(40/16*1rem) 0 calc(20/16*1rem)`: stays 40/20px — preserved
- [ ] Panel `margin-bottom: 1.25rem`: 22.5→20

## 4. Page-navigation container  (`body.css`, ≥1200px)
- [ ] aside `padding-top: 2.5rem`: 45→40 · `padding-bottom: 3rem`: 54→48

## 5. Main layout / columns  (`main.css`)
- [ ] Content `margin-top/bottom: 2.5rem`: 45→40
- [ ] `width: calc(100% - var(--toc-width) - 5rem)`: the 5rem gutter 90→80  ⚠️ toc-width is
      preserved px but the 5rem subtraction shrank — verify article/TOC column split at 1200px & 1600px
- [ ] Comment at main.css:63 still says "5rem = ml-12 (3rem) + ~2rem gap" — that math
      now resolves to 80px not 90px; sanity-check the toolbar left margin still lines up

## 6. Article body  (`doc.css` `.doc`)
- [ ] Article font-size 16px, headings (32/24/20/18/16px) — pinned, unchanged
- [ ] `.doc padding: 0 1rem 4rem`: sides 18→16, bottom 72→64
- [ ] Heading `gap: 0.5rem` (badge alignment): 9→8  ⚠️ badges often pinned px
- [ ] Section spacing `margin-top` 1rem/2rem: 18→16 / 36→32
- [ ] Inline SVG icons `w-5 h-5`: 22.5→20 · `w-4 h-4`: 18→16 · `w-7 h-7`: 31.5→28
- [ ] Any `text-sm`: 15.75→14

## 7. Admonitions (note/tip/warning)  (`doc.css` ~410, ~553–571)
- [ ] Box `padding: 1rem`: 18→16 · outer `margin: 1.5rem …`: 27→24
- [ ] Icon↔text `gap: 1rem`: 18→16  ⚠️ icon may be pinned px — check icon/text gap
- [ ] Border/pointer `border-width: 0.5rem 0.3rem 0`: 9→8 / 5.4→4.8

## 8. Code blocks  (`doc.css` ~973–998, ~1110)
- [ ] `border-radius: 0.5rem`: 9→8
- [ ] `padding: 0.75rem` / `1rem` / `1rem 1rem 0.75rem`: 13.5→12 / 18→16
- [ ] Copy-button `top/right: 0.5rem`: 9→8  ⚠️ button itself likely pinned px — check inset
- [ ] Code font-size `calc(13/16*1rem)` etc. = 13 / 13.5 / 12px — preserved
- [ ] `code/kbd/pre` base `font-size: 16px` (base.css) — pinned, unchanged

## 9. Tables  (`doc.css` ~734–768)
- [ ] Cell `padding: 0.25rem 2rem 1.25rem`: 4.5→4 / 36→32 / 22.5→20
- [ ] `padding: 1rem 2rem`: 18→16 / 36→32
- [ ] Wide-table horizontal scroll container still clips correctly (layout unchanged)

## 10. Footer  (`footer.hbs`)
- [ ] Named-scale utilities (gap-*, py-*, space-*) shrink ×0.889; pinned `px-[32px]`,
      `w-[1440px]` etc. unchanged — check column gaps & link spacing balance
- [ ] Social-icon row gaps vs pinned icon sizes  ⚠️

---

## Cross-cutting checks
- [ ] Mobile (<768px): everything scaled ×0.941 not ×0.889, and the old "17px-root
      quirk" is fixed — spacings that were ~5.5% small are now correct. Compare mobile
      vs desktop feels consistent.
- [ ] Browser zoom / larger default font: root is now `100%` (was `em`), still scales
      with user preference — bump browser font size and confirm layout scales.
- [ ] Print stylesheet unchanged (root still 15px in print) — spot-check a print preview.
- [ ] No horizontal scroll on body at any breakpoint (the `min-width:0` / `width:100%`
      flex guards in doc.css are unaffected but worth a glance).
