---
layout: classic-docs
title: "プロジェクトとビルド"
short-title: "プロジェクトとビルド"
description: "CircleCI 2.0 プロジェクトの入門ガイド"
categories:
  - getting-started
order: 1
---

ここでは、CircleCI でプロジェクトのビルドを自動化する方法について説明します。

## 概要

GitHub または Bitbucket 上のソフトウェアリポジトリが承認され、[プロジェクト]({{ site.baseurl }}/ja/2.0/glossary/#project)として circleci.com に追加された後は、コードを変更するたびに、クリーンコンテナ、またはユーザーの要件に合わせて設定された VM で[ビルド]({{ site.baseurl }}/ja/2.0/build)と自動化されたテストがトリガーされます。

## プロジェクトの追加

CircleCI プロジェクトは、関連付けられているコードリポジトリの名前を共有し、CircleCI アプリケーションの [Projects (プロジェクト)] ページに表示されます。プロジェクトは、[Add Project (プロジェクトの追加)] ボタンを使用して追加します。

## プロジェクトの追加ページ

![ヘッダー]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

ユーザーは、プロジェクトを*フォロー*することで、プロジェクトの[ビルドステータス]({{ site.baseurl }}/ja/2.0/status/)に関する[メール通知]({{ site.baseurl }}/ja/2.0/notifications/)を受け取り、プロジェクトを自分の CircleCI ダッシュボードに追加できます。

*プロジェクト管理者*とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーです。 *ユーザー*とは、組織内の個々のユーザーです。 CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 関係する CircleCI プロジェクトを表示したりフォローするには、ユーザーが [GitHub または Bitbucket 組織]({{ site.baseurl }}/ja/2.0/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクトデータを表示することはできません。

プロジェクトが表示されない場合は、CircleCI 上でビルド中でないときに CircleCI アプリケーションの左上隅で組織を確認してください。 たとえば、左上にユーザー `my-user` が表示されているなら、`my-user` に所属する GitHub プロジェクトのみが `Add Projects` の下で使用できます。 GitHub プロジェクト `your-org/project` をビルドする場合は、アプリケーションの [Switch Organization (組織の切り替え)] メニューで `your-org` を選択する必要があります。

![SWITCH ORGANIZATION メニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

## ビルドの表示

新しいコミットがリポジトリにプッシュされると、CircleCI アプリケーションの [Jobs (ジョブ)] ページにビルドが表示されます。 コンフィグの変更をプッシュしたときに、ビルド中のジョブが [Jpbs (ジョブ)] ページに表示されない場合は、ビルドを有効にするにはコンフィグをどう更新したらよいか、CircleCI アプリケーションの [Workflows] タブで確認してください。

![Workflows]({{ site.baseurl }}/assets/img/docs/approval_job.png)

## 関連項目

[設定]({{ site.baseurl }}/2.0/settings)