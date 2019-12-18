---
layout: classic-docs
title: "移行"
short-title: "移行"
description: "CircleCI 2.0 への移行の概要"
categories:
  - migration
order: 1
---


CircleCI 2.0 に移行する前に、移行のヒントとテクニック、コンフィグの変換ツールについて学習し、お使いのプラットフォーム用のチュートリアルを参照しておきましょう。

- [Travis CI からの移行]({{ site.baseurl }}/2.0/migrating-from-travis/)
- [Jenkins からの移行]({{ site.baseurl }}/2.0/migrating-from-jenkins/)

<hr />

| コンフィグの概要                                                                                                                                  | スクリプト                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [CircleCI 2.0 のコンフィグ]({{ site.baseurl }}/ja/2.0/config-intro/) `.circleci/config.yml` の概要                                                 | [まだ 1.0 を使用しているプロジェクトを見つけるスクリプト](https://github.com/CircleCI-Public/find-circle-yml)、[現在のプロジェクトから 2.0 コンフィグを生成するスクリプト](https://github.com/CircleCI-Public/circleci-config-generator) |
|                                                                                                                                           |                                                                                                                                                                                      |
| **移行のヒント**                                                                                                                                | **コンフィグの変換**                                                                                                                                                                         |
| CircleCI 1.0 から 2.0 への移行に関するさまざまな[ヒントとテクニック]({{ site.baseurl }}/ja/2.0/migration/)、[よくあるご質問]({{ site.baseurl }}/ja/2.0/faq/)              | [config-translation]({{ site.baseurl }}/ja/2.0/config-translation/) エンドポイントを使用して 2.0 への移行を開始する方法                                                                                     |
|                                                                                                                                           |                                                                                                                                                                                      |
| **iOS での移行**                                                                                                                              | **Linux での移行**                                                                                                                                                                       |
| macOS 上でビルドしたアプリケーションの `circle.yml` を `.circleci/config.yml` に変換して [iOS プロジェクトを移行する]({{ site.baseurl }}/ja/2.0/ios-migrating-from-1-2/)方法 | `circle.yml` から `.circleci/config.yml` への [Linux アプリケーションの移行]({{ site.baseurl }}/ja/2.0/migrating-from-1-2/)に関する基本事項                                                                 |

<hr />

![CircleCI のコンセプトイメージ]({{ site.baseurl }}/assets/img/docs/migrate.png)