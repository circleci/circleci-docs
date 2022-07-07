---
layout: classic-docs
title: "CircleCI に SSH キーを登録する"
short-title: "CircleCI に SSH キーを登録する"
description: "CircleCI に SSH キーを登録する方法"
order: 20
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

サーバーへのデプロイに SSH アクセスが必要な場合は、CircleCI に SSH キーを登録する必要があります。

## 概要
{: #overview }

以下の２つを実行するためには、CircleCI に SSH キーを登録する必要があります。

1. バージョン管理システムからコードをチェックアウトする
2. 実行中のプロセスが他のサービスにアクセスできるようにする

1 つ目の目的で SSH 鍵を登録する場合は、[GitHub と Bitbucket のインテグレーションに関するドキュメント]({{ site.baseurl }}/ja/2.0/gh-bb-integration/#プロジェクトで追加のプライベート-リポジトリのチェックアウトの有効化)を参照してください。

それ以外の場合は、お使いの CircleCI のバージョンに応じた以下の手順で、プロジェクトに SSH キーを登録してください。

**注:** SSH キーを登録するにはパブリックキーを`~/.ssh/authorized_keys` に登録する必要がある場合があります・

## 手順
{: #steps }

**注:** CircleCI が SSH キーを復号化できるよう、キーには常に空のパスフレーズを設定してください。

### CircleCI Cloud または Server 3.x
{: #circleci-cloud-or-server-3-x }

1. ターミナルで、`ssh-keygen -t ed25519 -C "your_email@example.com"` コマンドを実行してキーを生成します。 詳細については、[安全なシェルスクリプト (SSH) のドキュメント](https://www.ssh.com/ssh/keygen/)を参照してください。

2. CircleCI アプリケーションで、 **[Project Settings (プロジェクトの設定)]** ボタン (作業対象のプロジェクトの **パイプライン**のページの右上) をクリックして、プロジェクトの設定に移動します。

3. **[Project Settings (プロジェクトの設定)]** で、 **[SSH Keys (SSH キー)]** をクリックします (画面左側のメニュー)。

4. スクロールし、 **[Additional SSH Keys (追加 SSH キー)]** のセクションに移動します。

5. **[Add SSH Key (SSH キーの追加)]** ボタンをクリックします。

6. **[Hostname (ホスト名)]** フィールドにキーに関連付けるホスト名を入力します (例: git.heroku.com)。 ホスト名を指定しない場合は、どのホストに対しても同じキーが使われます。

7. **[Private Key (プライベート キー)]** フィールドに登録する SSH キーを貼り付けます。

8. **[Add SSH Key (SSH キーの追加)]** ボタンをクリックします。

### CircleCI Server 2.19.x
{: #circleci-server-2-19-x }

1. ターミナルで、`ssh-keygen -t ed25519 -C "your_email@example.com"` コマンドを実行してキーを生成します。 詳細については、[安全なシェルスクリプト (SSH) のドキュメント](https://www.ssh.com/ssh/keygen/)を参照してください。

2. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

2. **[Permissions (アクセス許可)]**で、**[SSH Permissions (SSH アクセス許可)]** をクリックします。

3. **[Add SSH Key (SSH キーの追加)]** ボタンをクリックします。

4. **[Hostname (ホスト名)]** フィールドにキーに関連付けるホスト名を入力します (例: git.heroku.com)。 ホスト名を指定しない場合は、どのホストに対しても同じキーが使われます。

5. **[Private Key (プライベート キー)]** フィールドに登録する SSH キーを貼り付けます。

6. **[Add SSH Key (SSH キーの追加)]** ボタンをクリックします。

## ジョブに SSH キーを登録する
{: #adding-ssh-keys-to-a-job }

すべての CircleCI ジョブは、`ssh-agent` を使用して登録済みのすべての SSH キーに自動的に署名します。 ただし、コンテナに実際にキーを登録するには、`add_ssh_keys` キーを**必ず使用してください**。

SSH キーをコンテナに登録するには、 [特別なステップ]({{site.baseurl}}/ja/2.0/configuration-reference/#add_ssh_keys) である `add_ssh_keys` を設定ファイルの適切な [ジョブ]({{ site.baseurl }}/ja/2.0/jobs-steps/) の中で使用します。

セルフホストランナーの場合、システムに `ssh-agent`  があり`add_ssh_keys` ステップが正常に使用できることを確認して下さい。 SSH キーは、`$HOME/.ssh/id_rsa_<fingerprint>`に記述されます。`$HOME`は、ジョブを実行するように設定されたユーザーのホームディレクトリで、`<fingerprint>` はこのキーのフィンガープリントです。 ホストエントリーは、キーを使用するための関連する `IdentityFile` オプションと一緒に `$HOME/.ssh/config` にも追加されます。
{: class="alert alert-info"}

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

**注:** `fingerprints` リスト内のすべてのフィンガープリントが、CircleCI アプリケーションを通じて登録されたキーと一致している必要があります。

## ホスト名を指定せずに複数のキーを登録する
{: #adding-multiple-keys-with-blank-hostnames }

ホスト名を指定せずに複数の SSH キーをプロジェクトに登録するには、CircleCI のデフォルトの SSH 設定に変更を加える必要があります。 たとえば、同じホストに別々の目的でアクセスする複数の SSH キーがある場合、デフォルトの `IdentitiesOnly no` が設定され、接続では ssh-agent が使用されます。 このとき、そのキーが正しいキーがどうかにかかわらず、常に最初のキーが使用されます。 コンテナに SSH キーを登録している場合は、適切なブロックに `IdentitiesOnly no` を設定するか、`ssh-add -D` コマンドを実行し、`ssh-add /path/to/key` コマンドで登録されたキーを読み取って、このジョブで使用する ssh-agent からすべてのキーを削除します。

## 関連項目
{: #see-also }

[GitHub と Bitbucket のインテグレーション]({{ site.baseurl }}/ja/2.0/gh-bb-integration/)
