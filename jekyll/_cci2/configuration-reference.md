---
layout: classic-docs
title: "Writing Jobs with Steps"
short-title: "Writing Jobs with Steps"
description: "Reference for .circleci/config.yml"
categories: [configuring-jobs]
order: 20
---

This document describes how to write jobs and steps to build, test, and deploy your project. The presence of a `.circleci/config.yml` file in your CircleCI-authorized repository branch indicates that you want to use the 2.0 infrastructure.

If you already have a CircleCI 1.0 configuration, the `config.yml` file allows you to test 2.0 builds on a separate branch, leaving any existing configuration in the old `circle.yml` style unaffected and running on the CircleCI 1.0 infrastructure in branches that do not contain `.circleci/config.yml`.

You can see a complete `config.yml` in our [full example](#full-example).

---

## Table of Contents
{:.no_toc}

* TOC
{:toc}

---

## **`version`**

Key | Required | Type | Description
----|-----------|------|------------
version | Y | String | Should currently be `2`
{: class="table table-striped"}

The `version` field is intended to be used in order to issue warnings for deprecation or breaking changes.

## **`jobs`**

Each job is an item in the `jobs` list.

### **`build`**

The build job is the default job and is required if you are not using Workflows. If you are using Workflows, a job named build is optional. See the [Workflows]({{ site.baseurl }}/2.0/workflows/) documentation for detailed information.

Each job consists of the job's name as a key and a map as a value. A name should be unique within a current `jobs` list. The value map has the following attributes:

Key | Required | Type | Description
----|-----------|------|------------
docker | Y <sup>(1)</sup> | List | Options for [docker executor](#docker)
machine | Y <sup>(1)</sup> | Map | Options for [machine executor](#machine)
shell | N | String | Shell to use for execution command in all steps. Can be overridden by `shell` in each step (default: See [Default Shell Options](#default-shell-options))
steps | Y | List | A list of [steps](#steps) to be performed
working_directory | N | String | In which directory to run the steps. (default: `~/project`. `project` is a literal string, not the name of the project.) You can also refer the directory with `$CIRCLE_WORKING_DIRECTORY` environment variable.
parallelism | N | Integer | Number of parallel instances of this job to run (default: 1)
environment | N | Map | A map of environment variable names and valuables (NOTE: these will override any environment variables you set in the CircleCI web interface).
branches | N | Map | A map defining rules for whitelisting/blacklisting execution of specific branches for a single job that is **not** in a workflow (default: all whitelisted). See [Workflows](#workflows) for configuring branch execution for jobs in a workflow.
resource_class | N | String | Amount of CPU and RAM allocated to each container in a build. (NOTE: Only works with the `docker` key for paid accounts and is subject to change in a future pricing update.)
{: class="table table-striped"}

<sup>(1)</sup> exactly one of them should be specified. It is an error to set more than one.

If `parallelism` is set to N > 1, then N independent executors will be set up and each will run the steps of that job in parallel. Certain parallelism-aware steps can opt out of the parallelism and only run on a single executor (for example [`deploy` step](#deploy)). Learn more about [parallel jobs]({{ site.baseurl }}/2.0/parallelism-faster-jobs/).

`working_directory` will be created automatically if it doesn't exist.

Example:
``` YAML
jobs:
  build:
    docker:
      - buildpack-deps:trusty
    environment:
      - FOO: "bar"
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

#### **`docker`** | **`machine`** (_executor_)

An "executor" is roughly "a place where steps occur". CircleCI 2.0 can build the necessary environment by launching as many docker containers as needed at once, or it can use a full virtual machine. Learn more about [different executors]({{ site.baseurl }}/2.0/executor-types/).

#### `docker`
{:.no_toc}

Configured by `docker` key which takes a list of maps:

Key | Required | Type | Description
----|-----------|------|------------
image | Y | String | The name of a custom docker image to use
entrypoint | N | String or List | The command used as executable when launching the container
command | N | String or List | The command used as pid 1 (or args for entrypoint) when launching the container
user | N | String | Which user to run the command as
environment | N | Map | A map of environment variable names and values
{: class="table table-striped"}

The first `image` listed in the file defines the primary container image where all steps will run.

`entrypoint` overrides default entrypoint from Dockerfile.

`command` will be used as arguments to image entrypoint (if specified in Dockerfile) or as executable (if no entrypoint is provided here or in the Dockerfile).

For [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) (listed first in the list) if no `command` is specified then `command` and image entrypoint will be ignored, to avoid errors caused by the entrypoint executable consuming significant resources or exiting prematurely. At this time all `steps` run in the primary container only.

The `environment` settings apply to all commands run in this executor, not just the initial `command`. The `environment` here has higher precedence over setting it in the job map above.

You can specify image versions using tags or digest. You can use any public images from any public Docker registry (defaults to Docker Hub). Learn more about [specifying images]({{ site.baseurl }}/2.0/executor-types).

Example:

``` YAML
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

#### **`machine`**
{:.no_toc}

The usage of the [machine executor]({{ site.baseurl }}/2.0/executor-types) is configured by using the `machine` key, which takes a map:

Key | Required | Type | Description
----|-----------|------|------------
enabled | N | Boolean | This must be true in order to enable the `machine` executor.  Is required if no other value is specified
image | N | String | The image to use (default: `circleci/classic:latest`)
{: class="table table-striped"}

As a shorthand, you can set the `machine` key to `true`.

Example:

``` YAML
jobs:
  build:
    machine:
      enabled: true

# or just

jobs:
  build:
    machine: true
```

CircleCI supports multiple machine images that can be specified in `image` field:

* `circleci/classic:latest` (default) - an Ubuntu Trusty-based image with Docker `17.03.0-ce` along with common language tools found in CircleCI 1.0 build image.  The `latest` channel provides the latest tested images, changes to the channel are announced at least a week in advance.
* `circleci/classic:edge` - an Ubuntu Trusty-based image with Docker `17.06.0-ce` along with common language tools found in CircleCI 1.0 build image.  The `edge` channel provides release candidates that will eventually be promoted to `classic:latest`.

So you can set the following to use Docker `17.06.0-ce`:

```YAML
jobs:
  build:
    machine:
      image: circleci/classic:edge
```

#### **`branches`**

Defines rules for whitelisting/blacklisting execution of some branches if Workflows are **not** configured. If you are using Workflows, job-level branches will be ignored and must be configured in the Workflows section of your 'config.yml' file. See the [workflows](#workflows) section for details. The job-level `branch` key takes a map:

Key | Required | Type | Description
----|-----------|------|------------
only | N | List | List of branches that only will be executed
ignore | N | List | List of branches to ignore
{: class="table table-striped"}

Both `only` and `ignore` lists can have full names and regular expressions. For example:

``` YAML
branches:
  only:
    - master
    - /rc-.*/
```

In this case only "master" branch and branches matching regex "rc-.*" will be executed.

``` YAML
branches:
  ignore:
    - develop
    - /feature-.*/
```

In this example all the branches will be executed except "develop" and branches matching regex "feature-.*".

If both `ignore` and `only` are present in config, only `ignore` will be taken into account.

A job that was not executed due to configured rules will show up in the list of jobs in UI, but will be marked as skipped.

#### **`resource_class`**

It is possible to configure CPU and RAM resources for each job as described in the following table. If `resource_class` is not specified or an invalid class is specified, the default `resource_class: medium` will be used. The `resource_class` key is currently only available for use with the `docker` executor. Paid accounts may request this feature from their Customer Success Manager, non-paid users may request to get started by sending email to support@circleci.com.

Class | CPU       | RAM
------|-----------|------
small | 1.0 | 2GB
medium | 2.0 | 4GB
large | 4.0 | 8GB
xlarge | 8.0 | 16GB

#### **`steps`**

The `steps` setting in a job should be a list of single key/value pairs, the key of which indicates the step type. The value may be either a configuration map or a string (depending on what that type of step requires). For example, using a map:

```
jobs:
  build:
    working_directory: ~/canary-python
    environment:
      - FOO: "bar"
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

In general all steps can be describe as:

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

##### _Default shell options_

Our default `shell` has a few options enabled by default:

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

`-o`

> If pipefail is enabled, the pipeline’s return status is the value of the last (rightmost) command to exit with a non-zero status, or zero if all commands exit successfully. The shell waits for all commands in the pipeline to terminate before returning a value.

For example:
``` YAML
- run: make test | tee test-output.log
```

If `make test` fails, the `-o pipefail` option will cause the whole step to fail. Without `-o pipefail`, the step will always run successfully because the result of the whole pipeline is determined by the last command (`tee test-output.log`), which will always return a zero status.

Note that even if `make test` fails the rest of pipeline will be executed.

If you want to avoid this behaviour, you can specify `set +o pipefail` in the command or override the whole `shell` (see example above).

In general, we recommend using the default options (`-eo pipefail`) because they show errors in intermediate commands and simplify debugging job failures. For convenience, the UI displays the used shell and all active options for each `run` step.

##### _Background commands_

The `background` attribute allows for executing commands in the background. In this case, job execution will immediately proceed to the next step rather than waiting for the command to return. While debugging background commands is more difficult, running commands in the background might be necessary in some cases. For instance, to run Selenium tests you may need to have X virtual framebuffer running:

``` YAML
- run:
    name: Running X virtual framebuffer
    command: Xvfb :99 -screen 0 1280x1024x24
    background: true

- run: make test
```

##### _Shorthand syntax_

`run` has a very convenient shorthand syntax:

``` YAML
- run: make test

# shorthanded command can also have multiple lines
- run: |
    mkdir -p /tmp/test-results
    make test
```
In this case, `command` and `name` become the string value of `run`, and the rest of the config map for that `run` have their default values.

##### The `when` Attribute

By default, CircleCI will execute build steps one at a time, in the order that
they are defined in `config.yml`, until a step fails (returns a non-zero exit
code). After a command fails, no further build steps will be executed.

Adding the `when` attribute to a build step allows you to override this default
behaviour, and selectively run or skip steps depending on the status of the build.

The default value of `on_success` means that the step will run only if all of the
previous steps have been successful (returned exit code 0).

A value of `always` means that the step will run regardless of the exit status of
previous steps. This is useful if you have a task that you want to run regardless
of whether the build is successful or not. For example, you might have a build
step that needs to upload logs or code-coverage data somewhere.

A value of `on_fail` means that the step will run only if one of the preceding
steps has failed (returns a non-zero exit code). It is common to use `on_fail`
if you want to store some diagnostic data to help debug test failures, or to run
custom notifications about the failure, such as sending emails or triggering
alerts in chatrooms.

##### _Example_

``` YAML
- run:
    name: Testing application
    command: make test
    shell: /bin/bash
    working_directory: ~/my-app
    no_output_timeout: 30m
    environment:
      FOO: "bar"

- run: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts

- run: |
    sudo -u root createuser -h localhost --superuser ubuntu &&
    sudo createdb -h localhost test_db

- run:
    name: Upload Failed Tests
    command: curl --data fail_tests.log http://example.com/error_logs
    when: on_fail

```

##### **`checkout`**

Special step used to check out source code to the configured `path` (defaults to the `working_directory`).

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

<a name="save_cache"/>
##### **`save_cache`**

Generates and stores a cache of a file or directory of files such as dependencies or source code in our object storage. Later builds can [restore this cache](#restore_cache). Learn more in [the caching documentation]({{ site.baseurl }}/2.0/caching/).

Key | Required | Type | Description
----|-----------|------|------------
paths | Y | List | List of directories which should be added to the cache
key | Y | String | Unique identifier for this cache
when | N | String | [Specify when to enable or disable the step](#the-when-attribute). Takes the following values: `always`, `on_success`, `on_fail` (default: `on_success`)
{: class="table table-striped"}

The cache for a specific `key` is immutable and cannot be changed once written. NOTE: _If the cache for the given `key` already exists it won't be modified, and job execution will proceed to the next step._

When storing a new cache, the `key` value may contain special templated values for your convenience:

Template | Description
----|----------
{% raw %}`{{ .Branch }}`{% endraw %} | The VCS branch currently being built.
{% raw %}`{{ .BuildNum }}`{% endraw %} | The CircleCI build number for this build.
{% raw %}`{{ .Revision }}`{% endraw %} | The VCS revision currently being built.
{% raw %}`{{ .CheckoutKey }}`{% endraw %} | The SSH key used to checkout the repo.
{% raw %}`{{ .Environment.variableName }}`{% endraw %} | The environment variable `variableName`, supports any environment  variable supplied by CircleCI, **not** any arbitrary environment variable.
{% raw %}`{{ checksum "filename" }}`{% endraw %} | A base64 encoded SHA256 hash of the given filename's contents. This should be a file committed in your repo. Good candidates are dependency manifests, such as `package.json`, `pom.xml` or `project.clj`. It's important that this file does not change between `restore_cache` and `save_cache`, otherwise the cache will be saved under a cache key different than the one used at `restore_cache` time.
{% raw %}`{{ epoch }}`{% endraw %} | The current time in seconds since the unix epoch.
{: class="table table-striped"}

During step execution, the templates above will be replaced by runtime values and use the resultant string as the `key`.

Template examples:
 * {% raw %}`myapp-{{ checksum "package.json" }}`{% endraw %} - cache will be regenerated every time something is changed in `package.json` file, different branches of this project will generate the same cache key.
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package.json" }}`{% endraw %} - same as the previous one, but each branch will generate separate cache
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - every build will generate separate cache

While choosing suitable templates for your cache `key`, keep in mind that cache saving is not a free operation, because it will take some time to upload the cache to our storage. So it make sense to have a `key` that generates a new cache only if something actually changed and avoid generating a new one every build.

<div class="alert alert-info" role="alert">
<b>Tip:</b> Given the immutability of caches, it might be helpful to start all your cache keys with a version prefix <code class="highlighter-rouge">v1-...</code>. That way you will be able to regenerate all your caches just by incrementing the version in this prefix.
</div>

###### _Example_

{% raw %}
``` YAML
- save_cache:
    key: v1-myapp-{{ checksum "project.clj" }}
    paths:
      - /home/ubuntu/.m2
```
{% endraw %}

<a name="restore_cache"/>
##### **`restore_cache`**

Restores a previously saved cache based on a `key`. Cache needs to have been saved first for this key using [`save_cache` step](#save_cache). Learn more in [the caching documentation]({{ site.baseurl }}/2.0/caching/).

Key | Required | Type | Description
----|-----------|------|------------
key | Y <sup>(1)</sup> | String | Single cache key to restore
keys | Y <sup>(1)</sup> | List | List of cache keys to lookup for a cache to restore. Only first existing key will be restored.
{: class="table table-striped"}

<sup>(1)</sup> at least one attribute has to be present. If `key` and `keys` are both given, `key` will be checked first, and then `keys`.

A key is searched against existing keys as a prefix.

NOTE: _When there are multiple matches, the **most recent match** will be used, even if there is a more precise match._

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

###### _Example_

{% raw %}
``` YAML
- restore_cache:
    keys:
      - v1-myapp-{{ checksum "project.clj" }}
      # if cache for exact version of `project.clj` is not present then load any most recent one
      - v1-myapp-

# ... Steps building and testing your application ...

# cache will be saved only once for each version of `project.clj`
- save_cache:
    key: v1-myapp-{{ checksum "project.clj" }}
    paths:
      - /foo
```
{% endraw %}

##### **`deploy`**

Special step for deploying artifacts.

`deploy` uses the same configuration map and semantics as [`run`](#run) step. Jobs may have more than one `deploy` step.

In general `deploy` step behaves just like `run` with one exception - in a build with `parallelism`, the `deploy` step will only be executed by node #0 and only if all nodes succeed. Nodes other than #0 will skip this step.

###### _Example_

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
path | Y | String | Directory in the primary container to save as build artifacts
destination | N | String | Prefix added to the artifact paths in the artifacts API (default: the directory of the file specified in `path`)
{: class="table table-striped"}

There can be multiple `store_artifacts` steps in a job. Using a unique prefix for each step prevents them from overwriting files.

###### _Example_

``` YAML
- store_artifacts:
    path: /code/test-results
    destination: prefix
```

##### **`store_test_results`**

Special step used to upload test results so they can be used for timing analysis. **Note** At this time the results are not shown as artifacts in the web UI. To see test result as artifacts please also upload them using **store_artifacts**. This key is **not** supported with Workflows.

Key | Required | Type | Description
----|-----------|------|------------
path | Y | String | Directory containing JUnit XML or Cucumber JSON test metadata files
{: class="table table-striped"}

The directory layout should match the [classic CircleCI test metadata directory layout]({{ site.baseurl }}/1.0/test-metadata/#metadata-collection-in-custom-test-steps).

###### _Example_

``` YAML
- store_test_results:
    path: /tmp/test-results
```

##### **`persist_to_workspace`**

Special step used to persist a temporary file to be used by another job in the workflow.

Key | Required | Type | Description
----|-----------|------|------------
root | Y | String | Either an absolute path or a path relative to `working_directory`
paths | Y | List | Glob identifying file(s), or a non-glob path to a directory to add to the shared workspace. Interpreted as relative to the workspace root. Must not be the workspace root itself.
{: class="table table-striped"}

###### _Example_

``` YAML
- persist_to_workspace:
    root: /tmp/workspace
    paths: 
      - target/application.jar
      - build/*
```

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
Jobs can add files into the workspace using the `persist_to_workspace` step and download the workspace content into their fileystem using the `attach_workspace` step.
The workspace is additive only, jobs may add files to the workspace but cannot delete files from the workspace. Each job can only see content added to the workspace by the jobs that are upstream of it. 

When attaching a workspace the "layer" from each upstream job is applied in the order the upstream jobs appear in the workflow graph. When two jobs run concurrently the order in which their layers are applied is undefined. If multiple concurrent jobs persist the same filename then attaching the workspace will error.

If a workflow is re-run it inherits the same workspace as the original workflow. When re-running failed jobs only the re-run jobs will see the same workspace content as the jobs in the original workflow.

Note the following distinctions between Artifacts, Workspaces, and Caches:

| Type      | lifetime        | Use                      | Example |
|-----------|-----------------|------------------------------------|---------
| Artifacts | Months          | Preserve long-term artifacts. |  Available in the Artifacts tab of the Build details under the `tmp/circle-artifacts.<hash>/container`   or similar directory.     |
| Workspaces | Duration of workflow        | Attach the workspace in a downstream container with the `attach_workspace:` step. | The `attach_workspace` copies and re-creates the entire workspace content when it runs.    |
| Caches    | Months          | Store non-vital data that may help the job run faster, for example npm or Gem packages.          |  The `save_cache` job step with a `path` to a list of directories to add and a `key` to uniquely identify the cache (for example, the branch, build number, or revision).   Restore the cache with `restore_cache` and the appropriate `key`. |
{: class="table table-striped"}


##### **`add_ssh_keys`**

Special step that adds SSH keys configured in the project's UI to the container, and configure ssh to use them.

Key | Required | Type | Description
----|-----------|------|------------
fingerprints | N | List | List of fingerprints corresponding to the keys to be added (default: all keys added)
{: class="table table-striped"}

``` YAML
- add_ssh_keys:
    fingerprints:
      - "b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be"
```

Note that CircleCI 2.0 builds are auto configured with `ssh-agent` with all keys auto-loaded, and is sufficient for most cases. `add_ssh_keys` may be needed to have greater control over which SSH keys to authenticate (e.g. avoid "Too many authentication failures" problem when having too many SSH keys).

## **`workflows`**
Used for orchestrating all jobs. Each workflow consists of the workflow name as a key and a map as a value. A name should be unique within the current `config.yml`. The top-level keys for the Workflows configuration are `version` and `jobs`.

### **`version`**
The Workflows `version` field is used to issue warnings for deprecation or breaking changes during Beta.

Key | Required | Type | Description
----|-----------|------|------------
version | Y | String | Should currently be `2`
{: class="table table-striped"}

### **`jobs`**
A job can have the keys `requires` and `filters`.

Key | Required | Type | Description
----|-----------|------|------------
jobs | Y | List | A list of jobs to run with their dependencies
{: class="table table-striped"}

#### **`build`**

A unique name for your job.

##### **`requires`**
Jobs are run in parallel by default, so you must explicitly require any dependencies by their job name.

Key | Required | Type | Description
----|-----------|------|------------
requires | N | List | A list of jobs that must succeed for the job to start
{: class="table table-striped"}

##### **`filters`**
Filters can have the key `branches`. **Note** Workflows will ignore job-level branching. If you use job-level branching and later add workflows, you must remove the branching at the job level and instead declare it in the workflows section of your `config.yml`, as follows:

Key | Required | Type | Description
----|-----------|------|------------
filters | N | Map | A map defining rules for execution on specific branches
{: class="table table-striped"}

###### **`branches`**
Branches can have the keys `only` and `ignore` which either map to a single string naming a branch (or a regexp to match against branches, which is required to be enclosed with /s) or map to a list of such strings.

- Any branches that match `only` will run the job.
- Any branches that match `ignore` will not run the job.
- If neither `only` nor `ignore` are specified then all branches will run the job.
- If both `only` and `ignore` are specified the `only` overrides `ignore`.

Key | Required | Type | Description
----|-----------|------|------------
branches | N | Map | A map defining rules for execution on specific branches
only | N | String, or List of Strings | Either a single branch specifier, or a list of branch specifiers
ignore | N | String, or List of Strings | Either a single branch specifier, or a list of branch specifiers
{: class="table table-striped"}

##### *Example*

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

## _Full Example_
{:.no_toc}

{% raw %}
``` YAML
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

    branches:
      ignore:
        - develop
        - /feature-.*/

    steps:
      - checkout

      - run: command: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts

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

      # Deploy staging
      - deploy:
          command: |
            if [ "${CIRCLE_BRANCH}" == "staging" ];
              then ansible-playbook site.yml -i staging;
            fi

      # Deploy production
      - deploy:
          command: |
            if [ "${CIRCLE_BRANCH}" == "master" ];
              then ansible-playbook site.yml -i production;
            fi

      # Save artifacts
      - store_artifacts:
          path: /tmp/artifacts
          destination: build

      # Upload test results
      - store_test_results:
          path: /tmp/test-reports
```
{% endraw %}
