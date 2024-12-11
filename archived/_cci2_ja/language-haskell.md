---
layout: classic-docs
title: "言語ガイド: Haskell"
short-title: "Haskell"
description: "Building and Testing with Haskell on CircleCI"
categories:
  - language-guides
order: 2
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

This guide will help you get started with a basic Haskell application on CircleCI. お急ぎの場合は、以下の設定ファイルの例をプロジェクトのルート ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) に貼り付け、ビルドを開始してください。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

CircleCI でビルドを行う Haskell プロジェクトのサンプルは、以下のリンクから確認できます。

- <a href="https://github.com/CircleCI-Public/circleci-demo-haskell"
target="_blank">GitHub 上の Haskell デモ プロジェクト</a>

このプロジェクトには、コメント付きの CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-haskell/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。


## 設定ファイルの例
{: #sample-configuration }

{% raw %}

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: fpco/stack-build:lts
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - restore_cache:
          # 依存関係のキャッシュについては https://circleci.com/ja/docs/2.0/caching/ をお読みください
          name: キャッシュされた依存関係の復元
          keys:
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}
      - run:
          name: 依存関係の解決・更新
          command: stack --no-terminal setup
      - run:
          name: テストの実行
          command: stack --no-terminal test
      - run:
          name: 実行可能ファイルのインストール
          command: stack --no-terminal install
      - save_cache:
          name: 依存関係のキャッシュ
          key: cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
          paths:
            - "/root/.stack"
            - ".stack-work"
      - store_artifacts:
          # アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示するためにテスト サマリーをアップロードします
          path: ~/.local/bin/circleci-demo-haskell-exe
          destination: circleci-demo-haskell-exe

```

{% endraw %}

## 設定ファイルの詳細
{: #config-walkthrough }

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2.1
```

次に、`jobs` キーを記述します。 1 つひとつのジョブがワークフロー内の各段階を表します。 このサンプル アプリケーションには 1 つの `build` ジョブのみが必要なので、このキーの下にすべてのステップとコマンドを記述します。

実行処理は 1 つ以上の[ジョブ]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)で構成されます。 この実行では [ワークフロー]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows)を使用しないため、`build` ジョブを記述する必要があります。

ジョブの各ステップは [Executor]({{ site.baseurl }}/ja/2.0/executor-intro/) という仮想環境で実行されます。

この例では [`docker`]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker) Executor を使用して、カスタム Docker イメージを指定しています。 最初に記述したイメージが、ジョブの[プライマリ コンテナ]({{ site.baseurl }}/ja/2.0/glossary/#primary-container)になります。

`stack` 呼び出しのすべてで `--no-terminal` を指定して、表示できない文字で CircleCI ログが汚れてしまう「厄介な」出力機能 (`\b` 文字で実装) を回避します。

```yaml
jobs:
  build:
    docker:
      - image: fpco/stack-build:lts
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

これで、この環境で Haskell ビルド ツール `stack` を実行するように設定できました。 `config.yml` ファイルの残りの部分はすべて `steps` キーのブロックです。

最初のステップで `checkout` を実行してリポジトリのコードをプルし、この環境に準備します。

次に、ビルド時間を短縮するために復元可能な依存関係があるかどうかを確認します。 続いて `stack setup` を実行し、`stack.yaml` 設定ファイルで指定した Haskell コンパイラーをプルします。

`stack` 呼び出しのすべてで `--no-terminal` を指定して、表示できない文字で CircleCI ログが汚れてしまう「厄介な」出力機能 (`\b` 文字で実装) を回避します。

{% raw %}
```yaml
    steps:
      - checkout
      - restore_cache:
          name: キャッシュされた依存関係の復元
          keys:
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}
      - run:
          name: 依存関係の解決・更新
          command: stack --no-terminal setup
      - save_cache:
          name: 依存関係のキャッシュ
          key: cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
          paths:
            - ~/.stack
            - ~/.stack-work
```
{% endraw %}

メモ: `cabal` ビルド ファイルを使用して、依存関係をキャッシュすることも可能です。 ただし、特に Haskell エコシステムに慣れていない場合は、一般に `stack` を使用することをお勧めします。 このデモ アプリでは `stack.yaml` と `package.yaml` を利用しているため、この 2 つのファイルを依存関係のキャッシュ キーとして使用します。 `package.yaml` は `stack.yaml` よりも頻繁に更新されるため、この 2 つのキーをキャッシュの復元に使用します。 `stack` と `cabal` の違いについては、[Haskell ツール スタックに関するドキュメント](https://docs.haskellstack.org/en/stable/stack_yaml_vs_cabal_package_file/)を参照してください。

さらに、アプリケーションのビルド コマンドを実行します。 先にテストを実行してから、実行可能ファイルをインストールします。 `stack install` を実行すると、バイナリが作成されて `~/.local/bin` に配置されます。

```yaml
      - run:
          name: テストの実行
          command: stack --no-terminal test
      - run:
          name: 実行可能ファイルのインストール
          command: stack --no-terminal install
```

最後に、ビルドされた実行可能ファイルを取得し、アーティファクトとして保存します。

```yaml
      - store_artifacts:
          # アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示するためにビルド結果をアップロードします
          path: ~/.local/bin/circleci-demo-haskell-exe 
          destination: circleci-demo-haskell-exe
```

完了です。 これで Haskell アプリケーション用に CircleCI を構成できました。

## 一般的なトラブルシューティング
{: #common-troubleshooting }

`stack test` コマンドは、メモリ不足エラーで失敗する場合があります。 以下に示すように、`stack test` コマンドに `-j1` フラグを追加することを検討してみてください (メモ: これにより、テストを実行するコア数を 1 に減らして、メモリ使用量を抑えられますが、テストの実行時間が長くなる可能性があります)。

```yaml
      - run:
          name: テストの実行
          command: stack --no-terminal test -j1
```

## 関連項目
{: #see-also }
{:.no_toc}

デプロイ ターゲットの構成例については、「[デプロイの構成i]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。

このガイドでは、Haskell Web アプリの最も単純な構成例を示しました。 通常、実際のプロジェクトはこれよりも複雑です。 場合によっては、この例で示されている構成をカスタマイズまたは微調整する必要があります (Docker イメージ、使用する[設定](https://docs.haskellstack.org/en/v1.0.2/docker_integration/)、使用する Haskell ビルド ツールなど)。 ぜひお試しください。

