---
layout: classic-docs
title: "API v2 Introduction"
short-title: "API v2 Introduction"
description: "Introduction to the CircleCI API"
categories: [getting-started]
order: 1
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

The CircleCI API may be used to make API calls to retrieve detailed information about users, jobs, workflows and pipelines. There are currently two supported API versions:

* [API v1.1 Reference](https://circleci.com/docs/api/v1/)
* [API v2 Reference](https://circleci.com/docs/api/v2/)

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

**GitLab SaaS Support users:** Note that the definition of **project slug** provided in this section, as well as its usage throughout this document applies to GitHub and Bitbucket projects only. GitLab projects currently use a new slug format:
<br>
`circleci/:slug-remainder`
<br>
The project slug for GitLab projects can be found by navigating to your project in the CircleCI web app and taking the string from the browser address bar. The slug must be treated as an opaque string and passed in its entirety in API requests. Read the [API Developer's Guide]({{site.baseurl}}/api-developers-guide) for more details.
{: class="alert alert-info"}

The CircleCI API v2 is backwards-compatible with previous API versions in the way it identifies your projects using repository name. For instance, if you want to pull information from CircleCI about the GitHub repository https://github.com/CircleCI-Public/circleci-cli you can refer to that in the CircleCI API as `gh/CircleCI-Public/circleci-cli`, which is a "triplet" of the VCS type, the name of your "organization", and the name of the repository. For the VCS type you can use `github` or `bitbucket` as well as the shorter forms `gh` or `bb`, which are now supported in API v2. The `organization` is your username or organization name in your version control system.

With API v2, CircleCI is introducing a string representation of the triplet called the `project_slug`, which takes the following form:

`<vcs_type>/<org_name>/<repo_name>`

The `project_slug` is included in the payload when pulling information about a project as well as when looking up a pipeline or workflow by ID. The `project_slug` can then be used to get information about the project. It is possible in the future the shape of a `project_slug` may change, but for GitHub and Bitbucket projects it is currently usable as a human-readable identifier for a given project.

## Authentication
{: #authentication }

The CircleCI API v2 enables users to be authenticated by sending your [Personal API token]({{site.baseurl}}/managing-api-tokens/#creating-a-personal-api-token) as a HTTP header in the request, with the name `Circle-Token` and the token as the value. You can find examples in the [API Developer's Guide]({{site.baseurl}}/api-developers-guide).

#### Triggering a pipeline with parameters example
{: #triggering-a-pipeline-with-parameters-example }

Here is a simple example using `curl` to trigger a pipeline with parameters:

```shell
curl -X POST --header "Content-Type: application/json" --header "Circle-Token: $CIRCLE_TOKEN" -d '{
  "parameters": {
    "myparam": "./myspecialdir",
    "myspecialversion": "4.8.2"
  }
}' https://circleci.com/api/v2/project/{project_slug}/pipeline
```

In the above example the `project_slug` would take the form `:vcs/:org/:project`. For example, the project slug `gh/CircleCI-Public/circleci-cli` tells `CircleCI` to use the project found in the GitHub organization CircleCI-Public in the repository named `circleci-cli`.

**IMPORTANT** Pipeline parameters are **not** treated as sensitive data and **must not** be used for sensitive values (secrets). You can find information on using sensitive data correctly in the [Security overview](/docs/security-overview/) and [Contexts]({{site.baseurl}}/glossary/#context) guides.

## Changes in endpoints
{: #changes-in-endpoints }

The CircleCI API v2 release includes several new endpoints, and deprecates some others. The sections below list the endpoints added for this release, in addition to the endpoints that have been removed.

For a complete list of all API v2 endpoints, please refer to the [API v2 Reference Guide](https://circleci.com/docs/api/v2/), which contains a detailed description of each individual endpoint, as well as information on required and optional parameters, HTTP status and error codes, and code samples you may use in your workflows.

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

With API v2, several endpoints from v1 have been deprecated, which are listed in the table below.

Endpoint       | Description
-----------|-----------------------------------------------------
`POST /project/:vcs-type/:username/:project`  | This endpoint allowed users to trigger a new build.
`POST /project/:vcs-type/:username/:project/build` | This endpoint enabled users to trigger a new build by project.
`GET /recent-builds` | This endpoint enabled users to retrieve an array of recent builds.

## API v2 and server customers
{: #api-v2-and-server-customers }

API v2 is not supported for installations of CircleCI server 2.x. API v2 is supported for self-hosted installations of CircleCI server 3.x.

## Next steps

- Review the [API Developer's Guide]({{site.baseurl}}/api-developers-guide) for a detailed walkthrough on authenticating as well as example API requests.
