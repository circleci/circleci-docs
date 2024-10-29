---
layout: classic-docs
title: "Optimization reference"
description: "Learn about ways to optimize your CircleCI pipelines"
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

This page provides an overview of the various ways you can optimize your CircleCI configuration. Each optimization method is described briefly, along with possible use cases.

## Optimize your data usage
{: #data}

### Custom storage controls
{: #custom-storage-controls }

The [CircleCI web app](https://app.circleci.com/) provides controls to customize the storage retention period for workspaces, caches, and artifacts. You can find these settings by navigating to **Plan > Usage Controls**. By default, the storage periods are set to the maximum: 30 days for artifacts, and 15 days for caches and workspaces.

See the [Persisting Data]({{site.baseurl}}/persist-data/#custom-storage-usage) page for more information on custom storage settings.

### Workspaces
{: #workspaces }

Workspaces are used to pass along data that is _unique to a run_ and is needed for _downstream jobs_. So, if you are using workflows, a job run earlier in your build might fetch data and then make it _available later_ for jobs that run later in a build.

To persist data from a job and make it available to downstream jobs via the [`attach_workspace`]({{site.baseurl}}/configuration-reference#attachworkspace) key, configure the job to use the [`persist_to_workspace`]({{site.baseurl}}/configuration-reference#persisttoworkspace) key. Files and directories named in the `paths:` property of `persist_to_workspace` will be uploaded to the workflow’s temporary workspace relative to the directory specified with the root key. The files and directories are then uploaded and made available for subsequent jobs (and re-runs of the workflow) to use.

* Read more on the [Workspaces]({{site.baseurl}}/workspaces/) page.

## Speed up pipelines
{: #speed}

### Docker image choice
{: #docker-image-choice }

Choosing the right docker image for your project can have huge impact on build time. For example, choosing a basic language image means dependencies and tools need to be downloaded each time your pipeline is run, whereas, if you choose or build an image that has these dependencies and tools already installed, this time will be saved for each build run. When configuring your projects and specifying images, consider the following options:

* CircleCI provides a range of [convenience images](/docs/circleci-images/), typically based on official Docker images, but with a range of useful language tools pre-installed.
* You can create [custom images](/docs/custom-images/), maximizing specificity for your projects. To help with this we provide [guidance for building images manually](/docs/custom-images/#creating-a-custom-image-manually).

### Docker layer caching
{: #docker-layer-caching }

Docker layer caching is a feature that can help to reduce the _build time_ of a Docker image in your build. DLC is useful if you find yourself frequently building Docker images as a regular part of your CI/CD process.

DLC is similar to _caching dependencies_, in that it _saves_ the image layers that you build within your job, making them available on subsequent builds.

* Read more on the [Docker Layer Caching]({{site.baseurl}}/docker-layer-caching) page.

### Caching dependencies
{: #caching-dependencies }

Caching should be one of the first things you consider when trying to optimize your jobs. If a job fetches data at any point, it is likely that you can make use of caching. A common example is the use of a package/dependency manager. If your project uses Yarn, Bundler, or Pip, for example, the dependencies downloaded during a job can be cached for later use rather than being re-downloaded on every build.

* Read more on the [Caching Dependencies]({{site.baseurl}}/caching) page.

### Workflows
{: #workflows }

Workflows provide a means to define a collection of jobs and their run order. If at any point in your configuration you see a step where two jobs could happily run independent of one another, workflows may be helpful. Workflows also provide several other features to augment and improve your CI/CD configuration. Read more about workflows on the [Workflow]({{site.baseurl}}/workflows/) page.

* You can view examples of workflows in the [CircleCI demo workflows repo](https://github.com/CircleCI-Public/circleci-demo-workflows/).

### Parallelism
{: #parallelism }

If your project has a large test suite, you can configure your build to use [`parallelism`]({{site.baseurl}}/configuration-reference#parallelism) together with either [CircleCI's test splitting functionality]({{site.baseurl}}/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests), or a [third party application or library]({{site.baseurl}}/parallelism-faster-jobs/#other-ways-to-split-tests) to split your tests across multiple machines. CircleCI supports automatic test allocation across machines on a file-basis, however, you can also manually customize how tests are allocated.

* Read more about splitting tests on the [Parallelism]({{site.baseurl}}/parallelism-faster-jobs/) page.

### Resource class
{: #resource-class }

Using `resource_class`, it is possible to specify CPU and RAM resources for each job. For a full list of available resource class options for CircleCI cloud see the [configuration reference](/docs/configuration-reference/#resourceclass). For an equivalent list for CircleCI server installations, contact your system administrator.

* Read more about resource classes on the [resource class overview](/docs/resource-class-overview/) page.

## Optimize your configuration files
{: #configuraiton }

### Dynamic configuration
{: #dynamic-configuration}

Use dynamic configuration to generate CircleCI config files dynamically, depending on specific pipeline values or file paths. Dynamic config allows you to:

* Execute conditional workflows/commands.

* Pass pipeline parameter values and/or generate additional configuration.

* Trigger separate config.yml configurations, which exist outside the default parent .circleci/ directory.

Read more about dynamic configuration on the [Dynamic configuration](/docs/dynamic-config/) overview page.

### Orbs
{: #orbs }

Orbs are reusable packages of parameterizable configuration that can be used in any project. Use orbs to:

* Simplify configuration (`.circleci/_config.yml`)
* Automate repeated processes
* Accelerate project setup
* Simplify integration with third-party tools

Read more about orbs on the [Orbs overview](/docs/orb-intro/) page.

## See also
{: #see-also }

- [Persisting Data]({{site.baseurl}}/persist-data)
- For a complete list of customizations, view the [Configuration Reference]({{site.baseurl}}/configuration-reference/) page.
- For information about how Yarn can potentially speed up builds and reduce errors, view the [Caching Dependencies]({{site.baseurl}}/caching/#basic-example-of-package-manager-caching) page.
- Coinbase published an article titled [Continuous Integration at Coinbase: How we optimized CircleCI for speed and cut our build times by 75%](https://blog.coinbase.com/continuous-integration-at-coinbase-how-we-optimized-circleci-for-speed-cut-our-build-times-by-378c8b1d7161).
