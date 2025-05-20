---
layout: classic-docs
title: "オープンソースプロジェクトのビルド"
short-title: "オープンソースプロジェクトのビルド"
description: "オープンソースプロジェクトのビルドに関するベストプラクティス"
categories:
  - はじめよう
order: 1
---

## 概要
{: #introduction }

このドキュメントでは、CircleCI でのオープンソースプロジェクトのビルドに関するヒントとベストプラクティスを紹介します。

オープンソースコミュニティをサポートする目的で、GitHub または Bitbucket 上の組織には、オープンソースプロジェクト用にクレジットが毎週無料で提供されます。 このクレジットは、Linux のリソースにご使用いただけます。

## セキュリティ
{: #security }

オープンソースは開放型の活動ですが、機密情報を「開放」しないように注意が必要です。

- リポジトリをパブリックにすると、CircleCI プロジェクトとそのビルドログもパブリックになります。 表示対象として選択する情報に注意してください。
- CircleCI アプリケーション内に設定されている環境変数は、一般には公開されず、明示的に有効にされない限り[フォークされたプルリクエスト](#pass-secrets-to-builds-from-forked-pull-requests)に共有されることはありません。

## オープンソースプロジェクトの機能と設定
{: #features-and-settings-for-open-source-projects }

以下の機能と設定は、オープンソースプロジェクトにおいて特に便利です。

### プライベート環境変数
{: #private-environment-variables }

多くのプロジェクトでは、API トークン、SSH キー、またはパスワードが必要です。 プライベート環境変数を使用すると、プロジェクトがパブリックの場合でもシークレットを安全に保存できます。

詳細については、 [環境変数の設定]({{site.baseurl}}/ja/set-environment-variable/#set-an-environment-variable-in-a-project) を参照してください。

### プルリクエストのみをビルドする
{: #only-build-pull-requests }

CircleCI はデフォルトでは、すべてのブランチのすべてのコミットをビルドします。 プライベートプロジェクトよりもきわめて多くのコミットが存在するオープンソースプロジェクトでは、この動作は活動的すぎるかもしれません。

この設定を変更するには、プロジェクトの **Project Settings > Advanced** に移動して、**Only build pull requests (プルリクエストのみビルド)** オプションを _On_ に設定します。

**Only Build Pull Requests** 設定をオーバーライドする機能もサポートされています。 具体的には、CircleCI は正規表現 (例: `release.\*`) で指定されたデフォルト以外のブランチからのすべてのコミットに対して検証を実行します。

現時点では、**Only Build Pull Requests** 設定をオーバーライドする唯一の方法は、 [https://support.circleci.com/](https://support.circleci.com/) でサポートリクエストをオープンすることです。 このリクエストには、CircleCI がすべてのコミットを検証するブランチの `許可リスト` に追加したい正規表現を記載してください。 組織に適用されている正規表現の削除や編集をする際もサポートリクエストを提出する必要があります。 詳細については、[Ideas](https://circleci.canny.io/cloud-feature-requests/p/allow-branch-whitelist-to-override-only-build-pull-requests) を参照してください。

CircleCI は、どのような設定でもプロジェクトの*デフォルトのブランチとタグ*からのすべてのコミットをビルドします。
{: class="alert alert-info" }

### フォークされたリポジトリからのプルリクエストをビルドする
{: #build-pull-requests-from-forked-repositories }

多くのオープンソース プロジェクトは、フォークされたリポジトリから PR を受け入れます。 これらの PR をビルドすると、手動で変更をレビューする前にバグを捕捉することができるので、効果的な方法です。

CircleCI はデフォルトでは、フォークされたリポジトリからの PR をビルドしません。 この設定を変更するには、プロジェクトの **Project Settings > Advanced** に移動して、**Build forked pull requests** オプションを _On_ に設定します。

現時点では、この機能は Bitbucket ユーザーにはサポートされていません。
{: class="alert alert-info" }

ユーザーがフォークからプルリクエストをリポジトリに送信しても、パイプラインがトリガーされない場合、ユーザーは CircleCI のプロジェクトではなく個人アカウントでフォークされたプロジェクトをフォローしている可能性があります。その場合、ジョブは組織のアカウントではなくユーザー個人のアカウントでトリガーされます。 この問題を解決するには、そのユーザーに個人用フォークからフォローを解除してもらい、代わりにソースプロジェクトをフォローしてもらいます。 これにより、プルリクエストを発行した際に、組織アカウントでジョブの実行がトリガーされるようになります。

### フォークされたプルリクエストからのビルドにシークレットを渡す
{: #pass-secrets-to-builds-from-forked-pull-requests }

制限を設定していないビルドを親リポジトリ内で実行することは、場合によっては危険です。 プロジェクトにはしばしば機密情報が含まれており、ビルドをトリガーするコードをプッシュできるユーザーならだれでも、この情報を自由に入手できます。

デフォルトでは、CircleCI はオープンソースプロジェクトの場合、フォークされた PR からのビルドにシークレットを渡さず、以下の 4種類の設定データを隠します。

- アプリケーションを通して設定される[環境変数](#プライベート環境変数)

- [デプロイキーとユーザーキー]({{site.baseurl}}/ja/gh-bb-integration/#deployment-keys-and-user-keys)

- ビルド中に任意のホストにアクセスするために [CircleCI に追加した]({{site.baseurl}}/ja/add-ssh-key)パスフレーズのないプライベート SSH キー

- [AWS 権限]({{site.baseurl}}/ja/deploy-to-aws)および設定ファイル

シークレットを必要とするオープンソースプロジェクトのフォークされた PR ビルドは、この設定を有効にしない限り CircleCI 上で正しく動作しません。

プロジェクトをフォークし、PR をオープンする任意のユーザーとシークレットを共有しても問題がない場合は、**Pass secrets to builds from forked pull requests (フォークされたプルリクエストからのビルドにシークレットを渡す)** オプションを有効にできます。 この設定を変更するには、プロジェクトの **Project Settings>Advanced** に移動して、**Pass secrets to builds from forked pull requests (フォークされたプルリクエストからのビルドにシークレットを渡す)** オプションを_オン_に設定します。

### キャッシュ
{: #caching }

キャッシュは、PR の GitHub リポジトリに基づいて分離されます。 CircleCI は、フォーク PR の生成元の GitHub リポジトリ ID を使用してキャッシュを識別します。
- 同じフォークリポジトリからの PR 間でキャッシュを共有します。  たとえば、メインリポジトリからの PR は、メインリポジトリブランチ (特に `main` ブランチ) とキャッシュを共有します。
- それぞれ異なるフォークリポジトリ内にある 2 つの PR は、別々のキャッシュを持ちます。 つまり、フォークからの PR はメインリポジトリの `main` ブランチとはキャッシュを共有しません。
- [フォークされたプルリクエストからのビルドにシークレットを渡す](#pass-secrets-to-builds-from-forked-pull-requests)を有効にすると、元のリポジトリとフォークされたすべてのビルドでキャッシュを共有できるようになります。

現在、キャッシュの自動入力は行われていません。この最適化がまだ優先順位リストの上位に入っていないためです。

## オープンソースプロジェクトの例
{: #example-open-source-projects }

CircleCI でビルドされたさまざまな規模のプロジェクトをご紹介します。

- **[React](https://github.com/facebook/react)** - Facebook の JavaScript ベースの React は、CircleCI (および他の CI ツール) でビルドされています。
- **[React Native](https://github.com/facebook/react-native/)** - JavaScript と React を使用してネイティブ モバイル アプリケーションをビルドします。
- **[Flow](https://github.com/facebook/flow/)** - JavaScript に静的な型指定を追加して、開発者の生産性とコードの品質を向上させます。
- **[Vue](https://github.com/vuejs/vue)** -  Vue.js は、Web 上で UI をビルドするための漸進的な JavaScript フレームワークであり、段階的に採用できます。
- **[Storybook](https://github.com/storybookjs/storybook)** - 対話型 UI コンポーネントの開発とテストを行います (React、React Native、Vue、Angular、Ember)。
- **[Electron](https://github.com/electron/electron)** - JavaScript、HTML、および CSS でクロスプラットフォームのデスクトップ アプリケーションをビルドします。
- **[Angular](https://github.com/angular/angular)** - ブラウザーおよびデスクトップ Web アプリケーションをビルドするためのフレームワーク。
- **[Apollo](https://github.com/apollographql)** - GraphQL 用の柔軟なオープンソース ツールをビルドしているコミュニティ。
- **[PyTorch](https://github.com/pytorch/pytorch)** - データ操作および機械学習のプラットフォーム。
- **[Calypso](https://github.com/Automattic/wp-calypso)** - WordPress.com を活用するための次世代 Web アプリケーション。
- **[fastlane](https://github.com/fastlane/fastlane)** - Android および iOS 用の自動ビルド ツール。
- **[Yarn](https://github.com/yarnpkg/yarn)** - [npm に代わるツール](https://circleci.com/blog/why-are-developers-moving-to-yarn/)。

## 設定ファイルの詳細

[サンプル設定]({{site.baseurl}}/example-configs/) のドキュメントでは、パブリックおよびオープンソースのプロジェクト設定に関する各種のリンクが、CircleCI の機能とプログラミング言語ごとに紹介されています。
