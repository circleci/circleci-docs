---
layout: classic-docs
title: "Optimizations Overview"
short-title: "Optimizations Overview"
description: "CircleCI build optimizations"
redirect_from: /optimization-cookbook/
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

This document provides an overview of ways to optimize your CircleCI configuration. Each optimization method will be described briefly, and present possible use cases for speeding up your jobs.

* TOC
{:toc}

## Custom storage controls
{: #custom-storage-controls }

The [CircleCI web app](https://app.circleci.com/) provides controls to customize the storage retention period of workspaces, caches, and artifacts. You can find these settings by navigating to **Plan > Usage Controls**. By default, the storage period is 30 days for artifacts, and 15 days for caches and workspaces. These are also the maximum retention periods for storage. The maximum storage period is 30 days for artifacts, and 15 days for caches and workspaces.

See the [Persisting Data]({{site.baseurl}}/persist-data/#custom-storage-usage) page for more information on custom storage settings.

## Docker image choice
{: #docker-image-choice }

Choosing the right docker image for your project can have huge impact on build time. For example, choosing a basic language image means dependencies and tools need to be downloaded each time your pipeline is run, whereas, if you choose or build an image that has these dependencies and tools already installed, this time will be saved for each build run. When configuring your projects and specifying images, consider the following options:

* CircleCI provides a range of [convenience images]({{site.baseurl}}/circleci-images/#section=configuration), typically based on official Docker images, but with a range of useful language tools pre-installed.
* You can create [custom images]({{site.baseurl}}/custom-images/#section=configuration), maximizing specificity for your projects. To help with this we provide [guidance for building images manually]({{site.baseurl}}/custom-images/#creating-a-custom-image-manually).

## Docker layer caching
{: #docker-layer-caching }

Docker layer caching is a feature that can help to reduce the _build time_ of a Docker image in your build. DLC is useful if you find yourself frequently building Docker images as a regular part of your CI/CD process.

DLC is similar to _caching dependencies_, in that it _saves_ the image layers that you build within your job, making them available on subsequent builds.

* Read more on the [Docker Layer Caching]({{site.baseurl}}/docker-layer-caching) page.

## Caching dependencies
{: #caching-dependencies }

Caching should be one of the first things you consider when trying to optimize your jobs. If a job fetches data at any point, it is likely that you can make use of caching. A common example is the use of a package/dependency manager. If your project uses Yarn, Bundler, or Pip, for example, the dependencies downloaded during a job can be cached for later use rather than being re-downloaded on every build.

* Read more on the [Caching Dependencies]({{site.baseurl}}/caching) page.

## Workflows
{: #workflows }

Workflows provide a means to define a collection of jobs and their run order. If at any point in your configuration you see a step where two jobs could happily run independent of one another, workflows may be helpful. Workflows also provide several other features to augment and improve your CI/CD configuration. Read more about workflows on the [Workflow]({{site.baseurl}}/workflows/) page.

* You can view examples of workflows in the [CircleCI demo workflows repo](https://github.com/CircleCI-Public/circleci-demo-workflows/).

## Workspaces
{: #workspaces }

Workspaces are used to pass along data that is _unique to a run_ and is needed for _downstream jobs_. So, if you are using workflows, a job run earlier in your build might fetch data and then make it _available later_ for jobs that run later in a build.

To persist data from a job and make it available to downstream jobs via the [`attach_workspace`]({{site.baseurl}}/configuration-reference#attachworkspace) key, configure the job to use the [`persist_to_workspace`]({{site.baseurl}}/configuration-reference#persisttoworkspace) key. Files and directories named in the `paths:` property of `persist_to_workspace` will be uploaded to the workflow’s temporary workspace relative to the directory specified with the root key. The files and directories are then uploaded and made available for subsequent jobs (and re-runs of the workflow) to use.

* Read more on the [Workspaces]({{site.baseurl}}/workspaces/) page.

## Parallelism
{: #parallelism }

If your project has a large test suite, you can configure your build to use [`parallelism`]({{site.baseurl}}/configuration-reference#parallelism) together with either [CircleCI's test splitting functionality]({{site.baseurl}}/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests), or a [third party application or library]({{site.baseurl}}/parallelism-faster-jobs/#other-ways-to-split-tests) to split your tests across multiple machines. CircleCI supports automatic test allocation across machines on a file-basis, however, you can also manually customize how tests are allocated.

* Read more about splitting tests on the [Parallelism]({{site.baseurl}}/parallelism-faster-jobs/) page.

## Resource class
{: #resource-class }

Using `resource_class`, it is possible to configure CPU and RAM resources for each job. For Cloud, see [this table]({{site.baseurl}}/configuration-reference/#resourceclass) for a list of available classes, and for self-hosted installations contact your system administrator for a list.

Please note, if a `resource_class` is not explicitly declared, CircleCI will try to find the best default resource class for your organization.

* See the `resource_class` section of the [Configuration Reference]({{site.baseurl}}/configuration-reference/#resourceclass) for more information.

## See also
{: #see-also }
{:.no_toc}

- [Persisting Data]({{site.baseurl}}/persist-data)
- For a complete list of customizations, view the [Configuration Reference]({{site.baseurl}}/configuration-reference/) page.
- For information about how Yarn can potentially speed up builds and reduce errors, view the [Caching Dependencies]({{site.baseurl}}/caching/#basic-example-of-package-manager-caching) page.
- Coinbase published an article titled [Continuous Integration at Coinbase: How we optimized CircleCI for speed and cut our build times by 75%](https://blog.coinbase.com/continuous-integration-at-coinbase-how-we-optimized-circleci-for-speed-cut-our-build-times-by-378c8b1d7161).
