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

Orb は、名前に基づいてインポートする設定ファイル、またはインラインで設定する設定ファイルのパッケージです。Orb により、プロジェクト内またはプロジェクト間で設定ファイルを共有および再利用して設定作業を簡略化することができます。 設定ファイルで Orb を使用する方法と Orb 設計の概要については、[Orb のコンセプト]({{ site.baseurl }}/ja/2.0/orb-concepts/)を参照してください。 [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)では、設定作業の簡素化に役立つ Orb を検索できます。

## ジョブの概要
{: #jobs-overview }

ジョブはステップの集まりです。 ジョブ内のすべてのステップが 1 単位として新しいコンテナまたは仮想マシン内で実行されます。

下図はジョブ間のデータフローを表したものです。
* ワークスペースは、同じワークフロー内のジョブ間でデータを維持します。
* キャッシュは、異なるワークフローの実行における同じジョブ間でデータを永続化します。
* アーティファクトは、ワークフローの終了後にデータを永続化します。

![ジョブの概要]( {{ site.baseurl }}/assets/img/docs/jobs-overview.png)

ジョブは、`machine` (linux)、macOS Executor や Windows Exdcutor を使って、またはジョブや必要なサービス (データベースなど) を実行するように Docker コンテナを設定できる `docker` Executor を使って実行することができます。

`docker` Executor を使用する場合、起動するコンテナのイメージを `docker:` キーの下に指定します。 `docker` Executor には任意のパブリック Docker イメージを使用できます。

ユースケースと Executor タイプの比較については、[Executor タイプの選択]({{ site.baseurl }}/ja/2.0/executor-types/)を参照してください。

## ステップの概要
{: #steps-overview }

ステップは、一つのジョブにおいて実行される実行可能なコマンドの集まりです。 コードをチェックアウトするには `checkout:` キーを指定します。 また、`run:` キーを使用すると、複数行にわたる任意のシェルコマンドスクリプトを追加できます。  この`run:` キーのほかに、`save_cache:`、`restore_cache:`、`deploy:`、`store_artifacts:`、`store_test_results:`、`add_ssh_keys` などのキーをステップの下にネストします。

## インポートした Orb を使用した設定ファイルの例
{: #sample-configuration-with-imported-orb }

AWS S3 Orb の詳細は、[CircleCI Orb レジストリ](https://circleci.com/developer/orbs/orb/circleci/aws-s3#commands-sync)をご覧ください。

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

2.0 `.circleci/config.yml` ファイルの例を以下に示します。

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

上記は並列ジョブのワークフロー例です。処理時間を短縮するために、`build` ジョブと `test` ジョブを並列で実行しています。 並列実行、順次実行、および手動承認のワークフローによってジョブをオーケストレーションする詳しい方法については、[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows)のドキュメントを参照してください。


## 関連項目
{: #see-also }

- [設定リファレンス: jobs キー]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)
- [設定リファレンス: steps キー]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps)
