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

A CircleCI project shares the name of the associated code repository and is visible on the **Projects** page of the [CircleCI web app](https://app.circleci.com/). Projects are added by using the **Set Up Project** button.

On the **Projects** page, you can either set up any project that you are the owner of on your VCS, or follow any project in your organization to gain access to its pipelines and to subscribe to [email notifications]({{site.baseurl}}/2.0/notifications/) for the project's status.

## Projects dashboard
{: #projects-dashboard }

![Project Dashboard]({{site.baseurl}}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

*プロジェクト管理者*とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーです。 A *User* is an individual user within an organization. A *CircleCI user* is anyone who can log in to the CircleCI platform with a username and password. 関係する CircleCI プロジェクトを表示したりフォローするには、ユーザーが [GitHub または Bitbucket 組織]({{site.baseurl}}/2.0/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクト データを表示することはできません。
