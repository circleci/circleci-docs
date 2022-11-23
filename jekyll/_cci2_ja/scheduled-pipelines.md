---
layout: classic-docs
title: "パイプラインのスケジュール実行"
short-title: "パイプラインのスケジュール実行"
description: "Learn about scheduled pipelines for your CircleCI projects."
contentTags:
  platform:
    - クラウド
---

## はじめに
{: #introduction }

パイプラインのスケジュール実行により、スケジュールに沿って定期的にパイプラインをトリガーすることができます。 Scheduled pipelines retain all the features of pipelines:

- Control the actor associated with the pipeline, which can enable the use of [restricted contexts](/docs/contexts/#project-restrictions)
- Use [dynamic config](/docs/dynamic-config) via setup workflows
- Modify the schedule without having to edit `.circleci/config.yml`
- Take advantage of [auto-cancelling](/docs/skip-build/#auto-cancelling)
- Specify [pipeline parameters](/docs/pipeline-variables/#pipeline-parameters-in-configuration) associated with a schedule
- Manage common schedules, for example, across workflows

パイプラインのスケジュール実行は、API を使って、または CircleCI Web アプリのプロジェクト設定から設定します。

パイプラインのスケジュール実行は、1 つのブランチに対してのみ設定できます。 2 つのブランチに対してスケジュール実行をしたい場合、2 つのスケジュールを設定する必要があります。
{: class="alert alert-info"}

## Get started with scheduled pipelines
{: #get-started-with-scheduled-pipelines }

To get started with scheduled pipelines, you have the option of using the API, or using the CircleCI web app. それぞれの方法を下記でご紹介します。 If you have existing workflows you need to migrate to scheduled pipelines, use the [Scheduled pipelines migration](/docs/migrate-scheduled-workflows-to-scheduled-pipelines) guide.

### Use project settings in the web app
{: #use-project-settings }

1. In the CircleCI web app, navigate to **Projects** in the sidebar, then click the ellipsis (...) next to your project and click on **Project Settings**. **Project Settings** ボタンは各プロジェクトのランディングページにもあります。
2. **Triggers** に移動します。
3. To create a new schedule, click **Add Trigger**.
4. Define the new schedule by filling out the form, then click **Save Trigger**.

The form also provides the option of adding [pipeline parameters](/docs/pipeline-variables/), which are typed pipeline variables declared at the top level of a configuration.

### API を使用する
{: #use-the-api }

If your project has no scheduled workflows, and you would like to try out scheduled pipelines:

1. Have your CCI token ready, or create a new token by following the steps on the [Managing API tokens](/docs/managing-api-tokens) page.
2. Create a new schedule [using the API](https://circleci.com/docs/api/v2/index.html#operation/createSchedule). 例えば、下記のようになります。

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

詳細は、[API v2 に関するドキュメント](https://circleci.com/docs/api/v2)の**スケジュール**のセクションを参照してください。

## Scheduled pipelines video tutorial
{: #scheduled-pipelines-video-tutorial }

The video offers a short tutorial for the following scenarios:

- Set a schedule in the web app
- Set a schedule with the API
- Migrate from scheduled workflows to scheduled pipelines

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/x3ruGpx6SEI" title="Scheduled pipelines tutorial" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

For the documentation for these scenarios, visit the following pages:
- [Set a nightly scheduled pipeline](/docs/set-a-nightly-scheduled-pipeline)
- [Schedule pipelines with multiple workflows](/docs/schedule-pipelines-with-multiple-workflows)

## FAQ
{: #faq }

**Q:** Can I migrate existing scheduled workflows to scheduled pipelines?

**A:** Yes, visit the [Scheduled pipelines migration](/docs/migrate-scheduled-workflows-to-scheduled-pipelines) guide for more information.

---

**質問:** 作成したスケジュールの見つけ方は？

**回答:** スケジュール実行化されたパイプラインは CircleCI に直接保存されるため、スケジュール毎に関連付けされた UUID があります。 作成したスケジュールは、プロジェクト設定の**トリガー**のページで閲覧できます。 一つのプロジェクトの配下のすべてのスケジュールをリストアップすることも可能です。

```shell
curl --location --request GET "https://circleci.com/api/v2/project/<project-slug>/schedule" \
--header "circle-token: <PERSONAL_API_KEY>"
```

GitHub および Bitbucket ユーザーの場合: `project-slug` は、例えば、`gh/CircleCI-Public/api-preview-docs` のような `vcs-type/org-name/repo-name` の形式を取ります。

GitLab.com ユーザーの場合: `project-slug`  は `circleci/:slug-remainder` の形式を取ります。 Refer to the [Getting started section](/docs/api-developers-guide/#getting-started-with-the-api) of the API Developer's Guide for more information on the project slug format.

---

**質問:** スケジュールしたパイプラインが実行されないのはなぜですか？

**回答:** 考えられる理由が 2つあり得ます。
* スケジュール実行化されたパイプラインに設定されている実行ユーザーは現在も組織の一員ですか？
* スケジュールに設定されたブランチが削除されていませんか？
* ご自身の GitHub 組織が SAML 保護を使用してませんか？ SAML トークンは頻繁に失効します。失効していると GiHub へのリクエストが失敗します。

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

- [スケジュール実行化したワークフローをパイプラインのスケジュール実行に移行](/docs/migrate-scheduled-workflows-to-scheduled-pipelines)
- [Schedule pipelines with multiple workflows](/docs/schedule-pipelines-with-multiple-workflows)
- [Set a nightly scheduled pipeline](/docs/set-a-nightly-scheduled-pipeline)
