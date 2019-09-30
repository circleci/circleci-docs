---
layout: classic-docs
title: GitHub および Bitbucket のインテグレーション
description: GitHub または Bitbucket の使用
categories:
  - migration
Order: 60
---

This document provides an overview of using GitHub, GitHub Enterprise, or Bitbucket Cloud with CircleCI in the following sections:

- 目次
{:toc}

## 概要
{:.no_toc}

When you add a project to CircleCI, the following GitHub or Bitbucket Cloud settings are added to the repository using the permissions you gave CircleCI when you signed up:

- A **deploy key** that is used to check out your project from GitHub or Bitbucket Cloud.
- A **service hook (or "push hook")** that is used to notify CircleCI when you push to GitHub or Bitbucket Cloud.

CircleCI ビルドは、デフォルトでフックをプッシュします。 したがって、リポジトリのすべてのプッシュフックに対してビルドがトリガーされます。また、PUSH はビルドをトリガーする最も一般的なケースです。

There are some additional, less common cases where CircleCI uses hooks, as follows:

- CircleCI processes PR hooks (Pull Request Hooks) to store PR information for the CircleCI app. If the Only Build Pull Requests setting is set then CircleCI will only trigger builds when a PR is opened, or when there is a push to a branch for which there is an existing PR. これが設定されている場合でも、プロジェクトのデフォルトのブランチへのすべてのプッシュは、常にビルドされます。
- If the Build Forked Pull Requests setting is set, CircleCI will trigger builds in response to PRs created from forked repos.

