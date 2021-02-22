---
layout: classic-docs
title: "API Reference"
short-title: "API Reference"
description: "Introduction to the CircleCI API"
categories: [getting-started]
order: 1
version:
- Cloud
---

The CircleCI API may be used to make API calls to retrieve detailed information about users, jobs, workflows and pipelines. There are currently two supported API versions:

* [API v1.1 Reference](https://circleci.com/docs/api/v1/)
* [API v2 Reference](https://circleci.com/docs/api/v2/)

API v2 includes several powerful features (e.g. support for pipelines and pipeline parameters) that are unavailable in API v1.1. It is recommended that CircleCI Cloud users migrate their scripts to API v2 stable endpoints as soon as possible. 

CircleCI API v1.1 and portions of API v2 are supported and generally available. CircleCI expects to eventually End-Of-Life (EOL) API v1.1 in favor of API v2 as more API v2 endpoints are announced as stable. Further guidance on when CircleCI API v1.1 will be discontinued will be communicated at a future date.

## Introduction to API v2

CircleCI API v2 enables you to use endpoints with several new features that improve the API experience, in addition to optimizing how you use the API for your jobs. API v2 is currently in active development, therefore, the stability of the API is referred to as "mixed".

The current categories of the API v2 endpoints are:

- Authentication
- Pipeline
- Workflows
- User
- Project
- Job (Preview)
- Insights

**Note:** Portions of the CircleCI API v2 remain under "Preview". Preview endpoints are not yet fully supported or considered generally available. Breaking changes to API v2 Preview endpoints are planned in advance and are announced in the [API v2 breaking changes log](https://github.com/CircleCI-Public/api-preview-docs/blob/master/docs/breaking.md).

## Getting started with the API v2

The CircleCI API v2 is backwards-compatible with previous API versions in the way it identifies your projects using repository name. For instance, if you want to pull information from CircleCI about the GitHub repository https://github.com/CircleCI-Public/circleci-cli you can refer to that in the CircleCI API as `gh/CircleCI-Public/circleci-cli`, which is a "triplet" of the project type, the name of your "organization", and the name of the repository. For the project type you can use `github` or `bitbucket` as well as the shorter forms `gh` or `bb`, which are now supported in API v2. The `organization` is your username or organization name in your version control system.

With API v2, CircleCI is introducing a string representation of the triplet called the `project_slug`, which takes the following form:

`<project_type>/<org_name>/<repo_name>`

The `project_slug` is included in the payload when pulling information about a project as well as when looking up a pipeline or workflow by ID. The `project_slug` can then be used to get information about the project. It is possible in the future the shape of a `project_slug` may change, but in all cases it would be usable as a human-readable identifier for a given project.

### Authentication

The CircleCI API v2 enables users to be authenticated by simply sending your API token as the username of the HTTP request. For example, if you have set `CIRCLECI_TOKEN` in your shell's environment, you could then use `curl` with that token like the example shown below:

`curl -u ${CIRCLECI_TOKEN}: https://circleci.com/api/v2/me`

**Note**, the `:` is included to indicate there is no password.
**Note**, [Project tokens](https://circleci.com/docs/2.0/managing-api-tokens/#creating-a-project-api-token) are currently not supported on API v2.

#### Triggering a pipeline with parameters example

Here is a simple example using `curl` to trigger a pipeline with parameters:

```
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "myparam": "./myspecialdir",
    "myspecialversion": "4.8.2"
  }
}' https://circleci.com/api/v2/project/{project_slug}/pipeline
```

In the above example the `project_slug` would take the form `:vcs/:org/:project`. For example, the project slug `gh/CircleCI-Public/circleci-cli` tells `CircleCI` to use the project found in the GitHub organization CircleCI-Public in the repository named `circleci-cli`.

**IMPORTANT** Pipeline parameters are **not** treated as sensitive data and **must not** be used for sensitive values (secrets). You can find information on using sensitive data correctly in the [Project Settings](https://circleci.com/docs/2.0/settings/) and [Contexts](https://circleci.com/docs/2.0/glossary/#context) guides.

## Changes in endpoints

The CircleCI API v2 release includes several new endpoints, and deprecates some others. The sections below list the endpoints added for this release, in addition to the endpoints that have been removed.

For a complete list of all API v2 endpoints, please refer to the [API v2 Reference Guide](https://circleci.com/docs/api/v2/), which contains a detailed description of each individual endpoint, as well as information on required and optional parameters, HTTP status and error codes, and code samples you may use in your workflows.

### New endpoints

The table below describes the new endpoints that have been added to the CircleCI API for this updated v2 version.

Endpoint       | Description                       
-----------|-------------------------------------------------------
`GET /workflow/:id ` | This endpoint enables users to return an individual Workflow based on the `id` parameter being passed in the request
`GET /workflow/:id/job` | This endoint enables users to retrieve all Jobs associated with a specific workflow, based on its unique `id`.
`GET /project/:project_slug`  | This endpoint enables users to retrieve a specific Project by its unique slug.
`POST /project/:project_slug/pipeline` | This endpoint enables users to retrieve an individual project by its unique slug.
`GET /pipeline/:id` | This endpoint enables users to retrieve an individual pipeline, based on the `id` passed in the request.
`GET /pipeline/:id/config`  | This endpoint enables users to retrieve the configuration of a specific pipeline.
`GET /project/:project_slug/pipelines/[:filter]`  | This endpoint enables users to retrieve the most recent set of pipelines for a Project.
`GET /insights/:project-slug/workflows` | This endpoint enables you to retrieve summary metrics for an individual project's workflow.
`GET /insights/:project-slug/workflows/:workflow-name` | This endpoint enables you to retrieve recent runs for a workflow.
`GET /insights/:project-slug/workflows/:workflow-name/jobs` | This endpoint enables you to retrieve summary metrics for a project workflow's jobs.
`GET /insights/:project-slug/workflows/:workflow-name/jobs/:job-name` | This endpoint enables you to retrieve recent runs of a job within a workflow.

### Deprecated endpoints
{:.no_toc}

For this updated API v2 release, several endpoints have been deprecated, which are listed in the table below.

Endpoint       | Description
-----------|-----------------------------------------------------
`POST /project/:vcs-type/:username/:project`  | This endpoint allowed users to trigger a new build.
`POST /project/:vcs-type/:username/:project/build` | This endpoint enables users to trigger a new build by project.
`DELETE /project/:vcs-type/:username/:project/build-cache` | This endpoint enabled users to clear the project cache for a specific project.
`GET /recent-builds` | This endpoint enabled users to retrieve an array of recent builds.

## API v2 and server customers

API v2 is not currently supported for self-hosted installations of CircleCI Server.

## Data insights

The CircleCI API v2 enables you to call a specific set of endpoints to retrieve detailed insights and data about your jobs and workflows. This information can be very useful in better understanding how your jobs and workflows are performing while also providing you with data points that you can use to optimize your workflows and builds. A detailed [API Reference Guide](https://circleci.com/docs/api/v2/#section=reference) for these API endpoints has been provided in the documentation. Some examples of insights endpoints include:

- `GET /{vcs_slug}/{org_name}/projects/{project_name}`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows/{workflow_name}/jobs`
