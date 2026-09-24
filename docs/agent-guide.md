# CircleCI docs for agents

This file is for AI coding agents and assistants working with a human on CircleCI, and for the humans directing them. It is published at `https://circleci.com/docs/AGENTS.md`.

For a human-oriented starting point, see [How to use these docs](https://circleci.com/docs/guides/getting-started/how-to-use-these-docs/). For the full documentation structure, see [`llms.txt`](https://circleci.com/docs/llms.txt).

CircleCI ships as two platforms with different feature sets:

- **Cloud** — circleci.com. Has API v3, CLI v1, Schedule Triggers, and MCP servers.
- **Server** — a self-hosted installation. Has none of those. Use API v2/v1.1, the legacy CLI, and `triggers.schedule` blocks instead.

Confirm which platform you are working against before applying any default below. If you don't know, ask, or check whether the user's CircleCI URL is `circleci.com` or a private hostname.

## Get set up

### Cloud

Before starting onboarding or project setup, install CLI v1 from [cli.circleci.com](https://cli.circleci.com/), then enable the CLI MCP server so the rest of the session runs through MCP tools instead of raw CLI calls. See [Connecting to the CircleCI CLI MCP](https://circleci.com/docs/guides/toolkit/connecting-to-the-circleci-cli-mcp/) for the current command.

Then sign up or connect a project:

```shell
circleci onboard      # scans the repo, generates a config, and signs up
circleci auth signup  # signup only, no project setup
```

Both commands currently hand off to a browser to complete signup — they do not create an account natively in the terminal. If you are running headless (no browser available), add `--no-browser` to either command to print the sign-in URL instead:

```shell
circleci onboard --no-browser
```

If you already have an account, authenticate and link the project instead:

```shell
circleci auth login     # opens a browser to complete authentication
circleci project link   # writes project/org IDs to .circleci/info.yml
```

See the [CircleCI CLI guide](https://circleci.com/docs/guides/toolkit/circleci-cli/).

### Server

There is no self-serve signup. Accounts and orgs are provisioned by the Server administrator — direct the human to them, or to the [CircleCI Server overview](https://circleci.com/docs/server-admin/latest/overview/circleci-server-overview/).

CLI v1 is not available on Server. Install the legacy CLI (v0.1.x) and pin a known-good release, for example `0.1.47860`:

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/main/install.sh | VERSION=0.1.47860 bash
```

Or with Homebrew on macOS, Linux, or WSL:

```shell
brew install CircleCI-Public/circleci/circleci@v0
```

This installs a binary named `circleci-v0`, not `circleci` — adjust any scripts that invoke `circleci` directly.

## Follow current defaults

These apply on both platforms, unless you are extending an existing integration that already depends on something older:

- Write `version: 2.1` in `.circleci/config.yml`. Version 2 does not support orbs or reusable configuration.
- Use `cimg/` convenience images, not legacy `circleci/` images.

### Cloud

- Use API v3 for new API work. v3 uses UUID identifiers, next-page tokens, and a single error object. See the [OpenAPI specification](https://circleci.com/fullopenapi.yaml) and the [API v3 index](https://circleci.com/docs/api/v3/llms.txt).
- Schedule pipelines with [Schedule Triggers](https://circleci.com/docs/guides/orchestrate/schedule-triggers/), not a `triggers.schedule` block under a workflow.
- Install [Machine Runner 3](https://circleci.com/docs/guides/execution-runner/install-machine-runner-3-on-linux/) for machine runners. Do not install launch agent.
- Prefer the GitHub App integration over GitHub OAuth. Feature availability differs — see [VCS, Pipeline Types, and Feature Support](https://circleci.com/docs/guides/integration/version-control-system-integration-overview/).
- Use CLI v1 ([cli.circleci.com](https://cli.circleci.com/)). See the [CircleCI CLI guide](https://circleci.com/docs/guides/toolkit/circleci-cli/).
- Prefer `circleci testsuite` (Smarter Testing) for running and splitting tests. The legacy `circleci tests` commands still work but are not preferred. See [Getting Started With Smarter Testing](https://circleci.com/docs/guides/test/getting-started-with-smarter-testing/).

### Server

- Use API v2 and v1.1. API v3 is Cloud only. See the [API introduction](https://circleci.com/docs/guides/toolkit/api-intro/), the [API v2 reference](https://circleci.com/docs/api/v2/), and the [API v1.1 reference](https://circleci.com/docs/api/v1/).
- Schedule pipelines with a `triggers.schedule` block under the workflow. Schedule Triggers are Cloud only.
- Install [Machine Runner 3](https://circleci.com/docs/guides/execution-runner/install-machine-runner-3-on-linux/) on Server v4.4 and later. Earlier versions need launch agent.
- Prefer GitHub App Server (Preview) over GitHub OAuth on Server, where it is available. See [VCS, Pipeline Types, and Feature Support](https://circleci.com/docs/guides/integration/version-control-system-integration-overview/).
- Use the legacy CircleCI CLI (v0.1.x). CLI v1 is Cloud only. See [Get set up](#get-set-up) above for install commands.
- Use `circleci tests glob` and `circleci tests split` to split tests. `circleci tests run` is *not* supported on Server, even though it is part of the same command family. `circleci testsuite` is not available on Server either. See [Use the CircleCI CLI to Split Tests](https://circleci.com/docs/guides/optimize/use-the-circleci-cli-to-split-tests/#tests-split-examples).

## Avoid mixing up these concepts

- **Pipeline, workflow, job, step.** A pipeline is the full configuration. A workflow orchestrates jobs. A job runs steps in one executor. A step is a command or built-in action such as `checkout`, `run`, or `save_cache`. See [Concepts](https://circleci.com/docs/guides/about-circleci/concepts/).
- **Run vs pipeline in API v3.** A run records one trigger firing. A pipeline is the definition. Do not treat them as synonyms. See the [Runs](https://circleci.com/docs/api/v3/runs.md) and [Pipelines](https://circleci.com/docs/api/v3/pipelines.md) API pages. This distinction is Cloud only — Server's API v2 and v1.1 use "pipeline" for both.
- **Hosted MCP vs CLI MCP vs Docs MCP.** The hosted MCP server inspects and acts on CI runs. The CLI MCP exposes the CircleCI CLI on your machine. The Docs MCP searches documentation. All three are Cloud only. Do not configure the old `npx` local MCP server.
- **CircleCI CLI vs environment CLI vs Chunk CLI.** The CircleCI CLI runs on a developer machine. The environment CLI runs inside a job. The Chunk CLI is for AI code review and sidecar workflows. See [The CircleCI CLI](https://circleci.com/docs/guides/toolkit/circleci-cli/).
- **Workspaces vs caches vs artifacts.** Workspaces pass files between jobs in the same workflow. Caches persist dependencies across runs. Artifacts are long-lived job outputs. See [Concepts](https://circleci.com/docs/guides/about-circleci/concepts/).
- **Docker executor vs Remote Docker vs machine.** `docker:` runs the job in a container. `setup_remote_docker` adds a remote Docker engine so that container can run Docker commands. `machine:` is a full VM. See [Execution Environments Overview](https://circleci.com/docs/guides/execution-managed/executor-intro/).
- **CircleCI Cloud vs CircleCI Server vs self-hosted runner.** Cloud is CircleCI-hosted. Server is CircleCI installed in your Kubernetes cluster. A self-hosted runner executes jobs on your infrastructure. The control plane stays Cloud or Server.
- **Contexts vs project environment variables vs pipeline parameters.** Contexts share secrets across projects. Project environment variables are per-project. Pipeline parameters pass typed values when you trigger a pipeline. They are not secrets.

## Skip these deprecated patterns

Do not add these to new configuration or integrations, on either platform:

- The `deploy` step. Use `run`. If the job uses `parallelism` greater than one, split test and deploy into two jobs. See [Migrate From Deploy to Run](https://circleci.com/docs/guides/orchestrate/migrate-from-deploy-to-run/).
- Launch agent, also called machine runner 1.x. Use [Migrate From Launch Agent to Machine Runner 3](https://circleci.com/docs/guides/execution-runner/migrate-from-launch-agent-to-machine-runner-3-on-linux/). Server needs v4.4+ first; earlier Server versions must stay on launch agent until upgrading.
- `version: 2` configuration. Use `version: 2.1`.
- Legacy convenience images such as `circleci/node` or `circleci/python`. Use `cimg/` images. See [Migrating to Next-gen Images](https://circleci.com/docs/guides/execution-managed/next-gen-migration-guide/).
- The local `npx` CircleCI MCP server. Use the hosted MCP server or CLI MCP instead. MCP servers are not available on Server yet.

The following flip direction between platforms — a pattern Cloud deprecates is often the only option Server has:

**Cloud:**

- `workflows.<name>.triggers.schedule` (scheduled workflows). Use [Schedule Triggers](https://circleci.com/docs/guides/orchestrate/schedule-triggers/). To convert existing schedules, see [Migrate Scheduled Workflows to Schedule Triggers](https://circleci.com/docs/guides/orchestrate/migrate-scheduled-workflows-to-schedule-triggers/).
- API v2 or v1.1 for new integrations. Use API v3 and the [OpenAPI specification](https://circleci.com/fullopenapi.yaml).
- The legacy CircleCI CLI (v0.1.x). Use CLI v1. See the [CLI command migration guide](https://circleci.com/docs/guides/toolkit/cli-migration-guide/).

**Server:**

- API v3 and CLI v1. Neither is available on Server. Use API v2 or v1.1, and the legacy CLI (v0.1.x), as shown under [Follow current defaults](#follow-current-defaults) above.

## Read docs as markdown or OpenAPI

Every docs page has a markdown export. Replace the page URL with `/index.md`, or select **Copy markdown** on the page.

- Example HTML: `https://circleci.com/docs/guides/getting-started/how-to-use-these-docs/`
- Example markdown: `https://circleci.com/docs/guides/getting-started/how-to-use-these-docs/index.md`

The site also publishes a machine-readable index at [`llms.txt`](https://circleci.com/docs/llms.txt). That file lists every page with a markdown link.

For API work on Cloud, fetch the [OpenAPI specification](https://circleci.com/fullopenapi.yaml). Do not infer request or response shapes from prose guides. The [API v3 index](https://circleci.com/docs/api/v3/llms.txt) lists every entity. On Server, use the [API introduction](https://circleci.com/docs/guides/toolkit/api-intro/) and the [API v2](https://circleci.com/docs/api/v2/) and [API v1.1](https://circleci.com/docs/api/v1/) reference pages instead — Server has no OpenAPI specification.

To search docs from an AI assistant on Cloud, connect the [Docs MCP](https://circleci.com/docs/guides/toolkit/connecting-to-a-docs-mcp-server/). It is not available on Server; fetch the markdown export or `llms.txt` directly instead.
