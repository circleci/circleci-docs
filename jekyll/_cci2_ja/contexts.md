---
layout: classic-docs
title: "コンテキストの使用"
short-title: "コンテキストの使用"
description: "プロジェクト間で共有できる安全なリソース"
order: 41
version:
  - Cloud
  - Server v3.x
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

{:.tab.contextsimage.Server_3}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_2}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_server.png)

To use environment variables set on the Contexts page, the person running the workflow must be a member of the organization for which the context is set.

Context names must be unique for each GitHub or Bitbucket organization.

**Note:** Contexts created with the initial default name of `org-global` will continue to work.

### CircleCI がプライベート サーバーにインストールされる場合のコンテキストの命名規則
{: #context-naming-for-circleci-server }
{:.no_toc}

For any GitHub Enterprise (GHE) installation that includes multiple organizations, the context names across those organizations must be unique. For example, if your GHE is named Kiwi and includes two organizations, you cannot add a context called `deploy` to both organizations. That is, the `deploy` context name cannot be duplicated in two orgs that exist in the same GHE installation for the Kiwi account. Duplicate contexts within an account will fail with an error.

### Organization とリポジトリの名称変更
{: #renaming-orgs-and-repositories }

If you find you need to rename an org or repo that you have previously hooked up to CircleCI, best practice is to follow these steps:

1. VCS 上で Organization 及びリポジトリの名称を変更します。
2. Head to the CircleCI application, using the new org/repo name, for example,  `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`.
3. CircleCI のプラン、プロジェクト一覧、各種設定が正しく引き継がれていることを確認します。
4. 必要な場合、上記 3 の確認後、古い Org 名/リポジトリ名を再利用し新しい Org/リポジトリを作成します。

    **注意**: 上記の手順で変更を行わない場合、**環境変数**、**コンテキスト**を含む、 Organization およびレポジトリの設定が失われる可能性があります。

## コンテキストの作成と使用
{: #creating-and-using-a-context }

1. CircleCI のアプリケーション上で、サイドバーのリンクから [Organization Settings (Organization の設定)] ページに遷移します。

    **メモ:** 原則として、コンテキストの作成は任意の Organization のメンバーができますが、セキュリティ グループの指定による制限付きコンテキストの構成は Organization の管理者しかできません。 なお、 VCS に BitBucket を使用している場合例外的に、その他の権限の保有状況にかかわらず対象 Workspace 配下でのレポジトリ作成の権限が必要です。

    ![Contexts]({{ site.baseurl }}/assets/img/docs/org-settings-contexts-v2.png)

    **Note**: If you are using CircleCI server, Organization Settings can still be accessed as normal using the **Settings** link in the main navigation.

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

{:.tab.contexts.Server_3}
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
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: "echo environment variables from org-global context"
          command: echo $MY_ENV_VAR
```

{:.tab.contexts.Server_2}
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
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: "echo environment variables from org-global context"
          command: echo $MY_ENV_VAR
```

### コンテキストを使用するリポジトリの移動
{: #moving-a-repository-that-uses-a-context }

If you move your repository to a new organization, you must also have the context with that unique name set in the new organization.

### コンテキストと環境変数の技術上の制約
{: #contexts-and-environment-variables-constraints }

When creating contexts/environment variables, please note the following:

- コンテキスト名は 200 字以下である必要あります。 また、 1 つ以上の非空白文字を含んでいる必要があり、改行を含まず、かつ先頭および末尾は非空白文字である必要があります。
- 環境変数名は 300 字以下である必要があります。 先頭は英字もしくは `_` である必要があり、残りの部分は英字、数字、 `_` で構成されている必要があります。
- 環境変数の値の長さは 3,200 半角英数字相当以下である必要があります。
- 環境変数の値は空でも問題ありません。
- 1 コンテキストあたりの環境変数の個数は上限が 100 に設定されています。
- 1 Organization あたりのコンテキストの個数は上限が 500 に設定されています。

## 複数のコンテキストの統合
{: #combining-contexts }

You can combine several contexts for a single job by just adding them to the context list. Contexts are applied in order, so in the case of overlaps, later contexts override earlier ones. This way you can scope contexts to be as small and granular as you like.

## コンテキストの制限
{: #restricting-a-context }

CircleCI enables you to restrict secret environment variables at run time by adding security groups to contexts. Only organization administrators may add *security groups* to a new or existing context. Security groups are your organization's GitHub teams. If you are using CircleCI server v2.x with LDAP authentication, then LDAP groups also define security groups. After a security group is added to a context, only members of that security group who are also CircleCI users may access the context and use the associated environment variables.

Organization administrators have read/write access to all projects and have unrestricted access to all contexts.

The default security group is `All members` and enables any member of the organization who uses CircleCI to use the context.

**Note:** Bitbucket repositories do **not** provide an API that allows CircleCI contexts to be restricted, only GitHub projects include the ability to restrict contexts with security groups.

### 制限付きコンテキストを使用したワークフローの実行
{: #running-workflows-with-a-restricted-context }

To invoke a job that uses a restricted context, a user must be a member of one of the security groups for the context and must sign up for CircleCI. If the user running the workflow does not have access to the context, the workflow will fail with the `Unauthorized` status.

### コンテキストを使用できるセキュリティ グループの制限
{: #restrict-a-context-to-a-security-group-or-groups }

You must be an organization administrator to complete the following task.

1. CircleCI アプリケーションで [Organization Settings (Organization の設定)] > [Contexts (コンテキスト)] ページに移動します。 すると、コンテキストのリストが表示されます。 セキュリティ グループはデフォルトで `All members` に設定され、組織内のすべてのユーザーにそのコンテキストを含むジョブの実行が許可されます。
2. [Create Context (コンテキストを作成)] ボタンをクリックして新しいコンテキストを作成するか、既存のコンテキストの名前をクリックします。
3. [Add Security Group (セキュリティ グループを追加)] ボタンをクリックします。 すると、ダイアログ ボックスが表示されます。
4. コンテキストに追加する GitHub の Team または LDAP グループを選択し、[Add (追加)] ボタンをクリックします。 これで、選択したグループのみがコンテキストを使用できるように制限されます。
5. まだコンテキストに環境変数が追加されていない場合は、[Add Environment Variables (環境変数を追加)] をクリックして環境変数を指定し、[Add (追加)] ボタンをクリックします。 これで、セキュリティ グループのメンバーのみ、設定された環境変数を使用できるようになります。
6. CircleCI アプリケーションで、[Organization Settings (Organization の設定)] > [Contexts (コンテキスト)] に移動します。 セキュリティ グループが、コンテキストの [Security (セキュリティ)] の列に表示されます。

Only members of the selected groups may now use the context in their workflows or add or remove environment variables for the context.

### コンテキストの制限の変更
{: #making-changes-to-context-restrictions }

Changes to security group restrictions for Contexts might not take effect immediately due to caching. To make sure settings are applied immediately, it is best practice for the Org Administrator to refresh permissions once the change has been made. The **Refresh Permissions** button can be found on the [Account Integrations](https://app.circleci.com/settings/user) page.

Administrators of CircleCI server installations can find the **Refresh Permissions** button at `<circleci-hostname>/account`.

### 制限付きコンテキストと承認ジョブの組み合わせ
{: #approving-jobs-that-use-restricted-contexts }
{:.no_toc}

Adding an [approval job]({{ site.baseurl }}/2.0/configuration-reference/#type) to a workflow gives the option to require manual approval of the use of a restricted context. To restrict running of jobs that are downstream from an approval job, add a restricted context to those downstream jobs, as shown in the example below:

{:.tab.approvingcontexts.Cloud}
```yaml
version: 2.1

# Jobs declaration for build, test and deploy not displayed

workflows:
  jobs:
    build-test-deploy:
      - build
      - test:
          context: my-restricted-context
          requires:
            - build
      - hold:
          type: approval # presents manual approval button in the UI
          requires:
            - build
      - deploy:
          context: deploy-key-restricted-context
          requires:
            - build
            - hold
            - test
```

{:.tab.approvingcontexts.Server_3}
```yaml
version: 2.1

# Jobs declaration for build, test and deploy not displayed

workflows:
  jobs:
    build-test-deploy:
      - build
      - test:
          context: my-restricted-context
          requires:
            - build
      - hold:
          type: approval # presents manual approval button in the UI
          requires:
            - build
      - deploy:
          context: deploy-key-restricted-context
          requires:
            - build
            - hold
            - test
```

{:.tab.approvingcontexts.Server_2}
```yaml
version: 2

# Jobs declaration for build, test and deploy not displayed

workflows:
  jobs:
    build-test-deploy:
      - build
      - test:
          context: my-restricted-context
          requires:
            - build
      - hold:
          type: approval # presents manual approval button in the UI
          requires:
            - build
      - deploy:
          context: deploy-key-restricted-context
          requires:
            - build
            - hold
            - test
```

In this example, the jobs `test` and `deploy` are restricted, and `deploy` will only run if the user who approves the `hold` job is a member of the security group assigned to the context and `deploy-key-restricted-context`. When the workflow `build-test-deploy` runs, the jobs `build` and `test` will run, then the `hold` job, which presents a manual approval button in the CircleCI application. This approval job may be approved by _any_ member of the project, but the `deploy` job will fail as `unauthorized` if the "approver" is not part of the restricted context security group.

## コンテキストからのグループの削除
{: #removing-groups-from-contexts }

To make a context available only to the administrators of the organization, you may remove all of the groups associated with a context. All other users will lose access to that context.

## チームおよびグループへのユーザーの追加と削除
{: #adding-and-removing-users-from-teams-and-groups }

CircleCI syncs GitHub team and LDAP groups every few hours. If a user is added or removed from a GitHub team or LDAP group, it will take up to a few hours to update the CircleCI records and remove access to the context.

## 制限付きコンテキストへの環境変数の追加と削除
{: #adding-and-removing-environment-variables-from-restricted-contexts }

Addition and deletion of environment variables from a restricted context is limited to members of the context groups.

## コンテキストの削除
{: #deleting-a-context }

If the context is restricted with a group other than `All members`, you must be a member of that security group to complete this task:

1. Organization の管理者として、CircleCI アプリケーションの [Organization Settings (Organization の設定)] > [Contexts (コンテキスト)] ページに移動します。

2. 削除するコンテキストの [Delete Context (コンテキストを削除)] ボタンをクリックします。 確認ダイアログ ボックスが表示されます。

3. 「Delete」と入力し、[Confirm (確認)] をクリックすると、 コンテキストと、そのコンテキストに関連付けられたすべての環境変数が削除されます。 **注意:** 削除したコンテキストがいずれかのワークフロー内のジョブで使用されていた場合、そのジョブは動作しなくなり、エラーが表示されます。

## 環境変数の使用方法
{: #environment-variable-usage }

Environment variables are used according to a specific precedence order, as follows:

1. `FOO=bar make install` のような例を含め、`run` ステップの[シェル コマンド内]({{ site.baseurl }}/ja/2.0/env-vars/#シェル-コマンドでの環境変数の設定)で宣言された環境変数
2. [`run` ステップで]({{ site.baseurl }}/ja/2.0/env-vars/#ステップでの環境変数の設定) `environment` キーを使用して宣言された環境変数
3. [ジョブで]({{ site.baseurl }}/2.0/env-vars/#ジョブでの環境変数の設定) `environment` キーを使用して設定された環境変数
4. [環境変数の使用]({{ site.baseurl }}/ja/2.0/env-vars/#定義済み環境変数)で説明されている定義済みの CircleCI 特有の環境変数
5. コンテキストで設定されている環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合)
6. [Project Settings (プロジェクトの設定)] ページで設定された[プロジェクトレベル]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクトでの環境変数の設定)の環境変数

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the Contexts page will take precedence over variables added on the Project Settings page.


### 安全な環境変数の作成、削除、ローテーション
{: #secure-environment-variable-creation-deletion-and-rotation }

This section will walk through interacting with context environment variables using the CircleCI CLI or API.

#### 環境変数の作成
{: #creating-environment-variables }

##### CircleCI CLI 経由
{: #using-circlecis-cli }
{:.no_toc}

_If this is your first time using the CLI, follow the instructions on [CircleCI CLI Configuration](https://circleci.com/docs/2.0/local-cli/?section=configuration) to set up your CircleCI command line interface._

To create an environment variable using our CLI, perform the following steps:

1. If you have not already done so, find the right context name that will contain the new environment variable. Execute this command in the CLI: `circleci context list <vcs-type> <org-name>`
2. 新しい環境変数を対象コンテキスト配下に保存します。 下記コマンドを実行します: `circleci context store-secret <vcs タイプ> <org 名> <コンテキスト名> <環境変数名>`

Note that the CLI will prompt you to input the secret value, rather than accepting it as an argument. This approach is designed to avoid unintentional secret exposure.

##### CircleCI API 経由
{: #using-circlecis-api }
{:.no_toc}

To create an environment variable using the API, call the [Add Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) endpoint with the appropriate request body. For this request, replace the `context-id` and the `env-var-name` with the ID for the context and the new environment variable name. The request body should include a `value` key containing the plaintext secret as a string.

#### 環境変数の削除
{: #deleting-environment-variables }

##### CircleCI CLI 経由
{: #using-circlecis-cli }
{:.no_toc}

To delete an environment variable using the CLI, perform the following steps:

1. 必要に応じて、環境変数を削除しようとするコンテキストの名称を確認します。 下記コマンドを実行します: `circleci context list <vcs タイプ> <org 名>`

2. 当該コンテキスト内のローテーションの対象である環境変数を確認します。 下記コマンドを実行します: `circleci context show <vcs タイプ> <org 名> <コンテキスト名>`

3. 下記コマンドを実行し、実際に環境変数を削除します: `circleci context remove-secret <vcs-type> <org 名> <コンテキスト名> <環境変数名>`

##### CircleCI API 経由
{: #using-circlecis-api }
{:.no_toc}

To delete an environment variable using the API, call the [Delete Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) endpoint.

For this request, replace the `context-id` and the `env-var-name` with the ID for the context and the environment variable name that should be updated.

#### 環境変数のローテーション
{: #rotating-environment-variables }

Rotation refers to the process of updating a secret's value without deleting it or changing its name.

Because environment variables can be shared, passed around between employees and teams, and exposed inadvertently, it is always good practice to periodically rotate secrets. Many organizations automate this process, running a script when an employee leaves the company or when a secret may have been compromised.

Context environment variables can be rotated using CircleCI’s CLI, or by directly accessing the API.


##### CircleCI CLI 経由
{: #using-circlecis-cli }
{:.no_toc}

_If this is your first time using the CLI, follow the instructions on [CircleCI CLI Configuration](https://circleci.com/docs/2.0/local-cli/?section=configuration) to set up your CircleCI command line interface._

To rotate an environment variable using the CLI, perform the following steps:

1. If you have not already done so, find the context name that contains the variable you would like to rotate. Execute this command in the CLI: `circleci context list <vcs-type> <org-name>`

2. 必要に応じて、環境変数のローテーションを実行しようとするコンテキストの名称を確認します。 下記コマンドを実行します: `circleci context list <vcs タイプ> <org 名>`

3. 必要に応じて、新しい環境変数を設定するコンテキストの名称を確認します。 下記コマンドを実行します: `circleci context list <vcs タイプ> <org 名>`

Note that the CLI will prompt you to input the secret value, rather than accepting it as an argument. This approach is designed to avoid unintentional secret exposure.

##### CircleCI API 経由
{: #using-circlecis-api }
{:.no_toc}

To rotate an environment variable from our API, call the [Update Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) endpoint with the appropriate request body. For this request, replace the `context-id` and the `env-var-name` with the ID for the context and the environment variable name that should be updated. The request body should include a `value` key containing the plaintext secret as a string.


## シークレットのマスキング
{: #secrets-masking }
_Secrets masking is not currently available on self-hosted installations of CircleCI server_

Contexts hold potentially sensitive secrets that are not intended to be exposed. For added security, CircleCI performs secret masking on the build output, obscuring `echo` or `print` output that contains env var values.

The value of the context will not be masked in the build output if:

* コンテキストの値が 4 文字未満
* コンテキストの値が `true`、`True`、`false`、`False` のいずれか

**Note:** Secrets Masking will only prevent the value of the environment variable from appearing in your build output. If your secrets appear elsewhere, such as test results or artifacts, they will not be masked. In addition, the value of the environment variable is still accessible to users [debugging builds with SSH]({{ site.baseurl }}/2.0/ssh-access-jobs).

## 関連項目
{: #see-also }
{:.no_toc}

* [CircleCI Environment Variable Descriptions]({{ site.baseurl }}/ja/2.0/env-vars/)
* [Workflows]({{ site.baseurl }}/ja/2.0/workflows/)
