---
layout: classic-docs
title: "再利用可能な設定ファイルのリファレンスガイド"
short-title: "再利用可能な設定ファイルのリファレンスガイド"
description: "CircleCI 2.1 設定ファイルのリファレンスガイド"
categories:
  - 設定ファイル
order: 1
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

ここでは、再利用可能なコマンド、ジョブ、Executor、Orb を利用する方法について説明します。 また、パラメーター化された再利用可能な要素を作成するためのパラメーターの使用方法についても取り上げます。

## 再利用可能な設定ファイルに関する注意事項
{: #notes-on-reusable-configuration }

* (任意) `circleci config process` コマンドにアクセスできるように、CircleCI CLI をインストールします 。 このコマンドを使用すると、再利用可能なキーを含む展開後の設定ファイルを確認できます。 Follow the [Using the CircleCI CLI](/docs/local-cli/) documentation for installation instructions and tips.

* CircleCI 設定ファイルの要素を再利用するには、**`version: 2.1`** の `.circleci/config.yml` ファイルを使用する必要があります。

* コマンド、ジョブ、Executor、パラメーターの名前はアルファベットで始める必要があります。 名前に含めることができるのは小文字 (`a` ～ `z`)、数字 (`0` ～ `9`)、アンダースコア (`_`)、ハイフン (`-`) だけです。

## `パラメーター` 宣言の使用
{: #using-the-parameters-declaration }

パラメーターは、ジョブ、コマンド、または Executor の下で名前で宣言します。 _Pipeline parameters_ are defined at the top level of a project configuration. See the [Pipeline Values and Parameters guide](/docs/pipeline-variables/#pipeline-parameters-in-configuration) for more information.

`parameters` キーの直下に置かれた子キーは、マップ内のキー セットです。

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

パラメーターは、以下のキーを直下の子キーとして持つことができます。

| キー名         | 説明                                              | デフォルト値 |
| ----------- | ----------------------------------------------- | ------ |
| description | オプションのキー。 Orb のドキュメントを生成するために使用します。             | 該当なし   |
| タイプ         | 必須のキー。 詳細については、以下の「**パラメーター型**」セクションを参照してください。  | 該当なし   |
| default     | パラメーターのデフォルト値。 このキーがない場合は、パラメーターが必須であることを意味します。 | 該当なし   |
{: class="table table-striped"}

### パラメーターの型
{: #parameter-types }

このセクションでは、パラメーターの型と使用方法について説明します。

Orb では以下のパラメーター型がサポートされます。
* `string`
* `ブール値`
* `integer`
* `enum`
* `Executor 型`
* `steps`
* 環境変数名型

パイプライン パラメーターでは以下のパラメーター型がサポートされます。
* `文字列型`
* `ブール値型`
* `整数型`
* `列挙型`

#### 文字列型
{: #string }

基本的な文字列型パラメーターは以下のように記述します。

```yaml
version: 2.1
commands:
  copy-markdown:
    parameters:
      destination:
        description: destination directory
        type: string
        default: docs
    steps:
      - run: cp *.md << parameters.destination >>
```

引用符で囲まれていないと他の型 (ブール値、数値など) を表してしまう文字列、および YAML で特別な意味を持つ文字 (特にコロン) を含む文字列は、引用符で囲む必要があります。 それ以外の場合は、引用符は任意です。

`when` 節の評価時に、空文字列は false 値として扱われます。 その他の文字列はすべて true 値として扱われます。 なお、YAML でブール値として解釈される文字列値を引用符なしで使用すると、型エラーが発生します。

#### ブール値型
{: #boolean }

ブール値型パラメーターは、条件文で使用すると便利です。

```yaml
version: 2.1
commands:
  npm-install:
    parameters:
      clean:
        description: Perform a clean install
        type: boolean
        default: false
    steps:
      - when:
          condition: << parameters.clean >>
          steps:
            - run: npm clean-install
      - when:
          condition:
            not: << parameters.clean >>
          steps:
            - run: npm install
```

ブール値型パラメーターの評価は、[YAML 1.1 で指定されている値](http://yaml.org/type/bool.html)に基づいています。

* true と評価されるもの: `y`、`yes`、`true`、`on`
* false と評価されるもの: `n`、`no`、`false`、`off`

上記の値は、語頭のみ大文字、またはすべて大文字で表記しても有効です。

Boolean values may be returned as a '1' for True and '0' for False.
{: class="alert alert-info" }

#### 整数型
{: #integer }

整数値を渡すには、パラメーター型 `integer` を使用します。

The following example uses the `integer` type to populate the value of `parallelism` in a job:

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

#### 列挙型
{: #enum }

`enum` 型パラメーターには、任意の値のリストを指定できます。 `enum` 型パラメーターは、特定の文字列値のセットに含まれる値だけを使用するように制限したい場合に使用します。

The following example uses the `enum` parameter to declare the target operating system for a binary:

```yaml
version: 2.1

commands:
  list-files:
    parameters:
      os:
        default: "linux"
        description: The target Operating System for the heroku binary. Must be one of "linux", "darwin", "win32".
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
        default: "windows" # カンマ区切り列挙リストに含まれていないデフォルト値の宣言は無効です。
        enum: ["darwin", "linux"]
```
 {% endraw %}

#### Executor 型
{: #executor }
{:.no_toc}

`executor` パラメーター型を使用すると、ジョブの呼び出し元が実行する Executor を決定できるようになります。

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

#### ステップ型
{: #steps }

ステップ型パラメーターは、ジョブまたはコマンドに、定義済みのステップとユーザー定義のステップを混在させる必要がある場合に使用します。 コマンドまたはジョブの呼び出しに渡すステップは、パラメーターとして渡す場合、提供されるステップが 1 つだけでも必ずシーケンスとして定義します。

{% raw %}
```yaml
version: 2.1

commands:
  run-tests:
    parameters:
      after-deps:
        description: "Steps that will be executed after dependencies are installed, but before tests are run"
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
        description: "Steps that will be executed after dependencies are installed, but before tests are run"
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

#### 環境変数名型
{: #environment-variable-name }

The environment variable name (`env_var_name`) parameter is a string that must match a POSIX_NAME regular expression (for example, there can be no spaces or special characters). `env_var_name` は、渡された文字列を環境変数名として使用できるかどうかのチェックを CircleCI で実施できるという点で便利なパラメーター型です。 For more information on environment variables, see the guide to [Environment Variables](/docs/env-vars/).

以下の例は、再利用可能な `build` ジョブで AWS S3 にデプロイする場合の `env_var_name` パラメーター型の使用方法を示しています。 This example uses the `AWS_ACCESS_KEY` and `AWS_SECRET_KEY` environment variables with the `access-key` and `secret-key` parameters. If you have a deploy job that runs the `s3cmd`, it is possible to create a reusable command that uses the needed authentication, but deploys to a custom bucket.

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

次に、パラメーターを使って書き換えた `config.yml` ファイルを示します。

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

## 再利用可能なコマンドの作成
{: #authoring-reusable-commands }

Commands are declared under the `commands` key of a `.circleci/config.yml` file. 以下の例では、文字列型パラメーター `to` を受け取る `sayhello` というコマンドを定義しています。

```yaml
version: 2.1

commands:
  sayhello:
    description: "A very simple command for demonstration purposes"
    parameters:
      to:
        type: string
        default: "World"
    steps:
      - run: echo Hello << parameters.to >>
```

### `commands` キー
{: #the-commands-key }


コマンドは、ジョブ内で実行される一連のステップをマップとして定義します。これにより、1 つのコマンド定義を複数のジョブで再利用できます。

| キー          | 必須 | タイプ    | 説明                                                                                                        |
| ----------- | -- | ------ | --------------------------------------------------------------------------------------------------------- |
| steps       | ○  | シーケンス  | コマンドの呼び出し元のジョブ内で実行する一連のステップ。                                                                              |
| parameters  | ×  | マップ    | parameter キーのマップ。 See the [Parameter Syntax](/docs/reusing-config/#parameter-syntax) section for details. |
| description | ×  | String | コマンドの目的を記述する文字列。 ドキュメントの生成に使用します。                                                                         |
{: class="table table-striped"}

### 再利用可能なコマンドの呼び出し
{: #invoking-reusable-commands }

再利用可能なコマンドは、ジョブ内のステップとして、特定のパラメーターを使用して呼び出します。 コマンドを使用すると、そのコマンドのステップが、コマンドが呼び出される場所に挿入されます。 コマンドは、ジョブ内の `steps` の下に置かれたシーケンスの一部としてのみ使用できます。

次の例では、上述の `sayhello` コマンドを使用しています。 `myjob` ジョブ内でこのコマンドを呼び出し、`to` パラメーターの値を渡します。

```yaml
version: 2.1

commands:
  sayhello:
    description: "A very simple command for demonstration purposes"
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
      - sayhello: # "sayhello" コマンドを呼び出します。
          to: "Lev"
```

### コマンド内での他のコマンドの呼び出し
{: #invoking-other-commands-in-a-command }

コマンドでは、実行のスコープ内にある他のコマンドを使用できます。 たとえば、Orb 内で宣言されているコマンドは、その Orb 内で他のコマンドを使用可能です。 また、インポートした他の Orb で定義されているコマンド (`some-orb/some-command` など) も使用できます。

### 特別なキー
{: #special-keys }

CircleCI では、すべての [circleci.com](http://circleci.com/ja) ユーザーが利用できる特別なキーが複数提供されており、CircleCI Server でデフォルトで使用できます。 その一部をご紹介します。

  * `チェックアウト
`
  * `setup_remote_docker`
  * `persist_to_workspace`

It is possible to override the special keys with a custom command.
{: class="alert alert-info" }

### コマンドの使用例
{: #commands-usage-examples }

以下に、`aws-s3` Orb の、`sync` というコマンドを定義する部分を例として示します。

```yaml
#...
sync:
    description: Syncs directories and S3 prefixes.
    parameters:
        arguments:
            default: ""
            description: |
                Optional additional arguments to pass to the `aws sync` command (e.g., `--acl public-read`). Note: if passing a multi-line value to this parameter, include `\` characters after each line, so the Bash shell can correctly interpret the entire command.
            type: string
        aws-access-key-id:
            default: AWS_ACCESS_KEY_ID
            description: aws access key id override
            type: env_var_name
        aws-region:
            default: AWS_REGION
            description: aws region override
            type: env_var_name
        aws-secret-access-key:
            default: AWS_SECRET_ACCESS_KEY
            description: aws secret access key override
            type: env_var_name
        from:
            description: A local *directory* path to sync with S3
            type: string
        to:
            description: A URI to an S3 bucket, i.e. 's3://the-name-my-bucket'
            type: string
    steps:
        - aws-cli/setup:
            aws-access-key-id: << parameters.aws-access-key-id >>
            aws-region: << parameters.aws-region >>
            aws-secret-access-key: << parameters.aws-secret-access-key >>
        - deploy:
            command: |
                aws s3 sync \
                  <<parameters.from>> <<parameters.to>> <<#parameters.arguments>> \
                  <<parameters.arguments>><</parameters.arguments>>
            name: S3 Sync
#...
```

CircleCI では上記の例のように、deploy `command`で Mustache 構文を使用している場合があるのでご注意ください。

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

## 再利用可能な Executor の作成
{: #authoring-reusable-executors }

Executor はジョブ内のステップを実行するための環境を定義します。 CircleCI の設定で `job` を宣言する際に、実行環境のタイプ (`docker`、`machine`、`macos` など) を定義します。 また、 挿入する環境変数、使用するシェル、使用する `resource_class` のサイズなどの環境パラメーターも定義します。

`jobs` の外側で宣言された Executor は、その宣言のスコープ内のすべてのジョブで使用できます。 そのため、1 つの Executor 定義を複数のジョブで再利用できます。

Executor 定義では、以下のキーを 1 つ以上指定します。

- `docker`、`machine`、`macos`
- `環境`
- `working_directory`
- `shell`
- `resource_class`

次の例では、ジョブ `my-job` を実行するための `my-executor` を定義しています。

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: cimg/ruby:2.5.1-browsers
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

Executor は、ジョブのステップが実行される環境を定義します。 1 つの Executor 定義を複数のジョブで 再利用することができます。

| キー                | 必須               | タイプ    | 説明                                                        |
| ----------------- | ---------------- | ------ | --------------------------------------------------------- |
| Docker            | ○ <sup>(1)</sup> | リスト    | `docker` Executor を指定するオプション                              |
| resource_class    | ×                | String | ジョブ内の各コンテナに割り当てられる CPU と RAM の量                           |
| マシン               | ○ <sup>(1)</sup> | マップ    | `machine` Executor を指定するオプション                             |
| macOS             | ○ <sup>(1)</sup> | マップ    | `macOS` Executor を指定するオプション                               |
| shell             | ×                | String | すべてのステップのコマンド実行に使用するシェル。 各ステップで `shell` を使用してオーバーライドできます。 |
| working_directory | ×                | String | ステップを実行するディレクトリ                                           |
| 環境                | ×                | マップ    | 環境変数名と値のマップ。                                              |
{: class="table table-striped"}

コード例

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: cimg/ruby:2.5.1-browsers
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
      - image: cimg/ruby:2.5.1-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

jobs:
  my-job:
    executor:
      name: my-executor
    steps:
      - run: echo outside the executor
```

Orb では、Orb 内のすべてのコマンドが使用する Executor を定義することも可能です。 これにより、Orb の作成者が定義した実行環境内で、その Orb のコマンドを実行できます。

### `config.yml` で宣言した Executor をマトリックス ジョブで使用する例
{: #example-of-using-an-executor-declared-in-configyml-with-matrix-jobs }

次の例では、Node イメージを指定した Docker Executor を、`node-docker` として宣言しています。 image 文字列のタグ部分は、`version` パラメーターを使用してパラメーター化しています。 `version` パラメーターは、`test` ジョブにも設定しています。 こうすることで、ワークフローでこのジョブが呼び出されるときに、ジョブを通じてこのパラメーターを Executor に渡すことができます。

When calling the `test` job in the `matrix-tests` workflow, [matrix jobs](/docs/configuration-reference/#matrix-requires-version-21) are used to run the job multiple times, concurrently, each with a different set of parameters. The Node application is tested against many versions of Node.js:


```yaml
version: 2.1

executors:
  node-docker: # 再利用可能な Executor を宣言します。
    parameters:
      version:
        description: "version tag"
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
        description: "version tag"
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

他の Orb の Executor を参照することもできます。 Orb のユーザーは、その Orb の Executor を呼び出すことができます。 たとえば、`foo-orb` で `bar` Executor を定義します。

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

どちらの Executor も設定ファイルでは、以下のように使用できます。

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

**注:** `foo-orb/bar` と `baz-orb/bar` は、異なる Executor です。 どちらも、それぞれの Orb に相対的なローカル名 `bar` を持ちますが、独立した Executor であり、異なる Orb で定義されています。

### Overriding keys when invoking an executor
{: #overriding-keys-when-invoking-an-executor }

When invoking an executor in a `job`, any keys in the job itself will override those of the executor invoked. たとえば、ジョブで `docker` スタンザが宣言されている場合は、 Executor で指定した Docker ではなく、その Docker がジョブ全体で使用されます。

`environment` 変数のマップは付加的です。 `executors` と `job` で同じ `environment` 変数を定義している場合は、ジョブの値が使用されます。 See the [Environment Variables guide](/docs/env-vars/#order-of-precedence) for more information.
{: class="alert alert-info" }

```yaml
version: 2.1

executors:
  node:
    docker:
      - image: cimg/node:lts
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
     ENV: ci

jobs:
  build:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    # The test executor below will be overwritten by the more explicit "docker" executor. Any env vars will be added.
    executor: node
    steps:
      - run: echo "Node will not be installed."
```

上記の設定は以下のとおり解決されます。

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
     ENV: ci       # From executor.
    steps:
      - run: echo "Node will not be installed."
```

## パラメーター化されたジョブの作成
{: #authoring-parameterized-jobs }

It is possible to invoke the same job more than once in the workflows stanza of `.circleci/config.yml`, passing any necessary parameters as subkeys to the job. See the [Parameters syntax section](#parameter-syntax) above for details of syntax usage.

`config.yml` でパラメーター化されたジョブを定義して呼び出す例を次に示します。

{% raw %}
```yaml
version: 2.1

jobs:
  sayhello: # パラメーター化されたジョブを定義します。
    description: A job that does very little other than demonstrate what a parameterized job looks like
    parameters:
      saywhat:
        description: "To whom shall we say hello?"
        default: "World"
        type: string
    machine: true
    steps:
      - run: echo "Hello << parameters.saywhat >>"

workflows:
  build:
    jobs:
      - sayhello:# パラメーター化されたジョブを呼び出します。
          saywhat: Everyone
```
{% endraw %}

When invoking the same job multiple times with parameters across any number of workflows, the build name will be changed (i.e. `sayhello-1`, `sayhello-2`, etc.). ビルド名に数字が追加されないようにするには、`name` キーを利用します。 割り当てる名前は一意である必要があります。重複する場合は、ジョブ名に数字が付与されます。 以下に例を示します。
{: class="alert alert-info" }

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

Orb 内で宣言されているジョブは、その Orb 内のコマンドまたはグローバルコマンドを使用できます。 ただし、ジョブ宣言のスコープ外のコマンドを呼び出すことはできません。

**hello-orb**

```yaml
version: 2.1
jobs:
  sayhello:
    parameters:
      saywhat:
        description: "To whom shall we say hello?"
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

### Executor でのパラメーターの使用
{: #using-parameters-in-executors }

Executor でパラメーターを使用するには、その Executor の下でパラメーターを定義します。 Executor を呼び出すときは、`executor:` 宣言の下で、キーのマップ (各キーに渡すパラメーターの値を指定したもの) としてパラメーターのキーを渡します。

Executor 内のパラメーターには、`string` 型、`enum` 型、`boolean` 型を使用できます。 デフォルト値は、オプションの `default` キーを使用して指定できます。

#### パラメーター化された Executor を使用したビルドの設定例
{: #example-build-configuration-using-a-parameterized-executor }

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

パラメーターは、パラメーターを定義したジョブまたはコマンド内でのみ有効です。 ジョブまたはコマンドから呼び出し元のコマンドにパラメーターを渡す場合は、明示的に渡す必要があります。

```yaml
version: 2.1
jobs:
  sayhello:
    parameters:
      saywhat:
        description: "To whom shall we say hello?"
        default: "World"
        type: string
    machine: true
    steps:
      - say:
          # コマンド "say" の "saywhat" パラメーターには 
          # デフォルト値が定義されていないため
          # 手動で渡す必要があります。
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

1 つの設定ファイルで、同じジョブを複数回呼び出すことができます。 ビルドのインジェストにおける設定ファイルの処理時に、ジョブに名前が付けられていなければ、CircleCI で自動的に名前が生成されます。 `name` キーを使用して、重複するジョブに明示的に名前を付けることもできます。

You must explicitly name repeat jobs when a repeat job should be upstream of another job in a workflow. For example, if a job is used under the `requires` key of a job invocation in a workflow, you will need to explicitly name it.
{: class="alert alert-info" }

```yaml
version: 2.1
workflows:
  build:
    jobs:
      - loadsay
      # このジョブには、ダウンストリームの依存関係がないため、明示的な名前は必要ありません。
      - sayhello:
          saywhat: Everyone
          requires:
            - loadsay
      # saygoodbye がジョブ依存関係としてこのジョブを要求しているため、このジョブには明示的な名前が必要です。
      - sayhello:
          name: SayHelloChad
          saywhat: Chad
      # 明示的に定義した "sayhello" を使用します。
      - saygoodbye:
          requires:
            - SayHelloChad
```

### 事前ステップと事後ステップの使用
{: #using-pre-and-post-steps }

すべてのジョブ呼び出しは、オプションで 2 つの特別な引数、`pre-steps` と `post-steps` を受け取ることができます。 `pre-steps` の下のステップは、ジョブ内の他のすべてのステップよりも前に実行されます。 `post-steps` の下のステップは、他のすべてのステップよりも後に実行されます。

事前ステップと事後ステップを使用すると、特定のジョブ内で、そのジョブを変更せずにいくつかのステップを実行できます。 This is useful, for example, in running custom setup steps before job execution.

### 事前ステップと事後ステップの定義
{: #defining-pre-and-post-steps }

The keys `pre-steps` and `post-steps` in jobs are available in configuration version 2.1 and later.
{: class="alert alert-info" }

以下の例では、`build` ワークフローの `bar` ジョブ内で、事前ステップと事後ステップを定義しています。

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

## 条件付きステップの定義
{: #defining-conditional-steps }

Conditional steps are available in configuration version 2.1 and later.
{: class="alert alert-info" }

条件付きステップは、設定ファイルのコンパイル時に条件が満たされた場合にのみ、ワークフロー実行前に実行されます。 そのため、たとえば条件を使用して環境変数をチェックすることはできません。 環境変数は、実行環境のシェルでステップが実行されるまで挿入されないからです。

条件付きステップは、通常のステップがパラメーター値を入力として使用できる箇所ならどこにでも配置することができます。

たとえば、`myorb/foo: { dostuff: true }` として呼び出された場合*には*一連のステップを実行するが、`myorb/foo: { dostuff: false }` として呼び出された場合は実行しないといったコマンドを Orb で定義できます。

さらに、Orb の作成者であれば、ジョブまたはコマンドの `steps` キーで条件付きステップを定義することもできます。

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

### **`when` ステップ**
{: #the-when-step }

`when` キー配下ではサブキーとして `condition` と `steps` が使えます。 `steps` サブキーは、条件が true 値であると評価された場合にのみ実行されます。

| キー        | 必須 | タイプ   | 説明                                                              |
| --------- | -- | ----- | --------------------------------------------------------------- |
| condition | ○  | ロジック  | [ロジック ステートメント](/docs/configuration-reference/#logic-statements) |
| ステップ      | ○  | シーケンス | 条件が true 値のときに実行するステップのリスト                                      |
{: class="table table-striped"}

### **`unless` ステップ**
{: #the-unless-step }

`unless` キーの下に、`condition` サブキーと `steps` サブキーを記述します。 `steps` サブキーは、条件が false 値であると評価された場合にのみ実行されます。

| キー        | 必須 | タイプ   | 説明                                                              |
| --------- | -- | ----- | --------------------------------------------------------------- |
| condition | ○  | ロジック  | [ロジック ステートメント](/docs/configuration-reference/#logic-statements) |
| ステップ      | ○  | シーケンス | 条件が false 値のときに実行するステップのリスト                                     |
{: class="table table-striped"}

## インライン Orb の作成
{: #writing-inline-orbs }

再利用可能な設定ファイル要素を設定ファイル内で直接定義する場合、それらの要素をインライン Orb 内にラップすることもできます。 インライン Orb は、開発に役立つほか、ローカル設定ファイル内で名前を共有する要素の名前空間を作成するときにも便利です。

インライン Orb を記述するには、設定ファイル内の Orb 宣言セクションにその Orb のキーを置き、その下に Orb エレメントを置きます。 For example, if you want to import one orb to use inside another inline orb, the config could look like the example shown below, in which the inline orb `my-orb` imports the `node` orb:

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

- Refer to [Sample Configurations](/docs/sample-config/) for some sample configurations that you can use in your own CircleCI configuration.
- Refer to [Database Examples](/docs/postgres-config/) for database examples you can use in your CircleCI configuration.
