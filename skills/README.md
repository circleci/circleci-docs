# CircleCI Documentation Skills

This directory holds the skills for working on CircleCI documentation. A skill is a reusable `SKILL.md` prompt for one task.

Skills live in two places:

- `skills/`: contributor skills. Anyone working in this repo, inside or outside CircleCI, should use them. `AGENTS.md` lists them, and Claude Code loads them automatically from `.claude/skills/`, which holds symlinks to these directories. No install step is needed.
- `skills/team/`: skills for the docs team's internal workflows. Contributors don't need them, and `AGENTS.md` doesn't list them.

## Contributor skills

| Skill | Use it to |
|---|---|
| `partials` | Find, insert, or create shared partials and examples. |
| `vale-linter` | Run Vale and fix style errors. |

## Team skills

| Skill | Use it to |
|---|---|
| `team/content-review` | Review a single docs page for quality and style. |
| `team/contributor-pr-review` | Review a contributor's pull request. Uses `content-review` and `AGENTS.md`. |
| `team/kapa-docs-review` | Review docs bot conversations for content gaps. |
| `team/monthly-docs-report` | Build the monthly docs team report. |

### content-review (team)
Reviews CircleCI documentation pages for quality, clarity, and adherence to style guidelines. Generates a comprehensive narrative report with prioritized recommendations.

**What it checks:**
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

### contributor-pr-review (team)
Reviews a contributor's pull request that adds a new page or updates existing content. Checks CI results, the PR as a whole, new-page requirements (template, nav, xrefs, images) and changed sections of updated pages, and lists technical claims that need engineering review. Uses the content-review dimensions and `AGENTS.md` rules instead of repeating them.

**Output:** Saves a markdown report to the repository root as `pr-review-[number].md`. It never posts to GitHub.

### vale-linter
Runs the Vale prose linter on CircleCI documentation files to identify and fix style errors, then creates pull requests for review.

### monthly-docs-report (team)
Builds the docs team's monthly update from GitHub, Slack, Linear, Amplitude, Kapa and the Grafana traffic panel. Drafts it locally, then publishes it as a Linear Document on the DOC team after the author approves it.

### partials
Discovers, previews, and inserts reusable AsciiDoc partials and shared code examples with the correct `include::` syntax. Also proposes when new or existing content should become a shared partial or example, then creates it and replaces duplicates after confirmation. Use when writing or editing docs that need shared navigation steps, notes, FAQs, resource tables, config snippets, or other repeated content. Other docs-authoring skills should follow this skill instead of copying reusable content.

### kapa-docs-review (team)
Reviews recent conversations with the CircleCI docs bot (Kapa) to find content gaps, wrong answers, and questions the bot could not answer. Opens docs fix PRs where the correct answer can be verified, and reports feature requests, support article issues, and anything unclear. Needs the Kapa MCP connected.

**Output:** A local report that stays outside the repository, because it contains customer details, and a redacted weekly Linear ticket. The Linear MCP must be connected. `SKILL.md` says where each one goes.

## Using skills

### Contributor skills

- **Claude Code:** open the repo and the skills load. `.claude/skills/` contains relative symlinks, so a clone works without setup. On Windows, enable `core.symlinks` before cloning.
- **Other agents:** `AGENTS.md` has a table of tasks and skills. The agent reads the `SKILL.md` for the matching task. Skills are plain Markdown.

### Team skills

Symlink the ones you need into your user skills directory so they work from any checkout:

```bash
# From the repository root
ln -s "$(pwd)/skills/team/content-review" ~/.claude/skills/content-review
ln -s "$(pwd)/skills/team/contributor-pr-review" ~/.claude/skills/contributor-pr-review
ln -s "$(pwd)/skills/team/kapa-docs-review" ~/.claude/skills/kapa-docs-review
ln -s "$(pwd)/skills/team/monthly-docs-report" ~/.claude/skills/monthly-docs-report
```

A user-level skill with the same name as a repo skill replaces it, so link rather than copy to keep it current.

## Usage

Claude Code automatically triggers skills when relevant, or you can invoke them explicitly:

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
1. Analyze the page across its quality dimensions
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

If you're using a different AI agent, `AGENTS.md` points it at the right `SKILL.md`. You can also:

1. **Read the SKILL.md file** in the skill directory
2. **Copy the instructions** into your conversation with your AI agent
3. **Manually save outputs** if the agent doesn't automatically save files

The skills are written as structured prompts that any capable AI agent should be able to follow.

## Modifying Skills

Skills are defined in `SKILL.md` files using:
- **Frontmatter** (YAML): metadata like name and description
- **Markdown body**: detailed instructions for the AI agent

To modify a skill:
1. Edit the `SKILL.md` file in this directory
2. Test the skill with a sample task

## Contributing

When creating or modifying skills:
- Keep instructions clear and actionable
- Explain the "why" behind requirements, not just "what" to do
- Test with real examples before committing
- Put a skill for contributors in `skills/`. Add a row to the skills table in `AGENTS.md` and a symlink in `.claude/skills/`: `ln -s ../../skills/<name> .claude/skills/<name>`.
- Put a skill for the docs team only in `skills/team/`. Don't list it in `AGENTS.md` or link it from `.claude/skills/`.
- `node scripts/check-skills.js` checks the table and links. CI runs it.
- Link related skills to each other by path. Don't copy content from one skill into another.
- Update this README when adding new skills

## Learn More

- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/claude-code)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- CircleCI Documentation Style Guide: `AGENTS.md` in this repository (agents) and `docs/contributors/modules/docs-style/` (humans). Keep them in step.
