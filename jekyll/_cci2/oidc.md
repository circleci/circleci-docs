---
layout: classic-docs
title: "Using OpenID Connect Tokens in Jobs"
short-title: "Using OpenID Connect"
description: "Learn how to use OpenID Connect ID tokens for access to compatible cloud services."
categories: [configuring-jobs]
---

In jobs using a context, CircleCI provides an OpenID Connect ID token in an environment variable. A job can use this to access compatible cloud services without a long-lived credential stored in CircleCI.

* TOC
{:toc}

## OpenID Connect ID token availability

In CircleCI jobs that use at least one context, the OpenID Connect ID token is available in the environment variable `CIRCLE_OIDC_TOKEN`.

[Add a context to a job]({{ site.baseurl }}/2.0/contexts/#creating-and-using-a-context) by adding the `context` key to the [`workflows`]({{ site.baseurl }}/2.0/configuration-reference/#workflows) section of your [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file:

```yaml
workflows:
  my-workflow:
    jobs:
      - run-tests:
          context:
            - my-context
```

## Setting up your cloud service

Consult your cloud service's documentation for how to add an identity provider, for example, AWS's [Creating OpenID Connect (OIDC) identity providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html) or Google Cloud Platform's [Configuring workload identity federation](https://cloud.google.com/iam/docs/configuring-workload-identity-federation#oidc).

The [OpenID Provider](https://openid.net/specs/openid-connect-core-1_0.html#Terminology) is unique to your organization. Its URL is `https://oidc.circleci.com/org/<organization-id>`, where `<organization-id>` is the UUID that represents your organization. Find it under your organization's settings.

The OpenID Connect ID tokens issued by CircleCI have a fixed audience (see `aud`, below), which is also the organization ID.

## Format of the OpenID Connect ID token

The OpenID Connect ID token contains the following standard [claims](https://openid.net/specs/openid-connect-core-1_0.html#IDToken):

* `iss`: the issuer. The issuer is specific to the CircleCI organization in which the job is being run. Its value is `"https://oidc.circleci.com/org/<organization-id>"` (a string), where `<organization-id>` is a UUID identifying the current job's project's organization.
* `sub`: the subject. This identifies who is running the CircleCI job and where. Its value is `"org/<organization-id>/project/<project-id>/user/<user-id>"` (a string), where `<organization-id>`, `<project-id>`, and `<user-id>` are UUIDs that identify the CircleCI organization, project, and user, respectively. The user is the CircleCI user that caused this job to run.
* `aud`: the audience. Currently, this is a fixed value `"<organization-id>"`, a string containing a UUID that identifies the job's project's organization, as above.
* `iat`: the time of issuance. This is the time the token was created, which is shortly before the job starts.
* `exp`: the expiration time. Its value is one hour after the time of issuance.

The OpenID Connect ID token also contains some [additional claims](https://openid.net/specs/openid-connect-core-1_0.html#AdditionalClaims) with extra metadata about the job:

* `oidc.circleci.com/project-id`: the ID of the project in which the job is running. Its value is a string containing a UUID identifying the CircleCI project.
* `oidc.circleci.com/context-ids`: an array of strings containing UUIDs that identify the context(s) used in the job. Currently, just one context is supported.
