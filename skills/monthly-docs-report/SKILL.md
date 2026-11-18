---
name: monthly-docs-report
description: Generate the monthly docs team report and publish it as a Linear Document on the DOC team. Pulls merged PRs and contributors from GitHub, themes and cross-team work from the author's Slack messages, page views from Amplitude, docs bot sources from Kapa, and visitor buckets from the Grafana traffic panel. Use when the user asks for the monthly docs report, monthly docs update, docs newsletter, or a summary of docs work for a month.
---

# Monthly docs report

Builds the monthly docs update, drafts it locally for the author to review, and publishes it as a Linear Document on the DOC team once the author approves it. Linear documents don't expire, and anyone in the company can open documents on the DOC team.

## Local files

These live in `~/docs-reports/`, outside this repo, because the repo is public:

- `docs-traffic-queries.txt`: the CloudWatch queries behind the Grafana panel, the old-Chrome cutoff, and monthly housekeeping steps
- `contributor-names.txt`: names to use for GitHub logins that have no display name
- `sources.txt`: the Amplitude project, Grafana dashboard and CloudWatch log group the report reads
- `traffic-history.csv`: one row of Grafana bucket totals per month, if it exists (DOC-370)
- `YYYY-MM-docs-update.md`: each month's draft

## Before you start

1. Ask for the month if the user didn't give one. Default to the previous calendar month.
2. Check each source can be reached. If one can't, say so up front and carry on without it. Never invent a number for a missing source.

| Source | Tool | Needed for |
| --- | --- | --- |
| GitHub | `gh` and `git` in this repo | Work shipped, contributors |
| Slack | Slack MCP (`slack_search_public_and_private`) | Themes, work with other teams |
| Linear | Linear MCP | Coming next, publishing |
| Amplitude | Amplitude MCP, project `Production` | Page views, top pages |
| Kapa | Kapa MCP (`get_source_usage`) | Top bot sources |
| Grafana | Screenshot from the author | Visitor buckets |

If an MCP isn't connected, ask the user to run `/mcp` and sign in. The claude.ai connectors are listed in the claude.ai section of `/mcp`.

3. Ask the author for the Grafana screenshots now, so they're ready by the time you need them. See section 6 for what to ask for.
4. Ask the author what's planned for next month. Linear alone gives an incomplete "Coming next".

Work out these dates once and reuse them:

- `START`: first day of the month, `YYYY-MM-01`
- `END`: last day of the month, `YYYY-MM-DD`
- The same two dates as Unix epoch seconds in UTC, for Amplitude and Slack
- The previous month's `START` and `END`, for month-over-month comparisons

**Run the collection in parallel.** GitHub (section 1), Slack (section 2) and the Kapa drill-down (section 5) each take many calls. Hand each one to a subagent with the instructions from its section, and query Amplitude and Linear yourself while they run.

## 1. GitHub: what shipped

Count work by the date it merged to `main`, never by commit date or author date.

```bash
# Every PR merged to main in the month, with author and files
gh pr list --repo circleci/circleci-docs --state merged --base main \
  --search "merged:${START}..${END}" --limit 500 \
  --json number,title,author,mergedAt,files,labels > ~/docs-reports/YYYY-MM-merged.json
```

From that list:

- **Exclude dependency PRs.** Drop PRs by `renovate`, `dependabot`, `circleci-foundation-ops` (automated repo fixes) or any `[bot]` author, and titles that match `Update dependency|chore\(deps\)|fix\(deps\)|Bump |Update Node.js|Update cimg/|Update module|feat: (add|update) Xcode`. A human PR whose title starts with "Bump" but isn't a dependency update, such as a cache key fix, still counts.
- **PRs merged:** the count after exclusions. Compare with the previous month.
- **Contributors:** unique human authors.
- **Credit by commits, not only by PR author.** On large PRs, check who wrote the commits with `gh api repos/circleci/circleci-docs/pulls/<n>/commits --paginate`. Credit everyone with a substantial share. In October 2026, a PR opened by a PM had 28 of its 42 commits from the docs team.
- **New pages:** files under `docs/**/pages/**/*.adoc` that a PR added. `gh pr list --json files` doesn't include file status, so use `gh api repos/circleci/circleci-docs/pulls/<n>/files --paginate` and keep files whose status is `added`. Use the page's `= Title` line as its name. Check that the path didn't exist on `main` before the month started. Moves, renames and pages that were renamed and then renamed back aren't new pages.
- **Display names:** look up logins without a GitHub display name in `~/docs-reports/contributor-names.txt`. Ask the author about any that aren't there, and add their answers to the file.
- **Reference updates:** PRs that touch `docs/reference/modules/ROOT/pages/configuration-reference.adoc`.
- **Non-docs-team contributors:** call these out by name in the related item. The report exists partly to credit engineers and PMs who write docs.

