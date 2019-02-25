---
layout: classic-docs
title: "Using the CircleCI Local CLI"
short-title: "Using the CircleCI Local CLI"
description: "How to run local jobs with the CLI"
categories: [troubleshooting]
order: 10
---

## Overview

The CircleCI CLI is a command line interface that leverages many of CircleCI's
advanced and powerful tools from the comfort of your terminal. Some of the
things you can do with the CircleCI CLI include: 

- Debug and validate your CI config 
- Run jobs locally 
- Query CircleCI's API
- Create, publish, view and manage Orbs

This document will cover the installation and usage of the CLI tool.

* TOC
{:toc}

## Installation

There are multiple installation options for the CLI.

### Quick Installation

**Note**: If you have already installed the CLI prior to October 2018 you may need to do an extra one-time step to switch to the new CLI. See [upgrading instructions below](#updating-the-legacy-cli).

For the majority of installations, the following commands will get you up and running with the CircleCI CLI:

**Mac and Linux:**

```sh
curl -fLSs https://circle.ci/cli | bash
```

By default, the CircleCI CLI tool will be installed to the `/usr/local/bin` directory. If you do not have write permissions to `/usr/local/bin`, you may need to run the above command with `sudo`. Alternatively, you can install to an alternate location by defining the `DESTDIR` environment variable when invoking bash:

```sh
curl -fLSs https://circle.ci/cli | DESTDIR=/opt/bin bash
```

### Alternative Installation Methods

There are several alternative installation methods for the CircleCI CLI. Read on if you need to customize your installation, or are running into issues with the quick installation above.

#### Install with Snap
{:.no_toc}

The following commands will install the CircleCI CLI, Docker, and the security and auto-update features that come along with [Snap packages](https://snapcraft.io/).

```sh
sudo snap install docker circleci
sudo snap connect circleci:docker docker
```

**Note:** With snap packages, the docker command will use the Docker snap, not any version of Docker you may have previously installed. For security purposes, snap packages can only read/write files from within $HOME.

#### Install With Homebrew
{:.no_toc}

If you’re using [Homebrew](https://brew.sh/) with macOS, you can install the CLI with the following command:

```sh
brew install circleci
```

**Note**: If you already have Docker for Mac installed, use `brew install --ignore-dependencies circleci`.

### Manual Download

You can visit the [Github releases](https://github.com/CircleCI-Public/circleci-cli/releases) page for the CLI to manually download and install. This approach is best if you would like the installed CLI to be in a specific path on your system.

## Updating The CLI

You can update to the newest version of the CLI using the following command: `circleci update`. If you would just like to check for updates manually (and not install them) use the command: `circleci update check`.

### Updating the Legacy CLI
{:.no_toc}

The newest version of the CLI is a [CircleCI-Public open source project](https://github.com/CircleCI-Public/circleci-cli). If you have the [old CLI installed](https://github.com/circleci/local-cli), run the following commands to update and switch to the new CLI:

```sh
circleci update 
circleci switch
```

This command may prompt you for `sudo` if your user doesn't have write permissions to the install directory, `/usr/local/bin`.

## Configuring The CLI

Before using the CLI you need to generate a CircleCI API Token from the [Personal API Token tab](https://circleci.com/account/api). After you get your token, configure the CLI by running:

```sh
circleci setup
```

Setup will prompt you for configuration settings. If you are using the CLI with
circleci.com, use the default CircleCI Host. If you are using CircleCI installed
on your own server or private cloud, change the value to your installation address (for example, circleci.my-org.com).

## Validate A CircleCI Config

You can avoid pushing additional commits to test your config.yml by using the CLI to validate your config locally.

To validate your config, navigate to a directory with a `.circleci/config.yml` file and run:

```sh
circleci config validate
# Config file at .circleci/config.yml is valid
```


If you are working with [Orbs](https://circleci.com/orbs/) you can also validate your orb:

```sh
circleci orb validate /tmp/my_orb.yml
```

Where the above command will look for an orb called `my_orb.yml` in the `/tmp` folder of the directory in which you ran the command.

## Packing A Config

The CLI provides a `pack` command, allowing you to create a single YAML file from several separate files. This is particularly useful for breaking up source code for large orbs and allows custom organization of your orbs' YAML configuration. `circleci config pack` converts a filesystem tree into a single YAML file based on directory structure and file contents. How you **name** and **organize** your files when using the `pack` command will determine the final outputted `orb.yml`. Consider the following example folder structure:

```sh
$ tree
.
└── your-orb-source
    ├── @orb.yml
    ├── commands
    │   └── foo.yml
    └── jobs
        └── bar.yml

3 directories, 3 files
```

The unix `tree` command is great for printing out folder structures. In the
example tree structure above, the `pack` command will  map the folder names and
file names to **YAML keys**  and the file contents as the **values** to those keys. Let's `pack` up the example folder from above:


{% raw %}
```sh
$ circleci config pack your-orb-source
```

```yaml
# contents of @orb.yml appear here
commands:
  foo:
    # contents of foo.yml appear here
jobs:
  bar:
    # contents of bar.yml appear here
```
{% endraw %}

### Other Config Packing Capabilities
{:.no_toc}

A file beginning with `@` will have its contents merged into its parent folder level. This can be useful at the top level of an orb, when one might want generic `orb.yml` to contain metadata, but not to map into an `orb` key-value pair.

Thus:

{% raw %}
```sh
$ cat foo/bar/@baz.yml
{baz: qux}
```
{% endraw %}

Is mapped to:

```yaml
bar: 
  baz: qux
```


### An Example Packed Config.yml
{:.no_toc}

See the [CircleCI Orbs GitHub topic tag](https://github.com/search?q=topic%3Acircleci-orbs+org%3ACircleCI-Public&type=Repositories) to see examples of orbs written using multiple YAML source files. `circleci config pack` is typically run as part of these projects' CI/CD workflows, to prepare orb source code for publishing.

## Processing A Config

Running `circleci config process` validates your config, but will also display
expanded source configuration alongside your original config (useful if you are using orbs).

Consider the example configuration that uses the `hello-build` orb:

```
version: 2.1

orbs:
    hello: circleci/hello-build@0.0.5

workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```

Running `circleci config process .circleci/config.yml` will output the following
(which is a mix of the expanded source and the original config commented out).

{% raw %}
```sh
# Orb 'circleci/hello-build@0.0.5' resolved to 'circleci/hello-build@0.0.5'
version: 2
jobs:
  hello/hello-build:
    docker:
    - image: circleci/buildpack-deps:curl-browsers
    steps:
    - run:
        command: echo "Hello ${CIRCLE_USERNAME}"
    - run:
        command: |-
          echo "TRIGGERER: ${CIRCLE_USERNAME}"
          echo "BUILD_NUMBER: ${CIRCLE_BUILD_NUM}"
          echo "BUILD_URL: ${CIRCLE_BUILD_URL}"
          echo "BRANCH: ${CIRCLE_BRANCH}"
          echo "RUNNING JOB: ${CIRCLE_JOB}"
          echo "JOB PARALLELISM: ${CIRCLE_NODE_TOTAL}"
          echo "CIRCLE_REPOSITORY_URL: ${CIRCLE_REPOSITORY_URL}"
        name: Show some of the CircleCI runtime env vars
    - run:
        command: |-
          echo "uname:" $(uname -a)
          echo "arch: " $(arch)
        name: Show system information
workflows:
  Hello Workflow:
    jobs:
    - hello/hello-build
  version: 2

# Original config.yml file:
# version: 2.1
# 
# orbs:
#     hello: circleci/hello-build@0.0.5
# 
# workflows:
#     \"Hello Workflow\":
#         jobs:
#           - hello/hello-build

```
{% endraw %}

## Run A Job In A Container On Your Machine

### Overview
{:.no_toc}

The CLI enables you to run jobs in your config via Docker. This can be useful to run tests before pushing config changes or debugging your build process without impacting your build queue.

### Prerequisites
{:.no_toc}

You will need to have [Docker](https://www.docker.com/products/docker-desktop) installed on your system and have installed the most recent version of the CLI tool. You will also need to have a project with a valid `.circleci/config.yml` file in it.

### Running a Job
{:.no_toc}

The CLI allows you to run a single job from CircleCI on your desktop using Docker. 

```sh
$ circleci local execute --job JOB_NAME
```

Let's run an example build on our local machine on one of CircleCI's demo applications:

```sh
git clone https://github.com/CircleCI-Public/circleci-demo-go.git
cd circleci-demo-go
circleci local execute --job build
```

The commands above will run the entire _build_ job (only jobs, not workflows, can be run locally). The CLI will use Docker to pull down the requirements for the build and will then execute your CI steps locally. In this case, Golang and Postgres docker images are pulled down, allowing the build to install dependencies, run the unit tests, test the service is running and so on.


### Limitations of Running Jobs Locally
{:.no_toc}

Although running jobs locally with `circleci` is very helpful, there are some limitations.

**Machine Executor**

You cannot use the machine executor in local jobs. This is because the machine executor requires an extra VM to run its jobs.

**Workflows**

The CLI tool does not provide support for running workflows. By nature, workflows leverage running builds in parallel on multiple machines allowing you to achieve faster, more complex builds. Because the CLI is only running on your machine, it can only run single **jobs** (which make up parts of a workflow).

**Caching and Online-only Commands**

Caching is not currently supported in local jobs. When you have either a `save_cache` or `restore_cache` step in your config, `circleci` will skip them and display a warning.

Further, not all commands may work on your local machine as they do online. For example, the Golang build reference above runs a `store_artifacts` step, however, local builds won't upload artifacts. If a step is not available on a local build you will see an error in the console.

**Environment Variables**

For security reasons, encrypted environment variables configured in the UI will not be imported into local builds. As an alternative, you can specify env vars to the CLI with the `-e` flag. See the output of `circleci help build` for more information. If you have multiple environment variables, you must use the flag for each variable, for example, `circleci build -e VAR1=FOO -e VAR2=BAR`.


## Uninstallation

Commands for uninstalling the CircleCI CLI will vary depending on what your
installation method was using respectively:

- **curl installation command**: Remove the `circleci` executable from `usr/local/bin`
- **Homebrew installation for Mac**: Run `brew uninstall circleci`
- **Snap installation on Linux**: Run `sudo snap remove circleci`


