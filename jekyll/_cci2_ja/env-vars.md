---
layout: classic-docs
title: Introduction to environment variables
short-title: 環境変数
description: Introduction to environment variables in CircleCI
contentTags:
  platform:
    - クラウド
    - Server v3.x
    - Server v2.x
suggested:
  - 
    title: 環境変数を非公開のままにする
    link: https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/
  - 
    title: Troubleshoot environment variables settings
    link: https://discuss.circleci.com/t/somehow-i-just-cannot-get-the-enviroment-variable-from-enviroment-variable-setting-an-context-in-organization-menu/40342
  - 
    title: 環境変数としてファイルを挿入する
    link: https://support.circleci.com/hc/en-us/articles/360003540393?input_string=how+to+i+inject+an+environment+variable+using+the+api%3F
---

## はじめに
{: #introduction }

Use environment variables to set up various configuration options, and keep your set-up secure with secrets, private keys, and contexts. Environment variables in CircleCI are governed by an [order of precedence](#order-of-precedence), allowing control at each level in your configuration.

既存の環境変数やコンテキストがあり、組織名やリポジトリ名を変更したい場合は、[組織名およびリポジトリ名の変更]({{site.baseurl}}/ja/rename-organizations-and-repositories)ガイドに従い、変更プロセスの間に環境変数やコンテキストへのアクセスを失わないようにしてください。

## 定義済み環境変数
{: #built-in-environment-variables }

All projects have access to CircleCI's built-in environment variables. These environment variables are scoped at the job level, so they can be used with the `context` key in a job, but they do not exist at a pipeline level.

For a full list of built-in environment variables, see the [Project values and variables]({{site.baseurl}}/variables#built-in-environment-variables) page.

## Private keys and secrets
{: #private-keys-and-secrets }

To add private keys or secrets as environment variables for use throughout your project, navigate to **Project Settings > Environment Variables** in the [CircleCI web app](https://app.circleci.com/). You can find step-by-step instructions of this process on the [Environment variables]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-project) page. これらの変数の値は、設定後はアプリで読み取ることも編集することもできません。 To change the value of an environment variable, delete the current variable, and add it again with the new value.

Private environment variables enable you to store secrets safely, even when your project is public. Refer to the [Building open source projects]({{site.baseurl}}/oss/) page for associated security and settings information.

{% include snippets/ja/secrets-masking.md %}

## 環境変数の使用オプション
{: #environment-variable-usage-options }

CircleCI では Bash を使用しますが、ここでは POSIX 命名規則に従った環境変数が使用されます。 大文字・小文字のアルファベット、数字、アンダースコアが使用でき、 環境変数の頭文字はアルファベットとします。

### 優先順位
{: #order-of-precedence }

環境変数は、以下の優先順位で使用されます。

1. `FOO=bar make install` など、`run` ステップの[シェル コマンド]({{site.baseurl}}/ja/set-environment-variable/#set-an-environment-variable-in-a-shell-command)で宣言された環境変数
2. [`run` ステップ]({{site.baseurl}}/ja/set-environment-variable/#set-an-environment-variable-in-a-step)で `environment` キーを使用して宣言された環境変数
3. [ジョブ]({{site.baseurl}}/ja/set-environment-variable/#set-an-environment-variable-in-a-job)で `environment` キーを使用して設定された環境変数
4. Special CircleCI environment variables defined in the [CircleCI Built-in environment variables]({{site.baseurl}}/variables#built-in-environment-variables) document.
5. Context environment variables (assuming the user has access to the context). See the [Contexts]({{site.baseurl}}/contexts/) documentation for more information.
6. [Project-level environment variables]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-project) set on the **Project Settings** page in the web app.

`FOO=bar make install` などの、シェルコマンドの`run` ステップで宣言された環境変数は、`environment` キーおよび `contexts` キーを使用して宣言された環境変数よりも優先されます。 Environment variables added on the **Contexts** page in the web app will take precedence over variables added on the **Project Settings** page.

![Environment variable order of precedence]({{site.baseurl}}/assets/img/docs/env-var-order.png)

### 環境変数の設定例
{: #example-configuration-of-environment-variables }

Consider the example `.circleci/config.yml` below:

```yaml
version: 2.1

jobs: # basic units of work in a run
  build:
    docker: # use the Docker executor
      # CircleCI Node images available at: https://circleci.com/developer/images/image/cimg/node
      - image: cimg/node:18.11.0
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

The above `.circleci/config.yml` demonstrates the following:

- カスタム環境変数の設定
- CircleCI が提供する定義済み環境変数 (`CIRCLE_BRANCH`) の読み取り
- How variables are used (or interpolated) in your `.circleci/config.yml`
- Secrets masking, applied to environment variable set in the project or within a context.

When the above configuration runs, the output looks like the below image. Notice the environment variables stored in the project is masked, and displays as `****`:

![Environment variable interpolation example]({{site.baseurl}}/assets/img/docs/env-vars-example-ui.png)

Notice there are two similar steps in the above image and configuration - "What branch am I on?" これらのステップは、環境変数を読み取るための 2 つの方法を示しています。

In the example configuration above, two syntaxes are used: `${VAR}` and `$VAR`. Both syntaxes are supported. シェル パラメーターの展開については、[Bash のドキュメント](https://www.gnu.org/software/bash/manual/bashref.html#Shell-Parameter-Expansion)を参照してください。

### Parameters and bash environment
{: #parameters-and-bash-environment }

In general, CircleCI does not support interpolating environment variables in the configuration. 使用する値はリテラルとして扱われます。 そのため、`working_directory` を定義するときや、`PATH` を変更するとき、複数の `run` ステップで変数を共有するときに、問題が発生する可能性があります。

以下の例では、`$ORGNAME` と `$REPONAME` に挿入は行われません。

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

ただし、[プライベートイメージ]({{site.baseurl}}/ja/private-images/)のプルプロジェクトのプルのための環境変数の使用は例外となっています。
{: class="alert alert-info" }

You can reuse pieces of configuration across your `.circleci/config.yml` file. `parameters` 宣言を使用することで、再利用可能な `commands`、`jobs`、`executors` に値を渡すことができます。

```yaml
version: 2.1 # version 2.1 is required for reusing configuration

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

詳細については、[パラメーター宣言の使用]({{site.baseurl}}/ja/reusing-config/#using-the-parameters-declaration)を参照してください。

Another possible method to interpolate values into your configuration is to use a `run` step to export environment variables to `BASH_ENV`, as shown below.

```yaml
steps:
  - run:
      name: Setup Environment Variables
      command: |
        echo 'export PATH="$GOPATH"/bin:"$PATH"' >> "$BASH_ENV"
        echo 'export GIT_SHA1="$CIRCLE_SHA1"' >> "$BASH_ENV"
```

各ステップで、CircleCI は `bash` を使用して `BASH_ENV` を取得します。 This means that `BASH_ENV` is automatically loaded and run, allowing you to use interpolation and share environment variables across `run` steps.

この `$BASH_ENV` を使った方法は `bash`でのみ動作し、他のシェルで動作するかは確認されていません。
{: class="alert alert-info"}

### Alpine Linux
{: #alpine-linux }

An image that has been based on [Alpine Linux](https://alpinelinux.org/) (like [Docker](https://hub.docker.com/_/docker)), uses the `ash` shell.

`bash` で環境変数を使用するには、ジョブに `shell` キーと `environment` キーを追加します。

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

`.circleci/config.yml` ファイル内にシークレットやキーを追加しないでください。 CircleCI 上のプロジェクトにアクセスできる開発者は、`.circleci/config.yml` の全文を閲覧できます。 シークレットやキーは、CircleCI Web アプリの[プロジェクト]({{site.baseurl}}/set-environment-variable/#setting-an-environment-variable-in-a-project)や[コンテキスト]({{site.baseurl}}/set-environment-variable/#setting-an-environment-variable-in-a-context)の設定に保存します。 For more information, see the [Encryption]({{site.baseurl}}/security/#encryption) section of the security page.

設定内でスクリプトを実行すると、シークレット環境変数が公開される場合があります。 See the [Using shell scripts]({{site.baseurl}}/using-shell-scripts/#shell-script-best-practices) page for best practices for secure scripts.

## コンテキスト
{: #contexts }

You can further restrict access to environment variables using [contexts]({{site.baseurl}}/contexts). Contexts are set from the **Organization Settings** in the CircleCI web app.

## 関連項目
{: #see-also }
{:.no_toc}

- [セキュリティーに関する推奨事項]({{site.baseurl}}/security-recommendations)
- [CircleCI API を使った変数の挿入]({{site.baseurl}}/inject-environment-variables-with-api/)