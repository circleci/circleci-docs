---
layout: classic-docs
title: "最初に"
short-title: "最初に"
description: "CircleCI 2.0 マニュアルの入口"
categories:
  - getting-started
order: 1
---
This document provides a summary of continuous integration and how CircleCI enables engineering teams with automation.

## CircleCI Overview

我々 **CircleCI** のミッションは、世の中のテクノロジー企業が最高の成果を上げられるようにする、というもの。インテリジェントな自動化ツールを用いることで、チーム開発の生産性をさらに高めてほしいと願っています。

CircleCI provides enterprise-class support and services, with the flexibility of a startup.  
We work where you work: Linux, macOS, Android - SaaS or behind your firewall.

![CircleCI about image]({{ site.baseurl }}/assets/img/docs/arch.png)

## 概要

GitHub もしくは Bitbucket アカウントの認証が完了し、各リポジトリ内のプロジェクトが [circleci.com](https://circleci.com) に追加されると、その後はコードに変更があるたびにコンテナや VM 上で自動的にテストが実行されます。 テスト完了後にはメールで成功・失敗の通知が届くほか、 Slack、HipChat、Campfire、Flowdock などのチャットツールと連携させて通知を受け取ることも可能です。 テスト通知の内容は、レポートライブラリが追加されているプロジェクトであれば、その詳細ページから確認できます。

AWS CodeDeploy、AWS EC2 Container Service（ECS）、AWS S3、Google Container Engine（GKE）、Herokuといったデプロイサービスを利用している場合、CircleCI はそれに合わせてデプロイコードを構成します。 その他のクラウド型デプロイサービスを使っている場合は、 SSH を使うか、ジョブ設定において各サービスの API クライアントを導入することで簡単に設定し、対応できます。

## 継続的インテグレーションとは？

**継続的インテグレーション**とは、Git のような共有リポジトリにおける `master`（中央の）ブランチに対して、素早く、定期的に、個々の開発者が自身のコードをマージするための手法です。 別の場所で機能追加などを行い、開発サイクルの終了間際にマージする方法とは違って、継続的インテグレーションでは、開発メンバーそれぞれが随時、自身のコードを共有リポジトリ上でマージしていく形になります。

**継続的インテグレーション**は、デジタルトランスフォーメーションに向けた大切な第一歩です。

**導入すると？**  
開発メンバー全員がリポジトリの共有メインラインに日々コミット。  
コミットのたびにビルドとテストが自動で実行。  
ビルドやテストに失敗したときは、その問題が即座に解決。

**メリットは？**  
開発チームの生産性、効率、満足度の向上。  
コードにおける問題の迅速な発見と解決。  
不具合の少ない高品質なプロダクトの提供。

## 無料トライアル

CircleCI では以下の無料トライアルを用意しています。

- **クラウド型**：クラウドサーバー上にホスティングした CircleCI を試せるものです。[無料トライアルはこちら]({{site.baseurl}}/2.0/first-steps/)。
- **サーバー型**：自身のサーバー上で CircleCI の動作を試せるものです。[インストール方法はこちら]({{site.baseurl}}/2.0/single-box/)。

### オープンソース特典

パブリックなオープンソースプロジェクトでは、4 つの Linux コンテナを無料で使うことができます。詳しくは「[オープンソースプロジェクトのビルド]({{site.baseurl}}/2.0/oss/)」をご覧ください。

## See Also

Any app that runs on Linux, Android, or macOS is supported. Refer to the [Supported Languages]({{site.baseurl}}/2.0/demo-apps/) document for examples and guides.