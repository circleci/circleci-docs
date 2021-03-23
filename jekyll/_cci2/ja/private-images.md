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

プルを認証することで、プライベートの Docker イメージにアクセスできるようになります。  お使いのレジストリ プロバイダーによっては、レート制限が引き上げられる可能性もあります。

CircleCI has partnered with Docker to ensure that our users can continue to access Docker Hub without rate limits. As of November 1st 2020, with few exceptions, you should not be impacted by any rate limits when pulling images from Docker Hub through CircleCI. However, these rate limits may go into effect for CircleCI users in the future. That’s why we’re encouraging you and your team to add Docker Hub authentication to your CircleCI configuration and consider upgrading your Docker Hub plan, as appropriate, to prevent any impact from rate limits in the future.


### Docker executor

[Docker]({{ site.baseurl }}/ja/2.0/executor-types/#using-docker) Executor を使用する場合は、[config.yml]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルの `auth` フィールドにユーザー名とパスワードを指定します。 パスワードを保護したい場合は、[コンテキスト]({{ site.baseurl }}/ja/2.0/contexts)を作成するか、プロジェクトごとの環境変数を使用します。

**Note:** Server customers may instead [setup a pull through Docker Hub registry mirror]({{ site.baseurl }}/2.0/docker-hub-pull-through-mirror/).

**Note:** Contexts are the more flexible option.  CircleCI supports multiple contexts, which is a great way modularize secrets, ensuring jobs can only access what they *need*.

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

```
- image: quay.io/project/image:tag
  auth:
    username: $QUAY_USERNAME
    password: $QUAY_PASSWORD
```


### Machine executor (with Docker orb)

Alternatively, you can utilize the `machine` executor to achieve the same result using the Docker orb:

``` yaml
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
      - docker/check:
          docker-username: DOCKERHUB_LOGIN  # DOCKER_LOGIN is the default value, if it exists, it automatically would be used.
          docker-password: DOCKERHUB_PASSWORD  # DOCKER_PASSWORD is the default value
      - docker/pull:
          images: 'circleci/node:latest'
```


### Machine executor (with Docker CLI)

or with cli:

```yaml
version: 2
jobs:
  build:
    machine: true
    working_directory: ~/my_app
    steps:
      # Docker is preinstalled, along with docker-compose
      - checkout

      # start proprietary DB using private Docker image
      - run: |
          docker login -u $DOCKER_USER -p $DOCKER_PASS
          docker run -d --name db company/proprietary-db:1.2.3
```


### AWS ECR

CircleCI now supports pulling private images from Amazon's ECR service.

<div class="alert alert-info" role="alert">
<b>Tip:</b> You can pull your private images from ECR repositories in any regions. However, for the best experience, we strongly recommend to make a copy of your image in <code class="highlighter-rouge">us-east-1</code> region, and specify that <code class="highlighter-rouge">us-east-1</code> image for Docker executor. Our job execution infrastructure is in <code class="highlighter-rouge">us-east-1</code> region so using <code class="highlighter-rouge">us-east-1</code> images makes the <code class="highlighter-rouge"> Spin Up Environement</code> step faster.
</div>

You can start using private images from ECR in one of two ways:

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
          name: "Every Day Tests"
          command: "testing...."
      - run:
          name: "Deploy to Staging Infrastructure"
          command: "something something darkside.... cli"
  deploy:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: $AWS_ACCESS_KEY_ID_PRODUCTION
          aws_secret_access_key: $AWS_SECRET_ACCESS_KEY_PRODUCTION
    steps:
      - run:
          name: "Full Test Suite"
          command: "testing...."
      - run:
          name: "Deploy to Production Infrastructure"
          command: "something something darkside.... cli"

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

## See also

[Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/)
