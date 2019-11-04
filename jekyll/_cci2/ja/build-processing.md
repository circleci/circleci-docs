---
layout: classic-docs
title: "Enabling Pipelines"
short-title: "パイプラインの有効化"
description: "パイプラインを有効にする方法"
categories:
  - settings
order: 1
---

ここでは、CircleCI API または自動キャンセルのワークフローからワークフローをトリガーする必要がある場合に、パイプラインエンジンを有効にする方法を説明します。

## はじめよう

Most projects will have Pipelines enabled by default. Verify the project pipeline setting in the Advanced section of your project's Settings page in the CircleCI app. **Note:** Pipelines are compatible with v2 and v2.1 configurations of CircleCI. Currently, Pipelines are not yet supported for private CircleCI Server installations.

## Benefits of Pipelines

The pipelines feature enables use of the new [API endpoint to trigger builds with workflows](https://circleci.com/docs/api/#trigger-a-new-build-by-project-preview) and the following use cases:

- 新しい API エンドポイントを使用してビルドをトリガーし、ビルド内のすべてのワークフローを実行します。
- `build` という名前のジョブが、プロセッサーによって 1つのワークフロースタンザにラップされます。
- [Advanced Settings (詳細設定)] で自動キャンセルが有効になっているプロジェクトでは、非デフォルトのブランチで新しいビルドがトリガーされると、同じブランチ上のワークフローがキャンセルされます。
- バージョン 2.1 以上の設定を使用するには、パイプラインをオンにする必要があります。

**メモ：**非デフォルトのブランチで自動デプロイジョブを設定している場合などには、自動キャンセル機能を有効にすることの影響を慎重に検討する必要があります。

## Troubleshooting

Pipeline errors will appear on the Jobs page or the Workflows page.

Please note that once pipelines are enabled for a project on a usage plan, they may not be turned off without filing a ticket with CircleCI support. See `limitations` below.

## Limitations

CircleCI is committed to achieving backwards compatibility in almost all cases, and most projects that enable pipelines will have no effect on existing builds. Let us know if you experience breaking builds that worked before you turned on pipelines, but broke after you turned it on.

- アンカーは、アプリケーションコンフィグに表示されることなく、処理されて解決されます。
- If you use `<<` in your shell commands (most commonly found in use of heredocs) you will need to escape them using backslash `` as in `\<<` in order to use version 2.1 or higher of configuration. 2.0 configuration will not be affected.
- パイプラインは、任意のジョブをトリガーする 1.1 API エンドポイントと完全には下位互換性が**ありません**。パイプラインをオンにした後にこのエンドポイントを使用すると、予期しない結果または不整合な結果となる可能性があります。 Alternatively, you can use the [build-triggering endpoint in the 1.1 API](https://circleci.com/docs/api/#trigger-a-new-build-by-project-preview) introduced in September 2018. このビルドをトリガーする API エンドポイントは、パラメーター、ワークフロー、ジョブフィルターを受け付け**ない**ので、ご注意ください。 パイプラインと併せてこれらの API 機能を多用したいとお考えでしたら、CircleCI のアカウントチームにお問い合わせください。
- Configuration version 2.0 will have the `CIRCLE_COMPARE_URL` environment variable injected into all jobs for backwards compatibility.

## Giving Feedback

- Tweet @circleci with thoughts
- Vote or add to our [Ideas board](https://ideas.circleci.com/)

## See Also

Refer to the [Skipping and Cancelling Builds]({{ site.baseurl }}/2.0/skip-build/#auto-cancelling-a-redundant-build) document for more details.