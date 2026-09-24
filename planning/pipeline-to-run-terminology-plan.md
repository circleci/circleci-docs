# Pipeline → Run terminology migration plan

Plan for propagating the V3 entity model (see the glossary, which is already updated) across the docs. Based on a full survey of every `.adoc` file that mentions "pipeline" (206 files; ~2,570 raw occurrences in the guides alone).

## The model we are migrating to

| Entity | Meaning under the new model |
|---|---|
| **Event** | The inbound occurrence: a push, a PR opened, a schedule tick, an API call, a tag push. |
| **Trigger** | A matching rule that watches for events and, when matched, uses a pipeline to initiate a run. |
| **Pipeline** | A **definition only**: specifies where config is stored and where code is checked out from. It does **not** execute. |
| **Run** | The **instance** produced when an event matches a trigger. Groups workflows, carries outcome/status, records pre-workflow errors. This is the thing that "runs" and that users look at to see pass/fail. |

**The core clash:** historically "pipeline" was used for the executing instance ("trigger a pipeline", "the pipeline failed", "scheduled pipeline", "rerun the pipeline"). Under the new model that meaning is now **run**.

## How each usage was classified

- **CLASH** — "pipeline" means the running instance → should become **run**. The bulk of the edit work.
- **DEFINITION-OK** — already means the definition / config source. Keep.
- **IDENTIFIER** — a technical string that **cannot** change. Keep. See constraints below.
- **UI-BRIDGE** — references the web app "Pipelines" label. Keep until the UI itself is relabelled.
- **AMBIGUOUS / NOT-APPLICABLE** — needs a human call, or is a competitor product / Unix `pipefail`.

---

## 1. Decisions needed BEFORE mass edits

These recur across many files; settle each once so edits stay consistent.

1. **"Pipeline number"** — is the incrementing number now a property of the **run**? Affects `configuration-reference.adoc` (serial-group ordering, L2912–2916), `controlling-serial-execution...` (L48–50, 214, 239, 302), `pipeline-variables.adoc`, deploy `pipeline.number`. Note `pipeline.number` the config expression is an IDENTIFIER regardless.
2. **API-fidelity pages** — the v2 API literally returns `pipeline` objects and has endpoints named `listPipelinesForProject`, `getPipelineById`, `triggerPipeline`. Prose like "List pipelines for a project" straddles concept-rename vs API accuracy. Affects `analyze-pipelines-during-an-incident.adoc`, `api-developers-guide.adoc`, `outbound-webhooks-reference.adoc`. Decide: rename concept prose but keep endpoint/field names, or leave API-descriptive prose verbatim.
3. **"continue a pipeline"** vs the fixed `continuePipeline` endpoint — dynamic-config prose collides with the endpoint name. Decide whether prose becomes "continue a run" while the endpoint stays.
4. **Generic "CI/CD pipeline" marketing phrasing** — hundreds of loose "optimize your pipelines" / "your CI/CD pipeline" usages. Decide a blanket rule (likely: leave the generic industry term alone; only change where it clearly means a CircleCI run).
5. **"pipeline type"** — a defined classification term (GitHub App / GitLab / OAuth pipelines). Confirm this term survives unchanged (it is DEFINITION-OK) so it is not swept up in a rename.
6. **Feature names "Rollback pipeline" / "Deploy pipeline"** — these are UI feature names. Confirm they stay, while prose about *executing* them ("run a rollback pipeline", "the pipeline will execute") becomes "run".
7. **UI-BRIDGE policy** — confirm the rule: keep every reference to the web-app "Pipelines" dashboard/sidebar/button/permission label verbatim until the UI is relabelled, even where it technically shows runs. These are flagged but not edited in this pass.
8. **Anchor IDs & xref targets** — several clashes live inside explicit `[#...]` anchor ids and the section titles other pages `xref` to (e.g. `#why-is-my-scheduled-pipeline-not-running`, `#pipelines-scheduled-to-run-specific-time-of-day`, `#build-forked-prs-using-pipelines`, `triggers-overview.adoc#trigger-a-pipeline-from-a-custom-webhook`, and the `run-a-pipeline-using-the-api` link anchors). Decide whether to rename anchors (requires updating every referring `xref` + adding `:page-aliases:`/redirects) or keep anchor ids stable while only changing visible heading text. Changing visible text without updating the id is allowed in AsciiDoc but leaves an id that no longer matches — decide the convention.

