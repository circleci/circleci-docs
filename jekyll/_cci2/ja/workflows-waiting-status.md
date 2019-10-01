---
layout: classic-docs
title: "GitHub でステータスを待機するワークフロー"
short-title: "GitHub でステータスを待機するワークフロー"
description: "GitHub でステータスを待機するワークフローの修正"
categories:
  - troubleshooting
order: 1
---

`ci/circleci — Waiting for status to be reported`

GitHub リポジトリでブランチにワークフローを実装しているものの、ステータスチェックがいつまでも完了しない場合は、GitHub でいずれかのステータス設定を解除する必要がある可能性があります。 たとえば、ブランチの保護を選択している場合は、以下に示すように `ci/circleci` ステータスキーの選択を解除する必要があります。このキーが選択されていると、デフォルトの CircleCI 1.0 チェックが参照されるためです。

![GitHub ステータスキーの選択の解除]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

ワークフローを使用している場合に、`ci/circleci` チェックボックスをオンにすると、GitHub でステータスが完了と表示されなくなります。これは、CircleCI が名前にジョブを含むキーを使用して GitHub にステータスを送信するためです。

To resolve this, go to GitHub and navigate to **Settings** > **Branches**. Then, click the **Edit** button on the protected branch to deselect the setting.

いくつかの例と概念的な情報については、「[ジョブの実行を Workflow で制御する]({{ site.baseurl }}/ja/2.0/workflows)」を参照してください。