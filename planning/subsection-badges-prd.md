# Product Requirements Document: Subsection Badges for CircleCI Documentation

**Status:** Draft
**Created:** 2026-05-12
**Author:** Documentation Team
**Stakeholders:** Documentation, Engineering, Design

---

## Executive Summary

This PRD proposes adding support for badges (e.g., "Preview", "Beta", "Deprecated") at the subsection level (h2-h6 headings) in CircleCI documentation, similar to the existing page-level badge functionality. This feature will improve content discovery and help readers quickly identify the maturity status of specific features without requiring them to read full sections.

---

## Problem Statement

### Current State

CircleCI documentation currently supports page-level badges via the `:page-badge:` attribute:

```asciidoc
= Page Title
:page-badge: Preview
```

However, there is **no mechanism for adding badges to subsections** (h2, h3, h4, etc.). When a single documentation page covers multiple features with different maturity levels, authors must either:

1. Include status information in the heading text (e.g., `== Slack notifications - Preview`)
2. Add a NOTE/TIP admonition block after the heading
3. Mention the status in the body text

None of these approaches provide the same visual clarity and consistency as the page-level badge system.

### Use Cases

1. **Feature maturity indicators**: Mark specific sections as Preview, Beta, or GA within a single page
2. **Deprecation notices**: Clearly indicate deprecated features or approaches at the section level
3. **Platform availability**: Show which subsections apply to specific platforms (Cloud vs. Server)
4. **Experimental features**: Highlight experimental or opt-in functionality
5. **Version-specific features**: Indicate when features were introduced or will be removed

### Example from Current Documentation

In `docs/guides/modules/integration/pages/notifications.adoc:103`:

```asciidoc
== Slack notifications - Preview
```

The "Preview" status is embedded in the heading text, which:
- Doesn't match the styling of page-level badges
- Isn't semantically marked as a badge (impacts accessibility)
- Makes heading text inconsistent across the site
- Cannot be easily styled, filtered, or indexed

---

## Goals and Success Criteria

### Goals

1. **Consistency**: Provide the same visual badge treatment for subsections as page-level titles
2. **Flexibility**: Support all existing badge types (Preview, Beta, custom text) at any heading level
3. **Ease of use**: Maintain simple AsciiDoc syntax familiar to documentation authors
4. **Accessibility**: Ensure badges are semantically meaningful and screen-reader friendly
5. **Maintainability**: Use existing badge styling and infrastructure where possible

### Success Criteria

- ✅ Authors can add badges to h2-h6 headings using simple AsciiDoc syntax
- ✅ Subsection badges render with the same visual styling as page-level badges
- ✅ Badge implementation follows existing patterns (theme-icon-extension)
- ✅ Documentation updated with usage examples and guidelines
- ✅ No performance degradation in build times
- ✅ Backward compatible with existing documentation

### Non-Goals

- Modifying the existing page-level badge system
- Adding complex badge configuration (multiple badges per heading, etc.)
- Creating a badge management UI or dashboard
- Automatic badge generation based on feature flags or metadata

---

## User Stories

### Story 1: Documentation Author

**As a** documentation author
**I want to** mark subsections with status badges
**So that** readers can quickly identify feature maturity levels without reading full sections

**Acceptance Criteria:**
- Simple syntax similar to page-level badges
- Supports common badge types (Preview, Beta, Deprecated)
- Works with custom badge text
- Maintains existing heading structure and IDs

### Story 2: Documentation Reader

**As a** documentation reader
**I want to** see visual indicators of feature status at the section level
**So that** I can quickly determine if a feature is appropriate for my use case

**Acceptance Criteria:**
- Badges are visually distinct and noticeable
- Badge styling matches page-level badges
- Badges don't interfere with heading navigation or anchor links

### Story 3: Engineering Team

**As a** platform engineer
**I want to** maintain consistent badge implementation
**So that** we minimize technical debt and follow established patterns

**Acceptance Criteria:**
- Implementation follows theme-icon-extension pattern
- Reuses existing badge CSS and styling
- Integrates with current Antora build process
- Includes automated tests

---

## Proposed Solution

### Technical Approach

Implement subsection badges as a **custom AsciiDoc block macro** that wraps heading content, following the pattern established by `theme-icon-extension.js`.

