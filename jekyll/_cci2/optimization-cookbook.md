---
layout: classic-docs
title: "CircleCI Optimizations Cookbook"
short-title: "Optimizations Cookbook"
description: "Starting point for Optimizations Cookbook"
categories: [getting-started]
order: 1
---

The *CircleCI Optimizations Cookbook* is a collection of individual use cases (referred to as "recipes") that provide you with detailed, step-by-step instructions on how to perform various optimization tasks using CircleCI resources. This guide, and it associated sections, will enable you to quickly and easily perform repeatable optimization tasks on the CircleCI platform.

* TOC
{:toc}

## Introduction

Sometimes when you are using the CircleCI platform, you may encounter unexpected lags in pipeline performance, which can negatively affect your ability to perform critical organizational functions. These performance bottlenecks can not only impact overall performance, but also cause workflow and build failures. These "hiccups" can cost you money in terms of credit usage, resources, and individual time spent reducing bottlenecks.

### Optimization Recipes

This guide provides you with the following optimization strategies that you can utilize to minimize any potential performance bottlenecks and ensure that you are getting the best performance possible when using CircleCI:

- [Running jobs sequentially to prevent concurrency](#running-jobs-sequentially-to-prevent-concurrency)
- [Implementing caching strategies to optimize builds and workflows](#using-caching-to-optimize-builds-and-workflows)
- [Improving test performance](#improving-test-performance)

**Note:** This guide will be updated with new optimization strategies on a continual basis, so please feel free to refer to this page for new and updated content.

## Running Jobs Sequentially To Prevent Concurrency

One of the most common tasks you may encounter when using the CircleCI platform is managing multiple jobs simultaneously to ensure your workflows do not fail because of system timeouts. This becomes especially important when you have multiple contributors and committers working in the same environment. Because the CircleCI platform was designed to handle multiple tasks simultaneously without encountering performance degradation or latency, concurrency may sometimes become an issue if there are a large number of jobs being queued, waiting for previous jobs to be completed before new jobs can be initiated, and system timeouts are set too low. In this case, one job will be completed, and other jobs will fail due to this timeout setting.

To better optimize workflows and jobs and prevent concurrency and subsequent jobs failing because of timeout, CircleCI has developed a single-threading (queueing) orb that specifically addresses these performance issues. By invoking this orb, you can greatly improve overall job and build performance and prevent concurrency.

**Note:** For more detailed information about the CircleCI Queueing orb, refer to the following CircleCI pages:

- [Queueing and Single Threading Overview](https://github.com/eddiewebb/circleci-queue)
- [CircleCI Queueing Orb](https://circleci.com/orbs/registry/orb/eddiewebb/queue#quick-start)

### Setting Up and Configuring Your Environment to use the CircleCI Platform and CircleCI Orbs

To configure the environment for the CircleCI platform and CircleCI orbs, follow the steps listed below.

1) Use CircleCI `version 2.1` at the top of your `.circleci/config.yml` file.

```
version: 2.1
```

2) {% include snippets/enable-pipelines.md %}


3) Add the `orbs` stanza below your version, invoking the orb. For example:

```
version: 2.1

orbs:
  queue: eddiewebb/queue@1.1.2
```

4) Use [`queue` elements](https://circleci.com/orbs/registry/orb/eddiewebb/queue#usage-examples) in your existing workflows and jobs.

5) Opt-in to use of third-party orbs on your organization’s **Security Settings** page.

### Blocking Workflows

Occasionally, you may experience the problem of having one of your workflows "blocked" due to workflow concurrency. This happens when there is a workflow already being run while there are other workflows queued. Because CircleCI wants to provide optimal performance for all of your workflows, if there are workflows in the queue that will have to wait a long period of time before they are run, the CircleCI platform will "block" a workflow from being run until the other workflow has completed. One of the easiest ways to prevent workflow concurrency using the queueing orb is to enable "blocking" of any workflows with an earlier timestamp. By setting the `block-workflow` parameter value to `true`, all workflows will be forced to run consecutively, not concurrently. This limits the number of workflows in the queue. In turn, this also improves overall performance while making sure no workflows are discarded.

{% raw %}

```yaml
Version: 2.1
docker:
  - image: 'circleci/node:10'
parameters:
  block-workflow:
    default: true
    description: >-
      If true, this job will block until no other workflows with an earlier
      timestamp are running. Typically used as first job.
    type: boolean
  consider-branch:
    default: true
    description: Should we only consider jobs running on the same branch?
    type: boolean
  consider-job:
    default: false
    description: Deprecated. Please see block-workflow.
    type: boolean
  dont-quit:
    default: false
    description: >-
      Quitting is for losers. Force job through once time expires instead of
      failing.
    type: boolean
  only-on-branch:
    default: '*'
    description: Only queue on specified branch
    type: string
  time:
    default: '10'
    description: How long to wait before giving up.
    type: string
  vcs-type:
    default: github
    description: Override VCS to 'bitbucket' if needed.
    type: string
steps:
  - until_front_of_line:
      consider-branch: <<parameters.consider-branch>>
      consider-job: <<parameters.consider-job>>
      dont-quit: <<parameters.dont-quit>>
      only-on-branch: <<parameters.only-on-branch>>
      time: <<parameters.time>>
      vcs-type: <<parameters.vcs-type>>
```
{% endraw %}

## Using Caching to Optimize Builds and Workflows

One of the quickest and easiest ways to optimize your builds and workflows is to implement specific caching strategies so you can use existing data from previous builds and workflows. Whether you choose to use a package management application (e.g. Yarn, Bundler, etc), or manually configure your caching, utilizing the best and most effective caching strategy may improve overall performance. In this section, several different use cases are described that may assist you in determining which caching method is best for your implementation.

If a job fetches data at any point, it is likely that you can make use of caching. A common example is the use of a package/dependency manager. If your project uses Yarn, Bundler, or Pip, for example, the dependencies downloaded during a job can be cached for later use rather than being re-downloaded on every build. The example below shows how you can use caching for a package manager.

{% raw %}
```yaml
version: 2
jobs:
  build:
    steps: # a collection of executable commands making up the 'build' job
      - checkout # pulls source code to the working directory
      - restore_cache: # **restores saved dependency cache if the Branch key template or requirements.txt files have not changed since the previous run**
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
      - run: # install and activate virtual environment with pip
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache: # ** special step to save dependency cache **
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
```
{% endraw %}

Notice in the above example that you can use a `checksum` in the cache key. This is used to calculate when a specific dependency-management file (such as a `package.json` or `requirements.txt` in this case) changes so the cache will be updated accordingly. Also note that the `restore_cache` example uses interpolation to put dynamic values into the cache-key, allowing more control in what exactly constitutes the need to update a cache.

**Note:** Before adding any caching steps to your workflow, verify the dependencies installation step succeeds. Caching a failed dependency step will require you to change the cache key in order to avoid failed builds due to a bad cache. 

Because caching is a such a critical aspect of optimizing builds and workflows, you should first familiarize yourself with the following page that describes caching and how various strategies can be used to optimize your config:

- [Caching](https://circleci.com/docs/2.0/caching/)

## Improving Test Performance

When running tests on the CircleCI platform, one of the primary considerations you will want to make is how you can optimize the testing process to minimize credit usage and improve overall testing performance and results. Testing can sometimes be a time and performance-intensive process, therefore, the ability to reduce testing time can be a significant boost to your organizational goals.

There are many different test suites and approaches you can use when testing on the CircleCI platform. Although CircleCI is test suite agnostic, the example below (adapted with permission from the developer who wrote about this test optimization use case in his [blog post](https://www.brautaset.org/articles/2019/speed-up-circleci.html)) describes how you can optimize testing using Django and the CircleCI platform.

### Testing Optmization on the CircleCI Platform For a Python Django Project

Some organizations use CircleCI to run tests for each change before merging to the main branch. Faster tests means faster feedback cycles, which in turn means you can confidently ship code more often. Let's take a look at a case study for a Python Django application's workflow, that took more than 13 minutes to complete testing on the CircleCI platform.

An example of what the testing process might look like is shown below.

![Test Optimization Process Before Optimization]({{site.baseurl}}/assets/img/docs/optimization_cookbook_workflow_optimization_1.png)

Let's take a closer look at the testing process in the figure above to better understand the time it took to complete the tests.

The following steps were performed during testing:

1) The build job created a Docker image, which contained only runtime dependencies. 
2) The build job dumped the image to a file with `docker save`, and then persisted it in the workspace. 
3) Two test jobs were run to restore the base image from the workspace.
4) The test jobs built on this base image to create an image with all the extra modules required to run the tests. 
5) The test jobs started dependencies, and the tests were finally initiated.

