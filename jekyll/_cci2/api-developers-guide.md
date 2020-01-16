---
layout: classic-docs
title: "CircleCI API Developer's Guide"
short-title: "Developer's Guide"
description: "API cookbook for internal and external CircleCI developers"
categories: [getting-started]
order: 1
---

This *API Developer's Guide* was written to assist developers in quickly and easily making API calls to CircleCI services to return detailed information about users, pipelines, projects and workflows.

* TOC
{:toc}

# API Overview

The CircleCI platform provides a powerful API that enables users to retrieve detailed information about users, jobs, workflows and pipelines.

CircleCI API v2 enables you to use endpoints with several new features that improve the API experience, in addition to optimizing how you use the API for your jobs. Please note that CircleCI API v2 is currently in active development, therefore, the stability of the API is referred to as “mixed”.

## API Classes

The current classes of the API v2 endpoints are:

- Authentication
- Pipeline
- Workflows
- User (Preview)
- Project (Preview)
- Job (Preview)

**Note:** Portions of the CircleCI API v2 remain under “Preview”. Preview endpoints are not yet fully supported or considered generally available. Breaking changes to API v2 Preview endpoints are planned in advance and are announced in the API v2 breaking changes log.

## Authentication and Authorization

The CircleCI API utilizes token-based authentication to manage access to the API server and validate that a user has permission to make API requests. Before you can make an API request, you must first add an API token and then verify that you are authenticated by the API server to make requests. The process to add an API token and have the API server authenticate you is described in the sections below.

**Note** You may use the API token as the username for HTTP Basic Authentication, by passing the `-u` flag to the `curl` command.

### Add an API Token

To add an API token, perform the steps listed below.

