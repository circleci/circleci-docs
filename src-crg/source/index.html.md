---
title: CircleCI 2.1 Configuration Reference Guide

language_tabs:
  - shell

search: true
---

# CircleCI 2.1 Configuration Reference Guide

## Overview

This document is a reference for the CircleCI 2.1 configuration keys used in the `config.yml` file. The presence of a `.circleci/config.yml` file in your CircleCI-authorized repository branch indicates you want to use the 2.x infrastructure.

## **`version`**

Key | Required | Type | Description
----|-----------|------|------------
version | Y | String | `2`, `2.0`, or `2.1` See the [Reusing Config]({{ site.baseurl }}/2.0/reusing-config/) doc for an overview of new 2.1 keys available to simplify your `.circleci/config.yml` file, reuse, and parameterized jobs.

The `version` field is intended to be used in order to issue warnings for deprecation or breaking changes.

## **`orbs`**

Key | Required | Type | Description
----|-----------|------|------------
orbs | N | Map | A map of user-selected names to either: orb references (strings) or orb definitions (maps). Orb definitions must be the orb-relevant subset of 2.1 config. See the [Creating Orbs]({{ site.baseurl }}/2.0/creating-orbs/) documentation for details.
executors | N | Map | A map of strings to executor definitions. See the [Executors]({{ site.baseurl }}/2.0/configuration-reference/#executors-requires-version-21) section below.
commands | N | Map | A map of command names to command definitions. See the [Commands]({{ site.baseurl }}/2.0/configuration-reference/#commands-requires-version-21) section below.

```yaml
version: 2.1

orbs:
    hello: circleci/hello-build@0.0.5
workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```
In this example, `hello` is considered the orbs reference; whereas `circleci/hello-build@0.0.5` is the fully-qualified orb reference.

## **`commands`**

A command definition defines a sequence of steps as a map to be executed in a job, enabling you to [reuse a single command definition]({{ site.baseurl }}/2.0/reusing-config/) across multiple jobs.

Key | Required | Type | Description
----|-----------|------|------------
steps | Y | Sequence | A sequence of steps run inside the calling job of the command.
parameters | N  | Map | A map of parameter keys. See the [Parameter Syntax]({{ site.baseurl }}/2.0/reusing-config/#parameter-syntax) section of the [Reusing Config]({{ site.baseurl }}/2.0/reusing-config/) document for details.
description | N | String | A string that describes the purpose of the command.

```yaml
version: 2.1

commands:
  sayhello:
    description: "A very simple command for demonstration purposes"
    parameters:
      to:
        type: string
        default: "Hello World"
    steps:
      - run: echo << parameters.to >>
```

## **`parameters`**
Pipeline parameters declared for use in the configuration. See [Pipeline Variables]({{ site.baseurl }}/2.0/pipeline-variables#pipeline-parameters-in-configuration) for usage details.

Key | Required  | Type | Description
----|-----------|------|------------
parameters | N  | Map | A map of parameter keys. Supports `string`, `boolean`, `integer` and `enum` types. See [Parameter Syntax]({{ site.baseurl }}/2.0/reusing-config/#parameter-syntax) for details.

## **`executors`**

Executors define the environment in which the steps of a job will be run, allowing you to reuse a single executor definition across multiple jobs.

Key | Required | Type | Description
----|-----------|------|------------
docker | Y <sup>(1)</sup> | List | Options for [docker executor](#docker)
resource_class | N | String | Amount of CPU and RAM allocated to each container in a job. **Note:** A paid account is required to access this feature. Customers on paid container-based plans can request access by [opening a support ticket](https://support.circleci.com/hc/en-us/requests/new).
machine | Y <sup>(1)</sup> | Map | Options for [machine executor](#machine)
macos | Y <sup>(1)</sup> | Map | Options for [macOS executor](#macos)
windows | Y <sup>(1)</sup> | Map | Options for [windows executor](#windows)
shell | N | String | Shell to use for execution command in all steps. Can be overridden by `shell` in each step (default: See [Default Shell Options](#default-shell-options))
working_directory | N | String | In which directory to run the steps.
environment | N | Map | A map of environment variable names and values.

<sup>(1)</sup> One executor type should be specified per job. If more than one is set you will receive an error.

```yaml
version: 2.1

executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.5.1-node-browsers

jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

See the [Using Parameters in Executors](https://circleci.com/docs/2.0/reusing-config/#using-parameters-in-executors) section of the [Reusing Config]({{ site.baseurl }}/2.0/reusing-config/) document for examples of parameterized executors.

## **`jobs`**

A run is comprised of one or more named jobs. The name of the job is the key in the map, and the value is a map describing the job.

If you are using [Workflows]({{ site.baseurl }}/2.0/workflows/), jobs must have unique names within the `.circleci/config.yml` file.

If you are **not** using workflows, the `jobs` map must contain a job named `build`. This `build` job is the default entry-point for a run that is triggered by a push to your VCS provider. It is possible to then specify additional jobs and run them using the CircleCI API.

**Note:**
Jobs have a maximum runtime of 5 hours. If your jobs are timing out, consider running some of them concurrently using [workflows]({{ site.baseurl }}/2.0/workflows/).

### **<`job_name`>**

Each job consists of the job's name as a key and a map as a value. A name should be unique within a current `jobs` list. The value map has the following attributes:

Key | Required | Type | Description
----|-----------|------|------------
docker | Y <sup>(1)</sup> | List | Options for [docker executor](#docker)
machine | Y <sup>(1)</sup> | Map | Options for [machine executor](#machine)
macos | Y <sup>(1)</sup> | Map | Options for [macOS executor](#macos)
shell | N | String | Shell to use for execution command in all steps. Can be overridden by `shell` in each step (default: See [Default Shell Options](#default-shell-options))
parameters | N | Map | A map of parameters that need to be passed as part of the request when performing this operation
steps | Y | List | A list of [steps](#steps) to be performed
working_directory | N | String | The directory used to run the steps. Default: `~/project` (where `project` is a literal string, not the name of your specific project). Processes run during the job can use the `$CIRCLE_WORKING_DIRECTORY` environment variable to refer to this directory. **Note:** Paths written in your YAML configuration file will _not_ be expanded; if your `store_test_results.path` is `$CIRCLE_WORKING_DIRECTORY/tests`, then CircleCI will attempt to store the `test` subdirectory of the directory literally named `$CIRCLE_WORKING_DIRECTORY`, dollar sign `$` and all.
parallelism | N | Integer | Number of parallel instances of this job to run (default: 1)
environment | N | Map | A map of environment variable names and values.
resource_class | N | String | Amount of CPU and RAM allocated to each container in a job. **Note:** A paid account is required to access this feature. Customers on paid container-based plans can request access by [opening a support ticket](https://support.circleci.com/hc/en-us/requests/new).

One executor type should be specified per job. If more than one is set, you will receive an error.

#### `environment`

A map of environment variable names and values. These will override any environment variables you set in the CircleCI application.

#### `parallelism`

If `parallelism` is set to N > 1, then N independent executors will be set up and each will run the steps of that job in parallel. This can help optimize your test steps; you can split your test suite, using the CircleCI CLI, across parallel containers so the job will complete in a shorter time. Certain parallelism-aware steps can opt out of the parallelism and only run on a single executor (for example [`deploy` step](#deploy)). Learn more about [parallel jobs]({{ site.baseurl }}/2.0/parallelism-faster-jobs/).

Note that `working_directory` will be created automatically if it does not exist.

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      FOO: bar
    parallelism: 3
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test -v $(go list ./... | circleci tests split)
```

### **`docker`** / **`machine`** / **`macos`** / **`windows`** (_executor_)

An "executor" is roughly "a place where steps occur". CircleCI 2.0 can build the necessary environment by launching as many docker containers as needed at once, or it can use a full virtual machine. Learn more about [different executors]({{ site.baseurl }}/2.0/executor-types/).

#### `docker`

Configured by the `docker` key which takes a list of maps:

Key | Required | Type | Description
----|-----------|------|------------
image | Y | String | The name of a custom docker image to use
name | N | String | The name the container is reachable by.  By default, container services are accessible through `localhost`
entrypoint | N | String or List | The command used as executable when launching the container
command | N | String or List | The command used as pid 1 (or args for entrypoint) when launching the container
user | N | String | Which user to run commands as within the Docker container
environment | N | Map | A map of environment variable names and values
auth | N | Map | Authentication for registries using standard `docker login` credentials
aws_auth | N | Map | Authentication for AWS EC2 Container Registry (ECR)

The first `image` listed in the file defines the primary container image where all steps will run.

`entrypoint` overrides default entrypoint from Dockerfile.

`command` will be used as arguments to image entrypoint (if specified in Dockerfile) or as executable (if no entrypoint is provided here or in the Dockerfile).

For [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) (listed first in the list) if no `command` is specified then `command` and image entrypoint will be ignored, to avoid errors caused by the entrypoint executable consuming significant resources or exiting prematurely. At this time, all `steps` are run in the primary container only.

The `name` string defines the name for reaching the secondary service containers. By default, all services are exposed directly on `localhost`. The field is appropriate if you would rather have a different host name instead of localhost, for example, if you are starting multiple versions of the same service.

The `environment` settings apply to all commands run in this executor, not just the initial `command`. The `environment` has higher precedence over setting it in the job map above.

You can specify image versions using tags or digest. You can use any public images from any public Docker registry (defaults to Docker Hub). Learn more about [specifying images]({{ site.baseurl }}/2.0/executor-types).

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: buildpack-deps:trusty # primary container
        environment:
          ENV: CI

      - image: mongo:2.6.8
        command: [--smallfiles]

      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: root

      - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673
```

If you are using a private image, you can specify the username and password in the `auth` field. To protect the password, you can set it as a project setting.

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user  # can specify string literal values
          password: $DOCKERHUB_PASSWORD  # or project UI env-var reference
```

Using an image hosted on [AWS ECR](https://aws.amazon.com/ecr/) requires authentication using AWS credentials. By default, CircleCI uses the AWS credentials that you add to the Project > Settings > AWS Permissions page in the CircleCI application, or by setting the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` project environment variables. It is also possible to set the credentials by using `aws_auth` field.

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: AKIAQWERVA  # can specify string literal values
          aws_secret_access_key: $ECR_AWS_SECRET_ACCESS_KEY  # or project UI envar reference
```

It is possible to reuse [declared commands]({{ site.baseurl }}/2.0/reusing-config/) in a job when using version 2.1. This example invokes the `sayhello` command.

```yaml
version: 2.1

jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - sayhello:
          to: "Lev"
```

#### **`machine`**

The [machine executor]({{ site.baseurl }}/2.0/executor-types) is configured by using the `machine` key, which takes a map:

Key | Required | Type | Description
----|-----------|------|------------
image | Y | String | The VM image to use. View [available images](#available-machine-images). **Note:** This key is **not** supported on the installable CircleCI. For information about customizing `machine` executor images on CircleCI installed on your servers, see our [VM Service documentation]({{ site.baseurl }}/2.0/vm-service).
docker_layer_caching | N | Boolean | Set to `true` to enable [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching). **Note:** You must open a support ticket to have a CircleCI Sales representative contact you about enabling this feature on your account for an additional fee.

```yaml
version: 2.1

jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01
    steps:
      - checkout
      - run:
          name: "Testing"
          command: echo "Hi"
```

##### Available `machine` images
CircleCI supports multiple machine images that can be specified in the `image` field:

* `ubuntu-1604:201903-01` - Ubuntu 16.04, docker 18.09.3, docker-compose 1.23.1
* `circleci/classic:latest` (old default) - an Ubuntu version `14.04` image that includes Docker version `17.09.0-ce` and docker-compose version `1.14.0`, along with common language tools found in CircleCI 1.0 build image. Changes to the `latest` image are [announced](https://discuss.circleci.com/t/how-to-subscribe-to-announcements-and-notifications-from-circleci-email-rss-json/5616) at least a week in advance. Ubuntu 14.04 is now End-of-Life'd. We suggest using the Ubuntu 16.04 image.
* `circleci/classic:edge` - an Ubuntu version `14.04` image with Docker version `17.10.0-ce` and docker-compose version `1.16.1`, along with common language tools found in CircleCI 1.0 build image.
* `circleci/classic:201703-01` – docker 17.03.0-ce, docker-compose 1.9.0
* `circleci/classic:201707-01` – docker 17.06.0-ce, docker-compose 1.14.0
* `circleci/classic:201708-01` – docker 17.06.1-ce, docker-compose 1.14.0
* `circleci/classic:201709-01` – docker 17.07.0-ce, docker-compose 1.14.0
* `circleci/classic:201710-01` – docker 17.09.0-ce, docker-compose 1.14.0
* `circleci/classic:201710-02` – docker 17.10.0-ce, docker-compose 1.16.1
* `circleci/classic:201711-01` – docker 17.11.0-ce, docker-compose 1.17.1
* `circleci/classic:201808-01` – docker 18.06.0-ce, docker-compose 1.22.0

The machine executor supports [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching) which is useful when you are building Docker images during your job or Workflow.

##### Available Linux GPU images

When using the [Linux GPU executor](#gpu-executor-linux), the available images are:

* `ubuntu-1604-cuda-10.1:201909-23` - CUDA 10.1, docker 19.03.0-ce, nvidia-docker 2.2.2
* `ubuntu-1604-cuda-9.2:201909-23` - CUDA 9.2, docker 19.03.0-ce, nvidia-docker 2.2.2

##### Available Windows GPU image

When using the [Windows GPU executor](#gpu-executor-windows), the available image is:

* `windows-server-2019-nvidia:stable` - Windows Server 2019, CUDA 10.1.
  This image is the default.

```yaml
version: 2.1

workflows:
  main:
    jobs:
      - build
jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01
      docker_layer_caching: true    # default - false
```

#### **`macos`**

CircleCI supports running jobs on [macOS](https://developer.apple.com/macos/), to allow you to build, test, and deploy apps for macOS, [iOS](https://developer.apple.com/ios/), [tvOS](https://developer.apple.com/tvos/) and [watchOS](https://developer.apple.com/watchos/). To run a job in a macOS virtual machine, you must add the `macos` key to the top-level configuration for the job and specify the version of Xcode you would like to use.

Key | Required | Type | Description
----|-----------|------|------------
xcode | Y | String | The version of Xcode installed on the virtual machine. See the [Supported Xcode Versions section of the Testing iOS]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions) document for the complete list.

Use a macOS virtual machine with Xcode version 11.3:

```yaml
version: 2.1

jobs:
  build:
    macos:
      xcode: "11.3.0"
```

#### **`windows`**

CircleCI supports running jobs on Windows. To run a job on a Windows machine, you must add the `windows` key to the top-level configuration for the job. Orbs also provide easy access to setting up a Windows job. To learn more about prerequisites to running Windows jobs and what Windows machines can offer, consult the [Hello World on Windows]({{ site.baseurl }}/2.0/hello-world-windows) document.

Use a windows executor to run a simple job.

```yaml
version: 2.1

orbs:
  win: circleci/windows@2.3.0

jobs:
  build:
    executor: win/default
    steps:
      - checkout
      - run: echo 'Hello, Windows'
```

#### **`branches`**

Defines rules for allowing/blocking execution of some branches if Workflows are **not** configured and you are using 2.0 (not 2.1) config. If you are using [Workflows]({{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-workflows), job-level branches will be ignored and must be configured in the Workflows section of your `config.yml` file. If you are using 2.1 config, you will need to add a workflow in order to use filtering. See the [workflows](#workflows) section for details. The job-level `branch` key takes a map:

Key | Required | Type | Description
----|-----------|------|------------
only | N | List | List of branches that only will be executed
ignore | N | List | List of branches to ignore

Both `only` and `ignore` lists can have full names and regular expressions. Regular expressions must match the **entire** string.

```yaml
version: 2.1

jobs:
  build:
    branches:
      only:
        - master
        - /rc-.*/
```

In this case, only "master" branch and branches matching regex "rc-.*" will be executed.

```yaml
version: 2.1

jobs:
  build:
    branches:
      ignore:
        - develop
        - /feature-.*/
```

In this example, all branches will be executed except "develop" and branches matching regex "feature-.*".

If both `ignore` and `only` are present in config, only `ignore` will be taken into account.

A job that was not executed due to configured rules will show up in the list of jobs in UI, but will be marked as skipped.

To ensure the job runs for **all** branches, either do not use the `branches` key, or use the `only` key along with the regular expression: `/.*/` to catch all branches.

#### **`resource_class`**

The `resource_class` feature allows configuring CPU and RAM resources for each job. Different resource classes are available for different executors, as described in the tables below. **For self-hosted installations of CircleCI Server contact your system administrator for a list of available resource classes**.

CircleCI implements soft concurrency limits for each resource class to ensure the system remains stable for all customers. If you are on a Performance or Custom plan and experience queuing for certain resource classes, it is possible you are hitting these limits. [Contact CircleCI support](https://support.circleci.com/hc/en-us/requests/new) to request a raise on these limits for your account.

**Note:** This feature is automatically enabled on Free and Performance plans. Available resources classes are restricted for customers on the free plan to small/medium for linux, and medium for Windows. MacOS is not yet available on the free plan. If you are on a container plan, you will need to [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) and speak with a CircleCI Sales representative about enabling this feature.

##### Docker Executor

Class                 | vCPUs | RAM
----------------------|-------|-----
small                 | 1     | 2GB
medium (default)      | 2     | 4GB
medium+               | 3     | 6GB
large                 | 4     | 8GB
xlarge                | 8     | 16GB
2xlarge<sup>(2)</sup> | 16    | 32GB
2xlarge+<sup>(2)</sup>| 20    | 40GB

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    resource_class: xlarge
    steps:
      ... // other config
```

##### Machine Executor (Linux)

Class            | vCPUs | RAM
-----------------|-------|------
medium (default) | 2     | 7.5GB
large            | 4     | 15GB
xlarge           | 8     | 32GB
2xlarge          | 16    | 64GB

```yaml
version: 2.1

jobs:
  build:
    machine: true
    resource_class: large
    steps:
      ... // other config
```

##### macOS Executor

Class              | vCPUs | RAM
-------------------|-------|-----
medium (default)   | 4     | 8GB
large<sup>(2)</sup>| 8     | 16GB

```yaml
version: 2.1

jobs:
  build:
    macos:
      xcode: "11.3.0"
    resource_class: large
    steps:
      ... // other config
```

##### Windows Executor

Class             | vCPUs | RAM
------------------|-------|------
medium (default)  | 4     | 15GB
large             | 8     | 30GB
xlarge            | 16    | 60GB
2xlarge           | 32    | 128GB

```yaml
version: 2.1

orbs:
  win: circleci/windows@2.3.0

jobs:
  build:
    executor: win/default
    steps:
      - run: Write-Host 'Hello, Windows'
```

See the [Windows Getting Started document]({{ site.baseurl }}/2.0/hello-world-windows/) for more details and examples of using the Windows executor.

##### GPU Executor (Linux)

Class                           | vCPUs | RAM | GPUs |    GPU model    | GPU Memory (GiB)
--------------------------------|-------|-----|------|-----------------|------------------
gpu.nvidia.small<sup>(2)</sup>  |   4   | 15  | 1    | Nvidia Tesla P4 | 8
gpu.nvidia.medium<sup>(2)</sup> |   8   | 30  | 1    | Nvidia Tesla T4 | 16

```yaml
version: 2.1

jobs:
  build:
    machine:
      resource_class: gpu.nvidia.small
      image: ubuntu-1604-cuda-10.1:201909-23
    steps:
      - run: nvidia-smi
      - run: docker run --gpus all nvidia/cuda:9.0-base nvidia-smi
```

See the [Available Linux GPU images](#available-linux-gpu-images) section for the full list of available images.

##### GPU Executor (Windows)

Class                                   | vCPUs | RAM | GPUs |    GPU model    | GPU Memory (GiB)
----------------------------------------|-------|-----|------|-----------------|------------------
windows.gpu.nvidia.medium<sup>(2)</sup> |   8   | 30  | 1    | Nvidia Tesla T4 | 16

```yaml
version: 2.1

orbs:
  win: circleci/windows@2.3.0

jobs:
  build:
    executor: win/gpu-nvidia
    steps:
      - checkout
      - run: '&"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"'
```

_This resource requires review by our support team. [Open a support ticket](https://support.circleci.com/hc/en-us/requests/new) if you would like to request access._

**Note**: Java, Erlang and any other languages that introspect the `/proc` directory for information about CPU count may require additional configuration to prevent them from slowing down when using the CircleCI 2.0 resource class feature. Programs with this issue may request 32 CPU cores and run slower than they would when requesting one core. Users of languages with this issue should pin their CPU count to their guaranteed CPU resources.
If you want to confirm how much memory you have been allocated, you can check the cgroup memory hierarchy limit with `grep hierarchical_memory_limit /sys/fs/cgroup/memory/memory.stat`.

#### **`steps`**

The `steps` setting in a job should be a list of single key/value pairs, the key of which indicates the step type. The value may be either a configuration map or a string (depending on what that type of step requires).

```yaml
version: 2.1

jobs:
  build:
    working_directory: ~/canary-python
    environment:
      FOO: bar
    steps:
      - run:
          name: Running tests
          command: make test
```

In this example, `run` is a step type. The `name` attribute is used by the UI for display purposes. The `command` attribute is specific for `run` step and defines command to execute.

Some steps may implement a shorthand semantic. For example, `run` may be also be called like this:

```yaml
version: 2.1

jobs:
  build:
    steps:
      - run: make test
```

In its short form, the `run` step allows us to directly specify which `command` to execute as a string value. In this case step itself provides default suitable values for other attributes (`name` here will have the same value as `command`, for example).

Another shorthand, which is possible for some steps, is to simply use the step name as a string instead of a key/value pair:

```yaml
version: 2.1

jobs:
  build:
    steps:
      - checkout
```

In this case, the `checkout` step will checkout project source code into the job's [`working_directory`](#jobs).

In general all steps can be described as:

Key | Required | Type | Description
----|-----------|------|------------
&lt;step_type> | Y | Map or String | A configuration map for the step or some string whose semantics are defined by the step.

Each built-in step is described in detail below.

##### **`run`**

Used for invoking all command-line programs, taking either a map of configuration values, or, when called in its short-form, a string that will be used as both the `command` and `name`. Run commands are executed using non-login shells by default, so you must explicitly source any dotfiles as part of the command.

Key | Required | Type | Description
----|-----------|------|------------
command | Y | String | Command to run via the shell
name | N | String | Title of the step to be shown in the CircleCI UI (default: full `command`)
shell | N | String | Shell to use for execution command (default: See [Default Shell Options](#default-shell-options))
environment | N | Map | Additional environmental variables, locally scoped to command
background | N | Boolean | Whether or not this step should run in the background (default: false)
working_directory | N | String | In which directory to run this step (default:  [`working_directory`](#jobs) of the job)
no_output_timeout | N | String | Elapsed time the command can run without output. The string is a decimal with unit suffix, such as "20m", "1.25h", "5s" (default: 10 minutes)
when | N | String | [Specify when to enable or disable the step](#the-when-attribute). Takes the following values: `always`, `on_success`, `on_fail` (default: `on_success`)

Each `run` declaration represents a new shell. It's possible to specify a multi-line `command`, each line of which will be run in the same shell:

``` yaml
version: 2.1

- run:
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

###### _Default shell options_

For jobs that run on **Linux**, the default value of the `shell` option is `/bin/bash -eo pipefail` if `/bin/bash` is present in the build container. Otherwise it is `/bin/sh -eo pipefail`. The default shell is not a login shell (`--login` or `-l` are not specified). Hence, the shell will **not** source your `~/.bash_profile`, `~/.bash_login`, `~/.profile` files.

For jobs that run on **macOS**, the default shell is `/bin/bash --login -eo pipefail`. The shell is a non-interactive login shell. The shell will execute `/etc/profile/` followed by `~/.bash_profile` before every step.

For more information about which files are executed when bash is invocated, [see the `INVOCATION` section of the `bash` manpage](https://linux.die.net/man/1/bash).

Descriptions of the `-eo pipefail` options are provided in the right pane.

`-e`

> Exit immediately if a pipeline (which may consist of a single simple command), a subshell command enclosed in parentheses, or one of the commands executed as part of a command list enclosed by braces exits with a non-zero status.

So if in the previous example `mkdir` failed to create a directory and returned a non-zero status, then command execution would be terminated, and the whole step would be marked as failed. If you desire the opposite behaviour, you need to add `set +e` in your `command` or override the default `shell` in your configuration map of `run`.

``` yaml
version: 2.1

- run:
    command: |
      echo Running test
      set +e
      mkdir -p /tmp/test-results
      make test

- run:
    shell: /bin/sh
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

`-o pipefail`

> If pipefail is enabled, the pipeline’s return status is the value of the last (rightmost) command to exit with a non-zero status, or zero if all commands exit successfully. The shell waits for all commands in the pipeline to terminate before returning a value.

``` yaml
version: 2.1

- run: make test | tee test-output.log
```

If `make test` fails, the `-o pipefail` option will cause the whole step to fail. Without `-o pipefail`, the step will always run successfully because the result of the whole pipeline is determined by the last command (`tee test-output.log`), which will always return a zero status.

Note that even if `make test` fails the rest of pipeline will be executed.

If you want to avoid this behaviour, you can specify `set +o pipefail` in the command or override the whole `shell` (see example above).

In general, we recommend using the default options (`-eo pipefail`) because they show errors in intermediate commands and simplify debugging job failures. For convenience, the UI displays the used shell and all active options for each `run` step.

For more information, see the [Using Shell Scripts]({{ site.baseurl }}/2.0/using-shell-scripts/) document.

###### _Background commands_

The `background` attribute enables you to configure commands to run in the background. Job execution will immediately proceed to the next step rather than waiting for return of a command with the `background` attribute set to `true`. This example shows the config for running the X virtual framebuffer in the background which is commonly required to run Selenium tests:

``` yaml
version: 2.1

- run:
    name: Running X virtual framebuffer
    command: Xvfb :99 -screen 0 1280x1024x24
    background: true

- run: make test
```

###### _Shorthand syntax_

`run` has a very convenient shorthand syntax:

``` yaml
version: 2.1

- run: make test

# shorthanded command can also have multiple lines
- run: |
    mkdir -p /tmp/test-results
    make test
```

In this case, `command` and `name` become the string value of `run`, and the rest of the config map for that `run` have their default values.

###### The `when` Attribute

By default, CircleCI will execute job steps one at a time, in the order that they are defined in `config.yml`, until a step fails (returns a non-zero exit code). After a command fails, no further job steps will be executed.

Adding the `when` attribute to a job step allows you to override this default behaviour, and selectively run or skip steps depending on the status of the job.

The default value of `on_success` means that the step will run only if all of the previous steps have been successful (returned exit code 0).

A value of `always` means that the step will run regardless of the exit status of previous steps. This is useful if you have a task that you want to run regardless of whether the previous steps are successful or not. For example, you might have a job
step that needs to upload logs or code-coverage data somewhere.

A value of `on_fail` means that the step will run only if one of the preceding steps has failed (returns a non-zero exit code). It is common to use `on_fail` if you want to store some diagnostic data to help debug test failures, or to run custom notifications about the failure, such as sending emails or triggering alerts in chatrooms.

**Note**: Some steps, such as `store_artifacts` and `store_test_results` will always run, even if a step has failed previously.

``` yaml
version: 2.1

- run:
    name: Upload CodeCov.io Data
    command: bash <(curl -s https://codecov.io/bash) -F unittests
    when: always # Uploads code coverage results, pass or fail
```

##### **The `when` Step** (requires version: 2.1)

A conditional step consists of a step with the key `when` or `unless`. Under the `when` key are the subkeys `condition` and `steps`. The purpose of the `when` step is customizing commands and job configuration to run on custom conditions (determined at config-compile time) that are checked before a workflow runs. See the [Conditional Steps section of the Reusing Config document]({{ site.baseurl }}/2.0/reusing-config/#defining-conditional-steps) for more details.

Key | Required | Type | Description
----|-----------|------|------------
condition | Y | String | A parameter value
steps |	Y |	Sequence |	A list of steps to execute when the condition is true

```yaml
version: 2.1

jobs: # conditional steps may also be defined in `commands:`
  job_with_optional_custom_checkout:
    parameters:
      custom_checkout:
        type: string
        default: ""
    machine: true
    steps:
      - when:
          condition: <<parameters.custom_checkout>>
          steps:
            - run: echo "my custom checkout"
      - unless:
          condition: <<parameters.custom_checkout>>
          steps:
            - checkout
workflows:
  build-test-deploy:
    jobs:
      - job_with_optional_custom_checkout:
          custom_checkout: "any non-empty string is truthy"
      - job_with_optional_custom_checkout
```

##### Using `pipeline.` Values

Pipeline values are available to all pipeline configurations and can be used without previous declaration. The pipeline values available are as follows:

Value                       | Description
----------------------------|--------------------------------------------------------
pipeline.id                 | A globally unique id representing for the pipeline
pipeline.number             | A project unique integer id for the pipelin
pipeline.project.git_url    | E.g. https://github.com/circleci/circleci-docs
pipeline.project.type       | E.g. "github"
pipeline.git.tag            | The tag triggering the pipeline
pipeline.git.branch         | The branch triggering the pipeline
pipeline.git.revision       | The current git revision
pipeline.git.base_revision  | The previous git revision

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: circleci/node:latest
    environment:
      IMAGETAG: latest
    working_directory: ~/main
    steps:
      - run: echo "This is pipeline ID << pipeline.id >>"
```

##### **Using `when` in Workflows**

With CircleCI configuration v2.1, you may use a `when` clause (the inverse clause `unless` is also supported) under a workflow declaration with a truthy or falsy value to determine whether or not to run that workflow. The most common use of `when` is with CircleCI API v2 pipeline triggering with parameters.

This example configuration uses a pipeline parameter, `run_integration_tests` to drive the `integration_tests` workflow.

```yaml
version: 2.1

parameters:
  run_integration_tests:
    type: boolean
    default: false

jobs:
...
```

This example prevents the workflow `integration_tests` from running unless the tests are invoked explicitly when the pipeline is triggered with the following in the `POST` body:

```yaml
version: 2.1

{
    "parameters": {
        "run_integration_tests": true
    }
}
```
