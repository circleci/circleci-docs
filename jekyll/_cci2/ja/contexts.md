---
layout: classic-docs
title: "コンテキストの使用"
short-title: "コンテキストの使用"
description: "安全なプロジェクト間リソース"
categories:
  - configuring-jobs
order: 41
---

ここでは、以下のセクションに沿って、CircleCI でコンテキストを作成および使用する方法について説明します。

* 目次
{:toc}

コンテキストは、環境変数を保護し、プロジェクト間で共有するためのメカニズムを提供します。 環境変数は、名前・値のペアとして定義され、実行時に挿入されます。

## 概要
{:.no_toc}

コンテキストは、CircleCI アプリケーションの [Settings (設定)] ページにある [Organization (組織)] セクションで作成します。 You must be an organization member to view, create, or edit contexts. アプリケーションでコンテキストを設定したら、プロジェクトの [`config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルの workflows セクションでコンテキストを設定することができます。

[Contexts (コンテキスト)] ページで設定された環境変数を使用するには、ワークフローを実行するユーザーが、コンテキストを設定した組織のメンバーでなければならず、またルールによって組織内のすべてのプロジェクトへのアクセスが許可されていなければなりません。

コンテキスト名は、各 GitHub 組織または Bitbucket 組織内で一意でなければなりません。 **メモ：**初期デフォルト名 `org-global` で作成されたコンテキストは、引き続き機能します。

### CircleCI がユーザーサーバーにインストールされる場合のコンテキストの命名規則
{:.no_toc}

GitHub Enterprise (GHE) インストールに複数の組織が含まれる場合、コンテキスト名はそれらの組織間でも一意でなければなりません。 たとえば、Kiwi という名前の GHE があり、それに 2つの組織が含まれる場合、両方の組織に `deploy` という名前のコンテキストを追加することはできません。 つまり、Kiwi アカウントの同じ GHE インストールに存在する 2つの組織内で、コンテキスト名 `deploy` を重複させることはできません。 1つのアカウント内で重複するコンテキストは、エラーとなって失敗します。

## コンテキストの作成と使用

1. As an organization member, Navigate to the Settings > Contexts page in the CircleCI application. **Note:** Any organization member can create a context only organization administrators can restrict it with a security group.

2. [Create Contexts (コンテキストを作成)] ボタンをクリックして、一意のコンテキスト名を追加します。 After you click the Create button on the dialog box, the Context appears in a list with Security set to `All members` to indicate that anyone in your organization can access this context at runtime.

3. [Add Environment Variable (環境変数を追加)] ボタンをクリックし、変数名と値をコピー＆ペーストします。 [Add Variable (変数を追加)] ボタンをクリックして保存します。

4. この変数を使用する各ジョブで、[`config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルの [`workflows`]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows) セクションに `context: <context name>` キーを追加します。 以下の例では、`run-tests` ジョブが、`org-global` コンテキストに設定された変数を使用します。

    workflows:
      version: 2
      my-workflow:
        jobs:
          - run-tests:
              context: org-global
    

## コンテキストを使用するリポジトリの移動

リポジトリを新しい組織に移動する場合は、新しい組織でも一意のコンテキスト名を設定する必要があります。

## コンテキストの制約

CircleCI は、コンテキストにセキュリティグループを追加することで、実行時にシークレットの環境変数の使用を制約できます。 新規または既存のコンテキストに*セキュリティグループ*を追加できるのは、組織管理者だけです。 Security groups are defined as LDAP groups or GitHub teams. コンテキストにセキュリティグループを追加すると、そのセキュリティグループのメンバーである CircleCI ユーザーのみが、制約付きコンテキストの環境変数にアクセスまたは使用できます。

Note: Organization administrators have read/write access to all projects and have unrestricted access to all contexts.

The default security group is `All members` and enables any member of the organization who uses CircleCI to use the context.

## 制約付きコンテキストを使用したワークフローの実行

To invoke a job that uses a restricted context, a user must be a member of one of the security groups for the context or the workflow will fail with the status of `Unauthorized`. If you add a context to your job and you are **not** a member of any of the security groups, the workflow will fail as `Unauthorized`.

**Note:** Bitbucket repositories do **not** provide an API that allows CircleCI contexts to be restricted, only GitHub projects include the ability to restrict contexts with security groups. Restricted Contexts are also **not** yet supported in private installations of CircleCI.

### コンテキストを使用できるセキュリティグループの制限

You must be an organization administrator to complete the following task.

