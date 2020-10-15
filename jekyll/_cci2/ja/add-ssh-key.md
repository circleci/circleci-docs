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

サーバーへのデプロイに SSH アクセスが必要な場合は、CircleCI に SSH 鍵を登録する必要があります。

## 概要

CircleCI に SSH 鍵を登録する必要があるケースは、以下の 2 パターンです。

1. バージョン管理システムからコードをチェックアウトする
2. 実行中のプロセスが他のサービスにアクセスできるようにする

1 つ目の目的で SSH 鍵を登録する場合は、[GitHub と Bitbucket のインテグレーションに関するドキュメント]({{ site.baseurl }}/ja/2.0/gh-bb-integration/#プロジェクトで追加のプライベート-リポジトリのチェックアウトを有効にする)を参照してください。 Otherwise, follow the steps below for the version of CircleCI you are using (Cloud/Server) to add an SSH key to your project.

## 手順

**メモ:** CircleCI が SSH 鍵を復号化できるよう、鍵には常に空のパスフレーズを設定してください。 また、CircleCI は OpenSSH のデフォルトのファイル形式をサポートしていません。OpenSSH を使用して鍵を生成する場合は、`ssh-keygen -m pem` コマンドを使用します。

**メモ:** 最近 `ssh-keygen` は、デフォルトで PEM 形式の鍵を生成しないように更新されました。 非公開鍵が `-----BEGIN RSA PRIVATE KEY-----` で始まらない場合、`ssh-keygen -m PEM -t rsa -C "your_email@example.com"` コマンドで鍵を生成すると、強制的に PEM 形式で生成できます。

### CircleCI Cloud

1. ターミナルから、`ssh-keygen -m PEM -t rsa -C "your_email@example.com"` コマンドを入力して鍵を生成します。 詳細については、[Secure Shell (SSH) のドキュメント](https://www.ssh.com/ssh/keygen/)を参照してください。

2. In the CircleCI application, go to your project's settings by clicking the the **Project Settings** button (top-right on the **Pipelines** page of the project).

3. On the **Project Settings** page, click on **SSH Keys** (vertical menu on the left).

4. Scroll down to the **Additional SSH Keys** section.

5. Click the **Add SSH Key** button.

6. In the **Hostname** field, enter the key's associated host (for example, "git.heroku.com"). If you don't specify a hostname, the key will be used for all hosts.

7. In the **Private Key** field, paste the SSH key you are adding.

8. **Add SSH Key** ボタンをクリックします

### CircleCI Server

1. In a terminal, generate the key with `ssh-keygen -m PEM -t rsa -C "your_email@example.com"`. See the [(SSH) Secure Shell documentation](https://www.ssh.com/ssh/keygen/) web site for additional details.

2. In the CircleCI application, go to your project's settings by clicking the gear icon next to your project.

3. In the **Permissions** section, click on **SSH Permissions**.

4. Click the **Add SSH Key** button.

5. In the **Hostname** field, enter the key's associated host (for example, "git.heroku.com"). If you don't specify a hostname, the key will be used for all hosts.

6. In the **Private Key** field, paste the SSH key you are adding.

7. Click the **Add SSH Key** button.

## ジョブに SSH 鍵を登録する

すべての CircleCI ジョブは、`ssh-agent` を使用して登録済みのすべての SSH 鍵に自動的に署名します。ただし、コンテナに実際に鍵を登録するには、`add_ssh_keys` キーを使用する**必要があります**。

複数の SSH 鍵をまとめてコンテナに登録するには、設定ファイル内の適切な[ジョブ]({{ site.baseurl }}/2.0/jobs-steps/)を選択して、[`add_ssh_keys`]({{ site.baseurl }}/2.0/configuration-reference/#add_ssh_keys) という特別なステップを実行します。

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

**メモ:** `fingerprints` リスト内のすべてのフィンガープリントが、CircleCI アプリケーションを通じて登録された鍵と一致している必要があります。

## ホスト名を指定せずに複数の鍵を登録する

ホスト名を指定せずに複数の SSH 鍵をプロジェクトに登録するには、CircleCI のデフォルトの SSH 設定に変更を加える必要があります。 In the scenario where you have multiple SSH keys that have access to the same hosts, but are for different purposes the default `IdentitiesOnly no` is set causing connections to use ssh-agent. このとき、その鍵が正しい鍵がどうかにかかわらず、常に最初の鍵が使用されます。 コンテナに SSH 鍵を登録している場合は、適切なブロックに `IdentitiesOnly no` を設定するか、`ssh-add -D` コマンドを実行し、`ssh-add /path/to/key` コマンドで登録された鍵を読み取って、このジョブで使用する ssh-agent からすべての鍵を削除します。

## 関連項目

[GitHub と Bitbucket のインテグレーション]({{ site.baseurl }}/2.0/gh-bb-integration/)