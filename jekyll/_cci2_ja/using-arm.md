---
layout: classic-docs
title: "Arm 実行環境の使用"
description: "Arm 実行環境で実行するジョブの設定方法を説明します。"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

Machine Executor を使用して、Arm リソースを含む Linux 仮想マシンイメージを指定し、Armリソースクラスを指定すると、ジョブで Arm 実行環境を使用できます。

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

{:.tab.armblock.Server_v3_and_v4}
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

以下の Arm リソースは [`machine` Executor]({{site.baseurl}}/ja/configuration-reference/#machine-executor-linux) の一部としてご利用いただけます。

{% include snippets/ja/arm-resource-table.md %}

料金やプランの詳細は、[リソースクラスの料金の概要](https://circleci.com/ja/product/features/resource-classes/)を参照してください。

## Arm サポートを含むイメージ

Arm リソースは、Machine Executor を使って以下のいずれかのイメージを使用する際に利用できます。

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

Machine Executor イメージの全リストは、[CircleCI Developer Hub](https://circleci.com/developer/ja/images?imageType=machine) を参照してください。 イメージの更新に関する通知は、[CircleCI の Discuss](https://discuss.circleci.com/c/ecosystem/circleci-images/64)を参照してください。

## 制限事項
{: #limitations }

* 現時点では、実行ファイルが含まれる Orb の中には、Arm に**対応していない**ものがあります。 Orb の使用中に Arm 関連の問題が発生した場合は、[こちらから問題を報告してください](https://github.com/CircleCI-Public/arm-preview-docs/issues)。
* 現時点では、32 ビット版の Arm アーキテクチャはサポートされていません。 サポート対象は 64 ビット版の `arm64` アーキテクチャのみです。
* ジョブの実行が始まるまでに、最大 2 分のスピンアップ時間がかかることがあります。 この時間は、Arm リソースを利用するユーザーが増えるにつれ短縮されます。
* イメージに含まれていないソフトウェアが必要な場合は、[こちらからお知らせください](https://github.com/CircleCI-Public/arm-preview-docs/issues)。
* Server 3.xでは、VMサービスにEC2プロバイダ を使用している場合のみ、Armリソースを利用できます。 これは、GCP には Arm インスタンスが用意されていないためです。

### M1 Mac のサポート
{: #m1-mac-support }

M1 Mac でビルドした Docker イメージは、デフォルトでは CircleCI の標準のプラットフォームとの互換性がありません。 パイプラインの `spin up environment` ジョブにはグリーン表示されますが、以下のメッセージが表示されます。

```shell
WARNING: docker image ghcr.io/{your_username}/runner-test:latest targets wrong architecture (found arm64 but need [amd64 i386 386])
```

M1 でイメージをビルドする場合、デフォルトでは `arm64` でビルドされるため、 `docker build --platform linux/amd64` と指定する必要があります。


## 詳しく見る
{: #learn-more }
CircleCI Academy の [Armコース](https://academy.circleci.com/arm-course?access_code=public-2021)を受講すると、Armリソースの使用方法や関連するユースケースについてさらに詳しく学ぶことができます。
