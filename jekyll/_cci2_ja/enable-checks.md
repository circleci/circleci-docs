---
layout: classic-docs
title: "GitHub Checks の有効化"
short-title: "GitHub Checks の有効化"
description: "CircleCI で GitHub Checks を有効にする方法"
categories:
  - はじめよう
order: 1
version:
  - クラウド
---

ここでは、CircleCI の設定で GitHub Checks 機能を有効化し、CircleCI がワークフロー ステータスを GitHub アプリに報告するのを許可する方法を説明します。 **この GitHub Checks の連携機能は、現在 CircleCI Server では利用できません。**

## 概要
{: #github-check-and-github-status-updates }

GitHub Checks と GitHub ステータスの更新を混同しないようにしてください。

* GitHub Checks は GitHub UI から管理され、_ワークフロー_ ごとに GitHub UI で報告されます。
* GitHub ステータスの更新は、ビルドからのステータスの更新が GitHub UI で報告されるデフォルトの方法で、_ジョブ_ごとに報告されます。

これらの両方の機能が有効化されていると、GitHub の PR ビューで Checks タブにワークフローのステータスが表示され、PR の会話ビューの Checkes のセクションにジョブのステータスが表示されます。

## GitHub Checks を有効化する方法
CircleCI Check インテグレーションを使用するには、[Org Setting (組織の設定)] に移動して、以下のように CircleCI Checks を使用するリポジトリを認証します。

GitHub ジョブ ステータス キーの選択の解除

After GitHub Checks is enabled, CircleCI workflow status is reported under the checks tab on GitHub.

![CircleCI Checks]( {{ site.baseurl }}/assets/img/docs/checks_tab.png)

**Note:** GitHub does not currently provide a granular way for you to rerun workflows. Because CircleCI uses checks that are mapped to workflows (e.g. a single configuration may have one or more workflows), when you select the Re-run checks button, you will automatically re-run all checks, regardless of whether you selected "re-run failed checks" or "rerun all checks" from the Re-run checks button.

## Checks によるステータス レポート
{{ site.baseurl }}/assets/img/docs/github-checks-enable-updates.png

To use the CircleCI Check integration, you first need to navigate to your **Organization Settings**, then authenticate the repository to use Checks as follows:

### 前提条件
{: #prerequisites }

- You must be using the cloud-hosted version of CircleCI.
- Your project must be using [Workflows]({{ site.baseurl }}/2.0/workflows/).
- CircleCI Check インテグレーションを無効にするには、[Org Settings (組織の設定)] ページに移動した後、以下の手順に従って CircleCI Checks を使用しているリポジトリを削除します。

### 手順
{: #steps }

1. CircleCI アプリのメイン メニューで [Settings (設定)] タブをクリックします。
2. [VCS] を選択します。
3. [Manage GitHub Checks (GitHub Checks を管理)] ボタンをクリックします。    ![CircleCI の VCS 設定ページ]( {{ site.baseurl }}/assets/img/docs/screen_github_checks_new_ui.png)
4. Checks を利用するリポジトリを選択し、[Install (インストール)] ボタンをクリックします。

After installation completes, the Checks tab when viewing a PR in GitHub will be populated with workflow status information, and from here you can rerun workflows or navigate to the CircleCI app to view further information.

## プロジェクトの GitHub Checks を無効化する方法
GitHub で [Settings (設定)] > [Branches (ブランチ)] に移動し、保護されているブランチで [Edit (編集)] ボタンをクリックして、設定の選択を解除します (例: `https://github.com/your-org/project/settings/branches`)。

CircleCI は、ワークフローとすべての対応するジョブのステータスを GitHub の [Checks] タブで報告します。 また、Checks によって、GitHub の [Checks] タブから各ワークフローを再実行するためのボタンも用意されます。

再実行が開始されると、CircleCI は、ワークフローを最初から再実行し、ステータスを [Checks] タブに再送します。 GitHub から CircleCI アプリに移動するには、[View more details on CircleCI Checks (CircleCI Checks で詳細を確認する)] リンクをクリックします。

**メモ:** GitHub Checks をオンにすると、その後、プロジェクトはジョブレベルのステータスを受け取らなくなります。 これは、[Project Settings (プロジェクト設定)] > [Advanced Settings (詳細設定)] ページの [GitHub Status updates (GitHub ステータス アップデート)] セクションで変更できます。

## 組織の Checks をアンインストールする方法
{: #to-disable-github-checks-for-a-project }

To disable the GitHub checks integration, navigate to the **Organization Settings** page in the CircleCI app, then remove the repositories using GitHub Checks, as follows:

### 手順
{: #steps }

1. CircleCI アプリのメイン メニューで [Settings (設定)] タブをクリックします。
2. [VCS] を選択します。
3. [Manage GitHub Checks (GitHub Checks を管理)] ボタンをクリックします。 [Update CircleCI Checks repository access (CircleCI Checks のリポジト リアクセスの更新)] ページが表示されます。
4. Checks インテグレーションをアンインストールするリポジトリの選択を解除します。 Click Save. - If you are removing GitHub checks from the only repo you have it installed on, you will need to either Suspend or Uninstall CircleCI Checks.
5. ここでは、CircleCI の設定で GitHub Checks を有効化し、CircleCI Checks アプリがワークフロー ステータスを GitHub アプリに報告するのを許可する方法を説明します。

![CircleCI の VCS 設定ページ]( {{ site.baseurl }}/assets/img/docs/screen_github_checks_disable_new_ui.png)

## GitHub Checks が GitHub でステータスを待機している場合
{: #to-uninstall-checks-for-the-organization }

1. CircleCI アプリのメイン メニューで [Settings (設定)] タブをクリックします。
2. [VCS] を選択します。
3. [Manage GitHub Checks (GitHub Checks を管理)] ボタンをクリックします。
4. 下へスクロールして、[Uninstall (アンインストール)] ボタンをクリックし、GitHub Checks アプリをアンインストールします。


## GitHub ステータスの再有効化
{: #troubleshooting-github-checks-waiting-for-status-in-github }

`ci/circleci:build — Waiting for status to be reported`

GitHub Checks を使用している際に、`ci/circleci:build` チェックボックスをオンにすると、GitHub でステータスが完了と表示されなくなります。 これは CircleCI が GitHub にステータスをワークフロー ジョブレベルではなくワークフローレベルで送信するためです。

![Uncheck GitHub Job Status Keys]({{ site.baseurl }}/assets/img/docs/github_job_status.png)

GitHub リポジトリで GitHub Checks を有効にしているものの、GitHub の [Checks] タブでステータス チェックがいつまでも完了しない場合は、GitHub でいずれかのステータス設定を解除する必要がある可能性があります。 たとえば、ブランチの保護を選択している場合は、以下に示すように `ci/circleci:build` ステータス キーの選択を解除する必要があります。 これは、このキーが選択されていると CircleCI 2.0 のジョブ ステータスが参照されるためです。

Go to **Settings** > **Branches** in GitHub and click the **Edit** button on the protected branch to deselect the settings, for example `https://github.com/your-org/project/settings/branches`.

