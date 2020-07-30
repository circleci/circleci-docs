---
layout: classic-docs
title: "Orb のコンセプト"
short-title: "Orb のコンセプト"
description: "Orb のコンセプトの概要"
categories:
  - getting-started
order: 1
---

CircleCI Orbs は、ジョブ、コマンド、Executor などの構成要素をまとめた共有可能なパッケージです。 CircleCI では、承認済み Orbs に加え、CircleCI パートナーによってオーサリングされたサードパーティ製の Orbs も提供しています。 まずは、こうした既存の Orbs がご自身の構成ワークフローに活用できるかどうかを評価することをお勧めします。 現在提供されている Orb の一覧は、CircleCI Orb レジストリにて確認してください。

Orb を使用する前に、まず Orb の中核的なコンセプト、Orb の構造と動作についてよく理解しておく必要があります。 こうしたコンセプトについて基本的な知識を身に着けることで、それぞれの環境で Orb を簡単に活用できるようになります。

### 承認済み Orbs と サードパーティ製 Orbs

CircleCI では、プラットフォームでの動作テストを経て承認された Orbs を数多く公開しています。 承認済みの Orb はプラットフォームの一部として扱われ、これ以外の Orb はすべてサードパーティ製 Orbs と見なされます。 メモ: 組織の管理者は、組織の [Settings (設定)] > [Security (セキュリティ)] ページで、サードパーティ製の未承認 Orb の使用をオプトインする必要があります。

すべての Orb はオープンであり、だれでも使用したりソースを確認したりできます。

### 設計手法

Orb を使用する前に、これらの Orb が設計されたときのさまざまな方針や手法について理解しておくとよいでしょう。 Orb は、以下の点を考慮して設計されています。

* Orb では透明性が確保されている - あなたが Orb を実行するとき、その Orb のソースはあなただけでなく、他のだれもが表示できます。
* メタデータを使用できる - すべてのキーに説明キーを含めることができ、Orb のトップレベルに説明を追加できます。
* 安定版 Orb は必ずセマンティック バージョニング (semver) される - CircleCI では、「dev:」で始まるバージョン番号を持つ開発版 Orb の作成・使用が許可されています。
* 安定版 Orb は変更不可 - Orb をセマンティック バージョンにパブリッシュした後で Orb を変更することはできません。 これにより、コア オーケストレーションでの予期しない破損や動作の変更を防ぐことができます。
* レジストリは 1 つ (インストールあたり) - circleci.com を含む CircleCI のインストールごとに、Orb を保持できるレジストリを 1 つだけ持つことができます。
* 組織の管理者は安定版 Orb をパブリッシュでき、 組織メンバーは開発版 Orb をパブリッシュできる - すべての名前空間は組織が所有します。 その組織の管理者だけが安定版 Orb をパブリッシュおよびプロモートできます。 開発版 Orb のパブリッシュは組織の全メンバーが行えます。

### Orb の構造

Orb は、以下の要素で構成されます。

- コマンド
- ジョブ
- Executor

#### コマンド

コマンドは、再利用可能なステップの集合体であり、既存のジョブ内から特定のパラメーターを使用して呼び出すことができます。 たとえば、`sayhello` コマンドを呼び出す場合は、以下のように to にパラメーターを渡します。

```
version: 2.1
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - myorb/sayhello:
          to: "Lev"
```

#### ジョブ

ジョブは、ステップの集合体と、それが実行される環境の 2 つの部分で構成されます。 ジョブをビルド構成または Orb で定義すると、構成または外部の Orb 構成のジョブ キーの下にあるマップ内でジョブ名を定義できます。

ジョブは config.yml ファイルのワークフロー スタンザで呼び出す必要があります。このとき、必要なパラメーターをサブキーとしてジョブに渡します。

#### Executor

Executor は、ジョブのステップが実行される環境を定義します。 CircleCI 構成でジョブを宣言するとき、ジョブを実行する環境のタイプ (docker、machine、macos など) と共に、その環境について以下のようなパラメーターを定義します。

- 挿入する環境変数
- 使用するシェル
- 使用する resource_class のサイズ

