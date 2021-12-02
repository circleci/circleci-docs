---
layout: classic-docs
title: "概要"
description: "このページでは、継続的インテグレーションの概要に加えて、CircleCI がどのようにチーム開発の自動化を実現するかという点について説明します。 CircleCI は、ソフトウェアのビルド、テスト、デプロイを自動化します。"
categories:
  - はじめよう
order: 1
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

CircleCI の使命は、テクノロジー主導の組織が最高の仕事をするためのサポートをし、エンジニアリングチームの生産性を高めることです。 インテリジェントな自動化により、構築、テスト、デプロイを行うことができます。

クラウドでもサーバー上でも、Linux、macOS、Android、そして Windows でも、お客様の環境に応じてご利用いただけます。 CircleCI は、エンタープライズクラスのサポートとサービスを、スタートアップ企業ならではの高い柔軟性をもって提供しています。

## 継続的インテグレーションとは
{: #what-is-continuous-integration }

**継続的インテグレーション**は、開発者がコードを共有リポジトリの `main` ブランチに素早く頻繁に統合するための手法です。 それぞれの機能を個別にビルドして、開発サイクルの最後に統合するのではなく、各開発者のコードが 1 日に何度も共有リポジトリに統合されます。

継続的インテグレーションは、デジタルトランスフォーメーションに向けた大切な第一歩です。

それぞれの開発者が、共有されたメインラインに毎日コミットします。 各コミットにより自動テストとビルドがトリガーされます。 失敗しても、数分以内に素早く修復することができます。

** 利用する理由:** 継続的インテグレーションにより、チームの生産性や効率性だけでなく、信頼性や幸福度も向上します。 問題をすばやく検出して解決することができ、 より高品質で安定したプロダクトをリリースすることができます。

![CircleCI about image]( {{ site.baseurl }}/assets/img/docs/arch.png)

## CircleCI のワークフロー
{: #circleci-in-your-workflow}

サポートされているバージョンコントロールシステム上のソフトウェアリポジトリは、 [circleci.com](https://circleci.com) のプロジェクトとして承認され、追加される必要があります。 その後はコードが変更されるたびに、クリーンなコンテナや仮想マシンで自動テストが実行されます。 CircleCI は、 各[ジョブ]({{site.baseurl}}/2.0/glossary/#job)を個別の[コンテナ]({{site.baseurl}}/2.0/glossary/#container) または[仮想マシン](https://circleci.com/developer/images?imageType=machine)で実行します。

テスト完了後にはメールで成功・失敗の通知が届くほか、 CircleCI には [Slack 通知と IRC 通知]({{site.baseurl}}/2.0/notifications)も統合されています。 コード テスト カバレッジの結果は、レポート ライブラリが追加されているプロジェクトの詳細ページから確認できます。

CircleCI は、以下のような様々な環境にコードをデプロイするように設定することができます。
- AWS CodeDeploy
- AWS EC2 Container Service（ECS）
- AWS S3、Google Kubernetes Engine (GKE)
- Microsoft Azure
- Heroku

[Orb レジストリ](https://circleci.com/developer/orbs) には、一般的なデプロイターゲットに使用できる、再利用可能な設定のパッケージが含まれています。 Orb を使うと、設定を簡略化し効率化することができます。

Other cloud service deployments can be scripted using SSH, or by installing the API client of the service with your job configuration.

## Benefits of CircleCI
{: #benefits-of-circleci }

CircleCI runs nearly one million jobs per day in support of 30,000 organizations. Organizations choose CircleCI because jobs run fast and builds can be optimized for speed.

CircleCI can be configured to run very complex pipelines efficiently with sophisticated [caching,]({{site.baseurl}}/2.0/caching/) [docker layer caching,]({{site.baseurl}}/2.0/docker-layer-caching/) and [resource classes]({{site.baseurl}}/2.0/optimizations/#resource-class) for running on faster machines.

As a developer using CircleCI you can:
- [SSH into any job]({{site.baseurl}}/2.0/ssh-access-jobs/) to debug your build issues.
- Set up [parallelism]({{site.baseurl}}/2.0/parallelism-faster-jobs/) in your [.circleci/config.yml]({{site.baseurl}}/2.0/configuration-reference/) file to run jobs faster.
- Configure [caching]({{site.baseurl}}/2.0/caching/) with two simple keys to reuse data from previous jobs in your [workflow]({{site.baseurl}}/2.0/workflows/).
- Configure self-hosted [runners]({{site.baseurl}}/2.0/runner-overview/) for unique platform support.
- Access [Arm resources]({{site.baseurl}}/2.0/arm-resources/) for the machine executor.
- Use [orbs]({{site.baseurl}}/2.0/using-orbs/), reusable packages of configuration, to integrate with third parties.
- Use pre-built Docker [images]({{site.baseurl}}/2.0/circleci-images/) in a variety of languages.
- Use the [API](https://circleci.com/docs/api/v2/) to retrieve information about jobs and workflows.
- Use the [CLI]({{site.baseurl}}/2.0/local-cli/) to access advanced tools locally.
- Get flaky test detection with [test insights]({{site.baseurl}}/2.0/insights-tests/).

As an operator or administrator of CircleCI installed on your own servers, CircleCI provides monitoring and insights into your builds and uses [Nomad](https://www.nomadproject.io/) for scheduling.

See the [CircleCI Operations and Installation Guides]({{site.baseurl}}/2.0/server-3-overview/) for complete server documentation.

## Pricing options
{: #pricing-options }

Visit CircleCI's [Pricing page](https://circleci.com/pricing/) to view free and paid options.

You can [sign up](https://circleci.com/signup/) for free to get access to unlimited projects on CircleCI's fully-hosted cloud platform.

Organizations on the free plan are given free credits to use on open source projects. Visit [Building Open Source Projects]({{site.baseurl}}/2.0/oss/) for more information about free containers for public open source projects.

## さらに詳しく
{: #learn-more }

### In the Docs:
{: #in-the-docs }
{:.no_toc}
- [Concepts]({{site.baseurl}}/2.0/concepts/) for basic concepts of CI/CD pipeline management
- [Tutorials]({{site.baseurl}}/2.0/tutorials/) for platform specific tutorials

### On CircleCI Academy:
{: #on-circleci-academy }
{:.no_toc}
- [CI/CD 101 Workshop](https://academy.circleci.com/cicd-basics?access_code=public-2021)
- [General Developer Training](https://academy.circleci.com/general-developer-training?access_code=public-2021)

### On our blog:
{: #on-our-blog }
{:.no_toc}
- [Config best practices: dependency caching](https://circleci.com/blog/config-best-practices-dependency-caching/)
- [Automate and scale your CI/CD with CircleCI orbs](https://circleci.com/blog/automate-and-scale-your-ci-cd-with-circleci-orbs/)
- [How to secure your CI pipeline](https://circleci.com/blog/secure-ci-pipeline/)