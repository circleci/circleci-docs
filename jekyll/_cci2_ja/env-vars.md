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

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

There are several ways to use environment variables in CircleCI to provide variety in scope and authorization level. Environment variables are governed by an [order of precedence](#order-of-precedence), depending on how they are set, allowing control at each level in your configuration.

To add **private keys** or **secret environment variables** for use throughout your private project, use the [Environment Variables page under Project Settings](#setting-an-environment-variable-in-a-project) in the CircleCI application. The variable values are neither readable nor editable in the app after they are set. To change the value of an environment variable, delete the current variable and add it again with the new value.

Private environment variables enable you to store secrets safely even when your project is public. Refer to the [Building Open Source Projects]({{ site.baseurl }}/2.0/oss/) page for associated settings information.

Use Contexts to [further restrict access to environment variables](#setting-an-environment-variable-in-a-context). Contexts are set from the Organization Settings in the CircleCI application. For more information about controlling access to env vars with Contexts, refer to the [Restricting a Context]({{ site.baseurl }}/2.0/contexts/#restricting-a-context) documentation.

## シークレットのマスキング
{: #secrets-masking }

_Secrets masking is not currently available on self-hosted installations of CircleCI Server_

Secrets Masking is applied to environment variables set within Project Settings or under Contexts. Environment variables may hold project secrets or keys that perform crucial functions for your applications. Secrets masking provides added security within CircleCI by obscuring environment variables in the job output when `echo` or `print` are used.

The value of the environment variable will not be masked in the build output if:

* 環境変数の値が 4 文字未満
* 環境変数の値が `true`、`True`、`false`、`False` のいずれか

**Note:** Secrets Masking will only prevent the value of the environment variable from appearing in your build output. The value of the environment variable is still accessible to users [debugging builds with SSH]({{ site.baseurl }}/2.0/ssh-access-jobs).

## 組織とリポジトリの名前変更
{: #renaming-orgs-and-repositories }

If you find you need to rename an org or repo that you have previously hooked up to CircleCI, best practice is to follow these steps:

1. VCS で組織またはリポジトリの名前を変更します。
2. 新しい組織またはリポジトリの名前を使用して CircleCI アプリケーションにアクセスします (例: `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`)。
3. プラン、プロジェクト、設定が正常に転送されたことを確認します。
4. これで、必要に応じて VCS の古い名前で新しい組織やリポジトリを作成できます。

**Note**: If you do not follow these steps, it is possible that you may lose access to your org or repo settings, including **environment variables** and **contexts**.

## 環境変数の使用オプション
{: #environment-variable-usage-options }

CircleCI uses Bash, which follows the POSIX naming convention for environment variables. Valid characters include letters (uppercase and lowercase), digits, and the underscore. The first character of each environment variable must be a letter.

### 優先順位
{: #order-of-precedence }
{:.no_toc}

Environment variables are used according to a specific precedence order, as follows:

1. `FOO=bar make install` など、`run` ステップの[シェル コマンド](#%E3%82%B7%E3%82%A7%E3%83%AB-%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A)で宣言された環境変数
2. [`run` ステップ](#%E3%82%B9%E3%83%86%E3%83%83%E3%83%97%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A)で `environment` キーを使用して宣言された環境変数
3. [ジョブ](#%E3%82%B8%E3%83%A7%E3%83%96%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A)で `environment` キーを使用して設定された環境変数
4. このドキュメントの「[CircleCI 定義済み環境変数](#%E5%AE%9A%E7%BE%A9%E6%B8%88%E3%81%BF%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0)」セクションで解説されている特別な CircleCI 環境変数
5. コンテキスト環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合)。 手順については、[コンテキストに関するドキュメント]({{ site.baseurl }}/2.0/contexts)を参照してください。
6. [Project Settings (プロジェクト設定)] ページで設定された[プロジェクトレベルの環境変数](#%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A)

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the Contexts page will take precedence over variables added on the Project Settings page.

![Env Var Order]({{ site.baseurl }}/assets/img/docs/env-var-order.png)

#### セキュリティに関する注意事項
{: #notes-on-security }
{:.no_toc}

Do not add secrets or keys inside the `.circleci/config.yml` file. The full text of `config.yml` is visible to developers with access to your project on CircleCI. Store secrets or keys in [project](#setting-an-environment-variable-in-a-project) or [context](#setting-an-environment-variable-in-a-context) settings in the CircleCI app. For more information, see the [Encryption]({{ site.baseurl }}/2.0/security/#encryption) section of the Security document.

Running scripts within configuration may expose secret environment variables. See the [Using Shell Scripts]({{ site.baseurl }}/2.0/using-shell-scripts/#shell-script-best-practices) document for best practices for secure scripts.

### 環境変数の構成例
{: #example-configuration-of-environment-variables }
{:.no_toc}

Consider the example `config.yml` below:

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

The above `config.yml` demonstrates the following:

- カスタム環境変数の設定
- CircleCI が提供する定義済み環境変数 (`CIRCLE_BRANCH`) の読み取り
- `config.yml` での変数の使用 (または挿入)
- プロジェクトまたはコンテキストで設定される環境変数に適用されるシークレットのマスキング

When the above config runs, the output looks like this. Notice the env var stored in the Project is masked, and displays as `****`:

![Env Vars Interpolation Example]({{site.baseurl}}/assets/img/docs/env-vars-example-ui.png)

Notice there are two similar steps in the above image and config - "What branch am I on?". These steps illustrate two different methods to read environment variables. Note that both `${VAR}` and `$VAR` syntaxes are supported. You can read more about shell parameter expansion in the [Bash documentation](https://www.gnu.org/software/bash/manual/bashref.html#Shell-Parameter-Expansion).

### パラメーターと Bash 環境の使用
{: #using-parameters-and-bash-environment }
{:.no_toc}

In general, CircleCI does not support interpolating environment variable into build config. Values used are treated as literals. This can cause issues when defining `working_directory`, modifying `PATH`, and sharing variables across multiple `run` steps.

An exception to this rule is the docker image section in order to support [Private Images]({{ site.baseurl }}/2.0/private-images/).

In the example below, `$ORGNAME` and `$REPONAME` will not be interpolated.

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

Using `version: 2.1` config, you can reuse pieces of config across your `config.yml`. By using the `parameters` declaration, you can interpolate (or, "pass values") into reusable `commands` `jobs` and `executors`:

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

For more information, read the documentation on [using the parameters declaration]({{ site.baseurl }}/2.0/reusing-config/#using-the-parameters-declaration).

Another possible method to interpolate values into your config is to use a `run` step to export environment variables to `BASH_ENV`, as shown below.

```yaml
steps:
  - run:
      name: 環境変数のセットアップ
      command: |
        echo "export PATH=$GOPATH/bin:$PATH" >> $BASH_ENV
        echo "export GIT_SHA1=$CIRCLE_SHA1" >> $BASH_ENV
```

In every step, CircleCI uses `bash` to source `BASH_ENV`. This means that `BASH_ENV` is automatically loaded and run, allowing you to use interpolation and share environment variables across `run` steps.

**Note:** The `$BASH_ENV` workaround only works with `bash`. Other shells probably won't work.

### Alpine Linux
{: #alpine-linux }
{:.no_toc}

An image that's based on [Alpine Linux](https://alpinelinux.org/) (like [docker](https://hub.docker.com/_/docker)), uses the `ash` shell.

To use environment variables with `bash`, just add these 2 parameters to your job.

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

While CircleCI does not support interpolation when setting environment variables, it is possible to set variables for the current shell by [using `BASH_ENV`](#using-parameters-and-bash-environment). This is useful for both modifying your `PATH` and setting environment variables that reference other variables.

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

For more information, refer to your shell's documentation on setting environment variables.

## ステップでの環境変数の設定
{: #setting-an-environment-variable-in-a-step }

To set an environment variable in a step, use the [`environment` key]({{ site.baseurl }}/2.0/configuration-reference/#run).

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

**Note:** Since every `run` step is a new shell, environment variables are not shared across steps. If you need an environment variable to be accessible in more than one step, export the value [using `BASH_ENV`](#using-parameters-and-bash-environment).

## ジョブでの環境変数の設定
{: #setting-an-environment-variable-in-a-job }

To set an environment variable in a job, use the [`environment` key]({{ site.baseurl }}/2.0/configuration-reference/#job_name).

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

**Note: Integers longer than 6 digits will be converted to an exponential number. To avoid this, store them as a string instead (i.e. "1234567").**

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

Creating a context allows you to share environment variables across multiple projects, and control who has access. For more information, see the [Contexts documentation]({{ site.baseurl }}/2.0/contexts/).

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
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: "echo an env var that is part of our project"
          command: |
            echo $MY_ENV_VAR # this env var must be set within the project
```

Once created, environment variables are hidden and uneditable in the application. Changing an environment variable is only possible by deleting and recreating it.

## コンテナでの環境変数の設定
{: #setting-an-environment-variable-in-a-container }

Environment variables can also be set for a Docker container. To do this, use the [`environment` key]({{ site.baseurl }}/2.0/configuration-reference/#docker).

**Note**: Environment variables set in this way are not available to _steps_ run within the container, they are only available to the entrypoint/command run _by_ the container. By default, CircleCI will ignore the entrypoint for a job's primary container. For the primary container's environment variables to be useful, you will need to preserve the entrypoint. For more information, see the [_adding an entrypoint_ section of the Custom Images guide]({{ site.baseurl }}/2.0/custom-images/#adding-an-entrypoint).

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

The following example shows separate environment variable settings for the primary container image (listed first) and the secondary or service container image.

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

If you are having difficulty adding a multiline environment variable, use `base64` to encode it.

```bash
$ echo "foobar" | base64 --wrap=0
Zm9vYmFyCg==
```

Store the resulting value in a CircleCI environment variable.

```bash
$ echo $MYVAR
Zm9vYmFyCg==
```

Decode the variable in any commands that use the variable.

```bash
$ echo $MYVAR | base64 --decode | docker login -u my_docker_user --password-stdin
Login Succeeded
```

**Note:** Not all command-line programs take credentials in the same way that `docker` does.

## API v2 を使用した環境変数の挿入
{: #injecting-environment-variables-with-api-v2 }

Pipeline parameters can be used to pass variables using the CircleCI API v2.

A pipeline can be triggered with specific `parameter` values using the API v2 endpoint to [trigger a pipeline]({{site.baseurl}}/api/v2/#operation/getPipelineConfigById). This can be done by passing a `parameters` key in the JSON packet of the `POST` body.

The example below triggers a pipeline with the parameters described in the above config example (NOTE: To pass a parameter when triggering a pipeline via the API the parameter must be declared in the configuration file.).

```sh
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:project_slug/pipeline
```

**IMPORTANT** Pipeline parameters are not treated as sensitive data and must not be used by customers for sensitive values (secrets). You can find this sensitive information in [Project Settings]({{site.baseurl}}/2.0/settings/) and [Contexts]({{site.baseurl}}/2.0/glossary/#context).

Read more in the [Pipeline Variables]({{site.baseurl}}/2.0/pipeline-variables/) guide.

## API v1 を使用した環境変数の挿入
{: #injecting-environment-variables-with-api-v1 }

Build parameters are environment variables, therefore their names have to meet the following restrictions:

- 使用できるのは ASCII 文字、数字、アンダースコア文字のみです
- 先頭に数字を使用することはできません
- 少なくとも 1 文字を含む必要があります

Aside from the usual constraints for environment variables there are no restrictions on the values themselves and are treated as simple strings. The order that build parameters are loaded in is **not** guaranteed so avoid interpolating one build parameter into another. It is best practice to set build parameters as an unordered list of independent environment variables.

**IMPORTANT** Build parameters are not treated as sensitive data and must not be used by customers for sensitive values (secrets). You can find this sensitive information in [Project Settings]({{site.baseurl}}/2.0/settings/) and [Contexts]({{site.baseurl}}/2.0/glossary/#context).

For example, when you pass the parameters:

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

Your build will see the environment variables:

```sh
export foo="bar"
export baz="5"
export qux="{\"quux\": 1}"
export list="[\"a\", \"list\", \"of\", \"strings\"]"
```

Build parameters are exported as environment variables inside each job's containers and can be used by scripts/programs and commands in `config.yml`. The injected environment variables may be used to influence the steps that are run during the job. It is important to note that injected environment variables will not override values defined in `config.yml` nor in the project settings.

You might want to inject environment variables with the `build_parameters` key to enable your functional tests to build against different targets on each run. For example, a run with a deploy step to a staging environment that requires functional testing against different hosts. It is possible to include `build_parameters` by sending a JSON body with `Content-type: application/json` as in the following example that uses `bash` and `curl` (though you may also use an HTTP library in your language of choice).

```sh
{
  "build_parameters": {
    "param1": "value1",
    "param2": 500
  }
}
```

For example using `curl`

```sh
curl \
  --header "Content-Type: application/json" \
  --header "Circle-Token: $CIRCLE_TOKEN" \
  --data '{"build_parameters": {"param1": "value1", "param2": 500}}' \
  --request POST \
  https://circleci.com/api/v1.1/project/github/circleci/mongofinil/tree/master
```

In the above example, `$CIRCLE_TOKEN` is a [personal API token]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-personal-api-token).

The build will see the environment variables:

```sh
export param1="value1"
export param2="500"
```

Start a run with the POST API call, see the [new build](https://circleci.com/docs/api/v1/#trigger-a-new-build-with-a-branch) section of the API documentation for details. A POST with an empty body will start a new run of the named branch.

## 定義済み環境変数
{: #built-in-environment-variables }

The following environment variables are exported in each build and can be used for more complex testing or deployment.

**Note:** You cannot use a built-in environment variable to define another environment variable. Instead, you must use a `run` step to export the new environment variables using `BASH_ENV`.

For more details, see [Setting an Environment Variable in a Shell Command](#setting-an-environment-variable-in-a-shell-command).

| 変数                          | タイプ  | 値                                                                                                                                                                                                                                                                                         |
| --------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CI`                        | ブール値 | `true` (現在の環境が CI 環境かどうかを表します)                                                                                                                                                                                                                                                            |
| `CIRCLECI`                  | ブール値 | `true` (現在の環境が CircleCI 環境かどうかを表します)                                                                                                                                                                                                                                                      |
| `CIRCLE_BRANCH`             | 文字列  | 現在ビルド中の Git ブランチの名前                                                                                                                                                                                                                                                                       |
| `CIRCLE_BUILD_NUM`          | 整数   | 現在のジョブの番号。 この番号はジョブごとに一意です。                                                                                                                                                                                                                                                               |
| `CIRCLE_BUILD_URL`          | 文字列  | CircleCI での現在のジョブの URL                                                                                                                                                                                                                                                                    |
| `CIRCLE_JOB`                | 文字列  | 現在のジョブの名前                                                                                                                                                                                                                                                                                 |
| `CIRCLE_NODE_INDEX`         | 整数   | (並列処理を有効化してジョブを実行する場合) 現在の並列実行の総数であり、 設定ファイルの `parallelism` の値と等しくなります。 0 から "`CIRCLE_NODE_TOTAL` - 1" までの値を取ります。                                                                                                                                                                         |
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
| `CIRCLE_INTERNAL_TASK_DATA` | 文字列  | **内部用**。 ジョブ関連の内部データが格納されるディレクトリ。 データ スキーマは変更される可能性があるため、このディレクトリのコンテンツは文書化されていません。                                                                                                                                                                                                       |
| `CIRCLE_COMPARE_URL`        | 文字列  | **非推奨**。 同じビルドのコミットどうしを比較するための GitHub または Bitbucket URL。 v2 以下の設定ファイルで使用可能です。 v2.1 では、この変数に代わり "[パイプライン値]({{ site.baseurl }}/2.0/pipeline-variables/)" が導入されています。                                                                                                                         |
| `CI_PULL_REQUEST`           | 文字列  | **非推奨**。 CircleCI 1.0 との下位互換性を確保するために残されています。 `CIRCLE_PULL_REQUEST` の使用が推奨されます。                                                                                                                                                                                                           |
| `CI_PULL_REQUESTS`          | リスト  | **非推奨**。 CircleCI 1.0 との下位互換性を確保するために残されています。 `CIRCLE_PULL_REQUESTS` の使用が推奨されます。                                                                                                                                                                                                          |

{:class="table table-striped"}

**Note:** For a list of pipeline values and parameters, refer to the [Pipeline Variables]({{ site.baseurl }}/2.0/pipeline-variables/#pipeline-values) page.

## 関連項目
{: #see-also }
{:.no_toc}

[Contexts]({{ site.baseurl }}/2.0/contexts/) [Keep environment variables private with secret masking](https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/)
