---
layout: classic-docs
title: "Project values and variables"
description: A list of all built-in variables for your CircleCI projects.
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

This page is a reference for all built-in values available for use in your CircleCI projects.

## 定義済み環境変数
{: #built-in-environment-variables }

The following built-in environment variables are available for all CircleCI projects. Environment variables are scoped at the job level. They can be used within the context of a job but do not exist at a pipeline level, therefore they cannot be used for any logic at the pipeline or workflow level.

**Note**: You cannot use a built-in environment variable to define another environment variable. 代わりに、`run` ステップを使用して、新しい環境変数を `BASH_ENV` でエクスポートする必要があります。 For more details, see [Setting an Environment Variable in a Shell Command]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-shell-command).

{% include snippets/built-in-env-vars.md %}

## パイプライン値
{: #pipeline-values }

パイプライン値はすべてのパイプライン構成で使用でき、事前の宣言なしに利用できます。 Pipeline values are scoped at the pipeline level. They are interpolated at compilation time, not workflow/job runtime.

{% include snippets/pipeline-values.md %}

例えば下記のようにします。

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

**Note:** When using the above method to set the variables in the `environment` key, note that if the pipeline variable is empty it will be set to `<nil>`. 文字列を空にする必要がある場合、[シェルコマンドでの変数の設定]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-shell-command)をご覧ください。

