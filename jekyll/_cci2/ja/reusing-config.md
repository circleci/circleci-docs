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

* (任意) `circleci config process` コマンドにアクセスできるように、CircleCI CLI をインストールします 。 このコマンドを使用すると、再利用なキーがすべて処理された展開後の設定ファイルを確認できます。 インストール方法と詳しい使い方については、ドキュメント「[CircleCI のローカル CLI の使用]({{ site.baseurl }}/2.0/local-cli/)」を参照してください。

* CircleCI 設定ファイルの要素を再利用するには、**`version: 2.1`** の `.circleci/config.yml` ファイルを使用する必要があります。

* コマンド、ジョブ、Executor、パラメーターの名前はアルファベットで始める必要があります。名前に含めることができるのは小文字 (`a` ～ `z`)、数字 (`0` ～ `9`)、アンダースコア (`_`)、ハイフン (`-`) だけです。

## `parameters` 宣言の使用
{: #using-the-parameters-declaration }

Parameters are declared by name under a job, command, or executor. The immediate children of the `parameters` key are a set of keys in a map. Pipeline parameters are defined at the top level of a project configuration. See the [Pipeline Variables guide]({{ site.baseurl }}/2.0/pipeline-variables/#pipeline-parameters-in-configuration) for more information on Pipeline Parameters.

In the following example, a command named `greeting` is designed with a single parameter named `to`. The `to` parameter is used within the steps to echo _Hello_ back to the user.

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

A parameter can have the following keys as immediate children:

| Key Name    | Description                                                                                   | Default value |
| ----------- | --------------------------------------------------------------------------------------------- | ------------- |
| description | Optional. Used to generate documentation for your orb.                                        | N/A           |
| type        | Required. See **Parameter Types** in the section below for details.                           | N/A           |
| default     | The default value for the parameter. If not present, the parameter is implied to be required. | N/A           |
{: class="table table-striped"}

### パラメーター型
{: #parameter-types }

This section describes the types of parameters and their usage.

The parameter types supported by orbs are:
* `string`
* `boolean`
* `integer`
* `enum`
* `executor`
* `steps`
* 環境変数名

The parameter types supported by pipeline parameters are:
* `string`
* `boolean`
* `integer`
* `enum`

#### 文字列
{: #string }
{:.no_toc}

Basic string parameters are described below:

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

Strings must be enclosed in quotes if they would otherwise represent another type (such as boolean or number) or if they contain characters that have special meaning in YAML, particularly for the colon character. In all other instances, quotes are optional. Empty strings are treated as a falsy value in evaluation of `when` clauses, and all other strings are treated as truthy. Using an unquoted string value that YAML interprets as a boolean will result in a type error.

#### ブール値
{: #boolean }
{:.no_toc}

Boolean parameters are useful for conditionals:

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

Boolean parameter evaluation is based on the [values specified in YAML 1.1](http://yaml.org/type/bool.html):

* true と評価されるもの: `y`、`yes`、`true`、`on`
* false と評価されるもの: `n`、`no`、`false`、`off`

Capitalized and uppercase versions of the above values are also valid.

#### 整数
{: #integer }
{:.no_toc}

Use the parameter type `integer` to pass a numeric integer value. The following example uses the `integer` type to populate the value of `parallelism` in a job.

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

The `enum` parameter may be a list of any values. Use the `enum` parameter type when you want to enforce that the value must be one from a specific set of string values. The following example uses the `enum` parameter to declare the target operating system for a binary.

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

The following `enum` type declaration is invalid because the default is not declared in the enum list.

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

Use an `executor` parameter type to allow the invoker of a job to decide what executor it will run on.

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

Steps are used when you have a job or command that needs to mix predefined and user-defined steps. When passed in to a command or job invocation, the steps passed as parameters are always defined as a sequence, even if only one step is provided.

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

The following example demonstrates that steps passed as parameters are given as the value of a `steps` declaration under the job's `steps`.

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

The above will resolve to the following:

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

The environment variable name (`env_var_name`) parameter is a string that must match a POSIX_NAME regexp (for example, there can be no spaces or special characters). The `env_var_name` parameter is a more meaningful parameter type that enables CircleCI to check that the string that has been passed can be used as an environment variable name. For more information on environment variables, see the guide to [Using Environment Variables]({{ site.baseurl }}/2.0/env-vars/).

The example below shows you how to use the `env_var_name` parameter type for deploying to AWS S3 with a reusable `build` job. This example shows using the `AWS_ACCESS_KEY` and `AWS_SECRET_KEY` environment variables with the `access-key` and `secret-key` parameters. So, if you have a deploy job that runs the `s3cmd`, it is possible to create a reusable command that uses the needed authentication, but deploys to a custom bucket.

{% raw %}

Original `config.yml` file:
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

New `config.yml` file:

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

Commands are declared under the `commands` key of a `config.yml` file. The following example defines a command called `sayhello`, which accepts a string parameter `to`:

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

| Key         | Required | Type     | Description                                                                                                                       |
| ----------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| steps       | Y        | Sequence | A sequence of steps that run inside the job that calls the command.                                                               |
| parameters  | N        | Map      | A map of parameter keys. See the [Parameter Syntax]({{ site.baseurl }}/2.0/reusing-config/#parameter-syntax) section for details. |
| description | N        | String   | A string that describes the purpose of the command. Used for generating documentation.                                            |
{: class="table table-striped"}

### 再利用可能なコマンドの呼び出し
{: #invoking-reusable-commands }

Reusable commands are invoked with specific parameters as steps inside a job. When using a command, the steps of that command are inserted at the location where the command is invoked. Commands may only be used as part of the sequence under `steps` in a job.

The following example uses the same command from the previous example – `sayhello` – and invokes it in the job `myjob`, passing it a value for the `to` parameter:

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

Commands can use other commands in the scope of execution. For instance, if a command is declared inside an orb it can use other commands in that orb. It can also use commands defined in other orbs that you have imported (for example `some-orb/some-command`).

### 特別なキー
{: #special-keys }

CircleCI has several special keys available to all [circleci.com](https://circleci.com) customers and available by default in CircleCI server installations. Examples of these keys are:

  * `checkout`
  * `setup_remote_docker`
  * `persist_to_workspace`

**Note:** It is possible to override the special keys with a custom command.

### コマンドの使用例
{: #commands-usage-examples }

The following is an example of part of the `aws-s3` orb where a command called `sync` is defined:

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

To invoke this `sync` command in your 2.1 `.circleci/config.yml` file, see the following example:

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

Defining a `build` job:

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

Executors define the environment in which the steps of a job will be run. When declaring a `job` in CircleCI configuration, you define the type of execution environment (`docker`, `machine`, `macos`. etc.) to run in, as well as any other parameters for that environment, including: environment variables to populate, which shell to use, what size `resource_class` to use, etc.

Executor declarations outside of `jobs` can be used by all jobs in the scope of that declaration, allowing you to reuse a single executor definition across multiple jobs.

An executor definition includes one or more of the following keys:

- `docker`、`machine`、`macos`
- `environment`
- `working_directory`
- `shell`
- `resource_class`

In the following example `my-executor` is used for running the job `my-job`.

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

| Key               | Required         | Type   | Description                                                                                                                                                                                                                                                                                                        |
| ----------------- | ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| docker            | Y <sup>(1)</sup> | List   | Options for `docker` executor.                                                                                                                                                                                                                                                                                     |
| resource_class    | N                | String | Amount of CPU and RAM allocated to each container in a job. (Only available with the `docker` executor) **Note:** A paid account is required to access this feature. Customers on paid container-based plans can request access by [opening a support ticket](https://support.circleci.com/hc/en-us/requests/new). |
| machine           | Y <sup>(1)</sup> | Map    | Options for `machine` executor.                                                                                                                                                                                                                                                                                    |
| macos             | Y <sup>(1)</sup> | Map    | Options for `macOS` executor.                                                                                                                                                                                                                                                                                      |
| shell             | N                | String | Shell to use for execution command in all steps. Can be overridden by `shell` in each step.                                                                                                                                                                                                                        |
| working_directory | N                | String | The directory in which to run the steps.                                                                                                                                                                                                                                                                           |
| environment       | N                | Map    | A map of environment variable names and values.                                                                                                                                                                                                                                                                    |
{: class="table table-striped"}

Example:

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
