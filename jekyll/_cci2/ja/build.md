---
layout: classic-docs
title: "ビルド環境"
description: "CircleCI 2.0 のビルド環境の構成"
---


お使いの環境に固有の作業手順については、以下のドキュメントを参照してください。

| ドキュメント                                                                                                   | 説明                                                                  |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/executor-types/">Executor タイプの選び方</a>                                                                                | `docker`、`windows`、`machine`、`macos` の各 Executor の違い、メリットとデメリット、使用例 |
| <a href="{{ site.baseurl }}/2.0/caching/">依存関係のキャッシュ</a>                                                                                | 高コストなフェッチ操作が必要なデータを前回のジョブから再利用することで、CircleCI のジョブを高速化する方法           |
| [CircleCI のローカル CLI の使用]({{ site.baseurl }}/2.0/local-jobs/)                                             | ローカル環境でジョブを実行する手順                                                   |
| [CircleCI での Yarn の使用]({{ site.baseurl }}/2.0/yarn/)                                                     | Yarn のインストール方法と Yarn パッケージのキャッシュ方法                                  |
| [CircleCI 上で Snapcraft を使用した Snap パッケージのビルドとパブリッシュ]({{ site.baseurl }}/2.0/build-publish-snap-packages/) | Snapcraft のセットアップと、Snap パッケージのビルドからパブリッシュまでを解説した完全ガイド               |
{: class="table table-striped"}

## Docker
{: #docker }

| Document                  | Description                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/circleci-images/">Prebuilt Images</a> | Complete list of prebuilt CircleCI Docker images.                                                                                |
| <a href="{{ site.baseurl }}/2.0/custom-images/">Using Custom Images</a> | How to create and use custom Docker images with CircleCI.                                                                        |
| <a href="{{ site.baseurl }}/2.0/private-images/">Using Docker Authenticated Pulls</a> | Use Docker authenticated pulls to access private images and avoid rate limits.                                                   |
| <a href="{{ site.baseurl }}/2.0/building-docker-images/">Running Docker Commands</a> | How to build Docker images for deploying elsewhere or for further testing and how to start services in remote docker containers. |
| <a href="{{ site.baseurl }}/2.0/docker-compose/">Using Docker Compose</a> | How to use docker-compose by installing it in your primary container during the job execution.                                   |
| <a href="{{ site.baseurl }}/2.0/docker-layer-caching/">Docker Layer Caching (DLC)</a> | How to request the DLC feature and add it to your configuration file.                                                            |
{: class="table table-striped"}

## iOS と Mac
{: #ios-and-mac }

| ドキュメント                     | 説明                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/hello-world-macos/">Hello World on MacOS</a>  | Getting started with the macOS executor and CircleCI                                              |
| <a href="{{ site.baseurl }}/2.0/testing-ios/">Testing iOS Applications on macOS</a>  | How to set up and customize testing for an iOS application with CircleCI.                         |
| <a href="{{ site.baseurl }}/2.0/ios-codesigning/">Setting Up Code Signing for iOS Projects</a> | Describes the guidelines for setting up code signing for your iOS or Mac project on CircleCI 2.0. |
{: class="table table-striped"}


## Windows
{: #windows }

| Document                   | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| <a href="{{ site.baseurl }}/2.0/hello-world-windows/">Hello World on Windows</a> | Getting started with the Windows executor and CircleCI |
{: class="table table-striped"}

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
