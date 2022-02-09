---
layout: classic-docs
title: Using the CircleCI Local CLI
description: How to run local jobs with the CLI.
categories: [troubleshooting]
order: 10
version:
- Cloud
- Server v2.x
- Server v3.x
suggested:
  - title: CircleCI CLI tutorial
    link: https://circleci.com/blog/local-pipeline-development/
  - title: Validate your config using local CLI
    link: https://support.circleci.com/hc/en-us/articles/360006735753?input_string=how+to+validate+config+before+pushing
  - title: Check your CircleCI installation
    link: https://support.circleci.com/hc/en-us/articles/360011235534?input_string=how+to+validate+config
  - title: Troubleshoot CLI errors
    link: https://support.circleci.com/hc/en-us/articles/360047644153?input_string=cli
---

## Overview
{: #overview }

The CircleCI CLI is a command line interface that leverages many of CircleCI's
advanced and powerful tools from the comfort of your terminal. Some of the
things you can do with the CircleCI CLI include:

- Debug and validate your CI config
- Run jobs locally (currently unsupported on Windows)
- Query CircleCI's API
- Create, publish, view and manage orbs
- Managing contexts

This document covers the installation and usage of the CircleCI CLI tool.

**Note:**
this CLI is not available on CircleCI server v2.x installations but the
legacy CLI [is supported](#using-the-cli-on-circleci-server-v2x).

* TOC
{:toc}

## Installation
{: #installation }

There are multiple installation options for the CircleCI CLI.

**Note**: If you have already installed the CLI prior to October 2018 you may need to do an extra one-time step to switch to the new CLI. See [upgrading instructions below](#updating-the-legacy-cli).

For the majority of installations, we recommend one of the following package managers to install the CircleCI CLI:

### Install with Snap (Linux)
{: #install-with-snap-linux }

The following commands will install the CircleCI CLI, Docker, and the security and auto-update features that come along with [Snap packages](https://snapcraft.io/).

```shell
sudo snap install docker circleci
sudo snap connect circleci:docker docker
```

**Note:** With snap packages, the docker command will use the Docker snap, not any version of Docker you may have previously installed. For security purposes, snap packages can only read/write files from within $HOME.

### Install with Homebrew (macOS)
{: #install-with-homebrew-macos }

If you’re using [Homebrew](https://brew.sh/) with macOS, you can install the CLI with the following command:

```shell
brew install circleci
```

**Note**: If you already have Docker for Mac installed, use `brew install --ignore-dependencies circleci`.

### Install with Chocolatey (Windows)
{: #install-with-chocolatey-windows }

For Windows users, we provide a [Chocolatey](https://chocolatey.org/) package:

```shell
choco install circleci-cli -y
```

### Alternative installation method
{: #alternative-installation-method }

**Mac and Linux:**

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | bash
```

By default, the CircleCI CLI tool will be installed to the `/usr/local/bin` directory. If you do not have write permissions to `/usr/local/bin`, you may need to run the above command with `sudo` after the pipe and before `bash`. Alternatively, you can install to an alternate location by defining the `DESTDIR` environment variable when invoking bash:

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | DESTDIR=/opt/bin bash
```

### Manual install
{: #manual-download }

You can visit the [GitHub releases](https://github.com/CircleCI-Public/circleci-cli/releases) page for the CLI to manually download and install. This approach is best if you would like the installed CLI to be in a specific path on your system.

## Updating the CLI
{: #updating-the-cli }

You can update to the newest version of the CLI using the following command: `circleci update`. If you would just like to check for updates manually (and not install them) use the command: `circleci update check`.

### Updating the legacy CLI
{: #updating-the-legacy-cli }
{:.no_toc}

The newest version of the CLI is a [CircleCI-Public open source project](https://github.com/CircleCI-Public/circleci-cli). If you have the [old CLI installed](https://github.com/circleci/local-cli), run the following commands to update and switch to the new CLI:

```shell
circleci update
circleci switch
```

This command may prompt you for `sudo` if your user doesn't have write permissions to the install directory, `/usr/local/bin`.

## Configuring the CLI
{: #configuring-the-cli }

Before using the CLI you need to generate a CircleCI API Token from the [Personal API Token tab](https://app.circleci.com/settings/user/tokens). After you get your token, configure the CLI by running:

```shell
circleci setup
```

The set up process will prompt you for configuration settings. If you are using the CLI with
circleci.com, use the default CircleCI Host. If you are using CircleCI server, change the value to your installation address (for example, circleci.your-org.com).

## Validate a CircleCI config
{: #validate-a-circleci-config }

You can avoid pushing additional commits to test your config.yml by using the CLI to validate your config locally.

To validate your config, navigate to a directory with a `.circleci/config.yml` file and run:

```shell
circleci config validate
# Config file at .circleci/config.yml is valid
```

If you are working with [Orbs](https://circleci.com/orbs/) you can also validate your orb:

```shell
circleci orb validate /tmp/my_orb.yml
```

Where the above command will look for an orb called `my_orb.yml` in the `/tmp` folder of the directory in which you ran the command.

## Orb development kit
{: #orb-development-kit }

The [orb development kit]({{ site.baseurl }}/2.0/orb-author/#orb-development-kit) refers to a suite of tools that work together to simplify the orb development process, with automatic testing and deployment on CircleCI. Two CLI commands are included in the orb development kit: [`circleci orb init`](https://circleci-public.github.io/circleci-cli/circleci_orb_init.html) and [`circleci orb pack`](https://circleci-public.github.io/circleci-cli/circleci_orb_pack.html). For more information on the orb packing, see the [Orbs Concepts guide]({{site.baseurl}}/2.0/orb-concepts/#orb-packing).

## Packing a config
{: #packing-a-config }

The CLI provides a `circleci config pack` command (separate to `circleci orb pack` described above), allowing you to create a single YAML file from several separate files. The `pack` command implements [FYAML](https://github.com/CircleCI-Public/fyaml), a scheme for breaking YAML documents across files in a directory tree. This is particularly useful for breaking up source code for large orbs and allows custom organization of your orbs' YAML configuration. `circleci config pack` converts a filesystem tree into a single YAML file based on directory structure and file contents. How you **name** and **organize** your files when using the `pack` command will determine the final outputted `orb.yml`. Consider the following example folder structure:

```shell
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
```shell
$ circleci config pack your-orb-source
```

```yaml
# Contents of @orb.yml appear here
commands:
  foo:
    # contents of foo.yml appear here
jobs:
  bar:
    # contents of bar.yml appear here
```
{% endraw %}

### Other config packing capabilities
{: #other-config-packing-capabilities }
{:.no_toc}

A file beginning with `@` will have its contents merged into its parent folder level. This can be useful at the top level of an orb, when one might want generic `orb.yml` to contain metadata, but not to map into an `orb` key-value pair.

Thus:

{% raw %}
```shell
$ cat foo/bar/@baz.yml
{baz: qux}
```
{% endraw %}

Is mapped to:

```yaml
bar:
  baz: qux
```


### An example packed config.yml
{: #an-example-packed-configyml }
{:.no_toc}

See the [CircleCI Orbs GitHub topic tag](https://github.com/search?q=topic%3Acircleci-orbs+org%3ACircleCI-Public&type=Repositories) to see examples of orbs written using multiple YAML source files. `circleci config pack` is typically run as part of these projects' CI/CD workflows, to prepare orb source code for publishing.

## Processing a config
{: #processing-a-config }

Running `circleci config process` validates your config, but will also display
expanded source configuration alongside your original config (useful if you are using orbs).

Consider the following example configuration that uses the [`node`](https://circleci.com/developer/orbs/orb/circleci/node) orb:

```yml
version: 2.1

orbs:
  node: circleci/node@4.7.0

workflows:
  version: 2
  example-workflow:
      jobs:
        - node/test
```

Running `circleci config process .circleci/config.yml` will output the following
(which is a mix of the expanded source and the original config commented out).

{% raw %}
```yml
# Orb 'circleci/node@4.7.0' resolved to 'circleci/node@4.7.0'
version: 2
jobs:
  node/test:
    docker:
    - image: cimg/node:13.11.0
    steps:
    - checkout
    - run:
        command: |
          if [ ! -f "package.json" ]; then
            echo
            echo "---"
            echo "Unable to find your package.json file. Did you forget to set the app-dir parameter?"
            echo "---"
            echo
            echo "Current directory: $(pwd)"
            echo
            echo
            echo "List directory: "
            echo
            ls
            exit 1
          fi
        name: Checking for package.json
        working_directory: ~/project
    - run:
        command: |
          if [ -f "package-lock.json" ]; then
            echo "Found package-lock.json file, assuming lockfile"
            ln package-lock.json /tmp/node-project-lockfile
          elif [ -f "npm-shrinkwrap.json" ]; then
            echo "Found npm-shrinkwrap.json file, assuming lockfile"
            ln npm-shrinkwrap.json /tmp/node-project-lockfile
          elif [ -f "yarn.lock" ]; then
            echo "Found yarn.lock file, assuming lockfile"
            ln yarn.lock /tmp/node-project-lockfile
          fi
          ln package.json /tmp/node-project-package.json
        name: Determine lockfile
        working_directory: ~/project
    - restore_cache:
        keys:
        - node-deps-{{ arch }}-v1-{{ .Branch }}-{{ checksum "/tmp/node-project-package.json" }}-{{ checksum "/tmp/node-project-lockfile" }}
        - node-deps-{{ arch }}-v1-{{ .Branch }}-{{ checksum "/tmp/node-project-package.json" }}-
        - node-deps-{{ arch }}-v1-{{ .Branch }}-
    - run:
        command: "if [[ ! -z \"\" ]]; then\n  echo \"Running override package installation command:\"\n  \nelse\n  npm ci\nfi\n"
        name: Installing NPM packages
        working_directory: ~/project
    - save_cache:
        key: node-deps-{{ arch }}-v1-{{ .Branch }}-{{ checksum "/tmp/node-project-package.json" }}-{{ checksum "/tmp/node-project-lockfile" }}
        paths:
        - ~/.npm
    - run:
        command: npm run test
        name: Run NPM Tests
        working_directory: ~/project
workflows:
  version: 2
  example-workflow:
    jobs:
    - node/test

# Original config.yml file:
# version: 2.1
#
# orbs:
#   node: circleci/node@4.7.0
#
# workflows:
#   version: 2
#   example-workflow:
#       jobs:
#         - node/test

```
{% endraw %}

## Run a job in a container on your machine
{: #run-a-job-in-a-container-on-your-machine }

### Overview
{: #overview }
{:.no_toc}

The CLI enables you to run jobs in your config via Docker. This can be useful to run tests before pushing config changes or debugging your build process without impacting your build queue.

### Prerequisites
{: #prerequisites }
{:.no_toc}

You will need to have [Docker](https://www.docker.com/products/docker-desktop) installed on your system and have installed the most recent version of the CLI tool. You will also need to have a project with a valid `.circleci/config.yml` file in it.

### Running a job
{: #running-a-job }
{:.no_toc}

The CLI allows you to run a single job from CircleCI on your desktop using Docker.

```shell
$ circleci local execute --job JOB_NAME
```

If your CircleCI config is set to version 2.1 or greater, you must first export your config to `process.yml`, and specify it when executing:

```shell
circleci config process .circleci/config.yml > process.yml
circleci local execute -c process.yml --job JOB_NAME
```

Let's run an example build on our local machine on one of CircleCI's demo applications:

```shell
git clone https://github.com/CircleCI-Public/circleci-demo-go.git
cd circleci-demo-go
circleci local execute --job build
```

The commands above will run the entire _build_ job (only jobs, not workflows, can be run locally). The CLI will use Docker to pull down the requirements for the build and will then execute your CI steps locally. In this case, Golang and Postgres docker images are pulled down, allowing the build to install dependencies, run the unit tests, test the service is running and so on.


### Limitations of running jobs locally
{: #limitations-of-running-jobs-locally }
{:.no_toc}

Although running jobs locally with `circleci` is very helpful, there are some limitations.

**Machine Executor**

You cannot use the machine executor in local jobs. This is because the machine executor requires an extra VM to run its jobs.

**Add SSH Keys**

It is currently not possible to add SSH keys using the `add_ssh_keys` CLI command.

**Workflows**

The CLI tool does not provide support for running workflows. By nature, workflows leverage running jobs concurrently on multiple machines allowing you to achieve faster, more complex builds. Because the CLI is only running on your machine, it can only run single **jobs** (which make up parts of a workflow).

**Caching and Online-only Commands**

Caching is not currently supported in local jobs. When you have either a `save_cache` or `restore_cache` step in your config, `circleci` will skip them and display a warning.

Further, not all commands may work on your local machine as they do online. For example, the Golang build reference above runs a `store_artifacts` step, however, local builds won't upload artifacts. If a step is not available on a local build you will see an error in the console.

**Environment Variables**

For security reasons, encrypted environment variables configured in the UI will not be imported into local builds. As an alternative, you can specify env vars to the CLI with the `-e` flag. See the output of `circleci help build` for more information. If you have multiple environment variables, you must use the flag for each variable, for example, `circleci build -e VAR1=FOO -e VAR2=BAR`.

## Test splitting
{: #test-splitting }

The CircleCI CLI is also used for some advanced features during job runs, for example [test splitting](https://circleci.com/docs/2.0/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests) for build time optimization.

## Using the CLI on CircleCI server v2.x
{: #using-the-cli-on-circleci-server-v2-x }

Currently, only the legacy CircleCI CLI is available to run on server v2.x.
installations of CircleCI. To install the legacy CLI on macOS and other Linux Distros:

1. Install and configure Docker by using the [docker installation instructions](https://docs.docker.com/install/).
2. To install the CLI, run the following command:

```shell
$ curl -o /usr/local/bin/circleci https://circle-downloads.s3.amazonaws.com/releases/build_agent_wrapper/circleci && chmod +x /usr/local/bin/circleci
```

The CLI, `circleci`, is downloaded to the `/usr/local/bin` directory. If you do not have write permissions for `/usr/local/bin`, you might need to run the above commands with `sudo`. The CLI automatically checks for updates and will prompt you if one is available.

## Context management
{: #context-management }

[Contexts]({{site.baseurl}}/2.0/contexts) provide a mechanism for securing and
sharing environment variables across projects. While contexts have been
traditionally managed on the CircleCI web application, the CircleCI CLI provides
an alternative method for managing the usage of contexts in your projects. With
the CLI, you can execute several context-oriented commands:

- *create* - Create a new context
- *delete* - Delete the named context
- *list* - List all contexts
- *remove-secret* - Remove an environment variable from the named context
- *show* - Show a context
- *store-secret* - Store a new environment variable in the named context. The
  value is read from stdin.

The above list are "sub-commands" in the CLI, which would be executed like so:

```shell
circleci context create

# Returns the following:
List all contexts

Usage:
  circleci context list <vcs-type> <org-name> [flags]
```

Many commands will require that you include additional information as indicated
by the parameters delimited by `< >`.

As with most of the CLI's commands, you will need to have properly authenticated
your version of the CLI with a token to enable performing context related
actions.

## Uninstallation
{: #uninstallation }

Commands for uninstalling the CircleCI CLI will vary depending on what your
installation method was using respectively:

- **curl installation command**: Remove the `circleci` executable from `usr/local/bin`
- **Homebrew installation for Mac**: Run `brew uninstall circleci`
- **Snap installation on Linux**: Run `sudo snap remove circleci`
