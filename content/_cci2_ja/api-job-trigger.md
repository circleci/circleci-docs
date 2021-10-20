---
layout: classic-docs
title: "API を使用したジョブのトリガー"
short-title: "API を使用したジョブのトリガー"
description: "ビルド以外のジョブを定義およびトリガーする方法"
order: 80
version:
  - Cloud
  - Server v2.x
---


CircleCI API を使用してジョブをトリガーする方法について説明します。

<div class="alert alert-warning" role="alert">
  <p><span style="font-size: 115%; font-weight: bold;">⚠️ Heads up!</span></p>
  <span> This document refers to using the legacy CircleCI API 1.0, a service that will be eventually be deprecated in favor of the <a href="https://circleci.com/docs/api/v2/">V2 API</a>. Consider using the <a href="https://circleci.com/docs/api/v2/#trigger-a-new-pipeline">Pipelines</a> endpoints to trigger pipelines.</span>
</div>

* 目次
{:toc}

## 概要
{: #overview }

[CircleCI API](https://circleci.com/docs/api/#trigger-a-new-job) を使用して、`.circleci/config.yml` で定義した[ジョブ]({{ site.baseurl }}/ja/2.0/jobs-steps/#ジョブの概要)をトリガーします。

`curl` を使用して `deploy_docker` ジョブをトリガーする例を以下に示します。

```bash
curl -u ${CIRCLE_API_USER_TOKEN}: \
     -d build_parameters[CIRCLE_JOB]=deploy_docker \
     https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/<branch>
```

Alternative syntaxes for the above example:
- Replace single quotes with double quotes (`-d "build_parameters[CIRCLE_JOB]=deploy_docker"`)
- Escape the square brackets (`-d build_parameters\[CIRCLE_JOB\]=deploy_docker`)

Some notes on the variables used in this example:
- `CIRCLE_API_USER_TOKEN` is a [personal API token]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-personal-api-token).
- `<vcs-type>` is a placeholder variable and refers to your chosen VCS (either `github` or `bitbucket`).
- `<org>` is a placeholder variable and refers to the name of your CircleCI organization.
- `<repo>` is a placeholder variable and refers to the name of your repository.
- `<branch>` is a placeholder variable and refers to the name of your branch.

For a complete reference of the API, see the [CircleCI API Documentation](https://circleci.com/docs/api/v2/#section=reference).

**Important Considerations When Triggering A Job Via The API**

- API によってトリガーされるジョブに `workflows` セクションが含まれてもかまいません。
- ワークフローが、API によってトリガーされるジョブを参照する必要は**ありません**。
- API によってトリガーされたジョブは、特定の [CircleCI コンテキスト]({{ site.baseurl }}/ja/2.0/contexts/)用に作成された環境変数にアクセス**できません**。
- 環境変数を使用する場合は、それらの環境変数が[プロジェクトレベル]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクトでの環境変数の設定)で定義されている必要があります。
- 現在のところ、CircleCI 2.1 とワークフローを使用する場合には、単一のジョブをトリガーすることができません。
- It is possible to trigger [workflows]({{ site.baseurl }}/2.0/workflows/) with the CircleCI API: a [singular workflow can be re-run](https://circleci.com/docs/api/v2/#rerun-a-workflow), or you may [trigger a pipeline](https://circleci.com/docs/api/v2/#trigger-a-new-pipeline) which will run its subsequent workflows.

## API を使用したジョブの条件付き実行
{: #conditionally-running-jobs-with-the-api }

The next example demonstrates a configuration for building docker images with `setup_remote_docker` only for builds that should be deployed.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: ruby:2.4.0-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          LANG: C.UTF-8
    working_directory: /my-project
    parallelism: 2
    steps:
      - checkout

      - run: echo "run some tests"

      - deploy:
          name: デプロイ ジョブを条件付きで実行
          command: |
            # これをビルド・デプロイのチェックに置き換えます (すなわち、現在のブランチが "release")
            if [[ true ]]; then
              curl --user ${CIRCLE_API_USER_TOKEN}: \
                --data build_parameters[CIRCLE_JOB]=deploy_docker \
                --data revision=$CIRCLE_SHA1 \
                https://circleci.com/api/v1.1/project/github/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/tree/$CIRCLE_BRANCH
            fi

  deploy_docker:
    docker:

      - image: ruby:2.4.0-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /
    steps:
      - setup_remote_docker
      - run: echo "deploy section running"
```

Notes on the above example:

- ビルド ジョブの `deploy` ステップを必ず使用してください。 これを使用しないと、並列処理の値が N の場合に、N 回のビルドがトリガーされることがあります。
- 以下は、デプロイされるビルドに対してのみ `setup_remote_docker` で Docker イメージを構築する場合の設定ファイル例です。

## 関連項目
{: #see-also }

[トリガー]({{ site.baseurl }}/ja/2.0/triggers/)
