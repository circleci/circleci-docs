---
layout: classic-docs
title: "環境変数の使用"
short-title: "環境変数の使用"
description: "CircleCI でサポートされている環境変数の一覧"
order: 40
version:
- Cloud
- Server v3.x
- Server v2.x
suggested:
  - title: Keep environment variables private
    link: https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/
  - title: Troubleshoot env vars settings
    link: https://discuss.circleci.com/t/somehow-i-just-cannot-get-the-enviroment-variable-from-enviroment-variable-setting-an-context-in-organization-menu/40342
  - title: Insert files as environment variables
    link: https://support.circleci.com/hc/en-us/articles/360003540393?input_string=how+to+i+inject+an+environment+variable+using+the+api%3F
---

以下のセクションに沿って、CircleCI で環境変数を使用する方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

CircleCI では、スコープや認可レベルに幅を持たせるために、環境変数の使用方法を複数提供しています。 環境変数は、その設定方法によって[優先順位](#order-of-precedence)に基づいて使用され、構成において各レベルで制御することができます。

プライベート プロジェクト全体で使用する**プライベート キー**または**シークレット環境変数**を追加するには、CircleCI アプリケーションで [[Project Settings (プロジェクト設定)] の [Environment Variables (環境変数)] ページ](#setting-an-environment-variable-in-a-project)に移動します。 設定された後の変数の値は、アプリで読み取ることも編集することもできません。 環境変数の値を変更するには、現在の変数を削除し、新しい値を設定して再度追加します。

プライベート環境変数を使用すると、プロジェクトがパブリックの場合でもシークレットを安全に格納できます。 関連する設定情報については、「[オープンソース プロジェクトの構築]({{ site.baseurl }}/ja/2.0/oss/)」ページを参照してください。

[環境変数へのアクセスをさらに制限する](#setting-an-environment-variable-in-a-context)には、コンテキストを使用してください。コンテキストは CircleCI アプリケーションの [Organization Settings (組織設定)] で設定します。コンテキストを使用した環境変数へのアクセス制御について詳しく知りたい場合は「[コンテキストの制限]({{ site.baseurl }}/ja/2.0/contexts/#restricting-a-context)」ページを参照してください.

## シークレットのマスキング
{: #secrets-masking }

_シークレットのマスキングは、オンプレミス版である CircleCI Server では現在サポートされていません。_

シークレットのマスキングは、[Project Settings (プロジェクト設定)] または [Contexts (コンテキスト)] で設定されている環境変数に適用されます。 環境変数は、プロジェクトのシークレットやキーを保持します。 シークレットやキーはアプリケーションにとってきわめて重要なものです。 シークレットのマスキングは、`echo` や `print` が使用される際にジョブ出力における環境変数を不明瞭にすることで、CircleCI のセキュリティを強化します。

以下の場合、環境変数の値はビルドの出力でマスキングされません。

* 環境変数の値が 4 文字未満
* 環境変数の値が `true`、`True`、`false`、`False` のいずれか

**注:** シークレットのマスキングは、ビルドの出力で環境変数の値が表示されないようにするだけの機能です。テスト結果やアーティファクト内など、ビルド出力以外の場所で値が使用されている場合はマスキングされません。さらに、ユーザーは[SSH を使用したデバッグ]({{ site.baseurl }}/ja/2.0/ssh-access-jobs)で環境変数の値を確認することができます。

## 組織とリポジトリの名前変更
{: #renaming-orgs-and-repositories }

過去に CircleCI に接続した組織やリポジトリの名前を変更する場合は、以下の手順を参考にしてください。

1. VCS で組織またはリポジトリの名前を変更します。
2. 新しい組織またはリポジトリの名前を使用して CircleCI アプリケーションにアクセスします (例: `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`)。
3. プラン、プロジェクト、設定が正常に転送されたことを確認します。
4. これで、必要に応じて VCS の古い名前で新しい組織やリポジトリを作成できます。

**注:** この手順を実行しないと、**環境変数**や**コンテキスト**など、組織またはリポジトリの設定にアクセスできなくなる可能性があります。

## 環境変数の使用オプション
{: #environment-variable-usage-options }

CircleCI は Bash を使用しますが、ここでは POSIX 命名規則に従った環境変数が使用されます。 有効な文字は、アルファベット (大文字と小文字)、数字、およびアンダースコアです。 環境変数の最初の文字はアルファベットにする必要があります。

### 優先順位
{: #order-of-precedence }
{:.no_toc}

環境変数は、以下に示す優先順位に従って使用されます。

1. `FOO=bar make install` など、`run` ステップの[シェル コマンド](#setting-an-environment-variable-in-a-shell-command)で宣言された環境変数
2. [`run` ステップ](#setting-an-environment-variable-in-a-step)で `environment` キーを使用して宣言された環境変数
3. [ジョブ](#setting-an-environment-variable-in-a-job)で `environment` キーを使用して設定された環境変数
4. このドキュメントの「[CircleCI 定義済み環境変数](#built-in-environment-variables)」セクションで解説されている特別な CircleCI 環境変数
5. コンテキスト環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合)。 手順については、[コンテキストに関するドキュメント]({{ site.baseurl }}/ja/2.0/contexts)を参照してください。
6. [Project Settings (プロジェクト設定)] ページで設定された[プロジェクトレベルの環境変数](#setting-an-environment-variable-in-a-project)

`FOO=bar make install` のように、`run` ステップのシェル コマンドで宣言された環境変数は、`environment` キーおよび `contexts` キーを使用して宣言された環境変数よりも優先されます。 [Contexts (コンテキスト)] ページで追加された環境変数は、[Project Settings (プロジェクト設定)] ページで追加された変数よりも優先されます。

![環境変数の優先順位]({{ site.baseurl }}/assets/img/docs/env-var-order.png)

#### セキュリティに関する注意事項
{: #notes-on-security }
{:.no_toc}

`.circleci/config.yml` ファイル内にシークレットやキーを追加しないでください。 CircleCI 上のプロジェクトにアクセスできる開発者には、`config.yml` の全文が表示されます。 シークレットやキーは、CircleCI アプリケーションの[プロジェクト設定](#setting-an-environment-variable-in-a-project)または[コンテキスト設定](#setting-an-environment-variable-in-a-context)に格納してください。 詳細については、セキュリティに関するドキュメントの「[暗号化]({{ site.baseurl }}/ja/2.0/security/#encryption)」セクションを参照してください。

構成内でスクリプトを実行すると、シークレット環境変数が公開される場合があります。 安全なスクリプトのベスト プラクティスについては、「[シェル スクリプトの使用]({{ site.baseurl }}/ja/2.0/using-shell-scripts/#shell-script-best-practices)」を参照してください。

### 環境変数の構成例
{: #example-configuration-of-environment-variables }
{:.no_toc}

以下のような `config.yml` を例に考えてみましょう。

```yaml
version: 2.1

jobs: # 実行時の基本的な作業単位を定義
  build:
    docker: # Docker Executor を使用
      # CircleCI の Node.js イメージはこちらで確認できます: https://hub.docker.com/r/circleci/node/
      - image: circleci/node:10.0-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキストまたはプロジェクトの画面で設定した環境変数を参照
    steps: # `build` ジョブを構成するステップを定義
      - checkout # 作業用ディレクトリにソースコードをチェックアウト
      # 環境変数をセットアップするステップを実行
      # MY_ENV_VAR を $BASH_ENV にリダイレクト
      - run:
          name: "Setup custom environment variables"
          command: echo 'export MY_ENV_VAR="FOO"' >> $BASH_ENV
      - run: # 現在のブランチ名を print
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

原則として、CircleCI はビルド構成への環境変数の挿入をサポートしていません。 使用する値はリテラルとして扱われます。 そのため、`working_directory` を定義するときや、`PATH` を変更するとき、複数の `run` ステップで変数を共有するときに、問題が発生する可能性があります。

ただし、[プライベート イメージ]({{ site.baseurl }}/ja/2.0/private-images/)をサポートするため、Docker イメージ セクションは例外となっています。

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

詳細については、「[parameters 宣言の使用]({{ site.baseurl }}/ja/2.0/reusing-config/#using-the-parameters-declaration)」を参照してください。

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

**注:** この `$BASH_ENV` による回避策は `bash` でのみ機能します。 他のシェルではおそらく機能しません。

### Alpine Linux
{: #alpine-linux }
{:.no_toc}

[Alpine Linux](https://alpinelinux.org/)ベースのイメージ([docker](https://hub.docker.com/_/docker)もそうですね)は `ash` シェルを使用しています。

次のように2つのパラメータをジョブに追加するだけで `bash` で環境変数を使用することができます。

```yaml
version: 2.1

jobs:
  build:    
    shell: /bin/sh -leo pipefail
    environment:

      - BASH_ENV: /etc/profile
```

## シェル コマンドでの環境変数の設定
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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - run:
          name: PATH の更新および実行時の環境変数の定義
          command: |
            echo 'export PATH=/path/to/foo/bin:$PATH' >> $BASH_ENV
            echo 'export VERY_IMPORTANT=$(cat important_value)' >> $BASH_ENV
            source $BASH_ENV
```

**注:** シェルによっては、`~/.tcshrc` や `~/.zshrc` などのシェル スタートアップ ファイルに新しい変数を付加しなければならない場合があります。

環境変数の設定についての詳細は、ご使用のシェルのドキュメントを確認してください。

## ステップでの環境変数の設定
{: #setting-an-environment-variable-in-a-step }

ステップで環境変数を設定するには、[`environment` キー]({{ site.baseurl }}/ja/2.0/configuration-reference/#run)を使用します。

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

ジョブで環境変数を設定するには、[`environment` キー]({{ site.baseurl }}/ja/2.0/configuration-reference/#lessjobnamegreater)を使用します。

```yaml
version: 2.1

jobs:
  build:
    docker:

      - image: buildpack-deps:trusty
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    environment:
      FOO: bar
```

**注: 7 桁以上の整数は指数表記に変換されます。 これを回避するには、整数を文字列として格納してください (例: "1234567")。**

## コンテキストでの環境変数の設定
{: #setting-an-environment-variable-in-a-context }

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
          context: my_context_name # MY_ENV_VAR という名前の環境変数を持つ

jobs:
  build:
    docker:

      - image: cimg/base:2020.01
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: 
          name: "コンテキストに含まれる環境変数を出力"
          command: |
            echo $MY_ENV_VAR
```

コンテキストを作成すると、複数のプロジェクト間で環境変数を共有すると共に、アクセス可能なユーザーを制御できるようになります。 詳細については、[コンテキストに関するドキュメント]({{ site.baseurl }}/ja/2.0/contexts/)を参照してください。

## プロジェクトでの環境変数の設定
{: #setting-an-environment-variable-in-a-project }

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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: 
          name: "プロジェクトに含まれる環境変数を出力"
          command: |
            echo $MY_ENV_VAR # この環境変数はプロジェクト内で設定が必要
```

作成された環境変数は、アプリケーションに表示されず、編集することはできません。 環境変数を変更するには、削除して作成し直すしかありません。

## コンテナでの環境変数の設定
{: #setting-an-environment-variable-in-a-container }

環境変数は Docker コンテナにも設定することができます。 設定するには、[`environment` キー]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker)を使用します。

**注:**: この方法で設定する環境変数は、コンテナ内で実行される*ステップ*では使用できません。 これらを使用できるのは、コンテナ*によって*実行されるエントリポイントとコマンドのみです。 CircleCI のデフォルトでは、ジョブのプライマリ コンテナのエントリポイントは無視されます。 プライマリ コンテナの環境変数を利用可能にするには、エントリポイントを保持する必要があります。詳細については、[カスタム ビルドの Docker イメージの使用ページの*エントリポイントの追加*セクション]({{ site.baseurl }}/ja/2.0/custom-images/#adding-an-entrypoint)を参照してください。

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

もし、複数行の環境変数を追加したくて困っている場合は `base64` を使用してエンコードしてください。

```bash
$ echo "foobar" | base64 --wrap=0
Zm9vYmFyCg==
```

結果の値を CircleCI の環境変数に格納します。

```bash
$ echo $MYVAR
Zm9vYmFyCg==
```

その変数を使用するコマンド内でデコードします。

```bash
$ echo $MYVAR | base64 --decode | docker login -u my_docker_user --password-stdin
Login Succeeded
```

**注:** すべてのコマンド ライン プログラムが `docker` と同じ方法で認証情報を受け取るわけではありません。

## API v2 を使用した環境変数の挿入
{: #injecting-environment-variables-with-api-v2 }

CircleCI API v2 を使用すると、パイプライン パラメーターから変数を渡すことができます。

[パイプラインをトリガーする]({{site.baseurl}}/api/v2/#operation/getPipelineConfigById) API v2 エンドポイントを使用すると、特定のパラメーターの値でパイプラインをトリガーすることができます。 これを実行するには、`POST` 本体の JSON パケット内で `parameters` キーを渡します。

下の例では、上記の設定ファイルの例で説明したパラメーターを使用して、パイプラインをトリガーしています (注: API からパイプラインをトリガーするときにパラメーターを渡すには、設定ファイルでパラメーターを宣言している必要があります)。

```sh
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:project_slug/pipeline
```

**重要:** パイプライン パラメーターは機密データとして扱われないため、機密の値 (シークレット) には使用しないでください。 シークレットは、[プロジェクト設定ページ]({{site.baseurl}}/ja/2.0/settings/)と[コンテキスト ページ]({{site.baseurl}}/ja/2.0/glossary/#context)で確認できます。

詳細については、「[パイプライン変数]({{site.baseurl}}/ja/2.0/pipeline-variables/)」を参照してください。

## API v1 を使用した環境変数の挿入
{: #injecting-environment-variables-with-api-v1 }

ビルド パラメーターは環境変数であるため、以下の条件に従って名前を付けます。

- 使用できるのは ASCII 文字、数字、アンダースコア文字のみです
- 先頭に数字を使用することはできません
- 少なくとも 1 文字を含む必要があります

環境変数の通常の制限以外には、値自体への制限はなく、単純な文字列として扱われます。 ビルド パラメーターがロードされる順序は**保証されない**ため、ビルド パラメーターに値を挿入して別のビルド パラメーターに渡すことは避けてください。 ベスト プラクティスとして、独立した環境変数から成る順不同のリストとしてビルド パラメーターを設定することをお勧めします。

**重要:** ビルド パラメーターは機密データとして扱われないため、機密の値 (シークレット) には使用しないでください。 シークレットは、[プロジェクト設定ページ]({{site.baseurl}}/ja/2.0/settings/)と[コンテキスト ページ]({{site.baseurl}}/ja/2.0/glossary/#context)で確認できます。

例えば、次のようなパラメーターを渡した場合は

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

例えば `curl` を使用する場合

```sh
curl \
  --header "Content-Type: application/json" \
  --header "Circle-Token: $CIRCLE_TOKEN" \
  --data '{"build_parameters": {"param1": "value1", "param2": 500}}' \
  --request POST \
  https://circleci.com/api/v1.1/project/github/circleci/mongofinil/tree/master
```

上の例の `$CIRCLE_TOKEN` は[パーソナル API トークン]({{ site.baseurl }}/ja/2.0/managing-api-tokens/#creating-a-personal-api-token)です。

このビルドは、以下の環境変数を受け取ります。

```sh
export param1="value1"
export param2="500"
```

POST API 呼び出しを使用して実行を開始します。 詳細については、API ドキュメントで[新しいビルドのセクション](https://circleci.com/docs/api/v1/#trigger-a-new-build-with-a-branch)を参照してください。 本体が空の POST は、指定されたブランチの新しい実行を開始します。

## 定義済み環境変数
{: #built-in-environment-variables }

以下の環境変数はビルドごとにエクスポートされているので、より複雑なテストやデプロイに使用することができます。

**注:** 定義済み環境変数を使用して別の環境変数を定義することはできません。 代わりに、`run` ステップを使用して、新しい環境変数を `BASH_ENV` でエクスポートする必要があります。

詳細については、[シェル コマンドでの環境変数の設定](#setting-an-environment-variable-in-a-shell-command)を参照してください。

| 変数                                     | タイプ  | 値                                                                                                                                                                                                                                                                                         |
| -------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CI`{:.env_var}                        | ブール値 | `true` (現在の環境が CI 環境かどうかを表します)                                                                                                                                                                                                                                                            |
| `CIRCLECI`{:.env_var}                  | ブール値 | `true` (現在の環境が CircleCI 環境かどうかを表します)                                                                                                                                                                                                                                                      |
| `CIRCLE_BRANCH`{:.env_var}             | 文字列  | 現在ビルド中の Git ブランチの名前                                                                                                                                                                                                                                                                       |
| `CIRCLE_BUILD_NUM`{:.env_var}          | 整数   | 現在のジョブの番号。 この番号はジョブごとに一意です。                                                                                                                                                                                                                                                               |
| `CIRCLE_BUILD_URL`{:.env_var}          | 文字列  | CircleCI での現在のジョブの URL                                                                                                                                                                                                                                                                    |
| `CIRCLE_JOB`{:.env_var}                | 文字列  | 現在のジョブの名前                                                                                                                                                                                                                                                                                 |
| `CIRCLE_NODE_INDEX`{:.env_var}         | 整数   | (並列処理を有効化してジョブを実行する場合) 並列実行の現在のインデックスであり、 0 から "`CIRCLE_NODE_TOTAL` - 1" までの値を取ります。                                                                                                                                                                         |
| `CIRCLE_NODE_TOTAL`{:.env_var}         | 整数   | (並列処理を有効化してジョブを実行する場合) 並列実行の総数であり、 設定ファイルの `parallelism` の値と等しくなります。                                                                                                                               |
| `CIRCLE_PR_NUMBER`{:.env_var}          | 整数   | 関連付けられた GitHub または Bitbucket プル リクエストの番号。 フォークされた PR でのみ使用できます。                                                                                                                                                                                                                           |
| `CIRCLE_PR_REPONAME`{:.env_var}        | 文字列  | プル リクエストが作成された GitHub または Bitbucket リポジトリの名前。 フォークされた PR でのみ使用できます。                                                                                                                                                                                                                       |
| `CIRCLE_PR_USERNAME`{:.env_var}        | 文字列  | プル リクエストを作成したユーザーの GitHub または Bitbucket ユーザー名。 フォークされた PR でのみ使用できます。                                                                                                                                                                                                                      |
| `CIRCLE_PREVIOUS_BUILD_NUM`{:.env_var} | 整数   | 現在のブランチのこれまでのビルドの数                                                                                                                                                                                                                                                                        |
| `CIRCLE_PROJECT_REPONAME`{:.env_var}   | 文字列  | 現在のプロジェクトのリポジトリの名前                                                                                                                                                                                                                                                                        |
| `CIRCLE_PROJECT_USERNAME`{:.env_var}   | 文字列  | 現在のプロジェクトの GitHub または Bitbucket ユーザー名                                                                                                                                                                                                                                                     |
| `CIRCLE_PULL_REQUEST`{:.env_var}       | 文字列  | 関連付けられたプル リクエストの URL。 複数のプル リクエストが関連付けられている場合は、いずれか 1 つの URL がランダムに選択されます。                                                                                                                                                                                                                |
| `CIRCLE_PULL_REQUESTS`{:.env_var}      | リスト  | 現在のビルドに関連付けられたプル リクエストの URL の一覧 (カンマ区切り)                                                                                                                                                                                                                                                  |
| `CIRCLE_REPOSITORY_URL`{:.env_var}     | 文字列  | GitHub または Bitbucket リポジトリ URL                                                                                                                                                                                                                                                            |
| `CIRCLE_SHA1`{:.env_var}               | 文字列  | 現在のビルドの前回のコミットの SHA1 ハッシュ                                                                                                                                                                                                                                                                 |
| `CIRCLE_TAG`{:.env_var}                | 文字列  | git タグの名前 (現在のビルドがタグ付けされている場合)。 詳細については、「[Git タグに対応するワークフローを実行する]({{ site.baseurl }}/ja/2.0/workflows/#executing-workflows-for-a-git-tag)」を参照してください。 |
| `CIRCLE_USERNAME`{:.env_var}           | 文字列  | パイプラインをトリガーしたユーザーの GitHub または Bitbucket ユーザー名                                                                                                                                                                                                                                             |
| `CIRCLE_WORKFLOW_ID`{:.env_var}        | 文字列  | 現在のジョブのワークフロー インスタンスの一意の識別子。 この識別子は、特定のワークフロー インスタンス内のすべてのジョブで同じです。                                                                                                                                                                                                                       |
| `CIRCLE_WORKFLOW_WORKSPACE_ID`{:.env_var}  | 文字列  | 現在のジョブの[workspace]({{ site.baseurl }}/ja/2.0/glossary/#workspace)の識別子。この識別子は、特定のワークスペース内のすべてのジョブで同じです。 |
| `CIRCLE_WORKING_DIRECTORY`{:.env_var}  | 文字列  | 現在のジョブの `working_directory` キーの値                                                                                                                                                                                                                                                          |
| `CIRCLE_INTERNAL_TASK_DATA`{:.env_var} | 文字列  | **内部用**。 ジョブ関連の内部データが格納されるディレクトリ。 データ スキーマは変更される可能性があるため、このディレクトリのコンテンツは文書化されていません。                                                                                                                                                                                                       |
| `CIRCLE_COMPARE_URL`{:.env_var}        | 文字列  | **非推奨**。 同じビルドのコミットどうしを比較するための GitHub または Bitbucket URL。 v2 以下の設定ファイルで使用可能です。 v2.1 では、この変数に代わり "[パイプライン値]({{ site.baseurl }}/ja/2.0/pipeline-variables/)" が導入されています。                                                                                                                         |
| `CI_PULL_REQUEST`{:.env_var}           | 文字列  | **非推奨**。 CircleCI 1.0 との下位互換性を確保するために残されています。 `CIRCLE_PULL_REQUEST` の使用が推奨されます。                                                                                                                                                                                                           |
| `CI_PULL_REQUESTS`{:.env_var}          | リスト  | **非推奨**。 CircleCI 1.0 との下位互換性を確保するために残されています。 `CIRCLE_PULL_REQUESTS` の使用が推奨されます。                                                                                                                                                                                                          |
{:class="table table-striped"}

**注:** パイプライン値とパラメーターの一覧については、「[パイプライン変数]({{ site.baseurl }}/ja/2.0/pipeline-variables/#pipeline-values)」を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

[コンテキスト]({{ site.baseurl }}/ja/2.0/contexts/) [シークレットのマスキングによって環境変数を非公開に保つ (英語)](https://circleci.com/ja/blog/keep-environment-variables-private-with-secret-masking/)
