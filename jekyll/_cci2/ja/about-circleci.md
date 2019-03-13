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

CircleCI may be configured to deploy code to various environments, including AWS CodeDeploy, AWS EC2 Container Service (ECS), AWS S3, Google Container Engine (GKE), and Heroku. Other cloud service deployments are easily scripted using SSH or by installing the API client of the service with your job configuration.

## 継続的インテグレーションとは？

**Continuous integration** is a practice that encourages developers to integrate their code into a `master` branch of a shared repository early and often. Instead of building out features in isolation and integrating them at the end of a development cycle, code is integrated with the shared repository by each developer multiple times throughout the day.

**Continuous Integration** is a key step to digital transformation.

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