---
layout: classic-docs
title: "Executor とイメージ"
short-title: "Executor とイメージ"
description: "CircleCI 2.0 の Executor とイメージ"
categories: [configuration]
order: 1
---

`docker`、`machine`、または `macos` Executor で実行するビルド環境を準備し、必要なツールとパッケージのみを含むイメージを指定します。

## Docker

    jobs:
      build: # ジョブの名前
        docker: # Executor タイプ
          - image: buildpack-deps:trusty # プライマリコンテナが Ubuntu Trusty を実行します


## Machine

    jobs:
      build:
        machine:
          image: circleci/classic:201708-01 # VM はこのリリース日の Ubuntu 14.04 を実行します


## macOS

    jobs:
      build:
        macos:
          xcode: "9.0"

        steps:
          # コマンドは、インストールされている Xcode 9.0 を
          # 使用して、macOS コンテナ内で動作します
          - run: xcodebuild -version


## 関連項目

ビルド済み CircleCI コンビニエンスイメージの詳細については、[こちら]({{ site.baseurl }}/ja/2.0/circleci-images/)を参照してください。
