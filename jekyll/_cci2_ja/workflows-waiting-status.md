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

GitHub で [Settings (設定)] > [Branches (ブランチ)] に移動し、保護されているブランチで [Edit (編集)] ボタンをクリックして、設定の選択を解除します (例：https://github.com/your-org/project/settings/branches)。

いくつかの例と概念的な情報については、[ワークフローの組織化に関するドキュメント]({{ site.baseurl }}/ja/2.0/workflows)を参照してください。
