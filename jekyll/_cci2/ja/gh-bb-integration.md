---
layout: classic-docs
title: GitHub and Bitbucket Integration
description: Using GitHub or Bitbucket
categories:
  - migration
Order: 60
---
This document provides an overview of using GitHub or Bitbucket with CircleCI in the following sections:

* TOC {:toc}

## Overview

{:.no_toc}

When you add a project to CircleCI, the following GitHub or Bitbucket settings are added to the repository using the permissions you gave CircleCI when you signed up: - A **deploy key** that is used to check out your project from GitHub or Bitbucket. - A **service hook** that is used to notify CircleCI when you push to GitHub or Bitbucket.

CircleCI builds push hooks by default. So, builds are triggered for all push hooks for the repository and PUSH is the most common case of triggering a build.

There are some additional, less common cases where CircleCI uses hooks, as follows: - CircleCI processes PR hooks to store PR information for the CircleCI app. If the Only Build Pull Requests setting is set then CircleCI will only trigger builds when a PR is opened, or when there is a push to a branch for which there is an existing PR. Even if this setting is set we will always build all pushes to the project's default branch. - If the Build Forked Pull Requests setting is set, CircleCI will trigger builds in response to PRs created from forked repos.

It is possible to edit the webhooks in GitHub or Bitbucket to restrict events that trigger a build. Editing the webhook settings lets you change which hooks get sent to CircleCI, but doesn't change the types of hooks that trigger builds. CircleCI は常にプッシュがビルドの契機となり、(設定すれば) プルリクエスト時にもビルドを実行することになります。しかしながら、Webhooks の設定でプッシュ時のフックを除外すれば、CircleCI はビルドを実行しなくなります。 フックと Webhooks については、[GitHub のページ](https://developer.github.com/v3/repos/hooks/#edit-a-hook) や [Bitbucket のページ](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html) で詳しく知ることができます。

