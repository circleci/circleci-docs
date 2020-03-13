---
layout: classic-docs
title: CircleCI API v1.1 Reference
categories: [reference]
description: Using the CircleCI API
regenerate: true
sitemap: false
---

The CircleCI API v1.x is a JSON API that allows you to access information and trigger actions in CircleCI. **Note:** Access to billing functions is only available from the CircleCI application.

* TOC
{:toc}

## Endpoint Summary

All CircleCI API endpoints begin with `"https://circleci.com/api/v1.1/"`.

<table class="table table-striped table-hover">
	<thead class="thead-light"><tr><th>Endpoint</th><th>Method</th><th>Description</th></tr></thead>
{% assign apis = site.data.api | sort: url %}
{%- for endpoint in apis %}
	{%- unless endpoint[1].url contains "/project/:vcs-type/:username/:project" %}
	<tr>
		<td>{{ endpoint[1].url | remove: "/api/v1.1" }}</td>
		<td>{{- endpoint[1].method -}}</td>
		<td>{{- endpoint[1].description -}}</td>
	</tr>
	{%- endunless -%}
{% endfor %}
	<thead class="thead-light"><tr><th>Endpoint</th><th>Method</th><th>Description</th></tr></thead>
<tr><td colspan="3">Project endpoints below should be prefixed with <code>/api/v1.1/project/:vcs-type/:username/:project</code></td></tr>
{%- for endpoint in apis %}
	{%- if endpoint[1].url contains "/project/:vcs-type/:username/:project" -%}
	<tr>
		<td>{{ endpoint[1].url | remove: "/api/v1.1/project/:vcs-type/:username/:project" }}</td>
		<td>{{- endpoint[1].method -}}</td>
		<td>{{- endpoint[1].description -}}</td>
	</tr>
	{%- endif -%}
{% endfor %}
</table>


## Getting Started

