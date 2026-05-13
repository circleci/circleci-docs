# LLM-Optimized API Documentation - Implementation Plan

**Repository:** CircleCI Docs Repo
**Goal:** Make CircleCI API documentation accessible and efficient for AI agents/LLMs
**Status:** Planning

---

## Problem Statement

The current CircleCI API specification is:
- **636KB** (170K tokens) in a single monolithic JSON file
- At the edge of LLM context window limits
- Not optimized for LLM consumption (verbose JSON structure)
- Includes 79 endpoints across 16 feature areas

**Impact:**
- High token costs for agents
- Slow processing
- Agents must load entire spec even for single feature queries
- JSON structure less readable than natural language

---

## Solution Overview

Generate **LLM-optimized markdown documentation** alongside existing Redocly HTML docs:

```
/api/v2/
  ├── index.html                    # Human docs (Redocly) - existing
  └── specs/                        # Agent docs - NEW
      ├── index.json                # Discovery manifest
      ├── README.md                 # Overview guide
      ├── markdown/                 # LLM-optimized (primary)
      │   ├── project.md            # ~10KB (vs 48KB JSON)
      │   ├── pipeline.md           # ~8KB (vs 45KB JSON)
      │   ├── insights.md           # ~7KB (vs 42KB JSON)
      │   └── ...                   # 13 more feature files
      └── json/                     # OpenAPI specs (optional)
          ├── full.json             # Complete spec (636KB)
          └── ...                   # Split specs if needed
```

**Key Benefits:**
- **80% size reduction** - markdown vs JSON per feature
- **Token efficiency** - agents load only needed features
- **Better comprehension** - natural language vs nested JSON
- **Standard discovery** - integrated with existing llms.txt

---

## Implementation Steps

### Phase 1: Fetch & Split (Week 1)

**Fetch full spec** (already doing this):
```bash
curl https://circleci.com/api/v2/openapi.json > openapi.json
```

**Split by tag**:
Create `scripts/split-openapi-by-tag.js`:
- Parse OpenAPI JSON
- Group paths by tag (Project, Pipeline, Insights, etc.)
- For each tag:
  - Extract paths with that tag
  - Deep traverse to find referenced schemas
  - Build minimal valid OpenAPI spec
  - Save as `json/{tag}.json`

**Output:**
- `build/api/v2/specs/json/project.json`
- `build/api/v2/specs/json/pipeline.json`
- etc.

### Phase 2: Convert to Markdown (Week 1-2)

**Create conversion script** `scripts/openapi-to-markdown.js`:

Takes OpenAPI JSON, outputs concise markdown:

```markdown
# CircleCI Project APIs

## GET /project

List all projects.

**Authentication:** API key required
**Rate limit:** 1000 req/hour

**Returns:** Array of project objects

**Example:**
```bash
curl -H "Circle-Token: $TOKEN" \
  https://circleci.com/api/v2/project
```

---

## GET /project/{project-slug}

Get project details.

**Parameters:**
- `project-slug` (path, required): Format `gh/org/repo` or `bb/org/repo`

**Returns:** Project object with:
- `name`: Project name
- `vcs_url`: Repository URL
- `default_branch`: Default branch

**Example:**
```bash
curl https://circleci.com/api/v2/project/gh/myorg/myrepo
```
```

**Conversion priorities:**
1. Concise natural language (not JSON structure)
2. Inline examples
3. Practical parameter descriptions
4. Clear use cases
5. ~10-20 tokens per endpoint (vs 100+ in JSON)

### Phase 3: Generate Discovery Files (Week 2)

**A. JSON Manifest** (`specs/index.json`):

