---
layout: classic-docs
title: 継続的インテグレーションとは
description: What is continuous integration and continuous delivery?
categories:
  - はじめよう
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

## 概要
{: #introduction }

CircleCI's mission is to manage change so software teams can innovate faster. CircleCI empowers technology-driven organizations to do their best work -- and make engineering teams more productive and innovative by managing change. CircleCI provides enterprise-class support and services, and works where you work: Linux, macOS, Android, and Windows - in the cloud or on your servers.

インテリジェントな自動化により、ビルド、テスト、デプロイを行うことができます。

![CircleCI process diagram]({{site.baseurl}}/assets/img/docs/arch.png)

## What is CI/CD?
{: #what-is-ci-cd }

**Continuous integration (CI)** is a practice that integrates code into a chosen branch of a shared repository, early and often. Instead of building out features in isolation and integrating them at the end of a development cycle, code is integrated with the shared repository by developers multiple times throughout the day by committing daily to a shared mainline. 各コミットにより自動テストとビルドがトリガーされます。 If these fail, they can be repaired quickly.

**Continuous delivery (CD)** is a practice that produces reliable releases to a chosen development environment, like a staging or production branch.

The CI/CD process allows developers to release higher quality, more stable products.

## CircleCI のワークフロー
{: #circleci-in-your-workflow}

A software repository on a supported version control system (VCS) needs to be authorized and added as a project on [circleci.com](https://circleci.com). その後はコードが変更されるたびに、クリーンなコンテナや仮想マシンで自動テストが実行されます。 CircleCI runs each [job](/docs/glossary/#job) in a separate [container](/docs/glossary/#container) or [virtual machine](https://circleci.com/developer/images?imageType=machine).

CircleCI sends an email notification of success or failure after the tests complete. CircleCI also includes integrated [Slack and IRC notifications](/docs/notifications). コード テスト カバレッジの結果は、レポート ライブラリが追加されているプロジェクトの詳細ページから確認できます。

CircleCI may be configured to deploy code to various environments, including (but not limited to):
- AWS S3
- AWS EC2 Container Service（ECS）
- Google Cloud Platform (GCP)
- CircleCI CLI
- Heroku
- Firebase
- Android
- iOS

[Orb レジストリ](https://circleci.com/developer/orbs) には、一般的なデプロイターゲットに使用できる、再利用可能な設定のパッケージが含まれています。 Orb を使うと、設定を簡略化し効率化することができます。

その他のクラウド型デプロイサービスを使っている場合は、 SSH を使うか、ジョブ設定において各サービスの API クライアントを導入することで、スクリプト化することができます。

## 詳しくはこちら
{: #learn-more }

### On CircleCI Academy
{: #on-circleci-academy }
- [CI/CD 101 workshop](https://academy.circleci.com/cicd-basics?access_code=public-2021)
- [一般的な開発者向けトレーニング](https://academy.circleci.com/general-developer-training?access_code=public-2021)

### On our blog
{: #on-our-blog }
- [設定のベストプラクティス: 依存関係のキャッシュ](https://circleci.com/blog/config-best-practices-dependency-caching/)
- [CircleCI Orb で拡張性に優れた自動 CI/CD を実現する](https://circleci.com/blog/automate-and-scale-your-ci-cd-with-circleci-orbs/)
- [CI パイプラインを保護する方法](https://circleci.com/blog/secure-ci-pipeline/)

## 次のステップ
{: #next-steps }
- [CircleCI のメリット](/docs/benefits-of-circleci)
- [CirceCI concepts](/docs/concepts)