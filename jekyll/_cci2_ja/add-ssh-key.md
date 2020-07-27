---
layout: classic-docs
title: "CircleCI に SSH 鍵を登録する"
short-title: "CircleCI に SSH 鍵を登録する"
description: "SSH 鍵の CircleCI への登録方法"
order: 20
---

サーバーへのデプロイに SSH アクセスが必要な場合は、CircleCI に SSH 鍵を登録する必要があります。

## 概要

CircleCI に SSH 公開鍵を登録する必要があるケースは、以下の 2 パターンです。

1. バージョン管理システムからコードをチェックアウトする
2. 実行中のプロセスが他のサービスにアクセスできるようにする

1 つ目の目的で SSH 鍵を登録するときは、[GitHub および Bitbucket とのインテグレーション]({{ site.baseurl }}/ja/2.0/gh-bb-integration/#プロジェクトで追加のプライベートリポジトリのチェックアウトを有効にする) のページを参照してください。 2 つ目が目的のときは、下記の手順でプロジェクトに SSH 鍵を登録してください。

## 追加手順

1. CircleCI 管理画面で、プロジェクト名の横にある歯車アイコンをクリックし、**PROJECT SETTINGS** にアクセスします

2. **PERMISSIONS** 内の **SSH Permissions** を選びます

3. **Add SSH Key** ボタンをクリックします

4. **Hostname** には、鍵に関連付けるホスト名 (git.heroku.com など) を入力します。指定しない場合はどのホストに対しても同じ鍵が使われます

5. **Private Key** には、登録したい SSH 鍵の文字列を貼り付けます

6. **Add SSH Key** ボタンをクリックして完了です

**注**：CircleCI が SSH 鍵を復号できるよう、鍵には常に空のパスフレーズを設定してください。また、CircleCI は OpenSSH のデフォルトフォーマットをサポートしていません。

OpenSSH を使う場合は `ssh-keygen -m pem` コマンドで鍵を生成するようにしてください。

## 高度な設定

CircleCI のすべてのジョブは、登録された SSH 鍵に対し `ssh-agent` を通じて自動で署名を行います。ただし、コンテナに対して鍵を実際に登録するには設定ファイル内で `add_ssh_keys` を **必ず** 指定しなければなりません。

コンテナに SSH 鍵を 1 つまたは複数登録するには、以下の例にあるように、設定ファイル内の適切な [job]({{ site.baseurl }}/ja/2.0/jobs-steps/) に[特別な step]({{ site.baseurl }}/ja/2.0/configuration-reference/#add_ssh_keys)として `add_ssh_keys` を挿入します。

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

**注：**` fingerprints ` に指定した 1 つまたは複数のフィンガープリントは、管理画面で登録した SSH 鍵と一致していなければなりません。

## 関連情報

[GitHub と Bitbucket とのインテグレーション]({{ site.baseurl }}/2.0/gh-bb-integration/)
