---
layout: classic-docs
title: "Configuration Overview"
short-title: "Overview"
categories: [configuring-circleci]
---

Configuration for CircleCI is contained in a single file: `.circleci/config.yml`. This file is committed to your project’s repository along with the rest of your source code.

This file is _extremely_ flexible, so it’s not realistic to list every possible thing you can put in here. Instead, we’ll create a sample `config.yml` file and explain the sections along the way.

## **version**

The first thing you’ll put in `config.yml` is the _version_ you’re using. We use this field to issue warnings about breaking changes or deprecation.

```yaml
version: 2.0
```

## **jobs**

The rest of `config.yml` is comprised of several _jobs_. In turn, a job is comprised of several _steps_, which are commands that run in sequential order.

So what does a job look like?

```
version: 2.0
jobs:
  build:
    docker:
      - image: golang:1.7.0
    environment:
      - FOO: "bar"
    steps:
      - checkout
      - run: make test
    working_directory: ~/canary-python
```

The job in this case is named “build”, and the value is a map of additional information about that job. CircleCI uses the job’s name in other contexts, so it **must** form a unique tuple in combination with the repository’s URI.

The map for each job accepts the following:

### **name** (string)

The name the UI uses for the job.

If you don’t specify a name, the UI will default to the map’s key (“build” in this case).

### **docker** or **machine** (map)

