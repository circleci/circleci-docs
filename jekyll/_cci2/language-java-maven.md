---
layout: classic-docs
title: "Language Guide: Java (with Maven)"
short-title: "Java with Maven"
description: "Building and Testing with Java and Maven on CircleCI 2.0"
categories: [language-guides]
order: 4
---

This guide will help you get started with a Java application building with Maven on CircleCI. 

* TOC
{:toc}

## Overview
{:.no_toc}

If you’re in a rush, just copy the sample configuration below into a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) in your project’s root directory and start building.

We're going to make a few assumptions here:

* You are using [Maven](https://maven.apache.org/). A [Gradle](https://gradle.org/) version of this guide is available [here](https://circleci.com/docs/2.0/language-java/).
* You are using Java 8. 
* You are using the Spring Framework. This project was generated using the [Spring Initializer](https://start.spring.io/). 
* Your application can be distributed as an all-in-one uberjar.


## Sample Configuration

{% raw %}
```yaml
version: 2 # use CircleCI 2.0
jobs: # a collection of steps
  build: # runs not using Workflows must have a `build` job as entry point
    
    working_directory: ~/circleci-demo-java-spring # directory where steps will run

    docker: # run the steps with Docker
      - image: circleci/openjdk:8-jdk-stretch # ...with this image as the primary container; this is where all `steps` will run

    steps: # a collection of executable commands

      - checkout # check out source code to working directory

      - restore_cache: # restore the saved cache after the first run or if `pom.xml` has changed
          # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}
      
      - run: mvn dependency:go-offline # gets the project dependencies
      
      - save_cache: # saves the project dependencies
          paths:
            - ~/.m2
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}
      
      - run: mvn package # run the actual tests
      
      - store_test_results: # uploads the test metadata from the `target/surefire-reports` directory so that it can show up in the CircleCI dashboard. 
      # Upload test results for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: target/surefire-reports
      
      - store_artifacts: # store the uberjar as an artifact
      # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: target/demo-java-spring-0.0.1-SNAPSHOT.jar
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples    
```
{% endraw %}

## Get the Code

The configuration above is from a demo Java app, which you can access at [https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/maven](https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/maven), which is the `maven` branch of the repository.

If you want to step through it yourself, you can fork the project on GitHub and download it to your machine. Go to the [Add Projects](https://circleci.com/add-projects){:rel="nofollow"} page in CircleCI and click the Build Project button next to your project. Finally, delete everything in `.circleci/config.yml`.

Now we’re ready to build a `config.yml` from scratch.

## Config Walkthrough

We always start with the version.

```yaml
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we must specify a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-java-spring
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we can specify container images under a `docker` key.

```yaml
version: 2
...
    docker:
      - image: circleci/openjdk:8-jdk-stretch
```

We use the [CircleCI OpenJDK Convenience images](https://hub.docker.com/r/circleci/openjdk/) tagged to version `8-jdk-stretch`.

Now we’ll add several `steps` within the `build` job.

We start with `checkout` so we can operate on the codebase.

Next we pull down the cache, if present. If this is your first run, or if you've changed `pom.xml`, this won't do anything. We run `mvn dependency:go-offline` next to pull down the project's dependencies. This allows us to insert a `save_cache` step that will store the dependencies in order to speed things up for next time.

<div class="alert alert-info" role="alert">
  <strong>Tip:</strong> <code class="highlighter-rouge">mvn dependency:go-offline</code> may not work if you are running a multi-module
project build. If this is the case, consider using the <a href="https://github.com/qaware/go-offline-maven-plugin">go-offline-maven-plugin</a>.
</div>

Multi-module cache should depend on pom.xml in every module, it could be achieved with this additional step:

{% raw %}
```yaml
...
    steps:
      - checkout
      - run:
          name: Generate cumulative pom.xml checksum
          command: |
            find . -type f -name "pom.xml" -exec sh -c "sha256sum {} >> ~/pom-checksum.tmp" \;
            sort -o ~/pom-checksum ~/pom-checksum.tmp
          when: always
      - restore_cache:
          key: circleci-demo-java-spring-{{ checksum "~/pom-checksum" }}
```
{% endraw %}

Then `mvn package` runs the actual tests, and if they succeed, it creates an "uberjar" file containing the application source along with all its dependencies.

Next `store_test_results` uploads the test metadata from the `target/surefire-reports` directory so that it can show up in the CircleCI dashboard. 

Finally we store the uberjar as an [artifact](https://circleci.com/docs/2.0/artifacts/) using the `store_artifacts` step. From there this can be tied into a continuous deployment scheme of your choice.

{% raw %}
```yaml
...
    steps:

      - checkout

      - restore_cache:
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}
      
      - run: mvn dependency:go-offline
      
      - save_cache:
          paths:
            - ~/.m2
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}
      
      - run: mvn package
      
      - store_test_results:
          path: target/surefire-reports
      
      - store_artifacts:
          path: target/demo-java-spring-0.0.1-SNAPSHOT.jar
```
{% endraw %}

Nice! You just set up CircleCI for a Java app using Maven and Spring.

## See Also
{:.no_toc}

- See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.
- See the [Debugging Java OOM errors]({{ site.baseurl }}/2.0/java-oom/) document
for details on handling Java memory issues.
