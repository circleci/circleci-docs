---
layout: classic-docs
title: "CircleCI API 開発者向けガイド"
short-title: "開発者向けガイド"
description: "API guide for internal and external CircleCI developers"
categories:
  - はじめよう
order: 1
version:
  - クラウド
---

この*API 開発者向けガイド*は、開発者の方々が迅速かつ簡単に CircleCI サービスへの API 呼び出しを行い、ユーザー、パイプライン、プロジェクト、ワークフローに関する詳細情報を返すためのガイドです。 The API v2 Specification itself may be viewed in the [Reference documentation]({{site.baseurl}}/api/v2).

* 目次
{:toc}

## API のカテゴリー
{: #api-categories }

現在の API v2 のエンドポイントは、以下のカテゴリに分けられます。

{% include snippets/api-v2-endpoints.md %}

現在 API v2 でサポートされているのは [パーソナル API トークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-personal-api-token) のみです。 [プロジェクトトークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-project-api-token) は、現在 API v2 ではサポートされていません。
{: class="alert alert-info"}

## 認証と認可
{: #authentication-and-authorization }

CircleCI API は、トークンベースの認証により API サーバーへのアクセスを管理し、ユーザーに API リクエストを行うための権限があるかどうかを検証します。 API リクエストを行う前に、まず API トークンを追加し、 API サーバーからリクエストを行う認証が付与されていることを確認する必要があります。 API トークンを追加し、API サーバーが認証する流れを以下で説明します。

**注意**:  `-u` フラグを `curl` コマンドに渡すと、API  トークンを HTTP 基本認証のユーザー名として使用することができます。

### API トークンの追加
{: #add-an-api-token }

API トークンの追加は、以下の手順で行います。

1. Log in to the [CircleCI web application](https://app.circleci.com).
2. [パーソナル API トークンのページ](https://app.circleci.com/settings/user/tokens)で[パーソナル API トークンを作成]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-personal-api-token)し、API トークンの追加手順に従います。
3.  トークンをテストするには、以下のコマンドで API を呼び出します。 cURL を呼び出す前に、API トークンを環境変数として設定する必要があります。

    ```shell
    export CIRCLE_TOKEN={your_api_token}
    curl https://circleci.com/api/v2/me --header "Circle-Token: $CIRCLE_TOKEN"
    ```

4.  以下のような JSON レスポンスが表示されます。

    ```json
    {
      "id": "string",
      "login": "string",
      "name": "string"
    }

    ```


**注意:** すべての API 呼び出しは、同じように JSON コンテントタイプの API トークンを使用して標準的な HTTP 呼び出しにより行われます。 このドキュメントに記載されている JSON の例は包括的なものではなく、ユーザーの入力やフィールドによっては、この例にはない追加のフィールドがある場合があります。

### Accept header
{: #accept-header }

It is recommended that you specify an Accept header in your API requests. 多くの API エンドポイントはデフォルトで JSON を返しますが、一部のエンドポイント (主に API v1) は、承認ヘッダーが指定されていない場合は EDN を返します。

- フォーマットされた JSON を返すには、以下の例のように、 `text/plain` ヘッダーを記述します。

  ```shell
  curl --header "Circle-Token: $CIRCLE_TOKEN" \
    --header 'Accept: text/plain'    \
    https://circleci.com/api/v2/project/{project-slug}/pipeline
  ```

- 圧縮した JSON を返す場合は、

  ```shell
  curl --header "Circle-Token: $CIRCLE_TOKEN" \
    --header 'Accept: application/json'    \
    https://circleci.com/api/v2/project/{project-slug}/pipeline
  ```

## API の利用開始
{: #getting-started-with-the-api }

CircleCI API は、リポジトリ名でプロジェクトを識別する点で以前のバージョンの API と共通しています。 For instance, if you want to pull information from CircleCI about the GitHub repository "https://github.com/CircleCI-Public/circleci-cli" you can refer to that in the CircleCI API as `gh/CircleCI-Public/circleci-cli`, which is a _triplet_ of the project type (VCS provider), the name of your engineering organization (or your VCS username), and the name of the repository.

プロジェクトのタイプには、`github` や `bitbucket`、または短縮形の `gh` または `bb` が使用できます。 For any other VCS type you can use `circleci`. `organization` には、お使いのバージョン管理システムにおけるユーザー名または組織名を指定します。

With this API, CircleCI introduces a string representation of the triplet called the `project_slug`, which takes the following form:

```
{project_type}/{org_name}/{repo_name}
```

The `project_slug` is included in the payload when pulling information about a project, and when looking up a pipeline or workflow by ID. すると、`project_slug` によりプロジェクトについての情報を得ることができます。

![API の構造]({{ site.baseurl }}/assets/img/docs/api-structure.png)

将来的には、`project_slug` の形式が変更される可能性もありますが、いかなる場合でも、プロジェクトの識別子として人が判読できる形式で用いられるはずです。

## レート制限
{: #rate-limits }

CircleCI API は、システムの安定性を確保するためのレート制限措置により保護されています。 弊社は、すべてのユーザーに公平なサービスを提供するために、個々のユーザーによるリクエストや個々のリソースに対するリクエストを制限する権利を有しています。

CircleCI 上での API 統合のオーサーとして、統合が抑制されることを想定し、失敗に対して安全な対応をする必要があります。 API の各部分に様々な保護機能や制限が設けられています。 特に、**突然のトラフィックの急増**や頻繁なポーリングなどの**持続的な大量のリクエスト**から API を保護します。

HTTP API の場合、リクエストが抑制されると [HTTP ステータスコード 429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) が表示されます。 統合において抑制されたリクエストを完了する必要がある場合は、遅延後に指数関数的バックオフを使用してこれらのリクエストを再試行する必要があります。

多くの場合、HTTP 429 レスポンスコードには、 [Retry-After HTTP ヘッダー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After)が付与されています。 このヘッダーが付与されている場合は、リクエストを再試行する前にヘッダー値が指定する期間統合を待つ必要があります。

## エンドツーエンドの API リクエスト例
{: #example-end-to-end-api-request }

このセクションでは、API 呼び出しを行うために必要な手順を最初から最後まで詳しく説明します。 This section includes creating a demo repository called "hello-world"; however, you can use a pre-existing repository to follow along if you choose.

**注意:** API 呼び出しの多くは、[上記](#getting-started-with-the-api)の `{project-slug}` トリプレットを使用しています。

### 前提条件
{: #prerequisites }

* A GitHub or Bitbucket account with a repository to set up with CircleCI.
* Completion of the CircleCI [onboarding]({{ site.baseurl }}/getting-started).

### 手順
{: #steps }

1. VCS プロバイダー上で、リポジトリを作成します。 この例のリポジトリ名は `hello-world` とします。

2. [CircleCI Web アプリ](https://app.circleci.com/) で **Projects > 目的のプロジェクト > Set Up Project** に移動し、新しいプロジェクトの設定を行います。 プロジェクトの設定ステップが完了すると、有効な `config.yml` ファイルが、リポジトリのルートにある `.circleci` フォルダーに作成されます。 この例では、 `.config.yml` には以下の内容が含まれます。

    ```yaml
    # 最新の CircleCI パイプライン プロセスエンジンの 2.1 バージョンを使用します。 参照先: https://circleci.com/docs/configuration-reference
    version: 2.1
    # Orb という設定パッケージを使用します。
    orbs:
      # Declare a dependency on the node orb
      node: circleci/node@4.7.0
      # Orchestrate or schedule a set of jobs
      workflows:
      # Name the workflow "test_my_app"
        test_my_app:
      # Run the node/test job in its own container
          jobs:
          - node/test
    ```

3. [パーソナル API トークン](https://circleci.com/account/api)のページで API トークンを追加します。 APIトークンを生成した後は、必ず書き留めて安全な場所に保管してください。

4. `curl` を使って API トークンをテストし、動作に問題がないことを確認しましょう。 次のコードスニペットは、プロジェクトのすべてのパイプラインを照会する例です。 以下の例では、中括弧内 (`{}`) の値を、ユーザー名／組織名に応じた値に置き換える必要があります。

    ```shell
    # First: set your CircleCI token as an environment variable
    export CIRCLE_TOKEN={your_api_token}

    curl --header "Circle-Token: $CIRCLE_TOKEN" \
      --header 'Accept: application/json'    \
      --header 'Content-Type: application/json' \
      https://circleci.com/api/v2/project/{project-slug}/pipeline
    ```

    フォーマットされていない JSON の長い文字列を受け取ります。 フォーマット後は以下のようになります。

    ```json
    {
      "next_page_token": null,
      "items": [
      {
        "id": "03fcbba0-d847-4c8b-a553-6fdd7854b893",
        "errors": [],
        "project_slug": "gh/{YOUR_USER_NAME}/hello-world",
        "updated_at": "2020-01-10T19:45:58.517Z",
        "number": 1,
        "state": "created",
        "created_at": "2020-01-10T19:45:58.517Z",
        "trigger": {
        "received_at": "2020-01-10T19:45:58.489Z",
          "type": "api",
                "actor": {
                  "login": "teesloane",
                  "avatar_url": "https://avatars0.githubusercontent.com/u/12987958?v=4"
                }
              },
              "vcs": {
                "origin_repository_url": "https://github.com/{YOUR_USER_NAME}/hello-world",
                "target_repository_url": "https://github.com/{YOUR_USER_NAME}/hello-world",
                "revision": "ca67134f650e362133e51a9ffdb8e5ddc7fa53a5",
                "provider_name": "GitHub",
                "branch": "master"
          }
        }
        ]
      }
    ```

5. CircleCI API v2 の利点の一つは、パラメータを使ってパイプラインをリモートでトリガーできることです。 次のコードスニペットでは、 本文のパラメーターなしで `curl` を使ってパイプラインを簡単にトリガーします。

    ```shell
    curl -X POST https://circleci.com/api/v2/project/{project-slug}/pipeline \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLE_TOKEN" \
    ```

    This returns:
    ```json
    {
      "number": 2,
      "state": "pending",
      "id": "e411ea74-c64a-4d60-9292-115e782802ed",
      "created_at": "2020-01-15T15:32:36.605Z"
    }
    ```

    これだけでも便利ですが、この POST リクエストを送信する際にパイプラインのパラメーターをカスタマイズできるようにしたいと思います。 本文のパラメーターを`curl` リクエストに含めると ( `-d` を使用)、パイプラインの実行時にパイプラインの特定の属性（パイプラインパラメータ、ブランチ、 git タグ）をカスタマイズできます。 Below, we are telling the pipelines to trigger for "my-branch":

    ```shell
    curl -X POST https://circleci.com/api/v2/project/{project-slug}/pipeline \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLE_TOKEN" \
    -d '{ "branch": "my-branch" }'
    ```

6. Let us move on to a more complex example: triggering a pipeline and passing a parameter that can be dynamically substituted into your configuration. In this example, we will pass a Docker image tag to our `docker` executor key.
    <br>
    まず、 `.circleci/config.yml` を、オンボーディングにより提供される標準の「Hello World」サンプルよりも少し複雑なものに変更する必要があります。

      ```yaml
      version: 2.1
      jobs:
        build:
          docker:
            - image: "circleci/node:<< pipeline.parameters.image-tag >>"
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
          environment:
            IMAGETAG: "<< pipeline.parameters.image-tag >>"
          steps:
            - run: echo "Image tag used was ${IMAGETAG}"
      parameters:
        image-tag:
          default: latest
          type: string
      ```

      API から受け取るパラメーターを宣言する必要があります。 In this case, under the `parameters` key, we define an `image-tag` to be expected in the JSON payload of a POST request to the [Trigger a new pipeline](https://circleci.com/docs/api/v2/index.html#operation/triggerPipeline) endpoint. <br>
7. これで、以下のように POST リクエストで変数を渡す `curl` リクエストを実行できるようになりました。

    ```shell
    curl -u ${CIRCLE_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
      "parameters": {
        "image-tag": "4.8.2"
      }
    }' https://circleci.com/api/v2/project/{project-slug}/pipeline
    ```

v2 API を使用したエンドツーエンドの例は以上です。 他のエンドポイントに関する詳細な情報は、現在利用可能な全エンドポイントの概要が書かれた [CircleCI API v2 のドキュメント]({{site.baseurl}}/api/v2) を参照してください。

## その他の API 使用例
{: #additional-api-use-cases }

Now that you have a general understanding of how the CircleCI API v2 service works through an end-to-end API example request and walkthrough, let us look at a few common tasks and operations you may perform on a regular basis when using the API.

Before trying any of the API calls in this section, make sure you have a personal API token and have been authenticated to make calls to the server.

### プロジェクトの詳細の取得
{: #get-project-details }

You may often find it helpful to retrieve information about a specific project, including the name of the organization the project belongs to, the version control system (VCS) that hosts the project, and other details. CircleCI API では、 `project/{project-slug}` エンドポイントに `project-slug` パラメータを渡して GET リクエストを一度行えば、 そのような情報やその他の情報を返すことができます。

If you would like more detailed information about a project, or need a refresher on the specifics of a project, refer to the CircleCI [Projects]({{site.baseurl}}/projects/) page.
{: class="alert alert-info"}

#### 手順
Hub CLI のインストールとセットアップが完了している場合は、以下のコマンドを実行するだけです。

CircleCI API v2 では、プロジェクト関連の API エンドポイントがいくつか用意されていますが、 `/project/{project-slug}` エンドポイントへの GET リクエストでは、 `project_slug` パラメーターをリクエストと共に渡すことで、特定のプロジェクトに関する詳細情報を返すことができます。

Whenever you see curly brackets `{}`, this represents a variable that you must manually enter in the request.
{: class="alert alert-info"}

プロジェクトの詳細を返すには、以下の手順で行います。

1. For this GET API call, under the `parameters` key, define the `project_slug` (`\<project_type\>/\<org_name\>/\<repo_name\>`) parameter you want returned in the JSON payload in your `curl` request as follows:

    ```shell
      curl -X GET https://circleci.com/api/v2/project/{project_slug} \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json' \
        --header "Circle-Token: $CIRCLE_TOKEN" \
    ```

2. `project-slug` パラメーターを渡して API リクエストを行うと、以下の例のようなフォーマットされていないJSONテキストを受け取ります。

    ```json
    {
      "slug": "gh/CircleCI-Public/api-preview-docs",
      "name": "api-preview-docs",
      "organization_name": "CircleCI-Public",
      "vcs_info": {
        "vcs_url": "https://github.com/CircleCI-Public/api-preview-docs",
        "provider": "GitHub",
        "default_branch": "master"
      }
    }
    ```

上記の例では、プロジェクト名、プロジェクトが属する組織の名前、プロジェクトをホストする VCS の情報など、プロジェクトに関する非常に具体的な情報を受け取ることができます。 このリクエストで返される各値の詳細については、*CircleCI API v2 リファレンスガイド*の[プロジェクトの詳細の取得](https://circleci.com/docs/api/v2/#get-a-project)をご覧ください。

### ジョブの詳細の取得
{: #get-job-details }

Much like the Get a project API request described in the previous example, the [Get job details](https://circleci.com/docs/api/v2/index.html#operation/getJobDetails) API request enables you to return specific job information from the CircleCI API by making a single API request.

ジョブの実行状況、使用されたリソース（パイプラインや Executor タイプ など）、ジョブが終了するまでにかかった時間に関する情報を知りたい場合、ジョブ情報の取得は非常に便利です。

#### ステップ
Hub CLI のインストールとセットアップが完了している場合は、以下のコマンドを実行するだけです。

Of the several jobs-related API endpoints available with CircleCI API v2, there is a specific endpoint you may wish to call to receive detailed information about your job. This API call to the `GET /project/{project_slug}/job/{job-number}` endpoint enables you to return detailed information about a specific job by passing the `project-slug` and `job-number` parameters with your request.

Whenever you see curly brackets `{}`, this represents a variable that you must manually enter in the request.
{: class="alert alert-info"}

ジョブの詳細を返すには、以下の手順を実行します。

1. この GET API 呼び出しでは、`curl`リクエストの JSON ペイロードに返したい `project_slug` パラメーターと `job_number` パラメーターを、 `parameters` キーの下に以下のように定義します。

    ```shell
      curl -X GET https://circleci.com/api/v2/project/{project_slug}/job/{job_number} \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json' \
        --header "Circle-Token: $CIRCLE_TOKEN" \
    ```

2. これらのパラメーターを渡して API リクエストを行うと、以下の例のようなフォーマットされていない JSON テキストを受け取ります。

    ```json
      {
      "web_url": "string",
      "project": {
        "slug": "gh/CircleCI-Public/api-preview-docs",
        "name": "api-preview-docs",
        "external_url": "https://github.com/CircleCI-Public/api-preview-docs"
      },
      "parallel_runs": [{
        "index": 0,
        "status": "string"
      }],
      "started_at": "2020-01-24T11:33:40Z",
      "latest_workflow": {
        "id": "string",
        "name": "build-and-test"
      },
      "name": "string",
      "executor": {
        "type": "string",
        "resource_class": "string"
      },
      "parallelism": 0,
      "status": null,
      "number": 0,
      "pipeline": {
        "id": "string"
      },
      "duration": 0,
      "created_at": "2020-01-13T18:51:40Z",
      "messages": [{
        "type": "string",
        "message": "string",
        "reason": "string"
      }],
      "contexts": [{
        "name": "string"
      }],
      "organization": {
        "name": "string"
      },
      "queued_at": "2020-01-13T18:51:40Z",
      "stopped_at": "2020-01-13T18:51:40Z"
    }

    ```

Notice in the example above that you will receive very specific information about your job, including specific project and workflow details for the job, the date and time the job started and then finished, as well as job-specific information such as the executor type used, current status of the job, and the duration of the job.

For a more detailed breakdown of each value returned in this request, please refer to the [Get Job Details](https://circleci.com/docs/api/v2/#get-job-details) section of the API v2 Reference Guide.

### アーティファクトのダウンロード
{: #download-artifacts }

下記では、ジョブの実行時に生成されるアーティファクトをダウンロードするために必要な手順を詳しく説明します。まず、ジョブのアーティファクトのリストを返し、次にすべてのアーティファクトをダウンロードします。 ジョブ番号を指定せずにパイプラインの_最新の_アーティファクトをダウンロードする方法をお探しの場合は、 [API v1.1ガイド]({{site.baseurl}}/ja/artifacts/#downloading-all-artifacts-for-a-build-on-circleci) をご覧ください。この機能は将来的に API v2 に追加されるため、今後もこちらでご確認ください。

#### ステップ
Hub CLI のインストールとセットアップが完了している場合は、以下のコマンドを実行するだけです。

1. Ensure your API token is set as an environment variable. 認証時にすでに行っているかもしれませんが、そうでない場合は、ターミナルでパーソナル API Tトークンに置き換えて以下のコマンドを実行してください。

    ```shell
    export CIRCLE_TOKEN={your_api_token}
    ```

2.  Retrieve the job number for the job you want to get artifacts for. ジョブ番号は、UIの「ジョブの詳細」ページのパンくずリスト、または URL で確認することができます。

    ![ジョブ番号]({{ site.baseurl }}/assets/img/docs/job-number.png)

3.  次に、 `curl` コマンドを使用して、特定のジョブのアーティファクトのリストを返します。

    ```shell
    curl -X GET https://circleci.com/api/v2/project/{project-slug}/{job_number}/artifacts \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLE_TOKEN"
    ```

    選択したジョブに関連するアーティファクトがある場合、アーティファクトのリストが返ってきます。 以下は、ドキュメントをビルドするジョブのアーティファクトをリクエストしたときの出力の抜粋です。

    ```json
    {
      "path": "circleci-docs/assets/img/docs/walkthrough6.png",
      "node_index": 0,
      "url": "https://53936-48750547-gh.circle-artifacts.com/0/circleci-docs/assets/img/docs/walkthrough6.png"
    },
    {
      "path": "circleci-docs/assets/img/docs/walkthrough7.png",
      "node_index": 0,
      "url": "https://53936-48750547-gh.circle-artifacts.com/0/circleci-docs/assets/img/docs/walkthrough7.png"
    },
    {
      "path": "circleci-docs/assets/img/docs/walkthrough8.png",
      "node_index": 0,
      "url": "https://53936-48750547-gh.circle-artifacts.com/0/circleci-docs/assets/img/docs/walkthrough8.png"
    },
    ```

4. 次に、この API 呼び出しを拡張して、アーティファクトをダウンロードすることができます。 アーティファクトをダウンロードしたい場所に移動して、リクエストの値をご自身の値に変更して以下のコマンドを実行してください。

     ```shell
    curl -X GET https://circleci.com/api/v2/project/{project-slug}/{job_number}/artifacts \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLE_TOKEN" \
    | grep -o 'https://[^"]*' \
    | wget --header="Circle-Token: $CIRCLE_TOKEN" -v -i -
    ```

    **注意: ** `grep` は、ジョブのアーティファクトをダウンロードするためのすべての URL の検索に、`wget` はダウンロードの実行に使用します。

### インサイトの収集
{: #gather-insights }

CircleCI API v2 には、ワークフローや個々のジョブに関する詳細な情報を取得できるエンドポイントも含まれています。 Read the [Using Insights]({{site.baseurl}}/insights) page to learn more about insights data.

以下の例では、メトリクスやクレジットの使用状況に関する情報を含む単一のワークフローに関する情報を返す方法を説明しています。

#### ワークフローメトリクスを返す方法
{: #returning-workflow-metrics }

個々のワークフローの集計データを返すには、以下の手順を実行します。

Whenever you see curly brackets `{}`, this represents a variable that you must manually enter in the request.
{: class="alert alert-info"}

1. この GET API 呼び出しでは、 `parameters` キーの下に、  `curl` リクエスト内で`project_slug` を以下のように定義します。

    ```shell
    curl -X GET https://circleci.com/api/v2/insights/{project-slug}/workflows
    --header 'Content-Type: application/json'
    --header 'Accept: application/json'
    --header "Circle-Token: $CIRCLE_TOKEN"
    ```
2. `project-slug` を定義して API リクエストを行うと、以下の例のようなフォーマットされていない JSON テキストを受け取ります。

```json
{
    "next_page_token": null,
    "items": [{
        "name": "build",
        "metrics": {
            "success_rate": 0.5975609756097561,
            "total_runs": 82,
            "failed_runs": 33,
            "successful_runs": 49,
            "throughput": 11.714285714285714,
            "mttr": 46466,
            "duration_metrics": {
                "min": 8796,
                "max": 20707,
                "median": 11656,
                "mean": 12847,
                "p95": 18856,
                "standard_deviation": 3489.0
            },
            "total_credits_used": 16216608
        },
        "window_start": "2020-01-15T03:20:24.927Z",
        "window_end": "2020-01-21T23:23:04.390Z"
    }, {
        "name": "docker_build",
        "metrics": {
            "success_rate": 1.0,
            "total_runs": 1,
            "failed_runs": 0,
            "successful_runs": 1,
            "throughput": 1.0,
            "mttr": 0,
            "duration_metrics": {
                "min": 1570,
                "max": 1570,
                "median": 1570,
                "mean": 1570,
                "p95": 1570,
                "standard_deviation": 0.0
            },
            "total_credits_used": 5154
        },
        "window_start": "2020-01-19T15:00:16.032Z",
        "window_end": "2020-01-19T15:26:26.648Z"
    }, {
        "name": "ecr_gc",
        "metrics": {
            "success_rate": 1.0,
            "total_runs": 167,
            "failed_runs": 0,
            "successful_runs": 167,
            "throughput": 23.857142857142858,
            "mttr": 0,
            "duration_metrics": {
                "min": 31,
                "max": 96,
                "median": 46,
                "mean": 49,
                "p95": 72,
                "standard_deviation": 11.0
            },
            "total_credits_used": 3482
        },
        "window_start": "2020-01-15T01:45:03.613Z",
        "window_end": "2020-01-21T23:46:25.970Z"
    }]
}
```

この JSON レスポンスでは、実行された一連のワークフローについて以下のような詳細なメトリクスを受け取ります。

- `success_rate`: 集計画面内の合計実行数（ステータスは問わない）に対する成功した実行数 (「SUCSESS」ステータスのもののみ) の比率
- `total_runs`:  実行数の合計
- `failed_runs`: 失敗した実行数
- `successful_runs`: 成功した実行数
- `throughput` : 1日あたりの平均ビルド数
- `mttr`: MTTR (平均復旧時間)。 CI ビルドが失敗した時に「SUCCESS」ステータスに戻るまでの平均時間です。
- `duration_metrics`: ワークフローの実行時間を示す一連の具体的なメトリクスと測定値で、`min`、`max`、`median`、 `mean`、`p95`、`standard_deviation` が含まれます。
- `total credits used`: ビルド中に使用されたクレジットの合計数
- `windows_start & windows_end` : ビルドの開始時間と完了時間

The above example only shows a few builds. このコマンドを実行すると、最大 250 個の異なるビルドが表示され、より詳細に確認することができます。
{: class="alert alert-info"}

#### 個々のジョブメトリクスの確認
{: #reviewing-individual-job-metrics }

最大 250 個の異なるジョブの集計データを取得した後は、ジョブが効率的に実行されているかどうかを確認するために、一つのジョブまたは少数のジョブに関する具体的な情報を確認しましょう。 個々のジョブの確認は、以下の手順で行います。

1. Using your `project-slug` from the previous API call you made to return workflow data, make a GET API call to the following Insights endpoint:

    ```shell
    curl -X GET https://circleci.com/api/v2/insights/{project-slug}/workflows/builds
    --header 'Content-Type: application/json'
    --header 'Accept: application/json'
    --header "Circle-Token: $CIRCLE_TOKEN"
    ```
4. Once you call this Insights endpoint, you will receive a JSON output similar to the example shown below.

```json
{
  "items" : [ {
    "id" : "08863cb6-3185-4c2f-a44e-b517b7f695a6",
    "status" : "failed",
    "duration" : 9263,
    "created_at" : "2020-01-21T20:34:50.223Z",
    "stopped_at" : "2020-01-21T23:09:13.953Z",
    "credits_used" : 198981
  }, {
    "id" : "2705482b-40ae-47fd-9032-4113e976510f",
    "status" : "failed",
    "duration" : 9075,
    "created_at" : "2020-01-21T20:14:00.247Z",
    "stopped_at" : "2020-01-21T22:45:15.614Z",
    "credits_used" : 148394
  }, {
    "id" : "65e049ee-5949-4c30-a5c6-9433ed83f96f",
    "status" : "failed",
    "duration" : 11697,
    "created_at" : "2020-01-21T20:08:06.950Z",
    "stopped_at" : "2020-01-21T23:23:04.390Z",
    "credits_used" : 122255
  }, {
    "id" : "b7354945-32ee-4cb5-b8bf-a2f8c115b955",
    "status" : "success",
    "duration" : 9230,
    "created_at" : "2020-01-21T19:31:11.081Z",
    "stopped_at" : "2020-01-21T22:05:02.072Z",
    "credits_used" : 195050
  }, {
    "id" : "7e843b39-d979-4152-9868-ba5dacebafc9",
    "status" : "failed",
    "duration" : 9441,
    "created_at" : "2020-01-21T18:39:42.662Z",
    "stopped_at" : "2020-01-21T21:17:04.417Z",
    "credits_used" : 192854
  }, {
    "id" : "8d3ce265-e91e-48d5-bb3d-681cb0e748d7",
    "status" : "failed",
    "duration" : 9362,
    "created_at" : "2020-01-21T18:38:28.225Z",
    "stopped_at" : "2020-01-21T21:14:30.330Z",
    "credits_used" : 194079
  }, {
    "id" : "188fcf84-4879-4dd3-8bf2-4f6ea724c692",
    "status" : "failed",
    "duration" : 8910,
    "created_at" : "2020-01-20T03:09:50.448Z",
    "stopped_at" : "2020-01-20T05:38:21.392Z",
    "credits_used" : 193056
  },

```

個々のジョブを確認する際は、各ジョブに対して以下の情報が返されることに注意してください。

- `id`: 個々のジョブの ID
- `status`: ジョブのステータス
- `duration`: ジョブの合計時間 (秒単位)
- `created_at`: ジョブの開始時間
- `stopped_at`: ジョブの完了時間
- `credits_used`: そのジョブに使用されたクレジット

## 参考情報
{: #reference }

- CircleCI V2 API に関する詳細情報は、[API V2 の概要]({{site.baseurl}}/ja/api-intro/) をご覧ください。
- CircleCI V2 API を構成するすべてのエンドポイントの詳細なリストは、[API V2 リファレンスガイド]({{site.baseurl}}/api/v2/)をご覧ください。
