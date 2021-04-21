---
layout: classic-docs
title: "Arm リソース"
short-title: "CircleCI の Arm リソースの使用"
description: "CircleCI の Arm リソースの使用"
version:
  - Cloud
---

# 概要
{: #overview }

This document will walk you through the setup steps required to use an Arm resource on CircleCI. Arm resources are not available on CircleCI Server 1.x or 2.x.

CircleCI offers multiple kinds of environments for you to run jobs in. In your CircleCI `config.yml` file you can choose the right environment for your job using the [`resource_class`]({{site.baseurl}}/2.0/configuration-reference/#resource_class) key. CircleCI offers two Arm resources as part of the [`machine` executor]({{site.baseurl}}/2.0/configuration-reference/#machine-executor-linux):

* `arm.medium` - `arm64` アーキテクチャ、2 vCPU、8GB RAM
* `arm.large` - `arm64` アーキテクチャ、4 vCPU、16GB RAM

Which are available under these images:

* `ubuntu-2004:202101-01` - 最新版であり、すべてのユーザーに推奨
* `ubuntu-2004:202011-01` - 2021 年 2 月 21 日にサポート終了

As these are `machine` executor resources, each class is a dedicated VM that is created specifically for your job and subsequently taken down after the job has finished running.

## 料金と提供プラン
{: #pricing-and-availability }

The following Arm resource class is available to all CircleCI customers:

| Resource class name | Specs             | Requisite Plan                   |
| ------------------- | ----------------- | -------------------------------- |
| `arm.medium`        | 2 vCPUs, 8GB RAM  | Free, Performance, Scale, Custom |
| `arm.large`         | 4 vCPUs, 16GB RAM | Performance, Scale               |
{: class="table table-striped"}

For pricing and availability check out our [Pricing](https://circleci.com/pricing/) page.

At this moment, Arm resources are only available on our cloud offering. If you are a CircleCI Server customer and are looking to try Arm resources, consider creating a CircleCI Cloud account, or contact your Customer Success Manager to request Arm on Server.

## Arm リソースの使用方法
{: #using-arm-resources }

Update your `.circleci/config.yml` file to use Arm resources. Consider the example config:

```yaml
# .circleci/config.yml
version: 2.1

jobs:
  build-medium:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

  build-large:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.large
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

workflows:
  build:
    jobs:
      - build-medium
      - build-large
```

Please note that it is indeed possible to mix various resources in the same configuration (and even the same workflow).

## 制限事項
{: #limitations }

* 現在、実行可能ファイルが含まれる Orb の中には、Arm に**対応していない**ものがあります。 Orb の使用中に Arm 関連の問題が発生した場合は、[こちらから問題を報告してください](https://github.com/CircleCI-Public/arm-preview-docs/issues)。
* 現時点では、32 ビット版の Arm アーキテクチャはサポートされていません。 サポート対象は 64 ビット版の `arm64` アーキテクチャのみです。
* ジョブの実行が始まるまでに、最大 2 分のスピンアップ時間がかかることがあります。 この時間は、Arm リソースを利用するユーザーが増えるに連れ短縮されます。
* イメージに含まれていないソフトウェアが必要な場合は、[こちらからお知らせください](https://github.com/CircleCI-Public/arm-preview-docs/issues)。
