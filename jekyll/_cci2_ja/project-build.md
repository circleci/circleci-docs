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
  - Server v3.x
---

ここでは、CircleCI でパイプラインを自動化する方法について説明します。

## 概要
{: #overview }

After a software repository on GitHub or Bitbucket is authorized and added as a [project]({{site.baseurl}}/2.0/concept/#projects) to circleci.com, every code change triggers your project's [pipeline]({{site.baseurl}}/2.0/concepts/#pipelines). パイプラインとは、CircleCI を使用するプロジェクトで作業をトリガーする際に実行されるすべてのワークフローを含むすべての設定を指す言葉です。 `.circleci/config.yml` ファイルの全体が 1 つのパイプラインによって実行されます。 Jobs run in clean containers or virtual machines (VMs) configured to the requirements set out in your configuration file.

## プロジェクトの追加
{: #adding-projects }

A CircleCI project shares the name of the associated code repository in your [VCS]({{site.baseurl}}/2.0/gh-bb-integration/). Select **Projects** from the CircleCI web app sidebar to enter the projects dashboard, where you can set up and follow any projects you have access to.

On the projects dashboard, you can either:
* Set up any project that you are the owner of in your VCS.
* Follow any project in your organization to gain access to its pipelines, and to subscribe to [email notifications]({{site.baseurl}}/2.0/notifications/) for the project's [build status]({{site.baseurl}}/2.0/status/).

## Projects dashboard
{: #projects-dashboard }

![Project Dashboard]({{site.baseurl}}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

Following a project enables a user to subscribe to [email notifications]({{site.baseurl}}/2.0/notifications/) for the project [build status]({{site.baseurl}}/2.0/status/) and adds the project to their CircleCI dashboard.

The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a project. *ユーザー*とは、組織内の個々のユーザーです。 CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 関係する CircleCI プロジェクトを表示したりフォローするには、ユーザーが [GitHub または Bitbucket 組織]({{site.baseurl}}/2.0/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクト データを表示することはできません。

### 組織の切り替え
{: #org-switching }
If you do not see your project, and it is not currently building on CircleCI, check your **Organization** in the top left corner of the CircleCI web app. For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under **Projects**. If you want to build the GitHub project `your-org/project`, you must switch organizations by selecting `your-org` in the application menu.

![組織の切り替えメニュー]({{site.baseurl}}/assets/img/docs/org-centric-ui_newui.png)

## Viewing and navigating pipelines
{: #viewing-and-navigating-pipelines }

Your pipeline appears on the **Dashboard** of the CircleCI web app when a new commit is pushed to your repository. You can view workflows or single jobs by expanding the pipeline and clicking in on any workflow or job descriptors.

When viewing a single job in a pipeline, you can use the breadcrumbs at the top of the page to navigate back to a job's respective workflow or pipeline.

![Pipelines Breadcrumbs]({{site.baseurl}}/assets/img/docs/pipeline-breadcrumbs.png)

## 関連項目
{: #see-also }

- [Settings]({{site.baseurl}}/2.0/settings) guide
