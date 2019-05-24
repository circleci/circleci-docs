---
layout: classic-docs
title: "GitHub Checks の有効化"
short-title: "GitHub Checks の有効化"
description: "CircleCI で GitHub Checks を有効にする方法"
categories: [getting-started]
order: 1
---

ここでは、CircleCI の設定で GitHub Checks を有効にし、CircleCI Checks アプリがワークフローステータスを GitHub アプリに報告するのを許可する方法を説明します。

## 概要

GitHub Checks は、GitHub の [Checks] ページにワークフローステータスに関するメッセージを表示し、GitHub の [Checks] ページからワークフローを再実行できるようにします。

Checks が有効になると、CircleCI のワークフローおよびジョブのステータスが GitHub の [Checks] タブに報告されます。

![CircleCI Checks]({{ site.baseurl }}/assets/img/docs/checks_tab.png)

## GitHub Checks を有効にする方法

CircleCI Check インテグレーションを使用するには、[Org Setting (組織の設定)] に移動して、以下のように CircleCI Checks を使用するリポジトリを認証します。

### 前提条件

- プロジェクトで、[Workflows ]({{ site.baseurl }}/ja/2.0/workflows/)機能を備えた CircleCI 2.0 を使用している必要があります。
- CircleCI Checks インテグレーションのインストールを許可するには、GitHub リポジトリの管理者でなければなりません。

### 手順

1. CircleCI アプリのメインメニューで [Settings (設定)] タブをクリックします。
2. [VCS] を選択します。
3. [Manage GitHub Checks (GitHub Checks を管理)] ボタンをクリックします。![CircleCI の VCS 設定ページ]({{ site.baseurl }}/assets/img/docs/checks_setting.png)
4. Checks を利用するリポジトリを選択し、[Install (インストール)] ボタンをクリックします。 ![CircleCI の VCS 設定ページ]({{ site.baseurl }}/assets/img/docs/checks_install.png)
    インストールが完了すると、GitHub の [Checks] タブにワークフローの実行ステータス情報が表示されます。

## Checks によるステータスレポート

CircleCI は、ワークフローとすべての対応するジョブのステータスを GitHub の [Checks] タブで報告します。 また、Checks によって、GitHub の [Checks] タブから各ワークフローを再実行するためのボタンも用意されます。

再実行が開始されると、CircleCI は、ワークフローを最初から再実行し、ステータスを [Checks] タブに再送します。 GitHub から CircleCI アプリに移動するには、[View more details on CircleCI Checks (CircleCI Checks で詳細を確認する)] リンクをクリックします。

**メモ：**GitHub Checks をオンにすると、その後、プロジェクトはジョブレベルのステータスを受け取らなくなります。 これは、[Project Settings (プロジェクト設定)] > [Advanced Settings (詳細設定)] ページの [GitHub Status updates (GitHub ステータスアップデート)] セクションで変更できます。

## プロジェクトの GitHub Checks を無効にする方法

CircleCI Check インテグレーションを無効にするには、[Org Settings (組織の設定)] ページに移動した後、以下の手順に従って CircleCI Checks を使用しているリポジトリを削除します。

### 手順

1. CircleCI アプリのメインメニューで [Settings (設定)] タブをクリックします。
2. [VCS] を選択します。
3. [Manage GitHub Checks (GitHub Checks を管理)] ボタンをクリックします。 [Update CircleCI Checks repository access (CircleCI Checks のリポジトリアクセスの更新)] ページが表示されます。 ![CircleCI の VCS 設定ページ]({{ site.baseurl }}/assets/img/docs/checks_update.png)
4. Checks インテグレーションをアンインストールするリポジトリの選択を解除します。
5. プロジェクトでステータスの設定を確認します。[CircleCI] > [Project Settings (プロジェクト設定)] > [Advanced Settings (詳細設定)] に移動し、[GitHub Status Updates (GitHub ステータスアップデート)]`` が `on` に設定されていることを確認します。

![GitHub ステータスの再有効化]({{ site.baseurl }}/assets/img/docs/github-checks-enable-updates.png)

## 組織の Checks をアンインストールする方法

1. CircleCI アプリのメインメニューで [Settings (設定)] タブをクリックします。
2. [VCS] を選択します。
3. [Manage GitHub Checks (GitHub Checks を管理)] ボタンをクリックします。
4. 下へスクロールして、[Uninstall (アンインストール)] ボタンをクリックし、GitHub Checks アプリをアンインストールします。

## GitHub Checks が GitHub でステータスを待機している場合

`ci/circleci:build — ステータスの報告を待機`

GitHub リポジトリで GitHub Checks を有効にしているものの、GitHub の [Checks] タブでステータスチェックがいつまでも完了しない場合は、GitHub でいずれかのステータス設定を解除する必要がある可能性があります。 たとえば、ブランチの保護を選択している場合は、以下に示すように `ci/circleci:build` ステータスキーの選択を解除する必要があります。これは、このキーが選択されていると CircleCI 2.0 のジョブステータスが参照されるためです。

![GitHub ジョブステータスキーの選択の解除]({{ site.baseurl }}/assets/img/docs/github_job_status.png)

GitHub Checks を使用している際に、`ci/circleci:build` チェックボックスをオンにすると、GitHub でステータスが完了と表示されなくなります。これは CircleCI が GitHub にステータスをワークフロージョブレベルではなくワークフローレベルで送信するためです。

GitHub で [Settings (設定)] > [Branches (ブランチ)] に移動し、保護されているブランチで [Edit (編集)] ボタンをクリックして、設定の選択を解除します (例：`https://github.com/your-org/project/settings/branches`)。
