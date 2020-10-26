---
layout: classic-docs
title: "Orbs リファレンス ガイド"
short-title: "Orbs リファレンス"
description: "CircleCI 2.1 Orbs のリファレンス ガイド"
categories:
  - configuration
order: 1
---

[.circleci/config.yml]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルのバージョンを指定し、Orb、コマンド、ジョブ、および Executor を再利用する方法について説明します。

- 目次
{:toc}

## 設定ファイル再利用の基本作業
{:.no_toc}

1. **[Add Projects (プロジェクトの追加)]** ページで新規のプロジェクトを追加するか、 既存のプロジェクトで **[Settings (設定)] > [Projects (プロジェクト)]** を選択し、歯車アイコンをクリックします。そして **[Advanced Settings (詳細設定)]** を開き、ラジオ ボタンでパイプラインを有効にします。 ![パイプラインの有効化]({{ site.baseurl }}/assets/img/docs/enable_pipelines.png) このラジオ ボタンが使用できない場合、プロジェクトでは既にパイプラインが使用されています。

2. (オプション) 「[CircleCI のローカル CLI の使用]({{ site.baseurl }}/ja/2.0/local-cli/)」の説明に従って、CircleCI-Public CLI をインストールします。 再利用可能な設定ファイルを確認するときには、`circleci config process` コマンドを使用すると便利です。

3. `.circleci/config.yml` ファイルで `version` キーを 2.1 に変更し、変更をコミットしてビルドをテストします。 新しいパイプラインを使用したプロジェクトのビルドが成功したことを確認してから、新しい 2.1 キーを設定ファイルに追加してください。

4. GitHub リポジトリまたは Bitbucket リポジトリにプッシュして、新しい構成でビルドを実行します。 新しいパイプライン サービスを使用した実行が、ジョブ ページに表示されます。

パイプラインを有効化し、`.circleci/config.yml` ファイルでバージョン 2.1 を使用して、ビルドが正常に実行されると、新しいキーを追加して設定ファイルを再利用したり、同じジョブを異なるパラメーターで何度も実行したり (ジョブを再利用したり) することができます。

## 再利用可能なコマンドのオーサリング

再利用可能なコマンドは、直下に置かれた以下の子キーをマップとして持つことができます。

- **description:** コマンドの目的を説明する文字列 (オプション)。ドキュメントの生成に使用されます。
- **parameters:** パラメーター キーのマップ (オプション)。それぞれのキーは `parameter` の仕様に準拠します。
- **steps:** コマンドの呼び出し元のジョブ内で実行される一連のステップ (必須)。

コマンド、ジョブ、Executor、およびパラメーターの名前には、小文字のアルファベット (a-z)、数字、アンダーバー (_)、およびハイフン (-) のみを使用し、文頭は必ず文字から始めなければなりません。

### **`commands` キー**

コマンド定義は、ジョブ内で実行されるステップのシーケンスをマップとして定義し、複数のジョブで 1 つのコマンド定義を再利用できるようにします。

