---
layout: classic-docs
title: "Orbs、ジョブ、ステップ、ワークフロー"
short-title: "Orbs、ジョブ、ステップ、ワークフロー"
description: "ジョブとステップの説明"
categories:
  - migration
order: 2
---

The document provides an overview of orbs, jobs, steps and workflows.

- 目次
{:toc}

## Orbs の概要

Orbs は、名前に基づいてインポートするかインラインで構成する、設定ファイルのパッケージです。プロジェクト内またはプロジェクト間で共有および再利用して、構成作業を簡略化することができます。 設定ファイルで Orbs を使用する方法と Orb 設計の概要については、[Orb の使用に関するドキュメント]({{ site.baseurl }}/2.0/using-orbs/)を参照してください。 [CircleCI Orb レジストリ](https://circleci.com/orbs/registry/)では、構成作業の簡素化に役立つ Orb を検索できます。

## ジョブの概要

Jobs are collections of steps. All of the steps in the job are executed in a single unit, either within a fresh container or VM.

The following diagram illustrates how data flows between jobs:

- Workspaces persist data between jobs in a single workflow. 
- Caching persists data between the same job in different workflows runs. 
- Artifacts persist data after a workflow has finished.

![Jobs Overview]({{ site.baseurl }}/assets/img/docs/jobs-overview.png)

Jobs can be run using the `machine` (linux), macOS or Windows executors, or the `docker` executor, which can compose Docker containers to run your jobs and any services they require, such as databases.

`docker` Executor を使用する場合、起動するコンテナのイメージを `docker:` キーの下に指定します。 `docker` Executor には任意のパブリック Docker イメージを使用できます。

See the [Choosing an Executor Type]({{ site.baseurl }}/2.0/executor-types/) document for use cases and comparisons of the different executor types.

## ステップの概要

ステップは、ジョブ中に実行される実行可能なコマンドの集まりです。コードをチェック アウトするには `checkout:` キーを指定します。また、`run:` キーを使用すると、複数行にわたる任意のシェル コマンド スクリプトを追加できます。 `run:` キーのほかに、`save_cache:`、`restore_cache:`、`deploy:`、`store_artifacts:`、`store_test_results:`、`add_ssh_keys` などのキーをステップの下にネストします。

## インポートした Orb を使用した設定ファイルの例

Find full details of the AWS S3 orb in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/orb/circleci/aws-s3#commands-sync).

```yaml
version: 2.1

orbs:
  aws-s3: circleci/aws-s3@x.y.z #imports the s3 orb in the circleci namespace
  # x.y.z should be replaced with the orb version you wish to use
jobs:
  deploy2s3: 
    docker: 

      - image: cimg/<language>:<version TAG>
    steps:
      - aws-s3/sync: #invokes the sync command declared in the s3 orb
          from: .
          to: "s3://mybucket_uri"
          overwrite: true

workflows:
  build-test-deploy:
    jobs:

      - deploy2s3
```

## Sample Configuration with Concurrent Jobs

Following is a sample 2.0 `.circleci/config.yml` file.

{% raw %}
```yaml
version: 2

jobs:
  build:
    docker:

      - image: cimg/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: cimg/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test
```
{% endraw %}

This example shows a concurrent job workflow where the `build` and `test` jobs run concurrently to save time. Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for complete details about orchestrating job runs with concurrent, sequential, and manual approval workflows.

## 関連項目

- [Configuration Reference Jobs Key]({{ site.baseurl }}/2.0/configuration-reference/#jobs)
- [Configuration Reference Steps Key]({{ site.baseurl }}/2.0/configuration-reference/#steps)