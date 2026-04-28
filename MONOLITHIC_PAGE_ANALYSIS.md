# Configuration Reference Monolithic Page Analysis

## Problem Statement

The CircleCI configuration reference (`configuration-reference.adoc`) presents significant usability challenges for both human users and AI agents:

### Quantitative Analysis

- **File size:** 106 KB
- **Line count:** 3,879 lines
- **Section count:** 48 major sections (level 2 and 3 headings)
- **Anchor IDs:** 60+ discrete sections that users need to navigate
- **Current structure:** Single AsciiDoc file with all configuration keys

### User Impact

#### For Human Users

**Navigation Challenges:**
- Excessive scrolling to find specific configuration keys
- Browser performance degradation with large DOM
- Difficult to bookmark or share specific sections (anchors work but not discoverable)
- Poor mobile experience (very long page)
- Search results link to top of page, requiring scroll to find actual content

**Usage Patterns:**
- Users typically reference 1-3 configuration keys per visit
- Most visits are lookup-oriented ("What are the options for `save_cache`?")
- Users rarely read the entire document sequentially
- Common access pattern: Search → Land on page → Ctrl+F to find section

**Performance Issues:**
- Page load time: 2-4 seconds (depending on connection)
- Time to interactive: 3-6 seconds
- Browser memory usage: Higher than necessary
- Print to PDF: Difficult to format, very long document

#### For AI Agents and LLMs

**Context Window Limitations:**
- At ~106 KB, the file exceeds or consumes most of typical context windows
- Claude 3.5 Sonnet: 200K tokens ≈ 800 KB (file uses ~13% of context)
- GPT-4: 128K tokens ≈ 512 KB (file uses ~21% of context)
- Effective context is further reduced by conversation history and system prompts

**Comprehension Challenges:**
- Agents must process entire document to answer questions about specific keys
- Difficult to identify boundaries between configuration sections
- Cross-references between sections require understanding entire structure
- No clear hierarchy in text format (flattened when ingested)

**Retrieval Issues:**
- Search/RAG systems struggle to chunk appropriately
- Semantic boundaries unclear (where does `jobs` end and `workflows` begin?)
- Multiple concepts per chunk reduce retrieval precision
- Low signal-to-noise ratio when querying for specific config keys

**Current Workarounds:**
- Agents must use Grep to find specific sections before reading
- Multiple read operations with offset/limit to process in chunks
- Still limited by need to understand relationships between sections

---

## Current Structure Analysis

### Content Organization

The page follows this hierarchy:

```
Configuration Reference (Root)
├── version                    (Top-level key)
├── setup                      (Top-level key)
├── orbs                       (Top-level key)
├── commands                   (Top-level key)
├── parameters                 (Top-level key)
├── executors                  (Top-level key)
├── jobs                       (Top-level key, complex)
│   ├── <job_name>
│   ├── docker/machine/macos   (Executor types)
│   ├── resource_class
│   ├── steps                  (Most complex section)
│   │   ├── run
│   │   ├── when
│   │   ├── checkout
│   │   ├── setup_remote_docker
│   │   ├── save_cache
│   │   ├── restore_cache
│   │   ├── store_artifacts
│   │   ├── store_test_results
│   │   ├── persist_to_workspace
│   │   ├── attach_workspace
│   │   └── add_ssh_keys
│   └── other job properties
├── workflows                  (Top-level key)
├── circleci_ip_ranges        (Top-level key)
└── Full configuration example
```

### Section Size Distribution (Estimated)

Based on structure analysis:

- **Small sections** (< 50 lines): `version`, `setup`, `circleci_ip_ranges` - ~10 sections
- **Medium sections** (50-200 lines): `orbs`, `commands`, `parameters`, `executors` - ~15 sections
- **Large sections** (200-500 lines): Individual step types, `workflows` - ~15 sections
- **Very large sections** (500+ lines): `jobs` (including all subsections) - ~5 sections

### Natural Boundaries

