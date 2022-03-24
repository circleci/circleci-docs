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

ここでは、CircleCI での GitHub、GitHub Enterprise、または Bitbucket Cloud の利用について概説します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

CircleCI を使用する際には、 VCS として GitHub もしくは BitBucket を使用する必要があります。 プロジェクトを CircleCI に追加すると、ユーザー登録時に CircleCI に与えた権限に基づいて、以下の GitHub または Bitbucket Cloud の設定がリポジトリに追加されます。

- **デプロイ キー**: GitHub または Bitbucket Cloud からプロジェクトをチェックアウトするために使用されます。
- **サービス フック**: GitHub または Bitbucket Cloud にプッシュしたときに CircleCI に通知を送信するために使用されます。

CircleCI のデフォルトでは、プッシュフックでビルドが行われます。 したがって、リポジトリのすべてのプッシュフックに対してビルドがトリガーされます。また、プッシュはビルドをトリガーする最も一般的なケースです。

あまり一般的ではありませんが、CircleCI は以下の場合にもフックを使用します。

- CircleCI は PR フック (プルリクエストフック) を処理して、CircleCI アプリケーションの PR 情報を保存します。 [Only Build Pull Requests (プル リクエストのみビルド)] が設定されていると、CircleCI は PR がオープンされたとき、または既存の PR が存在するブランチへのプッシュがあったときだけ、ビルドをトリガーします。 これが設定されている場合でも、プロジェクトのデフォルトのブランチへのすべてのプッシュは、常にビルドされます。
- [Build Forked Pull Requests (フォークされたプル リクエストをビルド)] が設定されている場合、CircleCI はフォークされたリポジトリから作成された PR に応答してビルドをトリガーします。

