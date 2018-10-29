---
layout: classic-docs
title: "CircleCI に SSH 鍵を登録する"
short-title: "CircleCI に SSH 鍵を登録する"
description: "SSH 認証用の鍵の CircleCI への登録方法"
order: 20
---
サーバーへのデプロイに SSH アクセスが必要な場合は、CircleCI に公開鍵認証用の SSH 鍵を登録する必要があります。

## 概要

CircleCI に SSH 公開鍵を登録する必要があるケースは、以下の 2 パターンです。

1. バージョン管理システムからコードをチェックアウトする
2. 実行中のプロセスが他のサービスにアクセスできるようにする

If you are adding an SSH key for the first reason, refer to the [GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/#enable-your-project-to-check-out-additional-private-repositories) document. 2 つ目が目的のときは、下記の手順でプロジェクトに SSH 鍵を登録してみてください。

## 追加手順

1. CircleCI 管理画面の **SETTINGS** にアクセスし、**Projects** 内の設定したいプロジェクト名の横にある歯車アイコンをクリックします

2. **Permissions** 内の **SSH Permissions** を選びます

3. **Add SSH Key** ボタンをクリックします

4. **Hostname**フィールドに、キーと関連付けられているホスト(git.heroku.comなど)を入力します。hostnameを指定しない場合は、すべてのホストに同じキーが使用されます。

5. **Private Key** には、登録したい SSH 鍵の文字列を貼り付けます

6. **Add SSH Key** ボタンをクリックして完了です

**補足**：CircleCI が SSH 鍵を復号できるよう、鍵には常に空のパスフレーズを設定してください。

## 高度な設定

CircleCI のすべてのジョブは、登録された SSH 鍵に対し `ssh-agent` を通じて自動で署名を行います。ただし、コンテナに対して鍵を実際に登録するには設定ファイル内で `add_ssh_keys` を**必ず**指定しなければなりません。

コンテナに SSH 鍵を 1 つまたは複数登録するには、以下の例にあるように、設定ファイル内の適切な [job]({{ site.baseurl }}/2.0/jobs-steps/) に[特殊な step コマンド]({{ site.baseurl }}/2.0/configuration-reference/#add_ssh_keys)として `add_ssh_keys` を挿入します。

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

**補足：**` fingerprints ` に指定した 1 つまたは複数のフィンガープリントは、管理画面で登録した SSH 鍵と一致していなければなりません。

## その他の参考資料

[GitHub/Bitbucket との統合]({{ site.baseurl }}/2.0/gh-bb-integration/)