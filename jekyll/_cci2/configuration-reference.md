---
layout: classic-docs
title: "Configuring CircleCI"
short-title: "Configuring CircleCI"
description: "Reference for .circleci/config.yml"
categories: [configuring-jobs]
order: 20
---

This document is a reference for the CircleCI 2.x configuration keys that are used in the `config.yml` file. The presence of a `.circleci/config.yml` file in your CircleCI-authorized repository branch indicates that you want to use the 2.x infrastructure.

You can see a complete `config.yml` in our [full example](#full-example).

**Note:** If you already have a CircleCI 1.0 configuration, the `config.yml` file allows you to test 2.x builds on a separate branch, leaving any existing configuration in the old `circle.yml` style unaffected and running on the CircleCI 1.0 infrastructure in branches that do not contain `.circleci/config.yml`.

---

## Table of Contents
{:.no_toc}

* TOC
{:toc}

---

## **`version`**

Key | Required | Type | Description
----|-----------|------|------------
version | Y | String | `2`, `2.0`, or `2.1` See the [Reusing Config]({{ site.baseurl }}/2.0/reusing-config/) doc for an overview of new 2.1 keys available to simplify your `.circleci/config.yml` file, reuse, and parameterized jobs.
{: class="table table-striped"}

The `version` field is intended to be used in order to issue warnings for deprecation or breaking changes.

## **`orbs`** (requires version: 2.1)

Key | Required | Type | Description
----|-----------|------|------------
orbs | N | Map | A map of user-selected names to either: orb references (strings) or orb definitions (maps). Orb definitions must be the orb-relevant subset of 2.1 config. See the [Creating Orbs]({{ site.baseurl }}/2.0/creating-orbs/) documentation for details.
executors | N | Map | A map of strings to executor definitions. See the [Executors]({{ site.baseurl }}/2.0/configuration-reference/#executors-requires-version-21) section below.
commands | N | Map | A map of command names to command definitions. See the [Commands]({{ site.baseurl }}/2.0/configuration-reference/#commands-requires-version-21) section below.
{: class="table table-striped"}

The following example calls an Orb named `hello-build` that exists in the certified `circleci` namespace.

```
version: 2.1
orbs:
    hello: circleci/hello-build@0.0.5
workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```
In the above example, `hello` is considered the orbs reference; whereas `circleci/hello-build@0.0.5` is the fully-qualified orb reference.

## **`commands`** (requires version: 2.1)

A command definition defines a sequence of steps as a map to be executed in a job, enabling you to [reuse a single command definition]({{ site.baseurl }}/2.0/reusing-config/) across multiple jobs.

Key | Required | Type | Description
----|-----------|------|------------
steps | Y | Sequence | A sequence of steps run inside the calling job of the command.
parameters | N  | Map | A map of parameter keys. See the [Parameter Syntax]({{ site.baseurl }}/2.0/reusing-config/#parameter-syntax) section of the [Reusing Config]({{ site.baseurl }}/2.0/reusing-config/) document for details.
description | N | String | A string that describes the purpose of the command.
{: class="table table-striped"}

Example:

```yaml
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

## **`executors`** (requires version: 2.1)

Executors define the environment in which the steps of a job will be run, allowing you to reuse a single executor definition across multiple jobs.

Key | Required | Type | Description
----|-----------|------|------------
docker | Y <sup>(1)</sup> | List | Options for [docker executor](#docker)
resource_class | N | String | Amount of CPU and RAM allocated to each container in a job. (Only available with the `docker` executor) **Note:** A paid account is required to access this feature. Customers on paid container-based plans can request access by [opening a support ticket](https://support.circleci.com/hc/en-us/requests/new).
machine | Y <sup>(1)</sup> | Map | Options for [machine executor](#machine)
macos | Y <sup>(1)</sup> | Map | Options for [macOS executor](#macos)
shell | N | String | Shell to use for execution command in all steps. Can be overridden by `shell` in each step (default: See [Default Shell Options](#default-shell-options))
working_directory | N | String | In which directory to run the steps.
environment | N | Map | A map of environment variable names and values.
{: class="table table-striped"}

Example:

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

A run is comprised of one or more named jobs. Jobs are specified in the `jobs` map, see [Sample 2.0 config.yml]({{ site.baseurl }}/2.0/sample-config/) for two examples of a `job` map. The name of the job is the key in the map, and the value is a map describing the job.

If you are using [Workflows]({{ site.baseurl }}/2.0/workflows/), jobs must have a name that is unique within the `.circleci/config.yml` file.

If you are **not** using workflows, the `jobs` map must contain a job named `build`. This `build` job is the default entry-point for a run that is triggered by a push to your VCS provider. It is possible to then specify additional jobs and run them using the CircleCI API.

**Note:**
Jobs have a maximum runtime of 5 hours. If your jobs are timing out, consider running some of them in parallel.

### **<`job_name`>**

Each job consists of the job's name as a key and a map as a value. A name should be unique within a current `jobs` list. The value map has the following attributes:

Key | Required | Type | Description
----|-----------|------|------------
docker | Y <sup>(1)</sup> | List | Options for [docker executor](#docker)
machine | Y <sup>(1)</sup> | Map | Options for [machine executor](#machine)
macos | Y <sup>(1)</sup> | Map | Options for [macOS executor](#macos)
shell | N | String | Shell to use for execution command in all steps. Can be overridden by `shell` in each step (default: See [Default Shell Options](#default-shell-options))
steps | Y | List | A list of [steps](#steps) to be performed
working_directory | N | String | In which directory to run the steps. Default: `~/project` (where `project` is a literal string, not the name of your specific project). Processes run during the job can use the `$CIRCLE_WORKING_DIRECTORY` environment variable to refer to this directory. **Note:** Paths written in your YAML configuration file will _not_ be expanded; if your `store_test_results.path` is `$CIRCLE_WORKING_DIRECTORY/tests`, then CircleCI will attempt to store the `test` subdirectory of the directory literally named `$CIRCLE_WORKING_DIRECTORY`, dollar sign `$` and all.
parallelism | N | Integer | Number of parallel instances of this job to run (default: 1)
environment | N | Map | A map of environment variable names and values.
branches | N | Map | A map defining rules for whitelisting/blacklisting execution of specific branches for a single job that is **not** in a workflow or a 2.1 config (default: all whitelisted). See [Workflows](#workflows) for configuring branch execution for jobs in a workflow or 2.1 config.
resource_class | N | String | Amount of CPU and RAM allocated to each container in a job. (Only available with the `docker` executor) **Note:** A paid account is required to access this feature. Customers on paid container-based plans can request access by [opening a support ticket](https://support.circleci.com/hc/en-us/requests/new).
{: class="table table-striped"}

<sup>(1)</sup> exactly one of them should be specified. It is an error to set more than one.

#### `environment`
A map of environment variable names and values. These will override any environment variables you set in the CircleCI application.

#### `parallelism`

If `parallelism` is set to N > 1, then N independent executors will be set up and each will run the steps of that job in parallel. Certain parallelism-aware steps can opt out of the parallelism and only run on a single executor (for example [`deploy` step](#deploy)). Learn more about [parallel jobs]({{ site.baseurl }}/2.0/parallelism-faster-jobs/).

`working_directory` will be created automatically if it doesn't exist.

Example:

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      FOO: bar
    parallelism: 3
    resource_class: large
    working_directory: ~/my-app
    branches:
      only:
        - master
        - /rc-.*/
    steps:
      - run: make test
      - run: make
```

#### **`docker`** / **`machine`** / **`macos`**(_executor_)

An "executor" is roughly "a place where steps occur". CircleCI 2.0 can build the necessary environment by launching as many docker containers as needed at once, or it can use a full virtual machine. Learn more about [different executors]({{ site.baseurl }}/2.0/executor-types/).

#### `docker`
{:.no_toc}

Configured by `docker` key which takes a list of maps:

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
{: class="table table-striped"}

The first `image` listed in the file defines the primary container image where all steps will run.

`entrypoint` overrides default entrypoint from Dockerfile.

`command` will be used as arguments to image entrypoint (if specified in Dockerfile) or as executable (if no entrypoint is provided here or in the Dockerfile).

For [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) (listed first in the list) if no `command` is specified then `command` and image entrypoint will be ignored, to avoid errors caused by the entrypoint executable consuming significant resources or exiting prematurely. At this time all `steps` run in the primary container only.

`name` defines the name for reaching the secondary service containers.  By default, all services are exposed directly on `localhost`.  The field is appropriate if you would rather have a different host name instead of localhost, for example, if you are starting multiple versions of the same service.

The `environment` settings apply to all commands run in this executor, not just the initial `command`. The `environment` here has higher precedence over setting it in the job map above.

You can specify image versions using tags or digest. You can use any public images from any public Docker registry (defaults to Docker Hub). Learn more about [specifying images]({{ site.baseurl }}/2.0/executor-types).

Example:

```yaml
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

If you are using a private image, you can specify the username and password in the `auth` field.  To protect the password, you can set it as a project setting which you reference here:

```yaml
jobs:
  build:
    docker:
      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user  # can specify string literal values
          password: $DOCKERHUB_PASSWORD  # or project UI env-var reference
```

Using an image hosted on [AWS ECR](https://aws.amazon.com/ecr/) requires authentication using AWS credentials. By default, CircleCI uses the AWS credentials that you add to the Project > Settings > AWS Permissions page in the CircleCI application or by setting the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` project environment variables. It is also possible to set the credentials by using `aws_auth` field as in the following example:

```
jobs:
  build:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: AKIAQWERVA  # can specify string literal values
          aws_secret_access_key: $ECR_AWS_SECRET_ACCESS_KEY  # or project UI envar reference
```

It is possible to reuse [declared commands]({{ site.baseurl }}/2.0/reusing-config/) in a job when using version 2.1. The following example invokes the `sayhello` command.

```
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - sayhello:
          to: "Lev"
```

#### **`machine`**
{:.no_toc}

The [machine executor]({{ site.baseurl }}/2.0/executor-types) is configured by using the `machine` key, which takes a map:

Key | Required | Type | Description
----|-----------|------|------------
image | Y | String | The VM image to use. View [available images](#available-machine-images). **Note:** This key is **not** supported on the installable CircleCI. For information about customizing `machine` executor images on CircleCI installed on your servers, see our [VM Service documentation]({{ site.baseurl }}/2.0/vm-service).
docker_layer_caching | N | Boolean | Set to `true` to enable [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching). **Note:** You must open a support ticket to have a CircleCI Sales representative contact you about enabling this feature on your account for an additional fee.
{: class="table table-striped"}


Example:

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

**Example**

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
{:.no_toc}

CircleCI supports running jobs on [macOS](https://developer.apple.com/macos/), to allow you to build, test, and deploy apps for macOS, [iOS](https://developer.apple.com/ios/), [tvOS](https://developer.apple.com/tvos/) and [watchOS](https://developer.apple.com/watchos/). To run a job in a macOS virtual machine, you must add the `macos` key to the top-level configuration for the job and specify the version of Xcode you would like to use.

Key | Required | Type | Description
----|-----------|------|------------
xcode | Y | String | The version of Xcode that is installed on the virtual machine, see the [Supported Xcode Versions section of the Testing iOS]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions) document for the complete list.
{: class="table table-striped"}

**Example:** Use a macOS virtual machine with Xcode version `9.0`:

```yaml
jobs:
  build:
    macos:
      xcode: "9.0"
```

#### **`branches`**

Defines rules for whitelisting/blacklisting execution of some branches if Workflows are **not** configured and you are using 2.0 (not 2.1) config. If you are using [Workflows]({{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-workflows), job-level branches will be ignored and must be configured in the Workflows section of your `config.yml` file. If you are using 2.1 config, you will need to add a workflow in order to use filtering. See the [workflows](#workflows) section for details. The job-level `branch` key takes a map:

Key | Required | Type | Description
----|-----------|------|------------
only | N | List | List of branches that only will be executed
ignore | N | List | List of branches to ignore
{: class="table table-striped"}

Both `only` and `ignore` lists can have full names and regular expressions. Regular expressions must match the **entire** string. For example:

``` YAML
jobs:
  build:
    branches:
      only:
        - master
        - /rc-.*/
```

In this case, only "master" branch and branches matching regex "rc-.*" will be executed.

``` YAML
jobs:
  build:
    branches:
      ignore:
        - develop
        - /feature-.*/
```

In this example, all the branches will be executed except "develop" and branches matching regex "feature-.*".

If both `ignore` and `only` are present in config, only `ignore` will be taken into account.

A job that was not executed due to configured rules will show up in the list of jobs in UI, but will be marked as skipped.

#### **`resource_class`**

**Note:** A paid plan is required to use the `resource_class` feature. If you are on a the
container-based plan you will need to [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) to have a CircleCI Sales representative contact you about enabling this feature on your account.

After this feature is added to your paid plan, it is possible to configure CPU and RAM resources for each job as described in the following table. If `resource_class` is not specified or an invalid class is specified, the default `resource_class: medium` will be used. The `resource_class` key is currently only available for use with the `docker` executor.

Class       | vCPUs       | RAM
------------|-----------|------
small       | 1 | 2GB
medium (default) | 2 | 4GB
medium+     | 3 | 6GB
large       | 4 | 8GB
xlarge      | 8 | 16GB
{: class="table table-striped"}

Below is an example of specifying the `large` `resource_class`. 

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      FOO: bar
    parallelism: 3
    resource_class: large
    steps:
      - run: make test
      - run: make
```

**Note**: Java, Erlang and any other languages that introspect the `/proc` directory for information about CPU count may require additional configuration to prevent them from slowing down when using the CircleCI 2.0 resource class feature. Programs with this issue may request 32 CPU cores and run slower than they would when requesting one core. Users of languages with this issue should pin their CPU count to their guaranteed CPU resources.

#### **`steps`**

The `steps` setting in a job should be a list of single key/value pairs, the key of which indicates the step type. The value may be either a configuration map or a string (depending on what that type of step requires). For example, using a map:

```yaml
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

Here `run` is a step type. The `name` attribute is used by the UI for display purposes. The `command` attribute is specific for `run` step and defines command to execute.

Some steps may implement a shorthand semantic. For example, `run` may be also be called like this:

```
jobs:
  build:
    steps:
      - run: make test
```

In its short form, the `run` step allows us to directly specify which `command` to execute as a string value. In this case step itself provides default suitable values for other attributes (`name` here will have the same value as `command`, for example).

Another shorthand, which is possible for some steps, is to simply use the step name as a string instead of a key/value pair:

```
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
{: class="table table-striped"}

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
{: class="table table-striped"}

Each `run` declaration represents a new shell. It's possible to specify a multi-line `command`, each line of which will be run in the same shell:

``` YAML
- run:
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

###### _Default shell options_

The default value of shell option is `/bin/bash -eo pipefail` if `/bin/bash` is present in the build container. Otherwise it is `/bin/sh -eo pipefail`. The default shell is not a login shell (`--login` or `-l` are not specified by default). Hence, the default shell will **not** source your `~/.bash_profile`, `~/.bash_login`, `~/.profile` files. Descriptions of the `-eo pipefail` options are provided below.

`-e`

> Exit immediately if a pipeline (which may consist of a single simple command), a subshell command enclosed in parentheses, or one of the commands executed as part of a command list enclosed by braces exits with a non-zero status.

So if in the previous example `mkdir` failed to create a directory and returned a non-zero status, then command execution would be terminated, and the whole step would be marked as failed. If you desire the opposite behaviour, you need to add `set +e` in your `command` or override the default `shell` in your configuration map of `run`. For example:
``` YAML
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

For example:
``` YAML
- run: make test | tee test-output.log
```

If `make test` fails, the `-o pipefail` option will cause the whole step to fail. Without `-o pipefail`, the step will always run successfully because the result of the whole pipeline is determined by the last command (`tee test-output.log`), which will always return a zero status.

Note that even if `make test` fails the rest of pipeline will be executed.

If you want to avoid this behaviour, you can specify `set +o pipefail` in the command or override the whole `shell` (see example above).

In general, we recommend using the default options (`-eo pipefail`) because they show errors in intermediate commands and simplify debugging job failures. For convenience, the UI displays the used shell and all active options for each `run` step.

For more information, see the [Using Shell Scripts]({{ site.baseurl }}/2.0/using-shell-scripts/) document.

###### _Background commands_

The `background` attribute enables you to configure commands to run in the background. Job execution will immediately proceed to the next step rather than waiting for return of a command with the `background` attribute set to `true`. The following example shows the config for running the X virtual framebuffer in the background which is commonly required to run Selenium tests:

``` YAML
- run:
    name: Running X virtual framebuffer
    command: Xvfb :99 -screen 0 1280x1024x24
    background: true

- run: make test
```

###### _Shorthand syntax_

`run` has a very convenient shorthand syntax:

``` YAML
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

###### Example

```yaml
steps:
  - run:
      name: Testing application
      command: make test
      shell: /bin/bash
      working_directory: ~/my-app
      no_output_timeout: 30m
      environment:
        FOO: bar

  - run: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts

  - run: |
      sudo -u root createuser -h localhost --superuser ubuntu &&
      sudo createdb -h localhost test_db

  - run:
      name: Upload Failed Tests
      command: curl --data fail_tests.log http://example.com/error_logs
      when: on_fail
```

##### **The `when` Step** (requires version: 2.1)

A conditional step consists of a step with the key `when` or `unless`. Under the `when` key are the subkeys `condition` and `steps`. The purpose of the `when` step is customizing commands and job configuration to run on custom conditions (determined at config-compile time) that are checked before a workflow runs. See the [Conditional Steps section of the Reusing Config document]({{ site.baseurl }}/2.0/reusing-config/#defining-conditional-steps) for more details.

Key | Required | Type | Description
----|-----------|------|------------
condition | Y | String | A parameter value
steps |	Y |	Sequence |	A list of steps to execute when the condition is true
{: class="table table-striped"}

###### *Example*

```
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

##### **`checkout`**

Special step used to check out source code to the configured `path` (defaults to the `working_directory`). The reason this is a special step is because it is more of a helper function designed to make checking out code easy for you. If you require doing git over HTTPS you should not use this step as it configures git to checkout over ssh.

Key | Required | Type | Description
----|-----------|------|------------
path | N | String | Checkout directory (default: job's [`working_directory`](#jobs))
{: class="table table-striped"}

If `path` already exists and is:
 * a git repo - step will not clone whole repo, instead will pull origin
 * NOT a git repo - step will fail.

In the case of `checkout`, the step type is just a string with no additional attributes:

``` YAML
- checkout
```

**Note:** CircleCI does not check out submodules. If your project requires submodules, add `run` steps with appropriate commands as shown in the following example:

``` YAML
- checkout
- run: git submodule sync
- run: git submodule update --init
```

**Note:** The `checkout` step will configure Git to skip automatic garbage collection. If you are caching your `.git` directory with [restore_cache](#restore_cache) and would like to use garbage collection to reduce its size, you may wish to use a [run](#run) step with command `git gc` before doing so.

##### **`setup_remote_docker`**

Creates a remote Docker environment configured to execute Docker commands. See [Running Docker Commands]({{ site.baseurl }}/2.0/building-docker-images/) for details.

Key | Required | Type | Description
----|-----------|------|------------
docker_layer_caching | N | boolean | set this to `true` to enable [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching/) in the Remote Docker Environment (default: `false`)
{: class="table table-striped"}

***Notes***:
- A paid account is required to access Docker Layer Caching. Customers on paid plans can request access by [opening a support ticket](https://support.circleci.com/hc/en-us/requests/new). Please include a link to the project on CircleCI) with your request.
- `setup_remote_docker` is not compatible with the `machine` executor. See [Docker Layer Caching in Machine Executor]({{ site.baseurl }}/2.0/docker-layer-caching/#machine-executor) for information on how to enable DLC with the `machine` executor.

##### **`save_cache`**

Generates and stores a cache of a file or directory of files such as dependencies or source code in our object storage. Later jobs can [restore this cache](#restore_cache). Learn more in [the caching documentation]({{ site.baseurl }}/2.0/caching/).

Key | Required | Type | Description
----|-----------|------|------------
paths | Y | List | List of directories which should be added to the cache
key | Y | String | Unique identifier for this cache
name | N | String | Title of the step to be shown in the CircleCI UI (default: "Saving Cache")
when | N | String | [Specify when to enable or disable the step](#the-when-attribute). Takes the following values: `always`, `on_success`, `on_fail` (default: `on_success`)
{: class="table table-striped"}

The cache for a specific `key` is immutable and cannot be changed once written. 

**Note** If the cache for the given `key` already exists it won't be modified, and job execution will proceed to the next step.

When storing a new cache, the `key` value may contain special templated values for your convenience:

Template | Description
----|----------
{% raw %}`{{ .Branch }}`{% endraw %} | The VCS branch currently being built.
{% raw %}`{{ .BuildNum }}`{% endraw %} | The CircleCI build number for this build.
{% raw %}`{{ .Revision }}`{% endraw %} | The VCS revision currently being built.
{% raw %}`{{ .CheckoutKey }}`{% endraw %} | The SSH key used to checkout the repo.
{% raw %}`{{ .Environment.variableName }}`{% endraw %} | The environment variable `variableName` (supports any environment variable [exported by CircleCI](https://circleci.com/docs/2.0/env-vars/#circleci-environment-variable-descriptions) or added to a specific [Context](https://circleci.com/docs/2.0/contexts)—not any arbitrary environment variable).
{% raw %}`{{ checksum "filename" }}`{% endraw %} | A base64 encoded SHA256 hash of the given filename's contents. This should be a file committed in your repo and may also be referenced as a path that is absolute or relative from the current working directory. Good candidates are dependency manifests, such as `package.json`, `pom.xml` or `project.clj`. It's important that this file does not change between `restore_cache` and `save_cache`, otherwise the cache will be saved under a cache key different than the one used at `restore_cache` time.
{% raw %}`{{ epoch }}`{% endraw %} | The current time in seconds since the unix epoch.
{% raw %}`{{ arch }}`{% endraw %} | The OS and CPU information.  Useful when caching compiled binaries that depend on OS and CPU architecture, for example, `darwin amd64` versus `linux i386/32-bit`.
{: class="table table-striped"}

During step execution, the templates above will be replaced by runtime values and use the resultant string as the `key`.

Template examples:
 * {% raw %}`myapp-{{ checksum "package.json" }}`{% endraw %} - cache will be regenerated every time something is changed in `package.json` file, different branches of this project will generate the same cache key.
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package.json" }}`{% endraw %} - same as the previous one, but each branch will generate separate cache
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - every run of a job will generate a separate cache

While choosing suitable templates for your cache `key`, keep in mind that cache saving is not a free operation, because it will take some time to upload the cache to our storage. So it make sense to have a `key` that generates a new cache only if something actually changed and avoid generating a new one every run of a job.

<div class="alert alert-info" role="alert">
<b>Tip:</b> Given the immutability of caches, it might be helpful to start all your cache keys with a version prefix <code class="highlighter-rouge">v1-...</code>. That way you will be able to regenerate all your caches just by incrementing the version in this prefix.
</div>

###### _Example_

{% raw %}
``` YAML
- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /home/ubuntu/.m2
```
{% endraw %}

##### **`restore_cache`**

Restores a previously saved cache based on a `key`. Cache needs to have been saved first for this key using [`save_cache` step](#save_cache). Learn more in [the caching documentation]({{ site.baseurl }}/2.0/caching/).

Key | Required | Type | Description
----|-----------|------|------------
key | Y <sup>(1)</sup> | String | Single cache key to restore
keys | Y <sup>(1)</sup> | List | List of cache keys to lookup for a cache to restore. Only first existing key will be restored.
name | N | String | Title of the step to be shown in the CircleCI UI (default: "Restoring Cache")
{: class="table table-striped"}

<sup>(1)</sup> at least one attribute has to be present. If `key` and `keys` are both given, `key` will be checked first, and then `keys`.

A key is searched against existing keys as a prefix.

**Note**: When there are multiple matches, the **most recent match** will be used, even if there is a more precise match.

For example:

``` YAML
steps:
  - save_cache:
      key: v1-myapp-cache
      paths:
        - ~/d1

  - save_cache:
      key: v1-myapp-cache-new
      paths:
        - ~/d2

  - run: rm -f ~/d1 ~/d2

  - restore_cache:
      key: v1-myapp-cache
```

In this case cache `v1-myapp-cache-new` will be restored because it's the most recent match with `v1-myapp-cache` prefix even if the first key (`v1-myapp-cache`) has exact match.

For more information on key formatting, see the `key` section of [`save_cache` step](#save_cache).

When CircleCI encounters a list of `keys`, the cache will be restored from the first one matching an existing cache. Most probably you would want to have a more specific key to be first (for example, cache for exact version of `package.json` file) and more generic keys after (for example, any cache for this project). If no key has a cache that exists, the step will be skipped with a warning.

A path is not required here because the cache will be restored to the location from which it was originally saved.

###### Example

{% raw %}
``` YAML
- restore_cache:
    keys:
      - v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
      # if cache for exact version of `project.clj` is not present then load any most recent one
      - v1-myapp-

# ... Steps building and testing your application ...

# cache will be saved only once for each version of `project.clj`
- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /foo
```
{% endraw %}

##### **`deploy`**

Special step for deploying artifacts.

`deploy` uses the same configuration map and semantics as [`run`](#run) step. Jobs may have more than one `deploy` step.

In general `deploy` step behaves just like `run` with one exception - in a job with `parallelism`, the `deploy` step will only be executed by node #0 and only if all nodes succeed. Nodes other than #0 will skip this step.

###### Example

``` YAML
- deploy:
    command: |
      if [ "${CIRCLE_BRANCH}" == "master" ]; then
        ansible-playbook site.yml
      fi
```

##### **`store_artifacts`**

Step to store artifacts (for example logs, binaries, etc) to be available in the web app or through the API. See the   [Uploading Artifacts]({{ site.baseurl }}/2.0/artifacts/) document for more information.

Key | Required | Type | Description
----|-----------|------|------------
path | Y | String | Directory in the primary container to save as job artifacts
destination | N | String | Prefix added to the artifact paths in the artifacts API (default: the directory of the file specified in `path`)
{: class="table table-striped"}

There can be multiple `store_artifacts` steps in a job. Using a unique prefix for each step prevents them from overwriting files.

###### Example

``` YAML
- store_artifacts:
    path: /code/test-results
    destination: prefix
```

##### **`store_test_results`**

Special step used to upload test results so they display in builds' Test Summary section and can be used for timing analysis. To also see test result as build artifacts, please use [the **store_artifacts** step](#store_artifacts).

Key | Required | Type | Description
----|-----------|------|------------
path | Y | String | Path (absolute, or relative to your `working_directory`) to directory containing subdirectories of JUnit XML or Cucumber JSON test metadata files
{: class="table table-striped"}

**Note:** Please write your tests to **subdirectories** of your `store_test_results` path, ideally named to match the names of your particular test suites, in order for CircleCI to correctly infer the names of your reports. If you do not write your reports to subdirectories, you will see reports in your "Test Summary" section such as `Your build ran 71 tests in unknown`, instead of, for example, `Your build ran 71 tests in rspec`.

###### _Example_

Directory structure:

```
test-results
├── jest
│   └── results.xml
├── mocha
│   └── results.xml
└── rspec
    └── results.xml
```

`config.yml` syntax:

``` YAML
- store_test_results:
    path: test-results
```

##### **`persist_to_workspace`**

Special step used to persist a temporary file to be used by another job in the workflow.

**Note:** Workspaces are stored for up to 30 days after being created. All jobs that try to use a Workspace older than 30 days, including partial reruns of a Workflow and SSH reruns of individual jobs, will fail.

Key | Required | Type | Description
----|-----------|------|------------
root | Y | String | Either an absolute path or a path relative to `working_directory`
paths | Y | List | Glob identifying file(s), or a non-glob path to a directory to add to the shared workspace. Interpreted as relative to the workspace root. Must not be the workspace root itself.
{: class="table table-striped"}

The root key is a directory on the container which is taken to be the root directory of the workspace. The paths values are all relative to the root.

##### _Example for root Key_

For example, the following step syntax persists the specified paths from `/tmp/dir` into the workspace, relative to the directory `/tmp/dir`.

``` YAML
- persist_to_workspace:
    root: /tmp/dir
    paths:
      - foo/bar
      - baz
```

After this step completes, the following directories are added to the workspace:

```
/tmp/dir/foo/bar
/tmp/dir/baz
```

###### _Example for paths Key_

``` YAML
- persist_to_workspace:
    root: /tmp/workspace
    paths:
      - target/application.jar
      - build/*
```

The `paths` list uses `Glob` from Go, and the pattern matches [filepath.Match](https://golang.org/pkg/path/filepath/#Match).

```
pattern:
        { term }
term:
        '*' matches any sequence of non-Separator characters
        '?' matches any single non-Separator character
        '[' [ '^' ] { character-range }
        ']' character class (must be non-empty)
        c matches character c (c != '*', '?', '\\', '[')
        '\\' c matches character c
character-range:
        c matches character c (c != '\\', '-', ']')
        '\\' c matches character c
        lo '-' hi matches character c for lo <= c <= hi
```

The Go documentation states that the pattern may describe hierarchical names such as `/usr/*/bin/ed` (assuming the Separator is '/'). **Note:** Everything must be relative to the work space root directory.

##### **`attach_workspace`**

Special step used to attach the workflow's workspace to the current container. The full contents of the workspace are downloaded and copied into the directory the workspace is being attached at.

Key | Required | Type | Description
----|-----------|------|------------
at | Y | String | Directory to attach the workspace to.
{: class="table table-striped"}

###### _Example_

``` YAML
- attach_workspace:
    at: /tmp/workspace
```

Each workflow has a temporary workspace associated with it. The workspace can be used to pass along unique data built during a job to other jobs in the same workflow.
Jobs can add files into the workspace using the `persist_to_workspace` step and download the workspace content into their file system using the `attach_workspace` step.
The workspace is additive only, jobs may add files to the workspace but cannot delete files from the workspace. Each job can only see content added to the workspace by the jobs that are upstream of it.
When attaching a workspace the "layer" from each upstream job is applied in the order the upstream jobs appear in the workflow graph. When two jobs run concurrently the order in which their layers are applied is undefined. If multiple concurrent jobs persist the same filename then attaching the workspace will error.

If a workflow is re-run it inherits the same workspace as the original workflow. When re-running failed jobs only the re-run jobs will see the same workspace content as the jobs in the original workflow.

Note the following distinctions between Artifacts, Workspaces, and Caches:

| Type      | lifetime        | Use                      | Example |
|-----------|-----------------|------------------------------------|---------
| Artifacts | Months          | Preserve long-term artifacts. |  Available in the Artifacts tab of the **Job page** under the `tmp/circle-artifacts.<hash>/container`   or similar directory.     |
| Workspaces | Duration of workflow        | Attach the workspace in a downstream container with the `attach_workspace:` step. | The `attach_workspace` copies and re-creates the entire workspace content when it runs.    |
| Caches    | Months          | Store non-vital data that may help the job run faster, for example npm or Gem packages.          |  The `save_cache` job step with a `path` to a list of directories to add and a `key` to uniquely identify the cache (for example, the branch, build number, or revision).   Restore the cache with `restore_cache` and the appropriate `key`. |
{: class="table table-striped"}

Refer to the [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) for additional conceptual information about using workspaces, caching, and artifacts.

##### **`add_ssh_keys`**

Special step that adds SSH keys from a project's settings to a container. Also configures SSH to use these keys.

Key | Required | Type | Description
----|-----------|------|------------
fingerprints | N | List | List of fingerprints corresponding to the keys to be added (default: all keys added)
{: class="table table-striped"}

```yaml
steps:
  - add_ssh_keys:
      fingerprints:
        - "b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be"
```

**Note:**
Even though CircleCI uses `ssh-agent` to sign all added SSH keys, you **must** use the `add_ssh_keys` key to actually add keys to a container.

## **`workflows`**
Used for orchestrating all jobs. Each workflow consists of the workflow name as a key and a map as a value. A name should be unique within the current `config.yml`. The top-level keys for the Workflows configuration are `version` and `jobs`.

### **`version`**
The Workflows `version` field is used to issue warnings for deprecation or breaking changes during Beta.

Key | Required | Type | Description
----|-----------|------|------------
version | Y | String | Should currently be `2`
{: class="table table-striped"}

### **<`workflow_name`>**

A unique name for your workflow.

#### **`triggers`**
Specifies which triggers will cause this workflow to be executed. Default behavior is to trigger the workflow when pushing to a branch.

Key | Required | Type | Description
----|-----------|------|------------
triggers | N | Array | Should currently be `schedule`.
{: class="table table-striped"}

##### **`schedule`**
A workflow may have a `schedule` indicating it runs at a certain time, for example a nightly build that runs every day at 12am UTC:

```
workflows:
   version: 2
   nightly:
     triggers:
       - schedule:
           cron: "0 0 * * *"
           filters:
             branches:
               only:
                 - master
                 - beta
     jobs:
       - test
```
###### **`cron`**
The `cron` key is defined using POSIX `crontab` syntax.

Key | Required | Type | Description
----|-----------|------|------------
cron | Y | String | See the [crontab man page](http://pubs.opengroup.org/onlinepubs/7908799/xcu/crontab.html).
{: class="table table-striped"}

###### **`filters`**
Filters can have the key `branches`.

Key | Required | Type | Description
----|-----------|------|------------
filters | Y | Map | A map defining rules for execution on specific branches
{: class="table table-striped"}

###### **`branches`**
{:.no_toc}

The `branches` key controls whether the *current* branch should have a schedule trigger created for it, where *current* branch is the branch containing the `config.yml` file with the `trigger` stanza. That is, a push on the `master` branch will only schedule a [workflow]({{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-workflows) for the `master` branch.

Branches can have the keys `only` and `ignore` which either map to a single string naming a branch. You may also use regular expressions to match against branches by enclosing them with `/`'s, or map to a list of such strings. Regular expressions must match the **entire** string.

- Any branches that match `only` will run the job.
- Any branches that match `ignore` will not run the job.
- If neither `only` nor `ignore` are specified then all branches will run the job.
- If both `only` and `ignore` are specified the `only` is considered before `ignore`.

Key | Required | Type | Description
----|-----------|------|------------
branches | Y | Map | A map defining rules for execution on specific branches
only | Y | String, or List of Strings | Either a single branch specifier, or a list of branch specifiers
ignore | N | String, or List of Strings | Either a single branch specifier, or a list of branch specifiers
{: class="table table-striped"}

#### **`jobs`**
A job can have the keys `requires`, `context`, `type`, and `filters`.

Key | Required | Type | Description
----|-----------|------|------------
jobs | Y | List | A list of jobs to run with their dependencies
{: class="table table-striped"}

##### **<`job_name`>**

A job name that exists in your `config.yml`.

###### **`requires`**
Jobs are run in parallel by default, so you must explicitly require any dependencies by their job name.

Key | Required | Type | Description
----|-----------|------|------------
requires | N | List | A list of jobs that must succeed for the job to start
name | N | String | A replacement for the job name. Useful when calling a job multiple times. If you want to invoke the same job multiple times and a job requires one of the duplicate jobs, this is required. (2.1 only)
{: class="table table-striped"}

###### **`context`**
Jobs may be configured to use global environment variables set for an organization, see the [Contexts]({{ site.baseurl }}/2.0/contexts) document for adding a context in the application settings.

Key | Required | Type | Description
----|-----------|------|------------
context | N | String | The name of the context. The initial default name was `org-global`. With the ability to use multiple contexts, each context name must be unique.
{: class="table table-striped"}

###### **`type`**
A job may have a `type` of `approval` indicating it must be manually approved before downstream jobs may proceed. Jobs run in the dependency order until the workflow processes a job with the `type: approval` key followed by a job on which it depends, for example:

```
      - hold:
          type: approval
          requires:
            - test1
            - test2
      - deploy:
          requires:
            - hold
```
**Note:** The `hold` job name must not exist in the main configuration.

###### **`filters`**
Filters can have the key `branches` or `tags`. **Note** Workflows will ignore job-level branching. If you use job-level branching and later add workflows, you must remove the branching at the job level and instead declare it in the workflows section of your `config.yml`, as follows:

Key | Required | Type | Description
----|-----------|------|------------
filters | N | Map | A map defining rules for execution on specific branches
{: class="table table-striped"}

###### **`branches`**
{:.no_toc}
Branches can have the keys `only` and `ignore` which either map to a single string naming a branch. You may also use regular expressions to match against branches by enclosing them with '/s', or map to a list of such strings. Regular expressions must match the **entire** string.

- Any branches that match `only` will run the job.
- Any branches that match `ignore` will not run the job.
- If neither `only` nor `ignore` are specified then all branches will run the job.
- If both `only` and `ignore` are specified the `only` is considered before `ignore`.

Key | Required | Type | Description
----|-----------|------|------------
branches | N | Map | A map defining rules for execution on specific branches
only | N | String, or List of Strings | Either a single branch specifier, or a list of branch specifiers
ignore | N | String, or List of Strings | Either a single branch specifier, or a list of branch specifiers
{: class="table table-striped"}

###### **`tags`**
{:.no_toc}

CircleCI does not run workflows for tags unless you explicitly specify tag filters. Additionally, if a job requires any other jobs (directly or indirectly), you must specify tag filters for those jobs.

Tags can have the keys `only` and `ignore` keys. You may also use regular expressions to match against tags by enclosing them with '/s', or map to a list of such strings. Regular expressions must match the **entire** string. Both lightweight and annotated tags are supported.

- Any tags that match `only` will run the job.
- Any tags that match `ignore` will not run the job.
- If neither `only` nor `ignore` are specified then the job is skipped for all tags.
- If both `only` and `ignore` are specified the `only` is considered before `ignore`.

Key | Required | Type | Description
----|-----------|------|------------
tags | N | Map | A map defining rules for execution on specific tags
only | N | String, or List of Strings | Either a single tag specifier, or a list of tag specifiers
ignore | N | String, or List of Strings | Either a single tag specifier, or a list of tag specifiers
{: class="table table-striped"}

For more information, see the [Executing Workflows For a Git Tag]({{ site.baseurl }}/2.0/workflows/#executing-workflows-for-a-git-tag) section of the Workflows document.

###### *Example*

```
workflows:
  version: 2

  build_test_deploy:
    jobs:
      - flow
      - downstream:
          requires:
            - flow
          filters:
            branches:
              only: master
```

Refer to the [Orchestrating Workflows]({{ site.baseurl }}/2.0/workflows) document for more examples and conceptual information.

## Full Example
{:.no_toc}

{% raw %}
```yaml
version: 2
jobs:
  build:
    docker:
      - image: ubuntu:14.04

      - image: mongo:2.6.8
        command: [mongod, --smallfiles]

      - image: postgres:9.4.1
        # some containers require setting environment variables
        environment:
          POSTGRES_USER: root

      - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673

      - image: rabbitmq:3.5.4

    environment:
      TEST_REPORTS: /tmp/test-reports

    working_directory: ~/my-project

    steps:
      - checkout

      - run:
          command: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts

      # Create Postgres users and database
      # Note the YAML heredoc '|' for nicer formatting
      - run: |
          sudo -u root createuser -h localhost --superuser ubuntu &&
          sudo createdb -h localhost test_db

      - restore_cache:
          keys:
            - v1-my-project-{{ checksum "project.clj" }}
            - v1-my-project-

      - run:
          environment:
            SSH_TARGET: "localhost"
            TEST_ENV: "linux"
          command: |
            set -xu
            mkdir -p ${TEST_REPORTS}
            run-tests.sh
            cp out/tests/*.xml ${TEST_REPORTS}

      - run: |
          set -xu
          mkdir -p /tmp/artifacts
          create_jars.sh ${CIRCLE_BUILD_NUM}
          cp *.jar /tmp/artifacts

      - save_cache:
          key: v1-my-project-{{ checksum "project.clj" }}
          paths:
            - ~/.m2

      # Save artifacts
      - store_artifacts:
          path: /tmp/artifacts
          destination: build

      # Upload test results
      - store_test_results:
          path: /tmp/test-reports

  deploy-stage:
    docker:
      - image: ubuntu:14.04
    working_directory: /tmp/my-project
    steps:
      - run:
          name: Deploy if tests pass and branch is Staging
          command: ansible-playbook site.yml -i staging

  deploy-prod:
    docker:
      - image: ubuntu:14.04
    working_directory: /tmp/my-project
    steps:
      - run:
          name: Deploy if tests pass and branch is Master
          command: ansible-playbook site.yml -i production

workflows:
  version: 2
  build-deploy:
    jobs:
      - build:
          filters:
            branches:
              ignore:
                - develop
                - /feature-.*/
      - deploy-stage:
          requires:
            - build
          filters:
            branches:
              only: staging
      - deploy-prod:
          requires:
            - build
          filters:
            branches:
              only: master
```
{% endraw %}

## See Also
{:.no_toc}

[Config Introduction]({{site.baseurl}}/2.0/config-intro/)
