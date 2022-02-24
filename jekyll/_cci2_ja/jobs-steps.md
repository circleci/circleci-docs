---
layout: classic-docs
title: "Orb、ジョブ、ステップ、ワークフロー"
short-title: "Orb、ジョブ、ステップ、ワークフロー"
description: "ジョブとステップの説明"
categories:
  - 移行
order: 2
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このドキュメントでは、Orb、ジョブ、ステップ、ワークフローの概要を説明します。

* 目次
{:toc}

## Orb の概要
{: #orbs-overview }

Orb は、名前に基づいてインポートする、またはインラインで設定する設定ファイルのパッケージです。Orb により、プロジェクト内またはプロジェクト間で設定ファイルを共有および再利用して設定作業を簡略化することができます。 設定ファイルで Orb を使用する方法と Orb 設計の概要については、[Orb のコンセプト]({{ site.baseurl }}/ja/2.0/orb-concepts/)を参照してください。 [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)では、設定作業の簡素化に役立つ Orb を検索できます。

## ジョブの概要
{: #jobs-overview }

ジョブはステップの集まりです。 ジョブ内のすべてのステップが 1 単位として新しいコンテナまたは仮想マシン内で実行されます。

下図はジョブ間のデータフローを表したものです。
* ワークスペースは、同じワークフロー内のジョブ間でデータを維持します。
* キャッシュは、異なるワークフローの実行における同じジョブ間でデータを永続化します。
* アーティファクトは、ワークフローの終了後にデータを永続化します。

![Jobs Overview]( {{ site.baseurl }}/assets/img/docs/jobs-overview.png)

Jobs can be run using the `machine` (linux), macOS or Windows executors, or the `docker` executor, which can compose Docker containers to run your jobs and any services they require, such as databases.

When using the `docker` executor the container images listed under the `docker:` keys specify the containers to start. Any public Docker images can be used with the `docker` executor.

See the [Choosing an Executor Type]({{ site.baseurl }}/2.0/executor-types/) document for use cases and comparisons of the different executor types.

## ステップの概要
{: #steps-overview }

Steps are a collection of executable commands which are run during a job, the `checkout:` key is required to checkout your code and a key for `run:` enables addition of arbitrary, multi-line shell command scripting.  In addition to the `run:` key, keys for `save_cache:`, `restore_cache:`,  `deploy:`, `store_artifacts:`, `store_test_results:` and `add_ssh_keys` are nested under Steps.

## インポートした Orb を使用した設定ファイルの例
{: #sample-configuration-with-imported-orb }

Find full details of the AWS S3 orb in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs/orb/circleci/aws-s3#commands-sync).

```yaml
version: 2.1

orbs:
  aws-s3: circleci/aws-s3@1.0.0 # circleci 名前空間に s3 Orb をインポートします

workflows:
  build-test-deploy:
    jobs:

      - deploy2s3: # ワークフローで定義するサンプル ジョブ
          steps:
            - aws-s3/sync: # s3 Orb で宣言されている sync コマンドを呼び出します
                from: .
          to: "s3://mybucket_uri"
                overwrite: true
          to: "s3://mybucket_uri"
          overwrite: true

workflows:
  build-test-deploy:
    jobs:
      - deploy2s3
```

## 並列ジョブを使用した設定ファイルの例
{: #sample-configuration-with-concurrent-jobs }

Following is a sample 2.0 `.circleci/config.yml` file.

{% raw %}
```yaml
version: 2
    jobs:
      build:
        docker:

          - image: circleci/<language>:<version TAG>
        steps:
          - checkout
          - run: <command>
      test:
        docker:
          - image: circleci/<language>:<version TAG>
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
{: #see-also }

- [構成リファレンス: jobs キー]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)
- [構成リファレンス: steps キー]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps)