Refer to CircleCI documentation of [Workflows filters]({{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-workflows) for how to build tag pushes.

### .circleci/config.yml の追加方法

{:.no_toc}

[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルを作成し、GitHub や Bitbucket のリポジトリに対してコミットした後、CircleCI は直ちにそのコードをチェックアウトしたうえで、テストを含む最初のジョブを実行します。 For example, if you are working on a Rails project using Postgres specifications and features you might configure the following job run step:

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

CircleCI runs your tests on a clean container every time so that your code is never accessible to other users and the tests are fresh each time you push. [ダッシュボード](https://circleci.com/dashboard) {:rel="nofollow"} ではそのテストの状況が逐次表示され、ジョブの完了後にはメール通知で結果を知ることができます。 Status badges also appear on GitHub or Bitbucket as shown in the following screenshot for a commit from user keybits:

![Status Badge After Commit]({{ site.baseurl }}/assets/img/docs/status_badge.png)

Integrated status also appears on the pull request screen, to show that all tests have passed:

![Status Badge After PR]({{ site.baseurl }}/assets/img/docs/status_check.png)

## Enable Your Project to Check Out Additional Private Repositories

If your testing process refers to multiple repositories, CircleCI will need a GitHub user key in addition to the deploy key because each deploy key is valid for only *one* repository while a GitHub user key has access to *all* of your GitHub repositories.

Provide CircleCI with a GitHub user key on your project's **Project Settings > Checkout SSH keys** page. CircleCI creates and associates this new SSH key with your GitHub user account for access to all your repositories.

<h2 id="security">User key security</h2>

CircleCI will never make your SSH keys public.

Remember that SSH keys should be shared only with trusted users and that anyone that is a GitHub collaborator on a project employing user keys can access your repositories, so only entrust a user key to someone with whom you would entrust your source code.

<h2 id="error-messages">User key access-related error messages</h2>

Here are common errors that indicate you need to add a user key.

**Python**: During the `pip install` step:

    ERROR: Repository not found.
    

**Ruby**: During the `bundle install` step:

    Permission denied (publickey).
    

## マシンユーザーの作成方法

複数のリポジトリにこまめにアクセスするような場合、CircleCI のプロジェクトにマシンユーザーを追加するのがおすすめです。 [マシンユーザー](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) は、タスクの自動実行を実現するために作成する GitHub ユーザーのことです。 マシンユーザーの SSH 鍵を利用することで、プロジェクトのビルド、テスト、デプロイを行うためのリポジトリアクセスが誰でもできるようになります。 マシンユーザーはさらに、個別のユーザーにひもづけられた証明書を当人が紛失してアクセスできなくなる、というリスクの対策にもなります。

マシンユーザーの SSH 鍵を利用するには、下記の手順で操作します。

**※**この手順を行うにあたっては、マシンユーザーが管理者権限を持っている必要があります。プロジェクトの追加が完了した後は、マシンユーザーの権限をリードオンリーに変えることができます。

1. マシン ユーザー を GitHub</a> の の手順に従って作成します。</p></li> 
    
    * Log in to GitHub as the machine user.
    
    * [CircleCI にアクセスしてログイン](https://circleci.com)します。CircleCI のアクセスを承認する確認画面が表示されるので、**Authorize application** ボタンをクリックします
    
    * [Add Projects](https://circleci.com/add-projects){:rel="nofollow"}> ページで、マシンユーザーをアクセスさせたい全てのプロジェクトをフォローします
    
    * プロジェクト設定画面の **Checkout SSH keys** で ***Authorize with GitHub*** ボタンをクリックします これにより、マシンユーザー代わりに SSH キーを作成し GitHub にアップロードする権限を CircleCI に与えます。
    
    * **Create and add XXXX user key** ボタンをクリックします</ol> 
    
    これで、CircleCI はビルド時の際、さまざまな Git コマンドの実行にマシンユーザーの SSH 鍵を使うようになります。
    
    ## Permissions Overview
    
    CircleCI は、バージョン管理システムを稼働しているサーバーに対して [GitHub permissions model](http://developer.github.com/v3/oauth/#scopes) や [Bitbucket permissions model](https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html#OAuthonBitbucketCloud-Scopes) で定義されている下記の権限を要求します。
    
    **Read Permission**：ユーザーのメールアドレスを取得する
    
    **Write Permissions** ・リポジトリに deploy keys を追加する ・リポジトリに service hooks を追加する ・ユーザーのリポジトリの一覧を取得する ・ユーザーアカウントに SSH キーを追加する
    
    **※**CircleCI は最低限必要になる権限しか要求しません。 また、その権限は、バージョン管理システムが提供するとした特定のものだけに限定されます。 例えば、GitHub 自体が読み込みのみの権限を用意していないため、GitHub のユーザーリポジトリ一覧の取得には書き込み権限が必要になります。
    
    CircleCI が利用する権限の数が多すぎると感じるときは、その懸念を払拭するためにも、バージョン管理システムの運営元に問い合わせてみてください。
    
    ### Permissions for Team Accounts
    
    {:.no_toc}
    
    ここでは、さまざまなビジネスニーズにおいて考えうるチームアカウントとユーザー個別アカウントの適切な選択の仕方について解説します。
    
    1. If an individual has a personal GitHub account, they will use it to log in to CircleCI and follow the project on CircleCI. Each 'collaborator' on that repository in GitHub is also able to follow the project and build on CircleCI when they push commits. Due to how GitHub and Bitbucket store collaborators, the CircleCI Team page may not show a complete list. For an accurate list of contributors, please refer to your GitHub or Bitbucket project page.
    
    2. If an individual upgrades to a GitHub Team account they can add team members and may give admin permissions on the repo to those who run builds. この場合、チームメンバーが関係するプロジェクトを自分のアカウントでフォローできるよう、GitHub のチーム（組織）アカウントのオーナーは [Add Projects](https://circleci.com/add-projects){:rel="nofollow"} ページで **GitHub's application permissions** リンクをクリックし、**Authorize CircleCI** を選択する必要があります。 A team account with two members is $25 per month instead of $7 per month for a personal account.
    
    3. An individual Bitbucket account is free for private repos for teams of up to five. An individual may create a Bitbucket team, add members and give out admin permissions on the repo as needed to those who need to build. This project would appear in CircleCI for members to follow without additional cost.
    
    ### How to Re-enable CircleCI for a GitHub Organization
    
    {:.no_toc}
    
    ここでは、GitHub の組織に対するサードパーティアプリケーションのアクセス制限を有効化した際に、CircleCI の組織へのアクセスを再度有効化する方法を解説します。 [GitHub Settings](https://github.com/settings/connections/applications/78a2ba87f071c28e65bb) ページの「Organization access」で、次のいずれかの操作を行ってください。
    
    * あなたが組織の管理者でないときは **Request** をクリックします（管理者の承認待ちとなります）
    * あなたが管理者のときは **Grant** をクリックします
    
    アクセスが承認されると、CircleCI は元通りの挙動になるはずです。
    
    最近になって GitHub は[組織レベルでのサードパーティアプリケーションのアクセス](https://help.github.com/articles/about-third-party-application-restrictions/) の受け入れを可能にしました。 この変更が行われるまでは、組織のどのメンバーでも（GitHub のユーザーアカウントにひもづく OAuth トークンを発行して）アプリケーションを承認することが可能となっていました。また、アプリケーションはその OAuth トークンを用いることで、ユーザーが API を経由して実行するのと同じように、OAuth で認められている権限の範囲内で動作することができました。
    
    現在、サードパーティアプリケーションの制限が有効になっている場合、OAuth トークンでは組織データにアクセスできないのがデフォルトとなっています。 OAuth の処理中かその後に、ユーザーは組織単位で明確にアクセス許可をリクエストしなければならず、組織の管理者はそのリクエストを承認する必要があります。
    
    サードパーティアプリケーションのアクセス制限について設定するには、GitHub の「Organizations」の設定ページで、「Third-party application access policy」セクションにある「Setup application access restrictions」ボタンをクリックします。
    
    組織において、ビルドを実行している CircleCI に対してこの制限を有効にすると、フックのきっかけとなる GitHub へのプッシュイベントを受け取らなくなり（新たなプッシュを検知できなくなり）、API 呼び出しが拒否されます（ソースコードのチェックアウトの失敗による古いコードのリビルドが実行される結果となります）。CircleCI を正しく動作させるには、CircleCI からのアクセスを許可しなければなりません。
    
    こうしたアカウントと承認の仕組みは、理想からはほど遠く、我々は CircleCI をお使いいただいているユーザーのみなさんが満足できるシステムを開発しているところです。
    
    ## Deployment Keys and User Keys
    
    新しいプロジェクトを作成したとき、CircleCI は Web ベースのバージョン管理システム（GitHub や Bitbucket）上にそのプロジェクト用の deploy key を生成します。 リポジトリへのプッシュがうまくいかないときは、この deploy key がリードオンリー属性になっている可能性があります。
    
    ビルド時にリポジトリに対してプッシュしたい場合は、deploy key（とユーザーキー）に書き込み権限を付与します。ユーザーキーの生成のされ方についてはバージョン管理システムによって異なります。
    
    ### Creating a GitHub User Key
    
    {:.no_toc}
    
    ここでは、仮に GitHub のリポジトリが `https://github.com/you/test-repo` となっており、CircleCI のプロジェクトが <https://circleci.com/gh/you/test-repo>{:rel="nofollow"} となっている場合の方法を例として解説しています。
    
    1. Create an SSH key pair by following the [GitHub instructions](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/). When prompted to enter a passphrase, do **not** enter one.
    
    2. Go to `https://github.com/you/test-repo/settings/keys`, and click "Add deploy key". Enter a title in the "Title" field, then copy and paste the key you created in step 1. Check "Allow write access", then click "Add key".
    
    3. <https://circleci.com/gh/you/test-repo/edit#ssh>{:rel="nofollow"} でも同じように SSH キーを追加します。 「Hostname」には「github.com」と入力し、Submit ボタンをクリックします
    
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
    
    ジョブから GitHub リポジトリにプッシュする際、CircleCI はここで追加した SSH キーを使います。
    
    ### Creating a Bitbucket User Key
    
    {:.no_toc}
    
    Bitbucket では現在のところ、API を用いて CircleCI 用のユーザーキーを生成する手段が用意されていません。ただし、下記の手順でユーザーキーを生成することが可能です。
    
    1. In the CircleCI application, go to your project's settings.
    
    2. **Checkout SSH keys** ページを開きます
    
    3. **Create `<username>` user key** ボタンの上で右クリックし、**Inspect**（日本語環境のChrome では「検証」、Firefox では「要素を調査」） から Web ブラウザーの検証ツールを起動します![]({{ site.baseurl }}/assets/img/docs/bb_user_key.png)
    
    4. 表示されるツール内から **Network（ネットワーク）** タブを選びます![]({{ site.baseurl }}/assets/img/docs/bb_user_key2.png)
    
    5. In the developer console, click the `checkout-key` with a 201 status and copy the `public_key` to your clipboard.
    
    6. Add the key to Bitbucket by following Bitbucket's guide on [setting up SSH keys](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html).
    
    7. In your `.circleci/config.yml`, add the fingerprint using the `add_ssh_keys` key:
    
    ```yaml
    version: 2
    jobs:
      deploy-job:
        steps:
          - add_ssh_keys:
              fingerprints:
                - "SO:ME:FIN:G:ER:PR:IN:T"
    ```
    
    ジョブから Bitbucket プロジェクトにプッシュする際、CircleCI はここで追加した SSH キーを使います。