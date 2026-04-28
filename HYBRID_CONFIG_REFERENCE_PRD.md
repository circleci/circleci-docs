# Configuration Reference Restructure - Product Requirements Document

## Project Overview

**Project Name:** Configuration Reference Hybrid Multi-Page Structure
**Solution Type:** Solution 3 - Hybrid Hub + Partials + "View All" Option
**Goal:** Restructure the monolithic configuration reference into digestible pages while maintaining a complete single-page view option

---

## Executive Summary

This PRD defines the implementation of a hybrid documentation structure that:
1. Breaks content into focused individual pages (for humans and AI agents)
2. Maintains a complete single-page reference (for users who prefer it)
3. Uses Antora partials as the single source of truth (DRY principle)
4. Provides flexible navigation options

---

## Problem Statement

**Current State:**
- Single 3,879-line configuration-reference.adoc file (106 KB)
- Too large for AI agents to process efficiently
- Poor user experience (slow loads, excessive scrolling)
- Difficult to link to specific configuration keys
- Single file complicates concurrent editing

**Desired State:**
- Category-based pages (8-40 KB each) grouping related configuration concepts
- Optional complete reference page for users who want everything
- Improved AI agent accessibility (pages sized for context windows)
- Better user navigation with related concepts grouped together
- Maintained content consistency through partials

---

## Success Criteria

1. ✅ Each category page is < 45 KB (digestible for LLMs, manageable for humans)
2. ✅ All content exists in partials (no duplication)
3. ✅ Complete reference page includes all content from partials
4. ✅ Navigation structure is clear and logical
5. ✅ Related concepts grouped together (e.g., all job config on one page)
6. ✅ All existing anchor links redirect properly
7. ✅ Build completes without errors
8. ✅ Cross-references validated and working
9. ✅ AI agents can successfully answer configuration questions using category pages

---

## Content Structure Analysis

### Current Major Sections (48 sections)

Based on analysis of configuration-reference.adoc:

**Top-Level Configuration Keys:**
1. version
2. setup
3. orbs
4. commands
5. parameters (pipeline)
6. executors
7. jobs
8. job-groups
9. workflows

**Jobs-Related Sections (properties within jobs):**
- job_name
- Executor types: docker, machine, macos
- docker-auth (AWS, GCP, OIDC)
- environment
- retention
- parallelism
- parameters (job-level)
- resource_class (extensive subsections)
- circleci_ip_ranges (job property, not top-level key)

**Steps (nested under jobs):**
- run
- when (step)
- checkout
- setup_remote_docker
- save_cache
- restore_cache
- deploy (deprecated)
- store_artifacts
- store_test_results
- persist_to_workspace
- attach_workspace
- add_ssh_keys
- Using pipeline values

**Workflows-Related Sections:**
- workflow version
- workflow_name
- triggers (schedule, cron, filters)
- jobs in workflow
- requires
- context
- filters (branches, tags)
- matrix
- pre-steps and post-steps
- Logic statements and expressions

**Supporting Content:**
- Full configuration example

---

## Proposed Structure

### Design Philosophy

**Category-Based Grouping:**
Instead of 50+ micro-pages, we group related configuration concepts into 8 cohesive pages:
- Related concepts stay together (better learning flow)
- Pages are 8-40 KB (digestible for LLMs, manageable for humans)
- Reduces navigation fatigue
- Maintains semantic coherence

### Directory Layout