GitHub または Bitbucket Cloud で Web フックを編集して、ビルドをトリガーするイベントを制限できます。 Web フックの設定を編集することで、CircleCI に送信されるフックを変更できますが、ビルドをトリガーするフックの種類は変更されません。 CircleCI は常にプッシュフックでビルドを行い、設定によっては PR フックでもビルドを行います。ただし、Web フックの設定からプッシュフックを削除すると、ビルドを行いません。 詳細については、[GitHub の「Edit a Hook (フックを編集する)」](https://developer.github.com/v3/repos/hooks/#edit-a-hook)または [Atlassian の「Manage Webhooks (Web フックを管理する)」](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html)を参照してください。

タグプッシュでのビルド方法については、「[ワークフローにおけるコンテキストとフィルターの使用]({{site.baseurl}}/2.0/workflows/#ワークフローにおけるコンテキストとフィルターの使用)」を参照してください。

### .circleci/config.yml ファイルの追加
{: #add-a-circleciconfigyml-file }
{:.no_toc}

[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルを作成して GitHub または Bitbucket Cloud リポジトリにコミットすると、CircleCI は直ちにユーザーコードをチェックアウトし、設定されているテストがあればそれを含めて、最初のジョブを実行します。 例えば、Postgres の機能を駆使した Rails のプロジェクトに携わっているなら、下記のような run ステップのジョブを記述することになります。

```yaml
jobs:
  build:
    docker:
      - image: cimg/ruby:3.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD # context / project UI env-var reference
    steps:
      - run: |
          bundle install
          bundle exec rake db:schema:load
          bundle exec rspec spec
          bundle exec cucumber
```

CircleCI は毎回まっさらな閉じた環境のコンテナ上でテストを実行します。他のユーザーがその中で動くコードにアクセスすることはできず、リポジトリにプッシュするたびに、一から改めてテストを行います。 [ダッシュボード](https://circleci.com/dashboard){:rel="nofollow"} ではそのテストの状況が逐次表示され、ジョブの完了後にはメール通知で結果を知ることができます。 また、GitHub または Bitbucket Cloud には、以下のスクリーンショット (ユーザー keybits からのコミット) のように、ステータス バッジが表示されます。

![コミット後のステータスアイコン]({{site.baseurl}}/assets/img/docs/status_badge.png)

プルリクエストの画面にはこうした処理結果がまとめて表示されます。全てのテストが問題なく実行された場合は以下のような画面になります。

![プルリクエスト後のステータスアイコン]({{site.baseurl}}/assets/img/docs/status_check.png)

## キーのベストプラクティス
{: #best-practices-for-keys }

- 可能な限り、デプロイキーを使用します。
- デプロイキーを使用できない場合は、マシンユーザーキーを使用し、必要最低限のリポジトリと権限にのみアクセスできるように制限します。
- マシンユーザーキー以外のユーザーキーは使用しないでください (キーは特定のユーザーではなく、ビルドに関連付ける必要があります)。
- リポジトリへのユーザーアクセスを取り消す場合、デプロイキーまたはユーザーキーを交換する必要があります。
  1. GitHub へのユーザーアクセスを取り消した後、GitHub でキーを削除します。
  2. CircleCI プロジェクトでキーを削除します。
  3. CircleCI プロジェクトでキーを再生成します。
- 開発者自身が所有する以上のアクセス権を必要とするリポジトリのビルドに、開発者がユーザー キーを使用してアクセスできないようにします。

## プロジェクトで追加のプライベートリポジトリのチェックアウトの有効化
{: #renaming-orgs-and-repositories }

CircleCI と連携済みの組織やリポジトリの名称を変更する必要が生じた場合、下記の手順に従うことが推奨されます:

1. VCS 上で組織及びリポジトリの名称を変更します。
2. CircleCI アプリケーションに移動し、例えば `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`のような新しい組織名およびレポジトリ名を使用します。
3. CircleCI のプラン、プロジェクト、各種設定が正しく引き継がれていることを確認します。
4. これで、必要に応じて VCS の古い名前で新しい組織やリポジトリを作成できます。

**注:** この手順を実行しないと、**環境変数**や**コンテキスト**などの組織またはリポジトリの設定にアクセスできなくなる可能性があります。

### Bitbucket 個人組織
{: #bitbucket-personal-orgs }

CircleCI は個人およびデフォルトの組織と VCS ユーザー名が一致することを想定しています。 Bitbucket では現在ユーザー名と異なる名前にパーソナルワークスペースの名前を変更することができますが、CircleCI では対応していません。 CircleCI を使って個人ワークスペースでプロジェクトをビルドしている場合は、ワークスペースの名前がユーザー名と一致していることを確認してください。

## プロジェクトで追加のプライベートリポジトリのチェックアウトを有効にする
{: #enable-your-project-to-check-out-additional-private-repositories }

テストプロセスが複数のリポジトリを参照する場合、CircleCI ではデプロイキーに加えて GitHub ユーザー キーも必要となります。 これは、 GitHub ユーザーキーはユーザーの_すべて_の GitHub リポジトリに対してアクセス権を持ちますが、デプロイキーは*単一の*リポジトリに対してのみ有効であるためです。

プロジェクトの **[Project Settings (プロジェクト設定)] > [SSH keys (SSH キー)]** のページで、CircleCI に渡す GitHub のユーザーキーを指定します。 **[User Key (ユーザーキー)]** のセクションまでスクロールし、 **[Authorize with GitHub (GitHub で認証する)]** ボタンをクリックします。 CircleCI は、この新しい SSH 鍵を作成し、それを GitHub のユーザー アカウントに関連付けて、ユーザーのすべてのリポジトリにアクセスできるようにします。

## ユーザーキーのセキュリティ
{: #user-key-security }

CircleCI が SSH キーを公開することはありません。

SSH 鍵は信頼するユーザーとのみ共有してください。 GitHub collaborators on projects employing user keys can access your repositories, therefore, only entrust a user key to someone with whom you would entrust your source code.

## ユーザーキーアクセスに関するエラーメッセージ
{: #user-key-access-related-error-messages }

ユーザーキーを追加する際に表示されがちなエラーを挙げています。

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

For fine-grained access to multiple repositories, it is best practice to create a machine user for your CircleCI projects. A [machine user](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) is a GitHub user that you create for running automated tasks. By using the SSH key of a machine user, you allow anyone with repository access to build, test, and deploy the project. Creating a machine user also reduces the risk of losing credentials linked to a single user.

マシンユーザーのSSHキーを使用するには、以下の手順で行います。

**メモ:** これらの手順を実行するには、マシン ユーザーが管理者アクセス権を持っている必要があります。 When you have finished adding projects, you can revert the machine user to read-only access.

1. Create a machine user by following the [instructions on GitHub](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users).

2. GitHub にマシンユーザーとしてログインします。

3. [CircleCI にログイン](https://circleci.com/login)します。 When GitHub prompts you to authorize CircleCI, click the **Authorize application** button.

4. From the Add Projects page, follow all projects you want the machine user to have access to.

5. On the **Project Settings > Checkout SSH keys** page, click the **Authorize With GitHub** button. This gives CircleCI permission to create and upload SSH keys to GitHub on behalf of the machine user.

6. **[Create and add XXXX user key (XXXX ユーザー キーを作成して追加)]** ボタンをクリックします。

Now, CircleCI will use the machine user's SSH key for any Git commands that run during your builds.

## パーミッションの概要
{: #permissions-overview }

CircleCI requests the following permissions from your VCS provider, as defined by the [GitHub permissions model](http://developer.github.com/v3/oauth/#scopes) and the [Bitbucket permissions model](https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html#OAuthonBitbucketCloud-Scopes).

**読み取りアクセス権**

- ユーザーのメール アドレスを取得する

**書き込みアクセス権**

- リポジトリにデプロイ キーを追加する
- リポジトリにサービス フックを追加する

**Admin Permissions**, needed for setting up a project

- デプロイ キーのリポジトリへの追加
- サービス フックのレポジトリへの追加

**メモ:** CircleCI は絶対に必要な権限しか要求しません。 However, CircleCI is constrained by the specific permissions each VCS provider chooses to supply. For example, getting a list of all user's repos -- public and private -- from GitHub requires the [`repo` scope](https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/#available-scopes), which is write-level access. GitHub does not provide a read-only permission for listing all a user's repositories.

If you feel strongly about reducing the number of permissions CircleCI uses, consider contacting your VCS provider to communicate your concerns.


### GitHub 組織で CircleCI を再有効化する方法
{: #how-to-re-enable-circleci-for-a-github-organization }
{:.no_toc}

ここでは、GitHub の組織に対するサードパーティアプリケーションのアクセス制限を有効化した際に、CircleCI の組織へのアクセスを再有効化する方法を解説します。 Go to [GitHub Settings](https://github.com/settings/connections/applications/78a2ba87f071c28e65bb) and in the **Organization access** section, you will have the option to request access if you are not an admin, or grant access if you are an admin.

#### Non-admin member workflow
{: #non-admin-member-workflow }
{:.no_toc}

- If you are member of a GitHub org (not an admin), click the **Request** button and a message will be sent to an admin of your organization. An admin will have to approve the request.
- Click **Request approval from owners** to send an email to your organization’s owners.
- While waiting for approval, you will see **Access request pending** next to your organization’s name.
- If CircleCI has been approved by your organization, you will see a checkmark next to your organization’s name.

#### Admin owner workflow
{: #admin-owner-workflow }
{:.no_toc}

- If you are an owner of your organization (an admin), you may grant access to CircleCI by clicking on the **Grant** button.
- You may be asked to confirm your password in order to authorize our app.
- Once you’ve approved CircleCI, you will see a checkmark next to your organization’s name.

アクセスが承認されると、CircleCI は元通りの挙動になるはずです。

#### Third party applications
{: #third-party-applications }
{:.no_toc}

GitHub recently added the ability to approve third party application access on a [per-organization level](https://help.github.com/articles/about-third-party-application-restrictions/). Before this change, any member of an organization could authorize an application (generating an OAuth token associated with their GitHub user account), and the application could use that OAuth token to act on behalf of the user via the API, with whatever permissions were granted during the OAuth flow.

Now OAuth tokens will, by default, _not_ have access to organization data when third party access restrictions are enabled. OAuth の処理中かその後に、ユーザーは組織単位で明確にアクセス許可をリクエストしなければならず、組織の管理者はそのリクエストを承認する必要があります。

If you are an owner/admin, you can enable third party access restrictions by visiting the [Organization settings](https://github.com/settings/organizations) page on GitHub, and clicking the **Settings** button for that organization. Under the **Third-party application access policy** section, you can click the **Setup application access restrictions** button if you want to set up restrictions for third party applications.

You can read more about these settings and how to configure them on [GitHub](https://docs.github.com/en/organizations/restricting-access-to-your-organizations-data/enabling-oauth-app-access-restrictions-for-your-organization).

If you enable these restrictions on an organization for which CircleCI has been running builds, CircleCI will stop receiving push event hooks from GitHub, and will not build new pushes. API calls will also be denied, causing, for instance, re-builds of old builds to fail the source checkout. To get CircleCI working again, you will need to grant access to the CircleCI application.
{: class="alert alert-info" }

## SSH ホストの信頼性の確立
{: #deployment-keys-and-user-keys }

**デプロイ キーとは**

When you add a new project, CircleCI creates a deployment key on the web-based VCS (GitHub or Bitbucket) for your project. A deploy key is a repo-specific SSH key. If you are using GitHub as your VCS then GitHub has the public key, and CircleCI stores the private key. デプロイ キーは、CircleCI に単一のリポジトリへのアクセス権を提供します。 CircleCI によるリポジトリへのプッシュを防止するには、このデプロイ キーを読み取り専用に設定します。

If you want to push to the repository from your builds, you will need a deployment key with write access. The steps to create a deployment key with write access depend on your VCS. GitHub固有の手順については以下を参照してください。

**ユーザー キーとは**

ユーザー キーは、ユーザーに固有の SSH 鍵です。 VCS に公開鍵を持たせ、CircleCI に秘密鍵を格納します。 秘密鍵を持っていると、プロジェクトへの「Git」アクセスの目的で、そのユーザーとして行動することができます。

### GitHub のデプロイ キーの作成
{: #creating-a-github-deploy-key }

In this example, the GitHub repository is `https://github.com/you/test-repo`, and the CircleCI project is `https://circleci.com/gh/you/test-repo`.

1. [GitHub の説明](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)に従って、SSH 鍵ペアを作成します。 パスフレーズの入力を求められても、**入力しない**でください。
```shell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. Go to `https://github.com/you/test-repo/settings/keys`, and click **Add Deploy Key**. Enter a title in the "Title" field, then copy and paste the public key you created in step 1. Check **Allow write access**, then click **Add key**.

3. Go to your project settings in the CircleCI app, select **SSH Keys**, and **Add SSH key**. In the "Hostname" field, enter `github.com`and add the private key you created in step 1. Then click **Add SSH Key**.

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

現在、Bitbucket は、ユーザー キーを作成する API を CircleCI に提供していません。 しかし、以下の回避策でユーザー キーを作成できます。

1. CircleCI アプリケーションで、プロジェクトの設定に移動します。

2. Navigate to the **SSH Keys** page and scroll down to the **User Key** section.

3. Right-click the **Add User Key** button and select the **Inspect** option to open the browser inspector. ![]({{site.baseurl}}/assets/img/docs/bb_user_key.png)

4. In the browser inspector, select the **Network** tab, and clear the console.

5. Click **Add User Key** and confirm the user is a machine user by clicking **Confirm User** in the modal. _Please note that creating a machine user is strongly advised, though not mandatory_. ![]({{site.baseurl}}/assets/img/docs/bb_confirm_user.png)

6. In the filter box, type in "checkout" (without the quotes). This will help you locate the `checkout-key`. Click the `checkout-key` with a 201 status, then select the **Preview** tab. and copy the `public_key` (without the quotes) to your clipboard. ![]({{site.baseurl}}/assets/img/docs/bb_user_key2.png)

7. Add the key to Bitbucket by following Bitbucket's guide on [setting up SSH keys](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/).

This SSH user key will have a "PREFERRED" label; if the project also has a deploy key, the SSH user key will be used first.

### これらのキーの使用方法
{: #how-are-these-keys-used }

When CircleCI builds your project, the private key is installed into the `.ssh` directory and SSH is subsequently configured to communicate with your version control provider. したがって、秘密鍵は以下の用途で使用されます。

- Checking out the main project
- いずれかの GitHub でホスティングされるサブモジュールのチェックアウト
- いずれかの GitHub でホスティングされるプライベート依存関係のチェックアウト
- Automatic git merging/tagging/etc

そのため、デプロイ キーは、追加のプライベートな依存関係を持つプロジェクトに対しては十分に強力ではありません。

### これらのキーのセキュリティ
{: #what-about-security }

CircleCI が生成するチェックアウト キー ペアの秘密鍵は CircleCI システムを出ることはなく (公開鍵のみ GitHub に転送)、また、ストレージ上では安全に暗号化されています。 しかし、これらはビルド コンテナにインストールされるため、CircleCI で実行されるすべてのコードによって読み取ることができます。 同様に、SSH 鍵を使用できる開発者は、この鍵に直接アクセスできます。

**デプロイ キーとユーザー キーの違い**

GitHub がサポートするキーの種類は、デプロイ キーとユーザー キーだけです。 Deploy keys are globally unique (for example, no mechanism exists to make a deploy key with access to multiple repositories) and user keys have no notion of _scope_ separate from the user associated with them.

複数のリポジトリへのアクセス権をきめ細かく設定するには、GitHub でマシン ユーザーと呼ばれるアカウントの作成を検討してください。 このユーザーにビルドが必要とする権限を正確に付与し、次にそのユーザー キーを CircleCI 上のプロジェクトに関連付けます。

## SSH ホストの信頼性の確立
{: #establishing-the-authenticity-of-an-ssh-host }

When using SSH keys to checkout repositories, it may be necessary to add the fingerprints for GitHub or BitBucket to a "known hosts" file (`~/.ssh/known_hosts`) so that the executor can verify that the host it's connecting to is authentic. The `checkout`job step does this automatically, so you will need to run the following commands if you opt to use a custom checkout command:

```shell
mkdir -p ~/.ssh

echo 'github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
bitbucket.org ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAubiN81eDcafrgMeLzaFPsw2kNvEcqTKl/VqLat/MaB33pZy0y3rJZtnqwR2qOOvbwKZYKiEO1O6VqNEBxKvJJelCq0dTXWT5pbO2gDXC6h6QDXCaHo6pOHGPUy+YBaGQRGuSusMEASYiWunYN0vCAI8QaXnWMXNMdFP3jHAJH0eDsoiGnLPBlBp4TNm6rYI74nMzgz3B9IikW4WVK+dc8KZJZWYjAuORU3jc1c/NPskD2ASinf8v3xnfXeukU0sJ5N6m5E8VLjObPEO+mN2t/FZTMZLiFqPWc/ALSqnMnnhwrNi2rbfg/rd/IpL8Le3pSBne8+seeFVBoGqzHM9yXw==
' >> ~/.ssh/known_hosts
```

SSH keys for servers can be fetched by running `ssh-keyscan <host>`, then adding the key that is prefixed with `ssh-rsa` to the `known_hosts` file of your job. たとえば、以下のようになります。

```shell
➜  ~ ssh-keyscan github.com
# github.com:22 SSH-2.0-babeld-2e9d163d
github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
# github.com:22 SSH-2.0-babeld-2e9d163d
# github.com:22 SSH-2.0-babeld-2e9d163d
➜  ~ ✗
```

You can add the key to known_hosts by running the following command:
```shell
ssh-keyscan github.com >> ~/.ssh/known_hosts
```
