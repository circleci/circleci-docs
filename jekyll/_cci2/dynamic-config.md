---
layout: classic-docs
title: "Dynamic Configuration"
description: "Docs page on using Setup Workflows for Dynamic Configuration"
version:
- Cloud
---

You may find that instead of manually creating each and every individual CircleCI configuration per project,
you would prefer to generate these configurations dynamically, depending on specific [pipeline]({{ site.baseurl }}/2.0/concepts/#pipelines)
parameters or file-paths.

This becomes particularly useful in cases where your team is using a monorepo, or a single repository, as opposed to
using multiple repositories to store your code. In the case of using a monorepo, it is of course optimal to only trigger
specific builds in specific areas of your project. Otherwise, all of your microservices/sub-projects will go through 
the entirety of your build, test, and deployment processes when any single update is introduced.

In both of these (and many other) use cases, automatic, dynamic generation of your configuration files will optimize your
CircleCI experience and save your team both time and money.

CircleCI's dynamic configuration feature uses a `setup workflow` configuration. A `setup workflow` can contain jobs that
`setup` children pipelines through computed pipeline parameters, or by generating follow-up pipelines via pre-existing scripts.
These computed pipeline parameters and/or generated `config.yaml` files can then be passed into an additional `config.yaml`
that potentially exists in outside directories.

In summary, CircleCI's dynamic configuration allows you to:

- Execute conditional workflows/commands
- Pass pipeline parameter values and/or generate additional configuration
- Trigger separate `config.yml` configurations which exist outside the default parent `.circleci/` directory

To use our dynamic configuration feature, you can add the key `setup` with a value of `true` to the top-level of your 
parent configuration file (in the `.circleci/` directory). This will designate that `config.yaml` as a `setup workflow` 
configuration, enabling you and your team to get up and running with dynamic configuration.

See the [Getting started](#getting-started-with-dynamic-config-in-circleci) section below for more 
information.

## Getting started with dynamic config in CircleCI
{: #getting-started-with-dynamic-config-in-circleci }

To get started with Dynamic Config in CircleCI:

- Select the project you are interested in, in the **Projects** dashboard from the CircleCI application.
- Click the **Project Settings** button in the upper-right corner.
- On the left-hand panel, select **Advanced**.
- Towards the bottom, toggle the switch for **Enable dynamic config using setup workflows** to the "on" position, as shown below:

![Enable dynamic config in the UI]({{ site.baseurl }}/assets/img/docs/dynamic-config-enable.png)

Now, your project has the ability to dynamically generate and update configuration.

When using dynamic configuration, at the end of the `setup workflow`, a `continue` job from the [`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation)
[`orb`]({{ site.baseurl }}/2.0/orb-intro/) must be called (**NOTE:** this does not apply if you desire to conditionally execute
workflows or steps based on updates to specified files, as described in the [Configuration Cookbook]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified) example).

For a basic example on how to use `setup workflows` for dynamic configuration generation, see the [Configuration Cookbook]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#dynamic-configuration).
Included in the cookbook are other more in-depth examples, which will be updated as this feature matures.

For a more in-depth explanation on the behind-the-scenes pipeline creation/continuation process when using CircleCI's dynamic configuration,
see our [public GitHub repository](https://github.com/CircleCI-Public/api-preview-docs/blob/master/docs/setup-workflows.md#concepts).

## Dynamic configuration FAQs
{: #dynamic-config-faqs }

### Pipeline parameters
{: #pipeline-parameters }

**Q:** I thought pipeline parameters could only be used with the API?

**A:** Previously, this was true. But using our dynamic configuration feature, you can set pipeline parameters dynamically,
before the pipeline is executed, triggered from both the API, or a webhook (A push event to your VCS).

### Scheduled workflows
{: #scheduled-workflows }

**Q:** What about dynamic configuration in [scheduled workflows](https://circleci.com/docs/2.0/workflows/#scheduling-a-workflow)?

**A:** Dynamic configuration cannot currently be used with the existing scheduler. However, the next version of our scheduler will enable you to trigger pipelines which have dynamic configuration.

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
