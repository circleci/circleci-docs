---
layout: classic-docs
title: "プロジェクト"
short-title: "プロジェクト"
description: "プロジェクトの説明"
categories:
  - projects
order: 2
---

CircleCI プロジェクトは、関連付けられているコードリポジトリの名前を共有し、CircleCI アプリケーションの [Projects (プロジェクト)] ページに表示されます。プロジェクトは、[Add Project (プロジェクトの追加)] ボタンを使用して追加します。

## プロジェクトの追加ページ

![ヘッダー]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

ユーザーは、プロジェクトを*フォロー*することで、プロジェクトの[ビルドステータス]({{ site.baseurl }}/ja/2.0/status/)に関する[メール通知]({{ site.baseurl }}/ja/2.0/notifications/)を受け取り、プロジェクトを自分の CircleCI ダッシュボードに追加できます。

*プロジェクト管理者*とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーです。 *ユーザー*とは、組織内の個々のユーザーです。 CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 関係する CircleCI プロジェクトを表示したりフォローするには、ユーザーが [GitHub または Bitbucket 組織]({{ site.baseurl }}/ja/2.0/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクトデータを表示することはできません。