---
layout: classic-docs
title: "コンテキストの使用"
short-title: "コンテキストの使用"
description: "プロジェクト間で共有できる安全なリソース"
order: 41
version:
  - Cloud
  - Server v2.x
---

コンテキストは、環境変数を保護し、プロジェクト間で共有するためのメカニズムを提供します。 環境変数は、名前と値のペアとして定義され、実行時に挿入されます。 このドキュメントでは、以下のセクションに沿って、CircleCI でコンテキストを作成および使用する方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

コンテキストは、CircleCI アプリケーションの [Organization Settings (Organization の設定)] ページで作成します。 コンテキストを表示、作成、編集するには、対象の Organization のメンバーである必要があります。 コンテキストを作成したら、プロジェクトの [`config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルのワークフロー セクションで `context` キーを適切に設定することで、キーを設定されたジョブに当該コンテキストに関連付けられた環境変数を受け渡すことができます。

{:.tab.contextsimage.Cloud}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_server.png)

[Contexts (コンテキスト)] ページで設定された環境変数を使用するには、ワークフローを実行するユーザーが、コンテキストを設定した Organization のメンバーでなければなりません。

コンテキスト名は、各 GitHub または Bitbucket 上の Organization ごとに一意でなければなりません。

**メモ:** 初期デフォルト名 `org-global` で作成されたコンテキストは、引き続き機能します。

### CircleCI がプライベート サーバーにインストールされる場合のコンテキストの命名規則
{: #context-naming-for-circleci-server }
{:.no_toc}

お使いの GitHub Enterprise (GHE) に複数の組織が含まれる場合、コンテキスト名はそれらの組織間で一意である必要があります。 たとえば、 Kiwi という名前の GHE があり、そこに 2 つの組織が含まれる場合、両方の組織に `deploy` という名前のコンテキストを追加することはできません。 つまり、Kiwi アカウントの同じ GHE に存在する 2 つの Organization 内で、コンテキスト名 `deploy` を重複して使用することはできません。 1 つのアカウント内でコンテキスト名を重複させようとすると、エラーとなって失敗します。

### Organization とリポジトリの名称変更
{: #renaming-orgs-and-repositories }

CircleCI と連携済みの Organization やリポジトリの名称を変更する必要が生じた場合、下記のステップに従うことが推奨されます:

1. VCS 上で Organization 及びリポジトリの名称を変更します。
2. 必要に応じて、環境変数のローテーションを実行しようとするコンテキストの名称を確認します。 下記コマンドを実行します: `circleci context list <vcs タイプ> <org 名>`
3. CircleCI のプラン、プロジェクト一覧、各種設定が正しく引き継がれていることを確認します。
4. 必要な場合、上記 3 の確認後、古い Org 名/リポジトリ名を再利用し新しい Org/リポジトリを作成します。

    **注意**: 上記の手順で変更を行わない場合、**環境変数**、**コンテキスト**を含む、 Organization およびレポジトリの設定が失われる可能性があります。

## コンテキストの作成と使用
{: #creating-and-using-a-context }

1. CircleCI のアプリケーション上で、サイドバーのリンクから [Organization Settings (Organization の設定)] ページに遷移します。

    **メモ:** 原則として、コンテキストの作成は任意の Organization のメンバーができますが、セキュリティ グループの指定による制限付きコンテキストの構成は Organization の管理者しかできません。 なお、 VCS に BitBucket を使用している場合例外的に、その他の権限の保有状況にかかわらず対象 Workspace 配下でのレポジトリ作成の権限が必要です。

    ![Contexts]({{ site.baseurl }}/assets/img/docs/org-settings-contexts-v2.png)

    **Note**: 一部の CircleCI Server では、 [Organization Settings] のページへはナビゲーション バーの [**Settings (設定)**] リンクからアクセスすることができます。

2. [Create Context (コンテキストの作成)] ボタンをクリックし、コンテキストに一意な名前をつけます。 ダイアログ ボックス内の [Create Context (コンテキストの作成)] ボタンをクリックすると、コンテキストが作成され、コンテキストの一覧に表示されます。 このとき、作成されたコンテキストの [Security (セキュリティ)] の列には、当該コンテキストに Organization 内の任意のユーザーがアクセス可能であることを示す `All members (メンバー全員)` の表示が出ます。

3. [Add Environment Variable (環境変数の追加)] ボタンをクリックし、このコンテキストに関連付ける変数の名称とその値を指定します。 設定内容を保存するには [Add Variable (変数の追加)] ボタンをクリックします。

4. 対象プロジェクトの [`config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルの [`workflows`]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows) セクションで、前述の手順で設定した環境変数を使用したいすべてのジョブに対して `context` キーを設定します。 下記の例では、 `run-tests` ジョブは`org-global` コンテキストに設定された環境変数を使用することができます。 クラウド版 CircleCI Cloud をお使いの場合、複数のコンテキストを選択することもできます。 下記のサンプルで例えると、 `run-tests` ジョブは `my-context` コンテキストに設定された環境変数にもアクセスすることができます。

