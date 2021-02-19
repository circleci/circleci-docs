---
layout: classic-docs
title: "概要"
short-title: "概要"
description: "CircleCI 2.0 入門ガイド"
categories:
  - getting-started
order: 1
---

継続的インテグレーションの概要と、CircleCI を使用してエンジニアリング チームが自動化を行うしくみについて説明します。 CircleCI は、ソフトウェアのビルド、テスト、デプロイを自動化します。

## CircleCI overview

**CircleCI** - Our mission is to empower technology-driven organizations to do their best work. We want to make engineering teams more productive through intelligent automation.

CircleCI provides enterprise-class support and services, with the flexibility of a startup. We work where you work: Linux, macOS, Android, and Windows - SaaS or behind your firewall.

![CircleCI のコンセプト イメージ]({{ site.baseurl }}/assets/img/docs/arch.png)

## CircleCI のメリット

CircleCI は、30,000 の組織をサポートし、1 日に 100 万近くのジョブを実行しています。 CircleCI が選ばれる理由は、ジョブの実行が高速であり、ビルドのスピードを最適化できることです。 CircleCI は、高度な[キャッシュ]({{site.baseurl}}/2.0/caching/)、[Docker レイヤー キャッシュ]({{site.baseurl}}/2.0/docker-layer-caching/)、高速マシン上で実行するための[リソース クラス]({{site.baseurl}}/2.0/optimizations/#resource-class)、および[従量課金制プラン](https://circleci.com/ja/pricing/usage/)によって、きわめて複雑なパイプラインを効率的に実行するように構成できます。

開発者は [circleci.com](https://circleci.com/jp) を使用して、[任意のジョブに SSH 接続]({{site.baseurl}}/2.0/ssh-access-jobs/)してビルドの問題をデバッグしたり、[.circleci/config.yml]({{site.baseurl}}/2.0/configuration-reference/) ファイルで[並列処理]({{site.baseurl}}/2.0/parallelism-faster-jobs/)をセットアップしてジョブの実行を高速化したり、わずか 2 つのキーで[キャッシュ]({{site.baseurl}}/2.0/caching/)を構成して[ワークフロー]({{site.baseurl}}/2.0/workflows/)で以前のジョブのデータを再利用したりすることができます。

自社サーバーにインストールされた CircleCI のオペレーターや管理者は、CircleCI を使用して、ビルドをモニタリングしてインサイトを得たり、スケジュールに Nomad クラスターを使用したりすることができます。詳細については、[CircleCI 運用ガイド]({{site.baseurl}}/2.0/circleci-ops-guide-v2-17.pdf)を参照してください。

## 概要

GitHub または Bitbucket 上のソフトウェア リポジトリが承認され、プロジェクトとして [circleci.com](https://circleci.com/ja) に追加された後は、コードを変更するたびに、クリーン コンテナまたは VM で自動化されたテストがトリガーされます。 CircleCI は、各[ジョブ]({{site.baseurl}}/2.0/glossary/#ジョブ)をそれぞれ独立した[コンテナ]({{site.baseurl}}/2.0/glossary/#コンテナ)または VM で実行します。 つまり、ジョブが実行されるたびに、CircleCI がコンテナまたは VM をスピンアップし、そこでジョブを実行します。

その後 CircleCI は、テストが完了すると、成功または失敗のメール通知を送信します。 CircleCI also includes integrated [Slack and IRC notifications]({{ site.baseurl }}/2.0/notifications). コード テスト カバレッジの結果は、レポート ライブラリが追加されているプロジェクトの詳細ページから提供されます。

CircleCI は、AWS CodeDeploy、AWS EC2 Container Service (ECS)、AWS S3、Google Kubernetes Engine (GKE)、Microsoft Azure、Heroku などのさまざまな環境にコードをデプロイするように構成できます。 他のクラウド サービスへのデプロイには、SSH を使用するか、ジョブの構成でサービスの API クライアントをインストールすることで、簡単にスクリプト化できます。

## What is continuous integration?

**Continuous integration** is a practice that encourages developers to integrate their code into a `main` branch of a shared repository early and often. それぞれの機能を個別にビルドして、開発サイクルの最後に統合するのではなく、各開発者のコードが 1 日に何度も共有リポジトリに統合されます。

**継続的インテグレーション**は、デジタル トランスフォーメーションの重要なステップです。

**概要**  
すべての開発者が共有メインラインに毎日コミットします。  
コミットされるたびに、自動化されたビルドとテストがトリガーされます。  
ビルドやテストが失敗しても、数分以内にすばやく修復できます。

**Why?**  
Improve team productivity, efficiency, happiness.  
Find problems and solve them, quickly.  
Release higher quality, more stable products.

## Free trial options

CircleCI は以下の無料トライアル オプションをご用意しています。

- **クラウド**: 「[CircleCI を始める]({{site.baseurl}}/2.0/first-steps/)」を参照しながら、CircleCI がホスティングするアプリケーションの使用を開始してください。
- **サーバー**: [CircleCI トライアルのインストール]({{site.baseurl}}/2.0/single-box/)」に記載されている Enterprise トライアルの手順をご覧ください。

### Open source

パブリック オープンソース プロジェクト用無料コンテナの詳細については、「[オープンソース プロジェクトの構築]({{site.baseurl}}/2.0/oss/)」を参照してください。

## See also

Linux、Android、macOS 上で動作するすべてのアプリがサポートされます。 以下のドキュメントを参照してください。

- [サポートされている言語]({{site.baseurl}}/2.0/demo-apps/): サンプルとガイド
- [コア機能]({{site.baseurl}}/2.0/features/): 詳細な説明と手順書へのリンク