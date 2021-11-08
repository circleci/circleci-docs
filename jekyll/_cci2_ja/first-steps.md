---
layout: classic-docs
title: "CircleCI のユーザー登録"
short-title: "CircleCI のユーザー登録"
description: "CircleCI 導入の第一歩"
categories:
  - はじめよう
order: 2
version:
  - Cloud
---

以下の手順に従って、CircleCI 2.x プラットフォームで最初の CircleCI ビルドを実行しましょう。

1. [ユーザー登録](https://circleci.com/ja/signup/)ページを開きます。

2. **[Sign Up with GitHub (GitHub アカウントで登録)]** または **[Sign Up with Bitbucket (Bitbucket アカウントで登録)]** のいずれかをクリックすると、認証プロセスが開始され、CircleCI がお客様のコードにアクセスできるようになります。 **注意:** GitHubを使用している場合、CircleCI を制限するオプションがあり、プライベートリポジトリへのアクセスを制限することができます。 [Sign Up (登録)]ボタンの横にあるドロップダウンメニューを使ってリストから[Public Repos Only (パブリックレポジトリのみ)]を選択します。

3. GitHub または Bitbucket のユーザー名とパスワードを入力し、二要素認証を有効にしている場合はもう 1 つの認証要素を入力して、ログインします。

4. [Authorize Application (アプリケーションの認証)] または同等のボタンをクリックします。 CircleCI のパイプライン ダッシュボードが表示されます。

5. CircleCI アプリケーションの [Add Project (プロジェクトの追加)] ページから、プロジェクト コードのビルドを開始します。

## 次のステップ
{: #next-steps }

「[Hello World]({{ site.baseurl }}/ja/2.0/hello-world/)」を参照し、プロジェクトの基礎、組織の切り替え、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイル (ビルド環境を決定し、テストを自動化するための設定ファイル) について学びましょう。