{:.tab.contexts.Cloud}
```yaml
version: 2.1

workflows:
  my-workflow:
    jobs:
      - run-tests:
          context:
            - org-global
            - my-context

jobs:
  run-tests:
    docker:
      - image: cimg/base:2020.01
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキストおよびプロジェクト設定のページで構成された環境変数を参照
    steps:
      - checkout
      - run:
          name: "echo environment variables from org-global context"
          command: echo $MY_ENV_VAR
```

{:.tab.contexts.Server}
```yaml
version: 2.1

workflows:
  my-workflow:
    jobs:
      - run-tests:
          context: org-global

jobs:
  run-tests:
    docker:
      - image: cimg/base:2020.01
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキストおよびプロジェクト設定のページで構成された環境変数を参照
    steps:
      - checkout
      - run:
          name: "echo environment variables from org-global context"
          command: echo $MY_ENV_VAR
```

### コンテキストを使用するリポジトリの移動
{: #moving-a-repository-that-uses-a-context }

リポジトリを別の Organization に移動する際は、新しい Organization でも同じ名前のコンテキストを構成する必要があります。

### コンテキストと環境変数の技術上の制約
{: #contexts-and-environment-variables-constraints }

コンテキストや環境変数を作成する際は、下記に注意してください:

- コンテキスト名は 200 字以下である必要あります。 また、 1 つ以上の非空白文字を含んでいる必要があり、改行を含まず、かつ先頭および末尾は非空白文字である必要があります。
- 環境変数名は 300 字以下である必要があります。 先頭は英字もしくは `_` である必要があり、残りの部分は英字、数字、 `_` で構成されている必要があります。
- 環境変数の値の長さは 3,200 半角英数字相当以下である必要があります。
- 環境変数の値は空でも問題ありません。
- 1 コンテキストあたりの環境変数の個数は上限が 100 に設定されています。
- 1 Organization あたりのコンテキストの個数は上限が 500 に設定されています。

## 複数のコンテキストの統合
{: #combining-contexts }

単一のジョブに対して複数指定することで、コンテキストを統合して使用すること可能です。 コンテキストはコンフィグで指定された順に適用されるため、複数のコンテキストで同じ設定があった場合、後から指定されたコンテキストの設定内容が優先されます。 この性質を使用して、コンテキストの粒度を自在に小さくすることができます。

## コンテキストの制限
{: #restricting-a-context }

CircleCI は、コンテキストにセキュリティ グループを追加することで、実行時にシークレットの環境変数の使用を制限できます。 新規または既存のコンテキストに*セキュリティ グループ*を追加できるのは、組織管理者に限られます。 セキュリティ グループはお使いの GitHub Organization の Team として定義されます。 CircleCI Server を LDAP と組み合わせて使用している場合、 LDAP のグループもセキュリティ グループの定義に使用されます。 セキュリティ グループを設定したコンテキストについては、 CircleCI ユーザーのうち当該セキュリティ グループのメンバーだけが、当該コンテキストにアクセスし、関連付けられた環境変数を使用することができます。

Organization の管理者は、すべてのプロジェクトに対する読み取り・書き込み両方のアクセス権を所有しています。 また、すべてのコンテキストに対する無制限のアクセス権も所有しています。

セキュリティ グループはデフォルトで `All members` に設定されており、対象 Organization に所属する全 CircleCI ユーザーが当該コンテキストを使用できる状態に設定されます。

**注意:** BitBucket はコンテキストの制限に必要な API を公開して**いない**ため、 GitHub を使用しているプロジェクトのみがセキュリティ グループを使用したコンテキストの制限を利用することができます。

### 制限付きコンテキストを使用したワークフローの実行
{: #running-workflows-with-a-restricted-context }

制限付きコンテキストを使用したジョブを呼び出すユーザーは、 CircleCI にサイン アップ済みのユーザーで、かつそのコンテキストに構成されたいずれかのセキュリティ グループのメンバーでなければなりません。 制限付きコンテキストを使用するワークフローをアクセス権の認められていないユーザーが実行しようとすると、当該ワークフローは `Unauthorized` ステータスで失敗します。

### コンテキストを使用できるセキュリティ グループの制限
{: #restrict-a-context-to-a-security-group-or-groups }

以下のタスクを行えるのは、組織管理者のみです。

1. CircleCI アプリケーションで [Organization Settings (Organization の設定)] > [Contexts (コンテキスト)] ページに移動します。 すると、コンテキストのリストが表示されます。 セキュリティ グループはデフォルトで `All members` に設定され、組織内のすべてのユーザーにそのコンテキストを含むジョブの実行が許可されます。
2. [Create Context (コンテキストを作成)] ボタンをクリックして新しいコンテキストを作成するか、既存のコンテキストの名前をクリックします。
3. [Add Security Group (セキュリティ グループを追加)] ボタンをクリックします。 すると、ダイアログ ボックスが表示されます。
4. コンテキストに追加する GitHub の Team または LDAP グループを選択し、[Add (追加)] ボタンをクリックします。 これで、選択したグループのみがコンテキストを使用できるように制限されます。
5. まだコンテキストに環境変数が追加されていない場合は、[Add Environment Variables (環境変数を追加)] をクリックして環境変数を指定し、[Add (追加)] ボタンをクリックします。 これで、セキュリティ グループのメンバーのみ、設定された環境変数を使用できるようになります。
6. CircleCI アプリケーションで、[Organization Settings (Organization の設定)] > [Contexts (コンテキスト)] に移動します。 セキュリティ グループが、コンテキストの [Security (セキュリティ)] の列に表示されます。

これで、選択したグループのメンバーのみが、ワークフローでこのコンテキストを使用したり、このコンテキストに環境変数を追加、削除したりできるようになります。

### コンテキストの制限の変更
{: #making-changes-to-context-restrictions }

コンテキストに設定されたセキュリティ グループ制約の設定の変更は、キャッシュの都合上瞬時に反映されない場合があります。 設定変更を確実かつ瞬時に反映させるためには、管理者はコンテキストの設定変更後 Organization のパーミッション情報の更新作業を実施してください。 **[Refresh Permissions (パーミッション情報の更新)]** ボタンは [Account Integrations (アカウントのインテグレーション)](https://app.circleci.com/settings/user) ページにあります。

CircleCI Server の場合、管理者は **[Refresh Permissions (パーミッション情報の更新)]** ボタンに `<circleci ホスト名>/account` からアクセスできます。

### 制限付きコンテキストと承認ジョブの組み合わせ
{: #approving-jobs-that-use-restricted-contexts }
{:.no_toc}

[承認ジョブ]({{ site.baseurl }}/ja/2.0/configuration-reference/#type) をワークフローに追加することで、制限付きコンテキストの使用を手動で承認するようワークフローを構成することができます。 承認ジョブより下流のジョブの実行を承認ユーザーを基に制限するには、下記例のように、下流のジョブに制限付きコンテキストを設定します。

```yaml
version: 2.1

# build, test, deploy の各ジョブの定義は省略

workflows:
  jobs:
    build-test-deploy:
      - build
      - test:
          context: my-restricted-context
          requires:
            - build
      - hold:
          type: approval # UI 上に手動承認ボタンを表示させる
          requires:
            - build
      - deploy:
          context: deploy-key-restricted-context
          requires:
            - build
            - hold
            - test
```

この例では、 `test` および `deploy` のジョブが制限されており、特に `deploy` ジョブは、承認ジョブ `hold` で承認ボタンを押したユーザーがコンテキスト `deploy-key-restricted-context` に設定されたセキュリティ グループのメンバーである場合にのみ実行されます。 `build-test-deploy` ワークフローが実行されると、 `build`、`テスト` の各ジョブが実行され、そして、 `hold` ジョブが手動承認ボダンを CircleCI アプリケーション上に表示させます。 この承認ジョブは_任意の_プロジェクト メンバーが承認ボタンを押すことができますが、承認者が制限付きコンテキスト `deploy-key-restricted-context` に設定されたセキュリティ グループのメンバーでない場合、 `deploy` ジョブは `unauthorized` ステータスで失敗します。

## コンテキストからのグループの削除
{: #removing-groups-from-contexts }

コンテキストに関連付けられているすべてのグループを削除すると、 Organization の管理者のみがそのコンテキストを使用できるようになります。 他のすべてのユーザーは、そのコンテキストへのアクセス権を失います。

## チームおよびグループへのユーザーの追加と削除
{: #adding-and-removing-users-from-teams-and-groups }

CircleCI では、数時間ごとに GitHub チームおよび LDAP グループとの同期が実行されます。 GitHub チームまたは LDAP グループにユーザーを追加または削除してから、CircleCI のレコードが更新され、コンテキストへのアクセス権が削除されるまでには、数時間を要する場合があります。

## 制限付きコンテキストへの環境変数の追加と削除
{: #adding-and-removing-environment-variables-from-restricted-contexts }

制限付きコンテキストへの環境変数の追加と削除は、コンテキスト グループのメンバーに限定されます。

## コンテキストの削除
{: #deleting-a-context }

コンテキストが `All members` 以外のグループに制限されている場合、指定されたセキュリティ グループのメンバーでなければコンテキストを削除できません。

1. Organization の管理者として、CircleCI アプリケーションの [Organization Settings (Organization の設定)] > [Contexts (コンテキスト)] ページに移動します。

2. 削除するコンテキストの [Delete Context (コンテキストを削除)] ボタンをクリックします。 確認ダイアログ ボックスが表示されます。

3. Type Delete and click Confirm. "Delete" と入力し、[Confirm (確認)] をクリックすると、 コンテキストと、そのコンテキストに関連付けられたすべての環境変数が削除されます。 **注意:** 削除したコンテキストがいずれかのワークフロー内のジョブで使用されていた場合、そのジョブは動作しなくなり、エラーが表示されます。

## 環境変数の使用方法
{: #environment-variable-usage }

環境変数は、以下に示す優先順位に従って使用されます。

1. `FOO=bar make install` のような例を含め、`run` ステップの[シェル コマンド内]({{ site.baseurl }}/ja/2.0/env-vars/#シェル-コマンドでの環境変数の設定)で宣言された環境変数
2. [`run` ステップで]({{ site.baseurl }}/ja/2.0/env-vars/#ステップでの環境変数の設定) `environment` キーを使用して宣言された環境変数
3. [ジョブで]({{ site.baseurl }}/2.0/env-vars/#ジョブでの環境変数の設定) `environment` キーを使用して設定された環境変数
4. [環境変数の使用]({{ site.baseurl }}/ja/2.0/env-vars/#定義済み環境変数)で説明されている定義済みの CircleCI 特有の環境変数
5. コンテキストで設定されている環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合)
6. [Project Settings (プロジェクトの設定)] ページで設定された[プロジェクトレベル]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクトでの環境変数の設定)の環境変数

`FOO=bar make install` のように、`run` ステップのシェル コマンドで宣言された環境変数は、`environment` キーおよび `contexts` キーを使用して宣言された環境変数よりも優先されます。 [Contexts (コンテキスト)] ページで追加された環境変数は、[Project Settings (プロジェクトの設定)] ページで追加された変数よりも優先されます。


### 安全な環境変数の作成、削除、ローテーション
{: #secure-environment-variable-creation-deletion-and-rotation }

このセクションでは、 CircleCI CLI および API を使用してコンテキストに設定された環境変数を操作する方法について説明します。

#### 環境変数の作成
{: #creating-environment-variables }

##### CircleCI CLI 経由
{: #using-circlecis-cli }
{:.no_toc}

_CircleCI の CLI をはじめて使用する場合、最初に [CircleCI CLI の構成](https://circleci.com/docs/ja/2.0/local-cli/?section=configuration#cli-%E3%81%AE%E6%A7%8B%E6%88%90) を参照して CircleCI CLI を構成してください。_

CircleCI CLI を使用して環境変数を作成するには、下記ステップを実行します:

1. 必要に応じて、新しい環境変数を設定するコンテキストの名称を確認します。 下記コマンドを実行します: `circleci context list <vcs タイプ> <org 名>`
2. 新しい環境変数を対象コンテキスト配下に保存します。 下記コマンドを実行します: `circleci context store-secret <vcs タイプ> <org 名> <コンテキスト名> <環境変数名>`

Note that the CLI will prompt you to input the secret value, rather than accepting it as an argument. This approach is designed to avoid unintentional secret exposure.

##### CircleCI API 経由
{: #using-circlecis-api }
{:.no_toc}

API を使用して環境変数を作成する場合は、 [Add Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) エンド ポイントを適切なリクエスト ボディとともに呼び出します。 このリクエストにおいては `context-id` と `env-var-name` をそれぞれコンテキストの ID と新しい環境変数の名前に置き換えます。 リクエスト ボディには、シークレットである環境変数の値をプレーンテキストの文字列としてセットした `value` キーを含める必要があります。 For this request, replace the `context-id` and the `env-var-name` with the ID for the context and the new environment variable name. The request body should include a `value` key containing the plaintext secret as a string.

#### 環境変数の削除
{: #deleting-environment-variables }

##### CircleCI CLI 経由
{: #using-circlecis-cli }
{:.no_toc}

CircleCI CLI を使用して環境変数を削除するには、下記ステップを実行します:

1. If you have not already done so, find the context name that contains the environment variable you wish to delete. Execute this command in the CLI: `circleci context list <vcs-type> <org-name>`

2. 当該コンテキスト内のローテーションの対象である環境変数を確認します。 下記コマンドを実行します: `circleci context show <vcs タイプ> <org 名> <コンテキスト名>`

3. 下記コマンドを実行し、実際に環境変数を削除します: `circleci context remove-secret <vcs-type> <org 名> <コンテキスト名> <環境変数名>`

##### CircleCI API 経由
{: #using-circlecis-api }
{:.no_toc}

API を使用して環境変数を削除する場合は、 [Delete Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) エンドポイントを呼び出します。

このリクエストにおいては `context-id` と `env-var-name` をそれぞれコンテキストの ID と削除しようとする環境変数の名前に置き換えます。

#### 環境変数のローテーション
{: #rotating-environment-variables }

ローテーションとは、環境変数を削除したり変数名を変更したりせずに、 シークレットである環境変数の値を更新することを指します。

Because environment variables can be shared, passed around between employees and teams, and exposed inadvertently, it is always good practice to periodically rotate secrets. Many organizations automate this process, running a script when an employee leaves the company or when a secret may have been compromised.

コンテキストに設定された環境変数のローテーションは、 CircleCI の CLI や API の直接呼び出しにより実施することが可能です。


##### CircleCI CLI 経由
{: #using-circlecis-cli }
{:.no_toc}

_CircleCI の CLI をはじめて使用する場合、最初に [CircleCI CLI の構成](https://circleci.com/docs/ja/2.0/local-cli/?section=configuration#cli-%E3%81%AE%E6%A7%8B%E6%88%90) を参照して CircleCI CLI を構成してください。_

CircleCI CLI を使用して環境変数のローテーションを実行するには、下記ステップを実行します:

1. If you have not already done so, find the context name that contains the variable you would like to rotate. Execute this command in the CLI: `circleci context list <vcs-type> <org-name>`

2. Find the environment variable to rotate within that context. 当該コンテキスト内に削除しようとする環境変数が存在することを確認します。 下記コマンドを実行し、当該コンテキストに設定されている環境変数の一覧を確認します: `circleci context show <vcs タイプ> <org 名> <コンテキスト名>`

3. Update the existing environment variable under that context. 当該コンテキスト内に実在する環境変数の値を実際に更新します。 `環境変数名` を上記ステップ 2 で確認した環境変数名に置き換えたうえで、 下記コマンドを実行します: `circleci context store-secret <vcs タイプ> <org 名> <コンテキスト名> <環境変数名>`

Note that the CLI will prompt you to input the secret value, rather than accepting it as an argument. This approach is designed to avoid unintentional secret exposure.

##### CircleCI API 経由
{: #using-circlecis-api }
{:.no_toc}

API を使用して環境変数のローテーションを実行する場合は、 [Update Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) エンドポイントを適切なリクエスト ボディとともに呼び出します。 このリクエストにおいては `context-id` と `env-var-name` をそれぞれコンテキストの ID と値を更新する環境変数の名前に置き換えます。 リクエスト ボディには、シークレットである環境変数の値をプレーンテキストの文字列としてセットした `value` キーを含める必要があります。 For this request, replace the `context-id` and the `env-var-name` with the ID for the context and the environment variable name that should be updated. The request body should include a `value` key containing the plaintext secret as a string.


## シークレットのマスキング
{: #secrets-masking }
_シークレットのマスキングは一部バージョンの CircleCI Server (セルフ ホステッド版の CircleCI) では利用できません_

Contexts hold potentially sensitive secrets that are not intended to be exposed. セキュリティを強化するために、CircleCI ではビルドの出力に対してシークレットのマスキングを行い、コンテキストの `echo` 出力や `print` 出力を不明瞭なものにします。

以下の場合、コンテキストの値はビルドの出力でマスキングされません。

* コンテキストの値が 4 文字未満
* コンテキストの値が `true`、`True`、`false`、`False` のいずれか

**メモ:** シークレットのマスキングは、ビルドの出力でコンテキストの値が表示されないようにするだけの機能です。 コンテキストの値には、[SSH を使用したデバッグ]({{ site.baseurl }}/ja/2.0/ssh-access-jobs)を行うユーザーがアクセスできます。

## 関連項目
{: #see-also }
{:.no_toc}

* [必要に応じて、環境変数を削除しようとするコンテキストの名称を確認します。 下記コマンドを実行します: `circleci context list <vcs タイプ> <org 名>`]({{ site.baseurl }}/2.0/env-vars/)
* [Workflows]({{ site.baseurl }}/2.0/workflows/)
