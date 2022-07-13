---
layout: classic-docs
title: "プロジェクトの値と変数"
description: CircleCI プロジェクトで使用する定義済みの値のリスト
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このページでは、CircleCI プロジェクトで使用できる定義済みの値について説明します。

## 定義済み環境変数
{: #built-in-environment-variables }

下記の定義済み環境変数は、すべての CircleCI プロジェクトで使用できます。 環境変数はジョブレベルで設定されます。 環境変数は 1 つのジョブのコンテキスト内では使用できますが、パイプラインレベルでは存在しないため、パイプラインレベルまたはワークフローレベルのロジックには使用できません。

**注:** 定義済み環境変数を使用して別の環境変数を定義することはできません。 代わりに、`run` ステップを使用して、新しい環境変数を `BASH_ENV` でエクスポートする必要があります。 詳しくは[シェルコマンドで環境変数を設定する]({{ site.baseurl }}/env-vars/#setting-an-environment-variable-in-a-shell-command)をご覧ください。

{% include snippets/ja/built-in-env-vars.md %}

## パイプライン値
{: #pipeline-values }

パイプライン値は、すべてのパイプライン設定で事前に宣言することなく使用できます。 パイプライン値はパイプラインレベルで設定されます。 ワークフローやジョブの実行時ではなく、コンパイル時に挿入されます。

{% include snippets/ja/pipeline-values.md %}

例えば下記のようにします。

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/node:latest
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

注: 上記の方法で `environment` キーの変数を設定する際にパイプラインの変数が空の場合、変数は `<nil>` が設定されます。 If you need an empty string instead, [set the variable in a shell command]({{ site.baseurl }}/env-vars/#setting-an-environment-variable-in-a-shell-command).

