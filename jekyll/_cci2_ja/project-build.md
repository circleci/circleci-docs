---
layout: classic-docs
title: "プロジェクトとパイプライン"
short-title: "プロジェクトとパイプライン"
description: "CircleCI プロジェクトの入門ガイド"
categories:
  - はじめよう
order: 1
version:
  - クラウド
---

ここでは、CircleCI でパイプラインを自動化する方法について説明します。

## 概要
{: #overview }

GitHub または Bitbucket 上のソフトウェアリポジトリが承認され、[プロジェクト]({{ site.baseurl }}/2.0/glossary/#project)として circleci.com に追加された後は、コードを変更するたびに、プロジェクトの[パイプライン]({{ site.baseurl }}/2.0/concepts/#pipelines)がトリガーされます。 パイプラインとは、CircleCI を使用するプロジェクトで作業をトリガーする際に実行されるすべてのワークフローを含むすべての設定を指す言葉です。 `.circleci/config.yml` ファイルの全体が 1 つのパイプラインによって実行されます。 ジョブは、設定ファイルで定義された要件に合わせて構成されたクリーンなコンテナまたは VM で実行されます。

## プロジェクトの追加
{: #adding-projects }

A CircleCI project shares the name of the associated code repository in your VCS (GitHub or Bitbucket). Select **Projects** from the CircleCI application sidebar to enter the Projects dashboard, where you can set up and follow any projects you have access to.

On the Projects Dashboard, you can either:
* _Set Up_ any project that you are the owner of in your VCS
* _Follow_ any project in your organization to gain access to its pipelines and to subscribe to [email notifications]({{ site.baseurl }}/2.0/notifications/) for the project's status.

## Projects dashboard
{: #projects-dashboard }

{:.tab.addprojectpage.Cloud}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

{:.tab.addprojectpage.Server_3}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

{:.tab.addprojectpage.Server_2}
![ヘッダー]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

*Following* a project enables a user to subscribe to [email notifications]({{ site.baseurl }}/2.0/notifications/) for the project [build status]({{ site.baseurl }}/2.0/status/) and adds the project to their CircleCI dashboard.

The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project. A *User* is an individual user within an org. A CircleCI user is anyone who can log in to the CircleCI platform with a username and password. Users must be added to a [GitHub or Bitbucket org]({{ site.baseurl }}/2.0/gh-bb-integration/) to view or follow associated CircleCI projects.  Users may not view project data that is stored in environment variables.

### Org switching
{: #org-switching }
If you do not see your project and it is not currently building on CircleCI, check your Organization in the top left corner of the CircleCI application.  たとえば、左上にユーザー `my-user` と表示されているなら、`my-user` に属する GitHub プロジェクトのみが `Add Projects` の下に表示されます。  `your-org/project` の GitHub プロジェクトをビルドするには、CircleCI アプリケーションの [Switch Organization (組織の切り替え)] メニューで `your-org` を選択する必要があります。

{:.tab.switcher.Cloud}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server_3}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server_2}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

## Viewing and navigating pipelines
{: #viewing-and-navigating-pipelines }

Your pipeline appears on the Dashboard of the CircleCI app when a new commit is pushed to your repository. You can view workflows or single jobs by expanding the pipeline and clicking in on any workflow or job descriptors.

When viewing a single job in a pipeline, you can use the breadcrumbs at the top of the page to navigate back to a job's respective workflow or pipeline.

![Pipelines Breadcrumbs]({{ site.baseurl }}/assets/img/docs/pipeline-breadcrumbs.png)

## 関連項目
{: #see-also }

[Settings]({{ site.baseurl }}/ja/2.0/settings)
