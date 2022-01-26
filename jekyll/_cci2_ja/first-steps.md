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

To run your very first build on CircleCI, go to the [Sign Up](https://circleci.com/signup/){:target="_blank"} page. Sign up with your GitHub or Bitbucket account, or your email address for the option to connect to your code later in the process.

## Sign up with GitHub or BitBucket
{: #vcs-signup }

1. **[Sign Up with GitHub (GitHub アカウントで登録)]** または **[Sign Up with Bitbucket (Bitbucket アカウントで登録)]** のいずれかをクリックすると、認証プロセスが開始され、CircleCI がお客様のコードにアクセスできるようになります。 **Note:** if you are using GitHub, you have the option to limit CircleCI, preventing access to your private repositories. [Sign Up (登録)]ボタンの横にあるドロップダウンメニューを使ってリストから[Public Repos Only (パブリックレポジトリのみ)]を選択します。

2. GitHub または Bitbucket のユーザー名とパスワードを入力し、二要素認証を有効にしている場合はもう 1 つの認証要素を入力して、ログインします。

3. [Authorize Application (アプリケーションの認証)] または同等のボタンをクリックします。 CircleCI のパイプライン ダッシュボードが表示されます。

4. Use the Projects page of the CircleCI app to start building your project code.

## Sign up with email
{: #email-signup }

1. Click **Sign Up with Email**.

2. Enter your email address, and then set a secure password for your CircleCI account. A verification email is sent to the email address provided.

3. Select the options that best describe you and your engineering organization.

4. Connect to your code, or explore some example projects within the CircleCI app if you don't want to connect to your code at this time.

    - Connect to your GitHub or Bitbucket account to build and deploy your projects on CircleCI. GitHub または Bitbucket のユーザー名とパスワードを入力し、二要素認証を有効にしている場合はもう 1 つの認証要素を入力して、ログインします。
    - Explore the app using a popular open source project building on CircleCI ([React by Facebook](https://app.circleci.com/pipelines/github/facebook/react)), or one of our own sample projects: a [sample JavaScript app](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-javascript-cfd/), and a [sample Python app](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-python-cfd/). You'll be able to start exploring features such as [pipelines]({{ site.baseurl }}/2.0/pipelines/) and [workflows]({{ site.baseurl }}). The Dashboard, Projects, Organization Settings, and Plan pages are not available until you connect your GitHub or Bitbucket accounts.


## 次のステップ
{: #next-steps }

- Go to [Hello World]({{ site.baseurl }}/2.0/hello-world/) page to learn the basics of setting up projects, switching orgs, and the [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file that determines your execution environment and automates your tests.
- Read the [Concepts]({{ site.baseurl }}/2.0/concepts/) page for an overview of foundational CircleCI concepts such as pipelines, executors and images, workflows, and jobs.
