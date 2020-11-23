---
layout: classic-docs
title: GitHub と Bitbucket のインテグレーション
description: GitHub または Bitbucket の使用
categories:
  - migration
Order: 60
version:
  - Cloud
---

以下のセクションに沿って、CircleCI での GitHub、GitHub Enterprise、または Bitbucket Cloud の利用について概説します。

- 目次
{:toc}

## 概要
{:.no_toc}

To use CircleCI you need to be using either GitHub or Bitbucket for your VCS. When you add a project to CircleCI, the following GitHub or Bitbucket Cloud settings are added to the repository using the permissions you gave CircleCI when you signed up:

- **デプロイ キー**: GitHub または Bitbucket Cloud からプロジェクトをチェックアウトするために使用されます。
- **サービス フック**: GitHub または Bitbucket Cloud にプッシュしたときに CircleCI に通知を送信するために使用されます。

CircleCI のデフォルトでは、プッシュ フックでビルドが行われます。 したがって、リポジトリのすべてのプッシュ フックに対してビルドがトリガーされます。また、プッシュはビルドをトリガーする最も一般的なケースです。

あまり一般的ではありませんが、CircleCI は以下の場合にもフックを使用します。

- CircleCI は PR フック (プル リクエスト フック) を処理して、CircleCI アプリケーションの PR 情報を保存します。[Only Build Pull Requests (プル リクエストのみビルド)] が設定されていると、CircleCI は PR がオープンされたとき、または既存の PR が存在するブランチへのプッシュがあったときだけ、ビルドをトリガーします。 これが設定されている場合でも、プロジェクトのデフォルト ブランチへのプッシュはすべて、常にビルドされます。
- [Build Forked Pull Requests (フォークされたプル リクエストをビルド)] が設定されている場合、CircleCI はフォークされたリポジトリから作成された PR に応答してビルドをトリガーします。

