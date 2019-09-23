---
layout: classic-docs
title: "API v2 Introduction"
short-title: "Introduction"
description: "introduction to the CircleCI API v2"
categories: [getting-started]
order: 1
---

The CircleCI API v2 is a significant update to the existing CircleCI API v1.1 that is currently being used by internal and external audiences.

## Introduction to API v2

CircleCI API v2 enables you to use a brand-new API with a set of endpoints and several new features that improve the API experience, in addition to optimizing how you use the API for your jobs. Some of these features include the ability to:

- Retrieve a workflow by ID
- Trigger pipelines with parameters
- Trigger particular workflows within pipelines
- Retrieve a pipeline by ID
- Retrieve recent pipelines for an organization or for a project (ideally with branch filtering)

## Getting Started with the API v2

The v2 API is very similar to the current v1.1 API with some notable exceptions.

Here is a simple example using `curl` to trigger a pipeline with parameters: 

```
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "myparam": "./myspecialdir",
    "myspecialversion": "4.8.2"
  }
}' https://circleci.com/api/v2/project/${project_slug}/pipeline
```

In the above example the `project_slug` would take the form :vcs/:org/:project. For example, the project slug `gh/CircleCI-Public/circleci-cli` tells `CircleCI` to use the project found in the GitHub organization CircleCI-Public in the repository named `circleci-cli`.

### Authentication

The CircleCI API v2 enables users to be authenticated by simply sending your API token as the username of the HTTP request. For example, if you have set `CIRCLECI_TOKEN` in your shell's environment, then you could then use `curl` with that token like the example shown below:

`curl -user ${CIRCLECI_TOKEN} https://circleci.com/api/v2/me`

### Pipelines

The CircleCI API v2 includes the use of pipelines to assist you in triggering workflows from the CircleCI API. By enabling pipelines, you can take advantage of specific API use cases such as:

- Jobs named `build` will be wrapped in a workflows stanza by the processor.
- Projects for which auto-cancel is enabled in the **Advanced Settings** will have workflows on non-default branches cancelled when a newer build is triggered on that same branch.

For more detailed information about pipelines and how you can use them in your workflows and builds, please see the [Build Processing](https://circleci.com/docs/2.0/build-processing/)page.

## Insights

The CircleCI API v2 enables you to call a specific set of endpoints to retrieve detailed insights and data about your jobs and workflows. This information can be very useful in better understanding how your jobs and workflows are performing while also providing you with data points that you can use to optimize your workflows and builds. A detailed API Reference Guide (*add link here for the API Reference Guide when ready*) for these data API endpoints has been provided in the documentation, including:

*Add some data-specific API endpoints here*

## Changes In Endpoints

The CircleCI API v2 release includes several new endpoints, as well as some other endpoints that have been deprecated. The sections below list the endpoints added for this release, in addition to the endpoints that have been removed.

For a complete list of all API v2 enpoints, please refer to the *API v2 Reference Guide*, which contains a detailed description of each individual endpoint, as well as information on required and optional parameters, HTTP status and error codes, and code samples you may use in your workflows.

### New Endpoints

The table below describes the new endpoints that have been added to the CircleCI API for this updated v2 version.

Endpoint       | Description                       
-----------|-------------------------------------------------------
`GET /workflow/:id ` | This endpoint enables users to return an individual Workflow based on the `id` parameter being passed in the request
`GET /workflow/:id/jobs` | This endoint enables users to retrieve all Jobs associated with a specific workflow, based on its unique `id`.
`GET /project/:project_slug`  | This endpoint enables users to retrieve a specific Project by its unique slug.
`POST /project/:project_slug/pipeline` | This endpoint enables users to retrieve an individual project by its unique slug.
`GET /pipeline/:id` | This endpoint enables users to retrieve an individual pipeline, based on the `id` passed in the request.
`GET /pipeline/:id/config`  | This endpoint enables users to retrieve the configuration of a specific pipeline.
`GET /project/:project_slug/pipelines/[:filter]`  | This endpoint enables users to retrieve the most recent set of pipelines for a Project.

### Deprecated Endpoints
{:.no_toc}

For this updated API v2 release, several endpoints have been deprecated, which are listed in the table below.

Endpoint       | Description
-----------|-----------------------------------------------------
`POST /project/:vcs-type/:username/:project`  | This endpoint allowed users to trigger a new build.
`POST /project/:vcs-type/:username/:project/build` | This endpoint enables users to trigger a new build by project.
`DELETE /project/:vcs-type/:username/:project/build-cache` | This endpoint enabled users to clear the project cache for a specific project.
`GET /recent-builds` | This endpoint enabled users to retrieve an array of recent builds.

## API v1.1 Support and EOL

With the release of API v2, there will be two different versions of the CircleCi API that you can use. Although CircleCI recommends you use API v2, you may still use API v1.1 if you wish; however, please note that API v2 includes several powerful features (e.g. support for pipelines) that are unavailable in API v1.1.

For a short period of time, both versions of the CircleCI API (v1.1 & v2) will be available. CircleCI expects to eventually End-Of-Life (EOL) API v1.1 and discontinue support for this API version in the near future. Guidance on when the CircleCI API v1.1 will be discontinued will be communicated at a future date.

## See Also
{:.no_toc}
