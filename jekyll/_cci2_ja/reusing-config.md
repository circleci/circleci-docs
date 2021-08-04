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

* コマンド、ジョブ、Executor、パラメーターの名前はアルファベットで始める必要があります。 名前に含めることができるのは小文字 (`a` ～ `z`)、数字 (`0` ～ `9`)、アンダースコア (`_`)、ハイフン (`-`) だけです。

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

#### String
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

引用符で囲まれていないと他の型 (ブール値、数値など) を表してしまう文字列、および YAML で特別な意味を持つ文字 (特にコロン) を含む文字列は、引用符で囲む必要があります。 In all other instances, quotes are optional. `when` 節の評価時に、空文字列は false 値として扱われます。 その他の文字列はすべて true 値として扱われます。 なお、YAML でブール値として解釈される文字列値を引用符なしで使用すると、型エラーが発生します。

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
        description: heroku バイナリのターゲット オペレーティング システム。 Must be one of "linux", "darwin", "win32".
        "linux"、"darwin"、"win32" のいずれかを指定可能。
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

次の例では、上述の `sayhello` コマンドを使用しています。 `myjob` ジョブ内でこのコマンドを呼び出し、`to` パラメーターの値を渡します。

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

CircleCI では、すべての [circleci.com](https://circleci.com/ja) ユーザーが利用できる特別なキーが複数提供されています。 これらは、CircleCI Server でもデフォルトで使用できます。 Examples of these keys are:

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

Executors はジョブ内の steps を実行するための環境を定義します。 CircleCI の設定で `job` を宣言するとき、実行環境のタイプ (`docker`、`machine`、`macos` など) を定義すると共に、 挿入する環境変数、使用するシェル、使用する `resource_class` のサイズなどの環境パラメーターを定義します。 etc.) to run in, as well as any other parameters for that environment, including: environment variables to populate, which shell to use, what size `resource_class` to use, etc.

`jobs` の外側で宣言された Executor は、その宣言のスコープ内のすべてのジョブで使用できます。 そのため、1 つの Executor 定義を複数のジョブで再利用できます。

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

Executors define the environment in which the steps of a job will be run, allowing you to reuse a single executor definition across multiple jobs.

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

以下の例では、`executor` の下で `name` キーの値として `my-executor` を渡しています。 この方法は主に、Executor の呼び出しにパラメーターを渡す場合に使用されます。

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

Orb では、Orb 内のすべてのコマンドが使用する Executor を定義することも可能です。 これにより、Orb のオーサーにより定義された実行環境内で、その Orb のコマンドを実行できます。

