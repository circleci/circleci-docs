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

3. Click the **Authorize Application** or equivalent button. You will be redirected to the CircleCI pipelines dashboard.

4. Use the **Projects** page of the CircleCI app to start building your project code.

## Sign up with GitLab
{: #gitlab-signup }

1. Click [**Sign Up with GitLab**](https://circleci.com/auth/signup/).

2. メールアドレスを入力し、CicrcleCI アカウント用の安全なパスワードを設定します。 入力したメールアドレスに確認メールが送信されます

3. You will be taken to a screen with the option to create a new project from your GitLab repository. Follow the prompts to connect to your GitLab account. Once you have selected a repository and created a new project, you will be redirected to the CircleCI web app dashboard.

The full set of documentation for integrating GitLab with CircleCI can be found on the [GitLab SaaS integration page]({{site.baseurl}}/gitlab-integration).
{: class="alert alert-info"}

## メールアドレスでの登録
{: #email-signup }

1. Click [**Sign Up with Email**](https://circleci.com/auth/signup/).

2. メールアドレスを入力し、CicrcleCI アカウント用の安全なパスワードを設定します。 入力したメールアドレスに確認メールが送信されます

3. If you do not want to connect to your code and only wish to continue with the email signup, click **Cancel**. You will be taken to a screen where you can respond to prompts that best describe your role and your engineering organization.

4. Explore some example projects within the CircleCI app if you do not want to connect to your code at this time. You can take a look at a popular open source project building on CircleCI ([React by Facebook](https://app.circleci.com/pipelines/github/facebook/react)), or one of our own sample projects: a [sample JavaScript app](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-javascript-cfd/), and a [sample Python app](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-python-cfd/).

You will be able to start exploring features such as [pipelines]({{site.baseurl}}/pipelines/) and [workflows]({{site.baseurl}}/workflows). The Dashboard, Projects, Organization Settings, and Plan pages are not available until you connect your code.

Otherwise, when you are ready, you can connect to your GitHub, BitBucket, or GitLab accounts from the CircleCI web app.

## 利用規約
{: #terms}

ユーザー登録を行うことで、[ SaaS 利用規約](https://circleci.com/terms-of-service/)および[プライバシーポリシー](https://circleci.com/privacy/)に同意したものと見なされます。 CircleCI では、サービスの改善を目的として、お客様のアカウントデータへの読み取りアクセスまたは書き込みアクセスの許可をお願いする場合があります。 GitHub アカウントをお持ちで、プライベートプロジェクトへのアクセスの共有を希望されない場合は、パブリックリポジトリを選択してください。 このサイトは reCAPTCHA により保護されています。Google の[プライバシーポリシー](https://policies.google.com/privacy?hl=ja)と[利用規約](https://policies.google.com/terms?hl=ja)が適用されます。

## 次のステップ
{: #next-steps }

- [Hello World]({{ site.baseurl }}/ja/hello-world/)のページに移動し、プロジェクトの基礎、組織の切り替え、[`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) ファイル (実行環境を決定し、テストを自動化するための設定ファイル) について学びましょう。
- [コンセプト]({{ site.baseurl }}/ja/concepts/)のページでパイプライン、Executor、イメージ、ワークフロー、ジョブなどの CircleCI の基本的なコンセプトの概要をご確認ください。
