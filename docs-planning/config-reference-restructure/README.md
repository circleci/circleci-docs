# Configuration Reference Restructure Project

This folder contains all planning documents for the CircleCI configuration reference restructuring project.

## Project Goal

Restructure the monolithic configuration reference (106 KB, 3,879 lines) into a category-based multi-page structure that improves both human and AI agent accessibility.

## Project Documents

### Planning & Analysis

1. **[MONOLITHIC_PAGE_ANALYSIS.md](./MONOLITHIC_PAGE_ANALYSIS.md)** (27 KB)
   - Problem statement and analysis of current monolithic page
   - Evaluation of 5 potential solutions
   - Comparison of different approaches
   - Recommendation: Category-based multi-page structure
   - Reference examples from other dev tools

2. **[HYBRID_CONFIG_REFERENCE_PRD.md](./HYBRID_CONFIG_REFERENCE_PRD.md)** (46 KB) ⭐ **PRIMARY SPEC**
   - Complete Product Requirements Document
   - Detailed implementation plan for Solution 3 (Hybrid approach)
   - Category-based structure (8 pages instead of 1)
   - Directory layouts, templates, navigation structure
   - 9-phase implementation roadmap
   - Timeline: 3-5 weeks
   - **Future-proofing section** for schema generation
   - Success criteria and metrics

3. **[AGENT_ACCESSIBILITY_EVALUATION.md](./AGENT_ACCESSIBILITY_EVALUATION.md)** (23 KB)
   - Framework for measuring AI agent accessibility improvements
   - 30 benchmark questions across all config categories
   - Metrics: accuracy, response time, context usage, hallucinations
   - Before/after comparison methodology
   - Success criteria and evaluation tools

## Test Infrastructure

Located in `/tests/agent-accessibility/`:

- `test_agent_accessibility.py` - Main test harness (Python)
- `questions.json` - 30 benchmark questions
- `rubrics.json` - Scoring criteria
- `requirements.txt` - Dependencies
- `run_baseline.sh` - Quick-start script
- `README.md` - Testing documentation

**See:** [/tests/agent-accessibility/README.md](../../tests/agent-accessibility/README.md)

## Project Status

**Current Phase:** Planning Complete ✅

**Next Steps:**
1. Review and approve PRD with stakeholders
2. Run baseline accessibility tests (before implementation)
3. Begin Phase 1: Preparation and Planning
4. Execute 9-phase implementation plan

## Quick Reference

### The Solution

**From:** 1 monolithic page (106 KB, 3,879 lines)

**To:** 8 category pages (5-40 KB each):
1. `top-level-keys.adoc` (~10 KB) - version, setup, job-groups
2. `reusable-config.adoc` (~35 KB) - orbs, commands, parameters, executors
3. `jobs.adoc` (~40 KB) - All job configuration
4. `steps-basic.adoc` (~20 KB) - run, checkout, when, pipeline values
5. `steps-caching-artifacts.adoc` (~25 KB) - Caching and artifact steps
6. `steps-workspace-environment.adoc` (~20 KB) - Workspace and environment steps
7. `workflows.adoc` (~35 KB) - All workflow configuration
8. `full-example.adoc` (~5 KB) - Complete config example

Plus:
- Hub page (`configuration-reference.adoc`) for navigation
- Complete reference page (optional, includes all partials)

### Key Benefits

**For Humans:**
- Faster page loads
- Focused, relevant content
- Less scrolling
- Better mobile experience
- Improved SEO

**For AI Agents:**
- 50-70% reduction in context window usage
- 30-40% faster response times
- Reduced hallucinations
- Better accuracy on specific questions

**For Maintainers:**
- Future-proof for schema generation
- Clearer git diffs
- Easier concurrent editing
- Enhancement partials for manual content

## Architecture Highlights

### Dual-Partial Strategy

```
partials/
  config-content/          # GENERATED from schema (future)
    jobs/docker.adoc
  config-enhancements/     # MANUAL best practices
    jobs/docker-best-practices.adoc
```

Category pages combine both:
```asciidoc
include::partial$config-content/jobs/docker.adoc[]
include::partial$config-enhancements/jobs/docker-best-practices.adoc[]
```

### Anchor ID Strategy

- Primary: `[#save-cache]` (kebab-case)
- Redirects: `[#savecache]`, `[#save_cache]`
- Mapping file tracks all variations

## Timeline

**Estimated Duration:** 3-5 weeks

- Phase 1 (Preparation): 3-5 days
- Phase 2 (Extract Partials): 1-2 weeks
- Phase 3 (Category Pages): 3-5 days
- Phase 4 (Complete Page): 2-3 days
- Phase 5 (Hub Page): 2-3 days
- Phase 6 (Navigation): 1-2 days
- Phase 7 (Redirects): 2-3 days
- Phase 8 (Testing): 1 week
- Phase 9 (Deployment): 3-5 days

## Success Criteria

### Implementation Success
1. ✅ Each category page < 45 KB
2. ✅ All content in partials (no duplication)
3. ✅ Related concepts grouped together
4. ✅ All redirects working
5. ✅ Build completes without errors

### Agent Accessibility Success
1. ✅ Accuracy ≥90% of baseline
2. ✅ Response time <70% of baseline
3. ✅ Context usage <50% of baseline
4. ✅ Hallucinations <60% of baseline

**At least 3 of 4 criteria must be met**

## Related Documentation

- [CircleCI YAML Language Server](https://github.com/CircleCI-Public/circleci-yaml-language-server) - Schema source
- [Antora Documentation](https://docs.antora.org) - Static site generator
- Current config reference: `/docs/reference/modules/ROOT/pages/configuration-reference.adoc`

## Team Contacts

- **Documentation Team:** [Your team contact]
- **Engineering (Language Server):** [Contact]
- **DevOps:** [Contact]

## Questions?

For questions about this project:
1. Review the PRD: [HYBRID_CONFIG_REFERENCE_PRD.md](./HYBRID_CONFIG_REFERENCE_PRD.md)
2. Check evaluation framework: [AGENT_ACCESSIBILITY_EVALUATION.md](./AGENT_ACCESSIBILITY_EVALUATION.md)
3. Contact documentation team

---

**Last Updated:** 2026-04-30
**Status:** Planning Complete - Ready for Review