---

## 2. Hard constraints — IDENTIFIERS that must NOT change

Preserve verbatim everywhere:

- **Config expressions:** `pipeline.parameters.*`, `pipeline.values`, `pipeline.git.*`, `pipeline.number`, `pipeline.id`, `pipeline.event.*`, `pipeline.trigger_parameters.*`, `pipeline.trigger_source`, `pipeline.schedule.*`, `pipeline.scheduled_source`, `pipeline.deploy.*`, `pipeline.config_source`, `pipeline.project.*`, `pipeline.integration_source`.
- **Feature names:** "pipeline parameters", "pipeline values".
- **API:** `triggerPipeline`, `triggerPipelineRun`, `getPipelineById`, `getPipelineValuesById`, `listPipelinesForProject`, `listWorkflowsByPipelineId`, `continuePipeline`, and `/pipeline` / `/pipeline/run` paths.
- **CLI:** `circleci pipeline list` (coexists with `run list`).
- **MCP tools:** `run_pipeline`, `get_latest_pipeline_status`, `run_rollback_pipeline`.
- **Env var:** `CIRCLE_PIPELINE_ID`.
- **OpenTelemetry:** the entire `cicd.pipeline.*` / `com.circleci.pipeline.*` semantic-convention namespace + `service.name = "CircleCI Pipelines"` (accounts for the bulk of `open-telemetry-integration.adoc`).
- **OIDC claim keys:** `oidc.circleci.com/pipeline-definition-id`, `oidc.circleci.com/pipeline-id`.
- **Webhook JSON:** the `pipeline` object key in payload schemas.
- **Misc literals:** GitLab deploy-key name `circleci-pipeline-triggers`; `app.circleci.com/pipelines/...` URLs; image asset filenames (e.g. `insights-pipeline.png`, `cross-repo-pipeline-*.png`); page aliases (`scheduled-pipelines.adoc`, etc.).
- **Not applicable:** Unix `pipefail`; competitor products (AWS CodePipeline, Azure DevOps Pipelines, Buildkite `.pipeline.yml`); `service.pipelines.*` in server values.

---

## 3. Work areas, priority-ordered

### P1 — Concept & trigger core (orchestrate)
Highest conceptual leverage; everything else references these.

