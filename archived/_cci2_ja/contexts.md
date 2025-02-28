---
layout: classic-docs
title: "コンテキストの使用"
description: "プロジェクト間で共有できる安全なリソース"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

コンテキストは、環境変数を保護し、プロジェクト間で共有するためのメカニズムを提供します。 環境変数は、名前と値のペアとして定義され、実行時に挿入されます。 このドキュメントでは、CircleCI におけるコンテキストの作成と使用について説明します。

既存のコンテキスト (または環境変数) があり、組織名やリポジトリ名を変更したい場合は、[組織名およびリポジトリ名の変更]({{site.baseurl}}/ja/rename-organizations-and-repositories)ガイドに従い、変更プロセスの間にコンテキストや環境変数へのアクセスが失われないようにしてください。

## 概要
{: #overview }

コンテキストの作成と管理は、[CircleCI Web アプリ](https://app.circleci.com)の **Organization Settings** のページで行えます。 コンテキストを表示、作成、編集するには、組織のメンバーである必要があります。 コンテキストを作成したら以下のイメージのように、プロジェクトの [`.circleci/config.yml`]({{site.baseurl}}/ja/configuration-reference/) ファイルのワークフローセクションで、 `context` キーを使って任意のジョブにコンテキストに関連付けられた環境変数へのアクセス権を付与することができます。

{:.tab.contextsimage.Cloud}
![コンテキストの概要]({{site.baseurl}}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_3}
![コンテキストの概要]({{site.baseurl}}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_2}
![コンテキストの概要]({{site.baseurl}}/assets/img/docs/contexts_server.png)

Web アプリの **Contexts** のページで設定した環境変数を使用するには、ワークフローを実行するユーザーが、コンテキストを設定した組織のメンバーである必要があります。

コンテキスト名は、各 VCS 組織ごとに一意である必要があります。 デフォルトのコンテキスト名は、`org-global` です。 この最初のデフォルト名 `org-global` で作成されたコンテキストは、引き続き機能します。
{: class="alert alert-info" }

## コンテキストの作成と使用
{: #create-and-use-a-context }

1. CircleCI Web アプリで、左側のサイドナビゲーションにある **Organization Settings > Contexts** をクリックします。

    組織のメンバーは、コンテキストの作成はできますが、特定のセキュリティグループへの制限ができるのは組織の管理者のみです。 唯一の例外は、Bitbucket 組織です。この組織では、ワークスペースまたは含まれているリポジトリに対する他の権限に関係なく、`create repositories` のワークスペース権限をユーザーに付与する必要があります。

    ![コンテキスト]({{site.baseurl}}/assets/img/docs/org-settings-contexts-v2.png)

    CircleCI Server をご使用の場合は、メインナビゲーションで **Settings** のリンクから **Organization Settings** に通常どおりアクセスすることができます。
    {: class="alert alert-info" }

2. **Create Context** ボタンをクリックして、一意のコンテキスト名を追加します。 ダイアログボックスの **Create Context** ボタンをクリックして確定します。 新しいコンテキストがリストに表示されます。Security は `All members` に設定され、組織のすべてのユーザーが実行時にこのコンテキストにアクセスできる状態です。

3. リストにある任意のコンテキストをクリックすると、環境変数を追加できます。 **Add Environment Variable** ボタンをクリックし、このコンテキストに関連付ける変数の名前と値を指定します。 ダイアログボックスの **Add Environment Variable** ボタンをクリックして確定します。

4. この変数を使用するすべてのジョブの `.circleci/config.yml` ファイルの [`workflows`]({{ site.baseurl }}/ja/configuration-reference/#workflows) のセクションに、`context` キーを設定します。 下記の例では、 `run-tests` ジョブは `org-global` コンテキストに設定された環境変数を使用することができます。 クラウド版 CircleCI をお使いの場合は、複数のコンテキストを選択でき、下記の例では、`run-tests` は `my-context` というコンテキストに設定された環境変数にもアクセスできます。

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

コンテキストや環境変数を作成する際は、以下の点にご注意ください:

- コンテキスト名は 200 字以下である必要あります。 また、空白以外の文字を 1 つ以上含み、改行を含まず、かつ先頭および末尾は空白以外の文字である必要があります。
- 環境変数名は 300 字以下である必要があります。 先頭は英字または `_` で始まり、残りの部分は英字、数字、 `_` で構成されている必要があります。
- 環境変数の値の長さは 32,000 半角英数字相当以下である必要があります。
- 環境変数の値は空でも問題ありません。
- 1 コンテキストあたりの環境変数の個数は上限が 100 に設定されています。
- 1 つの組織あたりのコンテキストの個数は上限が 500 に設定されています。

## CircleCI Server のコンテキスト名の設定
{: #context-naming-for-circleci-server }

お使いの VCS に複数の組織が含まれる場合、コンテキスト名は各組織ごとに一意である必要があります。 たとえば、 Kiwi という名前の GitHub Enterprise インストール環境に 2 つの組織が含まれる場合、両方の組織に `deploy` という名前のコンテキストを追加することはできません。 つまり、この Kiwi アカウントの同じ GitHub Enterprise インストール環境に存在する 2 つの組織に、コンテキスト名 `deploy` を重複させることはできません。 1 つのアカウント内で重複するコンテキストは、エラーとなり失敗します。

## 複数のコンテキストの統合
{: #combine-contexts }

コンテキストをコンテキストリストに追加すると、1 つのジョブに複数のコンテキストを組み合わせることができます。 コンテキストは設定ファイルで指定された順に適用されるため、複数のコンテキストで同じ設定があった場合、後から指定されたコンテキストの設定内容が優先されます。 この性質を使用して、コンテキストの粒度を自在に小さくすることができます。

## コンテキストの制限
{: #restrict-a-context }

CircleCI では、コンテキストにセキュリティグループを追加することにより、実行時にシークレットの環境変数の使用を制限できます。 新規または既存のコンテキストに*セキュリティグループ*を追加できるのは、組織の管理者のみです。 セキュリティグループは、組織の VCS チームです。 LDAP 認証を使って CircleCI Server v2.x を使用している場合は、 LDAP のグループもセキュリティグループとして定義されます。 コンテキストにセキュリティグループを設定すると、そのセキュリティグループの CircleCI ユーザーでもあるメンバーのみが、そのコンテキストにアクセスし、関連付けられた環境変数を使用することができます。

組織の管理者には、すべてのプロジェクトに対する読み取り/ 書き込み両方のアクセス権があり、すべてのコンテキストに対する無制限のアクセス権があります。

セキュリティグループは、デフォルトで `All members` に設定されており、CircleCI を使用する組織のすべてのメンバーがそのコンテキストを使用できます。

Bitbucket は、コンテキストの制限に必要な API を公開して**いない**ため、コンテキストをセキュリティグループに制限できるのは GitHub プロジェクトのみです。
{: class="alert alert-info" }

### 制限付きコンテキストを使用したワークフローの実行
{: #run-workflows-with-a-restricted-context }

制限付きコンテキストを使用したジョブを呼び出すには、 CircleCI に登録済みのユーザーで、かつそのコンテキストに設定されたいずれかのセキュリティグループのメンバーである必要があります。 制限付きコンテキストへのアクセス権のないユーザーがワークフローを実行しようとすると、そのワークフローは `Unauthorized` ステータスで失敗します。

### コンテキストを使用できるセキュリティグループの制限
{: #restrict-a-context-to-a-security-group-or-groups }

以下のタスクを行うには、組織の管理者である必要があります。

1. CircleCI Web アプリで **Organization Settings > Contexts** に移動し、コンテキストのリストを確認します。 セキュリティグループはデフォルトでは `All members` に設定されており、組織内のすべてのユーザーがそのコンテキストを含むジョブを呼び出すことができます。
2. 新しいコンテキストを使う場合は、**Create Context** ボタンをクリックし、既存のコンテキストの場合はそのコンテキストの名前をクリックします (既存のコンテキストを使用する場合は、新しいセキュリティグループを追加する前に `All members` のセキュリティーグループを削除する必要があります)。
3. **Add Security Group** (GitHub ユーザー) ボタンまたは **Add Project Restriction** (GitLab ユーザー) ボタンをクリックし、ダイアログボックスを表示します。
4. 設定するセキュリティグループをダイアログボックスで選び、**Add Security Group** ボタンまたは **Add Project Restriction** ボタンをクリックして確定します。 選択したセキュリティグループのみがコンテキストを使用できるように制限されます。
5. **Add Environment Variables** をクリックして環境変数をコンテキストに追加します。コンテキストがない場合は、追加する名前と値をダイアログボックスに入力し、**Add Environment Variables** ボタンをクリックして確定します。 セキュリティグループのメンバーのみが、このコンテキストに設定された環境変数を使用できるように制限されます。
6. CircleCI Web アプリで **Organization Settings > Contexts** のページに戻ります。 セキュリティグループが、コンテキストの Security の列に表示されます。

これで選択したグループのメンバーのみが、ワークフローでこのコンテキストを使用したり、このコンテキストに環境変数を追加または削除できるようになりました。

### コンテキストの制限の変更
{: #make-changes-to-context-restrictions }

コンテキストに設定されたセキュリティグループ制限の設定の変更は、キャッシュの都合上瞬時に反映されない場合があります。 設定変更を瞬時に反映させるには、組織の管理者が変更後すぐに権限を更新することをお勧めします。 **Refresh Permissions** ボタンは [Account Integrations](https://app.circleci.com/settings/user) のページにあります。

CircleCI Server の場合、管理者は `<circleci-hostname>/account` から **Refresh Permissions** ボタンにアクセスできます。

### 制限付きコンテキストを使用するジョブの承認
{: #approve-jobs-that-use-restricted-contexts }

[承認ジョブ]({{site.baseurl}}/ja/configuration-reference/#type)をワークフローに追加すると、制限付きコンテキストの使用の手動承認を要求するオプションが表示されます。 承認ジョブより下流のジョブの実行を制限するには、下記の例のように、下流のジョブに制限付きコンテキストを設定します。

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

この例では、 `test` および `deploy` のジョブが制限されており、特に `deploy` ジョブは、`hold` ジョブを承認したユーザーがそのコンテキスト _と_ `deploy-key-restricted-context` に設定されたセキュリティグループのメンバーである場合にのみ実行されます。 `build-test-deploy` ワークフローが実行されると、 `build`、`test` の各ジョブが実行され、その後 `hold` ジョブが実行され、CircleCI アプリに手動承認ボタンが表示されます。 この承認ジョブは、_すべての_プロジェクトメンバーが承認できますが、`deploy` ジョブは、承認者が制限付きコンテキストに設定されたセキュリティグループのメンバーでない場合は  `unauthorized` として失敗します。

## プロジェクトの制限
{: #project-restrictions }

CircleCI では、コンテキストにプロジェクトの制限を付与することにより、シークレット環境変数の使用を制限できます。 現在、**この機能は VCS に関連付けられていないスタンドアロンプロジェクトでのみ有効化されています。 スタンドアロンプロジェクトは、現時点では [CircleCI と GitLab を連携]({{site.baseurl}}/ja/gitlab-integration)している**場合のみ利用できます。スタンドアロン組織では、VCS に依存していないユーザーやプロジェクトを管理できます。

新規/既存のコンテキストにプロジェクトの制限を追加/削除できるのは、[組織の管理者]({{site.baseurl}}/gitlab-integration#about-roles-and-permissions)のみです。 コンテキストにプロジェクトレベルの制限が追加されると、指定されたプロジェクトに関連付けられたワークフローのみがそのコンテキストや環境変数にアクセスできるようになります。

組織の管理者には、すべてのプロジェクトに対する読み取り/書き込み両方のアクセス権があり、すべてのコンテキストに対する無制限のアクセス権があります。

### プロジェクトの制限付きコンテキストを使用したワークフローの実行
{: #run-workflows-with-a-project-restricted-context }

制限付きコンテキストを使用するワークフローを呼び出すには、そのコンテキストが許可されているプロジェクトに含まれるワークフローである必要があります。 コンテキストへのアクセス権がないと、そのワークフローは `Unauthorized` ステータスで失敗します。

### コンテキストを特定のプロジェクトに制限する
{: #restrict-a-context-to-a-project }

以下の方法でコンテキストを制限するには**組織の管理者**である必要があります。

. [CircleCI Web アプリ](https://app.circleci.com/)で GitLab 組織の **Organization Settings > Contexts** のページに移動します。 コンテキストのリストが表示されます。

1. 既存のコンテキスト名を選択する、または新しいコンテキストを使用する場合は **Create Context** ボタンをクリックします。

1. **Add Project Restriction** ボタンをクリックし、ダイアログボックスを表示します。

1. コンテキストに追加するプロジェクト名を選択し、**Add** ボタンをクリックします。 これで指定したプロジェクトのみがコンテキストを使用できるように制限されます。 現時点では、複数のプロジェクトをそれぞれ追加する必要があります。

1. コンテキストのページに指定されたプロジェクトの制限のリストが表示されます。

1. 環境変数がある場合、このページに表示されます。 環境変数が表示されない場合は、**Add Environment Variables** をクリックし、コンテキストに追加します。 **Add** ボタンを押して終了します。 設定されたプロジェクトのみが、このコンテキストに設定された環境変数を使用できるようになりました。

これで、設定されたプロジェクトの配下のワークフローのみが、このコンテキストと環境変数を使用できるようになりました。

### コンテキストを許可したプロジェクトを削除する
{: #remove-project-restrictions-from-contexts }

以下の方法でコンテキストからプロジェクトを削除するには**組織の管理者**である必要があります。

1. [CircleCI Web アプリ](https://app.circleci.com/)で **Organization Settings > Contexts** のページに移動します。 コンテキストのリストが表示されます。

1. 制限を変更する既存のコンテキスト名を選択します。

1. 削除するプロジェクトの隣にある **X**  ボタンをクリックします。 そのプロジェクトは、このコンテキストを使用できなくなります。

1. コンテキストの使用が許可されたプロジェクトがすべてなくなると、そのコンテキストと環境変数は実質的に制限がない状態になります。

## コンテキストからのグループの削除
{: #remove-groups-from-contexts }

コンテキストに関連付けられているすべてのグループを削除すると、組織管理者_のみ_がそのコンテキストを使用できるようになります。 他のすべてのユーザーは、そのコンテキストへのアクセス権を失います。


## チームおよびグループへのユーザーの追加と削除
{: #add-and-remove-users-from-teams-and-groups }

**GitHub ユーザー:** CircleCI では GitHub チームと LDAP グループを数時間ごとに同期します。 GitHub チームまたは LDAP グループにユーザーを追加または削除してから、CircleCI のレコードが更新され、コンテキストへのアクセス権が削除されるまでには、数時間を要する場合があります。

## 制限付きコンテキストへの環境変数の追加と削除
{: #adding-and-removing-environment-variables-from-restricted-contexts }

制限付きコンテキストへの環境変数の追加と削除は、コンテキストグループのメンバーに限定されます。

## コンテキストの削除
{: #delete-a-context }

コンテキストが `All members` 以外のグループに制限されている場合、指定されたセキュリティグループのメンバーでなければコンテキストを削除できません。 コンテキストの削除は、以下の手順で行います。

1. CircleCI Web アプリで **Organization Settings > Contexts** のページに移動します。

2. 削除するコンテキストの列にある **X** アイコンをクリックします。 確認ダイアログボックスが表示されます。

3. フィールドに "DELETE" と入力し、**Delete Context** をクリックします。 コンテキストと、そのコンテキストに関連付けられたすべての環境変数が削除されます。

削除したコンテキストがいずれかのワークフロー内のジョブで使用されていた場合、そのジョブは動作しなくなり、エラーが表示されます。
{: class="alert alert-info"}

## CLI を使ったコンテキストの管理
{: #context-management-with-the-cli}

コンテキストは CircleCI Web アプリ上で管理できますが、[CircleCI CLI](https://circleci-public.github.io/circleci-cli/)でもプロジェクトにおけるコンテキストの使用を管理できます。 CLI を使うと、複数の[コンテキストコマンド](https://circleci-public.github.io/circleci-cli/circleci_context.html)を実行できます。

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

多くのコマンドでは、`< >` で区切られたパラメーターのように追加情報を入力するように求められます。 たとえば、`circleci context create` の実行後、追加情報の入力を求められます。: `circleci context create <vcs-type> <org-name> <context-name> [flags]`

多くの CLI コマンドと同様、コンテキスト関連の操作を実行するには、お使いのバージョンの CLI をトークンで適切に [CLI を設定する]({{site.baseurl}}/local-cli#configuring-the-cli)必要があります。

## 環境変数の使用
{: #environment-variable-usage }

環境変数は、以下の優先順位で使用されます。

1. `FOO=bar make install` など、`run` ステップの[シェルコマンド]({{site.baseurl}}/ja/set-environment-variable/#set-an-environment-variable-in-a-shell-command)で宣言された環境変数
2. [`run` ステップ]({{site.baseurl}}/ja/set-environment-variable/#set-an-environment-variable-in-a-step)で `environment` キーを使用して宣言された環境変数
3. [ジョブ]({{ site.baseurl }}/ja/set-environment-variable/#set-an-environment-variable-in-a-job)で `environment` キーを使用して設定された環境変数
4. [プロジェクトの値と変数]({{site.baseurl}}/ja/variables#built-in-environment-variables)のページに記載されている特別な CircleCI 環境変数
5. コンテキスト環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合):
6. Web アプリの **Project Settings** のページで設定された[プロジェクトレベルの環境変数]({{site.baseurl}}/ja/set-environment-variable/#set-an-environment-variable-in-a-project)

`FOO=bar make install` などの、シェルコマンドの`run` ステップで宣言された環境変数は、`environment` キーおよび `contexts` キーを使用して宣言された環境変数よりも優先されます。 Contexts のページで追加された環境変数は、**Project Settings** のページで追加された環境変数よりも優先されます。

### CLI または API を使った環境変数の作成
{: #creating-environment-variables }

**CLI を使用:**

_CircleCI の CLI をはじめて使用する場合は、[CircleCI CLI の設定]({{site.baseurl}}/ja/local-cli/?section=configuration) を参照して CircleCI コマンドラインインターフェースを設定してください。_

CircleCI CLI を使用して環境変数を作成するには、下記手順を実施します:

1. 新しい環境変数を含む適切なコンテキスト名をまだ検索していない場合は、`circleci context list <vcs-type ><org-name >` コマンドを実行します 。

2. `circleci context store-secret <vcs-type> <org-name> <context-name> <env-var-name>` コマンドを実行し、コンテキストの配下に新しい環境変数を格納します。

CLI は、シークレット値を引数として受け入れるのではなく、入力するよう求めるのでご注意ください。 これは意図しないシークレットの漏洩を避けるためのものです。

**API を使用:**

API を使用して環境変数を作成する場合は、 [Add Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) のエンドポイントを適切なリクエスト本文とともに呼び出します。 このリクエストにおいては `context-id` と `env-var-name` をそれぞれコンテキストの ID と新しい環境変数の名前に置き換えます。 リクエスト本文には、プレーンテキストのシークレットを文字列として含む `value` キーを含める必要があります。

### CLI または API を使った環境変数の削除
{: #deleting-environment-variables }

**CLI を使用:**

CircleCI CLI を使用して環境変数を削除するには、下記ステップを実行します:

1. 削除する環境変数を含むコンテキスト名をまだ検索していない場合は、`circleci context list <vcs-type ><org-name >` コマンドを実行します 。

2. そのコンテキストに環境変数があることを確認します。 そのコンテキストの配下にあるすべての変数をリストするには、 `circleci context show <vcs-type> <org-name> <context-name>` コマンドを実行します。

3. `circleci context remove-secret <vcs-type> <org-name> <context-name> <env-var-name>` コマンドを実行し、環境変数を削除します。

**API を使用:**

API を使用して環境変数を削除する場合は、 [Delete Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) のエンドポイントを呼び出します。

このリクエストにおいては `context-id` と `env-var-name` をそれぞれコンテキストの ID と更新する環境変数の名前に置き換えます。

### CLI または API を使った環境変数のローテーション
{: #rotating-environment-variables }

ローテーションとは、環境変数の削除や変数名をの変更を行わずに、 シークレットの値を更新することを指します。

環境変数は、共有されたり、従業員やチーム間で渡したり、 不用意に公開される可能性があるため、シークレットを定期的にローテーションすることをお勧めします。 多くの組織では、このプロセスを自動化しており、従業員が退職したときや、トークンが漏洩したと思われるときにスクリプトを実行しています。

CircleCI の CLI を使って、または API にアクセスすることにより、コンテキストの環境変数をローテーションすることが可能です。

 **CLI を使用:**

_CircleCI の CLI をはじめて使用する場合は、[CircleCI CLI の設定]({{site.baseurl}}/ja/local-cli/?section=configuration) を参照して CircleCI コマンドラインインターフェースを設定してください。_

CircleCI CLI を使用して環境変数のローテーションを実行するには、下記を実行します:

1. ローテーションする変数を含むコンテキスト名をまだ検索していない場合は、`circleci context list <vcs-type ><org-name >` コマンドを実行します 。

2. そのコンテキスト内でローテーションする環境変数を見つけるには、`circleci context show <vcs-type> <org-name> <context-name>` コマンドを実行します。

3. そのコンテキストの既存の環境変数を更新します。 以下のコマンドを実行し、`env-var-name` を手順 2 の環境変数名に変更します: `circleci context store-secret <vcs-type> <org-name> <context-name> <env-var-name>`

CLI は、シークレット値を引数として受け入れるのではなく、入力するよう求めるのでご注意ください。 これは意図しないシークレットの漏洩を避けるためのものです。

**API を使用:**

API で環境変数のローテーションを実行する場合は、[Update Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) のエンドポイントを適切なリクエスト本文とともに呼び出します。 このリクエストにおいては `context-id` と `env-var-name` をそれぞれコンテキストの ID と更新する環境変数の名前に置き換えます。 リクエスト本文には、プレーンテキストのシークレットを文字列として含む `value` キーを含める必要があります。

{% include snippets/ja/secrets-masking.md %}

## 関連項目
{: #see-also }
{:.no_toc}

* [CircleCI 環境変数の説明]({{site.baseurl}}/ja/env-vars/)
* [ワークフロー機能]({{site.baseurl}}/ja/workflows/)
