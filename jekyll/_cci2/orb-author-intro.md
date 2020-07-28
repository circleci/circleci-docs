---
layout: classic-docs
title: "Introduction to Authoring Orbs"
short-title: "Authoring Orbs Introduction"
description: "Starting point for how to authoring an orb"
categories: [getting-started]
order: 1
---

* TOC
{:toc}

## Quick Start

Orbs take [reusable configuration]({{site.baseurl}}/2.0/orb-concepts/#reusable-configuration) and package it in a way that can be published to and accessed on the [Orb Registry](https://circleci.com/orbs/registry/) so that they may be imported in multiple configuration files. If you manage multiple similar projects, consider abstracting out your config with orbs.

Before authoring an orb, it is recommended to become familiar with [CircleCI config]({{site.baseurl}}/2.0/configuration-reference/#section=configuration) and authoring [parameterized reusable config elements]({{site.baseurl}}/2.0/reusing-config/#section=configuration).

Orbs consist of three main elements:

* [Commands]({{site.baseurl}}/2.0/reusing-config//#authoring-reusable-commands)
* [Jobs]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs)
* [Executors]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors)

Practice with [inline orbs]({{site.baseurl}}/2.0/reusing-config/#writing-inline-orbs). Inline orbs can be defined within a single config file for easy and quick testing.

Orb Authors agree to the CircleCI [Code Sharing Terms of Service](https://circleci.com/legal/code-sharing-terms/). All published orbs are made available publicly on the Orb Registry under the [MIT License agreement](https://opensource.org/licenses/MIT). For more information, see [Orb Licensing](https://circleci.com/orbs/registry/licensing).


## Permissions Matrix

Different commands within the Orb CLI carry different permission scopes. If you are authoring an orb within an organization besides your own personal account, these permission scopes may effect you.

| Orb Command                                | Permission Scope |
|--------------------------------------------|------------------|
| `circleci namespace create`                | Owner            |
| `circleci orb create`                      | Owner            |
| `circleci orb publish` development version | Member           |
| `circleci orb publish` production version  | Owner            |
{: class="table table-striped"}

## Getting Started

To begin creating orbs, you will need to [setup the CircleCI CLI]({{site.baseurl}}/2.0/local-cli/#installation) on your local machine, with a [personal access token](https://app.circleci.com/settings/user/tokens). For a full list of orb-related commands inside the CircleCI CLI, visit [CircleCI CLI help](https://circleci-public.github.io/circleci-cli/circleci_orb.html).

_See Also: [Orbs Concepts]({{site.baseurl}}/2.0//orb-concepts/)_

### Register a Namespace

Every organization registered on CircleCI is able to claim **one** unique [namespace]({{site.baseurl}}/2.0/orb-concepts/#namespaces). This includes your personal organization and any organization you are a member of. As each organization is limited to a single namespace, In order to register the namespace for an organization you must be the _owner_ of the organization.

Enter the following command to claim your namespace, if you have not yet claimed one.
- `circleci namespace create <name> <vcs-type> <org-name> [flags]`

### Create an Orb

Within your namespace create an orb to which you will eventually push your orb source code.

Run the following command to create an empty orb within your namespace.

- `circleci orb create <namespace>/<orb> [flags]`

### Next Steps

- Continue on to [Orb authoring]({{site.baseurl}}/2.0/orb-author/) for details on writing your orb.


## See Also
{:.no_toc}

- [Orb authoring]({{site.baseurl}}/2.0/orb-author/)
- [Orb author FAQ]({{site.baseurl}}/2.0/orb-author-faq/)
