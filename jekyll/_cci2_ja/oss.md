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
* 利用できるオープンソースクレジットの量や制限は、UI 画面上では確認できません。


## セキュリティ
{: #security }

オープンソースは開放型の活動であり、機密情報を「開放」しないように注意が必要です。

- リポジトリをパブリックにすると、CircleCI プロジェクトとそのビルドログもパブリックになります。 出力する情報に注意してください。
- CircleCI アプリケーション内に設定されている環境変数は、一般には公開されず、明示的に有効にされない限り[フォークされたプルリクエスト](#pass-secrets-to-builds-from-forked-pull-requests)に共有されることはありません。

## オープンソースプロジェクトの機能と設定
{: #features-and-settings-for-open-source-projects }

以下の機能と設定は、オープンソースプロジェクトにおいて特に便利です。

### プライベート環境変数
{: #private-environment-variables }
{:.no_toc}

多くのプロジェクトでは、API トークン、SSH キー、またはパスワードが必要です。 プライベート環境変数を使用すると、プロジェクトがパブリックの場合でもシークレットを安全に保存できます。

詳細については、[環境変数]({{ site.baseurl }}/ja/2.0/env-vars/#setting-an-environment-variable-in-a-project)を参照してください。

### プルリクエストのみをビルドする
{: #only-build-pull-requests }
{:.no_toc}

CircleCI はデフォルトでは、すべてのブランチのすべてのコミットをビルドします。 プライベートプロジェクトよりもきわめて多くのコミットが存在するオープンソースプロジェクトでは、この動作は活動的すぎるかもしれません。

この設定を変更するには、プロジェクトの **Project Settings>Advanced** に移動して、**Only build pull requests (プルリクエストのみビルド)** オプションを_オン_に設定します。

**注:** このオプションが有効であっても、CircleCI はプロジェクトのデフォルトのブランチやタグからはすべてのコミットをビルドします。

### フォークされたリポジトリからのプルリクエストをビルドする
{: #build-pull-requests-from-forked-repositories }
{:.no_toc}

多くのオープンソースプロジェクトは、フォークされたリポジトリから PR を受け入れます。 これらの PR をビルドすると、手動で変更をレビューする前にバグを捕捉することができるので、効果的な方法です。

CircleCI はデフォルトでは、フォークされたリポジトリからの PR をビルドしません。 この設定を変更するには、プロジェクトの **Project Settings>Advanced** に移動して、**Build forked pull requests (フォークされたプルリクエストをビルド)** オプションを_オン_に設定します。

**注:** 現在この機能は、BitBucket ではサポートされていません。

**注: ** ユーザーがフォークからプルリクエストをリポジトリに送信しても、パイプラインがトリガーされない場合、ユーザーは CircleCI のプロジェクトではなく個人アカウントでフォークされたプロジェクトをフォローしている可能性があります。その場合、ジョブは組織のアカウントではなくユーザー個人のアカウントでトリガーされます。 この問題を解決するには、そのユーザーに個人用フォークからフォローを解除してもらい、代わりにソースプロジェクトをフォローしてもらいます。 これにより、プルリクエストを送信すると、組織のアカウントでジョブの実行がトリガーされるようになります。

### フォークされたプルリクエストからのビルドにシークレットを渡す
{: #pass-secrets-to-builds-from-forked-pull-requests }
{:.no_toc}

制限を設定していないビルドを親リポジトリ内で実行することは、場合によっては危険です。 プロジェクトにはしばしば機密情報が含まれており、ビルドをトリガーするコードをプッシュできるユーザーならだれでも、この情報を自由に入手できます。

デフォルトでは、CircleCI はオープンソースプロジェクトの場合、フォークされた PR からのビルドにシークレットを渡さず、以下の 4種類の設定データを隠します。

- アプリケーションを通して設定される[環境変数](#プライベート環境変数)

- [デプロイキーとユーザーキー]({{ site.baseurl }}/ja/2.0/gh-bb-integration/#deployment-keys-and-user-keys)

- ビルド中に任意のホストにアクセスするために [CircleCI に追加した]({{ site.baseurl }}/2.0/add-ssh-key)、パスフレーズのないプライベート SSH キー

- [AWS 権限]({{ site.baseurl }}/ja/2.0/deployment-integrations/#aws)および設定ファイル

**注: **シークレットを必要とするオープンソースプロジェクトのフォークされた PR ビルドは、この設定を有効にしない限り CircleCI 上で正しく動作しません。

プロジェクトをフォークし、PR をオープンする任意のユーザーとシークレットを共有しても問題がない場合は、**Pass secrets to builds from forked pull requests (フォークされたプルリクエストからのビルドにシークレットを渡す)** オプションを有効にできます。 この設定を変更するには、プロジェクトの **Project Settings>Advanced** に移動して、**Pass secrets to builds from forked pull requests (フォークされたプルリクエストからのビルドにシークレットを渡す)** オプションを_オン_に設定します。

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
