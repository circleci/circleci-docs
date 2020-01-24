---
layout: classic-docs
title: "CircleCI に SSH 鍵を登録する"
short-title: "CircleCI に SSH 鍵を登録する"
description: "CircleCI に SSH 鍵を追加する方法"
order: 20
---

サーバーへのデプロイに SSH アクセスが必要な場合は、CircleCI に SSH 鍵を登録する必要があります。

## 概要

CircleCI に SSH 鍵を登録する必要があるケースは、以下の 2 パターンです。

1. バージョン管理システムからコードをチェックアウトする
2. 実行中のプロセスが他のサービスにアクセスできるようにする

1 つ目の目的で SSH 鍵を登録する場合は、[GitHub と Bitbucket のインテグレーションに関するドキュメント]({{ site.baseurl }}/2.0/gh-bb-integration/#プロジェクトで追加のプライベート-リポジトリのチェックアウトを有効にする)を参照してください。 2 つ目が目的のときは、以下の手順でプロジェクトに SSH 鍵を登録します。

## 手順

1. ターミナルから、`ssh-keygen -m PEM -t rsa -C "your_email@example.com"` コマンドを入力して鍵を生成します。 詳細については、[Secure Shell (SSH) のドキュメント](https://www.ssh.com/ssh/keygen/)を参照してください。

1. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

2. In the **Permissions** section, click on **SSH Permissions**.

3. Click the **Add SSH Key** button.

4. In the **Hostname** field, enter the key's associated host (for example, "git.heroku.com"). ホスト名を指定しない場合は、どのホストに対しても同じ鍵が使われます。

5. In the **Private Key** field, paste the SSH key you are adding.

6. Click the **Add SSH Key** button.

**Note:** Since CircleCI cannot decrypt SSH keys, every new key must have an empty passphrase. また、CircleCI は OpenSSH のデフォルトのファイル形式をサポートしていません。OpenSSH を使用して鍵を生成する場合は、`ssh-keygen -m pem` コマンドを使用します。

**Caution:** Recent updates in `ssh-keygen` don't generate the key in PEM format by default. 非公開鍵が `-----BEGIN RSA PRIVATE KEY-----` で始まらない場合、`ssh-keygen -m PEM -t rsa -C "your_email@example.com"` コマンドで鍵を生成すると、強制的に PEM 形式で生成できます。


## ジョブに SSH 鍵を登録する

Even though all CircleCI jobs use `ssh-agent` to automatically sign all added SSH keys, you **must** use the `add_ssh_keys` key to actually add keys to a container.

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

**Note:** All fingerprints in the `fingerprints` list must correspond to keys that have been added through the CircleCI application.

## ホスト名を指定せずに複数の鍵を登録する

ホスト名を指定せずに複数の SSH 鍵をプロジェクトに登録するには、CircleCI のデフォルトの SSH 設定に変更を加える必要があります。 たとえば、同じホストに別々の目的でアクセスする複数の SSH 鍵がある場合、デフォルトの `IdentitiesOnly no` が設定され、接続では ssh-agent が使用されます。 このとき、その鍵が正しい鍵がどうかにかかわらず、常に最初の鍵が使用されます。 コンテナに SSH 鍵を登録している場合は、適切なブロックに `IdentitiesOnly no` を設定するか、`ssh-add -D` コマンドを実行し、`ssh-add /path/to/key` コマンドで登録された鍵を読み取って、このジョブで使用する ssh-agent からすべての鍵を削除します。

## 関連項目

[GitHub と Bitbucket のインテグレーション]({{ site.baseurl }}/2.0/gh-bb-integration/)
