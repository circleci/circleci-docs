---
layout: classic-docs
title: "パイプラインのスケジュール実行"
short-title: "パイプラインのスケジュール実行"
description: "CircleCI プロジェクトでパイプラインをスケジュール実行する方法を説明します。"
contentTags:
  platform:
    - クラウド
---

**パイプラインのスケジュール実行機能は現時点では GitHub VCS ユーザーと Bitbucket VCS ユーザーにご利用いただけます。**パイプラインのスケジュール実行機能を使うと、スケジュールに基づき定期的にパイプラインをトリガーすることができます。 パイプラインのスケジュール実行では、以下のようなパイプラインのすべての機能が保持されます。

- Control the actor (yourself, or the scheduling system) associated with the pipeline, which can enable the use of [restricted contexts](/docs/contexts/#project-restrictions).
- セットアップ ワークフロー経由の[ダイナミックコンフィグ](/docs/dynamic-config)の使用.
- `.circleci/config.yml` の編集が不要なスケジュール変更。
- [自動キャンセル機能](/docs/skip-build/#auto-cancelling)の利用.
- スケジュールに関連付ける[パイプラインパラメーター](/docs/pipeline-variables/#pipeline-parameters-in-configuration)の指定.
- ワークフロー間などで共通するスケジュールの管理.

パイプラインのスケジュール実行は、API を使って、または CircleCI Web アプリのプロジェクト設定から設定します。

パイプラインのスケジュール実行は、1 つのブランチに対してのみ設定できます。 2 つのブランチに対してスケジュール実行をしたい場合、2 つのスケジュールを設定する必要があります。
{: class="alert alert-info"}

## はじめに
{: #introduction }

Scheduled pipelines allow you to trigger pipelines periodically based on a schedule, from either the CircleCI web app or API. Schedules can range from daily, weekly, monthly, or on a very specific timetable. To set up basic scheduled pipelines, you do not need any extra configuration in your `.circleci/config.yml` file, however, more advanced usage of the feature will require extra `.circleci/config.yml` configuration (for example, workflow filtering, or using parameters).

Pipeline parameters are typed pipeline variables in the form of a string, integer, or boolean. Adding a parameter to a scheduled pipeline can be done in the web app in the triggers form while setting up a schedule. Any parameters set up in this manner must be added to your configuration file using the `parameters` key.

Scheduled pipelines are set to run by an "actor", either the CircleCI scheduling system, or a specific user (for example, yourself). The scheduling actor is important to consider if making use of restricted contexts in workflows. If the user (actor) running the workflow does not have access to the context, the workflow will fail with the `Unauthorized` status.

You can find a basic how-to guide on the [Set a nightly scheduled pipeline](/docs/set-a-nightly-scheduled-pipeline) page, and more advanced examples on the [Schedule pipelines with multiple workflows](/docs/schedule-pipelines-with-multiple-workflows) pages.

## パイプラインのスケジュール実行機能の使い方
{: #get-started-with-scheduled-pipelines }

パイプラインのスケジュール実行機能を使うには、API を使用する方法と、CircleCI Web アプリを使用する方法があります。 それぞれの方法を下記でご紹介します。

### Web アプリのプロジェクト設定を使用する場合
{: #use-project-settings }

1. CircleCI Web アプリのサイドバーから **Projects** に移動し、 プロジェクトの横の省略記号 (...) をクリックし、**Project Settings** をクリックします。 **Project Settings** ボタンは各プロジェクトのランディングページにもあります。
2. **Triggers** に移動します。
3. 新しいスケジュールを作成するには、**Add Trigger** をクリックします。
4. フォームに入力して新しいスケジュールを定義し、**Save Trigger** をクリックします。

The form also provides the option of adding [pipeline parameters](/docs/pipeline-variables/), which are typed pipeline variables that you declare at the top level of a configuration.

複数のワークフローで共通のスケジュールを管理するには、`.circleci/config.yml` ファイルで手動で設定する必要があります。 コード例については [複数のワークフローを使ったパイプラインのスケジュール実行](/docs/schedule-pipelines-with-multiple-workflows)のページを参照してください。

### API を使用する場合
{: #use-the-api }

プロジェクトにスケジュール化したワークフローがなく、パイプラインのスケジュール実行を試してみたい場合：

1. CCI トークンを準備します、または [API トークンの管理](/docs/managing-api-tokens) のページに記載されている手順に従って新しいトークンを作成します。
2. [API を使用](https://circleci.com/docs/api/v2/index.html#operation/createSchedule)して新しいスケジュールを作成します。 例えば、下記のようになります。

```shell
curl --location --request POST "https://circleci.com/api/v2/project/<project-slug>/schedule" \
--header "circle-token: <PERSONAL_API_KEY>" \
--header "Content-Type: application/json" \
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

詳細は、[API v2 に関するドキュメント](https://circleci.com/docs/api/v2)の **Schedule** のセクションを参照してください。

## ワークフローのスケジュール実行からパイプラインのスケジュール実行への移行
{: #migrate-scheduled-workflows-to-scheduled-pipelines }

If you have existing scheduled workflows you need to migrate to scheduled pipelines, use the [Scheduled pipelines migration](/docs/migrate-scheduled-workflows-to-scheduled-pipelines) guide.

## パイプラインのスケジュール実行のビデオチュートリアル
{: #scheduled-pipelines-video-tutorial }

このビデオでは以下のシナリオに対する短いチュートリアルをご覧いただけます。

- Web アプリでスケジュールを設定する
- API を使ってスケジュールを設定する
- ワークフローのスケジュール実行からパイプラインのスケジュール実行への移行する

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/x3ruGpx6SEI" title="パイプラインのスケジュール実行のチュートリアル" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

これらのシナリオについてのドキュメントは、以下のページでご確認いただけます。
- [パイプラインのスケジュール実行を夜間に設定する](/docs/set-a-nightly-scheduled-pipeline)
- [複数のワークフローを使ったパイプラインのスケジュール実行](/docs/schedule-pipelines-with-multiple-workflows)

## FAQ
{: #faq }

**質問:** 既存のワークフローのスケジュール実行をパイプラインのスケジュール実行に移行することはできますか？

**回答:** はい、できます。詳細については、[パイプラインのスケジュール実行への移行](/docs/migrate-scheduled-workflows-to-scheduled-pipelines) を参照してください。

---

**質問:** 作成したスケジュールの見つけ方は？

**回答:** スケジュール化されたパイプラインは CircleCI に直接保存されるため、スケジュール毎に関連付けされた UUID があります。 作成したスケジュールは、プロジェクト設定の**トリガー**のページで閲覧できます。 一つのプロジェクトの配下のすべてのスケジュールをリストアップすることも可能です。

```shell
curl --location --request GET "https://circleci.com/api/v2/project/<project-slug>/schedule" \
--header "circle-token: <PERSONAL_API_KEY>"
```

For GitHub and Bitbucket users: `project-slug` takes the form of `vcs-type/org-name/repo-name`, for example, `gh/CircleCI-Public/api-preview-docs`.

---

**質問:** スケジュール化したパイプラインが実行されないのはなぜですか？

**回答:** 考えられる理由は複数あります。
* Is the assigned actor who is set for the scheduled pipelines still part of the organization (you can find this setting is under **Attribution** in the **Triggers** section of the web app)?
* スケジュールに設定されたブランチが削除されていませんか？
* お客様の GitHub 組織では SAML 保護を使用していませんか？ SAML トークンは頻繁に有効期限が切れます。失効していると GiHub へのリクエストが失敗します。

---

**質問:** パイプラインのスケジュール実行が思っていたより遅いのはなぜですか？

**回答:** [Cron 式](https://en.wikipedia.org/wiki/Cron#CRON_expression)と比較して、パイプラインのスケージュール実行にはスケジュール方法に微妙な違いがあります。

たとえば、08:00 (協定世界時) のスケジュールを 1 時間に 1 回と指定すると、このスケジュールされたパイプラインは 08:00 ～ 09:00 (協定世界時) の間に 1 回実行されます。 これは 08:00 (協定世界時) ちょうどに実行されるという意味ではないのでご注意ください。

このパイプラインのスケジュール実行は、その後は常に最初の実行と同じ時間に実行されます。 つまり、最初にスケジュールされたパイプラインが 08:11 (協定世界時) に実行された場合、その次も 08:11 (協定世界時) に実行されます。

---

**質問:**  正規表現はサポートしていますか？

**回答:** 現在はサポートしていません。 パイプラインのスケジュール実行には、Webhook、API 呼び出し、スケジュールに含まれるコミット SHA、ブランチ、タグ (完全認証、正規表現なし) などの高度に決定論的な入力が必要です。

## 次のステップ
{: #next-steps }

- [ワークフローのスケジュール実行からパイプラインのスケジュール実行への移行](/docs/migrate-scheduled-workflows-to-scheduled-pipelines)
- [複数のワークフローを使ったパイプラインのスケジュール実行](/docs/schedule-pipelines-with-multiple-workflows)
- [パイプラインのスケジュール実行を夜間に設定する](/docs/set-a-nightly-scheduled-pipeline)
