---
layout: classic-docs
title: "Authoring an Orb - Setting Up the CircleCI CLI"
short-title: "Setting up the CLI"
description: "Setting Up the CircleCI ClI for Orb Authors"
categories: [getting-started]
order: 1
---

* TOC 
{:toc}

## Introduction to the CircleCI CLI

The CircleCI CLI has several commands for managing your orb publishing pipeline. The simplest way to learn the CLI is to install it and run circleci help. Refer to Using the CircleCI CLI for details. Listed below are some of the most pertinent commands for creating, validating, and publishing orbs:

- circleci namespace create <name> <vcs-type> <org-name> [flags]
- circleci orb create <namespace>/<orb> [flags]
- circleci orb validate <path> [flags]
- circleci orb publish <path> <namespace>/<orb>@<version> [flags]
- circleci orb publish increment <path> <namespace>/<orb> <segment> [flags]
- circleci orb publish promote <namespace>/<orb>@<version> <segment> [flags]

For a full list of help commands inside the CircleCI CLI, visit the [CircleCI CLI help](https://circleci-public.github.io/circleci-cli/circleci_orb.html).

## Authoring an Orb - CircleCI CLI

As an orb author, one of the first steps you will need to take when creating a new orb is to install and configure the CircleCI CLI. Using the CircleCI CLI and its associated commands simplifies the orb authoring process so you can quickly and easily create new orbs. To set up the CircleCI CLI so you can author an orb, perform the following steps:

1) Install the CLI
2) Update the CLI
3) Configure the CLI

### Install the CLI for the First Time

If you are installing the new circleci CLI for the first time, run the following command:

`curl -fLSs https://circle.ci/cli | bash`

By default, the circleci app will be installed in the `/usr/local/bin` directory. If you do not have write permissions to `/usr/local/bin`, use the sudo command. Alternatively, you may install the CLI to an alternate location by defining the `DESTDIR` environment variable when invoking bash:

`curl -fLSs https://circle.ci/cli | DESTDIR=/opt/bin/bash`

#### Homebrew

If you wish to use Homebrew, run the following command:

`brew install circleci`

#### Snapcraft

You may also use Snapcraft to install the CLI by running the following command:

`sudo snap install circleci`

### Update the CircleCI CLI

If you have used a previous version of the CircleCI and are currently running a version older than 0.1.6, run the following commands to update your CLI version to the latest version.

`circleci update`
`circleci switch`

**Note**: If you do not already have write permissions, make sure to use the `sudo` command. This installs the CLI to the `/usr/local/bin` directory.

The CircleCI comes with a built-in version management system. After you have installed the CLI, check if there are any updates to the CLI that need to be installed by running the following commands:

`circleci update check`
`circleci update install`

### Configure the CircleCI CLI

Now that you have installed the CircleCI CLI, you will want to configure the CLI for use. The process for configuring the CLI is simple and straightforward, requiring you only to follow a few steps.

Before you can configure the CLI, you may need to first generate a CircleCI API token from the Personal API Token tab:

`$ circleci setup`

If you are using the CLI tool on circleci.com, accept the provided default CircleCI Host.

If you are a user of a privately installed CircleCI deployment, change the default value to your custom address, for example, circleci.your-org.com.

**Note**: CircleCI installed on a private cloud or datacenter does not yet support config processing and orbs; therefore, you may only use `circleci local execute` (this was previously `circleci build`).

## Next Steps
{:.no_toc}

- Refer to the Author Your Orb document for next steps.
