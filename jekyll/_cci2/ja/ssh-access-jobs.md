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

Often the best way to troubleshoot problems is to SSH into a job and inspect things like log files, running processes, and directory paths. CircleCI 2.0 では、すべてのジョブに SSH を介してアクセスするオプションが用意されています。 Read our [blog post](https://circleci.com/blog/debugging-ci-cd-pipelines-with-ssh-access/) on debugging CI/CD pipelines with SSH.

SSH を使用してログインする場合、ユーザーは対話型のログインシェルを実行しています。 また、コマンドが失敗したことのあるディレクトリでコマンドを実行しているために、それ以降クリーンな実行を開始できていない可能性もあります。 これに対して CircleCI では、コマンドの実行にデフォルトで非対話型シェルを使用します。 このため、ステップの実行が対話モードでは成功しても非対話モードでは失敗することがあります。

## ステップ

1. SSH キーを [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) アカウントまたは [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) アカウントに追加していることを確認します。

2. To start a job with SSH enabled, select the 'Rerun job with SSH' option from the 'Rerun Workflow' dropdown menu.

3. To see the connection details, expand the 'Enable SSH' section in the job output where you will see the SSH command needed to connect.
    
    詳細情報は、ジョブの末尾にある [Wait for SSH (SSH を待機する)] セクションにも再度表示されます。

4. SSH to the running job (using the same SSH key that you use for GitHub or Bitbucket) to perform whatever troubleshooting you need to.

If you are using the Windows executor you will need to pass in the shell you want to use when using SSH. For example, To run `powershell` in your build you would run: `ssh -p <remote_ip> -- powershell.exe`. Consider reading the [Hello World on Windows]({{site.baseurl}}/2.0/hello-world-windows) document to learn more.

The build VM will remain available for an SSH connection for **10 minutes after the build finishes running** and then automatically shut down. (Or you can cancel it.) After you SSH into the build, the connection will remain open for **two hours**.

**Note**: If your job has parallel steps, CircleCI launches more than one VM to perform them. Thus, you'll see more than one 'Enable SSH' and 'Wait for SSH' section in the build output.

## 「Permission denied (publickey)」のデバッグ

If you run into permission troubles trying to SSH to your job, try these things:

### GitHub または Bitbucket での認証確認
{:.no_toc}

A single command can be used to test that your keys are set up as expected. For GitHub run:

    ssh git@github.com
    

or for Bitbucket run:

    ssh -Tv git@bitbucket.org
    

and you should see:

    $ Hi :username! You've successfully authenticated...
    

for GitHub or for Bitbucket:

    $ logged in as :username.
    

If you *don't* see output like that, you need to start by [troubleshooting your SSH keys with GitHub](https://help.github.com/articles/error-permission-denied-publickey)/ [troubleshooting your SSH keys with Bitbucket](https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html).

### 正しいユーザーで認証を行っているかの確認
{:.no_toc}

If you have multiple accounts, double-check that you are authenticated as the right one!

In order to SSH into a CircleCI build, the username must be one which has access to the project being built!

If you're authenticating as the wrong user, you can probably resolve this by offering a different SSH key with `ssh -i`. See the next section if you need a hand figuring out which key is being offered.

### CircleCI に正しいキーが提供されているかの確認
{:.no_toc}

If you've verified that you can authenticate as the correct user, but you're still getting "Permission denied" from CircleCI, you may be offering the wrong credentials to us. (This can happen for several reasons, depending on your SSH configuration.)

Figure out which key is being offered to GitHub that authenticates you, by running:

    $ ssh -v git@github.com
    
    # または
    
    $ ssh -v git@bitbucket.com
    

In the output, look for a sequence like this:

    debug1: Offering RSA public key: /Users/me/.ssh/id_rsa_github
    <...>
    debug1: Authentication succeeded (publickey).
    

This sequence indicates that the key /Users/me/.ssh/id_rsa_github is the one which GitHub accepted.

Next, run the SSH command for your CircleCI build, but add the -v flag. In the output, look for one or more lines like this:

    debug1: Offering RSA public key: ...
    

Make sure that the key which GitHub accepted (in our example, /Users/me/.ssh/id_rsa_github) was also offered to CircleCI.

If it was not offered, you can specify it via the `-i` command-line argument to SSH. For example:

    $ ssh -i /Users/me/.ssh/id_rsa_github -p 64784 ubuntu@54.224.97.243
    

## 関連項目
{:.no_toc}

[GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/)