```
docs/reference/modules/ROOT/
  pages/
    configuration-reference.adoc              # Hub page (navigation)
    configuration-reference-complete.adoc     # Complete single-page reference
    config/
      top-level-keys.adoc                     # version, setup, job-groups
      reusable-config.adoc                    # orbs, commands, parameters, executors
      jobs.adoc                               # All job configuration
      steps-basic.adoc                        # run, checkout, when, pipeline values
      steps-caching-artifacts.adoc            # save_cache, restore_cache, store_artifacts, store_test_results
      steps-workspace-environment.adoc        # persist/attach workspace, setup_remote_docker, add_ssh_keys
      workflows.adoc                          # All workflow configuration
      full-example.adoc                       # Complete config example
  partials/                                   # Partials stored in reference module
    config-content/
      # Top-level keys
      version.adoc
      setup.adoc
      job-groups.adoc
      # Reusable config
      orbs.adoc
      commands.adoc
      parameters.adoc
      executors.adoc
      # Jobs (all job-related content)
      jobs/
        overview.adoc
        job-name.adoc
        environment.adoc
        retention.adoc
        parallelism.adoc
        parameters.adoc
        circleci-ip-ranges.adoc               # Job property
        executors/
          overview.adoc
          docker.adoc
          docker-auth.adoc
          machine.adoc
          macos.adoc
        resource-class/
          overview.adoc
          self-hosted-runner.adoc
          docker-resources.adoc
          linux-vm-resources.adoc
          macos-resources.adoc
          windows-resources.adoc
          gpu-resources.adoc
      # Steps - basic
      steps/
        run.adoc
        when.adoc
        checkout.adoc
        pipeline-values.adoc
      # Steps - caching and artifacts
      steps-caching/
        save-cache.adoc
        restore-cache.adoc
        store-artifacts.adoc
        store-test-results.adoc
      # Steps - workspace and environment
      steps-workspace/
        persist-to-workspace.adoc
        attach-workspace.adoc
        setup-remote-docker.adoc
        add-ssh-keys.adoc
      # Workflows (all workflow-related content)
      workflows/
        overview.adoc
        workflow-name.adoc
        triggers.adoc
        schedule.adoc
        filters.adoc
        jobs-in-workflow.adoc
        requires.adoc
        context.adoc
        matrix.adoc
        pre-post-steps.adoc
        logic-statements.adoc
      # Examples
      full-configuration.adoc
```

---

## Page Organization

### Category Pages Overview

| Category Page | Estimated Size | Content Included | Rationale |
|---------------|----------------|------------------|-----------|
| **top-level-keys.adoc** | ~10 KB | version, setup, job-groups | Simple top-level configs that belong together |
| **reusable-config.adoc** | ~35 KB | orbs, commands, parameters, executors | All about reusability - conceptually related |
| **jobs.adoc** | ~40 KB | Job definition, executors, resource_class, environment, parallelism, retention, circleci_ip_ranges | Complete job configuration story in one place |
| **steps-basic.adoc** | ~20 KB | run, checkout, when, pipeline values | Core execution steps |
| **steps-caching-artifacts.adoc** | ~25 KB | save_cache, restore_cache, store_artifacts, store_test_results | Related by purpose (persistence/storage) |
| **steps-workspace-environment.adoc** | ~20 KB | persist_to_workspace, attach_workspace, setup_remote_docker, add_ssh_keys | Related by purpose (environment setup) |
| **workflows.adoc** | ~35 KB | Workflow definition, triggers, schedule, filters, jobs, requires, context, matrix, logic | Complete workflow configuration story |
| **full-example.adoc** | ~5 KB | Complete configuration example | Standalone reference |

**Total: 8 category pages** ranging from 5-40 KB each

### Content-to-Category Mapping

| Category Page | Partials Included | Sections Covered |
|---------------|-------------------|------------------|
| **top-level-keys.adoc** | `version.adoc`, `setup.adoc`, `job-groups.adoc` | version, setup, job-groups |
| **reusable-config.adoc** | `orbs.adoc`, `commands.adoc`, `parameters.adoc`, `executors.adoc` | orbs, commands, parameters, executors |
| **jobs.adoc** | All `jobs/*` partials including executors and resource-class subdirectories | jobs overview, job_name, environment, retention, parallelism, parameters, circleci_ip_ranges, docker/machine/macos executors, docker auth, resource_class variants |
| **steps-basic.adoc** | `steps/run.adoc`, `steps/when.adoc`, `steps/checkout.adoc`, `steps/pipeline-values.adoc` | run, when, checkout, pipeline values |
| **steps-caching-artifacts.adoc** | All `steps-caching/*` partials | save_cache, restore_cache, store_artifacts, store_test_results |
| **steps-workspace-environment.adoc** | All `steps-workspace/*` partials | persist_to_workspace, attach_workspace, setup_remote_docker, add_ssh_keys |
| **workflows.adoc** | All `workflows/*` partials | workflows overview, workflow_name, triggers, schedule, filters, jobs in workflow, requires, context, matrix, pre/post steps, logic statements |
| **full-example.adoc** | `full-configuration.adoc` | Complete configuration example |

**Total Files:**
- Partials: ~45 files (granular for flexibility and future schema generation)
- Category Pages: 8 files
- Hub Pages: 2 files (hub + complete)
- **Total: ~55 files** (vs current 1 file)

**Note:** Partials remain granular to support:
1. Future schema generation integration
2. Selective content reuse
3. Easier content updates
4. Clear git history for changes

---

## Page Templates

### Template 1: Partial Content File

**File:** `partials/config-content/version.adoc`

