# Color System Documentation

## Overview

The CircleCI documentation UI uses a two-tier CSS variable system designed for easy theme switching. All colors are defined in `src/css/vars.css`.

## Variable Structure

### Base Palette Variables

**Format**: `--color-{name}-{variant}`

**Examples**:
- `--color-gray-50`
- `--color-accent-green`
- `--color-note-blue`

**Purpose**: These are raw color values defined once in the base palette section.

**Important**: **Never use base palette variables directly in CSS rules**. Always use semantic tokens instead.

### Semantic Token Variables

**Format**: `--{component}-{property}-{state?}`

**Examples**:
- `--body-font-color`
- `--link_hover-font-color`
- `--table-border-color`
- `--toc-active-text-color`

**Purpose**: These reference base palette variables and provide meaningful names for specific UI contexts.

**Important**: **Always use semantic tokens in CSS rules**. These are the override targets for dark theme.

## File Organization (vars.css)

The vars.css file is organized into logical sections:

1. **BASE COLOR PALETTE** - Raw color definitions
   - Grayscale palette (white → smoke → gray → jet → black)
   - Brand colors (greens)
   - UI colors (vapor, fog, link blues, etc.)
   - Admonition colors (note, tip, warning, important)
   - Status colors (success, error)
   - Visual effects (shadows, overlays)

2. **SEMANTIC TOKENS - Light Theme** - Meaningful mappings
   - Typography (body, heading, doc, caption colors)
   - Links (default, hover, unresolved, success, error)
   - Surfaces and backgrounds
   - Code blocks (inline, pre, annotations)
   - Tables (borders, striping, headers)
   - Admonitions (NOTE, TIP, WARNING, IMPORTANT, CAUTION)
   - TOC (font colors, borders, active state)
   - Navigation, Navbar, Toolbar, Footer
   - Other doc elements (abstracts, examples, kbd, quotes, sidebars)
   - Modals and overlays

3. **FONTS** - Typography settings
4. **DIMENSIONS AND POSITIONING** - Layout measurements
5. **STACKING (Z-INDEX)** - Layer ordering

## Usage Guidelines

### ✅ Correct Usage

```css
/* GOOD: Use semantic tokens */
.my-component {
  color: var(--body-font-color);
  background: var(--panel-background);
  border: 1px solid var(--panel-border-color);
}

.my-link {
  color: var(--link-font-color);
}

.my-link:hover {
  color: var(--link_hover-font-color);
}
```

### ❌ Incorrect Usage

```css
/* BAD: Using base palette colors directly */
.my-component {
  color: var(--color-jet-30); /* Don't do this! */
  background: var(--color-smoke-30); /* Use semantic tokens! */
}

/* BAD: Hard-coded color values */
.my-component {
  color: #343434; /* Never hard-code colors! */
  background: #fafafa; /* Use variables! */
}
```

## Dark Mode Strategy (Future Implementation)

When implementing dark mode, follow this approach:

### Step 1: Keep Base Palette Unchanged

The base palette colors remain the same. They are just raw color definitions.

### Step 2: Override Semantic Tokens

Create dark theme overrides for semantic tokens only:

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Invert surfaces */
    --body-background: var(--color-jet-80);
    --body-font-color: var(--color-smoke-30);
    --panel-background: var(--color-jet-70);
    --panel-border-color: var(--color-jet-50);

    /* Adjust links for dark background */
    --link-font-color: #5B9FFF; /* Lighter blue */

    /* Override other semantic tokens as needed */
    --table-stripe-even: var(--color-jet-60);
    --table-stripe-odd: var(--color-jet-70);

    /* Code blocks might stay dark */
    --pre-background: #0D1117; /* Even darker for dark theme */
  }
}
```

**OR** use a data attribute approach:

```css
[data-theme="dark"] {
  /* Same semantic token overrides */
}
```

### Step 3: Syntax Highlighting Strategy

Two options for code syntax highlighting:

**Option A: Keep Dark Syntax Theme (Recommended for MVP)**
- Current approach uses dark syntax colors on light background
- Works on both light and dark themes
- Simplest implementation
- No changes needed

**Option B: Theme-Aware Syntax Highlighting**
- Override `--syntax-*` variables in dark mode
- Use lighter syntax colors for dark mode
- More complex but potentially better contrast
- Requires additional dark syntax color palette

## Adding New Colors

When adding new colors to the system:

1. **Determine if it's a new raw color or a new semantic use**

2. **If it's a new raw color**:
   - Add to the BASE COLOR PALETTE section
   - Use the naming convention: `--color-{name}-{variant}`
   - Place in appropriate subsection (grayscale, brand, UI, etc.)

3. **If it's a new semantic use**:
   - Add to the SEMANTIC TOKENS section
   - Use the naming convention: `--{component}-{property}-{state?}`
   - Reference a base palette color
   - Place in appropriate subsection (typography, surfaces, etc.)

4. **Update this documentation** if you introduce a new pattern or convention

## Color Contrast Requirements

All color combinations must meet WCAG accessibility standards:

- **Body text**: 4.5:1 contrast ratio minimum (AA standard)
- **Large text** (18pt+ or 14pt+ bold): 3:1 contrast ratio minimum
- **UI components**: 3:1 contrast ratio minimum

Use browser DevTools or online contrast checkers to verify.

## Current Variable Count

As of DOCSS-2002 dark mode preparation:

- **Base palette colors**: ~60 variables
- **Semantic tokens**: ~80+ variables
- **Font variables**: ~15 variables
- **Dimension variables**: ~15 variables
- **Total CSS variables**: ~170 variables

## Maintenance

### Testing After Changes

After modifying vars.css:

1. **Build the UI bundle**: `cd ui && npm run build`
2. **Visual regression test**: Compare before/after screenshots
3. **Validate variable references**: Check console for undefined variables
4. **Accessibility audit**: Verify contrast ratios maintained
5. **Browser compatibility**: Test in Chrome, Firefox, Safari, Edge

### Common Pitfalls

- **Don't delete unused-looking variables** without searching the entire codebase. They may be referenced in hidden pages or JavaScript-generated content.
- **Don't mix hard-coded colors with variables**. Use variables consistently across the entire codebase.
- **Don't use `!important` unless absolutely necessary**. It makes dark theme overrides difficult.
- **Don't skip the color-scheme property**. It helps browsers render form controls and scrollbars correctly.

## Related Files

- **vars.css**: Main variable definitions
- **site.css**: Tailwind @theme configuration (references vars.css)
- **doc.css**: Document styling (uses semantic tokens)
- **toc.css**: Table of contents styling
- **tabs.css**: Tab component styling
- **highlight.css**: Syntax highlighting variables
- **shiki.css**: Shiki highlighter variables
- **base.css**: Contains `color-scheme` declaration

## Questions?

For questions about the color system or dark mode implementation, refer to:
- The approved implementation plan: `/Users/rosieyohannan/.claude/plans/lovely-floating-beacon.md`
- CircleCI documentation style guide: `CLAUDE.md`
- This file: `ui/COLOR_SYSTEM.md`