The content has clear natural boundaries at:
1. **Top-level configuration keys** (version, setup, orbs, commands, etc.)
2. **Step types** (each step like `run`, `save_cache`, etc.)
3. **Executor types** (docker, machine, macos)
4. **Job properties** (resource_class, parallelism, etc.)

These boundaries suggest logical splitting points.

---

## Solution Options

All solutions below are implementable using Antora's native features without custom plugins or UI modifications.

---

### Solution 1: Multi-Page by Configuration Key (Full Split)

**Approach:** Split into individual pages for each top-level configuration key and step type.

#### Proposed Structure

```
docs/reference/modules/ROOT/
  pages/
    configuration-reference.adoc              # Hub/overview page
    config/
      version.adoc                            # One page per top-level key
      setup.adoc
      orbs.adoc
      commands.adoc
      parameters.adoc
      executors.adoc
      jobs/
        index.adoc                            # Jobs overview
        docker-executor.adoc                  # Executor details
        machine-executor.adoc
        macos-executor.adoc
        resource-class.adoc
        parallelism.adoc
      workflows.adoc
      circleci-ip-ranges.adoc
      steps/
        index.adoc                            # Steps overview
        run.adoc                              # One page per step type
        when.adoc
        checkout.adoc
        setup-remote-docker.adoc
        save-cache.adoc
        restore-cache.adoc
        store-artifacts.adoc
        store-test-results.adoc
        persist-to-workspace.adoc
        attach-workspace.adoc
        add-ssh-keys.adoc
```

#### Hub Page Content

```asciidoc
= Configuration Reference

:page-description: Reference for CircleCI 2.x configuration keys

This reference documents all configuration keys available in `.circleci/config.yml`.

== Quick Navigation

=== Top-Level Keys

* xref:config/version.adoc[version] - Config version specification
* xref:config/setup.adoc[setup] - Dynamic configuration flag
* xref:config/orbs.adoc[orbs] - Orb definitions and imports
* xref:config/commands.adoc[commands] - Reusable command definitions
* xref:config/parameters.adoc[parameters] - Pipeline parameters
* xref:config/executors.adoc[executors] - Executor definitions
* xref:config/jobs/index.adoc[jobs] - Job definitions
* xref:config/workflows.adoc[workflows] - Workflow orchestration
* xref:config/circleci-ip-ranges.adoc[circleci_ip_ranges] - IP range config

=== Steps Reference

Common step types used in jobs:

* xref:config/steps/run.adoc[run] - Execute shell commands
* xref:config/steps/checkout.adoc[checkout] - Check out source code
* xref:config/steps/save-cache.adoc[save_cache] - Cache dependencies
* xref:config/steps/restore-cache.adoc[restore_cache] - Restore cached dependencies

See xref:config/steps/index.adoc[complete steps reference] for all step types.

== See Also

* xref:reusing-config.adoc[Reusable Configuration Reference]
* xref:variables.adoc[Project Values and Variables]
```

#### Implementation in Antora

**nav.adoc update:**
```asciidoc
* Configuration
** xref:configuration-reference.adoc[Configuration reference]
*** xref:config/version.adoc[version]
*** xref:config/setup.adoc[setup]
*** xref:config/orbs.adoc[orbs]
*** xref:config/commands.adoc[commands]
*** xref:config/parameters.adoc[parameters]
*** xref:config/executors.adoc[executors]
*** xref:config/jobs/index.adoc[jobs]
*** xref:config/workflows.adoc[workflows]
*** Steps
**** xref:config/steps/index.adoc[Overview]
**** xref:config/steps/run.adoc[run]
**** xref:config/steps/checkout.adoc[checkout]
**** xref:config/steps/save-cache.adoc[save_cache]
**** xref:config/steps/restore-cache.adoc[restore_cache]
**** [etc...]
```

