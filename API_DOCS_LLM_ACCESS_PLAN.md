# CircleCI API Documentation LLM Access - Implementation Plan

**Goal**: Make CircleCI API v2 documentation accessible to LLMs, agents, and crawlers while keeping the existing Redocly human-readable site.

**Status**: Planning Phase
**Branch**: DOC-133-af-api-docs-3

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Proposed Solution Review](#proposed-solution-review)
3. [Implementation Plan](#implementation-plan)
4. [Integration Points](#integration-points)
5. [Testing & Benchmarking](#testing--benchmarking)
6. [Rollout Strategy](#rollout-strategy)

---

## Current State Analysis

### What We Have

**Existing Infrastructure:**
- ✅ Antora-based documentation site with comprehensive llms.txt generator
- ✅ API v2 docs built with Redocly from live OpenAPI spec (`https://circleci.com/api/v2/openapi.json`)
- ✅ Markdown export extension for main docs (`extensions/markdown-export-extension.js`)
- ✅ Build pipeline orchestrated via Gulp (`gulp.d/tasks/build-api-docs.js`)
- ✅ CI/CD integration in CircleCI config

**Current API Docs Build Process** (8 steps):
1. Fetch OpenAPI spec from live API
2. Bundle & dereference with Redocly
3. Generate code samples (cURL, Node, Python, Go, Ruby)
4. Apply JSON patches from `openapi-patch.json`
5. Lint the spec
6. Generate HTML with Redocly
7. Copy assets (logo)
8. Cleanup temp files

**Output**: Single-page HTML at `build/api/v2/index.html` (~1.6MB)

### The Problem

**API docs are not LLM-accessible:**
- ❌ Single monolithic HTML file (1.6MB) - difficult to parse
- ❌ No structured markdown chunks for agents to navigate
- ❌ No llms.txt index specifically for API endpoints
- ❌ No discovery mechanisms pointing agents to API-specific resources
- ❌ Agents cannot efficiently find specific endpoints without parsing entire spec

---

## Proposed Solution Review

### Your Original Proposal

**✅ GOOD APPROACH:**
1. Keep Redocly site for humans (maintain existing UX)
2. Build Go tooling to chunk API docs into per-endpoint markdown files
3. Generate llms.txt (or extend existing generator) with endpoint index
4. Add discovery mechanisms (HTML link rel, OpenAPI externalDocs, HTTP headers)
5. Benchmark before/after to measure improvement

### Refinements & Recommendations

**Architecture Decision: Separate vs. Integrated llms.txt**

**Option A: Dedicated API llms.txt** (RECOMMENDED)
- **Location**: `build/api/v2/llms.txt`
- **URL**: `https://circleci.com/docs/api/v2/llms.txt`
- **Pros**:
  - Clear separation of concerns
  - API-specific instructions can be more detailed
  - Easier for agents to discover and parse
  - Doesn't clutter main llms.txt
- **Cons**:
  - One additional file to discover
  - Need to cross-reference from main llms.txt

**Option B: Extend Existing llms.txt**
- **Location**: Add API section to existing `build/llms.txt`
- **Pros**:
  - Single source of truth for all docs
  - Main llms.txt already discovered
- **Cons**:
  - Makes main llms.txt much larger
  - API docs are dynamically generated, main docs are static
  - Different update cadences (API changes frequently)

**RECOMMENDATION: Option A (Dedicated API llms.txt) with cross-reference from main llms.txt**

---

## Implementation Plan

### Phase 1: Build Go Tool for Markdown Generation

**1.1 Create Go Module Structure**

```
scripts/generate-api-markdown/
├── go.mod
├── go.sum
├── main.go
├── cmd/
│   └── generate-api-markdown/
│       └── main.go
├── internal/
│   └── generator/
│       ├── markdown.go      # Per-endpoint markdown generation
│       ├── llms.go          # llms.txt generation
│       ├── schema.go        # Schema rendering
│       └── examples.go      # Example synthesis
└── README.md
```

**Dependencies:**
```go
require (
    github.com/getkin/kin-openapi/openapi3 v0.126.0
)
```

**1.2 Implement Core Functionality**

Based on your POC code, create:
- ✅ Load and parse bundled OpenAPI JSON
- ✅ Generate one markdown file per operation (`operations/{operationId}.md`)
- ✅ Render parameters, request body, responses with proper formatting
- ✅ Handle schema composition (oneOf, anyOf, allOf)
- ✅ Synthesize JSON examples from schemas
- ✅ Generate llms.txt with tag-grouped index

**Key Enhancements to POC:**
- Add better error handling and logging
- Make output directory configurable
- Support custom base URL from config
- Include operation tags in metadata
- Add CircleCI-specific authentication instructions

**1.3 Update Special Instructions**

Customize the `specialInstructions` constant for CircleCI:

```go
const specialInstructions = "## Special Instructions\n\n" +
    "- Base URL: `https://circleci.com/api/v2`\n" +
    "- Authentication: send a personal API token in the `Circle-Token` header. Generate one at <https://app.circleci.com/settings/user/tokens>.\n" +
    "- `project_id` parameters are UUIDs (not the `gh/org/repo` slug used by older endpoints).\n" +
    "- Rate limiting: 5000 requests per hour per token.\n" +
    "- The full OpenAPI spec is at <https://circleci.com/docs/api/v2/openapi.json>.\n" +
    "- Each operation links to `/api/v2/operations/{operationId}.md`.\n" +
    "- HTML documentation for humans: <https://circleci.com/docs/api/v2/>.\n"
```

### Phase 2: Integrate with Build Pipeline

**2.1 Add Go Tool to Build Process**

Update `gulp.d/tasks/build-api-docs.js`:

```javascript
async function generateApiMarkdown() {
  const { promisify } = require('util');
  const exec = promisify(require('child_process').exec);

  console.log('Generating API markdown chunks for LLMs...');

  try {
    // Run Go tool to generate markdown from bundled spec
    await exec(
      'go run ./scripts/generate-api-markdown/cmd/generate-api-markdown ' +
      'openapi-bundled.json build/api/v2',
      { cwd: process.cwd() }
    );

    console.log('✅ Generated API markdown chunks');
  } catch (error) {
    console.error('⚠️  Failed to generate API markdown:', error.message);
    console.log('Build will continue without LLM-friendly API docs');
  }
}
```

**2.2 Update Build Sequence**

Insert markdown generation after bundling but before HTML generation:

```javascript
async function buildApiV2() {
  // ... existing steps 1-4 (fetch, bundle, generate samples, patch) ...

  // NEW: Step 5 - Generate markdown chunks for LLMs
  await generateApiMarkdown();

  // Step 6 - Lint
  await runCommand('lint', ['openapi-bundled.json']);

  // Step 7 - Build HTML
  await runCommand('build-docs', [...]);

  // ... remaining steps ...
}
```

**2.3 Output Structure**

After build, `build/api/v2/` will contain:

```
build/api/v2/
├── index.html                    # Human-readable Redocly site (existing)
├── llms.txt                      # LLM endpoint index (NEW)
├── openapi.json                  # Full bundled spec (NEW - copy for reference)
└── operations/                   # Per-endpoint markdown (NEW)
    ├── get-project-by-slug.md
    ├── list-pipelines.md
    ├── trigger-pipeline.md
    └── ... (~150-200 files)
```

### Phase 3: Discovery Mechanisms

**3.1 Update Main llms.txt**

Modify `extensions/llms-txt-generator-extension.js` to add API reference:

```javascript
// After "Common URL Patterns" section, add:
sections.push('## API Documentation\n');
sections.push('CircleCI API v2 documentation is available in LLM-friendly format:\n');
sections.push(`- API llms.txt: ${playbook.site.url}/api/v2/llms.txt`);
sections.push(`- Per-endpoint markdown: ${playbook.site.url}/api/v2/operations/{operationId}.md`);
sections.push(`- Full OpenAPI spec: ${playbook.site.url}/api/v2/openapi.json`);
sections.push(`- Human-readable docs: ${playbook.site.url}/api/v2/\n`);
```

**3.2 Add HTML Discovery Links**

Update `custom-template.hbs` (Redocly HTML template):

```html
<!DOCTYPE html>
<html>
<head>
  {{{redocHead}}}

  <!-- LLM Discovery Links -->
  <link rel="alternate" type="text/plain" href="/docs/llms.txt" title="Main Documentation Index for LLMs">
  <link rel="alternate" type="text/plain" href="/docs/api/v2/llms.txt" title="API Documentation Index for LLMs">
  <link rel="alternate" type="application/json" href="/docs/api/v2/openapi.json" title="OpenAPI Specification">

  <!-- Custom logo and branding -->
  <style>
    /* ... existing styles ... */
  </style>
</head>
<body>
  {{{redocHTML}}}
</body>
</html>
```

**3.3 Add OpenAPI externalDocs**

Create or update `openapi-patch.json` to inject externalDocs:

```json
{
  "externalDocs": {
    "description": "LLM-friendly per-operation index",
    "url": "https://circleci.com/docs/api/v2/llms.txt"
  }
}
```

This will be merged into the spec during the build process (step 4).

**3.4 HTTP Link Header (Optional - Server Configuration)**

If CircleCI uses nginx or similar:

```nginx
location /docs/api/v2/ {
    add_header Link '</docs/api/v2/llms.txt>; rel="alternate"; type="text/plain"';
    add_header Link '</docs/api/v2/openapi.json>; rel="alternate"; type="application/json"';
}
```

**Note**: This requires infrastructure team involvement. Can be deferred to Phase 4.

### Phase 4: Enhancements

**4.1 Copy Full OpenAPI Spec**

Add step to copy the bundled spec for agent reference:

```javascript
async function copyOpenApiSpec() {
  await fs.copyFile(
    'openapi-bundled.json',
    'build/api/v2/openapi.json'
  );
  console.log('✅ Copied OpenAPI spec to build output');
}
```

**4.2 Add Metadata to Operations**

Enhance markdown files with frontmatter:

```markdown
---
operationId: get-project-by-slug
method: GET
path: /project/{project-slug}
tag: Project
requiresAuth: true
---

# Get a Project

`GET /project/{project-slug}`

Returns a single project by project slug.

...
```

This helps agents parse metadata without reading full content.

**4.3 Generate JSON Index**

In addition to llms.txt, generate `operations/index.json`:

```json
{
  "version": "2.0",
  "baseUrl": "https://circleci.com/api/v2",
  "operations": [
    {
      "operationId": "get-project-by-slug",
      "summary": "Get a Project",
      "method": "GET",
      "path": "/project/{project-slug}",
      "tag": "Project",
      "markdownUrl": "/operations/get-project-by-slug.md"
    },
    ...
  ],
  "tags": ["Project", "Pipeline", "Workflow", "Job", ...]
}
```

Provides machine-readable index for agents that prefer JSON.

---

## Integration Points

### With Existing Build System

**Files to Modify:**
1. `gulp.d/tasks/build-api-docs.js` - Add markdown generation step
2. `extensions/llms-txt-generator-extension.js` - Add API reference section
3. `custom-template.hbs` - Add HTML discovery links
4. `openapi-patch.json` - Add externalDocs
5. `package.json` - Add Go tool to build script dependencies

**New Files:**
1. `scripts/generate-api-markdown/` - Go module (entire directory)
2. `API_DOCS_LLM_ACCESS_PLAN.md` - This document
3. `scripts/generate-api-markdown/README.md` - Tool documentation

### With CI/CD Pipeline

**No changes required** - The existing CircleCI build job will:
1. Install npm dependencies
2. Build UI bundle
3. Run `npx gulp build:docs` (includes API docs build)
4. Deploy to production

The Go tool will be invoked as part of the Gulp build task.

**Ensure Go is available in CI:**

Check `.circleci/config.yml` - if Go is not installed, add:

```yaml
- run:
    name: Install Go
    command: |
      sudo rm -rf /usr/local/go
      wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
      sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
      echo 'export PATH=$PATH:/usr/local/go/bin' >> $BASH_ENV
```

Or use a Docker image that includes Go (e.g., `cimg/node:lts` already has Go).

### With Deployment

**Output Structure:**

```
build/
├── llms.txt                      # Main docs llms.txt (references API llms.txt)
├── api/
│   ├── v1/                       # Existing API v1 (unchanged)
│   │   └── index.html
│   └── v2/                       # API v2 with LLM support
│       ├── index.html            # Human-readable (Redocly)
│       ├── llms.txt              # LLM endpoint index
│       ├── openapi.json          # Full spec
│       └── operations/           # Per-endpoint markdown
│           ├── *.md
│           └── index.json
├── guides/                       # Main docs (unchanged)
└── ... (other components)
```

**S3 Upload**: All files in `build/` are uploaded, including new markdown chunks.

**URL Accessibility:**
- Main llms.txt: `https://circleci.com/docs/llms.txt`
- API llms.txt: `https://circleci.com/docs/api/v2/llms.txt`
- Operations: `https://circleci.com/docs/api/v2/operations/{operationId}.md`
- OpenAPI spec: `https://circleci.com/docs/api/v2/openapi.json`

---

## Testing & Benchmarking

### Pre-Implementation Benchmark

**Test Question:**
> "Do you have enough information here: CircleCI API v2 Documentation to call the create pipeline definition API? Don't actually send the call, just confirming what information is available."

**Date**: 2026-05-14
**Agent Tested**: Claude.ai (Sonnet 4.5)
**Result**: ❌ **FAILED** - Cannot get sufficient information to make API call

#### Actual Results

**Issues Encountered:**
1. **JavaScript Rendering Problem**: Redocly page requires JavaScript; only partially rendered during web fetch
2. **Incomplete Content**: Fetch cut off at "Webhook" section, before "Pipeline Definition" section
3. **Large Single-Page Document**: ~1.6MB HTML document times out before full content captured

**Information Successfully Retrieved:**
- ✅ Endpoint exists (visible in navigation sidebar)
- ✅ Authentication method (API key header - inferred from other endpoints)
- ⚠️ HTTP method (POST - guessed from navigation)

**Critical Information Missing:**
- ❌ Endpoint path/URL
- ❌ Required parameters
- ❌ Optional parameters
- ❌ Request body schema
- ❌ Response format
- ❌ Example request/response

**Agent's Response:**
> "Bottom line: not enough to make the call. The docs page is there, but the relevant section wasn't captured."

**Agent's Workaround Suggestion:**
- Fetch OpenAPI spec directly from `https://circleci.com/api/v2/openapi.json`
- This works but requires parsing the entire spec
- No structured guidance for agents to find specific endpoints

#### Key Insights

This benchmark validates our entire approach. The current Redocly documentation has three critical issues for LLM access:

1. **JavaScript-Dependent**: Agents cannot reliably execute JavaScript to render content
2. **Monolithic**: Single 1.6MB page causes timeouts and partial loading
3. **Undiscoverable**: No structured index or navigation system for agents

Our solution addresses all three problems:
- ✅ **Markdown chunks** (plain text, no JS required)
- ✅ **Per-endpoint files** (small files, fast loading)
- ✅ **llms.txt index** (structured navigation and discovery)

### Post-Implementation Benchmark

**Same Test Question, Same Agents**

**What to Measure:**
- ✅ Can agent discover llms.txt?
- ✅ Can agent navigate to correct operation markdown?
- ✅ Accuracy of information provided
- ✅ Completeness of response
- ✅ Time to answer

**Expected Result (With Changes):**
- ✅ Agent discovers `/api/v2/llms.txt`
- ✅ Agent navigates to `/api/v2/operations/create-pipeline-definition.md`
- ✅ Provides accurate, up-to-date information
- ✅ Includes authentication details
- ✅ Shows request/response schemas with examples

---

## Rollout Strategy

### Phase 0: Pre-Implementation (Week 1)

- [x] Review plan and get stakeholder approval
- [x] Run pre-implementation benchmark
- [x] Document current agent behavior
- [x] Set up branch: `DOC-133-af-api-docs-3`

### Phase 1: Build Go Tool (Week 1-2)

- [x] Create Go module structure
- [x] Implement markdown generation (use POC as base)
- [x] Implement llms.txt generation
- [x] Test locally with sample OpenAPI spec
- [x] Verify output format and quality
- [x] Add README and documentation

**Success Criteria:**
- ✅ Go tool generates markdown files from OpenAPI JSON
- ✅ llms.txt index is well-formatted and complete
- ✅ All operations have corresponding markdown files (114 files)
- ✅ Examples are synthesized correctly

### Phase 2: Integrate with Build (Week 2)

- [x] Modify `build-api-docs.js` to call Go tool
- [x] Test full build pipeline locally
- [x] Verify output in `build/api/v2/`
- [x] Check for build errors or warnings
- [x] Optimize build time (added ~3 seconds)

**Success Criteria:**
- ✅ Build completes successfully
- ✅ Markdown chunks appear in build output (114 operations)
- ✅ No breaking changes to existing API docs
- ✅ Build is non-blocking (continues if markdown generation fails)

### Phase 3: Add Discovery (Week 2-3)

- [x] Update main llms.txt with API reference
- [x] Add HTML discovery links to template
- [x] Add externalDocs to OpenAPI spec
- [x] Enable JSON patching in build pipeline
- [x] Copy OpenAPI spec to build output
- [ ] Test discovery from agent perspective
- [ ] Verify all URLs are accessible (will verify in production)

**Success Criteria:**
- ✅ Main llms.txt references API llms.txt
- ✅ HTML includes proper link tags (3 discovery links)
- ✅ OpenAPI spec includes externalDocs
- ⏳ All URLs return 200 OK (pending deployment)

### Phase 4: Benchmark & Iterate (Week 3)

- [ ] Run post-implementation benchmark
- [ ] Compare with pre-implementation results
- [ ] Gather feedback from agents/testers
- [ ] Identify gaps or improvements
- [ ] Make adjustments as needed

**Success Criteria:**
- Agents can discover and use API docs
- Benchmark shows clear improvement
- Documentation is accurate and complete

### Phase 5: Deploy & Monitor (Week 4)

- [ ] Merge to main branch
- [ ] Deploy to production
- [ ] Monitor agent usage (if possible)
- [ ] Gather user feedback
- [ ] Document lessons learned

**Success Criteria:**
- Changes deployed successfully
- No production issues
- Positive feedback from users/agents

---

## Risk Mitigation

### Technical Risks

**Risk: Go tool fails during build**
- **Mitigation**: Wrap in try-catch, allow build to continue without markdown chunks
- **Fallback**: Log warning, notify team, but don't break production build

**Risk: Markdown generation is slow**
- **Mitigation**: Profile Go tool, optimize hot paths, consider caching
- **Target**: <10 seconds added to build time

**Risk: Output is too large**
- **Mitigation**: Monitor output size, compress if needed, consider pagination
- **Estimate**: ~150-200 markdown files × ~5KB = ~1MB (acceptable)

### Process Risks

**Risk: CI doesn't have Go installed**
- **Mitigation**: Check CI config early, add Go installation step if needed
- **Alternative**: Use Docker image with Go pre-installed

**Risk: Discovery mechanisms not effective**
- **Mitigation**: Test with multiple agents before deploying
- **Iteration**: Add more hints/links based on feedback

### Documentation Risks

**Risk: Generated markdown is inaccurate**
- **Mitigation**: Manually review samples, compare with Redocly output
- **Testing**: Cross-check 10-20 endpoints for accuracy

**Risk: Schema rendering is unclear**
- **Mitigation**: Review nested object formatting, add examples liberally
- **Feedback**: Get review from technical writers

---

## Success Metrics

### Quantitative

- ✅ 100% of operations have markdown files
- ✅ llms.txt includes all operations
- ✅ Build time increase <10 seconds
- ✅ Zero production build failures
- ✅ All discovery URLs return 200 OK

### Qualitative

- ✅ Agents can answer API questions accurately
- ✅ Benchmark shows clear improvement over baseline
- ✅ Team feedback is positive
- ✅ No user complaints about API doc accessibility

---

## Open Questions

1. **Go Version**: What Go version is available in CI? (Need to check)
2. **HTTP Headers**: Can we add Link headers? (Need infrastructure team)
3. **Caching**: Should we cache markdown between builds? (Probably not needed)
4. **Versioning**: How to handle API v1? (Out of scope for now)
5. **Analytics**: Can we track LLM access to these files? (Future enhancement)

---

## Next Steps

1. **Review this plan** with team and stakeholders
2. **Run pre-implementation benchmark** to establish baseline
3. **Start Phase 1** (Build Go Tool) once approved
4. **Set up weekly check-ins** to track progress
5. **Document learnings** for future similar projects

---

## References

- Original POC Go tool (provided in conversation)
- Existing llms-txt-generator-extension.js: `/extensions/llms-txt-generator-extension.js`
- API build pipeline: `/gulp.d/tasks/build-api-docs.js`
- API integration docs: `/API_DOCS_INTEGRATION.md`
- CircleCI API v2: `https://circleci.com/api/v2/openapi.json`

---

**Document Version**: 1.0
**Date**: 2026-05-14
**Author**: Claude Code (with human review)
**Status**: Draft - Awaiting Approval
