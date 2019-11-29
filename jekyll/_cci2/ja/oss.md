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

オープンソース コミュニティをサポートする目的で、GitHub または Bitbucket 上の組織には、オープンソース プロジェクト用に 1 週間あたり 100,000 クレジットが無料で提供されます。 このクレジットは Linux の Medium リソースで使用可能です。 各組織で最大 4 件のジョブを同時実行できます。

**メモ:** macOS 上のオープンソース プロジェクトをビルドする場合は、これらの追加コンテナを有効にする方法について billing@circleci.com にお問い合わせください。

## セキュリティ

オープンソースは開放型の活動であり、機密情報を「開放」しないように注意が必要です。

- リポジトリをパブリックにすると、CircleCI プロジェクトとそのビルド ログもパブリックになります。 表示対象として選択する情報に注意してください。
- CircleCI アプリケーション内に設定される環境変数は、一般には公開されず、明示的に有効にされない限り[フォークされた PR](#フォークされたプル-リクエストからのビルドにシークレットを渡す) に共有されることもありません。

## オープンソース プロジェクトの機能と設定

以下の機能と設定は、オープンソース プロジェクトにおいて特に便利です。

### プライベート環境変数
{:.no_toc}

多くのプロジェクトでは、API トークン、SSH キー、またはパスワードが必要です。 プライベート環境変数を使用すると、プロジェクトがパブリックの場合でもシークレットを安全に格納できます。 詳細については、「[プロジェクト内で環境変数を設定する]({{ site.baseurl }}/2.0/env-vars/#プロジェクト内で環境変数を設定する)」を参照してください。

### プル リクエストのみをビルドする
{:.no_toc}

CircleCI はデフォルトですべてのブランチのすべてのコミットをビルドします。 この動作は、オープンソース プロジェクトで使用するには活動的すぎることがあり、場合によってはプライベート プロジェクトよりもきわめて多くのコミットが存在することになります。 この設定を変更するには、プロジェクトの **[Advanced Settings (詳細設定)]** に移動して、**[Only build pull requests (プル リクエストのみビルド)]** オプションを*オン*に設定します。

**メモ:** このオプションが有効であっても、CircleCI はプロジェクトのデフォルトのブランチからはすべてのコミットをビルドします。

### フォークされたリポジトリからプル リクエストをビルドする
{:.no_toc}

多くのオープンソース プロジェクトは、フォークされたリポジトリから PR を受け入れます。 これらの PR をビルドすると、手動で変更をレビューする前にバグを捕捉することができるので、効果的な方法と言えます。

CircleCI はデフォルトで、フォークされたリポジトリからの PR をビルドしません。 この設定を変更するには、プロジェクトの **[Advanced Settings (詳細設定)]** に移動して、**[Build forked pull requests (フォークされたプル リクエストをビルド)]** オプションを*オン*に設定します。

### フォークされたプル リクエストからのビルドにシークレットを渡す
{:.no_toc}

制限を設定していないビルドを親リポジトリ内で実行することは、場合によっては危険です。 プロジェクトにはしばしば機密情報が含まれていますが、ビルドをトリガーするコードをプッシュするユーザーならだれでも、この情報を自由に入手できます。

オープンソース プロジェクトの場合、CircleCI のデフォルトでは、フォークされた PR からのビルドにシークレットを渡さず、以下の 4 種類の構成データを隠します。

- アプリケーションを通して設定される[環境変数](#プライベート環境変数)

- [デプロイ キーとユーザー キー]({{ site.baseurl }}/2.0/gh-bb-integration/#デプロイ-キーとユーザー-キー)

- ビルド中に任意のホストにアクセスするために [CircleCI に追加した]({{ site.baseurl }}/2.0/add-ssh-key)、パスフレーズのないプライベート SSH キー

- [AWS 権限]({{ site.baseurl }}/2.0/deployment-integrations/#aws)および設定ファイル

**メモ:** シークレットを必要とするオープンソース プロジェクトのフォークされた PR ビルドは、この設定を有効にしない限り CircleCI 上で正しく動作しません。

プロジェクトをフォークし、PR をオープンする任意のユーザーとシークレットを共有しても問題がない場合は、**[Pass secrets to builds from forked pull requests (フォークされたプル リクエストからのビルドにシークレットを渡す)]** オプションを有効にできます。 プロジェクトの **[Advanced Settings (詳細設定)]** で **[Pass secrets to builds from forked pull requests (フォークされたプル リクエストからビルドにシークレットを渡す)]** オプションを*オン*に設定します。

### キャッシュ

キャッシュは、PR の GitHub リポジトリに基づいて分離されます。 CircleCI は、フォーク PR の生成元の GitHub リポジトリ ID を使用してキャッシュを識別します。

- 同じフォーク リポジトリからの PR は、キャッシュを共有します (前述のように、これには master リポジトリ内の PR と master によるキャッシュの共有が含まれます)。
- それぞれ異なるフォーク リポジトリ内にある 2 つの PR は、別々のキャッシュを持ちます。

現在、キャッシュの自動入力は行われていません。この最適化がまだ優先順位リストの上位に入っていないためです。

## オープンソース プロジェクトの例

CircleCI 上でビルドされたさまざまな規模のプロジェクトを以下にいくつかご紹介します。

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

## 関連項目
{:.no_toc}

「[パブリック リポジトリの例]({{ site.baseurl }}/2.0/example-configs/)」では、パブリックおよびオープンソースのプロジェクト構成に関する各種のリンクが、CircleCI の機能とプログラミング言語ごとに紹介されています。