**URL structure:**
- Hub: `/reference/configuration-reference/`
- Keys: `/reference/config/version/`, `/reference/config/orbs/`
- Steps: `/reference/config/steps/run/`, `/reference/config/steps/save-cache/`

#### Pros and Cons

**Pros for Human Users:**
- ✅ Faster page loads (each page 3-15 KB)
- ✅ Focused content - only what's needed
- ✅ Easy to bookmark and share specific configs
- ✅ Better SEO - individual pages rank for specific keywords
- ✅ Clearer mental model - one concept per page
- ✅ Mobile-friendly page sizes
- ✅ Better browser performance

**Pros for AI Agents:**
- ✅ Right-sized pages for context windows
- ✅ Clear semantic boundaries
- ✅ Can read specific page for specific question
- ✅ Better RAG chunking (one page = one concept)
- ✅ Reduced noise when answering questions
- ✅ Easier to identify related concepts via cross-references

**Cons:**
- ❌ More files to maintain (30-40 pages vs 1)
- ❌ Users lose "everything on one page" option
- ❌ More complex navigation structure
- ❌ Migration effort: splitting content carefully
- ❌ More complex build/generation (if generating from schema)
- ❌ Some users prefer single-page scrolling

**Implementation Effort:** Medium-High
- Split existing content into separate files
- Create hub page
- Update navigation
- Set up redirects
- Update cross-references

---

### Solution 2: Category-Based Multi-Page (Moderate Split)

**Approach:** Group related configuration keys into category pages instead of one-per-key.

#### Proposed Structure

```
docs/reference/modules/ROOT/
  pages/
    configuration-reference.adoc              # Hub/overview page
    config/
      top-level-keys.adoc                     # version, setup, circleci_ip_ranges
      reusable-config.adoc                    # orbs, commands, parameters, executors
      jobs-reference.adoc                     # jobs and all job properties
      workflows-reference.adoc                # workflows
      steps-reference.adoc                    # All steps (or split further)
```

#### Category Definitions

**Top-Level Keys** (~200 lines)
- version
- setup
- circleci_ip_ranges

**Reusable Configuration** (~500 lines)
- orbs
- commands
- parameters
- executors

**Jobs Reference** (~1,200 lines)
- jobs overview
- job_name
- executor types (docker, machine, macos)
- resource_class
- parallelism
- environment
- All other job properties

**Workflows Reference** (~400 lines)
- workflows
- workflow properties
- job orchestration

**Steps Reference** (~1,500 lines)
- All step types
- Could be further split if needed

#### Pros and Cons

**Pros for Human Users:**
- ✅ Fewer pages to navigate (5-6 vs 30-40)
- ✅ Related concepts grouped together
- ✅ Still reduces page size significantly (20-30 KB per page)
- ✅ More manageable than single page
- ✅ Logical grouping matches mental model

**Pros for AI Agents:**
- ✅ Significantly smaller than monolithic page
- ✅ Can still process most pages in context
- ✅ Grouped concepts aid understanding
- ✅ Reduces number of pages to search through

**Cons:**
- ❌ Some pages still moderately large (steps ~30 KB)
- ❌ Less granular than Solution 1
- ❌ May still need Ctrl+F within pages
- ❌ Semantic boundaries less clear than one-per-key

**Implementation Effort:** Medium
- Group content logically
- Create category pages
- Update navigation
- Moderate splitting effort

---

### Solution 3: Hybrid Hub + Partials + "View All" Option

**Approach:** Create individual pages using partials, with option to view all content on one page.

#### Proposed Structure

```
docs/reference/modules/ROOT/
  pages/
    configuration-reference.adoc              # Hub with navigation
    configuration-reference-complete.adoc     # All-in-one page (includes all partials)
    config/
      version.adoc                            # Individual pages (include partials)
      setup.adoc
      [etc...]
  partials/
    config-content/
      version-content.adoc                    # Actual content
      setup-content.adoc
      orbs-content.adoc
      [etc...]
```

#### How It Works

