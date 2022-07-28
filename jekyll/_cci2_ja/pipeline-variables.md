---
layout: classic-docs
title: "パイプライン値とパラメーター"
description: "パイプラインのパラメーターと値に関する詳細情報"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
---

パイプライン値とパラメーターを使用すると、再利用可能なパイプラインを設定できます。

* **パイプライン値**: 設定ファイル全体で使用できるメタデータ。
* **パイプラインパラメーター**: 型指定されたパイプライン変数。 設定ファイルの一番上にある `parameters` キーで宣言します。 `parameters` は、API からパイプラインの新規実行をトリガーする際にパイプラインに渡すことができます。

## パイプライン値
{: #pipeline-values }

パイプライン値は、あらゆるパイプライン設定で、事前に宣言することなく使用できます。

値や定義済みの環境変数の全リストは、[プロジェクトの値と変数に関するガイド]({{site.baseurl}}/variables/#pipeline-values)を参照して下さい。

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

**注: **上記の方法で `environment` キーの値を設定する際にパイプライン値が空の場合、値は `<nil>` が設定されます。 文字列を空にする必要がある場合は、[シェルコマンドで値を設定する]({{ site.baseurl }}/env-vars/#setting-an-environment-variable-in-a-shell-command)をご覧ください。

## 設定ファイルにおけるパイプラインパラメーター
{: #pipeline-parameters-in-configuration }

パイプラインパラメーターは、`.circleci/config.yml` の一番上で  `parameters` キーを使って宣言します。

パイプラインパラメーターでは以下のタイプのデータをサポートしています。
* 文字列
* ブール値
* 整数
* 列挙型

詳しい使用方法については、「[パラメーターの構文]({{ site.baseurl }}/reusing-config/#パラメーターの構文)」を参照してください。

パイプラインパラメーターは値で参照され、`pipeline.parameters` のスコープ内で設定ファイル内の変数として使用できます。

以下の例では、2 つのパイプラインパラメーター (`image-tag`、`workingdir`) が設定ファイルの一番上で定義され、後続の `build` ジョブで参照されています。

```yaml
version: 2.1
parameters:
  image-tag:
    type: string
    default: "latest"
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

**注: **この `POST` で `parameters` キーを渡すリクエストは、シークレットでは**ありません**のでご注意ください。

下の例では、上記の設定ファイルの例で説明したパラメーターを使用して、パイプラインをトリガーしています (注: API からパイプラインをトリガーするときにパラメーターを渡すには、設定ファイルでパラメーターを宣言している必要があります)。

```shell
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:project_slug/pipeline
```

### CiecleCI Web アプリを使ってパイプラインをトリガーするときにパラメーターを渡す
{: #passing-parameters-when-triggering-pipelines-using-the-circleci-web-app }

CLI や API の使用に加えて、CircleCI Web アプリからパラメーターを使ってパイプラインをトリガーすることもできます。 以下の設定を行います。

  1. Web アプリでダッシュボードを表示します。
  2. プロジェクトのフィルタリング機能を使ってプロジェクトを選択します。
  3. ブランチのフィルタリング機能を使って新しいパイプラインを実行するブランチを選択します。
  4. **Trigger Pipeline** ボタンをクリックします (ページの右上隅)。
  5. **Add Parameters** ドロップダウンを使って、パラメーターのタイプ、名前、値を指定します。
  6. **Trigger Pipeline** をクリックします。

**注:** Web アプリからパイプラインをトリガーする時に、設定ファイルで宣言していないパラメーターを渡すと、そのパイプラインは失敗し、 `Unexpected argument(s)` というエラーが表示されます。


## パイプラインパラメーターのスコープ
{: #the-scope-of-pipeline-parameters }

パイプラインパラメーターは、それらが宣言されている `.circleci/config.yml` 内でのみ扱うことができます。 config.yml でローカルに宣言された Orb を含め、Orb ではパイプラインパラメーターを使用できません。 これは、パイプラインのスコープを Orb 内で使用するとカプセル化が崩れ、Orb と呼び出し側の設定ファイルの間に強い依存関係が生まれ、決定論的動作が損なわれ、脆弱性が攻撃される領域が作られてしまう可能性があるためです。


## 設定プロセスの段階とパラメーターのスコープ
{: #config-processing-stages-and-parameter-scopes }

### プロセスの段階
{: #processing-stages }

設定プロセスは次の段階を経て進みます。

- パイプラインパラメーターが解決され、型チェックされる
- パイプライン パラメーターが Orb ステートメントに置き換えられる
- Orb がインポートされる

残りの設定プロセスが進み、要素パラメーターが解決され、型チェックされ、置き換えられます。

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

### パイプラインパラメーターのスコープ
{: #pipeline-parameter-scope }

設定ファイル内で定義されているパイプラインパラメーターは常にスコープ内で有効ですが、2 つの例外があります。

- パイプラインパラメーターは、他のパイプラインパラメーターの定義の範囲内では有効でないため、相互に依存させることはできません。
- データ漏えいを防ぐために、パイプラインパラメーターは Orb 本体、Orb のインラインの範囲内では有効ではありません。

## 条件付きワークフロー
{: #conditional-workflows }

ワークフロー宣言の下で[ロジックステートメント]({{site.baseurl}}/configuration-reference/#logic-statements)と一緒に [when` 句（または逆の`unless]({{site.baseurl}}/configuration-reference/#using-when-in-workflows) 句）を使用すると、そのワークフローを実行するかどうかを判断できます。  `when` や `unless` のロジックステートメントにより値の真偽を評価します。

この設定の最も一般的な活用方法は、値としてパイプラインパラメーターを使用し、API トリガーでそのパラメーターを渡して、実行するワークフローを決定できるようにすることです。

以下の設定例では、パイプラインパラメーター `run_integration_tests` を使用して `integration_tests` ワークフローの実行を制御しています。

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

`when` キーは、パイプライン パラメーターだけでなくすべての真偽値を受け入れますが、この機能が強化されるまでは、パイプライン パラメーターを使用する方法が主流となるでしょう。 また、`when` 句の逆の `unless` 句もあり、条件の真偽を逆に指定できます。
