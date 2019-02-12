---
title: CircleCI API Reference

language_tabs:
  - shell

search: true
---

# CircleCI API Reference Guide

## API Overview

The CircleCI API is a full-featured RESTful API that allows you to access all information and trigger all actions in CircleCI. RESTful APIs enable you to call individual API endpoints to perform the following actions:

* GET - retrieve specific information, which may include arrays and sets of data and information.
* POST - create/add a new API element.
* PUT - update an existing API element in the API server.
* DELETE - remove/delete an API element in the API server.

<aside class="notice">
Although RESTful APIs include these 4 HTTP verbs, the CircleCI API does not currently use the `PUT` verb.
</aside>

<aside class="notice">
Access to billing functions is only available from the CircleCI application.
</aside>

### API Syntax

When making an API request, make sure you follow standard REST API syntax and formatting. Adhering to proper REST API syntax ensures that the API server can properly process your request and return a JSON response. To make a request to the CircleCI API, use the format shown below:
"https://circleci.com/api/v1.1"

Where:

* https://circleci.com - the resource URL for the API being called.
* api - the class being called.
* v1.1 - the API version.

### Authentication

The CircleCI API utilizes token-based authentication to manage access to the API server and validate that a user has permission to make API requests. Before you can make an API request, you must first add an API token and then verify that you are authenticated by the API server to make requests. The process to add an API token and have the API server authenticate you is described in the sections below.

#### Add an API Token

```
$ curl https://circleci.com/api/v1.1/me?circle-token=:token
```

To add an API token, perform the steps listed below.

```{
  "user_key_fingerprint" : null,
  "days_left_in_trial" : -238,
  "plan" : "p16",
  "trial_end" : "2011-12-28T22:02:15Z",
  "basic_email_prefs" : "smart",
  "admin" : true,
  "login" : "pbiggar"
 }
```

