# Builds and Jobs

## Single Job

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num?circle-token=:token
```

```json
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


<aside class="notice">
This is also the payload for the notification webhooks, in which case this object is the value to a key named ‘payload’
</aside>

**`GET` Request:** Returns the full details for a single job. The response includes all of the fields from the job summary.


## Retry a Build

```sh
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/retry?circle-token=:token

```

> You can retry a build with ssh by swapping “retry” with “ssh”.

```json
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

**`POST` Request:** Retries the build and then returns a summary of the new build.

## Add User to Build


```sh
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/ssh-users?circle-token=:token
```

```text
# ...Build Data

```

**`POST` Request:** This API call is only available when using a user API token. If the current user has permission to build the project, this API adds the current user's SSH public key to the authorized keys on each container running a build. This allows them to SSH to the build containers.

## Cancel a Build

```sh
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/cancel?circle-token=:token
```

```json
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


**`POST` Request:** Cancels the build and then returns a summary of the build.

## Trigger a new Job
```sh
curl -X POST --header "Content-Type: application/json" -d '{
  "tag": "v0.1", // optional
  "parallel": 2, //optional, default null
  "build_parameters": { // optional
    "RUN_EXTRA_TESTS": "true"
  }
}

https://circleci.com/api/v1.1/project/:vcs-type/:username/:project?circle-token=:token
```

```json
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

### See Also

[Triggering Jobs with the API](https://circleci.com/docs/2.0/api-job-trigger/#section=jobs)

**`POST` Request:** Triggers a new build and then returns a summary of the build.

**Parameter** | **Description**
------- | -------------
revision | The specific revision to build. Default is null and the head of the branch is used. Cannot be used with tag parameter.
tag | The tag to build. Default is null. Cannot be used with revision parameter.
parallel | The number of containers to use to run the build. Default is null and the project default is used. This parameter is ignored for builds running on our 2.0 infrastructure.
build_parameters | Additional environment variables to inject into the build environment. A map of names to values.


## Trigger a new Build with a Branch

```sh
curl -X POST --header "Content-Type: application/json" -d '{
  "parallel": 2, //optional, default null
  "revision": "f1baeb913288519dd9a942499cef2873f5b1c2bf" // optional
  "build_parameters": { // optional
    "RUN_EXTRA_TESTS": "true"
  }
}

https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/tree/:branch?circle-token=:token
```

```json
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

**`POST` Request:** Triggers a new build and then returns a summary of the build.

<aside class="notice">
For more about build parameters, see 2.0 build parameters <a href="https://circleci.com/docs/2.0/env-vars/#injecting-environment-variables-with-the-api">for environment variables</a>. The response for “failed” should be a boolean true or null.
</aside>

**Parameter** | **Description**
------- | -------------
revision | The specific revision to build. Default is null and the head of the branch is used. Cannot be used with tag parameter.
parallel | The number of containers to use to run the build. Default is null and the project default is used. This parameter is ignored for builds running on our 2.0 infrastructure.
build_parameters | Additional environment variables to inject into the build environment. A map of names to values.


## Trigger a new Build by Project (preview)

```sh
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/build?circle-token=:token
```

```json
{
  "status": 200,
  "body": "Build created"
  }
```

**`POST` Request:** Triggers a build of the specified project, by branch, revision, or tag. Workflows will be run or scheduled in the same way as when a webhook from source control is received.


<aside class="notice">
Prerequisite: You must go to your Project Settings in the CircleCI app and enable pipelines. This endpoint does not yet support the <code>build_parameters</code> options that the job-triggering endpoint supports.
</aside>

**Parameter** | **Description**
------- | -------------
revision | The specific revision to build. If not specified, the HEAD of the branch is used. Cannot be used with tag parameter
branch | The branch to build. Cannot be used with tag parameter.
tag | The git tag to build. Cannot be used with branch and revision parameters.



## Get Build Test Metadata

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/tests?circle-token=:token
```

```json
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

**`GET` Request** Provides test metadata for a build.

<aside class="notice">
Learn how to set up your 2.0 builds to <a href="https://circleci.com/docs/2.0/collect-test-data/">Collect Test Metadata</a>.
</aside>
