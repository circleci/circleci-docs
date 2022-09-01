---
layout: classic-docs
title: Installing the CircleCI local CLI
description: How to install the CircleCI local CLI
categories: [troubleshooting]
redirect_from: local-cli-getting-started
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
suggested:
  - title: CircleCI CLI tutorial
    link: https://circleci.com/blog/local-pipeline-development/
  - title: Check your CircleCI installation
    link: https://support.circleci.com/hc/en-us/articles/360011235534?input_string=how+to+validate+config
  - title: Troubleshoot CLI errors
    link: https://support.circleci.com/hc/en-us/articles/360047644153?input_string=cli
---

## Overview
{: #overview }

The [CircleCI command line interface (CLI)](https://circleci-public.github.io/circleci-cli/) brings CircleCI's advanced and powerful tools to your terminal. The CLI is supported on cloud and server v3.x+ installations. If you are using server v2.x, please see the [legacy CLI installation](#using-the-cli-on-circleci-server-v2-x) section.

Some of the things you can do with the CLI include:

- Debug and validate your CI config
- Run jobs locally
- Query CircleCI's API
- Create, publish, view, and manage orbs
- Manage contexts

This page covers the installation and usage of the CircleCI CLI. The expectation is you have basic knowledge of CI/CD, [CircleCI's concepts]({{site.baseurl}}/concepts). You should already have a CircleCI account, an account with a supported VCS, and have your terminal open and ready to go.

* TOC
{:toc}

## Installation
{: #installation }

There are multiple installation options for the CircleCI CLI.

If you have previously installed CLI prior to October 2018, you may need to do an extra one-time step to switch to the new CLI. See the [upgrade instructions](#updating-the-legacy-cli).
{: class="alert alert-info"}

For the majority of installations, we recommend one of the package managers outlined in the sections below to install the CircleCI CLI.

### Linux: Install with Snap
{: #linux-install-with-snap }

The following commands will install the CircleCI CLI, Docker, and both the security and auto-update features that come along with [Snap packages](https://snapcraft.io/).

```shell
sudo snap install docker circleci
sudo snap connect circleci:docker docker
```

With snap packages, the Docker command will use the Docker snap, not a version of Docker you may have previously installed. For security purposes, snap packages can only read/write files from within `$HOME`.

### macOS: Install with Homebrew
{: #macos-install-with-homebrew }

If you are using [Homebrew](https://brew.sh/) with macOS, you can install the CLI with the following command:

```shell
brew install circleci
```

If you already have Docker for Mac installed, you can use this command instead:

```shell
brew install --ignore-dependencies circleci
```

### Windows: Install with Chocolatey
{: #windows-install-with-chocolatey }

For Windows users, CircleCI provides a [Chocolatey](https://chocolatey.org/) package:

```shell
choco install circleci-cli -y
```

### Alternative installation method
{: #alternative-installation-method }

**Mac and Linux:**

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | bash
```

By default, the CircleCI CLI tool will be installed to the `/usr/local/bin` directory. If you do not have write permissions to `/usr/local/bin`, you may need to run the above command with `sudo` after the pipe and before `bash`:

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | sudo bash
```

You can also install to an alternate location by defining the `DESTDIR` environment variable when invoking bash:

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | DESTDIR=/opt/bin bash
```

### Manual install
{: #manual-download }

You can visit the [GitHub releases](https://github.com/CircleCI-Public/circleci-cli/releases) page for the CLI to manually download and install. This approach is best if you would like the installed CLI to be in a specific path on your system.

## Updating the CLI
{: #updating-the-cli }

If you would just like to check for updates manually (and not install them), use the command:

  ```shell
  circleci update check
  ```

For **Linux and Windows** installs, you can update to the newest version of the CLI using the following command:

  ```shell
  circleci update
  ```

For **macOS** installations with Homebrew, you will need to run the following command to update:

  ```shell
  brew upgrade circleci
  ```

### Updating the legacy CLI
{: #updating-the-legacy-cli }
{:.no_toc}

The newest version of the CLI is a [CircleCI-Public open source project](https://github.com/CircleCI-Public/circleci-cli). If you have the [old CLI installed](https://github.com/circleci/local-cli), run the following commands to update and switch to the new CLI:

```shell
circleci update
circleci switch
```

This command may prompt you for `sudo` if your user does not have write permissions to the install directory, `/usr/local/bin`.

## Configuring the CLI
{: #configuring-the-cli }

Before using the CLI, you need to generate a CircleCI API token from the [Personal API Token tab](https://app.circleci.com/settings/user/tokens). After you get your token, configure the CLI by running:

```shell
circleci setup
```

The set up process will prompt you for configuration settings. If you are using the CLI with CircleCI cloud, use the default CircleCI host. If you are using CircleCI server, change the value to your installation address (for example, circleci.your-org.com).

## Validate a CircleCI config
{: #validate-a-circleci-config }

You can avoid pushing additional commits to test your `.circleci/config.yml` by using the CLI to validate your configuration locally.

To validate your configuration, navigate to a directory with a `.circleci/config.yml` file and run:

```shell
circleci config validate
# Config file at .circleci/config.yml is valid
```

## Uninstallation
{: #uninstallation }

The commands for uninstalling the CircleCI CLI will vary depending on your original installation method.

**Linux uninstall with Snap**: 
```shell
sudo snap remove circleci
```
**macOS uninstall with Homebrew**:
```shell
brew uninstall circleci
```
**Windows uninstall with Chocolatey**:
```shell
choco uninstall circleci-cli -y --remove dependencies
```
**Alternative curl uninstall**: Remove the `circleci` executable from `usr/local/bin`

## Using the CLI on CircleCI server v2.x
{: #using-the-cli-on-circleci-server-v2-x }

Currently, only the legacy CircleCI CLI is available to run on server v2.x installations of CircleCI on macOS and Linux distributions. To install the legacy CLI:

1. Install and configure Docker by using the [docker installation instructions](https://docs.docker.com/install/).
2. To install the CLI, run the following command:

```shell
$ curl -o /usr/local/bin/circleci https://circle-downloads.s3.amazonaws.com/releases/build_agent_wrapper/circleci && chmod +x /usr/local/bin/circleci
```

The CLI, `circleci`, is downloaded to the `/usr/local/bin` directory. If you do not have write permissions for `/usr/local/bin`, you might need to run the above commands with `sudo`. The CLI automatically checks for updates and will prompt you if one is available.

## Next steps
{: #next-steps }

- [How to use the CircleCI local CLI]({{site.baseurl}}/how-to-use-the-circleci-local-cli)
