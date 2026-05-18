# Product Requirements Document: Navigation Badges for CircleCI Documentation

**Status:** Draft
**Created:** 2026-05-12
**Author:** Documentation Team
**Related:** `subsection-badges-prd.md` (subsection content badges)
**Stakeholders:** Documentation, Engineering, Design

---

## Executive Summary

This PRD proposes displaying page-level status badges in the left sidebar navigation, allowing readers to identify Preview, Beta, and other special status pages before clicking through. This feature extends the existing `:page-badge:` system to improve content discoverability and wayfinding.

---

## Problem Statement

### Current State

CircleCI documentation has a **page-level badge system** that displays status badges (Preview, Beta, etc.) at the top of documentation pages:

```asciidoc
= Slack Integration
:page-badge: Preview
```

This renders a badge next to the page title when viewing the page content.

**However**, these badges are **not visible in the navigation sidebar**. Users must click into a page to discover its status, which creates:

1. **Poor discoverability**: Readers can't identify preview/beta features while browsing navigation
2. **Inefficient navigation**: Users click into pages only to find they're not ready for production use
3. **Inconsistent experience**: Platform badges show in nav (via info-bar), but status badges don't
4. **Missed context**: The navigation doesn't reflect the full state of the documentation

### Current Badge System

**Existing page-badge attributes:**
- `:page-badge:` - Badge text (e.g., "Preview", "Beta")
- `:page-badge-classes:` - Tailwind CSS classes for styling
- `:page-badge-bg:` - Hex background color
- `:page-badge-border:` - Hex border color

**Documentation:** `docs/contributors/modules/docs-style/pages/title-badges.adoc`

### Use Cases

1. **Feature discovery**: Help users identify experimental features while browsing
2. **Risk assessment**: Allow teams to evaluate feature stability before investigating
3. **Documentation status**: Show which pages are work-in-progress or draft
4. **Quick scanning**: Enable fast visual scanning of navigation for stable vs. preview features
5. **Wayfinding**: Improve navigation UX by surfacing page metadata at the navigation level

### Example

**Current experience:**
```
Navigation (sidebar):
├─ Notifications overview
├─ Slack integration          ← No indicator this is Preview
├─ Email notifications
└─ IRC notifications (deprecated) ← Status only visible in heading text
```

**Desired experience:**
```
Navigation (sidebar):
├─ Notifications overview
├─ Slack integration [Preview]     ← Badge visible before clicking
├─ Email notifications
└─ IRC notifications [Deprecated]  ← Clear visual indicator
```

---

## Goals and Success Criteria

### Goals

1. **Reuse existing infrastructure**: Leverage `:page-badge:` attributes without creating new metadata
2. **Visual consistency**: Match badge styling between navigation and page content
3. **Performance**: No measurable impact on page load or navigation rendering time
4. **Simplicity**: Zero additional work for documentation authors (badges automatically appear in nav)
5. **Accessibility**: Ensure badges are screen-reader friendly in navigation context

### Success Criteria

- ✅ Page badges automatically display in navigation sidebar when `:page-badge:` is set
- ✅ Badge styling matches page-level badge appearance
- ✅ Navigation remains usable and uncluttered
- ✅ Screen readers announce badges in navigation items
- ✅ No performance regression (< 50ms increase in navigation render time)
- ✅ Works with all existing badge types (Preview, Beta, custom)

### Non-Goals

- Adding badges to navigation items that don't have corresponding pages (category headers, etc.)
- Creating separate `:nav-badge:` attributes (reuse page-badge)
- Badge display for subsections/headings within pages (see `subsection-badges-prd.md`)
- Badge filtering or search by status
- Multiple badges per navigation item

---

## User Stories

### Story 1: Documentation Reader

**As a** platform engineer evaluating CircleCI features
**I want to** see feature status badges in the navigation sidebar
**So that** I can identify stable vs. preview features without clicking through every page