```json
{
  "openapi_version": "3.0.3",
  "description": "CircleCI API v2 - Optimized for AI agent consumption",
  "updated": "2026-05-13",
  "llms_txt": "https://circleci.com/docs/llms.txt",
  "formats": {
    "markdown": {
      "description": "LLM-optimized natural language docs",
      "size_reduction": "80%",
      "recommended_for": "AI agents, LLMs"
    },
    "json": {
      "description": "OpenAPI 3.0.3 specifications",
      "recommended_for": "Code generation, validation, tooling"
    }
  },
  "features": [
    {
      "tag": "project",
      "name": "Project APIs",
      "endpoints": 13,
      "description": "Create and manage projects, configure settings",
      "use_cases": [
        "create new project",
        "list user projects",
        "update project settings",
        "get project details"
      ],
      "markdown": "https://circleci.com/docs/api/v2/specs/markdown/project.md",
      "markdown_size_kb": 10,
      "json": "https://circleci.com/docs/api/v2/specs/json/project.json",
      "json_size_kb": 48
    },
    {
      "tag": "pipeline",
      "name": "Pipeline APIs",
      "endpoints": 11,
      "description": "Trigger and manage CI/CD pipelines",
      "use_cases": [
        "trigger pipeline",
        "list pipelines",
        "get pipeline status",
        "continue pipeline"
      ],
      "markdown": "https://circleci.com/docs/api/v2/specs/markdown/pipeline.md",
      "markdown_size_kb": 8,
      "json": "https://circleci.com/docs/api/v2/specs/json/pipeline.json",
      "json_size_kb": 45
    },
    {
      "tag": "insights",
      "name": "Insights APIs",
      "endpoints": 10,
      "description": "Analytics, metrics, and reporting",
      "use_cases": [
        "workflow metrics",
        "test analytics",
        "credit usage",
        "performance trends"
      ],
      "markdown": "https://circleci.com/docs/api/v2/specs/markdown/insights.md",
      "markdown_size_kb": 7,
      "json": "https://circleci.com/docs/api/v2/specs/json/insights.json",
      "json_size_kb": 42
    }
    // ... 13 more features
  ]
}
```

**B. README.md** (`specs/README.md`):

```markdown
# CircleCI API v2 Specifications

API documentation optimized for AI agents and LLM consumption.

## Quick Start for AI Agents

**Recommended:** Use markdown format (80% smaller, natural language)

1. View available APIs: https://circleci.com/docs/api/v2/specs/index.json
2. Choose relevant API (e.g., "pipeline" for CI/CD)
3. Fetch markdown: https://circleci.com/docs/api/v2/specs/markdown/pipeline.md
4. Parse and use

## Available APIs

| Feature | Endpoints | Use Cases | Markdown | JSON |
|---------|-----------|-----------|----------|------|
| Project | 13 | Create projects, manage settings | [project.md](markdown/project.md) | [project.json](json/project.json) |
| Pipeline | 11 | Trigger pipelines, check status | [pipeline.md](markdown/pipeline.md) | [pipeline.json](json/pipeline.json) |
| Insights | 10 | Metrics, analytics, reporting | [insights.md](markdown/insights.md) | [insights.json](json/insights.json) |
| Context | 10 | Manage secrets and contexts | [context.md](markdown/context.md) | [context.json](json/context.json) |
| ... | ... | ... | ... | ... |

## Format Comparison

**Markdown** (Recommended for LLMs):
- 80% smaller than JSON
- Natural language descriptions
- Inline examples
- ~10KB per feature area

**JSON** (For tooling):
- OpenAPI 3.0.3 format
- Precise type definitions
- Machine-parseable schemas
- ~48KB per feature area

## Authentication

All API requests require authentication via:
- API Token (header): `Circle-Token: YOUR_TOKEN`
- Basic Auth: username + password

## Rate Limits

- 1000 requests/hour per token
- Headers include rate limit info

## Support

- Full API reference: https://circleci.com/docs/api/v2/
- Community forum: https://discuss.circleci.com/
- API changelog: https://circleci.com/docs/api-changelog/
```

### Phase 4: Update llms.txt (Week 2)

**Extend existing** `llms.txt` with API section:

