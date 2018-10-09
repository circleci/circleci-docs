---
layout: classic-docs
title: "Using the CircleCI Local CLI"
short-title: "Using the CircleCI Local CLI"
description: "How to run local jobs with the CLI"
categories: [troubleshooting]
order: 10
---

This document provides instructions for installing and using the CircleCI CLI. 

* TOC
{:toc}

## Overview
{:.no_toc}

The `circleci` command-line interface enables you to reproduce the CircleCI environment locally and run jobs as if they were running on the hosted application for more efficient debugging and configuration in the initial setup phase.

You can also run `circleci` commands in your [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file for jobs that use the primary container image. This is particularly useful for globbing or splitting tests among containers.

**Note:** If you installed the CLI prior to October 2018 you may need to do an
extra one-time step to switch to [the new CLI](https://github.com/CircleCI-Public/circleci-cli).
See upgrading and installation instructions below.

## Install

There are a few installation options.

### Updating to the new CLI
{:.no_toc}

The CLI upgrade provides additional functionality through a totally new CLI developed as a [CircleCI-Public open source project](https://github.com/CircleCI-Public/circleci-cli). If you have the old CLI installed, run the following commands to update and switch to the new CLI:

```
circleci update
circleci switch
```

This command may prompt you for `sudo` if your user doesn't have write permissions to the install directory, `/usr/local/bin`.

### Installing the CircleCI CLI on macOS or Linux
{:.no_toc}

If you haven't already installed `circleci` on your machine, run the following command to install the CircleCI CLI:

```
curl https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh \
	--fail --show-error | bash
```

The CLI, `circleci`, is downloaded to the `/usr/local/bin` directory.

If you do not have write permissions for `/usr/local/bin`, you might need to run the above commands with `sudo`.

### [Alternative] Install with snap 
{:.no_toc}

The following commands will install the CircleCI CLI, Docker, and the security and auto-update features that come along with [Snap packages](https://snapcraft.io/).

```
sudo snap install docker circleci
sudo snap connect circleci:docker docker
```

**Note:** With snap packages, the `docker` command will use the Docker snap, not any version of Docker you may have previously installed. For security purposes, snap packages can only read/write files from within `$HOME`.

### [Alternative] Install on macOS with Homebrew
{:.no_toc}

If you're using [Homebrew](https://brew.sh/) with macOS, you can install the CLI with the following command:

```
brew install circleci
```

**Note:** If you already have Docker for Mac installed, use `brew install --ignore-dependencies circleci`.

### [Alternative] Manual download
{:.no_toc}

You can visit the [Github releases](https://github.com/CircleCI-Public/circleci-cli/releases) page for the CLI to manually download and install. This approach is best if you would like the installed CLI to be in a specific path on your system.


## Configuring the CLI

Before using the CLI you need to generate a CircleCI API Token from the [Personal API Token tab](https://circleci.com/account/api). Once you have a token configure the CLI by running:

```
$ circleci setup
```

Setup will prompt you for configuration settings. If you are using the CLI with `circleci.com`, use the default `CircleCI Host`. If you are using CircleCI Enterprise change the value to your installation address (for example, `circleci.my-org.com`).


## Validate A CircleCI config

To ensure that the CLI is configured correctly you can use it to validate a CircleCI config file.

1. Change to the root directory of your CircleCI project repository.

2. Run the following command:

```
$ circleci config validate
Config file at .circleci/config.yml is valid
```

### Run validate using git hooks
{:.no_toc}

To catch CircleCI config errors as you build your full `config.yml` file, it is possible create a Git pre-commit hook to validate `~/.circleci/config.yml` that, before pushing to github, will run the `circleci config validate` command that is available to every build. 

Check out [this blog post](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/) about creating the Git hook.


## Run a Job in a Container on the Local Machine

The CLI allows you to run a single job from the CircleCI on your desktop using docker. 

```
$ circleci local execute --job JOB_NAME
```

**Note:** This command will only run a single job, it does not run a workflow.

### Troubleshooting Container Configurations Locally
{:.no_toc}

Test locally to quickly retry configurations such as connecting on different ports or with different users. Jobs often have several containers that need to “talk” to each other. For example, you might want to locally test that a job can connect and create the relevant database with correct permissions on the correct port for a PostgreSQL container. Or you might be using a pre-built container, but you’re unsure if it has all the services you need, or if they're running in the way you hope.

### Cloning and Building an Environment Locally
{:.no_toc}

If a project has been configured to run on CircleCI, you can simply clone the repo and run the `circleci build` command to get set up quickly with the same environment as your team.

### Using a specific checkout key for a local build
{:.no_toc}

You can use a specific Git checkout key for your local build with `circleci build --checkout-key string`.  The default key  is "~/.ssh/id_rsa" on your local system.

### Updating
{:.no_toc}

You can update the Local CLI internal engine, build agent, with `circleci update`. If the Local CLI was installed via cURL instead of a package manager, this will also update the CLI itself.

### Checking for available options
{:.no_toc}

As we update the local tool regularly, there may be options for a command that aren't documented here.  You can check for these options with `circleci help <command>`.

## Limitations

Although running jobs locally with `circleci` is very helpful, there are some limitations.

### Machine Executor
{:.no_toc}

You cannot use the machine executor in local jobs. This is because the machine executor requires an extra VM to run its jobs.

### Caching
{:.no_toc}

Caching is not currently supported in local jobs. When you have either a `save_cache` or `restore_cache` step in your config, `circleci` will skip them and display a warning.

### Environment Variables
{:.no_toc}

For security reasons, encrypted environment variables configured in the UI will not be exported into local builds. As an alternative, you can specify env vars to the CLI with the `-e` flag. See the output of `circleci help build` for more information. If you have multiple environment variables, you must use the flag for each variable, for example, `circleci build -e VAR1=FOO -e VAR2=BAR`.

## Using the Local CLI Within CircleCI Convenience Images

The Local CLI is available in CircleCI [Docker convenience images]({{ site.baseurl }}/2.0/circleci-images/), the `machine` executor, and the `macos` executor. For example, check out [Merging and Splitting Tests]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) for examples of using `circleci` commands in your `config.yml` file with a remote hosted environment.
