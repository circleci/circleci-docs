---
layout: classic-docs
title: Artifactory へのデプロイ
categories:
  - how-to
description: CircleCI でアーティファクトを Artifactory にアップロードする方法
redirect_from: /ja/artifactory
version:
  - クラウド
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

CircleCI では Artifactory への直接アップロードがサポートされています。

* 目次
{:toc}

## デプロイ
{: #deploy }

Artifactory の [REST API](https://www.jfrog.com/confluence/display/RTF/Artifactory+REST+API) を活用する方法については、Artifactory からわかりやすいドキュメントが提供されています。

ここでは、いくつかのサンプル プロジェクトを取り上げながら、CircleCI と Artifactory を組み合わせて最大限に活用する方法について説明します。

このサンプルを実行する前に、リポジトリが作成されていることを確認してください。 リポジトリが作成されていないと、CircleCI が依存要素を保存する場所がありません。

## Artifactory プラグイン
{: #artifactory-plugins }
Maven や Gradle といった人気の高いツールでは Artifactory プラグインが提供されており、それぞれのデプロイ コマンドを使用して Artifactory にデプロイできます。

- [Maven でのデプロイ](https://www.jfrog.com/confluence/display/RTF/Maven+Artifactory+Plugin)
- [Gradle でのデプロイ](https://www.jfrog.com/confluence/display/RTF/Gradle+Artifactory+Plugin)

## JFrog CLI
{: #jfrog-cli }
.circleci/config.yml ファイル全体は、以下のようになります。

```yml
- run:
    name: Install jFrog CLI
    command: curl -fL https://getcli.jfrog.io | sh

```

次に、自分の資格情報を安全に使用するために JFrog を設定する必要があります。 自分の `$ARTIFACTORY_URL` を自分の `$ARTIFACTORY_USER` および `$ARTIFACTORY_APIKEY` と共に使用するようにクライアントを設定します。 これらは、`Project Settings->Environment Variables` に入力できます。 これらの設定を使用するようにCLIを設定します。

```yml
- run: ./jfrog config add <named_server_config> --artifactory-url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
```

JAR ファイルをアップロードする場合には、以下の例を使用します。

```yml
- run: ./jfrog rt u "multi*/*.jar" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
```

WAR ファイルをアップロードする場合には、以下の例を使用します。

```yml
- run: ./jfrog rt u "multi*/*.war" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
```

.circleci/config.yml ファイル全体は、以下のようになります。

```yml
version: 2
jobs:
  upload-artifact:
    docker:
      - image: cimg/openjdk:17.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: ~/repo
    steps:
      - checkout
      - run: mvn dependency:go-offline
      - run:
          name: maven ビルド
          command: |
            mvn clean install
      - run:
          name: JFrog CLI のインストール
          command: curl -fL https://getcli.jfrog.io | sh
      - run:
          name: Artifactory へのプッシュ
          command: |
            ./jfrog config add <named_server_config> --artifactory-url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
            ./jfrog rt u <path/to/artifact> <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM
            ./jfrog rt bce <name_you_give_to_build> $CIRCLE_BUILD_NUM  # エージェント上のすべての環境変数を収集します
            ./jfrog rt bp <name_you_give_to_build> $CIRCLE_BUILD_NUM  # Artifactory 内のビルドに ^^ を付加します
```

## 関連項目
{: #see-also }

{:.no_toc}

[アーティファクトの保存とアクセス]({{ site.baseurl }}/ja/artifacts/)

