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

SSH を使用してログインする場合、ユーザーは対話型のログイン シェルを実行しています。 You may be running the command on top of the directory where the command failed the first time, or you may be running the command from the directory one level up from where the command failed (e.g. `~/project/` or `~/`). Either way, you will not be initiating a clean run. You may wish to execute `pwd` or `ls` to ensure that you are in the correct directory.

Please note that a default CircleCI pipeline executes steps in a non-interactive shell. There is a possibility that running steps using an interactive login may succeed, but in non-interactive mode.

## 手順
{: #steps }

1. SSH キーを [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) アカウントまたは [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) アカウントに追加していることを確認します。

2. SSH 接続を有効にしてジョブを起動するには、[Rerun Workflow (ワークフローを再実行する)] ドロップダウン メニューから [Rerun job with SSH (SSH でジョブを再実行する)] オプションを選択します。

     **注:** `Rerun job with SSH` 機能はデバッグのための機能です。 これらのジョブは元のジョブと同じパイプライン内に作成されます。

3. 接続の詳細情報を確認するには、ジョブ出力の [Enable SSH (SSH を有効にする)] セクションを展開します。

     詳細情報は、ジョブ出力の末尾にある [Wait for SSH (SSH を待機する)] セクションにも再度表示されます。

4. GitHub または Bitbucket で使用している SSH キーと同じキーを使用して、実行中のジョブに SSH 接続し、必要なトラブルシューティングを行います。

Windows Executor を使用している場合は、SSH 接続を行うシェルを渡す必要があります。 For example, To run  `powershell` in your build you would run: `ssh -p <remote_ip> -- powershell.exe`. Consider reading the [Hello world on Windows]({{site.baseurl}}/hello-world-windows) page to learn more.

The build virtual machine (VM) will remain available for an SSH connection for **10 minutes after the build finishes running** and then automatically shut down (or you can cancel it). After you SSH into the build, the connection will remain open for **one hour** for customers on the Free plan, or **two hours** for all other customers.

If your job has parallel steps, CircleCI launches more than one VM to perform them. You will see more than one 'Enable SSH' and 'Wait for SSH' section in the build output.

## "Permission denied (publickey)" のデバッグ
{: #debugging-permission-denied-publickey }

If you run into permission troubles trying to SSH to your job, try the following in the sections below.

### GitHub または Bitbucket での認証確認
{: #ensure-authentication-with-githubbitbucket }

想定どおりにキーがセットアップされているかどうかは、コマンド 1 つでテストできます。 For GitHub, run:

```bash
ssh git@github.com
```

or, for Bitbucket, run:
```bash
ssh -Tv git@bitbucket.org
```

and you should see both the following in the output:

```bash
$ Hi :username! You've successfully authenticated...
```

```bash
$ logged in as :username.
```

If you _do not_ see output like above, you can try troubleshooting with the following:
- [troubleshooting your SSH keys with GitHub](https://help.github.com/articles/error-permission-denied-publickey)
- [troubleshooting your SSH keys with Bitbucket](https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html)

### 正しいユーザーで認証を行っているかの確認
{: #ensure-authenticating-as-the-correct-user }

If you have multiple accounts, double-check that you are authenticated as the right one. In order to SSH into a CircleCI build, the username must be one which has access to the project being built.

If you are authenticating as the wrong user, you can probably resolve this by offering a different SSH key with `ssh -i`. See the next section if you need a hand figuring out which key is being offered.

### CircleCI に正しいキーを提供しているかの確認
{: #ensure-the-correct-key-is-offered-to-circleci }

If you have verified that you can authenticate as the correct user, but you are still getting "Permission denied" from CircleCI, you may be offering the wrong credentials to us.

Figure out which key is being offered to GitHub that authenticates you, by running:

```bash
$ ssh -v git@github.com
```
または
```bash
$ ssh -v git@bitbucket.com
```

出力から、以下のような箇所を探します。

```bash
debug1: Offering RSA public key: /Users/me/.ssh/id_ed25519_github
<...>
debug1: Authentication succeeded (publickey).
```

This sequence indicates that the key `/Users/me/.ssh/id_rsa_github` is the one which GitHub accepted.

Next, run the SSH command for your CircleCI build, but add the `-v` flag. 出力から、以下のような行を探します。

```bash
debug1: Offering RSA public key: ...
```

Make sure that the key which GitHub accepted (in our example, `/Users/me/.ssh/id_rsa_github`) was also offered to CircleCI.

If it was not offered, you can specify it via the `-i` command-line argument to SSH. 例えば下記のようになります。

```bash
$ ssh -i /Users/me/.ssh/id_ed25519_github -p 64784 54.224.97.243
```

When you add the `-v` flag, you can also run multiple options in verbose mode to get more details, for example:

```bash
$ ssh -vv git@github.com
```
or the maximum of
```bash
$ ssh -vvv git@github.com
```

## 関連項目
{: #see-also }
{:.no_toc}

- [GitHub との連携]({{site.baseurl}}/github-integration/)
- [Bitbucket integration]({{site.baseurl}}/bitbucket-integration/)
