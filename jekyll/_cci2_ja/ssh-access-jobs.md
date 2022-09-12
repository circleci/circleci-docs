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
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

## 概要
{: #overview }

多くの場合、問題を解決するには、ジョブへの SSH 接続を行い、ログ ファイル、実行中のプロセス、ディレクトリ パスなどを調べるのが一番の方法です。 CircleCI では、すべてのジョブに SSH でアクセスできます。 SSH を使用した CI/CD パイプラインのデバッグについては、CircleCI の[こちらのブログ記事](https://circleci.com/blog/debugging-ci-cd-pipelines-with-ssh-access/)をご参照ください。

SSH を使用してログインする場合、ユーザーは対話型のログイン シェルを実行しています。 最初にコマンドが失敗したディレクトリ**または**その 1 階層上のディレクトリ (例: `~/project/` または `~/`) で、そのコマンドを実行してみてください。 どちらの場合も、クリーンな実行は開始されません (`pwd` または `ls` を実行して、正しいディレクトリにいるか確認することをお勧めします)。

デフォルトの CircleCI パイプラインではステップの実行に非対話型シェルが使用されるため、ステップの実行が対話型ログインでは成功しても非対話モードでは失敗することがあるのでご注意ください。

## 手順
{: #steps }

1. SSH キーを [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) アカウントまたは [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) アカウントに追加していることを確認します。

2. SSH 接続を有効にしてジョブを起動するには、[Rerun Workflow (ワークフローを再実行する)] ドロップダウン メニューから [Rerun job with SSH (SSH でジョブを再実行する)] オプションを選択します。

     **注:** `Rerun job with SSH` 機能はデバッグのための機能です。 これらのジョブは元のジョブと同じパイプライン内に作成されます。

3. 接続の詳細情報を確認するには、ジョブ出力の [Enable SSH (SSH を有効にする)] セクションを展開します。

     詳細情報は、ジョブ出力の末尾にある [Wait for SSH (SSH を待機する)] セクションにも再度表示されます。

4. GitHub または Bitbucket で使用している SSH キーと同じキーを使用して、実行中のジョブに SSH 接続し、必要なトラブルシューティングを行います。

Windows Executor を使用している場合は、SSH 接続を行うシェルを渡す必要があります。 For example, To run  `powershell` in your build you would run: `ssh -p <remote_ip> -- powershell.exe`. 詳細については、「[Windows での Hello World]({{site.baseurl}}/ja/hello-world-windows)」を参照してください。

ビルド VM は、**ビルドの実行終了から 10 分間**だけ SSH 接続で利用可能な状態になり、その後自動的にシャットダウンされます (キャンセルも可能です)。 ビルドに SSH 接続すると、Free プランのお客様は **1 時間**、それ以外のプランのお客様は **2 時間**接続が維持されます。

**注:** ジョブに並列ステップが含まれる場合、CircleCI ではそれらを実行するために複数の VM をローンチします。 Thus, you will see more than one 'Enable SSH' and 'Wait for SSH' section in the build output.

## "Permission denied (publickey)" のデバッグ
{: #debugging-permission-denied-publickey }

If you run into permission troubles trying to SSH to your job, try these things:

### GitHub または Bitbucket での認証確認
{: #ensure-authentication-with-githubbitbucket }

想定どおりにキーがセットアップされているかどうかは、コマンド 1 つでテストできます。

For GitHub run
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

as well as:
```bash
$ logged in as :username.
```

If you _do not_ see output as described above, you need to start by: [troubleshooting your SSH keys with GitHub](https://help.github.com/articles/error-permission-denied-publickey)/ [troubleshooting your SSH keys with Bitbucket](https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html).

### 正しいユーザーで認証を行っているかの確認
{: #ensure-authenticating-as-the-correct-user }

If you have multiple accounts, double-check that you are authenticated as the right one.

In order to SSH into a CircleCI build, the username must be one which has access to the project being built!

If you are authenticating as the wrong user, you can probably resolve this by offering a different SSH key with `ssh -i`. See the next section if you need a hand figuring out which key is being offered.

### CircleCI に正しいキーを提供しているかの確認
{: #ensure-the-correct-key-is-offered-to-circleci }

If you have verified that you can authenticate as the correct user, but you are still getting "Permission denied" from CircleCI, you may be offering the wrong credentials to us. This can happen for several reasons, depending on your SSH configuration.

Figure out which key is being offered to GitHub that authenticates you, by running:

```bash
$ ssh -v git@github.com

# または

$ ssh -v git@bitbucket.com
```

出力から、以下のような箇所を探します。

```bash
debug1: Offering RSA public key: /Users/me/.ssh/id_ed25519_github
<...>
debug1: Authentication succeeded (publickey).
```

This sequence indicates that the key /Users/me/.ssh/id_ed25519_github is the one which GitHub accepted.

次に、CircleCI ビルドに対し、-v フラグを追加して SSH コマンドを実行します。 出力から、以下のような行を探します。

```bash
debug1: Offering RSA public key: ...
```

Make sure that the key which GitHub accepted (in our example, /Users/me/.ssh/id_ed25519_github) was also offered to CircleCI.

If it was not offered, you can specify it via the `-i` command-line argument to SSH. 例えば下記のようになります。

```bash
$ ssh -i /Users/me/.ssh/id_ed25519_github -p 64784 54.224.97.243
```

## 関連項目
{: #see-also }
{:.no_toc}

- [GitHub と Bitbucket のインテグレーション]({{site.baseurl}}/gh-bb-integration/)
