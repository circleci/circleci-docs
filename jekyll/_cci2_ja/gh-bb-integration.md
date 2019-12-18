---
layout: classic-docs
title: GitHub および Bitbucket のインテグレーション
description: GitHub または Bitbucket の使用
categories: [migration]
Order: 60
---

ここでは、以下のセクションに沿って、CircleCI で GitHub と Bitbucket を使用する方法について説明します。

- 目次
{:toc}

## 概要
{:.no_toc}

プロジェクトを CircleCI に追加すると、ユーザー登録時に CircleCI に与えた権限を使用して、以下の GitHub または Bitbucket の設定がリポジトリに追加されます。
- **デプロイキー**：GitHub または Bitbucket からプロジェクトをチェックアウトするために使用されます。
- **サービスフック**：GitHub または Bitbucket にプッシュしたときに CircleCI に通知するために使用されます。

CircleCI ビルドは、デフォルトでフックをプッシュします。 したがって、リポジトリのすべてのプッシュフックに対してビルドがトリガーされます。また、PUSH はビルドをトリガーする最も一般的なケースです。

あまり一般的ではありませんが、CircleCI は以下の場合にもフックを使用します。 - CircleCI は PR フックを処理して、CircleCI アプリケーションの PR 情報を保存します。[Only Build Pull Requests (プルリクエストのみビルド)] が設定されていると、CircleCI は PR がオープンされたとき、または既存の PR が存在するブランチへのプッシュがあったときだけ、ビルドをトリガーします。 これが設定されている場合でも、プロジェクトのデフォルトのブランチへのすべてのプッシュは、常にビルドされます。 - [Build Forked Pull Requests (フォークされたプルリクエストをビルド)] が設定されている場合、CircleCI はフォークされたリポジトリから作成された PR に応答してビルドをトリガーします。

