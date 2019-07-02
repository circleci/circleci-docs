---
layout: classic-docs
title: "プライベートイメージの使用"
short-title: "プライベートイメージの使用"
description: "プライベートイメージを使用する方法"
categories:
  - containerization
order: 50
---

プライベート Docker イメージを使用するには、[config.yml]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルの `auth` フィールドにユーザー名とパスワードを指定します。 パスワードを保護したい場合は、CircleCI の [Project Settings (プロジェクト設定)] ページで環境変数を作成して、それを参照させるようにします。

```yaml
jobs:
  build:
    docker:
      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user  # 文字列リテラル値を指定します
          password: $DOCKERHUB_PASSWORD  # または、プロジェクトの環境変数を参照するように指定します
```

また、[gcr.io](https://cloud.google.com/container-registry) や [quay.io](https://quay.io) などのプライベートリポジトリにあるイメージも使用できます。`image` キーに対してリポジトリ/イメージのフル URL を指定し、`auth` キーに対して適切なユーザー名とパスワードを使用してください。 以下に例を示します。

    - image: quay.io/project/image:tag
      auth:
        username: $QUAY_USERNAME
        password: $QUAY_PASSWORD


または、以下のように `machine` Executor を使用する方法もあります。

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


現在 CircleCI では、Amazon の ECR サービスからのプライベートイメージのプルをサポートしています。 以下の 3つの方法のいずれかで、ECR のプライベートイメージを使用できるようになります。

1. CircleCI AWS インテグレーションを使用して、AWS 認証情報を設定する
2. CircleCI 標準のプライベート環境変数を使用して、AWS 認証情報を設定する
3. aws_auth を使用して、.circleci/config.yml に AWS 認証情報を指定する

```
    version: 2
    jobs:
      build:
        docker:
          - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
            aws_auth:
              aws_access_key_id: AKIAQWERVA  # 文字列リテラル値を指定します
              aws_secret_access_key: $ECR_AWS_SECRET_ACCESS_KEY  # または、プロジェクトの UI 環境変数を参照するように指定します
```

3番目の方法では認証情報に対して任意の変数名を指定できますが、その点を除けば 2番目と 3番目の方法はほぼ同じと言えます。 これは、インフラストラクチャごとに異なる AWS 認証情報を持っている場合に便利です。 たとえば、SaaS アプリケーションに対して短時間のテストを実行し、コミットのたびに Git タグを付けながらステージングインフラストラクチャにデプロイして、本稼働にデプロイする前には本格的なテストスイートを実行します。

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
              name: "ステージングインフラストラクチャにデプロイ"
              command: "よくわからないもの.... CLI"
      deploy:
        docker:
          - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
            aws_auth:
              aws_access_key_id: $AWS_ACCESS_KEY_ID_STAGING
              aws_secret_access_key: $AWS_SECRET_ACCESS_KEY_STAGING
        steps:
          - run:
              name: "全テストスイート"
              command: ".... のテスト"
          - run:
              name: "本稼働インフラストラクチャにデプロイ"
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


## 関連項目

[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)
