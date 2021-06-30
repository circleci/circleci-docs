---
layout: classic-docs
title: "CircleCI 上で Snapcraft を使用した Snap パッケージのビルドとパブリッシュ"
short-title: "Snap パッケージのビルドとパブリッシュ"
description: "CircleCI 上で Snapcraft を使用して Snap パッケージのビルドとパブリッシュを行う方法"
categories:
  - containerization
order: 20
version:
  - Cloud
  - Server v2.x
---

Snap とは、複数の Linux ディストリビューション (distros) 上でソフトウェアを迅速にパブリッシュできるパッケージ形式です。 CircleCI を使用して Snap パッケージをビルドし、Snap Store にパブリッシュする方法について説明します。

## 概要
{: #overview }

A `.snap` file can be created once and installed on any Linux distro that supports `snapd`, such as Ubuntu, Debian, Fedora, Arch, and more. More information on Snapcraft itself can be found on [Snapcraft's website](https://snapcraft.io/).

Building a snap on CircleCI is mostly the same as on your local machine, wrapped with [CircleCI 2.0 syntax](https://circleci.com/docs/2.0/configuration-reference/). This document describes how to build a snap package and publish it to the [Snap Store](https://snapcraft.io/store) via CircleCI. The following sections use snippets of a sample `.circleci/config.yml` file with the full version at the [end of this doc](#full-example-config).

## 前提条件
{: #prerequisites }

To build a snap in any environment (local, company servers CI, etc) there needs to be a Snapcraft config file. Typically this will be located at `snap/snapcraft.yml`. This doc assumes you already have this file and can build snaps successfully on your local machine. If not, you can read through the [Build Your First Snap](https://docs.snapcraft.io/build-snaps/your-first-snap) doc by Snapcraft to get your snap building on your local machine.


## Build environment
{: #build-environment }

```yaml
# ...
version: 2
jobs:
  build:
    docker:
      - image: cibuilds/snapcraft:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
#...
```

The `docker` executor is used here with the [`cibuilds/snapcraft`](https://github.com/cibuilds/snapcraft) Docker image. This image is based on the official [`snapcore/snapcraft`](https://github.com/snapcore/snapcraft/tree/master/docker) Docker image by Canonical with all of the command-line tools you'd want to be installed in a CI environment. This image includes the `snapcraft` command which will be used to build the actual snap.

## Snapcraft の実行
{: #running-snapcraft }

```yaml
...
    steps:
      - checkout
      - run:
          name: "Snap のビルド"
          command: snapcraft
...
```

On CircleCI, this single command is needed to actually build your snap. This will run Snapcraft, which will then go through all of its build steps and generate a `.snap` file for you. This file will typically be in the format of `<snap-name>-<snap-version>-<system-arch>.snap`.

## テスト
{: #testing }

Unit testing your code has been covered extensively in our blog and our docs and is out of the scope of this document. You'll likely want to create a `job` before building the snap that pulls project dependencies, any pre-checks you'd want to do, testing, and compiling.

Building snaps on CircleCI results in a `.snap` file which is testable in addition to the code that created it. How you test the snap itself is up to you. Some users will attempt to install the snap in various distros and then run a command to make sure that installation process works. Snapcraft offers a build fleet for spreadtesting that allows you to test snaps on different distros, after you've already tested the code itself. This can be found [here](https://build.snapcraft.io/).

## パブリッシュ
{: #publishing }

Publishing a snap is more or less a two-step process. Here's on this might look on a Linux machine:

```Bash
snapcraft login
# Follow prompts for logging in with an Ubuntu One account
snapcraft export-login snapcraft.login
base64 snapcraft.login | xsel --clipboard
```

1. ローカル マシンで、CircleCI にアップロードする Snapcraft の「ログイン ファイル」を作成します。 ローカル マシン上に既にこれらのツールがインストールされており、Snap Store (`snapcraft login`) にログインしている場合は、`snapcraft export-login snapcraft.login` コマンドを使用して、`snapcraft.login` という名前のログイン ファイルを作成します。 このファイルをパブリックに公開したり、Git リポジトリに格納したりはせず、base64 でエンコードして、`$SNAPCRAFT_LOGIN_FILE` という名前の[プライベート環境変数](https://circleci.com/ja/docs/2.0/env-vars/#adding-environment-variables-in-the-app)に格納します。

    *メモ: Snapcraft ログイン ファイルの有効期限はデフォルトで 1 年間です。 認証ファイルの有効期間を延長したい場合は、`--expires` フラグで有効期限の日付を設定してください。*

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

In this example, Snapcraft automatically looks for login credentials in `.snapcraft/snapcraft.cfg` and the environment variable made previously is decoded into that location. The `snapcraft push` command is then used to upload the .snap file into the Snap Store.

### Uploading vs releasing
{: #uploading-vs-releasing }

`snapcraft push *.snap` by default will upload the snap to the Snap Store, run any store checks on the server side, and then stop. The snap won't be "released" meaning users won't automatically see the update. The snap can be published locally with the `snap release <release-id>` command or by logging into the Snap Store and clicking the release button.

In typical CircleCI fashion, we can go fully automated (as in the above example) but using the `--release <channel>` flag. This uploads the snap, does Store side verification, and then will automatically release the snap in the specified channels.


## ワークフロー
{: #workflows }

We can utilize multiple jobs to better organize our snap build. A job to build/compile the actual project, a job to build the snap itself, and a job that published the snap (and other packages) only on `master` would all be useful.

[Workflows](https://circleci.com/docs/2.0/workflows/) can help with building snaps in two ways:

1. **Snap Store Channels** - As we mentioned in the previous section, when we upload to the Store we could optionally release at the same time. This allows us to designate specific jobs on CircleCI to deploy to specific Snap Channels. For example, the `master` branch could be used to deploy to the `edge` channel`while tagged releases could be used to deploy to the`stable` channel.
1. **Concurrent Packing** - If your software is being packaged as a snap as well as something else, say a flatpak, .deb, .apk, etc, each package type could be placed in its own job and run concurrently. This allows your build to complete must fast than if the .deb package could start to build until the snap completed, and so on.

Utilize CircleCI `workspaces` to move a generated snap file between jobs when necessary. Here's an example showing a snippet from the "from" job and a snippet of the "to" job:

```yaml
# from a job that already has the snap
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


## Full example config
{: #full-example-config }

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cibuilds/snapcraft:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
