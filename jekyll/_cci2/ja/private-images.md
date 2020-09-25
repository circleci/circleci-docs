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

For the [Docker]({{ site.baseurl }}/2.0/executor-types/#using-docker) executor, specify username and password in the `auth` field of your [config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file. To protect the password, place it in a [context]({{ site.baseurl }}/2.0/contexts), or use a per-project Environment Variable.

**Note:** Contexts are the more flexible option. CircleCI supports multiple contexts, which is a great way modularize secrets, ensuring jobs can only access what they *need*.

In this example, we grant the "build" job access to Docker credentials context, `docker-hub-creds`, without bloating the existing `build-env-vars` context:

```yaml
workflows:
  my-workflow:
    jobs:
      - build:
          context:
            - build-env-vars
            - docker-hub-creds

jobs:
  build:
    docker:

      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user  # can specify string literal values
          password: $DOCKERHUB_PASSWORD  # or project environment variable reference
```

You can also use images from a private repository like [gcr.io](https://cloud.google.com/container-registry) or [quay.io](https://quay.io). Make sure to supply the full registry/image URL for the `image` key, and use the appropriate username/password for the `auth` key. For example:

    - image: quay.io/project/image:tag
      auth:
        username: $QUAY_USERNAME
        password: $QUAY_PASSWORD
    

Alternatively, you can utilize the `machine` executor to achieve the same result using the Docker orb:

```yaml
version: 2.1
orbs:
  docker: circleci/docker@1.4.0

workflows:
  my-workflow:
    jobs:

      - machine-job:
          context:
            - build-env-vars
            - docker-hub-creds

jobs:
  machine-job:
    machine: true
    steps:

      - docker/pull:
          images: 'circleci/node:latest'
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

CircleCI now supports pulling private images from Amazon's ECR service. You can start using private images from ECR in one of two ways:

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

[Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/)