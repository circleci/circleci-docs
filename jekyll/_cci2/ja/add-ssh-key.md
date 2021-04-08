---
layout: classic-docs
title: "CircleCI に SSH 鍵を登録する"
short-title: "CircleCI に SSH 鍵を登録する"
description: "CircleCI に SSH 鍵を追加する方法"
order: 20
version:
  - Cloud
  - Server v2.x
---

If deploying to your servers requires SSH access, you will need to add SSH keys to CircleCI.

## 概要

There are two reasons to add SSH keys to CircleCI:

1. バージョン管理システムからコードをチェックアウトする
2. 実行中のプロセスが他のサービスにアクセスできるようにする

If you are adding an SSH key for the first reason, refer to the [GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/#enable-your-project-to-check-out-additional-private-repositories) document.

Otherwise, follow the steps below for the version of CircleCI you are using (Cloud/Server) to add an SSH key to your project.

**Note:** You may need to add the public key to `~/.ssh/ authorized_keys`in order to add SSH keys.

## 手順

**Note:** Since CircleCI cannot decrypt SSH keys, every new key must have an empty passphrase.

### CircleCI Cloud

1. In a terminal, generate the key with `ssh-keygen -t ed25519 -C "your_email@example.com"`. See [Secure Shell documentation](https://www.ssh.com/ssh/keygen/) for additional details.

2. In the CircleCI application, go to your project's settings by clicking the the **Project Settings** button (top-right on the **Pipelines** page of the project).

3. On the **Project Settings** page, click on **SSH Keys** (vertical menu on the left).

4. Scroll down to the **Additional SSH Keys** section.

5. Click the **Add SSH Key** button.

6. In the **Hostname** field, enter the key's associated host (for example, `git.heroku.com`). If you do not specify a hostname, the key will be used for all hosts.

7. In the **Private Key** field, paste the SSH key you are adding.

8. Click the **Add SSH Key** button.

### CircleCI Server

1. In a terminal, generate the key with `ssh-keygen -m PEM -t rsa -C "your_email@example.com"`. See the [(SSH) Secure Shell documentation](https://www.ssh.com/ssh/keygen/) web site for additional details.

2. In the CircleCI application, go to your project's settings by clicking the gear icon next to your project.

2. In the **Permissions** section, click on **SSH Permissions**.

3. Click the **Add SSH Key** button.

4. In the **Hostname** field, enter the key's associated host (for example, "git.heroku.com"). If you do not specify a hostname, the key will be used for all hosts.

5. In the **Private Key** field, paste the SSH key you are adding.

6. Click the **Add SSH Key** button.

## ジョブに SSH 鍵を登録する

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

## ホスト名を指定せずに複数の鍵を登録する

If you need to add multiple SSH keys with blank hostnames to your project, you will need to make some changes to the default SSH configuration provided by CircleCI. In the scenario where you have multiple SSH keys that have access to the same hosts, but are for different purposes the default `IdentitiesOnly no` is set causing connections to use ssh-agent. This will always cause the first key to be used, even if that is the incorrect key. If you have added the SSH key to a container, you will need to either set `IdentitiesOnly no` in the appropriate block, or you can remove all keys from the ssh-agent for this job using `ssh-add -D`, and reading the key added with `ssh-add /path/to/key`.

## 関連項目

[GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/)