1. CircleCI アプリケーションで [Organization Settings (組織設定)] > [Contexts (コンテキスト)] ページに移動します。コンテキストのリストが表示されます。 セキュリティグループはデフォルトで `All members` に設定され、組織内のすべてのユーザーにそのコンテキストを含むジョブの起動が許可されます。
2. [Create Context (コンテキストを作成)] ボタンをクリックして新しいコンテキストを作成するか、既存のコンテキストの名前をクリックします。
3. [Add Group (グループを追加)] リンクをクリックします。 [Add Group (グループを追加)] ダイアログボックスが表示されます。
4. コンテキストに追加する GitHub チームまたは LDAP グループを選択し、[Add (追加)] ボタンをクリックします。 これで、コンテキストの使用は、選択したグループに制限されます。
5. 環境変数がまだない場合は、[Add Environment Variables (環境変数を追加)] をクリックしてコンテキストに環境変数を追加し、[Add (追加)] ボタンをクリックします。 これで、このコンテキストに設定された環境変数の使用は、セキュリティグループのメンバーに制限されます。
6. CircleCI アプリケーションで、[Organization Settings (組織設定)] > [Contexts (コンテキスト)] に移動します。セキュリティグループが、コンテキストの [Security (セキュリティ)] 列に表示されます。

Only members of the selected groups may now use the context in their workflows or add or remove environment variables for the context.

### 制約付きコンテキストを使用するジョブの承認

Adding an approval job to a workflow allows a user to manually approve the use of a restricted context.

To restrict running of jobs that are downstream from an approval job, add a restricted context to those downstream jobs.

For example, if you want the execution of job C and job D restricted to a security group, you need to add an approval job B before the jobs C and D to that use a context with a security group. That is, you can have four jobs in a workflow, job A can run unrestricted, the approval job B may be approved by any member, but the jobs C and D after the approval may only be executed by someone in the security group for the context used on jobs C and D.

If the approver of a job is not part of the restricted context, it is possible to approve the job B, however the jobs C and D in the workflow will fail as unauthorized. That is, the Approval job will appear for every user, even for users who are not part of the group with permissions for the context. When the downstream jobs fail with Unauthorized, it indicates an approval was made by a user who is not part of the security group for the downstream jobs.

## コンテキストからのグループの削除

To make a context available only to the administrators of the organization, you may remove all of the groups associated with a context. All other users will lose access to that context.

### チームおよびグループへのユーザーの追加と削除

CircleCI syncs GitHub team and LDAP groups every few hours. If a user is added or removed from a GitHub team or LDAP group, it will take up to a few hours to update the CircleCI records and remove access to the context.

### 制約付きコンテキストへの環境変数の追加と削除

Addition and deletion of environment variables from a restricted context is limited to members of the context groups.

## コンテキストの削除

If the context is restricted with a group other than `All members`, you must be a member of the security group to complete this task.

1. 組織管理者として、CircleCI アプリケーションの [Settings (設定)] > [Contexts (コンテキスト)] ページに移動します。

2. 削除するコンテキストの [Delete Context (コンテキストを削除)] ボタンをクリックします。 確認ダイアログボックスが表示されます。

3. 「Delete」と入力し、[Confirm (確認)] をクリックすると、 コンテキストおよび関連付けられたすべての環境変数が削除されます。 **メモ：** 削除したコンテキストがいずれかのワークフロー内のジョブで使用されていた場合、そのジョブは動作しなくなり、エラーが表示されます。

## 環境変数の使用方法

Environment variables are used according to a specific precedence order, as follows:

1. `FOO=bar make install` など、`run` ステップのシェルコマンド内で宣言された環境変数
2. `run` ステップで `environment` キーを使用して宣言された環境変数
3. ジョブで `environment` キーを使用して設定された環境変数
4. コンテナで `environment` キーを使用して設定された環境変数
5. コンテキスト環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合)
6. [Project Settings (プロジェクト設定)] ページで設定されたプロジェクトレベルの環境変数
7. [CircleCI 環境変数の説明]({{ site.baseurl }}/ja/2.0/env-vars/#built-in-environment-variables)ページで定義されている特殊な CircleCI 環境変数

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the Contexts page will take precedence over variables added on the Project Settings page. Finally, special CircleCI environment variables are loaded.

## Secrets Masking

Contexts hold project secrets or keys that perform crucial functions for your applications. For added security CircleCI performs secret masking on the build output, obscuring the `echo` or `print` output of contexts.

The value of the context will not be masked in the build output if:

* the value of the contex is less than 4 characaters
* the value of the context is equal to one of `true`, `True`, `false` or `False`

**Note:** secret masking will only prevent the value of the context from appearing in your build output. The value of the context is still accessible to users [debugging builds with SSH]({{ site.baseurl }}/2.0/ssh-access-jobs).

## See Also

[CircleCI Environment Variable Descriptions]({{ site.baseurl }}/2.0/env-vars/) [Workflows]({{ site.baseurl }}/2.0/workflows/)