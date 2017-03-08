---
layout: classic-docs2
title: "Local Jobs"
short-title: "Running Jobs Locally"
categories: [configuring-jobs]
order: 3
---

The **CircleCI CLI** reproduces the CircleCI environment locally and runs jobs as if they were running on CircleCI. The tool enables better debugging and faster configuration.

## Common Use Cases

### Debugging Configuration Syntax

Getting the syntax correct for your `config.yml` file can take some effort. Instead of having to push a commit and run a job on CircleCI to test this, local builds allow you to experiment locally since they only build what’s currently on your file system.

Note that local builds don’t cache dependencies. You may want to comment out dependency sections if you’re testing YAML syntax. Or use the `--config` flag to specify a local `config.yml` that doesn’t pull in large dependencies.

### Troubleshooting Container Configurations

Jobs have several containers that need to “talk” to each other. If you have a PostgreSQL container, you can quickly try different settings to ensure your job can connect and create the relevant database with correct permissions on the correct port. Or you might be using a pre-built container, but you’re unsure if it has all the services you need, or if they're running in the way you hope.

Local jobs allow you to quickly retry configurations such as connecting on different ports or with different users.

### Testing a New Project

Imagine you’re a new developer on a team. It could take some time to figure out how to build and test an application.

If the project has been configured to run on CircleCI, you can clone the repo, install the CircleCI CLI and run `circleci-cli build`. This is a great way to get set up quickly with the same environment as your team.

## Requirements

To use the CircleCI CLI, you’ll need to install and configure Docker. Please follow the [docker installation instructions](https://docs.docker.com/engine/installation/).

## Installation

To install the CLI, run:

```Bash
curl -o /usr/local/bin/circleci-cli https://circle-downloads.s3.amazonaws.com/releases/circleci-builder/circleci-builder-beta && chmod +x /usr/local/bin/circleci-cli
```

(If the current user doesn't have write permissions for `/usr/local/bin`, you might need to run the above commands with `sudo`.)

## Usage

Calling `circleci-cli` without any options displays usage information:

```Bash
$ circleci-cli
The CLI tool to be used in circleci.

Usage:
  circleci [flags]
  circleci [command]a

Available Commands:
  build       run a full build locally
  tests       collect and split files with tests
  version     output version info

Flags:
  -c, --config string   config file (default is $HOME/.circleci/agent.toml)
      --taskId string   TaskID
      --verbose         emit verbose logging output

Use 'circleci [command] --help' for more information about a command.
```

## Updating

The CLI tool automatically checks for updates and will prompt you if one is available.

## Using the CircleCI CLI non-locally

The CircleCI CLI is available in all CircleCI environments. For example, check out [Parallelism for Faster Jobs]({{ site.baseurl }}/2.0/parallelism-faster-jobs) to see how you use the tool to manage paralellism in a remoted hosted environment.
