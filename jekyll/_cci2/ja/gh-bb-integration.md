---
layout: classic-docs
title: GitHub/Bitbucket との統合
description: GitHub もしくは Bitbucket との統合の仕方
categories:
  - migration
Order: 60
---
このページでは、CircleCI における GitHub や Bitbucket の統合、活用方法の概要について、下記の内容に沿って解説しています。

- 目次
{:toc}

## 概要
{:.no_toc}

CircleCI でプロジェクトを開始するとき、最初にCircleCI のユーザー登録をする際に与えた権限に従って、下記のような GitHub または Bitbucket の設定がリポジトリに追加されます。 　**deploy key：**GitHub または Bitbucket からプロジェクトのコードの取得 (チェックアウト) するのに使われます 　**service hook：**GitHub または Bitbucket へのプッシュを CircleCI へ通知するのに使われます

CircleCI builds push hooks by default. So, builds are triggered for all push hooks for the repository and PUSH is the most common case of triggering a build.

また、CircleCI においては下記のようなフックのパターンもあります。 ・CircleCI はプルリクエスト情報を保存するためにプルリクエストフックを処理します。CircleCI の設定で「Only build pull requests」をオンにすることで、CircleCI はプルリクエストがオープンの状態になったとき、もしくは既存のプルリクエストが存在するブランチへのプッシュがあるときにのみ、ビルドを実行します。 さらにこの設定にしているときは、プロジェクトのデフォルトのブランチに対するあらゆるプッシュについてビルドを実行します ・CircleCI の設定で「Build forked pull requests」をオンにすると、CircleCI はフォークされたリポジトリから生成されたプルリクエストに応答する形でビルドを実行します

