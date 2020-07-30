---
layout: classic-docs
title: "GitHub Checks の有効化"
short-title: "GitHub Checks の有効化"
description: "CircleCI で GitHub Checks を有効にする方法"
categories:
  - getting-started
order: 1
---

ここでは、CircleCI の設定で GitHub Checks を有効化し、CircleCI Checks アプリがワークフロー ステータスを GitHub アプリに報告するのを許可する方法を説明します。

## 概要

GitHub Checks は、GitHub の [Checks] ページにワークフロー ステータスに関するメッセージを表示し、GitHub の [Checks] ページからワークフローを再実行できるようにします。

Checks が有効になると、CircleCI のワークフローおよびジョブのステータスが GitHub の [Checks] タブに報告されます。

![CircleCI Checks]({{ site.baseurl }}/assets/img/docs/checks_tab.png)

**Note:** GitHub does not currently provide a granular way for you to rerun workflows. Because CircleCI uses checks that are mapped to workflows (e.g. a single configuration may have one or more workflows), when you select the Re-run checks button, you will automatically re-run all checks, regardless of whether you selected "re-run failed checks" or "rerun all checks" from the Re-run checks button.

## GitHub Checks を有効化する方法

To use the CircleCI Check integration, you first need to navigate to the Org Setting, then authenticate the repository to use CircleCI Checks as follows:

### 前提条件

- You must be using the cloud-hosted version of Circle CI.
- Your project must be using CircleCI 2.0 with [Workflows]({{ site.baseurl }}/2.0/workflows/).
- You must be an Admin on your GitHub repository to authorize installation of the CircleCI Checks integration.

### 手順

1. CircleCI アプリのメイン メニューで [Settings (設定)] タブをクリックします。
2. [VCS] を選択します。 
3. [Manage GitHub Checks (GitHub Checks を管理)] ボタンをクリックします。![CircleCI の VCS 設定ページ]({{ site.baseurl }}/assets/img/docs/checks_setting.png)
4. Checks を利用するリポジトリを選択し、[Install (インストール)] ボタンをクリックします。 ![CircleCI の VCS 設定ページ]({{ site.baseurl }}/assets/img/docs/checks_install.png)  
    インストールが完了すると、GitHub の [Checks] タブにワークフローの実行ステータス情報が表示されます。 

## Checks によるステータス レポート

CircleCI reports the status of workflows and all corresponding jobs under the Checks tab on GitHub. Additionally, Checks provides a button to rerun each workflow from GitHub Checks tab.

After the rerun is initiated, CircleCI reruns the workflow from beginning and reposts the status on the Checks tab. To navigate to the CircleCI app from GitHub, click the View more details on CircleCI Checks link.

**Note:** Your project will stop receiving job level status after GitHub Checks is turned on. You can change this in the GitHub Status updates section of the Project Settings > Advanced Settings page.

## プロジェクトの GitHub Checks を無効化する方法

To disable the CircleCI Check integration, navigate to the Org Settings Page, then remove the repositories using CircleCI Checks as follows:

### 手順

1. CircleCI アプリのメイン メニューで [Settings (設定)] タブをクリックします。
2. [VCS] を選択します。 
3. [Manage GitHub Checks (GitHub Checks を管理)] ボタンをクリックします。 [Update CircleCI Checks repository access (CircleCI Checks のリポジト リアクセスの更新)] ページが表示されます。 ![CircleCI の VCS 設定ページ]({{ site.baseurl }}/assets/img/docs/checks_update.png)
4. Checks インテグレーションをアンインストールするリポジトリの選択を解除します。
5. プロジェクトでステータスの設定を確認します。[CircleCI] > [Project Settings (プロジェクト設定)] > [Advanced Settings (詳細設定)] に移動し、[GitHub Status Updates (GitHub ステータス アップデート)]`` が `on` に設定されていることを確認します。

![Re-enable GitHub Status]({{ site.baseurl }}/assets/img/docs/github-checks-enable-updates.png)

## 組織の Checks をアンインストールする方法

1. CircleCI アプリのメイン メニューで [Settings (設定)] タブをクリックします。
2. [VCS] を選択します。
3. [Manage GitHub Checks (GitHub Checks を管理)] ボタンをクリックします。
4. 下へスクロールして、[Uninstall (アンインストール)] ボタンをクリックし、GitHub Checks アプリをアンインストールします。

## GitHub Checks が GitHub でステータスを待機している場合

`ci/circleci:build — Waiting for status to be reported`

If you have enabled GitHub Checks in your GitHub repository, but the status check never completes on GitHub Checks tab, there may be status settings in GitHub that you need to deselect. For example, if you choose to protect your branches, you may need to deselect the `ci/circleci:build` status key as this check refers to the job status from CircleCI 2.0, as follows:

![Uncheck GitHub Job Status Keys]({{ site.baseurl }}/assets/img/docs/github_job_status.png)

Having the `ci/circleci:build` checkbox enabled will prevent the status from showing as completed in GitHub when using a GitHub Checks because CircleCI posts statuses to GitHub at a workflow level rather than a workflow job level.

Go to Settings > Branches in GitHub and click the Edit button on the protected branch to deselect the settings, for example `https://github.com/your-org/project/settings/branches`.