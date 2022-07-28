---
layout: classic-docs
title: "パイプラインのスケジュール実行"
short-title: "パイプラインのスケジュール実行"
description: "CircleCI プロジェクトでパイプラインをスケジュール実行する方法"
order: 20
version:
  - クラウド
suggested:
  - 
    title: 手動でのジョブの承認およびワークフローのスケジュール実行
    link: https://circleci.com/blog/manual-job-approval-and-scheduled-workflow-runs/
  - 
    title: ワークフローをトリガーする方法
    link: https://support.circleci.com/hc/en-us/articles/360050351292?input_string=how+can+i+share+the+data+between+all+the+jobs+in+a+workflow
  - 
    title: 条件付きワークフロー
    link: https://support.circleci.com/hc/en-us/articles/360043638052-Conditional-steps-in-jobs-and-conditional-workflows
---

* TOC
{:toc}

## はじめに
{: #overview }

パイプラインのスケジュール実行により、スケージュールに沿って定期的にパイプラインをトリガーすることができます。

スケジュール実行はパイプラインに基づいているため、パイプラインのスケジュール実行にはパイプラインの使用における下記の機能がすべて備わっています。

- パイプラインに関連付けるユーザーの管理。これにより、[ 制限付きコンテキスト]({{site.baseurl}}/ja/contexts/#restricting-a-context)の使用が可能になります。
- セットアップ ワークフロー経由[のダイナミックコンフィグ]({{site.baseurl}}/ja/dynamic-config/)の使用。
- `.circleci/config.yml` の編集が不要なスケジュール変更。
- [自動キャンセル機能]({{site.baseurl}}/ja/skip-build/#auto-cancelling)の利用。
- スケジュールに関連付ける[パイプライン パラメーター]({{site.baseurl}}/ja/pipeline-variables/#pipeline-parameters-in-configuration)の指定。
- ワークフロー間などで共通するスケジュールの管理。

パイプラインのスケジュール実行は、API を使って、または CircleCI アプリケーションのプロジェクト設定から設定します。

## パイプラインのスケジュール実行機能の使い方
{: #get-started }

パイプラインのスケジュール実行には、最初から設定する、またはスケジュール実行化した既存のワークフローをパイプラインのスケジュール実行に移行するという二つの方法があります。

### 最初から設定する
{: #start-from-scratch }

#### API を使用する
{: #api }
{:.no_toc}

プロジェクトにスケジュール実行化したワークフローがなく、パイプラインのスケジュール実行を試してみたい場合：

1. CircleCI トークンを準備する、または[手順]({{site.baseurl}}/ja/managing-api-tokens/)に沿って新しいトークンを作成します。
2. API を使って新しいスケジュールを作成します。 例えば下記のようにします。

```shell
curl --location --request POST 'https://circleci.com/api/v2/project/<project-slug>/schedule' \
--header 'circle-token: <your-cci-token>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "my schedule name",
    "description": "some description",
    "attribution-actor": "system",
    "parameters": {
      "branch": "main"
      <additional pipeline parameters can be added here>
    },
    "timetable": {
        "per-hour": 3,
        "hours-of-day": [1,15],
        "days-of-week": ["MON", "WED"]
    }
}'
```

詳細は、[API v2 に関するドキュメント](https://circleci.com/docs/api/v2/)の**スケジュール**のセクションを参照してください。

#### プロジェクト設定を使う
{: #project-settings }
{:.no_toc}

1. CircleCI アプリケーションで、サイドバーにある **Projects** に移動し、お客様のプロジェクトの横の省略記号 (...) をクリックします。  **Project Settings** ボタンは各プロジェクトのランディングページにもあります。
2. **Triggers** に移動します。
3. 新しいスケジュールを作成するには、**Add Scheduled Trigger** をクリックします。
4. 新しいスケジュールの名前、タイムテーブル、パイプラインのパラメーター、実行ユーザー (スケジュールに関連付けられているユーザー）を定義し、トリガーを保存します。

### スケジュール実行化したワークフローをパイプラインのスケジュール実行に移行
{: #migrate-scheduled-workflows }

プロジェクトの作業をスケジュール化するには、現在はワークフローのスケジュール実行機能を利用しています。 しかしこの機能には制限があるため、スケジュール実行化したワークフローをパイプラインのスケジュール実行機能に移行することを検討してください。 ワークフローのスケジュール実行には以下のような制限があります。

* 実行ユーザーを制御できないため、ワークフローのスケジュール実行では制限されたコンテキストを使用できません。
* パイプラインの自動キャンセル操作を制御することができません。
* 複雑な回避策がないと、ワークフローのスケジュール実行機能をダイナミックコンフィグで使用することはできません。
* パイプラインをトリガーしないと、1つのブランチ上のスケジュール実行化されたワークフローの変更やキャンセルができません。
* スケジュールを変更しないと、スケジュール実行化されたワークフローのテスト実行を開始できません。
* ワークフローを Webhook で実行する場合は、 PR ブランチからのワークフローのスケジュール実行を制限できません。

スケジュール実行化したワークフローをパイプラインのスケジュール実行に移行するには 次の手順に従います。

1. プロジェクトの`.circleci/config.yml`で、以下の例のようなスケジュールされたトリガーを見つけます。

    ```yaml
    daily-run-workflow:
      triggers:
        - schedule:
            # Every day, 0421Z.
            cron: "21 4 * * *"
            filters:
              branches:
                only:
                  - main
      jobs:
        - test
        - build
    ```
2. cron 式からトリガーを実行する頻度を解釈します。
3. API またはプロジェクト設定を使用してスケジュールを作成するには、上記の[ 最初から設定する](#start-from-scratch)と同じ手順で行います。
4. 設定ファイルで、 `triggers`の部分を削除して通常のワークフローと同じようにします。
    ```yaml
    daily-run-workflow:
      jobs:
        - test
        - build
    ```

#### ワークフローのフィルター機能の追加
{: #workflows-filtering }
{:.no_toc}

スケジュール実行化されたパイプラインは基本的にトリガーされたパイプラインであるため、設定内のすべてのワークフローが実行されます。

[パイプライン値]({{site.baseurl}}/pipeline-variables/#pipeline-values)を使うことによりワークフローのフィルター機能を開始するすることも可能です。 例えば下記のようにします。

```yaml
daily-run-workflow:
  when:
    and:
      - equal: [ scheduled_pipeline, << pipeline.trigger_source >> ]
      - equal: [ "my schedule name", << pipeline.schedule.name >> ]
  jobs:
    - test
    - build
```

上記の例では、`when` の下の２番目の `equal` は厳密には必要ではありません。 `pipeline.schedule.name` は、パイプラインがスケジュールによってトリガーされたときに使用可能なパイプライン値です。

スケジュールがトリガーされる時に実行しないワークフローのフィルタリングを追加することもできます。

{% raw %}
```yaml
daily-run-workflow:
  when:
    and:
      - equal: [ scheduled_pipeline, << pipeline.trigger_source >> ]
      - equal: [ "my schedule name", << pipeline.schedule.name >> ]
  jobs:
    - test
    - build

other-workflow:
  when:
    not:
      equal: [ scheduled_pipeline, << pipeline.trigger_source >> ]
  jobs:
   - build
   - deploy
```
{% endraw %}

## FAQ
{: #faq }

**質問:** 作成したスケジュールはどうやって探せば良いですか？

**回答:** スケジュール実行化されたパイプラインは CircleCI に直接保存されるため、スケジュール毎に関連付けされた UUID があります。 作成したスケジュールは、プロジェクト設定の**トリガー**のページで閲覧できます。 一つのプロジェクトの配下のすべてのスケジュールをリストアップすることも可能です。

```shell
curl --location --request GET 'https://circleci.com/api/v2/project/<project-slug>/schedule' \
--header 'circle-token: <PERSONAL_API_KEY>'
```

`project-slug` は、例えば、`gh/CircleCI-Public/api-preview-docs` のような `vcs-slug/org-name/repo-name` の形式を取ります。

**質問:** スケジュールしたパイプラインが実行されないのはなぜですか？

**回答:** 考えられる理由が 2つあり得ます。
* スケジュール実行化されたパイプラインに設定されている実行ユーザーは現在も組織の一員ですか？
* スケジュールに設定されたブランチが削除されていませんか？
* ご自身の GitHub 組織が SAML 保護を使用してませんか？ SAML トークンは頻繁に失効します。失効していると GiHub へのリクエストが失敗します。

**質問:** パイプラインのスケジュール実行が思っていたより遅いのはなぜですか？

**回答:** [Cron 式](https://en.wikipedia.org/wiki/Cron#CRON_expression)と比較して、パイプラインのスケージュール実行にはスケジュール方法に微妙な違いがあります。

たとえば、08:00 (協定世界時) のスケジュールを 1 時間に 1 回と指定すると、このスケジュールされたパイプラインは 08:00 ～ 09:00 (協定世界時) の間に 1 回実行されます。 これは 08:00 (協定世界時) ちょうどに実行されるという意味ではないのでご注意ください。

このパイプラインのスケジュール実行は、その後は常に最初の実行と同じ時間に実行されます。 つまり、最初にスケジュールされたパイプラインが 08:11 (協定世界時) に実行された場合、その次も 08:11 (協定世界時) に実行されます。

**質問:**  正規表現はサポートしていますか？

**回答:** 現在はサポートしていません。 パイプラインのスケジュール実行には、Webhook、API 呼び出し、スケジュールに含まれるコミット SHA、ブランチ、タグ (完全認証、正規表現なし) などの高度に決定論的な入力が必要です。 
