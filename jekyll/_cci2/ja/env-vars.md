---
layout: classic-docs
title: "環境変数の使用"
short-title: "環境変数の使用"
description: "CircleCI 2.0 でサポートされている環境変数の一覧"
order: 40
version:
  - Cloud
  - Server v2.x
---

以下のセクションに沿って、CircleCI で環境変数を使用する方法について説明します。

* TOC
{:toc}

## 概要
{:.no_toc}

CircleCI では、スコープや認証レベルに幅を持たせるために、環境変数の使用方法を複数提供しています。 環境変数は、その設定方法によって[優先順位](#%E5%84%AA%E5%85%88%E9%A0%86%E4%BD%8D)に基づいて使用され、構成において各レベルで制御することができます。

To add **private keys** or **secret environment variables** for use throughout your private project, use the [Environment Variables page under Project Settings](#setting-an-environment-variable-in-a-project) in the CircleCI application. 設定された後の変数の値は、アプリで読み取ることも編集することもできません。 環境変数の値を変更するには、現在の変数を削除し、新しい値を設定して再度追加します。

プライベート環境変数を使用すると、プロジェクトがパブリックの場合でもシークレットを安全に格納できます。 関連する設定情報については、「[オープンソース プロジェクトの構築]({{ site.baseurl }}/2.0/oss/)」ページを参照してください。

コンテキストは、[環境変数へのアクセスをさらに制限](#%E3%82%B3%E3%83%B3%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A)するためのもので、 CircleCI アプリケーションの [Organization Settings (組織設定)] で設定します。 コンテキストを使用して環境変数へのアクセスを制御する方法について、詳細は「[コンテキストの制限]({{ site.baseurl }}/ja/2.0/contexts/#%E3%82%B3%E3%83%B3%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%81%AE%E5%88%B6%E9%99%90)」を参照してください。

## シークレットのマスキング

_シークレットのマスキングは、オンプレミス版である CircleCI Server では現在サポートされていません。_

シークレットのマスキングは、[Project Settings (プロジェクト設定)] または [Contexts (コンテキスト)] で設定されている環境変数に適用されます。 環境変数は、プロジェクトのシークレットやキーを保持します。シークレットやキーはアプリケーションにとってきわめて重要なものです。 シークレットのマスキングは、`echo` や `print` が使用される際にジョブ出力における環境変数を不明瞭にすることで、CircleCI のセキュリティを強化します。

以下の場合、環境変数の値はビルドの出力でマスキングされません。

* 環境変数の値が 4 文字未満
* 環境変数の値が `true`、`True`、`false`、`False` のいずれか

**Note:** Secrets Masking will only prevent the value of the environment variable from appearing in your build output. 環境変数の値には、[SSH を使用したデバッグ]({{ site.baseurl }}/2.0/ssh-access-jobs)を行うユーザーがアクセスできます。

## 組織とリポジトリの名前変更

過去に CircleCI に接続した組織やリポジトリの名前を変更する場合は、以下の手順を参考にしてください。

1. VCS で組織またはリポジトリの名前を変更します。
2. 新しい組織またはリポジトリの名前を使用して CircleCI アプリケーションにアクセスします (例: `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`)。
3. プラン、プロジェクト、設定が正常に転送されたことを確認します。
4. これで、必要に応じて VCS の古い名前で新しい組織やリポジトリを作成できます。

**Note**: If you do not follow these steps, it is possible that you may lose access to your org or repo settings, including **environment variables** and **contexts**.

## 環境変数の使用オプション

CircleCI は Bash を使用しますが、ここでは POSIX 命名規則に従った環境変数が使用されます。 有効な文字は、アルファベット (大文字と小文字)、数字、およびアンダースコアです。 環境変数の最初の文字はアルファベットにする必要があります。

### 優先順位
{:.no_toc}

環境変数は、以下に示す優先順位に従って使用されます。

1. `FOO=bar make install` など、`run` ステップの[シェル コマンド](#%E3%82%B7%E3%82%A7%E3%83%AB-%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A)で宣言された環境変数
2. [`run` ステップ](#%E3%82%B9%E3%83%86%E3%83%83%E3%83%97%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A)で `environment` キーを使用して宣言された環境変数
3. [ジョブ](#%E3%82%B8%E3%83%A7%E3%83%96%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A)で `environment` キーを使用して設定された環境変数
4. このドキュメントの「[CircleCI 定義済み環境変数](#%E5%AE%9A%E7%BE%A9%E6%B8%88%E3%81%BF%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0)」セクションで解説されている特別な CircleCI 環境変数
5. コンテキスト環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合)。 See the [Contexts]({{ site.baseurl }}/2.0/contexts/) documentation for instructions.
6. [Project Settings (プロジェクト設定)] ページで設定された[プロジェクトレベルの環境変数](#%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A)

`FOO=bar make install` のように、`run` ステップのシェル コマンドで宣言された環境変数は、`environment` キーおよび `contexts` キーを使用して宣言された環境変数よりも優先されます。 [Contexts (コンテキスト)] ページで追加された環境変数は、[Project Settings (プロジェクト設定)] ページで追加された変数よりも優先されます。

![環境変数の優先順位]({{ site.baseurl }}/assets/img/docs/env-var-order.png)

#### セキュリティに関する注意事項
{:.no_toc}

`.circleci/config.yml` ファイル内にシークレットやキーを追加しないでください。 CircleCI 上のプロジェクトにアクセスできる開発者には、`config.yml` の全文が表示されます。 Store secrets or keys in [project](#setting-an-environment-variable-in-a-project) or [context](#setting-an-environment-variable-in-a-context) settings in the CircleCI app. For more information, see the [Encryption]({{ site.baseurl }}/2.0/security/#encryption) section of the Security document.

構成内でスクリプトを実行すると、シークレット環境変数が公開される場合があります。 安全なスクリプトのベスト プラクティスについては、「[シェル スクリプトの使用]({{ site.baseurl }}/ja/2.0/using-shell-scripts/#%E3%82%B7%E3%82%A7%E3%83%AB-%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%97%E3%83%88%E3%81%AE%E3%83%99%E3%82%B9%E3%83%88-%E3%83%97%E3%83%A9%E3%82%AF%E3%83%86%E3%82%A3%E3%82%B9)」を参照してください。

### 環境変数の構成例
{:.no_toc}

以下のような `config.yml` を例に考えてみましょう。

```yaml
version: 2.1

jobs: # basic units of work in a run
  build: 
    docker: # use the Docker executor
      # CircleCI node images available at: https://hub.docker.com/r/circleci/node/
      - image: circleci/node:10.0-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps: # steps that comprise the `build` job
      - checkout # check out source code to working directory
      # Run a step to setup an environment variable
      # Redirect MY_ENV_VAR into $BASH_ENV
      - run: 
          name: "Setup custom environment variables"
          command: echo 'export MY_ENV_VAR="FOO"' >> $BASH_ENV
      - run: # print the name of the branch we're on
          name: "What branch am I on?"
          command: echo ${CIRCLE_BRANCH}
      # Run another step, the same as above; note that you can
      # invoke environment variable without curly braces.
      - run:
          name: "What branch am I on now?"
          command: echo $CIRCLE_BRANCH
      - run:
          name: "What was my custom environment variable?"
          command: echo ${MY_ENV_VAR}
      - run:
          name: "Print an env var stored in the Project"
          command: echo ${PROJECT_ENV_VAR}
      - run:
          name: "Print an env var stored in a Context"
          command: echo ${CONTEXT_ENV_VAR}

workflows: # a single workflow with a single job called build
  build:
    jobs:
      - build:
          context: Testing-Env-Vars
```

この `config.yml` では以下が行われます。

- カスタム環境変数の設定
- CircleCI が提供する定義済み環境変数 (`CIRCLE_BRANCH`) の読み取り
- `config.yml` での変数の使用 (または挿入)
- プロジェクトまたはコンテキストで設定される環境変数に適用されるシークレットのマスキング

この設定ファイルを実行すると、下図のように出力されます。 プロジェクトに格納されている環境変数がマスキングされ、`****` と表示されていることに注目してください。

![環境変数の挿入例]({{site.baseurl}}/assets/img/docs/env-vars-example-ui.png)

上の設定ファイルと出力には、「今いるブランチを表示」という 2 つの類似するステップが含まれています。 これらのステップは、環境変数を読み取るための 2 つの方法を示しています。 なお、`${VAR}` 構文と `$VAR` 構文のどちらもサポートされています。 シェル パラメーターの展開については、[Bash のドキュメント](https://www.gnu.org/software/bash/manual/bashref.html#Shell-Parameter-Expansion)を参照してください。

### パラメーターと Bash 環境の使用
{:.no_toc}

In general, CircleCI does not support interpolating environment variable into build config. Values used are treated as literals. そのため、`working_directory` を定義するときや、`PATH` を変更するとき、複数の `run` ステップで変数を共有するときに、問題が発生する可能性があります。

ただし、[プライベート イメージ]({{ site.baseurl }}/2.0/private-images/)をサポートするため、Docker イメージ セクションは例外となっています。

以下の例では、`$ORGNAME` と `$REPONAME` に挿入は行われません。

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

`version: 2.1` の設定ファイルを使用すると、`config.yml` 全体の構成の一部を再利用できます。 以下のように `parameters` 宣言を使用することで、再利用可能な `commands` `jobs` や `executors` に挿入を行う (値を渡す) ことができます。

```yaml
version: 2.1

jobs:
  build:
    parameters:
      org_name:
        type: string
        default: my_org
      repo_name:
        type: string
        default: my_repo
    docker:
      - image: circleci/go:1.15.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run: echo "project directory is go/src/github.com/<< parameters.org_name >>/<< parameters.repo_name >>"

workflows:
  my_workflow:
    jobs:
      - build:
          org_name: my_organization
          repo_name: project1

      - build:
          org_name: my_organization
          repo_name: project2

```

詳細については、「[parameters 宣言の使用]({{ site.baseurl }}/ja/2.0/reusing-config/#parameters-%E5%AE%A3%E8%A8%80%E3%81%AE%E4%BD%BF%E7%94%A8)」を参照してください。

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

**Note:** The `$BASH_ENV` workaround only works with `bash`. 他のシェルではおそらく機能しません。

### Alpine Linux
{:.no_toc}

[Alpine Linux](https://alpinelinux.org/) ベースのイメージ ([Docker](https://hub.docker.com/_/docker) など) は `ash` シェルを使用します。

以下の 2 つのパラメーターをジョブに追加するだけで、`bash` で環境変数を使用できます。

```yaml
version: 2.1

jobs:
  build:    
    shell: /bin/sh -leo pipefail
    environment:
      - BASH_ENV: /etc/profile
```

## シェル コマンドでの環境変数の設定

CircleCI は環境変数の設定時の挿入をサポートしませんが、[`BASH_ENV` を使用](#%E3%83%91%E3%83%A9%E3%83%A1%E3%83%BC%E3%82%BF%E3%83%BC%E3%81%A8-bash-%E7%92%B0%E5%A2%83%E3%81%AE%E4%BD%BF%E7%94%A8)して、現在のシェルに変数を設定することは可能です。 これは、`PATH` を変更するときや、他の変数を参照する環境変数を設定するときに便利です。

```yaml
version: 2.1 

jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run:
          name: Update PATH and Define Environment Variable at Runtime
          command: |
            echo 'export PATH=/path/to/foo/bin:$PATH' >> $BASH_ENV
            echo 'export VERY_IMPORTANT=$(cat important_value)' >> $BASH_ENV
            source $BASH_ENV
```

**Note**: Depending on your shell, you may have to append the new variable to a shell startup file like `~/.tcshrc` or `~/.zshrc`.

詳細については、シェルのドキュメントで環境変数の設定方法を参照してください。

## ステップでの環境変数の設定

1 つのステップで環境変数を設定するには、[`environment` キー]({{ site.baseurl }}/2.0/configuration-reference/#run)を使用します。

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: Run migrations
          command: sql/docker-entrypoint.sh sql
          # Environment variable for a single command shell
          environment:
            DATABASE_URL: postgres://conductor:@localhost:5432/conductor_test
```

**Note:** Since every `run` step is a new shell, environment variables are not shared across steps. 複数のステップで環境変数にアクセスできるようにする必要がある場合は、[`BASH_ENV` を使用](#%E3%83%91%E3%83%A9%E3%83%A1%E3%83%BC%E3%82%BF%E3%83%BC%E3%81%A8-bash-%E7%92%B0%E5%A2%83%E3%81%AE%E4%BD%BF%E7%94%A8)して値をエクスポートします。

## ジョブでの環境変数の設定

1 つのジョブで環境変数を設定するには、[`environment` キー]({{ site.baseurl }}/2.0/configuration-reference/#job_name)を使用します。

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      FOO: bar
```

**注: 7 桁以上の整数は指数表記に変換されます。 これを回避するには、整数を文字列として格納してください (例: "1234567")。**

## コンテキストでの環境変数の設定

1. CircleCI アプリケーションで、左のナビゲーションにあるリンクをクリックして、[Organization Settings (組織設定)] に移動します。

    ![コンテキスト]({{ site.baseurl }}/assets/img/docs/org-settings-contexts-v2.png)

2. 環境変数を関連付けるコンテキストを選択するか、[Create Context (コンテキストを作成)] ボタンをクリックして新しいコンテキストを作成します。
3. [Add Environment Variable (環境変数を追加)] をクリックし、名前と値を入力します。
4. 以下のように `.circleci/config.yml` ファイルで、workflows キーの下にコンテキストを追加してから、新しい環境変数を使用します。

```yaml
version: 2.1

workflows:
  test-env-vars:
    jobs:
      - build:
          context: my_context_name # has an env var called MY_ENV_VAR

jobs:
  build:
    docker:
      - image: cimg/base:2020.01
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: 
          name: "echo an env var that is part of our context"
          command: |
            echo $MY_ENV_VAR
```

コンテキストを作成すると、複数のプロジェクト間で環境変数を共有すると共に、アクセス可能なユーザーを制御できるようになります。 詳細については、[コンテキストに関するドキュメント]({{ site.baseurl }}/2.0/contexts/)を参照してください。

## プロジェクトでの環境変数の設定

1. CircleCI アプリケーションで、プロジェクトを選択し [Pipelines (パイプライン)] ページにある歯車アイコンをクリックするか、他のページで 3 つの点をクリックして、プロジェクトの設定に移動します。

    ![環境変数]({{ site.baseurl }}/assets/img/docs/project-settings-env-var-v2.png)

2. [Environment Variables (環境変数)] をクリックします。
3. [Add Variable (変数の追加)] ボタンをクリックして新しい変数を追加し、名前と値を入力します。
4. 以下のように `.circleci/config.yml` で、新しい環境変数を使用します。

```yaml
version: 2.1

workflows:
  test-env-vars:
    jobs:
      - build

jobs:
  build:
    docker:
      - image: cimg/base:2020.01
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: 
          name: "echo an env var that is part of our project"
          command: |
            echo $MY_ENV_VAR # this env var must be set within the project
```

作成された環境変数は、アプリケーションに表示されず、編集することはできません。 環境変数を変更するには、削除して作成し直すしかありません。

## コンテナでの環境変数の設定

環境変数は Docker コンテナにも設定することができます。 設定するには、[`environment` キー]({{ site.baseurl }}/2.0/configuration-reference/#docker)を使用します。

**Note**: Environment variables set in this way are not available to _steps_ run within the container, they are only available to the entrypoint/command run _by_ the container. CircleCI のデフォルトでは、ジョブのプライマリ コンテナのエントリポイントは無視されます。 プライマリ コンテナの環境変数を利用可能にするには、エントリポイントを保持する必要があります。 For more information, see the [_adding an entrypoint_ section of the Custom Images guide]({{ site.baseurl }}/2.0/custom-images/#adding-an-entrypoint).

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: <image>:<tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        # environment variables available for entrypoint/command run by docker container
        environment:
          MY_ENV_VAR_1: my-value-1
          MY_ENV_VAR_2: my-value-2
```

以下に、プライマリ コンテナ イメージ (最初にリストされたイメージ) とセカンダリ (サービス) コンテナ イメージに、別々の環境変数を設定する例を示します。

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: <image>:<tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          MY_ENV_VAR_1: my-value-1
          MY_ENV_VAR_2: my-value-2
      - image: <image>:<tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          MY_ENV_VAR_3: my-value-3
          MY_ENV_VAR_4: my-value-4
```

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

**Note:** Not all command-line programs take credentials in the same way that `docker` does.

## API v2 を使用した環境変数の挿入

CircleCI API v2 を使用すると、パイプライン パラメーターから変数を渡すことができます。

[パイプラインをトリガーする]({{site.baseurl}}/api/v2/#operation/getPipelineConfigById) API v2`` エンドポイントを使用すると、特定のパラメーターの値でパイプラインをトリガーすることができます。 これを実行するには、`POST` 本体の JSON パケット内で `parameters` キーを渡します。

下の例では、上記の設定ファイルの例で説明したパラメーターを使用して、パイプラインをトリガーしています (注: API からパイプラインをトリガーするときにパラメーターを渡すには、設定ファイルでパラメーターを宣言している必要があります)。

```sh
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:project_slug/pipeline
```

**IMPORTANT** Pipeline parameters are not treated as sensitive data and must not be used by customers for sensitive values (secrets). シークレットは、[プロジェクト設定ページ]({{site.baseurl}}/2.0/settings/)と[コンテキスト ページ]({{site.baseurl}}/2.0/ja/lossary/#context)で確認できます。

詳細については、「[パイプライン変数]({{site.baseurl}}/2.0/pipeline-variables/)」を参照してください。

## API v1 を使用した環境変数の挿入

ビルド パラメーターは環境変数であるため、以下の条件に従って名前を付けます。

- 使用できるのは ASCII 文字、数字、アンダースコア文字のみです
- 先頭に数字を使用することはできません
- 少なくとも 1 文字を含む必要があります

環境変数の通常の制限以外には、値自体への制限はなく、単純な文字列として扱われます。 The order that build parameters are loaded in is **not** guaranteed so avoid interpolating one build parameter into another. ベスト プラクティスとして、独立した環境変数から成る順不同のリストとしてビルド パラメーターを設定することをお勧めします。

**IMPORTANT** Build parameters are not treated as sensitive data and must not be used by customers for sensitive values (secrets). シークレットは、[プロジェクト設定ページ]({{site.baseurl}}/2.0/settings/)と[コンテキスト ページ]({{site.baseurl}}/2.0/ja/lossary/#context)で確認できます。

たとえば、以下のパラメーターを渡すとします。

```sh
{
  "build_parameters": {
    "foo": "bar",
    "baz": 5,
    "qux": {"quux": 1},
    "list": ["a", "list", "of", "strings"]
  }
}
```

このビルドは、以下の環境変数を受け取ります。

```sh
export foo="bar"
export baz="5"
export qux="{\"quux\": 1}"
export list="[\"a\", \"list\", \"of\", \"strings\"]"
```

ビルド パラメーターは、ジョブのコンテナ内の環境変数としてエクスポートされ、`config.yml` 内のスクリプトまたはプログラム、コマンドで使用できます。 挿入された環境変数を使用して、ジョブの中で実行されるステップに影響を与えることができます。 挿入された環境変数よりも `config.yml` やプロジェクト設定で定義された値が優先されるので、注意が重要です。

`build_parameters` キーを使用して環境変数を挿入することで、実行のたびに異なるターゲットに対して機能テストをビルドできます。 たとえば、ステージング環境へのデプロイ ステップを持つ実行で、さまざまなホストに対する機能テストをビルドするとします。 `bash` と `curl` を使用した以下の例のように、JSON 本体を `Content-type: application/json` で送信することで、`build_parameters` を使用できます (ただし、選択した言語の HTTP ライブラリを使用することも可能です)。

```sh
{
  "build_parameters": {
    "param1": "value1",
    "param2": 500
  }
}
```

たとえば、以下のように `curl` を使用します。

```sh
curl \
  --header "Content-Type: application/json" \
  --header "Circle-Token: $CIRCLE_TOKEN" \
  --data '{"build_parameters": {"param1": "value1", "param2": 500}}' \
  --request POST \
  https://circleci.com/api/v1.1/project/github/circleci/mongofinil/tree/master
```

上の例の `$CIRCLE_TOKEN` は[パーソナル API トークン]({{ site.baseurl }}/ja/2.0/managing-api-tokens/#%E3%83%91%E3%83%BC%E3%82%BD%E3%83%8A%E3%83%AB-api-%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%81%AE%E4%BD%9C%E6%88%90)です。

このビルドは、以下の環境変数を受け取ります。

```sh
export param1="value1"
export param2="500"
```

POST API 呼び出しを使用して実行を開始します。詳細については、API ドキュメントで[新しいビルドのセクション](https://circleci.com/docs/api/v1/#trigger-a-new-build-with-a-branch)を参照してください。 本体が空の POST は、指定されたブランチの新しい実行を開始します。

## 定義済み環境変数

以下の環境変数はビルドごとにエクスポートされ、より複雑なテストやデプロイに使用できます。

**Note:** You cannot use a built-in environment variable to define another environment variable. 代わりに、`run` ステップを使用して、新しい環境変数を `BASH_ENV` でエクスポートする必要があります。

詳細については、「[シェル コマンドでの環境変数の設定](#%E3%82%B7%E3%82%A7%E3%83%AB-%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A)」を参照してください。

| 変数                          | タイプ  | 値                                                                                                                                                                                                                                                                                         |
| --------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CI`                        | ブール値 | `true` (現在の環境が CI 環境かどうかを表します)                                                                                                                                                                                                                                                            |
| `CIRCLECI`                  | ブール値 | `true` (現在の環境が CircleCI 環境かどうかを表します)                                                                                                                                                                                                                                                      |
| `CIRCLE_BRANCH`             | 文字列  | 現在ビルド中の Git ブランチの名前                                                                                                                                                                                                                                                                       |
| `CIRCLE_BUILD_NUM`          | 整数   | 現在のジョブの番号。 この番号はジョブごとに一意です。                                                                                                                                                                                                                                                               |
| `CIRCLE_BUILD_URL`          | 文字列  | CircleCI での現在のジョブの URL                                                                                                                                                                                                                                                                    |
| `CIRCLE_JOB`                | 文字列  | 現在のジョブの名前                                                                                                                                                                                                                                                                                 |
| `CIRCLE_NODE_INDEX`         | 整数   | (並列処理を有効化してジョブを実行する場合) 現在の並列実行のインデックスであり、 0 から "`CIRCLE_NODE_TOTAL` - 1" までの値を取ります。                                                                                                                                                                                                       |
| `CIRCLE_NODE_TOTAL`         | 整数   | (並列処理を有効化してジョブを実行する場合) 現在の並列実行の総数であり、 設定ファイルの `parallelism` の値と等しくなります。                                                                                                                                                                                                                   |
| `CIRCLE_PR_NUMBER`          | 整数   | 関連付けられた GitHub または Bitbucket プル リクエストの番号。 フォークされた PR でのみ使用できます。                                                                                                                                                                                                                           |
| `CIRCLE_PR_REPONAME`        | 文字列  | プル リクエストが作成された GitHub または Bitbucket リポジトリの名前。 フォークされた PR でのみ使用できます。                                                                                                                                                                                                                       |
| `CIRCLE_PR_USERNAME`        | 文字列  | プル リクエストを作成したユーザーの GitHub または Bitbucket ユーザー名。 フォークされた PR でのみ使用できます。                                                                                                                                                                                                                      |
| `CIRCLE_PREVIOUS_BUILD_NUM` | 整数   | 現在のブランチのこれまでのビルドの数                                                                                                                                                                                                                                                                        |
| `CIRCLE_PROJECT_REPONAME`   | 文字列  | 現在のプロジェクトのリポジトリの名前                                                                                                                                                                                                                                                                        |
| `CIRCLE_PROJECT_USERNAME`   | 文字列  | 現在のプロジェクトの GitHub または Bitbucket ユーザー名                                                                                                                                                                                                                                                     |
| `CIRCLE_PULL_REQUEST`       | 文字列  | 関連付けられたプル リクエストの URL。 複数のプル リクエストが関連付けられている場合は、いずれか 1 つの URL がランダムに選択されます。                                                                                                                                                                                                                |
| `CIRCLE_PULL_REQUESTS`      | リスト  | 現在のビルドに関連付けられたプル リクエストの URL の一覧 (カンマ区切り)                                                                                                                                                                                                                                                  |
| `CIRCLE_REPOSITORY_URL`     | 文字列  | GitHub または Bitbucket リポジトリ URL                                                                                                                                                                                                                                                            |
| `CIRCLE_SHA1`               | 文字列  | 現在のビルドの前回のコミットの SHA1 ハッシュ                                                                                                                                                                                                                                                                 |
| `CIRCLE_TAG`                | 文字列  | git タグの名前 (現在のビルドがタグ付けされている場合)。 詳細については、「[Git タグに対応するワークフローを実行する]({{ site.baseurl }}/ja/2.0/workflows/#git-%E3%82%BF%E3%82%B0%E3%81%AB%E5%AF%BE%E5%BF%9C%E3%81%99%E3%82%8B%E3%83%AF%E3%83%BC%E3%82%AF%E3%83%95%E3%83%AD%E3%83%BC%E3%82%92%E5%AE%9F%E8%A1%8C%E3%81%99%E3%82%8B)」を参照してください。 |
| `CIRCLE_USERNAME`           | 文字列  | パイプラインをトリガーしたユーザーの GitHub または Bitbucket ユーザー名                                                                                                                                                                                                                                             |
| `CIRCLE_WORKFLOW_ID`        | 文字列  | 現在のジョブのワークフロー インスタンスの一意の識別子。 この識別子は、特定のワークフロー インスタンス内のすべてのジョブで同じです。                                                                                                                                                                                                                       |
| `CIRCLE_WORKING_DIRECTORY`  | 文字列  | 現在のジョブの `working_directory` キーの値                                                                                                                                                                                                                                                          |
| `CIRCLE_INTERNAL_TASK_DATA` | 文字列  | **Internal**. ジョブ関連の内部データが格納されるディレクトリ。 データ スキーマは変更される可能性があるため、このディレクトリのコンテンツは文書化されていません。                                                                                                                                                                                                  |
| `CIRCLE_COMPARE_URL`        | 文字列  | **Deprecated**. 同じビルドのコミットどうしを比較するための GitHub または Bitbucket URL。 v2 以下の設定ファイルで使用可能です。 v2.1 では、この変数に代わり "[パイプライン値]({{ site.baseurl }}/2.0/pipeline-variables/)" が導入されています。                                                                                                                  |
| `CI_PULL_REQUEST`           | 文字列  | **Deprecated**. Kept for backward compatibility with CircleCI 1.0. Use `CIRCLE_PULL_REQUEST` instead.                                                                                                                                                                                     |
| `CI_PULL_REQUESTS`          | リスト  | **Deprecated**. Kept for backward compatibility with CircleCI 1.0. Use `CIRCLE_PULL_REQUESTS` instead.                                                                                                                                                                                    |

{:class="table table-striped"}

**Note:** For a list of pipeline values and parameters, refer to the [Pipeline Variables]({{ site.baseurl }}/2.0/pipeline-variables/#pipeline-values) page.

## 関連項目
{:.no_toc}

[Contexts]({{ site.baseurl }}/2.0/contexts/) [Keep environment variables private with secret masking](https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/)
