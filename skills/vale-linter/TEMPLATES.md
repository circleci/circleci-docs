# Vale Linter Templates

## Commit Message

```
Fix Vale errors in <filename>

Resolved the following Vale errors:
- [List specific errors fixed]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## PR Body

```markdown
## Summary
This PR fixes Vale error-level issues in `<filename>`.

## Errors Fixed
- **Line X**: [Rule name] - [Description]
- **Line Y**: [Rule name] - [Description]

## Verification
Ran Vale after fixes — [No errors remaining / X errors could not be auto-fixed].

## Notes
- Only error-level issues were addressed
- Warnings and suggestions were left for human review
- Changes preserve existing AsciiDoc structure

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Summary Report

```
Vale Error Fixing Summary
========================

Files processed: N
PRs created: N
Files with no errors: N

Pull Requests:
1. PR #NNN: Fix Vale errors in <filename>
   - Branch: vale-fix-<name>-<hash>
   - Errors fixed: N
   - URL: <url>

Files with no errors:
- <path>
```
