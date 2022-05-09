---
layout: classic-docs
title: "オープンソース プロジェクトの構築"
short-title: "オープンソースプロジェクトの構築"
description: "オープンソースプロジェクトのビルドに関するベストプラクティス"
categories:
  - はじめよう
order: 1
---

以下のセクションでは、CircleCI でのオープンソースプロジェクトのビルドに関するヒントとベストプラクティスを紹介します。

* TOC
{:toc}

## 概要
{: #overview }
{:.no_toc}

オープンソースコミュニティをサポートする目的で、GitHub または Bitbucket 上の組織には、オープンソースプロジェクト用にクレジットが毎週無料で提供されます。 これらのクレジットは、Linux のリソースで使用可能です。

**注:**
* macOS でオープンソースプロジェクトをビルドする場合は、これらの追加コンテナを有効にする方法について billing@circleci.com にお問い合わせください。
* オープンソースのクレジットの利用可能量や制限は、UI 画面上では確認できません。


## セキュリティ
{: #security }

オープンソースは開放型の活動であり、機密情報を「開放」しないように注意が必要です。

- リポジトリをパブリックにすると、CircleCI プロジェクトとそのビルドログもパブリックになります。 出力する情報に注意してください。
- CircleCI アプリケーション内に設定される環境変数は、一般には公開されず、明示的に有効にされない限り[フォークされたプルリクエスト](#pass-secrets-to-builds-from-forked-pull-requests)に共有されることもありません。

## オープンソースプロジェクトの機能と設定
{: #features-and-settings-for-open-source-projects }

以下の機能と設定は、オープンソースプロジェクトにおいて特に便利です。

### Private environment variables
{: #private-environment-variables }
{:.no_toc}

多くのプロジェクトでは、API トークン、SSH キー、またはパスワードが必要です。 Private environment variables allow you to safely store secrets, even if your project is public.

For more information, see the [Environment Variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project) document.

### Only build pull requests
{: #only-build-pull-requests }
{:.no_toc}

CircleCI はデフォルトですべてのブランチのすべてのコミットをビルドします。 This behavior may be too aggressive for open source projects, which often have significantly more commits than private projects.

To change this setting, go to the **Project Settings>Advanced** of your project and set the **Only build pull requests** option to _On_.

**Note:** Even if this option is enabled, CircleCI will still build all commits from your project's default branch and tags

### Build pull requests from forked repositories
{: #build-pull-requests-from-forked-repositories }
{:.no_toc}

多くのオープンソースプロジェクトは、フォークされたリポジトリから PR を受け入れます。 Building these PRs is an effective way to catch bugs before manually reviewing changes.

CircleCI はデフォルトで、フォークされたリポジトリからの PR をビルドしません。 To change this setting, go to the **Project Settings>Advanced** of your project and set the **Build forked pull requests** option to _On_.

**Note**This feature is not currently supported for BitBucket users.

**Note:** If a user submits a pull request to your repository from a fork, but no pipeline is triggered, then the user most likely is following a project fork on their personal account rather than the project itself of CircleCi, causing the jobs to trigger under the user's personal account and not the organization account. To resolve this issue, have the user unfollow their fork of the project on CircleCI and instead follow the source project. これにより、プルリクエストを発行した際に、組織アカウントでジョブの実行がトリガーされるようになります。

### Pass secrets to builds from forked pull requests
{: #pass-secrets-to-builds-from-forked-pull-requests }
{:.no_toc}

制限を設定していないビルドを親リポジトリ内で実行することは、場合によっては危険です。 Projects often contain sensitive information, and this information is freely available to anyone who can push code that triggers a build.

By default, CircleCI does not pass secrets to builds from forked PRs for open source projects and hides four types of configuration data:

- アプリケーションを通して設定される[環境変数](#プライベート環境変数)

- {{ site.baseurl }}/2.0/gh-bb-integration/#デプロイ-キーとユーザー-キー

- ビルド中に任意のホストにアクセスするために [CircleCI に追加した]({{ site.baseurl }}/2.0/add-ssh-key)、パスフレーズのないプライベート SSH キー

- [AWS permissions]({{ site.baseurl }}/2.0/deployment-examples/#aws) and configuration files.

**Note:** Forked PR builds of open source projects that require secrets will not run successfully on CircleCI until you enable this setting.

If you are comfortable sharing secrets with anyone who forks your project and opens a PR, you can enable the **Pass secrets to builds from forked pull requests** option. In the **Project Settings>Advanced** of your project, set the **Pass secrets to builds from forked pull requests** option to _On_.

### キャッシュ
{: #caching }

キャッシュは、PR の GitHub リポジトリに基づいて分離されます。 CircleCI uses the GitHub repository-id of the originator of the fork PR to identify the cache.
- PRs from the same fork repo will share a cache (this includes, as previously stated, that PRs in the master repo share a cache with master). For example, PRs from the main repo share a cache with the main repo branches (in particular the `main` branch).
- それぞれ異なるフォーク リポジトリ内にある 2 つの PR は、別々のキャッシュを持ちます。 That means that a PR from a fork will not share a cache with the main repo `main` branch.
- enabling the [passing of secrets to build from forked pull requests](#pass-secrets-to-builds-from-forked-pull-requests) will enable cache sharing between the original repo and all forked builds.

Currently there is no pre-population of caches because this optimization hasn't made it to the top of the priority list yet.

## Example open source projects
{: #example-open-source-projects }

CircleCI 上でビルドされたさまざまな規模のプロジェクトを以下にいくつかご紹介します。

- **[React](https://github.com/facebook/react)** - Facebook の JavaScript ベースの React は、CircleCI (および他の CI ツール) でビルドされています。
- **[React Native](https://github.com/facebook/react-native/)** - JavaScript と React を使用してネイティブ モバイル アプリケーションをビルドします。
- **[Flow](https://github.com/facebook/flow/)** - JavaScript に静的な型指定を追加して、開発者の生産性とコードの品質を向上させます。
- **[Vue](https://github.com/vuejs/vue)** -  Vue.js は、Web 上で UI をビルドするための漸進的な JavaScript フレームワークであり、段階的に採用できます。
- **[Storybook](https://github.com/storybookjs/storybook)** - Interactive UI component dev & test: React, React Native, Vue, Angular, Ember.
- **[Electron](https://github.com/electron/electron)** - JavaScript、HTML、および CSS でクロスプラットフォームのデスクトップ アプリケーションをビルドします。
- **[Angular](https://github.com/angular/angular)** - ブラウザーおよびデスクトップ Web アプリケーションをビルドするためのフレームワーク。
- **[Apollo](https://github.com/apollographql)** - GraphQL 用の柔軟なオープンソース ツールをビルドしているコミュニティ。
- **[PyTorch](https://github.com/pytorch/pytorch)** - データ操作および機械学習のプラットフォーム。
- **[Calypso](https://github.com/Automattic/wp-calypso)** - WordPress.com を活用するための次世代 Web アプリケーション。
- **[fastlane](https://github.com/fastlane/fastlane)** - Android および iOS 用の自動ビルド ツール。
- **[Yarn](https://github.com/yarnpkg/yarn)** - [npm に代わるツール](https://circleci.com/blog/why-are-developers-moving-to-yarn/)。

## 設定ファイルの詳細
{: #see-also }
{:.no_toc}

「[パブリックリポジトリの例]({{ site.baseurl }}/ja/2.0/example-configs/)」では、パブリックおよびオープンソースのプロジェクトの設定に関する各種のリンクが、CircleCI の機能とプログラミング言語ごとに紹介されています。
