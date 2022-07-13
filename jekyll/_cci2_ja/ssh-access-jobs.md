---
layout: classic-docs
title: "SSH を使用したデバッグ"
short-title: "SSH を使用したデバッグ"
description: "CircleCI で SSH を使用してビルドコンテナにアクセスする方法"
categories:
  - トラブルシューティング
order: 20
version:
  - クラウド
  - Server v2.x
  - Server v3.x
---

このドキュメントでは、CircleCI で SSH を使用してビルドコンテナにアクセスする方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }
多くの場合、問題を解決するには、ジョブへの SSH 接続を行い、ログファイル、実行中のプロセス、ディレクトリパスなどを調べるのが一番の方法です。 CircleCI では、すべてのジョブに SSH でアクセスできます。 SSH を使用した CI/CD パイプラインのデバッグについては、CircleCI の[こちらのブログ記事](https://circleci.com/blog/debugging-ci-cd-pipelines-with-ssh-access/)を参照してください。

SSH を使用してログインすると、対話型のログインシェルが実行されます。 最初にコマンドが失敗したディレクトリ**または**その 1 階層上のディレクトリ (例: `~/project/` または `~/`) で、そのコマンドを実行してみてください。 どちらの場合も、クリーンな実行は開始されません (`pwd` または `ls` を実行して、正しいディレクトリにいるか確認することをお勧めします)。

デフォルトの CircleCI パイプラインではステップの実行に非対話型シェルが使用されるため、ステップの実行が対話型ログインでは成功しても非対話モードでは失敗することがあるのでご注意ください。

## 手順
{: #steps }

1. SSH キーを [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) アカウントまたは [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) アカウントに追加していることを確認します。

2. SSH 接続を有効にしてジョブを起動するには、[Rerun Workflow (ワークフローを再実行する)] ドロップダウン メニューから [Rerun job with SSH (SSH でジョブを再実行する)] オプションを選択します。

     **注:** `Rerun job with SSH` 機能はデバッグのための機能です。 これらのジョブは元のジョブと同じパイプライン内に作成されます。

3. 接続の詳細情報を確認するには、ジョブ出力の [Enable SSH (SSH を有効にする)] セクションを展開します。

     詳細情報は、ジョブ出力の末尾にある [Wait for SSH (SSH を待機する)] セクションにも再度表示されます。

4. GitHub または Bitbucket で使用している SSH キーと同じキーを使用して、実行中のジョブに SSH 接続し、必要なトラブルシューティングを行います。

Windows Executor を使用している場合は、SSH 接続を行うシェルを渡す必要があります。 たとえば、ビルド内で `powershell` を実行するには、`ssh -p <remote_ip> -- powershell.exe` とします。 詳細については、「[Windows での Hello World]({{site.baseurl}}/hello-world-windows)」を参照してください。

ビルド VM は、**ビルドの実行終了から 10 分間**だけ SSH 接続で利用可能な状態になり、その後自動的にシャットダウンされます (キャンセルも可能です)。 ビルドに SSH 接続すると、Free プランのお客様は **1 時間**、それ以外のプランのお客様は **2 時間**接続が維持されます。

**注:** ジョブに並列ステップが含まれる場合、CircleCI ではそれらを実行するために複数の VM をローンチします。 その場合、ビルド出力には、[Enable SSH (SSH を有効にする)] セクションと [Wait for SSH (SSH を待機する)] セクションが複数表示されます。

## "Permission denied (publickey)" のデバッグ
{: #debugging-permission-denied-publickey }

ジョブに SSH 接続しようとして権限エラーが発生した場合は、以下を試してみてください。

### GitHub または Bitbucket での認証確認
{: #ensure-authentication-with-githubbitbucket }
{:.no_toc}

想定どおりにキーがセットアップされているかどうかは、コマンド 1 つでテストできます。 GitHub の場合は、以下を実行します。

```bash
ssh git@github.com
```

Bitbucket の場合は、以下を実行します。

```bash
ssh -Tv git@bitbucket.org
```

実行後、以下のように表示されます。

```bash
$ Hi :username! You've successfully authenticated...
```

GitHub および Bitbucket で共通です。

```bash
$ logged in as :username.
```

上記のように_出力されない_ときは、まず [GitHub](https://help.github.com/articles/error-permission-denied-publickey) または [Bitbucket](https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html) で SSH キーのトラブルシューティングを行う必要があります。

### 正しいユーザーで認証を行っているかの確認
{: #ensure-authenticating-as-the-correct-user }
{:.no_toc}

アカウントを複数持っている場合は、正しいアカウントで認証を行っているか、再度確認してください。

CircleCI ビルドに SSH 接続するには、ビルドするプロジェクトにアクセスできるユーザー名を使用しなければなりません。

誤ったユーザーで認証を行っている場合は、`ssh -i` で別の SSH キーを提供すれば、この問題を解決できるはずです。 提供されているキーを調べる方法については、次のセクションを参照してください。

### CircleCI に正しいキーを提供しているかの確認
{: #ensure-the-correct-key-is-offered-to-circleci }
{:.no_toc}

正しいユーザーで認証を行っていることが確認できた後も、CircleCI で "Permission denied (権限がありません)" メッセージが表示される場合は、CircleCI に誤った認証情報を提供している可能性があります  (SSH の設定内容によっては他にも理由が考えられます)。  (SSH の設定内容によっては他にも理由が考えられます)

認証を行う GitHub にどのキーを提供しているかを調べるには、以下を実行します。

```bash
$ ssh -v git@github.com

# または

$ ssh -v git@bitbucket.com
```

出力から、以下のような箇所を探します。

```bash
debug1: Offering RSA public key: /Users/me/.ssh/id_rsa_github
<...>
debug1: Authentication succeeded (publickey).
```

この一連の出力は、キー /Users/me/.ssh/id_rsa_github が、GitHub で受け付けられたキーであることを示しています。

次に、CircleCI ビルドに対し、-v フラグを追加して SSH コマンドを実行します。 出力から、以下のような行を探します。

```bash
debug1: Offering RSA public key: ...
```

GitHub が受け付けたキー (この例では /Users/me/.ssh/id_rsa_github) が CircleCI にも提供されていることを確認します。

提供されていない場合は、SSH の `-i` コマンドライン引数を使用してキーを指定します。 たとえば下記のようにします。

```bash
$ ssh -i /Users/me/.ssh/id_rsa_github -p 64784 54.224.97.243
```

## 関連項目
{: #see-also }
{:.no_toc}

[GitHub と Bitbucket の連携]({{ site.baseurl }}/ja/gh-bb-integration/)
