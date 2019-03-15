---
layout: classic-docs
title: "概要"
short-title: "概要"
description: "CircleCI 2.0 マニュアルの入口"
categories:
  - getting-started
order: 1
---
このページでは、継続的インテグレーションの概要に加えて、CircleCI がどのようにチーム開発の自動化を実現するかという点について説明しています。

## CircleCI とは

私たち **CircleCI** のミッションは、世の中のテクノロジー企業が最高の成果を上げられるようにする、というものです。  
インテリジェントな自動化ツールを用いることで、チーム開発の生産性をさらに高めてほしいと願っています。

CircleCI は、大手一流企業のようなサポートとサービスに、スタートアップ企業の柔軟さをプラスして提供します。  
Linux、macOS、Android の各プラットフォームに加え、SaaS やオンプレミスといったサービス形態にも余さず対応します。

![CircleCI about image]({{ site.baseurl }}/assets/img/docs/arch.png)

## 概要

GitHub もしくは Bitbucket アカウントの認証が完了し、各リポジトリ内のプロジェクトが [circleci.com](https://circleci.com) に追加されると、その後はコードに変更があるたびに、まっさらな状態のコンテナや VM 上で自動的にテストが実行されます。 CircleCI は、異なる[コンテナ]({{site.baseurl}}/2.0/glossary/#container)または VM でそれぞれの[ジョブ]({{site.baseurl}}/2.0/glossary/#job)を走らせます。 つまり、ジョブが CircleCI を走らせるたびにジョブを走らせるコンテナや VM がスピンアップされます。

テスト完了後にはメールで成功・失敗の通知が届くほか、 Slack、HipChat、Campfire、Flowdock、IRC などのチャットツールと連携して通知を受け取ることも可能です。 テスト通知の内容は、レポートライブラリが追加されているプロジェクトであれば、その詳細ページから確認できます。

AWS CodeDeploy、AWS EC2 Container Service (ECS)、AWS S3、Google Container Engine (GKE)、Heroku といったデプロイサービスを利用している場合、CircleCI はそれに合わせてデプロイコードを構成します。 その他のクラウド型デプロイサービスを使っている場合は、 SSH を使うか、ジョブ設定において各サービスの API クライアントを導入することで、簡単にスクリプト化できます。

## 継続的インテグレーションとは？

**継続的インテグレーション**とは、Git のような共有リポジトリにおける `master` (中央の) ブランチに対して、素早く、定期的に、個々の開発者が自身のコードをマージするための手法です。 別の場所で機能追加などを行い、開発サイクルの終了間際にマージする方法とは違って、継続的インテグレーションでは、開発メンバーそれぞれが随時、自身のコードを共有リポジトリ上でマージしていく形になります。

**継続的インテグレーション**は、デジタルトランスフォーメーションに向けた大切な第一歩です。

**What?**  
Every developer commits daily to a shared mainline.  
Every commit triggers an automated build and test.  
If build and test fails, it’s repaired quickly - within minutes.

**Why?**  
Improve team productivity, efficiency, happiness. Find problems and solve them, quickly. Release higher quality, more stable products.

## 無料トライアル

CircleCI provides a free trial with the following options:

- **クラウド型**：クラウドサーバー上にホスティングした CircleCI を試せるものです。[無料トライアルはこちら]({{site.baseurl}}/2.0/first-steps/)。
- **サーバー型**：自身のサーバー上で CircleCI の動作を試せるものです。[インストール方法はこちら]({{site.baseurl}}/2.0/single-box/)。

### オープンソース特典

See [Building Open Source Projects]({{site.baseurl}}/2.0/oss/) for information about free containers for public open source projects.

## 関連情報

Any app that runs on Linux, Android, or macOS is supported. Refer to the [Supported Languages]({{site.baseurl}}/2.0/demo-apps/) document for examples and guides.