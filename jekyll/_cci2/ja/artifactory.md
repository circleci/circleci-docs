---
layout: classic-docs
title: Artifactory へのアップロード
categories:
  - how-to
description: CircleCI でアーティファクトを Artifactory にアップロードする方法
version:
  - Cloud
  - Server v2.x
---

CircleCI では Artifactory への直接アップロードがサポートされています。

- 目次 
{:toc}

## デプロイ

Artifactory の [REST API](https://www.jfrog.com/confluence/display/RTF/Artifactory+REST+API) を活用する方法については、Artifactory からわかりやすいドキュメントが提供されています。

We will use this space to highlight some sample projects showing how to best use CircleCI and Artifactory together.

Ensure that you have created your repository before starting this example, otherwise CircleCI won't have a place to store your dependencies.

## Artifactory plugins

Maven や Gradle といった人気の高いツールでは Artifactory プラグインが提供されており、それぞれのデプロイ コマンドを使用して Artifactory にデプロイできます。

- [Maven でのデプロイ](https://www.jfrog.com/confluence/display/RTF/Maven+Artifactory+Plugin)
- [Gradle でのデプロイ](https://www.jfrog.com/confluence/display/RTF/Gradle+Artifactory+Plugin)

## JFrog CLI

JFrog CLI を使用する場合は、`.circleci/config.yml` に以下のコードを追加して JFrog CLI をインストールできます。

    - run:
        name: jFrog CLI のインストール
        command: curl -fL https://getcli.jfrog.io | sh
    
    

次に、自分の資格情報を安全に使用するために JFrog を設定する必要があります。 自分の `$ARTIFACTORY_URL` を自分の `$ARTIFACTORY_USER` および `$ARTIFACTORY_APIKEY` と共に使用するようにクライアントを設定します。 これらは、`Project Settings->Environment Variables` に入力できます。

    - run: ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
    
    

If you would like to upload JAR files use the following example:

    - run: ./jfrog rt u "multi*/*.jar" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
    

If you would like to upload WAR files use the following example:

    - run: ./jfrog rt u "multi*/*.war" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
    

The full `.circleci/config.yml` file would look something like the following:

```yaml
version: 2
jobs:
  upload-artifact:
    docker:
      - image: circleci/openjdk:8-jdk
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: ~/repo
    steps:
      - checkout
      - run: mvn dependency:go-offline
      - run:
          name: maven build
          command: |
            mvn clean install
      - run:
          name: Install jFrog CLI
          command: curl -fL https://getcli.jfrog.io | sh
      - run:
          name: Push to Artifactory
          command: |
            ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
            ./jfrog rt u <path/to/artifact> <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM
            ./jfrog rt bce <name_you_give_to_build> $CIRCLE_BUILD_NUM  # collects all environment variables on the agent
            ./jfrog rt bp <name_you_give_to_build> $CIRCLE_BUILD_NUM  # attaches ^^ to the build in artifactory
```

## See also

{:.no_toc}

[アーティファクトの保存とアクセス]({{ site.baseurl }}/2.0/artifacts/)