```asciidoc
[#version]
== *`version`*

The `version` field is intended to be used in order to issue warnings for deprecation or breaking changes.

[.table-scroll]
--
[cols="1,1,1,2", options="header"]
|===
| Key | Required | Type | Description

| `version`
| Y
| String
| `2`, `2.0`, or `2.1` See the xref:reusing-config.adoc#[Reusable Configuration] page for an overview of 2.1 keys available to simplify your `.circleci/config.yml` file, reuse, and parameterized jobs.
|===
--

*Example:*

.Version
[,yaml]
----
version: 2.1
----
```

**Key Points:**
- Contains ONLY the content (no page-level attributes)
- Preserves anchor ID `[#version]` for internal linking
- Includes section heading
- Complete, self-contained content

---

### Template 2: Category Page File

**File:** `pages/config/top-level-keys.adoc`

```asciidoc
= Top-Level Configuration Keys

:page-description: Top-level CircleCI configuration keys (version, setup, job-groups)
:page-tags: config, reference, top-level

[.lead]
This page documents the top-level configuration keys for CircleCI config files.

'''

include::partial$config-content/version.adoc[]

'''

include::partial$config-content/setup.adoc[]

'''

include::partial$config-content/job-groups.adoc[]

'''

[#related]
== Related

* xref:reusing-config.adoc[Reusable Configuration Reference]
* xref:config/reusable-config.adoc[Reusable Configuration Keys]
* xref:config/jobs.adoc[Jobs Configuration]
* xref:config/workflows.adoc[Workflows Configuration]
```

**Key Points:**
- Page-level metadata (description, tags)
- Includes multiple related partials
- Section separators between includes
- Groups conceptually related configuration keys
- Related section points to other category pages

**Another Example:** `pages/config/jobs.adoc`

```asciidoc
= Jobs Configuration

:page-description: Complete reference for CircleCI job configuration
:page-tags: config, reference, jobs, executors, resource-class

[.lead]
This page documents all configuration options for CircleCI jobs, including executors, resource classes, and job properties.

'''

include::partial$config-content/jobs/overview.adoc[]

'''

include::partial$config-content/jobs/job-name.adoc[]

'''

include::partial$config-content/jobs/environment.adoc[]

'''

include::partial$config-content/jobs/retention.adoc[]

'''

include::partial$config-content/jobs/parallelism.adoc[]

'''

include::partial$config-content/jobs/parameters.adoc[]

'''

include::partial$config-content/jobs/circleci-ip-ranges.adoc[]

'''

include::partial$config-content/jobs/executors/overview.adoc[]

'''

include::partial$config-content/jobs/executors/docker.adoc[]

'''

include::partial$config-content/jobs/executors/docker-auth.adoc[]

'''

include::partial$config-content/jobs/executors/machine.adoc[]

'''

include::partial$config-content/jobs/executors/macos.adoc[]

'''

include::partial$config-content/jobs/resource-class/overview.adoc[]

'''

include::partial$config-content/jobs/resource-class/self-hosted-runner.adoc[]

'''

include::partial$config-content/jobs/resource-class/docker-resources.adoc[]

'''

include::partial$config-content/jobs/resource-class/linux-vm-resources.adoc[]

'''

include::partial$config-content/jobs/resource-class/macos-resources.adoc[]

'''

include::partial$config-content/jobs/resource-class/windows-resources.adoc[]

'''

include::partial$config-content/jobs/resource-class/gpu-resources.adoc[]

'''

[#related]
== Related

* xref:config/steps-basic.adoc[Basic Steps]
* xref:config/workflows.adoc[Workflows]
* xref:config/reusable-config.adoc[Executors and Reusable Config]
```

**Key Points:**
- Comprehensive page covering complete topic
- All related content in one place
- Still uses partials for maintainability
- Users see full context without multiple page loads

---

### Template 3: Complete Reference Page

**File:** `pages/configuration-reference-complete.adoc`

