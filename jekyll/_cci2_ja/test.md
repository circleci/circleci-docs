---
layout: classic-docs
title: "テスト"
description: "CircleCI テストの自動化セットアップ"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

テストのセットアップ方法については、以下のビデオとドキュメントを参照してください。

## ビルド、テスト、デプロイのビデオ チュートリアル
{: #how-to-build-test-and-deploy-video-tutorial }

以下のビデオで、Docker、iOS、および Android ビルドの詳細なチュートリアルをご覧いただけます。
<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/Qp-BA9e0TnA" frameborder="0" allowfullscreen></iframe>
</div>

## テストの実行、分割、デバッグ
{: #running-splitting-and-debugging-tests }

| ドキュメント                                                         | 説明                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/ja/configuration-reference/#run">CircleCI を設定する: `run` ステップのセクション</a>                                      | テストを実行するジョブの記述方法                                              |
| [ブラウザーテスト]({{ site.baseurl }}/ja/browser-testing/)         | CircleCI でブラウザーテストを実行およびデバッグするための一般的な方法                       |
| <a href="{{ site.baseurl }}/ja/collect-test-data/">テストメタデータの収集</a>                                      | よく使用されるさまざまなテストランナーを CircleCI の設定ファイルにセットアップする方法              |
| <a href="{{ site.baseurl }}/ja/testing-ios/">macOS 上の iOS アプリケーションのテスト</a>                                      | CircleCI で iOS アプリケーションのテストをセットアップおよびカスタマイズする方法               |
| [テストの並列実行]({{ site.baseurl }}/ja/parallelism-faster-jobs/) | ジョブ内でテストをグロブして分割する方法                                          |
| <a href="{{ site.baseurl }}/ja/postgres-config/">データベースの設定例</a>                                      | PostgreSQL と MySQL の設定ファイルの例                                  |
| [データベースの設定]({{ site.baseurl }}/ja/databases/)              | CircleCI  でのサービスイメージの使用方法、データベーステストの基本的な設定手順についての概要           |
| **コード署名**                                                      |                                                               |
| <a href="{{ site.baseurl }}/ja/ios-codesigning/">iOS プロジェクトのコード署名のセットアップ</a>                                      | CircleCI  上の iOS プロジェクトまたは Mac プロジェクトのコード署名をセットアップするためのガイドライン |
{: class="table table-striped"}

## デプロイ
{: #deploy }

デプロイのターゲットおよびツールの詳細と例については、以下のドキュメントを参照してください。

| ドキュメント                    | 説明                                                                  |
| ------------------------- | ------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/ja/deployment-integrations/">デプロイ</a> | AWS、Azure、Firebase、Google Cloud、Heroku、npm など、ほぼすべてのサービスへの自動デプロイの構成 |
| <a href="{{ site.baseurl }}/ja/artifactory/">Artifactory</a> | Jfrog CLI を使用した Artifactory への自動アップロードの構成                           |
| <a href="{{ site.baseurl }}/ja/packagecloud/">packagecloud</a> | packagecloud へのパッケージのパブリッシュ                                         |
{: class="table table-striped"}

このページをご覧いただきまして、ありがとうございます。 ビルドのお役に立てば幸いです。

_CircleCI チーム_
