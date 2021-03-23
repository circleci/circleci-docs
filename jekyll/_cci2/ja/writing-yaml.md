---
layout: classic-docs
title: "YAML の記述"
short-title: "YAML の記述"
description: "CircleCI の YAML を記述する方法"
order: 20
version:
  - Cloud
  - Server v2.x
---

CircleCI の構成に使用する YAML の最も重要な機能について説明します。

* TOC
{:toc}

## 概要
{:.no_toc}

[YAML](http://yaml.org) は、理解しやすいデータ シリアライズの標準的な形式であり、あらゆるプログラミング言語で使用できます。 YAML は、別のデータ シリアライズ言語である [JSON](https://www.json.org/) の厳密なスーパーセットです。 This means it can do everything JSON can... and more.

CircleCI の構成は、`~/.circleci/config.yml` にある単一の YAML ファイルに格納されています。ここで、`~` は、プロジェクトのディレクトリのルートです。 CircleCI の作業の大部分はこのファイルで行われるため、YAML 形式の基礎を理解することが重要になります。

## How to write YAML

YAML ファイルの基本構造は[ハッシュ テーブル](https://ja.wikipedia.org/wiki/ハッシュテーブル)で、1 つ以上のキー・値のペアで構成されます。

```yaml
key: value
```

ネストされたキーをインデントすることで、別のキー・値のペアを値として設定できます。

```yaml
key:
  another_key: "another value"
```

### Multi-line strings
{:.no_toc}

値の文字列が複数行にわたる場合は、`>` 文字を使用します。この記号の後には、任意の数の行を記述できます。 長いコマンドを記述する場合に特に便利です。

```yaml
haiku: >
  Please consider me
  As one who loved poetry
  Oh, and persimmons.
```

**Note**: Quotes are not necessary when using multiline strings.

### シーケンス
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

シーケンス内の項目をキー・値のペアで記述することもできます。

```yaml
simulation:
  - within: "a simulation"
  - without:
      a_glitch: "in the matrix"
```

**Note**: Remember to properly indent a key-value pair when it is the value of an item in a sequence.

### Anchors and aliases
{:.no_toc}

[DRY (Don't Repeat Yourself: 繰り返しを避けること) の原則](https://ja.wikipedia.org/wiki/Don%27t_repeat_yourself)に基づいて `config.yml` を作成するために、アンカーとエイリアスを使用できます。 アンカーは `&` 文字、エイリアスは `*` 文字で識別されます。

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

### Merging maps
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

**Note**: As mentioned in [a YAML repository issue](https://github.com/yaml/yaml/issues/35), it is possible to merge maps, but not sequences (also called arrays or lists).

さらに複雑な例は、[こちらの Gist](https://gist.github.com/bowsersenior/979804) で参照してください。

## See also

YAML には他にも機能がありますが、YAML の基礎について理解し、CircleCI の設定ファイルを簡潔に保つには、上記の例で十分です。 さらに知識を深めたい場合は、以下の資料をご活用ください。

- キーと値の具体的な例については、「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」を参照してください。
- `config.yml` が有効な YAML かどうかがわからない場合は、[バリデーション ツール](http://yaml-online-parser.appspot.com/)を実行してください。

CircleCI は「Orbs」も開発しました。Orbs とは、構成ワークフローで使用できる構成エレメントをまとめたパッケージであり、事前構成とテストを終えた状態で使用できます。 DRY (Don't Repeat Yourself: 繰り返しを避けること) の原則を守るためのツールとして Orbs を使用すれば、構成エレメント (ジョブ、Executor、コマンド) をワークフローにすばやく簡単に組み込むことができます。 Orbs の詳細については、以下のドキュメントを参照してください。

- [Orbs とは]({{site.baseurl}}/2.0/orb-intro/): Orbs の概要
- [Orbs を使う]({{site.baseurl}}/2.0/using-orbs/): 既存の Orbs の使用方法
- [Orbs の作成]({{site.baseurl}}/2.0/creating-orbs/): Orb を独自に作成する手順
- [設定ファイルの再利用]({{site.baseurl}}/2.0/reusing-config/): 再利用可能な Orbs、コマンド、パラメーター、および Executors の詳細
- [「Learn X in Y Minutes」の YAML ページ](https://learnxinyminutes.com/docs/yaml/): YAML について詳しく取り上げた徹底ガイド
