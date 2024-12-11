---
layout: classic-docs
title: "CircleCI Optimizations Cookbook"
short-title: "Optimizations Cookbook"
description: "Starting point for Optimizations Cookbook"
categories: [getting-started]
order: 1
version:
- Cloud
- Server v3.x
- Server v2.x
---

The *CircleCI Optimizations Cookbook* is a collection of individual use cases (referred to as "recipes") that provide you with detailed, step-by-step instructions on how to optimize your **pipelines** (the mechanism for taking code changes to your customers). Pipeline optimizations that increase build speed and security have a positive impact an organization's overall development and operations KPIs.

The recipes in this guide will enable you to quickly and easily perform repeatable optimization tasks on the CircleCI platform.

* TOC
{:toc}

## Introduction
{: #introduction }

Sometimes when you are using the CircleCI platform, you may encounter unexpected lags in pipeline performance, which can negatively affect your ability to perform critical organizational functions. These performance bottlenecks can not only impact overall performance, but also cause workflow and build failures. These "hiccups" can cost you money in terms of credit usage, resources, and individual time spent reducing bottlenecks.

## Using caching to optimize builds and workflows
{: #using-caching-to-optimize-builds-and-workflows }

One of the quickest and easiest ways to optimize your builds and workflows is to implement specific caching strategies so you can use existing data from previous builds and workflows. Whether you choose to use a package management application (e.g. Yarn, Bundler, etc), or manually configure your caching, utilizing the best and most effective caching strategy may improve overall performance.

If a job fetches data at any point, it is likely that you can make use of caching. A common example is the use of a package/dependency manager. If your project uses Yarn, Bundler, or Pip, for example, the dependencies downloaded during a job can be cached for later use rather than being re-downloaded on every build.

You can find an example of caching dependencies on the [Optimizations]({{site.baseurl}}/2.0/optimizations/#caching-dependencies) page. _Please note: Persisting data is project specific, and the examples on the Optimizations page are not meant to be copied and pasted into your own projects without some customization._

Because caching is a such a critical aspect of optimizing builds and workflows, you should first familiarize yourself with the [Caching]({{site.baseurl}}/2.0/caching/) page that describes caching, and how various strategies can be used to optimize your config.

## Improving test performance
{: #improving-test-performance }

When running tests on the CircleCI platform, one of the primary considerations you will want to make is how you can optimize the testing process to minimize credit usage and improve overall testing performance and results. Testing can sometimes be a time and performance-intensive process, therefore, the ability to reduce testing time can be a significant boost to your organizational goals.

There are many different test suites and approaches you can use when testing on the CircleCI platform. Although CircleCI is test suite agnostic, the example below (adapted with permission from the developer who wrote about this test optimization use case in his [blog post](https://www.brautaset.org/articles/2019/speed-up-circleci.html)) describes how you can optimize testing using Django and the CircleCI platform.

### Testing optimization on the CircleCI platform for a Python Django project
{: #testing-optimization-on-the-circleci-platform-for-a-python-django-project }
{:.no_toc}

Some organizations use CircleCI to run tests for each change before merging to the main branch. Faster tests means faster feedback cycles, which in turn means you can confidently ship code more often. Let's take a look at a case study for a Python Django application's workflow, that took more than 13 minutes to complete testing on the CircleCI platform.

An example of what the testing process might look like is shown below.

![Test Optimization Process Before Optimization]({{site.baseurl}}/assets/img/docs/optimization_cookbook_workflow_optimization_1.png)

Let's take a closer look at the testing process in the figure above to better understand the time it took to complete the tests.

The following steps were performed during testing:

1. The build job created a Docker image, which contained only runtime dependencies.
2. The build job dumped the image to a file with `docker save`, and then persisted it in the workspace.
3. Two test jobs were run to restore the base image from the workspace.
4. The test jobs built on this base image to create an image with all the extra modules required to run the tests.
5. The test jobs started dependencies, and the tests were finally initiated.

Typically, performing setup once, and then performing `fan out` steps, is a traditional way to reduce resource usage; however, in this example, the `fan out` steps proved to be very expensive in the following ways:

- Issuing `docker save` to dump the built image to a file took around **30** seconds.
- Persisting the image to the workspace added another **60** seconds.
- The test jobs then had to attach the workspace and load the base image, adding another **30** seconds to the testing.
- The test jobs started dependencies (Redis, Cassandra, and PostgreSQL) with `docker-compose`, which required the use of the machine executor. This added an additional **30-60** second startup time compared to the docker executors.
- Because the base image from the build job contained only runtime dependencies, a docker image had to be built, extending the base to add dependencies for testing. This added  about **70** seconds.

As you can see, there is a a significant amount of time being spent setting up the tests, without any actual tests being performed. In fact, this approach required 6.5 minutes before the actual tests were run, which took another 6.5 minutes.

### Test preparation optimization
{: #test-preparation-optimization }
{:.no_toc}

Knowing that ~13 minutes was too long to perform the steps in this workflow, the following approaches were taken to optimize and reduce this time.

#### Changing the CI test workflow
{: #changing-the-ci-test-workflow }
{:.no_toc}

The CI test workflow was changed to no longer depend on building the base image. The test jobs were also changed to launch auxiliary services using CircleCI's docker executor native service container support instead of using `docker-compose`. Finally,`tox` was run from the main container to install dependencies and run tests, which eliminates minutes used to save and then restore the image from the workspace. This also eliminated the extra start-up costs of the machine executor.

#### Dependency changes
{: #dependency-changes }
{:.no_toc}

Installing dependencies in the primary container on CircleCI, rather than relying on a Dockerfile, may enable you to use CircleCI's caching to speed up `virtualenv` creation.

### Test execution optimization
{: #test-execution-optimization }
{:.no_toc}

Now that the test preparation time has been reduced, you may also wish to speed up the running of the actual tests. For example, you may not need to keep the database after test runs. One way you could speed up testing is to replace the database image used for tests with an [in-memory Postgres image]({{site.baseurl}}/2.0/databases/#postgresql-database-testing-example) that does not save to disk. Another method you may wish to take is to [run your tests in parallel]({{site.baseurl}}/2.0/parallelism-faster-jobs/)/ instead of one-test-at-a-time.

The figure below illustrates how overall these changes can reduce the total workflow time.

![Test Optimization Process After Optimization]({{site.baseurl}}/assets/img/docs/optimization_cookbook_workflow_optimization_2.png)

As you can see, there was no single step performed to reduce overall workflow time. For example, running tests in parallel would not have seen much benefit when most of the time was being used to prepare to run the tests. By recognizing the differences between running tests on the CircleCI platform instead of a local context, and making a few changes to test preparation and execution, you may be able to see improved test run time.

## Test splitting to speed up pipelines
{: #test-splitting-to-speed-up-pipelines }

Pipelines are often configured so that each time code is committed a set of tests are run. Test splitting is a great way to speed up the testing portion of your CICD pipeline. Tests don't always need to happen sequentially; a suite of tests can be split over a range of test environments running in parallel.

Test splitting lets you intelligently define where these splits happen across a test suite: by name, by size etc. Using **timing-based** test splitting takes the timing data from the previous test run to split a test suite as evenly as possible over a specified number of test environments running in parallel, to give the lowest possible test time for the compute power in use.

![Test Splitting]({{ site.baseurl }}/assets/img/docs/test_splitting.png)

### Parallelism and test splitting
{: #parallelism-and-test-splitting }
{:.no_toc}

To illustrate this with CI config, take a sequentially running test suite – all tests run in a single test environment (docker container):

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      FOO: bar
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test
```

To split these tests, using timing data, we first intoduce parallelism to spin up a number (10 in this case) of identical test environments. Then use the `circleci tests split` command, with the `--split-by=timings` flag to split the tests as equally as possible across all environments, so the full suite runs in the shortest possible time.

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      FOO: bar
    parallelism: 10
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test -v $(go list ./... | circleci tests split --split-by=timings)
```

**Note:** The first time the tests are run there will be no timing data for the command to use, but on subsequent runs the test time will be optimized.

### Is it worth it?
{: #is-it-worth-it }
{:.no_toc}

To give a quantitative illustration of the power of the split-by-timings feature, adding `parallelism: 10` on a test suite run across the CircleCI application project actually decreased the test time **from 26:11 down to 3:55**.

Test suites can also be split by name or size, but using timings-based test splitting gives the most accurate split, and is guaranteed to optimize with each test suite run; the most recent timings data is always used to define where splits happen. For more on this subject, take a look at our [using parallelism to speed up test jobs]({{site.baseurl}}/2.0/parallelism-faster-jobs/).

## Workflows increase deployment frequency
{: #workflows-increase-deployment-frequency }

Providing value to your customers is the top goal for any organization, and one can measure the performance of an organization by how often (frequency) value is delivered (deployment). High-performing teams deploy value to customers multiple times per day according to the DevOps Research and Assessment Report, 2019.

While many organizations deploy value to customer once per quarter or once per month, the basics of raising this frequency to once per week or once per day is represented by the same type of orchestration added to an organization's value *pipeline*.

To deploy multiple times per day, developers need an automated workflow that enables them to test their changes on a branch of code that matches exactly the environment of main, without being on the main branch. This is possible with the use of workflow orchestration in your continuous integration suite.

{%comment %}![Workflow without Deploy]({{ site.baseurl }}/assets/img/docs/workflows-no-deploy.png){%
endcomment %}

When you provide developers with a workflow that runs all of their tests in the main environment, but doesn't run a deploy, they can safely test and debug their code on a branch until all tests are passing.

{%comment %}![Workflow with Deploy]({{ site.baseurl }}/assets/img/docs/workflows-yes-deploy.png){%
endcomment %}

A workflow that runs all tests *as if they were on main* gives developers the confidence they need to merge to main knowing their code will not break or cause an outage or interruption to service for customers. The small investment in configuring such a workflow is well-worth the increase in deployment frequency of valuable changes to your customers.

A simple example would configure deployment to run *only* if a change is merged to main and the test jobs have already passed.

For an organization deploying multiple times per day, that configuration may be as simple as the following snippet of YAML:

```yaml
workflows:
  build-test-deploy:
    jobs:
      - build
      - test
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: main
```


The time difference in your organization's frequency *without* a workflow to enable developers in the way described above will include the time it takes for them to ensure their environment is the same as production, plus the time to run all of the same tests to ensure their code is good. All environment updates and tests must also be completed by every developer before any other changes are made to main. If changes happen *on main* while they are updating their environment or running their own tests, they will have to rerun everything to have confidence that their code won't break.

For an organization deploying on a slower cadence, a nightly build workflow can ensure that on any day an update is needed by customers, there is a tested and deployable build available:

```yaml
workflows:
  nightly-build:
    triggers:
      - schedule:
          cron: '0 8 ***'
          filters:
            branches:
              only: main
    jobs:
      - build
      - test
      - deploy
```

The time difference includes the lag described above plus the duration of the pipeline run and elapsed time between when a developer finished a change and when the scheduled build runs. All of this time adds up and the more confidence developers have in the quality of their code the higher their deployment frequency.


## See also
{: #see-also }
{:.no_toc}

- Refer to [Optimizations]({{site.baseurl}}/2.0/optimizations) for more information on other optimization strategies you can use for caching, workflows and builds.
- Refer to [Caching]({{site.baseurl}}/2.0/caching/#introduction) for high-level information about caching.
