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

GitHub または Bitbucket 上のソフトウェアリポジトリが承認され、[プロジェクト]({{site.baseurl}}/2.0/glossary/#projects)として circleci.com に追加された後は、コードを変更するたびに、プロジェクトの[パイプライン]({{site.baseurl}}/2.0/concepts/#pipelines)がトリガーされます。 パイプラインとは、CircleCI を使用するプロジェクトで作業をトリガーする際に実行されるすべてのワークフローを含むすべての設定を指す言葉です。 `.circleci/config.yml` ファイルの全体が 1 つのパイプラインによって実行されます。 ジョブは、設定ファイルで定義された要件に合わせて構成されたクリーンなコンテナまたは仮想マシン (VM) で実行されます。

## プロジェクトの追加
{: #adding-projects }

CircleCI のプロジェクトは、お客様の[バージョン管理システム]({{site.baseurl}}/2.0/gh-bb-integration/) (VCS) 内の、関連するコードリポジトリの名前を共有します。 CircleCI アプリのサイドバーから **Projects**を選択し、Projects ダッシュボードに入力します。ここでは、アクセス権のある任意のプロジェクトのセットアップやフォローをすることができます。

プロジェクトダッシュボードで、以下のいずれかを実行します。
* VCS で所有者になっているプロジェクトをセットアップする
* 組織内のプロジェクトをフォローして、パイプラインへのアクセスを取得し、プロジェクトの[ビルドステータス]({{site.baseurl}}/2.0/status/)に関する[メール通知]({{site.baseurl }}/ja/2.0/notifications/)を受け取る

## プロジェクトダッシュボード
{: #projects-dashboard }

![Project Dashboard]({{site.baseurl}}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

ユーザーは、プロジェクトをフォローすることで、プロジェクトの[ビルド ステータス]({{site.baseurl}}/2.0/status/)に関する[メール通知]({{ site.baseurl }}/2.0/notifications/)を受け取り、プロジェクトを CircleCI ダッシュボードに追加できます。

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
