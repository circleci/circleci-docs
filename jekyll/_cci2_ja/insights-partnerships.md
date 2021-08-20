---
layout: classic-docs
title: "Insights データの連携"
short-title: "Insights データの連携"
version:
  - Cloud
---

## 概要
{: #overview }

{:toc}

Insights ダッシュボードのデータを、サードパーティ プロバイダー製品と連携する方法について説明します。

### Sumo Logic とのインテグレーション
{: #sumo-logic-integration }

Sumo Logic を使用すると、CircleCI 上のすべてのジョブを追跡し、その分析データを可視化できます。 そのためには、Sumo Logic パートナー インテグレーション サイトから、Sumo Logic Orb と Sumo Logic アプリケーション インテグレーションを使用します。


#### Sumo Logic の CircleCI ダッシュボード
{: #the-circleci-dashboard-for-sumo-logic }

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

ダッシュボードは CircleCI Sumo Logic Orb を介してデータを受け取ります。 この Orb は、追跡するプロジェクトに含まれている必要があります。

#### Sumo Logic Orb
{: #the-sumo-logic-orb }

Sumo Logic Orb の最新版は、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs/orb/circleci/sumologic)で提供されています。

##### 1. Sumo Logic Orb をインポートする
{: #1-import-the-sumo-logic-orb }
{:.no_toc}

Sumo Logic Orb をプロジェクトに追加するには、以下のようにトップ レベルの `orbs` キーを記述し、`circleci/sumologic@x.y.z` をインポートします (`x.y.z` は上記リンクの最新バージョンの番号で置き換えてください)。

```yaml
orbs:
  sumologic: circleci/sumologic@x.y.z
```

##### 2. ワークフローに _workflow-collector_ を追加する
{: #2-add-workflow-collector-to-workflow }
{:.no_toc}

`workflow-collector` ジョブはワークフローと同時に並列で実行され、ワークフロー内のすべてのジョブが完了するまで Sumo Logic に分析データを送信します。

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
      - build
      - test:
          requires:
            - build
      - deploy:
          requires:
            - test
      - build
      - test:
          requires:
            - build
      - deploy:
          requires:
            - test
```

##### 3. ソース コレクターを 2 つ作成する
{: #3-create-two-source-collectors }
{:.no_toc}
Sumo Logic で、HTTPS URL を返す 2 つの*ソース コレクター*を作成する必要があります。 この HTTPS URL にジョブ データが送信されます。

作成する必要があるのは、`circleci/job-collector` と `circleci/workflow-collector` という名前のコレクターです。

以下の手順で 2 つのソース コレクターを作成します。
1. ダッシュボードで **[Setup Wizard (セットアップ ウィザード)]** を選択します。
2. **[Set Up Streaming Data (ストリーミング データのセットアップ)]** を選択します。
3. 一番下までスクロールし、**[All Other Sources (他のすべてのソース)]** を選択します。
4. **[HTTPS Source (HTTPS ソース)]** を選択します。
5. `[Source Category (ソース カテゴリ)]` に、前述した 2 つの名前のいずれかを入力します。
6. 出力された URL を保存します。

##### 4. 環境変数を追加する
{: #4-add-environment-variables }
{:.no_toc}

ステップ 3 で生成された各 URL に対して、対応する環境変数を作成します。

対応する環境変数は以下の 2 つです。
- `JOB_HTTP_SOURCE`
- `WORKFLOW_HTTP_SOURCE`

**[プロジェクトに環境変数を追加する方法]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project)**

これにより、Orb が Sumo Logic ダッシュボードにリンクされます。

各ジョブが CircleCI で実行されると、Sumo Logic ダッシュボードはデータの入力を開始します。


## 関連項目
{: #see-also }

Orb の使用とオーサリングの詳細については、「[Orb の概要]({{ site.baseurl }}/2.0/orb-intro/)」を参照してください。
