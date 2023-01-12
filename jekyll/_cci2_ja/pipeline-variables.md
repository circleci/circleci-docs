---
layout: classic-docs
title: パイプラインの値とパラメーター
description: "Information about pipeline parameters and values and how to use them."
categories:
  - はじめよう
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

## 概要
{: #introduction}

パイプラインの値とパラメーターを使用すると、再利用可能なパイプラインを設定できます。

* **パイプライン値**: 設定ファイル全体で使用できるメタデータ。
* **パイプラインパラメーター**: 型指定されたパイプライン変数。 設定ファイルの一番上にある `parameters` キーで宣言します。 Users can pass `parameters` into their pipelines when triggering a new run of a pipeline through the API or web app.

## パイプライン値
{: #pipeline-values }

パイプライン値はすべてのパイプライン構成で使用でき、事前に宣言することなく使用できます。

For a full list of values and built-in environment variables, see the [Project values and variables](/docs/variables/#pipeline-values) guide.

{% include snippets/ja/pipeline-values.md %}

使用例:

```yaml
jobs:
  build:
    docker:
      - image: cimg/node:17.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      CIRCLE_COMPARE_URL: << pipeline.project.git_url >>/compare/<< pipeline.git.base_revision >>..<<pipeline.git.revision>>
    working_directory: ~/main
    steps:
      - run: echo "This is pipeline ID << pipeline.id >>"
      - run: echo $CIRCLE_COMPARE_URL
```

上記の方法で `environment` キーの値を設定する際にパイプラインの変数が空の場合、変数は `<nil>` が設定されます。 If you need an empty string instead, [set the variable in a shell command](/docs/set-environment-variable/#set-an-environment-variable-in-a-shell-command).
{: class="alert alert-info" }

## 設定ファイルにおけるパイプラインパラメーター
{: #pipeline-parameters-in-configuration }

パイプラインパラメーターは、`.circleci/config.yml` の一番上で  `parameters` キーを使って宣言します。 Pipeline parameters can be referenced by value and used as a configuration variable under the scope `pipeline.parameters`.

パイプライン パラメーターは次のデータ型をサポートしています。

* 文字列
* ブール値
* 整数
* 列挙型

See [Parameter syntax](/docs/reusing-config/#parameter-syntax) for usage details.

The example below shows a configuration with two pipeline parameters (`image-tag` and `workingdir`) defined at the top of the configuration, and then subsequently referenced in the `build` job:

```yaml
version: 2.1

parameters:
  image-tag:
    type: string
    default: "current"
  workingdir:
    type: string
    default: "~/main"

jobs:
  build:
    docker:
      - image: cimg/node:<< pipeline.parameters.image-tag >>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      IMAGETAG: << pipeline.parameters.image-tag >>
    working_directory: << pipeline.parameters.workingdir >>
    steps:
      - run: echo "Image tag used was ${IMAGETAG}"
      - run: echo "$(pwd) == << pipeline.parameters.workingdir >>"
```

### API からパイプラインをトリガーするときにパラメーターを渡す
{: #passing-parameters-when-triggering-pipelines-via-the-api }

[パイプラインをトリガーする](https://circleci.com/docs/api/v2/#trigger-a-new-pipeline) API v2 エンドポイントを使用すると、特定のパラメーターの値でパイプラインをトリガーすることができます。 これを実行するには、`POST` 本体の JSON パケット内で `parameters` キーを渡します。

The `parameters` key passed in this `POST` request is **NOT** secret.
{: class="alert alert-warning" }

The example below triggers a pipeline with the parameters described in the above configuration example. If you run a command to trigger a pipeline, and the parameter has not been declared in the configuration file, you will receive an error response message, such as `Project not found`.

```shell
curl -u ${CIRCLE_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:project_slug/pipeline
```

### CiecleCI Web アプリを使ってパイプラインをトリガーするときにパラメーターを渡す
{: #passing-parameters-when-triggering-pipelines-using-the-circleci-web-app }

In addition to using the API, you can also trigger a pipeline with parameters from the CircleCI web app. If you pass a parameter when triggering a pipeline from the web app, and the parameter has not been declared in the configuration file, the pipeline will fail with the error `Unexpected argument(s)`.

1. プロジェクトのフィルタリング機能を使ってプロジェクトを選択します。
2. ブランチのフィルタリング機能を使って新しいパイプラインを実行するブランチを選択します。
3. **Trigger Pipeline** ボタンをクリックします (ページの右上隅)。
4. **Add Parameters** ドロップダウンを使って、パラメーターのタイプ、名前、値を指定します。
5. **Trigger Pipeline** をクリックします。

Parameters can also be called when setting up a scheduled pipeline in the web app. The parameters are part of the trigger form in **Project Settings > Triggers**. Any parameter set up as a part of a scheduled pipeline will also need to be declared in the configuration file, otherwise the the pipeline will fail with the error `Unexpected argument(s)`.

## Configuration processing stages
{: #configuration-processing-stages }

構成プロセスは次の段階を経て進みます。

- パイプラインパラメーターが解決され、型チェックされる
- パイプライン パラメーターが Orb ステートメントに置き換えられる
- Orb がインポートされる

残りの構成プロセスが進み、要素パラメーターが解決され、型チェックされ、置き換えられます。

## パイプラインパラメーターのスコープ
{: #the-scope-of-pipeline-parameters }

パイプラインパラメーターは、それらが宣言されている `.circleci/config.yml` 内でのみ扱うことができます。 Pipeline parameters are not available in orbs, including orbs declared locally in your `.circleci/config.yml` file. This is because access to pipeline scope in orbs would break encapsulation and create a hard dependency between the orb and the calling configuration. This would potentially create a surface area of vulnerability, increasing security risks.

### 要素パラメーターのスコープ
{: #element-parameter-scope }

Element parameters use lexical scoping, so parameters are in scope within the element they are defined in, for example, a job, a command, or an executor. 下の例のように、パラメーターを持つ要素がパラメーターを持つ別の要素を呼び出す場合、内側の要素は呼び出し元の要素のスコープを継承しません。

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
  daily-message:
    machine: true
    parameters:
      message:
        type: string
    steps:
      - print:
          message: Printing << parameters.message >>

workflows:
  my-workflow:
    jobs:
      - daily-message:
         message: echo << parameters.message >>
```

Even though the `print` command is called from the `cat-file` job, the file parameter would not be in scope inside the print job. これにより、すべてのパラメーターが常に有効な値にバインドされ、使用可能なパラメーターが常に認識されます。 Running this would throw a pipeline error of `Arguments referenced without declared parameters: message`.

### パイプライン値のスコープ
{: #pipeline-value-scope }

パイプライン値、つまり CircleCI が提供するパイプライン内で使用できる値 (例: `<< pipeline.number >>`) は、常にスコープ内で有効です。

### パイプラインパラメーターのスコープ
{: #pipeline-parameter-scope }

設定ファイル内で定義されているパイプラインパラメーターは常にスコープ内で有効ですが、2 つの例外があります。

- パイプラインパラメーターは、他のパイプラインパラメーターの定義の範囲内では有効でないため、相互に依存させることはできません。
- データ漏えいを防ぐために、パイプラインパラメーターは Orb 本体、Orb のインラインの範囲内では有効ではありません。

## 条件付きワークフロー
{: #conditional-workflows }

Use the [`when` clause](/docs/configuration-reference/#using-when-in-workflows) (or the inverse clause `unless`) under a workflow declaration, along with a [logic statement](/docs/configuration-reference/#logic-statements), to decide whether or not to run that workflow.  `when` や `unless` のロジックステートメントにより値の真偽を評価します。

The most common use of this construct is to use a pipeline parameter as the value, allowing a trigger to pass that parameter to determine which workflows to run. Below is an example configuration using the pipeline parameter `run_integration_tests` to set whether the workflow `integration_tests` will run.

```yaml
version: 2.1

parameters:
  run_integration_tests:
    type: boolean
    default: false

workflows:
  integration_tests:
    when: << pipeline.parameters.run_integration_tests >>
    jobs:
      - mytestjob

jobs:
  mytestjob:
    steps:
      - checkout
      - ... # job steps
```

In this example, the workflow `integration_tests` is not triggered unless it is explicitly invoked when the pipeline is triggered with the following in the `POST` body:

```json
{
    "parameters": {
        "run_integration_tests": true
    }
}
```

`when` キーは、パイプライン パラメーターだけでなくすべての真偽値を受け入れますが、この機能が強化されるまでは、パイプライン パラメーターを使用する方法が主流となるでしょう。 また、`when` 句の逆の `unless` 句もあり、条件の真偽を逆に指定できます。