```text
# API Reference Documentation

## API Specifications for AI Agents

Complete CircleCI API v2 documentation available in LLM-optimized markdown format.

Discovery manifest: https://circleci.com/docs/api/v2/specs/index.json
Overview guide: https://circleci.com/docs/api/v2/specs/README.md

## API Documentation by Feature (Markdown - Recommended for LLMs)

Markdown format is 80% smaller than JSON and uses natural language.

- Project APIs: https://circleci.com/docs/api/v2/specs/markdown/project.md
  (13 endpoints: create projects, manage settings, project configuration)

- Pipeline APIs: https://circleci.com/docs/api/v2/specs/markdown/pipeline.md
  (11 endpoints: trigger pipelines, check status, manage runs)

- Insights APIs: https://circleci.com/docs/api/v2/specs/markdown/insights.md
  (10 endpoints: workflow metrics, test analytics, credit usage, performance data)

- Context APIs: https://circleci.com/docs/api/v2/specs/markdown/context.md
  (10 endpoints: manage contexts, secrets, environment variables)

- Policy APIs: https://circleci.com/docs/api/v2/specs/markdown/policy.md
  (9 endpoints: policy management, decisions, compliance)

- Organization APIs: https://circleci.com/docs/api/v2/specs/markdown/organization.md
  (6 endpoints: org settings, users, teams)

- OIDC APIs: https://circleci.com/docs/api/v2/specs/markdown/oidc.md
  (6 endpoints: OIDC token customization, claims management)

- Job APIs: https://circleci.com/docs/api/v2/specs/markdown/job.md
  (6 endpoints: job control, artifacts, test results)

- Workflow APIs: https://circleci.com/docs/api/v2/specs/markdown/workflow.md
  (5 endpoints: workflow management, reruns, approvals)

- Webhook APIs: https://circleci.com/docs/api/v2/specs/markdown/webhook.md
  (5 endpoints: webhook configuration, delivery, events)

- Trigger APIs: https://circleci.com/docs/api/v2/specs/markdown/trigger.md
  (5 endpoints: schedule triggers, manual triggers)

- Schedule APIs: https://circleci.com/docs/api/v2/specs/markdown/schedule.md
  (5 endpoints: scheduled pipelines, cron management)

- Deploy APIs: https://circleci.com/docs/api/v2/specs/markdown/deploy.md
  (5 endpoints: deployment tracking, releases)

- User APIs: https://circleci.com/docs/api/v2/specs/markdown/user.md
  (3 endpoints: user profile, preferences)

## API Documentation (OpenAPI JSON - For Code Generation)

Full OpenAPI 3.0.3 specifications for tooling and validation.

- Complete API: https://circleci.com/docs/api/v2/specs/json/full.json (636KB, all 79 endpoints)
- Split by feature: https://circleci.com/docs/api/v2/specs/json/{feature}.json

## Interactive API Reference (For Humans)

Human-readable interactive documentation with examples and try-it features.

- Full API Reference: https://circleci.com/docs/api/v2/ (Redocly)
```

---

## Build Process Integration

### Current Build Process (Unchanged)

```javascript
function buildApiV2(callback) {
  // 1. Fetch full spec
  curl https://circleci.com/api/v2/openapi.json

  // 2. Bundle & dereference
  npx @redocly/cli bundle openapi.json --dereferenced

  // 3. Add code samples
  node scripts/generate-api-snippets.js

  // 4. Lint
  npx @redocly/cli lint

  // 5. Build Redocly HTML
  npx @redocly/cli build-docs --output build/api/v2/index.html

  // 6. Copy logo
  cp logo.svg build/api/v2/
}
```

### New Steps (Add After Step 6)

