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
CircleCI が SSH 鍵を公開することはありません。

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

1. Rename org/repo in VCS.
2. Head to the CircleCI application, using the new org/repo name, for example, `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`.
3. Confirm that your plan, projects and settings have been transferred successfully.
4. You are then free to create a new org/repo with the previously-used name in your VCS, if desired.

**Python**: `pip install` ステップ実行中

### チーム アカウントの権限
**Ruby**: `bundle install` ステップ実行中

CircleCI expects that your personal/default org matches your VCS username. Bitbucket now supports renaming your personal workspace to differ from your username; however, this is not currently supported by CircleCI. If you are building projects in your personal workspace with CircleCI, please ensure its name matches your username.

## Enable your project to check out additional private repositories
マシン ユーザーの SSH 鍵を使用するには、以下の手順を行います。

テスト プロセスが複数のリポジトリを参照する場合、CircleCI ではデプロイ キーに加えて GitHub ユーザー キーも必要となります。 これは、 GitHub ユーザー キーはユーザーの*すべて*の GitHub リポジトリに対してアクセス権を持ちますが、デプロイ キーは*単一の*リポジトリに対してのみ有効であるためです。

Provide CircleCI with a GitHub user key in your project's **Project Settings** > **SSH keys**. プロジェクトの **[Project Settings (プロジェクト設定)] > [SSH Keys (SSH 鍵)]** のページで、 **[User Key (ユーザー鍵)]** のセクションまでスクロールで移動し、 **[Authorize with GitHub (GitHub で認証する)]** ボタンをクリックします。 CircleCI は、この新しい SSH 鍵を作成し、それを GitHub のユーザー アカウントに関連付けて、ユーザーのすべてのリポジトリにアクセスできるようにします。

