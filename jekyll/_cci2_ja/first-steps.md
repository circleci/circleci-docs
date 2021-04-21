---
layout: classic-docs
title: "CircleCI のユーザー登録"
short-title: "CircleCI のユーザー登録"
description: "CircleCI 導入の第一歩"
categories:
  - getting-started
order: 2
---

以下の手順に従って、CircleCI 2.x プラットフォームで最初の CircleCI ビルドを実行しましょう。

1. [ユーザー登録](https://circleci.com/ja/signup/)ページを開きます。

2. このページでいずれかのログイン ボタンをクリックすると、GitHub または Bitbucket 上のコードへのアクセスを許可するプロセスがスタートします。 CircleCI による GitHub のプライベート リポジトリへのアクセスを制限するには、ユーザー登録時および以降のログイン時に [GitHub でログイン] メニューから [公開リポジトリと連携] を選択します。

3. GitHub または Bitbucket のユーザー名とパスワードを入力し、2 要素認証を有効にしている場合はもう 1 つの認証要素を入力して、ログインします。

4. [Authorize Application (アプリケーションの認証)] または同等のボタンをクリックします。 CircleCI のビルド ダッシュボードが表示されます。

5. CircleCI アプリケーションの [Project Setup (プロジェクト セットアップ)] ページから、プロジェクト コードのビルドを開始します。

## 次のステップ

「[Hello World]({{ site.baseurl }}/2.0/hello-world/)」を参照し、プロジェクトの基礎、Org の切り替え、[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイル (ビルド環境を決定付け、テストを自動化するための設定ファイル) について学習します。