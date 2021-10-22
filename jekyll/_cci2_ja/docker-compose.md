---
layout: classic-docs
title: "docker-compose のインストールと使用"
short-title: "docker-compose のインストールと使用"
description: "プライマリ コンテナで docker-compose を有効化する方法"
categories:
  - コンテナ化
order: 40
version:
  - クラウド
  - Server v2.x
---

ここでは、`docker-compose` をインストールして使用する方法を説明します。

* 目次
{:toc}

`docker-compose` ユーティリティは、Machine Executor と [CircleCI イメージ]にプリインストールされています。 別のイメージを使用している場合は、以下のコードを [`config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルに追加することでアクティブ化されるリモート Docker 環境を使用して、ジョブ実行時に\[プライマリ コンテナ\]\[primary-container\]にインストールできます。

```
      - run:
          name: Docker Compose のインストール
          command: |
            curl -L https://github.com/docker/compose/releases/download/1.25.3/docker-compose-`uname -s`-`uname -m` > ~/docker-compose
            chmod +x ~/docker-compose
            sudo mv ~/docker-compose /usr/local/bin/docker-compose
```

上記のコード例では、Executor で `curl` も 使用可能であることを想定しています。 独自の Docker イメージを構築する場合は、 [カスタム Docker イメージ]({{site.baseurl}}/ja/2.0/custom-images/)に関するドキュメントをお読みください。
[pre-installed]: {{ site.baseurl }}/ja/2.0/circleci-images/#プリインストール-ツール [primary-container]: {{ site.baseurl }}/ja.2.0/glossary/#プライマリ-コンテナ

次に、リモート Docker 環境をアクティブ化するために、`setup_remote_docker` ステップを追加します。

```
setup_remote_docker
```

以下のステップにより、`docker-compose` コマンドをビルド イメージに追加できます。

```
docker-compose build
```

または、以下のステップで、システム全体を実行できます。

```
docker-compose up -d
```

以下の例では、システム全体を起動した後、システムが実行されており、リクエストに応答していることを確認します。

``` YAML
      - run:
          name: コンテナの起動と動作検証
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```

## サンプル プロジェクト
{: #example-project }

-uname -m > ~/docker-compose chmod +x ~/docker-compose sudo mv ~/docker-compose /usr/local/bin/docker-compose

**注:** プライマリ コンテナは、リモート Docker とは独立した環境で動作し、両者は直接通信できません。 実行中のサービスとやり取りするためには、サービスのネットワーク内で実行する Docker とコンテナを使用します。

## Docker Compose を Machine Executor と組み合わせて使用
{: #using-docker-compose-with-machine-executor }

Docker Compose を使用して docker-compose ファイルを含むマルチコンテナ セットアップを管理するには、`config.yml` ファイルで `machine` キーを使用し、docker-compose を通常どおりに使用します (詳細は[こちら](https://circleci.com/ja/docs/2.0/executor-types/#machine-を使用する)の Machine Executor に関するドキュメントを参照)。 つまり、docker-compose ファイルがコンテナとローカル ディレクトリを共有する場合、想定通りに機能します。 詳細については、[最初の docker-compose.yml ファイル](https://docs.docker.com/get-started/part3/#your-first-docker-composeyml-file)の Docker に関するドキュメントを参照してください。 **注: プライベート Docker サーバーのスピンアップの結果として、Machine Executor をプロビジョニングするためのオーバーヘッドが存在します。 将来の料金改定では、`machine` キーの使用に追加料金が必要になる可能性があります。


## Docker Compose を Docker Executor と組み合わせて使用
{: #using-docker-compose-with-docker-executor }

`docker` を `setup_remote_docker` と組み合わせて使用すると、docker-machine を使用して作成した場合と同様のリモート エンジンを作成できます。 ただし、このセットアップでは、ボリュームのマウントとポート転送は同じようには**機能しません**。 リモート Docker デーモンは、Docker CLI や Docker Compose とは異なるシステム上で動作するため、これを機能させるにはデータの移動が必要です。 マウントは通常、Docker ボリュームでコンテンツを利用可能にすることで解決できます。 `docker cp` を使用して、CLI ホストから Docker リモート ホスト上で実行しているコンテナにデータを取得することで、Docker ボリュームにデータをロードできます。

デプロイ用の Docker イメージをビルドする場合は、この組み合わせが必要です。

## 制限事項
{: #limitations }

`docker-compose` と `macos` Executor との使用はサポートしていません。詳細は[サポートに関する記事](https://support.circleci.com/hc/en-us/articles/360045029591-Can-I-use-Docker-within-the-macOS-executor-)をご覧ください。

## 関連項目
{: #see-also }
{:.no_toc}

例と詳細については、「Docker コマンドの実行手順」の「[フォルダーのマウント]({{ site.baseurl }}/ja/2.0/building-docker-images/#フォルダーのマウント)」セクションを参照してください。
