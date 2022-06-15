# CircleCI V1 API Overview 

The CircleCI API is a full-featured RESTful API that allows you to access all information and trigger all actions in CircleCI. RESTful APIs enable you to call individual API endpoints to perform the following actions:

* GET - retrieve specific information, which may include arrays and sets of data and information.
* POST - create/add a new API element.
* PUT - update an existing API element in the API server.
* DELETE - remove/delete an API element in the API server.

<aside class="notice">
Although RESTful APIs include these 4 HTTP verbs, the CircleCI API does not currently use the PUT verb.
</aside>

<aside class="notice">
Access to billing functions is only available from the CircleCI application.
</aside>

## Rate Limiting

The CircleCI API is protected by a number of rate limiting measures to ensure the stability of the system. We reserve the right to throttle the requests made by an individual user, or the requests made to individual resources in order to ensure a fair level of service to all of our users.

As the author of an API integration with CircleCI, your integration should expect to be throttled, and should be able to gracefully handle failure.
There are different protections and limits in place for different parts of the API. In particular, we protect our API against **sudden large bursts of traffic**, and we protect against **sustained high volumes** of requests, for example, frequent polling.

For HTTP APIs, when a request is throttled, you will receive [HTTP status code 429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429). If your integration requires that a throttled request is completed, then you should retry these requests after a delay, using an exponential backoff.
In most cases, the HTTP 429 response code will be accompanied by the [Retry-After HTTP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After). When this header is present, your integration should wait for the period of time specified by the header value before retrying a request.

## API Syntax

When making an API request, make sure you follow standard REST API syntax and formatting. Adhering to proper REST API syntax ensures that the API server can properly process your request and return a JSON response. To make a request to the CircleCI API, use the format shown in the pane to the right:

```sh
"https://circleci.com/api/v1.1"
```

Where:

* https://circleci.com - the resource URL for the API being called.
* api - the class being called.
* v1.1 - the API version.

## Authentication

The CircleCI API utilizes token-based authentication to manage access to the API server and validate that a user has permission to make API requests. Before you can make an API request, you must first add an API token and then verify that you are authenticated by the API server to make requests. The process to add an API token and have the API server authenticate you is described in the sections below.

**Note** You may use the API token as the username for HTTP Basic Authentication, by passing the `-u` flag to the `curl` command.

## Add an API Token

```sh
$ curl -H "Circle-Token: <circle-token>" https://circleci.com/api/v1.1/me
```


```json
{
  "user_key_fingerprint" : null,
  "days_left_in_trial" : -238,
  "plan" : "p16",
  "trial_end" : "2011-12-28T22:02:15Z",
  "basic_email_prefs" : "smart",
  "admin" : true,
  "login" : "pbiggar"
 }
```

To add an API token, perform the steps listed below.

