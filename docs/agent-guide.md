# CircleCI docs for agents

This file is for AI coding agents and assistants working with a human on CircleCI, and for the humans directing them. It is published at `https://circleci.com/docs/AGENTS.md`.

For a human-oriented starting point, see the [Quickstart guide](https://circleci.com/docs/guides/getting-started/getting-started/). For the full documentation structure, see [`llms.txt`](https://circleci.com/docs/llms.txt).

CircleCI ships as two platforms with different feature sets:

- **Cloud** — circleci.com. Has API v3, CLI v1, Schedule Triggers, and MCP servers.
- **Server** — a self-hosted installation. Has none of those. Use API v2/v1.1, CLI v0, and `triggers.schedule` blocks instead.

Confirm which platform you are working against before applying any default below. If you don't know, ask, or check whether the user's CircleCI URL is `circleci.com` or a private hostname.

## Get set up

### Cloud

Before starting onboarding or project setup, install CLI v1, then enable the CLI MCP server, so the rest of the session runs through MCP tools instead of raw CLI calls. `circleci onboard` and `circleci auth signup` both hand off to a browser to complete signup — add `--no-browser` if you are running headless. See the [CircleCI CLI guide](https://circleci.com/docs/guides/toolkit/circleci-cli/) for installation, authentication, project linking, and onboarding, and [Connecting to the CircleCI CLI MCP](https://circleci.com/docs/guides/toolkit/connecting-to-the-circleci-cli-mcp/) for enabling the MCP server.

### Server

There is no self-serve signup. Accounts and orgs are provisioned by the Server administrator — direct the human to them, or to the [CircleCI Server overview](https://circleci.com/docs/server-admin/latest/overview/circleci-server-overview/).

CLI v1 does not work against a Server host. Install CLI v0 instead — it installs as a separate `circleci-v0` binary, so it can coexist with a CLI v1 `circleci` install. See [Install CLI v0 for CircleCI Server](https://circleci.com/docs/guides/toolkit/circleci-cli/#install-cli-v0-for-circleci-server) for install methods and `circleci-v0 setup`.

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
- Use CLI v0. CLI v1 is Cloud only. See [Get set up](#get-set-up) above for install instructions.
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

To convert existing scheduled workflows on Cloud, see [Migrate Scheduled Workflows to Schedule Triggers](https://circleci.com/docs/guides/orchestrate/migrate-scheduled-workflows-to-schedule-triggers/). To migrate off the legacy CLI on Cloud, see the [CLI command migration guide](https://circleci.com/docs/guides/toolkit/cli-migration-guide/). Everything else that's deprecated on one platform but required on the other (API version, CLI version, schedule syntax) is covered under [Follow current defaults](#follow-current-defaults) above.