1.  Add an API token from your [account dashboard](https://circleci.com/account/api){:rel="nofollow"}.
2.  To test it, [View it in your browser](https://circleci.com/api/v1.1/me){:rel="nofollow"} or call the API using
3.  You should see a response similar to the example shown in the right pane.

<aside class="notice">
All API calls are made in the same way, by making standard HTTP calls, using JSON, a content-type, and your API token.
</aside>

#### Get Authenticated

```
curl https://circleci.com/api/v1.1/me?circle-token=:token
```

```
curl -u <circle-token>: https://circleci.com/api/...
```

To be authenticated by the API server, add an API token using your [account dashboard](https://circleci.com/account/api). To use the API token, add it to the `circle-token` query param:

Alternatively, you can use the API token as the username for HTTP Basic Authentication, by passing the `-u` flag to the `curl` command:

<aside class="notice">
the colon ":" tells curl that there's no password.
</aside>

### Rate Limiting/Throttling

Unlike many other APIs, CircleCI does not currently perform any rate limiting or throttling of API requests to the server, CircleCI may, at its discretion, manually limit the number of requests that can be made to the server if it is determined that the user may be acting inappropriately.

### Version Control Systems (:vcs-type)

```
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/tree/:branch
```

New with v1.1 of the API, for endpoints under /project you will now need to tell CircleCI what version control system type your project uses. You may currently select either ‘github’ or ‘bitbucket’. The command for recent builds for a project would be formatted like the example shown in the right pane.

### F/OSS

If you have a Free / Open Source Software (F/OSS) project [external link] (https://www.gnu.org/philosophy/free-sw.html), and have the setting turned on in Advanced Settings in your project dashboard, some read-only /project endpoints will return the requested data without the need for a token. People will also be able to view the build results dashboard for the project as well.

### List Ordering

There are two API endpoints where the list order is significant:

* Recent Builds Across All Projects [external link] (https://circleci.com/docs/api/v1-reference/#recent-builds)
* Recent Builds For a Single Project [external link] (https://circleci.com/docs/api/v1-reference/#recent-builds-project)

In both cases, builds are returned in the order that they were created. For all other endpoints, the order has no special significance.

### Accept Header

```
curl https://circleci.com/api/v1.1/me?circle-token=:token -H "Accept: application/json"
```

If no accept header is specified, CircleCI will return human-readable JSON with comments. If you prefer to receive compact JSON with no whitespace or comments, add the `application/json` Accept header.

## Getting Started

CircleCI 1.0 and 2.0 are supported by API version 1.1 as documented in the following sections:

* Summary of API Endpoints
* User
* Projects
* Test Metadata
* SSH Keys
* Heroku Keys

## Summary of API Endpoints

All CircleCI API endpoints begin with "https://circleci.com/api/v1.1/".

### GET Requests

**API** | **Description**
------- | -------------
GET :/me | Provides information about the signed in user.
GET :/projects | Lists all projects you are following on CircleCI, with build information organized by branch.
GET: /project/:vcs-type/:username/:project | Returns a build summary for each of the last 30 builds for a single git repo.
GET: /recent-builds | Returns a build summary for each of the last 30 recent builds, ordered by build_num.
GET: /project/:vcs-type/:username/:project/:build_num | Returns full details for a single build. The response includes all of the fields from the build summary. This is also the payload for the notification webhooks (https://circleci.com/docs/2.0/configuration-reference/#notify), in which case this object is the value to a key named ‘payload’.
GET: /project/:vcs-type/:username/:project/:build_num/artifacts | Lists the artifacts produced by a given build.
GET: /project/:vcs-type/:username/:project/checkout-key/:fingerprint | Retrieves a checkout key.

### POST Requests

**API** | **Description**
------- | -------------
POST: /project/:vcs-type/:username/:project/follow | Follow a new project on CircleCI..
POST: /project/:vcs-type/:username/:project/:build_num/retry | Retries the build, returns a summary of the new build.
POST: /project/:vcs-type/:username/:project/:build_num/cancel | Cancels the build, returns a summary of the build.
POST: /project/:vcs-type/:username/:project/:build_num/ssh-users | Adds a user to the build's SSH permissions.
POST: /project/:vcs-type/:username/:project/tree/:branch | Triggers a new build, returns a summary of the build. Optional 1.0 build parameters (https://circleci.com/docs/2.0/parallelism-faster-jobs/) can be set as well and Optional 2.0 build parameters (https://circleci.com/docs/2.0/env-vars/#injecting-environment-variables-with-the-api).
POST: /project/:vcs-type/:username/:project/ssh-key | Creates an ssh key used to access external systems that require SSH key-based authentication
POST: /project/:vcs-type/:username/:project/checkout-key | Creates a new checkout key.

### DELETE Requests

**API** | **Description**
------- | -------------
DELETE: /project/:vcs-type/:username/:project/checkout-key/:fingerprint | Deletes a checkout key.
DELETE: /project/:vcs-type/:username/:project/build-cache | Clears the cache for a project.

## User

Provides information about the user that is currently signed in.

### Method

GET

### Example Call

```curl https://circleci.com/api/v1.1/me?circle-token=:token
```

### Example Response

```
{
  "basic_email_prefs" : "smart", // can be "smart", "none" or "all"
  "login" : "pbiggar" // your github username
}
```
## Projects

Returns an array of all projects you are currently following on CircleCI, with build information organized by branch.

### Method

GET

### Example Call

```https://circleci.com/api/v1.1/projects?circle-token=:token
```

### Example Response

```[ {
  "vcs_url": "https://github.com/circleci/mongofinil",
  "followed": true, // true if you follow this project in CircleCI
  "username": "circleci",
  "reponame": "mongofinil",
  "branches" : {
    "master" : {
      "pusher_logins" : [ "pbiggar", "arohner" ], // users who have pushed
      "last_non_success" : { // last failed build on this branch
        "pushed_at" : "2013-02-12T21:33:14Z",
        "vcs_revision" : "1d231626ba1d2838e599c5c598d28e2306ad4e48",
        "build_num" : 22,
        "outcome" : "failed",
        },
      "last_success" : { // last successful build on this branch
        "pushed_at" : "2012-08-09T03:59:53Z",
        "vcs_revision" : "384211bbe72b2a22997116a78788117b3922d570",
        "build_num" : 15,
        "outcome" : "success",
        },
      "recent_builds" : [ { // last 5 builds, ordered by pushed_at (decreasing)
        "pushed_at" : "2013-02-12T21:33:14Z",
        "vcs_revision" : "1d231626ba1d2838e599c5c598d28e2306ad4e48",
        "build_num" : 22,
        "outcome" : "failed",
        }, {
        "pushed_at" : "2013-02-11T03:09:54Z",
        "vcs_revision" : "0553ba86b35a97e22ead78b0d568f6a7c79b838d",

        "build_num" : 21,
        "outcome" : "failed",
        }, ... ],
      "running_builds" : [ ] // currently running builds
    }
  }
}, ... ]
```

## Follow a New Project on CircleCI

Follows a new project. CircleCI will then monitor the project for automatic building of commits.

### Method

POST

### Example Call

```curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/follow?circle-token=:token
```

### Example Response

```{
  "followed" : true,
  "first_build" : {
    "compare" : null,
    "previous_successful_build" : null,
    "build_parameters" : null,
    "oss" : true,
    "committer_date" : null,
    "body" : null,
    "usage_queued_at" : "2016-09-07T13:48:10.825Z",
    "fail_reason" : null,
    "retry_of" : null,
    "reponame" : "testing-circleci",
    "ssh_users" : [ ],
    "build_url" : "https://circleci.com/gh/circleci/mongofinil/1",
    "parallel" : 1,
    "failed" : null,
    "branch" : "master",
    "username" : "circleci",
    "author_date" : null,
    "why" : "first-build",
    "user" : {
      "is_user" : true,
      "login" : "circleci",
      "avatar_url" : "https://avatars.githubusercontent.com/u/6017470?v=3",
      "name" : "CircleCI",
      "vcs_type" : "github",
      "id" : 10101010
    },
    "vcs_revision" : "b2b5def65bf54091dde02ebb39ef3c54de3ff049",
    "vcs_tag" : null,
    "build_num" : 1,
    "infrastructure_fail" : false,
    "committer_email" : null,
    "previous" : null,
    "status" : "not_running",
    "committer_name" : null,
    "retries" : null,
    "subject" : null,
    "vcs_type" : "github",
    "timedout" : false,
    "dont_build" : null,
    "lifecycle" : "not_running",
    "no_dependency_cache" : false,
    "stop_time" : null,
    "ssh_disabled" : false,
    "build_time_millis" : null,
    "circle_yml" : null,
    "messages" : [ ],
    "is_first_green_build" : false,
    "job_name" : null,
    "start_time" : null,
    "canceler" : null,
    "outcome" : null,
    "vcs_url" : "https://github.com/circleci/mongofinil",
    "author_name" : null,
    "node" : null,
    "canceled" : false,
    "author_email" : null
  }
}
```

## Recent Builds Across All Projects

Returns a build summary for each of the last 30 recent builds, ordered by `build_num`.

**Parameter** | **Description**
------- | -------------
limit | The number of builds to return. Maximum 100, defaults to 30.
offset | The API returns builds starting from this offset, defaults to 0.

### Method

GET

### Example Call

```curl https://circleci.com/api/v1.1/recent-builds?circle-token=:token&limit=20&offset=5
```

### Example Response

```
[ {
  "vcs_url" : "https://github.com/circleci/mongofinil",
  "build_url" : "https://circleci.com/gh/circleci/mongofinil/22",
  "build_num" : 22,
  "branch" : "master",
  "vcs_revision" : "1d231626ba1d2838e599c5c598d28e2306ad4e48",
  "committer_name" : "Allen Rohner",
  "committer_email" : "arohner@gmail.com",
  "subject" : "Don't explode when the system clock shifts backwards",
  "body" : "", // commit message body
  "why" : "github", // short string explaining the reason we built
  "dont_build" : null, // reason why we didn't build, if we didn't build
  "queued_at" : "2013-02-12T21:33:30Z" // time build was queued
  "start_time" : "2013-02-12T21:33:38Z", // time build started
  "stop_time" : "2013-02-12T21:34:01Z", // time build finished
  "build_time_millis" : 23505,
  "username" : "circleci",
  "reponame" : "mongofinil",
  "lifecycle" : "finished", // :queued, :scheduled, :not_run, :not_running, :running or :finished
  "outcome" : "failed", // :canceled, :infrastructure_fail, :timedout, :failed, :no_tests or :success
  "status" : "failed", // :retried, :canceled, :infrastructure_fail, :timedout, :not_run, :running, :failed, :queued, :scheduled, :not_running, :no_tests, :fixed, :success
  "retry_of" : null, // build_num of the build this is a retry of
  "previous" : { // previous build
    "status" : "failed",
    "build_num" : 21
  }, ... ]
```

## Recent Builds For A Single Project

Returns a build summary for each of the last 30 builds for a single git repo, ordered by build_num.

**Parameter** | **Description**
------- | -------------
limit | The number of builds to return. Maximum 100, defaults to 30.
offset | The API returns builds starting from this offset, defaults to 0.
filter | Restricts which builds are returned. Set to "completed", "successful", "failed", "running", or defaults to no filter.

### Method

GET

### Example Call

```
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project?circle-token=:token&limit=20&offset=5&filter=completed
```

### Example Response

```
[ {
  "vcs_url" : "https://github.com/circleci/mongofinil",
  "build_url" : "https://circleci.com/gh/circleci/mongofinil/22",
  "build_num" : 22,
  "branch" : "master",
  "vcs_revision" : "1d231626ba1d2838e599c5c598d28e2306ad4e48",
  "committer_name" : "Allen Rohner",
  "committer_email" : "arohner@gmail.com",
  "subject" : "Don't explode when the system clock shifts backwards",
  "body" : "", // commit message body
  "why" : "github", // short string explaining the reason we built
  "dont_build" : null, // reason why we didn't build, if we didn't build
  "queued_at" : "2013-02-12T21:33:30Z" // time build was queued
  "start_time" : "2013-02-12T21:33:38Z", // time build started running
  "stop_time" : "2013-02-12T21:34:01Z", // time build finished running
  "build_time_millis" : 23505,
  "username" : "circleci",
  "reponame" : "mongofinil",
  "lifecycle" : "finished", // :queued, :scheduled, :not_run, :not_running, :running or :finished
  "outcome" : "failed", // :canceled, :infrastructure_fail, :timedout, :failed, :no_tests or :success
  "status" : "failed", // :retried, :canceled, :infrastructure_fail, :timedout, :not_run, :running, :failed, :queued, :scheduled, :not_running, :no_tests, :fixed, :success
  "retry_of" : null, // build_num of the build this is a retry of
  "previous" : { // previous build
    "status" : "failed",
    "build_num" : 21
  }, ... ]
```

## Recent Builds For a Project Branch

https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/tree/:branch

You can narrow the builds to a single branch by appending /tree/:branch to the url. Note that the branch name should be url-encoded.

## Single Job

<aside class="notice">
This is also the payload for the notification webhooks, in which case this object is the value to a key named ‘payload’
</aside>

Returns the full details for a single job. The response includes all of the fields from the job summary.

### Method

GET

### Example Call

```
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num?circle-token=:token
```

### Example Response

```
{
  "vcs_url" : "https://github.com/circleci/mongofinil",
  "build_url" : "https://circleci.com/gh/circleci/mongofinil/22",
  "build_num" : 22,
  "branch" : "master",
  "vcs_revision" : "1d231626ba1d2838e599c5c598d28e2306ad4e48",
  "committer_name" : "Allen Rohner",
  "committer_email" : "arohner@gmail.com",
  "subject" : "Don't explode when the system clock shifts backwards",
  "body" : "", // commit message body
  "why" : "github", // short string explaining the reason the build ran
  "dont_build" : null, // reason why we didn't build, if we didn't build
  "queued_at" : "2013-02-12T21:33:30Z" // time build was queued
  "start_time" : "2013-02-12T21:33:38Z", // time build started
  "stop_time" : "2013-02-12T21:34:01Z", // time build finished
  "build_time_millis" : 23505,
  "username" : "circleci",
  "reponame" : "mongofinil",
  "lifecycle" : "finished", // :queued, :scheduled, :not_run, :not_running, :running or :finished
  "outcome" : "success", // :canceled, :infrastructure_fail, :timedout, :failed, :no_tests or :success
  "status" : "success", // :retried, :canceled, :infrastructure_fail, :timedout, :not_run, :running, :failed, :queued, :scheduled, :not_running, :no_tests, :fixed, :success
  "retry_of" : null, // build_num of the build this is a retry of
  "steps" : [ {
    "name" : "configure the build",
    "actions" : [ {
      "bash_command" : null,
      "run_time_millis" : 1646,
      "start_time" : "2013-02-12T21:33:38Z",
      "end_time" : "2013-02-12T21:33:39Z",
      "name" : "configure the build",
      "exit_code" : null,
      "type" : "infrastructure",
      "index" : 0,
      "status" : "success",
    } ] },

    "name" : "lein2 deps",
    "actions" : [ {
      "bash_command" : "lein2 deps",
      "run_time_millis" : 7555,
      "start_time" : "2013-02-12T21:33:47Z",
      "messages" : [ ],
      "step" : 1,
      "exit_code" : 0,
      "end_time" : "2013-02-12T21:33:54Z",
      "index" : 0,
      "status" : "success",
      "type" : "dependencies",
      "source" : "inference",
      "failed" : null
    } ] },
    "name" : "lein2 trampoline midje",
    "actions" : [ {
      "bash_command" : "lein2 trampoline midje",
      "run_time_millis" : 2310,
      "continue" : null,
      "parallel" : true,
      "start_time" : "2013-02-12T21:33:59Z",
      "name" : "lein2 trampoline midje",
      "messages" : [ ],
      "step" : 6,
      "exit_code" : 1,
      "end_time" : "2013-02-12T21:34:01Z",
      "index" : 0,
      "status" : "failed",
      "timedout" : null,
      "infrastructure_fail" : null,
      "type" : "test",
      "source" : "inference",
      "failed" : true
    } ]
  } ],
  ...
}
```

## Artifacts Of A Build

Returns an array of artifacts produced by a given build.

### Method

GET

### Example Call

```
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/artifacts?circle-token=:token
```

### Example Response

```
[ {
  "path" : "raw-test-output/go-test-report.xml",
  "pretty_path" : "raw-test-output/go-test-report.xml",
  "node_index" : 0,
  "url" : "https://24-88881093-gh.circle-artifacts.com/0/raw-test-output/go-test-report.xml"
}, {
  "path" : "raw-test-output/go-test.out",
  "pretty_path" : "raw-test-output/go-test.out",
  "node_index" : 0,
  "url" : "https://24-88881093-gh.circle-artifacts.com/0/raw-test-output/go-test.out"
} ]
```

#### Notes

* the value of path is relative to the project root (the working_directory)
* pretty_path returns the same value as path. It is included in the response for backwards compatibility

## Download an artifact file

https://132-55688803-gh.circle-artifacts.com/0//tmp/circle-artifacts.7wgAaIU/file.txt?circle-token=:token

You can download an individual artifact file via the API by appending a query string to its URL. Note that `:token` is an API token with 'view-builds' scope.

## Artifacts of the latest Build

Returns an array of artifacts produced by the latest build on a given branch.

**Parameter** | **Description**
------- | -------------
branch | The branch you would like to look in for the latest build. Returns artifacts for latest build in entire project if omitted.
filter | Restricts which builds are returned. Set to "completed", "successful", "failed", "running", or defaults to no filter.

### Method

GET

### Example Call

```
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/latest/artifacts?circle-token=:token&branch=:branch&filter=:filter
```

### Example Response

```
[ {
  "path" : "raw-test-output/go-test-report.xml",
  "pretty_path" : "raw-test-output/go-test-report.xml",
  "node_index" : 0,
  "url" : "https://24-88881093-gh.circle-artifacts.com/0/raw-test-output/go-test-report.xml"
}, {
  "path" : "raw-test-output/go-test.out",
  "pretty_path" : "raw-test-output/go-test.out",
  "node_index" : 0,
  "url" : "https://24-88881093-gh.circle-artifacts.com/0/raw-test-output/go-test.out"
} ]
```

#### Notes

* the value of path is relative to the project root (the working_directory)
* pretty_path returns the same value as path. It is included in the response for backwards compatibility

## Retry a Build

Retries the build and then returns a summary of the new build.

### Method

POST

### Example Call

```
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/retry?circle-token=:token
```

### Example Response

```
{
  "vcs_url" : "https://github.com/circleci/mongofinil",
  "build_url" : "https://circleci.com/gh/circleci/mongofinil/23",
  "build_num" : 23,
  "branch" : "master",
  "vcs_revision" : "1d231626ba1d2838e599c5c598d28e2306ad4e48",
  "committer_name" : "Allen Rohner",
  "committer_email" : "arohner@gmail.com",
  "subject" : "Don't explode when the system clock shifts backwards",
  "body" : "", // commit message body
  "why" : "retry", // short string explaining the reason we built
  "dont_build" : null, // reason why we didn't build, if we didn't build
  "queued_at" : "2013-04-12T21:33:30Z" // time build was queued
  "start_time" : "2013-04-12T21:33:38Z", // time build started running
  "stop_time" : "2013-04-12T21:34:01Z", // time build finished running
  "build_time_millis" : 23505,
  "username" : "circleci",
  "reponame" : "mongofinil",
  "lifecycle" : "queued",
  "outcome" : null,
  "status" : "queued",
  "retry_of" : 22, // build_num of the build this is a retry of
  "previous" : { // previous build
    "status" : "failed",
    "build_num" : 22
  }
}
```

https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/ssh

You can retry a build with ssh by swapping “retry” with “ssh”.

## Add User to Build

This API call is only available when using a user API token. If the current user has permission to build the project, this API adds the current user's SSH public key to the authorized keys on each container running a build. This allows them to SSH to the build containers.

### Method

POST

### Example Call

```
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/ssh-users?circle-token=:token
```

### Example Response

```
{... the build data ... }
```

## Cancel a Build

Cancels the build and then returns a summary of the build.

### Method

POST

### Example Call

```
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/cancel?circle-token=:token
```

### Example Response

```
{
  "vcs_url" : "https://github.com/circleci/mongofinil",
  "build_url" : "https://circleci.com/gh/circleci/mongofinil/26",
  "build_num" : 26,
  "branch" : "master",
  "vcs_revision" : "59c9c5ea3e289f2f3b0c94e128267cc0ce2d65c6",
  "committer_name" : "Allen Rohner",
  "committer_email" : "arohner@gmail.com",
  "subject" : "Merge pull request #6 from dlowe/master"
  "body" : "le bump", // commit message body
  "why" : "retry", // short string explaining the reason we built
  "dont_build" : null, // reason why we didn't build, if we didn't build
  "queued_at" : "2013-05-24T19:37:59.095Z" // time build was queued
  "start_time" : null, // time build started running
  "stop_time" : null, // time build finished running
  "build_time_millis" : null,
  "username" : "circleci",
  "reponame" : "mongofinil",
  "lifecycle" : "queued",
  "outcome" : "canceled",
  "status" : "canceled",
  "canceled" : true,
  "retry_of" : 25, // build_num of the build this is a retry of
  "previous" : { // previous build
    "status" : "success",
    "build_num" : 25
  }
}
```

## Trigger a new Job

Triggers a new build and then returns a summary of the build.

**Parameter** | **Description**
------- | -------------
revision | The specific revision to build. Default is null and the head of the branch is used. Cannot be used with tag parameter.
tag | The tag to build. Default is null. Cannot be used with revision parameter.
parallel | The number of containers to use to run the build. Default is null and the project default is used. This parameter is ignored for builds running on our 2.0 infrastructure.
build_parameters | Additional environment variables to inject into the build environment. A map of names to values.

### Method

POST

### Example Call

```
curl -X POST --header "Content-Type: application/json" -d '{
  "tag": "v0.1", // optional
  "parallel": 2, //optional, default null
  "build_parameters": { // optional
    "RUN_EXTRA_TESTS": "true"
  }
}
```
https://circleci.com/api/v1.1/project/:vcs-type/:username/:project?circle-token=:token

### Example Response

```
{
  "author_name": "Allen Rohner",
  "build_url": "https://circleci.com/gh/circleci/mongofinil/54",
  "reponame": "mongofinil",
  "failed": null,
  "infrastructure_fail": false,
  "canceled": false,
  "all_commit_details": [{
      "author_name": "Allen Rohner",
      "commit": "f1baeb913288519dd9a942499cef2873f5b1c2bf",
      "author_login": "arohner",
      "committer_login": "arohner",
      "committer_name": "Allen Rohner",
      "body": "Minor version bump",
      "author_date": "2014-04-17T08:41:40Z",
      "committer_date": "2014-04-17T08:41:40Z",
      "commit_url": "https://github.com/circleci/mongofinil/commit/f1baeb913288519dd9a942499cef2873f5b1c2bf",
      "committer_email": "arohner@gmail.com",
      "author_email": "arohner@gmail.com",
      "subject": "Merge pull request #15 from circleci/minor-version-bump"
    }],
  "previous": {
    "build_num": 53,
    "status": "success",
    "build_time_millis": 55413
  },
  "ssh_enabled": null,
  "author_email": "arohner@gmail.com",
  "why": "edit",
  "build_time_millis": null,
  "committer_email": "arohner@gmail.com",
  "parallel": 2,
  "retries": null,
  "compare": null,
  "dont_build": null,
  "committer_name": "Allen Rohner",
  "usage_queued_at": "2014-04-29T12:56:55.338Z",
  "branch": "master",
  "body": "Minor version bump",
  "author_date": "2014-04-17T08:41:40Z",
  "node": null,
  "committer_date": "2014-04-17T08:41:40Z",
  "start_time": null,
  "stop_time": null,
  "lifecycle": "not_running",
  "user": {
    "email": "arohner@gmail.com",
    "name": "Allen Rohner",
    "login": "arohner",
    "is_user": true
  },
  "subject": "Merge pull request #15 from circleci/minor-version-bump",
  "messages": [],
  "job_name": null,
  "retry_of": null,
  "previous_successful_build": {
    "build_num": 53,
    "status": "success",
    "build_time_millis": 55413
  },
  "outcome": null,
  "status": "not_running",
  "vcs_revision": "f1baeb913288519dd9a942499cef2873f5b1c2bf",
  "vcs_tag": "v0.1",
  "build_num": 54,
  "username": "circleci",
  "vcs_url": "https://github.com/circleci/mongofinil",
  "timedout": false
}
```

## Trigger a new Build with a Branch

<aside class="notice">
For more about build parameters, read about using 1.0 parameterized builds [external link] (https://circleci.com/docs/2.0/parallelism-faster-jobs) and optional 2.0 build parameters [external link] (https://circleci.com/docs/2.0/env-vars/#injecting-environment-variables-with-the-api). The response for “failed” should be a boolean true or null.
</aside>

Triggers a new build and then returns a summary of the build.

**Parameter** | **Description**
------- | -------------
revision | The specific revision to build. Default is null and the head of the branch is used. Cannot be used with tag parameter.
parallel | The number of containers to use to run the build. Default is null and the project default is used. This parameter is ignored for builds running on our 2.0 infrastructure.
build_parameters | Additional environment variables to inject into the build environment. A map of names to values.

### Method

POST

### Example Call

```
curl -X POST --header "Content-Type: application/json" -d '{
  "parallel": 2, //optional, default null
  "revision": "f1baeb913288519dd9a942499cef2873f5b1c2bf" // optional
  "build_parameters": { // optional
    "RUN_EXTRA_TESTS": "true"
  }
}
```
https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/tree/:branch?circle-token=:token

### Example Response

```
{
  "author_name": "Allen Rohner",
  "build_url": "https://circleci.com/gh/circleci/mongofinil/54",
  "reponame": "mongofinil",
  "failed": null,
  "infrastructure_fail": false,
  "canceled": false,
  "all_commit_details": [
    {
      "author_name": "Allen Rohner",
      "commit": "f1baeb913288519dd9a942499cef2873f5b1c2bf",
      "author_login": "arohner",
      "committer_login": "arohner",
      "committer_name": "Allen Rohner",
      "body": "Minor version bump",
      "author_date": "2014-04-17T08:41:40Z",
      "committer_date": "2014-04-17T08:41:40Z",
      "commit_url": "https://github.com/circleci/mongofinil/commit/f1baeb913288519dd9a942499cef2873f5b1c2bf",
      "committer_email": "arohner@gmail.com",
      "author_email": "arohner@gmail.com",
      "subject": "Merge pull request #15 from circleci/minor-version-bump"
    }
  ],
  "previous": {
    "build_num": 53,
    "status": "success",
    "build_time_millis": 55413
  },
  "ssh_enabled": null,
  "author_email": "arohner@gmail.com",
  "why": "edit",
  "build_time_millis": null,
  "committer_email": "arohner@gmail.com",
  "parallel": 2,
  "retries": null,
  "compare": null,
  "dont_build": null,
  "committer_name": "Allen Rohner",
  "usage_queued_at": "2014-04-29T12:56:55.338Z",
  "branch": "master",
  "body": "Minor version bump",
  "author_date": "2014-04-17T08:41:40Z",
  "node": null,
  "committer_date": "2014-04-17T08:41:40Z",
  "start_time": null,
  "stop_time": null,
  "lifecycle": "not_running", // :queued, :scheduled, :not_run, :not_running, :running or :finished
  "user": {
    "email": "arohner@gmail.com",
    "name": "Allen Rohner",
    "login": "arohner",
    "is_user": true
  },
  "subject": "Merge pull request #15 from circleci/minor-version-bump",
  "messages": [],
  "job_name": null,
  "retry_of": null,
  "previous_successful_build": {
    "build_num": 53,
    "status": "success",
    "build_time_millis": 55413
  },
  "outcome": null,
  "status": "not_running",
  "vcs_revision": "f1baeb913288519dd9a942499cef2873f5b1c2bf",
  "build_num": 54,
  "username": "circleci",
  "vcs_url": "https://github.com/circleci/mongofinil",
  "timedout": false
}
```

## Trigger a new Build by Project (preview)

Prerequisite: You must go to your Project Settings in the CircleCI app to Enable Build Processing (preview) [external link] (https://circleci.com/docs/2.0/build-processing/). This endpoint does not yet support the build_parameters options that the job-triggering endpoint supports.

Triggers a build of the specified project, by branch, revision, or tag. Workflows will be run or scheduled in the same way as when a webhook from source control is received.

**Parameter** | **Description**
------- | -------------
revision | The specific revision to build. If not specified, the HEAD of the branch is used. Cannot be used with tag parameter
branch | The branch to build. Cannot be used with tag parameter.
tag | The git tag to build. Cannot be used with branch and revision parameters.

### Method

POST

### Example Call

```
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/build?circle-token=:token
```

### Example Response

```
{
  "status": 200,
  "body": "Build created"
  }
```

## Clear Cache

Clears the cache for a project.

### Method

DELETE

### Example Call

```
curl -X DELETE https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/build-cache?circle-token=:token
```

### Example Response

```
{
  "status" : "build caches deleted"
}
```

## List Environment Variables

Returns four 'x' characters plus the last four ASCII characters of the value, consistent with the display of environment variable values in the CircleCI website.

### Method

GET

### Example Call

```
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/envvar?circle-token=:token
```

### Example Response

```
[{"name":"foo","value":"xxxx1234"}]
```

## Add Environment Variables

Creates a new environment variable.

### Method

POST

### Example Call

```
curl -X POST --header "Content-Type: application/json" -d '{"name":"foo", "value":"bar"}' https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/envvar?circle-token=:token
```

### Example Response

```
{"name":"foo","value":"xxxx"}
```

## Get Single Environment Variable

Returns the hidden value of environment variable `:name`.

### Method

GET

### Example Call

```
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/envvar/:name?circle-token=:token
```

### Example Response

```
{"name":"foo","value":"xxxx"}
```

## Delete Environment Variables

Deletes the environment variable named :name.

### Method

DELETE

### Example Call

```
curl -X DELETE https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/envvar/:name?circle-token=:token
```

### Example Response

```
{"message":"ok"}
```

## List Checkout Keys

Returns an array of checkout keys for `:project.`

### Method

GET

### Example Call

```
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/checkout-key?circle-token=:token
```

### Example Response

```
[{"public_key": "ssh-rsa...",
  "type": "deploy-key", // can be "deploy-key" or "github-user-key"
  "fingerprint": "c9:0b:1c:4f:d5:65:56:b9:ad:88:f9:81:2b:37:74:2f",
  "preferred": true,
  "time" : "2015-09-21T17:29:21.042Z" // when the key was issued
  }]
```
## New Checkout Key

Creates a new checkout key. This API request is only usable with a user API token.

Parameter | Description
------- | -------------
type | The type of key to create. Can be 'deploy-key' or 'github-user-key'.

### Method

POST

### Example Call

```
curl -X POST --header "Content-Type: application/json" -d '{"type":"github-user-key"}' https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/checkout-key?circle-token=:token
```

### Example Response

```
{"public_key": "ssh-rsa...",
  "type": "deploy-key", // can be "deploy-key" or "user-key"
  "fingerprint": "c9:0b:1c:4f:d5:65:56:b9:ad:88:f9:81:2b:37:74:2f",
  "preferred": true,
  "time" : "2015-09-21T17:29:21.042Z" // when the key was issued
  }
```

## Get Checkout Key

Returns an individual checkout key.

### Method

GET

### Example Call

```
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/checkout-key/:fingerprint?circle-token=:token
```

### Example Response

```
{"public_key": "ssh-rsa...",
  "type": "deploy-key", // can be "deploy-key" or "user-key"
  "fingerprint": "c9:0b:1c:4f:d5:65:56:b9:ad:88:f9:81:2b:37:74:2f",
  "preferred": true,
  "time" : "2015-09-21T17:29:21.042Z" // when the key was issued
  }
```

## Delete Checkout Key

Deletes the checkout key.

### Method

DELETE

### Example Call

```
curl -X DELETE https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/checkout-key/:fingerprint?circle-token=:token
```

### Example Response

```
{"message":"ok"}
```

## Test Metadata

Provides test metadata for a build.

### Example Call

```
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/tests?circle-token=:token
```

### Example Response

```
{
  "tests" : [ {
    "message" : "",
    "file" : "features/desktop/invitations.feature",
    "source" : "cucumber",
    "run_time" : 2.957513661,
    "result" : "success",
    "name" : "Accepting an invitation",
    "classname" : "Invitations"
  }, {
    "message" : null,
    "file" : "spec/lib/webfinger_spec.rb",
    "source" : "rspec",
    "run_time" : 0.011366,
    "result" : "success",
    "name" : "Webfinger#intialize sets account ",
    "classname" : "spec.lib.webfinger_spec"
  } ]
}
```

<aside class="notice">
Learn how to set up your 1.0 builds to collect test metadata [external link] (https://circleci.com/docs/2.0/collect-test-data/) and set up your 2.0 builds to collect test metadata. [external link] (https://circleci.com/docs/2.0/collect-test-data/)
</aside>

## SSH Keys

Creates an SSH key that will be used to access the external system identified by the hostname parameter for SSH key-based authentication.

### Method

POST

### Example Call

```
curl -X POST --header "Content-Type: application/json" -d '{"hostname":"hostname","private_key":"RSA private key"}' https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/ssh-key?circle-token=:token
```

### Example Response

no response expected

## Heroku Keys

Adds your Heroku API key to CircleCI and then takes `apikey` as form param name.

### Method

POST

### Example Call

```
curl -X POST --header "Content-Type: application/json" -d '{"apikey":"Heroku key"}' https://circleci.com/user/heroku-key?circle-token=:token
```

### Example Response

no response expected