### Syntax Option 1: Block Macro (Recommended)

```asciidoc
[badge="Preview"]
== Slack notifications

Content follows...
```

**Pros:**
- Clean separation between badge attribute and heading text
- Follows AsciiDoc conventions for block-level metadata
- Easy to parse and validate
- Supports additional attributes if needed later

**Cons:**
- Requires line above heading
- Less compact than inline syntax

### Syntax Option 2: Inline Macro

```asciidoc
== Slack notifications badge:[Preview]

Content follows...
```

**Pros:**
- More compact
- Similar to existing icon:[] macro syntax

**Cons:**
- Badge appears after heading text (may not be desired position)
- Harder to style consistently
- Could interfere with heading ID generation

### Syntax Option 3: Attribute Syntax

```asciidoc
[#slack-notifications]
[.badge.preview]
== Slack notifications
```

**Pros:**
- Uses existing AsciiDoc role/ID syntax
- No new macros needed

**Cons:**
- Less explicit about badge intent
- Harder to configure badge text and styling
- Conflicts with existing role usage

### Recommended Approach: Block Macro

Implement a block macro processor similar to theme-icon-extension that:

1. Registers a `badge` role/attribute for headings
2. Processes badge metadata before heading rendering
3. Injects badge HTML into the rendered heading
4. Supports optional badge styling attributes

---

## Technical Implementation

### Architecture

```
AsciiDoc Source
    ↓
[badge="Preview"] == Heading
    ↓
Antora Extension (subsection-badge-extension.js)
    ↓
Block Processor
    ↓
Modified AST with badge metadata
    ↓
Handlebars Template (article.hbs)
    ↓
Rendered HTML with badge
    ↓
CSS Styling (doc.css - reuse existing)
```

### File Changes

#### 1. New Antora Extension

**File:** `docs/scripts/extensions/subsection-badge-extension.js`

```javascript
module.exports = function (registry) {
  registry.block('badge', function () {
    this.onContext('section')
    this.positional()

    this.process(function (parent, reader, attrs) {
      const badgeText = attrs[1] || attrs.badge
      const badgeClasses = attrs['badge-classes'] || 'text-terminal-black border'
      const badgeBg = attrs['badge-bg']
      const badgeBorder = attrs['badge-border']

      // Read the section heading
      const section = this.parseSection(parent, reader, attrs)

      // Attach badge metadata to section
      section.setAttribute('badge', badgeText)
      if (badgeClasses) section.setAttribute('badge-classes', badgeClasses)
      if (badgeBg) section.setAttribute('badge-bg', badgeBg)
      if (badgeBorder) section.setAttribute('badge-border', badgeBorder)

      return section
    })
  })
}
```

#### 2. Extension Registration

**File:** `antora-playbook.yml` (or appropriate config)

```yaml
asciidoc:
  extensions:
    - ./docs/scripts/extensions/theme-icon-extension.js
    - ./docs/scripts/extensions/subsection-badge-extension.js  # NEW
```

#### 3. Template Modification

**File:** `ui/src/partials/article.hbs`

**Current (line 5-7):**
```handlebars
{{#if @root.page.attributes.badge}}
  <span class="text-[10px] rounded-full py-1 px-1.5 ...">
    {{@root.page.attributes.badge}}
  </span>
{{/if}}
```

**Add helper for section badges:**
```handlebars
{{!-- Helper to render section with badge --}}
{{#each sections}}
  <section id="{{id}}" class="{{class}}">
    <h{{level}} class="flex items-center gap-2">
      {{{title}}}
      {{#if attributes.badge}}
        <span class="text-[10px] rounded-full py-1 px-1.5
          {{#if attributes.badge-classes}}{{attributes.badge-classes}}
          {{else}}text-terminal-black border{{/if}}"
          {{#if attributes.badge-bg}}
            style="background-color: {{attributes.badge-bg}};
            {{#if attributes.badge-border}}border-color: {{attributes.badge-border}};{{/if}}"
          {{/if}}>
          {{attributes.badge}}
        </span>
      {{/if}}
    </h{{level}}>
    {{{content}}}
  </section>
{{/each}}
```

#### 4. CSS (Reuse Existing)