It is possible to edit the webhooks in GitHub or Bitbucket Cloud to restrict events that trigger a build. Web フックの設定を編集することで、CircleCI に送信されるフックを変更できますが、ビルドをトリガーするフックの種類は変更されません。 CircleCI は、プッシュフックを必ずビルドし、(設定によっては) PR フックでもビルドを行います。ただし、Web フックの設定からプッシュフックを削除すると、ビルドを行いません。 詳細については、[GitHub の「Edit a Hook (フックを編集する)」](https://developer.github.com/v3/repos/hooks/#edit-a-hook)または [Atlassian の「Manage Webhooks (Web フックを管理する)」](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html)を参照してください。

タグプッシュのビルド方法については、「[Workflows におけるコンテキストとフィルターの使い方]({{ site.baseurl }}/ja/2.0/workflows/#workflows-におけるコンテキストとフィルターの使い方)」を参照してください。

### .circleci/config.yml ファイルの追加
{:.no_toc}

After you create and commit a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file to your GitHub or Bitbucket Cloud repository CircleCI immediately checks your code out and runs your first job along with any configured tests. たとえば、Postgres の仕様と機能を使用する Rails プロジェクトで作業している場合、ジョブ実行ステップの設定は以下のようになります。

```yaml
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4.1-jessie
    steps:
      - run: |
          bundle install
          bundle exec rake db:schema:load
          bundle exec rspec spec
          bundle exec cucumber
```

CircleCI は、毎回クリーンなコンテナでテストを実行します。そのため、他のユーザーはコードにアクセスできず、ユーザーがプッシュするたびにテストが新しく実行されます。 [ダッシュボード](https://circleci.com/dashboard){:rel="nofollow"}では、テストの状況が更新されるのをリアルタイムで確認でき、ジョブ終了後には CircleCI から電子メール通知が送信され、ステータスを確認できます。 Status badges also appear on GitHub or Bitbucket Cloud as shown in the following screenshot for a commit from user keybits:

![コミット後のステータスバッジ]({{ site.baseurl }}/assets/img/docs/status_badge.png)

プルリクエスト画面にはステータスがまとめて表示され、すべてのテストに合格すると以下のように表示されます。

![PR 後のステータスバッジ]({{ site.baseurl }}/assets/img/docs/status_check.png)

## Best Practices for Keys

- Use Deploy Keys whenever possible.
- When Deploy Keys cannot be used, Machine User Keys must be used, and have their access restricted to the most limited set of repos and permissions necessary.
- Never use non-Machine user keys (keys should be associated with the build, not with a specific person).
- You must rotate the Deploy or User key as part of revoking user access to that repo. 
    1. After revoking the user’s access in github, delete keys in GitHub.
    2. Delete the keys in the CircleCI project.
    3. Regenerate the keys in CircleCI project.
- Ensure no developer has access to a build in a repo with a User Key that requires more access than they have.

## Enable Your Project to Check Out Additional Private Repositories

テストプロセスが複数のリポジトリを参照する場合、各デプロイキーは *1つ*のリポジトリに対してのみ有効であるのに対して、GitHub ユーザーキーは、ユーザーの*すべて*の GitHub リポジトリに対してアクセス権を持つため、CircleCI はデプロイキーの他に GitHub ユーザーキーを必要とします。 詳細については、「[CircleCI に SSH 鍵を登録する]({{ site.baseurl }}/ja/2.0/add-ssh-key)」を参照してください。

プロジェクトの **[Project Settings (プロジェクト設定)] > [Checkout SSH keys (SSH キーをチェックアウト)]** ページで、CircleCI に渡す GitHub のユーザーキーを指定します。 CircleCI は、この新しい SSH 鍵を作成し、それを GitHub のユーザーアカウントに関連付けて、ユーザーのすべてのリポジトリにアクセスできるようにします。

<h2 id="security">User key security</h2>

CircleCI が SSH 鍵を公開することはありません。

SSH 鍵は信頼するユーザーとのみ共有してください。また、ユーザーキーを使用するプロジェクトの GitHub コラボレーターはだれでもリポジトリにアクセスできるため、ソースコードを任せられる人にのみユーザーキーを共有してください。

<h2 id="error-messages">User key access-related error messages</h2>

ユーザーキーの追加が必要なときに表示される一般的なエラーを示します。

**Python**：`pip install` ステップ実行中

    ERROR: Repository not found.
    

**Ruby**：`bundle install` ステップ実行中

    Permission denied (publickey).
    

## Controlling Access Via a Machine User

For fine-grained access to multiple repositories, it is best practice to create a machine user for your CircleCI projects. [マシンユーザー](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users)とは、自動化タスクを実行するためにユーザーが作成する GitHub ユーザーです。 マシンユーザーの SSH 鍵を使用すれば、リポジトリのアクセス権を持つ任意のユーザーにプロジェクトのビルド、テスト、デプロイを許可することができます。 マシンユーザーを作成することにより、単一ユーザーにリンクされた認証情報を失う危険性も低下します。

マシンユーザーの SSH 鍵を使用するには、以下の手順を行います。

**メモ：**これらの手順を実行するには、マシンユーザーが管理者アクセス権を持っている必要があります。 プロジェクトの追加が終了したら、マシンユーザーのアクセス権を読み取り専用に戻すことができます。

1. [GitHub の説明](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users)に従ってマシンユーザーを作成します。

2. GitHub にマシンユーザーとしてログインします。

3. [CircleCI にログイン](https://circleci.com/login)します。 CircleCI を承認するように GitHub から要求されたら、[**Authorize application (アプリケーションを承認)**] ボタンをクリックします。

4. [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページで、マシンユーザーにアクセスを許可するすべてのプロジェクトをフォローします。

5. **[Project Settings (プロジェクト設定)] > [Checkout SSH keys (SSH キーをチェックアウト)]** ページで、[**Authorize With GitHub (GitHub で承認)**] ボタンをクリックします。 これで、マシンユーザーの代わりに SSH 鍵を作成して GitHub にアップロードする権限が CircleCI に付与されます。

6. [**Create and add XXXX user key (XXXX ユーザーキーを作成して追加)**] ボタンをクリックします。

これで、CircleCI はビルド中に実行されるすべての Git コマンドに対して、マシンユーザーの SSH 鍵を使用するようになります。

## Permissions Overview

CircleCI は、VCS プロバイダーに対して、[GitHub の権限モデル](http://developer.github.com/v3/oauth/#scopes)や [Bitbucket の権限モデル](https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html#OAuthonBitbucketCloud-Scopes)で定義されている以下の権限を要求します。

**Read Permission**

- Get a user's email address

**Write Permissions**

- Add deploy keys to a repo
- Add service hooks to a repo
- Get a list of a user's repos
- Add an SSH key to a user's account

**メモ：**CircleCI は絶対に必要な権限しか要求しません。 また、CircleCI が要求できる権限は、各 VCS プロバイダーが提供すると決めた特定の権限に制限されます。 たとえば、GitHub は読み取り専用のアクセス権を提供していないため、ユーザーのリポジトリリストを GitHub から取得するには、書き込みアクセス権が必要です。

CircleCI が使用する権限の数をどうしても減らしたいと考える場合は、VCS プロバイダーに連絡して、その旨を伝えてください。

### チームアカウントの権限
{:.no_toc}

このセクションでは、さまざまなビジネスニーズに応じて選択できるチームアカウントと個人アカウントについて概要を説明します。

1. 個人用 GitHub アカウントを持っている個人ユーザーは、それを使用して CircleCI にログインし、CircleCI 上のプロジェクトをフォローします。 GitHub 内のそのリポジトリの各「コラボレーター」も、そのプロジェクトをフォローでき、コミットをプッシュして、CircleCI でビルドを実行できます。 GitHub と Bitbucket での保存方法が原因で、CircleCI の [Team (チーム)] ページにコラボレーターの一覧が完全に表示されない場合があります。 正確なコラボレーター一覧は、GitHub または Bitbucket のプロジェクトページで確認してください。

2. 個人ユーザーが GitHub チームアカウントにアップグレードすると、チームメンバーを追加したり、ビルドを実行するメンバーにリポジトリの管理者権限を与えたりできるようになります。 組織のメンバーが各自のアカウントからプロジェクトをフォローできるようにするには、GitHub チームアカウント (組織) のオーナーが CircleCI の [[Add Project (プロジェクトの追加)]](https://circleci.com/add-projects){:rel="nofollow"} ページにアクセスして GitHub のアプリケーション権限画面へのリンクをクリックし、[Authorize CircleCI (CircleCI を承認)] を選択する必要があります。 個人アカウントの料金は月額 7ドル、チームアカウントの料金はメンバーが 2人の場合で月額 25ドルです。

3. Bitbucket の個人アカウントでは、最大 5人のチームでプライベートリポジトリを無料で作成できます。 個人ユーザーは、Bitbucket チームの作成、メンバーの追加を行えるほか、ビルドを実行する必要があるメンバーに対して必要に応じてリポジトリの管理者権限を与えることもできます。 このプロジェクトは、CircleCI 上でプロジェクトをフォローするメンバーに表示されます。追加料金はかかりません。

### GitHub 組織で CircleCI を再有効化する方法
{:.no_toc}

このセクションでは、GitHub 組織に対してサードパーティ製アプリケーションの制限を有効にしてから CircleCI を再有効化する方法を説明します。 [GitHub の設定](https://github.com/settings/connections/applications/78a2ba87f071c28e65bb)に移動し、[Organization access (組織のアクセス)] セクションで以下のいずれかを行います。

- "Request access" if you are not an admin for the organization in question (an admin will have to approve the request) or
- "Grant access" if you are an admin

アクセスが許可されると、CircleCI は再度正常に動作するようになります。

GitHub では、最近[サードパーティ製アプリケーションのアクセスを組織レベルで許可](https://help.github.com/articles/about-third-party-application-restrictions/)できるようになりました。 この変更前は、組織のメンバーはだれでも (GitHub のユーザーアカウントに関連付けられる OAuth トークンを生成して) アプリケーションを承認できました。また、アプリケーションは、その OAuth トークンを使用して、OAuth フローで付与された権限の範囲内で API 経由でユーザーのための処理を実行しました。

現在、デフォルトでは、サードパーティのアクセス制限が有効になっている場合、OAuth トークンは組織のデータにアクセスできません。 ユーザーは、OAuth 処理中またはそれ以降に、組織単位でアクセス許可を明確にリクエストする必要があり、組織の管理者はそのリクエストを承認する必要があります。

サードパーティのアクセス制限を有効にするには、GitHub で組織の設定ページにアクセスし、[Third-party application access policy (サードパーティ製アプリケーションのアクセスポリシー)] セクションにある [Setup application access restrictions (アプリケーションのアクセス制限をセットアップ)] ボタンをクリックします。

CircleCI がビルドを実行している組織でこの制限を有効にすると、CircleCI は GitHub からプッシュイベントフックを受け取らなくなり (新しいプッシュのビルドを行わなくなり)、API 呼び出しが拒否されます (これにより、たとえば古いビルドをリビルドしたときに、ソースのチェックアウトが失敗します)。CircleCI を再度動作させるには、CircleCI アプリケーションへのアクセスを許可する必要があります。

CircleCI が使用しているアカウントと権限のシステムは、まだ十分に明確と言えません。前述のとおり、CircleCI ではユーザーの皆様を第一に考えて、さらに改良したシステムを現在開発中です。

## Deployment Keys and User Keys

**デプロイキーとは**

新しいプロジェクトを追加すると、CircleCI はプロジェクトの Web ベース VCS (GitHub または Bitbucket) 上にデプロイキーを作成します。 デプロイキーは、リポジトリ固有の SSH 鍵です。 VCS として GitHub を使用している場合、GitHub はパブリックキーを持っており、CircleCI はプライベートキーを格納します。 デプロイキーは、CircleCI に単一のリポジトリへのアクセス権を提供します。 CircleCI によるリポジトリへのプッシュを防止するには、このデプロイキーを読み取り専用に設定します。

ビルドからリポジトリにプッシュするには、書き込みアクセス権のあるデプロイキー (ユーザーキー) が必要です。 ユーザーキーの作成手順は、VCS によって異なります。

**ユーザーキーとは**

ユーザーキーは、ユーザーに固有の SSH 鍵です。 VCS はパブリックキーを持っており、CircleCI はプライベートキーを格納します。 プライベートキーを持っていると、プロジェクトへの「Git」アクセスの目的で、そのユーザーとして行動することができます。

### Creating a GitHub Deploy Key
{:.no_toc}

この例では、GitHub リポジトリは `https://github.com/you/test-repo`、CircleCI のプロジェクトは <https://circleci.com/gh/you/test-repo>{:rel="nofollow"} です。

1. [GitHub の説明](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)に従って、SSH 鍵ペアを作成します。 パスフレーズの入力を求められても、**入力しない**でください。

**注意：**最近 `ssh-keygen` は、デフォルトで PEM 形式のキーを生成しないようにアップデートされました。 プライベートキーが `-----BEGIN RSA PRIVATE KEY-----` で始まらない場合、`ssh-keygen -m PEM -t rsa -C "your_email@example.com"` でキーを生成すると、強制的に PEM 形式で生成できます。

2. `https://github.com/you/test-repo/settings/keys` に移動し、[Add deploy key (デプロイキーを追加)] をクリックします。 [Title (タイトル)] フィールドにタイトルを入力し、手順 1 で作成したキーをコピー＆ペーストします。 [Allow write access (書き込みアクセスを許可)] をオンにし、[Add key (キーを追加)] をクリックします。

3. <https://circleci.com/gh/you/test-repo/edit#ssh>{:rel="nofollow"} に移動し、手順 1 で作成したキーを追加します。 [Hostname (ホスト名)] フィールドに「github.com」と入力し、送信ボタンを押します。

4. config.yml で `add_ssh_keys` キーを使用して、以下のようにフィンガープリントを追加します。

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

ジョブから GitHub リポジトリにプッシュすると、CircleCI は追加された SSH 鍵を使用します。

### Bitbucket ユーザーキーの作成
{:.no_toc}

現在、Bitbucket は、ユーザーキーを作成する API を CircleCI に提供していません。 しかし、以下の回避策でユーザーキーを作成できます。

1. CircleCI アプリケーションで、プロジェクトの設定に移動します。

2. **[Checkout SSH Keys (SSH 鍵のチェックアウト)]** ページに移動します。

3. **[Create `<username>` user key (`<ユーザー名>` のユーザーキーの作成)]** ボタンを右クリックし、**[Inspect (検査)]** オプションを選択して、ブラウザーの検査ツールを開きます。![]({{ site.baseurl }}/assets/img/docs/bb_user_key.png)

4. 開発者コンソールで、**[Network (ネットワーク)]** タブを選択します。![]({{ site.baseurl }}/assets/img/docs/bb_user_key2.png)

5. 開発者コンソールで、ステータスが 201 の `checkout-key` をクリックし、`public_key` をクリップボードにコピーします。

6. Bitbucket の [SSH 鍵の設定方法](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html)の説明に従って、Bitbucket にキーを追加します。

7. `.circleci/config.yml` で `add_ssh_keys` キーを使用して、以下のようにフィンガープリントを追加します。

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

### これらのキーの使用方法

CircleCI がプロジェクトをビルドするときには、プライベートキーが `.ssh` ディレクトリにインストールされ、それに続いて SSH がバージョン管理プロバイダーと通信するように設定されます。 Therefore, the private key is used for:

- checking out the main project
- checking out any GitHub-hosted submodules
- checking out any GitHub-hosted private dependencies
- automatic git merging/tagging/etc.

そのため、デプロイキーは、追加のプライベート依存関係を持つプロジェクトに対しては十分に強力ではありません。

### これらのキーのセキュリティ

CircleCI が生成するチェックアウトキーペアのプライベートキーは CircleCI システムを出ることはなく (パブリックキーのみ GitHub に転送)、また、ストレージ上では安全に暗号化されています。 However, since the keys are installed into your build containers, any code that you run in CircleCI can read them. Likewise, developers that can SSH in will have direct access to this key.

**デプロイキーとユーザーキーの違い**

GitHub がサポートするキータイプは、デプロイキーとユーザーキーだけです。 デプロイキーはグローバルに一意であり (たとえば、複数のリポジトリへのアクセス権を持つデプロイキーを作成するメカニズムはありません)、またユーザーキーには、それに関連付けられているユーザーから分離した*スコープ*の概念はありません。

複数のリポジトリへのアクセス権をきめ細かく設定するには、GitHub でマシンユーザーと呼ばれるものの作成を検討してください。 このユーザーにビルドが必要とする権限を正確に付与し、次にそのユーザーキーを CircleCI 上の プロジェクトに関連付けます。