1.  Add an API token from your [account dashboard](https://circleci.com/account/api){:rel="nofollow"}.
2.  To test it,
    [View it in your browser](https://circleci.com/api/v1.1/me){:rel="nofollow"}
    or call the API using `curl`:

    ```
$ curl https://circleci.com/api/v1.1/me?circle-token=:token
```

3.  You should see a response like the following:

    ```
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

<h2 id="calling">Making calls</h2>

All API calls are made in the same way, by making standard HTTP calls, using JSON, a content-type, and your API token.
All CircleCI API endpoints begin with `"https://circleci.com/api/v1.1/"`.

## Authentication

To authenticate, add an API token using your [account dashboard](https://circleci.com/account/api). To use the API token, add it to the
`circle-token` query param, like so:

```
curl https://circleci.com/api/v1.1/me?circle-token=:token
```
Alternatively, you can use the API token as the username for HTTP Basic Authentication, by passing the `-u` flag to the `curl` command, like so:

```
curl -u <circle-token>: https://circleci.com/api/...
```

(Note the colon `:`, which tells `curl` that there's no password.)

## Version Control System (:vcs-type)

New with v1.1 of the api, for endpoints under /project you will now need to tell CircleCI what version control system type your project uses. Current choices are 'github' or 'bitbucket'. The command for recent builds for a project would be formatted like so:

```
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/tree/:branch
```

### Project Username (:username)

This is the GitHub or Bitbucket project account username for the target project (not your personal GitHub or Bitbucket username).

## F/OSS

If you have a Free / Open Source Software ([F/OSS](https://www.gnu.org/philosophy/free-sw.html)) project, and have the setting turned on in Advanced Settings in your project dashboard, some read-only /project endpoints will return the requested data without the need for a token. People will also be able to view the build results dashboard for the project as well.

## List Ordering

There are two API endpoints
where the list order is significant:

- [Recent Builds Across All Projects](#recent-builds)
- [Recent Builds For a Project](#recent-builds-project)

In both cases,
builds are returned in the order that they were created.
For all other endpoints,
the order has no special significance.

## Accept header

If you specify no accept header, we'll return human-readable JSON with comments.
If you prefer to receive compact JSON with no whitespace or comments, add the `"application/json" Accept header`.
Using `curl`:

```
curl https://circleci.com/api/v1.1/me?circle-token=:token -H "Accept: application/json"
```

## User

{{ site.data.api.me | api_endpoint }}

## Projects

{{ site.data.api.projects | api_endpoint }}

<h2 id="follow-project">Follow a New Project on CircleCI</h2>

{{ site.data.api.follow | api_endpoint }}

<h2 id="recent-builds">Recent Builds Across All Projects</h2>

{{ site.data.api.recent_builds | api_endpoint }}

<h2 id="recent-builds-project">Recent Builds For a Single Project</h2>

{{ site.data.api.project | api_endpoint }}

<h2 id="recent-builds-project-branch">Recent Builds For a Project Branch</h2>

You can narrow the builds to a single branch by appending /tree/:branch to the url:
`https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/tree/:branch`

The branch name should be url-encoded.

<h2 id="build">Single Job</h2>

<span class='label label-info'>Note:</span> This is also the payload for the [notification webhooks]( {{ site.baseurl }}/1.0/configuration/#notify), in which case this object is the value to a key named 'payload'. 

{{ site.data.api.build | api_endpoint }}

<h2 id="build-artifacts">Artifacts of a Build</h2>

{{ site.data.api.artifacts | api_endpoint }}

**Notes:**

- the value of `path` is relative to the project root (the `working_directory`)
- `pretty_path` returns the same value as `path`. It is included in the response for backwards compatibility

<h2 id="download-artifact">Download an artifact file</h2>

You can download an individual artifact file via the API with an API-token authenticated HTTP request.

```sh
curl -L -H'Circle-Token: :token' https://132-55688803-gh.circle-artifacts.com/0//tmp/circle-artifacts.7wgAaIU/file.txt
```

**Notes:**
- Make sure your HTTP client is configured to follow follow redirects as the artifact URLs can respond with
an HTTP `3xx` status code (the `-L` switch in `curl` will achieve this).
- `:token` is an API token with 'view-builds' scope.

<h2 id="build-artifacts-latest">Artifacts of the latest Build</h2>

{{ site.data.api.artifacts_latest | api_endpoint }}

**Notes:**

- the value of `path` is relative to the project root (the `working_directory`)
- `pretty_path` returns the same value as `path`. It is included in the response for backwards compatibility

<h2 id="retry-build">Retry a Build</h2>

{{ site.data.api.retry_build | api_endpoint }}

You can retry a build with ssh by swapping "retry" with "ssh":
`https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/ssh`

<h2 id="add-user-ssh">Add User to Build</h2>

{{ site.data.api.add_user_ssh | api_endpoint }}

<h2 id="cancel-build">Cancel a Build</h2>

{{ site.data.api.cancel_build | api_endpoint }}

<h2 id="new-build">Trigger a new Job</h2>

{{ site.data.api.project_post | api_endpoint }}

<h2 id="new-build-branch">Trigger a new Build with a Branch</h2>

<span class='label label-info'>Note:</span> For more about build parameters, read about [using 1.0 parameterized builds]( {{ site.baseurl }}/1.0/parameterized-builds/) and [optional 2.0 build parameters]({{ site.baseurl }}/2.0/env-vars/#injecting-environment-variables-with-the-api). The response for "failed" should be a boolean `true` or `null`.

{{ site.data.api.project_branch | api_endpoint }}

<h2 id="new-project-build">Trigger a new Build by Project (preview)</h2>

<span class='label label-info'>Prerequisite:</span> You must go to your Project Settings in the CircleCI app to [Enable Build Processing (preview)]( {{ site.baseurl }}/2.0/build-processing/). This endpoint does **not** yet support the build_parameters options that the job-triggering endpoint supports.

{{ site.data.api.project_build | api_endpoint }}

<h2 id="clear-cache">Clear Cache</h2>

{{ site.data.api.project_build_cache | api_endpoint}}

<h2 id="list-environment-variables">List Environment Variables</h2>

{{ site.data.api.list_environment_variables | api_endpoint}}

<h2 id="add-environment-variable">Add Environment Variables</h2>

{{ site.data.api.add_environment_variable | api_endpoint}}

<h2 id="get-environment-variable">Get Single Environment Variable</h2>

{{ site.data.api.get_environment_variable | api_endpoint}}

<h2 id="delete-environment-variable">Delete Environment Variables</h2>

{{ site.data.api.delete_environment_variable | api_endpoint}}

<h2 id="list-checkout-keys">List Checkout Keys</h2>

{{ site.data.api.list_checkout_keys | api_endpoint}}

<h2 id="new-checkout-key">New Checkout Key</h2>

{{ site.data.api.new_checkout_key | api_endpoint}}

<h2 id="get-checkout-key">Get Checkout Key</h2>

{{ site.data.api.get_checkout_key | api_endpoint}}

<h2 id="delete-checkout-key">Delete Checkout Key</h2>

{{ site.data.api.delete_checkout_key | api_endpoint}}


## Test Metadata

{{ site.data.api.test_metadata | api_endpoint }}

<span class='label label-info'>Note:</span> [Learn how to set up your 1.0 builds to collect test metadata]( {{ site.baseurl }}/1.0/test-metadata/) and [set up your 2.0 builds to collect test metadata]( {{ site.baseurl }}/2.0/collect-test-data/)

## SSH Keys

{{ site.data.api.ssh_key | api_endpoint }}

## Heroku Keys

{{ site.data.api.heroku_key | api_endpoint }}
