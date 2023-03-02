---
layout: classic-docs
title: "Debug with SSH"
short-title: "Debug with SSH"
description: "CircleCI で SSH を使用してビルドコンテナにアクセスする方法"
categories:
  - トラブルシューティング
order: 20
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

## 概要
{: #overview }

Often the best way to troubleshoot problems is to SSH into a job and inspect log files, running processes, and directory paths. CircleCI では、すべてのジョブに SSH でアクセスできます。 SSH を使用した CI/CD パイプラインのデバッグについては、CircleCI の[こちらのブログ記事](https://circleci.com/blog/debugging-ci-cd-pipelines-with-ssh-access/)をご参照ください。

When you log in with SSH, you are running an **interactive** login shell. 最初にコマンドが失敗したディレクトリまたは 1 階層上のディレクトリ (例: `~/project/` または `~/`) で、そのコマンドを実行してみてください。 どちらの場合も、クリーンな実行は開始されません。 `pwd` または `ls` を実行すると、正しいディレクトリにいることを確認できます。

Please note that a _default_ CircleCI pipeline executes steps in a non-interactive shell. 対話型ログインを使用したステップの実行は成功する可能性がありますが、非対話型モードでは失敗する可能性があります。

## 手順
{: #steps }

1. SSH キーを [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) アカウントまたは [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) アカウントに追加していることを確認します。

2. To start a job with SSH enabled, select the **Rerun job with SSH** option from the **Rerun Workflow** dropdown menu.

     The `Rerun job with SSH` feature is intended for debugging purposes. これらのジョブは元のジョブと同じパイプライン内に作成されます。
     {: class="alert alert-info" }

3. To see the connection details, expand the **Enable SSH** section in the job output where you will see the SSH command needed to connect.

     The details are displayed again in the **Wait for SSH** section at the end of the job.

4. GitHub または Bitbucket で使用している SSH キーと同じキーを使用して、実行中のジョブに SSH 接続し、必要なトラブルシューティングを行います。

Windows Executor を使用している場合は、SSH 接続を行うシェルを渡す必要があります。 For example, to run  `powershell` in your build you would run: `ssh -p <remote_ip> -- powershell.exe`. Consider reading the [Hello world on Windows](/docs/hello-world-windows/) page to learn more.

The job virtual machine (VM) will remain available for an SSH connection for **10 minutes after the pipeline finishes running** and then automatically shut down (or you can cancel it). After you SSH into the job, the connection will remain open for **one hour** for customers on the Free plan, or **two hours** for all other customers.

ジョブに並列ステップが含まれる場合、CircleCI ではそれらを実行するために複数の VM をローンチします。 You will see more than one 'Enable SSH' and 'Wait for SSH' section in the job output.

## "Permission denied (publickey)" のデバッグ
{: #debugging-permission-denied-publickey }

If you run into permission issues trying to SSH to your job, try the following in the sections below.

### GitHub または Bitbucket での認証確認
{: #ensure-authentication-with-githubbitbucket }

想定どおりにキーがセットアップされているかどうかは、コマンド 1 つでテストできます。

GitHub の場合は、以下を実行します。
```bash
ssh git@github.com
```

Or, for Bitbucket, run:
```bash
ssh -Tv git@bitbucket.org
```

You should see both the following in the output:

```bash
$ Hi :username! You've successfully authenticated...
```

```bash
$ logged in as :username.
```

上記のような出力が_表示されない_場合は、以下の解決策をお試しください。
- [GitHub を使用して SSH キーのトラブルシューティングを行う](https://help.github.com/articles/error-permission-denied-publickey)
- [Bitbucket を使用して SSH キーのトラブルシューティングを行う](https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html)

### 正しいユーザーで認証を行っているかの確認
{: #ensure-authenticating-as-the-correct-user }

The user that triggered the rerun is the user that is required to authenticate. You will need to make sure that your username is in the 'Enable SSH' step.

アカウントを複数持っている場合は、正しいアカウントで認証を行っているか、再度確認してください。 CircleCI ビルドに SSH 接続するには、ビルドするプロジェクトにアクセスできるユーザー名を使用しなければなりません。

If you are authenticating as the wrong user, you can try to resolve this by offering a different SSH key with `ssh -i`. See the next section for guidance on confirming which key is being offered.

### CircleCI に正しいキーを提供しているかの確認
{: #ensure-the-correct-key-is-offered-to-circleci }

If you have verified that you can authenticate as the correct user, but you are still getting "Permission denied" from CircleCI, you may be offering the wrong credentials to CircleCI.

Check which key is being offered that authenticates you, by running:

```bash
$ ssh -v git@github.com
```
または,
```bash
$ ssh -v git@bitbucket.com
```

出力から、以下のような箇所を探します。

```bash
debug1: Offering public key: /Users/me/.ssh/id_ed25519_github
<...>
debug1: Authentication succeeded (publickey).
```

This sequence indicates that the key `/Users/me/.ssh/id_ed25519_github` is the one which your VCS accepted.

Next, run the SSH command for your CircleCI job, but add the `-v` flag. 出力から、以下のような行を探します。

```bash
debug1: Offering public key: ...
```

Make sure that the key which your VCS accepted (in our example, `/Users/me/.ssh/id_ed25519_github`) was also offered to CircleCI.

提供されていない場合は、SSH の `-i` コマンドライン引数を使用してキーを指定します。 たとえば以下のようになります。

```bash
$ ssh -i /Users/me/.ssh/id_ed25519_github -p 64784 54.224.97.243
```

`-v` フラグを追加すると、以下のように詳細モードで複数のオプションを実行して、詳細を取得することもできます。

```bash
$ ssh -vv git@github.com
```
または最大の場合は、
```bash
$ ssh -vvv git@github.com
```

## 関連項目
{: #see-also }

- [GitHub との連携](/docs/github-integration/)
- [Bitbucket との連携](/docs/bitbucket-integration/)
