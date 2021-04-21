---
layout: classic-docs
title: "基本事項"
description: "基本事項"
---


CircleCI で使用される基本的な概念については、以下の各リンクを参照してください。

| ドキュメント                                                                     | 説明                                                                                                   |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [概要]({{ site.baseurl }}/2.0/about-circleci/)                               | CI (継続的インテグレーション) の概要と、CircleCI ケース スタディーへのリンク                                                       |
| [YAML を記述する]({{ site.baseurl }}/2.0/writing-yaml/)                         | YAML の紹介                                                                                             |
| [コンテナを使用する]({{ site.baseurl }}/2.0/containers/)                            | コンテナの概要と、コンテナを使用してビルド時間を短縮し、キューイングを防止する方法                                                            |
| [GitHub と Bitbucket のインテグレーション]({{ site.baseurl }}/2.0/gh-bb-integration/) | CircleCI で GitHub と Bitbucket を使用する方法                                                                |
| [コンセプト]({{ site.baseurl }}/2.0/concepts/)                                  | CircleCI 2.0 のステップ、イメージ、ジョブ、ワークフローのコンセプトと構成階層に関する概要                                                  |
| [Orbs、ジョブ、ステップ、ワークフロー]({{ site.baseurl }}/2.0/jobs-steps/)                 | CircleCI 2.0 の構成にジョブとステップを使用する方法                                                                     |
| [Executor タイプを選択する]({{ site.baseurl }}/2.0/executor-types/)                | ジョブ実行に使用する Executor およびイメージの概要と、 実際のジョブに `docker`、`machine`、`windows`、`macos` の各 Executor を使用した場合の比較 |
| [オープンソース プロジェクトの構築]({{ site.baseurl }}/2.0/oss/)                           | オープンソース プロジェクトの構築に関するベスト プラクティス                                                                      |
{: class="table table-striped"}

## 機能
{: #features }

Learn to use the basic features of CircleCI.

| Document                                                                 | Description                                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [Using Environment Variables]({{ site.baseurl }}/2.0/env-vars/)          | How to use environment variables in the CircleCI app and in the `config.yml` file.                     |
| [Using Contexts]({{ site.baseurl }}/2.0/contexts/)                       | How to use Contexts to set global environment variables.                                               |
| [Using Shell Scripts]({{ site.baseurl }}/2.0/using-shell-scripts/)       | Best practices for using shell scripts in CircleCI configuration.                                      |
| [Adding an SSH Key]({{ site.baseurl }}/2.0/add-ssh-key/)                 | How to add an SSH key to CircleCI.                                                                     |
| [Debugging with SSH]({{ site.baseurl }}/2.0/ssh-access-jobs/)            | How to use SSH to debug build problems.                                                                |
| [Managing API Tokens]({{ site.baseurl }}/2.0/managing-api-tokens/)       | How to assign scoped tokens for using the CircleCI API.                                                |
| [Skipping and Cancelling Builds]({{ site.baseurl }}/2.0/skip-build/)     | How to prevent CircleCI from automatically building changes.                                           |
| [Enabling Notifications]({{ site.baseurl }}/2.0/notifications/)          | How to set or modify Slack, chat, and email notifications in the CircleCI app.                         |
| [Embedding Build Status Badges]({{ site.baseurl }}/2.0/status-badges/)   | How to display the status of your builds on a web page or document.                                    |
| [Storing Artifacts]({{ site.baseurl }}/2.0/artifacts/)                   | How to store build artifacts in the `config.yml` syntax and finding links to them in the CircleCI app. |
| [Using the API to Trigger Jobs]({{ site.baseurl }}/2.0/api-job-trigger/) | How to trigger Jobs with the API.                                                                      |
| [Using Insights]({{ site.baseurl }}/2.0/insights/)                       | How to view status for your repos and build performance data.                                          |
{: class="table table-striped"}

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
