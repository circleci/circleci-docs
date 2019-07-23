---
layout: classic-docs
title: "API v2 Introduction"
short-title: "Introduction"
description: "CircleCI API v2 introduction"
categories: [getting-started]
order: 1
---

The CircleCI Application Programming Interface (API) version 2, referred to as API v2 throughout this page, is a significant update to the existing CircleCI API v1.1 that is currently being used by internal and external audiences.

* TOC 
{:toc}

## Introduction to API v2

CircleCI API v2 has significantly changed the current API v1.1 paradigm to incorporate some important changes and shifts in the way that you can and will use the API for your jobs. Although changes were made to the available endpoints (discussed later on this page), two of the most important changes are the introduction of "Pipelines" and "Project Slugs" as concepts in the API design and architecture, as well as a set of new endpoints that enable you to:

- Retrieve a workflow by ID
- Trigger Pipelines with parameters
- Trigger particular workflows within Pipelines
- Retrieve a Pipeline by ID
- Retrieve recent Pipelines for an organization or for a project (ideally with branch filtering)

**Note** In API v1.1, the term "build processing" was used to describe how Projects were built and processed; however, with the API v2 release, "build processing" has been replaced by "Pipelines." New Projects will have "Pipelines" set by default, whereas existing Projects will not be changed.

### Authentication

The CircleCI API v2 enables users to be authenticated in much the same way as they would be authenticated in the previous API v1.1. A simple way to authenticate is to send your API token as the username of the HTTP request. For example, if you have set `CIRCLECI_TOKEN` in your shell's environment, then you could then use `curl` with that token like the example shown below:

`curl -u ${CIRCLECI_TOKEN} https://circleci.com/api/v2/me`