Typically, performing setup once, and then performing `fan out` steps, is a traditional way to reduce resource usage; however, in this example, the `fan out` steps proved to be very expensive in the following ways:

- Issuing `docker save` to dump the built image to a file took around **30** seconds.
- Persisting the image to the workspace added another **60** seconds.
- The test jobs then had to attach the workspace and load the base image, adding another **30** seconds to the testing.
- The test jobs started dependencies (Redis, Cassandra, and PostgreSQL) with `docker-compose`, which required the use of the machine executor. This added an additional **30-60** second startup time compared to the docker executors.
- Because the base image from the build job contained only runtime dependencies, a docker image had to be built, extending the base to add dependencies for testing. This added  about **70** seconds.

As you can see, there is a a significant amount of time being spent setting up the tests, without any actual tests being performed. In fact, this approach required 6.5 minutes before the actual tests were run, which took another 6.5 minutes.

### Test Preparation Optimization

Knowing that ~13 minutes was too long to perform the steps in this workflow, the following approaches were taken to optimize and reduce this time.

#### Changing the CI Test Workflow

The CI test workflow was changed to no longer depend on building the base image. The test jobs were also changed to launch auxiliary services using CircleCI's docker executor native service container support instead of using `docker-compose`. Finally,`tox` was run from the main container to install dependencies and run tests, which eliminates minutes used to save and then restore the image from the workspace. This also eliminated the extra start-up costs of the machine executor.

