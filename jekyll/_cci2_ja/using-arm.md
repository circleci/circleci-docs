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

ここでは、CircleCI の Arm リソースを使う上で必要なセットアップ手順について説明します。 Arm リソースはクラウド版および Server 3.x.で利用可能です。


**現在、Docker Executor では ARM をサポートしていません。**この機能の更新については、下記のフィーチャーリクエスト 「[Docker Executor で ARM リソースクラスをサポートする](https://circleci.canny.io/cloud-feature-requests/p/support-arm-resource-class-on-docker-executor")」を参照してください。
{: class="alert alert-warning"}

## 概要
{: #overview }
CircleCI には、さまざまなジョブ実行環境があります。 CircleCI の `config.yml` ファイルで [`resource_class`]({{site.baseurl}}/ja/2.0/configuration-reference/#resource_class) キーを指定することで、ジョブに合った実行環境を選ぶことができます。 Arm リソースは [`machine` Executor]({{site.baseurl}}/ja/2.0/configuration-reference/#machine-executor-linux) の一部であり、次の 4 種類があります。

* `arm.medium` - `arm64` アーキテクチャ、2 vCPU、8GB RAM
* `arm.large` - `arm64` アーキテクチャ、4 vCPU、16GB RAM
* `arm.xlarge` - `arm64` アーキテクチャ, 8 vCPU, 32GB RAM
* `arm.2xlarge` - `arm64` アーキテクチャ, 16 vCPU, 64GB RAM

使用するイメージは、次のものから選択できます。

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

いずれのリソース クラスも `machine` Executor リソースであり、占有の VM となります。この VM はジョブのみのために作成され、ジョブの実行が完了すると削除されます。

## 料金と提供プラン
{: #pricing-and-availability }

以下の Arm リソース クラスは、すべての CircleCI ユーザーがご利用いただけます。

| リソース クラス名     | スペック                            | 提供プラン                    |
| ------------- | ------------------------------- | ------------------------ |
| `arm.medium`  | 2 vCPUs, 8GB RAM, 100 GB Disk   | Free, Performance, Scale |
| `arm.large`   | 4 vCPUs, 16GB RAM, 100 GB Disk  | Performance、Scale        |
| `arm.xlarge`  | 8 vCPUs, 32GB RAM, 100 GB Disk  | Performance、Scale        |
| `arm.2xlarge` | 16 vCPUs, 64GB RAM, 100 GB Disk | Scale                    |
{: class="table table-striped"}

料金と提供プランの詳細については、[料金ページ](https://circleci.com/ja/pricing/)をご覧ください。

## Arm リソースの使用方法
{: #using-arm-resources }

Arm リソースを使用するには、`.circleci/config.yml` ファイルを書き換える必要があります。 次の設定例を参考にしてください。

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

1 つの設定ファイル内、および 1 つのワークフロー内でも、複数のリソースを混在させることができます。

## 関連項目
{: #limitations }

* 現在、実行ファイルが含まれる Orb の中には、Arm に**対応していない**ものがあります。 Orb の使用中に Arm 関連の問題が発生した場合は、[こちらから問題を報告してください](https://github.com/CircleCI-Public/arm-preview-docs/issues)。
* 現時点では、32 ビット版の Arm アーキテクチャはサポートされていません。 サポート対象は 64 ビット版の `arm64` アーキテクチャのみです。
* ジョブの実行が始まるまでに、最大 2 分のスピンアップ時間がかかることがあります。 この時間は、Arm リソースを利用するユーザーが増えるにつれ短縮されます。
* イメージに含まれていないソフトウェアが必要な場合は、[こちらからお知らせください](https://github.com/CircleCI-Public/arm-preview-docs/issues)。
* Server 3.xでは、VMサービスにEC2プロバイダ を使用している場合のみ、Armリソースを利用できます。 これは、GCP には Arm インスタンスが用意されていないためです。

### M1 Mac のサポート
{: #m1-mac-support }

M1 Mac でビルドした Docker イメージは、デフォルトでは CircleCI の標準のプラットフォームとの互換性がありません。 "環境のスピンアップ" ジョブにはグリーン表示されますが、以下のメッセージが表示されます。

```shell
WARNING: docker image ghcr.io/{your_username}/runner-test:latest targets wrong architecture (found arm64 but need [amd64 i386 386])
```

M1 でイメージをビルドする場合、デフォルトでは `arm64` でビルドされるため、 `docker build --platform linux/amd64` と指定する必要があります。


## 詳しく見る
{: #learn-more }
CircleCI Academy の [Armコース](https://academy.circleci.com/arm-course?access_code=public-2021)を受講すると、Armリソースの使用方法や関連するユースケースについてさらに詳しく学ぶことができます。
