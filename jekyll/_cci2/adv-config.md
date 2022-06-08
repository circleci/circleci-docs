---
layout: classic-docs
title: "Advanced Config"
short-title: "Advanced Config"
description: "Summary of advanced config options and features"
categories: [migration]
order: 2
version:
- Cloud
- Server v3.x
- Server v2.x
---

CircleCI supports many advanced configuration options and features, check out the snippets below to get an idea of what is possible, and get tips for optimizing your advanced configurations.

## Check your scripts
{: #check-your-scripts }

Use the shellcheck orb to check all scripts in a project. Check the [shellcheck page in the orb registry](https://circleci.com/developer/orbs/orb/circleci/shellcheck) for versioning and further usage examples (remember to replace x.y.z with a valid version):

{:.tab.executors_one.Cloud}
```yaml
version: 2.1

orbs:
  shellcheck: circleci/shellcheck@x.y.z

workflows:
  shellcheck:
    jobs:
      - shellcheck/check
```

{:.tab.executors_one.Server_3}
```yaml
version: 2.1

orbs:
  shellcheck: circleci/shellcheck@x.y.z

workflows:
  shellcheck:
    jobs:
      - shellcheck/check
```

{:.tab.executors_one.Server_2}
```yaml
version: 2

orbs:
  shellcheck: circleci/shellcheck@x.y.z

workflows:
  shellcheck:
    jobs:
      - shellcheck/check
```

You can also use shellcheck with version 2 config, without using the orb, as follows:

{:.tab.executors_two.Cloud}
```yaml
version: 2.1

jobs:
  shellcheck:
    docker:
      - image: nlknguyen/alpine-shellcheck:v0.4.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: Check Scripts
          command: |
            find . -type f -name '*.sh' | wc -l
            find . -type f -name '*.sh' | xargs shellcheck --external-sources
```

{:.tab.executors_two.Server_3}
```yaml
version: 2.1

jobs:
  shellcheck:
    docker:
      - image: nlknguyen/alpine-shellcheck:v0.4.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: Check Scripts
          command: |
            find . -type f -name '*.sh' | wc -l
            find . -type f -name '*.sh' | xargs shellcheck --external-sources
```

{:.tab.executors_two.Server_2}
```yaml
version: 2

jobs:
  shellcheck:
    docker:
      - image: nlknguyen/alpine-shellcheck:v0.4.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: Check Scripts
          command: |
            find . -type f -name '*.sh' | wc -l
            find . -type f -name '*.sh' | xargs shellcheck --external-sources
```

For more information on using shell scripts in your config, see the [Using Shell Scripts]({{site.baseurl}}/2.0/using-shell-scripts/) guide.

## Browser testing
{: #browser-testing }

Use Selenium to manage in-browser testing:

{:.tab.executors_three.Cloud}
```yaml
version: 2.1

orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/node:17.0-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: mkdir test-reports
      - run: browser-tools/install-browser-tools
      - run:
          name: Download Selenium
          command: curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Start Selenium
          command: java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

{:.tab.executors_three.Server_3}
```yaml
version: 2.1

orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/node:17.0-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: mkdir test-reports
      - run: browser-tools/install-browser-tools
      - run:
          name: Download Selenium
          command: curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Start Selenium
          command: java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

{:.tab.executors_three.Server_2}
```yaml
version: 2

jobs:
  build:
    docker:
      - image: circleci/node:buster-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Download Selenium
          command: curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Start Selenium
          command: java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

For more information on browser testing, see the [Browser Testing]({{site.baseurl}}/2.0/browser-testing/) guide.

## Database testing
{: #database-testing }

Use a service container to run database testing:

{:.tab.executors_four.Cloud}
```yml
version: 2.1

orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:

    # Primary container image where all commands run
    docker:
      - image: cimg/python:3.6.2-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          TEST_DATABASE_URL: postgresql://postgres@localhost/circle_test

    # Service container image
      - image: cimg/postgres:14.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    steps:
      - checkout
      - run: sudo apt-get update
      - run: sudo apt-get install postgresql-client-9.6
      - run: browser-tools/install-browser-tools
      - run: whoami
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "CREATE TABLE test (name char(25));"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "INSERT INTO test VALUES ('John'), ('Joanna'), ('Jennifer');"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "SELECT * from test"
```

{:.tab.executors_four.Server_3}
```yml
version: 2.1

orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:

    # Primary container image where all commands run
    docker:
      - image: cimg/python:3.6.2-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          TEST_DATABASE_URL: postgresql://postgres@localhost/circle_test

    # Service container image
      - image: cimg/postgres:9.6.24
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    steps:
      - checkout
      - run: sudo apt-get update
      - run: sudo apt-get install postgresql-client-9.6
      - run: browser-tools/install-browser-tools
      - run: whoami
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "CREATE TABLE test (name char(25));"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "INSERT INTO test VALUES ('John'), ('Joanna'), ('Jennifer');"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "SELECT * from test"
```

{:.tab.executors_four.Server_2}
```yml
version: 2

jobs:
  build:

    # Primary container image where all commands run
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          TEST_DATABASE_URL: postgresql://postgres@localhost/circle_test

    # Service container image
      - image: cimg/postgres:9.6.24
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    steps:
      - checkout
      - run: sudo apt-get update
      - run: sudo apt-get install postgresql-client-9.6
      - run: whoami
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "CREATE TABLE test (name char(25));"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "INSERT INTO test VALUES ('John'), ('Joanna'), ('Jennifer');"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "SELECT * from test"
```

For more information on configuring databases, see the [Configuring Databases]({{site.baseurl}}/2.0/databases/) guide.

## Run Docker commands to build your Docker images
{: #run-docker-commands-to-build-your-docker-images }

Run Docker commands to build Docker images. Set up a remote Docker environment when your primary executor is Docker:

{:.tab.executors_five.Cloud}
```yml
version: 2.1

jobs:
  build:
    docker:
      - image: <primary-container-image>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      # ... steps for building/testing app ...

      - setup_remote_docker # sets up remote docker container in which all docker commands will be run

      - run:
          name: Start container and verify it's working
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```

{:.tab.executors_five.Server_3}
```yml
version: 2.1

jobs:
  build:
    docker:
      - image: <primary-container-image>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      # ... steps for building/testing app ...

      - setup_remote_docker # sets up remote docker container in which all docker commands will be run

      - run:
          name: Start container and verify it's working
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```

{:.tab.executors_five.Server_2}
```yml
version: 2

jobs:
  build:
    docker:
      - image: <primary-container-image>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      # ... steps for building/testing app ...

      - setup_remote_docker # sets up remote docker container in which all docker commands will be run

      - run:
          name: Start container and verify it's working
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```

For more information on building Docker images, see the [Building Docker Images]({{site.baseurl}}/2.0/building-docker-images/) guide.

## Tips for advanced configuration
{: #tips-for-advanced-configuration }

Here are a few tips for optimization and maintaining a clear configuration file.

- Avoid using large inline bash scripts, especially if used across many jobs. Consider moving large bash scripts into your repo to clean up your config and improve readability.
- [Workspaces]({{site.baseurl}}/2.0/workflows/#using-workspaces-to-share-data-among-jobs) can be used to copy external scripts between jobs if you don't want to do a full checkout.
- Move the quickest jobs up to the start of your workflows. For example, lint or syntax checking should happen before longer-running, more computationally expensive jobs.
- Using a "setup" job at the _start_ of a workflow can be helpful to do some preflight checks and populate a workspace for all the following jobs.


## See also
{: #see-also }

[Optimizations]({{ site.baseurl }}/2.0/optimizations/)
