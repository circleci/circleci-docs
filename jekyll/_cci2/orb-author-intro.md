---
layout: classic-docs
title: "Introduction to Authoring Orbs"
short-title: "Authoring Orbs Introduction"
description: "Starting point for how to author an orb"
categories: [getting-started]
order: 1
version:
- Cloud
- Server v3.x
---

* TOC
{:toc}

## Quick start
{: #quick-start }

Orbs take [reusable configuration]({{site.baseurl}}/orb-concepts/#orb-configuration-elements) and package it in a way that can be published to the [Orb Registry](https://circleci.com/developer/orbs) and imported into multiple configuration files. If you manage multiple, similar projects, consider abstracting out your config with orbs.

Before authoring an orb, it is recommended that you become familiar with the [CircleCI config]({{site.baseurl}}/config-intro/) and authoring [parameterized reusable config elements]({{site.baseurl}}/reusing-config/) pages.

Orbs consist of three main elements:

* [Commands]({{site.baseurl}}/orb-concepts/#commands)
* [Jobs]({{site.baseurl}}/orb-concepts/#executors)
* [Executors]({{site.baseurl}}/orb-concepts/#jobs)

Practice with [inline orbs]({{site.baseurl}}/reusing-config/#writing-inline-orbs). Inline orbs can be defined within a single config file for easy and quick testing.

Orb authors automatically agree to the CircleCI [Code Sharing Terms of Service](https://circleci.com/legal/code-sharing-terms/). All publicly published orbs are made available on the Orb Registry under the [MIT License agreement](https://opensource.org/licenses/MIT). For more information, see [Orb Licensing](https://circleci.com/developer/orbs/licensing).
{: class="alert alert-success"}

## Getting started
{: #getting-started }

### Orb CLI
{: #orb-cli }

To begin creating orbs, you will need to [set up the CircleCI CLI]({{site.baseurl}}/local-cli/#installation) on your local machine, with a [personal access token](https://app.circleci.com/settings/user/tokens). For a full list of orb-related commands inside the CircleCI CLI, visit [CircleCI CLI help](https://circleci-public.github.io/circleci-cli/circleci_orb.html).

### Permissions matrix
{: #permissions-matrix }

Orb CLI commands are scoped to different user permission levels, set by your VCS. You are the owner of your own organization. If you are authoring or publishing orbs for a namespace owned by another organization, you may require assistance from your organization admin:

| Orb Command                                | Permission Scope |
|--------------------------------------------|------------------|
| `circleci namespace create`                | Owner            |
| `circleci orb init`                        | Owner            |
| `circleci orb create`                      | Owner            |
| `circleci orb publish` development version | Member           |
| `circleci orb publish` production version  | Owner            |
{: class="table table-striped"}

### Register a namespace
{: #register-a-namespace }

Every organization registered on CircleCI is able to claim **one** unique [namespace]({{site.baseurl}}/orb-concepts/#namespaces). This includes your personal organization and any organization you are a member of. As each organization or user account is limited to a single namespace, in order to register the namespace for an organization you must be the _owner_ of the organization.

Enter the following command to claim your namespace, if you have not yet claimed one:
```shell
circleci namespace create <name> --org-id <your-organization-id>
```

**Note:** If you need help finding your organization ID, visit the [Introduction to the CircleCI Web App]({{site.baseurl}}/introduction-to-the-circleci-web-app) page.

## Next steps
{: #next-steps }

* Continue on to the [Orb Authoring Process]({{site.baseurl}}/orb-author/) guide for information on developing your orb.
* Alternatively, to find out more about orbs read the [Orb Concepts]({{site.baseurl}}/orb-concepts/) page.
