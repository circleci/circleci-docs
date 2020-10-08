---
layout: classic-docs
title: "Orbオーサリングの概要"
short-title: "Orbオーサリングの概要"
description: "Orbのオーサリング方法に関する入門ガイド"
categories:
  - getting-started
order: 1
---

## Orb オーサリングの概要

Orb は、複数のプロジェクト間で共有できる CircleCI 構成の再利用可能パッケージです。カプセル化およびパラメーター化されたコマンド、ジョブ、および Executor を作成して、[複数のプロジェクトで使用]({{ site.baseurl }}/ja/2.0/using-orbs/)できます。

[Orbs]({{ site.baseurl }}/ja/2.0/orb-intro/) は、2.1 の [.circleci/config.yml]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルのトップレベルにある `orbs` キーを通して構成内で利用できるようになります。

既存の CircleCI Orb またはパートナー承認済みの Orb では特定のワークフローまたはジョブに対応できない場合、独自の Orb をオーサリングすることも可能です。 [CircleCI Orb レジストリ](https://circleci.com/developer/orbs)にある既存の Orb を使用する場合に比べて時間はかかりますが、独自の Orb をオーサリングすれば、特定のワークフローに合わせて構成を作成し、事前にパッケージ化できます。 Orb のオーサリングと構成のバリデーションを行ってから、新たに作成した Orb を CircleCI Orb レジストリにパブリッシュするためのプロセスについて、順を追って説明していきます。

## 主なコンセプト

Orb をオーサリングする前に、まず Orb の中核的なコンセプト、Orb の構造と動作についてよく理解しておく必要があります。 こうしたコンセプトについて基本的な知識を身に着けることで、十分な機能を有する Orb を記述して活用できるだけでなく、ワークフローにも使用できます。

Orb は、以下の 3 つの要素で構成されます。

- コマンド
- ジョブ
- Executor

### コマンド

コマンドは、再利用可能なステップの集合体であり、既存のジョブ内から特定のパラメーターを使用して呼び出すことができます。 たとえば、`sayhello` コマンドを呼び出す場合は、以下のように `to` パラメーターを渡します。

```yaml
version: 2.1
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - myorb/sayhello:
          to: "Lev"
```
### ジョブ

ジョブは、ステップの集合体と、それが実行される環境の 2 つの部分で構成されます。 ジョブをビルド構成または Orb で定義すると、構成または外部の Orb 構成のジョブ キーの下にあるマップ内でジョブ名を定義できます。

ジョブは `config.yml ファイル`のワークフロー スタンザで呼び出す必要があります。このとき、必要なパラメーターをサブキーとしてジョブに渡します。

### Executor

Executor は、ジョブのステップが実行される環境を定義します。 CircleCI 構成でジョブを宣言するとき、ジョブを実行する環境のタイプ (docker、machine、macos など) と共に、その環境について以下のようなパラメーターを定義します。

- 挿入する環境変数
- 使用するシェル
- 使用する `resource_class` のサイズ

設定ファイル内のジョブの外側で Executor を宣言すると、その宣言をスコープ内のすべてのジョブで使用できるため、1 つの Executor 定義を複数のジョブで再利用できます。

Executor の定義では、以下のキーを使用できます (一部のキーは、ジョブ宣言を使用する際にも使用できます)。

- docker、machine、macos
- environment
- working_directory
- shell
- resource_class

## Orb の構成

以下の表で、Orb を構成する各要素について説明します。

**メモ:** Orb には CircleCI バージョン 2.1 が必要です。

| キー        | 必須 | タイプ | 説明                                                                                            |
| --------- | -- | --- | --------------------------------------------------------------------------------------------- |
| orbs      | ×  | マップ | ユーザーが選択した名前から Orb 参照 (文字列) または Orb 定義 (マップ) へのマップ。 Orb 定義は、2.1 設定ファイルの Orb 関連サブセットである必要があります。 |
| executors | ×  | マップ | Executor 定義への文字列のマップ。                                                                         |
| commands  | ×  | マップ | コマンド名からコマンド定義へのマップ。                                                                           |
{: class="table table-striped"}

### Orb の構成例

以下の例は、承認済みの `circleci` 名前空間に置かれた `hello-build` という名前の Orb を呼び出します。

```yaml
version: 2.1
orbs:
    hello: circleci/hello-build@0.0.5
workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```
上の例で、`hello` は Orb 参照と見なされます。`circleci/hello-build@0.0.5` は完全修飾 Orb 参照です。

## 次のステップ

次に行うべき手順については、「[Orb のオーサリング – CircleCI CLI のセットアップ]({{site.baseurl}}/ja/2.0/orb-author-cli/)」を参照してください。