設定ファイル内のジョブの外側で Executor を宣言すると、その宣言をスコープ内のすべてのジョブで使用できるため、1 つの Executor 定義を複数のジョブで再利用できます。

Executor の定義では、以下のキーを使用できます (一部のキーは、ジョブ宣言を使用する際にも使用できます)。

- docker、machine、macos
- environment
- working_directory
- shell
- resource_class

以下に、Executor を使用する簡単な例を示します。

```
version: 2.1
executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.4.0

jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

上記の例では、executor キーの単一の値として、`my-executor` という Executor が渡されています。 代わりに、`my-executor` を executor の下で name キーの値として渡すことも可能です。 この方法は、主に、Executor の呼び出しにパラメーターを渡す場合に使用されます。 その場合の例は以下のとおりです。

```
version: 2.1
jobs:
  my-job:
    executor:
      name: my-executor
    steps:
      - run: echo outside the executor
```

### 名前空間

名前空間は、一連の Orbs を編成するために使用されます。 各名前空間はレジストリ内に一意で変更不可の名前を持ちます。また、名前空間内の各 Orb は一意の名前を持ちます。 たとえば、`circleci/rails` Orb と username/rails という名前の Orb は、別々の名前空間にあるため、レジストリ内で共存できます。

**メモ:** 名前空間は組織に所有されます。

デフォルトでは、組織は名前空間を 1 つだけ要求できるように制限されています。 これは、名前空間の占拠や紛らわしさを制限するためのポリシーです。 複数の名前空間が必要な場合は、CircleCI のアカウント チームにお問い合わせください。

### Orbs でのセマンティック バージョニング

Orbs は、3 つの数字による標準的なセマンティック バージョニング システムを使用してパブリッシュされます。

- メジャー
- マイナー
- パッチ

Orb オーサーは、セマンティック バージョニングに従う必要があります。 config.yml 内では、ワイルドカードでバージョン範囲を指定して Orbs を解決することも可能です。 また、volatile という特殊な文字列を使用して、ビルド実行時点の最大のバージョン番号をプルできます。

たとえば、mynamespace/some-orb@8.2.0 が存在すると、8.2.0 の後に mynamespace/some-orb@8.1.24 や mynamespace/some-orb@8.0.56 がパブリッシュされても、volatile は引き続き mynamespace/some-orb@8.2.0 を最大のセマンティック バージョンとして参照します。

**Note:** CircleCI does not currently support non-numeric semantic versioning elements. We suggest that you use either semver-style version strings in x.y.z format, or a development-style version string in dev:* format.

Examples of orb version declarations and their meaning:

* circleci/python@volatile - ビルドがトリガーされた時点でレジストリにある最大の Python Orb バージョンを使用します。 通常、これは最も最近パブリッシュされ、最も安定性が低い Python Orb です。
* circleci/python@2 - Python Orb バージョン 2.x.y のうち、最新のバージョンを使用します。
* circleci/python@2.4 - Python Orb バージョン 2.4.x のうち、最新のバージョンを使用します。
* circleci/python@3.1.4 - 厳密にバージョン 3.1.4 の Python Orb を使用します。

## Orb のバージョン (開発版と 安定版)

There are two main types of orbs that you can use in your workflows: Development & Production. Depending on your workflow needs, you may choose to use either of these orbs. The sections below describe the differences between these two types of orbs so you can make a more informed decision of how best to utilize these orb types in your workflows.

While all production orbs can be published securely by organization owners, development orbs provide non-owner members of the team with a way to publish orbs. Unlike production orbs, development orbs are also mutable and expire after 90 days, so they are ideal for rapid iteration of an idea.

A development version should be referenced by its complete, fully-qualified name, such as: mynamespace/myorb@dev:mybranch.; whereas production orbs allow wildcard semantic version references. Note that there are no shorthand conveniences for development versions.

Orb versions may be added to the registry either as development versions or production versions. Production versions are always a semantic version like 1.5.3; whereas development versions can be tagged with a string and are always prefixed with dev: for example `dev:myfirstorb`.

**Note:** Dev versions are mutable and expire: their contents can change, and they are subject to deletion after 90 days; therefore, it is strongly recommended you do not rely on a development versions in any production software, and use them only while actively developing your orb. It is possible for org members of a team to publish a semantic version of an orb based off of a dev orb instead of copy-pasting some config from another teammate.

### 開発版および安定版 Orb のセキュリティ プロファイル

- 安定版 Orbs をパブリッシュできるのは、組織オーナーのみです。
- 開発版 Orbs は組織の任意のメンバーが名前空間にパブリッシュできます。
- 組織オーナーは、すべての開発版 Orb をセマンティック バージョンの安定版 Orb にプロモートできます。

### 開発版および安定版 Orb の維持特性と可変特性

Dev orbs are mutable and expire. Anyone can overwrite any development orb who is a member of the organization that owns the namespace in which that orb is published.

Production orbs are immutable and long-lived. Once you publish a production orb at a given semantic version you may not change the content of that orb at that version. To change the content of a production orb you must publish a new version with a unique version number. It is best practice to use the orb publish increment and/or the orb publish promote commands in the circleci CLI when publishing orbs to production.

### 開発版および安定版 Orbs のバージョニング セマンティック

Development orbs are tagged with the format `dev:<< your-string >>`. Production orbs are always published using the semantic versioning (“semver”) scheme.

In development orbs, the string label given by the user has the following restriction:

- 空白文字以外の最大 1,023 文字

Examples of valid development orb tags:

Valid:

```
  "dev:mybranch"
  "dev:2018_09_01"
  "dev:1.2.3-rc1"
  "dev:myinitials/mybranch"
  "dev:myVERYIMPORTANTbranch"