```asciidoc
= Configuration Reference (Complete)

:page-platform: Cloud, Server v4+
:page-description: Complete single-page reference for .circleci/config.yml
:experimental:
:page-toclevels: 3
:toc: left

[.lead]
This is the complete configuration reference on a single page. For easier navigation, see the xref:configuration-reference.adoc[multi-page reference].

'''

include::partial$config-content/version.adoc[]

'''

include::partial$config-content/setup.adoc[]

'''

include::partial$config-content/orbs.adoc[]

'''

include::partial$config-content/commands.adoc[]

'''

include::partial$config-content/parameters.adoc[]

'''

include::partial$config-content/executors.adoc[]

'''

include::partial$config-content/jobs/index.adoc[]

'''

include::partial$config-content/jobs/job-name.adoc[]

'''

include::partial$config-content/jobs/environment.adoc[]

'''

include::partial$config-content/jobs/retention.adoc[]

'''

include::partial$config-content/jobs/parallelism.adoc[]

'''

include::partial$config-content/jobs/parameters.adoc[]

'''

include::partial$config-content/jobs/executors/index.adoc[]

'''

include::partial$config-content/jobs/executors/docker.adoc[]

'''

include::partial$config-content/jobs/executors/docker-auth.adoc[]

'''

include::partial$config-content/jobs/executors/machine.adoc[]

'''

include::partial$config-content/jobs/executors/macos.adoc[]

'''

include::partial$config-content/jobs/resource-class/index.adoc[]

'''

include::partial$config-content/jobs/resource-class/self-hosted-runner.adoc[]

'''

include::partial$config-content/jobs/resource-class/docker-resources.adoc[]

'''

include::partial$config-content/jobs/resource-class/linux-vm-resources.adoc[]

'''

include::partial$config-content/jobs/resource-class/macos-resources.adoc[]

'''

include::partial$config-content/jobs/resource-class/windows-resources.adoc[]

'''

include::partial$config-content/jobs/resource-class/gpu-resources.adoc[]

'''

include::partial$config-content/steps/index.adoc[]

'''

include::partial$config-content/steps/run.adoc[]

'''

include::partial$config-content/steps/when.adoc[]

'''

include::partial$config-content/steps/checkout.adoc[]

'''

include::partial$config-content/steps/setup-remote-docker.adoc[]

'''

include::partial$config-content/steps/save-cache.adoc[]

'''

include::partial$config-content/steps/restore-cache.adoc[]

'''

include::partial$config-content/steps/store-artifacts.adoc[]

'''

include::partial$config-content/steps/store-test-results.adoc[]

'''

include::partial$config-content/steps/persist-to-workspace.adoc[]

'''

include::partial$config-content/steps/attach-workspace.adoc[]

'''

include::partial$config-content/steps/add-ssh-keys.adoc[]

'''

include::partial$config-content/steps/pipeline-values.adoc[]

'''

include::partial$config-content/circleci-ip-ranges.adoc[]

'''

include::partial$config-content/job-groups.adoc[]

'''

include::partial$config-content/workflows/index.adoc[]

'''

include::partial$config-content/workflows/workflow-name.adoc[]

'''

include::partial$config-content/workflows/triggers.adoc[]

'''

include::partial$config-content/workflows/schedule.adoc[]

'''

include::partial$config-content/workflows/filters.adoc[]

'''

include::partial$config-content/workflows/jobs-in-workflow.adoc[]

'''

include::partial$config-content/workflows/requires.adoc[]

'''

include::partial$config-content/workflows/context.adoc[]

'''

include::partial$config-content/workflows/matrix.adoc[]

'''

include::partial$config-content/workflows/pre-post-steps.adoc[]

'''

include::partial$config-content/workflows/logic-statements.adoc[]

'''

include::partial$config-content/examples/full-configuration.adoc[]
```

**Key Points:**
- Includes ALL partials in logical order
- Section separators (`'''`) between includes
- Page metadata for SEO and styling
- Link to multi-page version at top

---

### Template 4: Hub Page

**File:** `pages/configuration-reference.adoc`

