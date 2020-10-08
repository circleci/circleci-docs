---
layout: classic-docs
title: "Orbs、ジョブ、ステップ、ワークフロー"
short-title: "Orbs、ジョブ、ステップ、ワークフロー"
description: "ジョブとステップの説明"
categories:
  - migration
order: 2
---

ジョブ、ステップ、ワークフローに加え、Orbs に使用する新しい [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) キーについて概説します。

- 目次
{:toc}

## Orbs の概要

Orbs は、名前に基づいてインポートするかインラインで構成する、設定ファイルのパッケージです。プロジェクト内またはプロジェクト間で共有および再利用して、構成作業を簡略化することができます。 設定ファイルで Orbs を使用する方法と Orb 設計の概要については、[Orb の使用に関するドキュメント]({{ site.baseurl }}/ja/2.0/using-orbs/)を参照してください。 [CircleCI Orb レジストリ](https://circleci.com/developer/orbs)では、構成作業の簡素化に役立つ Orb を検索できます。

## ジョブの概要

ジョブはステップの集まりです。 ジョブ内のステップはすべて 1 単位として実行され、その際にプランから CircleCI コンテナが 1 つ消費されます。

ジョブとステップはきめ細かく制御できます。ワークフローのフレームワークが提供され、各フェーズでのステータスを確認できるため、高頻度のフィードバックが可能になります。 下図はジョブ間のデータ フローを表したものです。 ワークスペースは、同じワークフロー内のジョブ間でデータを維持します。 キャッシュは、異なるワークフロー ビルドにある同じジョブ間でデータを維持します。 アーティファクトは、ワークフローの終了後にデータを維持します。

![ヘッダー]({{ site.baseurl }}/assets/img/docs/jobs-overview.png)

2.0 のジョブは、最近使用した `machine` Executor の実行を再利用できる `machine` Executor、テストや必要なサービス (データベースなど) を実行するように Docker コンテナを構成できる `docker` Executor、または `macos` Executor を使用して実行できます。

`docker` Executor を使用する場合、起動するコンテナのイメージを `docker:` キーの下に指定します。 `docker` Executor には任意のパブリック Docker イメージを使用できます。

`docker` Executor と `machine` Executor の用途と違いについては、[コンテナ イメージの指定に関するドキュメント]({{ site.baseurl }}/ja/2.0/executor-types/)を参照してください。

## ステップの概要

ステップは、ジョブ中に実行される実行可能なコマンドの集まりです。コードをチェック アウトするには `checkout:` キーを指定します。また、`run:` キーを使用すると、複数行にわたる任意のシェル コマンド スクリプトを追加できます。 `run:` キーのほかに、`save_cache:`、`restore_cache:`、`deploy:`、`store_artifacts:`、`store_test_results:`、`add_ssh_keys` などのキーをステップの下にネストします。

## インポートした Orb を使用した設定ファイルの例

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
```

## 並列ジョブを使用した設定ファイルの例

2.0 `.circleci/config.yml` ファイルの例を以下に示します。

{% raw %}
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


{% endraw %} 上記は並列ジョブ ワークフローの例です。処理時間を短縮するために、`build` ジョブと `test` ジョブを並列で実行しています。 並列実行、順次実行、および手動承認のワークフローによってジョブをオーケストレーションする詳しい方法については、[ワークフローに関するドキュメント]({{ site.baseurl }}/ja/2.0/workflows)を参照してください。

## 関連項目

- [構成リファレンス: jobs キー]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)
- [構成リファレンス: steps キー]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps)
