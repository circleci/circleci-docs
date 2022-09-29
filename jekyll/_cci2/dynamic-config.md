---
layout: classic-docs
title: "Dynamic Configuration"
description: "Docs page on using Setup Workflows for Dynamic Configuration"
contentTags: 
  platform:
  - Cloud
---

Instead of manually creating an individual CircleCI configuration per project, you might prefer in some cases to generate these configurations dynamically, depending on specific [pipeline values]({{ site.baseurl }}/pipeline-variables/) or file paths.

CircleCI's dynamic configuration feature allows you to:

- Execute conditional workflows/commands.
- Pass pipeline parameter values and/or generate additional configuration.
- Trigger separate `config.yml` configurations, which exist outside the default parent `.circleci/` directory.

This becomes particularly helpful in cases where your team is using a monorepo, or a single repository, as opposed to using multiple repositories to store your code.

For instance, you may want to use dynamic configuration to trigger certain workflows based on which files or subdirectories have changed in your repository. Otherwise, all of your microservices/sub-projects would go through the entirety of your build, test, and deployment processes when any single update is introduced. This scenario is also referred to as _path filtering_.

Another scenario in which you could use dynamic configuration is when your project consists of multiple modules, where each module requires a separate job. These jobs could be stored in multiple files as _fragments_ of a configuration. Instead of using one full `.circleci/config.yml` file, you could use dynamic configuration to combine these individual fragments into a full configuration when a pipeline is triggered. This scenario can also be referred to as _config splitting_.

## Getting started with dynamic config in CircleCI
{: #getting-started-with-dynamic-config-in-circleci }

To get started with Dynamic Config in CircleCI:

1. In the **Projects** dashboard from the CircleCI web application, select your project.
2. Click the **Project Settings** button in the upper-right corner.
3. On the left-hand panel, select **Advanced**.
4. Scroll to the **Enable dynamic config using setup workflows** setting, and toggle it to the "on" position, as shown below:
  <br>
  ![Enable dynamic config in the UI]({{ site.baseurl }}/assets/img/docs/dynamic-config-enable.png)

5. While the steps above will make the feature available, your static `config.yml` will continue to work as normal. This feature will **not** be used until you add the `setup` key with a value of `true` to that `config.yml`.
  Adding the key `setup: true` to the top level of your parent configuration file (in the `.circleci/` directory) will designate that `config.yml` as a setup configuration.
6. At the end of the `setup` workflow, a `continue` job from the [`continuation` orb](https://circleci.com/developer/orbs/orb/circleci/continuation) must be called. **NOTE:** This does _not_ apply if you want to conditionally execute workflows or steps based on **updates to specified files** ("path filtering"), as described in the [Using Dynamic Configuration]({{ site.baseurl }}/using-dynamic-configuration) how-to guide.

## How dynamic config works
{: #how-dynamic-config-works }

CircleCI's dynamic configuration feature uses setup workflows. A _setup workflow_ can contain jobs that compute pipeline parameters, which can then be passed into an additional configuration that potentially exists in other directories. A setup workflow can also be used to generate new configurations via pre-existing scripts. In any case, the setup workflow continues the pipeline on to the desired next configuration.

Behind the scenes, the _continuation_ configuration is implemented as a call to a public _pipeline continuation_ API. This API accepts a _continuation key_, which is a secret, unique-per-pipeline key that is automatically injected into the environment of jobs executed as part of the initial setup workflow. The API also accepts a configuration string, as well as a set of pipeline parameters.

Note that:
- The setup phase requires `version: 2.1` or higher.
- A pipeline can only be continued once (that is, a pipeline cannot be continued with another setup configuration).
- A pipeline can only be continued within six hours of its creation.
- The setup configuration can only include one workflow.
- Pipeline parameters submitted at continuation time cannot overlap with pipeline parameters submitted at trigger (setup) time.
- Pipeline parameters declared in the setup configuration must also be declared in the continuation configuration. These parameters can be used at continuation time.

For a basic example on how to use setup workflows for dynamic configuration generation, see the [Using Dynamic Configuration]({{ site.baseurl }}/using-dynamic-configuration) how-to guide.

## Dynamic configuration FAQs
{: #dynamic-config-faqs }

### Pipeline parameters
{: #pipeline-parameters }

**Q:** I thought pipeline parameters could only be used with the API?

**A:** Previously, this was true. With the dynamic configuration feature, you can now set pipeline parameters dynamically, before the pipeline is executed (triggered from either the API or a webhook—a push event to your VCS).

### Custom executors
{: #custom-executors}

**Q:** Can I use a custom executor?

**A:** Custom executors can be used, but require certain dependencies to be installed for the continuation step to work (currently: `curl`, `jq`).

### The continuation orb
{: #the-continuation-orb }

**Q:** What is the `continuation` orb?

**A:** The `continuation` orb assists you in managing the pipeline continuation process. The
`continuation` orb wraps an API call to [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline). Refer to the [`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation) orb
documentation for more information.

**Q:** Is it possible to **not** use the continuation orb?

**A:** If you have special requirements not covered by the continuation orb, you can implement the same functionality in other ways. Refer to the [orb source code](https://circleci.com/developer/orbs/orb/circleci/continuation#orb-source) to learn how the continuation functionality is implemented with the orb.

## Next Steps
{: #what-to-read-next }
- A how-to guide for [Using Dynamic Configuration]({{ site.baseurl }}/using-dynamic-configuration/)
- The [`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation) orb
- The [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline) API call
- Take the [dynamic configuration course](https://academy.circleci.com/dynamic-config?access_code=public-2021) with CircleCI Academy to learn more.

