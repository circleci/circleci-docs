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

1. ターミナルで、`ssh-keygen -t ed25519 -C "your_email@example.com"` コマンドを実行してキーを生成します。 詳細については、[安全なシェルスクリプト (SSH) のドキュメント](https://www.ssh.com/ssh/keygen/)を参照してください。

2. CircleCI アプリケーションで、 **[Project Settings (プロジェクトの設定)]** ボタン (作業対象のプロジェクトの **パイプライン**のページの右上) をクリックして、プロジェクトの設定に移動します。

3. On the **Project Settings** page, click on **SSH Keys**.

4. スクロールし、 **[Additional SSH Keys (追加 SSH キー)]** のセクションに移動します。

5. **[Add SSH Key (SSH キーの追加)]** ボタンをクリックします。

6. **[Hostname (ホスト名)]** フィールドにキーに関連付けるホスト名を入力します (例: git.heroku.com)。 ホスト名を指定しない場合は、どのホストに対しても同じキーが使われます。

7. **[Private Key (プライベート キー)]** フィールドに登録する SSH キーを貼り付けます。

8. **[Add SSH Key (SSH キーの追加)]** ボタンをクリックします。

### CircleCI Server 2.19.x
{: #circleci-server-2-19-x }

1. ターミナルから、`ssh-keygen -m PEM -t rsa -C "your_email@example.com"` コマンドを入力して鍵を生成します。 詳細については、[Secure Shell (SSH) のドキュメント](https://www.ssh.com/ssh/keygen/)を参照してください。

2. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

2. **[Permissions (アクセス許可)]**で、**[SSH Permissions (SSH アクセス許可)]** をクリックします。

3. **[Add SSH Key (SSH キーの追加)]** ボタンをクリックします。

4. **[Hostname (ホスト名)]** フィールドにキーに関連付けるホスト名を入力します (例: git.heroku.com)。 ホスト名を指定しない場合は、どのホストに対しても同じキーが使われます。

5. **[Private Key (プライベート キー)]** フィールドに登録する SSH キーを貼り付けます。

6. **[Add SSH Key (SSH キーの追加)]** ボタンをクリックします。

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

ホスト名を指定せずに複数の SSH キーをプロジェクトに登録するには、CircleCI のデフォルトの SSH 設定に変更を加える必要があります。 たとえば、同じホストに別々の目的でアクセスする複数の SSH キーがある場合、デフォルトの `IdentitiesOnly no` が設定され、接続では ssh-agent が使用されます。 このとき、そのキーが正しいキーがどうかにかかわらず、常に最初のキーが使用されます。 コンテナに SSH キーを登録している場合は、適切なブロックに `IdentitiesOnly no` を設定するか、`ssh-add -D` コマンドを実行し、`ssh-add /path/to/key` コマンドで登録されたキーを読み取って、このジョブで使用する ssh-agent からすべてのキーを削除します。

## 関連項目
{: #see-also }

- [GitHub との連携]({{site.baseurl}}/ja/github-integration)
- [Bitbucket との連携]({{site.baseurl}}/ja/bitbucket-integration)
- [GitLab との連携]({{site.baseurl}}/ja/gitlab-integration/)
