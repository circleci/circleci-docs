---
layout: classic-docs
title: "GitHub Checks の有効化"
short-title: "GitHub Checks の有効化"
description: "CircleCI で GitHub Checks を有効にする方法"
categories:
  - はじめよう
contentTags:
  platform:
    - クラウド
---

## 概要
{: #introduction }

ここでは、CircleCI の設定で GitHub Checks 機能を有効化し、CircleCI によるワークフローステータスの GitHub アプリへの報告を許可する方法を説明します。 **GitHub Checks インテグレーション機能は、現在 CircleCI Server では利用できません。**

GitHub Checks は、ワークフローステータスに関するメッセージを表示し、GitHub Checks のページからワークフローを再実行するオプションを提供します。

GitHub Checks が有効になると、CircleCI のワークフローのステータスが GitHub の Checks タブに報告されます。

![CircleCI checks on GitHub]({{site.baseurl}}/assets/img/docs/checks_tab.png)

GitHub does not currently provide a granular way for you to rerun workflows. When you select the Re-run checks button, you will automatically re-run all checks, regardless of whether you selected "re-run failed checks" or "rerun all checks" from the Re-run checks button.
{: class="alert alert-info" }

## GitHub Check と GitHub ステータスの更新
{: #github-check-and-github-status-updates }

GitHub Checks と GitHub ステータスの更新を混同しないようにしてください。

* GitHub Checks は GitHub UI から管理され、 _ワークフロー_ ごとに GitHub UI で報告されます。
* GitHub ステータスの更新は、ビルドからのステータスの更新が GitHub UI で報告されるデフォルトの方法で、 _ジョブ_ ごとに報告されます。

これらの両方の機能が有効化されていると、GitHub の PR ビューで Checks タブにワークフローのステータスが表示され、PR の会話ビューの Checkes のセクションにジョブのステータスが表示されます。

## 前提条件
{: #prerequisites }

- クラウド版 CircleCI を使用している必要があります。
- Your project must be using [Workflows](/docs/workflows/).
- You must be an admin on your GitHub repository to authorize installation of the CircleCI Checks integration.

## Enable GitHub Checks
{: #enable-github-checks }

1. CircleCI アプリのサイドバーで、**Organization Settings** をクリックします。
2. **VCS** を選択します。
3. **Manage GitHub Checks** ボタンをクリックします。 ![CircleCI の VCS 設定ページ]({{site.baseurl}}/assets/img/docs/screen_github_checks_new_ui.png)
4. Select the repositories that should use checks and click the **Install** button.

After installation completes, the Checks tab on the GitHub PR view will be populated with workflow status information, and from here you can rerun workflows or navigate to the CircleCI app to view further information.

## Checks によるステータス レポート
{: #checks-status-reporting }

CircleCI は、ワークフローと対応するすべてのジョブのステータスを GitHub の Checks タブで報告します。 また、Checks では、プロジェクトで設定されたすべてのワークフローを再実行するためのボタンも表示されます。

再実行が開始されると、CircleCI は、ワークフローを最初から再実行し、ステータスを Checks タブで報告します。 GitHub から CircleCI アプリに移動するには、[View more details on CircleCI Checks (CircleCI Checks で詳細を確認する)] をクリックします。

Your project will stop receiving job level status after GitHub Checks is turned on. これは、**Project Settings** > **Advanced Settings** ページの GitHub Status updates (GitHub ステータス アップデート) セクションで変更できます。
{: class="alert alert-info" }

## Disable GitHub Checks for a project
{: #disable-github-checks-for-a-project }

To disable the GitHub Checks integration, navigate to the **Organization Settings** page in the CircleCI app, then remove the repositories using GitHub Checks, as follows:

1. CircleCI サイドバーで **Organization Settings** オプションをクリックします。
2. VCS を選択します。
3. Manage GitHub Checks ボタンをクリックします。 Update CircleCI Checks repository access (CircleCI Checks のリポジトリアクセスの更新) ページが表示されます。
4. Checks インテグレーションをアンインストールするリポジトリの選択を解除します。 Save をクリックします。 If you are removing GitHub checks from the only repo you have it installed on, you will need to either suspend or uninstall CircleCI Checks.
5. Confirm that GitHub status updates have been enabled on your project so you will see job level status within PRs in GitHub. Go to the CircleCI app and navigate to **Project Settings** > **Advanced Settings** and confirm that the setting `GitHub Status Updates` is set to `on`.

![CircleCI の VCS 設定ページ]({{site.baseurl}}/assets/img/docs/screen_github_checks_disable_new_ui.png)

## Uninstall Checks for the organization
{: #uninstall-checks-for-the-organization }

1. CircleCI サイドバーで **Organization Settings** オプションをクリックします。
2. VCS を選択します。
3. Manage GitHub Checks ボタンをクリックします。
4. 下にスクロールし、Uninstall ボタンをクリックし、GitHub Checks アプリをアンインストールします。


## Troubleshoot GitHub Checks waiting for status in GitHub
{: #troubleshoot-github-checks-waiting-for-status-in-github }

`ci/circleci:build — Waiting for status to be reported`

GitHub リポジトリで GitHub Checks を有効にしているのに、GitHub Checks タブでステータス チェックがいつまでも完了しない場合は、GitHub でいずれかのステータス設定を解除する必要がある場合があります。 例えば、「Protect this branch」をオンにしている場合、このチェックは CircleCI からのジョブステータスを参照するため、ステータスチェックの設定対象から `ci/circleci` ステータスキーを外す必要があります。

![GitHub ジョブステータス キーの選択の解除]({{site.baseurl}}/assets/img/docs/github_job_status.png)

GitHub Checks を使用している際に、`ci/circleci:build` のチェックボックスを有効にすると、GitHub でステータスが完了と表示されなくなります。これは CircleCI が GitHub にステータスをジョブレベルではなくワークフローレベルで送信するためです。

GitHub で **Settings** > **Branches** に移動し、保護されているブランチで **Edit** ボタンをクリックして、設定の選択を解除します (例: `https://github.com/your-org/project/settings/branches`)。

## 次のステップ
{: #next-steps }

- [Add an SSH key to CircleCI](/docs/add-ssh-key)