**Partial example** (`partials/config-content/version-content.adoc`):
```asciidoc
[#version]
== *`version`*

The `version` field is intended to be used in order to issue warnings for deprecation or breaking changes.

[.table-scroll]
--
[cols="1,1,1,2", options="header"]
|===
| Key | Required | Type | Description
| `version` | Y | String | `2`, `2.0`, or `2.1`
|===
--

*Example:*
[source,yaml]
----
version: 2.1
----
```

**Individual page** (`config/version.adoc`):
```asciidoc
= version

:page-description: CircleCI config version field

include::partial$config-content/version-content.adoc[]

== Related

* xref:reusing-config.adoc[Reusable Configuration]
* xref:config/setup.adoc[setup]
```

**Complete reference page** (`configuration-reference-complete.adoc`):
```asciidoc
= Configuration Reference (Complete)

:page-description: Complete CircleCI configuration reference on one page

include::partial$config-content/version-content.adoc[]

'''

include::partial$config-content/setup-content.adoc[]

'''

include::partial$config-content/orbs-content.adoc[]

[continues for all sections...]
```

**Hub page** (`configuration-reference.adoc`):
```asciidoc
= Configuration Reference

Choose how to view this reference:

* xref:configuration-reference-complete.adoc[View complete reference] (single page, all content)
* Browse by configuration key (recommended):

== Top-Level Keys

* xref:config/version.adoc[version]
* xref:config/setup.adoc[setup]
[etc...]
```

#### Pros and Cons

**Pros for Human Users:**
- ✅ Choice of viewing mode (single vs multi-page)
- ✅ Users who want "everything on one page" can have it
- ✅ Most users benefit from focused individual pages
- ✅ Maintains backwards compatibility

**Pros for AI Agents:**
- ✅ Individual pages are right-sized for agents
- ✅ Clear semantic boundaries
- ✅ Can choose appropriate page based on query
- ✅ Agents can read specific pages for specific questions

**Pros for Maintenance:**
- ✅ Content lives in one place (partials)
- ✅ Updates to partials reflect in both views
- ✅ DRY principle - no duplication
- ✅ Easy to maintain consistency

**Cons:**
- ❌ More complex structure (partials + pages)
- ❌ Complete page still has original problems (for those who use it)
- ❌ Additional maintenance overhead (two page types)
- ❌ More files to manage

**Implementation Effort:** Medium-High
- Extract content to partials
- Create individual pages with includes
- Create complete page with all includes
- Update navigation
- Set up dual-path navigation

---

### Solution 4: Enhanced Single Page with Better Navigation

**Approach:** Keep single page but add significant navigation improvements using Antora's built-in features.

#### Implementation

**Add floating table of contents:**
```asciidoc
= Configuration Reference

:page-toclevels: 3
:toc: left
:toc-title: Configuration Keys

[.lead]
Reference for CircleCI 2.x configuration keys.

[#quick-jump]
== Quick Jump

<<version>> | <<setup>> | <<orbs>> | <<commands>> | <<parameters>> | <<executors>> | <<jobs>> | <<workflows>>

Steps: <<run>> | <<checkout>> | <<save-cache>> | <<restore-cache>> | <<store-artifacts>> | <<persist-to-workspace>>

[#version]
== version

[continues...]
```

**Add enhanced anchors and metadata:**
```asciidoc
:description-version: Config version specification (2, 2.0, or 2.1)
:description-setup: Dynamic configuration flag
:description-orbs: Orb definitions and imports

[#version]
[.config-key]
== version

:page-description: {description-version}

[continues...]
```

**Add custom CSS for better navigation:**
- Sticky header with current section
- Scroll-to-top button
- Enhanced anchor link visibility
- Section dividers

#### Pros and Cons

**Pros for Human Users:**
- ✅ Minimal disruption - familiar structure
- ✅ Improved TOC navigation
- ✅ Quick jump links for common keys
- ✅ Can still Ctrl+F to find content
- ✅ No URL changes needed

