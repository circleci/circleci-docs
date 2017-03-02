---
layout: classic-docs2
title: "Built-in Steps for Jobs"
short-title: "Built-in Steps"
categories: [getting-started]
order: 40
---

## Built-in Steps

### **run**

Used for invoking all command-line programs.

Run commands are executed using non-login shells by default, so you must explicitly source any dotfiles as part of the command.

Fields (optional in brackets):

#### **command** (string)

Command to run via the shell.

#### **[name]** (string)

The name the UI uses for the step.

#### **[shell]** (string)

The path used to invoke the command. Default: `/bin/bash`

#### **[environment]** (string)
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
Special step used to check out source code to the configured `path`. This is interpreted within the job as `git clone <my-project-vcs-url> <path>`.

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

Step used to create a dependency or source cache.  You specify a cache key that this will save to.  Later jobs can restore from this key.  The key determines when the cache is invalidated, and these fields will let you build a new cache according to certain events and times.

Fields:

* `paths`: a list of directories which should be added to the cache
* `key`: a unique identifier for this cache
    * if `key` is already present in the cache, it will not be recreated
    * the key may contain a template that will be replaced by runtime values. To insert a runtime value, use the syntax: `"text-<< .Branch >>"`

Valid runtime values:
  - `<< .Branch >>`: the VCS branch currently being built
  - `<< .BuildNum >>`: the CircleCI build number for this job
  - `<< .Revision >>`: the VCS revision currently being built
  - `<< .CheckoutKey >>`: the SSH key used to checkout the repo
  - `<< .Environment.variableName >>`: the environment variable `variableName`
  - `<< checksum "filename" >>`: a base64 encoded SHA256 hash of the given filename's contents.  This should be a file committed in your repo.  Good candidates are dependency manifests, such as `package.json`.  It's important that this file does not change between `cache-restore` and `cache-save`, otherwise the cache will be saved under a cache key different than the one used at `cache-restore` time.
  - `<< epoch >>`: the current time in seconds since the unix epoch.  Use this in the last position of your key, as `cache-restore` performs prefix matching when looking up cache keys.  So a cache restore step searching for `foo-bar-` will match both `foo-bar-123` and `foo-bar-456`, but will choose the latter, since it's a newer timestamp.

Example:
```yaml
          - type: cache-save
            key: projectname-<< .Branch >>-<< checksum "project.clj" >>
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
              - projectname-<< .Branch >>-<< checksum "project.clj" >>
              # Providing keys in decreasing specificity means it's more likely a new cache can be built from an existing one.
              - projectname-

          # Repeat jobs will restore from this step as it will produce the newest cache
          - type: cache-save
            key: projectname-<< .Branch >>-<< checksum "project.clj" >>-<< epoch >>
            paths:
              - /foo

          # This step will only save first time the jobs is run, then be skipped on subsequent runs.
          - type: cache-save
            key:  projectname-<< .Branch >>-<< checksum "project.clj" >>
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

In a `parallel` job, the `deploy` step will only be executed by node #0 and only if all nodes succeed. Nodes other than #0 will skip this step.

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