GitHub または Bitbucket で Web フックを編集して、ビルドをトリガーするイベントを制限できます。 Web フックの設定を編集することで、CircleCI に送信されるフックを変更できますが、ビルドをトリガーするフックの種類は変更されません。 CircleCI は、プッシュフックを必ずビルドし、(設定によっては) PR フックでもビルドを行います。ただし、Web フックの設定からプッシュフックを削除すると、ビルドを行いません。 詳細については、[GitHub の「Edit a Hook (フックを編集する)」](https://developer.github.com/v3/repos/hooks/#edit-a-hook)または [Atlassian の「Manage Webhooks (Web フックを管理する)」](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html)を参照してください。

タグプッシュのビルド方法については、「[Workflows におけるコンテキストとフィルターの使い方]({{ site.baseurl }}/ja/2.0/workflows/#workflows-におけるコンテキストとフィルターの使い方)」を参照してください。

### .circleci/config.yml ファイルの追加
{:.no_toc}

[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルを作成して GitHub または Bitbucket リポジトリにコミットすると、CircleCI は直ちにユーザーコードをチェックアウトし、設定されているテストがあればそれを使用して、最初のジョブを実行します。 たとえば、Postgres の仕様と機能を使用する Rails プロジェクトで作業している場合、ジョブ実行ステップの設定は以下のようになります。

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

CircleCI は、毎回クリーンなコンテナでテストを実行します。そのため、他のユーザーはコードにアクセスできず、ユーザーがプッシュするたびにテストが新しく実行されます。 [ダッシュボード](https://circleci.com/dashboard){:rel="nofollow"}では、テストの状況が更新されるのをリアルタイムで確認でき、ジョブ終了後には CircleCI から電子メール通知が送信され、ステータスを確認できます。 また、GitHub または Bitbucket で、ユーザーのキービットからのコミットに対してステータスバッジが表示されます (以下のスクリーンショットを参照)。

![コミット後のステータスバッジ]({{ site.baseurl }}/assets/img/docs/status_badge.png)

プルリクエスト画面にはステータスがまとめて表示され、すべてのテストに合格すると以下のように表示されます。

![PR 後のステータスバッジ]({{ site.baseurl }}/assets/img/docs/status_check.png)

## プロジェクトで追加のプライベートリポジトリのチェックアウトを有効にする

テストプロセスが複数のリポジトリを参照する場合、各デプロイキーは *1つ*のリポジトリに対してのみ有効であるのに対して、GitHub ユーザーキーは、ユーザーの*すべて*の GitHub リポジトリに対してアクセス権を持つため、CircleCI はデプロイキーの他に GitHub ユーザーキーを必要とします。 詳細については、「[CircleCI に SSH 鍵を登録する]({{ site.baseurl }}/ja/2.0/add-ssh-key)」を参照してください。

プロジェクトの **[Project Settings (プロジェクト設定)] > [Checkout SSH keys (SSH キーをチェックアウト)]** ページで、CircleCI に渡す GitHub のユーザーキーを指定します。 CircleCI は、この新しい SSH 鍵を作成し、それを GitHub のユーザーアカウントに関連付けて、ユーザーのすべてのリポジトリにアクセスできるようにします。

<h2 id="security">ユーザーキーのセキュリティ</h2>

CircleCI が SSH 鍵を公開することはありません。

SSH 鍵は信頼するユーザーとのみ共有してください。また、ユーザーキーを使用するプロジェクトの GitHub コラボレーターはだれでもリポジトリにアクセスできるため、ソースコードを任せられる人にのみユーザーキーを共有してください。

<h2 id="error-messages">ユーザーキーアクセスに関するエラーメッセージ</h2>

ユーザーキーの追加が必要なときに表示される一般的なエラーを示します。

**Python**：`pip install` ステップ実行中

    ERROR: Repository not found.


**Ruby**：`bundle install` ステップ実行中

    Permission denied (publickey).


## マシンユーザーの作成

複数のリポジトリへのアクセス権をきめ細かく設定するには、CircleCI プロジェクト用にマシンユーザーの作成を検討してください。 [マシンユーザー](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users)とは、自動化タスクを実行するためにユーザーが作成する GitHub ユーザーです。 マシンユーザーの SSH 鍵を使用すれば、リポジトリのアクセス権を持つ任意のユーザーにプロジェクトのビルド、テスト、デプロイを許可することができます。 マシンユーザーを作成することにより、単一ユーザーにリンクされた認証情報を失う危険性も低下します。

マシンユーザーの SSH 鍵を使用するには、以下の手順を行います。

**メモ：**これらの手順を実行するには、マシンユーザーが管理者アクセス権を持っている必要があります。 プロジェクトの追加が終了したら、マシンユーザーのアクセス権を読み取り専用に戻すことができます。

1. [GitHub の説明](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users)に従ってマシンユーザーを作成します。

2. GitHub にマシンユーザーとしてログインします。

3. [CircleCI にログイン](https://circleci.com/login)します。 CircleCI を承認するように GitHub から要求されたら、[**Authorize application (アプリケーションを承認)**] ボタンをクリックします。

4. [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページで、マシンユーザーにアクセスを許可するすべてのプロジェクトをフォローします。

5. **[Project Settings (プロジェクト設定)] > [Checkout SSH keys (SSH キーをチェックアウト)]** ページで、[**Authorize With GitHub (GitHub で承認)**] ボタンをクリックします。 これで、マシンユーザーの代わりに SSH 鍵を作成して GitHub にアップロードする権限が CircleCI に付与されます。

6. [**Create and add XXXX user key (XXXX ユーザーキーを作成して追加)**] ボタンをクリックします。

これで、CircleCI はビルド中に実行されるすべての Git コマンドに対して、マシンユーザーの SSH 鍵を使用するようになります。

## 権限の概要

CircleCI は、VCS プロバイダーに対して、[GitHub の権限モデル](http://developer.github.com/v3/oauth/#scopes)や [Bitbucket の権限モデル](https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html#OAuthonBitbucketCloud-Scopes)で定義されている以下の権限を要求します。

**読み取りアクセス権** - ユーザーの電子メールアドレスの取得

**書き込みアクセス権** - リポジトリへのデプロイキーの追加 - リポジトリへのサービスフックの追加 - ユーザーのリポジトリリストの取得 - ユーザーアカウントへの SSH 鍵の追加

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

- その組織の管理者でない場合は、[Request access (アクセスをリクエスト)] します (管理者にリクエストを承認してもらう必要があります)。
- 管理者の場合は、[Grant access (アクセスを許可)] します。

アクセスが許可されると、CircleCI は再度正常に動作するようになります。

GitHub では、最近[サードパーティ製アプリケーションのアクセスを組織レベルで許可](https://help.github.com/articles/about-third-party-application-restrictions/)できるようになりました。 この変更前は、組織のメンバーはだれでも (GitHub のユーザーアカウントに関連付けられる OAuth トークンを生成して) アプリケーションを承認できました。また、アプリケーションは、その OAuth トークンを使用して、OAuth フローで付与された権限の範囲内で API 経由でユーザーのための処理を実行しました。

現在、デフォルトでは、サードパーティのアクセス制限が有効になっている場合、OAuth トークンは組織のデータにアクセスできません。 ユーザーは、OAuth 処理中またはそれ以降に、組織単位でアクセス許可を明確にリクエストする必要があり、組織の管理者はそのリクエストを承認する必要があります。

サードパーティのアクセス制限を有効にするには、GitHub で組織の設定ページにアクセスし、[Third-party application access policy (サードパーティ製アプリケーションのアクセスポリシー)] セクションにある [Setup application access restrictions (アプリケーションのアクセス制限をセットアップ)] ボタンをクリックします。

CircleCI がビルドを実行している組織でこの制限を有効にすると、CircleCI は GitHub からプッシュイベントフックを受け取らなくなり (新しいプッシュのビルドを行わなくなり)、API 呼び出しが拒否されます (これにより、たとえば古いビルドをリビルドしたときに、ソースのチェックアウトが失敗します)。CircleCI を再度動作させるには、CircleCI アプリケーションへのアクセスを許可する必要があります。

CircleCI が使用しているアカウントと権限のシステムは、まだ十分に明確と言えません。前述のとおり、CircleCI ではユーザーの皆様を第一に考えて、さらに改良したシステムを現在開発中です。

## デプロイキーとユーザーキー

**デプロイキーとは**

新しいプロジェクトを追加すると、CircleCI はプロジェクトの Web ベース VCS (GitHub または Bitbucket) 上にデプロイキーを作成します。 デプロイキーは、リポジトリ固有の SSH 鍵です。 VCS として GitHub を使用している場合、GitHub はパブリックキーを持っており、CircleCI はプライベートキーを格納します。 デプロイキーは、CircleCI に単一のリポジトリへのアクセス権を提供します。 CircleCI によるリポジトリへのプッシュを防止するには、このデプロイキーを読み取り専用に設定します。

ビルドからリポジトリにプッシュするには、書き込みアクセス権のあるデプロイキー (ユーザーキー) が必要です。 ユーザーキーの作成手順は、VCS によって異なります。

**ユーザーキーとは**

ユーザーキーは、ユーザーに固有の SSH 鍵です。 VCS はパブリックキーを持っており、CircleCI はプライベートキーを格納します。 プライベートキーを持っていると、プロジェクトへの「Git」アクセスの目的で、そのユーザーとして行動することができます。

### GitHub ユーザーキーの作成
{:.no_toc}

この例では、GitHub リポジトリは `https://github.com/you/test-repo`、CircleCI のプロジェクトは <https://circleci.com/gh/you/test-repo>{:rel="nofollow"} です。

1. [GitHub の説明](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)に従って、SSH 鍵ペアを作成します。 パスフレーズの入力を求められても、**入力しない**でください。

**注意：**最近 `ssh-keygen` は、デフォルトで PEM 形式のキーを生成しないようにアップデートされました。 プライベートキーが `-----BEGIN RSA PRIVATE KEY-----` で始まらない場合、`ssh-keygen -m PEM -t rsa -C "your_email@example.com"` でキーを生成すると、強制的に PEM 形式で生成できます。

1. `https://github.com/you/test-repo/settings/keys` に移動し、[Add deploy key (デプロイキーを追加)] をクリックします。 [Title (タイトル)] フィールドにタイトルを入力し、手順 1 で作成したキーをコピー＆ペーストします。 [Allow write access (書き込みアクセスを許可)] をオンにし、[Add key (キーを追加)] をクリックします。

2. <https://circleci.com/gh/you/test-repo/edit#ssh>{:rel="nofollow"} に移動し、手順 1 で作成したキーを追加します。 [Hostname (ホスト名)] フィールドに「github.com」と入力し、送信ボタンを押します。

3. config.yml で `add_ssh_keys` キーを使用して、以下のようにフィンガープリントを追加します。

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

CircleCI がプロジェクトをビルドするときには、プライベートキーが `.ssh` ディレクトリにインストールされ、それに続いて SSH がバージョン管理プロバイダーと通信するように設定されます。 したがって、プライベートキーは以下の用途で使用されます。

- 主プロジェクトのチェックアウト
- いずれかの GitHub でホスティングされるサブモジュールのチェックアウト
- いずれかの GitHub でホスティングされるプライベート依存関係のチェックアウト
- Git の自動マージ、タグ付けなど

そのため、デプロイキーは、追加のプライベート依存関係を持つプロジェクトに対しては十分に強力ではありません。

### これらのキーのセキュリティ

CircleCI が生成するチェックアウトキーペアのプライベートキーは CircleCI システムを出ることはなく (パブリックキーのみ GitHub に転送)、また、ストレージ上では安全に暗号化されています。 しかし、これらはビルドコンテナにインストールされるため、CircleCI で実行されるすべてのコードによって読み取ることができます。

**デプロイキーとユーザーキーの違い**

GitHub がサポートするキータイプは、デプロイキーとユーザーキーだけです。 デプロイキーはグローバルに一意であり (たとえば、複数のリポジトリへのアクセス権を持つデプロイキーを作成するメカニズムはありません)、またユーザーキーには、それに関連付けられているユーザーから分離した*スコープ*の概念はありません。

複数のリポジトリへのアクセス権をきめ細かく設定するには、GitHub でマシンユーザーと呼ばれるものの作成を検討してください。 このユーザーにビルドが必要とする権限を正確に付与し、次にそのユーザーキーを CircleCI 上の プロジェクトに関連付けます。
