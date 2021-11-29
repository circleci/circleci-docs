---
layout: classic-docs
title: "CircleCI API 開発者向けガイド"
short-title: "開発者向けガイド"
description: "社内外の CircleCI 開発者向け API クックブック"
categories:
  - はじめよう
order: 1
version:
  - Cloud
---

この*API 開発者向けガイド*は、開発者の方々が迅速かつ簡単に CircleCI サービスへの API 呼び出しを行い、ユーザー、パイプライン、プロジェクト、ワークフローに関する詳細情報を返すためのガイドです。 API v2 の仕様は、[こちら]({{site.baseurl}}/api/v2)をご覧ください。

* 目次
{:toc}

## API のカテゴリー
{: #api-categories }

現在の API v2 のエンドポイントは、以下のカテゴリに分けられます。

* 認証
* パイプライン
* ワークフロー
* ユーザー (プレビュー)
* プロジェクト (プレビュー)
* ジョブ (プレビュー)

**注意:** CircleCI API v2 の一部は現在もプレビュー中です。 プレビューのエンドポイントは、まだ完全にはサポートされておらず、一般提供のレベルにありません。 API v2 プレビューのエンドポイントに対する重大な変更が計画されており、 API v2 の重大な更新履歴で通知されます。

## 認証と認可
{: #authentication-and-authorization }

CircleCI API は、トークンベースの認証により API サーバーへのアクセスを管理し、ユーザーに API リクエストを行うためのアクセス許可があるかどうかを検証します。 API リクエストを行う前に、まず API トークンを追加し、 API サーバーからリクエストを行う認証が付与されていることを確認する必要があります。 API トークンを追加し、API サーバーが認証する流れを以下で説明します。

**注意**:  `-u` フラグを `curl` コマンドに渡すと、API  トークンを HTTP 基本認証のユーザー名として使用することができます。

### API トークンの追加
{: #add-an-api-token }
{:.no_toc}

API トークンの追加は、以下の手順で行います。

1. CircleCI の Web アプリケーションにログインします。
1. [パーソナル API トークンのページ](https://app.circleci.com/settings/user/tokens)に行き、API トークンの追加手順に従います。
2.  トークンをテストするには、以下のコマンドで API を呼び出します。 cURL を呼び出す前に、API トークンを環境変数として設定する必要があります。

    ```sh
    export CIRCLE_TOKEN={your_api_token}
    curl https://circleci.com/api/v2/me --header "Circle-Token: $CIRCLE_TOKEN"
    ```

3.  以下のような JSON レスポンスが表示されます。

    ```json
    {
      "id": "string",
      "login": "string",
      "name": "string"
    }

    ```


**注意:** すべての API 呼び出しは、同じように JSON コンテントタイプの API トークンを使用して標準的な HTTP 呼び出しにより行われます。 このドキュメントに記載されている JSON の例は包括的なものではなく、ユーザーの入力やフィールドによってはここでは記載されていない追加のフィールドがある場合があります。

### 承認ヘッダー
{: #accept-header }

API リクエスト時は、承認ヘッダーを指定することをお勧めします。 多くの API エンドポイントはデフォルトで JSON を返しますが、一部のエンドポイント (主に API v1) は、承認ヘッダーが指定されていない場合は EDN を返します。

フォーマットされた JSON を返すには、以下の例のように、 `text/plain` ヘッダーを記述します。

```sh
curl --header "Circle-Token: $CIRCLECI_TOKEN" \
  --header 'Accept: text/plain'    \
  https://circleci.com/api/v2/project/{project-slug}/pipeline
```

圧縮した JSON を返す場合は、

```sh
curl --header "Circle-Token: $CIRCLECI_TOKEN" \
  --header 'Accept: application/json'    \
  https://circleci.com/api/v2/project/{project-slug}/pipeline
```

## API の利用開始
{: #getting-started-with-the-api }

CircleCI API は、リポジトリ名でプロジェクトを識別する点で以前のバージョンの API と共通しています。 たとえば、CircleCI から GitHub リポジトリ (https://github.com/CircleCI-Public/circleci-cli) に関する情報を取得する場合、CircleCI API ではそのリポジトリを `gh/CircleCI-Public/circleci-cli` と表現します。これは、プロジェクトのタイプ (VCS プロバイダ)、組織名 (またはユーザー名)、リポジトリ名から成り、「トリプレット」と呼ばれます。

プロジェクトのタイプには、`github` や `bitbucket`、または短縮形の `gh` または `bb` が使用できます。 `organization` には、お使いのバージョン管理システムにおけるユーザー名または組織名を指定します。

API では、`project_slug` というトリプレットの文字列表現が導入されており、以下のような形式をとります。

```
{project_type}/{org_name}/{repo_name}
```

`project_slug` は、プロジェクトに関する情報を取得する際や、ID でパイプラインやワークフローを検索する際に、ペイロードに含めます。 すると、`project_slug` によりプロジェクトについての情報を得ることができます。 将来的には、`project_slug` の形式が変更される可能性もありますが、いかなる場合でも、プロジェクトの識別子として人が判読できる形式で用いられるはずです。

![API structure]({{ site.baseurl }}/assets/img/docs/api-structure.png)

## レート制限
{: #rate-limits }

CircleCI API は、システムの安定性を確保するためのレート制限措置により保護されています。 弊社は、すべてのユーザーに公平なサービスを提供するために、個々のユーザーによるリクエストや個々のリソースに対するリクエストを制限する権利を有しています。

CircleCI と API の統合のオーサーとして、統合が抑制されることを想定し、失敗に対して安全な対応をする必要があります。 API の各部分に異なる保護と制限が設定されています。 CircleCI では特に、**突然のトラフィックの急増**や頻繁なポーリングなどの**持続的な大量のリクエスト**から API を保護します。

HTTP API の場合、リクエストが抑制されると [HTTP ステータスコード 429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) が表示されます。 統合により抑制されたリクエストの完了が要求される場合は、指数関数的バックオフを使用して、遅延後にこれらのリクエストを再試行する必要があります。 多くの場合、HTTP 429 レスポンスコードには、 [Retry-After HTTPヘッダー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After)が付与されています。 このヘッダーが付与されている場合は、リクエストを再試行する前にヘッダー値が指定する期間統合を待つ必要があります。

## エンドツーエンドの API リクエスト例
{: #example-end-to-end-api-request }

このセクションでは、API 呼び出しを行うために必要な手順を最初から最後まで詳しく説明します。 ここでは、"hello-world "という "デモ用リポジトリ "を作成しますが、既存のリポジトリを使用しても構いません。

**注意:** API 呼び出しの多くは、[上記](#getting-started-with-the-api)の `{project-slug}` トリプレットを使用しています。

### 前提条件
{: #prerequisites }

{:.no_toc}

* GitHub または BitBucket のアカウント及び CircleCI で設定するレポジトリが必要です。
* CircleCI のオンボーディングが完了している必要があります。

### 手順
{: #steps }
{:.no_toc}

1. VCS プロバイダー上で、リポジトリを作成します。 この例のリポジトリ名は `hello-world` とします。

2. 次に、CircleCI での新規プロジェクトのオンボーディングを行います。 オンボーディングにアクセスするには、アプリケーションのサイドバーにある [Add Projects (プロジェクトの追加)] をクリックするか、リンク： https://onboarding.circleci.com/project-dashboard/{VCS}/{org_name}を開きます。ここでは、 `VCS` には `github` (または `gh`) 、または `bitbucket` (または `bb`) を、 `org_name` には、組織名または個人の VCS ユーザー名を指定します。 オンボーディングリストでプロジェクトを見つけ、[Setup Project (プロジェクトのセットアップ)]をクリックします。 オンボーディングが完了すると、有効な `config.yml` ファイルが、リポジトリのルートにある `.circleci` フォルダーに作成されます。 この例では、 `config.yml` には以下の内容が含まれます。

    ```yaml
    # 最新の CircleCI パイプライン プロセスエンジンの 2.1 バージョンを使用します。 See: https://circleci.com/docs/2.0/configuration-reference
    version: 2.1
    # Orb という設定パッケージを使用します。
    orbs:
      # welcome-orb で依存関係を宣言します。
      welcome: circleci/welcome-orb@0.4.1
      # 一連のジョブのオーケストレーションまたはスケジューリングをします。
      workflows:
      # ワークフロー名を "welcome"にします。
      welcome:
      # コンテナで  welcome/run ジョブを実行します。 
        jobs:
        - welcome/run
    ```

3. [パーソナル API トークン](https://circleci.com/account/api)のページで API トークンを追加します。 APIトークンを生成した後は、必ず書き留めて安全な場所に保管してください。

4. `curl` を使って API トークンをテストし、動作に問題がないことを確認しましょう。 次のコードスニペットは、プロジェクトのすべてのパイプラインを照会する例です。 以下の例では、中括弧内の値（`{}`）を、ユーザー名／組織名に応じた値に置き換える必要があります。

    ```sh
    # まず、CircleCI トークンを環境変数として設定します。
     export CIRCLECI_TOKEN={your_api_token}

    curl --header "Circle-Token: $CIRCLECI_TOKEN" \
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

    いいですね！ ここまですべて順調でありますように。 ここからはより便利な機能の実行に移りましょう。

5. CircleCI API v2 の利点の一つは、パラメータを使ってパイプラインをリモートでトリガーできることです。 次のコードスニペットでは、 本文のパラメーターなしで `curl` を使ってパイプラインを簡単にトリガーします。

    ```sh
    curl -X POST https://circleci.com/api/v2/project/{project-slug}/pipeline \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLECI_TOKEN" \

    # 以下を返します。
    {
      "number": 2,
      "state": "pending",
      "id": "e411ea74-c64a-4d60-9292-115e782802ed",
      "created_at": "2020-01-15T15:32:36.605Z"
    }
    ```

    これだけでも便利ですが、この POST リクエストを送信する際にパイプラインのパラメーターをカスタマイズできるようにしたいと思います。 本文のパラメーターを`curl`リクエストに含めることにより ( `-d` を使用)、パイプラインの実行時にパイプラインの特定の属性（パイプラインパラメータ、ブランチ、 git タグ）をカスタマイズできます。 以下の例では、"my-branch " に対してトリガーするようパイプラインに指示しています。

    ```sh
    curl -X POST https://circleci.com/api/v2/project/{project-slug}/pipeline \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLE_TOKEN" \
    -d '{ "branch": "bar" }'
    ```

6. 次に、より複雑な例を見てみましょう。パイプラインをトリガーして、設定に動的に置換できるパラメータを渡します。 この例では、docker-executor キーに docker image タグを渡します。 まず、 `.circleci/config.yml` を、オンボーディングにより提供される標準の「Hello World」サンプルよりも少し複雑なものに変更する必要があります。

    ```yaml
    version: 2.1
    jobs:
      build:
        docker:
          - image: "circleci/node:<< pipeline.parameters.image-tag >>"
            auth:
              username: mydockerhub-user
              password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
        environment:
          IMAGETAG: "<< pipeline.parameters.image-tag >>"
        steps:
          - run: echo "Image tag used was ${IMAGETAG}"
    parameters:
      image-tag:
        default: latest
        type: string

    ```

    API から受け取るパラメーターを宣言する必要があります。 ここでは、`parameters` キーの配下に、 _新しいパイプラインのトリガー_ のエンドポイントへの POST リクエストの JSON ペイロードで想定される「イメージタグ」を定義しています。

7. これで、以下のように POST リクエストで変数を渡す `curl` リクエストを実行できるようになりました。

    ```sh
    curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
      "parameters": {
        "image-tag": "4.8.2"
      }
    }' https://circleci.com/api/v2/project/{project-slug}/pipeline
    ```

v2 API を使用したエンドツーエンドの例は以上です。 他のエンドポイントに関する詳細な情報は、現在利用可能なすべての エンドポイントの概要が書かれた [CircleCI API v2 のドキュメント]({{site.baseurl}}/api/v2) を参照してください。

## その他の API 使用例
{: #additional-api-use-cases }

エンドツーエンドの API リクエスト例とその説明を通じて CircleCI API v2 サービスがどのように機能するかを大まかに理解したところで、API を使用する際に定期的に行う可能性のあるいくつかの一般的なタスクや操作を見てみましょう。 ジョブやプロジェクトに関する情報を返したい場合やプロジェクトのアーティファクトを確認してより詳細な情報を取得したい場合など、以下の例を参考にすることで、サーバーに API リクエストを行う方法や作業の詳細をより深く理解することができます。

### 前提条件
{: #prerequisites }
{:.no_toc}


このセクションの API 呼び出し行う前に、以下の前提条件を満たしていることを確認してください。

* GitHub または BitBucket のアカウントの設定が完了し、CircleCI で使用するレポジトリがある
* CircleCI のオンボーディングとプロジェクトの設定が完了している
* パーソナル API トークンがあり、サーバーへの呼び出しを行う認証を受けている

このセクションでは、以下のタスクや操作を行うための詳細情報を説明します。

* [プロジェクトの詳細を得る](#get-project-details)
* [仕事の詳細を得る](#get-job-details)
* [アーティファクトのダウンロード](#download-artifacts)
* [インサイトの収集](#gather-insights)

### プロジェクトの詳細を得る
{: #get-project-details }
{:.no_toc}

プロジェクトが帰属する組織の名前や、プロジェクトをホストするバージョンコントロールシステム（vcs）など、特定のプロジェクトに関する情報を取得できればと思うことがあるでしょう。 CircleCI API では、 `project/{project-slug}` エンドポイントに `project-slug` パラメータを渡して GET リクエストを一度行うことにより、 このような情報やその他の情報を返すことができます。

この API 呼び出しを行う際に、 `project-slug` という新しい概念があることに気づかれるかもしれません。 `project-slug` は、次のような形式の「トリプレット」です。

```
{project_type}/{org_name}/{repo_name}
```

`project_slug` は、プロジェクトの情報をプルする際のペイロードに含まれ、特定のプロジェクトの詳細な情報を取得することができます。

**注意:** プロジェクトのさらに詳細な情報を知りたい場合や、プロジェクトの仕様を更新したい場合は、CircleCI [プロジェクト](https://circleci.com/docs/2.0/projects/) のページを参照してください。

#### 手順
{: #steps }
{:.no_toc}

Of the several project-related API endpoints available with CircleCI API v2, making a GET request to the `/project/{project-slug}` endpoint enables you to return detailed information about a specific project by passing the `project_slug` parameter with your request.

**Note:** whenever you see curly brackets `{}`, this represents a variable that you must manually enter in the request.

To return project details, perform the following steps:

1. For this GET API call, under the `parameters` key, define the `project_slug` (<project_type>/<org_name>/<repo_name>) parameter you want returned in the JSON payload in your `curl` request as follows:

    ```sh
      curl -X GET https://circleci.com/api/v2/project/{project_slug} \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json' \
        --header "Circle-Token: $CIRCLE_TOKEN" \
    ```

2. After passing the `project-slug` parameter and making the API request, you will receive unformatted JSON text similar to the example shown below.

    ```json
    {
      "slug": "gh/CircleCI-Public/api-preview-docs",
      "name": "api-preview-docs",
      "organization_name": "CircleCI-Public",
      "vcs_info": {
        "vcs_url": "https://github.com/CircleCI-Public/api-preview-docs",
        "provider": "Bitbucket",
        "default_branch": "master"
      }
    }
    ```

Notice in the example above that you will receive very specific information about your project, including the name of the project, the name of the organization that the project belongs to, and information about the VCS that hosts the project. For a more detailed breakdown of each value returned in this request, please refer to the [Get Project Details](https://circleci.com/docs/api/v2/#get-a-project) section of the *CircleCI API v2 Reference Guide*.

### Get job details
{: #get-job-details }

Of the several Jobs-related API endpoints available with CircleCI API v2, there is a specific endpoint you may wish to call to receive detailed information about your job. This API call to the `GET /project/{project_slug}/job/{job-number}`endpoint enables you to return detailed information about a specific job by passing the `project-slug` and `job-number` parameters with your request.

Please remember, jobs are collections of steps. Each job must declare an executor that is either `docker`, `machine`, `windows` or `macos`. `machine` includes a default image if not specified, for `docker` you must specify an image to use for the primary container, for `macos` you must specify an Xcode version, and for `windows` you must use the Windows orb.

#### Steps
{: #steps }
{:.no_toc}

Now that you have a general understanding of how the CircleCI API v2 service works through an end-to-end API example request and walkthrough, let's look at a few common tasks and operations you may perform on a regular basis when using the API. Much like the Get Project Details API request described in the previous example, the Get Job Details API request enables you to return specific job information from the CircleCI API by making a single API request. This API call to the `GET /project/{project_slug}/job/{job-number}`endpoint enables you to return detailed information about a specific job by passing the `project-slug` and `job-number` parameters with your request.

**Note** In this example, please note that whenever you see curly brackets `{}`, this represents a variable that you must manually enter in the request.

To return job details, perform the following steps:

1. For this GET API call, under the `parameters` key, define the `project_slug` and `job_number` parameters you want returned in the JSON payload in your `curl` request as follows:

    ```sh
      curl -X GET https://circleci.com/api/v2/project/{project_slug}/job/{job_number} \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json' \
        --header "Circle-Token: $CIRCLE_TOKEN" \
    ```

2. After passing the parameters and making the API request, you will receive unformatted JSON text similar to the example shown below.

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

Notice in the example above that you will receive very specific information about your job, including specific project and workflow details for the job, the date and time the job started and then finished, and job-specific information such as the executor type used, current status of the job, and the duration of the job.

For a more detailed breakdown of each value returned in this request, please refer to the [Get Job Details](https://circleci.com/docs/api/v2/#get-job-details) section of the *CircleCI API v2 Reference Guide*.

### Download artifacts
{: #download-artifacts }

The following section details the steps you need to follow to download artifacts that are generated when a job is run, first, returning a list of artifacts for a job, and then downloading the full set of artifacts. If you are looking for instructions for downloading the _latest_ artifacts for a pipeline, without needing to specify a job number, see our [API v1.1 guide](https://circleci.com/docs/2.0/artifacts/#downloading-all-artifacts-for-a-build-on-circleci) – keep checking back here as this functionality will be added to API v2 in the future.

#### Steps
{: #steps }
{:.no_toc}



1. First, we will ensure your API token is set as an environment variable. You maybe have already done this during authentication, but if not, run the following command in your terminal, substituting your personal API token:

    ```
    export CIRCLECI_TOKEN={your_api_token}
    ```

2.  Next, retrieve the job number for the job you want to get artifacts for. You can find job numbers in the UI - either in the breadcrumbs on the Job Details page, or in the URL.

    ![Job Number]({{ site.baseurl }}/assets/img/docs/job-number.png)

3.  Next, use the `curl` command to return a list of artifacts for a specific job.

    ```sh
    curl -X GET https://circleci.com/api/v2/project/{project-slug}/{job_number}/artifacts \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLECI_TOKEN"
    ```

    You should get a list of artifacts back - if the job you selected has artifacts associated with it. Here's an extract from the output when requesting artifacts for a job that builds these docs:

    ```
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

4. Next, you may extend this API call to download the artifacts. Navigate to the location you would like to download the artifacts to, and run the following command, remembering to substitute your own values in the request:

     ```sh
    curl -X GET https://circleci.com/api/v2/project/{project-slug}/{job_number}/artifacts \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | grep -o 'https://[^"]*' \
    | wget -v -i -
    ```

    **Note:** `grep` is used to locate all the URLs for downloading the job artifacts, while `wget` is used to perform the download.

### Gather insights
{: #gather-insights }

The CircleCI API v2 also includes several endpoints that enable you to retrieve detailed insights into your workflows and individual jobs. By making API calls to these endpoints, you can better understand how to optimize your workflows and jobs so you can increase workflow performance while minimizing credit usage and consumption. The example below describes how you can return information about a single workflow containing information about metrics and credit usage.

#### Returning workflow metrics
{: #returning-workflow-metrics }
{:.no_toc}

To return aggregated data for an individual workflow, perform the steps listed below.

**Note:** whenever you see curly brackets `{}`, this represents a variable that you must manually enter in the request.

1. For this GET API call, under the `parameters` key, define the `project_slug` in your `curl` request as follows:

    ```sh
    curl -X GET https://circleci.com/api/v2/insights/{project-slug}/workflows
    --header 'Content-Type: application/json'
    --header 'Accept: application/json'
    --header "Circle-Token: $CIRCLECI_TOKEN"
    ```
2. After you have defined the `project-slug` and made the API request, you will receive unformatted JSON text similar to the example shown below.

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

Notice that in this JSON response, you will receive detailed metrics for the set of workflows that were run, including:

- `success_rate` - The ratio of successful runs (only those with a "success" status) over the total number of runs (any status) in the aggregation window.
- `total_runs` - The total number of runs that were performed.
- `failed_runs` - The number of runs that failed.
- `successful_runs` - The number of runs that were successful.
- `throughput` - The average number of builds per day.
- `mttr` - The Mean Time to Recovery (MTTR). This is the average time it takes, when a CI build fails, to get it back to a "success" status.
- `duration_metrics` - A collection of specific metrics and measurements that provide the duration of the workflow, which includes `min`, `max`, `median`, `mean`, `p95`, and `standard_deviation`.
- `total credits used` - The total number of credits that were used during the build.
- `windows_start & windows_end` - The time the build was initiated, and then completed.

**Note** The above example only shows just a few builds. When you run this command, you may receive up to 250 individual builds that you can review in much more detail.

#### Reviewing individual job metrics
{: #reviewing-individual-job-metrics }
{:.no_toc}

Now that you have retrieved aggregated data for up to 250 different jobs, you will most likely want to review specific information about a single job, or smaller number of jobs, to ensure that your jobs are running efficiently. To review an individual job, follow the steps below.

1. Using your `project-slug` from the previous API call you made to return workflow data, make a GET API call to the following insights endpoint:

    ```sh
    curl -X GET https://circleci.com/api/v2/insights/{project-slug}/workflows/builds
    --header 'Content-Type: application/json'
    --header 'Accept: application/json'
    --header "Circle-Token: $CIRCLECI_TOKEN"
    ```
4. Once you call this insights endpoint, you will receive a JSON output similar to the example shown below.

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

When reviewing each individual review job, please note that the following information returned for each job:

- `id` - The ID associated with the individual job.
- `status` - The status of the job.
- `duration` - The total time of the job, in seconds.
- `created_at` - The time the job started.
- `stopped_at` - The time the job ended.
- `credits_used` - The number of credits used during the job.

## Reference
{: #reference }

- Refer to [API V2 Introduction]({{site.baseurl}}/2.0/api-intro/) for high-level information about the CircleCI V2 API.
- Refer to [API V2 Reference Guide]({{site.baseurl}}/api/v2/) for a detailed list of all endpoints that make up the CircleCI V2 API.