```javascript
// Step 7: Split OpenAPI spec by tag
console.log('📂 Splitting OpenAPI spec by feature tag...')
exec('node scripts/split-openapi-by-tag.js build/temp-api-v2/openapi.json build/api/v2/specs/json/', (err) => {
  if (err) {
    console.error('❌ Failed to split spec:', err)
    return callback(err)
  }
  console.log('✅ Spec split into 16 feature files')

  // Step 8: Convert JSON to Markdown
  console.log('📝 Converting to markdown for LLM consumption...')
  const tags = [
    'project', 'pipeline', 'insights', 'context', 'policy',
    'organization', 'oidc', 'job', 'workflow', 'webhook',
    'trigger', 'schedule', 'deploy', 'user', 'admin'
  ]

  let converted = 0
  tags.forEach(tag => {
    exec(`node scripts/openapi-to-markdown.js build/api/v2/specs/json/${tag}.json build/api/v2/specs/markdown/${tag}.md`, (err) => {
      if (err) {
        console.error(`❌ Failed to convert ${tag}:`, err)
      }
      converted++
      if (converted === tags.length) {
        console.log('✅ All specs converted to markdown')

        // Step 9: Generate discovery files
        console.log('🔍 Generating discovery files...')
        exec('node scripts/generate-discovery-manifest.js build/api/v2/specs build/api/v2/specs/index.json', (err) => {
          if (err) {
            console.error('❌ Failed to generate manifest:', err)
            return callback(err)
          }

          exec('node scripts/generate-specs-readme.js build/api/v2/specs build/api/v2/specs/README.md', (err) => {
            if (err) {
              console.error('❌ Failed to generate README:', err)
              return callback(err)
            }

            // Step 10: Update llms.txt
            console.log('📋 Updating llms.txt...')
            exec('node scripts/update-llms-txt-api-section.js build/api/v2/specs build/llms.txt', (err) => {
              if (err) {
                console.error('❌ Failed to update llms.txt:', err)
                return callback(err)
              }

              console.log('✅ llms.txt updated with API documentation')
              console.log('🎉 LLM-optimized API documentation complete!')
              callback()
            })
          })
        })
      }
    })
  })
})
```

---

## Script Specifications

### 1. `scripts/split-openapi-by-tag.js`

**Input:** Full OpenAPI JSON file
**Output:** Split JSON files per tag

**Logic:**
```javascript
const fs = require('fs')
const spec = JSON.parse(fs.readFileSync(inputFile))

// Group paths by tag
const pathsByTag = {}
Object.entries(spec.paths).forEach(([path, pathItem]) => {
  Object.values(pathItem).forEach(operation => {
    if (operation.tags) {
      operation.tags.forEach(tag => {
        if (!pathsByTag[tag]) pathsByTag[tag] = {}
        pathsByTag[tag][path] = pathItem
      })
    }
  })
})

// For each tag, create minimal valid spec
Object.entries(pathsByTag).forEach(([tag, paths]) => {
  const tagSpec = {
    openapi: spec.openapi,
    info: { ...spec.info, title: `CircleCI API v2 - ${tag}` },
    servers: spec.servers,
    security: spec.security,
    paths: paths,
    components: extractReferencedComponents(paths, spec.components)
  }

  fs.writeFileSync(`${outputDir}/${tag.toLowerCase()}.json`, JSON.stringify(tagSpec, null, 2))
})
```

### 2. `scripts/openapi-to-markdown.js`

**Input:** OpenAPI JSON file
**Output:** Markdown file

**Format:**
```javascript
// Parse OpenAPI JSON
const spec = JSON.parse(fs.readFileSync(inputFile))

let markdown = `# ${spec.info.title}\n\n`
markdown += `${spec.info.description}\n\n`

// For each path
Object.entries(spec.paths).forEach(([path, pathItem]) => {
  Object.entries(pathItem).forEach(([method, operation]) => {
    markdown += `## ${method.toUpperCase()} ${path}\n\n`
    markdown += `${operation.summary}\n\n`

    // Parameters
    if (operation.parameters?.length) {
      markdown += `**Parameters:**\n`
      operation.parameters.forEach(param => {
        markdown += `- \`${param.name}\` (${param.in}, ${param.required ? 'required' : 'optional'}): ${param.description}\n`
      })
      markdown += `\n`
    }

    // Response
    const okResponse = operation.responses['200']
    if (okResponse) {
      markdown += `**Returns:** ${okResponse.description}\n\n`
    }

    // Example
    markdown += `**Example:**\n`
    markdown += `\`\`\`bash\n`
    markdown += `curl -H "Circle-Token: $TOKEN" https://circleci.com/api/v2${path}\n`
    markdown += `\`\`\`\n\n`
    markdown += `---\n\n`
  })
})