Read each PR's title and description to group them. For a large PR, also read its diff summary (`gh pr view <n> --json files,body`).

Turn display names into Linear mentions where the person has a Linear account (`list_users`), so they get notified. Otherwise use their name.

## 2. Slack: themes and work with other teams

Search only the author's own messages. Their Slack user ID is in the Slack tool description ("Current logged in user's user_id").

```
filters: from:<@USER_ID> after:<day before START> before:<day after END>
```

Page through every result with the cursor. Use `response_format: concise` and `include_context: false` to keep the volume manageable. October 2026 had about 360 messages, which took 19 pages.

Pull out:

- **Themes:** the three to five topics that took the most conversation, such as a launch, a migration, or a recurring customer question.
- **Work with other teams:** reviews of other teams' docs or specs, help given in support or engineering channels, decisions made, process changes.
- **Who the docs team worked with:** teams, not individuals, unless the author names them.

Privacy rules, because the report goes company-wide:

- Summarize. Never quote a DM, a group DM or a private channel.
- Never name customers, and never include anything from a private channel the wider company couldn't see.
- Mark every Slack-derived line in the draft with `[slack]`, so the author can check them. Remove the markers before publishing.

Slack snippets are short, so some items will be wrong or minor. If the author doesn't recognize an item, remove it rather than explain it.

## 3. Linear: coming next

List DOC team issues that are in progress, or planned for next month:

- `list_issues` with `team: DOC`, `state: started`
- `list_issues` with `team: DOC`, `state: unstarted`, plus any with a due date next month

Combine these with what the author said is planned. Summarize them as three to five upcoming projects in plain words. For each item, search `list_issues` for an existing issue and link it. Don't list routine work the author has already shipped or is just finishing.

## 4. Amplitude: human readers

Use the Amplitude project and event listed in `~/docs-reports/sources.txt`. Use UTC.

Run these queries with `query_amplitude_data` and the typed `chart` parameter:

1. **Top 11 pages:** `measured_as: event_totals`, `group_by` the event property `page`, `interval: month`, `groupByLimit: 11`. The 11th page is the replacement if one of the top 10 turns out to be a bot burst.
2. **Page views and unique readers:** one query with `measured_as: formula` and the formula `TOTALS(A); UNIQUES(A)`, `interval: month`, covering this month and the previous one. Each month's interval value is that month's figure.

**Check the top pages for bot bursts.** For each top page, run the same query with `interval: day` and a `where` filter on `page`, measuring both totals and uniques. If most of a page's views arrive within one to three days and views equal unique visitors, it's automated traffic that ran JavaScript. Leave it out of the top 10, take the next page instead, and add a one-line note under the table. In October 2026, `/2.0/hello-world-windows/` got 2,677 views this way on 9 to 11 October.

How to describe these numbers: `dd_docs_page` only fires after the visitor accepts marketing cookies (`ui/src/partials/head-scripts.hbs`). It counts humans who loaded JavaScript and opted in, which is fewer than all human readers. The two concepts pages listed in `trackingExcludedPaths` in the same file are never tracked.

## 5. Kapa: what the docs bot relies on

Run `list_projects` to get the External project's id. Then call `get_source_usage` with `START` and `END`.

The results are a tree: site, then section, then page. Pass a non-leaf `node_url` as `url_path` to go a level down, starting with `circleci.com/docs`, then `circleci.com/docs/guides`, `reference`, `api` and `runner`, and every guides section below that. Skip a branch once its total `answer_count` is below the current 10th-place page. This takes about 20 calls, so hand it to a subagent.