## ユーザー キーのセキュリティ
CircleCI は、VCS プロバイダーに対して、[GitHub の権限モデル](http://developer.github.com/v3/oauth/#scopes)や [Bitbucket の権限モデル](https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html#OAuthonBitbucketCloud-Scopes)で定義されている以下の権限を要求します。

これで、CircleCI は開発中に実行されるすべての Git コマンドに対して、マシン ユーザーの SSH 鍵を使用するようになります。

SSH 鍵は信頼するユーザーとのみ共有してください。 また、ユーザー キーを使用するプロジェクトの場合、すべての GitHub コラボレーターがリポジトリにアクセスできるため、ソース コードを任せられる人にのみユーザー キーを共有してください。

## マシン ユーザーを介したアクセスの制御
ユーザー キー アクセスに関するエラー メッセージ

Here are common errors that indicate you need to add a user key.

CircleCI が使用する権限の数をどうしても減らしたい場合は、VCS プロバイダーに連絡して、その旨を伝えてください。

```
ERROR: Repository not found.
```

**Ruby**: During the `bundle install` step:

```
Permission denied (publickey).
```

## 権限の概要
このセクションでは、さまざまなビジネス ニーズに応じて選択できるチーム アカウントと個人アカウントについて概説します。

複数のリポジトリへのアクセス権をきめ細かく設定するには、CircleCI プロジェクト用にマシン ユーザーを作成することをお勧めします。 [マシン ユーザー](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users)とは、自動化タスクを実行するために作成する GitHub ユーザーです。 マシン ユーザーの SSH 鍵を使用すれば、リポジトリへのアクセス権を持つ任意のユーザーにプロジェクトのビルド、テスト、デプロイを許可することができます。 マシン ユーザーを作成することにより、単一ユーザーにリンクされた認証情報を紛失するリスクも緩和できます。

ユーザー アカウントへの SSH 鍵の追加

**メモ:** これらの手順を実行するには、マシン ユーザーが管理者アクセス権を持っている必要があります。 プロジェクトの追加が終了したら、マシン ユーザーのアクセス権を読み取り専用に戻すとよいでしょう。

1. [GitHub の説明](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users)に従ってマシン ユーザーを作成します。

2. Log in to GitHub as the machine user.

3. [CircleCI にログイン](https://circleci.com/login)します。 CircleCI を承認するよう GitHub から要求されたら、[**Authorize application (アプリケーションを承認)**] ボタンをクリックします。

4. From the Add Projects page, follow all projects you want the machine user to have access to.

5. **[Project Settings (プロジェクト設定)] > [Checkout SSH keys (SSH 鍵のチェック アウト)]** ページで、[**Authorize With GitHub (GitHub で承認)**] ボタンをクリックします。 これで、マシン ユーザーの代わりに SSH 鍵を作成して GitHub にアップロードする権限が CircleCI に付与されます。

6. **[Create and add XXXX user key (XXXX ユーザー キーを作成して追加)]** ボタンをクリックします。

Now, CircleCI will use the machine user's SSH key for any Git commands that run during your builds.

## デプロイ キーとユーザー キー
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

If you feel strongly about reducing the number of permissions CircleCI uses, consider contacting your VCS provider to communicate your concerns.


### GitHub 組織で CircleCI を再有効化する方法
{: #how-to-re-enable-circleci-for-a-github-organization }

{:.no_toc}

このセクションでは、GitHub 組織に対してサードパーティ製アプリケーションの制限を有効にしてから CircleCI を再有効化する方法を説明します。 [GitHub の設定](https://github.com/settings/connections/applications/78a2ba87f071c28e65bb)に移動し、[Organization access (組織のアクセス)] セクションで以下のいずれかを行います。

- その組織の管理者でない場合は、[Request access (アクセスをリクエスト)] をクリックします (管理者にリクエストを承認してもらう必要があります)。
- 管理者の場合は、[Grant access (アクセスを許可)] をクリックします。

この例では、GitHub リポジトリは `https://github.com/you/test-repo`、CircleCI のプロジェクトは `https://circleci.com/gh/you/test-repo` とします。

GitHub では、最近[サードパーティ製アプリケーションのアクセスを組織レベルで許可](https://help.github.com/articles/about-third-party-application-restrictions/)できるようになりました。 この変更前は、組織のメンバーはだれでも (GitHub のユーザー アカウントに関連付けられる OAuth トークンを生成して) アプリケーションを承認できました。 また、アプリケーションは、その OAuth トークンを使用して、OAuth フローで付与された権限の範囲内で API 経由でユーザーのための処理を実行しました。

現在のデフォルトでは、サードパーティのアクセス制限が有効になっている場合、OAuth トークンは組織のデータにアクセスできません。 ユーザーは、OAuth 処理中またはそれ以降に、組織単位でアクセス許可を明確にリクエストする必要があり、組織の管理者はそのリクエストを承認する必要があります。

You can enable third party access restrictions by visiting the organization settings page on GitHub, and clicking "Setup application access restrictions" button in the "Third-party application access policy" section.

CircleCI がビルドを実行している組織でこの制限を有効にすると、CircleCI は GitHub からプッシュ イベント フックを受け取らなくなり (新しいプッシュのビルドを行わなくなり)、API 呼び出しが拒否されます (これにより、たとえば古いビルドをリビルドしたときに、ソースのチェック アウトが失敗します)。 CircleCI を再度動作させるには、CircleCI アプリケーションへのアクセスを許可する必要があります。

そのため、デプロイ キーは、追加のプライベートな依存関係を持つプロジェクトに対しては十分に強力ではありません。

## SSH ホストの信頼性の確立
ユーザー キーとは

**デプロイ キーとユーザー キーの違い**

新しいプロジェクトを追加するとき、CircleCI ではプロジェクトの Web ベース VCS (GitHub または Bitbucket) に対するデプロイ キーを作成します。 デプロイ キーは、リポジトリ固有の SSH 鍵です。 VCS として GitHub を使用している場合、GitHub に公開鍵を持たせ、CircleCI に秘密鍵を格納します。 デプロイ キーは、CircleCI に単一のリポジトリへのアクセス権を提供します。 CircleCI によるリポジトリへのプッシュを防止するには、このデプロイ キーを読み取り専用に設定します。

ビルドからリポジトリにプッシュするには、書き込みアクセス権のあるデプロイ キー (ユーザー キー) が必要です。 ユーザー キーの作成手順は、VCS によって異なります。 See below for GitHub-specific instructions.

**デプロイ キーとは**

ユーザー キーは、ユーザーに固有の SSH 鍵です。 VCS に公開鍵を持たせ、CircleCI に秘密鍵を格納します。 秘密鍵を持っていると、プロジェクトへの「Git」アクセスの目的で、そのユーザーとして行動することができます。

### GitHub のデプロイ キーの作成
{: #creating-a-github-deploy-key }

{:.no_toc}

In this example, the GitHub repository is `https://github.com/you/test-repo`, and the CircleCI project is `https://circleci.com/gh/you/test-repo`.

1. [GitHub の説明](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)に従い、下記コマンドを実行しSSH 鍵ペアを作成します。 パスフレーズの入力を求められても、**入力しない**でください。

```
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
{{ site.baseurl }}/assets/img/docs/bb_user_key.png

{:.no_toc}

現在、Bitbucket は、ユーザー キーを作成する API を CircleCI に提供していません。 しかし、以下の回避策でユーザー キーを作成できます。

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

CircleCI がプロジェクトをビルドするときには、秘密鍵が `.ssh` ディレクトリにインストールされ、それに続いて SSH がバージョン管理プロバイダーと通信するように設定されます。 したがって、秘密鍵は以下の用途で使用されます。

- 主プロジェクトのチェックアウト
- GitHub でホスティングされるサブモジュールのチェックアウト
- GitHub でホスティングされるプライベートな依存関係のチェックアウト
- Git の自動マージ、タグ付けなど

For this reason, a deploy key isn't sufficiently powerful for projects with additional private dependencies.

### これらのキーのセキュリティ
{: #what-about-security }

CircleCI が生成するチェックアウト キー ペアの秘密鍵は CircleCI システムを出ることはなく (公開鍵のみ GitHub に転送)、また、ストレージ上では安全に暗号化されています。 しかし、これらはビルド コンテナにインストールされるため、CircleCI で実行されるすべてのコードによって読み取ることができます。 同様に、SSH でビルド環境にログインする権限を持つ開発者は、この鍵に直接アクセスできます。

**Isn't there a difference between deploy keys and user keys?**

GitHub がサポートするキーの種類は、デプロイ キーとユーザー キーだけです。 デプロイ キーはグローバルに一意であり (たとえば、複数のリポジトリへのアクセス権を持つデプロイ キーを作成するメカニズムはありません)、またユーザー キーには、それに関連付けられているユーザーとは別の*スコープ*の概念はありません。

複数のリポジトリへのアクセス権をきめ細かく設定するには、GitHub でマシン ユーザーと呼ばれるアカウントの作成を検討してください。 このユーザーにビルドが必要とする権限を正確に付与し、次にそのユーザー キーを CircleCI 上のプロジェクトに関連付けます。

## Establishing the authenticity of an SSH host
{: #establishing-the-authenticity-of-an-ssh-host }

SSH キーを使用してレポジトリをチェックアウトするとき、 `~/.ssh/known_hosts` に GitHub または Bitbucket のフィンガープリントを追加する必要があります。 そうすることで、Executor は接続しているホストの信頼性を検証できます。 これは `checkout` ジョブ ステップによって自動的に処理されます。 カスタムのチェックアウト コマンドを使用したい場合には、以下のコマンドを使用する必要があります。

```
mkdir -p ~/.ssh

echo 'github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
bitbucket.org ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAubiN81eDcafrgMeLzaFPsw2kNvEcqTKl/VqLat/MaB33pZy0y3rJZtnqwR2qOOvbwKZYKiEO1O6VqNEBxKvJJelCq0dTXWT5pbO2gDXC6h6QDXCaHo6pOHGPUy+YBaGQRGuSusMEASYiWunYN0vCAI8QaXnWMXNMdFP3jHAJH0eDsoiGnLPBlBp4TNm6rYI74nMzgz3B9IikW4WVK+dc8KZJZWYjAuORU3jc1c/NPskD2ASinf8v3xnfXeukU0sJ5N6m5E8VLjObPEO+mN2t/FZTMZLiFqPWc/ALSqnMnnhwrNi2rbfg/rd/IpL8Le3pSBne8+seeFVBoGqzHM9yXw==
' >> ~/.ssh/known_hosts
```

対象サーバーの SSH 公開鍵は `ssh-keyscan <host>` コマンドで取得できます。 そして、取得されたテキストのうち `ssh-rsa` プレフィックスがついているものをジョブの `known_hosts` ファイルに追加することで、利用できるようになります。 You can see this in action here:

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
