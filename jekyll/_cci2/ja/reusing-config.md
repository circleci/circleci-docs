---
layout: classic-docs
title: "再利用可能な設定ファイル リファレンス ガイド"
short-title: "再利用可能な設定ファイル リファレンス ガイド"
description: "CircleCI 2.1 設定ファイルのリファレンス ガイド"
categories:
  - configuration
order: 1
version:
  - Cloud
---

このガイドでは、再利用可能なコマンド、ジョブ、Executor、Orb を利用する方法について説明します。 また、パラメーター化された再利用可能な要素を作成するためのパラメーターの使用方法についても取り上げます。

* 目次
{:toc}

## 再利用可能な設定ファイルに関する注意事項
{: #notes-on-reusable-configuration }
{:.no_toc}

* (任意) `circleci config process` コマンドにアクセスできるように、CircleCI CLI をインストールします 。 このコマンドを使用すると、再利用可能なキーを含む展開後の設定ファイルを確認できます。 インストール方法と詳しい使い方については、ドキュメント「[CircleCI のローカル CLI の使用]({{ site.baseurl }}/2.0/local-cli/)」を参照してください。

* CircleCI 設定ファイルの要素を再利用するには、**`version: 2.1`** の `.circleci/config.yml` ファイルを使用する必要があります。

* コマンド、ジョブ、Executor、パラメーターの名前はアルファベットで始める必要があります。名前に含めることができるのは小文字 (`a` ～ `z`)、数字 (`0` ～ `9`)、アンダースコア (`_`)、ハイフン (`-`) だけです。

## `parameters` 宣言の使用
{: #using-the-parameters-declaration }

パラメーターは、ジョブ、コマンド、または Executor の下で名前で宣言します。 `parameters` キーの直下の子には、マップ形式でキーと値を指定します。 パイプライン パラメーターは、プロジェクト設定ファイルの最上部で定義します。 パイプライン パラメーターの詳細については、[パイプライン変数に関するドキュメント]({{ site.baseurl }}/ja/2.0/pipeline-variables/#%E8%A8%AD%E5%AE%9A%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E3%83%91%E3%82%A4%E3%83%97%E3%83%A9%E3%82%A4%E3%83%B3-%E3%83%91%E3%83%A9%E3%83%A1%E3%83%BC%E3%82%BF%E3%83%BC)を参照してください。

次の例では、`greeting` という名前のコマンドを宣言し、`to` という名前のパラメーターを使用しています。 `to` パラメーターは、"_Hello_" とユーザーにエコーバックするステップで使用しています。

```yaml
version: 2.1
commands: # パラメーターを使用する再利用可能なコマンド
  greeting:
    parameters:
      to:
        default: "world"
        type: string
    steps:
      - run: echo "Hello <<parameters.to>>"
jobs:
  my-job:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - greeting:
          to: "My-Name"
workflows:
  my-workflow:
    jobs:
      - my-job


```

### パラメーターの構文
{: #parameter-syntax }
{:.no_toc}

パラメーターは、以下のキーを直下の子として持つことができます。

| キー名         | 説明                                              | デフォルト値 |
| ----------- | ----------------------------------------------- | ------ |
| description | オプションのキー。 Orb のドキュメントを生成するために使用します。             | N/A    |
| type        | 必須. 詳細については、以下の「**パラメーター型**」セクションを参照してください。     | N/A    |
| default     | パラメーターのデフォルト値。 このキーがない場合は、パラメーターが必須であることを意味します。 | N/A    |
{: class="table table-striped"}

### パラメーター型
{: #parameter-types }

このセクションでは、パラメーターの型と使用方法について説明します。

Orb では以下のパラメーター型がサポートされます。
* `string`
* `boolean`
* `integer`
* `enum`
* `executor`
* `steps`
* 環境変数名

パイプライン パラメーターでは以下のパラメーター型がサポートされます。
* `string`
* `boolean`
* `integer`
* `enum`

#### 文字列
{: #string }
{:.no_toc}

基本的な文字列型パラメーターは以下のように記述します。

```yaml
version: 2.1
commands:
  copy-markdown:
    parameters:
      destination:
        description: 対象ディレクトリ
        type: string
        default: docs
    steps:
      - run: cp *.md << parameters.destination >>
```

引用符で囲まれていないと他の型 (ブール値、数値など) を表してしまう文字列、および YAML で特別な意味を持つ文字 (特にコロン) を含む文字列は、引用符で囲む必要があります。 その他の文字列インスタンスでは、引用符の使用は任意です。 `when` 節の評価時に、空文字列は false 値として扱われます。その他の文字列はすべて true 値として扱われます。 なお、YAML でブール値として解釈される文字列値を引用符なしで使用すると、型エラーが発生します。

#### ブール値
{: #boolean }
{:.no_toc}

ブール値型パラメーターは、条件文で使用すると便利です。

```yaml
version: 2.1
commands:
  list-files:
    parameters:
      all:
        description: include all files
        type: boolean
        default: false
      short:
        description: Keep list of files short
        type: boolean
        default: true
    steps:
      - run: ls <<# parameters.all >> -a <</ parameters.all >><<^ parameters.short >> -l <</ parameters.short >>
```

ブール値型パラメーターの評価は、[YAML 1.1 で指定されている値](http://yaml.org/type/bool.html)に基づいています。

* true と評価されるもの: `y`、`yes`、`true`、`on`
* false と評価されるもの: `n`、`no`、`false`、`off`

***備考*** ブール値は正のときに'1'を、偽のときに'0'を返却する場合があります。

上記の値は、語頭のみ大文字、またはすべて大文字で表記しても有効です。

#### 整数
{: #integer }
{:.no_toc}

整数値を渡すには、パラメーター型 `integer` を使用します。 以下の例では、`integer` 型を使用して、ジョブで `parallelism` の値を指定しています。

```yaml
version: 2.1
jobs:
  build:
    parameters:
      p:
        type: integer
        default: 1
    parallelism: << parameters.p >>
    machine: true
    steps:
      - checkout
workflows:
  workflow:
    jobs:
      - build:
          p: 2
```

#### 列挙
{: #enum }
{:.no_toc}

`enum` 型パラメーターには、任意の値のリストを指定できます。 `enum` 型パラメーターは、特定の文字列値のセットに含まれる値だけを使用するように制限したい場合に使用します。 以下の例では、`enum` 型パラメーターを使用して、バイナリのターゲット オペレーティング システムを宣言しています。

```yaml
version: 2.1

commands:
  list-files:
    parameters:
      os:
        default: "linux"
        description: heroku バイナリのターゲット オペレーティング システム。 "linux"、"darwin"、"win32" のいずれかを指定可能。
        type: enum
        enum: ["linux", "darwin", "win32"]
```

以下の `enum` 型の宣言は、デフォルト値が列挙リスト内に宣言されていないため、無効です。

{% raw %}
```yaml
version: 2.1

commands:
  list-files:
    parameters:
      os:
        type: enum
        default: "windows" # カンマ区切り列挙リストに含まれていないデフォルト値の宣言は無効
        enum: ["darwin", "linux"]
```
 {% endraw %}

#### Executor
{: #executor }
{:.no_toc}

`executor` パラメーター型を使用すると、ジョブの呼び出し元が、実行する Executor を決定できるようになります。

{% raw %}
```yaml
version: 2.1

executors:
  xenial:
    parameters:
      some-value:
        type: string
        default: foo
    environment:
      SOME_VAR: << parameters.some-value >>
    docker:
      - image: ubuntu:xenial
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
  bionic:
    docker:
      - image: ubuntu:bionic
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照

jobs:
  test:
    parameters:
      e:
        type: executor
    executor: << parameters.e >>
    steps:
      - run: some-tests

workflows:
  workflow:
    jobs:
      - test:
          e: bionic
      - test:
          e:
            name: xenial
            some-value: foobar
```
{% endraw %}

#### ステップ
{: #steps }
{:.no_toc}

ステップ型パラメーターは、ジョブまたはコマンドに、定義済みのステップとユーザー定義のステップを混在させる必要がある場合に使用します。 コマンドまたはジョブの呼び出しに渡すステップは、パラメーターとして渡す場合、提供されるステップが 1 つだけでも必ずシーケンスとして定義します。

{% raw %}
```yaml
version: 2.1

commands:
  run-tests:
    parameters:
      after-deps:
        description: "依存関係のインストール後、テストの実行前に実行されるステップ"
        type: steps
        default: []
    steps:
      - run: make deps
      - steps: << parameters.after-deps >>
      - run: make test
```
{% endraw %}

以下の例では、パラメーターとして渡すステップに対し、ジョブの `steps` で `steps` 宣言の値を指定しています。

{% raw %}
```yaml
version: 2.1

commands:
  run-tests:
    parameters:
      after-deps:
        description: "依存関係のインストール後、テストの実行前に実行されるステップ"
        type: steps
        default: []
    steps:
      - run: make deps
      - steps: << parameters.after-deps >>
      - run: make test

jobs:
  build:
    machine: true
    steps:
      - run-tests:
          after-deps:
            - run: echo "The dependencies are installed"
            - run: echo "And now I'm going to run the tests"
```
{% endraw %}

上記は以下のとおり解決されます。

{% raw %}
```yaml
version: 2.1
steps:
  - run: make deps
  - run: echo "The dependencies are installed"
  - run: echo "And now I'm going to run the tests"
  - run: make test
```
{% endraw %}

#### 環境変数名
{: #environment-variable-name }
{:.no_toc}

環境変数名 (`env_var_name`) 型パラメーターは文字列で、POSIX_NAME 正規表現 (スペースや特殊文字の使用不可など) に適合している必要があります。 `env_var_name` は、渡された文字列を環境変数名として使用できるかどうかのチェックを CircleCI で実施できるという点で便利なパラメーター型です。 環境変数の詳細については、「[環境変数の使用]({{ site.baseurl }}/2.0/env-vars/)」を参照してください。

以下の例は、再利用可能な `build` ジョブで AWS S3 にデプロイする場合の `env_var_name` パラメーター型の使用方法を示しています。 この例では、`AWS_ACCESS_KEY` および `AWS_SECRET_KEY` 環境変数に `access-key` および `secret-key` パラメーターを指定して使用しています。 したがって、`s3cmd` を実行するデプロイ ジョブがある場合、必要な認証を使用しつつもカスタム バケットにデプロイする再利用可能コマンドを作成することが可能です。

{% raw %}

パラメーターを使わない `config.yml` ファイルは次のとおりです。
```yaml
version: 2.1

jobs:
  build:
    docker:
    - image: ubuntu:latest
      auth:
        username: mydockerhub-user
        password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
    - run:
        command: |
          s3cmd --access_key ${FOO_BAR} \
                --secret_key ${BIN_BAZ} \
                ls s3://some/where
workflows:
  workflow:
    jobs:
    - build
```

パラメーターを使って書き換えた `config.yml` ファイルを次に示します。

```yaml
version: 2.1

jobs:
   build:
     parameters:
       access-key:
         type: env_var_name
         default: AWS_ACCESS_KEY
       secret-key:
         type: env_var_name
         default: AWS_SECRET_KEY
       command:
         type: string
     docker:
       - image: ubuntu:latest
         auth:
           username: mydockerhub-user
           password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
     steps:
       - run: |
           s3cmd --access_key ${<< parameters.access-key >>} \\
                 --secret_key ${<< parameters.secret-key >>} \\
                 << parameters.command >>
workflows:
  workflow:
    jobs:
      - build:
          access-key: FOO_BAR
          secret-key: BIN_BAZ
          command: ls s3://some/where
```
{% endraw %}

## 再利用可能なコマンドのオーサリング
{: #authoring-reusable-commands }

コマンドは、`config.yml` ファイルの `commands` キーの下で宣言します。 以下の例では、文字列型パラメーター `to` を受け取る `sayhello` というコマンドを定義しています。

```yaml
version: 2.1

commands:
  sayhello:
    description: "デモ用のごく簡単なコマンド"
    parameters:
      to:
        type: string
        default: "World"
    steps:
      - run: echo Hello << parameters.to >>
```

### `commands` キー
{: #the-commands-key }


A command defines a sequence of steps as a map to be executed in a job, enabling you to reuse a single command definition across multiple jobs.

| キー          | 必須 | 種類     | 説明                                                                                                                                                                              |
| ----------- | -- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| steps       | ○  | シーケンス  | コマンドの呼び出し元のジョブ内で実行する一連のステップ。                                                                                                                                                    |
| parameters  | ×  | マップ    | パラメーター キーのマップ。 詳細については「[パラメーターの構文]({{ site.baseurl }}/ja/2.0/reusing-config/#%E3%83%91%E3%83%A9%E3%83%A1%E3%83%BC%E3%82%BF%E3%83%BC%E3%81%AE%E6%A7%8B%E6%96%87)」セクションを参照してください。 |
| description | ×  | String | コマンドの目的を記述する文字列。 ドキュメントの生成に使用します。                                                                                                                                               |
{: class="table table-striped"}

### 再利用可能なコマンドの呼び出し
{: #invoking-reusable-commands }

再利用可能なコマンドは、ジョブ内のステップとして、特定のパラメーターを使用して呼び出します。 コマンドを使用すると、そのコマンドのステップが、コマンドが呼び出される場所に挿入されます。 コマンドは、ジョブ内の `steps` の下に置かれたシーケンスの一部としてのみ使用できます。

次の例では、上述の `sayhello` コマンドを使用しています。`myjob` ジョブ内でこのコマンドを呼び出し、`to` パラメーターの値を渡します。

```yaml
version: 2.1

commands:
  sayhello:
    description: "デモ用のごく簡単なコマンド"
    parameters:
      to:
        type: string
        default: "World"
    steps:
      - run: echo Hello << parameters.to >>

jobs:
  myjob:
    docker:
      - image: "cimg/base:stable"
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - sayhello: # invoke command "sayhello"
          to: "Lev"
```

### コマンド内での他のコマンドの呼び出し
{: #invoking-other-commands-in-a-command }

コマンドでは、実行のスコープ内にある他のコマンドを使用できます。 たとえば、Orb 内で宣言されているコマンドでは、その Orb 内に含まれる他のコマンドを使用可能です。 また、インポートした他の Orbs で定義されているコマンド (`some-orb/some-command` など) も使用できます。

### 特別なキー
{: #special-keys }

CircleCI では、すべての [circleci.com](https://circleci.com/ja) ユーザーが利用できる特別なキーが複数提供されています。これらは、CircleCI Server でもデフォルトで使用できます。 その一部をご紹介します。

  * `checkout`
  * `setup_remote_docker`
  * `persist_to_workspace`

**メモ:** 特別なキーはカスタム コマンドでオーバーライドできます。

### コマンドの使用例
{: #commands-usage-examples }

以下に、`aws-s3` Orb のうち、`sync` というコマンドを定義する部分を例として示します。

```yaml
version: 2.1
# aws-s3 Orb
commands:
  sync:
    description: "s3 sync の簡単なカプセル化"
    parameters:
      from:
        type: string
      to:
        type: string
      overwrite:
        default: false
        type: boolean
    steps:
      - run:
          name: S3 へのデプロイ
          command: aws s3 sync << parameters.from >> << parameters.to >><<# parameters.overwrite >> --delete<</ parameters.overwrite >>"
```

この `sync` コマンドをバージョン 2.1 の `.circleci/config.yml` ファイルで呼び出すには、次の例のようにします。

```yaml
version: 2.1

orbs:
  aws-s3: circleci/aws-s3@1.0.0

jobs:
  deploy2s3:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - aws-s3/sync:
          from: .
          to: "s3://mybucket_uri"
          overwrite: true

workflows:
  build-test-deploy:
    jobs:
      - deploy2s3
```

`build` ジョブは以下のように定義します。

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@0.1.2
  aws-s3: circleci/aws-s3@1.0.0

jobs:
  build:
    executor: aws-cli/default
    steps:
      - checkout
      - run: mkdir bucket && echo "lorum ipsum" > bucket/build_asset.txt
      - aws-s3/sync:
          from: bucket
          to: "s3://my-s3-bucket-name/prefix"
          overwrite: true
      - aws-s3/copy:
          from: bucket/build_asset.txt
          to: "s3://my-s3-bucket-name"
          arguments: --dryrun
```

## 再利用可能な Executor のオーサリング
{: #authoring-reusable-executors }

Executors はジョブ内の steps を実行するための環境を定義します。 CircleCI の設定で `job` を宣言するとき、実行環境のタイプ (`docker`、`machine`、`macos` など) を定義すると共に、 挿入する環境変数、使用するシェル、使用する `resource_class` のサイズなどの環境パラメーターを定義します。

`jobs` の外側で宣言された Executor は、その宣言のスコープ内のすべてのジョブで使用できます。そのため、1 つの Executor 定義を複数のジョブで再利用できます。

Executor 定義では、以下のキーを 1 つ以上指定します。

- `docker`、`machine`、`macos`
- `environment`
- `working_directory`
- `shell`
- `resource_class`

次の例では、ジョブ `my-job` を実行するための `my-executor` を定義しています。

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.5.1-node-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

### `executors` キー
{: #the-executors-key }

executors キーでは、ジョブのステップを実行する環境を定義します。これにより、複数のジョブで 1 つの Executor 定義を再利用できます。

| キー                | 必須               | 種類     | 説明                                                                                                                                                                                                          |
| ----------------- | ---------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker            | ○ <sup>(1)</sup> | リスト    | `docker` Executor を指定するオプション                                                                                                                                                                                |
| resource_class    | ×                | String | ジョブ内の各コンテナに割り当てる CPU と RAM の量  (`docker` Executor でのみ使用可能)。 **メモ:** この機能にアクセスするには有償アカウントが必要です。 有料のコンテナベース プランをお使いの場合は、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)して機能の利用をリクエストしてください。 |
| machine           | ○ <sup>(1)</sup> | マップ    | `machine` Executor を指定するオプション                                                                                                                                                                               |
| macos             | ○ <sup>(1)</sup> | マップ    | `macOS` Executor を指定するオプション                                                                                                                                                                                 |
| shell             | ×                | String | すべてのステップで実行コマンドに使用するシェル。 各ステップで `shell` を使用してオーバーライドできます。                                                                                                                                                   |
| working_directory | ×                | String | ステップを実行するディレクトリ                                                                                                                                                                                             |
| environment       | ×                | マップ    | 環境変数の名前と値のマップです。                                                                                                                                                                                            |
{: class="table table-striped"}

例

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.5.1-node-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照

jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

### 再利用可能な Executor の呼び出し
{: #invoking-reusable-executors }
{:.no_toc}

The following example passes `my-executor` as the value of a `name` key under `executor` -- this method is primarily employed when passing parameters to executor invocations:

```yaml
version: 2.1

executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.5.1-node-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照

jobs:
  my-job:
    executor:
      name: my-executor
    steps:
      - run: echo outside the executor
```

It is also possible to allow an orb to define the executor used by all of its commands. This allows users to execute the commands of that orb in the execution environment defined by the orb's author.

### `config.yml` で宣言した Executor をマトリックス ジョブで使用する例
{: #example-of-using-an-executor-declared-in-configyml-with-matrix-jobs }
{:.no_toc}

The following example declares a Docker executor with a node image, `node-docker`. The tag portion of the image string is parameterized with a `version` parameter. A `version` parameter is also included in the `test` job so that it can be passed through the job into the executor when the job is called from a workflow.

When calling the `test` job in the `matrix-tests` workflow, [matrix jobs](https://circleci.com/docs/2.0/configuration-reference/#matrix-requires-version-21) are used to run the job multiple times, concurrently, each with a different set of parameters. The node application is tested against many versions of Node.js:


```yaml
version: 2.1

executors:
  node-docker: # 再利用可能な Executor の宣言
    parameters:
      version:
        description: "バージョン タグ"
        default: "lts"
        type: string
    docker:
      - image: cimg/node:<<parameters.version>>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照

jobs:
  test:
    parameters:
      version:
        description: "バージョン タグ"
        default: "lts"
        type: string
    executor:
      name: node-docker
      version: <<parameters.version>>
    steps:
      - checkout
      - run: echo "how are ya?"

workflows:
  matrix-tests:
    jobs:
      - test:
          matrix:
            parameters:
              version:
                - 13.11.0
                - 12.16.0
                - 10.19.0
```

### Orb で定義されている Executor の使用
{: #using-executors-defined-in-an-orb }
{:.no_toc}

You can also refer to executors from other orbs. Users of an orb can invoke its executors. For example, `foo-orb` could define the `bar` executor:

```yaml
version: 2.1
# foo-orb の yaml
executors:
  bar:
    machine: true
    environment:
      RUN_TESTS: foobar
```

`baz-orb` could define the `bar` executor too:

```yaml
version: 2.1
# baz-orb の yaml
executors:
  bar:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
```

You may use either executor from your configuration file with:

```yaml
version: 2.1
# config.yml
orbs:
  foo-orb: somenamespace/foo@1
  baz-orb: someothernamespace/baz@3.3.1
jobs:
  some-job:
    executor: foo-orb/bar  # プレフィックス付き Executor
  some-other-job:
    executor: baz-orb/bar  # プレフィックス付き Executor
```

**Note:** The `foo-orb/bar` and `baz-orb/bar` are different executors. They both have the local name `bar` relative to their orbs, but they are independent executors defined in different orbs.

### Executor 呼び出し時のキーのオーバーライド
{: #overriding-keys-when-invoking-an-executor }
{:.no_toc}

When invoking an executor in a `job` any keys in the job itself will override those of the executor invoked. For example, if your job declares a `docker` stanza, it will be used, in its entirety, instead of the one in your executor.

**Note:** The `environment` variable maps are additive. If an `executor` has one of the same `environment` variables as the `job`, the value in the job will be used. See the [Using Environment Variables guide]({{ site.baseurl }}/2.0/env-vars/#order-of-precedence) for more information.

```yaml
version: 2.1

executors:
  node:
    docker:
      - image: cimg/node:lts
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    environment:
     ENV: ci

jobs:
  build:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    # 以下のテスト Executor は、より明示的な "docker" Executor があれば上書きされ、 任意の環境変数が追加されます。
    executor: node
    steps:
      - run: echo "Node will not be installed."
```

The above config would resolve to the following:

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    environment:
     ENV: ci       # executors で設定された値
    steps:
      - run: echo "Node will not be installed."
```

## パラメーター化されたジョブのオーサリング
{: #authoring-parameterized-jobs }

It is possible to invoke the same job more than once in the workflows stanza of `config.yml`, passing any necessary parameters as subkeys to the job. See the parameters section above for details of syntax usage.

Example of defining and invoking a parameterized job in a `config.yml`:

{% raw %}
```yaml
version: 2.1

jobs:
  sayhello: # パラメーター化されたジョブを定義します
    description: パラメーター化されたジョブを例示する以外はほとんど何もしないジョブ
    parameters:
      saywhat:
        description: "だれにあいさつするか"
        default: "World"
        type: string
    machine: true
    steps:
      - run: echo "Hello << parameters.saywhat >>"

workflows:
  build:
    jobs:
      - sayhello: # パラメーター化されたジョブを呼び出します
          saywhat: Everyone
```
{% endraw %}

**Note:** When invoking the same job multiple times with parameters across any number of workflows, the build name will be changed (i.e. `sayhello-1` , `sayhello-2`, etc.). To ensure build numbers are not appended, utilize the `name` key. The name you assign needs to be unique, otherwise the numbers will still be appended to the job name. As an example:

```yaml
workflows:
  build:
    jobs:
      - sayhello:
          name: build-sayhello
          saywhat: Everyone
  deploy:
    jobs:
      - sayhello:
          name: deploy-sayhello
          saywhat: All
```

### Orb 内で定義されているジョブ
{: #jobs-defined-in-an-orb }

If a job is declared inside an orb it can use commands in that orb or the global commands. It is not possible to call commands outside the scope of declaration of the job.

**hello-orb**

```yaml
version: 2.1
# hello-orb の yml (一部)
jobs:
  sayhello:
    parameters:
      saywhat:
        description: "だれにあいさつするか"
        default: "World"
        type: string
    machine: true
    steps:
      - say:
          saywhat: "<< parameters.saywhat >>"
commands:
  saywhat:
    parameters:
      saywhat:
        type: string
    steps:
      - run: echo "<< parameters.saywhat >>"
```

**Config leveraging hello-orb**

```yaml
# config.yml
version: 2.1
orbs:
  hello-orb: somenamespace/hello-orb@volatile
workflows:
  build:
    jobs:
      - hello-orb/sayhello:
          saywhat: Everyone
```

### executor でのパラメーターの使用
{: #using-parameters-in-executors }
{:.no_toc}

To use parameters in executors, define the parameters under the given executor. When you invoke the executor, pass the keys of the parameters as a map of keys under the `executor:` declaration, each of which has the value of the parameter to pass in.

Parameters in executors can be of the type `string`, `enum`, or `boolean`. Default values can be provided with the optional `default` key.

#### パラメーター化された Executor を使用したビルドの構成例
{: #example-build-configuration-using-a-parameterized-executor }
{:.no_toc}

```yaml
version: 2.1
executors:
  python:
    parameters:
      tag:
        type: string
        default: latest
      myspecialvar:
        type: string
    docker:
      - image: cimg/python:<< parameters.tag >>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    environment:
      MYPRECIOUS: << parameters.myspecialvar >>
jobs:
  build:
    executor:
      name: python
      tag: "2.7"
      myspecialvar: "myspecialvalue"
```

The above would resolve to the following:

```yaml
version: 2.1
jobs:
  build:
    steps: []
    docker:
      - image: cimg/python:2.7
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    environment:
      MYPRECIOUS: "myspecialvalue"
```

### パラメーターのスコープ
{: #the-scope-of-parameters }
{:.no_toc}

Parameters are in-scope only within the job or command that defined them. If you want a job or command to pass its parameters to a command it invokes, they must be passed explicitly.

```yaml
version: 2.1
jobs:
  sayhello:
    parameters:
      saywhat:
        description: "だれにあいさつするか"
        default: "World"
        type: string
    machine: true
    steps:
      - say:
          # コマンド "say" の "saywhat" パラメーターには
          # デフォルト値が定義されていないため
          # 手動で渡す必要があります
          saywhat: << parameters.saywhat >>
commands:
  say:
    parameters:
      saywhat:
        type: string
    steps:
      - run: echo "<< parameters.saywhat >>"
workflows:
  build:
    jobs:
      - sayhello:
          saywhat: Everyone
```

### 同じジョブの複数回の呼び出し
{: #invoking-the-same-job-multiple-times }
{:.no_toc}

A single configuration may invoke a job multiple times. At configuration processing time during build ingestion, CircleCI will auto-generate names if none are provided or you may name the duplicate jobs explicitly with the `name` key.

**Note:** You must explicitly name repeat jobs when a repeat job should be upstream of another job in a workflow. For example, if a job is used under the `requires` key of a job invocation in a workflow you will need to explicitly name it.

```yaml
version: 2.1
workflows:
  build:
    jobs:
      - loadsay
      # このジョブには、ダウンストリームの依存関係がないため、明示的な名前は必要ありません
      - sayhello:
          saywhat: Everyone
          requires:
            - loadsay
      # saygoodbye がジョブ依存関係としてこのジョブを要求しているため、このジョブには明示的な名前が必要です
      - sayhello:
          name: SayHelloChad
          saywhat: Chad
      # 明示的に定義した "sayhello" を使用します
      - saygoodbye:
          requires:
            - SayHelloChad
```

### 事前ステップと事後ステップの使用
{: #using-pre-and-post-steps }
{:.no_toc}

Every job invocation may optionally accept two special arguments: `pre-steps` and `post-steps`. Steps under `pre-steps` are executed before any of the other steps in the job. The steps under `post-steps` are executed after all of the other steps.

Pre and post steps allow you to execute steps in a given job without modifying the job. This is useful, for example, to run custom setup steps before job execution.

### 事前ステップと事後ステップの定義
{: #defining-pre-and-post-steps }
{:.no_toc}

The following example defines pre-steps and post-steps in the `bar` job of the `build` workflow:

```yaml
# config.yml
version: 2.1
jobs:
  bar:
    machine: true
    steps:
      - checkout
      - run:
          command: echo "building"
      - run:
          command: echo "testing"
workflows:
  build:
    jobs:
      - bar:
          pre-steps:
            - run:
                command: echo "install custom dependency"
          post-steps:
            - run:
                command: echo "upload artifact to s3"
```

**Note:** The keys `pre-steps` and `post-steps` in jobs are available in configuration version 2.1 and later.

## 条件付きステップの定義
{: #defining-conditional-steps }

Conditional steps run only if a condition is met at config-compile time, before a workflow runs. This means, for example, that you may not use a condition to check an environment variable, as those are not injected until your steps are running in the shell of your execution environment.

Conditional steps may be located anywhere a regular step could and may only use parameter values as inputs.

For example, an orb could define a command that runs a set of steps *if* invoked with `myorb/foo: { dostuff: true }`, but not `myorb/foo: { dostuff: false }`.

Furthermore, an orb author could define conditional steps in the `steps` key of a Job or a Command.

```yaml
# config.yml 内
version: 2.1
jobs:
  myjob:
    parameters:
      preinstall-foo:
        type: boolean
        default: false
    machine: true
    steps:
      - run: echo "preinstall is << parameters.preinstall-foo >>"
      - when:
          condition: << parameters.preinstall-foo >>
          steps:
            - run: echo "preinstall"
      - unless:
          condition: << parameters.preinstall-foo >>
          steps:
            - run: echo "don't preinstall"
workflows:
  workflow:
    jobs:
      - myjob:
          preinstall-foo: false
      - myjob:
          preinstall-foo: true
      - myjob # 空の文字列は false
```

**Note:** Conditional steps are available in configuration version 2.1 and later.

### **`when` ステップ**
{: #the-when-step }

Under the `when` key are the subkeys `condition` and `steps`. The subkey `steps` are run only if the condition evaluates to a truthy value.

| Key       | Required | Type     | Description                                                                                  |
| --------- | -------- | -------- | -------------------------------------------------------------------------------------------- |
| condition | Y        | Logic    | [A logic statement](https://circleci.com/docs/2.0/configuration-reference/#logic-statements) |
| steps     | Y        | Sequence | A list of steps to execute when the condition is truthy.                                     |
{: class="table table-striped"}

### **`unless` ステップ**
{: #the-unless-step }

Under the `unless` key are the subkeys `condition` and `steps`. The subkey `steps` are run only if the condition evaluates to a falsy value.

| Key       | Required | Type     | Description                                                                                  |
| --------- | -------- | -------- | -------------------------------------------------------------------------------------------- |
| condition | Y        | Logic    | [A logic statement](https://circleci.com/docs/2.0/configuration-reference/#logic-statements) |
| steps     | Y        | Sequence | A list of steps to execute when the condition is falsy.                                      |
{: class="table table-striped"}

## インライン Orb の作成
{: #writing-inline-orbs }

When defining reusable configuration elements directly within your config, you can also wrap those elements within an inline orb. You may find inline orbs useful for development or for name-spacing elements that share names in a local config.

To write an inline orb, place the orb elements under that orb’s key in the orbs declaration section of the configuration. For example, if you want to import one orb to use inside another, inline orb, the config could look like the example shown below, in which the inline orb `my-orb` imports the `node` orb:

```yaml
version: 2.1

orbs:
  my-orb:
    orbs:
      node: circleci/node@3.0
    commands:
      my_command:
        steps:
          - run: echo "Run my tests"
    jobs:
      my_job:
        executor: node/default # Node Orb の Executor
        steps:
          - checkout
          - my_command
          - store_test_results:
              path: test-results

workflows:
  main:
    jobs:
      - my-orb/my_job

```

## 関連項目
{: #see-also }

- CircleCI で使用できる構成例は、「[2.0 config.yml のサンプル ファイル]({{site.baseurl}}/2.0/sample-config/)」でご覧いただけます。
- 設定ファイル内で CircleCI Orbs を使用するための詳しいレシピは、「[構成クックブック]({{site.baseurl}}/2.0/configuration-cookbook/)」で紹介しています。
- CircleCI 設定ファイルで使用できるデータベースの構成例については、「[データベースの構成例]({{site.baseurl}}/2.0/postgres-config/)」を参照してください。
