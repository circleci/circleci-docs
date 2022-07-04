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

ここでは、CircleCI の設定で GitHub Checks 機能を有効化し、CircleCI によるワークフローステータスの GitHub アプリへの報告を許可する方法を説明します。 **GitHub Checks インテグレーション機能は、現在 CircleCI Server では利用できません。**

## GitHub Check と GitHub ステータスの更新
{: #github-check-and-github-status-updates }

GitHub Checks と GitHub ステータスの更新を混同しないようにしてください。

* GitHub Checks は GitHub UI から管理され、 _ワークフロー_ ごとに GitHub UI で報告されます。
* GitHub ステータスの更新は、ビルドからのステータスの更新が GitHub UI で報告されるデフォルトの方法で、 _ジョブ_ ごとに報告されます。

これらの両方の機能が有効化されていると、GitHub の PR ビューで Checks タブにワークフローのステータスが表示され、PR の会話ビューの Checkes のセクションにジョブのステータスが表示されます。

## 概要
{: #overview }

GitHub Checks は、ワークフローステータスに関するメッセージを表示し、GitHub Checks のページからワークフローを再実行するオプションを提供します。

GitHub Checks が有効になると、CircleCI のワークフローのステータスが GitHub の Checks タブに報告されます。

![CircleCI Checks]( {{ site.baseurl }}/assets/img/docs/checks_tab.png)

**注:** 現在 GitHub では、ワークフローの再実行方法の詳細説明を提供していません。 CircleCI ではワークフローにマップされた Checks を使用しているため (1 つの設定ファイルに 1 つ以上のワークフローが含められます)、 Re-run checks ボタンを選択すると、"re-run failed checks" と "rerun all checks" のどちらを選んでもすべての Checkes が自動的に再実行されます。

## GitHub Checks を有効化する方法
{: #to-enable-github-checks }

CircleCI Check インテグレーションを使用するには、**Organization Settings** に移動し、以下の手順でリポジトリでの CircleCI Checks の使用を認証します。

### 前提条件
{: #prerequisites }

- クラウド版 CircleCI を使用している必要があります。
- プロジェクトで、[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/)を使っている必要があります。
- CircleCI Checks インテグレーションのインストールを許可するには、GitHub リポジトリの管理者でなければなりません。

### 手順
{: #steps }

1. CircleCI アプリのサイドバーで、**Organization Settings** をクリックします。
2. **VCS** を選択します。
3. **Manage GitHub Checks** ボタンをクリックします。    ![CircleCI の VCS 設定ページ]( {{ site.baseurl }}/assets/img/docs/screen_github_checks_new_ui.png)
4. Checks を利用するリポジトリを選択し、Install ボタンをクリックします。

インストール完了後、GitHub で PR を閲覧すると Checks タブにワークフローのステータス情報が挿入されます。そこからワークフローを再実行したり、CircleCI アプリに移動して詳細を閲覧することができます。

## Checks によるステータス レポート
{: #checks-status-reporting }

CircleCI は、ワークフローと対応するすべてのジョブのステータスを GitHub の Checks タブで報告します。 また、Checks では、プロジェクトで設定されたすべてのワークフローを再実行するためのボタンも表示されます。

再実行が開始されると、CircleCI は、ワークフローを最初から再実行し、ステータスを Checks タブで報告します。 GitHub から CircleCI アプリに移動するには、[View more details on CircleCI Checks (CircleCI Checks で詳細を確認する)] をクリックします。

**注:** GitHub Checks をオンにすると、その後、プロジェクトはジョブレベルのステータスを受け取らなくなります。 これは、**Project Settings** > **Advanced Settings ** ページの GitHub Status updates (GitHub ステータス アップデート) セクションで変更できます。

## プロジェクトの GitHub Checks を無効化する方法
{: #to-disable-github-checks-for-a-project }

GitHub Checks Integration を無効化するには、CircleCI アプリの **Organization Settings** に移動し、以下の手順で GitHub Checks を使用しているリポジトリを削除します。

### 手順
{: #steps }

1. CircleCI サイドバーで **Organization Settings** オプションをクリックします。
2. VCS を選択します。
3. Manage GitHub Checks ボタンをクリックします。 Update CircleCI Checks repository access (CircleCI Checks のリポジトリアクセスの更新) ページが表示されます。
4. Checks インテグレーションをアンインストールするリポジトリの選択を解除します。 Save をクリックします。 GitHub Checks をインストールした唯一のリポジトリから削除する場合は、CircleCI Checks を一時停止またはアンインストールする必要があります。
5. プロジェクトの GitHub ステータスの更新が有効化されていることを確認してください。GitHub の PR でジョブレベルのステータスが閲覧できます。CircleCI アプリで**Project Settings** > **Advanced Settings** > に移動し、`GitHub Status Updates` が `on` に設定されていることを確認します。

![CircleCI の VCS 設定ページ]( {{ site.baseurl }}/assets/img/docs/screen_github_checks_disable_new_ui.png)

## 組織の Checks をアンインストールする方法
{: #to-uninstall-checks-for-the-organization }

1. CircleCI サイドバーで **Organization Settings** オプションをクリックします。
2. VCS を選択します。
3. Manage GitHub Checks ボタンをクリックします。
4. 下にスクロールし、Uninstall ボタンをクリックし、GitHub Checks アプリをアンインストールします。


## トラブルシューティング: GitHub Checks が GitHub でステータスを待機する
{: #troubleshooting-github-checks-waiting-for-status-in-github }

`ci/circleci:build — Waiting for status to be reported`

GitHub リポジトリで GitHub Checks を有効にしているのに、GitHub Checks タブでステータス チェックがいつまでも完了しない場合は、GitHub でいずれかのステータス設定を解除する必要がある場合があります。 例えば、「Protect this branch」をオンにしている場合、このチェックは CircleCI からのジョブステータスを参照するため、ステータスチェックの設定対象から `ci/circleci` ステータスキーを外す必要があります。

![GitHub ジョブステータス キーの選択の解除]({{ site.baseurl }}/assets/img/docs/github_job_status.png)

GitHub Checks を使用している際に、`ci/circleci:build` のチェックボックスを有効にすると、GitHub でステータスが完了と表示されなくなります。これは CircleCI が GitHub にステータスをジョブレベルではなくワークフローレベルで送信するためです。

GitHub で **Settings>**Branches** に移動し、保護されているブランチで **Edit** ボタンをクリックして、設定の選択を解除します (例: `https://github.com/your-org/project/settings/branches`)。</p>