No new CSS needed. Reuse existing badge styles from `ui/src/css/doc.css:1517-1631`.

Ensure headings with badges use flexbox:
```css
article .sect1 > h2,
article .sect2 > h3,
article .sect3 > h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

#### 5. Documentation Updates

**File:** `docs/contributors/modules/docs-style/pages/title-badges.adoc`

Add section on subsection badges:

```asciidoc
== Subsection badges

You can add badges to subsections (h2-h6 headings) using the `badge` block macro:

[source,asciidoc]
----
[badge="Preview"]
== Slack notifications

Configure Slack notifications for your project...
----

=== Badge styling

Customize badge appearance with optional attributes:

[source,asciidoc]
----
[badge="Beta",badge-classes="text-white bg-blue-500 border border-blue-600"]
== New feature

Or use hex colors:

[badge="Deprecated",badge-bg="#ff0000",badge-border="#cc0000"]
== Old approach
----

=== Badge types

Common badge types include:

* `Preview` - Features in preview
* `Beta` - Beta features
* `Deprecated` - Deprecated functionality
* `Cloud only` - Cloud-specific features
* `Server v4+` - Server-specific features
* Custom text as needed
```

**File:** `AGENTS.md`

Update AsciiDoc formatting section to include subsection badge usage.

---

## Implementation Phases

### Phase 1: Core Implementation (MVP)
**Timeline:** 1-2 sprints

- [ ] Create `subsection-badge-extension.js`
- [ ] Register extension in Antora config
- [ ] Implement basic block macro processing
- [ ] Add badge rendering to article.hbs template
- [ ] Test with h2 headings only
- [ ] Create minimal documentation

**Deliverables:**
- Working badge macro for h2 headings
- Basic documentation for authors

### Phase 2: Full Feature Support
**Timeline:** 1 sprint

- [ ] Extend support to h3-h6 headings
- [ ] Add custom styling options (badge-classes, badge-bg)
- [ ] Update CSS for consistent flexbox layout
- [ ] Add validation and error handling
- [ ] Create comprehensive documentation

**Deliverables:**
- Full heading level support
- Complete documentation with examples
- Style guide updates

### Phase 3: Migration and Polish
**Timeline:** 1 sprint

- [ ] Identify existing "Status - Text" patterns in headings
- [ ] Migrate to badge syntax
- [ ] Add automated tests
- [ ] Performance optimization
- [ ] Update contributor guide

**Deliverables:**
- Migrated existing status headings
- Test coverage
- Performance benchmarks

---

## Dependencies

### Technical Dependencies
- Antora 3.x or compatible
- Asciidoctor.js
- Existing badge CSS infrastructure
- Handlebars templating system

### Team Dependencies
- **Engineering**: Extension development, template modification
- **Documentation**: Author guidance, migration plan
- **Design**: Badge style approval, accessibility review
- **QA**: Testing across browsers and platforms

---

## Testing Strategy

### Unit Tests
- Badge macro parsing
- Attribute handling (badge text, classes, colors)
- Edge cases (empty badges, special characters)
- Multiple badges on single page

### Integration Tests
- End-to-end badge rendering
- Cross-browser compatibility
- Heading ID generation (ensure badges don't break anchors)
- Navigation/TOC integration

### Visual Regression Tests
- Badge positioning and alignment
- Light/dark theme support
- Responsive design (mobile, tablet, desktop)
- Print styles

### Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- Color contrast ratios
- Semantic HTML structure

### Performance Tests
- Build time impact (before/after)
- Page load performance
- Large documents with many badges

---

## Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Breaking existing heading IDs/anchors | High | Medium | Preserve heading text structure, test anchor generation |
| Build performance degradation | Medium | Low | Profile build times, optimize processor |
| Inconsistent badge usage | Low | High | Create clear guidelines, provide examples |
| Template complexity | Medium | Medium | Follow existing patterns, add comments |
| Screen reader accessibility issues | High | Low | Use semantic HTML, test with screen readers |
| Migration overhead | Medium | Medium | Automate where possible, phase rollout |

---

## Open Questions

1. **Should badges be included in the table of contents?**
   - Recommendation: No, keep TOC clean. Badges appear when readers navigate to sections.

2. **Should we support multiple badges per heading?**
   - Recommendation: Start with single badge. Evaluate need based on usage.

3. **Should badges affect heading IDs?**
   - Recommendation: No. Badge is metadata, not part of heading text.

4. **What's the preferred badge syntax?**
   - Recommendation: Block macro (`[badge="Preview"]`) for clarity and extensibility.

5. **Should we auto-migrate existing "Status - Text" headings?**
   - Recommendation: Create migration script but require manual review before committing.

6. **How do badges work with xrefs in link text?**
   - Recommendation: Xref link text should not include badge (e.g., `xref:page.adoc#section[Section Name]` not `[Section Name Preview]`)

