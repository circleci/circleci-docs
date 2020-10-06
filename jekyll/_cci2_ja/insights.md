---
layout: classic-docs
title: "インサイトの使用"
short-title: "インサイトの使用"
description: "リポジトリのステータスおよびテスト パフォーマンスを表示する方法"
order: 41
---

CircleCI でインサイトを作成および使用する方法について説明します。

## 概要

CircleCI アプリケーションで [Insights (インサイト)] メニュー項目をクリックすると、フォローしているすべてのリポジトリのヘルス状態に関するダッシュボードが表示されます。 ここでは、デフォルト ブランチの平均ビルド時間、平均キュー時間、最終ビルド時刻、成功率、並列処理数を確認できます。 **メモ:** ワークフローを構成している場合、デフォルト ブランチに対して実行されるすべてのジョブがグラフに表示されます。

![ヘッダー]({{ site.baseurl }}/assets/img/docs/insights-1.0.gif)

この画面では、ビルドに関する以下のデータを確認できます。

- CircleCI でビルドされているすべてのリポジトリのリアルタイム ステータス

- 平均キュー時間

- 平均ビルド時間

- ブランチ数

- 最終ビルド時刻

## プロジェクトのインサイト

メイン ナビゲーション上の [Insights (インサイト)] アイコンをクリックしてから、リポジトリ名をクリックすると、プロジェクト別のインサイトのページにアクセスできます。

プロジェクト別のインサイトのページでは、選択したブランチにおけるビルド ステータスおよびビルド パフォーマンスのグラフを確認できます。

![ヘッダー]({{ site.baseurl }}/assets/img/docs/insights-current-build.png)

- **ビルド ステータス:** デフォルト ブランチに関する直近 50 件のビルドが表示されます。 右上隅でブランチを選択すると、そのブランチに関する 100 件を超えるビルド・ジョブのステータスを確認できます。

- **ビルド パフォーマンス:** このグラフには、最大 90 日前までのビルド・ジョブのデータが日別に集約され、各日の平均値がプロットされています。 任意のブランチをクリックして、リポジトリのパフォーマンスをモニタリングできます。

## 関連項目

失敗が多いテストに対してインサイトを使用したい場合は、「[テスト メタデータの収集]({{ site.baseurl }}/ja/2.0/collect-test-data/)」を参照してください。

## Sumo Logic とのインテグレーション

Sumo Logic を使用すると、CircleCI 上のすべてのジョブを追跡し、その分析データを可視化できます。 そのためには、Sumo Logic パートナー インテグレーション サイトから、Sumo Logic Orb と Sumo Logic アプリケーション インテグレーションを使用します。

### Sumo Logic の CircleCI ダッシュボード

![ヘッダー]({{ site.baseurl }}/assets/img/docs/CircleCI_SumoLogic_Dashboard.png)

以下の情報が表示されます。

- 合計ジョブ数
- 合計成功ジョブ数
- 合計失敗ジョブ数
- ジョブの結果
- ジョブ別の平均実行時間 (秒単位)
- プロジェクト別のジョブ数
- 最新のジョブ (直近 10 個)
- 時間のかかった失敗ジョブ上位 10 個 (秒単位)
- 時間のかかった成功ジョブ上位 10 個 (秒単位)

CircleCI ダッシュボードは、ダッシュボードのホームページからアプリケーション カタログを使用してインストールできます。

![ヘッダー]({{ site.baseurl }}/assets/img/docs/sumologic_app_catalog.png)

ダッシュボードは CircleCI Sumo Logic Orb を介してデータを受け取ります。この Orb は、追跡するプロジェクトに含まれている必要があります。

### Sumo Logic Orb

Sumo Logic Orb の最新版は、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs/orb/circleci/sumologic)で提供されています。

#### 1. Sumo Logic Orb をインポートする

トップ レベルの `orbs` キーを含めることで Sumo Logic Orb をプロジェクトに追加し、以下のように `circleci/sumologic@x.y.z` をインポートします (`x.y.z` は上記リンクの最新バージョンの番号で置き換えてください)。

```yaml
orbs:
  sumologic: circleci/sumologic@x.y.z
```

#### 2. ワークフローに *Workflow-Collector* を追加する

`workflow-collector` ジョブはワークフローと並列で実行され、ワークフロー内のすべてのジョブが完了するまで Sumo Logic に分析データを送信します。

```yaml
version: 2.1
workflows:
  build-test-and-deploy:
    jobs:
      - sumologic/workflow-collector # このジョブを追加してワークフローを追跡します
      - build
      - test:
          requires:
            - build
      - deploy:
          requires:
            - test
```

#### 3. ソース コレクターを 2 つ作成する

HTTPS URL を返す 2 つの*ソース コレクター*を Sumo Logic で作成する必要があります。 この HTTPS URL にジョブ データが送信されます。

作成する必要があるのは、`circleci/job-collector` と `circleci/workflow-collector` という名前のコレクターです。

以下の手順で 2 つのソース コレクターを作成します。

1. ダッシュボードから **[Setup Wizard (セットアップ ウィザード)]** を選択します。
2. **[Set Up Streaming Data (ストリーミング データのセットアップ)]** を選択します。
3. 一番下までスクロールし、**[All Other Sources (他のすべてのソース)]** を選択します。
4. **[HTTPS Source (HTTPS ソース)]** を選択します。
5. `Source Category` に、前述した 2 つのうちのいずれかを入力します。
6. 結果として得られる URL を保存します。

#### 4. 環境変数を追加する

ステップ 3 で生成された各 URL に対して、対応する環境変数を作成します。

対応する環境変数は以下の 2 つです。

- `JOB_HTTP_SOURCE`
- `WORKFLOW_HTTP_SOURCE`

**[プロジェクトに環境変数を追加する方法]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクトでの環境変数の設定)**

これにより、Orb が Sumo Logic ダッシュボードにリンクされます。

各ジョブが CircleCI で実行されると、Sumo Logic ダッシュボードはデータの入力を開始します。

## 関連項目

Orb の使用とオーサリングの詳細については、「[Orb の概要]({{ site.baseurl }}/ja/2.0/orb-intro/)」を参照してください。
