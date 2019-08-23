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

CircleCI API v2 has significantly changed the current API v1.1 paradigm to incorporate some important changes and shifts in the way that you can and will use the API for your jobs. Although changes were made to the available endpoints (discussed later on this page), two of the most important changes are the introduction of "Pipelines" and "Project Slugs" as concepts in the API design and architecture, as well as a set of new endpoints that enable you to:

- Retrieve a workflow by ID
- Trigger Pipelines with parameters
- Trigger particular workflows within Pipelines
- Retrieve a Pipeline by ID
- Retrieve recent Pipelines for an organization or for a project (ideally with branch filtering)

**Note** In API v1.1, the term "build processing" was used to describe how projects were built and processed; however, with the API v2 release, "build processing" has been replaced by "pipelines." New projects will have "pipelines" set by default, whereas existing projects will not be changed.

## Getting Started with the API v2

The v2 API is very similar to the current v1.1 API with some notable exceptions.

Here is a simple example using `curl` to trigger a pipeline with parameters 

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

#### What is a Pipeline?

Pipelines are a CircleCI designation for the full set of configurations you run when triggering work on your projects on the CircleCI platform. Pipelines contain your workflows, which in turn coordinate your jobs. 

#### What Does This Change for Me? How Do I Turn On Pipelines?

Whatever you are running today should continue working without any intervention. CircleCI has some features (such as 2.1 configuration and orbs) that require you to enable pipelines. In some rare cases, some users may need to make tweaks to their configuration when enabling pipelines.

Many users are already using an early version of pipelines, even before CircleCI exposed them through the CircleCI API and web UI. If you have already used the latest features in CircleCI version 2.1 configuration and/or orbs, then you already have pipelines enabled for your project (all projects added after September 1, 2018 already have pipelines enabled by default). If, however, your project does not yet have pipelines enabled, go to **Advanced Settings** in your project's **Settings** page. If you do not see the **Enable Pipelines** option on your project's settings page, this means your project already has pipelines enabled.

#### Is a Pipeline the Same Thing as a Build?

In previous CircleCI releases, the term "build" was used to describe a pipeline. Unfortunately, this terminology proved problematic because there was an incongruity between how "build" and "job" were defined in the API and UI. For example, what was referred to as a "build" in past releases is now referred to as a "job" in the current release. To address this ambiguity, CircleCI updated the UI to reflect this change in nomenclature, but there are still instances of "build" in our API.

More importantly, CircleCI found that more teams are using CircleCI for a much broader array of automated processes than the word "build" implies. “Pipelines” more accurately reflects the broad applications of our platform, therefore, "pipelines" are more appropriate for the set of stages CircleCI performs in processing your automation instructions against changes in your code. 

#### Will I Have to Use Pipelines?

You are not required to use pipelines, but note that pipelines will eventually be enabled for all projects. This will allow CircleCI to provide more powerful configuration and automation, as well as better optimization of your resources and more reliable performance. The overarching goal of this approach is for the transition to pipelines to be seamless and have no disruptions on any of your existing workflows.

### Pipeline Parameters

Pipeline parameters are new with API v2. To use pipeline parameters you must use configuration version 2.1 or higher.

#### Declaring and Using Pipeline Parameters in a Configuration

Pipeline parameters are declared using a `parameters` stanza in the top level keys of your `.circleci/config.yml` file. You may then reference the value of the parameter as a config variable in the scope `pipeline.parameters`.

The example belows shows a configuration with two pipeline parameters, `image-tag` and `workingdir` both used on the subsequent config stanzas:

```yaml
version: 2.1

parameters:
  image-tag:
    type: string
    default: "latest"
  workingdir:
    type: string
    default: "~/main"

jobs:
  build:
    docker:
      - image: circleci/node:<< pipeline.parameters.image-tag >>
    environment:
      IMAGETAG: << pipeline.parameters.workingdir >>
    working_directory: << pipeline.parameters.workingdir >>
    steps:
      - run: echo "Image tag used was ${IMAGETAG}"
      - run: echo "$(pwd) == << pipeline.parameters.workingdir >>"
```

#### Passing Parameters When Triggering Pipelines Via the API

You may use the API v2 endpoint to trigger a pipeline, passing the parameters key in the JSON packet in your `POST` body.

**NOTE:** To pass a parameter when triggering a pipeline via the API, the parameter must be declared in the configuration file.

```
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:vcs-type/:project_slug/:project/pipeline
```

#### Scope of Pipeline Parameters

Pipeline parameters may only be resolved in the `.circleci/config.yml` file in which they are declared. Pipeline parameters are not available in orbs, including orbs declared locally in your `config.yml` file. This decision was made because access to the pipeline scope in orbs would break encapsulation and create a hard dependency between the orb and the calling config, jeopardizing determinism and creating surface area of vulnerability.

### Project Slugs

#### What is a Project Slug?

The CircleCI v2 API is backwards compatible with previous API versions in the way it identifies your projects using repository name. For example, if you want to pull information from CircleCI about the GitHub repository https://github.com/CircleCI-Public/circleci-cli you can refer to that in the CircleCI API as `gh/CircleCI-Public/circleci-cli`, which is a "triplet" of the project type, the name of your "organization", and the name of the repository. 

For the project type you can use `github` or `bitbucket` as well as the shorter forms `gh` or `bb`, which are now supported in API v2. The `organization` is your username or organization name in your version control system.

With API v2, CircleCI has introduced a string representation of the triplet called the `project_slug`, and takes the following form: 

`<project_type>/<org_name>/<repo_name>`

The `project_slug` is included in the payload when pulling information about a project as well as when looking up a pipeline or workflow by ID. It is important to note that the `project_slug` is just a new name for the existing format, and not a new shape of the URLS that can then be used to retrieve information about a project. It is possible in the future CircleCI may change the shape of a `project_slug`, but in all cases it would be usable as a human-readable identifier for a given project.

## Using 'when' in Workflows

With this version of the API, you may use a `when` clause (the inverse clause is also supported) under a workflow declaration with a boolean value to determine whether or not to run that workflow.

The most common use of `when` in API v2 is to use a pipeline parameter as the value, allowing an API trigger to pass that parameter to determine which workflows to run.

The example below shows an example configuration using two different pipeline parameters. You may use one of the parameters to drive whether a particular workflow, while you may use the other parameter determines whether a particular step will run.

```yaml
version: 2.1

parameters:
  run_integration_tests:
    type: boolean
    default: false
  deploy:
    type: boolean
    default: false

workflows:
  version: 2
  integration_tests:
    when: << pipeline.parameters.run_integration_tests >>
    jobs:
      - mytestjob
      - when:
          condition: << pipeline.parameters.deploy >>
          steps:
            - deploy

jobs:
...
```
 
This example prevents the workflow integration_tests from being triggered unless the tests were invoked explicitly when the pipeline is triggered with the following in the `POST` body:

```
{
    "parameters": {
        "run_integration_tests": true
    }
}
```

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
