---
layout: classic-docs
title: "CircleCI での Python アプリケーションの構成"
short-title: "Python"
description: "CircleCI 上での Python による継続的インテグレーション"
categories:
  - language-guides
order: 7
version:
  - Cloud
  - Server v2.x
---

ここでは、Python で記述されたサンプル アプリケーションを参考に、CircleCI を構成する方法について説明します。

* TOC
{:toc}

## 概要
{: #overview }

This guide uses a sample Django application to describe configuration best practices for Python applications building on CircleCI. The application is [hosted on GitHub](https://github.com/CircleCI-Public/circleci-demo-python-django) and is [building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-python-django){:rel="nofollow"}.

Consider [forking the repository](https://help.github.com/articles/fork-a-repo/) and rewriting [the configuration file](https://github.com/CircleCI-Public/circleci-demo-python-django/blob/master/.circleci/config.yml) as you follow this guide.

## Configuration walkthrough
{: #configuration-walkthrough }

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/). Follow the steps below to create a complete `config.yml` file.

### Specify a version
{: #specify-a-version }

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key. This key is used to issue warnings about breaking changes.

```yaml
version: 2
```

### Create a build job
{: #create-a-build-job }

A run is comprised of one or more [jobs]({{ site.baseurl }}/2.0/configuration-reference/#jobs). Because this run does not use [workflows]({{ site.baseurl }}/2.0/configuration-reference/#workflows), it must have a `build` job.

Use the [`working_directory`]({{ site.baseurl }}/2.0/configuration-reference/#job_name) key to specify where a job's [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) run. By default, the value of `working_directory` is `~/project`, where `project` is a literal string.

```yaml
version: 2
jobs:
  build:  # ワークフローを使用しない実行に必要です
    working_directory: ~/circleci-demo-python-django
```

### Choose an executor type
{: #choose-an-executor-type }

The steps of a job occur in a virtual environment called an [executor]({{ site.baseurl }}/2.0/executor-types/).

In this example, the [`docker`]({{ site.baseurl }}/2.0/configuration-reference/#docker) executor is used to specify a custom Docker image. The first image listed becomes the job's [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container). All commands for a job execute in this container.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.4  # primary container for the build job
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

**Note:** `circleci/python:3.6.4` is a [convenience image]({{ site.baseurl }}/2.0/circleci-images/) provided by CircleCI. These images are extensions of official Docker images and include tools useful for CI/CD environments.

### Add other services and set environment variables
{: #add-other-services-and-set-environment-variables }

Specify additional containers for services like databases. Use the [`environment`]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-container) key to set environment variables for all commands in a container.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.4 # 各ジョブで Docker Executor のイメージを定義する必要があり、後続のジョブでは別のイメージを定義できます
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          PIPENV_VENV_IN_PROJECT: true
          DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.2 # an example of how to specify a service container
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
```

### Install dependencies
{: #install-dependencies }

After choosing containers for a job, create [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) to run specific commands.

Use the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step to check out source code. By default, source code is checked out to the path specified by `working_directory`.

Use the [`run`]({{ site.baseurl }}/2.0/configuration-reference/#run) step to execute bash commands. In this example, [Pipenv](https://pipenv.readthedocs.io/en/latest/) is used to create a virtual environment and install Python packages.

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      - checkout  # ソース コードを作業ディレクトリにチェックアウトします
      - run:
          command: |  # Pipenv を使用して依存関係をインストールします
            sudo pip install pipenv
            pipenv install
```

### Cache dependencies
{: #cache-dependencies }

To save time between runs, consider [caching dependencies or source code]({{ site.baseurl }}/2.0/caching/).

Use the [`save_cache`]({{ site.baseurl }}/2.0/configuration-reference/#save_cache) step to cache certain files or directories. In this example, the virtual environment and installed packages are cached.

Use the [`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) step to restore cached files or directories.

{% raw %}

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      - checkout
      - run: sudo chown -R circleci:circleci /usr/local/bin
      - run: sudo chown -R circleci:circleci /usr/local/lib/python3.6/site-packages
      - restore_cache:  # このステップは依存関係をインストールする*前*に実行します
          key: deps9-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
      - run:
          command: |
            sudo pip install pipenv
            pipenv install
      - save_cache:
          key: deps9-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
          paths:
            - ".venv"
            - "/usr/local/bin"
            - "/usr/local/lib/python3.6/site-packages"
```

{% endraw %}

**Note:** Use the `chown` command to grant CircleCI access to dependency locations.

### Run tests
{: #run-tests }

Use the `run` step to run your test suite.

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      # ...
      - run:
        command: |
          pipenv run python manage.py test
```

### Upload and store test results
{: #upload-and-store-test-results }

Use the [`store_test_results`]({{ site.baseurl }}/2.0/configuration-reference/#store_test_results) step to upload test results to CircleCI. These results will display in the **Test Summary** section of the CircleCI application.

Use the [`store_artifacts`]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) step to save test results as artifacts.

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      # ...
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: test-results
          destination: tr1
```

### Deploy application
{: #deploy-application }

This Django application is not deployed anywhere. See the [Flask Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/) or the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for deploy examples.

## Full configuration file
{: #full-configuration-file }

{% raw %}

```yaml
version: 2 # use CircleCI 2.0
jobs: # A basic unit of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    # directory where steps are run
    working_directory: ~/circleci-demo-python-django
    docker: # run the steps with Docker
      # CircleCI Python images available at: https://hub.docker.com/r/circleci/python/
      - image: circleci/python:3.6.4
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment: # environment variables for primary container
          PIPENV_VENV_IN_PROJECT: true
          DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: circleci/postgres:9.6.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment: # environment variables for the Postgres container.
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
    steps: # steps that comprise the `build` job
      - checkout # check out source code to working directory
      - run: sudo chown -R circleci:circleci /usr/local/bin
      - run: sudo chown -R circleci:circleci /usr/local/lib/python3.6/site-packages
      - restore_cache:
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          key: deps9-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
      - run:
          command: |
            sudo pip install pipenv
            pipenv install
      - save_cache: # cache Python dependencies using checksum of Pipfile as the cache-key
          key: deps9-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
          paths:
            - "venv"
      - run:
          command: |
            pipenv run python manage.py test
      - store_test_results: # Upload test results for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: test-results
      - store_artifacts: # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: test-results
          destination: tr1
```

{% endraw %}

## See also
{: #see-also }

- 他の言語ガイドについては、「[チュートリアル]({{ site.baseurl }}/2.0/tutorials/)」を参照してください。
