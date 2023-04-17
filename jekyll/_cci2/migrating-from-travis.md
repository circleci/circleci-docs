---
layout: classic-docs
title: Migrate From Travis CI
categories: [migration]
description: An overview of how to migrate from Travis CI to CircleCI.
contentTags:
  platform:
  - Cloud
  - Server 3.x
---

This document provides an overview of how to migrate from Travis CI to CircleCI.

The example build configurations referenced throughout this article are based
on this [example JavaScript repository](https://github.com/CircleCI-Public/circleci-demo-javascript-express/blob/master/.circleci/config.yml).

## Prerequisites
{: #prerequisites }

This document assumes that:
1. You have an account with CircleCI that is linked to a repository. If you do not have an account,
consider reading our [Getting Started Guide]({{ site.baseurl }}/getting-started/).
1. You understand the [Basic Concepts]({{ site.baseurl }}/concepts/) in CircleCI.

## Why migrate to CircleCI?
{: #why-migrate-to-circleci }

- **Scaling Concurrency**: You can run up to 80 concurrent jobs on our monthly Performance plan or even more on a [custom plan](https://circleci.com/pricing/). Travis CI has capped concurrencies of 1, 2, 5, and 10 on each of their plans.
- **Resource Classes**: [vCPU & RAM]({{ site.baseurl }}/configuration-reference/#resource_class) are configurable within CircleCI jobs to strategically speed up builds and spend credits, whereas these values are fixed on Travis CI.
- **Parallelization by Timing**: On top of running many jobs concurrently, CircleCI offers built-in [test splitting]({{ site.baseurl }}/parallelism-faster-jobs/) across multiple environments by timing. This dramatically reduces wall clock time for large test suites to finish. You must implement this manually in Travis CI.
- **Orbs**: Rather than proprietary integrations, CircleCI offers [orbs]({{ site.baseurl }}/orb-intro/), which are reusable, templated configuration. On top of connecting to services and tools, orbs can be used to standardize and templatize configuration for your team and organization as well. [Visit the registry](https://circleci.com/developer/orbs).

## Configuration files
{: #configuration-files }

Both Travis CI and CircleCI make use of a _configuration file_ to define your
workflows and jobs. The only difference is that your CircleCI configuration
will live in `.circleci/config.yml` at the root of your repository.

Below, you'll find a side-by-side comparison of different configuration declarations.

| Travis CI         | Circle CI                                                                          | Description                                                                                          |
|-------------------|------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| language:,<br>os: | [docker, machine, macos, windows]({{ site.baseurl }}/executor-intro/)          | CircleCI doesn't assume dependencies or commands based on a language; instead, choose an executor and use `run:` steps as shown below to execute commands you require (e.g., install, build, test). |
| dist:             | [machine]({{ site.baseurl }}/configuration-reference/#machine)                 | Our Linux VM executor is a Ubuntu VM. You can specify [versions]({{ site.baseurl }}/configuration-reference/#available-linux-machine-images) in the config |
| cache:            | [restore_cache:]({{ site.baseurl }}/configuration-reference/#restore_cache), [save_cache:]({{ site.baseurl }}/configuration-reference/#restore_cache) | Use the restore and save cache features to control caching in the builds |
| before_cache      | [run:]({{ site.baseurl }}/configuration-reference/#run)                        | If you want to run any commands before you cache, simply place a run: step before your cache step(s) in CircleCI |
| before_install:   | [run:]({{ site.baseurl }}/configuration-reference/#run)                        | CircleCI doesn't separate commands into stages or types. Use `run:` steps to specify any commands and order them per your needs. See [documentation]({{ site.baseurl }}/configuration-reference/#the-when-attribute) for usage of conditional steps |
| install:          | [run:]({{ site.baseurl }}/configuration-reference/#run)                        | " (see above)                                                                                        |
| before_script     | [run:]({{ site.baseurl }}/configuration-reference/#run)                        | " (see above)                                                                                        |
| script:           | [run:]({{ site.baseurl }}/configuration-reference/#run)                        | " (see above)                                                                                        |
| after_script:     | [run:]({{ site.baseurl }}/configuration-reference/#run)                        | " (see above)                                                                                        |
| deploy:           | [run:]({{ site.baseurl }}/configuration-reference/#run)                        | Use a `run:` step to run needed commands for deployment. See our [Deployment overview page]({{site.baseurl}}/deployment-overview) for links to examples. |
| env:              | [environment:]({{site.baseurl}}/configuration-reference/#environment) | Use the environment: element to specify environment variables                                        |
| matrix:           | [matrix:]({{site.baseurl}}/configuration-reference/#matrix-requires-version-21) | CircleCI also offers matrix syntax under our workflows configuration. |
| stage:            | [requires:]({{site.baseurl}}/configuration-reference/#requires)       | Use the requires: element to define job dependencies and control concurrent jobs in workflows        |
{: class="table table-striped"}

## Building on pushing code
{: #building-on-pushing-code }

The example repository linked above is a basic application for creating, reading, updating, and deleting articles. The
app is built with the `MERN` stack and there are tests present on the client as
well as the REST API that should run whenever code is pushed.

To get tests running for this example repository, the beginnings of a simple
Travis Configuration might look like the following example:

```yaml
language: node_js
services: mongodb
before_install:
  - npm i -g npm@5
node_js:
  - "5"
cache: npm
```

For basic builds, a Travis CI configuration will leverage a language's best known
dependency and build tools and will abstract them away as default commands
(which can be overridden) in [a job lifecycle](https://docs.travis-ci.com/user/job-lifecycle/#the-job-lifecycle). In this
case, when the build runs, Travis CI will automatically run `npm install` for the
`install` step, and run `npm start` for the `script` step.

If a user needs more control with their CI environment, Travis CI uses _hooks_
to run commands before/after the `install` and `script` steps. In the example
above, a "before hook" is used to specify that the npm version be pinned to `5`. Hooks can execute shell
scripts as well, which users will sometimes store in a `.travis` folder at the
root of their repository.

The following CircleCI configuration to achieve the same results is excerpted from the example repository:

{% raw %}
```yaml
version: 2.1

workflows:
  build:
    jobs:
      - build

jobs:
  build:
    working_directory: ~/mern-starter
    docker:
      - image: cimg/node:17.2.0 # Primary execution image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: mongo:3.4.4         # Service/dependency image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: update-npm
          command: 'sudo npm install -g npm@5'
      - restore_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
      - run:
          name: install-npm-wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
          paths:
            - ./node_modules
      - run:
          name: test
          command: npm test
```
{% endraw %}

In the config above, no _language_ is specifically required, and the
user is able to specify any number of `steps` that can be run, with no
restrictions on step order. By leveraging Docker, specific Node.js and
MongoDB versions are made available in each `command` that gets run.

### Caching dependencies
{: #caching-dependencies }

With CircleCI you have control over when and how your config caches and restore dependencies. In the above example, the CircleCI `.circleci/config.yml`
checks for a dependency cache based specifically on a checksum of the
`package-lock.json` file. You can set your cache based on any key (not just `package-lock.json`) as well as set a
group of cache paths to defer to in the declared order. Refer to the [caching
dependencies document]({{ site.baseurl }}/caching/) to learn about customizing how your build
creates and restores caches.

In a Travis Configuration, [dependency
caching](https://docs.travis-ci.com/user/caching/) occurs in your build after the
`script` phase and is tied to the language you are using. In our
case, by using the `cache: npm` key in `.travis.yml`, dependencies will default
to caching `node_modules`.

## Environment variables
{: #environment-variables }

Both Travis and CircleCI enable the use of environment variables in your builds.

In your CircleCI `.circleci/config.yml` you can put environment variables directly in your
build config in a step, a job, or a container. These variables are public and unencrypted. With Travis CI, it is possible to include [encrypted environment](https://docs.travis-ci.com/user/environment-variables#defining-encrypted-variables-in-travisyml) variables directly in your config (if you install the `travis` gem).

### Setting environment variables in the web application
{: #setting-environment-variables-in-the-web-application }

If you've used Travis CI's [repository settings](https://docs.travis-ci.com/user/environment-variables#defining-variables-in-repository-settings),
you'll be comfortable setting your environment variables in CircleCI's project
settings page. Read the docs for setting environment variable in a [single
project]({{ site.baseurl }}/set-environment-variable/#set-an-environment-variable-in-a-project).

With CircleCI, it is also possible to securely set environment variables across _all_ projects using [contexts]({{site.baseurl}}/contexts/).

In addition, CircleCI has several [built-in environment variables]({{site.baseurl}}/variables#built-in-environment-variables).

## Artifacts uploading
{: #artifacts-uploading }

With Travis CI you can upload build artifacts either manually using AWS S3 or
as an attachment to a GitHub Release.

On CircleCI, artifact uploading occurs in a step in your config:

```yaml
      - run:
          name: test
          command: npm test
      - run:
          name: code-coverage
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts: # < stores test-results.xml, available in the web app or through the api.
          path: test-results.xml
          prefix: tests
      - store_artifacts:
          path: coverage
          prefix: coverage
      - store_test_results:
          path: test-results.xml
```

After an artifact is successfully uploaded, you can view it in the Artifacts tab
of the Job page in your browser, or access them through the CircleCI API. Read the
documentation on [artifact uploading]({{site.baseurl}}/artifacts/) to learn more.

## Advanced tooling
{: #advanced-tooling }

More advanced configuration on Travis might make use of a *Build Matrix*
(a configuration that specifies running multiple concurrent jobs) or *Build Stages*
(grouping jobs into stages that can run concurrently as well as having sequential
jobs rely on the success of previous jobs.)

With CircleCI you can use [workflows]({{site.baseurl}}/workflows/) in your `.circleci/config.yml` to define a collection of jobs and their
run order, whether leveraging concurrency, fan-in or fan-out builds, or sequentially-dependant builds. Workflows allow complex and fine-grained control over your build configuration.
