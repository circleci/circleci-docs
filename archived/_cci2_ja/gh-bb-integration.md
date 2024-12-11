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

CircleCI を使用する際には、 VCS として GitHub もしくは Bitbucket を使用する必要があります。 プロジェクトを CircleCI に追加すると、ユーザー登録時に CircleCI に与えた権限に基づいて、以下の GitHub または Bitbucket Cloud の設定がリポジトリに追加されます。

- **デプロイ キー**: GitHub または Bitbucket Cloud からプロジェクトをチェックアウトするために使用されます。
- **サービス フック**: GitHub または Bitbucket Cloud にプッシュしたときに CircleCI に通知を送信するために使用されます。

CircleCI のデフォルトでは、プッシュフックでビルドが行われます。 したがって、リポジトリのすべてのプッシュフックに対してビルドがトリガーされます。また、プッシュはビルドをトリガーする最も一般的なケースです。

あまり一般的ではありませんが、CircleCI は以下の場合にもフックを使用します。

- CircleCI は PR フック (プルリクエストフック) を処理して、CircleCI アプリケーションの PR 情報を保存します。 [Only Build Pull Requests (プル リクエストのみビルド)] が設定されていると、CircleCI は PR がオープンされたとき、または既存の PR が存在するブランチへのプッシュがあったときだけ、ビルドをトリガーします。 これが設定されている場合でも、プロジェクトのデフォルトのブランチへのすべてのプッシュは、常にビルドされます。
- [Build Forked Pull Requests (フォークされたプル リクエストをビルド)] が設定されている場合、CircleCI はフォークされたリポジトリから作成された PR に応答してビルドをトリガーします。

