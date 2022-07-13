---
layout: classic-docs
title: "CircleCI について"
description: "このページでは、継続的インテグレーションの概要に加えて、CircleCI がどのようにチーム開発の自動化を実現するかという点について説明します。 CircleCI は、ソフトウェアのビルド、テスト、デプロイを自動化します。"
categories:
  - はじめよう
order: 1
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

ソフトウェアチームは高速化を求めていますが、多くの場合、迅速な高速化に不安があります。 CircleCI の使命は、ソフトウェアチームがより迅速にイノベーションを実現できるよう、変更を管理することです。 私たちは、テクノロジー主導型の組織が最高の成果を挙げられるようにサポートし、変更を管理することでエンジニアリングチームの生産性と革新性を高めたいと考えています。 インテリジェントな自動化により、ビルド、テスト、デプロイを行うことができます。

CircleCI は、クラウドでもサーバー上でも、Linux、macOS、Android、そして Windows でも、お客様の環境に合わせてご利用いただけます。 CircleCI は、エンタープライズクラスのサポートとサービスを、スタートアップ企業ならではの高い柔軟性をもって提供しています。

## 継続的インテグレーションとは
{: #what-is-continuous-integration }

**継続的インテグレーション**とは、開発者がコードを共有リポジトリの `main` ブランチに素早く頻繁に統合するための手法です。 各機能を個別にビルドして開発サイクルの最後に統合するのではなく、それぞれの開発者のコードが 1 日に何度も共有リポジトリに統合されます。

継続的インテグレーションは、デジタルトランスフォーメーションに向けた大切な一歩です。

各開発者が、共有されたメインラインに毎日コミットし、 各コミットにより自動テストとビルドがトリガーされます。 失敗しても、数分以内に素早く修復することができます。

** 利用する理由:** 継続的インテグレーションは、チームの生産性や効率性だけでなく、信頼性や幸福度も向上させます。 問題をすばやく検出して解決することができ、 より高品質で安定したプロダクトをリリースすることができるのです。

![イメージについて]( {{ site.baseurl }}/assets/img/docs/arch.png)

## CircleCI のワークフロー
{: #circleci-in-your-workflow}

サポートされているバージョンコントロールシステム上のソフトウェアリポジトリは、 [circleci.com](https://circleci.com) のプロジェクトとして承認され、追加される必要があります。 その後はコードが変更されるたびに、クリーンなコンテナや仮想マシンで自動テストが実行されます。 CircleCI runs each [job]({{site.baseurl}}/glossary/#job) in a separate [container]({{site.baseurl}}/glossary/#container) or [virtual machine](https://circleci.com/developer/images?imageType=machine).

テスト完了後にはメールで成功・失敗の通知が届くほか、 CircleCI also includes integrated [Slack and IRC notifications]({{site.baseurl}}/notifications). コード テスト カバレッジの結果は、レポート ライブラリが追加されているプロジェクトの詳細ページから確認できます。

CircleCI は、コードを以下のような様々な環境にデプロイするよう設定することができます。
- AWS CodeDeploy
- AWS EC2 Container Service（ECS）
- AWS S3、Google Kubernetes Engine (GKE)
- Microsoft Azure
- Heroku

[Orb レジストリ](https://circleci.com/developer/orbs) には、一般的なデプロイターゲットに使用できる、再利用可能な設定のパッケージが含まれています。 Orb を使うと、設定を簡略化し効率化することができます。

その他のクラウド型デプロイサービスを使っている場合は、 SSH を使うか、ジョブ設定において各サービスの API クライアントを導入することで、スクリプト化することができます。

## CircleCI のメリット
{: #benefits-of-circleci }

CircleCI は、30,000 の組織をサポートし、1 日に 100 万近くのジョブを実行しています。 CircleCI が選ばれる理由は、ジョブの実行が高速であり、ビルドのスピードを最適化できるためです。

CircleCI can be configured to run very complex pipelines efficiently with sophisticated [caching,]({{site.baseurl}}/caching/) [docker layer caching,]({{site.baseurl}}/docker-layer-caching/) and [resource classes]({{site.baseurl}}/optimizations/#resource-class) for running on faster machines.

CircleCI を使用すると、開発者として以下のことが可能です。
- [SSH into any job]({{site.baseurl}}/ssh-access-jobs/) to debug your build issues.
- Set up [parallelism]({{site.baseurl}}/parallelism-faster-jobs/) in your [.circleci/config.yml]({{site.baseurl}}/configuration-reference/) file to run jobs faster.
- Configure [caching]({{site.baseurl}}/caching/) with two simple keys to reuse data from previous jobs in your [workflow]({{site.baseurl}}/workflows/).
- Configure self-hosted [runners]({{site.baseurl}}/runner-overview/) for unique platform support.
- Access [Arm resources]({{site.baseurl}}/arm-resources/) for the machine executor.
- Use [orbs]({{site.baseurl}}/orb-intro/), reusable packages of configuration, to integrate with third parties.
- Use pre-built Docker [images]({{site.baseurl}}/circleci-images/) in a variety of languages.
- [API](https://circleci.com/docs/api/v2/) を使ってジョブやワークフローの情報を取得する。
- Use the [CLI]({{site.baseurl}}/local-cli/) to access advanced tools locally.
- Get flaky test detection with [test insights]({{site.baseurl}}/insights-tests/).

お客様のサーバーにインストールされた CircleCI のオペレーターや管理者として、ビルドの監視やインサイトを提供したり、[Nomad](https://www.nomadproject.io/) を使用してスケジューリングすることが可能です。

See the [CircleCI Operations and Installation Guides]({{site.baseurl}}/server-3-overview/) for complete server documentation.

## 料金オプション
{: #pricing-options }

CircleCI の [料金ページ](https://circleci.com/ja/pricing/) で、無料および有料のオプションをご確認ください。

無料で[サインアップ](https://circleci.com/ja/signup/) し、CircleCI がホストするクラウド型プラットフォーム上の無制限のプロジェクトにアクセスすることができます。

Free プランをご利用のお客様には、オープンソース プロジェクトに使用できる無料のクレジットが付与されます。 Visit [Building Open Source Projects]({{site.baseurl}}/oss/) for more information about free containers for public open source projects.

## さらに詳しく
{: #learn-more }

### ドキュメント
{: #in-the-docs }
{:.no_toc}
- [Concepts]({{site.baseurl}}/concepts/) for basic concepts of CI/CD pipeline management
- [Examples and Guides Overview]({{site.baseurl}}/examples-and-guides-overview/) for platform-specific setup guides

### CircleCI Academy
{: #on-circleci-academy }
{:.no_toc}
- [CI/CD 101 ワークショップ](https://academy.circleci.com/cicd-basics?access_code=public-2021)
- [一般的な開発者向けトレーニング](https://academy.circleci.com/general-developer-training?access_code=public-2021)

### ブログ
{: #on-our-blog }
{:.no_toc}
- [設定のベストプラクティス: 依存関係のキャッシュ](https://circleci.com/blog/config-best-practices-dependency-caching/)
- [CircleCI Orb で拡張性に優れた自動 CI/CD を実現する](https://circleci.com/blog/automate-and-scale-your-ci-cd-with-circleci-orbs/)
- [CI パイプラインを保護する方法](https://circleci.com/blog/secure-ci-pipeline/)
