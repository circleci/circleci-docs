---
layout: classic-docs
title: Google Cloud SDK の承認
description: Google Cloud SDK を承認する方法
categories:
  - deploying
redirect_from: /ja/google-auth
version:
  - クラウド
  - Server 3.x
  - Server 2.x
---

ここでは、プライマリ コンテナで [Google Cloud SDK](https://cloud.google.com/sdk/) をインストールおよび承認する方法を説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

Google Cloud SDK は、Google Cloud Platform (GCP) サービスへのアクセスに使用できる強力なツールセットであり、Google Compute Engine や Google Kubernetes Engine などが含まれます。 CircleCI では、GCP プロダクトにアプリケーションをデプロイする場合、Google Cloud SDK が推奨されます。

## 前提条件
{: #prerequisites }
{:.no_toc}

- CircleCI プロジェクト
- GCP プロジェクト

### Google Cloud SDK のインストール
{: #installing-the-google-cloud-sdk }

プライマリ コンテナでオペレーティングシステムとして Debian を受け入れ可能な場合は、Google の基本 Docker イメージの使用を検討してください。 このイメージは、Docker Hub で [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/) として提供されています。

それ以外の場合は、基本イメージのオペレーティングシステムに対応する [Google Cloud SDK インストール手順](https://cloud.google.com/sdk/)に従ってください。

### サービス アカウントの作成と格納
{: #creating-and-storing-a-service-account }

Google Cloud SDK のツールを使用する前に、`gcloud` を承認する必要があります。 Google は、ユーザー アカウントとサービス アカウントの 2 種類の承認を提供しています。 ここでは CircleCI に Cloud SDK をインストールするので、サービス アカウントが適切です。

1. [Google の手順](https://cloud.google.com/sdk/docs/authorizing#authorizing_with_a_service_account)の 1 ～ 3 に従ってサービス アカウントを作成します。 必ず JSON 形式のキー ファイルをダウンロードしてください。

2. CircleCI にキー ファイルを[プロジェクト環境変数]({{ site.baseurl }}/ja/env-vars/#setting-an-environment-variable-in-a-project)として追加します。 この例では、`GCLOUD_SERVICE_KEY` という変数名になっています。 同じ名前を使用する必要はありませんが、このドキュメントのサンプルでは常にこの名前を使用します。

3. 便宜上、次の 2 つの環境変数を CircleCI プロジェクトに追加します。
    - `GOOGLE_PROJECT_ID`: GCP プロジェクトの ID
    - `GOOGLE_COMPUTE_ZONE`: デフォルトの [Compute Engine のゾーン](https://cloud.google.com/compute/docs/regions-zones/)

#### きめ細かい権限の追加
{: #adding-granular-permissions }

GCR へのコンテナ イメージのプッシュに問題が発生している場合は、デフォルトの `service account` によって提供されるものよりもきめ細かい権限が必要とされている可能性があります。 権限の変更は、Cloud Storage の [IAM コンソール](https://console.cloud.google.com/iam-admin/iam/project)で許可することができます。

Identity and Access Management (IAM) の権限については、Cloud Storage の[権限に関するドキュメント](https://cloud.google.com/storage/docs/access-control/iam-permissions)を参照してください。

### Google Container Registry への認証
{: #authenticating-to-google-container-registry }

Google のパブリック イメージ (`google/cloud-sdk`) を使用している場合、認証は不要です。

```yaml
version: 2
jobs:
  deploy:
    docker:
      - image: google/cloud-sdk
```

カスタム イメージを使用している場合は、GCR に対して認証が必要です。 [`auth` キー]({{site.baseurl}}/ja/configuration-reference/#docker)を使用して、認証情報を指定します。

```yaml
version: 2
jobs:
  deploy:
    docker:
      - image: gcr.io/project/<image-name>
        auth:
          username: _json_key  # JSON キー ファイルを使用して認証する場合のデフォルトのユーザー名
          password: $GCLOUD_SERVICE_KEY  # 作成した JSON サービス アカウント、base64 にエンコードしない
```

**注:** 目的のワークフローで base64 エンコードが必要な場合は、以下のコマンドを使用して下さい。

```shell
version: 2
jobs:
  deploy:
    docker:
      - image: google/cloud-sdk
    steps:
      - run: |
          echo $GCLOUD_SERVICE_KEY | gcloud auth activate-service-account --key-file=-
          gcloud --quiet config set project ${GOOGLE_PROJECT_ID}
          gcloud --quiet config set compute/zone ${GOOGLE_COMPUTE_ZONE}
```

### 承認
{: #authorization }

`gcloud` を使用して Google Cloud SDK を承認し、いくつかのデフォルト設定を設定します。 以下のコマンドを実行する前に、必ずファイルにキーを記載して下さい。そうしないと、キーファイルは .p12 ファイルとして解釈されます。

```yaml
version: 2.1
jobs:
  deploy:
    docker:
      - image: google/cloud-sdk
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run: |
          echo $GCLOUD_SERVICE_KEY | gcloud auth activate-service-account --key-file=-
          gcloud --quiet config set project ${GOOGLE_PROJECT_ID}
          gcloud --quiet config set compute/zone ${GOOGLE_COMPUTE_ZONE}
```

**注:** カスタムのベースイメージを使用している場合は、確実に最新のコンポーネントが使用されるように、SDK を承認する前に以下のコマンドを追加して下さい。

```shell
sudo gcloud --quiet components update
```
