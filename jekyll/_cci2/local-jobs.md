---
layout: classic-docs
title: "Using the CircleCI Command Line Interface (CLI)"
short-title: "Using the CircleCI Command Line Interface (CLI)"
description: "How to run local jobs with the CLI"
categories: [troubleshooting]
order: 10
---

*[Build Environments]({{ site.baseurl }}/2.0/build/) > Using the CircleCI Command Line Interface (CLI)*

The following sections describe useful tools for validating and debugging your configuration:

* TOC
{:toc}

## CircleCI Command Line Interface (CLI) Overview

The `circleci` commands enable you to reproduce the CircleCI environment locally and run jobs as if they were running on the hosted application for more efficient debugging and configuration in the initial setup phase. 

You can also run `circleci` commands in your `config.yml` file for jobs that use the primary container image. This is particularly useful for globbing or splitting tests among containers. 

**Note:** The CLI does not yet support Workflows.

### Installing the CLI Locally 

1. Install and configure Docker by using the [docker installation instructions](https://docs.docker.com/engine/installation/).

2. To install the CLI, run the following command:

```
$ curl -o /usr/local/bin/circleci https://circle-downloads.s3.amazonaws.com/releases/build_agent_wrapper/circleci && chmod +x /usr/local/bin/circleci
```

The CLI, `circleci`, is downloaded to the `/usr/local/bin` directory. If you do not have write permissions for `/usr/local/bin`, you might need to run the above commands with `sudo`. The CLI automatically checks for updates and will prompt you if one is available. 

### Validating 2.0 YAML Syntax

1. Type `circleci` with one of six available commands (`build`, `config`, `help`, `step`, `tests`, and `version`) followed by a valid flag. For example:
```
$ circleci config validate -c .circleci/config.yml
```
The config validate command checks your local config.yml file for syntax errors.

**Note**: Local jobs don’t cache dependencies. You may want to comment out dependency sections if you are testing YAML syntax. Or, as in this example, use the `-c` flag to specify a local `config.yml` file that doesn’t pull in large dependencies.

## Validate Every Configuration Change

To catch CircleCI config errors as you build your full `config.yml` file, it is possible create a Git pre-commit hook to validate `~/.circleci/config.yml` that, when pushing to git, will run the 
`circleci config validate` command that is available to every build. 

Check out [this blog post](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/) about creating the Git hook.


### Running A Build

To run your build, navigate to your repo and run `circleci build`.

**Note:** If your _config.yml_ uses Workflows and has a job named `build`, only that `build` job will run. If you are using Workflows and have no jobs named `build`, the CLI will not be able to run your project locally.

### Troubleshooting Container Configurations Locally

Test locally to quickly retry configurations such as connecting on different ports or with different users. Jobs often have several containers that need to “talk” to each other. For example, you might want to locally test that a job can connect and create the relevant database with correct permissions on the correct port for a PostgreSQL container. Or you might be using a pre-built container, but you’re unsure if it has all the services you need, or if they're running in the way you hope.

### Cloning and Building an Environment Locally

If a project has been configured to run on CircleCI, you can simply clone the repo and run the `circleci build` command to get set up quickly with the same environment as your team.

### Using a specific checkout key for a local build

You can use a specific Git checkout key for your local build with `circleci build --checkout-key string`.  The default key  is "~/.ssh/id_rsa" on your local system.

### Updating the tool

You can update your local build tool with `circleci update`.

### Checking for available options

As we update the local tool regularly, there may be options for a command that aren't documented here.  You can check for these options with `circleci help <command>`.

## Limitations

Although running jobs locally with `circleci` is very helpful, there are some limitations.

### Machine Executor

You cannot use the machine executor in local jobs. This is because the machine executor requires an extra VM to run its jobs.

### Caching

Caching is not currently supported in local jobs. When you have either a `save_cache` or `restore_cache` step in your config, `circleci` will skip them and display a warning.

### Environment Variables

For security reasons, encrypted environment variables configured in the UI will not be exported into local builds. As an alternative, you can specify env vars to the CLI with the `-e` flag. See the output of `circleci help build` for more information.

### Relative Path for working_directory

The `working_directory:` key in your `.circleci/config.yml` file must not use a relative path for local jobs. If a relative path is used in `working_directory`, then `circleci` returns an error and immediately exits. To workaround this problem, change the value of the  `working_directory:` key in your `.circleci/config.yml` file to use an absolute path.

This happens because `circleci` mounts the current directory to `working_directory` in order to skip the checkout step, but Docker doesn't allow the container path to be relative for a volume. See [here](https://github.com/docker/docker/issues/4830) for more details.

We plan to remove this limitation in a future update.

## Using the CircleCI CLI non-locally

The CircleCI CLI is available in all CircleCI environments. For example, check out [Merging and Splitting Tests]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) for examples of using `circleci` commands in your `config.yml` file with a  remote hosted environment.
