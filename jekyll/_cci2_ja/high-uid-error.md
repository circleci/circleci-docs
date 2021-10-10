---
layout: classic-docs
title: "コンテナ ID をホスト ID にマップできないエラーのデバッグ"
short-title: "コンテナ ID をホスト ID にマップできないエラーのデバッグ"
description: "コンテナの起動時に「コンテナ ID XXX をホスト ID にマップできません」というエラーが発生した場合のデバッグ"
categories:
  - troubleshooting
order: 21
version:
  - Cloud
  - Server v2.x
---

コンテナの起動時に、以下のエラー メッセージが表示されることがあります。

```
failed to register layer: Error processing tar file (exit status 1): container id 1000000 cannot be mapped to a host id
```

このドキュメントでは、このエラーの原因と対策について説明していきます。

## 背景
{: #background }

ユーザー名前空間 (`userns`) は、Linux コンテナにセキュリティ レイヤーを追加する Linux カーネルの機能です。 `userns` により、ホスト マシンはその UID または GID の名前空間の外部でコンテナを実行できます。 そのため、すべてのコンテナは一意の名前空間に root アカウント (UID 0) を持つことができ、ホスト マシンから root 権限を付与されていなくてもプロセスを実行できます。

`userns` が作成されると、Linux カーネルによってコンテナとホスト マシンの間のマッピングが行われます。 たとえば、コンテナを起動し、その内部で UID 0 としてプロセスを実行すると、Linux カーネルはコンテナの UID 0 をホスト マシン上の権限のない UID にマップします。 これにより、コンテナは root ユーザーと同様にプロセスを実行できますが、**実際には**ホスト マシン上の非 root ユーザーによって実行されています。

## 問題
{: #problem }

このエラーは `userns` の再マッピングが失敗することで発生します。 ユーザーのコンテナを安全に実行するために、CircleCI は `userns` を有効にして Docker コンテナを実行します。 このホスト マシンには、再マッピングに有効な UID または GID が構成されています。 この UID および GID は 0 ～ 65535 の範囲内である**必要があります**。

Docker はコンテナを起動するとイメージをプルし、そのイメージからレイヤーを抽出します。 許可された範囲外の UID または GID のファイルがレイヤーに存在すると、Docker は正常に再マッピングを行えず、コンテナを起動できません。

## 解決策
{: #solution }

このエラーを修正するには、ファイルの UID または GID を更新してからイメージを再作成する必要があります。

イメージの保守担当者でないと、この作業には対応できません。 イメージの保守担当者に連絡して、エラーを報告してください。

イメージの保守担当者は、上位の UID または GID でファイルを特定し、修正してください。 まず、エラー メッセージから上位の UID または GID を確認します。 ドキュメントの冒頭で示した例では、`1000000` が上位の UID または GID の値です。 次にコンテナを起動し、無効な値が返されるファイルを特定します。

以下の例では、[circleci/doc-highid](https://hub.docker.com/r/circleci/doc-highid) 内で `find` コマンドを使用して無効なファイルを探します。

```bash
# コンテナ内でシェルを開始します
$ docker run -it circleci/doc-highid sh

# 上位の UID または GID を利用してファイルを検索します
$ find / \( -uid 1000000 \)  -ls 2>/dev/null
     50      0 -rw-r--r--   1 veryhigh veryhigh        0 Jul  9 03:05 /file-with-high-id

# ファイルが上位の UID または GID を持っていることを確認します
$ ls -ln file-with-high-id
-rw-r--r-- 1 1000000 1000000 0 Jul  9 03:05 file-with-high-id
```

問題のファイルが見つかったら、ファイルの所有権を変更し、イメージを再作成します。

**メモ:** コンテナのビルド中に、無効なファイルが生成され、削除されることがあります。 その場合、Dockerfile 内の `RUN` ステップの修正が必要になる可能性があります。 このとき、対象のステップに `&& chown -R root:root /root` を追加すると、不要な中間物を作成することなく問題に対処できます。

## 関連項目
{: #see-also }

上記の手順を行った後もさらにエラーが発生する場合には、[Microsoft フォーラムの投稿](https://social.msdn.microsoft.com/Forums/vstudio/en-US/f034bd0a-00e1-4a11-a716-8cf1112a5db4/container-id-xxxxxxx-cannot-be-mapped-to-a-host-id?forum=windowsazurewebsitespreview)を参照してください。