GitHub または Bitbucket Cloud で Web フックを編集して、ビルドをトリガーするイベントを制限できます。 Web フックの設定を編集することで、CircleCI に送信されるフックを変更できますが、ビルドをトリガーするフックの種類は変更されません。 CircleCI は常にプッシュフックでビルドを行い、設定によっては PR フックでもビルドを行います。ただし、Web フックの設定からプッシュフックを削除すると、ビルドを行いません。 詳細については、[GitHub の「Edit a Hook (フックを編集する)」](https://developer.github.com/v3/repos/hooks/#edit-a-hook)または [Atlassian の「Manage Webhooks (Web フックを管理する)」](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html)を参照してください。

タグプッシュでのビルド方法については、「[ワークフローにおけるコンテキストとフィルターの使用]({{site.baseurl}}/ja/2.0/workflows/#ワークフローにおけるコンテキストとフィルターの使用)」を参照してください。

### .circleci/config.yml ファイルの追加
{: #add-a-circleciconfigyml-file }
{:.no_toc}

[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルを作成して GitHub または Bitbucket Cloud リポジトリにコミットすると、CircleCI は直ちにユーザーコードをチェックアウトし、設定されているテストがあればそれを含めて、最初のジョブを実行します。 例えば、Postgres の機能を駆使した Rails のプロジェクトに携わっているなら、下記のような run ステップのジョブを記述することになります。

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

### Bitbucket 個人利用の組織
{: #bitbucket-personal-orgs }

CircleCI は個人およびデフォルトの組織と VCS ユーザー名が一致することを想定しています。 Bitbucket では現在ユーザー名と異なる名前にパーソナルワークスペースの名前を変更することができますが、CircleCI では対応していません。 CircleCI を使って個人ワークスペースでプロジェクトをビルドしている場合は、ワークスペースの名前がユーザー名と一致していることを確認してください。

## プロジェクトで追加のプライベートリポジトリのチェックアウトを有効にする
{: #enable-your-project-to-check-out-additional-private-repositories }

テストプロセスが複数のリポジトリを参照する場合、CircleCI ではデプロイキーに加えて GitHub ユーザー キーも必要となります。 これは、 GitHub ユーザーキーはユーザーの_すべて_の GitHub リポジトリに対してアクセス権を持ちますが、デプロイキーは*単一の*リポジトリに対してのみ有効であるためです。

プロジェクトの **[Project Settings (プロジェクト設定)] > [SSH keys (SSH キー)]** のページで、CircleCI に渡す GitHub のユーザーキーを指定します。 **[User Key (ユーザーキー)]** のセクションまでスクロールし、 **[Authorize with GitHub (GitHub で認証する)]** ボタンをクリックします。 CircleCI は、この新しい SSH キーを作成し、それを GitHub のユーザーアカウントに関連付けて、ユーザーのすべてのリポジトリにアクセスできるようにします。

## ユーザーキーのセキュリティ
{: #user-key-security }

CircleCI が SSH キーを公開することはありません。

SSH キーは信頼するユーザーとのみ共有してください。 ユーザーキーを使用するプロジェクトの場合、すべての GitHub コラボレーターがリポジトリにアクセスできるため、ユーザーキーはソースコードを委ねられる人とのみ共有してください。

## ユーザーキーアクセスに関するエラーメッセージ
{: #user-key-access-related-error-messages }

下記はユーザーキーを追加する際によく表示されるエラーです。

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

複数のリポジトリへのアクセス権をきめ細かく設定するには、CircleCI プロジェクト用にマシンユーザーを作成することをお勧めします。 [マシンユーザー](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users)とは、自動化タスクを実行するために作成する GitHub ユーザーです。 マシンユーザーの SSH キーを使用すれば、リポジトリへのアクセス権を持つ任意のユーザーにプロジェクトのビルド、テスト、デプロイを許可することができます。 マシンユーザーを作成することにより、単一ユーザーにリンクされた認証情報を紛失するリスクも低減できます。

マシンユーザーの SSH キーを使用するには、以下の手順に従います。

**注:** これらの手順を実行するには、マシンユーザーが管理者アクセス権を持っている必要があります。 プロジェクトの追加が終了したら、マシンユーザーのアクセス権を読み取り専用に戻すとよいでしょう。

1. [GitHub の説明](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users)に従ってマシンユーザーを作成します。

2. GitHub にマシンユーザーとしてログインします。

3. [CircleCI Web アプリ](https://circleci.com/login)にログインします。 CircleCI を承認するよう GitHub から要求されたら、[**Authorize application (アプリケーションを承認)**] ボタンをクリックします。

4. **[Projects]** のページから、マシンユーザーにアクセスを許可するプロジェクトをフォローします。

5. **[Project Settings (プロジェクト設定)] > [Checkout SSH keys (SSH キーのチェック アウト)]** ページで、[**Authorize With GitHub (GitHub で承認)**] ボタンをクリックします。 これで、マシンユーザーの代わりに SSH キーを作成して GitHub にアップロードする権限が CircleCI に付与されます。

6. **[Create and add XXXX user key (XXXX ユーザーキーを作成して追加)]** ボタンをクリックします。

これで、CircleCI はビルド中に実行されるすべての Git コマンドに対して、マシンユーザーの SSH キーを使用するようになります。

## 権限の概要
{: #permissions-overview }

CircleCI は、VCS プロバイダーに対して、[GitHub の権限モデル](http://developer.github.com/v3/oauth/#scopes)や [Bitbucket の権限モデル](https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html#OAuthonBitbucketCloud-Scopes)で定義されている以下の権限を要求します。

**読み取りアクセス許可 **

- ユーザーのメールアドレスを取得する

**書き込みアクセス許可**

- ユーザーのリポジトリリストを取得する
- ユーザーアカウントへの SSH キーの追加

プロジェクトの設定に必要な**管理者の権限**

- デプロイキーのリポジトリへの追加
- サービスフックのレポジトリへの追加

**注:** CircleCI は絶対に必要な権限しか要求しません。 また、CircleCI が要求できる権限は、各 VCS プロバイダーが提供すると決めた権限のみに制限されます。 たとえば、 GitHub から全ユーザーのリポジトリ (公開・非公開の両方) の一覧を GitHub から取得する際には、 [`repo` スコープ](https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/#available-scopes) の権限が必要で、これは書き込みアクセス許可に相当します。 GitHub はユーザーのリポジトリの一覧に対して読み取りのみの権限は提供していないため、このような設定が必要になります。

CircleCI が使用する権限の数をどうしても減らしたい場合は、VCS プロバイダーに連絡して、その旨を伝えてください。


### GitHub 組織で CircleCI を再有効化する方法
{: #how-to-re-enable-circleci-for-a-github-organization }
{:.no_toc}

ここでは、GitHub の組織に対するサードパーティアプリケーションのアクセス制限を有効化した際に、CircleCI の組織へのアクセスを再有効化する方法を解説します。 [GitHub Settings](https://github.com/settings/connections/applications/78a2ba87f071c28e65bb) を開くと、**Organization access** セクションに、管理者でない場合はアクセスをリクエストする、管理者の場合はアクセスを付与するオプションがあります。

#### 管理者以外のメンバーのワークフロー
{: #non-admin-member-workflow }
{:.no_toc}

- GitHub 組織のメンバー(管理者以外) は、**Request** ボタンをクリックすると、メッセージが組織の管理者に送信されます。 管理者がそのリクエストを承認する必要があります。
- **Request approval from owners** をクリックすると、組織のオーナーにメールが送信されます。
- 承認を待っている間は、組織名の隣に **Access request pending** が表示されます。
- CircleCI が承認されると、組織名の隣にチェックマークが表示されます。

#### 管理者・オーナーのワークフロー
{: #admin-owner-workflow }
{:.no_toc}

- 組織のオーナー (管理者) の場合、**Grant** ボタンをクリックするとCircleCI にアクセス権を付与することができます。
- CircleCI アプリを認証するためにパスワードを確認される場合があります。
- CircleCI を承認すると、組織名の隣にチェックマークが表示されます。

アクセスが承認されると、CircleCI は元通りの挙動になるはずです。

#### サードパーティのアプリケーション
{: #third-party-applications }
{:.no_toc}

GitHub は最近、[組織単位での](https://help.github.com/articles/about-third-party-application-restrictions/)サードパーティーアプリケーションへのアクセスの承認機能を追加しました。 この変更が行われるまでは、組織のどのメンバーでも (GitHub のユーザーアカウントに紐づく OAuth トークンを生成して) アプリケーションを承認することが可能となっていました。また、アプリケーションはその OAuth トークンを用いることで、ユーザーが API を経由して実行するのと同じように、OAuth で認められている権限の範囲内で動作することができました。

現在のデフォルトでは、サードパーティのアクセス制限が有効になっている場合、OAuth トークンは組織のデータにアクセスできません。 OAuth の処理中かその後に、ユーザーは組織単位で明確にアクセス許可をリクエストしなければならず、組織の管理者はそのリクエストを承認する必要があります。

オーナーまたは管理者の場合、GitHub の[Organization settings](https://github.com/settings/organizations) のページにアクセスし、その組織の **Settings** ボタンをクリックするとサードパーティのアクセス制限を有効にすることができます。 サードパーティアプリケーションの制限を設定する場合は、**Third-party application access policy** のセクションで、**Setup application access restrictions** ボタンをクリックします。

これらの設定の詳細や設定方法は、[GitHub](https://docs.github.com/en/organizations/restricting-access-to-your-organizations-data/enabling-oauth-app-access-restrictions-for-your-organization) をお読みください。

CircleCI がビルドを実行している組織でこの制限を有効にすると、CircleCI は GItHub からプッシュイベントフックを受け取らなくなり、新しいプッシュをビルドしません。 API 呼び出しも拒否されます。これにより、古いビルドのたとえば古いビルドをリビルドしたときに、ソースのチェックアウトが失敗します。 CircleCI を再度動作させるには、CircleCI アプリケーションへのアクセスを許可する必要があります。
{: class="alert alert-info" }

## デプロイキーとユーザーキー
{: #deployment-keys-and-user-keys }

**デプロイキーとは**

新しいプロジェクトを追加すると、CircleCI は Web ベースの VCS (GitHub や Bitbucket) 上にそのプロジェクト用のデプロイキーを作成します。 デプロイキーは、リポジトリ固有の SSH キーです。 VCS として GitHub を使用している場合、GitHub にパブリックキーを持たせ、CircleCI にプライベートキーを格納します。 デプロイキーは、CircleCI に単一のリポジトリへのアクセス権を提供します。 CircleCI によるリポジトリへのプッシュを防止するには、このデプロイキーを読み取り専用に設定します。

ビルドからリポジトリにプッシュするには、書き込みアクセス権のあるデプロイキーが必要です。 書き込みアクセス権のあるデプロイキーの作成手順は、VCS によって異なります。 GitHub 固有の手順については以下を参照してください。

**ユーザーキーとは**

ユーザーキーは、ユーザーに固有の SSH キーです。 VCS にパブリックキーを持たせ、CircleCI にプライベートキーを格納します。 プライベートキーを持っていると、プロジェクトへの「Git」アクセスの目的で、そのユーザーとして行動することができます。

### GitHub のデプロイキーの作成
{: #creating-a-github-deploy-key }

この例では、GitHub リポジトリは `https://github.com/you/test-repo`、CircleCI のプロジェクトは `https://circleci.com/gh/you/test-repo`です。

1. [GitHub の説明](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)に従って、SSH キーペアを作成します。 パスフレーズの入力を求められても、**入力しない**でください。
```shell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. `https://github.com/you/test-repo/settings/keys` にアクセスして **Add deploy key** をクリックします。 Title フィールドにタイトルを入力し、1 の手順で作成したパブリックキーをコピー＆ペーストします。 **Allow write access** にチェックを入れ、 **Add key** をクリックします。

3. CircleCI アプリのプロジェクトの設定にアクセスし、 **SSH Keys** と **Add SSH key** を選択します。 Hostname のフィールドには、`github.com` を入力し、1 の手順で作成したプライベートキーを追加します。 その後、**Add SSH Key** をクリックします。

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

ジョブから GitHub リポジトリにプッシュすると、CircleCI は追加された SSH キーを使用します。

### Bitbucket ユーザーキーの作成
{: #creating-a-bitbucket-user-key }

現在、Bitbucket は、ユーザーキーを作成する API を CircleCI に提供していません。 しかし、以下の回避策によりユーザーキーを作成することができます。

1. CircleCI アプリケーションで、プロジェクトの設定に移動します。

2. **SSH Keys** のページに移動し、**User Key** までスクロールダウンします。

3. **Add User Key** ボタンを右クリックし、**Inspect**オプションを選択し、Web ブラウザーの検証ツールを起動します。 ![プロジェクト設定のユーザーキー追加ボタン]({{site.baseurl}}/assets/img/docs/bb_user_key.png)

4. ブラウザーの検証ツールで、**Network** タブを選択し、コンソールをクリアします。

5. **Add User Key** をクリックし、**Confirm User** をクリックし、このモーダルでユーザーがマシンユーザーであることを確認します。 _必須ではありませんが、マシンユーザーを作成することを強く推奨します_。 ![マシンユーザーモーダル]({{site.baseurl}}/assets/img/docs/bb_confirm_user.png)

6. フィルターボックスで、checkout と入力します。 これにより、`checkout-key` を見つけることができます。 ステータス 201 の `checkout-key` をクリックし、**Preview** タブを選択します。  `public_key` をクリップボードにコピーします。 ![パブリックキーを探す]({{site.baseurl}}/assets/img/docs/bb_user_key2.png)

7. Bitbucket の [SSH キーの設定方法](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)の説明に従って、Bitbucket にキーを追加します。

この SSH ユーザーキーには "PREFERRED" ラベルが表示されます。プロジェクトにデプロイキーが付与されている場合、SSH ユーザーキーが優先的に使用されます。

### これらのキーの使用方法
{: #how-are-these-keys-used }

CircleCI がプロジェクトをビルドするときには、プライベートキーが `.ssh` ディレクトリにインストールされ、それに続いて SSH がバージョン管理プロバイダーと通信するように設定されます。 したがって、プライベートキーは以下の用途で使用されます。

- メインプロジェクトのチェックアウト
- いずれかの GitHub でホスティングされるサブモジュールのチェックアウト
- いずれかの GitHub でホスティングされるプライベート依存関係のチェックアウト
- Git の自動マージ、タグ付けなど

そのため、デプロイ キーは、追加のプライベートな依存関係を持つプロジェクトに対しては十分に強力ではありません。

### これらのキーのセキュリティ
{: #what-about-security }

CircleCI が生成するチェックアウトキーペアのプライベートキーが CircleCI システムの外に出ることはなく (パブリックキーのみ GitHub に転送)、ストレージ上では安全に暗号化されています。 しかし、これらはビルドコンテナにインストールされるため、CircleCI で実行されるすべてのコードによって読み取ることができます。 同様に、SSH キーを使用できる開発者は、このキーに直接アクセスできます。

**デプロイキーとユーザーキーの違い**

GitHub がサポートするキーの種類は、デプロイキーとユーザーキーだけです。 デプロイキーはグローバルに一意であり (たとえば、複数のリポジトリへのアクセス権を持つデプロイキーを作成するメカニズムはありません)、またユーザーキーには、それに関連付けられているユーザーとは別の*スコープ*の概念はありません。

複数のリポジトリへのアクセス権をきめ細かく設定するには、GitHub でマシンユーザーと呼ばれるアカウントの作成を検討してください。 このユーザーにビルドが必要とする権限を正確に付与し、次にそのユーザー キーを CircleCI 上のプロジェクトに関連付けます。

## SSH ホストの信頼性の確立
{: #establishing-the-authenticity-of-an-ssh-host }

SSH キーを使用してレポジトリをチェックアウトするとき、既知のホストファイル (`~/.ssh/known_hosts`) に GitHub または Bitbucket のフィンガープリントを追加する必要があります。そうすることで、Executor は接続しているホストの信頼性を検証できます。 これは `checkout` ジョブステップによって自動的に処理されます。カスタムのチェックアウトコマンドを使用したい場合には、以下のコマンドを使用する必要があります。

```shell
mkdir -p ~/.ssh

echo 'github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
bitbucket.org ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAubiN81eDcafrgMeLzaFPsw2kNvEcqTKl/VqLat/MaB33pZy0y3rJZtnqwR2qOOvbwKZYKiEO1O6VqNEBxKvJJelCq0dTXWT5pbO2gDXC6h6QDXCaHo6pOHGPUy+YBaGQRGuSusMEASYiWunYN0vCAI8QaXnWMXNMdFP3jHAJH0eDsoiGnLPBlBp4TNm6rYI74nMzgz3B9IikW4WVK+dc8KZJZWYjAuORU3jc1c/NPskD2ASinf8v3xnfXeukU0sJ5N6m5E8VLjObPEO+mN2t/FZTMZLiFqPWc/ALSqnMnnhwrNi2rbfg/rd/IpL8Le3pSBne8+seeFVBoGqzHM9yXw==
' >> ~/.ssh/known_hosts
```

対象サーバーの SSH キーは `ssh-keyscan <host>` を実行することで取得できます。 そして、取得されたテキストのうち `ssh-rsa` プレフィックスがついているものをジョブの `known_hosts` ファイルに追加することで、利用できるようになります。 たとえば、以下のようになります。

```shell
➜  ~ ssh-keyscan github.com
# github.com:22 SSH-2.0-babeld-2e9d163d
github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
# github.com:22 SSH-2.0-babeld-2e9d163d
# github.com:22 SSH-2.0-babeld-2e9d163d
➜  ~ ✗
```

以下のコマンドを実行すると、キーを known_hosts に追加できます。
```shell
ssh-keyscan github.com >> ~/.ssh/known_hosts
```
