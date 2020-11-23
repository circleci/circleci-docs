---
layout: classic-docs
title: "オープンソース プロジェクトの構築"
short-title: "オープンソースプロジェクトの構築"
description: "オープンソース プロジェクトの構築に関するベスト プラクティス"
categories:
  - getting-started
order: 1
---

以下のセクションに沿って、CircleCI 上でのオープンソース プロジェクトのビルドに関するヒントとベスト プラクティスについて説明します。

- 目次
{:toc}

## 概要
{:.no_toc}

To support the open source community, organizations on Github or Bitbucket will be given 100,000 free credits per week that can be spent on open source projects. このクレジットは Linux の Medium リソースで使用可能です。 各組織で最大 4 件のジョブを同時実行できます。

**Note:** If you are building an open source project on macOS, contact billing@circleci.com to enable these additional containers.

## セキュリティ

While open source can be a liberating practice, take care not to liberate sensitive information.

- If your repository is public, your CircleCI project and its build logs are also public. 表示対象として選択する情報に注意してください。
- Environment variables set in the CircleCI application are hidden from the public, these variables will not be shared in [forked PRs](#pass-secrets-to-builds-from-forked-pull-requests) unless explicitly enabled.

## Features and settings for open source projects

以下の機能と設定は、オープンソース プロジェクトにおいて特に便利です。

### Private environment variables
{:.no_toc}

多くのプロジェクトでは、API トークン、SSH キー、またはパスワードが必要です。 Private environment variables allow you to safely store secrets, even if your project is public.

For more information, see the [Environment Variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project) document.

### Only build pull requests
{:.no_toc}

By default, CircleCI builds every commit from every branch. This behavior may be too aggressive for open source projects, which often have significantly more commits than private projects.

To change this setting, go to the **Project Settings>Advanced** of your project and set the **Only build pull requests** option to *On*.

**Note:** Even if this option is enabled, CircleCI will still build all commits from your project's default branch and tags

### Build pull requests from forked repositories
{:.no_toc}

Many open source projects accept PRs from forked repositories. Building these PRs is an effective way to catch bugs before manually reviewing changes.

By default, CircleCI does not build PRs from forked repositories. To change this setting, go to the **Project Settings>Advanced** of your project and set the **Build forked pull requests** option to *On*.

**Note**This feature is not currently supported for BitBucket users.

**Note:** If a user submits a pull request to your repository from a fork, but no pipeline is triggered, then the user most likely is following a project fork on their personal account rather than the project itself of CircleCi, causing the jobs to trigger under the user's personal account and not the organization account. To resolve this issue, have the user unfollow their fork of the project on CircleCI and instead follow the source project. This will trigger their jobs to run under the organization when they submit pull requests.

### Pass secrets to builds from forked pull requests
{:.no_toc}

Running an unrestricted build in a parent repository can be dangerous. Projects often contain sensitive information, and this information is freely available to anyone who can push code that triggers a build.

By default, CircleCI does not pass secrets to builds from forked PRs for open source projects and hides four types of configuration data:

- アプリケーションを通して設定される[環境変数](#プライベート環境変数)

- [デプロイ キーとユーザー キー]({{ site.baseurl }}/2.0/gh-bb-integration/#デプロイ-キーとユーザー-キー)

- ビルド中に任意のホストにアクセスするために [CircleCI に追加した]({{ site.baseurl }}/2.0/add-ssh-key)、パスフレーズのないプライベート SSH キー

- [AWS permissions]({{ site.baseurl }}/2.0/deployment-examples/#aws) and configuration files.

**Note:** Forked PR builds of open source projects that require secrets will not run successfully on CircleCI until you enable this setting.

If you are comfortable sharing secrets with anyone who forks your project and opens a PR, you can enable the **Pass secrets to builds from forked pull requests** option. In the **Project Settings>Advanced** of your project, set the **Pass secrets to builds from forked pull requests** option to *On*.

### キャッシュ

Caches are isolated based on GitHub Repo for PRs. CircleCI uses the GitHub repository-id of the originator of the fork PR to identify the cache.

- PRs from the same fork repo will share a cache (this includes, as previously stated, that PRs in the master repo share a cache with master).
- それぞれ異なるフォーク リポジトリ内にある 2 つの PR は、別々のキャッシュを持ちます。
- enabling the sharing of [environment variables]({{site.baseurl}}/2.0/env-vars) will enable cache sharing between the original repo and all forked builds.

Currently there is no pre-population of caches because this optimization hasn't made it to the top of the priority list yet.

## Example open source projects

Following are a few examples of projects (big and small) that build on CircleCI:

- **[React](https://github.com/facebook/react)** - Facebook の JavaScript ベースの React は、CircleCI (および他の CI ツール) でビルドされています。 
- **[React Native](https://github.com/facebook/react-native/)** - JavaScript と React を使用してネイティブ モバイル アプリケーションをビルドします。
- **[Flow](https://github.com/facebook/flow/)** - JavaScript に静的な型指定を追加して、開発者の生産性とコードの品質を向上させます。
- **[Relay](https://github.com/facebook/relay)** - データ駆動型の React アプリケーションをビルドするための JavaScript フレームワーク。 
- **[Vue](https://github.com/vuejs/vue)** - Vue.js は、Web 上で UI をビルドするための漸進的な JavaScript フレームワークであり、段階的に採用できます。
- **[Storybook](https://github.com/storybooks/storybook)** - 対話型 UI コンポーネントの開発とテストを行います (React、React Native、Vue、Angular、Ember)。
- **[Electron](https://github.com/electron/electron)** - JavaScript、HTML、および CSS でクロスプラットフォームのデスクトップ アプリケーションをビルドします。
- **[Angular](https://github.com/angular/angular)** - ブラウザーおよびデスクトップ Web アプリケーションをビルドするためのフレームワーク。
- **[Apollo](https://github.com/apollographql)** - GraphQL 用の柔軟なオープンソース ツールをビルドしているコミュニティ。
- **[PyTorch](https://github.com/pytorch/pytorch)** - データ操作および機械学習のプラットフォーム。
- **[Calypso](https://github.com/Automattic/wp-calypso)** - WordPress.com を活用するための次世代 Web アプリケーション。
- **[fastlane](https://github.com/fastlane/fastlane)** - Android および iOS 用の自動ビルド ツール。
- **[Yarn](https://github.com/yarnpkg/yarn)** - [npm に代わるツール](https://circleci.com/blog/why-are-developers-moving-to-yarn/)。

## See also
{:.no_toc}

Refer to the [Examples]({{ site.baseurl }}/2.0/example-configs/) document for more public and open source project configuration links organized by CircleCI features and by programming language.