For more detailed information on how to authenticate with a token, please refer to the [Authentication](https://circleci.com/docs/api/#authentication) section in the main CirlceCI API documentation.

### Pipelines

#### What is a Pipeline?

Pipelines are a CircleCI designation for the full set of configurations you run when triggering work on your Projects on the CircleCI platform. Pipelines contain your Workflows, which in turn coordinate your Jobs. 

#### What Are the Practical Implications of Pipelines?

In this new approach, Jobs running a configuration prior to 2.1 will run in a Workflow. Jobs running a 2.1 configuration will require Workflows to be defined before the Job may be run. In the future, CircleCI will add a new Pipeline-level parameters clause in `config.yml`, referenced in the `pipeline` scope, as well as launch a new version of the CircleCI API that has the ability to trigger Pipelines with parameters and retrieve them and their Workflows. In addition to these changes, CircleCI is also creating a new UI that will unify the experience of viewing your Pipelines and their Jobs coordinated in Workflows.

#### What Does This Change for Me? How Do I Turn On Pipelines?

Whatever you are running today should continue working without any intervention. CircleCI has some features (such as 2.1 configuration and orbs) that require you to enable Pipelines. In some rare cases, some users may need to make tweaks to their configuration when enabling Pipelines.

Many users are already using an early version of Pipelines, even before CircleCI exposed them through the CircleCI API and web UI. If you have already used the latest features in CircleCI version 2.1 configuration and/or Orbs, then you already have Pipelines enabled for your project (all projects added after September 1, 2018 already have Pipelines enabled by default). If, however, your project does not yet have Pipelines enabled, go to "Advanced Settings" in your project's Settings page. If you do not see the "Enable Pipelines" option on your project's settings page, this means your project already has Pipelines enabled.

#### Is a Pipeline the Same Thing as a Build?

In previous CircleCI releases, the term "build" was used to describe a Pipeline. Unfortunately, this terminology proved problematic because there was an incongruity between how "Build" and "Job" were defined in the API and UI. For example, what was referred to as a "Build" in past releases is now referred to as a "Job" in the current release. To address this ambiguity, CircleCI updated the UI to reflect this change in nomenclature, but there are still instances of "Build" in our API.

More importantly, CircleCI found that more teams are using CircleCI for a much broader array of automated processes than the word "Build" implies. “Pipelines” more accurately reflects the broad applications of our platform, therefore, "Pipelines" are more appropriate for the set of stages CircleCI performs in processing your automation instructions against changes in your code. 

#### Will I Have to Use Pipelines?

You are not required to use Pipelines, but note that Pipelines will eventually be enabled for all projects. This will allow CircleCI to provide more powerful configuration and automation, as well as better optimization of your resources and more reliable performance. The overarching goal of this approach is for the transition to Pipelines to be seamless and have no disruptions on any of your existing workflows. 

### Project Slugs

#### What is a Project Slug?

The CircleCI v2 API is backwards compatible with previous API versions in the way it identifies your projects using repository name. For example, if you want to pull information from CircleCI about the GitHub repository https://github.com/CircleCI-Public/circleci-cli you can refer to that in the CircleCI API as `gh/CircleCI-Public/circleci-cli`, which is a "triplet" of the project type, the name of your "organization", and the name of the repository. 

For the project type you can use `github` or `bitbucket` as well as the shorter forms `gh` or `bb`, which are now supported in API v2. The `organization` is your username or organization name in your version control system.

With API v2, CircleCI has introduced a string representation of the triplet called the `project_slug`, and takes the following form: 

`<project_type>/<org_name>/<repo_name>`

The `project_slug` is included in the payload when pulling information about a Project as well as when looking up a Pipeline or Workflow by ID. The `project_slug` can then be used to get information about the Project. It is possible in the future CircleCI may change the shape of a `project_slug`, but in all cases it would be usable as a human-readable identifier for a given Project.

## Changes In Endpoints

The CircleCI API v2 release includes several new endpoints that you can use in your Jobs, as well as some endpoints that have been deprecated. The sections below list the endpoints added for this release, in addition to the endpoints that have been removed.

### New Endpoints

The table below describes the new endpoints that have been added to the CircleCI API for this updated v2 version.

Endpoint       | Description                       
-----------|-------------------------------------------------------
`GET /workflow/:id ` | This endpoint enables users to return an individual Workflow based on the `id` parameter being passed in the request
`GET /workflow/:id/jobs` | This endoint enables users to retrieve all Jobs associated with a specific workflow, based on its unique `id`.
`GET /project/:project_slug`  | This endpoint enables users to retrieve a specific Project by its unique slug.
`POST /project/:project_slug/pipeline` | This endpoint enables users to retrieve an individual Project by its unique slug.
`GET /pipeline/:id` | This endpoint enables users to retrieve an individual Pipeline, based on the `id` passed in the request.
`GET /pipeline/:id/config`  | This endpoint enables users to retrieve the configuration of a specific Pipeline.
`GET /project/:project_slug/pipelines/[:filter]`  | This endpoint enables users to retrieve the most recent set of Pipelines for a Project.

### Deprecated Endpoints
{:.no_toc}

For this updated API v2 release, a number of endpoints have been deprecated 

Endpoint       | Description
-----------|-----------------------------------------------------
`POST /project/:vcs-type/:username/:project`  | This endpoint allowed users to trigger a new build.
`POST /project/:vcs-type/:username/:project/build` | This endpoint enables users to trigger a new build by project.
`DELETE /project/:vcs-type/:username/:project/build-cache` | This endpoint enabled users to clear the project cache for a specific project.
`GET /recent-builds` | This endpoint enabled users to retrieve an array of recent builds.

## API v1.1 Support and EOL

With the release of API v2, there will be two different versions of the CircleCi API that you can use. Although CircleCI recommends you use API v2, you may still use API v1.1 if you wish; however, please note that API v2 includes several powerful features (e.g. support for Pipelines) that are unavailable in API v1.1.

For a short period of time, both versions of the CircleCI API (v1.1 & v2) will be available. CircleCI expects to eventually End-Of-Life (EOL) API v1.1 and discontinue support for this API version in the near future. Guidance on when the CircleCI API v1.1 will be discontinued will be communicated at a later date.

## See Also
{:.no_toc}

