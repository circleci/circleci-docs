---
layout: classic-docs
title: "環境変数の使用"
short-title: "環境変数の使用"
description: "CircleCI でサポートされている環境変数の一覧"
order: 40
version:
  - クラウド
  - Server v3.x
  - Server v2.x
suggested:
  - 
    title: 環境変数を非公開のままにする
    link: https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/
  - 
    title: 環境変数の設定のトラブルシューティング
    link: https://discuss.circleci.com/t/somehow-i-just-cannot-get-the-enviroment-variable-from-enviroment-variable-setting-an-context-in-organization-menu/40342
  - 
    title: 環境変数としてファイルを挿入する
    link: https://support.circleci.com/hc/en-us/articles/360003540393?input_string=how+to+i+inject+an+environment+variable+using+the+api%3F
---

## 概要
{: #overview }

CircleCI では、スコープや認可レベルに幅を持たせるために、環境変数の使用方法を複数提供しています。 環境変数は、設定方法に応じて[優先順位](#order-of-precedence)に基づいて使用され、設定ファイルの各レベルで制御することができます。

非公開のプロジェクト全体で使用する**プライベートキー**または**シークレット環境変数**を追加するには、CircleCI アプリケーションで **Project Settings (プロジェクト設定)**の [[Environment Variables (環境変数)] のページ](#setting-an-environment-variable-in-a-project)に移動します。 これらの変数の値は、設定後はアプリで読み取ることはできません。

プライベート環境変数を使用すると、プロジェクトがパブリックの場合でもシークレットを安全に格納できます。 関連する設定情報については、[オープンソースプロジェクトのビルド]({{site.baseurl}}/ja/oss/)のページを参照してください。

[[環境変数へのアクセスをさらに制限する]](#setting-an-environment-variable-in-a-context)には、コンテキストを使用してください。 コンテキストは CircleCI アプリケーションの [Organization Settings (組織設定)] で設定します。 コンテキストを使用して環境変数へのアクセスを制御する方法の詳細は、[コンテキストの制限]({{site.baseurl}}/ja/contexts/#restricting-a-context)を参照してください。

## シークレットのマスキング
{: #secrets-masking }

_シークレットのマスキングは、オンプレミス版である CircleCI Server では現在サポートされていません。_

シークレットのマスキングは、[Project Settings (プロジェクト設定)] または [Contexts (コンテキスト)] で設定されている環境変数に適用されます。 環境変数は、プロジェクトのシークレットやキーを保持します。 シークレットやキーはアプリケーションにとってきわめて重要なものです。 `echo` や `print` が使用される際にジョブ出力における環境変数を不明瞭にすることにより、CircleCI のセキュリティを強化します。

以下の場合、環境変数の値はビルドの出力でマスキングされません。

* 環境変数の値が 4 文字未満
* 環境変数の値が `true`、`True`、`false`、`False` のいずれか

**注:** シークレットのマスキングは、ビルドの出力で環境変数の値が表示されないようにするだけの機能です。 `-x` や `-o xtrace` オプションを使ってバッシュシェルを呼び出すとマスキングされていないシークレットが誤ってログに記録される場合があります ([シェルスクリプトの使用]({{site.baseurl}}/ja/using-shell-scripts)を参照してください)。

別の場所 (テスト結果やアーティファクトなど)に出力される場合、シークレットはマスキングされません。 コンテキストの値には、[SSH を使用したデバッグ]({{site.baseurl}}/ja/ssh-access-jobs)を行うユーザーがアクセスできます。

## 組織名とリポジトリ名の変更
{: #renaming-orgs-and-repositories }

CircleCI と連携済みの組織名やリポジトリ名を変更する必要が生じた場合、下記のステップに従うことが推奨されます:

1. VCS で組織名またはリポジトリ名を変更します。
2. 新しい組織名またはリポジトリ名を使用して CircleCI アプリケーションにアクセスします (例: `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`)。
3. プラン、プロジェクト、設定が正常に転送されたことを確認します。
4. これで、必要に応じて VCS の古い名前で新しい組織やリポジトリを作成できます。

**注**: 上記の手順で変更を行わない場合、組織やレポジトリの**環境変数**や**コンテキスト**などの設定にアクセスができなくなる場合があります。

## 環境変数の使用オプション
{: #environment-variable-usage-options }

CircleCI は Bash を使用しますが、ここでは POSIX 命名規則に従った環境変数が使用されます。 大文字・小文字のアルファベット、数字、アンダースコアが使用でき、 環境変数の頭文字はアルファベットとします。

### 優先順位
{: #order-of-precedence }
{:.no_toc}

環境変数は、以下に示す優先順位に従って使用されます。

1. `FOO=bar make install` など、`run` ステップの[シェル コマンド](#setting-an-environment-variable-in-a-shell-command)で宣言された環境変数
2. [`run` ステップ](#setting-an-environment-variable-in-a-step)で `environment` キーを使用して宣言された環境変数
3. [ジョブ](#setting-an-environment-variable-in-a-job)で `environment` キーを使用して設定された環境変数
4. このドキュメントの「[CircleCI 定義済み環境変数](#built-in-environment-variables)」セクションで解説されている特別な CircleCI 環境変数
5. コンテキスト環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合)。 手順については、[コンテキストに関するドキュメント]({{site.baseurl}}/ja/contexts)を参照してください。
6. [Project Settings (プロジェクト設定)] ページで設定された[プロジェクトレベルの環境変数](#setting-an-environment-variable-in-a-project)

`FOO=bar make install` のように、`run` ステップのシェル コマンドで宣言された環境変数は、`environment` キーおよび `contexts` キーを使用して宣言された環境変数よりも優先されます。 コンテキストページで追加された環境変数はプロジェクト設定ページで追加されたものより優先して使われます。

![環境変数の優先順位]({{site.baseurl}}/assets/img/docs/env-var-order.png)

#### セキュリティに関する注意事項
{: #notes-on-security }
{:.no_toc}

`.circleci/config.yml` ファイル内にシークレットやキーを追加しないでください。 CircleCI 上のプロジェクトにアクセスできる開発者には、`config.yml` の全文が表示されます。 シークレットやキーは、CircleCI アプリの[プロジェクト](#setting-an-environment-variable-in-a-project)や[コンテキスト](#setting-an-environment-variable-in-a-context)の設定に保存します。 詳細については、セキュリティに関するドキュメントの「[暗号化]({{site.baseurl}}/ja/security/#encryption)」セクションを参照してください。

設定内でスクリプトを実行すると、シークレット環境変数が公開される場合があります。 スクリプトのセキュアな活用方法については、[シェルスクリプトの使い方]({{site.baseurl}}/ja/using-shell-scripts/#shell-script-best-practices)ページでご確認ください。

### 環境変数の設定例
{: #example-configuration-of-environment-variables }
{:.no_toc}

以下のような `config.yml` を例に考えてみましょう。

```yaml
version: 2.1

jobs: # basic units of work in a run
  build:
    docker: # use the Docker executor
      # CircleCI node images available at: https://hub.docker.com/r/circleci/node/
      - image: cimg/node:17.2.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps: # steps that comprise the `build` job
      - checkout # check out source code to working directory
      # Run a step to setup an environment variable
      # Redirect MY_ENV_VAR into $BASH_ENV
      - run:
          name: "Setup custom environment variables"
          command: echo 'export MY_ENV_VAR="FOO"' >> "$BASH_ENV"
      - run: # print the name of the branch we're on
          name: "What branch am I on?"
          command: echo ${CIRCLE_BRANCH}
      # 上記のステップと同じことをするステップを実行
      # 環境変数を参照する際には波括弧をつけなくても大丈夫です
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

workflows: # build という名前のジョブを実行するだけのワークフロー
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
{: #using-parameters-and-bash-environment }
{:.no_toc}

原則として、CircleCI はビルド設定への環境変数の挿入をサポートしていません。 使用する値はリテラルとして扱われます。 そのため、`working_directory` を定義するときや、`PATH` を変更するとき、複数の `run` ステップで変数を共有するときに、問題が発生する可能性があります。

ただし、[プライベート イメージ]({{site.baseurl}}/ja/private-images/)をサポートするため、Docker イメージ セクションは例外となっています。

以下の例では、`$ORGNAME` と `$REPONAME` に挿入は行われません。

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

`version: 2.1` の設定ファイルを使用すると、`config.yml` 全体の設定の一部を再利用できます。 以下のように `parameters` 宣言を使用することで、再利用可能な `commands` `jobs` や `executors` に挿入を行う (値を渡す) ことができます。

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
      - image: cimg/go:1.17.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
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

詳細については、[パラメーター宣言の使用]({{site.baseurl}}/ja/reusing-config/#using-the-parameters-declaration)を参照してください。

設定ファイルに値を挿入する方法として、以下のように、`run` ステップを使用して環境変数を `BASH_ENV` にエクスポートすることもできます。

```yaml
steps:
  - run:
      name: Setup Environment Variables
      command: |
        echo 'export PATH="$GOPATH"/bin:"$PATH"' >> "$BASH_ENV"
        echo 'export GIT_SHA1="$CIRCLE_SHA1"' >> "$BASH_ENV"
```

各ステップで、CircleCI は `bash` を使用して `BASH_ENV` を取得します。 つまり、`BASH_ENV` が自動的にロードおよび実行されることで、挿入を使用して複数の `run` ステップで環境変数を共有できるようになります。

**注:** この `$BASH_ENV` による回避策は `bash` でのみ機能します。 他のシェルではおそらく機能しません。

### Alpine Linux
{: #alpine-linux }
{:.no_toc}

[Alpine Linux](https://alpinelinux.org/) ベースのイメージ ([Docker](https://hub.docker.com/_/docker) など) は `ash` シェルを使用します。

以下の 2 つのパラメーターをジョブに追加するだけで、`bash` で環境変数を使用できます。

```yaml
version: 2.1

jobs:
  build:
    shell: /bin/sh -leo pipefail
    environment:
      BASH_ENV: /etc/profile
```

## シェルコマンドでの環境変数の設定
{: #setting-an-environment-variable-in-a-shell-command }

CircleCI は環境変数の設定時の挿入をサポートしませんが、[`BASH_ENV` を使用](#using-parameters-and-bash-environment)して、現在のシェルに変数を設定することは可能です。 これは、`PATH` を変更するときや、他の変数を参照する環境変数を設定するときに便利です。

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
          # Add source command to execute code and make variables 
          # available in current step.
          command: |
            echo 'export PATH=/path/to/foo/bin:"$PATH"' >> "$BASH_ENV"
            echo 'export VERY_IMPORTANT=$(cat important_value)' >> "$BASH_ENV"
            source "$BASH_ENV"
```

**注:** シェルによっては、`~/.tcshrc` や `~/.zshrc` などのシェルスタートアップ ファイルに新しい変数を付加しなければならない場合があります。

環境変数の設定についての詳細は、ご使用のシェルのドキュメントを確認してください。

## ステップでの環境変数の設定
{: #setting-an-environment-variable-in-a-step }

ステップで環境変数を設定するには、[`environment` キー]({{site.baseurl}}/ja/configuration-reference/#run)を使用します。

```yaml
version: 2.1

jobs:
  build:
    docker:

      - image: smaant/lein-flyway:2.7.1-4.0.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run:
          name: 移行の実行
          command: sql/docker-entrypoint.sh sql
          # 単一のコマンド シェル用の環境変数
          environment:
            DATABASE_URL: postgres://conductor:@localhost:5432/conductor_test
```

**注:** 各 `run` ステップは新しいシェルなので、環境変数はステップ間で共有されません。 複数のステップで環境変数にアクセスできるようにする必要がある場合は、[`BASH_ENV` を使用](#using-parameters-and-bash-environment)して値をエクスポートします。

## ジョブでの環境変数の設定
{: #setting-an-environment-variable-in-a-job }

1 つのジョブで環境変数を設定するには、[`environment` キー]({{site.baseurl}}/ja/configuration-reference/#job_name)を使用します。

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/base:2022.04-20.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      FOO: bar
```

**注: 7 桁以上の整数は指数表記に変換されます。 これを回避するには、整数を文字列として格納してください (例: "1234567")。**

## コンテキストでの環境変数の設定
{: #setting-an-environment-variable-in-a-context }

1. CircleCI Web アプリで、左のナビゲーションにあるリンクをクリックして、[Organization Settings (組織の設定)] に移動します。

    ![コンテキスト]({{site.baseurl}}/assets/img/docs/org-settings-contexts-v2.png)

2. 環境変数を関連付けるコンテキストを選択するか、[Create Context (コンテキストを作成)] ボタンをクリックして新しいコンテキストを作成します。
3. [Add Environment Variable (環境変数を追加)] をクリックし、名前と値を入力します。
4. 以下のように `.circleci/config.yml` ファイルで、workflows キーの下にコンテキストを追加してから、新しい環境変数を使用します。

```yaml
version: 2.1

workflows:
  test-env-vars:
    jobs:
      - build:
          context: my_context_name # MY_ENV_VAR という名前の環境変数を持つ

jobs:
  build:
    docker:
      - image: cimg/base:2021.11
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
    steps:
      - checkout
      - run:
          name: "コンテキストに含まれる環境変数を出力"
          command: |
            echo $MY_ENV_VAR
```

コンテキストを作成すると、複数のプロジェクト間で環境変数を共有すると共に、アクセス可能なユーザーを制御できるようになります。 詳細については、[コンテキストに関するドキュメント]({{site.baseurl}}/ja/contexts/)を参照してください。

## プロジェクトでの環境変数の設定
{: #setting-an-environment-variable-in-a-project }

1. CircleCI Web アプリで、プロジェクトの設定に移動します。 以下の 2 つの方法があります。: サイドナビゲーションの**Projects** に移動し、プロジェクトの行の省略符号ボタンをクリックするか、プロジェクトの各**Pipelines** のページの **Project Settings** ボタンをクリックします。

    ![環境変数]({{site.baseurl}}/assets/img/docs/project-settings-env-var-v2.png)

2. サイドナビゲーションの **Environment Variables** をクリックします。
3. **Add Variable** をクリックして新しい環境変数の名前と値を入力します。
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
      - image: cimg/base:2021.11
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run:
          name: "プロジェクトに含まれる環境変数を出力"
          command: |
            echo $MY_ENV_VAR # この環境変数はプロジェクト内で設定が必要
```

Once created, environment variables are hidden in the application. You may change an environment variable by deleting and recreating it.

At this time, it is possible to edit an environment variable's value by adding a new environment variable of the same name but with a different value.
{: class="alert alert-info"}

## コンテナでの環境変数の設定
{: #setting-an-environment-variable-in-a-container }

環境変数は Docker コンテナにも設定することができます。 設定するには、[`environment` キー]({{site.baseurl}}/ja/configuration-reference/#docker)を使用します。

**注:**: この方法で設定する環境変数は、コンテナ内で実行される*ステップ*では使用できません。 これらを使用できるのは、コンテナ*によって*実行されるエントリポイントとコマンドのみです。 CircleCI のデフォルトでは、ジョブのプライマリ コンテナのエントリポイントは無視されます。 プライマリ コンテナの環境変数を利用可能にするには、エントリポイントを保持する必要があります。 詳細については、[カスタム ビルドの Docker イメージの使用ページの_エントリポイントの追加_セクション]({{site.baseurl}}/ja/custom-images/#adding-an-entrypoint)を参照してください。

```yaml
version: 2.1

jobs:
  build:
    docker:

      - image: <image>:<tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
        # 環境変数は Docker コンテナによって実行されるエントリポイント/コマンドに使用可能
        environment:
          MY_ENV_VAR_1: my-value-1
          MY_ENV_VAR_2: my-value-2
```

以下に、プライマリ コンテナ イメージ (最初にリストされたイメージ) とセカンダリ (サービス) コンテナ イメージに、別々の環境変数を設定する例を示します。

**注: **: ハードコードされた環境変数は、セカンダリコンテナまたはサービスコンテナに正しく渡されますが、コンテキストやプロジェクト固有の環境変数は、プライマリコンテナ以外のコンテナには挿入されません。

```yaml
version: 2.1

jobs:
  build:
    docker:

      - image: <image>:<tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
        environment:
          MY_ENV_VAR_1: my-value-1
          MY_ENV_VAR_2: my-value-2
      - image: <image>:<tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
        environment:
          MY_ENV_VAR_3: my-value-3
          MY_ENV_VAR_4: my-value-4
```

### 複数行にわたる環境変数のエンコード
{: #encoding-multi-line-environment-variables }
{:.no_toc}

複数行の環境変数を追加する際に問題が発生した場合は、`base64` を使用してエンコードします。

```shell
$ echo "foobar" | base64 --wrap=0
Zm9vYmFyCg==
```

結果の値を CircleCI 環境変数に格納します。

```shell
$ echo $MYVAR
Zm9vYmFyCg==
```

その変数を使用するコマンド内で変数をデコードします。

```shell
$ echo $MYVAR | base64 --decode | docker login -u my_docker_user --password-stdin
Login Succeeded
```

**注:** すべてのコマンドラインプログラムが `docker` と同じ方法で認証情報を受け取るわけではありません。

## API v2 を使用した環境変数の挿入
{: #injecting-environment-variables-with-api-v2 }

CircleCI API v2 を使用すると、パイプライン パラメーターから変数を渡すことができます。

[パイプラインをトリガーする]({{site.baseurl}}/api/v2/#operation/getPipelineConfigById) API v2 エンドポイントを使用すると、特定のパラメーターの値でパイプラインをトリガーすることができます。 これを実行するには、`POST` 本体の JSON パケット内で `parameters` キーを渡します。

下の例では、上記の設定ファイルの例で説明したパラメーターを使用して、パイプラインをトリガーしています (注: API からパイプラインをトリガーするときにパラメーターを渡すには、設定ファイルでパラメーターを宣言している必要があります)。

```shell
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:project_slug/pipeline
```

**重要:** パイプラインパラメーターは機密データとして扱われないため、機密の値 (シークレット) には使用しないでください。 シークレットは、[プロジェクト設定ページ]({{site.baseurl}}/ja/settings/)と[コンテキスト ページ]({{site.baseurl}}/ja/glossary/#context)で確認できます。

詳細については、[パイプラインの値とパラメーター]({{site.baseurl}}/ja/pipeline-variables/)のガイドを参照してください。

## API v1 を使用した環境変数の挿入
{: #injecting-environment-variables-with-api-v1 }

ビルド パラメーターは環境変数であるため、以下の条件に従って名前を付けます。

- 変数名に使えるのは ASCII 文字列、数字、アンダースコアのみです
- 数字から始まる変数は使えません
- 少なくとも 1 文字以上の変数でなければなりません

環境変数における通常の制約の他に、変数値自体に注意すべきところはありません。単純な文字列として扱われるところも変わりありません。 ビルド パラメーターがロードされる順序は**保証されない**ため、ビルド パラメーターに値を挿入して別のビルド パラメーターに渡すことは避けてください。 順不同の独立した環境変数リストとしてビルドパラメータを設定するのがおすすめです。

**重要:** ビルド パラメーターは機密データとして扱われないため、機密の値 (シークレット) には使用しないでください。 シークレットは、[プロジェクト設定ページ]({{site.baseurl}}/ja/settings/)と[コンテキスト ページ]({{site.baseurl}}/ja/glossary/#context)で確認できます。

たとえば、以下のパラメーターを渡すとします。

```json
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

```shell
export foo="bar"
export baz="5"
export qux="{\"quux\": 1}"
export list="[\"a\", \"list\", \"of\", \"strings\"]"
```

ビルドパラメータは各ジョブのコンテナ内で環境変数としてエクスポートされ、`config.yml` のスクリプトやプログラム、コマンドで使われることになります。 代入された環境変数はジョブ内のステップの実行内容を変えるのに使われることもあります。 ここで念頭に置いておかなければいけないのは、代入された環境変数は `config.yml` で定義されたものでも、プロジェクトの設定で定義されたものでも、上書きできないことです。

連続的に異なるターゲット OS で機能テストを行うのに、`build_parameters` キーに環境変数を代入したくなるかもしれません。 例えば、複数の異なるホストに対して機能テストが必要なステージング環境へのデプロイを実行するような場合です。 下記の例のように、`bash` と `curl` を組み合わせ (開発言語にあらかじめ用意されている HTTP ライブラリを使ってもかまいません)、`Content-type: application/json` として JSON フォーマットでデータ送信する形で `build_parameters` を含ませることが可能です。

```json
{
  "build_parameters": {
    "param1": "value1",
    "param2": 500
  }
}
```

`curl` の場合は下記のようにします。

```shell
curl \
  --header "Content-Type: application/json" \
  --header "Circle-Token: $CIRCLE_TOKEN" \
  --data '{"build_parameters": {"param1": "value1", "param2": 500}}' \
  --request POST \
  https://circleci.com/api/v1.1/project/github/circleci/mongofinil/tree/master
```

ここで使われている `$CIRCLE_TOKEN` は [パーソナル API トークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-personal-api-token)です。

ビルド時には下記のような環境変数となります。

```shell
export param1="value1"
export param2="500"
```

POST API 呼び出しを使用して実行を開始します。 詳細については、API ドキュメントで[新しいビルドのセクション](https://circleci.com/docs/api/v1/#trigger-a-new-build-with-a-branch)を参照してください。 パラメータなしで POST リクエストした場合は名前付きブランチが新規で実行されます。

## 定義済み環境変数
{: #built-in-environment-variables }

定義済みの環境変数はジョブごとにエクスポートされ、より複雑なテストやデプロイの実行に使用されます。

{% include snippets/ja/built-in-env-vars.md %}

値や定義済みのデータの全リストは、[プロジェクトの値と変数に関するガイド]({{site.baseurl}}/ja/variables/#built-in-environment-variables)を参照して下さい。

## 関連項目
{: #see-also }
{:.no_toc}

[コンテキスト]({{site.baseurl}}/ja/contexts/) ブログ記事「[Keep environment variables private with secret masking (シークレットのマスキングによって環境変数を非公開に保つ)](https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/)」
