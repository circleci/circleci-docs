---
layout: classic-docs
title: "CircleCI CLI 入門"
short-title: "CircleCI CLI 入門"
description: "コマンド ラインから CircleCI を操作する方法の基礎"
categories:
  - はじめよう
order: 50
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

## はじめに
{: #overview }

開発作業の大部分をターミナルで行いたいお客様は、[CircleCI CLI](https://github.com/CircleCI-Public/circleci-cli) をインストールして CircleCI 上のプロジェクトを操作することをお勧めします。 このドキュメントでは、CircleCI プロジェクトの初期化や操作を主にターミナルから行うための手順を説明します。 CircleCI Server v2.x では、レガシーバージョンの CLI しかサポートしていないのでご注意ください。 インストール方法についての詳細は、[こちら]({{site.baseurl}}/ja/2.0/local-cli/#using-the-cli-on-circleci-server-v2-x)を参照してください。

## 前提条件
{: #prerequisites }

- Unix マシン (Mac または Linux) を使用している。 Windows にも CircleCI CLI ツールのインストールは _可能_ ですが、現在はベータ版であり、Unix 版ほどの機能は完備されていません。
- CI/CD、CircleCI サービスの機能とコンセプトについての基礎知識がある。
- GitHub アカウントを持っている。
- CircleCI アカウントを持っている。
- ターミナルを開いており、使用可能である。
- オプション: Github の [`Hub`](https://hub.github.com/) コマンドライン ツールがインストールされている (Web UI ではなくコマンド ラインから Github を使用できます)。 Hub のインストール方法については、[こちら](https://github.com/github/hub#installation)を参照してください。

上記の前提条件に不明点がある方や CircleCI プラットフォームの初心者は、先に[入門ガイド]({{site.baseurl}}/ja/2.0/getting-started/)または[コンセプトに関するドキュメント]({{site.baseurl}}/ja/2.0/concepts/#section=getting-started)をお読みになることをお勧めします。

## 手順
{: #steps }

### Git リポジトリを初期化する
{: #initialize-a-git-repo }

基本中の基本から始めましょう。 プロジェクトを作成し、Git リポジトリを初期化します。 各ステップについては、以下のコード ブロックを参照してください。

```shell
cd ~ # navigate to your home directory.
mkdir foo_ci # create your project in a folder called "foo_ci"
cd foo_ci # change directories into the new foo_ci folder.
git init # create a git repository
touch README.md # Create a file to put in your repository
echo 'Hello World!' >> README.md
git add . # Stage every file to commit
git commit -m "Initial commit" # create your first commit.
```

### Git リポジトリを VCS に接続する
{: #connect-your-git-repo-to-a-vcs }

完了です。 前述の手順で Git リポジトリがセットアップされ、「Hello World!」と記述された 1 つのファイルが格納されました。 ローカルの Git リポジトリは、バージョン管理システム (GitHub または BitBucket) に接続する必要があります。 やってみましょう。

Hub CLI のインストールとセットアップが完了している場合は、以下のコマンドを実行するだけです。

```shell
hub create
```

次に、インストール後のセットアップ手順を実行します。

Hub CLI を使用していない場合は、GitHub にアクセスしてログインし、[新しいリポジトリを作成](https://github.com/new)します。 指示に従ってコミットし、リモートにプッシュします。 この操作は通常、以下のようなコマンドになります。

```shell
git remote add origin git@github.com:<YOUR_USERNAME>/foo_ci.git
git push --set-upstream origin master
```

これで、Git リポジトリが VCS に接続され、 VCS 上のリモート ("origin") がローカルでの作業内容と一致するようになります。

### CircleCI CLI をダウンロードして準備する
{: #download-and-set-up-the-circleci-cli }

次に、CircleCI CLI をインストールし、いくつかの機能を試してみます。 CLI を Unix マシンにインストールするには、ターミナルで以下のコマンドを実行します。

```shell
curl -fLSs https://circle.ci/cli | bash
```

新しく作成した `config.yml` ファイルを開き、以下の内容を貼り付けます。

次に、インストール後のセットアップ手順を実行します。

```shell
circleci setup
```

ここで API トークンを要求されます。 [アカウントの設定ページ](https://circleci.com/account/api)に移動し、 `[Create New Token (新しいトークンを作成する)]` をクリックします。 トークンに名前を付け、生成されたトークン文字列をコピーして、安全な場所に保存します。

CLI に戻って API トークンを貼り付ければセットアップは完了です。

### 最初の設定ファイルを準備してバリデーションする
{: #setup-and-validate-our-first-config }

ここからは、プロジェクト ディレクトリに設定ファイルを作成します。

```shell
cd ~/foo_ci # Make sure you are still in the foo_ci folder
mkdir .circleci # create a directory called ".circleci"
cd .circleci # change directories to the new directory
touch config.yml # create an YAML file called "config.yml"
```

上記のコマンドにより、`.circleci` フォルダーが作成され、そこに設定ファイルが格納されます。

新しく作成した `config.yml` ファイルを開き、以下の内容を貼り付けます。

```yaml
version: 2.0
jobs:
  build:
    docker:
      - image: cimg/ruby:3.0-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: echo "Hello World"
```

ここで、この設定が有効であるかどうかをバリデーションします。 プロジェクトのルートで、以下のコマンドを実行します。

```shell
circleci config validate
```

**メモ:** 使用しているコマンドの詳細を知りたい場合は、`--help` を追加すると、いつでもコマンドに関する補足情報がターミナルに表示されます。

```shell
circleci config validate --help
```

### VCS にプッシュする前にジョブをテストする
{: #testing-a-job-before-pushing-to-a-vcs }

CircleCI CLI では、コマンドラインからジョブをローカルでテストできます。 VCS にプッシュする必要はありません。 設定ファイル内のジョブに問題があることがわかっている場合は、プラットフォームでクレジットや時間を消費するよりも、ローカルでテストやデバッグを行う方が賢明です。

"build" ジョブをローカルで実行してみます。

```shell
circleci local execute
```

これで、指定した Docker イメージ (この場合は `circleci/ruby::2.4.2-jessie-node`) がプル ダウンされ、ジョブが実行されます。 使用している Docker イメージのサイズによっては、多少の時間がかかります。

ターミナルには大量のテキストが表示されるはずです。 出力の最後の数行は以下のようになります。

```shell
====>> Checkout code
  #!/bin/bash -eo pipefail
mkdir -p /home/circleci/project && cp -r /tmp/_circleci_local_build_repo/. /home/circleci/project
====>> echo "Hello World"
  #!/bin/bash -eo pipefail
echo "Hello World"
Hello World
Success!
```

### リポジトリを CircleCI に接続する
{: #connect-your-repo-to-circleci }

このステップでは、ターミナルを離れる必要があります。 [CircleCI Web アプリ](https://app.circleci.com/)の **Projects** ページに移動します。 コードをプッシュするたびに CI が実行されるようにプロジェクトをセットアップします。

プロジェクトのリストから目的のプロジェクト ("foo_ci" または GitHub で付けた名前) を見つけ、[Set Up Project (プロジェクトのセットアップ)] をクリックします。 次に、ターミナルに戻り、最新の変更を GitHub にプッシュします (`config.yml` ファイルの追加分)。

```shell
git add .
git commit -m "add config.yml file"
git push
```

ブラウザーで CircleCI に戻ると、[Start building (ビルドの開始)] をクリックしてビルドを実行できます。

## 次のステップ
{: #next-steps }

このドキュメントでは、CircleCI CLI ツールの使用を開始するための手順を簡単に説明してきました。 CircleCI CLI は、さらに複雑な機能も提供しています。

- [Orb](https://circleci.com/ja/orbs/) の作成、表示、バリデーション、パブリッシュ
- CircleCI GraphQL API のクエリ
- 複雑な設定ファイルのパッケージ化と処理

詳細については、[CircleCI の CLI に関するドキュメント]({{site.baseurl}}/ja/2.0/local-cli)を参照してください。
