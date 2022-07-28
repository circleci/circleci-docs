---
layout: classic-docs
title: "2.0 プロジェクトのチュートリアル"
short-title: "プロジェクトのチュートリアル"
description: "CircleCI  での Flask プロジェクトのチュートリアルと設定例"
categories:
  - 移行
order: 3
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このチュートリアルのデモ アプリケーションでは、バックエンド用に Python と Flask を使用し、 データベース用に PostgreSQL を使用します。 データベース用に PostgreSQL を使用します。

* TOC
{:toc}

以下の各セクションでは、デモ アプリケーション用にジョブとステップを設定する方法、CircleCI 環境で Selenium と Chrome を使用して単体テストおよびインテグレーション テストを実行する方法、デモ アプリケーションを Heroku にデプロイする方法について詳しく説明します。

デモ アプリケーションのソースは、GitHub の <https://github.com/CircleCI-Public/circleci-demo-python-flask> で入手できます。 また、このサンプル アプリケーションは、<https://circleci-demo-python-flask.herokuapp.com/> で入手できます。

## 基本的なセットアップ
{: #basic-setup }
{:.no_toc}

通常、[`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) ファイルは、複数の[`ジョブ`]({{ site.baseurl }}/ja/configuration-reference/#jobs)で構成されます。 この例では、`build` という名前のジョブが 1 つ含まれています。 1 つのジョブは複数の [`steps`]({{ site.baseurl }}/ja/configuration-reference/#steps) で構成されます。steps とは、ファイル内の最初の [`image:`]({{site.baseurl}}/ja/configuration-reference/#image) キーで定義されたコンテナ内で実行されるコマンドです。 この最初のイメージは、*プライマリコンテナ*とも呼ばれます。

以下は、CircleCI デモプロジェクトの最もシンプルな例です。すべての設定が `build` ジョブの下にネストされています。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cimg/python:3.6.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: pip install -r requirements/dev.txt
```

**注:** `.circleci/config.yml` 内で[ワークフロー]({{ site.baseurl }}/ja/workflows)を**使用しない**場合、以下を含む `build` という名前のジョブを記述している必要があります。

- 上記の例では `docker` として定義されています。
- イメージは Docker イメージです。 上記の例では、CircleCI によって提供される Debian Stretch 上の Python 3.6.2 を含み、テストをサポートするためにブラウザーがインストールされています。
- 必須の `checkout` ステップで始まり、その後 `run:` キーが続く steps。 プライマリ コンテナ上でコマンドが順次実行されます。

## サービス コンテナ
{: #service-containers }

ジョブでデータベースなどのサービスが必要な場合は、`docker:` スタンザに `image:` をリストすることで、追加コンテナとしてサービスを実行できます。

Docker イメージは通常、環境変数を使用して設定されています。必要であれば、コンテナに渡す環境変数のセットも利用できます。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cimg/python:3.6.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      - image: cimg/postgres:14.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: testuser
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
```

*プライマリ コンテナ*の環境変数は、Flask フレームワークに固有の設定ファイルを設定し、`circleci/postgres:9.6.5-alpine-ram` サービス コンテナで実行されるデータベースを参照するデータベース URL も設定します。 `localhost` では PostgreSQL データベースが使用可能です。

`circleci/postgres:9.6.5-alpine-ram` サービス コンテナが、パスワードが空の `root` という名前のユーザー、および `circle_test` という名前のデータベースで設定されています。

## 依存関係のインストール
{: #installing-dependencies }

次に、ジョブは `pip install` を実行することにより、Python の依存関係を*プライマリ コンテナ*にインストールします。 依存関係は、以下のシェル コマンドを実行する通常の steps を実行することにより、*プライマリ コンテナ*にインストールされます。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cimg/python:3.6.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: cimg/postgres:14.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: testuser
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

たとえば以下のように、`run:` キーで定義した環境変数は、イメージレベルの変数よりも優先されます。

```yaml
      - run:
          command: echo ${FLASK_CONFIG}
          environment:
            FLASK_CONFIG: staging
```

### 依存関係のキャッシュ
{: #caching-dependencies }
{:.no_toc}

ジョブを高速化するために、デモの設定では、Python virtualenv を CircleCI キャッシュに置き、`pip install` を実行する前にそのキャッシュを復元します。 先に virtualenv をキャッシュに置いておけば、依存関係が既に存在するため、`pip install` コマンドは依存関係を virtualenv にダウンロードする必要がありません。 virtualenv をキャッシュに保存するには、`pip install` コマンドの後に実行される `save_cache` ステップを使用して実行します。

{% raw %}
```yaml
version: 2
jobs:
  build:
    docker:
      - image: cimg/python:3.6.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: cimg/postgres:9.6.5
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
          key: deps1-{{ .Branch }}-{{ checksum "requirements/dev.txt" }}
      - run:
          name: Install Python deps in a venv
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements/dev.txt
      - save_cache:
          key: deps1-{{ .Branch }}-{{ checksum "requirements/dev.txt" }}
          paths:
            - "venv"
```
{% endraw %}

以下で、追加のキー変数について詳しく説明します。

- `restore_cache:` ステップでは、キー テンプレートに一致するキーを持つキャッシュを検索します。 キー テンプレートは `deps1-` で始まり、`{% raw %}{{ .Branch }}{% endraw %}` を使用して現在のブランチ名が埋め込まれています。 `requirements.txt` ファイルのチェックサムも、`{% raw %}{{ checksum "requirements/dev.txt" }}{% endraw %}` を使用してキー テンプレートに埋め込まれています。 CircleCI は、テンプレートに一致する最新のキャッシュを復元します。 このとき、キャッシュが保存されたブランチ、およびキャッシュされた virtualenv の作成に使用された `requirements/dev.txt` ファイルのチェックサムが一致する必要があります。

- `Python deps を venv にインストール`という名前の `run:` ステップは、前述のとおり、Python の依存関係をインストールする仮想環境を作成してアクティブ化します。

- `save_cache:` ステップは、指定されたパス (この例では `venv`) からキャッシュを作成します。 キャッシュキーは、`key:` で指定したテンプレートから作成されます。 このとき、CircleCI で保存されたキャッシュが `restore_cache:` ステップで検出できるように、必ず `restore_cache:` ステップと同じテンプレートを使用してください。 キャッシュを保存する前に、CircleCI はテンプレートからキャッシュ キーを生成します。 生成されたキーに一致するキャッシュが既に存在する場合、CircleCI は新しいキャッシュを保存しません。 テンプレートにはブランチ名と `requirements/dev.txt` のチェックサムが含まれるため、ジョブが別のブランチで実行されるか、`requirements/dev.txt` のチェックサムが変化すると、CircleCI は新しいキャッシュを作成します。

キャッシュの詳細については、[こちらのドキュメント]({{ site.baseurl }}/ja/caching)をご覧ください。

## Selenium のインストールと実行によるブラウザーテストの自動化
{: #installing-and-running-selenium-to-automate-browser-testing }

デモ アプリケーションには、Chrome、Selenium、および WebDriver を使用して Web ブラウザー内でアプリケーションのテストを自動化する `tests/test_selenium.py` ファイルが含まれています。 プライマリイメージには、動作が安定した最新バージョンの Chrome がプリインストールされています (`-browsers` サフィックスで指定されています)。 Selenium はプライマリイメージに含まれていないため、インストールして実行する必要があります。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cimg/python:3.6.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: cimg/postgres:9.6.5
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

## テストの実行
{: #running-tests }

このデモ アプリケーションでは、仮想の Python 環境が準備されており、unittest を使用してテストが実行されます。 テスト結果を XML ファイルとして保存するために、`unittest-xml-reporting` を使用します。 レポートと結果は `store_artifacts` ステップと `store_test_results` ステップで保存されます。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cimg/python:3.6.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: cimg/postgres:9.6.5
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

追加されたキーに関するメモ

- 各コマンドは新しいシェルで実行されます。 したがって、依存関係のインストール ステップでアクティブ化された仮想環境は、この最終 `run:` キーの `. venv/bin/activate` で再度アクティブ化されます。
- `store_artifacts` ステップは特別なステップです。 `path:` は、ファイルが格納されるディレクトリをプロジェクトの `root` ディレクトリからの相対ディレクトリで指定します。 `destination:` は、ジョブ内の別のステップで同じ名前のディレクトリにアーティファクトが生成される場合に、一意性を確保するために選択されるプレフィックスを指定します。 CircleCI は、アーティファクトを収集し、S3 にアップロードして格納します。
- ジョブが完了すると、アーティファクトは CircleCI の [Artifacts (アーティファクト)] タブに表示されます。

![CircleCI 上のアーティファクト]({{ site.baseurl }}/assets/img/docs/walkthrough7.png)

- 結果ファイルのパスは、プロジェクトの `root` ディレクトリからの相対パスです。 デモ アプリケーションでは、アーティファクトの格納に使用されたものと同じディレクトリを使用していますが、別のディレクトリも使用できます。 ジョブが完了すると、CircleCI でテスト タイミングが分析され、[Test Summary (テスト サマリー)] タブに概要が表示されます。

![テスト結果の概要]({{ site.baseurl }}/assets/img/docs/walkthrough8.png)

詳しくは、「[ビルド アーティファクトの保存]({{ site.baseurl }}/ja/artifacts/)および「[テスト メタデータの収集]({{ site.baseurl }}/ja/collect-test-data/)」を参照してください。

## Heroku へのデプロイ
{: #deploying-to-heroku }

このデモの `.circleci/config.yml`には、`master` ブランチを Heroku にデプロイする `deploy` ジョブが含まれています。 `deploy` ジョブは、1 つの `checkout` ステップと 1 つの `command` で構成されています。 `command` は、以下が準備されていることを前提としています。

- Heroku アカウントが作成されている
- Heroku アプリケーションが作成されている
- `HEROKU_APP_NAME` と `HEROKU_API_KEY` の環境変数が設定されている

If you have not completed any or all of these steps, follow the [instructions]({{site.baseurl}}/deploy-to-heroku)

**メモ:** このデモ プロジェクトをフォークする場合は、Heroku プロジェクトの名前を変更すると、このチュートリアルで使用する名前空間と干渉しないように Heroku をデプロイできます。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cimg/python:3.6.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: cimg/postgres:9.6.5
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
          name: Deploy Master to Heroku
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
```

<[https://circleci.com/gh/CircleCI-Public/circleci-demo-python-flask/23](https://circleci.com/gh/CircleCI-Public/circleci-demo-python-flask/23){:rel="nofollow"}> でデモ アプリケーションをビルドしてデプロイするまでのプロセスを確認できます。

### Heroku に関するその他の設定
{: #additional-heroku-configuration }
{:.no_toc}

デモ アプリケーションは、`config.py` と `manage.py` の設定内容に基づき、Heroku 上で実行されるように設定されています。 この 2 つのファイルはアプリケーションに対して、本番設定を使用し、PostgreSQL データベースを移行し、Heroku 上で SSL を使用するように指示します。

Heroku ではその他に以下のファイルが必要です。

- `Procfile`: Heroku にデモ アプリケーションの実行方法を指示します。
- `runtime.txt`: Heroku に、デフォルト (Python 2.7.13) の代わりに Python 3.6.0 を使用するように指示します。
- `requirements.txt`: このファイルが存在する場合、Heroku は Python の依存関係を自動的にインストールします。

**Heroku の環境用にアプリケーションを設定するには、[Heroku のドキュメント](https://devcenter.heroku.com/start)を参照してください。**

実際にデプロイする前に、以下のコマンドを使用して Heroku 上にこのデモ アプリケーションを手動でビルドできます。

```bash
heroku create circleci-demo-python-flask # これを一意の名前に置き換えます
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set FLASK_CONFIG=heroku
git push heroku master
heroku run python manage.py deploy
heroku restart
```

## ワークフローを使用したデプロイの自動化
{: #using-workflows-to-automatically-deploy }

`master` のビルドが成功した後、Heroku に自動的に `master` をデプロイするには、`workflows` セクションを追加して `build` ジョブと `deploy` ジョブをリンクさせます。

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
      - image: cimg/python:3.6.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: cimg/postgres:9.6.5
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
          name: Deploy Master to Heroku
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
```

## 関連項目
{: #see-also }
{:.no_toc}

ワークフローの詳細については、「[ワークフローを使用したジョブのスケジュール]({{ site.baseurl }}/ja/workflows)」を参照してください。
