---
layout: classic-docs
title: "Dynamic Configuration"
description: "Docs page on using Setup Workflows for Dynamic Configuration"
version:
- Cloud
---

Instead of manually creating an individual CircleCI configuration per project, you might prefer in some cases to generate these configurations dynamically, depending on specific [pipeline parameters]({{ site.baseurl }}/2.0/pipeline-variables/) or file-paths.

CircleCI's dynamic configuration feature allows you to:

- Execute conditional workflows/commands
- Pass pipeline parameter values and/or generate additional configuration
- Trigger separate `config.yml` configurations which exist outside the default parent `.circleci/` directory

This becomes particularly useful in cases where your team is using a monorepo, or a single repository, as opposed to using multiple repositories to store your code. In the case of using a monorepo, it would be optimal to only trigger certain builds in specific areas of your project. Otherwise, all of your microservices/sub-projects would go through the entirety of your build, test, and deployment processes when any single update is introduced.

## Getting started with dynamic config in CircleCI
{: #getting-started-with-dynamic-config-in-circleci }

To get started with Dynamic Config in CircleCI:

1. In the **Projects** dashboard from the CircleCI web application, select your project.
2. Click the **Project Settings** button in the upper-right corner.
3. On the left-hand panel, select **Advanced**.
4. Scroll to the **Enable dynamic config using setup workflows** setting, and toggle it to the "on" position, as shown below:

![Enable dynamic config in the UI]({{ site.baseurl }}/assets/img/docs/dynamic-config-enable.png)

5. While the steps above will make the feature available, your static `config.yml` will continue to work as normal. This feature will **not* be used until you add the key `setup` with a value of `true` to that `config.yml`.
  Add the key `setup: true` to the top-level of your parent configuration file (in the `.circleci/` directory). This will designate that `config.yml` as a `setup workflow` configuration.

When using dynamic configuration, at the end of the `setup workflow`, a `continue` job from the [`continuation` orb](https://circleci.com/developer/orbs/orb/circleci/continuation) must be called (**NOTE:** this does not apply if you desire to conditionally execute workflows or steps based on **updates to specified files**, as described in the [Configuration Cookbook]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified) example).

## How dynamic config works
{: #how-dynamic-config-works }

CircleCI's dynamic configuration feature uses a `setup workflow` configuration. A `setup workflow` can contain jobs that `setup` children pipelines through computed pipeline parameters, or by generating follow-up pipelines via pre-existing scripts. These computed pipeline parameters and/or generated `config.yaml` files can then be passed into an additional `config.yaml` that potentially exists in outside directories.

Behind the scenes, the continuation configuration is implemented as a call to a public pipeline continuation API. This API accepts a _continuation_ key, which is a secret, unique-per-pipeline key, that is automatically injected into the environment of jobs executed as part of a setup workflow. It also accepts a configuration string, as well as a set of pipeline parameters.

Note that:
- the setup phase requires `version: 2.1` or higher,
- a pipeline can only be continued once,
- a pipeline can only be continued within six hours of its creation,
- a pipeline cannot be continued with another setup configuration,
- there can only be one workflow in the setup configuration,
- pipeline parameters submitted at continuation time cannot overlap with pipeline parameters submitted at trigger time,
- pipeline parameters declared in the setup configuration must also be declared in the continuation configuration, and can be used at continuation time

For a basic example on how to use `setup workflows` for dynamic configuration generation, see the [Configuration Cookbook]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#dynamic-configuration).

## Dynamic configuration FAQs
{: #dynamic-config-faqs }

### Pipeline parameters
{: #pipeline-parameters }

**Q:** I thought pipeline parameters could only be used with the API?

**A:** Previously, this was true. But using our dynamic configuration feature, you can set pipeline parameters dynamically, before the pipeline is executed, triggered from both the API, or a webhook (A push event to your VCS).

### The continuation Orb
{: #the-continuation-orb }

**Q:** What is the `continuation` orb?

**A:** The `continuation` orb assists CircleCI users in managing the pipeline continuation process easily. The
`continuation` orb wraps an API call to [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline)
in an easy-to-use fashion. See the [`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation) orb
documentation for more information.

## What to read next
{: #what-to-read-next }
- Cookbook examples
  - [A basic example]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#a-basic-example)
  - [Execute specific `workflows` or `steps` based on which files are modified]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified)
- The [`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation) orb
- The [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline) API call

## Learn More
{: #learn-more }
Take the [dynamic configuration course](https://academy.circleci.com/dynamic-config?access_code=public-2021) with CircleCI Academy to learn more.
