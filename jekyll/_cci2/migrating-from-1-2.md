---
layout: classic-docs
title: "Migrating a Linux Project from 1.0 to 2.0"
short-title: "Migrating a Linux Project from 1.0 to 2.0"
description: "Why and how to migrate from CircleCI 1.0 to 2.0"
categories: [migration]
order: 15
---

This document will give you a starting place for migrating from CircleCI 1.0 to 2.0 by using a copy of your existing 1.0 configuration file and replacing the old keys with the new keys if equivalents exist. 

* TOC
{:toc}

The migration process may not end with this document, but the goal is to get the majority of keys replaced with the equivalent syntax nesting and to help you get started with adding new functionality.

If you do not have a `circle.yml` file, refer to the [Sample 2.0 `config.yml` File]({{ site.baseurl }}/2.0/sample-config) to get started from scratch.

## Overview
{:.no_toc}

CircleCI requires that you create a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference), and it adds new required keys for which values must be defined. **Note:** Parallelism may only be set in the `.circleci/config.yml` file, the parallelism setting in the CircleCI app is ignored.

If you already have a `circle.yml` file, the following sections describe how to make a copy of your existing file, create the new required keys, and then search and replace your 1.0 keys with 2.0 keys.

### Using the 1.0 to 2.0 `config-translation` Endpoint
{:.no_toc}

The `config-translation` endpoint can help you quickly get started with converting a 1.0 config to 2.0. For more, see [Using the 1.0 to 2.0 config-translation Endpoint]({{ site.baseurl }}/2.0/config-translation).

## Steps to Configure Required Keys

1. Copy your existing `circle.yml` file into a new directory called `.circleci` at the root of your project repository.

2. Rename `.circleci/circle.yml` to `.circleci/config.yml`.

3. Add `version: 2` to the top of the `.circleci/config.yml` file.

4. Add the following two lines to your `config.yml` file, after the version line. If your configuration includes `machine:`, replace `machine:` with the following two lines, nesting all of the sections of the old config file under `build`.
     ```
     jobs:
       build:
     ```