**Pros for Maintenance:**
- ✅ Minimal implementation effort
- ✅ No content restructuring needed
- ✅ No migration of content
- ✅ Backwards compatible

**Cons for Human Users:**
- ❌ Still a very long page (performance issues remain)
- ❌ Still requires scrolling
- ❌ Mobile experience still poor
- ❌ Page load time unchanged

**Cons for AI Agents:**
- ❌ Doesn't solve the core problem
- ❌ Still too large for efficient processing
- ❌ Still requires chunking strategies
- ❌ No improvement for RAG systems

**Implementation Effort:** Low
- Add TOC configuration
- Add quick jump links
- Update CSS (if custom styling needed)

**Verdict:** This solution improves human UX marginally but doesn't address the core problem for AI agents.

---

### Solution 5: Progressive Disclosure with Collapsible Sections

**Approach:** Use AsciiDoc collapsible blocks to keep single page but with sections collapsed by default.

#### Implementation

```asciidoc
= Configuration Reference

:experimental:

[.lead]
Click to expand sections for detailed reference.

[%collapsible]
====
[#version]
== version

The `version` field is intended to be used in order to issue warnings for deprecation or breaking changes.

[Full content here...]
====

[%collapsible]
====
[#setup]
== setup

The `setup` field enables you to conditionally trigger configurations...

[Full content here...]
====

[continues...]
```

#### Pros and Cons

**Pros for Human Users:**
- ✅ Reduced initial page size (collapsed)
- ✅ Progressive disclosure - expand what's needed
- ✅ Overview of all sections visible
- ✅ Single page maintained

**Cons for Human Users:**
- ❌ Requires clicking to see content
- ❌ Can't use Ctrl+F effectively (searches collapsed content)
- ❌ Print functionality broken (may not print collapsed sections)
- ❌ Harder to link to specific sections

**Cons for AI Agents:**
- ❌ Doesn't solve the problem - content still in one file
- ❌ Agents see all content regardless of collapse state
- ❌ No reduction in processing load
- ❌ Collapsible markers add noise to content

**Implementation Effort:** Low-Medium
- Wrap sections in collapsible blocks
- Test expand/collapse functionality
- Ensure print/search still work

**Verdict:** This appears to solve the problem but doesn't actually help AI agents. Provides marginal benefit to human users.

---

## Antora-Specific Considerations

### Built-in Features to Leverage

1. **Page Attributes**
   - `:page-description:` for SEO and AI summaries
   - `:page-aliases:` for URL migration
   - `:page-tags:` for categorization
   - `:page-toclevels:` for TOC depth

2. **Cross-References**
   - `xref:` for robust internal links
   - Works across pages in multi-page structure
   - Validates broken links at build time

3. **Partials**
   - Reusable content blocks
   - Can be included in multiple pages
   - DRY principle for common content

4. **Navigation**
   - Structured nav.adoc files
   - Multi-level navigation support
   - Automatic breadcrumbs

5. **URL Management**
   - Clean URL structure
   - Redirect support via page aliases
   - Version-agnostic cross-references

### Migration Path Features

**Page Aliases for Redirects:**
```asciidoc
= version

:page-aliases: configuration-reference.adoc#version

[Content...]
```

This ensures old bookmarks and links still work.

**Breadcrumb Navigation:**
Antora automatically generates breadcrumbs:
```
Reference > Configuration Reference > version
```

**Search Integration:**
Individual pages improve search because:
- Page titles match search queries
- Page descriptions provide context
- Search results link directly to relevant page

---

## Recommended Solution

### Primary Recommendation: **Solution 1 (Multi-Page by Configuration Key)**

**Rationale:**

1. **Solves AI Agent Problem Completely**
   - Pages are right-sized for context windows (3-15 KB each)
   - Clear semantic boundaries aid comprehension
   - Agents can read only what's needed
   - Better for RAG and retrieval systems

