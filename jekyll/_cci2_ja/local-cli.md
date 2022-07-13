---
layout: classic-docs
title: CircleCI のローカル CLI のインストール
description: CircleCI のローカル CLI のインストール方法
categories:
  - troubleshooting
redirect_from: local-cli-getting-started
version:
  - クラウド
  - Server v2.x
  - Server v3.x
suggested:
  - 
    title: CircleCI CLI チュートリアル (英語)
    link: https://circleci.com/blog/local-pipeline-development/
  - 
    title: ローカル CLI を使用した設定のバリデーション
    link: https://support.circleci.com/hc/ja/articles/360006735753
  - 
    title: CircleCI インストールの確認 (英語)
    link: https://support.circleci.com/hc/en-us/articles/360011235534?input_string=how+to+validate+config
  - 
    title: CLI エラーのトラブルシューティング (英語)
    link: https://support.circleci.com/hc/en-us/articles/360047644153?input_string=cli
---

## 概要
{: #overview }

CircleCI コマンドラインインターフェース (CLI) を使用すると、CircleCI の高度でパワフルなツールをターミナルで使えるようになります。 CLI は、クラウド版と Server v3.x 以上のインストールでサポートされます。 Server v2.x をご利用のお客様は、[旧バージョンの CLI インストール](#using-the-cli-on-circleci-server-v2-x)のセクションをお読みください。

CLI を使用すると、以下のような作業が行えます。

- CI の設定ファイルのデバッグとバリデーション
- ローカルでのジョブの実行
- CircleCI API のクエリ
- Orb の作成、パブリッシュ、表示、管理
- コンテキストの管理

このページでは、CircleCI CLI のインストールと使用方法について説明します。 The expectation is you have basic knowledge of CI/CD, [CircleCI's concepts]({{site.baseurl}}/concepts). CircleCI アカウントとサポート対象の VCS をお持ちで、ターミナルを開いたら準備は完了です。

* 目次
{:toc}

## インストール
{: #installation }

CircleCI CLI のインストールには複数の方法があります。

2018 年 10 月以前に CLI をインストールしている場合は、新しい CLI に切り替えるために追加の作業が必要になる場合があります。 [アップグレードに関する説明](#updating-the-legacy-cli)を参照してください。
{: class="alert alert-info"}

通常、CircleCI CLI のインストールには、以下のセクションで説明するパッケージマネージャーのいずれかを使うことをお勧めします。

### Linux: Snap を使用したインストール
{: #linux-install-with-snap }

以下のコマンドを実行すると、CircleCI CLI、Docker と共に、[Snap パッケージ](https://snapcraft.io/)に付属のセキュリティ機能と自動更新機能がインストールされます。

```shell
sudo snap install docker circleci
sudo snap connect circleci:docker docker
```

Snap パッケージを使って CLI をインストールする場合、この Docker コマンドでは、以前にインストールした Docker のバージョンではなく、Docker Snap が使用されます。 セキュリティ上の理由から、Snap パッケージは `$HOME` 内でしかファイルを読み書きできません。

### macOS: Homebrew を使用したインストール
{: #macos-install-with-homebrew }

macOS で [Homebrew](https://brew.sh/) を使用している場合は、以下のコマンドで CLI をインストールできます。

```shell
brew install circleci
```

Mac 版の Docker をインストールされている場合は、代わりに以下のコマンドを使用します。

```shell
brew install --ignore-dependencies circleci
```

### Windows: Chocolatey を使用したインストール
{: #windows-install-with-chocolatey }

Windows ユーザー向けには、[Chocolatey](https://chocolatey.org/) パッケージを提供しています。

```shell
choco install circleci-cli -y
```

### その他のインストール方法
{: #alternative-installation-method }

**Mac と Linux の場合**

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | bash
```

CircleCI の CLI ツールは、デフォルトで `/usr/local/bin` ディレクトリにインストールされます。 `/usr/local/bin` への書き込みアクセス権を持っていない場合は、上記コマンドのパイプと `bash` の間に `sudo` を挿入して実行する必要があります。

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | sudo bash
```

bash を呼び出す際に `DESTDIR` 環境変数を定義して、別の場所にインストールすることも可能です。

```shell
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | DESTDIR=/opt/bin bash
```

### 手動でのインストール
{: #manual-download }

CLI を手動でダウンロードしてインストールする場合は、[GitHub のリリースページ](https://github.com/CircleCI-Public/circleci-cli/releases)をご確認ください。 システム上の特定のパスに CLI をインストールしたい場合は、この方法が最適です。

## CLI の更新
{: #updating-the-cli }

**Linux と Windows** のインストールでは、次のコマンドを使用して CLI の最新バージョンに更新できます。

  ```shell
  circleci update
  ```

更新の有無を手動で確認するだけでインストールを行わない場合は、次のコマンドを使用します。

  ```shell
  circleci update check
  ```

Homebrew を使用した **macOS** インストールの場合は、次のコマンドを実行して更新する必要があります。

  ```shell
  brew upgrade circleci
  ```

### 旧バージョンの CLI の更新
{: #updating-the-legacy-cli }
{:.no_toc}

CLI の最新バージョンは [CircleCI パブリックオープンソースプロジェクト](https://github.com/CircleCI-Public/circleci-cli)です。 [旧バージョンの CLI をインストールしている](https://github.com/circleci/local-cli)場合は、以下のコマンドを実行して更新を行い、最新バージョンの CLI に切り替えてください。

```shell
circleci update
circleci switch
```

インストールディレクトリ `/usr/local/bin` への書き込みアクセス権が付与されていないユーザーがこのコマンドを実行すると、`sudo` を使用するように求められることがあります。

## CLI の設定
{: #configuring-the-cli }

CLI を使用する前に、[Personal API Token タブ](https://app.circleci.com/settings/user/tokens)で CircleCI の API トークンを生成する必要があります。 トークンを取得したら、以下を実行して CLI を設定します。

```shell
circleci setup
```

このコマンドを実行すると、設定を行うように求められます。 クラウド版 CircleCI で CLI を使用している場合は、デフォルトの CircleCI ホストを使用します。 CircleCI Server を使用している場合は、値をインストール用のアドレスに変更します (例: circleci.your-org.com)。

## CircleCI の設定ファイルのバリデーション
{: #validate-a-circleci-config }

CLI を使用して設定をローカルでバリデーションすると、`.circleci/config.yml` をテストするために追加のコミットをプッシュする必要がなくなります。

設定をバリデーションするには、`.circleci/config.yml` ファイルがあるディレクトリに移動し、以下を実行します。

```shell
circleci config validate
# Config file at .circleci/config.yml is valid
```

## アンインストール
{: #uninstallation }

CircleCI CLI のアンインストールに使用するコマンドは、元のインストール方法によって異なります。

**Snap を使用した Linux の場合**:
```shell
sudo snap remove circleci
```
**Homebrew を使用した macOS の場合**:
```shell
brew uninstall circleci
```
**Chocolatey を使用した Windows の場合**:
```shell
choco uninstall circleci-cli -y --remove dependencies
```
**curl を使用したアンインストール**: `circleci` 実行可能ファイルを `usr/local/bin` から削除します。

## CircleCI Server v2.x での CLI の使用
{: #using-the-cli-on-circleci-server-v2-x }

現在、macOS と Linux のディストリビューションでは、CircleCI Server v2.x インストール環境で実行できるのは旧バージョンの CircleCI CLI のみです。 旧バージョンの CLI をインストールするには、次の手順を実行します。

1. [Docker のインストール手順](https://docs.docker.com/install/)に従って、Docker をインストールし、設定します。
2. 以下のコマンドを実行して、CLI をインストールします。

```shell
$ curl -o /usr/local/bin/circleci https://circle-downloads.s3.amazonaws.com/releases/build_agent_wrapper/circleci && chmod +x /usr/local/bin/circleci
```

CLI (`circleci`) は `/usr/local/bin` ディレクトリにダウンロードされます。 `/usr/local/bin` への書き込みアクセス権を持っていない場合は、上記のコマンドを `sudo` で実行する必要がある場合があります。 CLI はアップデートの有無を自動的に確認し、アップデートがあった場合はメッセージが表示されます。

## 次のステップ
{: #next-steps }

- [CircleCI ローカル CLI の使用方法]({{site.baseurl}}/how-to-use-the-circleci-local-cli)
