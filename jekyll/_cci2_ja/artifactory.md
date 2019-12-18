---
layout: classic-docs
title: Artifactory へのアップロード
categories:
  - how-to
description: CircleCI でアーティファクトを Artifactory にアップロードする方法
---
CircleCI では Artifactory への直接アップロードがサポートされています。

- 目次 
{:toc}

## デプロイ

Artifactory の [REST API](https://www.jfrog.com/confluence/display/RTF/Artifactory+REST+API) を活用する方法については、Artifactory からわかりやすいドキュメントが提供されています。

ここでは、いくつかのサンプルプロジェクトを取り上げながら、CircleCI と Artifactory を組み合わせて最大限に活用する方法について説明します。

このサンプルを実行する前に、リポジトリが作成されていることを確認してください。リポジトリが作成されていないと、CircleCI が依存要素を保存する場所がありません。

## Artifactory プラグイン

Maven や Gradle といった人気の高いツールでは Artifactory プラグインが提供されており、それぞれのデプロイコマンドを使用して Artifactory にデプロイできます。

- [Maven でのデプロイ](https://www.jfrog.com/confluence/display/RTF/Maven+Artifactory+Plugin)
- [Gradle でのデプロイ](https://www.jfrog.com/confluence/display/RTF/Gradle+Artifactory+Plugin)

## JFrog CLI

JFrog CLI を使用する場合は、`.circleci/config.yml` に以下のコードを追加して JFrog CLI をインストールできます。

    - run:
        name: jFrog CLI をインストール
        command: curl -fL https://getcli.jfrog.io | sh
    
    

次に、自分の資格情報を安全に使用するために JFrog を設定する必要があります。 自分の `$ARTIFACTORY_URL` を自分の `$ARTIFACTORY_USER` および `$ARTIFACTORY_APIKEY` と共に使用するようにクライアントを設定します。 これらは、`Project Settings->Environment Variables` に入力できます。

        - run: ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
    
    

JAR ファイルをアップロードする場合には、以下の例を使用します。

        - run: ./jfrog rt u "multi*/*.jar" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
    

WAR ファイルをアップロードする場合には、以下の例を使用します。

        - run: ./jfrog rt u "multi*/*.war" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
    

.circleci/config.yml ファイル全体は、以下のようになります。

```yaml
version: 2
jobs:
  upload-artifact:
    docker:
      - image: circleci/openjdk:8-jdk
    working_directory: ~/repo
    steps:
      - checkout
      - run: mvn dependency:go-offline
      - run:
          name: maven ビルド
          command: |
            mvn clean install
      - run:
          name: jFrog CLI のインストール
          command: curl -fL https://getcli.jfrog.io | sh
      - run:
          name: Artifactory へのプッシュ
          command: |
            ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
            ./jfrog rt u <path/to/artifact> <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM
            ./jfrog rt bce <name_you_give_to_build> $CIRCLE_BUILD_NUM  # エージェント上のすべての環境変数を収集します
            ./jfrog rt bp <name_you_give_to_build> $CIRCLE_BUILD_NUM  # Artifactory 内のビルドに ^^ を付加します
```

## 関連項目

{:.no_toc}

[アーティファクトの保存とアクセス]({{ site.baseurl }}/ja/2.0/artifacts/)
