---
layout: classic-docs
title: "Language Guide: Java"
short-title: "Java"
description: "Building and Testing with Java on CircleCI 2.0"
categories: [language-guides]
order: 4
---

## Overview

This guide will help you get started with a Java application on CircleCI. If you’re in a rush, just copy the sample configuration below into a `.circleci/config.yml` in your project’s root directory and start building.

Otherwise, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

We're going to make a few assumptions here:

* You are using [Maven](https://maven.apache.org/).
* You are using Java 8. 
* You are using the Spring Framework. This project was generated using the [Spring Initializer](https://start.spring.io/). 
* Your application can be distributed as an all-in-one uberjar.


## Sample Configuration

{% raw %}
```YAML
version: 2
jobs:
  build:
    
    working_directory: ~/circleci-demo-java-spring

    docker:
      - image: circleci/openjdk:8-jdk-browsers

    steps:

      - checkout

      - restore_cache:
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}
      
      - run: mvn dependency:go-offline
      
      - save_cache:
          paths:
            - ~/.m2
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}-{{ epoch }}
      
      - run: mvn package
      
      - store_test_results:
          path: target/surefire-reports
      
      - store_artifacts:
          path: target/demo-java-spring-0.0.1-SNAPSHOT.jar
```
{% endraw %}

## Get the Code

The configuration above is from a demo Java app, which you can access at [https://github.com/CircleCI-Public/circleci-demo-java-spring](https://github.com/CircleCI-Public/circleci-demo-java-spring).

If you want to step through it yourself, you can fork the project on GitHub and download it to your machine. Go to the [Add Projects](https://circleci.com/add-projects) page in CircleCI and click the Build Project button next to your project. Finally, delete everything in `.circleci/config.yml`.

Now we’re ready to build a `config.yml` from scratch.

## Config Walkthrough

We always start with the version.

```YAML
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```YAML
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-java-spring
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we can specify container images under a `docker` key.

```YAML
version: 2
...
    docker:
      - image: circleci/openjdk:8-jdk-browsers
```

We use the [CircleCI OpenJDK Convenience images](https://hub.docker.com/circleci/openjdk/) tagged to version `8-jdk-browsers` which includes browsers for performing end-to-end testing.

Now we’ll add several `steps` within the `build` job.

We start with `checkout` so we can operate on the codebase.

Next we pull down the cache, if present. If this is your first run, or if you've changed `pom.xml`, this won't do anything. We run `mvn dependency:go-offline` next to pull down the project's dependencies. This allows us to insert a `save_cache` step that will store the dependencies in order to speed things up for next time.

Then `mvn package` runs the actual tests, and if they succeed, it creates an "uberjar" file containing the application source along with all its dependencies.

Next `store_test_results` uploads the test metadata from the `target/surefire-reports` directory so that it can show up in the CircleCI dahsboard. 

Finally we store the uberjar as an [artifact](https://circleci.com/docs/1.0/build-artifacts/) using the `store_artifacts` step. From there this can be tied into a continuous deployment scheme of your choice.

{% raw %}
```YAML
...
    steps:

      - checkout

      - restore_cache:
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}
      
      - run: mvn dependency:go-offline
      
      - save_cache:
          paths:
            - ~/.m2
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}-{{ epoch }}
      
      - run: mvn package
      
      - store_test_results:
          path: target/surefire-reports
      
      - store_artifacts:
          path: target/demo-java-spring-0.0.1-SNAPSHOT.jar
```
{% endraw %}

Nice! You just set up CircleCI for a Java app using Maven and Spring.

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
