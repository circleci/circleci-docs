---
layout: classic-docs
title: "Dynamic Configuration"
description: "Docs page on using Setup Workflows for Dynamic Configuration"
version:
- Cloud
---

You may find that instead of manually creating each and every individual CircleCI configuration per project,
you would prefer to generate these configurations dynamically, before the build begins or is triggered. Or, you may
prefer to set a specific [pipeline's]({{ site.baseurl }}/2.0/concepts/#pipelines) configuration or parameters 
before a build is run.

This becomes particularly useful in cases where your team is using a monorepo, or a single repository, as opposed to
using multiple repositories to store your code. In the case of using a monorepo, it is of course optimal to only trigger 
specific builds in specific areas of your project. Otherwise, your repository will go through the entirety of 
your build, test, and deployment processes when any single update is introduced.

To dynamically generate your configuration (or set a pipeline's configuration/parameters) before a project's build, 
you can set the key`setup` to `true` in the top-level of your configuration file, thus designating that configuration as a 
`setup workflow`. See the [Getting Started](#getting-started-with-dynamic-config-in-circleci) section below for more 
information.

## Getting Started with Dynamic Config in CircleCI
{: #getting-started-with-dynamic-config-in-circleci }

To get started with Dynamic Config in CircleCI: 

- Select the project you are interested in, in the **Projects** dashboard from the CircleCI application.
- Click the **Project Settings** button in the upper-right corner.
- On the left-hand panel, select **Advanced**.
- Towards the bottom, toggle the switch for **Run Setup Workflows** to the "on" position (it should be blue)

<!-- INCLUDE A SCREENSHOT AFTER GA -->

Now, your project has the ability to run a `setup workflow`, or a [`workflow`]({{ site.baseurl }}/2.0/workflows/) that
can set up the pipeline by any of the following means:

- Generating a configuration file via an existing script
- Setting pipeline parameters
- Selecting existing configuration files

At the end of the `setup workflow`, a `continue` job from the [`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation) 
[`orb`]({{ site.baseurl }}/2.0/orb-intro/) must be called (**NOTE:** this does not apply if you desire to conditionally execute
workflows or steps based on updates to specified files, as described in the [Configuration Cookbook]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified) example).

For a basic example on how to use `setup workflows` for Dynamic Configuration generation, see the [Configuration Cookbook]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#dynamic-configuration).
Included in the cookbook are other more in-depth examples, which will be updated as this feature matures.

For a more in-depth explanation on the behind-the-scenes pipeline creation/continuation process when dynamically generating configuration,
see our [public GitHub repository](https://github.com/CircleCI-Public/api-preview-docs/blob/master/docs/setup-workflows.md#concepts).

## Dynamic Configuration FAQs
{: #dynamic-config-faqs }

### Pipeline Parameters
{: #pipeline-parameters }

**Q:** I thought pipeline parameters could only be used with the API?

**A:** Previously, this was true. But using our Dynamic Configuration feature, you can set pipeline parameters dynamically, 
before the pipeline is executed, triggered from both the API, or a webhook (A push event to your VCS).

### The Continuation Orb
{: #the-continuation-orb }

**Q:** What is the `continuation` orb?

**A:** The `continuation` orb assists CircleCI users in managing the pipeline continuation process easily. The
`continuation` orb wraps an API call to [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline)
in an easy-to-use fashion. See the [`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation) orb
documentation for more information.

## What to Read Next
{: #what-to-read-next }

- [A Basic Example]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#a-basic-example)
- [Execute specific `workflows` or `steps` based on which files are modified]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified)
- The [`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation) orb
- The [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline) API call