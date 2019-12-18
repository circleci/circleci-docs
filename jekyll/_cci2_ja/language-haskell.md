---
layout: classic-docs
title: "言語ガイド：Haskell"
short-title: "Haskell"
description: "CircleCI 2.0 での Haskell を使用したビルドとテスト"
categories:
  - language-guides
order: 2
---

このガイドでは、CircleCI 2.0 で基本的な Haskell アプリケーションを作成する方法について説明します。お急ぎの場合は、以下の設定例をプロジェクトの root ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) にコピーし、ビルドを開始してください。

- 目次
{:toc}

## 概要

{:.no_toc}

CircleCI でビルドされた Haskell プロジェクトのサンプルは、以下のリンクから確認できます。

- <a href="https://github.com/CircleCI-Public/circleci-demo-haskell"
target="_blank">GitHub 上の Haskell デモプロジェクト</a>

このプロジェクトには、コメント付きの CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-haskell/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。

## 設定例

{% raw %}

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: fpco/stack-build:lts
    steps:
      - checkout
      - restore_cache:
          # 依存関係キャッシュについては https://circleci.com/docs/ja/2.0/caching/ をお読みください
          name: キャッシュされた依存関係を復元
          keys:
            - cci-demo-haskell-v1-{{ checksum "package.yaml" }}-{{ checksum "stack.yaml" }}
      - run:
          name: 依存関係を解決・更新
          command: stack setup
      - run:
          name: テストを実行
          command: stack test
      - run:
          name: 実行可能ファイルをインストール
          command: stack install
      - save_cache:
          name: 依存関係をキャッシュ
          key: cci-demo-haskell-v1-{{ checksum "package.yaml" }}-{{ checksum "stack.yaml" }}
          paths:
            - "/root/.stack"
            - ".stack-work"
      - store_artifacts:
          # アーティファクト (https://circleci.com/docs/ja/2.0/artifacts/) に表示するテストサマリーをアップロードします
          path: ~/.local/bin/circleci-demo-haskell-exe
          destination: circleci-demo-haskell-exe

```

{% endraw %}

## 設定の詳細

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始まります。 このキーは、互換性を損なう変更に関する警告を表示するために使用されます。

```yaml
version: 2.1
```

次に、`jobs` キーを置きます。 それぞれのジョブは、ワークフロー内の各段階を表しています。 このサンプルアプリケーションには 1つの `build` ジョブのみが必要なので、このキーの下にすべてのステップとコマンドを置きます。

1回の実行は 1つ以上の[ジョブ]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)で構成されます。 この実行では [Workflows]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows) を使用していないため、`build` ジョブを持つ必要があります。

ジョブのステップは [Executor]({{ site.baseurl }}/ja/2.0/executor-types/) という名前の仮想環境で実行されます。

この例では [`docker`]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker) Executor を使用して、カスタム Docker イメージを指定しています。 リストの先頭にあるイメージがジョブの[プライマリコンテナ]({{ site.baseurl }}/ja/2.0/glossary/#primary-container)になります。

ジョブのすべてのコマンドは、このコンテナで実行されます。

```yaml
jobs:
  build:
    docker:
      - image: fpco/stack-build:lts
```

これで、この環境で Haskell ビルドツール `stack` を実行するように設定できました。 `config.yml` ファイルの残りの部分はすべて `steps` キーの下にあります。

最初のステップで `checkout` を実行してリポジトリのコードをプルし、この環境に準備します。

次に、ビルド時間を短縮するために復元可能な依存関係があるかどうかを確認します。 その後 `stack setup` を実行して、`stack.yaml` コンフィグで指定された Haskell コンパイラーにプルします。

{% raw %}

```yaml
    steps:

      - checkout
      - restore_cache:
          name: Restore Cached Dependencies
          keys:
            - cci-demo-haskell-v1-{{ checksum "package.yaml" }}-{{ checksum "stack.yaml" }}
      - run:
          name: Resolve/Update Dependencies
          command: stack setup
      - save_cache:
          name: Cache Dependencies
          key: cci-demo-haskell-v1-{{ checksum "package.yaml" }}-{{ checksum "stack.yaml" }}
          paths:
            - ~/.stack
            - ~/.stack-work
```

{% endraw %}

メモ：`cabal` ビルドファイルを使用して、依存関係をキャッシュすることも可能です。 ただし、特に Haskell エコシステムに慣れていない場合は、一般に `stack` を使用することをお勧めします。 このデモアプリでは `stack.yaml` と `package.yaml` を利用しているため、この 2つのファイルを依存関係のキャッシュキーとして使用します。 `stack` と `cabal` の違いについては、[Haskell ツールスタックに関するドキュメント](https://docs.haskellstack.org/en/stable/stack_yaml_vs_cabal_package_file/)を参照してください。

さらに、アプリケーションのビルドコマンドを実行します。 まずテストを実行し、次に実行可能ファイルをインストールします。 `stack install` を実行すると、バイナリが作成されて `~/.local/bin` に置かれます。

```yaml
      - run:
          name: テストを実行
          command: stack test
      - run:
          name: 実行可能ファイルをインストール
          command: stack install
```

最後に、ビルドされた実行可能ファイルを取得し、アーティファクトとして保存します。

```yaml
      - store_artifacts:
          # アーティファクト (https://circleci.com/docs/ja/2.0/artifacts/) に表示するビルド結果をアップロードします
          path: ~/.local/bin/circleci-demo-haskell-exe
          destination: circleci-demo-haskell-exe
```

完了です。 これで Haskell アプリケーション用に CircleCI を設定できました。

## 関連項目

{:.no_toc}

デプロイターゲットの設定例については、「[デプロイの設定]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。

このガイドでは、Haskell Web アプリの最も単純な設定例を示しました。通常、実際のプロジェクトはこれよりも複雑です。場合によっては、この例で示されている設定をカスタマイズまたは微調整する必要があります (Docker イメージ、使用する[設定](https://docs.haskellstack.org/en/v1.0.2/docker_integration/)、使用する Haskell ビルドツールなど)。 ぜひお試しください。