| File | Notes |
|---|---|
| `orchestrate/pipelines.adoc` | The Pipelines concept page. ~10 CLASH (states, "orchestrate execution", "can be triggered"). Bulk is DEFINITION-OK. Align this first — it is the canonical page. |
| `orchestrate/triggers-overview.adoc` | **Heaviest** (~28 CLASH). "trigger a pipeline" / "pipeline running on dashboard" throughout. |
| `orchestrate/github-trigger-event-options.adoc` | ~30 CLASH (L49–63 bullet list) + two off-model *definitional* sentences (L14, L47) needing rewrite, not word-swap. |
| `orchestrate/gitlab-trigger-options.adoc` | "Pipelines start when…" → runs. |
| `orchestrate/set-up-triggers.adoc` | ~12 CLASH; strong DEFINITION-OK model at L8. |
| `orchestrate/custom-webhooks.adoc` | ~14 CLASH. |
| `orchestrate/set-up-cross-repo-triggers-for-library-consumers.adoc` | ~16 CLASH incl. **two mermaid nodes labelled `Pipeline`** → `Run`. |
| `orchestrate/schedule-triggers.adoc`, `schedule-triggers-with-multiple-workflows.adoc`, `set-a-nightly-schedule-trigger.adoc`, `migrate-scheduled-workflows-to-schedule-triggers.adoc` | "scheduled pipeline" → scheduled run. |
| `orchestrate/using-dynamic-configuration.adoc`, `dynamic-config.adoc` | Many "continue a/the pipeline" — see decision #3. |
| `orchestrate/workflows.adoc` | ~10 CLASH (scheduled pipelines, rerun, pipeline processing). |
| `orchestrate/pause-pipelines-during-an-incident.adoc`, `skip-build.adoc`, `analyze-pipelines-during-an-incident.adoc` | Incident pages; **titles** contain "pipelines". `analyze-` is API-fidelity sensitive (decision #2). |
| `orchestrate/controlling-serial-execution-across-your-organization.adoc` | "pipeline number" (decision #1) + UI-BRIDGE. |
| `orchestrate/orchestration-cookbook.adoc`, `set-up-multiple-configuration-files-for-a-project.adoc`, `how-to-override-config.adoc`, `automatic-reruns.adoc`, `using-branch-filters.adoc`, `jobs-steps.adoc` | Lighter CLASH. |
| `orchestrate/pipeline-variables.adoc`, `selecting-a-workflow-to-run-using-pipeline-parameters.adoc` | Almost entirely IDENTIFIER; low edit volume but hard constraints. L13 "triggering a new run of a pipeline" is a good wording template. |

### P2 — Onboarding & tutorials (new-user comprehension)
Where the old meaning is most entrenched and first impressions form.

| File | CLASH count |
|---|---|
| `getting-started/getting-started.adoc` | 7 ("passing pipeline", "your first pipeline") |
| `getting-started/create-project.adoc` | 7 ("run your pipeline", "see your pipeline on the dashboard") |
| `getting-started/config-intro.adoc` | 4 |
| `getting-started/slack-orb-tutorial.adoc` | 5 |
| `getting-started/config-editor.adoc`, `introduction-to-yaml-configurations.adoc`, `first-steps.adoc` | 1 each |
| `getting-started/language-{go,javascript,python}.adoc` | UI-BRIDGE link only |
| `about-circleci/introduction-to-the-circleci-web-app.adoc` | Largest match body but mostly UI-BRIDGE; ~6 genuine CLASH (L10, 127, 133, 135, 137, 319) + "pipeline type" ambiguity |
| `about-circleci/concepts.adoc` | **Already updated** — use as template |

### P3 — Config policies (dense, self-contained CLASH cluster)
~25 CLASH across 4 files, almost all "when pipelines are triggered" / "pipeline … will fail to trigger" / "policy pipeline running".

- `config-policies/manage-contexts-with-config-policies.adoc` (heaviest, ~10)
- `config-policies/config-policy-management-overview.adoc`
- `config-policies/create-and-manage-config-policies.adoc`
- `config-policies/config-policies-for-self-hosted-runner.adoc`
- `config-policies/use-the-cli-for-config-and-policy-development.adoc`

### P4 — Deploy
Feature names ("Rollback/Deploy pipeline") stay (decision #6); execution prose changes.

- `deploy/set-up-rollbacks.adoc`, `set-up-deploys.adoc` — internally split; set the pattern others inherit. Fix "Run a … pipeline" headings + "when the pipeline was triggered" comments.
- `deploy/deploy-a-component.adoc`, `rollback-a-deployment.adoc` — sharpest clashes ("the … pipeline will execute and perform the operation").
- `deploy/deployment-overview.adoc`, `configure-deploy-markers.adoc`, `environment-hierarchy-and-version-promotion.adoc` — "the CI/CD pipelines that triggered them" (resolve consistently).
- ~15 deploy-target how-tos (`deploy-to-*`, `ecs-ecr`, etc.) — **low effort**, almost all DEFINITION-OK boilerplate; only stray lines (`deploy-over-ssh.adoc` L15 UI-BRIDGE, `deploy-android-applications.adoc` L353).

### P5 — Toolkit & integration
- `toolkit/vs-code-extension-overview.adoc` — **~14 CLASH** (unversioned-config execution) + heavy UI-BRIDGE.
- `toolkit/get-started-with-the-vs-code-extension.adoc`, `how-to-find-ids.adoc`, `chunk-setup-and-overview.adoc` — UI-BRIDGE-heavy + isolated CLASH.
- `toolkit/api-developers-guide.adoc`, `api-intro.adoc`, `using-the-circleci-mcp-server.adoc` — CLASH in prose, endpoints/tool names are IDENTIFIER.
- `integration/using-the-circleci-github-app-in-an-oauth-org.adoc` (6 CLASH), `version-control-system-integration-overview.adoc`, `github-enterprise-server-integration.adoc`, `status-updates.adoc` (all 3), `status-badges.adoc`, `enable-checks.adoc`, `webhooks-airtable.adoc`, `notifications.adoc`, `oss.adoc`.
- `integration/open-telemetry-integration.adoc` — mostly IDENTIFIER (`cicd.pipeline.*`); only L3–5 prose + the "PR/branch/tag pipelines" span-attribute pattern (~24, AMBIGUOUS) to review.
- `integration/datadog-integration.adoc` — external Datadog UI labels (keep).

### P6 — Feature docs (test / optimize / execution-managed / insights)
- **test:** `test.adoc`, `rerun-failed-tests.adoc`, `set-up-test-impact-analysis.adoc` (+ `pipeline.git.branch` IDENTIFIERs), `getting-started-with-smarter-testing.adoc`, evals pages ("the pipeline fails" → run).
- **optimize:** `persist-data.adoc`, `optimizations.adoc`, `artifacts.adoc`, `parallelism-faster-jobs.adoc` (its title "…Speed up Your Pipelines" drives 9 xref hits in `rerun-failed-tests.adoc` — one decision).
- **execution-managed:** `ssh-access-jobs.adoc`, `using-docker.adoc`, `circleci-images.adoc`.
- **insights:** "pipeline executions" / "pipeline duration" as a metric grain → run (`insights.adoc`, `insights-tests.adoc`, `project-usage-dashboard.adoc`). `insights-glossary.adoc` already conforms — reference model.

### P7 — Reference, security, permissions, plans, orbs
- `reference/configuration-reference.adoc` — handful of true CLASH inside a large IDENTIFIER body; edit surgically.
- `reference/outbound-webhooks-reference.adoc` (L174 legacy definition), `variables.adoc`.
- `security/contexts.adoc` (mostly IDENTIFIER expression-restrictions), `inject-environment-variables-with-api.adoc`, `ip-ranges.adoc`, `openid-connect-tokens.adoc` (run-sense prose, claim-keys stay), `stop-building-a-project-on-circleci.adoc`.
- `plans-pricing/prevent-unregistered-users-from-spending-credits.adoc`, `user-types-and-registration.adoc`.
- `permissions-authentication/roles-and-permissions-overview.adoc` (permission **labels** — UI-BRIDGE), `users-organizations-and-integrations-guide.adoc` (mostly already aligned; L422/L923/L924 to reconcile), `openid-connect-tokens.adoc`.
- **orbs:** `orb-concepts.adoc`, `create-an-inline-orb.adoc`, `create-test-and-publish-a-registry-orb.adoc`, `create-test-and-use-url-orbs.adoc`, `testing-orbs.adoc`, `managing-url-orbs-allow-lists.adoc` — scattered "trigger a pipeline" CLASH; orb-tools "pipeline" is DEFINITION-OK.

### P1.5 — Shared partials (high-leverage — surveyed; edit alongside P1)
These `include::`d snippets propagate into many pages, so fix them early and once. `docs/root` is clean; server-admin partials are covered under P8.

| File | Notes |
|---|---|
| `ROOT/partials/pipelines-and-triggers/pipeline-values.adoc` | **Highest leverage.** 100+ untouchable `pipeline.*` config identifiers + ~12 prose CLASH (L347, 373, 383, 393, 414, 422, 432, 565, 278 — "the pipeline was triggered" / "currently running pipeline") + AMBIGUOUS value descriptions for `pipeline.id` (L25) and `pipeline.number` (L37) that hinge on **decision #1**. Needs careful human review, not a sweep. |
| `ROOT/partials/pipelines-and-triggers/set-up-schedule-trigger.adoc` | Split DEFINITION-OK "select the pipeline to run" (keep) vs CLASH "when triggering the pipeline" (L17, 67, 87 → run). |
| `ROOT/partials/pipelines-and-triggers/custom-webhook-setup.adoc` | "pipeline set up" (keep) vs "run pipelines on events" (L8 → run). |
| `ROOT/partials/tips/trigger-pipeline-with-parameters.adoc` | All 4 lines CLASH (link text "Trigger a Pipeline…"); anchors already say `run`. |
| `ROOT/partials/faq/pipelines-faq-snip.adoc` | Mixed: `pipeline parameters`/`continuePipeline` IDENTIFIERs + L4/L14 continuation prose needing a **true rewrite**. |
| `ROOT/partials/faq/{schedule-trigger,workflows,dynamic-configuration,orb-author,billing}-faq-snip.adoc` | Scattered "scheduled/failing pipeline" CLASH; some inside anchor ids (decision #8). |
| `ROOT/partials/troubleshoot/pipelines-troubleshoot-snip.adoc` | "scheduled pipeline not running" (L17/19) + anchor id (decision #8). |
| `ROOT/partials/app-navigation/steps-to-job.adoc` | "locate your pipeline from the list … status" → run. |
| `ROOT/partials/create-project/steps-up-to-pipeline.adoc` | L14 "Pipelines define the executable commands…" **directly contradicts** the model — needs a rewrite, not a swap. |

`ROOT/partials/{tips/check-github-type,notes/standalone-unsupported,orbs/orb-type-comparison,using-expressions/env-vars-in-conditional-caveat,app-navigation/steps-to-pipeline-definition-id}.adoc` — DEFINITION-OK / IDENTIFIER only; no action.

### P8 — Server admin (light)
Latest (4.10): ~15 refs across 4 files; a few CLASH in `circleci-server-overview.adoc` (L296, 337, 338), rest are component/table labels. Versions 4.7–4.9 mirror this. Low priority; decide whether to touch old versions at all.

---

## 4. Survey coverage

- **`docs/guides/modules/ROOT/partials/`** — surveyed; findings folded into **P1.5** above. (The faq snippets included by `reference/faq.adoc` live here.)
- **`docs/root/`** module — checked, no "pipeline" usages.
- **Server-admin partials** — `values.adoc` / `phase-3.adoc` across 4.7–4.10; covered under **P8** (OTel `service.pipelines.*` keys are NOT-APPLICABLE).
- Remaining: confirm no non-`.adoc` surfaces (nav titles are IDENTIFIER; page aliases already catalogued).

---

## 5. Canonical reference files (already model-aligned — copy their patterns)

- `about-circleci/concepts.adoc` (Pipelines / Runs / Triggers / Events sections)
- `reference/glossary.adoc`
- `toolkit/cli-migration-guide.adoc` (explicitly Pipeline = definition, Run = instance)
- `insights/insights-glossary.adoc` (uses "runs" / "executions")
- `migrate/migrating-from-teamcity.adoc` L95 (clean definition-sense usage)

---

## 6. Suggested execution approach

1. Lock the seven decisions in section 1 (especially UI-BRIDGE policy, "pipeline number", API-fidelity prose).
2. Do the **survey-gap pass** (section 4) so partials/examples are in scope.
3. Edit in priority order P1 → P7, one area per PR for reviewable diffs. Within each file: apply CLASH → run, leave IDENTIFIER/UI-BRIDGE, resolve AMBIGUOUS per the section-1 rules.
4. Treat **titles, headings, and mermaid node labels** as first-class — several page titles ("Analyze/Pause pipelines during an incident", "Pause or block new pipelines") contain the clash and will need `:page-aliases:` for any renamed anchors.
5. Hold UI-BRIDGE edits for a coordinated pass once the web app relabels "Pipelines".
6. Re-run a targeted grep after each area to confirm no IDENTIFIER was swept up.