| キー          | 必須 | タイプ   | 説明                                                                                                   |
| ----------- | -- | ----- | ---------------------------------------------------------------------------------------------------- |
| steps       | ○  | シーケンス | コマンドの呼び出し元のジョブ内で実行される一連のステップ。                                                                        |
| parameters  | ×  | マップ   | パラメーター キーのマップ。 詳細については「[パラメーターの構文]({{ site.baseurl }}/ja/2.0/reusing-config/#パラメーターの構文)」セクションを参照してください。 |
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

CircleCI では、すべての [circleci.com](https://circleci.com/ja/) ユーザーが利用できる特別なキーが複数提供されており、CircleCI Server でデフォルトで使用できます。 その一部をご紹介します。

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

Executor は、ジョブのステップが実行される環境を定義します。 CircleCI の構成で `job` を宣言するとき、実行環境のタイプ (`docker`、`machine`、`macos` など) を定義すると共に、 挿入する環境変数、使用するシェル、使用する `resource_class` のサイズなどの環境パラメーターを定義します。

設定ファイル内の `jobs` の外側で宣言された Executor は、その宣言のスコープ内のすべてのジョブで使用できるため、1 つの Executor 定義を複数のジョブで再利用できます。

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
| working_directory | ×                | 文字列 | ステップを実行するディレクトリ。                                                                                                                                                                                          |
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

- 文字列
- ブール値
- 整数
- 列挙
- Executor
- ステップ
- 環境変数名

パイプライン パラメーターでは以下のパラメーター型がサポートされます。

- 文字列
- ブール値
- 整数
- 列挙

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

引用符で囲まれていないと他の型 (ブール値、数値など) を表してしまう文字列、または YAML で特別な意味を持つ文字 (特にコロン) を含む文字列は、引用符で囲む必要があります。 その他の文字列インスタンスでは、引用符の使用は任意です。 空文字列は、`when` 節を評価するときに false 値として扱われます。その他の文字列はすべて true 値として扱われます。 なお、YAML がブール値として解釈する文字列値を引用符なしで使用すると、型エラーが発生します。

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

環境変数名 (`env_var_name`) パラメーターは文字列で、POSIX_NAME 正規表現 (スペースや特殊文字の使用不可など) に適合している必要があります。 `env_var_name` パラメーターは、追加のチェックを実施できるという点で便利なパラメーター型です。詳細については、[環境変数の使用に関するドキュメント]({{ site.baseurl }}/ja/2.0/env-vars/)を参照してください。

以下の例は、再利用可能な `build` ジョブで AWS S3 にデプロイする場合の `env_var_name` パラメーター型の使用方法を示しています。 この例では、`AWS_ACCESS_KEY` および `AWS_SECRET_KEY` 環境変数に `access-key` および `secret-key` パラメーターを指定して使用しています。 したがって、`s3cmd` を実行するデプロイ ジョブがある場合、必要な認証を使用しつつもカスタム バケットにデプロイする再利用可能コマンドを作成することが可能です。

{% raw %}
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

元の `config.yml` ファイル

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

必要なパラメーターをサブキーとしてジョブに渡すことで、`config.yml` のワークフロー スタンザ内で、同じジョブを複数回呼び出すことができます。 使用されている構文の詳細については、上記のパラメーターに関するセクションを参照してください。

`config.yml` でパラメーター化されたジョブを定義して呼び出す例

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

**メモ:** 1 つのワークフロー内での複数回のジョブの呼び出しや、ジョブ内のパラメーターは、バージョン 2.1 以上の構成で使用可能です。

### Orb でのジョブの定義

Orb 内で宣言されているジョブは、その Orb 内のコマンドおよびグローバル コマンドを使用できます。 ジョブ宣言のスコープ外のコマンドを呼び出すことはできません。

**hello-orb**

```yaml
version: 2.1
# hello-orb の yaml (一部)
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
{:.no_toc}

Executor でパラメーターを使用するには、Executor の下でパラメーターを定義します。 Executor を呼び出すときは、`executor:` 宣言の下で、キーのマップ (各キーが渡されるパラメーターの値を持つ) としてパラメーターのキーを渡します。

Executor 内のパラメーターには、`string`、`enum`、または `boolean` 型を使用できます。 デフォルト値は、オプションの `default` キーを使用して指定できます。

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

上記は以下のとおり解決されます。

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

パラメーターは、パラメーターを定義したジョブまたはコマンド内でのみ有効です。 ジョブまたはコマンドから呼び出し元のコマンドにパラメーターを渡す場合は、明示的に渡す必要があります。

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
{:.no_toc}

1 つの構成で 1 つのジョブが複数回呼び出されることがあります。 ビルドのインジェスト中に構成を処理するとき、ジョブに名前が付けられていないと、CircleCI では自動的に名前が生成されます。または、`name` キーを使用して、重複するジョブに明示的に名前を付けることもできます。

**メモ:** 繰り返しジョブがワークフロー内の別のジョブのアップストリームになければならない場合は、その繰り返しジョブに明示的に名前を付ける必要があります。 たとえば、ワークフロー内のジョブ呼び出しの `requires` キーの下で使用されるジョブには、明示的に名前を付ける必要があります。

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
      # Tsaygoodbye がジョブ依存関係としてこのジョブを要求しているため、このジョブには明示的な名前が必要です
      - sayhello:
          name: SayHelloChad
          saywhat: Chad
      # 明示的に定義された "sayhello" を使用します
      - saygoodbye:
          requires:
            - SayHelloChad
```

### 事前・事後ステップの使用
{:.no_toc}

すべてのジョブ呼び出しは、オプションで 2 つの特別な引数、`pre-steps` と `post-steps` を受け取ることができます。 `pre-steps` の下のステップは、ジョブ内の他のすべてのステップよりも前に実行されます。 `post-steps` の下のステップは、他のすべてのステップよりも後に実行されます。

事前・事後ステップを使用すると、特定のジョブ内で、そのジョブを変更せずにいくつかのステップを実行できます。 これは、たとえば、ジョブの実行前にカスタムのセットアップ ステップを実行したいときに便利です。

### 事前・事後ステップの定義
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

**メモ:** ジョブ内の `pre-steps` キーと `post-steps` キーは、バージョン 2.1 以上の構成で使用可能です。

## 条件付きステップの定義

条件付きステップを使用すると、`condition` が満たされた場合にのみ実行されるステップを定義できます。

たとえば、`myorb/foo: { dostuff: true }` として*呼び出された場合*には一連のステップを実行するが、`myorb/foo: { dostuff: false }` として呼び出された場合は実行しないといったコマンドを Orb で定義できます。

こうした条件は、ワークフローが実際に実行される前にチェックされます。 そのため、たとえば条件を使用して環境変数をチェックすることはできません。

条件付きステップは、通常のステップがパラメーター値を入力として使用できる箇所ならどこにでも配置することができます。

たとえば、Orb のオーサーは、ジョブまたはコマンドの `steps` キーで条件付きステップを定義できます。

条件付きステップは、`when` キーまたは `unless` キーを含むステップで構成されます。 この条件付きキーの下に、`steps` サブキーと `condition` サブキーを配置します。 when または unless ロジックを使用して `condition` が満たされると、`steps` サブキーが実行されます。

`condition` は、設定ファイルが処理されるときに `true` または `false` として評価される単一の値です。環境変数は、実行環境のシェルでステップが実行されるまで挿入されないため、環境変数を条件として使用することはできません。 パラメーターは、条件として使用できます。 空文字列は、`when` 条件内で false として解決されます。

### 例
{:.no_toc}

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
```

**メモ:** `condition` と `unless` はどちらも `true` または `false` を受け付けます。 値は、上記のパラメーターを使用して `true` または `false` という値で提供されます。 また、`when` はその値が `true` の場合にのみ実行され、`unless` はその値が `false` の場合にのみ実行されます。

**メモ:** 条件付きステップは、バージョン 2.1 以上の構成で使用可能です。

##### **`when` ステップ**

条件付きステップは、`when` キーまたは `unless` キーを含むステップで構成されます。 `when` キーの下に、`condition` サブキーと `steps` サブキーを記述します。 `when` ステップの目的は、コマンドやジョブの構成が、ワークフローの実行前にチェックされるカスタム条件 (設定ファイルのコンパイル時に決定) に基づいて実行されるようにカスタマイズすることです。

| キー        | 必須 | タイプ   | 説明                        |
| --------- | -- | ----- | ------------------------- |
| condition | ○  | 文字列   | パラメーター値                   |
| steps     | ○  | シーケンス | 条件が true のときに実行されるステップの一覧 |
{: class="table table-striped"}

###### *例*

    version: 2.1
    
    jobs: # 条件付きステップは `commands:` でも定義できます
      job_with_optional_custom_checkout:
        parameters:
          custom_checkout:
            type: string
            default: ""
        machine: true
        steps:
    
          - when:
              condition: <<parameters.custom_checkout>>
              steps:
                - run: echo "my custom checkout"
          - unless:
              condition: <<parameters.custom_checkout>>
              steps:
                - checkout
    workflows:
      build-test-deploy:
        jobs:
          - job_with_optional_custom_checkout:
              custom_checkout: "any non-empty string is truthy"
          - job_with_optional_custom_checkout
    

## 関連項目

- CircleCI で使用できる構成例は、「[2.0 config.yml のサンプル ファイル]({{site.baseurl}}/ja/2.0/sample-config/)」でご覧いただけます。
- 設定ファイル内で CircleCI Orbs を使用するための詳しいレシピは、「[構成クックブック]({{site.baseurl}}/ja/2.0/configuration-cookbook/)」で紹介しています。
- CircleCI で使用できるデータベースの構成例については、[データベースの構成例]({{site.baseurl}}/ja/2.0//postgres-config/)」を参照してください。
