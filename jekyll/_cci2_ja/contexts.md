---
layout: classic-docs
title: "コンテキストの使用"
short-title: "コンテキストの使用"
description: "プロジェクト間で共有できる安全なリソース"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

コンテキストは、環境変数を保護し、プロジェクト間で共有するためのメカニズムを提供します。 環境変数は、名前と値のペアとして定義され、実行時に挿入されます。 このドキュメントでは、CircleCI でのコンテキストの作成と使用について説明します。

既存のコンテキスト (または環境変数) があり、組織名やリポジトリ名を変更したい場合は、[組織名およびリポジトリ名の変更]({{site.baseurl}}/ja/rename-organizations-and-repositories)ガイドに従い、変更プロセスの間にコンテキスト (または環境変数) へのアクセスを失わないようにしてください。

## 概要
{: #overview }

コンテキストの作成と管理は、[CircleCI Web アプリ](https://app.circleci.com)の **Organization Settings** のページで行えます。 組織のメンバーでなければ、コンテキストを表示、作成、編集できません。 コンテキストを作成したら以下のイメージのように、プロジェクトの [`.circleci/config.yml`]({{site.baseurl}}/ja/configuration-reference/) ファイルのワークフロー セクションで `context` キーを使って、任意のジョブに当該コンテキストに関連付けられた環境変数へのアクセス権を付与することができます。

{:.tab.contextsimage.Cloud}
![コンテキストの概要]({{site.baseurl}}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_3}
![コンテキストの概要]({{site.baseurl}}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_2}
![コンテキストの概要]({{site.baseurl}}/assets/img/docs/contexts_server.png)

Web アプリの **Contexts** のページで設定した環境変数を使用するには、ワークフローを実行するユーザーが、コンテキストを設定した組織のメンバーでなければなりません。

コンテキスト名は、VCS 組織ごとに一意である必要があります。 デフォルトのコンテキスト名は、`org-global` です。 最初のデフォルト名 `org-global` で作成されたコンテキストは、引き続き機能します。
{: class="alert alert-info" }

## コンテキストの作成と使用
{: #create-and-use-a-context }

1. CircleCI Web アプリで、左側のサイドナビゲーションにある **Organization Settings > Contexts** をクリックします。

    組織のメンバーは、コンテキストを作成することはできますが、特定のセキュリティグループへの制限は組織の管理者しかできません。 この場合の唯一の例外は、Bitbucket 組織です。この組織では、ワークスペースまたは含まれているリポジトリに対する他の権限に関係なく、`create repositories` のワークスペース権限をユーザーに付与する必要があります。

    ![コンテキスト]({{site.baseurl}}/assets/img/docs/org-settings-contexts-v2.png)

    CircleCI Server をご使用の場合は、メインナビゲーションで **Settings** のリンクから **Organization Settings** に通常どおりアクセスすることができます。
    {: class="alert alert-info" }

2. **Create Context** ボタンをクリックして、一意のコンテキスト名を追加します。 ダイアログボックスの **Create Context** ボタンをクリックして確定します。 新しいコンテキストがリストに表示されます。Security は `All members` に設定されており、組織のすべてのユーザーが実行時にこのコンテキストにアクセスできる状態です。

3. リストに作成されている任意のコンテキストをクリックすると、環境変数を追加できます。 **Add Environment Variable** ボタンをクリックし、このコンテキストに関連付ける変数の名前と値を指定します。 ダイアログボックスの **Add Environment Variable** ボタンをクリックして確定します。

4. その変数を使用するすべてのジョブの `.circleci/config.yml` ファイルの [`workflows`]({{ site.baseurl }}/ja/configuration-reference/#workflows) のセクションに、`context` キーを設定します。 下記の例では、 `run-tests` ジョブは`org-global` コンテキストで設定された環境変数にアクセスきます。 クラウド版 CircleCI Cloud をお使いの場合、複数のコンテキストを選択することもできます。 下記のサンプルでの場合、 `run-tests` ジョブは `my-context` コンテキストに設定された環境変数にもアクセスできます。

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

リポジトリを新しい組織に移動する場合は、新しい組織でも同じ一意のコンテキスト名を設定する必要があります ([下記参照](#rename-orgs-and-repositories))。
{: class="alert alert-info" }

### コンテキストと環境変数の制約
{: #contexts-and-environment-variable-constraints }

コンテキストや環境変数を作成する際は、下記に注意してください:

- コンテキスト名は 200 字以下である必要あります。 また、 1 つ以上の非空白文字を含んでいる必要があり、改行を含まず、かつ先頭および末尾は非空白文字である必要があります。
- 環境変数名は 300 字以下である必要があります。 先頭は英字もしくは `_` である必要があり、残りの部分は英字、数字、 `_` で構成されている必要があります。
- 環境変数の値の長さは 3,200 半角英数字相当以下である必要があります。
- 環境変数の値は空でも問題ありません。
- 1 コンテキストあたりの環境変数の個数は上限が 100 に設定されています。
- 1 つの組織あたりのコンテキストの個数は上限が 500 に設定されています。

## CircleCI Server のコンテキスト名の設定
{: #context-naming-for-circleci-server }

For any VCS enterprise installation that includes multiple organizations, the context names across those organizations must be unique. For example, if your GitHub Enterprise installation is named Kiwi and includes two organizations, you cannot add a context called `deploy` to both organizations. That is, the `deploy` context name cannot be duplicated in two organizations that exist in the same GitHub Enterprise installation for the Kiwi account. 1 つのアカウント内で重複するコンテキストは、エラーとなり失敗します。

## Combine contexts
{: #combine-contexts }

You can combine several contexts for a single job by adding them to the context list. コンテキストはコンフィグで指定された順に適用されるため、複数のコンテキストで同じ設定があった場合、後から指定されたコンテキストの設定内容が優先されます。 This way, you can scope contexts to be as small and granular as you like.

## Restrict a context
{: #restrict-a-context }

CircleCI は、コンテキストにセキュリティグループを追加することで、実行時にシークレットの環境変数の使用を制限できます。 新規または既存のコンテキストに*セキュリティグループ*を追加できるのは、組織の管理者に限られます。 Security groups are your organization's VCS teams. CircleCI Server v2.x を LDAP 認証と組み合わせて使用している場合、 LDAP のグループもセキュリティ グループの定義に使用されます。 セキュリティグループを設定したコンテキストについては、 CircleCI ユーザーのうち当該セキュリティ グループのメンバーだけが、当該コンテキストにアクセスし、関連付けられた環境変数を使用することができます。

組織の管理者は、すべてのプロジェクトに対する読み取り・書き込み両方のアクセス権を所有しています。 また、すべてのコンテキストに対する無制限のアクセス権も所有しています。

The default security group is `All members`, and enables any member of the organization who uses CircleCI to use the context.

Bitbucket repositories do **not** provide an API that allows CircleCI contexts to be restricted, only GitHub projects include the ability to restrict contexts with security groups.
{: class="alert alert-info" }

### Run workflows with a restricted context
{: #run-workflows-with-a-restricted-context }

制限付きコンテキストを使用したジョブを呼び出すユーザーは、 CircleCI にサイン アップ済みのユーザーで、かつそのコンテキストに構成されたいずれかのセキュリティ グループのメンバーでなければなりません。 制限付きコンテキストを使用するワークフローをアクセス権の認められていないユーザーが実行しようとすると、当該ワークフローは `Unauthorized` ステータスで失敗します。

### コンテキストを使用できるセキュリティ グループの制限
{: #restrict-a-context-to-a-security-group-or-groups }

以下のタスクを行うには、組織の管理者でなければなりません。

1. Navigate to **Organization Settings > Contexts** in the CircleCI web app to see the list of contexts. The default security group is `All members`, and allows all users in the organization to invoke jobs with that context.
2. Click the **Create Context** button if you wish to use a new context, or click the name of an existing context (if using an existing context, you will need to remove the `All members` security group before adding a new one).
3. Click the **Add Security Group** (GitHub users) or **Add Project Restriction** (GitLab users) button to view the dialog box.
4. Make your choices in the dialogue box and then click the **Add Security Group** or **Add Project Restriction** button to finalize. Conexts will now be restricted to the selections you have made.
5. Click **Add Environment Variables** to add environment variables to the context if none exist, fill out your desired name and value in the dialogue box, then click the **Add Environment Variables** button to finalize. これで、セキュリティ グループのメンバーのみが、このコンテキストに設定された環境変数を使用できるように制限されます。
6. Navigate back to **Organization Settings > Contexts** in the CircleCI app. セキュリティグループが、コンテキストの [Security (セキュリティ)] の列に表示されます。

これで、選択したグループのメンバーのみが、ワークフローでこのコンテキストを使用したり、このコンテキストに環境変数を追加、削除したりできるようになります。

### Make changes to context restrictions
{: #make-changes-to-context-restrictions }

Changes to security group restrictions for contexts might not take effect immediately due to caching. To make sure settings are applied immediately, it is best practice for the organization administrator to refresh permissions once the change has been made. **[Refresh Permissions (権限の更新)]** ボタンは [Account Integrations (アカウントのインテグレーション)](https://app.circleci.com/settings/user) ページにあります。

CircleCI Server の場合、管理者は `<circleci-hostname>/account`から **[Refresh Permissions (権限の更新)]** ボタンにアクセスできます。

### Approve jobs that use restricted contexts
{: #approve-jobs-that-use-restricted-contexts }

[承認ジョブ]({{site.baseurl}}/ja/configuration-reference/#type) をワークフローに追加することで、制限付きコンテキストの使用を手動で承認するようワークフローを構成することができます。 承認ジョブより下流のジョブの実行を制限するには、下記例のように、下流のジョブに制限付きコンテキストを設定します。

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

In this example, the jobs `test` and `deploy` are restricted, and `deploy` will only run if the user who approves the `hold` job is a member of the security group assigned to the context _and_ `deploy-key-restricted-context`. When the workflow `build-test-deploy` runs, the jobs `build` and `test` will run, then the `hold` job will run, which will present a manual approval button in the CircleCI application. This approval job may be approved by _any_ member of the project, but the `deploy` job will fail as `unauthorized` if the approver is not part of the restricted context security group.

## プロジェクトの制限
{: #project-restrictions }

CircleCI では、コンテキストにプロジェクトの制限を付与することにより、シークレット環境変数の使用を制限できます。 現在、**この機能は VCS に関連付けられていないスタンドアロンプロジェクトでのみ有効化されています。 スタンドアロンプロジェクトは、現時点では [CircleCI と GitLab を連携]({{site.baseurl}}/ja/gitlab-integration)している**場合のみ利用できます。スタンドアロン組織では、VCS に依存していないユーザーやプロジェクトを管理できます。

新規/既存のコンテキストにプロジェクトの制限を追加/削除できるのは、[組織の管理者]({{site.baseurl}}/gitlab-integration#about-roles-and-permissions)のみです。 コンテキストにプロジェクトレベルの制限が追加されると、指定されたプロジェクトに関連付けられたワークフローのみがそのコンテキストや環境変数にアクセスできるようになります。

組織の管理者には、すべてのプロジェクトへの読み取り/書き込み両方のアクセス権があり、すべてのコンテキストに対する無制限のアクセス権があります。

### Run workflows with a project restricted context
{: #run-workflows-with-a-project-restricted-context }

制限付きコンテキストを使用するワークフローを呼び出すには、そのコンテキストが許可されているプロジェクトに含まれるワークフローである必要があります。 コンテキストへのアクセスがないと、そのワークフローは `Unauthorized` ステータスで失敗します。

### コンテキストを特定のプロジェクトに制限する
{: #restrict-a-context-to-a-project }

以下の方法でコンテキストを制限するには**組織の管理者**である必要があります。

. [CircleCI Web アプリ](https://app.circleci.com/)で GitLab 組織の **Organization Settings > Contexts** のページに移動します。 コンテキストのリストが表示されます。

1. 既存のコンテキスト名を選択するか、新しいコンテキストを使用する場合は **Create Context** ボタンをクリックします。

1. **Add Project Restriction** ボタンをクリックし、ダイアログボックスを表示します。

1. コンテキストに追加するプロジェクト名を選択し、**Add** ボタンをクリックします。 これで指定したプロジェクトのみがコンテキストを使用できるように制限されます。 現時点では、複数のプロジェクトをそれぞれ追加する必要があります。

1. コンテキストのページに指定されたプロジェクトの制限のリストが表示されます。

1. 環境変数がある場合、このページに表示されます。 環境変数が表示されない場合は、**Add Environment Variables** をクリックし、コンテキストに追加します。 **Add** ボタンを押して終了します。 これで設定されたプロジェクトのみが、このコンテキストに設定された環境変数を使用できるようになりました。

設定されたプロジェクトの配下のワークフローのみが、このコンテキストと環境変数を使用できるようになりました。

### コンテキストを許可したプロジェクトを削除する
{: #remove-project-restrictions-from-contexts }

以下の方法でコンテキストからプロジェクトを削除するには**組織の管理者**である必要があります。

1. [CircleCI Web アプリ](https://app.circleci.com/)で **Organization Settings > Contexts** のページに移動します。 コンテキストのリストが表示されます。

1. 制限を変更する既存のコンテキスト名を選択します。

1. 削除するプロジェクトの隣にある **X**  ボタンをクリックします。 そのプロジェクトは、そのコンテキストを使用できなくなります。

1. コンテキストの使用が許可されたプロジェクトがなくなると、そのコンテキストと環境変数は実質的に制限がない状態になります。

## コンテキストからのグループの削除
{: #remove-groups-from-contexts }

コンテキストに関連付けられているすべてのグループを削除すると、組織管理者_のみ_がそのコンテキストを使用できるようになります。 他のすべてのユーザーは、そのコンテキストへのアクセス権を失います。


## チームおよびグループへのユーザーの追加と削除
{: #add-and-remove-users-from-teams-and-groups }

**GitHub users:** CircleCI syncs GitHub team and LDAP groups every few hours. GitHub チームまたは LDAP グループにユーザーを追加または削除してから、CircleCI のレコードが更新され、コンテキストへのアクセス権が削除されるまでには、数時間を要する場合があります。

## Add and remove environment variables from restricted contexts
{: #adding-and-removing-environment-variables-from-restricted-contexts }

制限付きコンテキストへの環境変数の追加と削除は、コンテキスト グループのメンバーに限定されます。

## Delete a context
{: #delete-a-context }

If the context is restricted with a group other than `All members`, you must be a member of that security group to complete this task. To delete a context, follow the steps below:

1. Navigate to the **Organization Settings > Contexts** in the CircleCI web app.

2. Click the **X** icon in the row of the context you want to delete. A confirmation dialog box will appear.

3. Type "DELETE" in the field and then click **Delete Context**. The context and all associated environment variables will be deleted.

If a deleted context was being used by a job in a workflow, the job will start to fail and show an error.
{: class="alert alert-info"}

## CLI を使ったコンテキストの管理
{: #context-management-with-the-cli}

コンテキストは CircleCI Web アプリケーション上で管理できますが、[CircleCI CLI](https://circleci-public.github.io/circleci-cli/)でもプロジェクトにおけるコンテキストの使用を管理することができます。 With the CLI, you can execute several [context-oriented commands](https://circleci-public.github.io/circleci-cli/circleci_context.html).

- `create` - 新しいコンテキストを作成
- `delete` - 指定したコンテキストを削除
- `list` - すべてのコンテキストを一覧表示
- `remove-secret` - 指定したコンテキストから環境変数を削除
- `show` - コンテキストを表示
- `store-secret` - 指定したコンテキストに新しい環境変数を格納

これらは CLI の "サブコマンド" であり、以下のように実行されます。

```shell
circleci context create
```

多くのコマンドでは、`< >` で区切られたパラメーターのように追加情報を入力するように求められます。 For example, after running `circleci context create`, you will be instructed to provide more information: `circleci context create <vcs-type> <org-name> <context-name> [flags]`.

As with most of the CLI's commands, you will need to properly [configure the CLI]({{site.baseurl}}/local-cli#configuring-the-cli) with a token to enable performing context related actions.

## 環境変数の使用
{: #environment-variable-usage }

環境変数は、以下の優先順位で使用されます。

1. `FOO=bar make install` など、`run` ステップの[シェル コマンド]({{site.baseurl}}/ja/set-environment-variable/#set-an-environment-variable-in-a-shell-command)で宣言された環境変数
2. Environment variables declared with the `environment` key [for a `run` step]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-step)
3. [ジョブ]({{ site.baseurl }}/ja/set-environment-variable/#set-an-environment-variable-in-a-job)で `environment` キーを使用して設定された環境変数
4. Special CircleCI environment variables defined on the [Project values and variables]({{site.baseurl}}/variables#built-in-environment-variables) page.
5. Context environment variables (assuming the user has access to the context).
6. [Project-level environment variables]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-project) set on the **Project Settings** page in the web app.

`FOO=bar make install` などの、シェルコマンドの`run` ステップで宣言された環境変数は、`environment` キーおよび `contexts` キーを使用して宣言された環境変数よりも優先されます。 Environment variables added on the contexts page will take precedence over variables added on the **Project Settings** page.

### Create environment variables with the CLI or API
{: #creating-environment-variables }

**With the CLI**

_If this is your first time using the CLI, follow the instructions on [CircleCI CLI configuration]({{site.baseurl}}/local-cli/?section=configuration) to set up your CircleCI command line interface._

CircleCI CLI を使用して環境変数を作成するには、下記ステップを実行します:

1. If you have not already done so, find the right context name that will contain the new environment variable by executing this command: `circleci context list <vcs-type> <org-name>`

2. Store a new environment variable under that context by executing this command: `circleci context store-secret <vcs-type> <org-name> <context-name> <env-var-name>`

Note that the CLI will prompt you to input the secret value, rather than accepting it as an argument. これは意図しないシークレットの漏洩を避けるためのものです。

**With the API**

To create an environment variable using the API, call the [Add Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) endpoint with the appropriate request body. For this request, replace the `context-id` and the `env-var-name` with the ID for the context and the new environment variable name. The request body should include a `value` key containing the plaintext secret as a string.

### Delete environment variables with the CLI or API
{: #deleting-environment-variables }

**With the CLI**

CircleCI CLI を使用して環境変数を削除するには、下記ステップを実行します:

1. If you have not already done so, find the context name that contains the environment variable you wish to delete by executing this command: `circleci context list <vcs-type> <org-name>`

2. 当該コンテキスト内のローテーションの対象である環境変数を確認します。 To list all variables under that context, execute this command: `circleci context show <vcs-type> <org-name> <context-name>`

3. Delete the environment variable by executing this command: `circleci context remove-secret <vcs-type> <org-name> <context-name> <env-var-name>`

**With the API**

To delete an environment variable using the API, call the [Delete environment variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) endpoint.

For this request, replace the `context-id` and the `env-var-name` with the ID for the context and the environment variable name that should be updated.

### Rotate Environment Variables with the CLI or API
{: #rotating-environment-variables }

Rotation refers to the process of updating a secret's value without deleting it or changing its name.

Because environment variables can be shared, passed around between employees and teams, and exposed inadvertently, it is always good practice to periodically rotate secrets. Many organizations automate this process, for example, running a script when an employee leaves the company, or when a secret may have been compromised.

Context environment variables can be rotated using CircleCI’s CLI, or by accessing the API.

 **With the CLI**

_If this is your first time using the CLI, follow the instructions on [CircleCI CLI configuration]({{site.baseurl}}/local-cli/?section=configuration) to set up your CircleCI command line interface._

CircleCI CLI を使用して環境変数のローテーションを実行するには、下記を実行します:

1. If you have not already done so, find the context name that contains the variable you would like to rotate by executing this command: `circleci context list <vcs-type> <org-name>`

2. Find the environment variable to rotate within that context by executing this command: `circleci context show <vcs-type> <org-name> <context-name>`

3. コンテキストで既存の環境変数を更新します。 Execute this command and replace the `env-var-name` with the name of the environment variable from Step 2: `circleci context store-secret <vcs-type> <org-name> <context-name> <env-var-name>`

Note that the CLI will prompt you to input the secret value, rather than accepting it as an argument. これは意図しないシークレットの漏洩を避けるためのものです。

**With the API**

To rotate an environment variable from the API, call the [Update environment variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) endpoint with the appropriate request body. For this request, replace the `context-id` and the `env-var-name` with the ID for the context and the environment variable name that should be updated. The request body should include a `value` key containing the plaintext secret as a string.

{% include snippets/ja/secrets-masking.md %}

## 関連項目
{: #see-also }
{:.no_toc}

* [CircleCI environment variable descriptions]({{site.baseurl}}/env-vars/)
* [ワークフロー機能]({{site.baseurl}}/workflows/)
