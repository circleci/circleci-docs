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

To run your very first build on CircleCI, complete the following steps:

1. Go to the [Sign Up](https://circleci.com/signup/){:target="_blank"} page.

2. Click on either **Sign Up with GitHub** or **Sign Up with Bitbucket** to start the authentication process and allow CircleCI to access your code. **Note:** if you are using GitHub you have the option to limit CircleCI, preventing access to your private repositories. To do this, use the drop down menu at the side of the Sign Up button, and select Public Repos Only from the list.

3. GitHub または Bitbucket のユーザー名とパスワードを入力し、2 要素認証を有効にしている場合はもう 1 つの認証要素を入力して、ログインします。

4. [Authorize Application (アプリケーションの認証)] または同等のボタンをクリックします。 The CircleCI Pipelines Dashboard appears.

5. Use the Add Project page of the CircleCI app to start building your project code.

## Next steps

「[Hello World]({{ site.baseurl }}/2.0/hello-world/)」を参照し、プロジェクトの基礎、Org の切り替え、[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイル (ビルド環境を決定付け、テストを自動化するための設定ファイル) について学習します。