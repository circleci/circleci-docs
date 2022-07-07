---
layout: classic-docs
title: "Arm 実行環境の使用"
description: "Arm 実行環境で実行するジョブの設定方法を説明します。"
redirect_from: /ja/2.0/arm-resources/
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

You can access the Arm execution environment for a job by using the machine executor, specifying a Linux virtual machine image that includes arm resources, and then specifying an Arm resource class.

{:.tab.armblock.Cloud}
```yaml
# .circleci/config.yml
jobs:
  my-job:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"
```

{:.tab.armblock.Server_v3}
```yaml
# .circleci/config.yml
jobs:
  my-job:
    machine:
      image: arm-default
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"
```

## 利用可能なリソースクラス
{: #available-resource-classes }

The following Arm resources are available part of the [`machine` executor]({{site.baseurl}}/2.0/configuration-reference/#machine-executor-linux):

{% include snippets/ja/arm-resource-table.md %}

For pricing and plans information, see the [resource class pricing overview](https://circleci.com/product/features/resource-classes/).

## Images with Arm support

Arm resources are accessible by using the machine executor when using one of the following images:

* `ubuntu-2004:current` - 最新版。全てのユーザーに推奨
* `ubuntu-2004:2022.04.1`
* `ubuntu-2004:202201-02`
* `ubuntu-2004:202201-01`
* `ubuntu-2004:202111-02`
* `ubuntu-2004:202111-01`
* `ubuntu-2004:202107-01`
* `ubuntu-2004:202104-01`
* `ubuntu-2004:202101-01`
* `ubuntu-2004:202011-01` - 2021 年 2 月 21 日にサポート終了

For a full list of machine executor images, see the [CircleCI Developer Hub](https://circleci.com/developer/images?imageType=machine). And for announcements about image updates, see [CircleCI Discuss](https://discuss.circleci.com/c/ecosystem/circleci-images/64).

## 制限事項
{: #limitations }

* Some orbs that include an executable may **not** be compatible with Arm at this time. Orb の使用中に Arm 関連の問題が発生した場合は、[こちらから問題を報告してください](https://github.com/CircleCI-Public/arm-preview-docs/issues)。
* 現時点では、32 ビット版の Arm アーキテクチャはサポートされていません。 サポート対象は 64 ビット版の `arm64` アーキテクチャのみです。
* ジョブの実行が始まるまでに、最大 2 分のスピンアップ時間がかかることがあります。 この時間は、Arm リソースを利用するユーザーが増えるにつれ短縮されます。
* イメージに含まれていないソフトウェアが必要な場合は、[こちらからお知らせください](https://github.com/CircleCI-Public/arm-preview-docs/issues)。
* Server 3.xでは、VMサービスにEC2プロバイダ を使用している場合のみ、Armリソースを利用できます。 これは、GCP には Arm インスタンスが用意されていないためです。
* CircleCI does not currently support ARM with our Docker executor. If you would like to follow updates on this functionality, please refer to the following Canny post: [Support ARM resource class on Docker executor](https://circleci.canny.io/cloud-feature-requests/p/support-arm-resource-class-on-docker-executor).

### M1 Mac のサポート
{: #m1-mac-support }

M1 Mac でビルドした Docker イメージは、デフォルトでは CircleCI の標準のプラットフォームとの互換性がありません。 The `spin up environment` job in your pipelines will give you a green tic, but you will see the following message in the response:

```shell
WARNING: docker image ghcr.io/{your_username}/runner-test:latest targets wrong architecture (found arm64 but need [amd64 i386 386])
```

M1 でイメージをビルドする場合、デフォルトでは `arm64` でビルドされるため、 `docker build --platform linux/amd64` と指定する必要があります。


## 詳しく見る
{: #learn-more }
CircleCI Academy の [Armコース](https://academy.circleci.com/arm-course?access_code=public-2021)を受講すると、Armリソースの使用方法や関連するユースケースについてさらに詳しく学ぶことができます。
