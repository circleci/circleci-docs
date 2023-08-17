---
layout: classic-docs
title: Deploy to Artifactory
description: How to upload artifacts to Artifactory in CircleCI
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

In this how-to guide, you will learn how to upload artifacts to Artifactory in CircleCI.

## Introduction
{: #introduction }

Artifactory has documentation explaining how to use their [REST API](https://www.jfrog.com/confluence/display/RTF/Artifactory+REST+API).

Below are some sample projects showing how to best use CircleCI and Artifactory together. Ensure that you have created your repository before starting this example, otherwise CircleCI will not have a place to store your dependencies.

## Artifactory plugins
{: #artifactory-plugins }

Popular tools like Maven and Gradle have Artifactory plugins, and can deploy to Artifactory using their respective deploy commands.

- [Deploying with Maven](https://www.jfrog.com/confluence/display/RTF/Maven+Artifactory+Plugin)
- [Deploying with Gradle](https://www.jfrog.com/confluence/display/RTF/Gradle+Artifactory+Plugin)

## JFrog CLI
{: #jfrog-cli }

If you want to use the [JFrog CLI](https://www.jfrog.com/confluence/display/CLI/JFrog+CLI), you can install it by following the steps below.

### 1. Add JFrog to your configuration
{: #add-jfrog-to-your-configuration }

Add the following to your `.circleci/config.yml`:

```yml
- run:
    name: Install jFrog CLI
    command: curl -fL https://getcli.jfrog.io | sh

```
### 2. Configure credentials
{: #configure-credentials }

Now you need to configure JFrog to use CircleCI credentials securely. CircleCI configures the client to use `$ARTIFACTORY_URL`, along with `$ARTIFACTORY_USER` and `$ARTIFACTORY_APIKEY`. These can be entered under `Project Settings->Environment Variables`. Configure the CLI to use these settings:

```yml
- run: ./jfrog config add <named_server_config> --artifactory-url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
```

### 3. Upload JAR files (optional)
{: #upload-jar-files }

If you would like to upload JAR files use the following example:

```yml
- run: ./jfrog rt u "multi*/*.jar" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
```

### 4. Upload WAR files (optional)
{: #upload-war-files }

If you would like to upload WAR files use the following example:

```yml
- run: ./jfrog rt u "multi*/*.war" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
```

## Full configuration example
{: #full-configuration-example }

The full `.circleci/config.yml` file would look something like the following:

{% include snippets/docker-auth.md %}

```yml
version: 2.1
jobs:
  upload-artifact:
    docker:
      - image: cimg/openjdk:19.0.1
    working_directory: ~/repo
    steps:
      - checkout
      - run: mvn dependency:go-offline
      - run:
          name: maven build
          command: |
            mvn clean install
      - run:
          name: Install JFrog CLI
          command: curl -fL https://getcli.jfrog.io | sh
      - run:
          name: Push to Artifactory
          command: |
            ./jfrog config add <named_server_config> --artifactory-url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
            ./jfrog rt u <path/to/artifact> <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM
            ./jfrog rt bce <name_you_give_to_build> $CIRCLE_BUILD_NUM  # collects all environment variables on the agent
            ./jfrog rt bp <name_you_give_to_build> $CIRCLE_BUILD_NUM  # attaches ^^ to the build in artifactory
```

## See also
{: #see-also }

- [Storing and Accessing Artifacts](/docs/artifacts/)
- [CircleCI and JFrog](https://circleci.com/circleci-and-jfrog/)