### `config.yml` で宣言した Executor をマトリックス ジョブで使用する例
{: #example-of-using-an-executor-declared-in-configyml-with-matrix-jobs }
{:.no_toc}

次の例では、Node イメージを指定した Docker Executor を、`node-docker` として宣言しています。 image 文字列のタグ部分は、`version` パラメーターを使用してパラメーター化しています。 `version` パラメーターは、`test` ジョブにも設定しています。 こうすることで、ワークフローでこのジョブが呼び出されるときに、ジョブを通じてこのパラメーターを Executorに渡すことができます。

`matrix-tests` ワークフローで `test` ジョブが呼び出されると、このジョブは[マトリックス ジョブ](https://circleci.com/ja/docs/2.0/configuration-reference/#matrix-requires-version-21)により複数回同時実行されます。 その際、実行ごとに異なるパラメーターのセットが使用されます。 これにより、Node アプリケーションを多数のバージョンの Node.js でテストしています。


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

他の Orbs の Executors も参照できます。 Orb のユーザーは、その Orb の Executors を呼び出すことができます。 たとえば、`foo-orb` で `bar` Executor を定義します。

```yaml
version: 2.1
# foo-orb の yaml
executors:
  bar:
    machine: true
    environment:
      RUN_TESTS: foobar
```

`baz-orb` でも `bar` Executor を定義します。

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

設定ファイルでは、以下のように両方の Executor を使用できます。

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

**メモ:** `foo-orb/bar` と `baz-orb/bar` は、異なる Executor です。 どちらも、それぞれの Orb に相対的なローカル名 `bar` を持ちますが、独立した Executor であり、異なる Orb で定義されています。

### Executor 呼び出し時のキーのオーバーライド
{: #overriding-keys-when-invoking-an-executor }
{:.no_toc}

`job` での Executor の呼び出し時には、ジョブ自体に含まれるキーは、呼び出された executors のキーをオーバーライドします。 たとえば、ジョブで `docker` の定義が宣言されている場合は、executors で指定した Docker ではなく、その Docker がジョブ全体で使用されます。

**メモ:** `environment` 変数のマップは付加的です。 `executors` と `job` で同じ `environment` 変数を定義している場合は、ジョブの値が使用されます。 詳細については、[環境変数の使用に関するページ]({{ site.baseurl }}/ja/2.0/env-vars/#%E5%84%AA%E5%85%88%E9%A0%86%E4%BD%8D)を参照してください。

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
      - run: echo "Node will not be installed." Any env vars will be added.
    executor: node
    steps:
      - run: echo "Node will not be installed."
```

上記のコンフィグは以下のとおり解決されます。

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
    steps:
      - run: echo "Node will not be installed."
```

## パラメーター化されたジョブのオーサリング
{: #authoring-parameterized-jobs }

必要なパラメーターをサブキーとしてジョブに渡すことで、`config.yml` の workflows 定義内で、同じジョブを複数回呼び出すことができます。 使用されている構文の詳細については、上記のパラメーターに関するセクションを参照してください。

`config.yml` でパラメーター化されたジョブを定義して呼び出す例を次に示します。

{% raw %}
```yaml
version: 2.1

jobs:
  sayhello: # defines a parameterized job
    description: A job that does very little other than demonstrate what a parameterized job looks like
    parameters:
      saywhat:
        description: "To whom shall we say hello?"
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

**メモ:** 複数のワークフローでパラメーターを使用して同じジョブを複数回呼び出すと、ビルド名が変化します (例: `sayhello-1`、`sayhello-2` など)。 ビルド名に数字が追加されないようにするには、`name` キーを利用します。 重複する場合は、ジョブ名に数字が追加されます。 以下に例を示します。

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

Orb 内で宣言されているジョブは、その Orb 内のコマンドおよびグローバルコマンドを使用できます。 ただし、ジョブ宣言のスコープ外のコマンドを呼び出すことはできません。

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

**hello-orb を利用する設定ファイル**

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

Executor でパラメーターを使用するには、その Executor の下でパラメーターを定義します。 Executor を呼び出すときは、`executor:` 宣言の下で、キーのマップ (各キーに渡すパラメーターの値を指定したもの) としてパラメーターのキーを渡します。

Executor 内のパラメーターには、`string` 型、`enum` 型、`boolean` 型を使用できます。 デフォルト値は、オプションの `default` キーを使用して指定できます。

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

上記は以下のとおり解決されます。

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

パラメーターは、パラメーターを定義したジョブまたはコマンド内でのみ有効です。 ジョブまたはコマンドから呼び出し元のコマンドにパラメーターを渡す場合は、明示的に渡す必要があります。

```yaml
version: 2.1
jobs:
  sayhello:
    parameters:
      saywhat:
        description: "To whom shall we say hello?"
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

1 つの設定ファイルで、同じジョブを複数回呼び出すことができます。 ビルドのインジェストにおける設定ファイルの処理時に、ジョブに名前が付けられていなければ、CircleCI で自動的に名前が生成されます。 `name` キーを使用して、重複するジョブに明示的に名前を付けることもできます。

**メモ:** 繰り返しジョブがワークフロー内の別のジョブのアップストリームになければならない場合は、その繰り返しジョブに明示的に名前を付ける必要があります。 たとえば、ワークフロー内でジョブ呼び出しの `requires` キーの下で使用するジョブには、明示的に名前を付ける必要があります。

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

すべてのジョブ呼び出しは、オプションで 2つの特別な引数、`pre-steps` と `post-steps` を受け取ることができます。 `pre-steps` の下のステップは、ジョブ内の他のすべてのステップよりも前に実行されます。 `post-steps` の下のステップは、他のすべてのステップよりも後に実行されます。

事前ステップと事後ステップを使用すると、特定のジョブ内で、そのジョブを変更せずにいくつかのステップを実行できます。 これは、たとえば、ジョブの実行前にカスタムのセットアップ ステップを実行したいときに便利です。

### 事前ステップと事後ステップの定義
{: #defining-pre-and-post-steps }
{:.no_toc}

以下の例では、`build` ワークフローの `bar` ジョブ内で、pre-steps と post-steps を定義しています。

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

**メモ:** ジョブ内の `pre-steps` キーと `post-steps` キーは、バージョン 2.1 以上の設定ファイルで使用可能です。

## 条件付きステップの定義
{: #defining-conditional-steps }

条件付きステップは、設定ファイルのコンパイル時に条件が満たされた場合にのみ、ワークフロー実行前に実行されます。 そのため、たとえば条件を使用して環境変数をチェックすることはできません。 環境変数は、実行環境のシェルでステップが実行されるまで挿入されないからです。

条件付きステップは、通常のステップがパラメーター値を入力として使用できる箇所ならどこにでも配置することができます。

For example, an orb could define a command that runs a set of steps *if* invoked with `myorb/foo: { dostuff: true }`, but not `myorb/foo: { dostuff: false }`.

さらに、Orb のオーサーであれば、ジョブまたはコマンドの `steps` キーで条件付きステップを定義することもできます。

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

**メモ:** 条件付きステップは、バージョン 2.1 以上の設定ファイルで使用可能です。

### **`when` ステップ**
{: #the-when-step }

`when` キー配下ではサブキーとして `condition` と `steps` が使えます。 `steps` サブキーは、条件が true 値であると評価された場合にのみ実行されます。

| キー        | 必須 | 種類    | 説明                                                                                      |
| --------- | -- | ----- | --------------------------------------------------------------------------------------- |
| condition | ○  | ロジック  | [ロジック ステートメント](https://circleci.com/docs/2.0/configuration-reference/#logic-statements) |
| steps     | ○  | シーケンス | 条件が true 値のときに実行するステップのリスト                                                              |
{: class="table table-striped"}

### **`unless` ステップ**
{: #the-unless-step }

`unless` キーの下に、`condition` サブキーと `steps` サブキーを記述します。 `steps` サブキーは、条件が false 値であると評価された場合にのみ実行されます。

| キー        | 必須 | 種類    | 説明                                                                                      |
| --------- | -- | ----- | --------------------------------------------------------------------------------------- |
| condition | ○  | ロジック  | [ロジック ステートメント](https://circleci.com/docs/2.0/configuration-reference/#logic-statements) |
| steps     | ○  | シーケンス | 条件が false 値のときに実行するステップのリスト                                                             |
{: class="table table-striped"}

## インライン Orb の作成
{: #writing-inline-orbs }

再利用可能な設定ファイル要素を設定ファイル内で直接定義する場合、それらの要素をインライン Orb 内にラップすることもできます。 インライン Orb は、開発に役立つほか、ローカル設定ファイル内で名前を共有する要素の名前空間を作成するときにも便利です。

インライン Orb を記述するには、設定ファイル内の orbs 宣言セクションにその Orb のキーを置き、その下に Orb エレメントを置きます。 たとえば、ある Orb を別の Orb 内にインポートして使用する (インライン Orb) 場合の設定ファイルは以下のようになります。 ここでは、インライン Orb `my-orb` に `node` Orb をインポートしています。

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
