# Plan: retire `--rem-base` by migrating structural dimensions to the Tailwind v4 theme (Option C)

## Is this the right option?

**It's the idiomatic end-state, but it's a discretionary refactor, not a bug fix.** After the 16px-root work, the `--rem-base` calc layer is *correct* — it just duplicates a system Tailwind already provides. So this is worth doing **if** the team wants to standardise sizing on Tailwind v4 tokens (one source of truth, self-documenting utilities, no bespoke px→rem math). If you only want to remove the footgun cheaply, **Option A** (inline the calcs to plain rem literals and delete `--rem-base`) gets ~80% of the benefit for ~20% of the effort. This plan is the full Option C.

**Do it as its own PR**, after/independent of the font-size branch — it's a pure refactor with a "renders pixel-identical" acceptance bar, so it should be reviewable on its own.

## Why (recap)

`ui/` runs **Tailwind v4** (`tailwindcss@^4.1.4`, `@tailwindcss/postcss`), which is CSS-first: a `@theme {}` block in `src/css/site.css` generates **both** utility classes **and** `:root` CSS variables. There is already a `@theme` block there mapping colours + `--breakpoint-lg`.

The bespoke layer we want to remove:
- `--rem-base: 16` plus ~22 `calc(N / var(--rem-base) * 1rem)` sites.
- The problems (see the branch discussion): a hidden invariant that `--rem-base` must mirror the root font-size (the exact trap that caused the original 17/18px bug), redundant indirection now that root = rem-base = 16, and a second sizing system running parallel to Tailwind's.

## Current state — inventory

### A. Structural dimension vars in `vars.css` (token candidates)
| Var | Value | px | Consumers |
|---|---|---|---|
| `--navbar-height` | `calc(63 / rem-base * 1rem)` | 63 | vestigial (feeds only dead vars) |
| `--toolbar-height` | `calc(45 / rem-base * 1rem)` | 45 | vestigial (feeds only dead vars) |
| `--header-height` | `9.5rem` | 152 | body.css ×2, doc.css ×1, vars.css ×1 |
| `--nav-width` | `calc(270 / rem-base * 1rem)` | 270 | none found (semi-dead) |
| `--toc-width` | `calc(265 / rem-base * 1rem)` | 265 | main.css ×3, doc.css ×1 |
| `--toc-width--widescreen` | `calc(474 / rem-base * 1rem)` | 474 | main.css ×3, doc.css ×1 |
| `--doc-max-width` | `calc(720 / rem-base * 1rem)` | 720 | none found (semi-dead) |
| `--doc-max-width--desktop` | `calc(888 / rem-base * 1rem)` | 888 | doc.css ×4, main.css ×2, article-toolbar.hbs ×1 |

### B. One-off `calc(N / rem-base * 1rem)` values (not reusable tokens)
- `doc.css`: font-sizes 18, 22.5, 13, 13.5, 12, 15 px; margins 40 (×3), 32, 20 px.
- `toc.css`: font-size 15px.
- `tabs.css`: padding 40px / 20px.

These are specific values, not a shared scale — they should become **plain rem/px** (or Tailwind utilities where the element lives in a template), *not* new tokens, unless a coherent type scale emerges (see Phase 3).

### C. Already-dead vars (defined, zero consumers) — clean up while here
`--body-top`, `--body-min-height`, `--nav-height`, `--nav-height--desktop`, `--drawer-height`, `--nav-panel-menu-height`, `--nav-panel-explore-height`. These currently keep `--navbar-height`/`--toolbar-height` "alive." Removing them lets those two go too.

## Target state

Define the reusable dimensions as Tailwind v4 theme tokens in the `@theme` block of `site.css` (literal rem values, so utilities generate at build):

```css
@theme {
  /* … existing colours … */

  /* Layout dimensions (were calc(N / --rem-base * 1rem)) */
  --container-doc:          45rem;     /* 720px  → max-w-doc */
  --container-doc-desktop:  55.5rem;   /* 888px  → max-w-doc-desktop */
  --container-toc:          16.5625rem;/* 265px  → max-w-toc  (also used as a width) */
  --container-toc-wide:     29.625rem; /* 474px  → max-w-toc-wide */
  --spacing-nav:            16.875rem; /* 270px  → w-nav / etc. */
  --spacing-header:         9.5rem;    /* 152px  → h-header, and the sticky-clearance source of truth */
}
```