```asciidoc
= Configuration Reference

:page-platform: Cloud, Server v4+
:page-description: Reference for .circleci/config.yml

[.lead]
Reference documentation for CircleCI 2.x configuration keys used in `.circleci/config.yml`.

== Viewing Options

* **Browse by category** (recommended): Navigate using the sections below
* xref:configuration-reference-complete.adoc[**View complete reference**]: All content on one page

== Configuration Categories

[cols="1,3,1", options="header"]
|===
| Category | Description | Topics Covered

| xref:config/top-level-keys.adoc[*Top-Level Keys*]
| Essential configuration keys at the root of your config file
| version, setup, job-groups

| xref:config/reusable-config.adoc[*Reusable Configuration*]
| Define reusable components for DRY configs
| orbs, commands, parameters, executors

| xref:config/jobs.adoc[*Jobs*]
| Complete reference for job configuration
| Job definition, executors (docker/machine/macos), resource classes, environment, parallelism, retention, IP ranges

| xref:config/steps-basic.adoc[*Steps: Basic*]
| Core execution steps for running commands
| run, checkout, when, pipeline values

| xref:config/steps-caching-artifacts.adoc[*Steps: Caching & Artifacts*]
| Persist and restore dependencies and build outputs
| save_cache, restore_cache, store_artifacts, store_test_results

| xref:config/steps-workspace-environment.adoc[*Steps: Workspace & Environment*]
| Share data between jobs and configure environment
| persist_to_workspace, attach_workspace, setup_remote_docker, add_ssh_keys

| xref:config/workflows.adoc[*Workflows*]
| Orchestrate and schedule jobs
| Workflow definition, triggers, schedules, filters, job dependencies, matrix jobs, contexts, logic statements

| xref:config/full-example.adoc[*Full Example*]
| Complete configuration example
| Sample config demonstrating all features
|===

== Quick Links

**Common Tasks:**

* xref:config/jobs.adoc#docker[Configure Docker executor]
* xref:config/steps-caching-artifacts.adoc#save-cache[Cache dependencies]
* xref:config/workflows.adoc#triggers[Schedule workflows]
* xref:config/reusable-config.adoc#orbs[Use orbs]
* xref:config/jobs.adoc#resource-class[Set resource class]

**By Topic:**

* xref:config/top-level-keys.adoc#version[Config version] - Set to `2.1` for modern features
* xref:config/reusable-config.adoc#executors[Executors] - Define reusable executors
* xref:config/jobs.adoc#circleci-ip-ranges[IP Ranges] - Enable IP range feature
* xref:config/workflows.adoc#matrix[Matrix jobs] - Run jobs with multiple parameters
* xref:config/workflows.adoc#logic-statements[Logic statements] - Conditional configuration

== See Also

* xref:reusing-config.adoc[Reusable Configuration Guide]
* xref:variables.adoc[Project Values and Variables]
* xref:guides:config-policies:config-policy-reference.adoc[Config Policy Reference]
* xref:guides:optimize:optimizations.adoc[Optimization Reference]
```

**Key Points:**
- Clear choice between browsing and complete page
- Organized navigation by category
- Table format for quick scanning
- Descriptions help users find what they need
- Cross-references to related documentation

---

## Navigation Structure

### Updated nav.adoc

```asciidoc
* Configuration
** xref:configuration-reference.adoc[Configuration reference]
*** xref:configuration-reference-complete.adoc[Complete (single page)]
*** xref:config/top-level-keys.adoc[Top-Level Keys]
*** xref:config/reusable-config.adoc[Reusable Configuration]
*** xref:config/jobs.adoc[Jobs]
*** xref:config/steps-basic.adoc[Steps: Basic]
*** xref:config/steps-caching-artifacts.adoc[Steps: Caching & Artifacts]
*** xref:config/steps-workspace-environment.adoc[Steps: Workspace & Environment]
*** xref:config/workflows.adoc[Workflows]
*** xref:config/full-example.adoc[Full Example]
** xref:reusing-config.adoc[Reusable configuration reference]
** xref:variables.adoc[Project values and variables]
```

**Benefits:**
- Clean, flat navigation structure
- 8 category pages easy to scan
- Users can quickly find relevant section
- No deeply nested navigation

---

## URL Structure

### URL Patterns

**Hub page:**
```
/reference/configuration-reference/
```

**Complete page:**
```
/reference/configuration-reference-complete/
```

**Category pages:**
```
/reference/config/top-level-keys/
/reference/config/reusable-config/
/reference/config/jobs/
/reference/config/steps-basic/
/reference/config/steps-caching-artifacts/
/reference/config/steps-workspace-environment/
/reference/config/workflows/
/reference/config/full-example/
```

**Benefits:**
- Clean, predictable URL structure
- Easy to remember and type
- Category-based URLs match user mental model
- Good for SEO (descriptive URLs)

---

## Migration Strategy

### Phase 1: Preparation and Planning

**Tasks:**
1. Create directory structure for partials and pages
2. Audit existing configuration-reference.adoc for all sections
3. Map each section to corresponding partial file
4. Create tracking spreadsheet for migration status
5. Identify all internal cross-references that need updating

**Validation:**
- Directory structure matches PRD specification
- All sections identified and mapped
- Cross-reference inventory complete

---

### Phase 2: Extract Content to Partials

**Tasks:**
1. Create partial files with extracted content
2. Preserve all anchor IDs
3. Ensure each partial is self-contained
4. Validate AsciiDoc syntax in each partial
5. Test local includes work correctly

