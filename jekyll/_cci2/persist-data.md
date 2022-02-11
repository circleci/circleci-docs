---
layout: classic-docs
title: "Persisting Data Overview"
description: "A introductory guide to the various ways to persist data in CircleCI"
version:
- Cloud
- Server v3.x
- Server v2.x
---

This guide gives an introductory overview of the various ways to persist data within and beyond your CircleCI builds. There are a number of ways to move data into, out of, and between jobs, persisting data for future use. Using the right feature for the right task will help speed up your builds, and improve repeatability and efficiency.

* TOC
{:toc}

## Caching
{: #caching }

Caching persists data between the same job in different builds, allowing you to reuse the data from expensive fetch operations from previous jobs. After an initial job run, future instances will run faster as they will not need to redo the work (provided your cache has not been invalidated).

### Caching dependencies
{: #caching-dependencies }

A prime example of a caching strategy is using a cache with dependency managers, such as Yarn, Bundler, or Pip. With dependencies restored from a cache, commands like `yarn install` will only need to download new dependencies, if any, and not redownload every dependency on every build.

Because caches are global within a project, a cache saved on one branch will be used by jobs run on other branches. Caches should only be used for data that is suitable to share across branches. 

* For more information on caching dependencies, including race conditions, managing caches, expiration, and using cache keys, see the [Caching Dependencies]({{site.baseurl}}/2.0/caching/) guide.

### Caching optimization
{: #cache-optimization }

There are several common ways that your configuration can be optimized to ensure you are getting the most out of your network and storage usage. For example, when looking for opportunities to reduce data usage, consider whether specific usage is providing enough value to be kept. In the cases of caches, this can be quite easy to compare. Does the developer or compute time-saving from the cache outweigh the cost of the download and upload?

Caching optimization strategies can include avoiding unnecessary workflow reruns, combining jobs, creating meaningful workflow orders, and pruning.

* For more information on caching optimization and other caching strategies, like partial dependency caching, caching tradeoffs, and using multiple caches, see the [Caching Strategies]({{site.baseurl}}/2.0/caching-strategy/) guide.

## Workspaces
{: #workspaces }

Workspaces are used to transfer data to downstream jobs as the workflow progresses. When a workspace is declared in a job, files and directories can be added to it. Each addition creates a new layer in the workspace filesystem. Downstream jobs can then use this workspace for their own needs, or add more layers on top.

### Workspace optimization
{: #workspace-optimization }

If you notice your workspace usage is high and would like to reduce it, try searching for the `persist_to_workspace` command in your `.circleci/config.yml` file to find all jobs utilizing workspaces and determine if all items in the path are necessary. In the cases of caches and workspaces, this can be quite easy to compare. Does the developer or compute time-saving from the cache outweigh the cost of the download and upload?

* For more information on workspace optimization, configuration, and expiration, see the [Using Workspaces]({{site.baseurl}}/2.0/workspaces/) guide.
* For more information on workflows, see the [Workflows]({{site.baseurl}}/2.0/workflows/) guide. 
* Also see the [Deep Diving into CircleCI Workspaces](https://circleci.com/blog/deep-diving-into-circleci-workspaces/) blog post.

## Artifacts
{: #artifacts }

Artifacts are used for longer-term storage of the outputs of your pipelines. For example if you have a Java project, your build will most likely produce a `.jar` file of your code. This code will be validated by your tests. If the whole build/test process passes, then the output of the process (the `.jar`) can be stored as an artifact. The `.jar` file is available to download from our artifacts system long after the workflow that created it has finished.

If your project needs to be packaged, say an Android app where the `.apk` file is uploaded to Google Play, you would likely wish to store it as an artifact. Many users take their artifacts and upload them to a company-wide storage location such as Amazon S3 or Artifactory.

### Artifact optimization
{: #artifact-optimization }

Optimization options will be different for each project depending on what you are trying to accomplish. You can try the following actions to reduce network and storage usage:

- Check if `store_artifacts` is uploading unnecessary files
- Check for identical artifacts if you are using parallelism
- Compress text artifacts at minimal cost
- Filter out and upload only failing UI tests with images/videos
- Filter out and upload only failures or successes
- Upload artifacts to a single branch
- Upload large artifacts to your own bucket at no cost

* For more information on artifact optimization, and using artifacts to persist data once a job has completed, see the [Storing Build Artifacts]({{site.baseurl}}/2.0/artifacts/) guide.

## Managing network and storage usage
{: #managing-network-and-storage-usage }

Optimization goes beyond speeding up your builds and improving efficiency. Optimization can also help reduce costs.

To view your network and storage usage, visit the [CircleCI web app](https://app.circleci.com/) and follow these steps:

1. Select **Plan** from the app sidebar.
2. Select **Plan Usage**.
3. Select the **Network** or **Storage** tab depending on which you want to view.

Within the network and storage tabs you will find a breakdown of your usage for the billing period. The usage is also broken down by storage object type: cache, artifact, workspace, testresult.

### Overview of all network and storage transfer
{: #overview-of-network-and-storage-transfer }

All data persistence operations within a job will accrue network and storage usage, the relevant actions are:

- Uploading caches
- Uploading workspaces
- Uploading artifacts
- Uploading test results

To determine which jobs utilize the above actions, you can search for the following commands in your project's `.circleci/config.yml` file:

- `save_cache`
- `persist_to_workspace`
- `store_artifacts`
- `store_test_results`

The only network traffic that will be billed for is that accrued through **restoring caches and workspaces to self-hosted runners.**

Details about your network and storage transfer usage can be viewed on your **Plan > Plan Usage** screen. On this screen you can find:

- Billable Network Transfer & Egress (table at the top of the screen)
- Network and storage usage for individual projects (Projects tab)
- Storage data activity (Network tab)
- Total storage volume data (Storage tab)

Details about individual step network and storage transfer usage can be found in the step output on the Jobs page as seen below.

![save-cache-job-output]({{site.baseurl}}/assets/img/docs/job-output-save-cache.png)

### Reducing excess use of network egress
{: #reducing-excess-use-of-network-egress }

If you would like to try to reduce the amount of network egress that is contributing to network usage, you can try a few things:

* For runner, deploy any cloud-based runners in AWS US-East-1.
* Download artifacts once and store them on your site for additional processing.

### How to calculate an approximation of network and storage costs
{: #how-to-calculate-an-approximation-of-network-and-storage-costs}

**NOTE:** Billing for network egress and storage will start to take effect on **March 1 2022** (subject to change). CircleCI is adding variables and controls to help you manage network and storage usage. The information in this section is applicable after the changes take effect on March 1, 2022. Current usage can be found on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Plan Usage**.
{: class="alert alert-info" }

Charges apply when an organization has runner network egress beyond the included GB allotment for network and storage usage. Billing for network usage is only applicable to traffic from CircleCI
to self-hosted runners. If you are exclusively using our cloud-hosted executors, no network fees apply.

You can find out how much network and storage usage is available on your plan by visiting the features section of the [Pricing](https://circleci.com/pricing/) page. If you would like more details about credit usage, and how to calculate your potential network and storage costs, visit the billing section on the [FAQ]({{site.baseurl}}/2.0/faq/#how-do-I-calculate-my-monthly-storage-and-network-costs) page.

## See also
{: #see-also }
{:.no_toc}

- [Caching Dependencies]({{site.baseurl}}/2.0/caching)
- [Caching Strategies]({{site.baseurl}}/2.0/caching-strategy)
- [Workspaces]({{site.baseurl}}/2.0/workspaces)
- [Artifacts]({{site.baseurl}}/2.0/artifacts)
- [Optimizations Overview]({{site.baseurl}}/2.0/optimizations)