5. Add the language and version you want to run the primary container to your configuration using either the `docker:` and `- image:` keys in the example or by setting `machine: true` or by using `macos`. If your configuration includes language and version as shown for `ruby:` below, replace it as shown.
     ```
       ruby:
         version: 2.3
     ```
     Replace with the following two lines:
     ```
         docker:
           - image: circleci/ruby:2.3-jessie
     ```
     The primary container is an instance of the first image listed. Your job's commands run in this container and must be declared for each job. See the [Docker Getting Started](https://docs.docker.com/get-started/#docker-concepts) if you are new to Docker containers. 
     ```yaml
         machine: true
     ```
     See the Using Machine section of the [Choosing an Executor Type](https://circleci.com/docs/2.0/executor-types/#using-machine) document for details about the available VM images.
     ```yaml
         macos: 
           xcode: "9.0"
     ```
See the [Migrating Your iOS Project From 1.0 to 2.0](https://circleci.com/docs/2.0/ios-migrating-from-1-2/) document for details.

6. The `checkout:` step is required to run jobs on your source files. Nest `checkout:` under `steps:` for every job by search and replacing
     ```
     checkout:
       post:
     ```
     With the following:
     ```
         steps:
           - checkout
           - run:
     ```

     For example:
     ```
     checkout:
      post:
        - mkdir -p /tmp/test-data
        - echo "foo" > /tmp/test-data/foo
     ```
     becomes
     ```
         steps:
           - checkout
           - run: mkdir -p /tmp/test-data
           - run: echo "foo" > /tmp/test-data/foo
     ```
     If you do not have a `checkout` step, you must add this step to your `config.yml` file.
     
7. (Optional) Add  the `add_ssh_keys` step with fingeprint to enable SSH into builds, see the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/#add_ssh_keys) document for details.

8. Validate your YAML at <http://codebeautify.org/yaml-validator> to check the changes.

## Environment Variables

In CircleCI 2.0, all defined environment variables are treated literally.
It is possible to interpolate variables within a command
by setting it for the current shell.

For more information,
refer to the CircleCI 2.0 document [Using Environment Variables]({{ site.baseurl }}/2.0/env-vars/).

## Steps to Configure Workflows

To increase the speed of your software development through faster feedback, shorter re-runs, and more efficient use of resources, configure workflows using the following instructions:

1. To use the Workflows feature, split your build job into multiple jobs, each with a unique name. It might make sense to start by just splitting out a deploy job to prevent you from having to re-run the entire build when only the deployment fails.
 
2. As a best practice, add lines for `workflows:`, `version: 2` and `<workflow_name>` at the *end* of the master `.circleci/config.yml` file, replacing `<workflow_name>` with a unique name for your workflow. **Note:** The Workflows section of the `config.yml` file is not nested in the config. It is best to put the Workflows at the end of the file because the Workflows `version: 2` is in addition to the `version:` key at the top of the `config.yml` file.  
     ```
     workflows:
       version: 2
       <workflow_name>:
     ```  
3. Add a line for the `jobs:` key under `<workflow_name>` and add a list of all of the job names you want to orchestrate. In this example, `build` and `test` will run in parallel.
 
     ```
     workflows:
       version: 2
       <workflow_name>:
           jobs:
             - build
             - test
     ```  
4. For jobs which must run sequentially depending on success of another job, add the `requires:` key with a nested list of jobs that must succeed for it to start. If you were using a `curl` command to start a job, Workflows enable you to remove the command and start the job by using the `requires:` key.
 
     ```
      - <job_name>:
          requires:
            - <job_name>
     ```
5. For jobs which must run on a particular branch, add the `filters:` key with a nested `branches` and `only` key. For jobs which must not run on a particular branch, add the `filters:` key with a nested `branches` and `ignore` key. **Note:** Workflows will ignore job-level branching, so if you have configured job-level branching and then add workflows, you must remove the branching at the job level and instead declare it in the workflows section of your `config.yml`, as follows:
 
     ```
     - <job_name>:
         filters:
           branches:
             only: master
     - <job_name>:
         filters:
           branches:
             ignore: master
     ```     
6. Validate your YAML again at <http://codebeautify.org/yaml-validator> to check that it is well-formed.

## Search and Replace Deprecated 2.0 Keys

- If your configuration sets a timezone, search and replace `timezone: America/Los_Angeles` with the following two lines:

```yaml
    environment:
      TZ: "America/Los_Angeles"
```

- If your configuration modifies $PATH, add the path to your `.bashrc` file and replace 

```yaml
    environment:
      PATH: "/path/to/foo/bin:$PATH"
```

With the following to load it into your shell (the file $BASH_ENV already exists and has a random name in /tmp):

```yaml
    steps:
      - run: echo 'export PATH=/path/to/foo/bin:$PATH' >> $BASH_ENV 
      - run: some_program_inside_bin
```

- Search and replace the `hosts:` key, for example:

```yaml
hosts:
    circlehost: 127.0.0.1
```

With an appropriate `run` Step, for example:

```yaml
    steps:
      - run: echo 127.0.0.1 circlehost | sudo tee -a /etc/hosts
```


- Search and replace the `dependencies:`, `database`, or `test` and `override:` lines, for example:

```yaml
dependencies:
  override:
    - <installed-dependency>
```

Is replaced with:

```yaml
      - run:
          name: <name>
          command: <installed-dependency>
```

- Search and replace the `cache_directories:` key:

```yaml
  cache_directories:
    - "vendor/bundle"
```

With the following, nested under `steps:` and customizing for your application as appropriate:

```yaml
     - save_cache:
        key: dependency-cache
        paths:
          - vendor/bundle
```

- Add a `restore_cache:` key nested under `steps:`.

- Search and replace `deployment:` with the following, nested under `steps`:

```yaml
     - deploy:
```

## Validate YAML

When you have all the sections in `.circleci/config.yml` we recommend that you check that your YAML syntax is well-formed using a tool such as <http://codebeautify.org/yaml-validator>. Then, use the `circleci` CLI to validate that the new configuration is correct with regard to the CircleCI 2.0 schema. See the [Using the CircleCI Command Line Interface (CLI)]({{ site.baseurl }}/2.0/local-jobs/) document for instructions. Fix up any issues and commit the updated `.circleci/config.yml` file. When you push a commit the job will start automatically and you can monitor it in the CircleCI app.

## Next Steps
{:.no_toc}

- See the [Tips for Migrating from 1.0 to 2.0]({{ site.baseurl }}/2.0/migration/)
- Refer the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for examples of deployment.
- Refer to the [Specifying Container Images]({{ site.baseurl }}/2.0/executor-types/) document for more information about Docker and Machine images in CircleCI 2.0.
- Refer to the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) document for details on the exact syntax of CircleCI 2.0 `jobs` and `steps` and all available options.
