---
layout: classic-docs
title: Google Cloud SDK の承認
description: Google Cloud SDK を承認する方法
categories:
  - deploying
order: 100
---

This document explains how to install and authorize the [Google Cloud SDK](https://cloud.google.com/sdk/) in your primary container.

- 目次
{:toc}

## 概要
{:.no_toc}

The Google Cloud SDK is a powerful set of tools that can be used to access Google Cloud Platform (GCP) services like Google Compute Engine and Google Kubernetes Engine. On CircleCI, the Google Cloud SDK is recommended to deploy your application to GCP products.

## 前提条件
{:.no_toc}

- CircleCI 2.0 プロジェクト
- GCP プロジェクト

### Google Cloud SDK のインストール

If Debian is an acceptable operating system for your primary container, consider using Google's base Docker image. このイメージは、Docker Hub で [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/) として提供されています。

それ以外の場合は、基本イメージのオペレーティング システムに対応する [Google Cloud SDK インストール手順](https://cloud.google.com/sdk/)に従ってください。

### サービス アカウントの作成と格納

Before you can use any tools in the Google Cloud SDK, you must authorize `gcloud`. Google は、ユーザー アカウントとサービス アカウントの 2 種類の承認を提供しています。 Because you are installing the Cloud SDK on CircleCI, the service account is the appropriate choice.

1. Create a service account by following Steps 1-3 of [Google's instructions](https://cloud.google.com/sdk/docs/authorizing#authorizing_with_a_service_account). 必ず JSON 形式のキー ファイルをダウンロードしてください。

2. CircleCI にキー ファイルを[プロジェクト環境変数]({{ site.baseurl }}/2.0/env-vars/#プロジェクト内で環境変数を設定する)として追加します。 この例では、`GCLOUD_SERVICE_KEY` という変数名になっています。 Using this particular name is not required, but it will be used throughout the examples in this document.

3. 便宜上、次の 2 つの環境変数を CircleCI プロジェクトに追加します。
    
    - `GOOGLE_PROJECT_ID`: GCP プロジェクトの ID
    - `GOOGLE_COMPUTE_ZONE`: デフォルトの [Compute Engine のゾーン](https://cloud.google.com/compute/docs/regions-zones/)

#### きめ細かい権限の追加

If you are having issues pushing container images to GCR you may need more granular permissions than the default `service account` provides. You can grant permission changes in the Cloud Storage [IAM Console](https://console.cloud.google.com/iam-admin/iam/project).

Refer to the Cloud Storage [permission documentation](https://cloud.google.com/storage/docs/access-control/iam-permissions) to learn more about Identity and Access Management (IAM) permissions.

### Google Container Registry への認証

Depending on the [base Docker image you chose](#installing-the-google-cloud-sdk), you may have to authenticate to the Google Container Registry.

```yaml
version: 2.1
jobs:
  deploy:
    docker:
      - image: google/cloud-sdk
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

If you are using a custom image, you must authenticate to GCR. Use the [`auth` key (https://circleci.com/docs/2.0/configuration-reference/#docker) to specify credentials.

```yaml
version: 2.1
jobs:
  deploy:
    docker:
      - image: gcr.io/project/<image-name>
        auth:
          username: _json_key  # default username when using a JSON key file to authenticate
          password: $GCLOUD_SERVICE_KEY  # JSON service account you created, do not encode to base64
```

**Note:** If base64 encoding is required for your particular workflow, use the following command:

```bash
cat <file> | base64 -w 0
```

### 承認

Use `gcloud` to authorize the Google Cloud SDK and set several default settings. Before executing this command, make sure to write the key to a file before running this command, otherwise, the key file will be interpreted as a .p12 file.

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

**Note:** If you are using a custom base image, ensure that you have the most recent components by adding the following command before authorizing the SDK.

```bash
sudo gcloud --quiet components update
```