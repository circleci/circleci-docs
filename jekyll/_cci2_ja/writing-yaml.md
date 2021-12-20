---
layout: classic-docs
title: "YAML の記述"
short-title: "YAML の記述"
description: "CircleCI の YAML を記述する方法"
order: 20
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

CircleCI の設定に使用する YAML の最も重要な機能について説明します。

* TOC
{:toc}

## 概要
{: #overview }
{:.no_toc}

[YAML](http://yaml.org) は、読みやすい形式のデータシリアル化の標準であり、あらゆるプログラミング言語で使用できます。 YAML は、別のデータ標準化言語である [JSON](https://www.json.org/) の厳密な上位版です。 つまり、JSONでできることはすべてできる...それ以上のことができるということです。

CircleCI の設定は、`~/.circleci/config.yml` にある単一の YAML ファイルに格納されています。 ここでは、`~` はプロジェクトのディレクトリのルートです。 </code> CircleCI の作業の大部分はこのファイルで行われるため、YAML 形式の基礎を理解することが重要になります。

## YAML の記述方法
{: #how-to-write-yaml }

YAML ファイルの基本構造は[ハッシュ マップ](https://en.wikipedia.org/wiki/Hash_table)で、1 つ以上のキーと値のペアで構成されます。

```yaml
key: value
```

ネストされたキーをインデントすることで、別のキーと値のペアを値として設定できます。

```yaml
key:
  another_key: "another value"
```

### 複数行の文字列
{: #multi-line-strings }
{:.no_toc}

値の文字列が複数行にわたる場合は、`>` 文字を使用します。 これは特に、長いコマンドを記述する場合に便利です。

```yaml
haiku: >
  Please consider me
  As one who loved poetry
  Oh, and persimmons.
```

**注:** 複数行の文字列を記述する場合、引用符は必要ありません。

### シーケンス
{: #sequences }
{:.no_toc}

キーと値は[スカラー](https://softwareengineering.stackexchange.com/questions/238033/what-does-it-mean-when-data-is-scalar)に限定されません。 スカラーをシーケンスにマップすることもできます。

```yaml
scalar:
  - never
  - gonna
  - give
  - you
  - up
```

シーケンス内の項目をキーと値のペアで記述することもできます。

```yaml
simulation:
  - within: "a simulation"
  - without:
      a_glitch: "in the matrix"
```

**注:** シーケンス内の項目をキーと値のペアで記述する場合は、正しくインデントするように注意してください。

### アンカーとエイリアス
{: #anchors-and-aliases }
{:.no_toc}

[DRY (Don't Repeat Yourself: 繰り返しを避ける) の原則](https://ja.wikipedia.org/wiki/Don%27t_repeat_yourself)に基づいて `config.yml` を作成するために、アンカーとエイリアスを使用できます。 アンカーは `&` 文字、エイリアスは `*` 文字で識別されます。

```yaml
song:
  - &name Al
  - You
  - can
  - call
  - me
  - *name
```

上記のリストを YAML パーサーで読み取ると、次のようなリテラル出力が得られます。

```yaml
song:
  - Al
  - You
  - can
  - call
  - me
  - Al
```

### マップのマージ
{: #merging-maps }
{:.no_toc}

アンカーとエイリアスはスカラー値に対して機能しますが、マップまたはシーケンスを保存するには、`<<` を使用してエイリアスを挿入します。

```yaml
default: &default
  school: hogwarts

harry:
  <<: *default
  house: gryffindor

draco:
  <<: *default
  house: slytherin
```

複数のマップをマージすることもできます。

```yaml
name: &harry_name
  first_name: Harry
  last_name: Potter

address: &harry_address
  street: 4, Privet Drive
  district: Little Whinging
  county: Surrey
  country: England

harry_data:
  <<: [*harry_name, *harry_address]
```

**注:** [YAML リポジトリの問題](https://github.com/yaml/yaml/issues/35)に記載されているように、マップはマージできますが、シーケンス (配列またはリストとも言う) はマージできません。

さらに複雑な例は、[こちらのGist](https://gist.github.com/bowsersenior/979804) を参照してください。

## 関連項目
{: #see-also }

YAML には他にも機能がありますが、YAML の基礎について理解し、CircleCI の設定ファイルを簡潔に保つには、上記の例で十分です。 さらに知識を深めたい場合は、以下の資料をご活用ください。

- キーと値の具体的な例については、「[CircleCI の設定]({{ site.baseurl }}/2.0/configuration-reference/)」を参照してください。
- `config.yml` が有効な YAML かどうかがわからない場合は、[バリデーション ツール](http://yaml-online-parser.appspot.com/)を使って実行してください。

CircleCI は「Orb」も開発しています。 Orb は、事前設定とテストを終えた状態の設定エレメントをまとめたパッケージで、お客様が設定したワークフローで使用することができます。 Orb を使えば、DRY (Don't Repeat Yourself: 繰り返しを避ける) の原則により、設定エレメント (ジョブ、Executor、コマンド) をワークフローにすばやく簡単に組み込むことができます。 Orb の詳細については、以下のドキュメントを参照してください。

- [Orb の概要]({{site.baseurl}}/2.0/orb-intro/): Orb の詳細な概要
- Refer to [Orb Intro]({{site.baseurl}}/2.0/orb-intro/), for more about how to use existing orbs.
- [Orb の作成]({{site.baseurl}}/2.0/creating-orbs/): ご自身で Orb を作成する手順
- [設定ファイルの再利用]({{site.baseurl}}/2.0/reusing-config/): 再利用可能な Orb、コマンド、パラメーター、および Executor の詳細
- [「Learn X in Y Minutes」の YAML ページ](https://learnxinyminutes.com/docs/yaml/): YAML について詳しく取り上げた徹底ガイド
