# Jobs

## Single Job

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num -H "Circle-Token: <circle-token>"
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
  "why" : "github", // short string explaining the reason the job ran
  "dont_build" : null, // reason why we didn't build, if we didn't build
  "queued_at" : "2013-02-12T21:33:30Z", // time the job was queued
  "start_time" : "2013-02-12T21:33:38Z", // time the job started
  "stop_time" : "2013-02-12T21:34:01Z", // time the job finished
  "build_time_millis" : 23505,
  "username" : "circleci",
  "reponame" : "mongofinil",
  "lifecycle" : "finished", // :queued, :not_run, :not_running, :running or :finished
  "outcome" : "success", // :canceled, :infrastructure_fail, :timedout, :failed, :no_tests or :success
  "status" : "success", // :retried, :canceled, :infrastructure_fail, :timedout, :not_run, :running, :failed, :queued, :not_running, :no_tests, :fixed, :success
  "retry_of" : null, // build_num of the job that this is a retry of
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

**`GET` Request:** Returns the full details for a single job. The response includes all of the fields from the job summary.


## Retry a Job

```sh
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:org_name/:project/:build_num/retry -H "Circle-Token: <circle-token>"

```

> You can retry a job with SSH by swapping “retry” with “ssh”.

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
  "queued_at" : "2013-04-12T21:33:30Z" // time the job was queued
  "start_time" : "2013-04-12T21:33:38Z", // time the job started running
  "stop_time" : "2013-04-12T21:34:01Z", // time the job finished running
  "build_time_millis" : 23505,
  "username" : "circleci",
  "reponame" : "mongofinil",
  "lifecycle" : "queued",
  "outcome" : null,
  "status" : "queued",
  "retry_of" : 22, // build_num of the job that this is a retry of
  "previous" : { // previous job
    "status" : "failed",
    "build_num" : 22
  }
}
```

**`POST` Request:** Retries the job and then returns a summary of the new job run.

## Cancel a Job

```sh
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/cancel -H "Circle-Token: <circle-token>"
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
  "queued_at" : "2013-05-24T19:37:59.095Z" // time the job was queued
  "start_time" : null, // time the job started running
  "stop_time" : null, // time the job finished running
  "build_time_millis" : null,
  "username" : "circleci",
  "reponame" : "mongofinil",
  "lifecycle" : "queued",
  "outcome" : "canceled",
  "status" : "canceled",
  "canceled" : true,
  "retry_of" : 25, // build_num of the job that this is a retry of
  "previous" : { // previous job
    "status" : "success",
    "build_num" : 25
  }
}
```


**`POST` Request:** Cancels the job and then returns a summary of the job run.

## Trigger a new Job

```sh
curl -X POST --header "Content-Type: application/json" -H "Circle-Token: <circle-token>" -d '{
  "job": "deploy-preview"
  "tag": "v0.1", // optional
  "parallel": 2, //optional, default null
  "build_parameters": { // optional
    "RUN_EXTRA_TESTS": "true"
  }
}'

https://circleci.com/api/v1.1/project/:vcs-type/:username/:project
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
  "job_name": "my-new-job",
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

<aside class="warning">
We recommend migrating from this endpoint to use API v2  <a href="https://circleci.com/docs/api/v2/index.html#operation/triggerPipeline">trigger a pipeline</a>.
</aside>

**`POST` Request:** Triggers a new job and then returns a summary of the job run.

**Parameter** | **Description**
------- | -------------
job | Name of job. If not provided, defaults to a job named "build".
revision | The specific revision to build. Default is null and the head of the branch is used. Cannot be used with tag parameter.
tag | The tag to build. Default is null. Cannot be used with revision parameter.
build_parameters | Additional environment variables to inject into the job environment. A map of names to values.


## Trigger a new Job with a Branch

```sh
curl -X POST --header "Content-Type: application/json" -H "Circle-Token: <circle-token>" -d '{
  "parallel": 2, //optional, default null
  "revision": "f1baeb913288519dd9a942499cef2873f5b1c2bf" // optional
  "build_parameters": { // optional
    "RUN_EXTRA_TESTS": "true"
  }
}'

https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/tree/:branch
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
  "lifecycle": "not_running", // :queued, :not_run, :not_running, :running or :finished
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

<aside class="warning">
We recommend migrating from this endpoint to use API v2  <a href="https://circleci.com/docs/api/v2/index.html#operation/triggerPipeline">trigger a pipeline</a>.
</aside>

**`POST` Request:** Triggers a new job and then returns a summary of the job run.

**Parameter** | **Description**
------- | -------------
revision | The specific revision to build. Default is null and the head of the branch is used. Cannot be used with tag parameter.
build_parameters | Additional environment variables to inject into the job environment. A map of names to values.

**Note** Triggering a new job with a branch is not currently supported with configurations that specify `version: 2.1`.

## Trigger a new Pipeline by Project

<aside class="warning">
We recommend migrating from this endpoint to use API v2  <a href="https://circleci.com/docs/api/v2/index.html#operation/triggerPipeline">trigger a pipeline</a>.
</aside>

```sh
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/build -H "Circle-Token: <circle-token>"
```

```json
{
  "status": 200,
  "body": "Build created"
  }
```

**`POST` Request:** Triggers a pipeline of the specified project, by branch, revision, or tag. Workflows will be run or scheduled in the same way as when a webhook from source control is received. The use of this endpoint requires a **personal API token**.


<aside class="notice">
<strong>Note:</strong> This endpoint does not yet support the <code>build_parameters</code> options that the job-triggering endpoint supports.
This also means that this endpoint is not available for CircleCI server.
</aside>

**Parameter** | **Description**
------- | -------------
revision | The specific revision to build. If not specified, the HEAD of the branch is used. Cannot be used with tag parameter
branch | The branch to build. Cannot be used with tag parameter.
tag | The git tag to build. Cannot be used with branch and revision parameters.



## Get Test Metadata

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/tests -H "Circle-Token: <circle-token>"
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

**`GET` Request** Provides test metadata for a job.

<aside class="notice">
Learn how to set up your jobs to <a href="https://circleci.com/docs/collect-test-data//">collect test metadata</a>.
</aside>