**Acceptance Criteria:**
- Badges appear inline with navigation item text
- Badge styling is consistent with page-level badges
- Navigation remains scannable and not cluttered

### Story 2: Documentation Author

**As a** documentation author
**I want to** set page badges once and have them appear everywhere
**So that** I don't need to maintain separate badge configuration for navigation

**Acceptance Criteria:**
- Single `:page-badge:` attribute controls both page and nav badges
- No additional attributes or configuration required
- Changes to page badge automatically reflect in navigation

### Story 3: Team Lead

**As a** team lead reviewing available features
**I want to** quickly identify which features are production-ready
**So that** I can make informed decisions about technology adoption

**Acceptance Criteria:**
- Can scan navigation and distinguish stable from preview features
- Badge colors provide clear visual distinction (Beta vs. Deprecated, etc.)
- Badge text is concise and informative

---

## Proposed Solution

### Technical Approach

Enhance the navigation tree rendering template to **look up page badges** from the content catalog and display them inline with navigation links.

**Key principle**: Navigation badges are a **view concern**, not a data concern. The source of truth remains `:page-badge:` in the page file.

### Architecture

```
Page Source (my-page.adoc)
    ↓
:page-badge: Preview
    ↓
Antora Content Catalog
    ↓
Navigation Tree Template (navigation-tree.hbs)
    ↓
Lookup page attributes via contentCatalog helper
    ↓
Render badge HTML inline with nav link
    ↓
CSS styling (reuse existing badge styles)
```

### Implementation Components

1. **Handlebars Helper** (`get-page-badge.js`)
2. **Template Enhancement** (`navigation-tree.hbs`)
3. **CSS Adjustments** (ensure badges fit in navigation layout)
4. **Documentation Update** (update title-badges.adoc)

---

## Technical Implementation

### 1. Create Handlebars Helper

**File:** `/Users/rosieyohannan/github/circleci-docs/ui/src/helpers/get-page-badge.js`

```javascript
'use strict'

/**
 * Retrieves page badge information for a given navigation item URL
 *
 * Usage in templates:
 *   {{#with (get-page-badge ./url @root)}}
 *     <span class="nav-badge {{classes}}" style="{{style}}">{{text}}</span>
 *   {{/with}}
 */
module.exports = (url, context) => {
  if (!url || !context.contentCatalog) {
    return null
  }

  try {
    // Parse URL to get component:module:page coordinates
    const urlPath = url.startsWith('/') ? url.slice(1) : url
    const page = context.contentCatalog.getByUrl(url) ||
                 context.contentCatalog.getByPath(urlPath)

    if (!page || !page.asciidoc || !page.asciidoc.attributes) {
      return null
    }

    const attrs = page.asciidoc.attributes
    const badgeText = attrs['page-badge']

    if (!badgeText) {
      return null
    }

    // Build badge data object
    const badgeData = {
      text: badgeText,
      classes: attrs['page-badge-classes'] || 'text-terminal-black border',
      bg: attrs['page-badge-bg'],
      border: attrs['page-badge-border']
    }

    // Build inline style if hex colors provided
    if (badgeData.bg) {
      badgeData.style = `background-color: ${badgeData.bg};`
      if (badgeData.border) {
        badgeData.style += ` border-color: ${badgeData.border};`
      }
    }

    return badgeData
  } catch (err) {
    console.warn('Error getting page badge:', err)
    return null
  }
}
```

### 2. Register Helper

**File:** `/Users/rosieyohannan/github/circleci-docs/ui/src/helpers/index.js`

```javascript
module.exports = {
  // ... existing helpers
  'get-page-meta': require('./get-page-meta'),
  'get-page-badge': require('./get-page-badge'), // NEW
  // ... other helpers
}
```

### 3. Enhance Navigation Template

**File:** `/Users/rosieyohannan/github/circleci-docs/ui/src/partials/navigation-tree.hbs`

