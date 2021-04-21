---
layout: classic-docs
title: "環境変数の使用"
short-title: "環境変数の使用"
description: "CircleCI 2.0 でサポートされている環境変数の一覧"
categories:
  - configuring-jobs
order: 40
---

以下のセクションに沿って、CircleCI で環境変数を使用する方法について説明します。

- 目次
{:toc}

## 概要
{:.no_toc}

プライベート キーまたはシークレット環境変数をプライベート プロジェクトに追加するには、CircleCI アプリケーションで [Build (ビルド)] > [Project (プロジェクト)] > [Settings (設定)] の [Environment Variables (環境変数)] ページに移動します。 設定された後の変数の値は、アプリで読み取ることも編集することもできません。 環境変数の値を変更するには、現在の変数を削除し、新しい値を設定して再度追加します。 変数を個々に追加することも、別のプロジェクトからインポートすることも可能です。 プライベート環境変数を使用すると、パブリック プロジェクトにもシークレットを安全に格納できます。関連する設定情報については、「[オープンソース プロジェクトの構築]({{ site.baseurl }}/2.0/oss/)」を参照してください。 ビルド内から環境変数へのアクセスをさらに制限するには、コンテキストを使用します。「[コンテキストの制限]({{ site.baseurl }}/2.0/contexts/#コンテキストの制限)」を参照してください。

### シークレットのマスキング
{:.no_toc}

環境変数は、プロジェクトのシークレットやキーを保持します。シークレットやキーはアプリケーションにとってきわめて重要なものです。 セキュリティを強化するために、CircleCI ではビルドの出力に対してシークレットのマスキングを行い、環境変数およびコンテキストの `echo` 出力や `print` 出力を不明瞭なものにします。

以下の場合、環境変数の値はビルドの出力でマスキングされません。

- 環境変数の値が 4 文字未満
- 環境変数の値が `true`、`True`、`false`、`False` のいずれか

**メモ:** シークレットのマスキングは、ビルドの出力で環境変数の値が表示されないようにするだけの機能です。 環境変数の値には、[SSH を使用したデバッグ]({{ site.baseurl }}/2.0/ssh-access-jobs)を行うユーザーがアクセスできます。

### 環境変数の使用オプション
{:.no_toc}

CircleCI は Bash を使用しますが、ここでは POSIX 命名規則に従った環境変数が使用されます。 有効な文字は、アルファベット (大文字と小文字)、数字、およびアンダースコアです。 環境変数の最初の文字はアルファベットにする必要があります。

CircleCI アプリケーションに安全に格納されているシークレットやプライベート キーは、設定ファイル内の `run` キー、`environment` キー、またはワークフローの `context` キーで変数を使用して参照できます。 環境変数は、以下に示す優先順位に従って使用されます。

1. `FOO=bar make install` など、`run` ステップの[シェル コマンド](#シェル-コマンドでの環境変数の設定)で宣言された環境変数。
2. [`run` ステップ](#ステップでの環境変数の設定)で `environment` キーを使用して宣言された環境変数。
3. [ジョブ](#ジョブでの環境変数の設定)で `environment` キーを使用して設定された環境変数。
4. [コンテナ](#コンテナでの環境変数の設定)で `environment` キーを使用して設定された環境変数。
5. コンテキスト環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合)。 手順については、[コンテキストに関するドキュメント]({{ site.baseurl }}/2.0/contexts)を参照してください。
6. [Project Settings (プロジェクト設定)] ページで設定された[プロジェクトレベルの環境変数](#プロジェクトでの環境変数の設定)。
7. このドキュメントの [CircleCI 定義済み環境変数](#定義済み環境変数)セクションで解説されている特別な CircleCI 環境変数。

`FOO=bar make install` のように、`run` ステップのシェル コマンドで宣言された環境変数は、`environment` キーおよび `contexts` キーを使用して宣言された環境変数よりも優先されます。 [Contexts (コンテキスト)] ページで追加された環境変数は、[Project Settings (プロジェクト設定)] ページで追加された変数よりも優先されます。 最後に、特別な CircleCI 環境変数がロードされます。

**メモ:** `.circleci/config.yml` ファイル内にシークレットやキーを追加しないでください。 CircleCI 上のプロジェクトにアクセスできる開発者には、`config.yml` の全文が表示されます。 シークレットやキーは、CircleCI アプリケーションの[プロジェクト設定](#プロジェクトでの環境変数の設定)または[コンテキスト設定]({{ site.baseurl }}/2.0/contexts/)に格納してください。

詳細については、「セキュリティ」の「[暗号化]({{ site.baseurl }}/2.0/security/#暗号化)」セクションで説明しています。

構成内でスクリプトを実行すると、シークレット環境変数が公開される場合があります。 安全なスクリプトのベスト プラクティスについては、「[シェル スクリプトの使用]({{ site.baseurl }}/2.0/using-shell-scripts/#シェル-スクリプトのベスト-プラクティス)」を参照してください。

### 環境変数の構成例

以下のような `config.yml` を例に考えてみましょう。

```yaml
version: 2  # CircleCI 2.0 を使用
jobs: # 1 回の実行の基本作業単位
  build: # ワークフローを使用しない実行では、エントリポイントとして `build` ジョブが必要です
    docker: # Docker でステップを実行します
      # CircleCI ノード イメージは https://hub.docker.com/r/circleci/node/ で入手できます
      - image: circleci/node:10.0-browsers
    steps: # `build` ジョブを構成するステップ
      - checkout # ソース コードを作業ディレクトリにチェックアウトします
      # 環境変数をセットアップするステップを実行します
      - run: 
          name: "カスタム環境変数のセットアップ"
          command: |
            echo 'export MY_ENV_VAR="FOO"' >> $BASH_ENV # MY_ENV_VAR を $BASH_ENV にリダイレクトします
      # コード ベースが属するブランチを出力するステップを実行します
      - run: # 現在のブランチをテストします
          name: "どのブランチにいるか"
          command: echo ${CIRCLE_BRANCH}
      # 上と同様に、別のステップを実行します
      # 中かっこなしで環境変数を呼び出せることに注意してください
      # 出力はマスキングされます
      - run:
          name: "今はどのブランチにいるか"
          command: echo $CIRCLE_BRANCH # 出力はマスキングされます
      - run:
          name: "カスタム環境変数は何だったか"
          command: echo ${MY_ENV_VAR}  # 出力はマスキングされます
```

この `config.yml` では以下が行われます。

- カスタム環境変数の設定
- CircleCI が提供する定義済み環境変数 (`CIRCLE_BRANCH`) の読み取り
- `config.yml` での変数の使用 (または挿入)
- 出力された環境変数のマスキング (シークレットのマスキング)

この設定ファイルを実行すると、下図のように出力されます。

![環境変数の挿入例]({{site.baseurl}}/assets/img/docs/env-vars-interpolation-example.png)

お気付きのとおり、上の設定ファイルと出力には「どのブランチにいるか」という 2 つの類似するステップが含まれています。 これらのステップは、環境変数を読み取るための 2 つの方法を示しています。 なお、`${VAR}` 構文と `$VAR` 構文がどちらもサポートされています。 シェル パラメーターの展開については、[Bash のドキュメント](https://www.gnu.org/software/bash/manual/bashref.html#Shell-Parameter-Expansion)を参照してください。

### `BASH_ENV` を使用した環境変数の設定
{:.no_toc}

CircleCI は、環境変数の設定時に挿入をサポートしません。 定義された値はすべてリテラルとして処理されます。 これにより、`working_directory` を定義するときや、`PATH` を変更するとき、複数の `run` ステップで変数を共有するときに、問題が発生する可能性があります。

以下の例では、`$ORGNAME` と `$REPONAME` に挿入は行われません。

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

設定ファイルに値を挿入するには、いくつかの回避策があります。

**CircleCI 2.1** を使用している場合は、`config.yml` 全体の構成の一部を再利用できます。 `parameters` 宣言を使用することで、再利用可能な `commands` `jobs` や `executors` に挿入を行う (値を渡す) ことができます。 「[parameters 宣言の使用]({{ site.baseurl }}/2.0/reusing-config/#parameters-宣言の使用)」をご一読ください。

設定ファイルに値を挿入する方法として、以下のように、`run` ステップを使用して環境変数を `BASH_ENV` にエクスポートすることもできます。

```yaml
steps:
  - run:
      name: 環境変数のセットアップ
      command: |
        echo "export PATH=$GOPATH/bin:$PATH" >> $BASH_ENV
        echo "export GIT_SHA1=$CIRCLE_SHA1" >> $BASH_ENV
```

各ステップで、CircleCI は `bash` を使用して `BASH_ENV` を取得します。 つまり、`BASH_ENV` が自動的にロードおよび実行されることで、挿入を使用して複数の `run` ステップで環境変数を共有できるようになります。

**メモ:** この `$BASH_ENV` による回避策は `bash` でのみ機能します。 他のシェルではおそらく機能しません。

### Alpine Linux

[Alpine Linux](https://alpinelinux.org/) ベースのイメージ ([Docker](https://hub.docker.com/_/docker) など) は `ash` シェルを使用します。

以下の 2 つのパラメーターをジョブに追加するだけで、`ash` で環境変数を使用できます。

```yaml
jobs:
  build:    

    shell: /bin/sh -leo pipefail
    environment:

      - BASH_ENV: /etc/profile
```

## シェル コマンドでの環境変数の設定

CircleCI は環境変数の設定時の挿入をサポートしませんが、[`BASH_ENV`を使用](#bash_env-を使用した環境変数の設定)して、現在のシェルに変数を設定することは可能です。 これは、`PATH` を変更するときや、他の変数を参照する環境変数を設定するときに便利です。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
    steps:
      - run:
          name: PATH の更新および実行時の環境変数の定義
          command: |
            echo 'export PATH=/path/to/foo/bin:$PATH' >> $BASH_ENV
            echo 'export VERY_IMPORTANT=$(cat important_value)' >> $BASH_ENV
            source $BASH_ENV
```

**メモ:** シェルによっては、`~/.tcshrc` や `~/.zshrc` などのシェル スタートアップ ファイルに新しい変数を付加しなければならない場合があります。

詳細については、シェルのドキュメントで環境変数の設定方法を参照してください。

## ステップでの環境変数の設定

1 つのステップで環境変数を設定するには、[`environment` キー]({{ site.baseurl }}/2.0/configuration-reference/#run)を使用します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
    steps:
      - checkout
      - run:
          name: 移行の実行
          command: sql/docker-entrypoint.sh sql
          # 単一のコマンド シェル用の環境変数
          environment:
            DATABASE_URL: postgres://conductor:@localhost:5432/conductor_test
```

**メモ:** 各 `run` ステップは新しいシェルなので、環境変数はステップ間で共有されません。 複数のステップで環境変数にアクセスできるようにする必要がある場合は、[`BASH_ENV` を使用](#bash_env-を使用した環境変数の設定)して値をエクスポートします。

## ジョブでの環境変数の設定

1 つのジョブで環境変数を設定するには、[`environment` キー]({{ site.baseurl }}/2.0/configuration-reference/#job_name)を使用します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      FOO: bar
```

## コンテナでの環境変数の設定

1 つのコンテナで環境変数を設定するには、[`environment` キー]({{ site.baseurl }}/2.0/configuration-reference/#docker--machine--macos--windows-executor)を使用します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
      - image: circleci/postgres:9.6-jessie
      # プライマリ コンテナで実行されるすべてのコマンド用の環境変数
        environment:
          POSTGRES_USER: conductor
          POSTGRES_DB: conductor_test
```

以下に、プライマリ コンテナ イメージ (最初にリストされたイメージ) とセカンダリ サービス コンテナ イメージに別々の環境変数を設定する例を示します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-jessie
       # プライマリ コンテナで実行されるすべてのコマンド用の環境変数
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6
```

## コンテキストでの環境変数の設定

コンテキストを作成すると、複数のプロジェクト間で環境変数を共有できるようになります。 コンテキストに環境変数を設定する方法については、[コンテキストに関するドキュメント]({{ site.baseurl }}/2.0/contexts/)を参照してください。

## プロジェクトでの環境変数の設定

1. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

2. **[Build Settings (ビルド設定)]** セクションで、**[Environment Variables (環境変数)]** をクリックします。

3. **[Import Variable(s) (変数のインポート)]** ボタンをクリックして、別のプロジェクトから変数をインポートします。 **[Add Variable (変数の追加)]** ボタンをクリックして、新しい変数を追加します (**メモ:** 現在、プライベート クラウドまたはデータセンターにインストールされている CircleCI では、現在 **[Import Variable(s) (変数のインポート)]** ボタンは使用できません)。

4. `.circleci/config.yml` ファイルで新しい環境変数を使用します。 例については、[Heroku デプロイの詳細説明]({{ site.baseurl }}/2.0/deployment-integrations/#heroku)を参照してください。

作成された環境変数は、アプリケーションに表示されず、編集することはできません。 環境変数を変更するには、削除して作成し直すしかありません。

### 複数行にわたる環境変数のエンコード
{:.no_toc}

複数行の環境変数を追加する際に問題が発生した場合は、`base64` を使用してエンコードします。

```bash
$ echo "foobar" | base64 --wrap=0
Zm9vYmFyCg==
```

結果の値を CircleCI 環境変数に格納します。

```bash
$ echo $MYVAR
Zm9vYmFyCg==
```

その変数を使用するコマンド内で変数をデコードします。

```bash
$ echo $MYVAR | base64 --decode | docker login -u my_docker_user --password-stdin
Login Succeeded
```

**メモ:** すべてのコマンド ライン プログラムが `docker` と同じ方法で認証情報を受け取るわけではありません。

## API を使用した環境変数の挿入

ビルド パラメーターは環境変数であるため、以下の条件に従って名前を付けます。

- 使用できるのは ASCII 文字、数字、アンダースコア文字のみです
- 先頭に数字を使用することはできません
- 少なくとも 1 文字を含む必要があります

環境変数の通常の制限以外には、値自体への制限はなく、単純な文字列として扱われます。 ビルド パラメーターがロードされる順序は**保証されない**ため、ビルド パラメーターに値を挿入して別のビルド パラメーターに渡すことは避けてください。 ベスト プラクティスとして、独立した環境変数から成る順不同のリストとしてビルド パラメーターを設定することをお勧めします。

**重要:** ビルド パラメーターは機密データとして扱われないため、機密の値 (シークレット) には使用しないでください。 機密情報は、[プロジェクト設定ページ](https://circleci.com/ja/docs/2.0/settings/)と[コンテキスト ページ](https://circleci.com/ja/docs/2.0/glossary/#コンテキスト)で確認できます。

たとえば、以下のパラメーターを渡すとします。

    {
      "build_parameters": {
        "foo": "bar",
        "baz": 5,
        "qux": {"quux": 1},
        "list": ["a", "list", "of", "strings"]
      }
    }
    

このビルドは、以下の環境変数を受け取ります。

    export foo="bar"
    export baz="5"
    export qux="{\"quux\": 1}"
    export list="[\"a\", \"list\", \"of\", \"strings\"]"
    

ビルド パラメーターは、ジョブのコンテナ内の環境変数としてエクスポートされ、`config.yml` 内のスクリプトまたはプログラム、コマンドで使用できます。 挿入された環境変数を使用して、ジョブの中で実行されるステップに影響を与えることができます。 挿入された環境変数よりも `config.yml` やプロジェクト設定で定義された値が優先されるので、注意が重要です。

`build_parameters` キーを使用して環境変数を挿入することで、実行のたびに異なるターゲットに対して機能テストをビルドできます。 たとえば、ステージング環境へのデプロイ ステップを持つ実行で、さまざまなホストに対する機能テストをビルドするとします。 `bash` と `curl` を使用した以下の例のように、JSON 本体を `Content-type: application/json` で送信することで、`build_parameters` を使用できます (ただし、選択した言語の HTTP ライブラリを使用することも可能です)。

    {
      "build_parameters": {
        "param1": "value1",
        "param2": 500
      }
    }
    

たとえば、以下のように `curl` を使用します。

    curl \
      --header "Content-Type: application/json" \
      --data '{"build_parameters": {"param1": "value1", "param2": 500}}' \
      --request POST \
      https://circleci.com/api/v1.1/project/github/circleci/mongofinil/tree/master?circle-token=$CIRCLE_TOKEN
    

上の例の `$CIRCLE_TOKEN` は[パーソナル API トークン]({{ site.baseurl }}/2.0/managing-api-tokens/#パーソナル-api-トークンの作成)です。

このビルドは、以下の環境変数を受け取ります。

    export param1="value1"
    export param2="500"
    

POST API 呼び出しを使用して実行を開始します。詳細については、API ドキュメントで[新しいビルドのセクション](https://circleci.com/docs/api/#trigger-a-new-build-with-a-branch)を参照してください。 本体が空の POST は、指定されたブランチの新しい実行を開始します。

## 定義済み環境変数

以下の環境変数はビルドごとにエクスポートされ、より複雑なテストやデプロイに使用できます。

**メモ:** 定義済み環境変数を使用して別の環境変数を定義することはできません。 代わりに、`run` ステップを使用して、新しい環境変数を `BASH_ENV` でエクスポートする必要があります。

詳細については、「[シェル コマンドでの環境変数の設定](#シェル コマンドでの環境変数の設定)」を参照してください。

| 変数                          | タイプ  | 値                                                                                                                                      |
| --------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `CI`                        | ブール値 | `true` (現在の環境が CI 環境かどうかを表します)                                                                                                         |
| `CI_PULL_REQUEST`           | 文字列  | `CIRCLE_PULL_REQUEST` の非推奨バージョン。 CircleCI 1.0 との下位互換性を確保するために残されています。                                                                  |
| `CI_PULL_REQUESTS`          | リスト  | `CIRCLE_PULL_REQUESTS` の非推奨バージョン。 CircleCI 1.0 との下位互換性を確保するために残されています。                                                                 |
| `CIRCLE_BRANCH`             | 文字列  | 現在ビルド中の Git ブランチの名前。                                                                                                                   |
| `CIRCLE_BUILD_NUM`          | 整数   | CircleCI ビルドの番号。                                                                                                                       |
| `CIRCLE_BUILD_URL`          | 文字列  | 現在のビルドの URL。                                                                                                                           |
| `CIRCLE_COMPARE_URL`        | 文字列  | 同じビルドのコミットどうしを比較するための GitHub または Bitbucket URL。 v2 以下の設定ファイルで使用可能です。 v2.1 では、この変数の代わりに「パイプライン値」が導入されます。                                |
| `CIRCLE_INTERNAL_TASK_DATA` | 文字列  | テストのタイミング データが保存されるディレクトリ。                                                                                                             |
| `CIRCLE_JOB`                | 文字列  | 現在のジョブの名前。                                                                                                                             |
| `CIRCLE_NODE_INDEX`         | 整数   | 特定のビルド インスタンスのインデックス。 0 から (`CIRCLE_NODE_TOTAL` - 1) までの値を取ります。                                                                        |
| `CIRCLE_NODE_TOTAL`         | 整数   | ビルド インスタンスの合計数。                                                                                                                        |
| `CIRCLE_PR_NUMBER`          | 整数   | 関連付けられた GitHub または Bitbucket プル リクエストの番号。 フォークされた PR でのみ使用できます。                                                                        |
| `CIRCLE_PR_REPONAME`        | 文字列  | プル リクエストが作成された GitHub または Bitbucket リポジトリの名前。 フォークされた PR でのみ使用できます。                                                                    |
| `CIRCLE_PR_USERNAME`        | 文字列  | プル リクエストを作成したユーザーの GitHub または Bitbucket ユーザー名。 フォークされた PR でのみ使用できます。                                                                   |
| `CIRCLE_PREVIOUS_BUILD_NUM` | 整数   | 現在のブランチのこれまでのビルドの数。                                                                                                                    |
| `CIRCLE_PROJECT_REPONAME`   | 文字列  | 現在のプロジェクトのリポジトリの名前。                                                                                                                    |
| `CIRCLE_PROJECT_USERNAME`   | 文字列  | 現在のプロジェクトの GitHub または Bitbucket ユーザー名。                                                                                                 |
| `CIRCLE_PULL_REQUEST`       | 文字列  | 関連付けられたプル リクエストの URL。 複数のプル リクエストが関連付けられている場合は、いずれか 1 つの URL がランダムに選択されます。                                                             |
| `CIRCLE_PULL_REQUESTS`      | リスト  | 現在のビルドに関連付けられたプル リクエストの URL の一覧 (カンマ区切り)。                                                                                              |
| `CIRCLE_REPOSITORY_URL`     | 文字列  | GitHub または Bitbucket リポジトリ URL。                                                                                                        |
| `CIRCLE_SHA1`               | 文字列  | 現在のビルドの前回のコミットの SHA1 ハッシュ。                                                                                                             |
| `CIRCLE_TAG`                | 文字列  | git タグの名前 (現在のビルドがタグ付けされている場合)。 詳細については、「[Git タグに対応するワークフローを実行する]({{ site.baseurl }}/2.0/workflows/#git-タグに対応するワークフローを実行する)」を参照してください。 |
| `CIRCLE_USERNAME`           | 文字列  | ビルドをトリガーしたユーザーの GitHub または Bitbucket ユーザー名。                                                                                            |
| `CIRCLE_WORKFLOW_ID`        | 文字列  | 現在のジョブのワークフロー インスタンスの一意の識別子。 この識別子は、特定のワークフロー インスタンス内のすべてのジョブで同じです。                                                                    |
| `CIRCLE_WORKING_DIRECTORY`  | 文字列  | 現在のジョブの `working_directory` キーの値。                                                                                                      |
| `CIRCLECI`                  | ブール値 | `true` (現在の環境が CircleCI 環境かどうかを表します)。                                                                                                  |
| `HOME`                      | 文字列  | ホーム ディレクトリ。                                                                                                                            |
{:class="table table-striped"}

## 関連項目
{:.no_toc}

[コンテキスト]({{ site.baseurl }}/2.0/contexts/)  
ブログ記事「[Keep environment variables private with secret masking (シークレットのマスキングによって環境変数を非公開に保つ)](https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/)」