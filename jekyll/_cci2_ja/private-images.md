---
layout: classic-docs
title: "Docker の認証付きプルの使用"
short-title: "Docker の認証付きプルの使用"
description: "Docker の認証付きプルを使用して、プライベート イメージにアクセスし、レート制限を回避する方法"
categories:
  - containerization
order: 50
version:
  - Cloud
  - Server v2.x
---


ここでは、Docker レジストリのプロバイダーでイメージのプルを認証する方法について説明します。

プルを認証することで、プライベートの Docker イメージにアクセスできるようになります。 お使いのレジストリ プロバイダーによっては、レート制限が引き上げられる可能性もあります。

Docker Hub には [2020 年 11 月 1 日](https://www.docker.com/blog/scaling-docker-to-serve-millions-more-developers-network-egress/)から、送信元 IP に基づいたレート制限が導入されます。 CirlceCI では共有 IP プールからジョブを実行しているので、このレート制限による問題発生を回避するために、Docker Hub で認証済みの Docker プルを使用することを強くお勧めします。

[Docker]({{ site.baseurl }}/ja/2.0/executor-types/#docker-%E3%81%AE%E4%BD%BF%E7%94%A8) Executor を使用する場合は、[config.yml]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルの `auth` フィールドにユーザー名とパスワードを指定します。 パスワードを保護したい場合は、[コンテキスト]({{ site.baseurl }}/ja/2.0/contexts)を作成するか、プロジェクトごとの環境変数を使用します。

**メモ:** コンテキストを作成するほうがより柔軟性の高い方法です。 CircleCI は複数のコンテキストをサポートしており、シークレットをモジュール化したり、ジョブが必要なものだけにアクセスできるようにしたりするのにとても便利です。

この例では、既存の `build-env-vars` コンテキストを肥大化させずに、build ジョブに Docker 認証情報の `docker-hub-creds` コンテキストへのアクセスを付与します。

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
          username: mydockerhub-user  # 文字列リテラル値を指定します
          password: $DOCKERHUB_PASSWORD  # または、プロジェクトの環境変数を参照するように指定します
```

また、[gcr.io](https://cloud.google.com/container-registry) や [quay.io](https://quay.io) などのプライベート リポジトリにあるイメージも使用できます。 `image` キーに対してリポジトリ/イメージのフル URL を指定し、`auth` キーに対して適切なユーザー名とパスワードを使用してください。 以下に例を示します。
```yaml
- image: quay.io/project/image:tag
  auth:
    username: $QUAY_USERNAME
    password: $QUAY_PASSWORD
```    
または、以下のように `machine` Executor と Docker Orb を使用する場合にも同じ結果が得られます。

```yaml
version: 2.1
orbs:
  docker: circleci/docker@1.5.0

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
      - docker/check:
          docker-username: mydockerhub-user  # DOCKER_LOGIN がデフォルト値となっており、この値が存在する場合自動で値がセットされます
          docker-password: DOCKERHUB_PASSWORD  # DOCKER_PASSWORD がデフォルト値になっております
      - docker/pull:
          images: 'circleci/node:latest'
```

CLI を使用する場合には以下のようになります。

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

現在 CircleCI では、Amazon の ECR サービスからのプライベート イメージのプルをサポートしています。 以下のいずれかの方法で、ECR のプライベート イメージを使用できるようになります。

1. CircleCI 標準のプライベート環境変数を使用して、AWS 認証情報を設定する
2. `aws_auth` を使用して、`.circleci/config.yml` に AWS 認証情報を指定する

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

いずれの方法もほぼ同じですが、2 番目の方法では認証情報に対して任意の変数名を指定できます。 これは、インフラストラクチャごとに異なる AWS 認証情報を持っている場合に便利です。 たとえば、SaaS アプリケーションに対して短時間のテストを実行し、コミットのたびに Git タグを付けながらステージング インフラストラクチャにデプロイして、本番にデプロイする前には本格的なテスト スイートを実行します。

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
          command: "よくわからないもの.... cli"
  deploy:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: $AWS_ACCESS_KEY_ID_PRODUCTION
          aws_secret_access_key: $AWS_SECRET_ACCESS_KEY_PRODUCTION
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

[CircleCI を設定する]({{ site.baseurl }}/ja/2.0/configuration-reference/)