Options for either the Docker or machine [executor](#executors).

`docker` and `machine` are mutually exclusive, but you must choose one of them. If you’re not sure which executor to pick, read more about the differences between the executor types [here](#choosing-an-executor-type).

### **steps** (list)

A list of steps to be performed for this job. This and the executor are the only required keys.

### **parallelism** (integer)

Number of parallel instances of this job to run.

The default is 1. If you choose a number N > 1, then N independent executors will be set up to each run the job’s steps in parallel. Certain parallelism-aware steps can opt out of this and run on a single executor.

### **environment** (map)

A map of environment variable names and values.

In our example job, we export the `$FOO` environment variable with a value of `"bar"`.

### **working_directory** (string)

A directory in which to run the steps. The default depends on the [executor](#executors) you’re using.

The default `working_directory` will not exist for steps that run before the `checkout` step, _unless_ the working directory is created manually by a step. We strongly recommend setting this instead of relying on the default.

## Executors

You can specify image versions from DockerHub using image tags, like `golang` and `mongo` below. Or you can specify image versions using a SHA, like `redis` below.

```yaml
    containerInfo:
      - image: golang:1.6.2
      - image: mongo:2.6.8
        cmd: ["mongod", "--smallfiles"]
      - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673
```

The build steps will execute on the first container, which is `golang:1.6.2` here. Thanks to the pod, you can access the `mongod` service via `127.0.0.1:27017` inside the `golang` container, even though `mongo` is a separate image.

Not shown above (but possible!) are setting environment variables, configuring the command to use when launching the container, and/or specifying a user to run the command as.

### `workDir`
Each stage requires you to set the `workDir` key, which is used as the default working directory for that stage's steps. The most common `workDir` (and default behavior in CircleCI 1.0) is to use a directory named after the project in the user's home directory.

```yaml
workDir: ~/<my-project-name>
```

Note that `workDir` is actually created in the filesystem during the `checkout` step (covered below). If you want to create your own working directory, you'll need to add a shell step and set `pwd`:

```yaml
- type: shell
  name: Initialize Working Directory
  pwd: /
  command: |
    mkdir /my/working/directory
```

Without `pwd`, the step will fail because it will use the default working directory _created_ by this step. With `pwd`, the step uses the root of the filesystem as the working directory so it can _create_ the default working directory. Phew!

### `environment`
If you want to declare global environment variables, you have two options:

You can list them under the `environment` key. Observe this contrived example:

```yaml
version: 2
executorType: docker
containerInfo:
  - image: python:2.7.12
stages:
  build:
    workDir: ~/canary-python
    environment:
      - FOO: "bar"
    steps:
      - type: checkout
      - type: shell
        command: echo "When I say Foo... You say $FOO"
```

Or, if you're worried about putting sensitive information in `circle.yml`, you can add environment variables through the CircleCI UI in your project's settings.

Please note that if you nest an `environment` key within a particular step, it will be scoped to that step only and will _not_ be global.

### `parallel`
Stages can optionally set a level of parallelism using `parallel`. The environment variables `CIRCLE_NODE_INDEX` and `CIRCLE_NODE_TOTAL` will be set to the appropriate values in each container.

Currently, the only supported stages are `build` and `deploy`, which both allow regular "shell" steps, along with a small number of special steps.

```yaml
    stages:
      build:
        parallel: 5
        workDir: /path/to/checkout/source
        steps:
          - ...
```

All steps must have a `type` key. The valid types are listed below.

### Step Types

#### `shell`
Used for invoking all command-line programs. Shell commands are executed using non-login shells, so you must explicitly source any dotfiles as part of the command. All environment variables set in the CircleCI UI are implicitly added to the command's environment.

Fields (optional in brackets):

* `command`: command to run via the shell
* `[name]`: name given to step in  CircleCI UI
* `[shell]`: path to use to invoke command
    * default: `/bin/bash`
* `[environment]`: additional environmental variables, locally scoped to command
    * must be a YAML map
* `[background]`: boolean representing whether command should be run in the background
    * default: `false`
* `[pwd]`: absolute path to working directory
    * defaults to the stage’s `workDir`
    * if named path does not exist, errors thrown

```yaml
          - type: shell
            command: bundle check || bundle install
            shell: /bin/bash
            environment:
              FOO: "bar"
```

#### `checkout`
Special step used to check out source code to the configured `path`. This is interpreted within the build as `git clone <my-project-vcs-url> <path>`.

Fields:

* `[path]`: checkout directory
    * default: `workDir`


#### `add-ssh-keys`
Special step that adds SSH keys configured in the project's UI to the container.

Fields:

* `[fingerprints]`: list of fingerprints corresponding to the keys to be added
    * default: all keys added

```yaml
          - type: add-ssh-keys
            fingerprints:
              - "b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be"
```

To use an ssh-agent, you'll need to explicitly start one up:
```yaml
          - type: shell
            name: Start ssh-agent
            command: |
              ssh-agent -s > ~/.ssh_agent_conf
              source ~/.ssh_agent_conf

              for _k in $(ls ${HOME}/.ssh/id_*); do
                ssh-add ${_k} || true
              done
```

Then, load the ssh configuration in shell steps that require an ssh-agent:
```yaml
          - type: shell
            name: run my special ssh command
            command: |
              source ~/.ssh_agent_conf

              my-command-that-uses-ssh
```


#### `artifacts-store`
Special step used to store artifacts.

Fields:

* `path`: directory in the main container to save as build artifacts
* `destination`: prefix added to the artifact paths in the artifacts API

There can be multiple `artifacts-store` steps in a stage. Using a unique prefix for each step prevents them from overwriting files.

```yaml
          - type: artifacts-store
            path: /code/test-results
            destination: prefix
```

#### `cache-save`

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
          - type: cache-save
            key: projectname-{{ .Branch }}-{{ checksum "project.clj" }}
            paths:
              - /home/ubuntu/.m2
```

#### `cache-restore`
Step used to restore a dependency cache (if present).

Fields (at least one required):

  * `key`: a single cache key to restore.
  * `keys`: a list of cache keys which should be restored. Use this if you want to specify fallback caches, like "use a cache from this branch, or master on a cache-miss".

If `key` and `keys` are both given, `key` will be checked first, and then `keys`.

When CircleCI has a choice of multiple keys, the cache will be restored from the first one matching an existing cache.  If no key has a cache that exists, the step will be skipped with a warning. A path is not required here because the cache will be restored to the location where it was originally saved.

A key is searched against existing keys as a prefix.  When there are multiple matches, the **most recent match** will be used, even if there is a more precise match.

For more information on key formatting, see the `key` section of `cache-save` above.

Example:
```yaml
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

```

#### `test-results-store`

Special step used to upload test results.

Fields:

* `path`: directory containing JUnit XML or Cucumber JSON test metadata files

The directory layout should match the [classic CircleCI test metadata directory layout](https://circleci.com/docs/test-metadata/#metadata-collection-in-custom-test-steps).

```yaml
          - type: test-results-store
            path: /tmp/test-results
```

#### `deploy`

Special step used to deploy artifacts.

`deploy` uses the same fields as `shell`. Config may have more than one `deploy` step.

In a `parallel` build, the `deploy` step will only be executed by node #0 and only if all nodes succeed. Nodes other than #0 will skip this step.

```yaml
          - type: deploy
            shell: /bin/sh
            command: ansible-playbook site.yml
```

### Putting it all together

```yaml
version: 2
executorType: docker
containerInfo:
  - image: ubuntu:14.04
    cmd: ["/bin/bash"] # specify if image does not already have Command set
  - image: mongo:2.6.8
    cmd: [mongod, --smallfiles]
  - image: postgres:9.4.1
    # some containers require setting environment variables
    env:
      - POSTGRES_USER=root
  - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673
  - image: rabbitmq:3.5.4
stages:
  build:
    workDir: ~/my-project
    steps:
      - type: checkout
      # Add an entry to /etc/hosts
      - type: shell
        shell: /bin/bash
        command: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts
      # Create Postgres users and database
      # Note the YAML heredoc '|' for nicer formatting
      - type: shell
        shell: /bin/bash
        command: |
          sudo -u root createuser -h localhost --superuser ubuntu &&
          sudo createdb -h localhost test_db
      # Run tests with larger command
      - type: shell
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
      - type: shell
        shell: /bin/bash
        command: |
          set -exu
          mkdir -p /tmp/artifacts
          create_jars.sh ${CIRCLE_BUILD_NUM}
          cp *.jar /tmp/artifacts

      # Deploy staging
      - type: deploy
        shell: /bin/bash
        command: |
          if [ "${CIRCLE_BRANCH}" == "staging" ];
            then ansible-playbook site.yml -i staging;
          fi

      # Deploy production
      - type: deploy
        shell: /bin/bash
        command: |
          if [ "${CIRCLE_BRANCH}" == "master" ];
            then ansible-playbook site.yml -i production;
          fi

      # Save artifacts
      - type: artifacts-store
        path: /tmp/artifacts
        destination: build

      # Upload test results
      - type: test-results-store
        path: /tmp/test-results
```