**Process:**
For each section in configuration-reference.adoc:
1. Copy section content (from anchor to end of section)
2. Create corresponding partial file
3. Paste content into partial
4. Verify anchor ID preserved
5. Remove from original file (mark as migrated)
6. Test include in temporary test page

**Validation:**
- All partials created
- All partials have valid AsciiDoc
- Anchor IDs preserved
- No content lost or duplicated

---

### Phase 3: Create Individual Pages

**Tasks:**
1. Create individual page files for each config key
2. Add page metadata (description, tags)
3. Include corresponding partial
4. Add "Related" sections with cross-references
5. Validate xref links work

**Process:**
For each partial:
1. Create corresponding page file
2. Add frontmatter (title, description, tags)
3. Add `include::` directive for partial
4. Identify related pages
5. Add "Related" section
6. Test page builds correctly

**Validation:**
- All individual pages created
- All pages include correct partial
- Metadata complete and accurate
- Cross-references valid

---

### Phase 4: Create Complete Reference Page

**Tasks:**
1. Create configuration-reference-complete.adoc
2. Include all partials in correct order
3. Add section separators
4. Add table of contents
5. Test complete page renders correctly

**Validation:**
- Complete page includes all content
- Order matches original document
- TOC generated correctly
- All anchors work for internal navigation

---

### Phase 5: Create Hub Page

**Tasks:**
1. Create new configuration-reference.adoc (hub)
2. Add navigation tables
3. Link to all individual pages
4. Link to complete page
5. Add descriptions for each section

**Validation:**
- Hub page provides clear navigation
- All links work correctly
- Layout is clear and scannable

---

### Phase 6: Update Navigation

**Tasks:**
1. Update nav.adoc with new structure
2. Add nested navigation for jobs, steps, workflows
3. Test navigation rendering
4. Validate breadcrumbs

**Validation:**
- Navigation structure matches PRD
- All pages accessible via navigation
- Breadcrumbs correct
- No broken nav links

---

### Phase 7: Set Up Redirects

**Tasks:**
1. Add page aliases for old anchor links
2. Test redirects from old URLs
3. Create redirect mapping document
4. Validate all common entry points

**Redirect Mapping:**

Old URL format:
```
/reference/configuration-reference/#version
/reference/configuration-reference/#save-cache
/reference/configuration-reference/#workflows
```

New redirects using page aliases:

In `config/version.adoc`:
```asciidoc
= version

:page-aliases: configuration-reference.adoc#version
```

In `config/steps/save-cache.adoc`:
```asciidoc
= save_cache

:page-aliases: configuration-reference.adoc#savecache, configuration-reference.adoc#save-cache
```

**Validation:**
- All anchor links redirect correctly
- No 404 errors for old URLs
- Redirects tested with common browser scenarios

---

### Phase 8: Testing and Validation

**Tasks:**
1. Build complete site locally
2. Validate all pages render correctly
3. Test all navigation paths
4. Check all cross-references
5. Validate search functionality
6. Test on mobile devices
7. Check page load performance
8. Validate llms.txt representation

**Test Scenarios:**
- Navigate from hub to individual page
- Navigate from individual page to related pages
- Click anchor link from external source
- Search for configuration key
- View complete reference page
- Print complete reference
- Browse on mobile device

**Validation Checklist:**
- [ ] All pages build without errors
- [ ] All cross-references work
- [ ] All redirects function correctly
- [ ] Navigation is intuitive
- [ ] Search returns relevant results
- [ ] Mobile experience is good
- [ ] Page load times acceptable
- [ ] No broken images or links
- [ ] TOC renders correctly on complete page
- [ ] Anchor links work within complete page

---

### Phase 9: Deployment

**Tasks:**
1. Deploy to staging environment
2. Conduct user acceptance testing
3. Gather feedback from documentation team
4. Make adjustments based on feedback
5. Deploy to production
6. Monitor analytics and error logs

**Rollback Plan:**
- Keep original configuration-reference.adoc as backup
- Can revert nav.adoc changes if needed
- Monitor 404 errors and add redirects as discovered

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review and approve PRD
- [ ] Assign resources (documentation team members)
- [ ] Set up project tracking (Jira, GitHub issues, etc.)
- [ ] Create implementation branch in git

