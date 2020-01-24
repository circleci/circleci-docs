---
layout: classic-docs
title: "コンテキストの使用"
short-title: "コンテキストの使用"
description: "プロジェクト間で共有できる安全なリソース"
categories:
  - configuring-jobs
order: 41
---

以下のセクションに沿って、CircleCI でコンテキストを作成および使用する方法について説明します。

* TOC
{:toc}

コンテキストは、環境変数を保護し、プロジェクト間で共有するためのメカニズムを提供します。 環境変数は、名前と値のペアとして定義され、実行時に挿入されます。

## 概要
{:.no_toc}

コンテキストは、CircleCI アプリケーションの [Settings (設定)] ページにある [Organization (組織)] セクションで作成します。 組織のメンバーでなければ、コンテキストを表示、作成、編集できません。 アプリケーションでコンテキストを設定したら、プロジェクトの [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルのワークフロー セクションでコンテキストを構成することができます。

[Contexts (コンテキスト)] ページで設定された環境変数を使用するには、ワークフローを実行するユーザーが、コンテキストを設定した組織のメンバーでなければなりません。また、ルールによって組織内のすべてのプロジェクトへのアクセスが許可されていなければなりません。

コンテキスト名は、各 GitHub 組織または Bitbucket 組織内で一意でなければなりません。 **Note:** Contexts created with the initial default name of `org-global` will continue to work.

### CircleCI がプライベート サーバーにインストールされる場合のコンテキストの命名規則
{:.no_toc}

GitHub Enterprise (GHE) インストールに複数の組織が含まれる場合、コンテキスト名はそれらの組織間でも一意である必要があります。 たとえば、Kiwi という名前の GHE があり、それに 2 つの組織が含まれる場合、両方の組織に `deploy` という名前のコンテキストを追加することはできません。 つまり、Kiwi アカウントの同じ GHE インストールに存在する 2 つの組織内で、コンテキスト名 `deploy` を重複させることはできません。 1 つのアカウント内で重複するコンテキストは、エラーとなって失敗します。

## コンテキストの作成と使用

1. As an organization member, Navigate to the Settings > Contexts page in the CircleCI application. **Note:** Any organization member can create a context only organization administrators can restrict it with a security group.

2. [Create Contexts (コンテキストを作成)] ボタンをクリックして、一意のコンテキスト名を追加します。 ダイアログ ボックスの [Create (作成)] ボタンをクリックすると、コンテキストがリストに表示されます。[Security (セキュリティ)] は `All members` に設定されており、組織内のすべてのユーザーが実行時にこのコンテキストにアクセスできる状態です。

3. [Add Environment Variable (環境変数を追加)] ボタンをクリックし、変数名と値をコピー & ペーストします。 [Add Variable (変数を追加)] ボタンをクリックして保存します。

4. この変数を使用する各ジョブで、[`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルの [`workflows`]({{ site.baseurl }}/2.0/configuration-reference/#workflows) セクションに `context: <context name>` キーを追加します。 以下の例では、`run-tests` ジョブが、`org-global` コンテキストに設定された変数を使用します。

```
workflows:
  version: 2
  my-workflow:
    jobs:
      - run-tests:
          context: org-global
```

## コンテキストを使用するリポジトリの移動

リポジトリを新しい組織に移動する場合は、新しい組織でも一意のコンテキスト名を設定する必要があります。

## コンテキストの制限

CircleCI は、コンテキストにセキュリティ グループを追加することで、実行時にシークレットの環境変数の使用を制限できます。 Only organization administrators may add *security groups* to a new or existing context. セキュリティ グループは、LDAP グループまたは GitHub チームとして定義されます。 コンテキストにセキュリティ グループを追加すると、そのセキュリティ グループのメンバーである CircleCI ユーザーのみが、制限付きコンテキストの環境変数にアクセスまたは使用できます。

メモ: 組織管理者は、すべてのプロジェクトに対する読み取り/書き込みのアクセス権を所有しています。また、すべてのコンテキストに対する無制限のアクセス権も所有しています。

セキュリティ グループはデフォルトで `All members` に設定されており、CircleCI を使用する組織のすべてのメンバーに対してコンテキストが使用可能になります。

## 制限付きコンテキストを使用したワークフローの実行

制限付きコンテキストを使用したジョブを呼び出すユーザーは、そのコンテキストのいずれかのセキュリティ グループのメンバーでなければなりません。そうでない場合、ワークフローは `Unauthorized` ステータスで失敗します。 If you add a context to your job and you are **not** a member of any of the security groups, the workflow will fail as `Unauthorized`.

**Note:** Bitbucket repositories do **not** provide an API that allows CircleCI contexts to be restricted, only GitHub projects include the ability to restrict contexts with security groups. Restricted Contexts are also **not** yet supported in private installations of CircleCI.

### コンテキストを使用できるセキュリティ グループの制限

以下のタスクを行えるのは、組織管理者のみです。

1. Navigate to Organization Settings > Contexts page in the CircleCI app. The list of contexts appears. セキュリティ グループはデフォルトで `All members` に設定され、組織内のすべてのユーザーにそのコンテキストを含むジョブの呼び出しが許可されます。
2. [Create Context (コンテキストを作成)] ボタンをクリックして新しいコンテキストを作成するか、既存のコンテキストの名前をクリックします。
3. [Add Group (グループを追加)] リンクをクリックします。 [Add Group (グループを追加)] ダイアログ ボックスが表示されます。
4. コンテキストに追加する GitHub チームまたは LDAP グループを選択し、[Add (追加)] ボタンをクリックします。 これで、選択したグループのみがコンテキストを使用できるように制限されます。
5. まだコンテキストに環境変数が追加されていない場合は、[Add Environment Variables (環境変数を追加)] をクリックして環境変数を指定し、[Add (追加)] ボタンをクリックします。 これで、セキュリティ グループのメンバーのみが、このコンテキストに設定された環境変数を使用できるように制限されます。
6. Navigate to Organization Settings > Contexts in the CircleCI app. The security groups appear in the Security column for the context.

これで、選択したグループのメンバーのみが、自分のワークフローでこのコンテキストを使用したり、このコンテキストに環境変数を追加、削除したりできるようになります。

### 制限付きコンテキストを使用するジョブの承認

ワークフローに承認ジョブを追加すると、制限付きコンテキストの使用を手動で承認できるようになります。

承認ジョブのダウンストリームにあるジョブの実行を制限するには、それらのダウンストリーム ジョブに制限付きコンテキストを追加します。

たとえば、特定のセキュリティ グループに制約されたジョブ C とジョブ D を実行する場合は、セキュリティ グループ付きのコンテキストを使用するジョブ C と D の前に承認ジョブ B を追加する必要があります。 このようにワークフロー内に 4 つのジョブを置くと、ジョブ A は無制約に実行でき、承認ジョブ B は任意のメンバーが承認できますが、承認後のジョブ C と D は、ジョブ C と D で使用されるコンテキストのセキュリティ グループ内のメンバーのみが実行できるようになります。

ジョブの承認者が制限付きコンテキストのセキュリティ グループに属していない場合、ジョブ B を承認することはできますが、ワークフロー内のジョブ C と D は Unauthorized として失敗します。 つまり、承認ジョブは、そのコンテキストに対して権限を持つグループに属さないユーザーも含め、すべてのユーザーに表示されます。 ダウンストリーム ジョブが Unauthorized として失敗した場合、ダウンストリーム ジョブのセキュリティ グループに属さないユーザーによって承認が行われたということを意味します。

## コンテキストからのグループの削除

コンテキストに関連付けられているすべてのグループを削除すると、組織管理者のみがそのコンテキストを使用できるようになります。 他のすべてのユーザーは、そのコンテキストへのアクセス権を失います。

### チームおよびグループへのユーザーの追加と削除

CircleCI では、数時間ごとに GitHub チームと LDAP グループが同期されます。 GitHub チームまたは LDAP グループにユーザーを追加または削除してから、CircleCI のレコードが更新され、コンテキストへのアクセス権が削除されるまでには、数時間を要します。

### 制限付きコンテキストへの環境変数の追加と削除

制限付きコンテキストへの環境変数の追加と削除は、コンテキスト グループのメンバーに限定されます。

## コンテキストの削除

コンテキストの使用が `All members` 以外のグループに制限されている場合、そのセキュリティ グループのメンバーでなければコンテキストを削除できません。

1. As an organization administrator, Navigate to the Settings > Contexts page in the CircleCI application.

2. 削除するコンテキストの [Delete Context (コンテキストを削除)] ボタンをクリックします。 確認ダイアログ ボックスが表示されます。

3. 「Delete」と入力し、[Confirm (確認)] をクリックすると、 コンテキストと、そのコンテキストに関連付けられたすべての環境変数が削除されます。 **Note:** If the context was being used by a job in a Workflow, the job will start to fail and show an error.

## 環境変数の使用方法

環境変数は、以下に示す優先順位に従って使用されます。

1. `FOO=bar make install` など、`run` ステップのシェル コマンド内で宣言された環境変数
2. `run` ステップで `environment` キーを使用して宣言された環境変数
3. ジョブで `environment` キーを使用して設定された環境変数
4. コンテナで `environment` キーを使用して設定された環境変数
5. コンテキスト環境変数 (ユーザーがコンテキストへのアクセス権を持つ場合)
6. [Project Settings (プロジェクト設定)] ページで設定されたプロジェクトレベルの環境変数
7. [CircleCI 環境変数に関するドキュメント]({{ site.baseurl }}/2.0/env-vars/#定義済み環境変数)で説明されている定義済みの特別な CircleCI 環境変数

`FOO=bar make install` のように、`run` ステップのシェル コマンドで宣言された環境変数は、`environment` キーおよび `contexts` キーを使用して宣言された環境変数よりも優先されます。 [Contexts (コンテキスト)] ページで追加された環境変数は、[Project Settings (プロジェクト設定)] ページで追加された変数よりも優先されます。 最後に、特別な CircleCI 環境変数がロードされます。

## シークレットのマスキング

コンテキストは、プロジェクトのシークレットやキーを保持します。シークレットやキーはアプリケーションにとってきわめて重要なものです。 セキュリティを強化するために、CircleCI ではビルドの出力に対してシークレットのマスキングを行い、コンテキストの `echo` 出力や `print` 出力を不明瞭なものにします。

以下の場合、コンテキストの値はビルドの出力でマスキングされません。

* コンテキストの値が 4 文字未満
* コンテキストの値が `true`、`True`、`false`、`False` のいずれか

**Note:** secret masking will only prevent the value of the context from appearing in your build output. コンテキストの値には、[SSH を使用したデバッグ]({{ site.baseurl }}/2.0/ssh-access-jobs)を行うユーザーがアクセスできます。

## 関連項目

[環境変数]({{ site.baseurl }}/2.0/env-vars/)<br>[ワークフロー]({{ site.baseurl }}/2.0/workflows/) 