1.  Add an API token from your [account dashboard](https://circleci.com/account/api).
2.  To test it, [View it in your browser](https://circleci.com/api/v1.1/me) or call the API using
3.  You should see a response similar to the example shown in the right pane.

<aside class="notice">
All API calls are made in the same way, by making standard HTTP calls, using JSON, a content-type, and your API token.
</aside>

## Get Authenticated


```sh 
curl -H "Circle-Token: <circle-token>" "https://circleci.com/api/..."
```

```sh 
curl -u <circle-token>: "https://circleci.com/api/..."
```

```sh
curl "https://circleci.com/api/v1.1/me?circle-token=<circle-token>"
```
You can add the API token using your [account dashboard](https://circleci.com/account/api).

To be authenticated by the API server, use this as the value of the Circle-Token header:

Or you can use the API token as the username for HTTP Basic Authentication, by passing the `-u` flag to the `curl` command:

<aside class="notice">
the colon ":" tells curl that there's no password.
</aside>

DEPRECATED (this option will be removed in the future): The API token can be added to the `circle-token` query param:

## Version Control Systems (:vcs-type)

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/tree/:branch
```

New with v1.1 of the API, for endpoints under /project you will now need to tell CircleCI what version control system type your project uses. You may currently select either ‘github’ or ‘bitbucket’. The command for recent builds for a project would be formatted like the example shown in the right pane.

## F/OSS

If you have a [Free / Open Source Software (F/OSS) project] (https://www.gnu.org/philosophy/free-sw.html), and have the setting turned on in Advanced Settings in your project dashboard, some read-only /project endpoints will return the requested data without the need for a token. People will also be able to view the build results dashboard for the project as well.


## List Ordering

```
(https://circleci.com/docs/api/v1-reference/#recent-builds)
(https://circleci.com/docs/api/v1-reference/#recent-builds-project)
```

There are two API endpoints where the list order is significant:

* Recent Builds Across All Projects
* Recent Builds For a Single Project

In both cases, builds are returned in the order that they were created. For all other endpoints, the order has no special significance.

## Accept Header

```sh
curl https://circleci.com/api/v1.1/me -H "Accept: application/json" -H "Circle-Token: <circle-token>"
```

If no accept header is specified (or it is empty), CircleCI will return the data in a Clojure EDN format. To receive the data as nicely formatted JSON, include any value for the `Accept` header (e.g `text/plain`). If you prefer to receive compact JSON with no whitespace or comments, use `application/json` as the `Accept` header.

## Cache-Control Header

Some CircleCI APIs may emit a `Cache-Control` header to indicate that the response may be cached for a period of time. This feature can be used to avoid unnecessary re-fetching of data that will not change. If you plan to make a large volume of API requests you are strongly encouraged to make use of this header in order to improve your performance and lower your risk of being rate limited.

## Getting Started

CircleCI 1.0 and 2.0 are supported by API version 1.1 as documented in the following sections:

* Summary of API Endpoints
* User
* Projects
* Test Metadata
* SSH Keys
* Heroku Keys

## Summary of API Endpoints

All CircleCI API endpoints begin with `https://circleci.com/api/v1.1/`

### GET Requests

**API** | **Description**
------- | -------------
/me | Provides information about the signed in user.
/projects | Lists all projects you are following on CircleCI, with build information organized by branch.
 /project/:vcs-type/:username/:project | Returns a build summary for each of the last 30 builds for a single git repo.
/recent-builds | Returns a build summary for each of the last 30 recent builds, ordered by build\_num.
/project/:vcs-type/:username/:project/:build_num | Returns full details for a single build. The response includes all of the fields from the build summary. This is also the payload for the [notification webhooks](https://circleci.com/docs/2.0/configuration-reference/#notify), in which case this object is the value to a key named ‘payload’.
/project/:vcs-type/:username/:project/:build_num/artifacts | Lists the artifacts produced by a given build.
/project/:vcs-type/:username/:project/checkout-key/:fingerprint | Retrieves a checkout key.

### POST Requests

**API** | **Description**
------- | -------------
/project/:vcs-type/:username/:project/follow | Follow a new project on CircleCI.
/project/:vcs-type/:org_name/:project/:build\_num/retry | Retries the build, returns a summary of the new build.
/project/:vcs-type/:username/:project/:build\_num/cancel | Cancels the build, returns a summary of the build.
/project/:vcs-type/:username/:project/:build_num/ssh-users | Adds a user to the build's SSH permissions.
/project/:vcs-type/:username/:project/tree/:branch | Triggers a new build, returns a summary of the build. Optional [build parameters](https://circleci.com/docs/2.0/env-vars/#injecting-environment-variables-with-api-v1) can be set.
/project/:vcs-type/:username/:project/ssh-key | Creates an ssh key used to access external systems that require SSH key-based authentication.
/project/:vcs-type/:username/:project/checkout-key | Creates a new checkout key.

### DELETE Requests

**API** | **Description**
------- | -------------
/project/:vcs-type/:username/:project/checkout-key/:fingerprint | Deletes a checkout key.
/project/:vcs-type/:username/:project/ssh-key | Delete the SSH key from a project.
