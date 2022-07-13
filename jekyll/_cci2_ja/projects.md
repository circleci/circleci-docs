---
layout: classic-docs
title: "プロジェクトの概要"
description: "CircleCI プロジェクトについての説明"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---


A CircleCI project shares the name of the associated code repository in your [version control system]({{ site.baseurl }}/gh-bb-integration/) (VCS). CircleCI アプリのサイドバーから **Projects** を選択し、プロジェクトダッシュボードに入力します。 ここからアクセス可能なプロジェクトのセットアップやフォローが可能です。

プロジェクトダッシュボードでは、以下のいずれかを実行します。
* VCS で所有者になっているプロジェクトを_セットアップ_する.
* _Follow_ any project in your organization to gain access to its pipelines and to subscribe to [email notifications]({{site.baseurl }}/notifications/) for the project's status.

For step-by-step guidance, see [Creating a Project in CircleCI]({{site.baseurl}}/create-project/).

## プロジェクトダッシュボード
{: #projects-dashboard }

![プロジェクトダッシュボード]({{site.baseurl}}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

Following a project enables a user to subscribe to [email notifications]({{site.baseurl}}/notifications/) for the project [build status]({{site.baseurl}}/status/) and adds the project to their CircleCI dashboard.

プロジェクト管理者とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーを指します。 *ユーザー*とは、組織内の個々のユーザーです。 CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 Users must be added to a [GitHub or Bitbucket org]({{site.baseurl}}/gh-bb-integration/) to view or follow associated CircleCI projects. ユーザーは、環境変数に保存されているプロジェクト データを表示することはできません。

### 組織の切り替え
{: #org-switching }
プロジェクトが表示されず、CircleCI 上でビルド中でない場合は、 CircleCI Web アプリの左上隅の**組織**を確認してください。 たとえば、左上にユーザー `my-user` が表示されているなら、`my-user` に所属する GitHub プロジェクトのみが **Projects** の下で使用できます。 GitHub プロジェクト `your-org/project` をビルドする場合は、アプリケーションメニューで `your-org` を選択して組織を変更する必要があります。

![組織の切り替えメニュー]({{site.baseurl}}/assets/img/docs/org-centric-ui_newui.png)

## パイプラインの表示と移動
{: #viewing-and-navigating-pipelines }

リポジトリに新しいコミットがプッシュされると、お客様のパイプラインが CircleCI Web アプリの**ダッシュボード**に表示されます。 パイプラインを拡大し、任意のワークフローやジョブをクリックすると、ワークフローや単一のジョブを表示することができます。

パイプラインの単一のジョブを表示する際は、ページ上部にある階層リンクを使ってジョブの各ワークフローやパイプラインに戻ることができます。

![パイプラインの階層リンク]({{site.baseurl}}/assets/img/docs/pipeline-breadcrumbs.png)

## 次のステップ
{: #next-steps }

* Follow our guide to [Creating a Project in CircleCI]({{ site.baseurl }}/create-project/).
* Learn more about CircleCI Pipelines in the [Pipelines Overview]({{ site.baseurl }}/create-project/).
