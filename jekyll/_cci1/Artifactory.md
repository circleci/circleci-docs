---
layout: classic-docs
title: Upload to Artifactory
categories: [how-to]
description: How to upload Artifacts to Artifactory
sitemap: false
---

CircleCI supports uploading directly to Artifactory.

## Deploy

Artifactory has great documentation explaining how to leverage their [REST API](https://www.jfrog.com/confluence/display/RTF/Artifactory+REST+API).

We'll use this space to highlight some sample projects showing how to best leverage CircleCI and Artifactory together.

Ensure that you've created your repository before starting this example, otherwise CircleCI won't have a place to store your dependencies.

## JFrog CLI
If you want to use the JFrog CLI, you can install it by adding the following to your `circle.yml` :

```
dependencies:
  pre:
    - curl -fL https://getcli.jfrog.io | sh

```

Now we need to configure JFrog to use our credentials securely. We configure the client to use our `$ARTIFACTORY_URL`, along with our `$ARTIFACTORY_USER` and `$ARTIFACTORY_APIKEY`. These can be entered under `Project Settings->Environment Variables`

```
    - ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false

```

If you'd like to upload JAR files use the following example:

```
    - ./jfrog rt u "multi*/*.jar" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
```

If you'd like to upload WAR files use the following example:

```
    - ./jfrog rt u "multi*/*.war" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
```

The full circle.yml file would look something like the following:

```
machine:
  java:
    version: openjdk7
dependencies:
  override:
    - mvn --fail-never dependency:go-offline || true
  pre:
    - curl -fL https://getcli.jfrog.io | sh
compile:
  override:
    - mvn clean install
    - ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
    - ./jfrog rt u "multi*/*.jar" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
    - ./jfrog rt u "multi*/*.war" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
    - ./jfrog rt bce <name_you_give_to_build> $CIRCLE_BUILD_NUM
    - ./jfrog rt bp <name_you_give_to_build> $CIRCLE_BUILD_NUM
``` 

Stay tuned for language specific examples.
