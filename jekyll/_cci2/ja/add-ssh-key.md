---
layout: classic-docs
title: "CircleCI に SSH 鍵を登録する"
short-title: "CircleCI に SSH 鍵を登録する"
description: "SSH 認証用の鍵の CircleCI への登録方法"
order: 20
---

サーバーへのデプロイに SSH アクセスが必要な場合は、CircleCI に公開鍵認証用の SSH 鍵を登録する必要があります。

## Overview

CircleCI に SSH 公開鍵を登録する必要があるケースは、以下の 2 パターンです。

1. バージョン管理システムからコードをチェックアウトする
2. 実行中のプロセスが他のサービスにアクセスできるようにする

If you are adding an SSH key for the first reason, refer to the [GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/#enable-your-project-to-check-out-additional-private-repositories) document. 2 つ目が目的のときは、下記の手順でプロジェクトに SSH 鍵を登録してみてください。

## Steps

1. In a terminal, generate the key with `ssh-keygen -m PEM -t rsa -C "your_email@example.com"`. See the [(SSH) Secure Shell documentation](https://www.ssh.com/ssh/keygen/) web site for additional details.

2. In the CircleCI application, go to your project's settings by clicking the gear icon next to your project.

3. In the **Permissions** section, click on **SSH Permissions**.

4. Click the **Add SSH Key** button.

5. In the **Hostname** field, enter the key's associated host (for example, "git.heroku.com"). If you don't specify a hostname, the key will be used for all hosts.

6. In the **Private Key** field, paste the SSH key you are adding.

7. Click the **Add SSH Key** button.

**注**：CircleCI が SSH 鍵を復号できるよう、鍵には常に空のパスフレーズを設定してください。 CircleCI also will not accept OpenSSH's default file format - use `ssh-keygen -m pem` if you are using OpenSSH to generate your key.

**Caution:** Recent updates in `ssh-keygen` don't generate the key in PEM format by default. If your private key does not start with `-----BEGIN RSA PRIVATE KEY-----`, enforce PEM format by generating the key with `ssh-keygen -m PEM -t rsa -C "your_email@example.com"`

## Adding SSH Keys to a Job

Even though all CircleCI jobs use `ssh-agent` to automatically sign all added SSH keys, you **must** use the `add_ssh_keys` key to actually add keys to a container.

To add a set of SSH keys to a container, use the `add_ssh_keys` [special step]({{ site.baseurl }}/2.0/configuration-reference/#add_ssh_keys) within the appropriate [job]({{ site.baseurl }}/2.0/jobs-steps/) in your configuration file.

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

**Note:** All fingerprints in the `fingerprints` list must correspond to keys that have been added through the CircleCI application.

## Adding multiple keys with blank hostnames

If you need to add multiple SSH keys with blank hostnames to your project you will need to make some changes to the default SSH configuration provided by CircleCI. In the scenario where you have multiple SSH keys that have access to the same hostss, but are for different purposes the default `IdentitiesOnly no` is set causing connections to use ssh-agent. This will always cause the first key to be used, even if that is the incorrect key. If you have added the SSH key to a container you will need to either set `IdentitiesOnly no` in the appropriate block, or you can remove all keys from the ssh-agent for this job using `ssh-add -D`, and reading the key added with `ssh-add /path/to/key`.

## See Also

[GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/)