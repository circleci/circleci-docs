---
layout: classic-docs
title: "Optimizations"
short-title: "Optimizations"
description: "CircleCI 2.0 build optimizations"
categories: [getting-started]
order: 1
---

This document provides an overview of several methods for optimizing your CircleCI configuration. Each optimization method will be described briefly, will present possible use cases, and will provide an example optimization for speeding up your jobs.

**Note**: Some of the features discussed in this document may required a specific pricing plan. Visit our [pricing usage page](https://circleci.com/pricing/usage/) to get an overview of the plans CircleCI offers.

If you still have questions optimizing your build configuration consider
consulting our [FAQ]({{ site.baseurl }}/2.0/faq) or [opening a support ticket](https://support.circleci.com/hc/en-us/requests/new).

## Caching Dependencies

Caching should be one of the first things you consider when trying to optimize
your jobs. If your job fetches data at any point, it's likely that you can make
use of caching. A common example is the use of a package/dependency manager. If
your project uses Yarn, Bundler, Pip, for example, the dependencies downloaded
during a job can be cached for later use rather than being re-downloaded on
every build.

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

Make note of the use of a `checksum` in the cache `key`; this is used to
calculate when a specific depenecy-management file (such as a `package.json` or
`requirements.txt` in this case) _changes_ and so the cache will be updated. In
the above example, the
`[restore_cache]({{site.baseurl}}/configuration-reference#restore_cache)` example
uses interpolation to put dynamic values into the cache-key, allowing more
control in what exactly constitutes the need to update a cache.

Consult the [caching document]({{site.baseurl}}/2.0/caching) to learn more.

## Resource Class

**Note:** A paid plan is required to use the `resource_class` feature. If you are on a the container-based plan you will need to [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) to have a CircleCI Sales representative contact you about enabling this feature on your account.

After this feature is added to your paid plan, it is possible to configure CPU and RAM resources for each job as described in the following table. If `resource_class` is not specified or an invalid class is specified, the default `resource_class: medium` will be used. The `resource_class` key is currently only available for use with the `docker` executor.

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

## Workflows



## Parallelism

Note: This feature is only available to certain paid plans.

If your project has a large test suite, you can configure your build to use  `[parallelism]({{site.baseurl}}/configuration-reference#parallelism)`
to spread your tests across multiple machines. CircleCI supports automatic test
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


## Docker Layer Caching

**Note** DLC is a premium feature and you must open a support ticket to enable it on your account for an additional fee.

DLC is a feature that can help to reduce the _build time_ of a Docker image in
your build. Docker Layer Caching is useful if you find yourself frequently
building Docker images as a regular part of your CI/CD process.

DLC is similar to _caching dependencies_ mentioned above in that it _saves_ the
image layers that you build within your job, making them available on subsequent
builds.

```
version: 2
jobs:
 build:
   docker:
     # DLC does nothing here, its caching depends on commonality of the image layers.
      - image: circleci/node:9.8.0-stretch-browsers
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true
      # DLC will explicitly cache layers here and try to avoid rebuilding.
      - run: docker build .
```

Learn more about [Docker Layer Caching]({{site.baseurl}}/2.0/docker-layer-caching)

## See Also

For a complete list of customizations that can be made your build, consider
reading our [configuration reference]({{ site.baseurl
}}/2.0/configuration-reference/).
