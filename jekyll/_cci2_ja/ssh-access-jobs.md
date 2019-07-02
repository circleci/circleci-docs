---
layout: classic-docs
title: "SSH を使用したデバッグ"
short-title: "SSH を使用したデバッグ"
description: "CircleCI 2.0 で SSH を使用してビルドコンテナにアクセスする方法"
categories:
  - troubleshooting
order: 20
---

ここでは、CircleCI 2.0 で SSH を使用してビルドコンテナにアクセスする方法について、以下のセクションに沿って説明します。

* 目次
{:toc}

## 概要

多くの場合、問題を解決するには、ジョブへの SSH 接続を行い、ログファイル、実行中のプロセス、ディレクトリパスなどを調べることが一番の方法です。 CircleCI 2.0 では、すべてのジョブに SSH を介してアクセスするオプションが用意されています。

SSH を使用してログインする場合、ユーザーは対話型のログインシェルを実行しています。 また、コマンドが失敗したことのあるディレクトリでコマンドを実行しているために、それ以降クリーンな実行を開始できていない可能性もあります。 これに対して CircleCI では、コマンドの実行にデフォルトで非対話型シェルを使用します。 このため、ステップの実行が対話モードでは成功しても非対話モードでは失敗することがあります。

## ステップ

1. SSH キーを [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) アカウントまたは [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) アカウントに追加していることを確認します。

2. SSH 接続を有効にしてジョブを起動するには、[Rerun Workflow (ワークフローを再実行する)] ドロップダウンメニューから [Rerun job with SSH (SSH でジョブを再実行する)] オプションを選択します。

3. 接続の詳細情報を確認するには、ジョブ出力の [Enable SSH (SSH を有効にする)] セクションを展開します。ここで、接続に必要な SSH コマンドを確認できます。![SSH 接続の詳細情報](https://circleci-discourse.s3.amazonaws.com/optimized/2X/5/57f50e26ec245d0373c4265ec4375641553bdbdb_1_690x295.png)  
    ![SSH 接続の詳細情報](https://circleci-discourse.s3.amazonaws.com/optimized/2X/5/514e8aec3e8017dac8e8d401d22432026b473161_1_690x281.png)

    詳細情報は、ジョブの末尾にある [Wait for SSH (SSH を待機する)] セクションにも再度表示されます。

4. GitHub または Bitbucket で使用した SSH キーと同じキーを使用して、実行中のジョブに SSH 接続し、必要なトラブルシューティングを行います。

ビルド VM は、**ビルドの実行が終了した後 10分間**は利用可能な状態で、その後自動的にシャットダウンします (キャンセルも可能です)。

**メモ：**ジョブに並列ステップが含まれる場合、CircleCI ではそれらを実行するために複数の VM をローンチします。 その場合、ビルド出力には、[Enable SSH (SSH を有効にする)] セクションと [Wait for SSH (SSH を待機する)] セクションが複数存在します。

## 「Permission denied (publickey)」のデバッグ

ジョブに SSH 接続しようとして権限エラーが発生した場合は、以下を試してみてください。

### GitHub または Bitbucket での認証確認

{:.no_toc}

想定どおりにキーが設定されているかどうかは、コマンド 1つでテストできます。 GitHub の場合は、以下を実行します。

    $ ssh git@github.com


Bitbucket の場合は、以下を実行します。

    ssh -Tv git@bitbucket.org


実行後、以下のように表示されます。

    Hi :username! You've successfully authenticated...


GitHub または Bitbucket の場合

    logged in as :username.


上記のように出力*されない*場合は、まず [GitHub](https://help.github.com/articles/error-permission-denied-publickey) または [Bitbucket](https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html) で SSH キーのトラブルシューティングを行う必要があります。

### 正しいユーザーで認証を行っているかの確認
{:.no_toc}

アカウントを複数持っている場合は、正しいアカウントで認証を行っているか、再度確認してください。

CircleCI ビルドに SSH 接続するには、ビルドするプロジェクトにアクセスできるユーザー名を使用しなければなりません。

誤ったユーザーで認証を行っている場合は、`ssh -i` で別の SSH キーを提供すれば、この問題を解決できるはずです。 提供されているキーを調べる方法については、次のセクションを参照してください。

### CircleCI に正しいキーが提供されているかの確認
{:.no_toc}

正しいユーザーで認証を行っていることが確認できた後も、CircleCI で 「Permission denied (権限がありません)」のメッセージが表示される場合は、CircleCI に誤った認証情報を提供している可能性があります (SSH の設定内容によって他にもいくつかの理由が考えられます)。

認証を行う GitHub にどのキーが提供されているかを調べるには、以下を実行します。

    $ ssh -v git@github.com

    # または

    $ ssh -v git@bitbucket.com


出力から、以下のようなシーケンスを探します。

    debug1: Offering RSA public key: /Users/me/.ssh/id_rsa_github
    <...>
    debug1: Authentication succeeded (publickey).


このシーケンスは、キー /Users/me/.ssh/id_rsa_github が GitHub が受け付けたキーであることを示しています。

次に、CircleCI ビルドに対し、-v フラグを追加して SSH コマンドを実行します。 出力から、以下のような行を探します。

    debug1: Offering RSA public key: ...


GitHub が受け付けたキー (この例では /Users/me/.ssh/id_rsa_github) が CircleCI にも提供されていることを確認します。

提供されていない場合は、SSH の `-i` コマンドライン引数を使用してキーを指定できます。 たとえば、以下のようになります。

    $ ssh -i /Users/me/.ssh/id_rsa_github -p 64784 ubuntu@54.224.97.243


## 関連項目
{:.no_toc}

[GitHub および Bitbucket のインテグレーション]({{ site.baseurl }}/2.0/gh-bb-integration/)
