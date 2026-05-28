# CircleCI Documentation Skills

This directory contains custom skills for working with CircleCI documentation. Skills are reusable prompts that give Claude specialized capabilities for specific tasks.

## Available Skills

### content-review
Reviews CircleCI documentation pages for quality, clarity, and adherence to style guidelines. Generates a comprehensive narrative report with prioritized recommendations.

**What it checks:**
- Tone and audience appropriateness
- "Why" and "how" coverage
- Heading clarity and structure
- Code example self-containment
- Information architecture
- Section introductions
- Consistency (internal and with related docs)
- Repetition and flow
- Value proposition

**Output:** Saves a markdown report to the repository root as `content-review-[page-name].md`

### vale-linter
Runs the Vale prose linter on CircleCI documentation files to identify and fix style errors, then creates pull requests for review.

### monthly-docs-report
A skill the CircleCI docs team use to create a newsletter each month to showcase notable additions and improvements.

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
ln -s "$(pwd)/skills/vale-linter" ~/.claude/skills/vale-linter
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
3. Generate a prioritized report
4. Save the report as `content-review-[page-name].md` in the repo root

### vale-linter

**Automatic triggering:**
- "Fix vale errors in [file or directory]"
- "Run vale on [file] and create a PR"

**Explicit invocation:**
```
/vale-linter docs/path/to/file.adoc
```

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
- CircleCI Documentation Style Guide: `AGENTS.md` in this repository