2. **Improves Human Experience Significantly**
   - Faster page loads
   - Focused, scannable content
   - Better SEO and discoverability
   - Mobile-friendly
   - Easy to share specific sections

3. **Future-Proof**
   - Structure supports schema generation (future project)
   - Easier to maintain and update
   - Better Git workflow (smaller diffs)
   - Can add more granular content without page bloat

4. **Antora-Native**
   - Uses standard Antora features
   - No custom plugins needed
   - Follows Antora best practices
   - Clean URL structure

### Alternative Recommendation: **Solution 3 (Hybrid)**

If stakeholders are concerned about losing the "single page" option, Solution 3 provides the best of both worlds:
- Individual pages for most users (humans and AI)
- Complete reference for users who want it
- Content in partials ensures consistency
- Slightly more complex but manageable

---

## Implementation Roadmap

### Phase 1: Planning and Preparation

**Tasks:**
1. Audit current configuration-reference.adoc
2. Map sections to new page structure
3. Identify cross-references that need updating
4. Create page structure plan
5. Define URL structure and aliases

**Deliverable:** Implementation specification document

---

### Phase 2: Content Splitting

**Tasks:**
1. Create directory structure (`config/`, `config/steps/`, `config/jobs/`)
2. Split content into individual files
3. Ensure each page has proper header and metadata
4. Validate AsciiDoc syntax in all new files
5. Test local build

**Deliverable:** All individual page files created

---

### Phase 3: Cross-Reference Updates

**Tasks:**
1. Update internal links to use xref format
2. Add cross-references between related pages
3. Add "Related" sections to each page
4. Validate all links at build time
5. Fix any broken references

**Deliverable:** Validated cross-reference structure

---

### Phase 4: Navigation and Hub

**Tasks:**
1. Create hub page (configuration-reference.adoc)
2. Update nav.adoc with new structure
3. Add breadcrumbs validation
4. Create steps/index.adoc and jobs/index.adoc overviews
5. Test navigation flow

**Deliverable:** Complete navigation structure

---

### Phase 5: Migration and Redirects

**Tasks:**
1. Set up page aliases for old anchor links
2. Test redirects from old URLs
3. Update any documentation that links to config reference
4. Add notice to old page (if keeping temporarily)
5. Update llms.txt with new structure

**Deliverable:** Redirect configuration and validation

---

### Phase 6: Deployment and Monitoring

**Tasks:**
1. Deploy to staging environment
2. Test all pages and navigation
3. Conduct user testing (internal)
4. Monitor analytics after deployment
5. Collect feedback and iterate

**Deliverable:** Production deployment with monitoring

---

## Success Metrics

### Human User Metrics

**Performance:**
- Page load time: Target < 1 second per page
- Time to interactive: Target < 2 seconds
- Lighthouse score: Target > 90

**Engagement:**
- Average time on page: Track per page
- Bounce rate: Should decrease
- Pages per session: Should increase (users browse related keys)
- Search satisfaction: Monitor search result clicks

**Usability:**
- User feedback surveys
- Support ticket reduction for "can't find config info"
- Increased direct links to specific pages (not just hub)

### AI Agent Metrics

**Effectiveness:**
- Agent success rate answering config questions
- Response accuracy (compared to human validation)
- Time to answer (should decrease with focused pages)
- Context window utilization (should improve)

**Technical:**
- Average page size: < 15 KB
- Maximum page size: < 30 KB
- RAG chunk quality: Test with sample queries
- llms.txt validation: Ensure proper structure representation

### Maintenance Metrics

**Efficiency:**
- Time to update a configuration key: Should decrease
- Build time: Monitor for acceptable increase
- Cross-reference breakage: Should be zero (validated at build)
- Content synchronization issues: Should decrease

---

## Risk Assessment

### Risk 1: User Confusion During Transition

**Impact:** Medium
**Probability:** Medium

**Mitigation:**
- Clear communication (blog post, in-app banner)
- Comprehensive redirects from old URLs
- Phased rollout (test with subset of users)
- Feedback mechanism prominently displayed
- Keep old page accessible during transition period

