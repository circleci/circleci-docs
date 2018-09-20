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

The `circleci` commands enable you to reproduce the CircleCI environment locally and run jobs as if they were running on the hosted application for more efficient debugging and configuration in the initial setup phase. 

You can also run `circleci` commands in your [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file for jobs that use the primary container image. This is particularly useful for globbing or splitting tests among containers.

**Note:** There are currently two versions of the CLI that you may install. The Local CLI available at [https://circle-downloads.s3.amazonaws.com/releases/build_agent_wrapper/circleci] is an older version that does not yet support Workflows.
The Local CLI version available at [https://github.com/CircleCI-Public/circleci-cli] has a different set of options, some of which are still in active development, and will be the replacement for the old CLI.

## Updating to the CircleCI-Public CLI

The CLI upgrade provides additional functionality through a totally new CLI developed as a [CircleCI-Public open source project](https://github.com/CircleCI-Public/circleci-cli). If you already have installed the circle-downloads CLI previously, run the following commands to update and switch:

```
circleci update
circleci switch
```

This command may prompt you for `sudo` if your user doesn't have write permissions to the install directory, `/usr/local/bin`.

## Installing the CircleCI-Public CLI From Scratch on macOS and Linux Distros

If you haven't already installed `circleci` on your machine, run the following command to install the CircleCI-Public CLI:

```
curl https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh \
	--fail --show-error | bash
```

The CLI, `circleci`, is downloaded to the `/usr/local/bin` directory.

If you do not have write permissions for `/usr/local/bin`, you might need to run the above commands with `sudo`.

## Manual download

You can visit the [Github releases](https://github.com/CircleCI-Public/circleci-cli/releases) page for the CLI to manually download and install. This approach is best if you would like the installed CLI to be in a specific path on your system.

### Configuring the CLI
{:.no_toc}

You may first need to generate a CircleCI API Token from the [Personal API Token tab](https://circleci.com/account/api).

```
$ circleci setup
```

If you are using this tool on `circleci.com`, accept the provided default `CircleCI API End Point`. If you are using it on you private installation of CircleCI with an administrative console, change the value to your installation address (for example, `circleci.my-org.com`).


## Validate A Build Config

To ensure that the tool is installed, you can use it to validate a build config file.

1. Change to the root directory of your CIrcleCI project repository.

2. Run the following command:

```
$ circleci config validate
Config file at .circleci/config.yml is valid
```

## Run a Job in a Container on the Local Machine

```
$ circleci local execute [flags]
```

Flags

```
      --branch string         Git branch
      --checkout-key string   Git Checkout key (default "~/.ssh/id_rsa")
  -c, --config string         config file (default ".circleci/config.yml")
  -e, --env -e VAR=VAL        Set environment variables, e.g. -e VAR=VAL
  -h, --help                  help for execute
      --index int             node index of parallelism
      --job string            job to be executed (default "build")
      --node-total int        total number of parallel nodes (default 1)
      --repo-url string       Git Url
      --revision string       Git Revision
      --skip-checkout         use local path as-is (default true)
  -v, --volume strings        Volume bind-mounting
```  

## Installing the circle-downloads Local CLI on macOS and Linux Distros

1. Install and configure Docker by using the [docker installation instructions](https://docs.docker.com/engine/installation/).

2. To install the CLI, run the following command:

```
$ curl -o /usr/local/bin/circleci https://circle-downloads.s3.amazonaws.com/releases/build_agent_wrapper/circleci && chmod +x /usr/local/bin/circleci
```

The CLI, `circleci`, is downloaded to the `/usr/local/bin` directory. If you do not have write permissions for `/usr/local/bin`, you might need to run the above commands with `sudo`. The CLI automatically checks for updates and will prompt you if one is available. 

### [Alternative] Installing Ubuntu 16.04 or Ubuntu 17.04+
{:.no_toc}

With Ubuntu, you can optionally install by using Snap. The following commands give you the circle-downloads Local CLI, Docker, and the security and auto-update features that come along with [Snap packages](https://www.ubuntu.com/desktop/snappy).

```
sudo snap install docker circleci
sudo snap connect circleci:docker docker
```

**Note:** With snap packages, the `docker` command will use the Docker snap, not any version of Docker you may have previously installed. For security purposes, snap packages can only read/write files from within `$HOME`.

### [Alternative] Installing on macOS via Homebrew
{:.no_toc}

If you're using [Homebrew](https://brew.sh/) with macOS, you can install the circle-downloads Local CLI with the following command:

```
brew install circleci
```

**Note:** This will install Docker from Homebrew even if Docker for Mac is installed.


### Validating 2.0 YAML Syntax with the circleci-downloads CLI
{:.no_toc}

1. Type `circleci` with one of six available commands (`build`, `config`, `help`, `step`, `tests`, and `version`) followed by a valid flag. For example:

```
$ circleci config validate -c .circleci/config.yml
```
The config validate command checks your local config.yml file for syntax errors.

***Note:*** Local jobs don’t cache dependencies. You may want to comment out dependency sections if you are testing YAML syntax. Or, as in this example, use the `-c` flag to specify a local `config.yml` file that doesn’t pull in large dependencies.

### Validate Every Configuration Change
{:.no_toc}

To catch CircleCI config errors as you build your full `config.yml` file, it is possible create a Git pre-commit hook to validate `~/.circleci/config.yml` that, when pushing to git, will run the 
`circleci config validate` command that is available to every build. 

Check out [this blog post](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/) about creating the Git hook.


### Running A Build
{:.no_toc}

To run your build, navigate to your repo and run `circleci build`.

**Note:** If your _config.yml_ uses Workflows and has a job named `build`, only that `build` job will run. If you are using Workflows and have no jobs named `build`, the CLI will not be able to run your project locally.

To run any job besides `build`,
add the `--job` flag,
followed by the name of the job.

```bash
$ circleci build --job test
```

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
