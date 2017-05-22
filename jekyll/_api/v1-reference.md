---
layout: classic-docs
title: CircleCI API v1.1 Reference
categories: [reference]
description: Using the CircleCI API
---

The CircleCI API is a RESTful, fully-featured API that allows you to do almost 
anything in CircleCI. You can access all information and trigger all actions. 
The only thing we don't provide access to is billing functions, which must be 
done from the CircleCI web UI.

CircleCI 1.0 and 2.0 are supported by API version `1.1`.

## Getting started

1.  Add an API token from your [account dashboard](https://circleci.com/account/api).
2.  To test it,
    [View it in your browser](https://circleci.com/api/v1.1/me)
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

## F/OSS

If you have a Free / Open Source Software ([F/OSS](https://www.gnu.org/philosophy/free-sw.html)) project, and have the setting turned on in Advanced Settings in your project dashboard, some read-only /project endpoints will return the requested data without the need for a token. People will also be able to view the build results dashboard for the project as well.

## Accept header

If you specify no accept header, we'll return human-readable JSON with comments.
If you prefer to receive compact JSON with no whitespace or comments, add the `"application/json" Accept header`.
Using `curl`:

```
curl https://circleci.com/api/v1.1/me?circle-token=:token -H "Accept: application/json"
```

## API Summary

All CircleCI API endpoints begin with `"https://circleci.com/api/v1.1/"`.

### User
<dl>
<dt markdown="1">
  [GET: /me]({{ site.baseurl }}/api/me/)
</dt>
<dd>
  Provides information about the signed in user.
</dd>
</dl>

### Projects
<dl>
<dt markdown="1">
  [GET: /projects]({{ site.baseurl }}/api/projects)
</dt>
<dd>
  List of all the projects you're following on CircleCI, with build information organized by branch.
</dd>
<dt markdown="1">
  [POST: /project/:vcs-type/:username/:project/follow]({{ site.baseurl }}/api/follow)
</dt>
<dd>
  Follow a new project on CircleCI.
</dd>
<dt markdown="1">
  GET: /project/:vcs-type/:username/:project
</dt>
<dd>
  Build summary for each of the last 30 builds for a single git repo.
</dd>
<dt markdown="1">
  GET: /recent-builds
</dt>
<dd>
  Build summary for each of the last 30 recent builds, ordered by build_num.
</dd>
<dt>
  GET: /project/:vcs-type/:username/:project/:build_num
</dt>
<dd markdown="1">
  Full details for a single build. The response includes all of the fields from the build summary. This is also the payload for the [notification webhooks]( {{ site.baseurl }}/1.0/configuration/#notify), in which case this object is the value to a key named 'payload'.
</dd>
<dt>
  GET: /project/:vcs-type/:username/:project/:build_num/artifacts
</dt>
<dd>
  List the artifacts produced by a given build.
</dd>
<dt>
  POST: /project/:vcs-type/:username/:project/:build_num/retry
</dt>
<dd>
  Retries the build, returns a summary of the new build.
</dd>
<dt>
  POST: /project/:vcs-type/:username/:project/:build_num/cancel
</dt>
<dd>
  Cancels the build, returns a summary of the build.
</dd>
<dt>
  POST: /project/:vcs-type/:username/:project/:build_num/ssh-users
</dt>
<dd>
  Adds a user to the build's SSH permissions.
</dd>
<dt>
  POST: /project/:vcs-type/:username/:project/tree/:branch
</dt>
<dd markdown="1">
  Triggers a new build, returns a summary of the build. [Optional build parameters can be set as well]( {{ site.baseurl }}/1.0/parameterized-builds/).
</dd>
<dt>
  POST: /project/:vcs-type/:username/:project/ssh-key
</dt>
<dd>
  Create an ssh key used to access external systems that require SSH key-based authentication
</dd>
<dt>
  GET: /project/:vcs-type/:username/:project/checkout-key
</dt>
<dd>
  Lists checkout keys.
</dd>
<dt>
  POST: /project/:vcs-type/:username/:project/checkout-key
</dt>
<dd>
  Create a new checkout key.
</dd>
<dt>
  GET: /project/:vcs-type/:username/:project/checkout-key/:fingerprint
</dt>
<dd>
  Get a checkout key.
</dd>
<dt>
  DELETE: /project/:vcs-type/:username/:project/checkout-key/:fingerprint
</dt>
<dd>
  Delete a checkout key.
</dd>
</dl>

### Test Metadata
<dl>
<dt>
  DELETE: /project/:vcs-type/:username/:project/build-cache
</dt>
<dd>
  Clears the cache for a project.
</dd>
</dl>

### SSH Keys
<dl>
<dt>
  POST: /user/ssh-key
</dt>
<dd>
  Adds a CircleCI key to your GitHub User account.
</dd>
<dt>
  POST: /user/heroku-key
</dt>
<dd>
  Adds your Heroku API key to CircleCI, takes apikey as form param name.
</dd>
</dl>


