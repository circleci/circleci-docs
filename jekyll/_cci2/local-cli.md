---
layout: classic-docs
title: Install and configure the CircleCI local CLI
description: How to install the CircleCI local CLI
categories: [troubleshooting]
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
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

The [CircleCI command line interface (CLI)](https://circleci-public.github.io/circleci-cli/) brings CircleCI's advanced and powerful tools to your terminal.

Some of the things you can do with the CLI include:

- [Debug and validate your CircleCI configuration](/docs/how-to-use-the-circleci-local-cli/#validate-a-circleci-config)
- [Run jobs locally](/docs/how-to-use-the-circleci-local-cli/#run-a-job-in-a-container-on-your-machine)
- Query CircleCI's API
- [Create, publish, view, and manage orbs](/docs/how-to-use-the-circleci-local-cli/#orb-development-kit)
- [Manage contexts](/docs/how-to-use-the-circleci-local-cli/#context-management)
- [Split your tests](/docs/how-to-use-the-circleci-local-cli/#test-splitting) to run across [parallel environments](/docs/parallelism-faster-jobs/) to reduce pipeline duration

This page covers the installation and usage of the CircleCI CLI. The expectation is you have basic knowledge of CI/CD, [CircleCI's concepts]({{site.baseurl}}/concepts). You should already have a CircleCI account, an account with a supported VCS, and have your terminal open and ready to go.

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


The newest version of the CLI is a [CircleCI-Public open source project](https://github.com/CircleCI-Public/circleci-cli). If you have the [old CLI installed](https://github.com/circleci/local-cli), run the following commands to update and switch to the new CLI:

```shell
circleci update
circleci switch
```

This command may prompt you for `sudo` if your user does not have write permissions to the install directory, `/usr/local/bin`.

## Configure the CLI
{: #configure-the-cli }

Before using the CLI, you need to generate a CircleCI API token from the [Personal API Token tab](https://app.circleci.com/settings/user/tokens). After you get your token, configure the CLI by running:

```shell
circleci setup
```

The set up process will prompt you for configuration settings. If you are using the CLI with CircleCI cloud, use the default CircleCI host. If you are using CircleCI server, change the value to your installation address (for example, circleci.your-org.com).

## Telemetry
{: #telemetry }

The CircleCI CLI includes a telemetry feature that collects basic errors and feature usage data in order to help us improve the experience for everyone.

Telemetry works on an opt-in basis. When running a command for the first time, you will be asked for consent to enable telemetry. Telemetry is disabled by default for non-interactive terminals, ensuring that scripts that leverage the CLI run smoothly.

You can disable or enable telemetry any time in one of the following ways:

* Run one of the following commands: `circleci telemetry enable` or `circleci telemetry disable`

* To disable telemetry, set the `CIRCLECI_CLI_TELEMETRY_OPTOUT` environment variable to `1` or `true`

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

## Next steps
{: #next-steps }

- [How to validate your CircleCI configuration](/docs/how-to-use-the-circleci-local-cli/#validate-a-circleci-config)
- [How to run a job in a container on your local machine](/docs/how-to-use-the-circleci-local-cli/#run-a-job-in-a-container-on-your-machine)
- [How to create, publish, view, and manage orbs](/docs/how-to-use-the-circleci-local-cli/#orb-development-kit)
- [How to manage contexts](/docs/how-to-use-the-circleci-local-cli/#context-management)
- [How to split your tests](/docs/how-to-use-the-circleci-local-cli/#test-splitting) to run across [parallel environments](/docs/parallelism-faster-jobs/) to reduce pipeline duration

---

## CLI articles in the support centre
{: #useful-links }

If you wish to suggest ways we could improve the CLI please [share your suggestion on the GitHub repo](https://github.com/CircleCI-Public/circleci-cli)

- [How to check private repositories with local jobs using the CircleCI CLI?](https://support.circleci.com/hc/en-us/articles/360033753374-Checkout-private-repositories-with-local-jobs-run-through-circleci-cli)

- [How to know if your project is using deprecated Machine images with the CLI?](https://support.circleci.com/hc/en-us/articles/4421154407195-Deprecating-Ubuntu-14-04-and-16-04-images-EOL-5-31-22)

- [How to validate a config that uses private Orbs with the CLI?](https://support.circleci.com/hc/en-us/articles/10643012267291-How-to-validate-a-config-that-uses-private-Orbs)

- [Understanding the difference between public, private and unlisted orbs](https://support.circleci.com/hc/en-us/articles/4406826701339-Orbs-Public-vs-Private-vs-Unlisted)

- [How to make your orbs private using the CircleCI CLI?](https://support.circleci.com/hc/en-us/articles/360035341894-How-can-I-make-my-orbs-private-)

- [How to list your private orb using the CircleCI CLI?](https://support.circleci.com/hc/en-us/articles/15222621603355-How-to-Find-your-Private-Orb-s-Documentation)

- [How to delete an orb using the CircleCI CLI?](https://support.circleci.com/hc/en-us/articles/360045977834-Can-I-delete-an-Orb-)

- [How to delete a project Docker Layer Cache with the CircleCI CLI?](https://support.circleci.com/hc/en-us/articles/14027411555355-How-to-delete-a-projects-Docker-Layer-Cache)

- [Docker Layer Cache FAQ](https://support.circleci.com/hc/en-us/articles/4407580027675-Docker-Layer-Caching-FAQ)

- [How to rotate your self-hosted runner resource class tokens using the CircleCI CLI?](https://support.circleci.com/hc/en-us/articles/14031352897819-How-to-Rotate-your-Self-Hosted-Runner-Resource-Class-Tokens)

- [How to use the CLI to verify namespaces and resource classes have been created correctly when installing the CircleCI runner ?](https://support.circleci.com/hc/en-us/articles/360057144631-CircleCI-Runner-Error-Message-We-cannot-run-this-job-using-the-selected-resource-class-)

- [How to use realitycheck to validate your CircleCI Server installation for GitHub Enterprise via the CLI?](https://support.circleci.com/hc/en-us/articles/360011235534-Using-realitycheck-to-validate-your-CircleCI-installation)


### Troubleshooting
{: #troubleshooting }

- [What if the CLI context commands error with "Must have admin permission"?](https://support.circleci.com/hc/en-us/articles/360047644153-CircleCI-CLI-Context-Command-errors-with-Must-have-admin-permission-)

- [What if the CLI fails with "panic: yaml: line 4: could not find expected ':'"?](https://support.circleci.com/hc/en-us/articles/360046871833-CircleCI-CLI-Fails-With-panic-yaml-line-4-could-not-find-expected-Error)

- [What if the CLI command “circleci local execute” fails with "--storage-opt is supported only for overlay over xfs with 'pquota' mount option"?](https://support.circleci.com/hc/en-us/articles/7060937560859-How-to-resolve-error-storage-opt-is-supported-only-for-overlay-over-xfs-with-pquota-mount-option-when-running-jobs-locally-with-the-cli)

- [What if the CLI command “circleci local execute” fails with “not implemented for cgroup v2 unified hierarchy“?](https://support.circleci.com/hc/en-us/articles/4413013337371-CircleCI-CLI-Running-circleci-local-execute-Results-in-not-implemented-for-cgroup-v2-unified-hierarchy-Error)
