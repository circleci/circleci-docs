---
layout: classic-docs
title: "Optimizations Overview"
short-title: "Optimizations Overview"
description: "CircleCI build optimizations"
categories: [getting-started]
order: 1
version:
- Cloud
- Server v3.x
- Server v2.x
---

This document provides an overview of ways to optimize your CircleCI configuration. Each optimization method will be described briefly, and present possible use cases for speeding up your jobs.

* TOC
{:toc}

**Warning:** Persisting data is project specific, and examples is this document are not meant to be copied and pasted into your project. The examples are meant to be guides to help you find areas of opportunity to optimize your own projects.
{: class="alert alert-warning"}

## Docker image choice
{: #docker-image-choice }

Choosing the right docker image for your project can have huge impact on build time. For example, choosing a basic language image means dependencies and tools need to be downloaded each time your pipeline is run, whereas, if you choose or build an image that has these dependencies and tools already installed, this time will be saved for each build run. When configuring your projects and specifying images, consider the following options:

* CircleCI provides a range of [convenience images](https://circleci.com/docs/2.0/circleci-images/#section=configuration), typically based on official Docker images, but with a range of useful language tools pre-installed.
* You can [create your own images](https://circleci.com/docs/2.0/custom-images/#section=configuration), maximizing specificity for your projects. To help with this we provide both a [Docker image build wizard](https://github.com/circleci-public/dockerfile-wizard), and [guidance for building images manually](https://circleci.com/docs/2.0/custom-images/#creating-a-custom-image-manually).

## Caching dependencies
{: #caching-dependencies }

Caching should be one of the first things you consider when trying to optimize your jobs. If a job fetches data at any point, it is likely that you can make use of caching. A common example is the use of a package/dependency manager. If your project uses Yarn, Bundler, or Pip, for example, the dependencies downloaded during a job can be cached for later use rather than being re-downloaded on every build.

* Consult the [Caching Dependencies]({{site.baseurl}}/2.0/caching) guide to learn more.

## Workflows
{: #workflows }

Workflows provide a means to define a collection of jobs and their run order. If at any point in your build you see a step where two jobs could happily run independent of one another, workflows may be helpful. Workflows also provide several other features to augment and improve your build configuration. Read more about workflows in the [Workflow]({{site.baseurl}}/2.0/workflows/) guide.

* You can view examples of workflows in the  [CircleCI demo workflows repo](https://github.com/CircleCI-Public/circleci-demo-workflows/).

## Workspaces
{: #workspaces }

**Note**: Using workspaces presumes that you are also using [Workflows](#workflows).

Workspaces are used to pass along data that is _unique to a run_ and is needed for _downstream jobs_. So, if you are using workflows, a job run earlier in your build might fetch data and then make it _available later_ for jobs that run later in a build.

To persist data from a job and make it available to downstream jobs via the [`attach_workspace`]({{site.baseurl}}/2.0/configuration-reference#attachworkspace) key, configure the job to use the [`persist_to_workspace`]({{site.baseurl}}/2.0/configuration-reference#persisttoworkspace) key. Files and directories named in the paths: property of `persist_to_workspace` will be uploaded to the workflow’s temporary workspace relative to the directory specified with the root key. The files and directories are then uploaded and made available for subsequent jobs (and re-runs of the workflow) to use.

* Read more in the [Workspaces]({{site.baseurl}}/2.0/workspaces/) guide.

* The [Workflows]({{site.baseurl}}/2.0/workflows/#using-workspaces-to-share-data-among-jobs) guide has additional information about using workspaces to share data among jobs.

## Parallelism
{: #parallelism }

If your project has a large test suite, you can configure your build to use [`parallelism`]({{site.baseurl}}/2.0/configuration-reference#parallelism) together with either [CircleCI's test splitting functionality](https://circleci.com/docs/2.0/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests) or a [third party application or library](https://circleci.com/docs/2.0/parallelism-faster-jobs/#other-ways-to-split-tests) to split your tests across multiple machines. CircleCI supports automatic test allocation across machines on a file-basis, however, you can also manually customize how tests are allocated.

* Read more about splitting tests in the [Parallelism]({{site.baseurl}}/2.0/parallelism/s) guide.

## Resource class
{: #resource-class }

**Note:**  If you are on a container-based plan, you will need to [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) to enable this feature on your account. Resource class options for self hosted installations are set by system administrators.

Using `resource_class`, it is possible to configure CPU and RAM resources for each job. For Cloud, see [this table](https://circleci.com/docs/2.0/configuration-reference/#resourceclass) for a list of available classes, and for self hosted installations contact your system administrator for a list.

* See the `resource_class` section of the [Configuration Reference]({{site.baseURL}}/2.0/configuration-reference/#resourceclass) for more information.

## Docker layer caching
{: #docker-layer-caching }

Docker layer caching is a feature that can help to reduce the _build time_ of a Docker image in your build. DLC is useful if you find yourself frequently building Docker images as a regular part of your CI/CD process.

DLC is similar to _caching dependencies_ mentioned above in that it _saves_ the image layers that you build within your job, making them available on subsequent builds.

* Read more in the [Docker Layer Caching]({{site.baseurl}}/2.0/docker-layer-caching) guide.

## See also
{: #see-also }
{:.no_toc}

- [Persisting Data]({{site.baseurl}}/2.0/persist-data)
- For a complete list of customizations that can be made your build, consider reading our [configuration reference]({{site.baseurl}}/2.0/configuration-reference/).
- For information on how Yarn can potentially speed up builds and reduce errors, view the [Using Yarn]({{site.baseurl}}/2.0/yarn) page.
- Coinbase published an article titled [Continuous Integration at Coinbase: How we optimized CircleCI for speed and cut our build times by 75%](https://blog.coinbase.com/continuous-integration-at-coinbase-how-we-optimized-circleci-for-speed-cut-our-build-times-by-378c8b1d7161).
