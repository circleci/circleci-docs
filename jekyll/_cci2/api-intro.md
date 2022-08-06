---
layout: classic-docs
title: "API v2 Introduction"
short-title: "API v2 Introduction"
description: "Introduction to the CircleCI API"
categories: [getting-started]
order: 1
version:
- Cloud
- Server v3.x
- Server v2.x
---

The CircleCI API may be used to make API calls to retrieve detailed information about users, jobs, workflows and pipelines. There are currently two supported API versions:

* [API v1.1 Reference]({{site.baseurl}}/api/v1/)
* [API v2 Reference]({{site.baseurl}}/api/v2/)

API v2 includes several powerful features (e.g. support for pipelines and pipeline parameters) that are unavailable in API v1.1. It is recommended that CircleCI cloud users migrate their scripts to API v2 stable endpoints as soon as possible.

CircleCI API v1.1 and v2 are supported and generally available. CircleCI expects to eventually End-Of-Life (EOL) API v1.1 in favor of API v2. Further guidance on when CircleCI API v1.1 will be discontinued will be communicated at a future date.

## Overview
{: #overview }

CircleCI API v2 enables you to use endpoints with several new features that improve the API experience, in addition to optimizing how you use the API for your jobs.

The current categories of the API v2 endpoints are:

{% include snippets/api-v2-endpoints.md %}

Currently, [Personal API tokens]({{site.baseurl}}/managing-api-tokens/#creating-a-personal-api-token) are the only supported tokens on API v2. [Project tokens]({{site.baseurl}}/managing-api-tokens/#creating-a-project-api-token) are not currently supported on API v2.
{: class="alert alert-info"}

## Getting started with the API v2
{: #getting-started-with-the-api-v2 }

The CircleCI API v2 is backwards-compatible with previous API versions in the way it identifies your projects using repository name. For instance, if you want to pull information from CircleCI about the GitHub repository https://github.com/CircleCI-Public/circleci-cli you can refer to that in the CircleCI API as `gh/CircleCI-Public/circleci-cli`, which is a "triplet" of the project type, the name of your "organization", and the name of the repository. For the project type you can use `github` or `bitbucket` as well as the shorter forms `gh` or `bb`, which are now supported in API v2. The `organization` is your username or organization name in your version control system.

With API v2, CircleCI is introducing a string representation of the triplet called the `project_slug`, which takes the following form:

`<project_type>/<org_name>/<repo_name>`

The `project_slug` is included in the payload when pulling information about a project as well as when looking up a pipeline or workflow by ID. The `project_slug` can then be used to get information about the project. It is possible in the future the shape of a `project_slug` may change, but in all cases it would be usable as a human-readable identifier for a given project.

## Authentication
{: #authentication }

The CircleCI API v2 enables users to be authenticated by simply sending your [Personal API token]({{site.baseurl}}/managing-api-tokens/#creating-a-personal-api-token) as the username of the HTTP request. For example, if you have set `CIRCLE_TOKEN` in your shell's environment, you could then use `curl` with that token like the example shown below:

```shell
curl -u ${CIRCLE_TOKEN}: https://circleci.com/api/v2/me
```

**Note:** the `:` is included to indicate there is no password.

#### Triggering a pipeline with parameters example
{: #triggering-a-pipeline-with-parameters-example }

Here is a simple example using `curl` to trigger a pipeline with parameters:

```shell
curl -u ${CIRCLE_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "myparam": "./myspecialdir",
    "myspecialversion": "4.8.2"
  }
}' https://circleci.com/api/v2/project/{project_slug}/pipeline
```

In the above example the `project_slug` would take the form `:vcs/:org/:project`. For example, the project slug `gh/CircleCI-Public/circleci-cli` tells `CircleCI` to use the project found in the GitHub organization CircleCI-Public in the repository named `circleci-cli`.

**IMPORTANT** Pipeline parameters are **not** treated as sensitive data and **must not** be used for sensitive values (secrets). You can find information on using sensitive data correctly in the [Project Settings]({{site.baseurl}}/settings/) and [Contexts]({{site.baseurl}}/glossary/#context) guides.

## Changes in endpoints
{: #changes-in-endpoints }

The CircleCI API v2 release includes several new endpoints, and deprecates some others. The sections below list the endpoints added for this release, in addition to the endpoints that have been removed.

For a complete list of all API v2 endpoints, please refer to the [API v2 Reference Guide]({{site.baseurl}}/api/v2/), which contains a detailed description of each individual endpoint, as well as information on required and optional parameters, HTTP status and error codes, and code samples you may use in your workflows.

### New endpoints
{: #new-endpoints }

The table below describes the new endpoints that have been added to the CircleCI API for this updated v2 version.

Endpoint       | Description
-----------|-------------------------------------------------------
`GET /workflow/:id ` | Returns an individual workflow based on the `id` parameter being passed in the request.
`GET /workflow/:id/job` | Retrieves all Jobs associated with a specific workflow, based on its unique `id`.
`GET /project/:project_slug`  | Retrieves a specific project by its unique slug.
`POST /project/:project_slug/pipeline` | Retrieves an individual project by its unique slug.
`GET /pipeline/:id` | Retrieves an individual pipeline, based on the `id` passed in the request.
`GET /pipeline/:id/config`  | Retrieves the configuration of a specific pipeline.
`GET /project/:project_slug/pipelines/[:filter]`  | Retrieves the most recent set of pipelines for a Project.
`GET /insights/:project-slug/workflows` | Retrieves summary metrics for an individual project's workflow.
`GET /insights/:project-slug/workflows/:workflow-name` | Retrieves recent runs for a workflow.
`GET /insights/:project-slug/workflows/:workflow-name/jobs` | Retrieves summary metrics for a project workflow's jobs.
`GET /insights/:project-slug/workflows/:workflow-name/jobs/:job-name` | Retrieves recent runs of a job within a workflow.

### Deprecated endpoints
{: #deprecated-endpoints }
{:.no_toc}

For this updated API v2 release, several endpoints have been deprecated, which are listed in the table below.

Endpoint       | Description
-----------|-----------------------------------------------------
`POST /project/:vcs-type/:username/:project`  | This endpoint allowed users to trigger a new build.
`POST /project/:vcs-type/:username/:project/build` | This endpoint enabled users to trigger a new build by project.
`GET /recent-builds` | This endpoint enabled users to retrieve an array of recent builds.

## API v2 and server customers
{: #api-v2-and-server-customers }

API v2 is not supported for installations of CircleCI server 2.x. API v2 is supported for self-hosted installations of CircleCI server 3.x.

## Data insights
{: #data-insights }

The CircleCI API v2 enables you to call a specific set of endpoints to retrieve detailed insights and data about your jobs and workflows. This information can help you better understand how your jobs and workflows are performing while also providing you with data points that you can use to optimize your workflows and builds. A detailed [API Reference Guide]({{site.baseurl}}/api/v2/#section=reference) for these API endpoints has been provided in the documentation. Some examples of insights endpoints include:

- `GET /{vcs_slug}/{org_name}/projects/{project_name}`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows/{workflow_name}/jobs`