---

## Success Metrics

### Adoption Metrics
- Number of subsection badges added in first 30 days
- Percentage of "Status" pages using badges vs. plain text
- Author feedback scores (ease of use)

### Quality Metrics
- Build failures related to badge syntax (target: < 1%)
- Accessibility audit score (target: 100% WCAG 2.1 AA)
- Page load performance impact (target: < 50ms)

### User Engagement
- Reader feedback on badge clarity
- Support ticket reduction for "is feature X available?"
- Analytics: time to find feature status information

---

## Alternatives Considered

### Alternative 1: CSS-Only Solution
Use custom CSS classes on headings without custom macro.

**Pros:** Simpler implementation, no Antora extension needed
**Cons:** Less semantic, harder to maintain, limited flexibility
**Decision:** Rejected - doesn't provide enough control and consistency

### Alternative 2: Sidebar/Callout Badges
Add badges as callout blocks adjacent to headings.

**Pros:** Easy to implement with existing admonitions
**Cons:** Disrupts content flow, visually separated from heading
**Decision:** Rejected - not inline with heading, poor UX

### Alternative 3: Postfix Notation
Add badge text in parentheses: `== Slack notifications (Preview)`

**Pros:** Simplest to implement, no code changes
**Cons:** Inconsistent styling, not semantically marked, clutters heading
**Decision:** Rejected - this is the current workaround we're trying to improve

---

## References

### Existing Implementations
- Page-level badges: `docs/contributors/modules/docs-style/pages/title-badges.adoc`
- Theme icon extension: `docs/scripts/extensions/theme-icon-extension.js:59`
- Article template: `ui/src/partials/article.hbs:5-7`
- Badge CSS: `ui/src/css/doc.css:1517-1631`

### Documentation
- AsciiDoc macros: https://docs.asciidoctor.org/asciidoc/latest/macros/
- Antora extensions: https://docs.antora.org/antora/latest/extend/extensions/
- CircleCI style guide: `AGENTS.md`

---

## Appendix

### Example Usage Patterns

#### Basic Preview Badge
```asciidoc
[badge="Preview"]
== Slack notifications

Configure Slack notifications for your project by following these steps...
```

#### Beta Feature with Custom Styling
```asciidoc
[badge="Beta",badge-classes="text-white bg-blue-500 border border-blue-600"]
== AI-powered test optimization

This feature uses machine learning to optimize test runs...
```

#### Deprecated Feature Warning
```asciidoc
[badge="Deprecated",badge-bg="#ff4444",badge-border="#cc0000"]
== Legacy Docker setup

NOTE: This approach is deprecated. See xref:modern-docker-setup.adoc[] instead.
```

#### Platform-Specific Badge
```asciidoc
[badge="Cloud only"]
=== Dynamic config features

These features are available on CircleCI Cloud only...
```

### Migration Script Pseudocode

```javascript
// Find headings with " - Status" pattern
const headingPattern = /^(==+)\s+(.+?)\s+-\s+(Preview|Beta|Deprecated|Experimental)$/gm

// Convert to badge syntax
function migrateToBadge(content) {
  return content.replace(headingPattern, (match, level, title, status) => {
    return `[badge="${status}"]\n${level} ${title}`
  })
}
```

---

## Approvals

- [ ] Product Owner
- [ ] Engineering Lead
- [ ] Documentation Lead
- [ ] Design Review
- [ ] Accessibility Review

---

**Next Steps:**
1. Review PRD with stakeholders
2. Estimate implementation effort
3. Create implementation tickets
4. Schedule kick-off meeting
5. Begin Phase 1 development
