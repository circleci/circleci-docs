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

CircleCI で最初のビルドを実行するには、[登録](https://circleci.com/signup/){:target="_blank"}ページに移動してください。 GitHub または Bitbucket アカウントで登録するか、後ほどメールアドレスを使ってコードに接続します。

## GitHub または Bitbucket のアカウントでの登録
{: #vcs-signup }

1. **[Sign Up with GitHub (GitHub アカウントで登録)]** または **[Sign Up with Bitbucket (Bitbucket アカウントで登録)]** のいずれかをクリックすると、認証プロセスが開始され、CircleCI がお客様のコードにアクセスできるようになります。 **注:** GitHub を使用している場合、CircleCI を制限するオプションがあり、プライベートリポジトリへのアクセスを制限することができます。 [Sign Up (登録)]ボタンの横にあるドロップダウンメニューを使ってリストから[Public Repos Only (パブリックレポジトリのみ)]を選択します。
    <!-- start: experiment code - #docs-discovery -->
    <div class="signup-and-try-block">
      <div class="signup-buttons">
        <div class="signup-button-wrapper gh-signup-button-wrapper">
          <a class="track-signup-link gh-signup-button no-external-icon" target="_blank" href="https://circleci.com/auth/vcs-connect?connection=Github">
            <img class="gh-icon" src="{{site.baseurl}}/assets/img/icons/companies/github.svg"/>
            <div class="button-text">GitHub で登録</div>
          </a>
          <button class="gh-dropdown-button">
            <div class="gh-dropdown-caret"></div>
          </button>
          <ul class="gh-signup-dropdown">
            <li><a class="gh-link track-signup-link" target="_blank" href="https://circleci.com/login/">すべてのリポジトリ</a></li>
            <li><a class="gh-link track-signup-link" target="_blank" href="https://circleci.com/login-public/">パブリック リポジトリのみ</a></li>
          </ul>
        </div>
        <div class="signup-button-wrapper">
          <a href="https://circleci.com/auth/vcs-connect?connection=Bitbucket" target="_blank" class="track-signup-link bb-signup-button no-external-icon">
            <img class="gh-icon" src="{{site.baseurl}}/assets/img/icons/companies/bitbucket.svg"/>
            <div class="button-text">BitBucket で登録</div>
          </a>
        </div>
      </div>
    </div>
    <!-- end: experiment code -->
2. GitHub または Bitbucket のユーザー名とパスワードを入力し、二要素認証を有効にしている場合はもう 1 つの認証要素を入力して、ログインします。

3. [Authorize Application (アプリケーションの認証)] または同等のボタンをクリックします。 CircleCI のパイプライン ダッシュボードが表示されます。

4. CircleCI アプリケーションの Project ページから、プロジェクトコードのビルドを開始します。

## メールアドレスでの登録
{: #email-signup }

1. **メールアドレスで登録**をクリックします。

    <!-- start: experiment code - #docs-discovery -->
    <div class="signup-and-try-block">
      <div class="signup-button-wrapper">
        <div class="signup-buttons">
        <a href="https://circleci.com/auth/signup/" class="track-signup-link email-signup-button no-external-icon">
            <img class="gh-icon" src="{{site.baseurl}}/assets/img/icons/companies/circleci.svg"/>
            <div class="button-text">メールアドレスで登録</div>
        </a>
        </div>
      </div>
    </div>
    <!-- end: experiment code -->

2. メールアドレスを入力し、CicrcleCI アカウント用の安全なパスワードを設定します。 入力したメールアドレスに確認メールが送信されます。

3. お客様とお客様のエンジニアリング組織に最も当てはまるオプションを選択してください。

4. コードに接続します。今はコードに接続しない場合は、CircleCI アプリケーション内のサンプルプロジェクトを参照してください。

    - GitHub または Bitbucket アカウントに接続し、 CircleCI 上でプロジェクトをビルドし、デプロイします。 GitHub または Bitbucket のユーザー名とパスワードを入力し、二要素認証を有効にしている場合はもう 1 つの認証要素を入力して、ログインをクリックします。
    - CircleCI 上の一般的なオープンソースプロジェクトビルドを使って([React by Facebook](https://app.circleci.com/pipelines/github/facebook/react))、または弊社独自のサンプルプロジェクト ([JavaScript サンプルアプリ](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-javascript-cfd/)や[Python サンプルアプリ](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-python-cfd/)) のいずれかを使用して、CircleCI アプリケーションをお試しください。 [パイプライン]({{ site.baseurl }}/2.0/pipelines/)や[ワークフロー]({{ site.baseurl }}/2.0/workflows) などの機能をご覧いただけます。 [Dashboard (ダッシュボード)] 、 [Projects (プロジェクト)] 、 [Organization Settings (組織の設定)] 、および [Plan (プラン)] のページは、 GitHub アカウントまたは Bitbucket アカウントを接続するまで使用できません。

## 利用規約
{: #terms}

ユーザー登録を行うことで、[ SaaS 利用規約](https://circleci.com/terms-of-service/)および[プライバシー ポリシー](https://circleci.com/privacy/)に同意したものと見なされます。 CircleCI では、サービス改善を目的として、お客様のアカウント データへの読み取りアクセスまたは書き込みアクセスの許可をお願いすることがあります。 GitHub アカウントをお持ちで、CircleCI とのプライベート プロジェクトへのアクセス権の共有を希望されない方は、パブリック リポジトリを選択してください reCAPTCHA による確認が必要です、Google の[プライバシー ポリシー](https://policies.google.com/privacy?hl=ja)と[利用規約](https://policies.google.com/terms?hl=ja)が適用されます。

## 次のステップ
{: #next-steps }

- 「[Hello World]({{ site.baseurl }}/2.0/hello-world/)」を参照し、プロジェクトの基礎、組織の切り替え、[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイル (ビルド環境を決定付け、テストを自動化するための設定ファイル) について学習します。
- [コンセプト]({{ site.baseurl }}/2.0/concepts/)のページでパイプライン、Executor、イメージ、ワークフロー、ジョブなどの CircleCI の基本的なコンセプトの概要をご確認ください。
