---
layout: classic-docs
title: "API v2 の概要"
description: "CircleCI API の概要"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

CircleCI API を使用すると、ユーザー、ジョブ、ワークフロー、パイプラインに関する詳細情報を取得する API を呼び出すことができます。 現在、以下の 2 つのバージョンの API がサポートされています。

* [API v1.1](https://circleci.com/docs/api/v1/)
* [API v2](https://circleci.com/docs/api/v2/)

API v2 には、パイプラインやパイプラインパラメーターのサポートなど、API v1.1 にはない強力な機能が備わっています。 クラウド版 CircleCI をご利用のお客様は、できるだけ早くスクリプトを API v2 の安定したエンドポイントに移行することをお勧めします。

現在 API v1.1 と API v2 がサポートされ、一般公開されています。 CircleCI では、いずれ API v1.1 のサポートを終了し API v2 に切り替える予定です。 CircleCI API v1.1 の廃止時期については、後日お知らせします。

## 概要
{: #overview }

CircleCI API v2 では、API エクスペリエンスを向上させる新しい機能を備えたエンドポイントを使用できるほか、ジョブでの API の使用を最適化することができます。

現在の API v2 の各エンドポイントは、以下のカテゴリに分けられます。

{% include snippets/ja/api-v2-endpoints.md %}

現在 API v2 でサポートされているのは [パーソナル API トークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-personal-api-token) のみです。 [プロジェクトトークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-project-api-token) は、現在 API v2 ではサポートされていません。
{: class="alert alert-info"}

## API v2 の入門ガイド
{: #getting-started-with-the-api-v2 }

**GitLab.com ユーザーの皆様:** このセクションの **プロジェクトスラグ**  の定義および本ドキュメン内で記載されている使用方法は、GitHub プロジェクトと Bitbucket プロジェクトにのみ適用されるためご注意ください。 GitLab プロジェクトでは、現在新しいスラグ形式を使用しています。
<br>
`circleci/:slug-remainder`
<br>
GitLab プロジェクトのプロジェクトスラグは、CircleCI Web アプリでプロジェクトに移動し、ブラウザーのアドレスバーからその文字列を取得することにより確認できます。 スラグはランダムな文字列として扱われ、API リクエストにはスラグ全体が渡される必要があります。 詳細については、[API 開発者向けガイド]({{site.baseurl}}/ja/api-developers-guide) をお読みください。
{: class="alert alert-info"}

CircleCI API v2 は、リポジトリ名でプロジェクトを識別する方法で、以前のバージョンの API との下位互換性を備えています。 たとえば、CircleCI から GitHub リポジトリ (https://github.com/CircleCI-Public/circleci-cli) についての情報を取得する場合、CircleCI API ではそのリポジトリを `gh/CircleCI-Public/circleci-cli` と表現します。 これは、VCS の種類、組織の名前、リポジトリの名前から成り、「トリプレット」と呼ばれます。 VCS の種類としては、`github` または `bitbucket`、短縮形の `gh` または `bb` が使用できます。 この短縮形は API v2 でサポートされるようになりました。 `organization` には、お使いのバージョン管理システムにおけるユーザー名または組織名を指定します。

API v2 では、`project_slug` というトリプレットの文字列表現が導入されており、このプロジェクトスラグは次のような形式をとります。

`<vcs_type>/<org_name>/<repo_name>`

`project_slug` は、プロジェクトに関する情報を取得する際や、ID でパイプラインやワークフローを検索する際に、ペイロードに含めます。 すると、`project_slug` によりプロジェクトについての情報を得ることができます。 将来的には、`project_slug` の形式が変更される可能性もありますが、現在 GitHub プロジェクトと Bitbucket プロジェクトではプロジェクトの識別子として人が判読できる形式が使用できます。

## 認証
{: #authentication }

CircleCI API v2 では、[パーソナル API トークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-personal-api-token)をリクエストの HTTP のヘッダーとして `Circle-Token` という名前でトークンを値として送信することにより、ユーザー認証できます。 コード例については、[開発者向けガイド]({{site.baseurl}}/api-developers-guide)をご覧ください。

#### パラメーターを使用したパイプラインのトリガーの例
{: #triggering-a-pipeline-with-parameters-example }

以下は、パラメーターを使用したパイプラインを `curl` でトリガーするシンプルなコード例です。

```shell
curl -X POST --header "Content-Type: application/json" --header "Circle-Token: $CIRCLE_TOKEN" -d '{
  "parameters": {
    "myparam": "./myspecialdir",
    "myspecialversion": "4.8.2"
  }
}' https://circleci.com/api/v2/project/{project_slug}/pipeline
```

上記の例では、`project_slug` の形式は `:vcs/:org/:project` になります。 たとえば、プロジェクトスラグ `gh/CircleCI-Public/circleci-cli` が、`CircleCI` に対して `circleci-cli` というリポジトリの GitHub 組織「CircleCI-Public」のプロジェクトを使用するよう指示します。

**重要:** パイプラインパラメーターは機密データとしては**扱われない**ため、機密の値 (シークレット) には**使用しないでください**。 機密データの正しい使い方については、[プロジェクト設定]({{site.baseurl}}/ja/settings/)や[コンテキスト]({{site.baseurl}}/ja/glossary/#context)に関するガイドを参照してください。

## エンドポイントの変更
{: #changes-in-endpoints }

CircleCI API v2 リリースで追加されたエンドポイントもあれば、非推奨となったエンドポイントもあります。 下記では、このリリースで追加されたエンドポイントと削除されたエンドポイントをリストにまとめています。

API v2 の全エンドポイントのリストは、[API v2 リファレンスガイド](https://circleci.com/docs/api/v2/)をご覧ください。このガイドには、各エンドポイントの詳細な説明、必須および任意のパラメーターの情報、HTTP ステータスとエラー コード、ワークフローで使用するコード例が記載されています。

### 新しいエンドポイント
{: #new-endpoints }

以下は、今回更新された CircleCI API v2 に追加された新しいエンドポイントです。

| エンドポイント                                                               | 説明                                              |
| --------------------------------------------------------------------- | ----------------------------------------------- |
| `GET /workflow/:id`                                                   | リクエスト内で渡されるパラメーター `id` に基づいて、個々のワークフローが返されます。   |
| `GET /workflow/:id/jobs`                                              | 一意の `id` に基づいて、特定のワークフローに関連付けられているジョブをすべて取得します。 |
| `GET /project/:project_slug`                                          | 一意のスラグにより特定のプロジェクトを取得します。                       |
| `POST /project/:project_slug/pipeline`                                | 一意のスラグにより個々のプロジェクトを取得します。                       |
| `GET /pipeline/:id`                                                   | リクエスト内で渡される `id` に基づいて、個々のパイプラインを取得します。         |
| `GET /pipeline/:id/config`                                            | 特定のパイプラインの設定を取得します。                             |
| `GET /project/:project_slug/pipelines/[:filter]`                      | プロジェクトの最新の一連のパイプラインを取得します。                      |
| `GET /insights/:project-slug/workflows`                               | 各プロジェクトのワークフローのサマリーメトリクスを取得します。                 |
| `GET /insights/:project-slug/workflows/:workflow-name`                | ワークフローの最近の実行を取得します。                             |
| `GET /insights/:project-slug/workflows/:workflow-name/jobs`           | プロジェクトのワークフローのジョブのサマリーメトリクスを取得します。              |
| `GET /insights/:project-slug/workflows/:workflow-name/jobs/:job-name` | ワークフローにおけるジョブの最近の実行を取得します。                      |

### 非推奨のエンドポイント
{: #deprecated-endpoints }

API v2 で非推奨となった v1 のエンドポイントは以下の表のとおりです。

| エンドポイント                                            | 説明                                               |
| -------------------------------------------------- | ------------------------------------------------ |
| `POST /project/:vcs-type/:username/:project`       | 新規ビルドをトリガーします。                                   |
| `POST /project/:vcs-type/:username/:project/build` | このエンドポイントにより、ユーザーはプロジェクトごとに新規ビルドをトリガーできるようになります。 |
| `GET /recent-builds`                               | 最近のビルドの配列を取得します。                                 |

## API v2 および CircleCI Server をご利用のお客様
{: #api-v2-and-server-customers }

API v2 は、CircleCI Server 2.x. ではサポートされていません。 CircleCI Server 3.x. のセルフホスティング環境ではサポートされています。

## 次のステップ

- 認証に関する詳細や API リクエストの例については、[API 開発者向けガイド]({{site.baseurl}}/ja/api-developers-guide) を参照してください。