**Current structure** (simplified):
```handlebars
{{#each page.navigation}}
<li>
  <a href="{{./url}}" class="nav-link">
    {{{./content}}}
  </a>
  {{#if ./items}}
    <ul>
      {{> navigation-tree items=./items}}
    </ul>
  {{/if}}
</li>
{{/each}}
```

**Enhanced with badges**:
```handlebars
{{#each page.navigation}}
<li>
  <a href="{{./url}}" class="nav-link">
    <span class="nav-link-text">{{{./content}}}</span>
    {{#with (get-page-badge ./url @root)}}
      <span
        class="nav-badge text-[10px] rounded-full py-0.5 px-1.5 ml-1.5 inline-block {{classes}}"
        {{#if style}}style="{{style}}"{{/if}}
        role="status"
        aria-label="{{text}} status">
        {{text}}
      </span>
    {{/with}}
  </a>
  {{#if ./items}}
    <ul>
      {{> navigation-tree items=./items}}
    </ul>
  {{/if}}
</li>
{{/each}}
```

**Key changes:**
- Wrap nav link content in `<span class="nav-link-text">` for layout control
- Call `get-page-badge` helper with navigation item URL
- Render badge inline after link text
- Add `role="status"` and `aria-label` for accessibility
- Use responsive sizing (`py-0.5`, `px-1.5`, `ml-1.5`) for navigation context

### 4. CSS Adjustments

**File:** `/Users/rosieyohannan/github/circleci-docs/ui/src/css/base.css`

Add navigation-specific badge styles:

```css
/* Navigation badge layout */
.nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.375rem;
}

.nav-link-text {
  flex: 1 1 auto;
  min-width: 0; /* Allow text truncation if needed */
}

.nav-badge {
  flex: 0 0 auto;
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 1.2;
  white-space: nowrap;
}

/* Ensure badges work in dark mode */
html.dark .nav-badge {
  /* Inherit from existing dark mode badge styles */
}

/* Optional: Reduce badge size in nested navigation */
.nav-panel ul ul .nav-badge {
  font-size: 9px;
  padding: 0.25rem 0.75rem;
}
```

### 5. Update Documentation

**File:** `/Users/rosieyohannan/github/circleci-docs/docs/contributors/modules/docs-style/pages/title-badges.adoc`

Add section explaining navigation badge behavior:

```asciidoc
== Badges in navigation

When you add a page badge using `:page-badge:`, it automatically appears in two places:

. Next to the page title (h1) when viewing the page
. Next to the page name in the left sidebar navigation

You do not need to configure navigation badges separately. The same `:page-badge:` attribute controls both.

.Example
[source,asciidoc]
----
= Slack Integration
:page-badge: Preview
:page-badge-classes: text-white bg-orange-500 border border-orange-600
----

This will display a "Preview" badge:
- On the page itself (next to "Slack Integration" h1)
- In the navigation sidebar (next to "Slack Integration" link)

=== Best practices for navigation badges

* Use concise badge text (6 characters or less works best)
* Avoid overusing badges (only mark truly special status pages)
* Common navigation badge types:
** `Preview` - Features in preview
** `Beta` - Beta features
** `New` - Recently added pages
** `Deprecated` - Deprecated functionality

Longer badge text may wrap or truncate in narrow navigation viewports.
```

---

## Implementation Phases

### Phase 1: Core Implementation (1 sprint)

**Tasks:**
- [ ] Create `get-page-badge.js` helper
- [ ] Register helper in `helpers/index.js`
- [ ] Enhance `navigation-tree.hbs` template
- [ ] Add basic CSS for badge layout in navigation
- [ ] Test with existing page badges (Slack integration, Beta features)
- [ ] Verify accessibility (screen reader testing)

**Deliverables:**
- Working navigation badges for pages with `:page-badge:`
- Basic documentation update

### Phase 2: Polish and Optimization (1 sprint)

**Tasks:**
- [ ] Optimize helper performance (caching if needed)
- [ ] Add responsive behavior for mobile navigation
- [ ] Test with all badge types and color combinations
- [ ] Dark mode verification
- [ ] Complete documentation with examples
- [ ] Add unit tests for helper function

