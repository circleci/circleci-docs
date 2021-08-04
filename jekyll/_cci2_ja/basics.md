---
layout: classic-docs
title: "基本事項"
description: "基本事項"
---


CircleCI で使用される基本的な概念については、以下の各リンクを参照してください。

| ドキュメント                                                                     | 説明                                                                                                                                                                                     |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [概要]({{ site.baseurl }}/2.0/about-circleci/)                               | CI (継続的インテグレーション) の概要と、CircleCI ケース スタディーへのリンク                                                                                                                                         |
| [YAML を記述する]({{ site.baseurl }}/2.0/writing-yaml/)                         | YAML の紹介                                                                                                                                                                               |
| [コンテナを使用する]({{ site.baseurl }}/2.0/containers/)                            | コンテナの概要と、コンテナを使用してビルド時間を短縮し、キューイングを防止する方法                                                                                                                                              |
| [GitHub と Bitbucket のインテグレーション]({{ site.baseurl }}/2.0/gh-bb-integration/) | CircleCI で GitHub と Bitbucket を使用する方法                                                                                                                                                  |
| [コンセプト]({{ site.baseurl }}/2.0/concepts/)                                  | CircleCI 2.0 のステップ、イメージ、ジョブ、ワークフローのコンセプトと構成階層に関する概要                                                                                                                                    |
| [Orbs、ジョブ、ステップ、ワークフロー]({{ site.baseurl }}/2.0/jobs-steps/)                 | CircleCI 2.0 の構成にジョブとステップを使用する方法                                                                                                                                                       |
| [Executor タイプを選択する]({{ site.baseurl }}/2.0/executor-types/)                | Each job may use a different executor and image. ジョブ実行に使用する Executor およびイメージの概要と、 ジョブ実行に使用する Executor およびイメージの概要と、 実際のジョブに `docker`、`machine`、`windows`、`macos` の各 Executor を使用した場合の比較 |
| [オープンソース プロジェクトの構築]({{ site.baseurl }}/2.0/oss/)                           | オープンソース プロジェクトの構築に関するベスト プラクティス                                                                                                                                                        |
{: class="table table-striped"}

## 機能
CircleCI の基本機能の使用方法については、以下の各リンクを参照してください。

Learn to use the basic features of CircleCI.

| ドキュメント                                                         | 説明                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| [環境変数の使用]({{ site.baseurl }}/2.0/env-vars/)                    | CircleCI アプリケーションや `config.yml` ファイルで環境変数を使用する方法                    |
| [コンテキストの使用]({{ site.baseurl }}/2.0/contexts/)                  | コンテキストを使用してグローバルな環境変数を設定する方法                                        |
| [シェル スクリプトの使用]({{ site.baseurl }}/2.0/using-shell-scripts/)    | CircleCI 設定でのシェル スクリプトの使用に関するベスト プラクティス                             |
| [CircleCI に SSH 鍵を追加する方法]({{ site.baseurl }}/2.0/add-ssh-key/) | CircleCI に SSH 鍵を登録する                                               |
| [SSH を使用したデバッグ]({{ site.baseurl }}/2.0/ssh-access-jobs/)       | SSH を使用してビルドに関する問題をデバッグする方法                                         |
| [API トークンの管理]({{ site.baseurl }}/2.0/managing-api-tokens/)     | CircleCI API を使用するためにスコープ付きトークンを割り当てる方法                             |
| [ビルドのスキップとキャンセル]({{ site.baseurl }}/2.0/skip-build/)           | CircleCI による変更内容の自動ビルドを止める方法                                        |
| [通知の使用]({{ site.baseurl }}/2.0/notifications/)                 | CircleCI アプリケーションで Slack 通知、チャット通知、メール通知を設定・変更する方法                  |
| [ステータス バッジの追加]({{ site.baseurl }}/2.0/status-badges/)          | Web ページまたはドキュメントにビルドのステータスを表示する方法                                   |
| [ビルド アーティファクトの保存]({{ site.baseurl }}/2.0/artifacts/)           | `config.yml` 構文でビルド アーティファクトを保存し、それらへのリンクを CircleCI アプリケーションで確認する方法 |
| [API を使用したジョブのトリガー]({{ site.baseurl }}/2.0/api-job-trigger/)   | API でジョブをトリガーする方法                                                   |
| [インサイトの使用]({{ site.baseurl }}/2.0/insights/)                   | リポジトリのステータスとビルド パフォーマンス データを表示する方法                                  |
{: class="table table-striped"}

We’re thrilled to have you here. Happy building!

_CircleCI チーム_
