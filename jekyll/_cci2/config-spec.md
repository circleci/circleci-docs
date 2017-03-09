---
layout: classic-docs2
title: "Configuration Reference"
short-title: "Configuration"
categories: [reference]
order: 0
---

This document is a reference for `.circleci/config.yml` which describes jobs and steps to build/test/deploy your project. The presence of this file indicates that you want to use the 2.0 infrastructure. This allows you to test 2.0 builds on a separate branch, leaving regular builds unaffected and running on the existing CircleCI infrastructure.

The `config.yml` file has the following format:

## Root

Key | Required | Type | Description
----|-----------|------|------------
version | Y | String | Should currently be `2`
jobs | Y | List | A list of jobs, see the definition for a job
{: class="table table-striped"}

The `version` field is intended to be used in order to issue warnings for deprecation or breaking changes.

## `jobs`

Each job is an item in the `jobs` list. Each job consists of a job's name as a key and a map as a value. A name should be unique within a current `jobs` list. The value map  has the following attributes:

Key | Required | Type | Description
----|-----------|------|------------
docker | Y (1) | List | Options for [docker executor](#docker-executor)
machine | Y (1) | Map | Options for [machine executor](#machine-executor)
steps | Y | List | A list of [steps](#steps) to be performed
parallelism | N | Integer | Number of parallel instances of this job to run (default: 1)
environment | N | Map | A map of environment variable names and valuables
working_directory | N | String | What directory to run the steps in (default: depends on executor)
{: class="table table-striped"}

(1) exactly one of them should be specified. It is an error to set more than one.

If `parallelism` is set to N > 1, then N independent executors will be set up to each run the steps of that job in parallel. Certain parallelism-aware steps can opt out of the parallelism and only run on a single executor (for example [`deploy` step](#deploy)). Learn more about [parallel jobs]({{ site.baseurl }}/2.0/parallelism-faster-jobs).

`working_directory` will be created automatically if it doesn't exist. It is strongly recommended to set `working_directory` and not rely on the default.

Example:
``` YAML
jobs:
  build:
    docker:
      - alpine:3.5
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

`command` will be used as arguments to image entrypoint (if specified in Dockerfile) or as executable (if no entrypoint provided here and in image Dockerfile).

For [primary container]({{ site.baseurl }}/2.0/glossary#primary-container) (listed first in the list) if no `command` specified then `command` and image entrypoint will be ignored, to avoid errors caused by entrypoint executable consuming significant resources or exiting preliminary.

The `environment` settings apply to all commands run in this executor, not just the initial `command`. The `environment` here has higher precedence over setting it in the job map above.

You can specify image versions using tags or digest. You can use any public images from any public Docker registry (defaults to DockerHub). Learn more about [specifying images]({{ site.baseurl }}/2.0/executor-types#specifying-images)

Example:

``` YAML
jobs:
  build:
    docker:
      - image: alpine:3.5 # primary container
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
Configured by `machine` key which takes a map:

Key | Required | Type | Description
----|-----------|------|------------
enabled | Y | Boolean | This must be true in order to enable the `machine` executor.
{: class="table table-striped"}

As a shorthand you can set the `machine` key to `true`.

Example:

``` YAML
jobs:
  build:
    machine: true
```

<a name="steps" />
## `steps`

The `steps` setting in a job should be a list of single key/value pair maps, the key to which indicates the step type. The value from the pair may be either a configuration map or a string. For example, using a map:

```
jobs:
  build:
    working_directory: ~/canary-python
    environment:
      - FOO: "bar"
    steps:
      - run:
          name: run tests
          command: make test
```

Here, the `name` attribute is used by the UI for display purposes. In the absence of a `name` attribute, some sensible default MAY be filled in by the step implementation. The semantics of `command` are defined by the step.

If the value of the step invocation key is a string, a step MAY implement default behaviour. This enables us to reduce the example further:

```
jobs:
  build:
    steps:
      - run: make test
```

Applying our rules:

1. There is one key, which we treat as a reference to a step type `run`.
2. The value associated with a key is not a map, but a string, which is interpreted by the builtin `run` step as being the value of `command`, `run`'s only required configuration attribute.
3. The absence of a `name` attribute results in the `run` step using the value of `command` to fill in `name`.

Another shorthand is to simply use a string instead of the whole step map:

```
jobs:
  build:
    steps:
      - checkout
```

This is the equivalent of an empty map under the `checkout` key.

This gives us:

KEY | REQUIRED? | TYPE | DESCRIPTION
----|-----------|------|------------
&lt;step-type> | Y | Map, or String | A configuration map for the step or some string whose semantics are defined by the step.

The optional configuration map for a step invocation:

KEY | REQUIRED? | TYPE | DESCRIPTION
----|-----------|------|------------
name | N | String | Title of the step to be shown in the Circle UI
no_output_timeout | N | Integer | Number of seconds of silence allowed before the step times out and fails (default: 600)
absolute_timeout | N | Integer | Number of seconds a step may take overall before it times out and fails (default: ??)
background | N | Boolean | Whether or not this step should run in the background (default: false)
working_directory | N | String | What directory to run this step in

...along with any other configuration attributes with semantics defined by the step.

Note that setting `working_directory` will only affect this step, not the ones following it.

Attempts to set `background` in conflict with a steps definition will result in error. A step with `background` set will allow the job to proceed to the next step immediately. A failure of a backgrounded step will cause the entire build to halt and fail.

### Built-in steps

In the future you will be able to refer to external steps, but for now you are limited to these built-in predefined steps.

#### `run`

Used for invoking all command-line programs. Run commands are executed using non-login shells by default, so you must explicitly source any dotfiles as part of the command.

Fields (optional in brackets):

* `command`: command to run via the shell
* `[name]`: name given to step in  CircleCI UI
* `[shell]`: path to use to invoke command
    * default: `/bin/bash`
* `[environment]`: additional environmental variables, locally scoped to command
    * must be a YAML map
* `[background]`: boolean representing whether command should be run in the background
    * default: `false`

```yaml
          - run:
              command: bundle check || bundle install
              shell: /bin/bash
              environment:
                FOO: "bar"
```

#### `checkout`

Special step used to check out source code to the configured `path`. This is interpreted within the build as `git clone <my-project-vcs-url> <path>`.

Fields:

* `[path]`: checkout directory
    * defaults to the job's `working_directory`

#### `add_ssh_keys`

Special step that adds SSH keys configured in the project's UI to the container.

Fields:

* `[fingerprints]`: list of fingerprints corresponding to the keys to be added
    * default: all keys added

```yaml
          - add-ssh-keys:
              fingerprints:
                - "b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be"
```

To use an ssh-agent, you'll need to explicitly start one up:

```yaml
          - run:
              name: Start ssh-agent
              command: |
                ssh-agent -s > ~/.ssh_agent_conf
                source ~/.ssh_agent_conf

                for _k in $(ls ${HOME}/.ssh/id_*); do
                  ssh-add ${_k} || true
                done
```

Then, load the ssh configuration in run steps that require an ssh-agent:
```yaml
          - run:
              name: run my special ssh command
              command: |
                source ~/.ssh_agent_conf

                my-command-that-uses-ssh
```


#### `store_artifacts`

Special step used to store artifacts.

Fields:

* `path`: directory in the main container to save as build artifacts
* `destination`: prefix added to the artifact paths in the artifacts API

There can be multiple `artifacts-store` steps in a job. Using a unique prefix for each step prevents them from overwriting files.

```yaml
          - store_artifacts:
              path: /code/test-results
              destination: prefix
```

#### `save_cache`

Step used to create a dependency or source cache.  You specify a cache key that this will save to.  Later builds can restore from this key.  The key determines when the cache is invalidated, and these fields will let you build a new cache according to certain events and times.

Fields:

* `paths`: a list of directories which should be added to the cache
* `key`: a unique identifier for this cache
    * if `key` is already present in the cache, it will not be recreated
    * the key may contain a template that will be replaced by runtime values. To insert a runtime value, use the syntax: `"text-{{ .Branch }}"`

Valid runtime values:
  - `{{ .Branch }}`: the VCS branch currently being built
  - `{{ .BuildNum }}`: the CircleCI build number for this build
  - `{{ .Revision }}`: the VCS revision currently being built
  - `{{ .CheckoutKey }}`: the SSH key used to checkout the repo
  - `{{ .Environment.variableName }}`: the environment variable `variableName`
  - `{{ checksum "filename" }}`: a base64 encoded SHA256 hash of the given filename's contents.  This should be a file committed in your repo.  Good candidates are dependency manifests, such as `package.json`.  It's important that this file does not change between `cache-restore` and `cache-save`, otherwise the cache will be saved under a cache key different than the one used at `cache-restore` time.
  - `{{ epoch }}`: the current time in seconds since the unix epoch.  Use this in the last position of your key, as `cache-restore` performs prefix matching when looking up cache keys.  So a cache restore step searching for `foo-bar-` will match both `foo-bar-123` and `foo-bar-456`, but will choose the latter, since it's a newer timestamp.

Example:

```yaml
          - save_cache:
              key: projectname-{{ .Branch }}-{{ checksum "project.clj" }}
              paths:
                - /home/ubuntu/.m2
```

#### `restore_cache`

Step used to restore a dependency cache (if present).

Fields (at least one required):

  * `key`: a single cache key to restore.
  * `keys`: a list of cache keys which should be restored. Use this if you want to specify fallback caches, like "use a cache from this branch, or master on a cache-miss".

If `key` and `keys` are both given, `key` will be checked first, and then `keys`.

When CircleCI has a choice of multiple keys, the cache will be restored from the first one matching an existing cache.  If no key has a cache that exists, the step will be skipped with a warning. A path is not required here because the cache will be restored to the location where it was originally saved.

A key is searched against existing keys as a prefix.  When there are multiple matches, the **most recent match** will be used, even if there is a more precise match.

For more information on key formatting, see the `key` section of `save_cache` above.

Example:
```yaml
<<<<<<< variant A
          - type: cache-restore
            keys:
              - projectname-{{ .Branch }}-{{ checksum "project.clj" }}
              # Providing keys in decreasing specificity means it's more likely a new cache can be built from an existing one.
              - projectname-

          # Repeat builds will restore from this step as it will produce the newest cache
          - type: cache-save
            key: projectname-{{ .Branch }}-{{ checksum "project.clj" }}-{{ epoch }}
            paths:
              - /foo

          # This step will only save on the first build, then be skipped on subsequent builds.
          - type: cache-save
            key:  projectname-{{ .Branch }}-{{ checksum "project.clj" }}
            paths:
              - /foo

>>>>>>> variant B
          - restore_cache:
              key: projectname-{{ .Branch }}-{{ checksum "project.clj" }}
======= end
```

#### `store_test_results`

Special step used to upload test results.

Fields:

* `path`: directory containing JUnit XML or Cucumber JSON test metadata files

The directory layout should match the [classic CircleCI test metadata directory layout](https://circleci.com/docs/test-metadata/#metadata-collection-in-custom-test-steps).

```yaml
          - test-results-store:
              path: /tmp/test-results
```

#### `deploy`

Special step used to deploy artifacts.

`deploy` uses the same fields as [`run`](#run). Config may have more than one `deploy` step.

In a build with `parallelism`, the `deploy` step will only be executed by node #0 and only if all nodes succeed. Nodes other than #0 will skip this step.

```yaml
          - deploy:
              shell: /bin/sh
              command: ansible-playbook site.yml
```

### Putting it all together

```yaml
version: 2
jobs:
  build:
<<<<<<< variant A
    workDir: ~/my-project
>>>>>>> variant B
    docker:
      - image: ubuntu:14.04
        command: ["/bin/bash"] # specify if image does not already have Command set
      - image: mongo:2.6.8
        command: [mongod, --smallfiles]
      - image: postgres:9.4.1
        # some containers require setting environment variables
        environment:
          POSTGRES_USER: root
      - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673
      - image: rabbitmq:3.5.4
    working_directory: /home/ubuntu/my-project
======= end
    steps:
      - checkout
      # Add an entry to /etc/hosts
      - run:
          shell: /bin/bash
          command: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts
      # Create Postgres users and database
      # Note the YAML heredoc '|' for nicer formatting
      - run:
          shell: /bin/bash
          command: |
            sudo -u root createuser -h localhost --superuser ubuntu &&
            sudo createdb -h localhost test_db
      # Run tests with larger command
      - run:
          shell: /bin/bash
          command: |
              set -exu
              mkdir -p /tmp/test-results
              TESTFILES=$(find ./test -name 'test_*.clj' | sort | awk "NR % ${CIRCLE_NODE_TOTAL} == ${CIRCLE_NODE_INDEX}")
              if [ -z "${TESTFILES}" ]
              then
                  echo "misconfigured parallelism"
                  exit 1
              else
                  run-tests.sh ${TESTFILES}
                  cp out/tests/*.xml /tmp/test-results/
              fi
          environment:
            SSH_TARGET: "localhost"
            TEST_ENV: "linux"

      # Create deployable artifacts
      - run:
          command: |
            set -exu
            mkdir -p /tmp/artifacts
            create_jars.sh ${CIRCLE_BUILD_NUM}
            cp *.jar /tmp/artifacts

      # Deploy staging
      - deploy:
          shell: /bin/bash
          command: |
            if [ "${CIRCLE_BRANCH}" == "staging" ];
              then ansible-playbook site.yml -i staging;
            fi

      # Deploy production
      - deploy:
          shell: /bin/bash
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