**Deliverables:**
- Production-ready feature
- Complete documentation
- Test coverage

### Phase 3: Refinement (as needed)

**Tasks:**
- [ ] Gather user feedback
- [ ] Adjust badge sizing/positioning based on feedback
- [ ] Consider badge filtering (show/hide badges in nav)
- [ ] Performance monitoring and optimization

**Deliverables:**
- Refined UX based on real-world usage
- Analytics on badge effectiveness

---

## Dependencies

### Technical Dependencies
- Antora 3.x content catalog API
- Handlebars 4.7+ templating
- Existing page-badge system
- Tailwind CSS

### Team Dependencies
- **Engineering**: Helper creation, template modification, testing
- **Documentation**: Usage documentation, migration of any text-based status indicators
- **Design**: Review badge sizing/positioning in navigation context
- **Accessibility**: Screen reader testing, keyboard navigation testing

---

## Testing Strategy

### Unit Tests
- Helper returns correct badge data for pages with badges
- Helper returns null for pages without badges
- Helper handles invalid URLs gracefully
- Helper handles missing content catalog

### Integration Tests
- Badges render in navigation for badged pages
- Badges do NOT render for non-badged pages
- Badge styling matches page-level badges
- Multiple badge types render correctly

### Visual Tests
- Badge positioning in navigation (desktop)
- Badge positioning in navigation (mobile)
- Badge behavior with long page names
- Badge behavior in nested navigation
- Light/dark theme compatibility
- Print stylesheet compatibility

### Accessibility Tests
- Screen reader announces badge status
- Keyboard navigation works with badges
- Color contrast meets WCAG 2.1 AA
- Badge status is programmatically determinable

### Performance Tests
- Navigation render time (before/after)
- Helper execution time (< 5ms per nav item)
- Memory usage with large navigation trees
- Build time impact (should be zero - client-side only)

---

## Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Navigation clutter | Medium | Medium | Limit badge usage guidelines, test with high-badge scenarios |
| Performance degradation | Medium | Low | Cache helper results, profile render time |
| Content catalog API changes | High | Low | Document API usage, add unit tests |
| Badge text too long for nav | Low | Medium | Recommend max 6 characters, test truncation |
| Screen reader verbosity | Medium | Low | Use concise aria-label, test with real users |
| Badge colors insufficient contrast | Medium | Low | Verify WCAG compliance, provide defaults |

---

## Open Questions

1. **Should category headers (non-page items) support badges?**
   - **Recommendation:** No - badges only for pages, not structural navigation items
   - **Rationale:** Category headers don't have pages/attributes to source badges from

2. **Should we limit badge length in navigation?**
   - **Recommendation:** Yes - warn if badge text > 8 characters, recommend 6 or less
   - **Rationale:** Navigation space is constrained, long badges wrap or truncate

3. **Should mobile navigation show badges?**
   - **Recommendation:** Yes - same badge behavior on all viewports
   - **Rationale:** Consistency, and mobile users benefit from status indicators

4. **Should badges affect navigation search/filtering?**
   - **Recommendation:** Future enhancement - not in initial implementation
   - **Rationale:** Adds complexity, uncertain value

5. **What happens if helper performance is slow?**
   - **Recommendation:** Add caching layer if needed (cache badge data by URL)
   - **Rationale:** Content catalog lookups are generally fast, but can cache if profiling shows issues

---

## Success Metrics

### Adoption Metrics
- Percentage of existing page badges that now show in navigation (should be 100%)
- Number of new pages using badges after launch
- Author feedback on badge visibility

### User Engagement
- Navigation click-through rate (do badges reduce exploratory clicks?)
- Time to find specific feature type (e.g., "find a preview feature")
- User feedback on badge helpfulness

### Technical Metrics
- Navigation render time (target: < 50ms increase)
- Helper execution time (target: < 5ms per item)
- Accessibility audit score (target: 100% WCAG 2.1 AA)
- Zero console errors or warnings related to badge lookup

