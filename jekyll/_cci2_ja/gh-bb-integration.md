---
layout: classic-docs
title: GitHub と Bitbucket のインテグレーション
description: GitHub または Bitbucket の使用
categories:
  - migration
Order: 60
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

以下のセクションに沿って、CircleCI での GitHub、GitHub Enterprise、または Bitbucket Cloud の利用について概説します。

* 目次
{:toc}

## 概要
{: #overview }

{:.no_toc}

CircleCI を使用する際には、 VCS として GitHub もしくは BitBucket を使用する必要があります。 プロジェクトを CircleCI に追加すると、ユーザー登録時に CircleCI に与えた権限に基づいて、以下の GitHub または Bitbucket Cloud の設定がリポジトリに追加されます。

- **デプロイ キー**: GitHub または Bitbucket Cloud からプロジェクトをチェックアウトするために使用されます。
- **サービス フック**: GitHub または Bitbucket Cloud にプッシュしたときに CircleCI に通知を送信するために使用されます。

CircleCI のデフォルトでは、プッシュ フックでビルドが行われます。 したがって、リポジトリのすべてのプッシュ フックに対してビルドがトリガーされます。 また、プッシュはビルドをトリガーする最も一般的なケースです。

あまり一般的ではありませんが、CircleCI は以下の場合にもフックを使用します。

- CircleCI は PR フック (プル リクエスト フック) を処理して、CircleCI アプリケーションの PR 情報を保存します。 [Only Build Pull Requests (プル リクエストのみビルド)] が設定されていると、CircleCI は PR がオープンされたとき、または既存の PR が存在するブランチへのプッシュがあったときだけ、ビルドをトリガーします。 これが設定されている場合でも、プロジェクトのデフォルト ブランチへのプッシュはすべて、常にビルドされます。
- [Build Forked Pull Requests (フォークされたプル リクエストをビルド)] が設定されている場合、CircleCI はフォークされたリポジトリから作成された PR に応答してビルドをトリガーします。

GitHub または Bitbucket Cloud で Web フックを編集して、ビルドをトリガーするイベントを制限できます。 Editing the webhook settings lets you change which hooks get sent to CircleCI, but doesn't change the types of hooks that trigger builds. CircleCI will always build push hooks and will build on PR hooks (depending on settings), but if you remove push hooks from the webhook settings CircleCI won't build. 詳細については、[GitHub の「Edit a Hook (フックを編集する)」](https://developer.github.com/v3/repos/hooks/#edit-a-hook)または [Atlassian の「Manage Webhooks (Web フックを管理する)」](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html)を参照してください。

タグ プッシュでのビルド方法については、「[ワークフローにおけるコンテキストとフィルターの使用]({{ site.baseurl }}/ja/2.0/workflows/#ワークフローにおけるコンテキストとフィルターの使用)」を参照してください。

### .circleci/config.yml ファイルの追加
{: #add-a-circleciconfigyml-file }

{:.no_toc}

[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルを作成して GitHub または Bitbucket Cloud リポジトリにコミットすると、CircleCI は直ちにユーザー コードをチェックアウトし、設定されているテストがあればそれを含めて、最初のジョブを実行します。 たとえば、Postgres の仕様と機能を使用する Rails プロジェクトで作業している場合、ジョブ実行ステップの構成は以下のようになります。

```yaml
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4.1-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    steps:
      - run: |
          bundle install
          bundle exec rake db:schema:load
          bundle exec rspec spec
          bundle exec cucumber
```

CircleCI は、毎回クリーンなコンテナでテストを実行します。 そのため、他のユーザーはコードにアクセスできず、ユーザーがプッシュするたびにテストが新しく実行されます。 [ダッシュボード](https://circleci.com/dashboard){:rel="nofollow"}では、テストの状況が更新されるのをリアルタイムで確認でき、ジョブ終了後には CircleCI からメール通知が送信され、ステータスを確認できます。 また、GitHub または Bitbucket Cloud には、以下のスクリーンショット (ユーザー keybits からのコミット) のように、ステータス バッジが表示されます。

![PR 後のステータス バッジ]({{ site.baseurl }}/assets/img/docs/status_badge.png)

プル リクエスト画面にもステータスが表示され、すべてのテストに合格すると以下のように表示されます。

![コミット後のステータス バッジ]({{ site.baseurl }}/assets/img/docs/status_check.png)

## キーのベスト プラクティス
{: #best-practices-for-keys }

- 可能な限り、デプロイ キーを使用します。
- デプロイ キーを使用できない場合は、マシン ユーザー キーを使用し、必要最低限のリポジトリと権限にのみアクセスできるように制限します。
- マシン ユーザー キー以外のユーザー キーは使用しないでください (キーは特定のユーザーではなく、ビルドに関連付ける必要があります)。
- リポジトリへのユーザー アクセスを取り消す場合、デプロイ キーまたはユーザー キーを交換する必要があります。
  1. GitHub へのユーザー アクセスを取り消した後、GitHub でキーを削除します。
  2. CircleCI プロジェクトでキーを削除します。
  3. CircleCI プロジェクトでキーを再生成します。
- 開発者自身が所有する以上のアクセス権を必要とするリポジトリのビルドに、開発者がユーザー キーを使用してアクセスできないようにします。

## プロジェクトで追加のプライベート リポジトリのチェックアウトの有効化
{: #renaming-orgs-and-repositories }

ユーザー キーを追加する必要があることを示す一般的なエラーとしては、以下のものが挙げられます。

1. VCS 上で Organization 及びリポジトリの名称を変更します。
2. Head to the CircleCI application, using the new org/repo name, for example, `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`.
3. Confirm that your plan, projects and settings have been transferred successfully.
4. You are then free to create a new org/repo with the previously-used name in your VCS, if desired.

**Note**: If these steps are not followed, you might lose access to your org or repo settings, including **environment variables** and **contexts**.

### チーム アカウントの権限
{: #bitbucket-personal-orgs }

CircleCI expects that your personal/default org matches your VCS username. Bitbucket now supports renaming your personal workspace to differ from your username; however, this is not currently supported by CircleCI. If you are building projects in your personal workspace with CircleCI, please ensure its name matches your username.

## Enable your project to check out additional private repositories
{: #enable-your-project-to-check-out-additional-private-repositories }

テスト プロセスが複数のリポジトリを参照する場合、CircleCI ではデプロイ キーに加えて GitHub ユーザー キーも必要となります。 これは、 GitHub ユーザー キーはユーザーの*すべて*の GitHub リポジトリに対してアクセス権を持ちますが、デプロイ キーは*単一の*リポジトリに対してのみ有効であるためです。

Provide CircleCI with a GitHub user key in your project's **Project Settings** > **SSH keys**. プロジェクトの **[Project Settings (プロジェクト設定)] > [SSH Keys (SSH 鍵)]** のページで、 **[User Key (ユーザー鍵)]** のセクションまでスクロールで移動し、 **[Authorize with GitHub (GitHub で認証する)]** ボタンをクリックします。 CircleCI は、この新しい SSH 鍵を作成し、それを GitHub のユーザー アカウントに関連付けて、ユーザーのすべてのリポジトリにアクセスできるようにします。

## ユーザー キーのセキュリティ
{: #user-key-security }

CircleCI が SSH 鍵を公開することはありません。

SSH 鍵は信頼するユーザーとのみ共有してください。 また、ユーザー キーを使用するプロジェクトの場合、すべての GitHub コラボレーターがリポジトリにアクセスできるため、ソース コードを任せられる人にのみユーザー キーを共有してください。

## ユーザーキーアクセスに関するエラーメッセージ
{: #user-key-access-related-error-messages }

ユーザー キーを追加する必要があることを示す一般的なエラーとしては、以下のものが挙げられます。

**Python**: `pip install` ステップ実行中

```
ERROR: Repository not found.
```

**Ruby**: `bundle install` ステップ実行中

```
Permission denied (publickey).
```

## マシンユーザーによるアクセス制御
{: #controlling-access-via-a-machine-user }

複数のリポジトリへのアクセス権をきめ細かく設定するには、CircleCI プロジェクト用にマシン ユーザーを作成することをお勧めします。 [マシン ユーザー](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users)とは、自動化タスクを実行するために作成する GitHub ユーザーです。 マシン ユーザーの SSH 鍵を使用すれば、リポジトリへのアクセス権を持つ任意のユーザーにプロジェクトのビルド、テスト、デプロイを許可することができます。 マシン ユーザーを作成することにより、単一ユーザーにリンクされた認証情報を紛失するリスクも緩和できます。

マシンユーザーのSSHキーを使用するには、以下の手順で行います。

**メモ:** これらの手順を実行するには、マシン ユーザーが管理者アクセス権を持っている必要があります。 プロジェクトの追加が終了したら、マシン ユーザーのアクセス権を読み取り専用に戻すとよいでしょう。

1. [GitHub の説明](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users)に従ってマシン ユーザーを作成します。

2. GitHub にマシンユーザーとしてログインします。

3. [CircleCI にログイン](https://circleci.com/login)します。 CircleCI を承認するよう GitHub から要求されたら、[**Authorize application (アプリケーションを承認)**] ボタンをクリックします。

4. From the Add Projects page, follow all projects you want the machine user to have access to.

5. **[Project Settings (プロジェクト設定)] > [Checkout SSH keys (SSH 鍵のチェック アウト)]** ページで、[**Authorize With GitHub (GitHub で承認)**] ボタンをクリックします。 これで、マシン ユーザーの代わりに SSH 鍵を作成して GitHub にアップロードする権限が CircleCI に付与されます。

6. **[Create and add XXXX user key (XXXX ユーザー キーを作成して追加)]** ボタンをクリックします。

Now, CircleCI will use the machine user's SSH key for any Git commands that run during your builds.

## パーミッションの概要
{: #permissions-overview }

サードパーティのアクセス制限を有効にするには、GitHub で組織の設定ページにアクセスし、[Third-party application access policy (サードパーティ製アプリケーションのアクセス ポリシー)] セクションにある [Setup application access restrictions (アプリケーションのアクセス制限をセットアップ)] ボタンをクリックします。

**読み取りアクセス権**

- ユーザーのメール アドレスを取得する

**書き込みアクセス権**

- リポジトリにデプロイ キーを追加する
- リポジトリにサービス フックを追加する

**Admin Permissions**, needed for setting up a project

- デプロイ キーのリポジトリへの追加
- サービス フックのレポジトリへの追加

**メモ:** CircleCI は絶対に必要な権限しか要求しません。 また、CircleCI が要求できる権限は、各 VCS プロバイダーが提供すると決めた権限のみに制限されます。 たとえば、 GitHub からユーザーのリポジトリ (公開・非公開の両方) の一覧を GitHub から取得する際には、 [`repo` スコープ](https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/#available-scopes) の権限が必要で、これは書き込みアクセス権に相当します。 GitHub は読み取り専用のアクセス権の設定に対応していないため、このような設定が必要になります。

CircleCI が使用する権限の数をどうしても減らしたい場合は、VCS プロバイダーに連絡して、その旨を伝えてください。


### GitHub 組織で CircleCI を再有効化する方法
{: #how-to-re-enable-circleci-for-a-github-organization }

{:.no_toc}

このセクションでは、GitHub 組織に対してサードパーティ製アプリケーションの制限を有効にしてから CircleCI を再有効化する方法を説明します。 Go to [GitHub Settings](https://github.com/settings/connections/applications/78a2ba87f071c28e65bb) and in the "Organization access" you will have the option to request accesss if you are not an admin, or grant access if you are an admin.

#### Non-admin member workflow
{: #non-admin-member-workflow }
{:.no_toc}

- If you are member of a GitHub org (not an admin), click the “Request” button and a message will be sent to an admin of your organization. An admin will have to approve the request.
- Click “Request approval from owners” to send an email to your organization’s owners.
- While waiting for approval, you will see “Access request pending” next to your company organization’s name.
- If CircleCI has been approved by your organization, you will see a checkmark next to your organization’s name.

#### Admin owner workflow
{: #admin-owner-workflow }
{:.no_toc}

- If you are an owner of your organization (an admin), you may grant access to CircleCI by clicking on the “Grant” button.
- You may be asked to confirm your password in order to authorize our app.
- Once you’ve approved CircleCI, you will see a checkmark next to your organization’s name.

After access is granted, CircleCI should behave normally again.

GitHub recently added the ability to approve [third party application access on a per-organization level](https://help.github.com/articles/about-third-party-application-restrictions/). Before this change, any member of an organization could authorize an application (generating an OAuth token associated with their GitHub user account), and the application could use that OAuth token to act on behalf of the user via the API with whatever permissions were granted during the OAuth flow.

Now OAuth tokens will, by default, not have access to organization data when third party access restrictions are enabled. You must specifically request access on a per organization basis, either during the OAuth process or later, and an organization admin must approve the request.

You can enable third party access restrictions by visiting the organization settings page on GitHub, and clicking "Setup application access restrictions" button in the "Third-party application access policy" section.

If you enable these restrictions on an organization for which CircleCI has been running builds then we will stop receiving push event hooks from GitHub (thus not building new pushes), and API calls will be denied (causing, for instance, re-builds of old builds to fail the source checkout.) To get CircleCI working again you have to grant access to the CircleCI application.

The account and permissions system we use is not as clear as we would like and as mentioned we have a much improved system in development with users as first class citizens in CircleCI.

## SSH ホストの信頼性の確立
{: #deployment-keys-and-user-keys }

**What is a deploy key?**

When you add a new project, CircleCI creates a deployment key on the web-based VCS (GitHub or Bitbucket) for your project. A deploy key is a repo-specific SSH key. If you are using GitHub as your VCS then GitHub has the public key, and CircleCI stores the private key. The deployment key gives CircleCI access to a single repository. To prevent CircleCI from pushing to your repository, this deployment key is read-only.

If you want to push to the repository from your builds, you will need a deployment key with write access. The steps to create a deployment key with write access depend on your VCS. See below for GitHub-specific instructions.

**What is a user key?**

A user key is a user-specific SSH key. Your VCS has the public key, and CircleCI stores the private key. Possession of the private key gives the ability to act as that user, for purposes of 'git' access to projects.

### GitHub のデプロイ キーの作成
{: #creating-a-github-deploy-key }

{:.no_toc}

In this example, the GitHub repository is `https://github.com/you/test-repo`, and the CircleCI project is `https://circleci.com/gh/you/test-repo`.

1. [GitHub の説明](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)に従い、下記コマンドを実行しSSH 鍵ペアを作成します。 パスフレーズの入力を求められても、**入力しない**でください。
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. `https://github.com/you/test-repo/settings/keys` に移動し、[Add deploy key (デプロイ キーを追加)] をクリックします。 [Title (タイトル)] フィールドにタイトルを入力し、手順 1 で作成した鍵をコピーして貼り付けます。 [Allow write access (書き込みアクセスを許可)] をオンにし、[Add key (キーを追加)] をクリックします。

3. プロジェクトの設定画面に移動し、 [SSH Key (SSH 鍵)]、 [Add SSH key (SSH 鍵の追加)] の順にクリックし、手順 1 で作成した鍵を追加します。 [Hostname (ホスト名)] フィールドに「github.com」と入力し、送信ボタンを押します。

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

When you push to your GitHub repository from a job, CircleCI will use the SSH key you added.

### Bitbucket ユーザー キーの作成
{: #creating-a-bitbucket-user-key }

{:.no_toc}

Bitbucket does not currently provide CircleCI with an API to create user keys. However, it is still possible to create a user key by following this workaround:

1. CircleCI アプリケーションで、プロジェクトの設定に移動します。

2. **[Checkout SSH Keys (SSH 鍵のチェックアウト)]** ページに移動します。

3. **[Create `<username>` user key (`<ユーザー名>` のユーザー キーの作成)]** ボタンを右クリックし、**[Inspect (検査)]** オプションを選択して、ブラウザーの検査ツールを開きます。

4. 開発者コンソールで、**[Network (ネットワーク)]** タブを選択します。

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
{: #how-are-these-keys-used }

When CircleCI builds your project, the private key is installed into the `.ssh` directory and SSH is subsequently configured to communicate with your version control provider. Therefore, the private key is used for:

- checking out the main project
- checking out any GitHub-hosted submodules
- checking out any GitHub-hosted private dependencies
- automatic git merging/tagging/etc.

For this reason, a deploy key isn't sufficiently powerful for projects with additional private dependencies.

### これらのキーのセキュリティ
{: #what-about-security }

The private keys of the checkout keypairs CircleCI generates never leave the CircleCI systems (only the public key is transmitted to GitHub) and are safely encrypted in storage. However, since the keys are installed into your build containers, any code that you run in CircleCI can read them. Likewise, developers that can SSH in will have direct access to this key.

**Isn't there a difference between deploy keys and user keys?**

Deploy keys and user keys are the only key types that GitHub supports. Deploy keys are globally unique (for example, no mechanism exists to make a deploy key with access to multiple repositories) and user keys have no notion of _scope_ separate from the user associated with them.

To achieve fine-grained access to more than one repo, consider creating what GitHub calls a machine user. Give this user exactly the permissions your build requires, and then associate its user key with your project on CircleCI.

## SSH ホストの信頼性の確立
{: #establishing-the-authenticity-of-an-ssh-host }

When using SSH keys to checkout repositories, it may be necessary to add the fingerprints for GitHub or BitBucket to a "known hosts" file (`~/.ssh/known_hosts`) so that the executor can verify that the host it's connecting to is authentic. The `checkout`job step does this automatically, so the following command will need to be used if you opt to use a custom checkout command.

```
mkdir -p ~/.ssh

echo 'github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
bitbucket.org ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAubiN81eDcafrgMeLzaFPsw2kNvEcqTKl/VqLat/MaB33pZy0y3rJZtnqwR2qOOvbwKZYKiEO1O6VqNEBxKvJJelCq0dTXWT5pbO2gDXC6h6QDXCaHo6pOHGPUy+YBaGQRGuSusMEASYiWunYN0vCAI8QaXnWMXNMdFP3jHAJH0eDsoiGnLPBlBp4TNm6rYI74nMzgz3B9IikW4WVK+dc8KZJZWYjAuORU3jc1c/NPskD2ASinf8v3xnfXeukU0sJ5N6m5E8VLjObPEO+mN2t/FZTMZLiFqPWc/ALSqnMnnhwrNi2rbfg/rd/IpL8Le3pSBne8+seeFVBoGqzHM9yXw==
' >> ~/.ssh/known_hosts
```

SSH keys for servers can be fetched by running `ssh-keyscan <host>`, then adding the key that is prefixed with `ssh-rsa` to the `known_hosts` file of your job. You can see this in action here:

```
➜  ~ ssh-keyscan github.com           
# github.com:22 SSH-2.0-babeld-2e9d163d
github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
# github.com:22 SSH-2.0-babeld-2e9d163d
# github.com:22 SSH-2.0-babeld-2e9d163d
➜  ~ ✗
```

You can add the key to known_hosts by running the following command:
```
ジョブから GitHub リポジトリにプッシュすると、CircleCI は追加された SSH 鍵を使用します。
```
