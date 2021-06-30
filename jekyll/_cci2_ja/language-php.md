---
layout: classic-docs
title: "言語ガイド: PHP"
short-title: "PHP"
description: "CircleCI 2.0 での PHP を使用したビルドとテスト"
categories:
  - language-guides
order: 6
version:
  - Cloud
  - Server v2.x
---

ここでは、PHP サンプル アプリケーションの [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルを作成する方法を詳細に説明します。

* TOC
{:toc}

## クイックスタート: デモ用の PHP Laravel リファレンス プロジェクト
{: #quickstart-demo-php-laravel-reference-project }

We maintain a reference PHP Laravel project to show how to build PHP on CircleCI 2.0:

- <a href="https://github.com/CircleCI-Public/circleci-demo-php-laravel" target="_blank">GitHub 上の PHP Laravel デモ プロジェクト</a>
- [CircleCI でビルドされたデモ PHP Laravel プロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-php-laravel){:rel="nofollow"}

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-php-laravel/blob/circleci-2.0/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>. This file shows best practice for using CircleCI 2.0 with PHP projects.

## Pre-built CircleCI Docker images
{: #pre-built-circleci-docker-images }

We recommend using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the PHP version you need from [Docker Hub](https://hub.docker.com/r/circleci/php/). The demo project uses an official CircleCI image.

Database images for use as a secondary 'service' container are also available.

## Build the demo PHP project yourself
{: #build-the-demo-php-project-yourself }

A good way to start using CircleCI is to build a project yourself. Here's how to build the demo project with your own account:

1. GitHub 上のプロジェクトをお使いのアカウントにフォークします。
2. CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、フォークしたプロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。

---

## Sample configuration
{: #sample-configuration }

Following is the commented `.circleci/config.yml` file in the demo project.

{% raw %}
```yaml
version: 2 # use CircleCI 2.0

jobs: # a collection of steps
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      - image: circleci/php:7.1-node-browsers # ...with this image as the primary container; this is where all `steps` will run
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: ~/laravel # directory where steps will run
    steps: # a set of executable commands
      - checkout # special step to check out source code to working directory
      - run: sudo apt install -y libsqlite3-dev zlib1g-dev
      - run: sudo docker-php-ext-install zip
      - run: sudo composer self-update
      - restore_cache: # special step to restore the dependency cache if `composer.lock` does not change
          keys:
            - composer-v1-{{ checksum "composer.lock" }}
            # fallback to using the latest cache if no exact match is found (See https://circleci.com/docs/2.0/caching/)
            - composer-v1-
      - run: composer install -n --prefer-dist
      - save_cache: # special step to save the dependency cache with the `composer.lock` cache key template
          key: composer-v1-{{ checksum "composer.lock" }}
          paths:
            - vendor
      - restore_cache: # special step to restore the dependency cache if `package-lock.json` does not change
          keys:
            - node-v1-{{ checksum "package-lock.json" }}
            # fallback to using the latest cache if no exact match is found (See https://circleci.com/docs/2.0/caching/)
            - node-v1-
      - run: yarn install
      - save_cache: # special step to save the dependency cache with the `package-lock.json` cache key template
          key: node-v1-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      - run: touch storage/testing.sqlite
      - run: php artisan migrate --env=testing --database=sqlite_testing --force
      - run: ./vendor/bin/codecept build
      - run: ./vendor/bin/codecept run
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples
```
{% endraw %}

## Config walkthrough
{: #config-walkthrough }

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key. This key is used to issue warnings about breaking changes.

```yaml
version: 2
```


A run is comprised of one or more [jobs]({{ site.baseurl }}/2.0/configuration-reference/#jobs). Because this run does not use [workflows]({{ site.baseurl }}/2.0/configuration-reference/#workflows), it must have a `build` job.

Use the [`working_directory`]({{ site.baseurl }}/2.0/configuration-reference/#job_name) key to specify where a job's [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) run. By default, the value of `working_directory` is `~/project`, where `project` is a literal string.

The steps of a job occur in a virtual environment called an [executor]({{ site.baseurl }}/2.0/executor-types/).

In this example, the [`docker`]({{ site.baseurl }}/2.0/configuration-reference/#docker) executor is used to specify a custom Docker image. We use the [CircleCI-provided PHP docker image](https://circleci.com/docs/2.0/circleci-images/#php) which includes browser tooling.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7.1-node-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: ~/laravel
```

Next, we'll run a series of commands under the `steps:` key. Below we install some PHP tooling allowing up to manage our dependencies.

{% raw %}
```yaml
    steps:
      - checkout
      - run: sudo apt install -y libsqlite3-dev zlib1g-dev
      - run: sudo docker-php-ext-install zip
      - run: sudo composer self-update
```
{% endraw %}

The next set of steps for the config are all related to dependency management and caching. The sample project caches both PHP dependencies and JavaScript dependencies.

Use the [`save_cache`]({{ site.baseurl }}/2.0/configuration-reference/#save_cache) step to cache certain files or directories. In this example, the cache key will be based on a checksum of the `composer.lock` file, but will fall back to using a more generic cache key.

Use the [`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) step to restore cached files or directories.


{% raw %}
```yaml
      - restore_cache:
          keys:
            - composer-v1-{{ checksum "composer.lock" }}
            - composer-v1-
      - run: composer install -n --prefer-dist
      - save_cache:
          key: composer-v1-{{ checksum "composer.lock" }}
          paths:
            - vendor
      - restore_cache:
          keys:
            - node-v1-{{ checksum "package-lock.json" }}
            - node-v1-
      - run: yarn install
      - save_cache:
          key: node-v1-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
```
{% endraw %}

Finally, we will set up a test database with Sqlite, run migrations and run tests.

```yaml
      - run: touch storage/testing.sqlite
      - run: php artisan migrate --env=testing --database=sqlite_testing --force
      - run: ./vendor/bin/codecept build
      - run: ./vendor/bin/codecept run
```

---

Success! You just set up CircleCI 2.0 for a PHP app. Check out our project’s [Job page](https://circleci.com/gh/CircleCI-Public/circleci-demo-php-laravel){:rel="nofollow"} to see how this looks when building on CircleCI.

## See also
{: #see-also }
{:.no_toc}

- デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/2.0/deployment-integrations/)」を参照してください。

- その他のパブリック PHP プロジェクトの構成例については、「[CircleCI 設定ファイルのサンプル]({{ site.baseurl }}/2.0/examples/)」を参照してください。

- CircleCI 2.0 を初めて使用する場合は、[プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/project-walkthrough/)に目を通すことをお勧めします。 ここでは、Python と Flask を使用した構成を例に詳しく解説しています。