Work out source shares from the top level. Docs pages are `circleci.com/docs` as a share of every source's `count`. Don't use the `circleci.com` share, because it includes the blog and changelog.

Report the top 10 docs pages by number of answers that cite them. Show ties as ties. If a page has a high rate of uncertain or downvoted answers, mention it in one line. Don't name customers or quote questions.

## 6. Grafana: who visits

The Grafana traffic panel and the CloudWatch logs behind it are listed in `~/docs-reports/sources.txt`. The queries are in `~/docs-reports/docs-traffic-queries.txt`. Logs are kept for 90 days.

**Before asking for numbers, check the queries are current.** The old-Chrome cutoff in queries E, F and G needs raising about once a month. The queries file says how. If the author's panel is behind the file, ask them to paste in the changed queries.

Ask the author for two screenshots:

1. **Monthly totals.** In the panel editor, add the transformation **Reduce**, set **Mode** to **Series to rows** and **Calculations** to **Total**, set the time picker's time zone to UTC, and set the range to the month. That gives one row per bucket. Without the transformation, the table shows one row per hour. If they saved this as a second panel, "Monthly totals", they only change the date range.
2. **Who is in likely_human.** Run the DIAGNOSTIC query from the queries file over the month, in Explore or a separate panel, never in the totals panel. Its hits overlap `likely_human`, so it would double-count there.

From the diagnostic, check how concentrated `likely_human` is. Real people spread across many browser versions. If a few user agents make up a large share of the bucket, find out why. Look especially for old browser versions, since Chrome updates itself about every four weeks. If any user agents should move to `suspected_scrapers`, update the queries file and ask the author to re-run the month before you report it. In October 2026, 25 user agents made 60% of the bucket, and Chrome 108 to 133 alone made 35%.

Report each bucket's monthly total and its share of all page requests, plus the markdown request count. The markdown requests are also counted in the other buckets, so say so. Check that the bucket totals add up to the same total as last month's method. If they don't, a query overlaps or drops traffic.

What the buckets can and can't tell you:

- The logs count page requests only (`Accept: text/html` or `text/markdown`), not assets.
- `likely_human` is an upper bound. Agents and scrapers that copy a current browser land in it.
- The logs don't include IP addresses or status codes, so redirects and 404s count as page views.
- Compare `likely_human` with Amplitude page views. The real number of human page views is between the two.

If `~/docs-reports/traffic-history.csv` exists, append this month's row.

## 7. Draft and review

Write the draft to `~/docs-reports/YYYY-MM-docs-update.md` using the template below.

Then publish a private preview with the Artifact tool, so the author can comment on it inline:

1. Build an HTML page that embeds the markdown in a `<script type="text/markdown">` block and renders it with `marked` from cdnjs. Show `[slack]` markers as a visible tag, and HTML comments as notes for the author.
2. Publish it, and tell the author to select text, comment, and use **Send to Claude**.
3. For each comment: edit the markdown file, regenerate the page from the file, republish to the same path, reply in the thread with what changed, and resolve the thread.

Keep the markdown file as the source. Never edit only the HTML.

Tell the author what's still missing or uncertain, then wait for their approval.

## 8. Publish

Only after the author approves:

1. Make a final copy of the markdown. In it, remove every `[slack]` marker and HTML comment, drop the H1 (the Linear document title replaces it), and turn every `#NNNNN` PR number into a link to `https://github.com/circleci/circleci-docs/pull/NNNNN`. Linear shows these links as PR cards.
2. Keep sentences under 26 words. The author's prose check rejects longer ones when you save to Linear.
3. Create the document with `save_document`, `team: DOC`, title `Docs update: <Month YYYY>`. Before creating, check with `list_documents` that no document with that title exists. If one does, update it with `id` instead.
4. If the author has a Linear issue for this month's report, link the document from it.
5. Give the author the document link and a one-line Slack post they can share, for example: `The <Month> docs update is up in Linear: <link>`.

## Template

