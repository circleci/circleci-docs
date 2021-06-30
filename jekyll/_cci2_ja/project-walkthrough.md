---
layout: classic-docs
title: "2.0 プロジェクトのチュートリアル"
short-title: "プロジェクトのチュートリアル"
description: "CircleCI 2.0 での Flask プロジェクトのチュートリアルと構成例"
categories:
  - migration
order: 3
version:
  - Cloud
  - Server v2.x
---

このチュートリアルのデモ アプリケーションでは、バックエンド用に Python と Flask を使用し、 データベース用に PostgreSQL を使用します。 データベース用に PostgreSQL を使用します。

* TOC
{:toc}

以下の各セクションでは、デモ アプリケーション用にジョブとステップを構成する方法、CircleCI 環境で Selenium と Chrome を使用して単体テストおよびインテグレーション テストを実行する方法、デモ アプリケーションを Heroku にデプロイする方法について詳しく説明します。

The source for the demo application is available on GitHub: <https://github.com/CircleCI-Public/circleci-demo-python-flask>. The example app is available here: <https://circleci-demo-python-flask.herokuapp.com/>

## Basic setup
{: #basic-setup }
{:.no_toc}

The [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file may be comprised of several [`Jobs`]({{ site.baseurl }}/2.0/configuration-reference/#jobs). In this example we have one Job called `build`. In turn, a job is comprised of several [`Steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps), which are commands that execute in the container that is defined in the first [`image:`](https://circleci.com/docs/2.0/configuration-reference/#image) key in the file. This first image is also referred to as the *primary container*.

Following is a minimal example for our demo project with all configuration nested in the `build` job:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: pip install -r requirements/dev.txt
```

**Note:** If you are **not** using  [workflows]({{ site.baseurl }}/2.0/workflows) in your `.circleci/config.yml`, you must have a job named `build` that includes the following:

- 上記の例では `docker` として定義されています。
- イメージは Docker イメージです。 上記の例では、CircleCI によって提供される Debian Stretch 上の Python 3.6.2 を含み、テストをサポートするためにブラウザーがインストールされています。
- 必須の `checkout` ステップで始まり、その後 `run:` キーが続く steps。 プライマリ コンテナ上でコマンドが順次実行されます。

## Service containers
{: #service-containers }

If the job requires services such as databases they can be run as additional containers by listing more `image:`s in the `docker:` stanza.

Docker images are typically configured using environment variables, if these are necessary a set of environment variables to be passed to the container can be supplied:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
```

The environment variables for the *primary container* set some config specific to the Flask framework and set a database URL that references a database run in the `circleci/postgres:9.6.5-alpine-ram` service container. Note that the PostgreSQL database is available at `localhost`.

The `circleci/postgres:9.6.5-alpine-ram` service container is configured with a user called `root` with an empty password, and a database called `circle_test`.

## Installing dependencies
{: #installing-dependencies }

Next the job installs Python dependencies into the *primary container* by running `pip install`. Dependencies are installed into the *primary container* by running regular Steps executing shell commands:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - run:
          name: Install Python deps in a venv
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements/dev.txt
```

An environment variable defined in a `run:` key will override image-level variables, e.g.:

```yaml
      - run:
          command: echo ${FLASK_CONFIG}
          environment:
            FLASK_CONFIG: staging
```

### Caching dependencies
{: #caching-dependencies }
{:.no_toc}

To speed up the jobs, the demo configuration places the Python virtualenv into the CircleCI cache and restores that cache before running `pip install`. If the virtualenv was cached the `pip install` command will not need to download any dependencies into the virtualenv because they are already present. Saving the virtualenv into the cache is done using the `save_cache` step which runs after the `pip install` command.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - restore_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Install Python deps in a venv
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements/dev.txt
      - save_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
          paths:
            - "venv"
```

The following describes the detail of the added key values:

- `restore_cache:` ステップでは、キー テンプレートに一致するキーを持つキャッシュを検索します。 キー テンプレートは `deps1-` で始まり、`{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}` を使用して現在のブランチ名が埋め込まれています。 `requirements.txt` ファイルのチェックサムも、`{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}` を使用してキー テンプレートに埋め込まれています。 CircleCI は、テンプレートに一致する最新のキャッシュを復元します。 このとき、キャッシュが保存されたブランチ、およびキャッシュされた virtualenv の作成に使用された `requirements/dev.txt` ファイルのチェックサムが一致する必要があります。

- `Python deps を venv にインストール`という名前の `run:` ステップは、前述のとおり、Python の依存関係をインストールする仮想環境を作成してアクティブ化します。

- `save_cache:` ステップは、指定されたパス (この例では `venv`) からキャッシュを作成します。 キャッシュキーは、`key:` で指定したテンプレートから作成されます。 このとき、CircleCI で保存されたキャッシュが `restore_cache:` ステップで検出できるように、必ず `restore_cache:` ステップと同じテンプレートを使用してください。 キャッシュを保存する前に、CircleCI はテンプレートからキャッシュ キーを生成します。 生成されたキーに一致するキャッシュが既に存在する場合、CircleCI は新しいキャッシュを保存しません。 テンプレートにはブランチ名と `requirements/dev.txt` のチェックサムが含まれるため、ジョブが別のブランチで実行されるか、`requirements/dev.txt` のチェックサムが変化すると、CircleCI は新しいキャッシュを作成します。

You can read more about caching [here]({{ site.baseurl }}/2.0/caching).

## Installing and running Selenium to automate browser testing
{: #installing-and-running-selenium-to-automate-browser-testing }

The demo application contains a file `tests/test_selenium.py` that uses Chrome, Selenium and webdriver to automate testing the application in a web browser. The primary image has the current stable version of Chrome pre-installed (this is designated by the `-browsers` suffix). Selenium needs to be installed and run since this is not included in the primary image:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Download Selenium
          command: |
            curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Start Selenium
          command: |
            java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

## Running tests
{: #running-tests }

In the demo application, a virtual Python environment is set up, and the tests are run using unittest. This project uses `unittest-xml-reporting` for its ability to save test results as XML files. In this example, reports and results are stored in the `store_artifacts` and `store_test_results` steps.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Download Selenium
          command: |
            curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Start Selenium
          command: |
            java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
      - restore_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Install Python deps in a venv
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements/dev.txt
      - save_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
          paths:
            - "venv"
      - run:
          command: |
            . venv/bin/activate
            python manage.py test
      - store_artifacts:
          path: test-reports/
          destination: tr1
      - store_test_results:
          path: test-reports/
```

Notes on the added keys:

- 各コマンドは新しいシェルで実行されます。 したがって、依存関係のインストール ステップでアクティブ化された仮想環境は、この最終 `run:` キーの `. venv/bin/activate` で再度アクティブ化されます。
- `store_artifacts` ステップは特別なステップです。 `path:` は、ファイルが格納されるディレクトリをプロジェクトの `root` ディレクトリからの相対ディレクトリで指定します。 `destination:` は、ジョブ内の別のステップで同じ名前のディレクトリにアーティファクトが生成される場合に、一意性を確保するために選択されるプレフィックスを指定します。 CircleCI は、アーティファクトを収集し、S3 にアップロードして格納します。
- ジョブが完了すると、アーティファクトは CircleCI の [Artifacts (アーティファクト)] タブに表示されます。

![Artifacts on CircleCI]({{ site.baseurl }}/assets/img/docs/walkthrough7.png)

- 結果ファイルのパスは、プロジェクトの `root` ディレクトリからの相対パスです。 デモ アプリケーションでは、アーティファクトの格納に使用されたものと同じディレクトリを使用していますが、別のディレクトリも使用できます。 ジョブが完了すると、CircleCI でテスト タイミングが分析され、[Test Summary (テスト サマリー)] タブに概要が表示されます。

![Test Result Summary]({{ site.baseurl }}/assets/img/docs/walkthrough8.png)

Read more about [artifact storage]({{ site.baseurl }}/2.0/artifacts) and [test results]({{ site.baseurl }}/2.0/collect-test-data/).

## Heroku へのデプロイ
{: #deploying-to-heroku }

The demo `.circleci/config.yml` includes a `deploy` job to deploy the `master` branch to Heroku. The `deploy` job consists of a `checkout` step and a single `command`. The `command` assumes that you have:

- Heroku アカウントが作成されている
- Heroku アプリケーションが作成されている
- `HEROKU_APP_NAME` と `HEROKU_API_KEY` の環境変数が設定されている

If you have not completed any or all of these steps, follow the [instructions]({{ site.baseurl }}/2.0/deployment-examples/#heroku) in the Heroku section of the Deployment document.

**Note:** If you fork this demo project, rename the Heroku project, so you can deploy to Heroku without clashing with the namespace used in this tutorial.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - restore_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Install Python deps in a venv
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements/dev.txt
      - save_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
          paths:
            - "venv"
      - run:
          command: |
            . venv/bin/activate
            python manage.py test
      - store_artifacts:
          path: test-reports/
          destination: tr1
      - store_test_results:
          path: test-reports/
  deploy:
    steps:
      - checkout
      - run:
          name: Heroku への Master のデプロイ
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
```

Here's a passing build with deployment for the demo app: <[https://circleci.com/gh/CircleCI-Public/circleci-demo-python-flask/23](https://circleci.com/gh/CircleCI-Public/circleci-demo-python-flask/23){:rel="nofollow"}>

### Additional Heroku configuration
{: #additional-heroku-configuration }
{:.no_toc}

The demo application is configured to run on Heroku with settings provided in `config.py` and `manage.py`. These two files tell the app to use production settings, run migrations for the PostgreSQL database, and use SSL when on Heroku.

Other files required by Heroku are:

- `Procfile`: Heroku にデモ アプリケーションの実行方法を指示します。
- `runtime.txt`: Heroku に、デフォルト (Python 2.7.13) の代わりに Python 3.6.0 を使用するように指示します。
- `requirements.txt`: このファイルが存在する場合、Heroku は Python の依存関係を自動的にインストールします。

**Consult the [Heroku documentation](https://devcenter.heroku.com/start) to configure your own app for their environment.**

The following commands would be used to manually build the app on Heroku for this demo before actual deployment.

```
heroku create circleci-demo-python-flask # これを一意の名前に置き換えます
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set FLASK_CONFIG=heroku
git push heroku master
heroku run python manage.py deploy
heroku restart
```

## Using workflows to automatically deploy
{: #using-workflows-to-automatically-deploy }

To deploy `master` to Heroku automatically after a successful `master` build, add a `workflows` section that links the `build` job and the `deploy` job.

```yaml
workflows:
  version: 2
  build-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: master

version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - restore_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Install Python deps in a venv
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements/dev.txt
      - save_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
          paths:
            - "venv"
      - run:
          command: |
            . venv/bin/activate
            python manage.py test
      - store_artifacts:
          path: test-reports/
          destination: tr1
      - store_test_results:
          path: test-reports/
  deploy:
    steps:
      - checkout
      - run:
          name: Heroku への Master のデプロイ
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
```

## See also
{: #see-also }
{:.no_toc}

For more information about Workflows, see the [Orchestrating Workflows]({{ site.baseurl }}/2.0/workflows) document.
