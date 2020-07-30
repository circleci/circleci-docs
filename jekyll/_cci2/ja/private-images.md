---
layout: classic-docs
title: "プライベート イメージの使用"
short-title: "プライベート イメージの使用"
description: "プライベート イメージを使用する方法"
categories:
  - containerization
order: 50
---

プライベート Docker イメージを使用するには、[config.yml]({{ site.baseurl }}/2.0/configuration-reference/) ファイルの `auth` フィールドにユーザー名とパスワードを指定します。 パスワードを保護したい場合は、CircleCI の [Project Settings (プロジェクト設定)] ページで環境変数を作成して、それを参照させるようにします。

```yaml
jobs:
  build:
    docker:
      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user  # 文字列リテラル値を指定します
          password: $DOCKERHUB_PASSWORD  # または、プロジェクトの環境変数を参照するように指定します
```

You can also use images from a private repository like [gcr.io](https://cloud.google.com/container-registry) or [quay.io](https://quay.io). Make sure to supply the full registry/image URL for the `image` key, and use the appropriate username/password for the `auth` key. For example:

    - image: quay.io/project/image:tag
      auth:
        username: $QUAY_USERNAME
        password: $QUAY_PASSWORD
    

Alternatively, you can utilize the `machine` executor to achieve the same result:

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

現在 CircleCI では、Amazon の ECR サービスからのプライベート イメージのプルをサポートしています。 You can start using private images from ECR in one of two ways:

1. Set your AWS credentials using standard CircleCI private environment variables.
2. Specify your AWS credentials in `.circleci/config.yml` using `aws_auth`:

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

Both options are virtually the same, however, the second option enables you to specify the variable name you want for the credentials. これは、インフラストラクチャごとに異なる AWS 認証情報を持っている場合に便利です。 For example, let's say your SaaS app runs the speedier tests and deploys to staging infrastructure on every commit while for Git tag pushes, we run the full-blown test suite before deploying to production:

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
          command: ".... のテスト"
      - run:
          name: "ステージング インフラストラクチャへのデプロイ"
          command: "よくわからないもの.... CLI"
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