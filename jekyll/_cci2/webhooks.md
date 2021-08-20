---
layout: classic-docs
title: "Webhooks"
short-title: "Using Webhooks to subscribe to CircleCI events"
description: "Using Webhooks to subscribe to CircleCI events"
version:
- Cloud
---

## Overview
{: #overview}

A webhook allows you to connect a platform you manage (either an API you create
yourself, or a third party service) to a stream of future _events_.

Setting up a Webhook on CircleCI enables you to receive information (referred to
as _events_) from CircleCI, as they happen. This can help you avoid polling the
API or manually checking the CircleCI web application for desired information.

The rest of this document will detail how to set up a webhook as well as the
shape of events that will be sent to your webhook destination.

**Note:** The Webhooks feature on CircleCI is currently in preview; documentation and features may change or be added to.

## Use cases
{: #use-cases}

Webhooks can be leveraged for various purposes. Some possible examples might include:

- Building a custom dashboard to visualize or analyze workflow/job events.
- Sending data to incident management tools (such as Pagerduty).
- Use tools like [Airtable]({{site.baseurl}}/2.0/webhooks-airtable) to capture data and visualize it.
- Send events to communication apps, such as Slack.
- Use webhooks to be alerted when a workflow is cancelled, then use the API to rerun the workflow.
- Trigger internal notification systems to alert people when workflows/jobs complete.
- Build your own automation plugins and tools.

## Setting up a hook
{: #setting-up-a-hook}

Webhooks are set up on a per-project basis. To get started:

1. Visit a specific project you have setup on CircleCI.
1. Click on **Project Settings**.
1. In the sidebar of your Project Settings, click on **Webhooks**.
1. Click **Add Webhook**.
1. Fill out the Webhook form (the table below describes the fields and their intent):
1. Provided your receiving API or third party service is set up, click **Test Ping Event** to dispatch a test event.

| Field                  | Required? | Intent                                                                                      |
|------------------------|-----------|---------------------------------------------------------------------------------------------|
| Webhook name           | Y         | The name of your webhook                                                                    |
| URL                    | Y         | The URL the webhook will make POST requests to.                                             |
| Certificate Validation | Y         | Ensure the receiving host has a valid SSL certificate before sending an event <sup>1</sup>. |
| Secret token           | Y         | Used by your API/platform to validate incoming data is from CircleCI.                       |
| Select an event        | Y         | You must select at least one event that will trigger a webhook.                             |
{: class="table table-striped"}

<sup>1</sup>Only leave this unchecked for testing purposes.

## Payload signature
{: #payload-signature}

You should validate incoming webhooks to verify that they are coming from
CircleCI. To support this, when creating a webhook, you can optionally provide a
secret token. Each outgoing HTTP request to your service will contain a
`circleci-signature` header. This header will consist of a comma-separated list
of versioned signatures.

```
POST /uri HTTP/1.1
Host: your-webhook-host
circleci-signature: v1=4fcc06915b43d8a49aff193441e9e18654e6a27c2c428b02e8fcc41ccc2299f9,v2=...,v3=...
```

Currently, the latest (and only) signature version is v1. You should *only*
check the latest signature type to prevent downgrade attacks.

The v1 signature is the HMAC-SHA256 digest of the request body, using the
configured signing secret as the secret key.

Here are some example signatures for given request bodies:

| Body                           | Secret Key       | Signature                                                          |
| ------------------------------ | ---------------- | ------------------------------------------------------------------ |
| `hello world`                  | `secret`         | `734cc62f32841568f45715aeb9f4d7891324e6d948e4c6c60c0621cdac48623a` |
| `lalala`                       | `another-secret` | `daa220016c8f29a8b214fbfc3671aeec2145cfb1e6790184ffb38b6d0425fa00` |
| `an-important-request-payload` | `hunter123`      | `9be2242094a9a8c00c64306f382a7f9d691de910b4a266f67bd314ef18ac49fa` |
{: class="table table-striped"}

The following is an example of how you might validate signatures in Python:

```
import hmac

def verify_signature(secret, headers, body):
    # get the v1 signature from the `circleci-signature` header
    signature_from_header = {
        k: v for k, v in [
            pair.split('=') for pair in headers['circleci-signature'].split(',')
        ]
    }['v1']

    # Run HMAC-SHA256 on the request body using the configured signing secret
    valid_signature = hmac.new(bytes(secret, 'utf-8'), bytes(body, 'utf-8'), 'sha256').hexdigest()

    # use constant time string comparison to prevent timing attacks
    return hmac.compare_digest(valid_signature, signature_from_header)

# the following will return `True`
verify_signature(
    'secret',
    {
        'circleci-signature': 'v1=773ba44693c7553d6ee20f61ea5d2757a9a4f4a44d2841ae4e95b52e4cd62db4'
    },
    'foo',
)

# the following will return `False`
verify_signature(
    'secret',
    {
        'circleci-signature': 'v1=not-a-valid-signature'
    },
    'foo',
)
```

## Event Specifications
{: #event-specifications}

CircleCI currently offers webhooks for the following events:

| Event type         | Description                                              | Potential statuses                                       | Included sub-entities                          |
|--------------------|----------------------------------------------------------|----------------------------------------------------------|------------------------------------------------|
| workflow-completed | A workflow has reached a terminal state                  | "success", "failed", "error", "canceled", "unauthorized" | project, organization, workflow, pipeline      |
| job-completed      | A job has reached a terminal state                       | "success", "failed", "canceled", "unauthorized"          | project, organization, workflow, pipeline, job |
{: class="table table-striped"}

## Common top level keys
{: #common-top-level-keys}

Each Webhook will have some common data as part of the event:

| Field       | Description                                                                                        | Type   |
|-------------|----------------------------------------------------------------------------------------------------|--------|
| id          | ID used to uniquely identify each event from the system (the client can use this to dedupe events) | String |
| happened_at | ISO 8601 timestamp representing when the event happened                                            | String |
| webhook     | A map of metadata representing the webhook that was triggered                                      | Map    |
{: class="table table-striped"}

**Note:** The event payloads are open maps, meaning new fields may be added to
maps in the webhook payload without considering it a breaking change.


## Common sub-entities
{: #common-sub-entities}

The next sections describe the payloads of different events offered with
CircleCI webhooks. The schema of these webhook events will share often share
data with other webhooks - we refer to these as common maps of data as
"sub-entities". For example, when you receive an event payload for the
`job-completed` webhook, it will contains maps of data for your *project,
organization, job, workflow and pipeline*.

Let's look at some of the common sub-entities that will appear across various webhooks:

### Project
{: #project}

Data about the project associated with the webhook event.

| Field | Always present? | Description                                                                                                   |
|-------|-----------------|---------------------------------------------------------------------------------------------------------------|
| id    | yes             | Unique ID of the project                                                                                      |
| slug  | yes             | String that can be used to refer to a specific project in many of CircleCI's APIs (e.g. "gh/circleci/web-ui") |
| name  | yes             | Name of the project (e.g. "web-ui")                                                                           |
{: class="table table-striped"}

### Organization
{: #organization}

Data about the organization associated with the webhook event.

| Field | Always present? | Description                                |
|-------|-----------------|--------------------------------------------|
| id    | yes             | Unique ID of the organization              |
| name  | yes             | Name of the organization (e.g. "circleci") |
{: class="table table-striped"}

### Job
{: #job}

A job typically represents one phase in a CircleCI workload (e.g. "build", "test", or "deploy") and contains a series of steps.

| Field       | Always present? | Description                                                                                                  |
|-------------|-----------------|--------------------------------------------------------------------------------------------------------------|
| id          | yes             | Unique ID of the job                                                                                         |
| number      | yes             | An auto-incrementing number for the job, sometimes used in CircleCI's APIs to identify jobs within a project |
| name        | yes             | Name of the job as defined in .circleci/config.yml                                                           |
| status      | yes             | Current status of the job                                                                                    |
| started\_at | yes             | When the job started running                                                                                 |
| stopped\_at | no              | When the job reached a terminal state (if applicable)                                                        |
{: class="table table-striped"}


### Workflow
{: #workflow}

Workflows contain many jobs, which can run in parallel and/or have dependencies
between them. A single git-push can trigger zero or more workflows, depending on
the CircleCI configuration (but typically one will be triggered).


| Field       | Always present? | Description                                                        |
|-------------|-----------------|--------------------------------------------------------------------|
| id          | Yes             | Unique ID of the workflow                                          |
| name        | Yes             | Name of the workflow as defined in .circleci/config.yml            |
| status      | No              | Current status of the workflow. Not included in job-level webhooks |
| created\_at | Yes             | When the workflow was created                                      |
| stopped_at  | No              | When the workflow reached a terminal state (if applicable)         |
| url         | Yes             | URL to the workflow in CircleCI's UI                               |
{: class="table table-striped"}

### Pipeline
{: #pipeline}

Pipelines are the most high-level unit of work, and contain zero or
more workflows. A single git-push always triggers up to one pipeline. Pipelines
can also be triggered manually through the API.

| Field       | Always present? | Description                                                                       |
|-------------|-----------------|-----------------------------------------------------------------------------------|
| id          | Yes             | Globally unique ID of the pipeline                                                |
| number      | Yes             | Number of the pipeline, which is auto-incrementing / unique per project           |
| created\_at | Yes             | When the pipeline was created                                                     |
| trigger     | Yes             | A map of metadata about what caused this pipeline to be created -- see below      |
| vcs         | No              | A map of metadata about the git commit associated with this pipeline -- see below |
{: class="table table-striped"}

### Trigger
{: #trigger}

| Field    | Always present? | Description                                                         |
|----------|-----------------|---------------------------------------------------------------------|
| type     | yes             | How this pipeline was triggered (e.g. "webhook", "api", "schedule") |
| actor.id | No              | The user who triggered the pipeline, if there is one                |
{: class="table table-striped"}


### VCS
{: #vcs}

Note: The vcs map or its contents may not always be provided in cases where
the information doesn't apply, such as future scenarios in which a pipeline
isn't associated with a git commit.

| Field                  | Always present? | Description                                                                                                        |
|------------------------|-----------------|--------------------------------------------------------------------------------------------------------------------|
| target_repository_url  | no              | URL to the repository building the commit                                                                          |
| origin_repository_url  | no              | URL to the repository where the commit was made (this will only be different in the case of a forked pull request) |
| revision               | no              | Git commit being built                                                                                             |
| commit.subject         | no              | Commit subject (first line of the commit message)                                                                  |
| commit.body            | no              | Commit body (subsequent lines of the commit message)                                                               |
| commit.author.name     | no              | Name of the author of this commit                                                                                  |
| commit.author.email    | no              | Email address of the author of this commit                                                                         |
| commit.authored\_at    | no              | Timestamp of when the commit was authored                                                                          |
| commit.committer.name  | no              | Name of the committer of this commit                                                                               |
| commit.committer.email | no              | Email address of the committer of this commit                                                                      |
| commit.committed_at    | no              | Timestamp of when the commit was committed                                                                         |
| branch                 | no              | Branch being built                                                                                                 |
| tag                    | no              | Tag being built (mutually exclusive with "branch")                                                                 |
{: class="table table-striped"}
