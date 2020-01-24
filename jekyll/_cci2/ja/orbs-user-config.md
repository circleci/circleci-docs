---
layout: classic-docs
title: "Orbs を使用できるようプラットフォームのバージョンを設定する"
short-title: "Orbs を使用できるようプラットフォームのバージョンを設定する"
description: "CircleCI またはパートナーの Orbs を使用できるようにプラットフォームのバージョンを設定する方法"
categories:
  - getting-started
order: 1
---

## はじめに

CircleCI やパートナーの承認済み Orbs を使用する前に、まず `config.yml` でプラットフォームのバージョンを `2.1` に設定する必要があります。 以前のバージョンでは Orbs の使用がサポートされていません。

以下のセクションでは、プラットフォームのバージョンを 2.1 に設定して Orbs を利用できるようにする方法について説明します。

## Orbs を使用できるようプラットフォームを設定する

Orbs を使用できるようにプラットフォームのバージョンを設定するのはとても簡単です。以下の手順を実行します。

1) `.circleci/config.yml` ファイルの先頭で CircleCI のバージョンを 2.1 に設定します。

`version: 2.1`

**メモ:** パイプラインをまだ有効化していない場合は、**[Project Settings (プロジェクト設定)] -> [Advanced Settings (詳細設定)]** に移動し、有効化する必要があります。

2) バージョンの下に `orbs` スタンザを追加し、そこで Orbs を呼び出します。 以下の例では、`aws-cli` Orb を呼び出しています。

```
orbs:
  aws-cli: circleci/aws-cli@0.1.13
```

3) 指定した Orb 固有の要素を既存のワークフローやジョブで使用します。

### Hello World の例

`hello-build` Orb を `circleci` 名前空間で呼び出します。

```yaml
version: 2.1
orbs:
    hello: circleci/hello-build@0.0.5

workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```

**メモ:** 2.1 よりも前のバージョンで CircleCI に追加されていたプロジェクトでは、パイプラインを有効化して `orbs` キーを使用できるようにする必要があります。

## 次のステップ
{:.no_toc}

- 次の手順については、[Orbs の選択に関するドキュメント]({{site.baseurl}}/2.0/orbs-user-select-orb/)を参照してください。
