# CircleCI Documentation Skills

This directory contains custom skills for working with CircleCI documentation. Skills are reusable prompts that give Claude specialized capabilities for specific tasks.

## Available Skills

### content-review
Reviews CircleCI documentation pages for quality, clarity, and adherence to style guidelines. Generates a comprehensive narrative report with prioritized recommendations.

**What it checks (10 dimensions):**
- Tone and audience appropriateness
- Purpose ("why" and "how", and the opening value statement)
- Heading clarity and structure
- Code examples: self-contained, with current image and orb versions
- Information architecture and admonition use
- Section introductions
- Consistency (internal and with related docs)
- Repetition
- Flow and structure, including Prerequisites on how-to pages
- Partial and example reuse (hand-written content that should use, or become, a shared partial or example)

**Output:** Saves a markdown report to the repository root as `content-review-[page-name].md`

### contributor-pr-review
Reviews a contributor's pull request that adds a new page or updates existing content. Checks CI results, the PR as a whole, new-page requirements (template, nav, xrefs, images) and changed sections of updated pages, and lists technical claims that need engineering review. Uses the content-review dimensions and `AGENTS.md` rules instead of repeating them.

Reads the factory bot's findings and the CI results instead of repeating them. It flags a stale bot review by comparing the commit the bot reviewed with the PR head, and looks for facts the change leaves wrong in files it does not touch. Pinned orb and `cimg` versions on added lines are checked by `scripts/check-code-versions.js --diff`, and Vale rules (`ServerConditionals`, `ConfigFileName`) cover Cloud and Server directive mistakes and the configuration file name.

**Output:** Saves a markdown report to the repository root as `pr-review-[number].md`. It never posts to GitHub.

### vale-linter
Runs the Vale prose linter on CircleCI documentation files to identify and fix style errors, then creates pull requests for review.

### monthly-docs-report
A skill the CircleCI docs team use to create a newsletter each month to showcase notable additions and improvements.

### partials
Discovers, previews, and inserts reusable AsciiDoc partials and shared code examples with the correct `include::` syntax. Also proposes when new or existing content should become a shared partial or example, then creates it and replaces duplicates after confirmation. Use when writing or editing docs that need shared navigation steps, notes, FAQs, resource tables, config snippets, or other repeated content. Other docs-authoring skills should follow this skill instead of copying reusable content.

### kapa-docs-review
Reviews recent conversations with the CircleCI docs bot (Kapa) to find content gaps, wrong answers, and questions the bot could not answer. Opens docs fix PRs where the correct answer can be verified, and reports feature requests, support article issues, and anything unclear. Needs the Kapa MCP connected.

**Output:** A local report that stays outside the repository, because it contains customer details, and a redacted weekly Linear ticket. The Linear MCP must be connected. `SKILL.md` says where each one goes.

## Installation (Claude Code)

Skills need to be installed in Claude Code's skills directory to be recognized.

### Option 1: Copy Skills Directly

```bash
# From the repository root
cp -r ./skills/* ~/.claude/skills/
```

### Option 2: Symlink for Development

If you're actively developing skills, symlink them so changes sync automatically:

```bash
# From the repository root
ln -s "$(pwd)/skills/content-review" ~/.claude/skills/content-review
ln -s "$(pwd)/skills/contributor-pr-review" ~/.claude/skills/contributor-pr-review
ln -s "$(pwd)/skills/vale-linter" ~/.claude/skills/vale-linter
ln -s "$(pwd)/skills/partials" ~/.claude/skills/partials
ln -s "$(pwd)/skills/kapa-docs-review" ~/.claude/skills/kapa-docs-review
```

## Usage

Once installed, Claude Code will automatically trigger skills when relevant, or you can invoke them explicitly:

### content-review

**Automatic triggering:**
- "Review docs/guides/modules/test/pages/rerun-failed-tests.adoc"
- "How does this page look?" (when referencing a docs file)
- "Check this page for quality issues"

**Explicit invocation:**
```
/content-review docs/path/to/page.adoc
```

The skill will:
1. Analyze the page across 10 quality dimensions
2. Check 3-5 related pages for consistency
3. Flag hand-written content that should use, or become, a shared partial or example (see the partials skill below)
4. Generate a prioritized report
5. Save the report as `content-review-[page-name].md` in the repo root

### contributor-pr-review

**Automatic triggering:**
- "Review PR 1234"
- "Is this contributor's docs PR ready to merge?"

**Explicit invocation:**
```
/contributor-pr-review 1234
```

### vale-linter

**Automatic triggering:**
- "Fix vale errors in [file or directory]"
- "Run vale on [file] and create a PR"

**Explicit invocation:**
```
/vale-linter docs/path/to/file.adoc
```

### partials

**Automatic triggering:**
- "Is there a partial for project settings?"
- "Use a partial for the Docker auth note"
- "Should this be a shared partial?"
- "Is there a shared example for serial groups?"
- Writing or editing a page that needs shared nav steps, notes, FAQs, resource tables, or config snippets

**Explicit invocation:**
```
/partials
/partials navigation
/partials search project settings
/examples
/examples orchestration
/examples search job-group
```

The skill will:
1. Scan `docs/guides/modules/ROOT/partials/` or `docs/guides/modules/ROOT/examples/` (not a memorized list)
2. Preview matching files
3. Insert the correct `include::ROOT:partial$...` or `include::ROOT:example$...` line (examples go inside a source block)
4. Call out page attributes or `leveloffset` when a partial needs them
5. Propose extracting duplicated or reusable content, then replace the copies after you confirm

## Using Skills with Other AI Agents

If you're using a different AI agent (not Claude Code), you can still use these skills by:

1. **Read the SKILL.md file** in each skill directory
2. **Copy the instructions** into your conversation with your AI agent
3. **Provide context** about the file paths and repository structure
4. **Manually save outputs** if the agent doesn't automatically save files

The skills are written as structured prompts that any capable AI agent should be able to follow.

## Modifying Skills

Skills are defined in `SKILL.md` files using:
- **Frontmatter** (YAML): metadata like name and description
- **Markdown body**: detailed instructions for the AI agent

To modify a skill:
1. Edit the `SKILL.md` file in this directory
2. Copy or sync changes to `~/.claude/skills/` if using Claude Code
3. Test the skill with a sample task

## Contributing

When creating or modifying skills:
- Keep instructions clear and actionable
- Explain the "why" behind requirements, not just "what" to do
- Test with real examples before committing
- Update this README when adding new skills

## Learn More

- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/claude-code)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- CircleCI Documentation Style Guide: `AGENTS.md` in this repository (agents) and `docs/contributors/modules/docs-style/` (humans). Keep them in step.
