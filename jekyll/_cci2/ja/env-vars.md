---
layout: classic-docs
title: "Using Environment Variables"
short-title: "Using Environment Variables"
description: "A list of supported environment variables in CircleCI 2.0"
categories:
  - configuring-jobs
order: 40
---
This document describes using environment variables in CircleCI in the following sections:

- TOC {:toc}

## Overview

{:.no_toc}

プロジェクトへのプライベート環境変数の追加は、CircleCI 上のプロジェクトごとの設定ページにある、**Environment Variables** で行えます。 環境変数にセットした実際の値は、ここでいったん設定すると、CircleCI 上では参照も編集もできません。 環境変数の値を変えたいときは、現在の環境変数を削除してから改めて別の値で作成し直してください。 環境変数は個別に追加したり、あるいは他のプロジェクトで定義している変数をインポートして追加したりできます。 また、プライベート環境変数は公開プロジェクトでも隠しておくことが可能です。これに関連する設定については[オープンソースプロジェクトのビルド方法]({{ site.baseurl }}/2.0/oss/)をご覧ください。

### 環境変数使用時のオプション

{:.no_toc}

CircleCI は Bash を使っているため、環境変数には POSIX 命名規則が適用されます。 大文字・小文字のアルファベット、数字、アンダースコアが使用でき、 環境変数の頭文字はアルファベットとします。

CircleCI にセキュアに格納されるシークレットキー・プライベートキーは、設定ファイル内の `run` キーや `environment` キー、あるいは Workflow の `context` キーから変数として参照されることがあります。 環境変数は次の優先順位で使用されます。

