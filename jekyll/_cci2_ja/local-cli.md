---
layout: classic-docs
title: Installing the CircleCI Local CLI
description: How to install the CircleCI local CLI
categories:
  - troubleshooting
redirect_from: 2.0/local-cli-getting-started
version:
  - クラウド
  - Server v2.x
  - Server v3.x
suggested:
  - 
    title: CircleCI CLI tutorial
    link: https://circleci.com/blog/local-pipeline-development/
  - 
    title: Validate your config using local CLI
    link: https://support.circleci.com/hc/en-us/articles/360006735753?input_string=how+to+validate+config+before+pushing
  - 
    title: Check your CircleCI installation
    link: https://support.circleci.com/hc/en-us/articles/360011235534?input_string=how+to+validate+config
  - 
    title: Troubleshoot CLI errors
    link: https://support.circleci.com/hc/en-us/articles/360047644153?input_string=cli
---

## 概要
{: #overview }

The CircleCI command line interface (CLI) brings CircleCI's advanced and powerful tools to your terminal. The CLI is supported on cloud and server v3.x+ installations. If you are using server v2.x, please see the [legacy CLI installation](#using-the-cli-on-circleci-server-v2-x) section.

Some of the things you can do with the CLI include:

- CI の設定ファイルのデバッグとバリデーション
- ローカルでのジョブの実行
- CircleCI API のクエリ
- Create, publish, view, and manage orbs
- Manage contexts

This page covers the installation and usage of the CircleCI CLI. The expectation is you have basic knowledge of CI/CD, [CircleCI's concepts]({{site.baseurl}}/2.0/concepts). You should already have a CircleCI account, an account with a supported VCS, and have your terminal open and ready to go.

* 目次
{:toc}

## インストール
{: #installation }

CLI のインストールには複数の方法があります。

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

### その他のインストール方法
{: #alternative-installation-method }

**Mac と Linux の場合**

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | bash
```

CircleCI の CLI ツールは、デフォルトで `/usr/local/bin` ディレクトリにインストールされます。 If you do not have write permissions to `/usr/local/bin`, you may need to run the above command with `sudo` after the pipe and before `bash`:

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | sudo bash
```

You can also install to an alternate location by defining the `DESTDIR` environment variable when invoking bash:

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | DESTDIR=/opt/bin bash
```

### 手動でのインストール
{: #manual-download }

CLI を手動でダウンロードしてインストールする場合は、[GitHub 上のリリース ページ](https://github.com/CircleCI-Public/circleci-cli/releases)をご確認ください。 システム上の特定のパスに CLI をインストールしたいときには、この方法が最適です。

## CLI の更新
{: #updating-the-cli }

For **Linux and Windows** installs, you can update to the newest version of the CLI using the following command:

  ```shell
  circleci update
  ```

If you would just like to check for updates manually (and not install them), use the command:

  ```shell
  circleci update check
  ```

For **macOS** installations with Homebrew, you will need to run the following command to update:

  ```shell
  brew upgrade circleci
  ```

### 旧バージョンの CLI の更新
{: #updating-the-legacy-cli }
{:.no_toc}

CLI の最新バージョンは [CircleCI パブリック オープン ソース プロジェクト](https://github.com/CircleCI-Public/circleci-cli)です。 [旧バージョンの CLI をインストールしている](https://github.com/circleci/local-cli)場合は、以下のコマンドを実行して更新を行い、最新バージョンの CLI に切り替えてください。

```shell
circleci update
circleci switch
```

This command may prompt you for `sudo` if your user does not have write permissions to the install directory, `/usr/local/bin`.

## CLI の設定
{: #configuring-the-cli }

Before using the CLI, you need to generate a CircleCI API token from the [Personal API Token tab](https://app.circleci.com/settings/user/tokens). トークンを取得したら、以下を実行して CLI を構成します。

```shell
circleci setup
```

このセットアップ プロセスを実行すると、構成を行うように求められます。 If you are using the CLI with CircleCI cloud, use the default CircleCI host. CircleCI Server を使用している場合は、値をインストール アドレスに変更します (例: circleci.your-org.com)。

## CircleCI の設定ファイルのバリデーション
{: #validate-a-circleci-config }

You can avoid pushing additional commits to test your `.circleci/config.yml` by using the CLI to validate your configuration locally.

To validate your configuration, navigate to a directory with a `.circleci/config.yml` file and run:

```shell
circleci config validate
# 設定ファイル .circleci/config.yml が有効かどうかチェックします
```

## アンインストール
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

## CircleCI Server v2.x での CLI の使用
{: #using-the-cli-on-circleci-server-v2-x }

Currently, only the legacy CircleCI CLI is available to run on server v2.x installations of CircleCI on macOS and Linux distributions. To install the legacy CLI:

1. [Docker のインストール手順](https://docs.docker.com/install/)に従って、Docker をインストールし、構成します。
2. 以下のコマンドを実行して、CLI をインストールします。

```shell
$ curl -o /usr/local/bin/circleci https://circle-downloads.s3.amazonaws.com/releases/build_agent_wrapper/circleci && chmod +x /usr/local/bin/circleci
```

CLI (`circleci`) は `/usr/local/bin` ディレクトリにダウンロードされます。 `/usr/local/bin` への書き込みアクセス権を持っていない場合は、上記のコマンドを `sudo` で実行する必要があります。 CLI はアップデートの有無を自動的に確認し、アップデートがあった場合はメッセージが表示されます。

## 次のステップ
{: #next-steps }

- [How to use the CircleCI local CLI]({{site.baseurl}}/2.0/how-to-use-the-circleci-local-cli)