fs.writeFileSync(outputFile, markdown)
```

### 3. `scripts/generate-discovery-manifest.js`

**Input:** Specs directory
**Output:** `index.json`

**Logic:**
- Read all JSON files in specs/json/
- Read all markdown files in specs/markdown/
- Get file sizes
- Count endpoints
- Generate manifest JSON structure (see Phase 3)

### 4. `scripts/generate-specs-readme.js`

**Input:** Specs directory
**Output:** `README.md`

**Logic:**
- Read manifest
- Generate markdown table
- Add usage instructions
- Write README (see Phase 3)

### 5. `scripts/update-llms-txt-api-section.js`

**Input:** Specs directory, existing llms.txt
**Output:** Updated llms.txt

**Logic:**
- Read current llms.txt
- Find/remove old API section if exists
- Generate new API section with markdown links
- Insert before final section
- Write updated llms.txt

---

## Success Metrics

### Technical Metrics
- **Size reduction:** 80%+ for markdown vs JSON
- **Build time:** <2 minutes for all conversions
- **Validation:** All specs pass OpenAPI linting

### Usage Metrics (Post-Launch)
- Track access logs: markdown vs JSON downloads
- Monitor which feature specs are most accessed
- Measure token usage reduction (if agents report metrics)

---

## Testing

### Unit Tests
- Split function correctly groups by tag
- All referenced schemas included
- Markdown conversion produces valid markdown
- Manifest includes all expected fields

### Integration Tests
- Full build completes successfully
- All output files created
- llms.txt valid format
- Links in manifest accessible

### Manual Validation
- Sample markdown files human-readable
- JSON specs valid OpenAPI 3.0.3
- index.json parseable
- README.md renders correctly

---

## Rollout Plan

### Week 1: Development
- Implement split script
- Implement markdown converter
- Test with sample specs

### Week 2: Integration
- Add to build process
- Implement discovery file generation
- Update llms.txt
- Test full build

### Week 3: Staging
- Deploy to staging environment
- Validate all URLs accessible
- Review markdown quality
- Get feedback

### Week 4: Production
- Deploy to production
- Announce in changelog
- Monitor analytics
- Gather feedback

---

## Open Questions

1. **Markdown format details:** How much detail per endpoint? Include request/response schemas?
2. **Tag grouping:** Current 16 tags OK, or should we consolidate some?
3. **Update frequency:** Build on every commit, daily, or on-demand?
4. **Versioning:** Include API version in URLs? (e.g., /specs/v2.0/...)
5. **Deprecation:** How to handle deprecated endpoints in markdown?

---

## Dependencies

### Node.js Libraries
- OpenAPI parsing: `@apidevtools/swagger-parser` or `openapi3-ts`
- JSON manipulation: Built-in
- Markdown generation: Template literals (built-in)

### Build Tools
- Redocly CLI (already installed)
- Node.js 16+ (already available)

---

## Future Enhancements

### Phase 2 (Optional)
- Add response examples to markdown
- Include error codes and troubleshooting
- Add rate limit details per endpoint
- Generate summary statistics page

### Phase 3 (Optional)
- Interactive markdown with copy buttons
- Search functionality across all specs
- Changelog tracking per feature
- Usage examples per language (Python, Ruby, etc.)

---

## References

- Current API docs: https://circleci.com/docs/api/v2/
- Current llms.txt: https://circleci.com/docs/llms.txt
- OpenAPI spec: https://circleci.com/api/v2/openapi.json
- llms.txt standard: https://llmstxt.org/

---

## Contact

For questions or feedback on this implementation:
- CircleCI Docs Team
- Repository: [docs repo]
- Related: openapi-federation-service (provides source spec)
