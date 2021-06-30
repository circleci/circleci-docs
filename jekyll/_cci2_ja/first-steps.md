---
layout: classic-docs
title: "CircleCI のユーザー登録"
short-title: "CircleCI のユーザー登録"
description: "CircleCI 導入の第一歩"
categories:
  - getting-started
order: 2
version:
  - Cloud
---

以下の手順に従って、CircleCI 2.x プラットフォームで最初の CircleCI ビルドを実行しましょう。

1. [ユーザー登録](https://circleci.com/ja/signup/)ページを開きます。

2. Click on either **Sign Up with GitHub** or **Sign Up with Bitbucket** to start the authentication process and allow CircleCI to access your code. CircleCI による GitHub のプライベート リポジトリへのアクセスを制限するには、ユーザー登録時および以降のログイン時に [GitHub でログイン] メニューから [公開リポジトリと連携] を選択します。 To do this, use the drop down menu at the side of the Sign Up button, and select Public Repos Only from the list.

3. GitHub または Bitbucket のユーザー名とパスワードを入力し、2 要素認証を有効にしている場合はもう 1 つの認証要素を入力して、ログインします。

4. [Authorize Application (アプリケーションの認証)] または同等のボタンをクリックします。 CircleCI のビルド ダッシュボードが表示されます。

5. CircleCI アプリケーションの [Project Setup (プロジェクト セットアップ)] ページから、プロジェクト コードのビルドを開始します。

## 次のステップ
「[Hello World]({{ site.baseurl }}/ja/2.0/hello-world/)」を参照し、プロジェクトの基礎、Org の切り替え、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイル (ビルド環境を決定付け、テストを自動化するための設定ファイル) について学習します。

Go to [Hello World]({{ site.baseurl }}/2.0/hello-world/) to learn about the basics of Projects, switching Orgs, and the [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file that determines your build environment and automates your tests.
