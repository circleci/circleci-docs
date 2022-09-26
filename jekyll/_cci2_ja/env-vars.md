---
layout: classic-docs
title: "環境変数"
short-title: "環境変数"
description: "CircleCI における環境変数について"
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

CircleCI の環境変数は、設定方法に応じて[優先順位](#order-of-precedence)に基づいて使用され、設定ファイルの各レベルで制御することができます。

プロジェクト全体で使用する**プライベートキー**または**シークレット環境変数**を追加するには、CircleCI アプリケーションで **Project Settings (プロジェクト設定)**の [Environment Variables (環境変数) のページ](#setting-an-environment-variable-in-a-project)に移動します。 設定された後の変数の値は、アプリで読み取ることも編集することもできません。 環境変数の値を変更するには、現在の変数を削除し、新しい値を設定して再度追加します。

プライベート環境変数を使用すると、プロジェクトがパブリックの場合でもシークレットを安全に格納できます。 (Refer to the [Building Open Source Projects]({{site.baseurl}}/oss/) page for associated settings information.)

You can further restrict access to environment variables using contexts. Contexts are set from **Organization Settings** in the CircleCI web application.

## シークレットのマスキング
{: #secrets-masking }

_シークレットのマスキングは、オンプレミス版である CircleCI Server では現在サポートされていません。_

Secrets masking is applied to environment variables set within **Project Settings** or under **Contexts** in the web app. 環境変数は、プロジェクトのシークレットやキーを保持します。 シークレットやキーはアプリケーションにとってきわめて重要なものです。 `echo` や `print` が使用される際にジョブ出力における環境変数を隠すことにより、CircleCI のセキュリティを強化します。

The value of the environment variable will not be masked in the job output if:

* 環境変数の値が 4 文字未満
* the value of the environment variable is equal to one of `true`, `True`, `false`, or `False`

Secrets masking will only prevent the value of the environment variable from appearing in your job output. `-x` や `-o xtrace` オプションを使ってバッシュシェルを呼び出すとマスキングされていないシークレットが誤ってログに記録される場合があります ([シェルスクリプトの使用]({{site.baseurl}}/ja/using-shell-scripts)を参照してください)。
{: class="alert alert-info"}

別の場所 (テスト結果やアーティファクトなど)に出力される場合、シークレットはマスキングされません。 コンテキストの値には、[SSH を使用したデバッグ]({{site.baseurl}}/ja/ssh-access-jobs)を行うユーザーがアクセスできます。

## 環境変数の使用オプション
{: #environment-variable-usage-options }

CircleCI は Bash を使用しますが、ここでは POSIX 命名規則に従った環境変数が使用されます。 大文字・小文字のアルファベット、数字、アンダースコアが使用でき、 環境変数の頭文字はアルファベットとします。

### 優先順位
{: #order-of-precedence }

環境変数は、以下に示す優先順位で使用されます。

1. Environment variables declared \[inside a shell command\](({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-shell-command) in a `run` step, for example `FOO=bar make install`.
2. [`run` ステップ]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-step)で `environment` キーを使用して宣言された環境変数
3. [ジョブ]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-job)で `environment` キーを使用して設定された環境変数
4. Special CircleCI environment variables defined in the [CircleCI Built-in Environment Variables]({{site.baseurl}}/built-in-environment-variables) document.
5. コンテキスト環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合)。 手順については、[コンテキストに関するドキュメント]({{site.baseurl}}/ja/contexts)を参照してください。
6. [Project-level environment variables]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-project) set on the **Project Settings** page.

`FOO=bar make install` のように、`run` ステップのシェル コマンドで宣言された環境変数は、`environment` キーおよび `contexts` キーを使用して宣言された環境変数よりも優先されます。 コンテキストページで追加された環境変数はプロジェクト設定ページで追加されたものより優先して使われます。

![環境変数の優先順位]({{site.baseurl}}/assets/img/docs/env-var-order.png)

### 環境変数の設定例
{: #example-configuration-of-environment-variables }

この `config.yml` では以下が行われます。

```yaml
version: 2.1

jobs: # basic units of work in a run
  build:
    docker: # use the Docker executor
      # CircleCI Node images available at: https://circleci.com/developer/images/image/cimg/node
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

上の設定ファイルと出力には、「今いるブランチを表示」という 2 つの類似するステップが含まれています。 これらのステップは、環境変数を読み取るための 2 つの方法を示しています。

なお、`${VAR}` 構文と `$VAR` 構文のどちらもサポートされています。 シェル パラメーターの展開については、[Bash のドキュメント](https://www.gnu.org/software/bash/manual/bashref.html#Shell-Parameter-Expansion)を参照してください。

### パラメーターと Bash 環境の使用
{: #using-parameters-and-bash-environment }

In general, CircleCI does not support interpolating environment variables in the config. 使用する値はリテラルとして扱われます。 そのため、`working_directory` を定義するときや、`PATH` を変更するとき、複数の `run` ステップで変数を共有するときに、問題が発生する可能性があります。

以下の例では、`$ORGNAME` と `$REPONAME` に挿入は行われません。

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

An exception to this rule is using project environment variables to pull [private images]({{site.baseurl}}/private-images/).

Using `version: 2.1` config, you can reuse pieces of config across your `.circleci/config.yml`. By using the `parameters` declaration, you can pass values into reusable `commands`, `jobs`, and `executors`:

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

Another possible method to "interpolate" values into your config is to use a `run` step to export environment variables to `BASH_ENV`, as shown below.

```yaml
steps:
  - run:
      name: Setup Environment Variables
      command: |
        echo 'export PATH="$GOPATH"/bin:"$PATH"' >> "$BASH_ENV"
        echo 'export GIT_SHA1="$CIRCLE_SHA1"' >> "$BASH_ENV"
```

各ステップで、CircleCI は `bash` を使用して `BASH_ENV` を取得します。 つまり、`BASH_ENV` が自動的にロードおよび実行されることで、挿入を使用して複数の `run` ステップで環境変数を共有できるようになります。

The `$BASH_ENV` workaround only works with `bash`, and has not been confirmed to work with other shells.
{: class="alert alert-info"}

### Alpine Linux
{: #alpine-linux }
{:.no_toc}

[Alpine Linux](https://alpinelinux.org/) ベースのイメージ ([Docker](https://hub.docker.com/_/docker) など) は `ash` シェルを使用します。

To use environment variables with `bash`, add the `shell` and `environment` keys to your job.

```yaml
version: 2.1

jobs:
  build:
    shell: /bin/sh -leo pipefail
    environment:
      BASH_ENV: /etc/profile
```

## セキュリティに関する注意事項
{: #notes-on-security }

`.circleci/config.yml` ファイル内にシークレットやキーを追加しないでください。 The full text of `.circleci/config.yml` is visible to developers with access to your project on CircleCI. Store secrets or keys in [project]({{site.baseurl}}/set-environment-variable/#setting-an-environment-variable-in-a-project) or [context]({{site.baseurl}}/set-environment-variable/#setting-an-environment-variable-in-a-context) settings in the CircleCI web app. 詳細については、セキュリティに関するドキュメントの「[暗号化]({{site.baseurl}}/ja/security/#encryption)」セクションを参照してください。

設定内でスクリプトを実行すると、シークレット環境変数が公開される場合があります。 See the [Using shell scripts]({{site.baseurl}}/using-shell-scripts/#shell-script-best-practices) document for best practices for secure scripts.

## 関連項目
○
{:.no_toc}

- [Inject variables using the CircleCI API]({{site.baseurl}}/inject-environment-variables-with-api/)
- [Built-in environment variables in CircleCI]({{site.baseurl}}/built-in-environment-variables)
- [コンテキスト]({{site.baseurl}}/contexts/)
- [Keep environment variables private with secret masking](https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/)
