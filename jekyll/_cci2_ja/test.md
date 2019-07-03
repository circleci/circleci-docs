---
layout: classic-docs
title: "テスト"
description: "CircleCI 2.0 テスト自動化設定"
---

テストの設定方法については、以下のビデオとドキュメントを参照してください。

## ビルド、テスト、デプロイのビデオチュートリアル

以下のビデオで、Docker、iOS、および Android ビルドの詳細なチュートリアルをご覧いただけます。

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/Qp-BA9e0TnA" frameborder="0" allowfullscreen></iframe>
</div>

## テストの実行、分割、デバッグ

| ドキュメント                                                      | 説明                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/configuration-reference/#run">CircleCI を設定する：<code>run</code> ステップのセクション</a>                                   | テストを実行するジョブの記述方法                                          |
| [ブラウザーテスト]({{ site.baseurl }}/2.0/browser-testing/)         | CircleCI でブラウザーテストを実行およびデバッグするための一般的な方法                   |
| <a href="{{ site.baseurl }}/2.0/collect-test-data/">テストメタデータの収集</a>                                   | よく使用されるさまざまなテストランナーを CircleCI 設定でセットアップする方法               |
| <a href="{{ site.baseurl }}/2.0/testing-ios/">macOS 上の iOS アプリケーションのテスト</a>                                   | CircleCI で iOS アプリケーションのテストを設定およびカスタマイズする方法               |
| [テストの並列実行]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) | ジョブ内でテストをグロブして分割する方法                                      |
| <a href="{{ site.baseurl }}/2.0/postgres-config/">データベースの設定例</a>                                   | PostgreSQL と MySQL の設定ファイルの例                              |
| [データベースの設定]({{ site.baseurl }}/2.0/databases/)              | CircleCI 2.0 でのサービスイメージの使用方法、データベーステストの基本的な設定手順についての概要    |
| **コード署名**                                                   |                                                           |
| <a href="{{ site.baseurl }}/2.0/ios-codesigning/">iOS プロジェクトのコード署名の設定</a>                                   | CircleCI 2.0 上の iOS プロジェクトまたは Mac プロジェクトのコード署名を設定するガイドライン |
{: class="table table-striped"}

## デプロイ

デプロイのターゲットおよびツールの詳細と例については、以下のドキュメントを参照してください。

| ドキュメント                    | 説明                                                                  |
| ------------------------- | ------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/deployment-integrations/">デプロイ</a> | AWS、Azure、Firebase、Google Cloud、Heroku、npm など、ほぼすべてのサービスへの自動デプロイの設定 |
| <a href="{{ site.baseurl }}/2.0/artifactory/">Artifactory</a> | Jfrog CLI を使用した Artifactory への自動アップロードの設定                           |
| <a href="{{ site.baseurl }}/2.0/packagecloud/">packagecloud</a> | packagecloud へのパッケージのパブリッシュ                                         |
{: class="table table-striped"}

このページをご参照くださり、ありがとうございます。 ビルド作業のお役に立てば幸いです。

*CircleCI チーム*
