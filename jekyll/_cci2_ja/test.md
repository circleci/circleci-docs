---
layout: classic-docs
title: "テスト"
description: "CircleCI 2.0 テストの自動化セットアップ"
---

テストのセットアップ方法については、以下のビデオとドキュメントを参照してください。

## ビルド、テスト、デプロイのビデオ チュートリアル

以下のビデオで、Docker、iOS、および Android ビルドの詳細なチュートリアルをご覧いただけます。

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/Qp-BA9e0TnA" frameborder="0" allowfullscreen></iframe>
</div>

## テストの実行、分割、デバッグ

| ドキュメント                                                      | 説明                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/configuration-reference/#run">CircleCI を設定する: <code>run</code> ステップのセクション</a>                                   | テストを実行するジョブの記述方法                                              |
| [ブラウザー テスト]({{ site.baseurl }}/2.0/browser-testing/)        | CircleCI でブラウザー テストを実行およびデバッグするための一般的な方法                      |
| <a href="{{ site.baseurl }}/2.0/collect-test-data/">テスト メタデータの収集</a>                                   | よく使用されるさまざまなテスト ランナーを CircleCI の構成でセットアップする方法                 |
| <a href="{{ site.baseurl }}/2.0/testing-ios/">macOS 上の iOS アプリケーションのテスト</a>                                   | CircleCI で iOS アプリケーションのテストをセットアップおよびカスタマイズする方法               |
| [テストの並列実行]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) | ジョブ内でテストをグロブして分割する方法                                          |
| <a href="{{ site.baseurl }}/2.0/postgres-config/">データベースの構成例</a>                                   | PostgreSQL と MySQL の設定ファイルの例                                  |
| [データベースの構成]({{ site.baseurl }}/2.0/databases/)              | CircleCI 2.0 でのサービス イメージの使用方法、データベース テストの基本的な構成手順についての概要      |
| **コード署名**                                                   |                                                               |
| <a href="{{ site.baseurl }}/2.0/ios-codesigning/">iOS プロジェクトのコード署名のセットアップ</a>                                   | CircleCI 2.0 上の iOS プロジェクトまたは Mac プロジェクトのコード署名をセットアップするガイドライン | 
{: class="table table-striped"} 

## デプロイ

デプロイのターゲットおよびツールの詳細と例については、以下のドキュメントを参照してください。

| ドキュメント                    | 説明                                                                  |
| ------------------------- | ------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/deployment-integrations/">デプロイ</a> | AWS、Azure、Firebase、Google Cloud、Heroku、npm など、ほぼすべてのサービスへの自動デプロイの構成 |
| <a href="{{ site.baseurl }}/2.0/artifactory/">Artifactory</a> | Jfrog CLI を使用した Artifactory への自動アップロードの構成                           |
| <a href="{{ site.baseurl }}/2.0/packagecloud/">packagecloud</a> | packagecloud へのパッケージのパブリッシュ                                         | 
{: class="table table-striped"} 

このページをご参照くださり、ありがとうございます。 ビルドのお役に立てば幸いです。

*CircleCI チーム*