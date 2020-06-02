---
layout: classic-docs
title: Upload to Artifactory
categories: [how-to]
description: How to upload Artifacts to Artifactory in CircleCI
---

CircleCI supports uploading directly to Artifactory.

* TOC 
{:toc}

## Deploy

Artifactory has great documentation explaining how to leverage their [REST API](https://www.jfrog.com/confluence/display/RTF/Artifactory+REST+API).

We'll use this space to highlight some sample projects showing how to best leverage CircleCI and Artifactory together.

Ensure that you've created your repository before starting this example, otherwise CircleCI won't have a place to store your dependencies.

## Artifactory Plugins
Popular tools like Maven and Gradle have Artifactory plugins, and can deploy to Artifactory using their respective deploy commands.

- [Deploying with Maven](https://www.jfrog.com/confluence/display/RTF/Maven+Artifactory+Plugin)
- [Deploying with Gradle](https://www.jfrog.com/confluence/display/RTF/Gradle+Artifactory+Plugin)

## JFrog CLI
If you want to use the JFrog CLI, you can install it by adding the following to your `.circleci/config.yml` :

```
- run:
    name: Install jFrog CLI
    command: curl -fL https://getcli.jfrog.io | sh

```

Now we need to configure JFrog to use our credentials securely. We configure the client to use our `$ARTIFACTORY_URL`, along with our `$ARTIFACTORY_USER` and `$ARTIFACTORY_APIKEY`. These can be entered under `Project Settings->Environment Variables`

```
    - run: ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false

```

If you'd like to upload JAR files use the following example:

```
    - run: ./jfrog rt u "multi*/*.jar" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
```

If you'd like to upload WAR files use the following example:

```
    - run: ./jfrog rt u "multi*/*.war" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
```

The full .circleci/config.yml file would look something like the following:

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

## See Also

{:.no_toc}

[Storing and Accessing Artifacts]({{ site.baseurl }}/2.0/artifacts/)