### Directory Setup
- [ ] Create `docs/reference/modules/ROOT/partials/` directory (doesn't currently exist)
- [ ] Create `partials/config-content/` subdirectory
- [ ] Create `partials/config-content/jobs/` subdirectory
- [ ] Create `partials/config-content/jobs/executors/` subdirectory
- [ ] Create `partials/config-content/jobs/resource-class/` subdirectory
- [ ] Create `partials/config-content/steps/` subdirectory
- [ ] Create `partials/config-content/steps-caching/` subdirectory
- [ ] Create `partials/config-content/steps-workspace/` subdirectory
- [ ] Create `partials/config-content/workflows/` subdirectory
- [ ] Create `pages/config/` directory
- [ ] Create `pages/config/jobs/` subdirectory
- [ ] Create `pages/config/jobs/executors/` subdirectory
- [ ] Create `pages/config/jobs/resource-class/` subdirectory
- [ ] Create `pages/config/steps/` subdirectory
- [ ] Create `pages/config/workflows/` subdirectory
- [ ] Create `pages/config/examples/` subdirectory

### Content Migration (Partials)

**Note:** All partials stored in `docs/reference/modules/ROOT/partials/config-content/`

- [ ] Extract version content → `partials/config-content/version.adoc`
- [ ] Extract setup content → `partials/config-content/setup.adoc`
- [ ] Extract job-groups content → `partials/config-content/job-groups.adoc`
- [ ] Extract orbs content → `partials/config-content/orbs.adoc`
- [ ] Extract commands content → `partials/config-content/commands.adoc`
- [ ] Extract parameters content → `partials/config-content/parameters.adoc`
- [ ] Extract executors content → `partials/config-content/executors.adoc`
- [ ] Extract jobs content → `partials/config-content/jobs/*.adoc` (multiple files)
- [ ] Extract steps content → `partials/config-content/steps/*.adoc` (basic steps)
- [ ] Extract caching/artifacts steps → `partials/config-content/steps-caching/*.adoc`
- [ ] Extract workspace/environment steps → `partials/config-content/steps-workspace/*.adoc`
- [ ] Extract workflows content → `partials/config-content/workflows/*.adoc` (multiple files)
- [ ] Extract full example → `partials/config-content/full-configuration.adoc`

### Individual Pages
- [ ] Create all top-level key pages in `pages/config/`
- [ ] Create all jobs pages in `pages/config/jobs/`
- [ ] Create all executor pages in `pages/config/jobs/executors/`
- [ ] Create all resource class pages in `pages/config/jobs/resource-class/`
- [ ] Create all steps pages in `pages/config/steps/`
- [ ] Create all workflows pages in `pages/config/workflows/`
- [ ] Create example page in `pages/config/examples/`
- [ ] Add page metadata to all pages
- [ ] Add "Related" sections to all pages

### Hub and Complete Pages
- [ ] Create `pages/configuration-reference.adoc` (hub)
- [ ] Create `pages/configuration-reference-complete.adoc`
- [ ] Test hub navigation
- [ ] Test complete page rendering
- [ ] Validate TOC on complete page

### Navigation
- [ ] Update `nav.adoc` with new structure
- [ ] Test navigation rendering
- [ ] Validate breadcrumbs
- [ ] Test all nav links

### Redirects
- [ ] Add page aliases to all individual pages
- [ ] Test redirect from old anchor links
- [ ] Document redirect mapping
- [ ] Validate no 404s for common entry points

### Testing
- [ ] Build site locally
- [ ] Test all pages render
- [ ] Test all cross-references
- [ ] Test all redirects
- [ ] Test search functionality
- [ ] Test mobile rendering
- [ ] Check page load performance
- [ ] Validate with AI agent (test queries)

### Deployment
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Address feedback
- [ ] Deploy to production
- [ ] Monitor analytics
- [ ] Monitor error logs
- [ ] Update llms.txt if needed

---

## Risks and Mitigations

### Risk 1: Content Loss During Extraction

**Impact:** High
**Probability:** Medium

**Mitigation:**
- Keep original file as backup
- Use version control (git) for all changes
- Implement checksum validation for content
- Manual review of each extracted section
- Automated diff comparison before/after

---

### Risk 2: Broken Cross-References

**Impact:** High
**Probability:** Medium

**Mitigation:**
- Antora validates xref links at build time
- Comprehensive testing phase
- Automated link checking
- Test common user journeys
- Monitor 404s after deployment

---

### Risk 3: Redirect Failures

**Impact:** Medium
**Probability:** Low

**Mitigation:**
- Comprehensive redirect testing
- Monitor 404 logs after deployment
- Add redirects as issues discovered
- Keep old URLs documented
- Test with common referrers (Stack Overflow, etc.)

---

### Risk 4: User Confusion

**Impact:** Medium
**Probability:** Medium

**Mitigation:**
- Clear messaging on hub page
- Provide both viewing options (multi-page + complete)
- Gradual rollout if possible
- Collect feedback prominently
- Communication plan (blog post, banner)

---

### Risk 5: Increased Build Time

**Impact:** Low
**Probability:** High

**Mitigation:**
- Monitor build performance
- Optimize includes if needed
- Consider build caching strategies
- Acceptable trade-off for benefits gained

---

## Success Metrics

### Technical Metrics

**Page Performance:**
- Individual page size: Target < 15 KB (measure actual)
- Complete page size: ~106 KB (same as original)
- Page load time: < 1 second for individual pages
- Build time increase: < 30 seconds

**Content Integrity:**
- Content parity: 100% (no content lost)
- Cross-reference accuracy: 100% (no broken links)
- Redirect success rate: 100% for documented anchors
- Search indexing: All new pages indexed within 1 week

### User Experience Metrics

**Engagement:**
- Time on page (individual pages vs old page)
- Bounce rate (should decrease)
- Pages per session (should increase)
- Search result clicks (monitor improvement)

**Feedback:**
- User satisfaction surveys
- Support ticket volume (monitor decrease)
- GitHub issues/feedback
- Internal team feedback

### AI Agent Metrics

**Effectiveness:**
- Query success rate (test with sample questions)
- Response accuracy (validate against expected answers)
- Context window utilization
- Response time

---

## Timeline

**Estimated Duration:** 3-5 weeks

- Phase 1 (Preparation): 3-5 days
- Phase 2 (Extract Partials): 1-2 weeks
- Phase 3 (Category Pages): 3-5 days (only 8 pages vs 50+)
- Phase 4 (Complete Page): 2-3 days
- Phase 5 (Hub Page): 2-3 days
- Phase 6 (Navigation): 1-2 days (simplified structure)
- Phase 7 (Redirects): 2-3 days
- Phase 8 (Testing): 1 week
- Phase 9 (Deployment): 3-5 days

**Note:** Category-based approach reduces implementation time compared to 50+ individual pages

---

## Open Questions

1. **Should we keep the original configuration-reference.adoc file?**
   - Option A: Delete after migration (hub replaces it)
   - Option B: Keep as redirect to hub
   - Option C: Keep with deprecation notice
   - **Recommendation:** Option B - Keep as redirect for maximum compatibility

2. **How should we handle the "deploy" step (deprecated)?**
   - Include in new structure or remove entirely?
   - **Recommendation:** Include but clearly mark as deprecated

3. **Should index pages (jobs/index.adoc, steps/index.adoc) be overviews or just navigation?**
   - **Recommendation:** Provide brief overview + navigation to be more helpful

4. **Should we create additional "getting started" or "quick reference" pages?**
   - **Recommendation:** Out of scope for this PRD, consider as follow-up enhancement

5. **What analytics should we track to measure success?**
   - **Recommendation:** Listed in Success Metrics section, validate with analytics team

---

## Appendices

### Appendix A: Sample Extraction Script

For automating partial extraction, a script could:

```bash
#!/bin/bash
# extract-section.sh
# Usage: ./extract-section.sh <anchor-id> <output-file>

ANCHOR_ID=$1
OUTPUT_FILE=$2
SOURCE_FILE="configuration-reference.adoc"

# Find line with anchor
START_LINE=$(grep -n "^\[#${ANCHOR_ID}\]" "$SOURCE_FILE" | cut -d: -f1)

# Find next section (starts with ==)
END_LINE=$(tail -n +$((START_LINE + 1)) "$SOURCE_FILE" | grep -n "^==\|^'''" | head -1 | cut -d: -f1)
END_LINE=$((START_LINE + END_LINE))

# Extract section
sed -n "${START_LINE},${END_LINE}p" "$SOURCE_FILE" > "$OUTPUT_FILE"

echo "Extracted lines $START_LINE to $END_LINE to $OUTPUT_FILE"
```

### Appendix B: Content Validation Checklist

For each partial:
- [ ] Contains anchor ID
- [ ] Contains section heading
- [ ] Contains description
- [ ] Contains specification table (if applicable)
- [ ] Contains examples
- [ ] Valid AsciiDoc syntax
- [ ] No broken internal references
- [ ] Builds without errors when included

---

**Document Version:** 1.0
**Last Updated:** 2026-04-28
**Author:** Documentation Team
**Status:** Draft - Awaiting Approval
