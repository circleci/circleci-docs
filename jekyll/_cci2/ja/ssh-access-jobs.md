---
layout: classic-docs
title: "SSH を使用したデバッグ"
short-title: "SSH を使用したデバッグ"
description: "CircleCI 2.0 で SSH を使用してビルド コンテナにアクセスする方法"
categories:
  - troubleshooting
order: 20
version:
  - Cloud
  - Server v2.x
---

以下のセクションに沿って、CircleCI 2.0 で SSH を使用してビルド コンテナにアクセスする方法について説明します。

* TOC
{:toc}

## 概要
多くの場合、問題を解決するには、ジョブへの SSH 接続を行い、ログ ファイル、実行中のプロセス、ディレクトリ パスなどを調べるのが一番の方法です。 CircleCI 2.0 には、すべてのジョブに SSH を介してアクセスするオプションが用意されています。 SSH を使用した CI/CD パイプラインのデバッグについては、CircleCI の[こちらのブログ記事](https://circleci.com/blog/debugging-ci-cd-pipelines-with-ssh-access/)をご参照ください。

SSH を使用してログインする場合、ユーザーは対話型のログイン シェルを実行しています。 You may be running the command on top of the directory where the command failed the first time, **or** you may be running the command from the directory one level up from where the command failed (e.g. `~/project/` or `~/`). Either way, you will not be initiating a clean run (you may wish to execute `pwd` or `ls` to ensure that you are in the correct directory).

Please note that a default CircleCI pipeline executes steps in a non-interactive shell and hence, there is the possibility that running steps using an interactive login may succeed, while failing in non-interactive mode.

## ステップ

1. SSH キーを [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) アカウントまたは [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) アカウントに追加していることを確認します。

2. SSH 接続を有効にしてジョブを起動するには、[Rerun Workflow (ワークフローを再実行する)] ドロップダウン メニューから [Rerun job with SSH (SSH でジョブを再実行する)] オプションを選択します。

     **Note:** The `Rerun job with SSH` feature is intended for debugging purposes; therefore, these jobs will not be reflected in your pipelines. When you rerun a job with SSH, a new pipeline is not triggered; a job is just rerun. If needed, you can access the running jobs via the legacy jobs view.

3. 接続の詳細情報を確認するには、ジョブ出力の [Enable SSH (SSH を有効にする)] セクションを展開します。ここで、接続に必要な SSH コマンドを確認できます。

     詳細情報は、ジョブ出力の末尾にある [Wait for SSH (SSH を待機する)] セクションにも再度表示されます。

4. GitHub または Bitbucket で使用している SSH キーと同じキーを使用して、実行中のジョブに SSH 接続し、必要なトラブルシューティングを行います。

If you are using the Windows executor you will need to pass in the shell you want to use when using SSH. For example, To run  `powershell` in your build you would run: `ssh -p <remote_ip> -- powershell.exe`. Consider reading the [Hello World on Windows]({{site.baseurl}}/2.0/hello-world-windows) document to learn more.

The build VM will remain available for an SSH connection for **10 minutes after the build finishes running** and then automatically shut down. (Or you can cancel it.) After you SSH into the build, the connection will remain open for **two hours**.

**Note**: If your job has parallel steps, CircleCI launches more than one VM to perform them. Thus, you'll see more than one 'Enable SSH' and 'Wait for SSH' section in the build output.

## Debugging: "permission denied (publickey)"

If you run into permission troubles trying to SSH to your job, try these things:

### Ensure authentication with GitHub/Bitbucket
{:.no_toc}

A single command can be used to test that your keys are set up as expected. For GitHub run:

```
ssh git@github.com
```

or for Bitbucket run:

```
ssh -Tv git@bitbucket.org
```

and you should see:

```
$ Hi :username! You've successfully authenticated...
```

for GitHub or for Bitbucket:

```
$ logged in as :username.
```

If you _don't_ see output like that, you need to start by [troubleshooting your SSH keys with GitHub](https://help.github.com/articles/error-permission-denied-publickey)/ [troubleshooting your SSH keys with Bitbucket](https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html).

### Ensure authenticating as the correct user
{:.no_toc}

If you have multiple accounts, double-check that you are authenticated as the right one!

In order to SSH into a CircleCI build, the username must be one which has access to the project being built!

If you're authenticating as the wrong user, you can probably resolve this by offering a different SSH key with `ssh -i`. See the next section if you need a hand figuring out which key is being offered.

### Ensure the correct key is offered to CircleCI
{:.no_toc}

If you've verified that you can authenticate as the correct user, but you're still getting "Permission denied" from CircleCI, you may be offering the wrong credentials to us. (This can happen for several reasons, depending on your SSH configuration.)

Figure out which key is being offered to GitHub that authenticates you, by running:

```
$ ssh -v git@github.com

# Or

$ ssh -v git@bitbucket.com
```

In the output, look for a sequence like this:

```
debug1: Offering RSA public key: /Users/me/.ssh/id_rsa_github
<...>
debug1: Authentication succeeded (publickey).
```

This sequence indicates that the key /Users/me/.ssh/id_rsa_github is the one which GitHub accepted.

Next, run the SSH command for your CircleCI build, but add the -v flag. In the output, look for one or more lines like this:

```
debug1: Offering RSA public key: ...
```

Make sure that the key which GitHub accepted (in our example, /Users/me/.ssh/id_rsa_github) was also offered to CircleCI.

If it was not offered, you can specify it via the `-i` command-line argument to SSH. For example:

```
$ ssh -i /Users/me/.ssh/id_rsa_github -p 64784 ubuntu@54.224.97.243
```

## See also
{:.no_toc}

[GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/)