> **Verify the namespace→utility mapping against the Tailwind v4 docs before writing values** — `--container-*` → `max-w-*`; `--spacing-*` extends the spacing scale (`w-*`/`h-*`/`p-*`/`m-*`/`gap-*`); `--text-*` → `text-*` font-size (may pair a line-height). Use literal values (not `var(--…)` references) for anything that must generate a *sized* utility, unlike the colour tokens which can reference runtime vars.

Then:
- Hand-written CSS references the generated vars: `var(--doc-max-width--desktop)` → `var(--container-doc-desktop)`, `var(--toc-width)` → `var(--container-toc)`, etc.
- Templates use utilities: `max-w-[var(--doc-max-width--desktop)]` → `max-w-doc-desktop`.
- `--header-height` becomes `--spacing-header` (single source of truth preserved; `body.css`/`doc.css` refer to `var(--spacing-header)`).
- `--rem-base` and the old dimension vars are deleted from `vars.css`.

## Phased steps

**Phase 0 — Baseline.** Build UI (`npm run build:ui` in `ui/`), capture screenshots of: header, left nav (≥1200px), TOC, article at 720/888px widths, an anchor jump. This is the pixel-identical acceptance reference.

**Phase 1 — Add tokens (additive, no removals).** Add the dimension tokens to `@theme` in `site.css`. Confirm the expected utilities and `:root` vars are generated in `build/`. No behaviour change yet.

**Phase 2 — Repoint structural consumers.**
- CSS: swap `var(--nav-width|toc-width|toc-width--widescreen|doc-max-width|doc-max-width--desktop|header-height)` → the generated token vars in `main.css`, `doc.css`, `body.css`, `vars.css`.
- Template: `article-toolbar.hbs` `max-w-[var(--doc-max-width--desktop)]` → `max-w-doc-desktop`.

**Phase 3 — Convert the one-off calcs (Section B).** Replace `calc(N / var(--rem-base) * 1rem)` with plain rem (e.g. `calc(18 / rem-base * 1rem)` → `1.125rem`) in `doc.css`/`toc.css`/`tabs.css`. If the font-sizes (12/13/13.5/15/18/22.5px) form a coherent scale, optionally promote them to `--text-*` tokens instead; otherwise literals + a `/* Npx */` comment.

**Phase 4 — Delete the old layer.** Remove `--rem-base` and the migrated/dead vars from `vars.css` (`--nav-width`, `--toc-width*`, `--doc-max-width*`, `--navbar-height`, `--toolbar-height`, plus the Section C dead vars). Update `COLOR_SYSTEM.md`'s FONTS/DIMENSIONS notes if they reference removed vars.

**Phase 5 — Verify.** Rebuild; diff against Phase 0 screenshots (must be pixel-identical at default zoom). Run stylelint. Grep for stragglers: `grep -rn "rem-base\|--nav-width\|--doc-max-width\|--toc-width" ui/src`.

## Risks & notes
- **v4 namespace correctness** is the main risk — a token under the wrong namespace generates no (or the wrong) utility. Mitigate by verifying against the v4 docs and inspecting `build/` output after Phase 1.
- **Pixel parity**: every value converts to the same rem it computes to today (root = 16px), so rendering should be identical. Zoom-scaling behaviour is also preserved (still rem).
- **`--header-height` stays an estimate** — migrating it to `--spacing-header` keeps it as the documented single source of truth; the anchor-jump JS (`03-fragment-jumper.js`) still measures the header live and is unaffected.
- **Semi-dead vars** (`--nav-width`, `--doc-max-width`): confirm truly unused before deleting (grep incl. `.hbs` arbitrary values) — safe to drop if so, saving migration work.
- Keep this **separate from the font-size PR**.

## Effort
Roughly a focused half-day: Phase 1–2 are mechanical, Phase 3 is find-replace, Phase 4 is deletion, Phase 5 is the screenshot diff. The reusable checklist in `planning/16px-root-refactor-review-checklist.md` covers the visual-regression surface.
