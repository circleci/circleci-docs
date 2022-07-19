---
layout: classic-docs
title: "CircleCI 上で Snapcraft を使用した Snap パッケージのビルドとパブリッシュ"
short-title: "Snap パッケージのビルドとパブリッシュ"
description: "CircleCI 上で Snapcraft を使用して Snap パッケージのビルドとパブリッシュを行う方法"
categories:
  - コンテナ化
order: 20
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

Snap とは、複数の Linux ディストリビューション (distros) 上でソフトウェアを迅速にパブリッシュできるパッケージ形式です。 CircleCI を使用して Snap パッケージをビルドし、Snap Store にパブリッシュする方法について説明します。

## 概要
{: #overview }

.snap ファイルを一度作成すれば、`snapd` をサポートする Ubuntu、Debian、Fedora、Arch などの任意の Linux ディストリビューション上にインストールできます。 Snapcraft 自体の詳細については、[Snapcraft の Web サイト](https://snapcraft.io/)を参照してください。

Building a snap on CircleCI is mostly the same as on your local machine, wrapped with [CircleCI syntax](https://circleci.com/docs/configuration-reference/). ここでは、CircleCI を使用して Snap パッケージをビルドし、[Snap Store](https://snapcraft.io/store) にパブリッシュする方法について説明します。 各セクションでは `.circleci/config.yml` のサンプル ファイルのスニペットを使用しています。 サンプル ファイルの全体は[最後のセクション](#サンプル設定ファイルの全文)で確認してください。

## 前提条件
{: #prerequisites }

任意の環境 (ローカル、企業サーバー CI など) で Snap をビルドするには、Snapcraft 設定ファイルが必要です。 通常、`snap/snapcraft.yml` に格納されています。 ここでは、このファイルが既に存在し、ローカル マシンで Snap を正しくビルドできると想定します。 そうでない場合は、[Snapcraft のドキュメント](https://docs.snapcraft.io/build-snaps/your-first-snap)を参照して、ローカル マシンで Snap をビルドしてください。


## 実行環境
{: #build-environment }

```yaml
#...
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

[`cibuilds/snapcraft`](https://github.com/cibuilds/snapcraft) Docker イメージと共に `docker` Executor が使用されています。 このイメージは、Canonical による公式の [`snapcore/snapcraft`](https://github.com/snapcore/snapcraft/tree/master/docker) Docker イメージをベースとしており、CI 環境へのインストールが推奨されるすべてのコマンドライン ツールを備えています。 また、実際の Snap のビルドに使用される `snapcraft` コマンドが含まれています。

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

CircleCI で実際に Snap をビルドするために必要なコマンドはこれだけです。 これによって Snapcraft が実行され、すべてのビルド ステップが実行されて、`.snap` ファイルが生成されます。 通常、このファイルの形式は `<snap-name>-<snap-version>-<system-arch>.snap` です。

## テスト
{: #testing }

コードの単体テストについては、CircleCI のブログやドキュメントで詳しく説明されているため、ここでは取り上げません。 Snap をビルドする前に、プロジェクト依存関係、何らかの事前チェック、テスト、コンパイルをプルする `job` の作成が必要になる場合もあるでしょう。

CircleCI で Snap をビルドすると、`.snap` ファイルが作成され、このファイルを作成したコードに加えて、このファイルをテストできます。 Snap 自体のテスト方法はユーザーに任されており、 一部のユーザーは、さまざまなディストリビューションに Snap をインストールした後、コマンドを実行してインストール プロセスが機能することを確認しています。 Snapcraft は、広範なテストを実行できる Builder フリートを提供しています。 これを使用して、コード自体をテストした後に、さまざまなディストリビューションで Snap をテストできます。 詳細については、[こちら](https://build.snapcraft.io/)を参照してください。

## パブリッシュ
{: #publishing }

Snap のパブリッシュは、ほぼ 2 ステップで完了します。 以下に Linux マシン上の例を示します。

```shell
snapcraft login
# プロンプトに従って Ubuntu One のアカウントでログインします
snapcraft export-login snapcraft.login
base64 snapcraft.login | xsel --clipboard
```

1. ローカル マシンで、CircleCI にアップロードする Snapcraft の「ログイン ファイル」を作成します。 ローカル マシン上に既にこれらのツールがインストールされており、Snap Store (`snapcraft login`) にログインしている場合は、`snapcraft export-login snapcraft.login` コマンドを使用して、`snapcraft.login` という名前のログイン ファイルを作成します。 このファイルをパブリックに公開したり、Git リポジトリに格納したりはせず、base64 でエンコードして、`$SNAPCRAFT_LOGIN_FILE` という名前の[プライベート環境変数](https://circleci.com/ja/docs/env-vars/#adding-environment-variables-in-the-app)に格納します。

    *メモ: Snapcraft ログイン ファイルの有効期限はデフォルトで 1 年間です。 認証ファイルの有効期間を延長したい場合は、`--expires` フラグで有効期限の日付を設定してください。*

    ```yaml
    ...
          - run:
              name: "ストアへのパブリッシュ"
              command: |
                mkdir .snapcraft
                echo $SNAPCRAFT_LOGIN_FILE | base64 --decode --ignore-garbage > .snapcraft/snapcraft.cfg
                snapcraft push *.snap --release stable
    ...
    ```

2. base64 エンコード バージョンのファイルを CircleCI にプライベート環境変数として格納したら、ビルド内でそれを使用して、ストアに自動的にパブリッシュすることができます。

この例では、Snapcraft が自動的に `.snapcraft/snapcraft.cfg` 内のログイン認証情報を検索し、前に作成した環境変数がその場所にデコードされます。 次に、`snapcraft push` コマンドを使用して .snap ファイルを Snap Store にアップロードします。

### アップロードとリリース
{: #uploading-vs-releasing }

デフォルトの `snapcraft push *.snap` は、Snap を Snap Store にアップロードし、サーバー側でストア チェックを実行してから停止します。 この Snap は「リリース」されません。 すなわち、このアップデートは自動的にはユーザーに表示されません。 Snap をローカルにパブリッシュするには、`snap release <release-id>` コマンドを使用するか、Snap Store にログインしてリリース ボタンをクリックします。

通常の CircleCI の方式では、`--release <channel>` フラグを使用することで、(上の例のように) 完全に自動化できます。 これによって Snap がアップロードされ、ストア側の検証が行われてから、指定したチャンネルに Snap が自動的にリリースされます。


## ワークフロー
{: #workflows }

複数のジョブを使用して、Snap ビルドをさらにうまく構成することができます。 A job to build/compile the actual project, a job to build the snap itself, and a job that published the snap (and other packages) only on `main` would all be useful.

[ワークフロー](https://circleci.com/ja/docs/workflows/)を使用して、次の 2 つの方法で Snap をビルドできます。

1. **Snap Store チャンネル** - 前のセクションで説明したように、ストアにアップロードするときに、オプションで同時にリリースすることが可能です。 これにより、CircleCI 上の特定のジョブで特定の Snap チャンネルにデプロイするように指定できます。 For example, the `main` branch could be used to deploy to the `edge` channel`while tagged releases could be used to deploy to the`stable` channel.
1. **並列パッケージ化** - Snap 以外に flatpak、.deb、.apk などとしてもパッケージ化されるソフトウェアの場合は、各パッケージ タイプをそれぞれのジョブに置き、すべてを並列に実行することができます。 これにより、Snap が完了するまで .deb パッケージを開始できないなどのケースに比べ、はるかに高速にビルドを完了できます。

生成された Snap ファイルをジョブ間で利用するには、必要に応じて CircleCI の `workspaces` を使用します。 次は、「送信元」ジョブのスニペットと「送信先」ジョブのスニペットを示します。

```yaml
# 既に Snap が存在するジョブから
      - persist_to_workspace:
          root: .
          paths:
            - "*.snap"
... # Snap が必要なジョブへ
      - attach_workspace:
          at: .
...
```

以下に、CircleCI 上で Snap パッケージをビルドするサンプル ファイルの全体を示します。 これと同じプロセスが \[CircleCI ローカル CLI\]\[local-cli-repo\] 用の Snap パッケージのビルドに使用されています。


## サンプル設定ファイルの全文
{: #full-example-config }

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cibuilds/snapcraft:stable
    steps:
      - checkout
      - run:
          name: "Snap のビルド"
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
          name: "ストアへのパブリッシュ"
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
              only: main
```
