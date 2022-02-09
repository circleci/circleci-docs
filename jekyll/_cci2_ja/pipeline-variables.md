---
layout: classic-docs
title: "Pipeline values and parameters"
description: "Detailed information about pipeline parameters and values"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
---

Pipeline values and parameters can be used to create reusable pipeline configurations.

* **パイプライン値**: 設定ファイル全体で使用できるメタデータ。
* **パイプライン パラメーター**: 型指定された変数。 設定ファイルの一番上にある `parameters` キーで宣言します。 `parameters` は、API からパイプラインの新規実行をトリガーする際にパイプラインに渡すことができます。

## パイプライン値
{: #pipeline-values }

パイプライン値は、あらゆるパイプライン構成で使用可能であり、事前に宣言することなく使用できます。

For a full list of values and built-in environment variables, see the [Project Values and Variables guide]({{site.baseurl}}/2.0/variables/#pipeline-values).

{% include snippets/pipeline-values.md %}

Usage example:

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: circleci/node:latest
    environment:
      CIRCLE_COMPARE_URL: << pipeline.project.git_url >>/compare/<< pipeline.git.base_revision >>..<<pipeline.git.revision>>
    working_directory: ~/main
    steps:
      - run: echo "This is pipeline ID << pipeline.id >>"
      - run: echo $CIRCLE_COMPARE_URL
```

**Note:** When using the above method to set the values in the `environment` key, note that if the pipeline variable is empty it will be set to `<nil>`. 文字列を空にする必要がある場合、[シェルコマンドでの変数の設定]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-shell-command)をご覧ください。

## 設定ファイルにおけるパイプライン パラメーター
{: #pipeline-parameters-in-configuration }

パイプライン パラメーターは、`.circleci/config.yml` のトップ レベルで `parameters` キーを使って宣言します。

パイプライン パラメーターは次のデータ型をサポートしています。
* 文字列
* ブール値
* 整数
* 列挙型

詳しい使用方法については、「[パラメーターの構文]({{ site.baseurl }}/2.0/reusing-config/#パラメーターの構文)」を参照してください。

パイプライン パラメーターは値として参照され、スコープ `pipeline.parameters` の下で設定ファイル内の変数として使用できます。

以下の例では、2 つのパイプライン パラメーター (`image-tag`、`workingdir`) が設定ファイルの上部で定義され、後続の `build` ジョブで参照されています。

```yaml
jobs:
  build:
    docker:
      - image: circleci/node:<< pipeline.parameters.image-tag >>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照 :
      IMAGETAG: << pipeline.parameters.image-tag >>
    working_directory: << pipeline.parameters.workingdir >>
    steps:
      - run: echo "Image tag used was ${IMAGETAG}"
      - run: echo "$(pwd) == << pipeline.parameters.workingdir >>"
```

### API からパイプラインをトリガーするときにパラメーターを渡す
{: #passing-parameters-when-triggering-pipelines-via-the-api }

[パイプラインをトリガーする](https://circleci.com/docs/api/v2/#trigger-a-new-pipeline) API v2 エンドポイントを使用すると、特定のパラメーターの値でパイプラインをトリガーすることができます。 これを実行するには、`POST` 本体の JSON パケット内で `parameters` キーを渡します。

**注: **この`POST`で`parameters`キーを渡すリクエストは、**シークレットではありません**のでご注意ください。

下の例では、上記の設定ファイルの例で説明したパラメーターを使用して、パイプラインをトリガーしています (メモ: API からパイプラインをトリガーするときにパラメーターを渡すには、設定ファイルでパラメーターを宣言している必要があります)。

```shell
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:project_slug/pipeline
```

## パイプライン パラメーターのスコープ
{: #the-scope-of-pipeline-parameters }

パイプライン パラメーターは、それらが宣言されている `.circleci/config.yml` 内でのみ扱うことができます。 config.yml でローカルに宣言された Orb を含め、Orb ではパイプライン パラメーターを利用できません。 これは、パイプラインのスコープを Orb 内に認めるとカプセル化が崩れることになり、Orb と呼び出し側の設定ファイルの間に強い依存関係が生まれ、決定論的動作が台無しになり、脆弱性が攻撃される領域が作られてしまう可能性があるためです。


## 構成プロセスの段階とパラメーターのスコープ
{: #config-processing-stages-and-parameter-scopes }

### プロセスの段階
{: #processing-stages }

構成プロセスは次の段階を経て進みます。

- パイプライン パラメーターが解決され、型チェックされる
- パイプライン パラメーターが Orb ステートメントに置き換えられる
- Orb がインポートされる

残りの構成プロセスが進み、要素パラメーターが解決され、型チェックされ、置き換えられます。

## 要素パラメーターのスコープ
{: #element-parameter-scope }

要素パラメーターは字句スコープをとるため、ジョブ、コマンド、Executor などで定義されている要素の範囲内に収まります。 下の例のように、パラメーターを持つ要素がパラメーターを持つ別の要素を呼び出す場合、内側の要素は呼び出し元の要素のスコープを継承しません。

```yaml
version: 2.1

commands:
  print:
    parameters:
      message:
        type: string
    steps:
      - run: echo << parameters.message >>

jobs:
  cat-file:
    parameters:
      file:
        type: string
    steps:
      - print:
          message: Printing << parameters.file >>
      - run: cat << parameters.file >>

workflows:
  my-workflow:
    jobs:
      - cat-file:
          file: test.txt
```

cat-file ジョブから `print` コマンドを呼び出しても、file パラメーターのスコープは print コマンド内には及びません。 これにより、すべてのパラメーターが常に有効な値にバインドされ、使用可能なパラメーターが常に認識されます。

## パイプライン値のスコープ
{: #pipeline-value-scope }

パイプライン値、つまり CircleCI が提供するパイプライン内で使用できる値 (例: `<< pipeline.number >>`) は、常にスコープ内で有効です。

### パイプライン パラメーターのスコープ
{: #pipeline-parameter-scope }

設定ファイル内で定義されているパイプライン パラメーターは常にスコープ内で有効ですが、2 つの例外があります。

- パイプライン パラメーターは、他のパイプライン パラメーターの定義の範囲内では有効でないため、相互に依存させることはできません。
- データ漏えいを防ぐために、パイプライン パラメーターは Orb 本体、Orb のインラインの範囲内では有効ではありません。

## 条件付きワークフロー
{: #conditional-workflows }

Use the [`when` clause](https://circleci.com/docs/2.0/configuration-reference/#using-when-in-workflows) (or the inverse clause `unless`) under a workflow declaration, along with a [logic statement](https://circleci.com/docs/2.0/configuration-reference/#logic-statements), to decide whether or not to run that workflow. Logic statements in a `when` or `unless` clause should evaluate to a truthy or falsy value.

この構成の最も一般的な活用方法は、値としてパイプライン パラメーターを使用し、API トリガーでそのパラメーターを渡して、実行するワークフローを決定できるようにすることです。

以下の構成例では、パイプライン パラメーター `run_integration_tests` を使用して `integration_tests` ワークフローの実行を制御しています。

```yaml
version: 2.1

parameters:
  run_integration_tests:
    type: boolean
    default: false

workflows:
  version: 2
  integration_tests:
    when: << pipeline.parameters.run_integration_tests >>
    jobs:
      - mytestjob

jobs:
...
```

この例では、下のように `POST` 本体でパイプラインをトリガーする際にパラメーターを明示的に指定しなければ、`integration_tests` ワークフローはトリガーされません。

```json
{
    "parameters": {
        "run_integration_tests": true
    }
}
```

`when` キーは、パイプライン パラメーターだけでなくすべての真偽値を受け入れますが、この機能が強化されるまでは、パイプライン パラメーターを使用する方法が主流となるでしょう。 また、`when` 句と似た逆の意味の `unless` 句もあり、条件の真偽を逆に指定できます。
