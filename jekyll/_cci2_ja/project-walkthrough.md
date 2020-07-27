---
layout: classic-docs
title: "2.0 プロジェクトのチュートリアル"
short-title: "プロジェクトのチュートリアル"
description: "CircleCI 2.0 での Flask プロジェクトのチュートリアルと設定例"
categories:
  - migration
order: 3
---

このチュートリアルのデモアプリケーションでは、バックエンド用に Python と Flask を使用し、 データベース用に PostgreSQL を使用します。

- 目次
{:toc}

以下の各セクションでは、デモアプリケーション用にジョブとステップを設定する方法、CircleCI 環境で Selenium と Chrome を使用して単体テストおよびインテグレーションテストを実行する方法、デモアプリケーションを Heroku にデプロイする方法について詳しく説明します。

デモアプリケーションのソースは、GitHub の <https://github.com/CircleCI-Public/circleci-demo-python-flask> で入手できます。 また、このサンプルアプリケーションは、<https://circleci-demo-python-flask.herokuapp.com/> で入手できます。

## 基本的なセットアップ

{:.no_toc}

[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルは、複数の[`ジョブ`]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)で構成されている場合があります。 この例では、`build` という名前のジョブが 1つ含まれています。 1つのジョブは複数の [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) で構成されます。steps とは、ファイル内の最初の [`image:`](https://circleci.com/docs/ja/2.0/configuration-reference/#image) キーで定義されたコンテナ内で実行されるコマンドです。 この最初のイメージは、*プライマリコンテナ*とも呼ばれます。

以下は、CircleCI デモプロジェクトの最小構成の例です。すべての設定が `build` ジョブの下にネストされています。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
    steps:
      - checkout
      - run: pip install -r requirements/dev.txt
```

**メモ：**`.circleci/config.yml` 内で[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows)を使用**しない**場合、以下を含む `build` という名前のジョブを記述している必要があります。

- 基盤となるテクノロジーの Executor。上記の例では `docker` として定義されています。
- イメージは Docker イメージです。上記の例では、CircleCI によって提供される Debian Stretch 上の Python 3.6.2 を含み、テストをサポートするためにブラウザーがインストールされています。 
- 必須の `checkout` ステップで始まり、その後 `run:` キーが続く steps。プライマリコンテナ上でコマンドが順次実行されます。

## サービスコンテナ

ジョブでデータベースなどのサービスが必要な場合は、`docker:` スタンザに `image:` をリストすることで、追加コンテナとしてサービスを実行できます。

Docker イメージは通常、環境変数を使用して設定されています。必要であれば、コンテナに渡す環境変数のセットも利用できます。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
```

*プライマリコンテナ*の環境変数は、Flask フレームワークに固有のコンフィグを設定し、`circleci/postgres:9.6.5-alpine-ram` サービスコンテナで実行されるデータベースを参照するデータベース URL も設定します。 `localhost` では PostgreSQL データベースが使用可能です。

`circleci/postgres:9.6.5-alpine-ram` サービスコンテナが、パスワードが空の `root` という名前のユーザー、および `circle_test` という名前のデータベースで設定されています。

## 依存関係のインストール

次にジョブは、`pip install` を実行することにより、Python の依存関係を*プライマリコンテナ*にインストールします。 依存関係は、以下のシェルコマンドを実行する通常の steps を実行することにより、*プライマリコンテナ*にインストールされます。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - run:
          name: Python deps を venv にインストール
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

{:.no_toc}

ジョブを高速化するために、デモの設定では、Python virtualenv を CircleCI キャッシュに置き、`pip install` を実行する前にそのキャッシュを復元します。 先に virtualenv をキャッシュに置いておけば、依存関係が既に存在するため、`pip install` コマンドは依存関係を virtualenv にダウンロードする必要がありません。 virtualenv をキャッシュに保存するには、`pip install` コマンドの後に実行される `save_cache` ステップを使用して実行します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - restore_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Python deps を venv にインストール
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements/dev.txt
      - save_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
          paths:
            - "venv"
```

以下で、追加のキー変数について詳しく説明します。

- `restore_cache:` ステップでは、キーテンプレートに一致するキーを持つキャッシュを検索します。 キーテンプレートは `deps1-` で始まり、`{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}` を使用して現在のブランチ名が埋め込まれています。 `requirements.txt` ファイルのチェックサムも、`{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}` を使用してキーテンプレートに埋め込まれています。 CircleCI は、テンプレートに一致する最新のキャッシュを復元します。このとき、キャッシュが保存されたブランチ、およびキャッシュされた virtualenv の作成に使用された `requirements/dev.txt` ファイルのチェックサムが一致する必要があります。

- `Python deps を venv にインストール`という名前の `run:` ステップは、前述のとおり、Python の依存関係をインストールする仮想環境を作成してアクティブ化します。

- `save_cache:` ステップは、指定されたパス (この例では `venv`) からキャッシュを作成します。 キャッシュキーは、`key:` で指定したテンプレートから作成されます。 このとき、CircleCI で保存されたキャッシュが `restore_cache:` ステップで検出できるように、必ず `restore_cache:` ステップと同じテンプレートを使用してください。 キャッシュを保存する前に、CircleCI はテンプレートからキャッシュキーを生成します。生成されたキーに一致するキャッシュが既に存在する場合、CircleCI は新しいキャッシュを保存しません。 テンプレートにはブランチ名と `requirements/dev.txt` のチェックサムが含まれるため、ジョブが別のブランチで実行されるか、`requirements/dev.txt` のチェックサムが変化すると、CircleCI は新しいキャッシュを作成します。

キャッシュの詳細については、[こちらのドキュメント]({{ site.baseurl }}/ja/2.0/caching)をご覧ください。

## Selenium のインストール・実行によるブラウザーテストの自動化

デモアプリケーションには、Chrome、Selenium、および WebDriver を使用して Web ブラウザー内でアプリケーションのテストを自動化する `tests/test_selenium.py` ファイルが含まれています。 プライマリイメージには、動作が安定した最新バージョンの Chrome がプリインストールされています (`-browsers` サフィックスで指定されています)。 Selenium はプライマリイメージに含まれていないため、インストールして実行する必要があります。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Selenium をダウンロード
          command: |
            curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Selenium を起動
          command: |
            java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

## テストの実行

このデモアプリケーションでは、仮想の Python 環境が準備されており、unittest を使用してテストが実行されます。 テスト結果を XML ファイルとして保存するために、`unittest-xml-reporting` を使用します。 レポートと結果は `store_artifacts` ステップと `store_test_results` ステップで保存されます。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Selenium をダウンロード
          command: |
            curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Selenium を起動
          command: |
            java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
      - restore_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Python deps を venv にインストール
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

- 各コマンドは新しいシェルで実行されます。したがって、依存関係のインストールステップでアクティブ化された仮想環境は、この最終 `run:` キーの `. venv/bin/activate` で再度アクティブ化されます。 
- `store_artifacts` ステップは特別なステップです。 `path:` は、ファイルが格納されるディレクトリをプロジェクトの `root` ディレクトリからの相対ディレクトリで指定します。 `destination:` は、ジョブ内の別のステップで同じ名前のディレクトリにアーティファクトが生成される場合に、一意性を確保するために選択されるプレフィックスを指定します。 CircleCI は、アーティファクトを収集し、S3 にアップロードして格納します。
- ジョブが完了すると、アーティファクトは CircleCI の [Artifacts (アーティファクト)] タブに表示されます。

![CircleCI 上のアーティファクト]({{ site.baseurl }}/assets/img/docs/walkthrough7.png)

- 結果ファイルのパスは、プロジェクトの `root` ディレクトリからの相対パスです。 デモアプリケーションでは、アーティファクトの格納に使用されたものと同じディレクトリを使用していますが、別のディレクトリも使用できます。 ジョブが完了すると、CircleCI でテストタイミングが分析され、[Test Summary (テストサマリー)] タブに概要が表示されます。

![テスト結果の概要]({{ site.baseurl }}/assets/img/docs/walkthrough8.png)

詳しくは、[ビルドアーティファクトの保存]({{ site.baseurl}}/ja/2.0/artifacts/)および「[テストメタデータの収集]({{ site.baseurl}}/ja/2.0/collect-test-data/)」を参照してください。

## Heroku へのデプロイ

このデモの `.circleci/config.yml`には、`master` ブランチを Heroku にデプロイする `deploy` ジョブが含まれています。 `deploy` ジョブは、1つの `checkout` ステップと 1つの `command` で構成されています。 `command` は、以下が準備されていることを前提としています。

- Heroku アカウントが作成されている
- Heroku アプリケーションが作成されている
- `HEROKU_APP_NAME` と `HEROKU_API_KEY` の環境変数が設定されている

上記のいずれか 1つでも満たしていない場合には、デプロイに関するドキュメントの「[Heroku]({{ site.baseurl }}/ja/2.0/deployment-integrations/#heroku)」セクションの手順を実行してください。

**メモ：**このデモプロジェクトをフォークする場合は、Heroku プロジェクトの名前を変更すると、このチュートリアルで使用する名前空間と干渉しないように Heroku をデプロイできます。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - restore_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Python deps を venv にインストール
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
          name: Master を Heroku にデプロイ
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
```

<<https://circleci.com/gh/CircleCI-Public/circleci-demo-python-flask/23>{:rel="nofollow"}> でデモアプリケーションをビルドしてデプロイするまでのプロセスを確認できます。

### Heroku に関するその他の設定

{:.no_toc}

デモアプリケーションは、`config.py` と `manage.py` の設定内容に基づき、Heroku 上で実行されるように設定されています。 この 2つのファイルはアプリケーションに対して、実稼働設定を使用し、PostgreSQL データベースを移行し、Heroku 上で SSL を使用するように指示します。

Heroku ではその他に以下のファイルが必要です。

- `Procfile`：Heroku にデモアプリケーションの実行方法を指示します。
- `runtime.txt`：Heroku に、デフォルト (Python 2.7.13) の代わりに Python 3.6.0 を使用するように指示します。
- `requirements.txt`：このファイルが存在する場合、Heroku は Python の依存関係を自動的にインストールします。

**Heroku の環境用にアプリケーションを設定するには、[Heroku のドキュメント](https://devcenter.heroku.com/start)を参照してください。**

実際にデプロイする前に、以下のコマンドを使用して Heroku 上にこのデモアプリケーションを手動でビルドできます。

    heroku create circleci-demo-python-flask # これを一意の名前に置き換えます
    heroku addons:create heroku-postgresql:hobby-dev
    heroku config:set FLASK_CONFIG=heroku
    git push heroku master
    heroku run python manage.py deploy
    heroku restart
    

## Workflows を使用したデプロイの自動化

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

      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - restore_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Python deps を venv にインストール
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
          name: Master を Heroku にデプロイ
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
```

## 関連項目

{:.no_toc}

Workflows の詳細については、「[ジョブの実行を Workflow で制御する]({{ site.baseurl }}/ja/2.0/workflows)」を参照してください。
