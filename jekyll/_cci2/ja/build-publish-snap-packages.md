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

Snap のパブリッシュは、約 2 手順のプロセスです。Linux マシンでは次のようになります。

```Bash
snapcraft login
# Ubuntu One アカウントでログインするためプロンプトに従う
snapcraft export-login snapcraft.login
base64 snapcraft.login | xsel --clipboard
```

1. ローカルマシンで、CircleCI にアップロードする「ログインファイル」を作成します。 ローカルマシンにこれらのツールが既にインストールされており、Snapcraft Store にログインしている (`snapcraft login`) と想定すると、`snapcraft export-login snapcraft.login` コマンドを使用して、`snapcraft.login` という名前のログインファイルを生成します。 このファイルの公開や、Git リポジトリに保存されることは望ましくないため、このファイルを base64 エンコードし、`$SNAPCRAFT_LOGIN_FILE` という名前の [非公開環境変数](https://circleci.com/docs/2.0/env-vars/#adding-environment-variables-in-the-app) に保存します。

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

1. ファイルの base64 エンコードされたバージョンが、非公開環境変数として CircleCI に保存されたら、そのファイルをビルド内で使用して、ストアへ自動的にパブリッシュできます。

この例では、Snapcraft が `.snapcraft/snapcraft.cfg` 内のログイン資格情報を自動的に探し、以前に作成した環境変数がその場所にデコードされます。 その後で、`snapcraft push` コマンドを使用して .snap ファイルが Snap Store にアップロードされます。

### アップロードとリリースの相違

`snapcraft push *.snap` はデフォルトで、Snap を Snap Store にアップロードし、サーバー側でストアチェックを実行してから停止します。 スナップ「解放」されません。これは、ユーザーが更新を自動的に確認できないということです。 `snap release <release-id>` コマンドを使用するか、Snap Store にログインして [リリース] ボタンをクリックすると、Snap をローカルにパブリッシュできます。

一般的な CircleCI の形式のように、これらを完全に自動化できます (上述の例のように) が、この場合は `--release <channel>` フラグを使用します。 これにより Snap がアップロードされ、Store 側での検証が行われてから、指定のチャンネルに Snap が自動的にリリースされます。

## Workflows

複数のジョブを利用すると、Snap ビルドをより的確に整理できます。 実際のプロジェクトをビルド/コンパイルするジョブ、Snap 自体をビルドするジョブ、`master` にのみ Snap (および他のパッケージ) をパブリッシュするジョブなどが便利です。

[Workflows](https://circleci.com/docs/2.0/workflows/) を使用すると、Snap のビルドに 2 つの点で役立ちます。

1. **Snap Store チャンネル** - 前のセクションで述べたように、Store にアップロードするとき、同時にリリースも選択できます。 これによって、CircleCI の特定のジョブを、特定の Snap チャンネルにデプロイするよう割り当てできます。 たとえば、`master` ブランチを使用して `edge` チャンネルにデプロイし、`同時にタグ付けされたリリースを使用して`安定したチャンネルにデプロイできます。
2. **パッキングの並列化** - ソフトウェアが Snap として以外に、flatpak、.deb、apk など他のものとしてもパッケージされる場合、各パッケージタイプを独自のジョブに配置し、すべて並列実行できます。 これによって、Snap が完了してから .deb パッケージのビルドを開始するなどの順に処理を行うよりも、はるかに短時間でビルドが完了します。

CircleCI `workspaces` を使用して、生成された Snap ファイルを必要なときにジョブ間で移動できます。「from」ジョブのスニペットと、「to」ジョブのスニペットの例を次に示します。

```yaml
... # 既に Snap が存在するジョブから
      - persist_to_workspace:
          root: .
          paths:
            - "*.snap"
... # Snap を必要とする次のジョブへ
      - attach_workspace:
          at: .
...
```

以下に示すのは、CircleCI で Snap パッケージをビルドする方法を示す完全な例です。\[CircleCI Local CLI\]\[local-cli-repo\] 用の Snap パッケージをビルドするときにも、同じプロセスが使用されます。

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