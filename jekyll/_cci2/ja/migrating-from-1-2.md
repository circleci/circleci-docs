---
layout: classic-docs
title: "Linux プロジェクトの 1.0 から 2.0 への移行"
short-title: "Linux プロジェクトの 1.0 から 2.0 への移行"
description: "CircleCI 1.0 から 2.0 に移行する理由と方法"
categories:
  - migration
order: 15
version:
  - Server v2.x
---

このドキュメントでは、CircleCI 1.0 を 2.0 に移行する際に最初に行う作業について説明します。移行作業ではまず、既存の 1.0 の設定ファイルをコピーして利用し、古いキーに対応する新しいキーがある場合はキーを置き換えます。

* TOC
{:toc}

ここで説明する手順だけでは移行プロセスは完了しないこともありますが、このドキュメントの目的は、大部分のキーを同等のネスト構文に置き換えてから新しい機能を追加できるよう支援することです。

`circle.yml` ファイルがない場合は、最初から [2.0 `config.yml` のサンプル ファイル]({{ site.baseurl }}/2.0/sample-config)を参考にしてください。

## 概要
{: #overview }
{:.no_toc}

CircleCI requires that you create a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference), and it adds new required keys for which values must be defined. **Note:** Parallelism may only be set in the `.circleci/config.yml` file, the parallelism setting in the CircleCI app is ignored.

If you already have a `circle.yml` file, the following sections describe how to make a copy of your existing file, create the new required keys, and then search and replace your 1.0 keys with 2.0 keys.

