---
layout: classic-docs
title: "パイプライン変数"
short-title: "パイプライン変数"
description: "パイプラインの変数、パラメーター、値についての詳細情報"
categories:
  - getting-started
order: 1
---

パイプライン変数を使用すると、再利用可能なパイプラインを構成できます。 パイプライン変数を使用するには、[パイプライン]({{ site.baseurl }}/2.0/build-processing)を有効化し、設定ファイルで[バージョン]({{ site.baseurl }}/2.0/configuration-reference/#version) `2.1` 以上を指定する必要があります。

パイプライン変数には、次の 2 つの種類があります。

* **パイプライン値**: 設定ファイル全体で使用できるメタデータです。
* **パイプライン パラメーター**: 型指定された変数です。設定ファイルのトップ レベルに `parameters` キーで宣言します。 `parameters` は、API からパイプラインの新規実行をトリガーする際にパイプラインに渡すことができます。

## パイプライン値

パイプライン値は、あらゆるパイプライン構成で使用可能であり、事前に宣言することなく使用できます。

| 値                          | 説明                                           |
| -------------------------- | -------------------------------------------- |
| pipeline.id                | パイプラインを表す、グローバルに一意の ID                       |
| pipeline.number            | パイプラインを表す、プロジェクトで一意の整数の ID                   |
| pipeline.project.git_url   | 例: https://github.com/circleci/circleci-docs |
| pipeline.project.type      | 例: "github"                                  |
| pipeline.git.tag           | パイプラインをトリガーするタグ                              |
| pipeline.git.branch        | パイプラインをトリガーするブランチ                            |
| pipeline.git.revision      | 現在の git リビジョン                                |
| pipeline.git.base_revision | 以前の git リビジョン                                |
{: class="table table-striped"}

例

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: circleci/node:latest
    environment:
      IMAGETAG: latest
    working_directory: ~/main
    steps:
      - run: echo "This is pipeline ID << pipeline.id >>"
```

## 設定ファイルにおけるパイプライン パラメーター

パイプライン パラメーターは、`.circleci/config.yml` のトップ レベルで `parameters` キーを使って宣言します。

パイプライン パラメーターは、次のデータ型をサポートしています。
* 文字列
* ブール値
* 整数
* 列挙

詳しい使用方法については、「[パラメーターの構文]({{ site.baseurl }}/2.0/reusing-config/#パラメーターの構文)」を参照してください。

パイプライン パラメーターは値として参照され、スコープ `pipeline.parameters` の下で設定ファイル内の変数として使用できます。

以下の例では、2 つのパイプライン パラメーター (`image-tag`、`workingdir`) が設定ファイルの上部で定義され、後続の `build` ジョブで参照されています。

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
      - image: circleci/node:<< pipeline.parameters.image-tag >>
    environment:
      IMAGETAG: << pipeline.parameters.image-tag >>
    working_directory: << pipeline.parameters.workingdir >>
    steps:
      - run: echo "Image tag used was ${IMAGETAG}"
      - run: echo "$(pwd) == << pipeline.parameters.workingdir >>"
```

### API からパイプラインをトリガーするときにパラメーターを渡す

[パイプラインをトリガーする](https://circleci.com/docs/api/v2/#trigger-a-new-pipeline) API v2 エンドポイントを使用すると、特定のパラメーターの値でパイプラインをトリガーすることができます。 これを実行するには、`POST` 本体の JSON パケット内で `parameters` キーを渡します。

下の例では、上記の設定ファイルの例で説明したパラメーターを使用して、パイプラインをトリガーしています (メモ: API からパイプラインをトリガーするときにパラメーターを渡すには、設定ファイルでパラメーターを宣言している必要があります)。

```
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:project_slug/pipeline
```

## パイプライン パラメーターのスコープ

パイプライン パラメーターは、それらが宣言されている `.circleci/config.yml` 内でのみ扱うことができます。 config.yml でローカルに宣言された Orb を含め、Orb ではパイプライン パラメーターを利用できません。 これは、パイプラインのスコープを Orb 内に認めるとカプセル化が崩れることになり、Orb と呼び出し側の設定ファイルの間に強い依存関係が生まれ、決定論的動作が台無しになり、脆弱性が攻撃される領域が作られてしまう可能性があるためです。


## 構成プロセスの段階とパラメーターのスコープ

### プロセスの段階

構成プロセスは次の段階を経て進みます。

- パイプライン パラメーターが解決され、型チェックされる
- パイプライン パラメーターが Orb ステートメントに置き換えられる
- Orb がインポートされる

残りの構成プロセスで、要素パラメーターが解決され、型チェックされ、置換されます。

## 要素パラメーターのスコープ

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

パイプライン値、つまり CircleCI が提供するパイプライン内で使用できる値 (例: `<< pipeline.number >>`) は、常にスコープ内で有効です。

### パイプライン パラメーターのスコープ

設定ファイル内で定義されているパイプライン パラメーターは常にスコープ内で有効ですが、2 つの例外があります。

- パイプライン パラメーターは、他のパイプライン パラメーターの定義の範囲内では有効でないため、相互に依存させることはできません。
- データ漏えいを防ぐために、パイプライン パラメーターは Orbs 本体、Orbs のインラインの範囲内では有効ではありません。

## 条件付きワークフロー

2019 年 6 月の新機能で、ワークフロー宣言の下で `when` 句を使用して、ブール値によってそのワークフローを実行するかどうかを判断できるようになりました (逆の `unless` 句もサポート) 。

この構成の最も一般的な活用方法は、値としてパイプライン パラメーターを使用し、API トリガーでそのパラメーターを渡して、実行するワークフローを決定できるようにすることです。

以下は、2 つのパイプライン パラメーターを使用した設定ファイルの例です。1 つは特定のワークフローを実行するかどうかを決定し、もう 1 つは特定のステップを実行するかどうかを決定しています。

```yaml
version: 2.1

parameters:
  run_integration_tests:
    type: boolean
    default: false
  deploy:
    type: boolean
    default: false

workflows:
  version: 2
  integration_tests:
    when: << pipeline.parameters.run_integration_tests >>
    jobs:
      - mytestjob

jobs:
  mytestjob:
    steps:
      - checkout
      - when:
          condition: << pipeline.parameters.deploy >>
          steps:
            - run: echo "deploying"
```

この例では、下のように `POST` 本体でパイプラインをトリガーする際にパラメーターを明示的に指定しなければ、`integration_tests` ワークフローはトリガーされません。

```json
{
    "parameters": {
        "run_integration_tests": true
    }
}
```

`when` キーは、パイプライン パラメーターだけでなくブール値を受け入れますが、この機能が強化されるまでは、パイプライン パラメーターを使用する方法が主流となるでしょう。 また、`when` 句と似た逆の意味の `unless` 句もあり、条件の真偽を逆に指定できます。
