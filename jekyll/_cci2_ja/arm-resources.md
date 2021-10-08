---
layout: classic-docs
title: "Arm リソース"
short-title: "CircleCI の Arm リソースの使用"
description: "CircleCI の Arm リソースの使用"
version:
  - Cloud
  - Server v3.x
---

# 概要
{: #overview }

ここでは、CircleCI の Arm リソースを使う上で必要なセットアップ手順について説明します。 Arm リソースはクラウド版および Server 3.x.で利用可能です。

CircleCI には、さまざまなジョブ実行環境があります。 CircleCI の `config.yml` ファイルで [`resource_class`]({{site.baseurl}}/ja/2.0/configuration-reference/#resource_class) キーを指定することで、ジョブに合った実行環境を選ぶことができます。 Arm リソースは [`machine` Executor]({{site.baseurl}}/ja/2.0/configuration-reference/#machine-executor-linux) の一部であり、次の 2 種類があります。

* `arm.medium` - `arm64` アーキテクチャ、2 vCPU、8GB RAM
* `arm.large` - `arm64` アーキテクチャ、4 vCPU、16GB RAM

使用するイメージは、次のものから選択できます。

* `ubuntu-2004:202101-01` - 最新版であり、すべてのユーザーに推奨
* `ubuntu-2004:202011-01` - 2021 年 2 月 21 日にサポート終了

いずれのリソース クラスも `machine` Executor リソースであり、専用の VM となります。 この VM はジョブのみのために作成され、ジョブの実行が完了すると削除されます。

## 料金と提供プラン
{: #pricing-and-availability }

以下の Arm リソース クラスは、すべての CircleCI ユーザーがご利用いただけます。

| リソース クラス名    | スペック            | 提供プラン                         |
| ------------ | --------------- | ----------------------------- |
| `arm.medium` | 2 vCPU、8GB RAM  | Free、Performance、Scale、Custom |
| `arm.large`  | 4 vCPU、16GB RAM | Performance、Scale             |
{: class="table table-striped"}

料金と提供プランの詳細については、[料金ページ](https://circleci.com/ja/pricing/)をご覧ください。

## Arm リソースの使用方法
{: #using-arm-resources }

Update your `.circleci/config.yml` file to use Arm resources. Consider the example config:

{:.tab.armblock.Cloud}
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
{:.tab.armblock.Server}
```yaml
# .circleci/config.yml
version: 2.1

jobs:
  build-medium:
    machine:
      image: arm-default
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

  build-large:
    machine:
      image: arm-default
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
* In server 3.x, Arm resources are only available when using the EC2 provider for VM service. This is because there are no Arm instances available in GCP.


## Learn More
{: #learn-more }
Take the [Arm course](https://academy.circleci.com/arm-course?access_code=public-2021) with CircleCI Academy to learn more about using Arm resources and associated use cases.
