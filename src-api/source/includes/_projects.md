# Projects

If you would like to retrieve detailed information about projects, CircleCI provides several different endpoints that you may call to return this information, including the ability to return detailed information for all projects. To ensure you do not encounter any performance-related lags or issues when making an API request, you may wish to limit your search for a single project instead of an array of projects.

The sections below describe the endpoints you may call to return Project information.

## Get All Followed Projects

```sh
curl https://circleci.com/api/v1.1/projects?circle-token=:token
```

```json
[ {
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


`GET` request.

Returns an array of all projects you are currently following on CircleCI, with build information organized by branch.

## Follow a New Project on CircleCI

```sh
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/follow?circle-token=:token
```

```json
{
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

Request Type: `POST`

Follows a new project. CircleCI will then monitor the project for automatic building of commits.

## Recent Builds Across All Projects

```sh
curl https://circleci.com/api/v1.1/recent-builds?limit=1&shallow=true
```

```json
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

Request Type: `GET`

Returns a build summary for each of the last 30 recent builds, ordered by `build_num`.

**Parameter** | **Description**
------- | -------------
limit | The number of builds to return. Maximum 100, defaults to 30.
offset | The API returns builds starting from this offset, defaults to 0.
shallow | An optional boolean parameter that may be sent to improve performance if set to 'true'.

**Note**: When making an API request for Project information, you may experience performance lag and a decrease in overall performance while the request is being processed by the server. To improve performance, CircleCI recommends you pass the `shallow` parameter in your request.

## Recent Builds For A Single Project

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project?circle-token=:token&limit=20&offset=5&filter=completed
```

>**Note:** You can narrow the builds to a single branch by appending /tree/:branch to the url. Note that the branch name should be url-encoded.

>Example: 

```sh
curl https://circleci.com/api/v1.1/recent-builds?limit=1&shallow=true
```

```json
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

**`GET` Request:** Returns a build summary for each of the last 30 builds for a single git repo, ordered by build_num.

**Parameter** | **Description**
------- | -------------
limit | The number of builds to return. Maximum 100, defaults to 30.
offset | The API returns builds starting from this offset, defaults to 0.
filter | Restricts which builds are returned. Set to "completed", "successful", "failed", "running", or defaults to no filter.
shallow | An optional boolean value that may be sent to improve overall performance if set to 'true.'

### Improving Performance In Recent Build Requests Using the `Shallow` Parameter

When making API requests for information about recent builds, you may experience performance lag and a decrease in overall performance while the request is being processed by the server. To improve performance, CircleCI recommends you pass the `shallow` parameter in your request.

The example to the right shows a user request for recent build information. Notice that when the user passes the `shallow` parameter, a limited set of information is returned, thereby improving response time and minimizing performance lag. 

#### Sample Request Using the `Shallow` Parameter

```json
[{
	"committer_date": "2019-04-12T10:44:51-07:00",
	"body": "",
	"usage_queued_at": "2019-04-12T17:46:11.229Z",
	"reponame": "circleci.com",
	"build_url": "https://circleci.com/gh/circleci/circleci.com/16315",
	"parallel": 1,
	"branch": "ja-homepage",
	"username": "circleci",
	"author_date": "2019-04-12T10:44:51-07:00",
	"why": "github",
	"user": {
		"is_user": true,
		"login": "trevor-circleci",
		"avatar_url": "https://avatars1.githubusercontent.com/u/22457684?v=4",
		"name": null,
		"vcs_type": "github",
		"id": 22457684
	},
	"vcs_revision": "8139060f4d1f6ff617ac49f8afb2273c4fee2343",
	"workflows": {
		"job_name": "build-preview",
		"job_id": "981f2bfa-3c50-4505-865d-5266670217eb",
		"workflow_id": "a063aeae-5b89-458b-8aa1-cca4c565b07d",
		"workspace_id": "a063aeae-5b89-458b-8aa1-cca4c565b07d",
		"upstream_job_ids": ["7e92fbf5-8111-430b-8e2a-54b169ba745d"],
		"upstream_concurrency_map": {},
		"workflow_name": "build-website"
	},
	"vcs_tag": null,
	"pull_requests": [{
		"head_sha": "8139060f4d1f6ff617ac49f8afb2273c4fee2343",
		"url": "https://github.com/circleci/circleci.com/pull/2347"
	}],
	"build_num": 16315,
	"committer_email": "trevor@circleci.com",
	"status": "success",
	"committer_name": "Trevor Sorel",
	"subject": "adding japanese translations for main nav",
	"dont_build": null,
	"lifecycle": "finished",
	"fleet": "picard",
	"stop_time": "2019-04-12T17:47:42.298Z",
	"build_time_millis": 89366,
	"start_time": "2019-04-12T17:46:12.932Z",
	"platform": "2.0",
	"outcome": "success",
	"vcs_url": "https://github.com/circleci/circleci.com",
	"author_name": "Trevor Sorel",
	"queued_at": "2019-04-12T17:46:11.289Z",
	"author_email": "trevor@circleci.com"
}]
```

## Clear Project Cache

**`DELETE` Request:** Clears the cache for a project.

```sh
curl -X DELETE https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/build-cache?circle-token=:token
```

```json
{
  "status" : "build caches deleted"
}
```