ビルド実行のタイミングをより細かく制御するために、GitHub や Bitbucket の Webhooks を活用することもできます。 Webhooks を設定することで、フック時に CircleCI に送信する内容を変えることができます。ただし、ビルドの実行契機となるフックのタイプは変わりません。 CircleCI は常にプッシュがビルドの契機となり、(設定すれば) プルリクエスト時にもビルドを実行することになります。しかしながら、Webhooks の設定でプッシュ時のフックを除外すれば、CircleCI はビルドを実行しなくなります。 Refer to the [GitHub Edit a Hook document](https://developer.github.com/v3/repos/hooks/#edit-a-hook) or the [Atlassian Manage Webhooks document](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html) for details.

タグを利用したプッシュによるビルドの方法は、[Workflow フィルター]({{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-workflows)のページで解説しています。

### Add a .circleci/config.yml File
{:.no_toc}

After you create and commit a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file to your GitHub or Bitbucket repository CircleCI immediately checks your code out and runs your first job along with any configured tests. 例えば、Postgres の機能を駆使した Rails のプロジェクトに携わっているなら、下記のような run ステップのジョブを記述することになります。

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

CircleCI は毎回まっさらな閉じた環境のコンテナ上でテストを実行します。他のユーザーがその中で動くコードにアクセスすることはできず、リポジトリにプッシュするたびに、一から改めてテストを行います。 [ダッシュボード](https://circleci.com/dashboard){:rel="nofollow"} ではそのテストの状況が逐次表示され、ジョブの完了後にはメール通知で結果を知ることができます。 以下のコミット時のスクリーンショットにあるように、GitHub や Bitbucket では処理結果を表すアイコンバッジが表示されます。

![コミット後のステータスアイコン]({{ site.baseurl }}/assets/img/docs/status_badge.png)

プルリクエストの画面にはこうした処理結果がまとめて表示されます。全てのテストが問題なく実行された場合は以下のような画面になります。

![プルリクエスト後のステータスアイコン]({{ site.baseurl }}/assets/img/docs/status_check.png)

## その他プライベートリポジトリのチェックアウト用にプロジェクトを用意する

If your testing process refers to multiple repositories, CircleCI will need a GitHub user key in addition to the deploy key because each deploy key is valid for only *one* repository while a GitHub user key has access to *all* of your GitHub repositories. Refer to the [adding ssh keys]({{ site.baseurl }}/2.0/add-ssh-key) document to learn more.

CircleCI が GitHub のユーザーキーを利用できるようにするには、プロジェクト設定画面の **Checkout SSH keys** で設定します。 全てのリポジトリにアクセスできるようにするため、CircleCI はここで作成した新しい SSH キーを GitHub のユーザーアカウントに紐づけます。

<h2 id="security">ユーザーキーのセキュリティについて</h2>

CircleCI は、紐づけたユーザーキー (SSH Keys) を第三者に公開することはありません。

SSH Keys は、信頼するユーザーや、リポジトリにアクセスしてもらう必要があるプロジェクトの GitHub 共同作業者にのみ知らせるべきです。つまり、ソースコードの管理も任せられる人にのみユーザーキーを預けるようにする、ということが大切です。

<h2 id="error-messages">ユーザーキー利用時のエラーメッセージの例</h2>

ユーザーキーを追加する際に表示されがちなエラーを挙げています。

**Python**：`pip install` の実行中に遭遇するエラー例

    ERROR: Repository not found.
    

**Ruby**：`bundle install` の実行中に遭遇するエラー例

    Permission denied (publickey).
    

## Creating a Machine User

For fine-grained access to multiple repositories, consider creating a machine user for your CircleCI projects. A [machine user](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) is a GitHub user that you create for running automated tasks. By using the SSH key of a machine user, you allow anyone with repository access to build, test, and deploy the project. Creating a machine user also reduces the risk of losing credentials linked to a single user.

To use the SSH key of a machine user, follow the steps below.

**Note:** To perform these steps, the machine user must have admin access. When you have finished adding projects, you can revert the machine user to read-only access.

1. Create a machine user by following the [instructions on GitHub](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users).

2. GitHub にマシンユーザーとしてログインします。

3. [Log in to CircleCI](https://circleci.com/login). When GitHub prompts you to authorize CircleCI, click the **Authorize application** button.

4. On the [Add Projects](https://circleci.com/add-projects){:rel="nofollow"} page, follow all projects you want the machine user to have access to.

5. On the **Project Settings > Checkout SSH keys** page, click the **Authorize With GitHub** button. This gives CircleCI permission to create and upload SSH keys to GitHub on behalf of the machine user.

6. Click the **Create and add XXXX user key** button.

Now, CircleCI will use the machine user's SSH key for any Git commands that run during your builds.

## 権限について

CircleCI は、バージョン管理システムを稼働しているサーバーに対して、[GitHub permissions model](http://developer.github.com/v3/oauth/#scopes) や [Bitbucket permissions model](https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html#OAuthonBitbucketCloud-Scopes) で定義されている下記の権限を要求します。

**Read Permission**：ユーザーのメールアドレスを取得する

**Write Permissions** ・リポジトリに deploy keys を追加する ・リポジトリに service hooks を追加する ・ユーザーのリポジトリの一覧を取得する ・ユーザーアカウントに SSH キーを追加する

**注**：CircleCI は最低限必要になる権限しか要求しません。 また、その権限は、バージョン管理システムが提供するとした特定のものだけに限定されます。 例えば、GitHub 自体が読み込みのみの権限を用意していないため、GitHub のユーザーリポジトリ一覧の取得には書き込み権限が必要になります。

CircleCI が利用する権限の数が多すぎると感じるときは、その懸念を払拭するためにも、バージョン管理システムの運営元に問い合わせてみてください。

### チームアカウントに対する権限
{:.no_toc}

ここでは、さまざまなビジネスニーズにおいて考えうるチームアカウントとユーザー個別アカウントの適切な選択の仕方について解説します。

1. ユーザーそれぞれが個人の GitHub アカウントを所有している場合は、そのユーザーが CircleCI にログインしたり、プロジェクトをフォローしたりするのに使うことになるでしょう。 GitHub のリポジトリの「共同編集者」もそのプロジェクトをフォローでき、コミットすれば CircleCI 上でビルドが実行されます。 GitHub や Bitbucket に登録されている共同編集者の数によっては、CircleCI の TEAM ページではその全員を表示できないことがあります。 共同編集者の全リストは、GitHub や Bitbucket のプロジェクトページで確認してください。

2. 個人アカウントから GitHub のチームアカウントにアップグレードすると、チームメンバーを追加でき、ビルドを実行するメンバーにはリポジトリの管理権限を与えることもできます。 この場合、チームメンバーが関係するプロジェクトを自分のアカウントでフォローできるよう、GitHub のチーム (組織) アカウントのオーナーは [Add Projects](https://circleci.com/add-projects){:rel="nofollow"} ページで **GitHub's application permissions** リンクをクリックし、**Authorize CircleCI** を選択する必要があります。 個人アカウントの場合は 7 ドル/月ですが、2 人のメンバーからなるチームアカウントは 25 ドル/月の料金が必要になります。

3. Bitbucket の個人アカウントは、チームあたり最大 5 つまでのプライベートリポジトリが無料となっています。 Bitbucket の個人アカウントでチームを作成してメンバーを追加し、ビルドを実行するメンバーに対し必要に応じてリポジトリの管理権限を付与することも可能です。 このプロジェクトでは、メンバーがフォローするのに CircleCI 上で特に必要な操作はありません。

### GitHub の組織 (Organization) へのアクセスを再有効化する方法
{:.no_toc}

ここでは、GitHub の組織に対するサードパーティアプリケーションのアクセス制限を有効化した際に、CircleCI の組織へのアクセスを再有効化する方法を解説します。 [GitHub Settings](https://github.com/settings/connections/applications/78a2ba87f071c28e65bb) ページの「Organization access」で、次のいずれかの操作を行ってください。

- あなたが組織の管理者でないときは **Request** をクリックします (管理者の承認待ちとなります)
- あなたが管理者のときは **Grant** をクリックします

アクセスが承認されると、CircleCI は元通りの挙動になるはずです。

最近になって GitHub は[組織レベルでのサードパーティアプリケーションのアクセス](https://help.github.com/articles/about-third-party-application-restrictions/)の受け入れを可能にしました。 この変更が行われるまでは、組織のどのメンバーでも (GitHub のユーザーアカウントに紐づく OAuth トークンを発行して) アプリケーションを承認することが可能となっていました。また、アプリケーションはその OAuth トークンを用いることで、ユーザーが API を経由して実行するのと同じように、OAuth で認められている権限の範囲内で動作することができました。

現在、サードパーティアプリケーションの制限が有効になっている場合、OAuth トークンでは組織データにアクセスできないのがデフォルトとなっています。 OAuth の処理中かその後に、ユーザーは組織単位で明確にアクセス許可をリクエストしなければならず、組織の管理者はそのリクエストを承認する必要があります。

サードパーティアプリケーションのアクセス制限について設定するには、GitHub の「Organizations」の設定ページで、「Third-party application access policy」セクションにある「Setup application access restrictions」ボタンをクリックします。

組織において、ビルドを実行している CircleCI に対してこの制限を有効にすると、フックのきっかけとなる GitHub へのプッシュイベントを受け取らなくなり (新たなプッシュを検知できなくなり)、API 呼び出しが拒否されます (ソースコードのチェックアウトの失敗による古いコードのリビルドが実行される結果となります)。CircleCI を正しく動作させるには、CircleCI からのアクセスを許可しなければなりません。

こうしたアカウントと承認の仕組みには、まだ改善が必要なので、CircleCI をお使いいただいているユーザーのみなさんが満足できるシステムを現在開発しているところです。

## Deploy Key とユーザーキー

**What is a deploy key?**

When you add a new project, CircleCI creates a deployment key on the web-based VCS (GitHub or Bitbucket) for your project. A deploy key is a repo-specific SSH key. If you are using GitHub as your VCS then GitHub has the public key, and CircleCI stores the private key. The deployment key gives CircleCI access to a single repository. To prevent CircleCI from pushing to your repository, this deployment key is read-only.

If you want to push to the repository from your builds, you will need a deployment key with write access (user key). The steps to create a user key depend on your VCS.

**What is a user key?**

A user key is a user-specific SSH key. Your VCS has the public key, and CircleCI stores the private key. Possession of the private key gives the ability to act as that user, for purposes of 'git' access to projects.

### GitHub ユーザーキーの生成方法
{:.no_toc}

ここでは、仮に GitHub のリポジトリが `https://github.com/you/test-repo` となっており、CircleCI のプロジェクトが <https://circleci.com/gh/you/test-repo>{:rel="nofollow"} となっている場合の方法を例として解説しています。

1. [GitHub instructions](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/) にある手順で SSH キーペアを作成します。 パスワード入力が求められても何も**入力しない**でください。

**Caution:** Recent updates in `ssh-keygen` don't generate the key in PEM format by default. If your private key does not start with `-----BEGIN RSA PRIVATE KEY-----`, enforce PEM format by generating the key with `ssh-keygen -m PEM -t rsa -C "your_email@example.com"`

1. `https://github.com/you/test-repo/settings/keys` にアクセスして「Add deploy key」をクリックします。 「Title」に適当なタイトルを入力し、1 番目の手順で生成した SSH キーをコピー＆ペーストします。 「Allow write access」にチェックを入れ「Add key」をクリックします。

2. <https://circleci.com/gh/you/test-repo/edit#ssh>{:rel="nofollow"} でも同じように SSH キーを追加します。 「Hostname」には「github.com」と入力し、Submit ボタンをクリックします。

3. config.yml ファイルに、下記のように `add_ssh_keys` キーとともにフィンガープリントを挿入します。

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

### Bitbucket ユーザーキーの生成方法
{:.no_toc}

Bitbucket does not currently provide CircleCI with an API to create user keys. However, it is still possible to create a user key by following this workaround:

1. CircleCI のプロジェクト設定ページにアクセスします。

2. **Checkout SSH keys** ページを開きます。

3. **Create `<username>` user key** ボタンを右クリックし、**Inspect** (日本語環境の Chrome では「検証」、Firefox では「要素を調査」) から Web ブラウザーの検証ツールを起動します。![]({{ site.baseurl }}/assets/img/docs/bb_user_key.png)

4. 表示されるツール内から **Network (ネットワーク)** タブを選びます。![]({{ site.baseurl }}/assets/img/docs/bb_user_key2.png)

5. ステータス 201 の `checkout-key` をクリックし、`public_key` をクリップボードにコピーします。

6. Bitbucket のガイド資料 [setting up SSH keys](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) を参考に Bitbucket に SSH キーを登録します。

7. config.yml ファイルに、下記のように `add_ssh_keys` キーとともにフィンガープリントを挿入します。

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

### How are these keys used?

When CircleCI builds your project, the private key is installed into the `.ssh` directory and SSH is subsequently configured to communicate with your version control provider. Therefore, the private key gets gets used for:

- checking out the main project
- checking out any GitHub-hosted submodules
- checking out any GitHub-hosted private dependencies
- automatic git merging/tagging/etc.

For this reason, a deploy key isn't sufficiently powerful for projects with additional private dependencies.

### What about security?

The private keys of the checkout keypairs CircleCI generates never leave the CircleCI systems (only the public key is transmitted to GitHub) and are safely encrypted in storage. However, since they are installed into your build containers, any code that you run in CircleCI can read them.

**Isn't there a difference between deploy keys and user keys?**

Deploy keys and user keys are the only key types that GitHub supports. Deploy keys are globally unique (for example, no mechanism exists to make a deploy key with access to multiple repositories) and user keys have no notion of *scope* separate from the user associated with them.

To achieve fine-grained access to more than one repo, consider creating what GitHub calls a machine user. Give this user exactly the permissions your build requires, and then associate its user key with your project on CircleCI.