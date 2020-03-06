---
layout: classic-docs
title: "Language Guide: Java"
short-title: "Java"
description: "Building and Testing with Java on CircleCI 2.0"
categories: [language-guides]
order: 4
---

This guide will help you get started with a Java application building with Gradle on CircleCI. 

* TOC
{:toc}

## Overview
{:.no_toc}

If you’re in a rush, just copy the sample configuration below into a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) in your project’s root directory and start building.

We're going to make a few assumptions here:

* You are using [Gradle](https://gradle.org/). A [Maven](https://maven.apache.org/) version of this guide is available [here](https://circleci.com/docs/2.0/language-java-maven/).
* You are using Java 11. 
* You are using the Spring Framework. This project was generated using the [Spring Initializer](https://start.spring.io/). 
* Your application can be distributed as an all-in-one uberjar.


## Sample Configuration

{% raw %}
```yaml
version: 2 # use CircleCI 2.0
jobs: # a collection of steps
  build:
    # Remove if parallelism is not desired
    parallelism: 2
    environment:
      # Configure the JVM and Gradle to avoid OOM errors
      _JAVA_OPTIONS: "-Xmx3g"
      GRADLE_OPTS: "-Dorg.gradle.daemon=false -Dorg.gradle.workers.max=2"
    docker: # run the steps with Docker
      - image: circleci/openjdk:11.0.3-jdk-stretch # ...with this image as the primary container; this is where all `steps` will run
      - image: circleci/postgres:12-alpine
        environment:
          POSTGRES_USER: postgres
          POSTGRES_DB: circle_test
    steps: # a collection of executable commands
      - checkout # check out source code to working directory
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
      - restore_cache:
          key: v1-gradle-wrapper-{{ checksum "gradle/wrapper/gradle-wrapper.properties" }}
      - restore_cache:
          key: v1-gradle-cache-{{ checksum "build.gradle" }}
      - run:
          name: Run tests in parallel # See: https://circleci.com/docs/2.0/parallelism-faster-jobs/
          # Use "./gradlew test" instead if tests are not run in parallel
          command: |
            cd src/test/java
            # Get list of classnames of tests that should run on this node
            CLASSNAMES=$(circleci tests glob "**/*.java" \
              | cut -c 1- | sed 's@/@.@g' \
              | sed 's/.\{5\}$//' \
              | circleci tests split --split-by=timings --timings-type=classname)
            cd ../../..
            # Format the arguments to "./gradlew test"
            GRADLE_ARGS=$(echo $CLASSNAMES | awk '{for (i=1; i<=NF; i++) print "--tests",$i}')
            echo "Prepared arguments for Gradle: $GRADLE_ARGS"
            ./gradlew test $GRADLE_ARGS
      - save_cache:
          paths:
            - ~/.gradle/wrapper
          key: v1-gradle-wrapper-{{ checksum "gradle/wrapper/gradle-wrapper.properties" }}
      - save_cache:
          paths:
            - ~/.gradle/caches
          key: v1-gradle-cache-{{ checksum "build.gradle" }}
      - store_test_results:
      # Upload test results for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: build/test-results/test
      - store_artifacts: # Upload test results for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: build/test-results/test
          when: always
      - run:
          name: Assemble JAR
          command: |
            # Skip this for other nodes
            if [ "$CIRCLE_NODE_INDEX" == 0 ]; then
              ./gradlew assemble
            fi
      # As the JAR was only assembled in the first build container, build/libs will be empty in all the other build containers.
      - store_artifacts:
          path: build/libs
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples
workflows:
  version: 2
  workflow:
    jobs:
    - build 
```
{% endraw %}

## Get the Code

The configuration above is from a demo Java app, which you can access at [https://github.com/CircleCI-Public/circleci-demo-java-spring](https://github.com/CircleCI-Public/circleci-demo-java-spring).

If you want to step through it yourself, you can fork the project on GitHub and download it to your machine. Go to the [Add Projects](https://circleci.com/add-projects){:rel="nofollow"} page in CircleCI and click the Build Project button next to your project. Finally, delete everything in `.circleci/config.yml`.

Now we’re ready to build a `config.yml` from scratch.

## Config Walkthrough

We always start with the version.

```yaml
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

```yaml
version: 2
jobs:
  build:
    # Remove if parallelism is not desired
    parallelism: 2
    environment:
      # Configure the JVM and Gradle to avoid OOM errors
      _JAVA_OPTIONS: "-Xmx3g"
      GRADLE_OPTS: "-Dorg.gradle.daemon=false -Dorg.gradle.workers.max=2"
```

An optional `parallelism` value of 2 is specified as we would like to run tests in [parallel](https://circleci.com/docs/2.0/parallelism-faster-jobs/) to speed up the job.

We also use the `environment` key to configure the JVM and Gradle to [avoid OOM errors](https://circleci.com/blog/how-to-handle-java-oom-errors/). We disable the Gradle daemon to let the Gradle process terminate after it is done. This helps to conserve memory and reduce the chance of OOM errors.

```yaml
version: 2
...
    docker:
      - image: circleci/openjdk:11.0.3-jdk-stretch
      - image: circleci/postgres:12-alpine
        environment:
          POSTGRES_USER: postgres
          POSTGRES_DB: circle_test
```

We use the [CircleCI OpenJDK Convenience images](https://hub.docker.com/r/circleci/openjdk/) tagged to version `11.0.3-jdk-stretch`.

Now we’ll add several `steps` within the `build` job.

We start with `checkout` so we can operate on the codebase.

Next we pull down the caches for the Gradle wrapper and dependencies, if present. If this is your first run, or if you've changed `gradle/wrapper/gradle-wrapper.properties` and `build.gradle`, this won't do anything.

<div class="alert alert-info" role="alert">
  <strong>Tip:</strong> Dependency caching may not work fully if there are multiple `build.gradle` files in your project. If this is the case, consider computing a checksum based on the contents of all the `build.gradle` files, and incorporating it into the cache key.
</div>

{% raw %}
```yaml
...
    steps:
      - checkout
      - restore_cache:
          key: v1-gradle-wrapper-{{ checksum "gradle/wrapper/gradle-wrapper.properties" }}
      - restore_cache:
          key: v1-gradle-cache-{{ checksum "build.gradle" }}
```
{% endraw %}

 We run `./gradlew test` with additional arguments, which will pull down Gradle and/or the project's dependencies if the cache(s) were empty, and run a subset of tests on each build container. The subset of tests run on each parallel build container is determined with the help of the built-in [`circleci tests split`](https://circleci.com/docs/2.0/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests) command.

 {% raw %}
```yaml
...
    steps:
      - run:
          name: Run tests in parallel # See: https://circleci.com/docs/2.0/parallelism-faster-jobs/
          # Use "./gradlew test" instead if tests are not run in parallel
          command: |
            cd src/test/java
            # Get list of classnames of tests that should run on this node
            CLASSNAMES=$(circleci tests glob "**/*.java" \
              | cut -c 1- | sed 's@/@.@g' \
              | sed 's/.\{5\}$//' \
              | circleci tests split --split-by=timings --timings-type=classname)
            cd ../../..
            # Format the arguments to "./gradlew test"
            GRADLE_ARGS=$(echo $CLASSNAMES | awk '{for (i=1; i<=NF; i++) print "--tests",$i}')
            echo "Prepared arguments for Gradle: $GRADLE_ARGS"
            ./gradlew test $GRADLE_ARGS
```
{% endraw %}

Next we use the `save_cache` step to store the Gradle wrapper and dependencies in order to speed things up for next time.

{% raw %}
```yaml
...
      - save_cache:
          paths:
            - ~/.gradle/wrapper
          key: v1-gradle-wrapper-{{ checksum "gradle/wrapper/gradle-wrapper.properties" }}
      - save_cache:
          paths:
            - ~/.gradle/caches
          key: v1-gradle-cache-{{ checksum "build.gradle" }}
```
{% endraw %}


Next `store_test_results` uploads the JUnit test metadata from the `build/test-results/test` directory so that it can show up in the CircleCI dashboard. We also upload the test metadata as artifacts via the `store_artifacts` in case there is a need to examine them.


{% raw %}
```yaml
...
      - store_test_results:
          path: build/test-results/test
      - store_artifacts:
          path: build/test-results/test
          when: always
```
{% endraw %}

Next we use the `./gradlew assemble` command to create an "uberjar" file containing the compiled application along with all its dependencies. We run this only on the first build container instead of on all the build containers running in parallel, as we only need one copy of the uberjar.

We then store the uberjar as an [artifact](https://circleci.com/docs/2.0/artifacts/) using the `store_artifacts` step. From there this can be tied into a continuous deployment scheme of your choice.

{% raw %}
```yaml
...
      - run:
          name: Assemble JAR
          command: |
            # Skip this for other nodes
            if [ "$CIRCLE_NODE_INDEX" == 0 ]; then
              ./gradlew assemble
            fi
      # As the JAR was only assembled in the first build container, build/libs will be empty in all the other build containers.
      - store_artifacts:
          path: build/libs
```
{% endraw %}

Lastly, we define a workflow named `workflow` which the `build` job will execute as the only job in the workflow.

{% raw %}
```yaml
...
workflows:
  version: 2
  workflow:
    jobs:
    - build
```
{% endraw %}

Nice! You just set up CircleCI for a Java app using Gradle and Spring.

## See Also
{:.no_toc}

- See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.
- See the [Debugging Java OOM errors]({{ site.baseurl }}/2.0/java-oom/) document
for details on handling Java memory issues.
