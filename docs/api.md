---

title: CircleCI REST API
layout: doc
popularity: 1
tags:
  - reference

---
{% assign api_data = site.data.api_data %}

<h2 id="intro">The CircleCI API</h2>

The CircleCI API is a RESTy, fully-featured API that allows you to do almost anything in CircleCI.
You can access all information and trigger all actions.
The only thing we don't provide access to is billing functions, which must be done from the CircleCI web UI.

## Summary

All Circle API endpoints begin with `"https://circleci.com/api/v1/"`.

<dl>
<dt>
  GET: /me
</dt>
<dd>
  Provides information about the signed in user.
</dd>
<dt>
  GET: /projects
</dt>
<dd>
  List of all the projects you're following on CircleCI, with build information organized by branch.
</dd>
<dt>
  GET: /project/:username/:project
</dt>
<dd>
  Build summary for each of the last 30 builds for a single git repo.
</dd>
<dt>
  GET: /recent-builds
</dt>
<dd>
  Build summary for each of the last 30 recent builds, ordered by build_num.
</dd>
<dt>
  GET: /project/:username/:project/:build_num
</dt>
<dd>
  Full details for a single build. The response includes all of the fields from the build summary. This is also the payload for the [notification webhooks](/docs/configuration#notify), in which case this object is the value to a key named 'payload'.
</dd>
<dt>
  GET: /project/:username/:project/:build_num/artifacts
</dt>
<dd>
  List the artifacts produced by a given build.
</dd>
<dt>
  POST: /project/:username/:project/:build_num/retry
</dt>
<dd>
  Retries the build, returns a summary of the new build.
</dd>
<dt>
  POST: /project/:username/:project/:build_num/cancel
</dt>
<dd>
  Cancels the build, returns a summary of the build.
</dd>
<dt>
  POST: /project/:username/:project/:build_num/ssh-users
</dt>
<dd>
  Adds a user to the build's SSH permissions.
</dd>
<dt>
  POST: /project/:username/:project/tree/:branch
</dt>
<dd>
  Triggers a new build, returns a summary of the build. [Optional build parameters can be set using an experimental API](/docs/parameterized-builds).
</dd>
<dt>
  POST: /project/:username/:project/ssh-key
</dt>
<dd>
  Create an ssh key used to access external systems that require SSH key-based authentication
</dd>
<dt>
  GET: /project/:username/:project/checkout-key
</dt>
<dd>
  Lists checkout keys.
</dd>
<dt>
  POST: /project/:username/:project/checkout-key
</dt>
<dd>
  Create a new checkout key.
</dd>
<dt>
  GET: /project/:username/:project/checkout-key/:fingerprint
</dt>
<dd>
  Get a checkout key.
</dd>
<dt>
  DELETE: /project/:username/:project/checkout-key/:fingerprint
</dt>
<dd>
  Delete a checkout key.
</dd>

<dt>
  DELETE: /project/:username/:project/build-cache
</dt>
<dd>
  Clears the cache for a project.
</dd>
<dt>
  POST: /user/ssh-key
</dt>
<dd>
  Adds a CircleCI key to your Github User account.
</dd>
<dt>
  POST: /user/heroku-key
</dt>
<dd>
  Adds your Heroku API key to CircleCI, takes apikey as form param name.
</dd>
</dl>

## Getting started

1.  Add an API token from your [account dashboard](/account/api).
2.  To test it,
    [view it in your browser](/api/v1/me)
    or call the API using `curl`:

    ```
$ curl https://circleci.com/api/v1/me?circle-token=:token
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
All CircleCI API endpoints begin with `"https://circleci.com/api/v1/"`.

## Authentication

To authenticate, add an API token using your [account dashboard](/account/api). To use the API token, add it to the
`circle-token` query param, like so:

```
curl https://circleci.com/api/v1/me?circle-token=:token
```

## Accept header

If you specify no accept header, we'll return human-readable JSON with comments.
If you prefer to receive compact JSON with no whitespace or comments, add the `"application/json" Accept header`.
Using `curl`:

```
curl https://circleci.com/api/v1/me?circle-token=:token -H "Accept: application/json"
```

## User

{{ api_data.me | api_endpoint }}


## Projects

{{ api_data.projects | api_endpoint }}

<h2 id="recent-builds">Recent Builds Across All Projects</h2>

{{ api_data.recent_builds | api_endpoint }}

<h2 id="recent-builds-project">Recent Builds For a Single Project</h2>

{{ api_data.project | api_endpoint }}

<h2 id="recent-builds-project-branch">Recent Builds For a Project Branch</h2>

You can narrow the builds to a single branch by appending /tree/:branch to the url:
`https://circleci.com/api/v1/project/:username/:project/tree/:branch`

The branch name should be url-encoded.

<h2 id="build">Single Build</h2>

<span class='label label-info'>Note:</span> This is also the payload for the [notification webhooks](/docs/configuration#notify), in which case this object is the value to a key named 'payload'.

{{ api_data.build | api_endpoint }}

<h2 id="build-artifacts">Artifacts of a Build</h2>

{{ api_data.artifacts | api_endpoint }}

<h2 id="retry-build">Retry a Build</h2>

{{ api_data.retry_build | api_endpoint }}

You can retry a build with ssh by swapping "retry" with "ssh":
`https://circleci.com/api/v1/project/:username/:project/:build_num/ssh`

<h2 id="add-user-ssh">Add User to Build</h2>

{{ api_data.add_user_ssh | api_endpoint }}

<h2 id="cancel-build">Cancel a Build</h2>

{{ api_data.cancel_build | api_endpoint }}

<h2 id="new-build">Trigger a new Build</h2>

<span class='label label-info'>Note:</span> For more about build parameters, read about [using parameterized builds](/docs/parameterized-builds)

{{ api_data.project_branch | api_endpoint }}

<h2 id="clear-cache">Clear Cache</h2>

{{ api_data.project_build_cache | api_endpoint}}

<h2 id="list-environment-variables">List Environment Variables</h2>

{{ api_data.list_environment_variables | api_endpoint}}

<h2 id="add-environment-variable">Add Environment Variables</h2>

{{ api_data.add_environment_variable | api_endpoint}}

<h2 id="get-environment-variable">Get Single Environment Variable</h2>

{{ api_data.get_environment_variable | api_endpoint}}

<h2 id="delete-environment-variable">Delete Environment Variables</h2>

{{ api_data.delete_environment_variable | api_endpoint}}

<h2 id="list-checkout-keys">List Checkout Keys</h2>

{{ api_data.list_checkout_keys | api_endpoint}}

<h2 id="new-checkout-key">New Checkout Key</h2>

{{ api_data.new_checkout_key | api_endpoint}}

<h2 id="get-checkout-key">Get Checkout Key</h2>

{{ api_data.get_checkout_key | api_endpoint}}

<h2 id="delete-checkout-key">Delete Checkout Key</h2>

{{ api_data.delete_checkout_key | api_endpoint}}


## Test Metadata

{{ api_data.test_metadata | api_endpoint }}

<span class='label label-info'>Note:</span> [Learn how to set up your builds to collect test metadata](/docs/test-metadata)

## SSH Keys

{{ api_data.ssh_key | api_endpoint }}