### Risk 2: SEO Impact

**Impact:** Medium
**Probability:** Low

**Mitigation:**
- Proper 301 redirects preserve link equity
- Individual pages actually improve SEO (more entry points)
- Submit new sitemap to search engines
- Monitor search console for indexing issues
- Implement structured data for better rich results

### Risk 3: Increased Maintenance Burden

**Impact:** Low
**Probability:** Medium

**Mitigation:**
- Clear guidelines for which page to edit
- Automated cross-reference validation
- Templates for new configuration pages
- Documentation for contributors
- Future schema generation will reduce manual maintenance

### Risk 4: Breaking External Links

**Impact:** High
**Probability:** Low

**Mitigation:**
- Page aliases preserve old anchor links
- Test common external sources (Stack Overflow, tutorials)
- Provide redirect map for major referrers
- Monitor 404s and add redirects as needed
- Communicate with community/partners about changes

---

## Next Steps

1. **Decision:** Choose Solution 1 or Solution 3 based on stakeholder input
2. **Planning:** Create detailed implementation specification
3. **Prototype:** Implement 3-5 example pages to validate approach
4. **Review:** Get feedback from documentation team and sample users
5. **Execute:** Follow implementation roadmap phases
6. **Monitor:** Track metrics and iterate based on feedback

---

## Appendix: Page Size Analysis

### Estimated Page Sizes (Solution 1)

| Page | Estimated Size | Complexity |
|------|---------------|------------|
| version.adoc | 2-3 KB | Simple |
| setup.adoc | 3-4 KB | Simple |
| orbs.adoc | 8-12 KB | Medium |
| commands.adoc | 6-8 KB | Medium |
| parameters.adoc | 6-8 KB | Medium |
| executors.adoc | 10-15 KB | Medium |
| jobs/index.adoc | 4-6 KB | Simple (overview) |
| jobs/docker-executor.adoc | 12-18 KB | Complex |
| jobs/machine-executor.adoc | 8-12 KB | Medium |
| jobs/macos-executor.adoc | 6-10 KB | Medium |
| jobs/resource-class.adoc | 8-12 KB | Medium |
| workflows.adoc | 15-20 KB | Complex |
| steps/run.adoc | 10-15 KB | Medium |
| steps/save-cache.adoc | 8-12 KB | Medium |
| steps/restore-cache.adoc | 8-12 KB | Medium |
| [other steps] | 5-10 KB each | Medium |

**Total pages:** ~35-40
**Average page size:** ~8 KB
**Largest page:** ~20 KB (workflows)
**Smallest page:** ~2 KB (version)

All pages comfortably within LLM context windows and human usability thresholds.

---

## Appendix: Example Page Template

```asciidoc
= {config-key-name}

:page-description: Brief description of this configuration key
:page-tags: config, reference, {category}

[.lead]
One-sentence summary of what this key does.

[#description]
== Description

Detailed explanation of the configuration key, including:
- Purpose and use cases
- When to use it
- How it relates to other keys

[#specification]
== Specification

[.table-scroll]
--
[cols="1,1,1,2", options="header"]
|===
| Key | Required | Type | Description

| {key-name}
| {Y/N}
| {type}
| {description}
|===
--

[#examples]
== Examples

=== Basic Example

[source,yaml]
----
{basic-example}
----

=== Advanced Example

[source,yaml]
----
{advanced-example}
----

[#notes]
== Notes

Additional information, tips, or best practices.

[#related]
== Related

* xref:related-page-1.adoc[Related Config Key 1]
* xref:related-page-2.adoc[Related Config Key 2]
* xref:../guides/guide.adoc[Related Guide]

[#see-also]
== See Also

* External resources
* Blog posts
* Community discussions
```

---

**Document Version:** 1.0
**Last Updated:** 2026-04-28
**Author:** Documentation Team
