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
          # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          name: Restore Cached Dependencies
          keys:
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}
      - run:
          name: Resolve/Update Dependencies
          command: stack --no-terminal setup
      - run:
          name: Run tests
          command: stack --no-terminal test
      - run:
          name: Install executable
          command: stack --no-terminal install
      - save_cache:
          name: Cache Dependencies
          key: cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
          paths:
            - "/root/.stack"
            - ".stack-work"
      - store_artifacts:
          # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/ 
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

For all `stack` invocations, `--no-terminal` is used to avoid the "sticky output" feature (implemented using `\b` characters) to pollute the CircleCI log with undisplayable characters.

{% raw %}
```yaml
    steps:

      - checkout
      - restore_cache:
          name: Restore Cached Dependencies
          keys:
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}
      - run:
          name: Resolve/Update Dependencies
          command: stack --no-terminal setup
      - save_cache:
          name: Cache Dependencies
          key: cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
          paths:
            - ~/.stack
            - ~/.stack-work
```
{% endraw %}

Note: It's also possible to use a `cabal` build file for caching dependencies. `stack`, however, is commonly recommended, especially for those new to the Haskell ecosystem. Because this demo app leverages `stack.yaml` and `package.yaml`, we use these two files as the cache key for our dependencies. `package.yaml` is more often updated than `stack.yaml` so that two keys are used to restore the cache. You can read more about the differences between `stack` and `cabal` on [The Haskell Tool Stack docs](https://docs.haskellstack.org/en/stable/stack_yaml_vs_cabal_package_file/).

Finally, we can run our application build commands. We'll run our tests first and then move on to install our executable. Running `stack install` will create a binary and move it to `~/.local/bin`.

```yaml
      - run:
          name: Run tests
          command: stack --no-terminal test
      - run:
          name: Install executable
          command: stack --no-terminal install
```

Finally, we can take the built executable and store it as an artifact.

```yaml
      - store_artifacts:
          # アーティファクト (https://circleci.com/docs/ja/2.0/artifacts/) に表示するビルド結果をアップロードします 
          path: ~/.local/bin/circleci-demo-haskell-exe 
          destination: circleci-demo-haskell-exe
```

Excellent! You are now setup on CircleCI with a Haskell app.

## Common Trouble Shooting

The command `stack test` may fail with an out of memory error. Consider adding the `-j1` flag to the `stack test` command as seen below (Note: this will reduce test execution to one core, decreasing memory usage as well, but may also increase your test execution time).

```yaml
      - run:
          name: Run tests
          command: stack --no-terminal test -j1
```

## See Also
{:.no_toc}

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.

The app described in this guide illustrates the simplest possible setup for a Haskell web app. Real-world projects will be more complex and you may find you need to customize and tweak settings from those illustrated here (such as the docker image or [configuration](https://docs.haskellstack.org/en/v1.0.2/docker_integration/) you use, or which Haskell build tools you use). Have fun!