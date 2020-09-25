---
layout: classic-docs
title: "プライベート イメージの使用"
short-title: "プライベート イメージの使用"
description: "プライベート イメージを使用する方法"
categories:
  - containerization
order: 50
version:
  - Cloud
  - Server v2.x
---


プライベート Docker イメージを使用するには、[config.yml]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルの `auth` フィールドにユーザー名とパスワードを指定します。 パスワードを保護したい場合は、CircleCI の [Project Settings (プロジェクト設定)] ページで環境変数を作成して、それを参照させるようにします。

Authenticated pulls allow access to private Docker images. It may also grant higher rate limits depending on your registry provider.

Starting [November 1, 2020](https://www.docker.com/blog/scaling-docker-to-serve-millions-more-developers-network-egress/), Docker Hub will impose rate limits based on the originating IP. Since CircleCI runs jobs from a shared pool of IPs, it is highly recommended to use authenticated Docker pulls with Docker Hub to avoid rate limit problems.

For the [Docker]({{ site.baseurl }}/2.0/executor-types/#using-docker) executor, specify username and password in the `auth` field of your [config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file. To protect the password, create a [context]({{ site.baseurl }}/2.0/contexts) or Environment Variable in the CircleCI Project Settings page, and then reference it:

```yaml
jobs:
  build:
    docker:
      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user  # 文字列リテラル値を指定します
          password: $DOCKERHUB_PASSWORD  # または、プロジェクトの環境変数を参照するように指定します
```

また、[gcr.io](https://cloud.google.com/container-registry) や [quay.io](https://quay.io) などのプライベート リポジトリにあるイメージも使用できます。`image` キーに対してリポジトリ/イメージのフル URL を指定し、`auth` キーに対して適切なユーザー名とパスワードを使用してください。 以下に例を示します。 Make sure to supply the full registry/image URL for the `image` key, and use the appropriate username/password for the `auth` key. For example:

    - image: quay.io/project/image:tag
      auth:
        username: $QUAY_USERNAME
        password: $QUAY_PASSWORD
    

または、以下のように `machine` Executor を使用する方法もあります。

```yaml
version: 2
jobs:
  build:
    machine: true
    working_directory: ~/my_app
    steps:
      # Docker と docker-compose がプリインストールされています

      - checkout

      # プライベート Docker イメージを使用して固有の所有 DB を開始します

      - run: |
          docker login -u $DOCKER_USER -p $DOCKER_PASS
          docker run -d --name db company/proprietary-db:1.2.3
```

or with cli:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: AKIAQWERVA  # 文字列リテラル値を指定します
              aws_secret_access_key: $ECR_AWS_SECRET_ACCESS_KEY  # または、プロジェクトの UI 環境変数を参照するように指定します
```

現在 CircleCI では、Amazon の ECR サービスからのプライベート イメージのプルをサポートしています。 以下の 3 つの方法のいずれかで、ECR のプライベート イメージを使用できるようになります。 You can start using private images from ECR in one of two ways:

1. CircleCI AWS インテグレーションを使用して、AWS 認証情報を設定する
2. CircleCI 標準のプライベート環境変数を使用して、AWS 認証情報を設定する

```yaml
aws_auth を使用して、.circleci/config.yml に AWS 認証情報を指定する
```

Both options are virtually the same, however, the second option enables you to specify the variable name you want for the credentials. This can come in handy where you have different AWS credentials for different infrastructure. For example, let's say your SaaS app runs the speedier tests and deploys to staging infrastructure on every commit while for Git tag pushes, we run the full-blown test suite before deploying to production:

```yaml
version: 2
jobs:
  build:
    docker:

      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: $AWS_ACCESS_KEY_ID_STAGING
          aws_secret_access_key: $AWS_SECRET_ACCESS_KEY_STAGING
    steps:
      - run:
          name: "毎日のテスト"
          command: ".... CLI"
  deploy:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: $AWS_ACCESS_KEY_ID_STAGING
          aws_secret_access_key: $AWS_SECRET_ACCESS_KEY_STAGING
    steps:
      - run:
          name: "フル テスト スイート"
          command: ".... のテスト"
      - run:
          name: "本番インフラストラクチャへのデプロイ"
          command: "よくわからないもの.... CLI"

workflows:
  version: 2
  main:
    jobs:

      - build:
          filters:
            tags:
              only: /^\d{4}\.\d+$/
      - deploy:
          requires:
            - build
          filters:
            branches:
              ignore: /.*/
            tags:
              only: /^\d{4}\.\d+$/
```

## 関連項目

[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)