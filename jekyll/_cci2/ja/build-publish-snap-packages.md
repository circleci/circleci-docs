---
layout: classic-docs
title: "CircleCI で Snapcraft を使用して Snap パッケージをビルドおよびパブリッシュする"
short-title: "Snap パッケージのビルドとパブリッシュ"
description: "CircleCI で Snapcraft を使用して Snap パッケージをビルドおよびパブリッシュする方法。"
categories:
  - containerization
order: 20
---
Snap パッケージを使用すると、ソフトウェアを複数の Linux ディストリビューション (distros) 上へ迅速にパブリッシュできます。 このドキュメントでは、CircleCI を使用して Snap パッケージをビルドし、Snap Store にパブリッシュする方法を紹介します。

## 概要

.snap ファイルを 1 回作成すれば、Ubuntu、Debian、Fedora、Arch など、`snapd` をサポートする、どの Linux distros にもインストールできます。 Snapcraft 自体の詳細については、[Snapcraft の Web サイト](https://snapcraft.io/)を参照してください。

CircleCI で Snap をビルドする手順は、ローカルマシンとほぼ同じで、[CircleCI 2.0 構文](https://circleci.com/docs/2.0/configuration-reference/)を使用します。 このドキュメントでは、Snap パッケージをビルドし、CircleCI を使用して [Snap Store](https://snapcraft.io/store) にパブリッシュする方法について説明します。 以下のセクションでは、サンプルの `.circleci/config.yml` ファイルのスニペットを使用します。完全なバージョンは、[このドキュメントの末尾](#full-example-config)にあります。

## 前準備

ローカル、企業サーバー CI など、どの環境でも、Snap のビルドには Snapcraft 構成ファイルが必要です。 このファイルは通常、`snap/snapcraft.yml` にあります。 このドキュメントでは、このファイルが既に存在し、ローカルマシンで Snap を正常にビルドできることを前提としています。 そうでない場合は、Snapcraft の[最初の Snap のビルド](https://docs.snapcraft.io/build-snaps/your-first-snap)についてのドキュメントを読み、ローカルマシンで Snap をビルドできるようにしてください。

## ビルド環境

```yaml
#...
version: 2
jobs:
  build:
    docker:
      - image: cibuilds/snapcraft:stable
#...
```

`docker` executor は、[`cibuilds/snapcraft`](https://github.com/cibuilds/snapcraft) Docker イメージとともに、ここで使用されます。 このイメージは、Canonical による公式の [`snapcore/snapcraft`](https://github.com/snapcore/snapcraft/tree/master/docker) Docker イメージを基礎とし、CI 環境にインストールすると便利なすべてのコマンドラインツールが含まれています。 このイメージには、実際の Snap をビルドするために使用される `snapcraft` コマンドも含まれています。

## Snapcraft の実行

```yaml
...
    steps:
      - checkout
      - run:
          name: "Build Snap"
          command: snapcraft
...
```

CircleCI では、この単一のコマンドだけで、Snap を実際にビルドできます。 これによって Snapcraft が実行され、すべてのビルド手順が行われ、`.snap` ファイルが生成されます。 このファイルは通常、`<snap-name>-<snap-version>-<system-arch>.snap` の形式です。

## テスト

コードの単体テストについては、弊社のブログやドキュメントで包括的に扱われているため、このドキュメントの範囲外です。 Snap をビルドする前に、プロジェクトの依存関係、行うべき事前チェック、テスト、およびコンパイルのすべてをプルする `job` を作成することをお勧めします。

CircleCI で Snap をビルドすると、`.snap` ファイルが作成され、作成に使用されたコードとともにテストできます。 Snap 自体のテスト方法はユーザーが決定します。 一部のユーザーは、各種の distros に Snap をインストールしてから、インストールプロセスが正しく動作することを確認するコマンドを実行します。 Snapcraft はスプレッドテスト用のビルドフリートを提供しており、コード自体のテストを行った後で、各種の distros で Snap をテストできます。 このビルドフリートは、[ここ](https://build.snapcraft.io/)で入手できます。

## パブリッシュ

Publishing a snap is more or less a two-step process. Here's on this might look on a Linux machine:

```Bash
snapcraft login
# Ubuntu One アカウントでログインするためプロンプトに従う
snapcraft export-login snapcraft.login
base64 snapcraft.login | xsel --clipboard
```

1. Create a Snapcraft "login file" on your local machine that we upload to CircleCI. Assuming your local machine already has these tools installed and you are logged in to the Snapcraft Store (`snapcraft login`), we use the command `snapcraft export-login snapcraft.login` to generate a login file called `snapcraft.login`. As we don't want this file visible to the public or stored in the Git repository, we will base64 encode this file and store it in a [private environment variable](https://circleci.com/docs/2.0/env-vars/#adding-environment-variables-in-the-app) called `$SNAPCRAFT_LOGIN_FILE`.
    
    *Note: The default expiration time for the Snapcraft login file is 1 year. If you want the auth file to be valid for longer, make sure to set an expiration date with the `--expires` flag.*
    
    ```yaml
    ...
          - run:
              name: "Publish to Store"
              command: |
                mkdir .snapcraft
                echo $SNAPCRAFT_LOGIN_FILE | base64 --decode --ignore-garbage > .snapcraft/snapcraft.cfg
                snapcraft push *.snap --release stable
    ...
    ```

2. Once the base64 encoded version of the file is stored on CircleCI as a private environment variable, we can then use it within a build to automatically publish to the store.

この例では、Snapcraft が `.snapcraft/snapcraft.cfg` 内のログイン資格情報を自動的に探し、以前に作成した環境変数がその場所にデコードされます。 その後で、`snapcraft push` コマンドを使用して .snap ファイルが Snap Store にアップロードされます。

### アップロードとリリースの相違

`snapcraft push *.snap` はデフォルトで、Snap を Snap Store にアップロードし、サーバー側でストアチェックを実行してから停止します。 スナップ「解放」されません。これは、ユーザーが更新を自動的に確認できないということです。 `snap release <release-id>` コマンドを使用するか、Snap Store にログインして [リリース] ボタンをクリックすると、Snap をローカルにパブリッシュできます。

一般的な CircleCI の形式のように、これらを完全に自動化できます (上述の例のように) が、この場合は `--release <channel>` フラグを使用します。 これにより Snap がアップロードされ、Store 側での検証が行われてから、指定のチャンネルに Snap が自動的にリリースされます。

## Workflows

複数のジョブを利用すると、Snap ビルドをより的確に整理できます。 実際のプロジェクトをビルド/コンパイルするジョブ、Snap 自体をビルドするジョブ、`master` にのみ Snap (および他のパッケージ) をパブリッシュするジョブなどが便利です。

[Workflows](https://circleci.com/docs/2.0/workflows/) を使用すると、Snap のビルドに 2 つの点で役立ちます。

1. **Snap Store Channels** - As we mentioned in the previous section, when we upload to the Store we could optionally release at the same time. This allows us to designate specific jobs on CircleCI to deploy to specific Snap Channels. For example, the `master` branch could be used to deploy to the `edge` channel`while tagged releases could be used to deploy to the`stable` channel.
2. **Parallelize Packing** - If your software is being packaged as a snap as well as something else, say a flatpak, .deb, .apk, etc, each package type could be placed in its own job and all run parallel. This allows your build to complete must fast than if the .deb package could start to build until the snap completed, and so on.

Utilize CircleCI `workspaces` to move a generated snap file between jobs when necessary. Here's an example showing a snippet from the "from" job and a snippet of the "to" job:

```yaml
... # from a job that already has the snap
      - persist_to_workspace:
          root: .
          paths:
            - "*.snap"
... # to the next job that needs the snap
      - attach_workspace:
          at: .
...
```

Below is a complete example of how a snap package could be built on CircleCI. This same process is used the build the Snap pakcage for the \[CircleCI Local CLI\]\[local-cli-repo\].

## 構成の完全な例

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cibuilds/snapcraft:stable
    steps:
      - checkout
      - run:
          name: "Build Snap"
          command: snapcraft
      - persist_to_workspace:
          root: .
          paths:
            - "*.snap"

  publish:
    docker:
      - image: cibuilds/snapcraft:stable
    steps:
      - attach_workspace:
          at: .
      - run:
          name: "Publish to Store"
          command: |
            mkdir .snapcraft
            echo $SNAPCRAFT_LOGIN_FILE | base64 --decode --ignore-garbage > .snapcraft/snapcraft.cfg
            snapcraft push *.snap --release stable


workflows:
  version: 2
  main:
    jobs:
      - build
      - publish:
          requires:
            - build
          filters:
            branches:
              only: master
```