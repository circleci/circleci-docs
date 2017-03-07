---
layout: classic-docs2
title: "Local Builds"
short-title: "Local CircleCI Builder"
categories: [configuring-jobs]
order: 90
---

## What is the Local Builer tool for?

CircleCI 2.0's CLI reproduces the CircleCI build environment locally and runs builds as if they are running in CircleCI. The tool enables better debugging and faster configuration.

### 1. Getting a working `config.yml` configuration

Getting the syntax correct for your `config.yml` file can take a bit of effort. Instead of having to push a commit and build on CircleCI to test this, local builds allow you to experiment locally.

**Note:** local builds don't require that you commit changes to Git. The local build will build what's currently on your file system. So you can iterate quickly by making changes to files and rerunning your local build.

**Note 2:** local builds do not cache dependencies. So you may want to comment out dependency sections to speed things up while testing YAML syntax locally. Or use the `--config` flag to specify a local specific `config.yml` that doesn't pull in large dependencies.

### 2. Troubleshooting container configurations

Builds will have several containers that need to 'talk' to each other. For example you may have a PostgreSQL container. Sometimes it can take a bit of effort to ensure your build can connect and create the relevant database with correct permissions on the correct port.

Or you might be using a pre-built container, but you're not sure if it has all the services you need or if they're running in the way you hope. Local builds allow you to quickly retry configurations such as connecting on different ports or with different users.

### 3. Quickly testing a project that is new to you

Imagine you are a new developer on a team. It can take some time to work out how to build and test and application. If the project has been configured to run on CircleCI you can clone the repo, install CircleCI local build tool and simply run `circleci-builder build`. This is a great way to get up and running quickly with the same environment as your team mates.


## Requirements

To use the CircleCI CLI, you'll need to install and configure Docker. Please follow the [docker installation instructions](https://docs.docker.com/engine/installation/).

**CircleCI CLI does not currently support Windows.**

## Installation

To install the CLI, run:

```bash
curl -o /usr/local/bin/circleci-builder https://circle-downloads.s3.amazonaws.com/releases/circleci-builder/circleci-builder-beta && chmod +x /usr/local/bin/circleci-builder
```

If the current user doesn't have write permissions for `/usr/local/bin`, you might need to run the above commands with `sudo`.

## Usage

Calling `circleci-builder` without any options displays usage information:

```bash
$ circleci-builder
The build agent to be used in Picard.

Usage:
  picard [flags]
  picard [command]

Available Commands:
  build       run a full build locally
  tests       collect and split files with tests
  version     output version info

Flags:
  -c, --config string   config file (default is $HOME/.picard/agent.toml)
      --taskId string   TaskID
      --verbose         emit verbose logging output

Use 'picard [command] --help' for more information about a command.
```

## Updating

The CLI tool automatically checks for updates and will prompt you if one is available.