### Using the 1.0 to 2.0 `config-translation` endpoint
{: #using-the-10-to-20-config-translation-endpoint }
{:.no_toc}

The `config-translation` endpoint can help you quickly get started with converting a 1.0 config to 2.0. For more, see [Using the 1.0 to 2.0 config-translation Endpoint]({{ site.baseurl }}/2.0/config-translation).

## Steps to configure required keys
{: #steps-to-configure-required-keys }

1. 既存の `circle.yml` ファイルをコピーして、プロジェクト リポジトリのルートにある新しい `.circleci` ディレクトリに置きます。

2. `.circleci/circle.yml` の名前を `.circleci/config.yml` に変更します。

3. `.circleci/config.yml` ファイルの先頭に、`version: 2` を記述します。

4. `config.yml` ファイルのバージョンを指定する行の後に、以下の 2 行を追加します。 既存の構成内容に `machine:` を記述していた場合は、`machine:` を以下の 2 行に置き換え、古い設定ファイルのすべてのセクションを `build` の下にネストします。
     ```
     jobs:
       build:
     ```
5. `docker:` キーと `- image:` キーを記述するか、`machine: true` を設定するか、`macos` を指定して、プライマリ コンテナを実行するときの言語とバージョンを追加します。 以下の `ruby:` の例のように、構成に言語とバージョンが含まれている場合は、修正が必要です。
     ```
       ruby:
         version: 2.3
     ```
     Replace with the following lines:
     ```
         docker:
           - image: circleci/ruby:2.3-jessie
             auth:
               username: mydockerhub-user
               password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
     ```
     最初に記述したイメージのインスタンスがプライマリ コンテナになります。 ジョブのコマンドはこのコンテナ内で実行されます。ジョブごとにコマンドを宣言します。 See the [Docker Getting Started](https://docs.docker.com/get-started/#docker-concepts) if you are new to Docker containers.
     ```yaml
         machine: true
     ```
     See the Using Machine section of the [Choosing an Executor Type](https://circleci.com/docs/2.0/executor-types/#using-machine) document for details about the available VM images.
     ```yaml
         macos:
           xcode: 11.3.0
     ```

6. ソース ファイルに対してジョブを実行するには、`checkout:` ステップが必要です。 `steps:` の下に `checkout:` をネストして各ジョブを記述します。それには、以下のコードを検索します。
     ```
     checkout:
       post:
     ```
     上記を以下のように置き換えます。
     ```
         steps:
           - checkout
           - run:
     ```

     以下に例を示します。
     ```
     checkout:
      post:
        - mkdir -p /tmp/test-data
        - echo "foo" > /tmp/test-data/foo
     ```
     上の例は次のようになります。
     ```
         steps:
           - checkout
           - run: mkdir -p /tmp/test-data
           - run: echo "foo" > /tmp/test-data/foo
     ```
     If you do not have a `checkout` step, you must add this step to your `config.yml` file.

7. (オプション) ビルドへの SSH 接続を有効化するには、`add_ssh_keys` ステップとフィンガープリントを追加します。詳細については、「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/#add_ssh_keys)」を参照してください。

8. Validate your YAML at <http://codebeautify.org/yaml-validator> to check the changes.

## Environment variables
{: #environment-variables }

In CircleCI 2.0, all defined environment variables are treated literally. It is possible to interpolate variables within a command by setting it for the current shell.

For more information, refer to the CircleCI 2.0 document [Using Environment Variables]({{ site.baseurl }}/2.0/env-vars/).

## Steps to configure workflows
{: #steps-to-configure-workflows }

To increase the speed of your software development through faster feedback, shorter re-runs, and more efficient use of resources, configure workflows using the following instructions:

1. ワークフロー機能を使用するには、ビルド ジョブを複数のジョブに分割し、それぞれに一意の名前を付けます。 デプロイのみが失敗したときにビルド全体を再実行しなくても済むように、最初はデプロイ ジョブのみを分割するだけでもよいでしょう。

2. As a best practice, add lines for `workflows:`, `version: 2` and `<workflow_name>` at the *end* of the master `.circleci/config.yml` file, replacing `<workflow_name>` with a unique name for your workflow. **Note:** The Workflows section of the `config.yml` file is not nested in the config. It is best to put the Workflows at the end of the file because the Workflows `version: 2` is in addition to the `version:` key at the top of the `config.yml` file.
     ```
     workflows:
       version: 2
       <ワークフロー名>:
     ```
3. `<ワークフロー名>` の下に `jobs:` キーの行を追加し、オーケストレーションするジョブ名をすべて記述します。 In this example, `build` and `test` will run concurrently.

     ```
     workflows:
       version: 2
       <ワークフロー名>:
           jobs:
             - build
             - test
     ```
4. 別のジョブが成功したかどうかに応じて順次実行する必要があるジョブについては、`requires:` キーを追加し、そのジョブを開始するために成功する必要があるジョブをその下にネストします。 `curl` コマンドを使用してジョブを開始していた場合、ワークフロー セクションでは、そのコマンドを削除して `requires:` キーでジョブを開始できます。

     ```
      - <ジョブ名>:
          requires:
            - <ジョブ名>
     ```
5. 特定のブランチでジョブを実行する必要がある場合は、`filters:` キーを追加し、その下に `branches` と `only` キーをネストします。 ジョブを特定のブランチで実行してはいけない場合は、`filters:` キーを追加し、その下に `branches` と `ignore` キーをネストします。 **Note:** Workflows will ignore job-level branching, so if you have configured job-level branching and then add workflows, you must remove the branching at the job level and instead declare it in the workflows section of your `config.yml`, as follows:

     ```
     - <ジョブ名>:
         filters:
           branches:
             only: master
     - <ジョブ名>:
         filters:
           branches:
             ignore: master
     ```
6. Validate your YAML again at <http://codebeautify.org/yaml-validator> to check that it is well-formed.

## Search and replace deprecated 2.0 keys
{: #search-and-replace-deprecated-20-keys }

- 構成にタイムゾーンが含まれる場合は、`timezone: America/Los_Angeles` を検索して、以下の 2 行に置き換えます。

```yaml
    environment:
      TZ: "America/Los_Angeles"
```

- $PATH を変更している場合は、`.bashrc` ファイルにパスを追加し、以下の部分を

```yaml
    environment:
      PATH: "/path/to/foo/bin:$PATH"
```

With the following to load it into your shell (the file $BASH_ENV already exists and has a random name in /tmp):

```yaml
    steps:
      - run: echo 'export PATH=/path/to/foo/bin:$PATH' >> $BASH_ENV
      - run: some_program_inside_bin
```

- `hosts:` キーを検索し、たとえば以下のような部分を

```yaml
hosts:
    circlehost: 127.0.0.1
```

With an appropriate `run` Step, for example:

```yaml
    steps:
      - run: echo 127.0.0.1 circlehost | sudo tee -a /etc/hosts
```


- `dependencies:`、`database`、または `test` と `override:` の行を検索し、たとえば以下のような部分は

```yaml
dependencies:
  override:
    - <インストール済み依存関係>
```

Is replaced with:

```yaml
      - run:
          name: <名前>
          command: <インストール済み依存関係>
```

- `cache_directories:` キーを検索し、

```yaml
  cache_directories:
    - "vendor/bundle"
```

With the following, nested under `steps:` and customizing for your application as appropriate:

```yaml
     - save_cache:
        key: dependency-cache
        paths:
          - vendor/bundle
```

- `restore_cache:` キーを `steps:` の下にネストして追加します。

- `deployment:` を検索し、次のように置き換えて `steps` の下にネストします。

```yaml
     - deploy:
```

## YAML のバリデーション
{: #validate-yaml }

When you have all the sections in `.circleci/config.yml` we recommend that you check that your YAML syntax is well-formed using a tool such as <http://codebeautify.org/yaml-validator>. Then, use the `circleci` CLI to validate that the new configuration is correct with regard to the CircleCI 2.0 schema. See the [Using the CircleCI Command Line Interface (CLI)]({{ site.baseurl }}/2.0/local-jobs/) document for instructions. Fix up any issues and commit the updated `.circleci/config.yml` file. When you push a commit the job will start automatically and you can monitor it in the CircleCI app.

## 次のステップ
{: #next-steps }
{:.no_toc}

- 「[2.0 への移行のヒント]({{ site.baseurl }}/2.0/migration/)」を参照してください。
- デプロイの構成例については、「[デプロイの構成]({{ site.baseurl }}/2.0/deployment-integrations/)」を参照してください。
- CircleCI 2.0 の Docker イメージおよび machine イメージの詳細については、「[Executor タイプを選択する]({{ site.baseurl }}/2.0/executor-types/)」を参照してください。
- CircleCI 2.0 の `jobs` と `steps` の正確な構文と使用可能なすべてのオプションについては、「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」を参照してください。
