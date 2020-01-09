---
layout: classic-docs
title: "CircleCI API Developer's Guide"
short-title: "Developer's Guide"
description: "API "cookbook" for internal and external CircleCI developers"
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

*Content here will include a sample end-to-end API request, including a high-level diagram/illustration that is a visual representation of the actual API request workflow from beginning to end*

# API Use Cases

This section includes several different example API use cases that you can use to better understand how the CircleCI API works, and how you can leverage the API in your own day-to-day work to take advantage of the numerous features and functions of the API.

## Get a List of Pipelines for a Project


## Trigger a Pipeline


## Get a Workflow or Job


## Download Artifacts



