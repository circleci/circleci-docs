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

1 つ目の目的で SSH 鍵を登録する場合は、[GitHub と Bitbucket のインテグレーションに関するドキュメント]({{ site.baseurl }}/ja/2.0/gh-bb-integration/#プロジェクトで追加のプライベート-リポジトリのチェックアウトの有効化)を参照してください。 2 つ目が目的のときは、以下の手順でプロジェクトに SSH 鍵を登録します。

## 手順

**メモ:**
SSH 鍵を作成する際は必ず空のパスワードを設定してください。
CircleCI ではパスワードを使った SSH 鍵の復号はできません。

### Cloud 版 CircleCI の場合

1. ターミナルで、`ssh-keygen -t ed25519 -C "your_email@example.com"` コマンドを実行して鍵を生成します。 詳細については、[Secure Shell (SSH) のドキュメント](https://www.ssh.com/ssh/keygen/)を参照してください。

2. CircleCI アプリケーションで、 **Project Settings** ボタン (作業対象のプロジェクトの **Pipelines** ページの右上にあります) をクリックして、プロジェクトの設定に移動します。

3. **Project Settings** ページにて、 **SSH Keys** をクリックします (画面左側のメニューにあります)。

4. スクロールし、 **Additional SSH Keys** のセクションに移動します。

5. **Add SSH Key** ボタンをクリックします。

5. **Hostname** フィールドに鍵に関連付けるホスト名を入力します (例: git.heroku.com)。 ホスト名を指定しない場合は、どのホストに対しても同じ鍵が使われます。

7. **Private Key** フィールドに登録する SSH 鍵を貼り付けます。

8. **Add SSH Key** ボタンをクリックします。

### CircleCI Server の場合

1. ターミナルで、`ssh-keygen -t ed25519 -C "your_email@example.com"` コマンドを実行して鍵を生成します。 詳細については、[Secure Shell (SSH) のドキュメント](https://www.ssh.com/ssh/keygen/)を参照してください。

2. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

3. **Permissions** セクションで、**SSH Permissions** をクリックします。

4. **Add SSH Key** ボタンをクリックします。

5. **Hostname** フィールドに鍵に関連付けるホスト名を入力します (例: git.heroku.com)。 ホスト名を指定しない場合は、どのホストに対しても同じ鍵が使われます。

6. **Private Key** フィールドに登録する SSH 鍵を貼り付けます。

7. **Add SSH Key** ボタンをクリックします。

## ジョブに SSH 鍵を登録する

すべての CircleCI ジョブは、`ssh-agent` を使用して登録済みのすべての SSH 鍵に自動的に署名します。ただし、コンテナに実際に鍵を登録するには、`add_ssh_keys` キーを使用する**必要があります**。

複数の SSH 鍵をまとめてコンテナに登録するには、設定ファイル内の適切な[ジョブ]({{ site.baseurl }}/ja/2.0/jobs-steps/)を選択して、[`add_ssh_keys`]({{ site.baseurl }}/ja/2.0/configuration-reference/#add_ssh_keys) という特別なステップを実行します。

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

ホスト名を指定せずに複数の SSH 鍵をプロジェクトに登録するには、CircleCI のデフォルトの SSH 設定に変更を加える必要があります。 たとえば、同じホストに別々の目的でアクセスする複数の SSH 鍵がある場合、デフォルトの `IdentitiesOnly no` が設定され、接続では ssh-agent が使用されます。 このとき、その鍵が正しい鍵がどうかにかかわらず、常に最初の鍵が使用されます。 コンテナに SSH 鍵を登録している場合は、適切なブロックに `IdentitiesOnly no` を設定するか、`ssh-add -D` コマンドを実行し、`ssh-add /path/to/key` コマンドで登録された鍵を読み取って、このジョブで使用する ssh-agent からすべての鍵を削除します。

## 関連項目

[GitHub と Bitbucket のインテグレーション]({{ site.baseurl }}/ja/2.0/gh-bb-integration/)
