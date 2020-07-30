---
layout: classic-docs
title: "Reusable Config Reference Guide"
short-title: "Reusable Config Reference"
description: "Reference guide for CircleCI 2.1 Configuration"
categories:
  - configuration
order: 1
---

This reusable config reference page describes how to version your [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file and get started with reusable commands, jobs, executors and orbs.

- 目次
{:toc}

## 設定ファイル再利用の基本作業
{:.no_toc}

1. Add your project on the **Add Projects** page if it is a new project.

2. (オプション) 「[CircleCI のローカル CLI の使用]({{ site.baseurl }}/2.0/local-cli/)」の説明に従って、CircleCI-Public CLI をインストールします。 The `circleci config process` command is helpful for checking a reusable config.

3. `.circleci/config.yml` ファイルで `version` キーを 2.1 に変更し、変更をコミットしてビルドをテストします。 新しいパイプラインを使用したプロジェクトのビルドが成功したことを確認してから、新しい 2.1 キーを設定ファイルに追加してください。

4. GitHub リポジトリまたは Bitbucket リポジトリにプッシュして、新しい構成でビルドを実行します。 新しいパイプライン サービスを使用した実行が、ジョブ ページに表示されます。

パイプラインを有効化し、`.circleci/config.yml` ファイルでバージョン 2.1 を使用して、ビルドが正常に実行されると、新しいキーを追加して設定ファイルを再利用したり、同じジョブを異なるパラメーターで何度も実行したり (ジョブを再利用したり) することができます。

## 再利用可能なコマンドのオーサリング

A reusable command may have the following immediate child keys as a map:

- **description:** コマンドの目的を説明する文字列 (オプション)。ドキュメントの生成に使用されます。
- **parameters:** パラメーター キーのマップ (オプション)。それぞれのキーは `parameter` の仕様に準拠します。
- **steps:** コマンドの呼び出し元のジョブ内で実行される一連のステップ (必須)。

Command, job, executor, and parameter names must start with a letter and can only contain lowercase letters (`a`-`z`), digits (`0`-`9`), underscores (`_`) and hyphens (`-`).

### **`commands` キー**

コマンド定義は、ジョブ内で実行されるステップのシーケンスをマップとして定義し、複数のジョブで 1 つのコマンド定義を再利用できるようにします。

| キー          | 必須 | タイプ   | 説明                                                                                                   |
| ----------- | -- | ----- | ---------------------------------------------------------------------------------------------------- |
| steps       | ○  | シーケンス | コマンドの呼び出し元のジョブ内で実行される一連のステップ。                                                                        |
| parameters  | ×  | マップ   | パラメーター キーのマップ。 詳細については「[パラメーターの構文]({{ site.baseurl }}/2.0/reusing-config/#パラメーターの構文)」セクションを参照してください。 |
| description | ×  | 文字列   | コマンドの目的を記述する文字列。                                                                                     |
{: class="table table-striped"}

コマンドは、`config.yml` ファイルの `commands` キーの下で宣言されます。 以下の例では、`sayhello` というコマンドを定義しています。

```yaml
version: 2.1
commands:
  sayhello:
    description: "デモ用のごく簡単なコマンド"
    parameters:
      to:
        type: string
        default: "Hello World"
    steps:
      - run: echo << parameters.to >>
```

**メモ:** `commands` スタンザは、バージョン 2.1 以上の構成で使用可能です。

## 再利用可能なコマンドの呼び出し
{:.no_toc}

再利用可能なコマンドは、ジョブ内のステップとして、特定のパラメーターを使用して呼び出されます。 コマンドを使用すると、そのコマンドのステップが、コマンドが呼び出される場所に挿入されます。 コマンドは、ジョブ内の `steps` の下に置かれたシーケンスの一部としてのみ使用できます。

以下の例では、コマンド `sayhello` を呼び出し、それをパラメーター `to` に渡しています。

```yaml
version: 2.1
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - sayhello:
          to: "Lev"
```

### コマンド内での他のコマンドの呼び出し
{:.no_toc}

コマンドは、実行のスコープ内で他のコマンドを使用することができます。

たとえば、Orb 内で宣言されているコマンドは、その Orb 内で他のコマンドを使用可能です。 また、インポートした他の Orb で定義されているコマンド (`some-orb/some-command` など) も使用できます。

## 特別なキー

CircleCI では、すべての [circleci.com](http://circleci.com/ja) ユーザーが利用できる特別なキーが複数提供されており、CircleCI Server でデフォルトで使用できます。 その一部をご紹介します。

- `checkout`
- `setup_remote_docker`
- `persist_to_workspace`

**メモ:** 特別なキーはカスタム コマンドでオーバーライドできます。

## 例

以下に、`sync` というコマンドを定義する `aws-s3` Orb の一部を例として示します。

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

`sync` というコマンドの定義は、2.1 の `.circleci/config.yml` ファイルでは以下のとおり呼び出されます。

```yaml
version: 2.1
orbs:
  aws-s3: circleci/aws-s3@1.0.0

workflows:
  build-test-deploy:
    jobs:

      - deploy2s3: # 上記で定義されるサンプル ジョブ
        steps:
          - aws-s3/sync:
              from: .
              to: "s3://mybucket_uri"
              overwrite: true
```

`build` ジョブは以下のように定義されます。

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

Executor は、ジョブのステップが実行される環境を定義します。 CircleCI の構成で `job` を宣言するとき、実行環境のタイプ (`docker`、`machine`、`macos` など) を定義すると共に、 etc.) to run in, as well as any other parameters of that environment, including: environment variables to populate, which shell to use, what size `resource_class` to use, etc.

Executor declarations in a config outside of `jobs` can be used by all jobs in the scope of that declaration, allowing you to reuse a single executor definition across multiple jobs.

Executor 定義には、以下のキーが 1 つ以上含まれます。

- `docker`、`machine`、`macos` のいずれか
- `environment`
- `working_directory`
- `shell`
- `resource_class`

以下の例では、`executor` キーの単一の値として `my-executor` が渡されます。

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.5.1-node-browsers
jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

**メモ:** 再利用可能な `executor` 宣言は、バージョン 2.1 以上の構成で使用可能です。

## **`executors`**

Executor は、ジョブのステップが実行される環境を定義します。複数のジョブで 1 つの Executor 定義を再利用できます。

| キー                | 必須               | タイプ | 説明                                                                                                                                                                                                        |
| ----------------- | ---------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker            | ○ <sup>(1)</sup> | リスト | `docker` Executor のオプション。                                                                                                                                                                                 |
| resource_class    | ×                | 文字列 | ジョブ内の各コンテナに割り当てられる CPU と RAM の量 (`docker` Executor でのみ使用可能)。**メモ:** この機能にアクセスするには有償アカウントが必要です。 有料コンテナベース プランのユーザーは、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)して機能へのアクセスをリクエストできます。 |
| machine           | ○ <sup>(1)</sup> | マップ | `machine` Executor のオプション。                                                                                                                                                                                |
| macos             | ○ <sup>(1)</sup> | マップ | `macOS` Executor のオプション。                                                                                                                                                                                  |
| shell             | ×                | 文字列 | すべてのステップで実行コマンドに使用するシェル。 `shell` によって各ステップでオーバーライドできます。                                                                                                                                                   |
| working_directory | ×                | 文字列 | The directory in which to run the steps.                                                                                                                                                                  |
| environment       | ×                | マップ | 環境変数名と値のマップ。                                                                                                                                                                                              |
{: class="table table-striped"}

以下に例を示します。

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.5.1-node-browsers

jobs:
  my-job:
    executor: my-executor
    steps:

      - run: echo outside the executor
```

## 再利用可能な Executor の呼び出し
{:.no_toc}

以下の例では、`executor` の下の `name` キーの値として `my-executor` を渡しています。この方法は主に、Executor の呼び出しにパラメーターを渡す場合に使用されます。

```yaml
version: 2.1
jobs:
  my-job:
    executor:
      name: my-executor
    steps:
      - run: echo outside the executor
```

Orb のすべてのコマンドが使用する Executor を Orb で定義することも可能です。 これにより、Orb のオーサーが定義した実行環境内で、その Orb のコマンドを実行できます。

### config.yml で宣言した Executor を複数のジョブで使用する例
{:.no_toc}

以下の例では、1 つの Executor を宣言し、2 つのジョブで呼び出しています。これらのジョブは、共通の環境変数を使用し、同じ Docker イメージと作業ディレクトリで実行されます。 各ジョブのステップは異なりますが、同じ環境で実行されます。

```yaml
version: 2.1
executors:
  lein_exec: # 再利用可能な Executor を宣言します
    docker:
      - image: clojure:lein-2.8.1
    working_directory: ~/project
    environment:
      MYSPECIALVAR: "my-special-value"
      MYOTHERVAR: "my-other-value"
jobs:
  build:
    executor: lein_exec
    steps:
      - checkout
      - run: echo "hello world"  
  test:
    executor: lein_exec
    environment:
      TESTS: unit
    steps:
      - checkout
      - run: echo "how are ya?"
```

他の Orb の Executor も参照できます。 Orb のユーザーは、その Orb の Executor を呼び出すことができます。 たとえば、`foo-orb` で `bar` Executor を定義できます。

```yaml
version: 2.1
# foo-orb の yaml
executors:
  bar:
    machine: true
    environment:
      RUN_TESTS: foobar
```

`baz-orb` でも `bar` Executor を定義できます。

```yaml
version: 2.1
# baz-orb の yaml
executors:
  bar:
    docker:
      - image: clojure:lein-2.8.1
```

以下の設定ファイルでは、両方の Executor を使用しています。

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

**メモ:** `foo-orb/bar` と `baz-orb/bar` は、異なる Executor です。 どちらも、それぞれの Orb に対して相対的なローカル名 `bar` を持ちますが、独立した Executor であり、異なる Orb で定義されています。

### Executor 呼び出し時のキーのオーバーライド
{:.no_toc}

`job` で Executor を呼び出すと、ジョブ自体に含まれるキーは、呼び出された Executor のキーをオーバーライドします。 たとえば、ジョブで `docker` スタンザが宣言されている場合は、その Docker が Executor の Docker の代わりにジョブ全体で使用されます。

**メモ:** `environment` 変数のマップは付加的です。 `executor` に `job` と同じ `environment` 変数がある場合は、ジョブの値が使用されます。 以下の構成を例に考えます。

```yaml
version: 2.1
executors:
  python:
    docker:
      - image: python:3.7.0
      - image: rabbitmq:3.6-management-alpine
    environment:
      ENV: ci
      TESTS: all
    shell: /bin/bash    
    working_directory: ~/project
jobs:
  build:
    docker:
      - image: python:2.7.15
      - image: postgres:9.6
    executor: python
    environment:
      TESTS: unit
    working_directory: ~/tests
```

上記の設定ファイルは以下のとおり解決されます。

```yaml
version: 2.1
jobs:
 build:
   steps: []
   docker:
     - image: python:2.7.15    # ジョブの値を使用
     - image: postgres:9.6     # ジョブの値を使用
   environment:                # 以下のとおりマージされる
     ENV: ci                     # Executor の値を使用
     TESTS: unit                 # ジョブの値を使用
   shell: /bin/bash            # Executor の値を使用
   working_directory: ~/tests  # ジョブの値を使用
```

## `parameters` 宣言の使用

パラメーターは、ジョブ、コマンド、または Executor の下で名前で宣言します。 `parameters` キーの直下の子は、マップ内のキー セットです。

以下の例では、`sync` というコマンドを定義しています。

```yaml
version: 2.1
commands: # パラメーター付きの再利用可能コマンド
  sync:
    parameters:
      from:
        type: string
      to:
        type: string
      overwrite:
        default: false
        type: boolean
    steps:
      - run: # パラメーター化された run ステップ
          name: S3 へのデプロイ
          command: "aws s3 sync << parameters.from >> << parameters.to >><<# parameters.overwrite >> --delete<</ parameters.overwrite >>"
executors: # 再利用可能な Executor
  aws:
    docker:
      - image: cibuilds/aws:1.15
jobs: # `aws` Executor と `sync` コマンドを呼び出すジョブ
  deploy2s3:
    executor: aws
    steps:
      - sync:
          from: .
          to: "s3://mybucket_uri"
          overwrite: true
```

**メモ:** `parameters` 宣言は、バージョン 2.1 以上の構成で使用可能です。

### パラメーターの構文
{:.no_toc}

パラメーターは、以下のキーを直下の子として持つことができます。

| キー名         | 説明                                              | デフォルト値 |
| ----------- | ----------------------------------------------- | ------ |
| description | オプションのキー。 Orb のドキュメントを生成するために使用されます。            | N/A    |
| type        | 必須のキー。 詳細については、以下の「**パラメーター型**」セクションを参照してください。  | N/A    |
| default     | パラメーターのデフォルト値。 このキーがない場合は、パラメーターが必須であることを意味します。 | N/A    |
{: class="table table-striped"}

### パラメーター型
{:.no_toc}

このセクションでは、パラメーターの型と使用方法について説明します。

Orb では以下のパラメーター型がサポートされます。

- `string`
- `boolean`
- `integer`
- `enum`
- `executor`
- `steps`
- 環境変数名

パイプライン パラメーターでは以下のパラメーター型がサポートされます。

- `string`
- `boolean`
- `integer`
- `enum`

#### 文字列
{:.no_toc}

基本的な文字列パラメーターについて、以下で説明します。

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

Strings must be enclosed in quotes if they would otherwise represent another type (such as boolean or number) or if they contain characters that have special meaning in YAML, particularly for the colon character. その他の文字列インスタンスでは、引用符の使用は任意です。 空文字列は、`when` 節を評価するときに false 値として扱われます。その他の文字列はすべて true 値として扱われます。 なお、YAML がブール値として解釈する文字列値を引用符なしで使用すると、型エラーが発生します。

#### ブール値
{:.no_toc}

ブール値パラメーターは、条件文で使用すると便利です。

```yaml
version: 2.1
commands:
  list-files:
    parameters:
      all:
        description: すべてのファイルを含めます
        type: boolean
        default: false
    steps:
      - run: ls <<# parameters.all >> -a <</ parameters.all >>
```

ブール値パラメーターの評価は、[YAML の 1.1 で指定している値](http://yaml.org/type/bool.html)に基づいています。

- True: `y`、`yes`、`true`、`on`
- False: `n`、`no`、`false`、`off`

上記の値は、語頭のみ大文字、またはすべて大文字で表記しても有効です。

#### 整数
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
{:.no_toc}

`enum` パラメーターには、任意の値のリストを指定できます。 特定の文字列値のセットに含まれる値だけを使用するように制限したい場合は、`enum` パラメーターを使用します。 以下の例では、`enum` パラメーターを使用して、バイナリのターゲット オペレーティング システムを宣言しています。

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
  bionic:
    docker:
      - image: ubuntu:bionic

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
{:.no_toc}

ステップ型は、ジョブまたはコマンドに、定義済みのステップとユーザー定義のステップを混在させる必要がある場合に使用します。 コマンドまたはジョブの呼び出しに渡すとき、パラメーターとして渡すステップは、提供されるステップが 1 つだけでも必ずシーケンスとして定義します。

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

以下の例では、パラメーターとして渡されるステップが、ジョブの `steps` の下の `steps` 宣言の値として指定されています。

{% raw %}
```yaml
version: 2.1
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

The environment variable name (`env_var_name`) parameter is a string that must match a POSIX_NAME regexp (for example, there can be no spaces or special characters). The `env_var_name` parameter is a more meaningful parameter type that enables additional checks to be performed. See [Using Environment Variables]({{ site.baseurl }}/2.0/env-vars/) for details.

The example below shows you how to use the `env_var_name` parameter type for deploying to AWS S3 with a reusable `build` job. この例では、`AWS_ACCESS_KEY` および `AWS_SECRET_KEY` 環境変数に `access-key` および `secret-key` パラメーターを指定して使用しています。 So, if you have a deploy job that runs the `s3cmd`, it is possible to create a reusable command that uses the needed authentication, but deploys to a custom bucket.

{% raw %}

元の `config.yml` ファイル

```yaml
version: 2.1
jobs:
  build:
    docker:

    - image: ubuntu:latest
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
  version: 2
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

## パラメーター化されたジョブのオーサリング

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

**Note:** The ability to invoke jobs multiple times in a single workflow with parameters is available in configuration version 2.1. When invoking the same job multiple times with parameters across any number of workflows, the build name will be changed (i.e. `sayhello-1` , `sayhello-2`, etc.). To ensure build numbers are not appended, utilize the `name` key. The name you assign needs to be unique, otherwise the numbers will still be appended to the job name. As an example:

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

### Orb でのジョブの定義

If a job is declared inside an orb it can use commands in that orb or the global commands. It is not possible to call commands outside the scope of declaration of the job.

**hello-orb**

```yaml
version: 2.1
# partial yaml from hello-orb
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

### Executor でのパラメーターの使用
{:.no_toc}

To use parameters in executors, define the parameters under the given executor. When you invoke the executor, pass the keys of the parameters as a map of keys under the `executor:` declaration, each of which has the value of the parameter to pass in.

Parameters in executors can be of the type `string`, `enum`, or `boolean`. Default values can be provided with the optional `default` key.

#### パラメーター化された Executor を使用したビルドの構成例
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
      - image: circleci/python:<< parameters.tag >>
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
      - image: circleci/python:2.7
    environment:
      MYPRECIOUS: "myspecialvalue"
```

### パラメーターのスコープ
{:.no_toc}

Parameters are in-scope only within the job or command that defined them. If you want a job or command to pass its parameters to a command it invokes, they must be passed explicitly.

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
          # Since the command "say" doesn't define a default
          # value for the "saywhat" parameter, it must be
          # passed in manually
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
{:.no_toc}

A single configuration may invoke a job multiple times. At configuration processing time during build ingestion, CircleCI will auto-generate names if none are provided or you may name the duplicate jobs explicitly with the `name` key.

**Note:** You must explicitly name repeat jobs when a repeat job should be upstream of another job in a workflow. For example, if a job is used under the `requires` key of a job invocation in a workflow you will need to explicitly name it.

```yaml
version: 2.1
workflows:
  build:
    jobs:
      - loadsay
      # This doesn't need an explicit name as it has no downstream dependencies
      - sayhello:
          saywhat: Everyone
          requires:
            - loadsay
      # This needs an explicit name for saygoodbye to require it as a job dependency
      - sayhello:
          name: SayHelloChad
          saywhat: Chad
      # Uses explicitly defined "sayhello"
      - saygoodbye:
          requires:
            - SayHelloChad
```

### 事前・事後ステップの使用
{:.no_toc}

Every job invocation may optionally accept two special arguments: `pre-steps` and `post-steps`. Steps under `pre-steps` are executed before any of the other steps in the job. The steps under `post-steps` are executed after all of the other steps.

Pre and post steps allow you to execute steps in a given job without modifying the job. This is useful, for example, to run custom setup steps before job execution.

### 事前・事後ステップの定義
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

Conditional steps run only if a condition is met at config-compile time, before a workflow runs. This means, for example, that you may not use a condition to check an environment variable, as those are not injected until your steps are running in the shell of your execution environment.

Conditional steps may be located anywhere a regular step could and may only use parameter values as inputs.

For example, an orb could define a command that runs a set of steps *if* invoked with `myorb/foo: { dostuff: true }`, but not `myorb/foo: { dostuff: false }`.

Furthermore, an orb author could define conditional steps in the `steps` key of a Job or a Command.

```yaml
# inside config.yml
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
      - myjob # The empty string is falsy
```

**Note:** Conditional steps are available in configuration version 2.1 and later.

### **The `when` Step**

Under the `when` key are the subkeys `condition` and `steps`. The subkey `steps` are run only if the condition evaluates to a truthy value.

| キー        | 必須 | タイプ   | 説明                                                                                           |
| --------- | -- | ----- | -------------------------------------------------------------------------------------------- |
| condition | ○  | Logic | [A logic statement](https://circleci.com/docs/2.0/configuration-reference/#logic-statements) |
| steps     | ○  | シーケンス | A list of steps to execute when the condition is truthy.                                     |
{: class="table table-striped"}

### **The `unless` Step**

Under the `unless` key are the subkeys `condition` and `steps`. The subkey `steps` are run only if the condition evaluates to a falsy value.

| Key       | Required | Type     | Description                                                                                  |
| --------- | -------- | -------- | -------------------------------------------------------------------------------------------- |
| condition | Y        | Logic    | [A logic statement](https://circleci.com/docs/2.0/configuration-reference/#logic-statements) |
| steps     | Y        | Sequence | A list of steps to execute when the condition is falsy.                                      |
{: class="table table-striped"}

## 関連項目

- CircleCI で使用できる構成例は、「[2.0 config.yml のサンプル ファイル]({{site.baseurl}}/2.0/sample-config/)」でご覧いただけます。
- 設定ファイル内で CircleCI Orbs を使用するための詳しいレシピは、「[構成クックブック]({{site.baseurl}}/2.0/configuration-cookbook/)」で紹介しています。
- Refer to [Database Examples]({{site.baseurl}}/2.0/postgres-config/) for database examples you can use in your CircleCI configuration.