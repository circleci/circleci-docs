---
layout: classic-docs
title: "Orb、ジョブ、ステップ、ワークフロー"
short-title: "Orb、ジョブ、ステップ、ワークフロー"
description: "ジョブとステップの説明"
categories:
  - migration
order: 2
---

このドキュメントでは、Orb、ジョブ、ステップ、ワークフローの概要を説明しています。

* 目次
{:toc}

## Orb の概要
{: #orbs-overview }
_Orbs are not currently available on self-hosted installations of CircleCI Server._

Orbs are packages of config that you either import by name or configure inline to simplify your config, share, and reuse config within and across projects. See [Using Orbs]({{ site.baseurl }}/2.0/using-orbs/) for details about how to use orbs in your config and an introduction to orb design. Visit the [Orbs Registry](https://circleci.com/developer/orbs) to search for orbs to help simplify your config.

## ジョブの概要
{: #jobs-overview }

Jobs are collections of steps. All of the steps in the job are executed in a single unit, either within a fresh container or VM.

The following diagram illustrates how data flows between jobs:
* ワークスペースは、同じワークフロー内のジョブ間でデータを維持します。
* キャッシュは、異なるワークフロー ビルドにある同じジョブ間でデータを維持します。
* アーティファクトは、ワークフローの終了後にデータを維持します。

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