#### Dependency Changes

Installing dependencies in the primary container on CircleCI, rather than relying on a Dockerfile, may enable you to use CircleCI's caching to speed up `virtualenv` creation.

### Test Execution Optimization

Now that the test preparation time has been reduced, you may also wish to speed up the running of the actual tests. For example, you may not need to keep the database after test runs. One way you could speed up testing is to replace the database image used for tests with an [in-memory Postgres image]({{site.baseurl}}/2.0/databases/#postgresql-database-testing-example) that does not save to disk. Another method you may wish to take is to [run your tests in parallel]({{site.baseurl}}/2.0//parallelism-faster-jobs/)/ instead of one-test-at-a-time. 

The figure below illustrates how overall these changes can reduce the total workflow time.

![Test Optimization Process After Optimization]({{site.baseurl}}/assets/img/docs/optimization_cookbook_workflow_optimization_2.png)

As you can see, there was no single step performed to reduce overall workflow time. For example, running tests in parallel would not have seen much benefit when most of the time was being used to prepare to run the tests. By recognizing the differences between running tests on the CircleCI platform instead of a local context, and making a few changes to test preparation and execution, you may be able to see improved test run time.

## See Also

- Refer to [Optimizations]({{site.baseurl}}/2.0/optimizations) for more information on other optimization strategies you can use for caching, workflows and builds.
- Refer to [Caching]({{site.baseurl}}/2.0/caching/#introduction) for high-level information about caching.
