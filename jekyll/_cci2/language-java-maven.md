---
layout: classic-docs
title: "Language Guide: Java (with Maven)"
short-title: "Java with Maven"
description: "Building and Testing with Java and Maven on CircleCI"
categories: [language-guides]
order: 4
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

This guide will help you get started with a Java application building with Maven on CircleCI.

* TOC
{:toc}

## Overview
{: #overview }

This is an example application showcasing how to run a Java app on CircleCI 2.1.
This application uses the [Spring PetClinic sample project](https://projects.spring.io/spring-petclinic/). This document includes
pared down sample configurations demonstrating different CircleCI features including workspaces,
dependency caching, and parallelism.

## Sample configuration: version 2.1:
{: #sample-configuration-version-21 }

### A basic build with an orb:
{: #a-basic-build-with-an-orb }

```yaml
version: 2.1

orbs:
  maven: circleci/maven@0.0.12

workflows:
  maven_test:
    jobs:
      - maven/test # checkout, build, test, and upload test results
```


This config uses the language-specific orb to replace any executors, build
tools, and commands available. Here we are using the [maven orb](https://circleci.com/developer/orbs/orb/circleci/maven),
which simplifies building and testing Java projects using Maven. The maven/test
command checks out the code, builds, tests, and uploads the test result. The
parameters of this command can be customized. See the maven orb docs for more
information.

## For 2.0 Configuration (recommended for CircleCI server v2.x users only):
{: #for-20-configuration-recommended-for-circleci-server-v2-x-users-only }

```yaml
version: 2.0

jobs:
  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw package
```

Version 2.0 configs without workflows will look for a job named `build`. A job
is a essentially a series of commands run in a clean execution environment.
Notice the two primary parts of a job: the executor and steps. In this case, we
are using the docker executor and passing in a CircleCI convenience image.

### Using a workflow to build then test
{: #using-a-workflow-to-build-then-test }

A workflow is a dependency graph of jobs. This basic workflow runs a build job
followed by a test job. The test job will not run unless the build job exits
successfully.

```yaml
version: 2.0

jobs:
  test:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw test

  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw -Dmaven.test.skip=true package

workflows:
  version: 2

  build-then-test:
    jobs:
      - build
      - test:
          requires:
            - build
```

### Caching dependencies
{: #caching-dependencies }

The following code sample details the use of **caching**.

{% raw %}
```yaml
version: 2.0

jobs:
  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "pom.xml" }} # appends cache key with a hash of pom.xml file
            - v1-dependencies- # fallback in case previous cache key is not found
      - run: ./mvnw -Dmaven.test.skip=true package
      - save_cache:
            paths:
              - ~/.m2
            key: v1-dependencies-{{ checksum "pom.xml" }}
```
{% endraw %}

The first time this build ran without any dependencies cached, it took 2m14s.
Once the dependencies were restored, the build took 39 seconds.

Note that the `restore_cache` step will restore whichever cache it first matches.
You can add a restore key here as a fallback. In this case, even if `pom.xml`
changes, you can still restore the previous cache. This means the job will only
have to fetch the dependencies that have changed between the new `pom.xml` and the
previous cache.

### Persisting build artifacts to workspace
{: #persisting-build-artifacts-to-workspace }

The following configuration sample details persisting a build artifact to a workspace.

```yaml
version: 2.0

jobs:
  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw -Dmaven.test.skip=true package
      - persist_to_workspace:
         root: ./
         paths:
           - target/

  test:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - attach_workspace:
          at: ./target
      - run: ./mvnw test

workflows:
  version: 2

  build-then-test:
    jobs:
      - build
      - test:
          requires:
            - build
```

This `persist_to_workspace` step allows you to persist files or directories to be used by
downstream jobs in the workflow. In this case, the target directory produced by
the build step is persisted for use by the test step.

### Splitting tests across parallel containers
{: #splitting-tests-across-parallel-containers }


{% raw %}
```yaml
version: 2.0

jobs:
  test:
    parallelism: 2 # parallel containers to split the tests among
    docker:
      - image: cimg/openjdk:17.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: |
          ./mvnw \
          -Dtest=$(for file in $(circleci tests glob "src/test/**/**.java" \
          | circleci tests split --split-by=timings); \
          do basename $file \
          | sed -e "s/.java/,/"; \
          done | tr -d '\r\n') \
          -e test
      - store_test_results: # We use this timing data to optimize the future runs
          path: target/surefire-reports

  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw -Dmaven.test.skip=true package

workflows:
  version: 2

  build-then-test:
    jobs:
      - build
      - test:
          requires:
            - build
```

{% endraw %}

Splitting tests by timings is a great way to divide time-consuming tests across
multiple parallel containers. You might think of splitting by timings as requiring 4
parts:

1. a list of tests to split
2. the command: `circleci tests split --split-by=timings`
3. containers to run the tests
4. historical data to intelligently decide how to split tests

To collect the list of tests to split, simply pull out all of the Java test
files with this command: `circleci tests glob "src/test/**/**.java"`. Then use `sed`
and `tr` to translate this newline-separated list of test files into a
comma-separated list of test classes.

Adding `store_test_results` enables CircleCI to access the historical timing data
for previous executions of these tests, so the platform knows how to split tests
to achieve the fastest overall runtime.

### Storing code coverage artifacts
{: #storing-code-coverage-artifacts }

```yaml
version: 2.0

jobs:
  test:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw test verify
      - store_artifacts:
          path: target/site/jacoco/index.html

workflows:
  version: 2

  test-with-store-artifacts:
    jobs:
      - test
```

The Maven test runner with the [JaCoCo](https://www.eclemma.org/jacoco/) plugin
generates a code coverage report during the build. To save that report as a
build artifact, use the `store_artifacts` step.

### A configuration
{: #a-configuration }

The following code sample is the entirety of a configuration file combining the features described above.


{% raw %}

```yaml
version: 2.0

jobs:
  test:
    parallelism: 2
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "pom.xml" }}
            - v1-dependencies-
      - attach_workspace:
          at: ./target
      - run: |
            ./mvnw \
            -Dtest=$(for file in $(circleci tests glob "src/test/**/**.java" \
            | circleci tests split --split-by=timings); \
            do basename $file \
            | sed -e "s/.java/,/"; \
            done | tr -d '\r\n') \
            -e test verify
      - store_test_results:
          path: target/surefire-reports
      - store_artifacts:
          path: target/site/jacoco/index.html

  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "pom.xml" }}
            - v1-dependencies-
      - run: ./mvnw -Dmaven.test.skip=true package
      - save_cache:
          paths:
            - ~/.m2
          key: v1-dependencies-{{ checksum "pom.xml" }}
      - persist_to_workspace:
         root: ./
         paths:
           - target/

workflows:
  version: 2

  build-then-test:
    jobs:
      - build
      - test:
          requires:
            - build
```
{% endraw %}

The configuration above is from a demo Java app, which you can access
[here](https://github.com/CircleCI-Public/circleci-demo-java-spring). If you
want to step through it yourself, you can fork the project on GitHub and
download it to your machine. Go to the **Projects** page in CircleCI and click
the **Follow Project** button next to your forked project. Finally, delete everything in
.circleci/config.yml. Nice! You just set up CircleCI for a Java app using Gradle
and Spring.

## See also
{: #see-also }

- See the [Deployment overview]({{site.baseurl}}/deployment-overview#next-steps/) document for links to various target configuration examples.
- See the [Debugging Java OOM errors]({{site.baseurl}}/java-oom/) document.
for details on handling Java memory issues.