---

## Alternatives Considered

### Alternative 1: Separate :nav-badge: Attribute

Create a separate `:nav-badge:` attribute distinct from `:page-badge:`.

**Pros:** More control, can have different nav vs. page badges
**Cons:** Duplication, maintenance burden, likely to get out of sync
**Decision:** Rejected - single source of truth is better

### Alternative 2: Badge Icons Instead of Text

Use icon-only badges (⚠️, 🔬, etc.) to save space.

**Pros:** More compact, language-neutral
**Cons:** Less clear, accessibility challenges, limited icon set
**Decision:** Rejected - text badges are clearer and more accessible

### Alternative 3: Tooltip-Only Badges

Show badges only on hover via tooltip, not inline.

**Pros:** Cleaner navigation UI
**Cons:** Hidden by default, poor mobile experience, discoverability issues
**Decision:** Rejected - badges should be visible without interaction

### Alternative 4: Badge Filter in Navigation

Add a filter control to show/hide badges in navigation.

**Pros:** User control over navigation density
**Cons:** Added complexity, unclear value
**Decision:** Consider for Phase 3 based on feedback

---

## References

### Existing Implementations
- Page-level badges: `docs/contributors/modules/docs-style/pages/title-badges.adoc`
- Navigation template: `ui/src/partials/navigation-tree.hbs`
- Content catalog helper: `ui/src/helpers/get-page-meta.js` (similar pattern)
- Badge CSS: `ui/src/css/doc.css:1517-1631`

### Related PRDs
- Subsection badges: `subsection-badges-prd.md`

### Documentation
- Handlebars helpers: https://handlebarsjs.com/guide/
- Antora content catalog: https://docs.antora.org/antora/latest/extend/content-catalog/
- CircleCI docs style guide: `AGENTS.md`

---

## Examples

### Example 1: Single Badge in Navigation

**Page source** (`slack-integration.adoc`):
```asciidoc
= Slack Integration
:page-badge: Preview
```

**Rendered navigation**:
```html
<li>
  <a href="/docs/integration/slack-integration" class="nav-link">
    <span class="nav-link-text">Slack Integration</span>
    <span class="nav-badge text-[10px] rounded-full py-0.5 px-1.5 ml-1.5
                 text-terminal-black border"
          role="status"
          aria-label="Preview status">
      Preview
    </span>
  </a>
</li>
```

### Example 2: Custom Styled Badge

**Page source**:
```asciidoc
= Chunk Setup and Overview
:page-badge: Beta
:page-badge-bg: #3b82f6
:page-badge-border: #2563eb
```

**Rendered navigation**:
```html
<li>
  <a href="/docs/toolkit/chunk-setup-and-overview" class="nav-link">
    <span class="nav-link-text">Chunk Setup and Overview</span>
    <span class="nav-badge text-[10px] rounded-full py-0.5 px-1.5 ml-1.5
                 text-terminal-black border"
          style="background-color: #3b82f6; border-color: #2563eb;"
          role="status"
          aria-label="Beta status">
      Beta
    </span>
  </a>
</li>
```

### Example 3: Navigation Hierarchy with Mixed Badges

```
├─ Integrations
│  ├─ Slack integration [Preview]
│  ├─ GitHub integration
│  └─ Jira integration [Beta]
├─ Deployments
│  ├─ Deploy overview
│  └─ Release agent [Beta]
└─ Testing
   ├─ Test insights
   └─ Smarter testing [Preview]
```

---

## Approvals

- [ ] Product Owner
- [ ] Engineering Lead
- [ ] Documentation Lead
- [ ] Design Review
- [ ] Accessibility Review

---

## Next Steps

1. Review PRD with stakeholders
2. Estimate implementation effort (likely 1-2 sprints)
3. Create implementation tickets
4. Prototype in dev environment
5. User testing with early adopters
6. Launch to production
7. Monitor usage and gather feedback
