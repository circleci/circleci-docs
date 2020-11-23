---
layout: classic-docs
title: "プロジェクト"
short-title: "プロジェクト"
description: "プロジェクトの説明"
categories:
  - projects
order: 2
version:
  - Cloud
  - Server v2.x
---

CircleCI プロジェクトは、関連付けられているコード リポジトリの名前を共有し、CircleCI アプリケーションの [Projects (プロジェクト)] ページに表示されます。プロジェクトは、[Add Project (プロジェクトの追加)] ボタンを使用して追加します。

On the "Add Projects" page, you can either *Set Up* any project that you are the owner of on your VCS, or, *Follow* any project in your organization to gain access to its pipelines and to subscribe to \[email notifications\]({{ site.baseurl }}/2.0/notifications/) for the project's status.

## Add projects page

{:.tab.addprojectpage.Cloud}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

{:.tab.addprojectpage.Server}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project. A *User* is an individual user within an org. A CircleCI user is anyone who can log in to the CircleCI platform with a username and password. Users must be added to a [GitHub or Bitbucket org]({{ site.baseurl }}/2.0/gh-bb-integration/) to view or follow associated CircleCI projects. Users may not view project data that is stored in environment variables.