---
layout: このスクリプトは、上記のコマンドを使用してインスタンスをドレインモードに設定し、インスタンス上で実行中のジョブをモニタリングし、ジョブが完了するのを待ってからインスタンスを終了します。
title: "テスト"
description: "CircleCI test automation setup"
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

テストのセットアップ方法については、以下のビデオとドキュメントを参照してください。

## How to build, test, and deploy video tutorial
{: #how-to-build-test-and-deploy-video-tutorial }

Watch the following video for a detailed tutorial of Docker, iOS, and Android builds.
<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/Qp-BA9e0TnA" frameborder="0" allowfullscreen></iframe>
</div>

## Running, splitting, and debugging tests
{: #running-splitting-and-debugging-tests }

| ドキュメント                                                                       | 説明                                                                                            |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/configuration-reference/#run">Configuring CircleCI: `run` Step section</a>                                                    | Write a job to run your tests.                                                                |
| [Browser Testing]({{ site.baseurl }}/2.0/browser-testing/)                   | Common methods for running and debugging browser tests in CircleCI.                           |
| <a href="{{ site.baseurl }}/2.0/collect-test-data/">Collecting Test Metadata</a>                                                    | How to set up various common test runners in your CircleCI configuration.                     |
| <a href="{{ site.baseurl }}/2.0/testing-ios/">Testing iOS Applications on macOS</a>                                                    | How to set up and customize testing for an iOS application with CircleCI.                     |
| [Running Tests in Parallel]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) | How to glob and split tests inside a job.                                                     |
| <a href="{{ site.baseurl }}/2.0/postgres-config/">Database Configuration Examples</a>                                                    | Example configuration files for PostgreSQL and MySQL.                                         |
| [Configuring Databases]({{ site.baseurl }}/2.0/databases/)                   | Overview of using service images and basic steps for configuring database tests in CircleCI.  |
| **Code Signing**                                                             |                                                                                               |
| <a href="{{ site.baseurl }}/2.0/ios-codesigning/">Setting Up Code Signing for iOS Projects</a>                                                    | Describes the guidelines for setting up code signing for your iOS or Mac project on CircleCI. |
{: class="table table-striped"}

## デプロイ
{: #deploy }

デプロイのターゲットおよびツールの詳細と例については、以下のドキュメントを参照してください。

| ドキュメント                    | 説明                                                                  |
| ------------------------- | ------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/deployment-integrations/">デプロイ</a> | AWS、Azure、Firebase、Google Cloud、Heroku、npm など、ほぼすべてのサービスへの自動デプロイの構成 |
| <a href="{{ site.baseurl }}/2.0/artifactory/">Artifactory</a> | Jfrog CLI を使用した Artifactory への自動アップロードの構成                           |
| <a href="{{ site.baseurl }}/2.0/packagecloud/">packagecloud</a> | Publish packages to packagecloud.                                   |
{: class="table table-striped"}

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
