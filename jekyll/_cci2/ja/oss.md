---
layout: classic-docs
title: "オープンソースプロジェクトの構築"
short-title: "オープンソースプロジェクトの構築"
description: "オープンソースプロジェクトの構築に関するベストプラクティス"
categories:
  - getting-started
order: 1
---

ここでは、以下のセクションに沿って、CircleCI 上でのオープンソースプロジェクトのビルドに関するヒントとベストプラクティスについて説明します。

- 目次
{:toc}

## 概要
{:.no_toc}

To support the open source community, organizations on Github or Bitbucket will be given 100,000 free credits per week that can be spent on on open source projects. These credits can be spent on Linux-medium resources. Each organization can have a maximum of four concurrent jobs running.

**Note:** If you are building an open source project on macOS, contact billing@circleci.com to enable these additional containers.

## セキュリティ

While open source can be a liberating practice, take care not to liberate sensitive information.

- リポジトリをパブリックにすると、CircleCI プロジェクトとそのビルドログもパブリックになります。 表示対象として選択する情報に注意してください。
- CircleCI アプリケーション内に設定される環境変数は、一般には公開されず、明示的に有効にされない限り[フォークされた PR](#pass-secrets-to-builds-from-forked-pull-requests) に共有されることもありません。

## オープンソースプロジェクトの機能と設定

The following features and settings are especially useful for open source projects.

### プライベート環境変数
{:.no_toc}

Many projects require API tokens, SSH keys, or passwords. Private environment variables allow you to safely store secrets, even if your project is public. For more information, see the [Environment Variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project) document.

### プルリクエストのみをビルドする
{:.no_toc}

By default, CircleCI builds every commit from every branch. This behavior may be too aggressive for open source projects, which often have significantly more commits than private projects. To change this setting, go to the **Advanced Settings** of your project and set the **Only build pull requests** option to *On*.

**Note:** Even if this option is enabled, CircleCI will still build all commits from your project's default branch.

### フォークされたリポジトリからプルリクエストをビルドする
{:.no_toc}

Many open source projects accept PRs from forked repositories. Building these PRs is an effective way to catch bugs before manually reviewing changes.

By default, CircleCI does not build PRs from forked repositories. To change this setting, go to the **Advanced Settings** of your project and set the **Build forked pull requests** option to *On*.

### フォークされたプルリクエストからのビルドにシークレットを渡す
{:.no_toc}

Running an unrestricted build in a parent repository can be dangerous. Projects often contain sensitive information, and this information is freely available to anyone who can push code that triggers a build.

By default, CircleCI does not pass secrets to builds from forked PRs for open source projects and hides four types of configuration data:

- アプリケーションを通して設定される[環境変数](#private-environment-variables)

- [デプロイキーとユーザーキー]({{ site.baseurl }}/ja/2.0/gh-bb-integration/#デプロイキーとユーザーキー)

- ビルド中に任意のホストにアクセスするために [CircleCI に追加した]({{ site.baseurl }}/ja/2.0/add-ssh-key)、パスフレーズのないプライベート SSH キー

- [AWS 権限]({{ site.baseurl }}/ja/2.0/deployment-integrations/#aws)および設定ファイル

**Note:** Forked PR builds of open source projects that require secrets will not run successfully on CircleCI until you enable this setting.

If you are comfortable sharing secrets with anyone who forks your project and opens a PR, you can enable the **Pass secrets to builds from forked pull requests** option. In the **Advanced Settings** of your project, set the **Pass secrets to builds from forked pull requests** option to *On*.

### キャッシュ

Caches are isolated based on GitHub Repo for PRs. CircleCI uses the GitHub repository-id of the originator of the fork PR to identify the cache.

- 同じフォークリポジトリからの PR は、キャッシュを共有します (前述のように、これにはマスターリポジトリ内の PR とマスターによるキャッシュの共有が含まれます)。
- それぞれ異なるフォークリポジトリ内にある 2つの PR は、別々のキャッシュを持ちます。

Currently there is no pre-population of caches because this optimization hasn't made it to the top of the priority list yet.

## オープンソースプロジェクトの例

Following are a few examples of projects (big and small) that build on CircleCI:

- **[React](https://github.com/facebook/react)** - Facebook の JavaScript ベースの React は、CircleCI (および他の CI ツール) でビルドされています。 
- **[React Native](https://github.com/facebook/react-native/)** - JavaScript と React を使用してネイティブモバイルアプリケーションをビルドします。
- **[Flow](https://github.com/facebook/flow/)** - JavaScript に静的な型指定を追加して、開発者の生産性とコードの品質を向上させます。
- **[Relay](https://github.com/facebook/relay)** - データ駆動型の React アプリケーションをビルドするための JavaScript フレームワーク。 
- **[Vue](https://github.com/vuejs/vue)** - Vue.js は、Web 上で UI をビルドするための漸進的な JavaScript フレームワークであり、段階的に採用できます。
- **[Storybook](https://github.com/storybooks/storybook)** - 対話型 UI コンポーネントの開発とテストを行います (React、React Native、Vue、Angular、Ember)。
- **[Electron](https://github.com/electron/electron)** - JavaScript、HTML、および CSS でクロスプラットフォームのデスクトップアプリケーションをビルドします。
- **[Angular](https://github.com/angular/angular)** - ブラウザーおよびデスクトップ Web アプリケーションをビルドするためのフレームワーク。
- **[Apollo](https://github.com/apollographql)** - GraphQL 用の柔軟なオープンソースツールをビルドしているコミュニティ。
- **[PyTorch](https://github.com/pytorch/pytorch)** - データ操作および機械学習のプラットフォーム。
- **[Calypso](https://github.com/Automattic/wp-calypso)** - WordPress.com を活用するための次世代 Web アプリケーション。
- **[fastlane](https://github.com/fastlane/fastlane)** - Android および iOS 用の自動ビルドツール。
- **[Yarn](https://github.com/yarnpkg/yarn)** - [npm に代わるツール](https://circleci.com/blog/why-are-developers-moving-to-yarn/)。

## 関連項目
{:.no_toc}

Refer to the [Examples]({{ site.baseurl }}/2.0/example-configs/) document for more public and open source project configuration links organized by CircleCI features and by programming language.