```

Invalid:

```
  "dev: 1" (スペースは使用不可)
  "1.2.3-rc1" (先頭に "dev:" が含まれていない)
```

In production orbs, use the form `X.Y.Z` where `X` is a “major” version, `Y` is a “minor” version, and `Z` is a “patch” version. For example, 2.4.0 implies the major version 2, minor version 4, and the patch version of 0.

While not strictly enforced, it is best practice when versioning your production orbs to use the standard semantic versioning convention for major, minor, and patch:

- メジャー: 互換性がない API の変更を行う場合
- マイナー: 下位互換性を維持しながら機能を追加する場合
- パッチ: 下位互換性を維持しながらバグ修正を行う場合

### Orb 内での Orbs の使用と登録時解決

You may also use an orbs stanza inside an orb.

Because production orb releases are immutable, the system will resolve all orb dependencies at the time you register your orb rather than at the time you run your build.

For example, orb `foo/bar` is published at version 1.2.3 with an orbs stanza that imports `biz/baz@volatile`. At the time you register `foo/bar@1.2.3` the system will resolve `biz/baz@volatile` as the latest version and include its elements directly into the packaged version of `foo/bar@1.2.3`.

If `biz/baz` is updated to 3.0.0, anyone using `foo/bar@1.2.3` will not see the change in ``biz/baz@3.0.0 until `foo/bar` is published at a higher version than 1.2.3.

**Note:** Orb elements may be composed directly with elements of other orbs. For example, you may have an orb that looks like the example below.

```
version: 2.1
orbs:
  some-orb: some-ns/some-orb@volatile
executors:
  my-executor: some-orb/their-executor
commands:
  my-command: some-orb/their-command
jobs:
  my-job: some-orb/their-job
  another-job:
    executor: my-executor
    steps:
      - my-command:
          param1: "hello"
```

### 安定版 Orbs の削除

In general, CircleCI prefers to never delete production orbs that were published as world-readable because it harms the reliability of the orb registry as a source of configuration and the trust of all orb users.

If the case arises where you need to delete an orb for emergency reasons, please contact CircleCI (Note: If you are deleting because of a security concern, you must practice responsible disclosure using the CircleCI Security web page.

## 関連項目
{:.no_toc}

- \[Orb の概要\]({{site.baseurl}}/2.0/orb-intro/): CircleCI Orbs についての基本情報
- \[Orbs リファレンス ガイド\]({{site.baseurl}}/2.0/reusing-config/): コマンド、ジョブ、Executor の説明など、Orb に関する詳細な参考情報
- \[Orbs に関するよくあるご質問\]({{site.baseurl}}/2.0/orb-faq/): Orbs 使用に際してよく発生している問題についての情報