1.  Add an API token from your [account dashboard](https://circleci.com/account/api).
2.  To test it, [View it in your browser](https://circleci.com/api/v1.1/me) or call the API using the command below.

```sh
$ curl https://circleci.com/api/v1.1/me?circle-token=:token
```

3.  You should see a response similar to the example shown below.

```json
{
  "user_key_fingerprint" : null,
  "days_left_in_trial" : -238,
  "plan" : "p16",
  "trial_end" : "2011-12-28T22:02:15Z",
  "basic_email_prefs" : "smart",
  "admin" : true,
  "login" : "someuser"
 }
```

**Note:** All API calls are made in the same way, by making standard HTTP calls, using JSON, a content-type, and your API token.

### Get Authenticated

To be authenticated by the API server, add an API token using your [account dashboard](https://circleci.com/account/api). To use the API token, add it to the `circle-token` query param:

```sh
curl "https://circleci.com/api/v1.1/me?circle-token=:token"
```

Alternatively, you can use the API token as the username for HTTP Basic Authentication, by passing the `-u` flag to the `curl` command:

```sh 
curl -u <circle-token>: "https://circleci.com/api/..."
```

**Note:** The colon ":" notifies `curl` that there is no password being passed.

## API Endpoints

The CircleCI v2 API, and its associated endpoints allow you to make HTTP calls to designated endpoints developed in the underlying CircleCI API architecture. These APIs provide programmatic access to CircleCI services, including pipelines, workflows, and jobs. 

Before working with the API and making calls, you should first have an undestanding of the endpoints currently available. The table below lists the endpoints currently available. 

Endpoint       | Description                       
-----------|-------------------------------------------------------
`GET /workflow/:id ` | This endpoint enables users to return an individual Workflow based on the `id` parameter being passed in the request
`GET /workflow/:id/jobs` | This endoint enables users to retrieve all Jobs associated with a specific workflow, based on its unique `id`.
`GET /project/:project_slug`  | This endpoint enables users to retrieve a specific Project by its unique slug.
`POST /project/:project_slug/pipeline` | This endpoint enables users to retrieve an individual project by its unique slug.
`GET /pipeline/:id` | This endpoint enables users to retrieve an individual pipeline, based on the `id` passed in the request.
`GET /pipeline/:id/config`  | This endpoint enables users to retrieve the configuration of a specific pipeline.
`GET /project/:project_slug/pipelines/[:filter]`  | This endpoint enables users to retrieve the most recent set of pipelines for a Project.

## API Syntax

When making an API request, make sure you follow standard REST API syntax and formatting. Adhering to proper REST API syntax ensures that the API server can properly process your request and return a valid JSON response. To make a request to the CircleCI API, use the following format:

`https://circleci.com/api/v2`

Where:

- `https://circleci.com` is the resource URL for the API being called.
- `api` is the class being called.
- `v2` is the API version.

# Getting Started with the API

The CircleCI API v2 is backwards-compatible with previous API versions in the way it identifies your projects using repository name. For instance, if you want to pull information from CircleCI about the GitHub repository https://github.com/CircleCI-Public/circleci-cli you can refer to that in the CircleCI API as gh/CircleCI-Public/circleci-cli, which is a “triplet” of the project type, the name of your “organization”, and the name of the repository. For the project type you can use `  github` or `bitbucket` as well as the shorter forms `gh` or `bb`, which is supported in API v2. The `organization` is your username or organization name in your version control system.

With API v2, CircleCI is introducing a string representation of the triplet called the `project_slug`, which takes the following form:

`<project_type>/<org_name>/<repo_name>`

The `project_slug` is included in the payload when pulling information about a project as well as when looking up a pipeline or workflow by ID. The `project_slug` can then be used to get information about the project. It is possible in the future the shape of a project_slug may change, but in all cases it would be usable as a human-readable identifier for a given project.

## Rate Limiting/Throttling

CircleCI does not currently perform any throttling or rate limiting. In the future, CircleCI may institute rate limiting or throttling or both to monitor the number of API calls made to the service and ensure that the system is more stable and has higher overall performance

# HTTP Status Codes and Response Handling

When you make an API request to the server, an HTTP status code is returned along with the JSON body response. The CircleCI API v2 adheres to standard HTTP response codes, which include the following status code definitions:

200 - Success
400 - Client error
500 - Server error

## 200 Status Codes

If you receive a 200 HTTP status code, your API request is successful and the requested resource will be returned. The following 200 HTTP status codes could potentially be returned with your request:

`200 - OK`

## 400 Status Codes

If you receive a 400 HTTP status code, there is a problem with the request and the server is unable to successfully process the request. The following status codes may be returned with your request:

`401 - Unauthorized`
`403 - Forbidden`
`404 - Not Found`

## 500 Status Code

If you receive a 500 HTTP status code, there is a problem with the server and the request cannot be processed. If you encounter a 500 response, the error will be logged and CircleCI will work to resolve the error. The following 500 HTTP status codes could potentially be returned with your request:

`500 - Internal Server Error`

For more detailed information about HTTP status codes, refer to the following resource:

http://www.restapitutorial.com/httpstatuscodes.html

## Example End-to-End API Request

The following section details the steps you would need, from start to finish, to
make an API call. This section includes creating a "demo repository" called
"hello-world", however, you can use a pre-existing repository to follow along if
you choose.

**Prerequisites**

- A GitHub or BitBucket account with a repository to setup with CircleCI.
- Completion of the CircleCI onboarding.

**Steps**

1. On your VCS provider, create a repository. The repo for this example will be called `hello-world`.

2. Next, follow the onboarding for a new project on CircleCI. You can access onboarding by visiting the application and clicking on "Add Projects" in the sidebar or by going to the link: https://onboarding.circleci.com/project-dashboard/{VCS}/{ORG_NAME} where `VCS` is either `github` (or `gh`) or `bitbucket` (or `bb`) and `ORG_NAME` is your organization or personal VCS username. Find your project in the onboarding list and click `Setup Project`. After completing an onboarding, you should have a valid `config.yml` file in a `.circleci` folder at the root of your repository. In this example, the `config.yml` contains the following:

```sh
# Use the latest 2.1 version of CircleCI pipeline process engine. See: https://circleci.com/docs/2.0/configuration-reference
version: 2.1
# Use a package of configuration called an orb.
orbs:
  # Declare a dependency on the welcome-orb
  welcome: circleci/welcome-orb@0.4.1
# Orchestrate or schedule a set of jobs
workflows:
  # Name the workflow "welcome"
  welcome:
    # Run the welcome/run job in its own container
    jobs:
      - welcome/run
```


3. Add an API token from your [account dashboard](https://circleci.com/account/api). Be sure to write down and store your API token in a secure place once you generate it.

4. It's time to test our your API token using `curl` to make sure everything works. The following code snippets demonstrate querying all pipelines on a project. Please note the example below, the values within curly braces (`{}`) need to be replaced with values specific to your username/orgname.

```sh
# First: set your CircleCI token as an environment variable
export CIRCLECI_TOKEN={your_api_token}

curl --header "Circle-Token: $CIRCLECI_TOKEN" \
     --header 'Accept: application/json'    \
     --header 'Content-Type: application/json' \
     https://circleci.com/api/v2/project/gh/{USER_NAME}/hello-world/pipeline 
```

You will likely receive a long string of unformatted JSON. After formatting, it should look like so:

```sh
{
  "next_page_token": null,
  "items": [
    {
      "id": "03fcbba0-d847-4c8b-a553-6fdd7854b893",
      "errors": [],
      "project_slug": "gh/{YOUR_USER_NAME}/hello-world",
      "updated_at": "2020-01-10T19:45:58.517Z",
      "number": 1,
      "state": "created",
      "created_at": "2020-01-10T19:45:58.517Z",
      "trigger": {
        "received_at": "2020-01-10T19:45:58.489Z",
        "type": "api",
        "actor": {
          "login": "teesloane",
          "avatar_url": "https://avatars0.githubusercontent.com/u/12987958?v=4"
        }
      },
      "vcs": {
        "origin_repository_url": "https://github.com/{YOUR_USER_NAME}/hello-world",
        "target_repository_url": "https://github.com/{YOUR_USER_NAME}/hello-world",
        "revision": "ca67134f650e362133e51a9ffdb8e5ddc7fa53a5",
        "provider_name": "GitHub",
        "branch": "master"
      }
    }
  ]
}
```

**NOTE**: You can format the incoming JSON by piping the `curl` command into the `jq` utility if you have it installed: `curl ... | jq`.

That's great! Hopefully everything is working for you up to this point. Let's move on to performing something that might be a bit more useful.

5. One of the benefits of the CircleCI API v2 is the ability to remotely trigger pipelines with parameters. The following code snippet simply triggers a pipeline via `curl` without any body parameters:

```sh
curl -X POST https://circleci.com/api/v2/project/gh/{YOUR_USER_NAME}/hello-world/pipeline \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H "Circle-Token: $CIRCLECI_TOKEN" \
  
# Which returns:
{
  "number": 2,
  "state": "pending",
  "id": "e411ea74-c64a-4d60-9292-115e782802ed",
  "created_at": "2020-01-15T15:32:36.605Z"
}
```

While this alone can be useful, we want to be able to customize parameters of the pipeline when we send this `POST` request. By including a body parameter in the `curl` request (via the `-d` flag), we can customize specific attributes of the pipeline when it runs: pipeline parameters, the branch, or the git tag. Below, we are telling the pipelines to trigger for "my-branch"

```sh
curl -X POST https://circleci.com/api/v2/project/gh/{YOUR_USER_NAME}/hello-world/pipeline \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H "Circle-Token: $CIRCLECI_TOKEN" \
  -H 'x-attribution-login: string' \
  -H 'x-attribution-actor-id: string' 
  -d "branch=my-branch"
```

6. Let's move on to a more complex example: triggering a pipeline and passing a parameter that can be dynamically substituted into your configuration. In this example, we will pass a docker image tag to our docker-executor key. First, we will need to modify the `.circleci/config.yml` to be a little more complex than the standard "Hello World" sample provided by the onboarding.

```yaml
version: 2.1
parameters:
  image-tag:
    type: string
    default: "latest"

jobs:
  build:
    docker:
      - image: circleci/node:<< pipeline.parameters.image-tag >>
    environment:
      IMAGETAG: << pipeline.parameters.image-tag >>
    working_directory: << pipeline.parameters.workingdir >>
    steps:
      - run: echo "Image tag used was ${IMAGETAG}"
```

You will need to declare the parameters you expect to receive from the API. In this case, under the `parameters` key, we definte an "image-tag" to be expected in the json payload of a POST request to the _Trigger New Pipeline_ endpoint.

7. Now we can run a `curl` request that passes variables in a POST request, as so:

```sh
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/gh/{YOUR_USER_NAME}/hello-world/pipeline
```

This concludes the end-to-end example of using the V2 API. Consider reading the [CircleCI API v2 Documentation]({{site.baseurl}}/api/v2/#circleci-api) for an overview of all endpoints currently available.

# API Use Cases

This section includes several different example API use cases that you can use to better understand how the CircleCI API works, and how you can leverage the API in your own day-to-day work to take advantage of the numerous features and functions of the API.

## Get a List of Pipelines for a Project


## Trigger a Pipeline


## Get a Workflow or Job


## Download Artifacts


