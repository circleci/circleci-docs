---
layout: classic-docs2
title: "Configuration Reference"
short-title: "Configuration"
categories: [reference]
order: 0
---

This document is a reference for `.circleci/config.yml` and lists the built-in job steps available to you.

## **run**

Used for invoking all command-line programs.

Run commands are executed using non-login shells by default, so you must explicitly source any dotfiles as part of the command.

Fields (optional in brackets):

### **command** (string)

Command to run via the shell.

### **[name]** (string)

The name the UI uses for the step.

### **[shell]** (string)

The path used to invoke the command. Default: `/bin/bash`

### **[environment]** (string)

Additional environment variables, locally scoped to command. Must be a YAML map.

### **[background]** (boolean)

Represents whether command should be run in the background. Default: false

```YAML
- run:
    command: bundle check || bundle install
    shell: /bin/bash
    environment:
      FOO: "bar"
```

## **checkout**

Special step used to check out source code to the configured `path`. This is interpreted within the build as `git clone <my-project-vcs-url> <path>`.

Fields (optional in brackets):

### **[path]** (string)

Checkout directory. Default: job’s `working_directory`.

## **add_ssh_keys**

Special step that adds SSH keys configured in the project’s UI to the container.

Fields (optional in brackets):

### **[fingerprints]** (list of strings)

List of fingerprints corresponding to the keys to be added. Default: all keys added.

```YAML
- add_ssh_keys
    fingerprints:
      - "b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be"
```

To use an ssh-agent, you’ll need to explicitly start one up:

```YAML
- run:
    name: Start ssh-agent
    command: |
      ssh-agent -s > ~/.ssh_agent_conf
      source ~/.ssh_agent_conf

      for _k in $(ls ${HOME}/.ssh/id_*); do
        ssh-add ${_k} || true
      done
```

Then, load the ssh configuration in steps that require an ssh-agent:

```YAML
- run:
    name: run my special ssh command
    command: |
      source ~/.ssh_agent_conf

      my-command-that-uses-ssh
```

## **store_artifacts**

Special step used to store artifacts.

Fields:

### **path** (string)

Directory in the main container to save build artifacts.

### **destination** (string)

Prefix added to the artifact paths in the artifacts API.

There can be multiple `store_artifacts` steps in a stage. Using a unique prefix for each step prevents them from overwriting files.

```YAML
- store_artifacts:
    path: /code/test-results
    destination: prefix
```

## **save_cache**

Step used to create a dependency or source cache. By specifying a cache key to save to, later jobs will be able to restore from that key.

The key determines when the cache is invalidated, and these fields will let you build a new cache when certain events or times occur.

Fields:

### **paths** (list of strings)

List of directories that should be added to the cache.

### **key** (string)

Unique identifier for this cache. If `key is already present in the cache, it won’t be recreated.

The key can contain a template that will be replaced by runtime values. To insert a value, use the syntax: `text-<< .Branch >>`.

Below is a list of valid runtime values:

#### `<< .Branch >>`

VCS branch currently being built.

#### `<< .BuildNum >>`

CircleCI build number for this job.

#### `<< .Revision >>`

VCS revision currently being built.

#### `<< .CheckoutKey >>`

SSH key used to checkout the repo.

#### `<< .Environment.variableName >>`:

Environment variable `variableName`.

#### `<< checksum "filename" >>`

A base64-encoded SHA256 hash of the filename's contents.

The file you pick should be committed in your repo. Good candidates are dependency manifests like `package.json`. It’s important that this file doesn’t change between `restore_cache` and `save_cache`, or the cache will be saved under a different key than the one used for `restore_cache`.

#### `<< epoch >>`

Current time in seconds since Unix epoch.

Use this in the last position of your key, as `restore_cache` performs prefix matching when looking up cache keys.

For example, a cache restore step looking for `foo-bar-` will match both `foo-bar-123` and `foo-bar-456`, but will choose the latter since it’s a more recent timestamp.

```YAML
- save_cache:
    key: projectname-<< .Branch >>-<< checksum "project.clj" >>
    paths:
      - /home/ubuntu/.m2
```

## **restore_cache**

Step used to restore a dependency cache (if present).

Fields (at least one required):

### **key** (string)

A single cache key to restore.

### **keys** (list of strings)

A list of cache keys that should be restored.

Use this if you want to specify backup caches to use in case of a cache miss (“use a cache from branch X or master”).

If `key` and `keys` are both given, `key` will be checked before `keys`.

When CircleCI has a choice of multiple keys, the cache will be restored from the first one matching an existing cache.  If no key has a cache that exists, the step will be skipped with a warning. A path is not required here because the cache will be restored to the location where it was originally saved.

A key is searched against existing keys as a prefix. When there are multiple matches, the **most recent match** will be used, even if there is a more precise match.

For more information on key formatting, see the `key` section of `save_cache` above.

```YAML
- restore_cache:
    key: projectname-<< .Branch >>-<< checksum "project.clj" >>
```

## **store_test_results**

Special step used to upload test results.

Fields:

### **path** (string)

Directory containing JUnit XML or Cucumber JSON test metadata files.

The directory’s layout should match the [classic CircleCI test metadata directory layout](https://circleci.com/docs/test-metadata/#metadata-collection-in-custom-test-steps).

```YAML
- store_test_reults:
    path: /tmp/test-results
```

### **deploy**

Special step used to deploy artifacts.

`deploy` uses the same fields as `run`. `config.yml` may have more than one `deploy` step.

In a build with `parallelism`, the `deploy` step will only be executed by node #0 and only if all nodes succeed. Nodes other than #0 will skip this step.

```YAML
- type: deploy
  shell: /bin/sh
  command: ansible-playbook site.yml
```