GitHub または Bitbucket Cloud で Web フックを編集して、ビルドをトリガーするイベントを制限できます。 Web フックの設定を編集することで、CircleCI に送信されるフックを変更できますが、ビルドをトリガーするフックの種類は変更されません。 CircleCI は常にプッシュ フックでビルドを行い、設定によっては PR フックでもビルドを行います。ただし、Web フックの設定からプッシュ フックを削除すると、ビルドを行いません。 詳細については、[GitHub の「Edit a Hook (フックを編集する)」](https://developer.github.com/v3/repos/hooks/#edit-a-hook)または [Atlassian の「Manage Webhooks (Web フックを管理する)」](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html)を参照してください。

タグ プッシュでのビルド方法については、「[ワークフローにおけるコンテキストとフィルターの使用]({{ site.baseurl }}/2.0/workflows/#ワークフローにおけるコンテキストとフィルターの使用)」を参照してください。

### Add a .circleci/config.yml file
{:.no_toc}

After you create and commit a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file to your GitHub or Bitbucket Cloud repository, CircleCI immediately checks your code out and runs your first job along with any configured tests. たとえば、Postgres の仕様と機能を使用する Rails プロジェクトで作業している場合、ジョブ実行ステップの構成は以下のようになります。

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

CircleCI は、毎回クリーンなコンテナでテストを実行します。そのため、他のユーザーはコードにアクセスできず、ユーザーがプッシュするたびにテストが新しく実行されます。 [ダッシュボード](https://circleci.com/dashboard){:rel="nofollow"}では、テストの状況が更新されるのをリアルタイムで確認でき、ジョブ終了後には CircleCI からメール通知が送信され、ステータスを確認できます。 また、GitHub または Bitbucket Cloud には、以下のスクリーンショット (ユーザー keybits からのコミット) のように、ステータス バッジが表示されます。

![コミット後のステータス バッジ]({{ site.baseurl }}/assets/img/docs/status_badge.png)

プル リクエスト画面にもステータスが表示され、すべてのテストに合格すると以下のように表示されます。

![PR 後のステータス バッジ]({{ site.baseurl }}/assets/img/docs/status_check.png)

## Best practices for keys

- 可能な限り、デプロイ キーを使用します。
- When Deploy Keys cannot be used, [Machine User Keys](#controlling-access-via-a-machine-user) must be used, and have their access restricted to the most limited set of repos and permissions necessary.
- マシン ユーザー キー以外のユーザー キーは使用しないでください (キーは特定のユーザーではなく、ビルドに関連付ける必要があります)。
- リポジトリへのユーザー アクセスを取り消す場合、デプロイ キーまたはユーザー キーを交換する必要があります。 
    1. GitHub へのユーザー アクセスを取り消した後、GitHub でキーを削除します。
    2. CircleCI プロジェクトでキーを削除します。
    3. CircleCI プロジェクトでキーを再生成します。
- 開発者自身が所有する以上のアクセス権を必要とするリポジトリのビルドに、開発者がユーザー キーを使用してアクセスできないようにします。

## Renaming orgs and repositories

If you find you need to rename an org or repo that you have previously hooked up to CircleCI, best practice is to follow these steps:

1. Rename org/repo in VCS.
2. Head to the CircleCI application, using the new org/repo name, for example, `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`.
3. Confirm that your plan, projects and settings have been transferred successfully.
4. You are then free to create a new org/repo with the previously-used name in your VCS, if desired.

**Note**: If these steps are not followed, you might lose access to your org or repo settings, including **environment variables** and **contexts**.

## Enable your project to check out additional private repositories

If your testing process refers to multiple repositories, CircleCI will need a GitHub user key in addition to the deploy key because each deploy key is valid for only *one* repository while a GitHub user key has access to *all* of your GitHub repositories.

Provide CircleCI with a GitHub user key in your project's **Project Settings** > **SSH keys**. Scroll down the page to **User Key** and click **Authorize with Github**. CircleCI creates and associates this new SSH key with your GitHub user account for access to all your repositories.

<h2 id="security">User key security</h2>

CircleCI will never make your SSH keys public.

Remember that SSH keys should be shared only with trusted users. GitHub collaborators on projects employing user keys can access your repositories, therefore, only entrust a user key to someone with whom you would entrust your source code.

<h2 id="error-messages">User key access-related error messages</h2>

Here are common errors that indicate you need to add a user key.

**Python**: During the `pip install` step:

    ERROR: Repository not found.
    

**Ruby**: During the `bundle install` step:

    Permission denied (publickey).
    

## Controlling access via a machine user

For fine-grained access to multiple repositories, it is best practice to create a machine user for your CircleCI projects. A [machine user](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) is a GitHub user that you create for running automated tasks. By using the SSH key of a machine user, you allow anyone with repository access to build, test, and deploy the project. Creating a machine user also reduces the risk of losing credentials linked to a single user.

To use the SSH key of a machine user, follow the steps below.

**Note:** To perform these steps, the machine user must have admin access. When you have finished adding projects, you can revert the machine user to read-only access.

1. Create a machine user by following the [instructions on GitHub](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users).

2. Log in to GitHub as the machine user.

3. [Log in to CircleCI](https://circleci.com/login). When GitHub prompts you to authorize CircleCI, click the **Authorize application** button.

4. From the Add Projects page, follow all projects you want the machine user to have access to.

5. On the **Project Settings > Checkout SSH keys** page, click the **Authorize With GitHub** button. This gives CircleCI permission to create and upload SSH keys to GitHub on behalf of the machine user.

6. Click the **Create and add XXXX user key** button.

Now, CircleCI will use the machine user's SSH key for any Git commands that run during your builds.

## Permissions overview

CircleCI requests the following permissions from your VCS provider, as defined by the [GitHub permissions model](http://developer.github.com/v3/oauth/#scopes) and the [Bitbucket permissions model](https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html#OAuthonBitbucketCloud-Scopes).

**Read Permission**

- ユーザーのメール アドレスを取得する

**Write Permissions**

- Get a list of a user's repos
- Add an SSH key to a user's account

**Admin Permissions**, needed for setting up a project

- Add deploy keys to a repo
- Add service hooks to a repo

**Note:** CircleCI only asks for permissions that are absolutely necessary. However, CircleCI is constrained by the specific permissions each VCS provider chooses to supply. For example, getting a list of all user's repos -- public and private -- from GitHub requires the [`repo` scope](https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/#available-scopes), which is write-level access. GitHub does not provide a read-only permission for listing all a user's repositories.

If you feel strongly about reducing the number of permissions CircleCI uses, consider contacting your VCS provider to communicate your concerns.

### Permissions for team accounts
{:.no_toc}

This section provides an overview of the possible team and individual account choices available to meet various business needs:

1. If an individual has a personal GitHub account, they will use it to log in to CircleCI and follow the project on CircleCI. Each 'collaborator' on that repository in GitHub is also able to follow the project and build on CircleCI when they push commits. Due to how GitHub and Bitbucket store collaborators, the CircleCI Team page may not show a complete list. For an accurate list of contributors, please refer to your GitHub or Bitbucket project page.

2. If an individual upgrades to a GitHub Team account they can add team members and may give admin permissions on the repo to those who run builds. The owner of the team GitHub account (org) must go to the CircleCI [Add Project](https://circleci.com/add-projects){:rel="nofollow"}, click the link to GitHub's application permissions screen, and select Authorize CircleCI to enable members of the org to follow the project from their account. A team account with two members is $25 per month instead of $7 per month for a personal account.

3. An individual Bitbucket account is free for private repos for teams of up to five. An individual may create a Bitbucket team, add members and give out admin permissions on the repo as needed to those who need to build. This project would appear in CircleCI for members to follow without additional cost.

### How to re-enable CircleCI for a GitHub organization
{:.no_toc}

This section describes how to re-enable CircleCI after enabling third-party application restrictions for a GitHub organization. Go to [GitHub Settings](https://github.com/settings/connections/applications/78a2ba87f071c28e65bb) and in the "Organization access" section either:

- "Request access" if you are not an admin for the organization in question (an admin will have to approve the request) or
- "Grant access" if you are an admin

After access is granted, CircleCI should behave normally again.

GitHub recently added the ability to approve [third party application access on a per-organization level](https://help.github.com/articles/about-third-party-application-restrictions/). Before this change, any member of an organization could authorize an application (generating an OAuth token associated with their GitHub user account), and the application could use that OAuth token to act on behalf of the user via the API with whatever permissions were granted during the OAuth flow.

Now OAuth tokens will, by default, not have access to organization data when third party access restrictions are enabled. You must specifically request access on a per organization basis, either during the OAuth process or later, and an organization admin must approve the request.

You can enable third party access restrictions by visiting the organization settings page on GitHub, and clicking "Setup application access restrictions" button in the "Third-party application access policy" section.

If you enable these restrictions on an organization for which CircleCI has been running builds then we will stop receiving push event hooks from GitHub (thus not building new pushes), and API calls will be denied (causing, for instance, re-builds of old builds to fail the source checkout.) To get CircleCI working again you have to grant access to the CircleCI application.

The account and permissions system we use is not as clear as we would like and as mentioned we have a much improved system in development with users as first class citizens in CircleCI.

## Deployment keys and user keys

**What is a deploy key?**

When you add a new project, CircleCI creates a deployment key on the web-based VCS (GitHub or Bitbucket) for your project. A deploy key is a repo-specific SSH key. If you are using GitHub as your VCS then GitHub has the public key, and CircleCI stores the private key. The deployment key gives CircleCI access to a single repository. To prevent CircleCI from pushing to your repository, this deployment key is read-only.

If you want to push to the repository from your builds, you will need a deployment key with write access. The steps to create a deployment key with write access depend on your VCS. See below for GitHub-specific instructions.

**What is a user key?**

A user key is a user-specific SSH key. Your VCS has the public key, and CircleCI stores the private key. Possession of the private key gives the ability to act as that user, for purposes of 'git' access to projects.

### Creating a GitHub deploy key
{:.no_toc}

In this example, the GitHub repository is `https://github.com/you/test-repo`, and the CircleCI project is `https://circleci.com/gh/you/test-repo`.

1. Create an SSH key pair by following the [GitHub instructions](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/). When prompted to enter a passphrase, do **not** enter one.
    
    **Caution:** Recent updates in `ssh-keygen` don't generate the key in PEM format by default. If your private key does not start with `-----BEGIN RSA
PRIVATE KEY-----`, enforce PEM format by generating the key with `ssh-keygen
-m PEM -t rsa -C "your_email@example.com"`

2. Go to `https://github.com/you/test-repo/settings/keys`, and click "Add deploy key". Enter a title in the "Title" field, then copy and paste the public key you created in step 1. Check "Allow write access", then click "Add key".

3. Go to your project settings, click on SSH Keys, and "Add SSH key", and add the private key you created in step 1. In the "Hostname" field, enter "github.com", and press the submit button.

4. In your config.yml, add the fingerprint using the `add_ssh_keys` key:

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

### Creating a Bitbucket user key
{:.no_toc}

Bitbucket does not currently provide CircleCI with an API to create user keys. However, it is still possible to create a user key by following this workaround:

1. CircleCI アプリケーションで、プロジェクトの設定に移動します。

2. **[Checkout SSH Keys (SSH 鍵のチェックアウト)]** ページに移動します。

3. **[Create `<username>` user key (`<ユーザー名>` のユーザー キーの作成)]** ボタンを右クリックし、**[Inspect (検査)]** オプションを選択して、ブラウザーの検査ツールを開きます。![]({{ site.baseurl }}/assets/img/docs/bb_user_key.png)

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

When CircleCI builds your project, the private key is installed into the `.ssh` directory and SSH is subsequently configured to communicate with your version control provider. Therefore, the private key is used for:

- checking out the main project
- checking out any GitHub-hosted submodules
- checking out any GitHub-hosted private dependencies
- automatic git merging/tagging/etc.

For this reason, a deploy key isn't sufficiently powerful for projects with additional private dependencies.

### これらのキーのセキュリティ

The private keys of the checkout keypairs CircleCI generates never leave the CircleCI systems (only the public key is transmitted to GitHub) and are safely encrypted in storage. However, since the keys are installed into your build containers, any code that you run in CircleCI can read them. Likewise, developers that can SSH in will have direct access to this key.

**Isn't there a difference between deploy keys and user keys?**

Deploy keys and user keys are the only key types that GitHub supports. Deploy keys are globally unique (for example, no mechanism exists to make a deploy key with access to multiple repositories) and user keys have no notion of *scope* separate from the user associated with them.

To achieve fine-grained access to more than one repo, consider creating what GitHub calls a machine user. Give this user exactly the permissions your build requires, and then associate its user key with your project on CircleCI.

## Establishing the authenticity of an SSH host

When using SSH keys to checkout repositories, it may be neccesary to add the fingerprints for GitHub or BitBucket to a "known hosts" file (`~/.ssh/known_hosts`) so that the executor can verify that the host it's connecting to is authentic. The `checkout`job step does this automatically, so the following command will need to be used if you opt to use a custom checkout command.

    mkdir -p ~/.ssh
    
    echo 'github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
    bitbucket.org ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAubiN81eDcafrgMeLzaFPsw2kNvEcqTKl/VqLat/MaB33pZy0y3rJZtnqwR2qOOvbwKZYKiEO1O6VqNEBxKvJJelCq0dTXWT5pbO2gDXC6h6QDXCaHo6pOHGPUy+YBaGQRGuSusMEASYiWunYN0vCAI8QaXnWMXNMdFP3jHAJH0eDsoiGnLPBlBp4TNm6rYI74nMzgz3B9IikW4WVK+dc8KZJZWYjAuORU3jc1c/NPskD2ASinf8v3xnfXeukU0sJ5N6m5E8VLjObPEO+mN2t/FZTMZLiFqPWc/ALSqnMnnhwrNi2rbfg/rd/IpL8Le3pSBne8+seeFVBoGqzHM9yXw==
    ' >> ~/.ssh/known_hosts
    

SSH keys for servers can be fetched by running `ssh-keyscan <host>`, then adding the key that is prefixed with `ssh-rsa` to the `known_hosts` file of your job. You can see this in action here:

    ➜  ~ ssh-keyscan github.com           
    # github.com:22 SSH-2.0-babeld-2e9d163d
    github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
    # github.com:22 SSH-2.0-babeld-2e9d163d
    # github.com:22 SSH-2.0-babeld-2e9d163d
    ➜  ~ ✗