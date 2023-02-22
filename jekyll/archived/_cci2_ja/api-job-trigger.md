---
layout: classic-docs
title: "API を使用したジョブのトリガー"
short-title: "API を使用したジョブのトリガー"
description: "ビルド以外のジョブを定義およびトリガーする方法"
order: 80
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---


CircleCI API を使用してジョブをトリガーする方法について説明します。

<div class="alert alert-warning" role="alert">
  <p><span style="font-size: 115%; font-weight: bold;">⚠️ 注意</span></p>
  <span> このドキュメントでは、従来の CircleCI API 1.0 を使用していますが、このサービスは、 <a href="https://circleci.com/docs/api/v2/">V2 API</a> により、いずれ廃止される予定です。 <a href="https://circleci.com/docs/api/v2/#trigger-a-new-pipeline">パイプライン</a> のエンドポイントをパイプラインのトリガーとして使用することをご検討ください。</span>
</div>

* 目次
{:toc}

## 概要
{: #overview }

[CircleCI API](https://circleci.com/docs/api/#trigger-a-new-job) を使用して、`.circleci/config.yml` で定義した[ジョブ]({{ site.baseurl }}/ja/2.0/jobs-steps/#ジョブの概要)をトリガーします。

`curl` を使用して `deploy_docker` ジョブをトリガーする例を以下に示します。

```shell
curl -u ${CIRCLE_API_USER_TOKEN}: \
     -d build_parameters[CIRCLE_JOB]=deploy_docker \
     https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/<branch>
```

上記の例の代替構文です。
- 一重引用符を二重引用符に置き換える (`-d "build_parameters[CIRCLE_JOB]=deploy_docker"`)。
- 角括弧のエスケープ (`-d build_parameters\[CIRCLE_JOB\]=deploy_docker`)

この例には以下の変数が使用されているためご注意ください。
- `CIRCLE_API_USER_TOKEN` は、[パーソナル API トークン]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-personal-api-token)です。
- `<vcs-type>`は、 選択された VCS (`github` または `bitbucket`) を示すプレースホルダー変数です。
- `<org>` は、プレースホルダー変数で、 CircleCIの組織名を指します。
- `<repo>`は、プレースホルダー変数で、レポジトリ名を指します。
- `<branch>`は、プレースホルダー変数で、ブランチ名を指します。

API の関連情報については、[CircleCI API ドキュメント](https://circleci.com/docs/api/v2/#section=reference) をご参照ください。

**API を通してジョブをトリガーする場合に考慮すべき重要事項**

- API によってトリガーされるジョブに `workflows` セクションが含まれてもかまいません。
- ワークフローが、API によってトリガーされるジョブを参照する必要は**ありません**。
- API によってトリガーされたジョブは、特定の [CircleCI コンテキスト]({{ site.baseurl }}/ja/2.0/contexts/)用に作成された環境変数にアクセス**できません**。
- 環境変数を使用する場合は、それらの環境変数が[プロジェクトレベル]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクトでの環境変数の設定)で定義されている必要があります。
- 現在のところ、CircleCI 2.1 とワークフローを使用する場合には、単一のジョブをトリガーすることができません。
- CircleCI APIを使って、[ワークフロー]({{ site.baseurl }}/2.0/workflows/) をトリガーすることが可能です。[単一のワークフローを再実行することも](https://circleci.com/docs/api/v2/#rerun-a-workflow)、 [パイプラインをトリガーして](https://circleci.com/docs/api/v2/#trigger-a-new-pipeline)後続のワークフローを実行することも可能です。

## API を使用したジョブの条件付き実行
{: #conditionally-running-jobs-with-the-api }

以下は、デプロイされるビルドに対してのみ `setup_remote_docker` で Docker イメージをビルドする場合の設定例です。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: ruby:2.4.0-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
    working_directory: /
    steps:
      - setup_remote_docker
      - run: echo "deploy section running"
```

この例では以下の点にご留意ください。

- 必ずビルド ジョブの `deploy` ステップを使用してください。 これを使用しないと、並列実行の値が N の場合に、N 回のビルドがトリガーされることがあります。
- API 呼び出しを `build_parameters[CIRCLE_JOB]=deploy_docker` で使用し、`deploy_docker` ジョブのみが実行されるようにします。

## 関連項目
{: #see-also }

[トリガー]({{ site.baseurl }}/2.0/triggers/)
