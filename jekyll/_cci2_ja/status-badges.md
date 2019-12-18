---
layout: classic-docs
title: "CircleCIのバッジを追加する"
description: "CircleCIの状態をウェブサイトやドキュメントに埋め込む方法"
---

このページでは、あなたのプロジェクトのビルド状態( passed, または failed )をリポジトリの README や他のドキュメントに CircleCI の状態を表すバッジを作成する方法について説明しています。

## 概要

CircleCI のバッジは通常、プロジェクトの README に埋め込まれています。
しかし、他のウェブドキュメントにバッジを追加することも可能です。
CircleCI はバッジを埋め込む為のコードを作成するツールを提供しています。
デフォルト設定では、バッジは埋め込まれているプロジェクトのデフォルトブランチの状態を表示します。これは他のブランチを参照するように設定することができます。

バッジを埋め込むコードは下記フォーマットにて作成できます。

- Image URL
- Markdown
- Textile
- Rdoc
- AsciiDoc
- reStructuredText
- pod

## 手順

1. あなたのプロジェクト設定の _Notifications_ を開き、 _Status Badges_ をクリックします。
2. デフォルト設定では、バッジはあなたのプロジェクトのデフォルトブランチの状態を表示しています。
   他のブランチの状態を表示したい場合は、_Branch_ のドロップダウンメニューから、表示したいブランチを選択してください。
3. (任意)
   もし、あなたのプロジェクトが private である場合、[project API token]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-project-api-token)の生成が必要となります。
4. (任意)
   もし、前の手順で token を生成していたら、_API Token_ のドロップダウンメニューから使用する token を選択してください。
5. _Embed Code_ のドロップダウンメニューから使用したいフォーマットを選択してください。
6. 生成されたコードをコピーして、バッジを表示したいドキュメントに貼り付けて下さい。

## バッジのカスタマイズ

もし、デフォルトのバッジが物足りないと感じたら、[shield style](https://shields.io/) を使用することができます。
shield style を使用するには、生成されたコードの `style=svg` の部分を `style=shield` に変更してください。

## 参照

[Status]({{ site.baseurl }}/2.0/status/)
