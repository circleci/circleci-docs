---
layout: classic-docs
title: 環境変数の概要
short-title: 環境変数
description: CircleCI における環境変数について
contentTags:
  platform:
    - クラウド
    - Server v3.x
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

## はじめに
{: #introduction }

環境変数を使用して、さまざまな設定オプションをセットアップし、シークレット、プライベートキー、およびコンテキストを使ってセットアップ環境をセキュアに保つことができます。 CircleCI の環境変数は、[優先順位](#order-of-precedence)に基づいて使用され、設定ファイルの各レベルで制御することができます。

既存の環境変数やコンテキストがあり、組織名やリポジトリ名を変更したい場合は、[組織名およびリポジトリ名の変更]({{site.baseurl}}/ja/rename-organizations-and-repositories)ガイドに従い、変更プロセスの間に環境変数やコンテキストへのアクセスを失わないようにしてください。

## 定義済み環境変数
{: #built-in-environment-variables }

すべてのプロジェクトは、CircleCI の定義済み環境変数にアクセスできます。 これらの環境変数はジョブレベルでスコープ設定されるため、ジョブ内の `context` キーと一緒に使用できますが、パイプラインレベルでは存在しません。

定義済み環境変数の全リストは、[プロジェクトの値と変数]({{site.baseurl}}/ja/variables/#built-in-environment-variables)のページを参照して下さい。

## プライベーキーとシークレット
{: #private-keys-and-secrets }

プライベートキーやシークレットを環境変数としてプロジェクト全体で使用するために追加するには、[CircleCI Web アプリ](https://app.circleci.com/)で、**Project Settings > Environment Variables** に移動します。 このプロセスの詳細手順については、[環境変数]({{site.baseurl}}/ja/set-environment-variable/#set-an-environment-variable-in-a-project)のページを参照してください。 これらの変数の値は、設定後はアプリで読み取ることも編集することもできません。 環境変数の値を変更するには、現在の変数を削除し、新しい値を設定して再度追加します。

プライベート環境変数を使用すると、プロジェクトがパブリックの場合でもシークレットを安全に格納できます。 関連するセキュリティと設定ついては、[オープンソースプロジェクトのビルド]({{site.baseurl}}/ja/oss/)のページを参照してください。

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
4. [CircleCI の定義済み環境変数]({{site.baseurl}}/ja/variables#built-in-environment-variables)に記載されている特別な CircleCI 環境変数
5. コンテキスト環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合): 詳細については、[コンテキストに関するドキュメント]({{site.baseurl}}/ja/contexts/)を参照してください。
6. Web アプリの **Project Settings** のページで設定された[プロジェクトレベルの環境変数]({{site.baseurl}}/ja/set-environment-variable/#set-an-environment-variable-in-a-project)

`FOO=bar make install` などの、シェルコマンドの`run` ステップで宣言された環境変数は、`environment` キーおよび `contexts` キーを使用して宣言された環境変数よりも優先されます。 Web アプリの **Contexts** のページで追加された環境変数は、**Project Settings** のページで追加された環境変数よりも優先されます。

![環境変数の優先順位]({{site.baseurl}}/assets/img/docs/env-var-order.png)

### 環境変数の設定例
{: #example-configuration-of-environment-variables }

以下のような `.circleci/config.yml` を例に考えてみましょう。

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

この `.circleci/config.yml` では以下が行われます。

- カスタム環境変数の設定
- CircleCI が提供する定義済み環境変数 (`CIRCLE_BRANCH`) の読み取り
- `.circleci/config.yml` での変数の使用 (または挿入)
- プロジェクトまたはコンテキストで設定される環境変数に適用されるシークレットのマスキング

この設定ファイルを実行すると、以下のように出力されます。 プロジェクトに格納されている環境変数がマスキングされ、`****` と表示されていることに注目してください。

![環境変数の挿入例]({{site.baseurl}}/assets/img/docs/env-vars-example-ui.png)

上記の設定ファイルには、"What branch am I on?" という類似する 2 つのステップが含まれています。 これらのステップは、環境変数を読み取るための 2 つの方法を示しています。

上記のサンプル設定ファイルでは、2 つの構文、 `${VAR}` と `$VAR` が使われています。 どちらの構文もサポートされています。 シェルパラメーターの展開については、[Bash のドキュメント](https://www.gnu.org/software/bash/manual/bashref.html#Shell-Parameter-Expansion)を参照してください。

### パラメーターと Bash 環境
{: #parameters-and-bash-environment }

原則として、CircleCI は設定ファイルへの環境変数の挿入をサポートしていません。 使用する値はリテラルとして扱われます。 そのため、`working_directory` を定義するときや、`PATH` を変更するとき、複数の `run` ステップで変数を共有するときに、問題が発生する可能性があります。

以下の例では、`$ORGNAME` と `$REPONAME` に挿入は行われません。

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

ただし、[プライベートイメージ]({{site.baseurl}}/ja/private-images/)のプルプロジェクトのプルのための環境変数の使用は例外となっています。
{: class="alert alert-info" }

設定ファイルの一部を`.circleci/config.yml` 全体で再利用できます。 `parameters` 宣言を使用することで、再利用可能な `commands`、`jobs`、`executors` に値を渡すことができます。

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

この `$BASH_ENV` を使った方法は `bash`でのみ動作し、他のシェルで動作するかは確認されていません。
{: class="alert alert-info"}

### Alpine Linux
{: #alpine-linux }

[Alpine Linux](https://alpinelinux.org/) ベースのイメージ ([Docker](https://hub.docker.com/_/docker) など) は `ash` シェルを使用します。

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

`.circleci/config.yml` ファイル内にシークレットやキーを追加しないでください。 CircleCI 上のプロジェクトにアクセスできる開発者は、`.circleci/config.yml` の全文を閲覧できます。 シークレットやキーは、CircleCI Web アプリの[プロジェクト]({{site.baseurl}}/set-environment-variable/#setting-an-environment-variable-in-a-project)や[コンテキスト]({{site.baseurl}}/set-environment-variable/#setting-an-environment-variable-in-a-context)の設定に保存します。 詳細については、セキュリティに関するページの[暗号化]({{site.baseurl}}/ja/security/#encryption)のセクションを参照してください。

設定内でスクリプトを実行すると、シークレット環境変数が公開される場合があります。 スクリプトのセキュアな活用方法については、[シェルスクリプトの使い方]({{site.baseurl}}/ja/using-shell-scripts/#shell-script-best-practices)のページでご確認ください。

## コンテキスト
{: #contexts }

[コンテキスト]({{site.baseurl}}/ja/contexts)を使って環境変数へのアクセスをさらに制限することができます。 コンテキストの設定は、CircleCI Web アプリの **Organization Settings** で行います。

## 関連項目
{: #see-also }
{:.no_toc}

- [セキュリティーに関する推奨事項]({{site.baseurl}}/ja/security-recommendations)
- [CircleCI API を使った変数の挿入]({{site.baseurl}}/ja/inject-environment-variables-with-api/)