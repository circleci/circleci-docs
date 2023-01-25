---
layout: classic-docs
title: Add additional SSH keys to CircleCI
short-title: Add an SSH Key
description: How to add additional SSH keys to CircleCI
order: 20
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

サーバーへのデプロイに SSH アクセスが必要な場合は、CircleCI に SSH キーを登録する必要があります。

## 概要
{: #overview }

If you are looking to set up an SSH key in order to check out code from GitHub or Bitbucket, refer to the [GitHub](/docs/github-integration/#enable-your-project-to-check-out-additional-private-repositories) or [Bitbucket](/docs/bitbucket-integration/#enable-your-project-to-check-out-additional-private-repositories) integration pages.

If you are using GitLab as your VCS, or if you need additional SSH keys to access other services, follow the steps below for the version of CircleCI you are using to add an SSH key to your project.

You may need to add the public key to `~/.ssh/authorized_keys` in order to add SSH keys.
{: class="alert alert-info" }

## Steps to add additional SSH keys
{: #steps-to-add-additional-ssh-keys }

Since CircleCI cannot decrypt SSH keys, every new key must have an empty passphrase. The below examples are for macOS. See [GitHub](https://help.github.com/articlesgenerating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/) or [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/configure-ssh-and-two-step-verification/) documentation for additional details on creating SSH keys.

### CircleCI cloud or server 3.x / server 4.x
{: #circleci-cloud-or-server-3-x-4-x }

1. In a terminal, generate the key with `ssh-keygen -t ed25519 -C "your_email@example.com"`. See [Secure Shell documentation](https://www.ssh.com/ssh/keygen/) for additional details.

2. In the CircleCI application, go to your project's settings by clicking the the **Project Settings** button (top-right on the **Pipelines** page of the project).

3. On the **Project Settings** page, click on **SSH Keys**.

4. Scroll down to the **Additional SSH Keys** section.

5. Click the **Add SSH Key** button.

6. In the **Hostname** field, enter the key's associated host (for example, `git.heroku.com`). If you do not specify a hostname, the key will be used for all hosts.

7. In the **Private Key** field, paste the SSH key you are adding.

8. Click the **Add SSH Key** button.

### CircleCI Server 2.19.x
{: #circleci-server-2-19-x }

1. In a terminal, generate the key with `ssh-keygen -m PEM -t rsa -C "your_email@example.com"`. See the [(SSH) Secure Shell documentation](https://www.ssh.com/ssh/keygen/) web site for additional details.

2. In the CircleCI application, go to your project's settings by clicking the gear icon next to your project.

2. In the **Permissions** section, click on **SSH Permissions**.

3. Click the **Add SSH Key** button.

4. In the **Hostname** field, enter the key's associated host (for example, "git.heroku.com"). If you do not specify a hostname, the key will be used for all hosts.

5. In the **Private Key** field, paste the SSH key you are adding.

6. Click the **Add SSH Key** button.

## Add SSH Keys to a Job
{: #add-ssh-keys-to-a-job }

すべての CircleCI ジョブは、`ssh-agent` を使用して登録済みのすべての SSH キーに自動的に署名します。 ただし、コンテナに実際にキーを登録するには、`add_ssh_keys` キーを**必ず使用してください**。

To add a set of SSH keys to a container, use the `add_ssh_keys` [special step](/docs/configuration-reference/#add_ssh_keys) within the appropriate [job](/docs/jobs-steps/) in your configuration file.

セルフホストランナーの場合、システムに `ssh-agent`  があり`add_ssh_keys` ステップが正常に使用できることを確認して下さい。 SSH キーは、`$HOME/.ssh/id_rsa_<fingerprint>`に記述されます。`$HOME`は、ジョブを実行するように設定されたユーザーのホームディレクトリで、`<fingerprint>` はこのキーのフィンガープリントです。 ホストエントリーは、キーを使用するための関連する `IdentityFile` オプションと一緒に `$HOME/.ssh/config` にも追加されます。
{: class="alert alert-info"}

```yaml
version: 2.1
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

All fingerprints in the `fingerprints` list must correspond to keys that have been added through the CircleCI application.
{: class="alert alert-info" }

## ホスト名を指定せずに複数のキーを登録する
{: #adding-multiple-keys-with-blank-hostnames }

If you need to add multiple SSH keys with blank hostnames to your project, you will need to make some changes to the default SSH configuration provided by CircleCI. In the scenario where you have multiple SSH keys that have access to the same hosts, but are for different purposes the default `IdentitiesOnly no` is set causing connections to use ssh-agent. This will always cause the first key to be used, even if that is the incorrect key. If you have added the SSH key to a container, you will need to either set `IdentitiesOnly no` in the appropriate block, or you can remove all keys from the ssh-agent for this job using `ssh-add -D`, and reading the key added with `ssh-add /path/to/key`.

## 関連項目
{: #see-also }

- [GitHub との連携]({{site.baseurl}}/ja/github-integration)
- [Bitbucket との連携]({{site.baseurl}}/ja/bitbucket-integration)
- [GitLab との連携]({{site.baseurl}}/ja/gitlab-integration/)