1. `run` ステップ内で指定している[シェルコマンド](#setting-an-environment-variable-in-a-shell-command)で宣言されたもの (例：`FOO=bar make install`)。
2. [`run` ステップ内](#setting-an-environment-variable-in-a-step) で `environment` キーを使って宣言されたもの。
3. [ jobs](#setting-an-environment-variable-in-a-job) 内において `environment` キーで定義したもの。
4. [コンテナ](#setting-an-environment-variable-in-a-container)において `environment` キーで定義したもの。
5. Context environment variables (assuming the user has access to the Context). See the [Contexts]({{ site.baseurl }}/2.0/contexts/) documentation for instructions.
6. プロジェクト設定ページで設定した[プロジェクトレベル環境変数](#setting-an-environment-variable-in-a-project)。
7. [CircleCI の定義済み環境変数](#built-in-environment-variables)で解説している特殊な環境変数。

`FOO=bar make install` のような形で `run step` 内のシェルコマンドで宣言された環境変数は、`environment` キーや `contexts` キーで宣言された環境変数を上書きします。 コンテキストページで追加された環境変数はプロジェクト設定ページで追加されたものより優先して使われます。 一番最後に参照されるのは CircleCI の特殊な定義済み環境変数です。

**注：**`.circleci/config.yml` ファイルでは隠したい環境変数を宣言しないようにしてください。 そのプロジェクトにアクセスできるエンジニア全員が `config.yml` ファイルの全文を見ることができます。 隠したい環境変数は CircleCI の[プロジェクト](#setting-an-environment-variable-in-a-project)設定や[コンテキスト]({{ site.baseurl }}/2.0/contexts/)設定で登録するようにしてください。 詳しくは「セキュリティ」ページの[暗号化]({{ site.baseurl }}/2.0/security/#encryption)で解説しています。

設定ファイルでスクリプトを実行した場合も、隠し環境変数が明らかになってしまう可能性があります。 スクリプトのセキュアな活用方法については、[シェルスクリプトの使い方]({{ site.baseurl }}/2.0/using-shell-scripts/#shell-script-best-practices)ページでご確認ください。

### `BASH_ENV` で環境変数を定義する

{:.no_toc}

CircleCI は環境変数をセットする際のインターポレーションに対応していません。 定義されたものはそのまま文字列として扱われます。 これは `working_directory` を定義するときや、`PATH` を書き換えるとき、複数の `run` ステップで変数を共有するときに犯しがちなミスです。

下記の例では `$ORGNAME` と `$REPONAME` はその変数値に置き換えられません。

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

解決手段としては、下記のように `run` ステップ内で `BASH_ENV` などに環境変数をエクスポートする方法があります。

```yaml
steps:
  - run:
      name: 環境変数の設定
      command: |
        echo 'export PATH="$GOPATH/bin:$PATH"' >> $BASH_ENV
        echo 'export GIT_SHA1="$CIRCLE_SHA1"' >> $BASH_ENV
```

CircleCI は `bash` コマンドを用いて、ステップごとにその都度 `BASH_ENV` の内容を取得しています。 これはつまり、`BASH_ENV` の読み込みと実行が自動的に行われ、インターポレーションを可能にし、`run` ステップ間で環境変数を共有できるということです。

**注：**`BASH_ENV` を使ったこの方法は `bash` 上でしか機能しません。 `sh` など他のシェルでは動作しないことに注意してください。 この制約は Docker イメージの OS 選択に影響を与える場合があります。 例えば [Alpine Linux](https://alpinelinux.org/) は `bash` が標準で含まれていないため、先に `bash` をインストールしてからでないと `BASH_ENV` を使った解決方法を実践できません。

## シェルコマンドで環境変数を設定する

CircleCI は環境変数をセットする際のインターポレーションに対応していません。

ただし、[`BASH_ENV` を使う](#using-bash_env-to-set-environment-variables)ことで現在のシェルに対して変数をセットすることはできます。 この方法は、`PATH` の書き換えや他の変数から環境変数の値を参照するときなどに便利です。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
    steps:
      - run:
          name: 実行時の PATH 書き換えおよび環境変数定義
          command: |
            echo 'export PATH=/path/to/foo/bin:$PATH' >> $BASH_ENV
            echo 'export VERY_IMPORTANT=$(cat important_value)' >> $BASH_ENV
            source $BASH_ENV
```

**注：**シェルによっては `~/.tcshrc` や `~/.zshrc` のような初期化ファイルに新しく変数を追加する必要があります。 詳しくはシェルの環境変数設定に関する解説書などを参考にしてください。

## ステップ内で環境変数を設定する

ステップ内で環境変数を設定するには [`environment` キー]({{ site.baseurl }}/2.0/configuration-reference/#run)を使います。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
    steps:
      - checkout
      - run:
          name: 統合の実行
          command: sql/docker-entrypoint.sh sql
          # シェルコマンド用の環境変数
          environment:
            DATABASE_URL: postgres://conductor:@localhost:5432/conductor_test
```

**注：**`run` ステップでは毎回新たなシェルが実行されるため、ステップ間で環境変数を共有することはできません。 2 つ以上のステップから同じ環境変数を参照する場合は、[`BASH_ENV`](#using-bash_env-to-set-environment-variables) を使って変数値をエクスポートするようにしてください。

## ジョブ内で環境変数を設定する

ジョブの中で環境変数を設定するには [`environment` キー]({{ site.baseurl }}/2.0/configuration-reference/#job_name)を使います。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      FOO: bar
```

## コンテナ内で環境変数を設定する

コンテナの中で環境変数を設定するには [`environment` キー]({{ site.baseurl }}/2.0/configuration-reference/#docker--machine--macosexecutor)を使います。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
      - image: circleci/postgres:9.6-jessie
      # プライマリコンテナで実行される全コマンドで有効な環境変数
        environment:
          POSTGRES_USER: conductor
          POSTGRES_DB: conductor_test
```

下記は (1 行目に指定されている) プライマリコンテナイメージ用の環境変数と、セカンダリもしくはサービスコンテナイメージ用の環境変数とを分ける例です。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-jessie
       # プライマリコンテナで実行されるコマンド用の環境変数
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6
```

## コンテキスト内で環境変数を設定する

コンテキストを作成することで複数のプロジェクト間で環境変数の共有が可能になります。 コンテキストで環境変数を設定する方法は[コンテキスト]({{ site.baseurl }}/2.0/contexts/)をご覧ください。

## プロジェクト内で環境変数を設定する

1. In the CircleCI application, go to your project's settings by clicking the gear icon next to your project.

2. In the **Build Settings** section, click on **Environment Variables**.

3. **Import Variables** ボタンをクリックすると他のプロジェクトで定義している変数をインポートできます。 また、**Add Variable** ボタンをクリックすると変数を手動で新規追加できます。 (**注：****Import Variables** ボタンは、プライベートクラウドやデータセンターにインストールした CircleCI では現在利用できません。)

4. Use your new environment variables in your `.circleci/config.yml` file. For an example, see the [Heroku deploy walkthrough]({{ site.baseurl }}/2.0/deployment-integrations/#heroku).

環境変数を作ると CircleCI の設定ページ上では変数値が伏せ字になり、書き換えることはできません。環境変数の値を変更するには、いったん削除してから改めて作成してください。

### 複数行の環境変数のエンコード方法

{:.no_toc}

改行で区切る必要がある複数行の環境変数を定義するには、まずその文字列を `Base64` エンコードします。

```bash
$ echo "foobar" | base64
Zm9vYmFyCg==
```

それから、エンコードした文字列を環境変数に格納します。

```bash
$ echo $MYVAR
Zm9vYmFyCg==
```

変数を利用するコマンドで値をデコードします。

```bash
$ echo $MYVAR | base64 --decode | docker login -u my_docker_user --password-stdin
Login Succeeded
```

**注：**これと同じ手順で全てのコマンドラインプログラムがログイン認証をパスできるわけではありません。例えば `docker` がそうです。

## API に環境変数を代入する方法

ビルドパラメータは環境変数からなります。そのため、その環境変数名は下記の条件を満たしている必要があります。

- They must contain only ASCII letters, digits and the underscore character.
- They must not begin with a number.
- They must contain at least one character.

環境変数における通常の制約の他に、変数値自体に注意すべきところはありません。単純な文字列として扱われるところも変わりありません。 ビルドパラメータが読み込まれる順序は保証**されない**ため、ビルドパラメータの 1 つを別のビルドパラメータに渡すようなインターポレーションは避けてください。 順不同の独立した環境変数リストとしてビルドパラメータを設定するのがおすすめです。

例えば下記のパラメータを処理したとします。

    {
      "build_parameters": {
        "foo": "bar",
        "baz": 5,
        "qux": {"quux": 1},
        "list": ["a", "list", "of", "strings"]
      }
    }
    

ビルド時には下記のような環境変数となります。

    export foo="bar"
    export baz="5"
    export qux="{\"quux\": 1}"
    export list="[\"a\", \"list\", \"of\", \"strings\"]"
    

ビルドパラメータは各ジョブのコンテナ内で環境変数としてエクスポートされ、`config.yml` のスクリプトやプログラム、コマンドで使われることになります。 代入された環境変数はジョブ内のステップの実行内容を変えるのに使われることもあります。 ここで念頭に置いておかなければいけないのは、代入された環境変数は `config.yml` で定義されたものでも、プロジェクトの設定で定義されたものでも、上書きできないことです。

連続的に異なるターゲット OS で機能テストを行うのに、`build_parameters` キーに環境変数を代入したくなることがあります。 例えば、複数の異なるホストに対して機能テストが必要なステージング環境へのデプロイを実行するような場合です。 下記の例のように、`bash` と `curl` を組み合わせ (開発言語にあらかじめ用意されている HTTP ライブラリを使ってもかまいません)、`Content-type: application/json` として JSON フォーマットでデータ送信する形で `build_parameters` を含ませることが可能です。

    {
      "build_parameters": {
        "param1": "value1",
        "param2": 500
      }
    }
    

`curl` の場合は下記のようにします。

    curl \
      --header "Content-Type: application/json" \
      --data '{"build_parameters": {"param1": "value1", "param2": 500}}' \
      --request POST \
      https://circleci.com/api/v1.1/project/github/circleci/mongofinil/tree/master?circle-token=$CIRCLE_TOKEN
    

ここで使われている `$CIRCLE_TOKEN` は [パーソナル API トークン]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-personal-api-token)です。

ビルド時には下記のような環境変数となります。

    export param1="value1"
    export param2="500"
    

API の呼び出しは POST リクエストで実行します。詳細は API リファレンスの [new build]({{ site.baseurl }}/api/v1-reference/#new-build) セクションを参照してください。 パラメータなしで POST リクエストした場合は名前付きブランチが新規で実行されます。

## 定義済み環境変数

下記の環境変数はビルドごとにエクスポートされ、より複雑なテストやデプロイの実行に使用されます。

**注：**他の環境変数を定義するのに定義済み環境変数を使うことはできません。 この場合は、`run` ステップを利用し、`BASH_ENV` を用いて別の新しい環境変数をエクスポートする必要があります。 詳しくは[シェルコマンドで環境変数を設定する](#setting-an-environment-variable-in-a-shell-command)をご覧ください。

変数 | 型 | 値 \---\---\---\---\---\---\---\---\----|\---\---\---|\---\---\---\---\---\---\---\---\---\---\---\---\---\---\----- `CI` | Boolean | `true` (現在のビルド環境が CI であることを表します。常に true となります。) `CI_PULL_REQUEST` | String | 使用不可。`CIRCLE_PULL_REQUEST` を使用してください。 CircleCI 1.0 との後方互換性のために残しています。 `CI_PULL_REQUESTS` | List | 使用不可。`CIRCLE_PULL_REQUESTS` を使用してください。 CircleCI 1.0 との後方互換性のために残しています。 `CIRCLE_BRANCH` | String | 現在ビルドしている Git のブランチ名。 `CIRCLE_BUILD_NUM` | Integer | CircleCI におけるビルドの回数。 `CIRCLE_BUILD_URL` | String | 現在のビルドへの URL。 `CIRCLE_COMPARE_URL` | String | ビルドにおけるコミット間の違いを比較するための GitHub または Bitbucket の URL。 `CIRCLE_INTERNAL_TASK_DATA` | String | テスト時のデータが格納されたディレクトリ。 `CIRCLE_JOB` | String | 現在のジョブの名称。 `CIRCLE_NODE_INDEX` | Integer | ビルドインスタンスの固有インデックス。 この値は 0 から (`CIRCLECI_NODE_TOTAL` - 1) の間の値をとります。 `CIRCLE_NODE_TOTAL` | Integer | ビルドインスタンスの合計数。 `CIRCLE_PR_NUMBER` | Integer | GitHub または Bitbucket におけるプルリクエストの回数。 フォークしたプルリクエストのみで使用可能です。 `CIRCLE_PR_REPONAME` | String | プルリクエストが作成された GitHub または Bitbucket リポジトリの名前。 フォークしたプルリクエストのみで使用可能です。 `CIRCLE_PR_USERNAME` | String | プルリクエストを作成したユーザーの GitHub または Bitbucket ユーザー名。 フォークしたプルリクエストのみで使用可能です。 `CIRCLE_PREVIOUS_BUILD_NUM` | Integer | 現在のブランチにおける前回までのビルド回数。 `CIRCLE_PROJECT_REPONAME` | String | 現在のブランチのリポジトリ名。 `CIRCLE_PROJECT_USERNAME` | String | 現在のプロジェクトの GitHub/Bitbucket ユーザー名。 `CIRCLE_PULL_REQUEST` | String | プルリクエストにひもづく URL。 ひも付けられたプルリクエストが複数ある時は、そのうちの 1 つがランダムで選ばれます。 `CIRCLE_PULL_REQUESTS` | List | 現在のビルドのプルリクエストにひもづけられたカンマ区切りの URL リスト。 `CIRCLE_REPOSITORY_URL` | String | GitHub または Bitbucket の リポジトリ URL。 `CIRCLE_SHA1` | String | 現在のビルドの最後のコミットに関する SHA1 ハッシュ。 `CIRCLE_TAG` | String | 現在のビルドがタグ付けされている場合の git タグの名前。 詳しくは [Git タグを使ったジョブの実行]({{ site.baseurl }}/2.0/workflows/#executing-workflows-for-a-git-tag)を参照してください。 `CIRCLE_USERNAME` | String | ビルドをスタートさせたユーザーの GitHub または Bitbucket ユーザー名。 `CIRCLE_WORKFLOW_ID` | String | 現在のジョブにおける Workflow インスタンスのユニーク ID。 この ID は Workflow インスタンス内のすべてのジョブで同一となります。 `CIRCLE_WORKING_DIRECTORY` | String | 現在のジョブの`working_directory` キーの値。 `CIRCLECI` | Boolean | `true` (現在のビルド環境が CircleCI であることを表します。常に true となります。) `HOME` | String | ホームディレクトリ {:class="table table-striped"}

## その他の参考資料

{:.no_toc}

[コンテキスト]({{ site.baseurl }}/2.0/contexts/)