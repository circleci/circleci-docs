---
layout: classic-docs
title: "Optimizations"
short-title: "Optimizations"
description: "CircleCI 2.0 build optimizations"
categories: [getting-started]
order: 1
---

This document provides an overview of several methods for optimizing your CircleCI configuration. Each optimization method will be described briefly, will present possible use cases, and will provide an example optimization for speeding up your jobs.

* TOC
{:toc}

**Note**: Some of the features discussed in this document may require a specific pricing
plan. Visit our [pricing usage page](https://circleci.com/pricing/usage/) to get an
overview of the plans CircleCI offers. Or, if you are a logged in to the CircleCI web
application, go to `Settings > Plan Settings` to make adjustments to your plan.

## Caching Dependencies

Caching should be one of the first things you consider when trying to optimize your jobs. If a job fetches data at any point, it is likely that you can make use of caching. A common example is the use of a package/dependency manager. If your project uses Yarn, Bundler, or Pip, for example, the dependencies downloaded during a job can be cached for later use rather than being re-downloaded on every build.

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

Make note of the use of a `checksum` in the cache `key`; this is used to calculate when a specific dependency-management file (such as a `package.json` or `requirements.txt` in this case) _changes_ and so the cache will be updated accordingly. In the above example, the
[`restore_cache`]({{site.baseurl}}/2.0/configuration-reference#restore_cache) example uses interpolation to put dynamic values into the cache-key, allowing more control in what exactly constitutes the need to update a cache.

We recommend that you verify that the dependencies installation step succeeds before adding caching steps. Caching a failed dependency step will require you to change the cache key in order to avoid failed builds due to a bad cache.

Consult the [caching document]({{site.baseurl}}/2.0/caching) to learn more.

## Workflows

Workflows provide a means to define a collection of jobs and their run order. If at any point in your build you see a step where two jobs could happily run independent of one another, workflows may be helpful. Workflows also provide several other features to augment and improve your build configuration. Read more about workflows in the [workflow documentation]({{site.baseurl}}/2.0/workflows/).

**Note**: Workflows are available to all plans, but running parallel jobs assumes that your plan provides multiple machines to execute on.

```yaml
version: 2.1
jobs: # here we define two jobs: "build" and "test"
  build:
    docker: # the docker executor is used
      - image: circleci/<language>:<version TAG> # An example docker image
    steps:
      - checkout # Pulls code down from your VCS
      - run: <command> # An example command
  test:
    docker: # same as previous docker key.
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
workflows: # Here we can orchestrate our jobs into a workflow
  version: 2
  build_and_test: # A single workflow named "build_and_test"
    jobs: # we run our `build` job and `test` job in sequence.
      - build
      - test
```


You can view more examples of workflows in the  [CircleCI demo workflows repo](https://github.com/CircleCI-Public/circleci-demo-workflows/).

## Workspaces

**Note**: Using workspaces presumes that you are also using [workflows](#workflows).

Workspaces are used to pass along data that is _unique to a run_ and is needed for _downstream jobs_. So, if you are using workflows, a job run earlier in your build might fetch data and then make it _available later_ for jobs that run later in a build.

To persist data from a job and make it available to downstream jobs via the [`attach_workspace`] key, configure the job to use the [`persist_to_workspace`]({{ site.baseurl}}/2.0/configuration-reference#persist_to_workspace) key. Files and directories named in the paths: property of `persist_to_workspace` will be uploaded to the workflow’s temporary workspace relative to the directory specified with the root key. The files and directories are then uploaded and made available for subsequent jobs (and re-runs of the workflow) to use.

Read more about how to use workspaces in the [workflows document]({{site.baseurl}}/2.0/workflows/#using-workspaces-to-share-data-among-jobs).

## Parallelism

**Note**: Your CircleCI plan determines what level of parallelism you can use in your builds (1x, 2x, 4x, etc)

If your project has a large test suite, you can configure your build to use  [`parallelism`]({{site.baseurl}}/2.0/configuration-reference#parallelism) together with either [CircleCI's test splitting functionality](https://circleci.com/docs/2.0/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests) or a [third party application or library](https://circleci.com/docs/2.0/parallelism-faster-jobs/#other-ways-to-split-tests)
to split your tests across multiple machines. CircleCI supports automatic test
allocation across machines on a file-basis, however, you can also manually
customize how tests are allocated.

```yaml
# ~/.circleci/config.yml
version: 2
jobs:
  docker:
    - image: circleci/<language>:<version TAG>
  test:
    parallelism: 4
```

Read more in-depth about splitting tests in our [document on parallelism]({{site.baseurl}}/2.0/parallelism-faster-jobs).

## Resource Class

**Note:** An eligible plan is required to use the [`resource_class`]({{site.baseurl}}/2.0/configuration-reference#resource_class) feature. If you are on a container-based plan you will need to [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) to enable this feature on your account.

Using `resource_class`, it is possible to configure CPU and RAM resources for each job as described in [this table](https://circleci.com/docs/2.0/configuration-reference/#resource_class). If `resource_class` is not specified or an invalid class is specified, the default `resource_class: medium` will be used. The `resource_class` key is currently only available for use with the `docker` executor.

Below is an example use case of the `resource_class` feature.

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      FOO: bar
    parallelism: 3
    resource_class: large # implements a machine with 4 vCPUS and 8gb of ram.
    steps:
      - run: make test
      - run: make
```

## Docker Layer Caching

**Note**: An eligible plan is required to use Docker Layer Caching. If you are on the container-based plan you will need to open a [support ticket](https://support.circleci.com/hc/en-us/requests/new) to enable DLC for your account.

DLC is a feature that can help to reduce the _build time_ of a Docker image in your build. Docker Layer Caching is useful if you find yourself frequently building Docker images as a regular part of your CI/CD process.

DLC is similar to _caching dependencies_ mentioned above in that it _saves_ the image layers that you build within your job, making them available on subsequent builds.

```yaml
version: 2
jobs:
 build:
    docker:
      - image: circleci/node:9.8.0-stretch-browsers # DLC does nothing here, its caching depends on commonality of the image layers.
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # DLC will explicitly cache layers here and try to avoid rebuilding.
      - run: docker build .
```

Learn more about [Docker Layer Caching]({{site.baseurl}}/2.0/docker-layer-caching)

## See Also
{:.no_toc}

- For a complete list of customizations that can be made your build, consider reading our [configuration reference]({{ site.baseurl}}/2.0/configuration-reference/).
- Coinbase published an article titled [Continuous Integration at Coinbase: How we optimized CircleCI for speed and cut our build times by 75%](https://blog.coinbase.com/continuous-integration-at-coinbase-how-we-optimized-circleci-for-speed-cut-our-build-times-by-378c8b1d7161)
- Using Yarn for speeding up builds with [caching]({{site.baseurl}}/2.0/yarn)
