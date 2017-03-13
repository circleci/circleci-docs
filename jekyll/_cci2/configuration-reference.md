---
layout: classic-docs
title: "Configuration Reference"
short-title: "Configuration"
categories: [reference]
order: 0
---

This document is a reference for `.circleci/config.yml` which describes jobs and steps to build/test/deploy your project. The presence of this file indicates that you want to use the 2.0 infrastructure. This allows you to test 2.0 builds on a separate branch, leaving any existing configuration in the old `circle.yml` style unaffected and running on the CircleCI 1.0 infrastructure in branches that do not contain `.circleci/config.yml`.

The `config.yml` file has the following format:

## Root

Key | Required | Type | Description
----|-----------|------|------------
version | Y | String | Should currently be `2`
jobs | Y | List | A list of jobs, see the definition for a job
{: class="table table-striped"}

The `version` field is intended to be used in order to issue warnings for deprecation or breaking changes.

## **`jobs`**

Each job is an item in the `jobs` list. Each job consists of a job's name as a key and a map as a value. A name should be unique within a current `jobs` list. The value map  has the following attributes:

Key | Required | Type | Description
----|-----------|------|------------
docker | Y <sup>(1)</sup> | List | Options for [docker executor](#docker-executor)
machine | Y <sup>(1)</sup> | Map | Options for [machine executor](#machine-executor)
steps | Y | List | A list of [steps](#steps) to be performed
working_directory | Y | String | What directory to run the steps in (default: depends on executor)
parallelism | N | Integer | Number of parallel instances of this job to run (default: 1)
environment | N | Map | A map of environment variable names and valuables (NOTE: these will override any environment variables you set in the CircleCI web interface).
{: class="table table-striped"}

<sup>(1)</sup> exactly one of them should be specified. It is an error to set more than one.

If `parallelism` is set to N > 1, then N independent executors will be set up and each will run the steps of that job in parallel. Certain parallelism-aware steps can opt out of the parallelism and only run on a single executor (for example [`deploy` step](#deploy)). Learn more about [parallel jobs]({{ site.baseurl }}/2.0/parallelism-faster-jobs).

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
    working_directory: ~/my-app
    steps:
      - run: make test
      - run: make
```

## Executors

An "executor" is roughly "a place where steps occur". CircleCI 2.0 can build the necessary environment by launching as many docker containers as needed at once. Learn more about [different executors]({{ site.baseurl }}/2.0/executor-types).

### Docker executor
Configured by `docker` key which takes a list of maps:

Key | Required | Type | Description
----|-----------|------|------------
image | Y | String | The name of a custom docker image to use
entrypoint | N | String or List | The command used as executable when launching the container
command | N | String or List | The command used as pid 1 (or args for entrypoint) when launching the container
user | N | String | Which user to run the command as
environment | N | Map | A map of environment variable names and values
{: class="table table-striped"}

`entrypoint` overrides default entrypoint from Dockerfile.

`command` will be used as arguments to image entrypoint (if specified in Dockerfile) or as executable (if no entrypoint is provided here or in the Dockerfile).

For [primary container]({{ site.baseurl }}/2.0/glossary#primary-container) (listed first in the list) if no `command` is specified then `command` and image entrypoint will be ignored, to avoid errors caused by the entrypoint executable consuming significant resources or exiting preliminary.

The `environment` settings apply to all commands run in this executor, not just the initial `command`. The `environment` here has higher precedence over setting it in the job map above.

You can specify image versions using tags or digest. You can use any public images from any public Docker registry (defaults to DockerHub). Learn more about [specifying images]({{ site.baseurl }}/2.0/executor-types#specifying-images).

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

### Machine executor
Configured by using the `machine` key, which takes a map:

Key | Required | Type | Description
----|-----------|------|------------
enabled | Y | Boolean | This must be true in order to enable the `machine` executor.
{: class="table table-striped"}

<!-- as of mar 10 2017 this next line is reported as not working, so commenting it out -->
<!-- As a shorthand you can set the `machine` key to `true`. -->

Example:

``` YAML
jobs:
  build:
    machine:
      enabled: true
```

## **`steps`**

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

Configuration map is specific for each step and described [below](#built-in-steps).

### Built-in steps

In the future you will be able to refer to external and custom step types, but for now you are limited to these built-in predefined steps.

#### **`run`**

Used for invoking all command-line programs, taking either a map of configuration values, or, when called in its short-form, a string that will be used as both the `command` and `name`. Run commands are executed using non-login shells by default, so you must explicitly source any dotfiles as part of the command.

##### **Configuration map**

Key | Required | Type | Description
----|-----------|------|------------
command | Y | String | Command to run via the shell
name | N | String | Title of the step to be shown in the CircleCI UI (default: full `command`)
shell | N | String | Shell to use for execution command (default: `/bin/bash -e` or `/bin/sh -e` if `bash` is not available)
environment | N | Map | Additional environmental variables, locally scoped to command
background | N | Boolean | Whether or not this step should run in the background (default: false)
working_directory | N | String | What directory to run this step in (default:  [`working_directory`](#jobs) of the job)
{: class="table table-striped"}

Each `run` declaration represents a new shell. It's possible to specify a multi-line `command`, each line of which will be run in the same shell:

``` YAML
- run:
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

Note that our default `shell` has the `-e` option, which causes commands to:
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
      set +e
      mkdir -p /tmp/test-results
      make test
```

In general we recommend using the `-e` option (on by default) because it shows errors in intermediate commands and simplifies debugging in case of job failure.

The `background` attribute allows for executing commands in the background. In this case, job execution will immediately proceed to the next step rather than waiting for the command to return. While debugging background commands is more difficult, running commands in the background might be necessary in some cases. For instance, to run Selenium tests you may need to have X virtual framebuffer running:

``` YAML
- run:
    name: Running X virtual framebuffer
    command: Xvfb :99 -screen 0 1280x1024x24
    background: true

- run: make test
```

`run` has a very convenient shorthand syntax:

``` YAML
- run: make test

# shorthanded command can also have multiple lines
- run: |
    mkdir -p /tmp/test-results
    make test
```
In this case, `command` and `name` become the string value of `run`, and the rest of the config map for that `run` have their default values.

##### **Complete example of `run` **
``` YAML
- run:
    name: Testing application
    command: make test
    shell: /bin/bash
    working_directory: ~/my-app
    environment:
      FOO: "bar"

- run: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts

- run: |
    sudo -u root createuser -h localhost --superuser ubuntu &&
    sudo createdb -h localhost test_db

```

#### **`checkout`**

Special step used to check out source code to the configured `path` (defaults to the `working_directory`).

##### **Configuration map**

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
#### **`save_cache`**

Generates and stores a cache of a file or directory of files such as dependencies or source code in our object storage. Later builds can restore this cache (using a [`restore_cache` step](#restore_cache)). Learn more in [the caching documentation]({{ site.baseurl }}/2.0/caching).

**Configuration map**

Key | Required | Type | Description
----|-----------|------|------------
paths | Y | List | List of directories which should be added to the cache
key | Y | String | Unique identifier for this cache
{: class="table table-striped"}

The cache for a specific `key` is immutable and cannot be changed once written. NOTE: _If the cache for the given `key` already exists it won't be modified, and job execution will proceed to the next step._

When storing a new cache, `key` value may contains special templated values for your convenience:

Template | Description
----|----------
{% raw %}`{{ .Branch }}`{% endraw %} | the VCS branch currently being built
{% raw %}`{{ .BuildNum }}`{% endraw %} | the CircleCI build number for this build
{% raw %}`{{ .Revision }}`{% endraw %} | the VCS revision currently being built
{% raw %}`{{ .CheckoutKey }}`{% endraw %} | the SSH key used to checkout the repo
{% raw %}`{{ .Environment.variableName }}`{% endraw %} | the environment variable `variableName`
{% raw %}`{{ checksum "filename" }}`{% endraw %} | a base64 encoded SHA256 hash of the given filename's contents. This should be a file committed in your repo. Good candidates are dependency manifests, such as `package.json`, `pom.xml` or `project.clj`. It's important that this file does not change between `restore_cache` and `save_cache`, otherwise the cache will be saved under a cache key different than the one used at `restore_cache` time.
{% raw %}`{{ epoch }}`{% endraw %} | the current time in seconds since the unix epoch.
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

##### **Complete example**

{% raw %}
``` YAML
- save_cache:
    key: v1-myapp-{{ checksum "project.clj" }}
    paths:
      - /home/ubuntu/.m2
```
{% endraw %}

<a name="restore_cache"/>
#### **`restore_cache`**

Restores a previously saved cache based on a `key`. Cache needs to have been saved first for this key using [`save_cache` step](#save_cache). Learn more in [the caching documentation]({{ site.baseurl }}/2.0/caching).

##### **Configuration map**

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

##### **Complete example**
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

#### **`deploy`**

Special step for deploying artifacts.

`deploy` uses the same configuration map and semantics as [`run`](#run) step. Jobs may have more than one `deploy` step.

In general `deploy` step behaves just like `run` with one exception - in a build with `parallelism`, the `deploy` step will only be executed by node #0 and only if all nodes succeed. Nodes other than #0 will skip this step.

##### **Example**

``` YAML
- deploy:
    command: |
      if [ "${CIRCLE_BRANCH}" == "master" ]; then
        ansible-playbook site.yml
      fi
```

#### **`store_artifacts`**

<!-- TODO: replace the 1.0 link here with a 2.0 link -->
Step to store artifacts (for example logs, binaries, etc) to be available in the web UI or via the API. Learn more about [artifacts]({{ site.baseurl }}/1.0/build-artifacts)

##### **Configuration map**

Key | Required | Type | Description
----|-----------|------|------------
path | Y | String | Directory in the primary container to save as build artifacts
destination | Y | Prefix added to the artifact paths in the artifacts API
{: class="table table-striped"}

There can be multiple `store_artifacts` steps in a job. Using a unique prefix for each step prevents them from overwriting files.

##### **Example**

``` YAML
- store_artifacts:
    path: /code/test-results
    destination: prefix
```

#### **`store_test_results`**

Special step used to upload test results to be stored in artifacts and shown in the web UI.

##### **Configuration map**

Key | Required | Type | Description
----|-----------|------|------------
path | Y | String | Directory containing JUnit XML or Cucumber JSON test metadata files
{: class="table table-striped"}

The directory layout should match the [classic CircleCI test metadata directory layout]({{ site.baseurl }}/1.0/test-metadata/#metadata-collection-in-custom-test-steps).

##### **Example**

``` YAML
- store_test_results:
    path: /tmp/test-results
```

#### **`add_ssh_keys`**

Special step that adds SSH keys configured in the project's UI to the container.

##### **Configuration map**

Key | Required | Type | Description
----|-----------|------|------------
fingerprints | N | List | List of fingerprints corresponding to the keys to be added (default: all keys added)
{: class="table table-striped"}

``` YAML
- add-ssh-keys:
    fingerprints:
      - "b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be"
```

For some advanced cases like SSH forwarding you will need to start `ssh-agent` yourself:

``` YAML
- run:
    name: Start ssh-agent
    command: |
      ssh-agent -s > ~/.ssh_agent_conf
      source ~/.ssh_agent_conf

      for _k in $(ls ${HOME}/.ssh/id_*); do
        ssh-add ${_k} || true
      done
```

Then `source` the ssh configuration in `run` steps that require an ssh-agent:

``` YAML
- run:
    name: run my special ssh command
    command: |
      source ~/.ssh_agent_conf
      my-command-that-uses-ssh
```

### Putting it all together

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
          path: /tmp/test-results
```
{% endraw %}