```markdown
Welcome to the docs team's monthly update. It covers the main changes to the public docs site, what's coming next, and a few numbers on contributions and readers. Send feedback in #documentation.

## The month in brief

<Three or four short paragraphs. Lead with the largest piece of work, what it is and why we did it: what it does for readers and for the team. Link the Linear project or issue it builds on. Then the other main themes, including what other teams contributed.>

## At a glance

| | <Month> | <Previous month> |
| --- | --- | --- |
| PRs merged (excluding dependency updates) | N | N |
| Contributors | N | N |
| New pages | N | N |
| Page views (Amplitude) | N | N |
| Unique readers (Amplitude) | N | N |
| Page requests from humans (likely, Grafana)* | N | N |
| Page requests from AI agents acting for a person (Grafana) | N | N |
| Markdown page requests (Grafana) | N | N |
| `llms.txt` requests (Grafana) | N | N |

\* We're still improving how we distinguish people from automated traffic. The likely-human figure is too high, because agents and scrapers that copy a current browser are still counted in it. More under Readers below.

## New pages

- **<Page title>** (#PR): <contributor>. <One sentence on what it covers.>

## Major updates

- **<Topic>** (#PR, #PR): <contributors>
  - <What changed for readers>

## Reference updates

- **<What changed in the reference>** (#PR): <contributor>. <One sentence.>

## Infrastructure and tooling

- **<Change>** (#PR): <contributor>. <One sentence.>

## Working with other teams

<Short paragraphs grouped by the month's main themes, drawn from Slack: reviews, help given to other teams, decisions and process changes. Don't repeat what "The month in brief" already says.>

## Coming next

- **<Project>** ([DOC-NNN](link)): <one sentence>

## Readers

### Top pages (Amplitude)

Counts humans who opened the page in a browser and accepted analytics cookies.

| # | Page | Views |
| --- | --- | --- |
| 1 | `/path/` | N |

<One line on any page left out as a bot burst.>

### Top pages cited by the docs bot (Kapa)

| # | Page | Answers citing it |
| --- | --- | --- |
| 1 | `/path/` | N |

<One line on source shares: docs pages, support articles, other.>

### Who visits the site (Grafana)

Page requests to the docs site in <Month>, grouped by the user agent that sent them. Asset requests such as images and stylesheets aren't counted.

| Bucket | <Month> | Share | <Previous month> |
| --- | --- | --- | --- |
| Crawlers (search and AI training) | N | N% | N |
| Suspected scrapers | N | N% | N |
| Other bots | N | N% | N |
| Likely human | N | N% | N |
| AI agents (fetching for a person) | N | N% | N |
| Internal tools | N | N% | N |
| Unclassified | N | N% | N |
| **Total** | **N** | | **N** |

Requests for the markdown version of a page: N. These come from agents and indexers, and are also counted in the buckets above.

<Two or three sentences on what changed since last month, including any change to the classification.> "Likely human" is still an upper bound. Compare it with Amplitude's page views: the real number of human page views is somewhere between the two.
```

## Writing guidelines

- State what changed. No superlatives such as "comprehensive", "massive" or "game-changing", and don't rank contributors.
- Follow `AGENTS.md` for voice. Don't use em dashes: use a colon, or split the sentence.
- Write for people across the company, not the docs team. Major updates bullets say what changed for readers. Leave out implementation detail, such as how xrefs were repointed, how sections were merged in the nav, or exact wording changes.
- Give big, ongoing pieces of work more weight than their PR count suggests, such as a new process that will drive many future fixes. Put them in Major updates, and say what to expect from them under Coming next.
- One PR goes in one section only. Group runs of small PRs, such as a Vale cleanup, into one item.
- If a PR doesn't fit any section, list it for the author and suggest a new section name. Don't drop it.
- Use the term the docs use for a feature, and use it the same way throughout.
- Write numbers with thousands separators.
- Don't frame the work by where it happened, as in "this didn't happen in GitHub". Describe the work itself.
- Say "reviewed" when other teams reviewed something. Don't call it a "session" or "meeting" unless there was one.

## Empty or partial months

- If a source failed, keep its section and write one line saying the data wasn't available and why. Don't remove the section silently.
- If a previous-month figure doesn't exist, for example because a query changed, write "n/a" and say why in the text.
- If no substantive PRs merged, say so in "The month in brief" and keep the readers section.
