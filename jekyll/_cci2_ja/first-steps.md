---
layout: classic-docs
title: "CircleCI のユーザー登録"
short-title: "CircleCI のユーザー登録"
description: "CircleCI 導入の第一歩"
categories:
  - はじめよう
order: 2
version:
  - クラウド
---

CircleCI で最初のビルドを実行するには、[ユーザー登録](https://circleci.com/ja/signup/)のページに移動してください。 GitHub または Bitbucket アカウントで登録するか、後ほどメールアドレスを使ってコード (GitLab プロジェクトを含む) に接続します。

## GitHub または Bitbucket のアカウントでの登録
{: #vcs-signup }

1. [**GitHub で登録**](https://circleci.com/auth/vcs-connect?connection=Github) または [**Bitbucket で登録**](https://circleci.com/auth/vcs-connect?connection=Bitbucket) のいずれかをクリックすると、認証プロセスが開始され、CircleCI がお客様のコードにアクセスできるようになります。

    GitHub を使用している場合、CircleCI を制限するオプションがあり、プライベートリポジトリへのアクセスを制限することができます。 Sign Up (登録) ボタンの横にあるドロップダウンメニューを使ってリストから **Public Repos Only (パブリックレポジトリのみ)** を選択します。
    {: class="alert alert-info"}

2. GitHub または Bitbucket のユーザー名とパスワードを入力し、二要素認証を有効にしている場合はもう 1 つの認証要素を入力し、**ログイン**をクリックします。

3. **Authorize Application (アプリケーションの認証)** または同等のボタンをクリックします。 CircleCI パイプラインのダッシュボードにリダイレクトされます。

4. CircleCI アプリの **Project** のページから、プロジェクトコードのビルドを開始します。

## GitLab アカウントでの登録
{: #gitlab-signup }

1. [**Sign Up with GitLab**](https://circleci.com/auth/signup/) をクリックします。

2. メールアドレスを入力し、CicrcleCI アカウント用の安全なパスワードを設定します。 入力したメールアドレスに確認メールが送信されます

3. GitLab リポジトリから新しいプロジェクトを作成するオプション画面が表示されます。 画面の指示に従って GitLab アカウントと連携します。 リポジトリを選択し、新しいプロジェクトを作成すると、CircleCI Web アプリのダッシュボードにリダイレクトされます。

GitLab と CircleCI の連携に関する詳細は [GitLab と Saas の連携についてのページ]({{site.baseurl}}/ja/gitlab-integration)を参照してください。
{: class="alert alert-info"}

## メールアドレスでの登録
{: #email-signup }

1. [**メールアドレスで登録**](https://circleci.com/auth/signup/)をクリックします。

2. メールアドレスを入力し、CicrcleCI アカウント用の安全なパスワードを設定します。 入力したメールアドレスに確認メールが送信されます

3. コードには接続せず、メールアドレスでの登録のみを行いたい場合は **Cancel** をクリックしてください。 お客様の役割とエンジニアリング組織に最も当てはまる質問への回答画面が表示されます。

4. 現時点ではコードに接続したくない場合は、CircleCI アプリ内のサンプルプロジェクトを参照してください。 CircleCI 上の一般的なオープンソースプロジェクトビルド ([React by Facebook](https://app.circleci.com/pipelines/github/facebook/react))、または弊社独自のサンプルプロジェクト ([JavaScript サンプルアプリ](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-javascript-cfd/)や[Python サンプルアプリ](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-python-cfd/)) をご覧いただけます。

[パイプライン]({{site.baseurl}}/ja/pipelines/)や[ワークフロー]({{site.baseurl}}/ja/workflows)などの機能をご覧いただけるようになります。 Dashboard 、 Projects、 Organization Settings 、および Plan のページは、コードに接続するまで使用できません。

そうでない場合は、準備ができたら CircleCI Web アプリから GitHub、BitBucket、 GitLab のアカウントに接続できます。

## 利用規約
{: #terms}

ユーザー登録を行うことで、[ SaaS 利用規約](https://circleci.com/terms-of-service/)および[プライバシーポリシー](https://circleci.com/privacy/)に同意したものと見なされます。 CircleCI では、サービスの改善を目的として、お客様のアカウントデータへの読み取りアクセスまたは書き込みアクセスの許可をお願いする場合があります。 GitHub アカウントをお持ちで、プライベートプロジェクトへのアクセスの共有を希望されない場合は、パブリックリポジトリを選択してください。 このサイトは reCAPTCHA により保護されています。Google の[プライバシーポリシー](https://policies.google.com/privacy?hl=ja)と[利用規約](https://policies.google.com/terms?hl=ja)が適用されます。

## 次のステップ
{: #next-steps }

- [Hello World]({{ site.baseurl }}/ja/hello-world/)のページに移動し、プロジェクトの基礎、組織の切り替え、[`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) ファイル (実行環境を決定し、テストを自動化するための設定ファイル) について学びましょう。
- [コンセプト]({{ site.baseurl }}/ja/concepts/)のページでパイプライン、Executor、イメージ、ワークフロー、ジョブなどの CircleCI の基本的なコンセプトの概要をご確認ください。
