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

- [Deploying with Maven](https://jfrog.com/help/r/jfrog-integrations-documentation/ecosystem-integration-maven-artifactory-plugin)
- [Deploying with Gradle](https://www.jfrog.com/confluence/display/RTF/Gradle+Artifactory+Plugin)

## JFrog CLI
{: #jfrog-cli }

If you want to use the [JFrog CLI](https://docs.jfrog-applications.jfrog.io/jfrog-applications/jfrog-cli), you can install it by following the steps below.

### 1. Add JFrog to your configuration
{: #add-jfrog-to-your-configuration }

There are a number of methods available for [installing JFrog](https://docs.jfrog-applications.jfrog.io/jfrog-applications/jfrog-cli/install#installation).  Please refer to their documentation for the method best suited for your pipeline.

For example if using Node, add the following to your `.circleci/config.yml`:

```yml
- run:
    name: Install jFrog CLI
    command: npm install -g jfrog-cli-v2-jf

```
### 2. Configure credentials
{: #configure-credentials }

Now you need to configure JFrog to use CircleCI credentials securely. CircleCI configures the client to use `$ARTIFACTORY_URL`, along with `$ARTIFACTORY_USER` and `$ARTIFACTORY_APIKEY`. These can be entered under `Project Settings->Environment Variables`. Configure the CLI to use these settings:

```yml
- run: ./jf config add <named_server_config> --artifactory-url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --password $ARTIFACTORY_APIKEY --interactive=false
```

### 3. Upload JAR files (optional)
{: #upload-jar-files }

If you would like to upload JAR files use the following example:

```yml
command: |
            ./jf mvnc \
              --server-id-resolve <server_id> \
              --server-id-deploy <server_id> \
              --repo-resolve-releases libs-release \
              --repo-resolve-snapshots libs-snapshot \
              --repo-deploy-releases release-candidates \
              --repo-deploy-snapshots snapshots \
              --include-patterns "*.jar, *.pom, *.xml"

              /.jf mvn clean install
```

### 4. Upload WAR files (optional)
{: #upload-war-files }

If you would like to upload WAR files use the following example:

```yml
command: |
            ./jf mvnc \
              --server-id-resolve <server_id> \
              --server-id-deploy <server_id> \
              --repo-resolve-releases libs-release \
              --repo-resolve-snapshots libs-snapshot \
              --repo-deploy-releases release-candidates \
              --repo-deploy-snapshots snapshots \
              --include-patterns "*.war"

              /.jf mvn clean install
```

## Full configuration example
{: #full-configuration-example }

The full `.circleci/config.yml` file would look something like the following:

{% include snippets/docker-auth.md %}

```yml
version: 2.1
jobs:
  create-build-package:
    docker:
      - image: cimg/openjdk:17.0.10
    working_directory: ~/repo
    steps:
      - checkout
      - run:
          name: Install JFrog CLI
          command: curl -fL https://getcli.jfrog.io/v2-jf | sh
      - run:
          name: Configure JFrog Creds
          command: |
            ./jf c add <server_id> \
              --artifactory-url $ARTIFACTORY_URL \
              --user $ARTIFACTORY_USER \
              --password $ARTIFACTORY_APIKEY \
              --interactive=false
      - run:
          name: Maven Build
          command: |
            ./jf mvnc \
              --server-id-resolve <server_id> \
              --server-id-deploy <server_id> \
              --repo-resolve-releases libs-release \
              --repo-resolve-snapshots libs-snapshot \
              --repo-deploy-releases release-candidates \
              --repo-deploy-snapshots snapshots \
              --include-patterns "*.jar, *.pom, *.xml"

            ./jf mvn clean install

workflows:
  build:
    jobs:
      - create-build-package:
          context: artifactory
```

## See also
{: #see-also }

- [Storing and Accessing Artifacts](/docs/artifacts/)
- [CircleCI and JFrog](https://circleci.com/circleci-and-jfrog/)
