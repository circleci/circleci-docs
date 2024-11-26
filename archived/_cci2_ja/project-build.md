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

GitHub または Bitbucket 上のソフトウェアリポジトリが承認され、[プロジェクト]({{site.baseurl}}/ja/concepts/#projects)として circleci.com に追加された後は、コードを変更するたびに、プロジェクトの[パイプライン]({{site.baseurl}}/ja/concepts/#pipelines)がトリガーされます。 パイプラインとは、CircleCI を使用するプロジェクトで作業をトリガーする際に実行されるすべてのワークフローを含むすべての設定を指す言葉です。 `.circleci/config.yml` ファイルの全体が 1 つのパイプラインによって実行されます。 ジョブは、設定ファイルで定義された要件に合わせて構成されたクリーンなコンテナまたは仮想マシン (VM) で実行されます。

## プロジェクトの追加
{: #adding-projects }

CircleCI のプロジェクトは、お客様の[バージョン管理システム]({{site.baseurl}}/gh-bb-integration/) (VCS) 内の、関連するコードリポジトリの名前を共有します。 CircleCI アプリのサイドバーから **Projects**を選択し、Projects ダッシュボードに入力します。ここでは、アクセス権のある任意のプロジェクトのセットアップやフォローをすることができます。

プロジェクトダッシュボードで、以下のいずれかを実行します。
* VCS で所有者になっているプロジェクトをセットアップする
* 組織内のプロジェクトをフォローして、パイプラインへのアクセスを取得し、プロジェクトの[ビルドステータス]({{site.baseurl}}/status/)に関する[メール通知]({{site.baseurl }}/ja/notifications/)を受け取る

## プロジェクトダッシュボード
{: #projects-dashboard }

![プロジェクトダッシュボード]({{site.baseurl}}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

ユーザーは、プロジェクトをフォローすることで、プロジェクトの[ビルド ステータス]({{site.baseurl}}/status/)に関する[メール通知]({{ site.baseurl }}/notifications/)を受け取り、プロジェクトを CircleCI ダッシュボードに追加できます。

*プロジェクト管理者*とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーを指します。 *ユーザー*とは、組織内の個々のユーザーです。 CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 関係する CircleCI プロジェクトを表示したりフォローするには、ユーザーが [GitHub または Bitbucket 組織]({{site.baseurl}}/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクト データを表示することはできません。

### 組織の切り替え
{: #org-switching }
プロジェクトが表示されず、CircleCI 上でビルド中でない場合は、 CircleCI Web アプリの左上隅の**組織**を確認してください。 たとえば、左上にユーザー `my-user` が表示されているなら、`my-user` に所属する GitHub プロジェクトのみが ** Projects** の下で使用できます。 GitHub プロジェクト `your-org/project` をビルドする場合は、アプリケーションメニューで `your-org` を選択して組織を変更する必要があります。

![組織の切り替えメニュー]({{site.baseurl}}/assets/img/docs/org-centric-ui_newui.png)

## パイプラインの表示と移動
{: #viewing-and-navigating-pipelines }

リポジトリに新しいコミットがプッシュされると、お客様のパイプラインが CircleCI Web アプリの**ダッシュボード**に表示されます。 パイプラインを拡大し、任意のワークフローやジョブの説明でクリックすると、ワークフローや単一のジョブを表示することができます。

パイプラインの単一のジョブを表示する際は、ページ上部にあるパンくずリストを使ってジョブの各ワークフローやパイプラインに戻ることができます。

![パイプラインのパンくずリスト]({{site.baseurl}}/assets/img/docs/pipeline-breadcrumbs.png)

## 関連項目
{: #see-also }

- [設定]({{site.baseurl}}/settings)ガイド
