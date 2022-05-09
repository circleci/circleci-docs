---
layout: classic-docs
title: "プロジェクト"
short-title: "プロジェクト"
description: "プロジェクトの説明"
categories:
  - projects
order: 2
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

CircleCI プロジェクトは、関連付けられているコードリポジトリの名前を共有し、 [CircleCI Web アプリ](https://app.circleci.com/) の **Projects** のページに表示されます。 プロジェクトは、 **Set Up Project** ボタンを使用して追加します。

**Projects** のページでは、VCS で所有者になっているプロジェクトをセットアップするか、組織内のプロジェクトをフォローすることで、パイプラインにアクセスし、プロジェクトのステータスに関する [メール通知]({{site.baseurl}}/ja/2.0/notifications/) を受け取ることができます。

詳細については、[CircleCI でのプロジェクトの作成]({{site.baseurl}}/ja/2.0/create-project/)を参照してください。
## プロジェクトダッシュボード
{: #projects-dashboard }

![プロジェクトダッシュボード]({{site.baseurl}}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

*プロジェクト管理者*とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーです。 *ユーザー*とは、組織内の個々のユーザーを指します。 CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 関係する CircleCI プロジェクトを表示したりフォローするには、ユーザーが [GitHub または Bitbucket 組織]({{site.baseurl}}/2.0/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクト データを表示することはできません。