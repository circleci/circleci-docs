---
layout: classic-docs
title: "Orb のオーサリング プロセス"
short-title: "Orb のオーサリング"
description: "CircleCI Orbs のオーサリングに関する入門ガイド"
categories:
  - getting-started
order: 1
---

## はじめに

CircleCI Orb を使用するようにプラットフォームを構成したら、独自の Orb のオーサリングを開始できます。 CircleCI では、ユーザーの皆様が混乱することなく新しい Orb をすばやく作成できるよう、インライン テンプレートなどの事前構成済みテンプレートを提供することで、シンプルで簡単なオーサリング プロセスの実現を目指しています。 以下の各セクションでは、独自の Orb をオーサリングするプロセスを説明します。

## Orb クイックスタート

最初の Orb 作成を開始する前に、以下の注意事項をお読みください。

* Orb は名前空間に存在します。
* 各組織またはユーザー名は、一意の名前空間を 1 つ要求できます。
* 名前空間は CircleCI Orb レジストリ内でグローバルであるため、必ず一意の名前にしてください。
* 特定の GitHub または Bitbucket 組織内で、オーナーまたは管理者の権限を持つユーザーだけが、その組織にリンクされる名前空間を作成できます。
* 組織管理者が Orb を作成すると、その組織のメンバーはだれでも `dev` Orb としてパブリッシュできます。 準備が整ったら、組織管理者はその `dev` Orb を安定版 Orb にプロモートできます。
* 組織管理者によって生成された [API トークン]({{ site.baseurl }}/2.0/managing-api-tokens)をプロジェクト環境変数またはコンテキスト リソースとして保存すると、Orb パブリッシュ プロセスを自動化でき、_任意_の組織メンバーが CircleCI ジョブで [CircleCI CLI]({{ site.baseurl }}/2.0/local-cli/) を使用して安定版 Orb を公開することが可能になります。
* 作成した Orb を使用するには、組織の CircleCI 組織設定ページの [Security (セキュリティ)] セクション (`https://circleci.com/[vcs]/organizations/[org-name]/settings#security`) で、[Allow Uncertified Orbs (未承認 Orbs の使用を許可)] を有効にする必要があります。
* Orb 作成中は、作成中の Orb の準備が整う前に CircleCI Orb レジストリに公開される、または永続的に掲載されてしまう事態を回避するために、開発バージョンを使用することができます。

最初の Orbs をパブリッシュする手順を以下に簡単に説明します。

1) 名前空間を要求します (まだ持っていない場合)。 以下に例を示します。

`circleci namespace create sandbox github CircleCI-Public`

上記の例では、GitHub 組織 `CircleCI-Public` にリンクされる名前空間 `sandbox` を作成しています。

**メモ: **CircleCI CLI を通して名前空間を作成する場合は、VCS プロバイダーを指定してください。

2) 名前空間内に Orb を作成します。 以下に例を示します。

`circleci orb create sandbox/hello-world`

3) ファイルに Orb のコンテンツを作成します。 通常、これは、Orb 用に作成された Git リポジトリでコード エディタを使用して行います。ただしここでは例として、以下のような最小限の Orb で `/tmp/orb.yml` ファイルを作成することにします。

`echo '{version: "2.1", description: "a sample orb"}' > /tmp/orb.yml`

4) CLI を使用して、このコードが有効な Orb であることをバリデーションします。 たとえば、上記のパスの場合は以下のようになります。

`circleci orb validate /tmp/orb.yml`

5) 開発版の Orb をパブリッシュします。 上記の Orb の場合は以下のようになります。

`circleci orb publish /tmp/orb.yml sandbox/hello-world@dev:first`

6) Orb を本番にプッシュする準備が整ったら、`circleci orb publish` を使用して手動でパブリッシュするか、開発バージョンから直接プロモートすることができます。 この Orb をパブリッシュする場合、新しい開発バージョンが 0.0.1 になるようにインクリメントするには、以下のコマンドを使用します。

`circleci orb publish promote sandbox/hello-world@dev:first patch`

7) 安定版の Orb が変更不可形式でパブリッシュされました。これをビルドで安全に使用できます。 以下のコマンドを使用して、Orb のソースをプルすることができます。

`circleci orb source sandbox/hello-world@0.0.1`

## Orbs の設計

独自の Orbs を設計する際は、以下の要件を満たしてください。

* Orbs は常に `description` を使用する - ジョブ、コマンド、Executors、およびパラメーターの `description` キーで、使用方法、前提、および技術を説明してください。
* コマンドを Executors に合わせる - コマンドを提供する場合は、それらを実行する Executors を 1 つ以上提供します。
* Orb には簡潔な名前を使用する - コマンドやジョブの使用は常に Orb のコンテキストに依存するため、ほとんどの場合 "run-tests" のような一般的な名前を使用できます。
* 必須パラメーターと オプション パラメーター - 可能な限り、パラメーターに安全なデフォルト値を指定してください。
* ジョブのみの Orbs を使用しない - ジョブのみの Orbs は柔軟性に欠けます。 そうした Orbs が適切な場合もありますが、独自のジョブでコマンドを使用できないとユーザーの不満につながる可能性があります。 ジョブを起動する前後のステップはユーザーにとって 1 つの回避策になります。
* `steps` パラメーターは強力 - ユーザーから提供されるステップをラップすることで、キャッシュ戦略やさらに複雑なタスクなどをカプセル化および容易化することができ、ユーザーに大きな価値をもたらします。

Orbs 内のコマンド、Executors、パラメーターの詳細と例については、「[Orbs リファレンス ガイド]({{ site.baseurl }}/2.0/reusing-config/)」を参照してください。

独自の Orb を開発するときは、インライン Orb を作成すると便利です。 次のセクションでは、独自のインライン Orb の記述方法について説明します。

### インライン Orbs の作成

インライン Orbs は、Orb の開発中に手軽に使用できます。特に、後から他のユーザーと Orb を共有する場合に、長い設定ファイル内のジョブやコマンドの名前空間を作成するために便利です。

インライン Orbs を記述するには、設定ファイル内の `orbs` 宣言にその Orb のキーを置き、その下に Orb エレメントを置きます。 たとえば、1 つの Orb をインポートしたうえで、別の Orb をインラインでオーサリングする場合、Orb は以下のようになります。

{% raw %}
```yaml
version: 2.1
description: # この Orb の目的

orbs:
  my-orb:
    orbs:
      codecov: circleci/codecov-clojure@0.0.4
    executors:
      specialthingsexecutor:
        docker:
          - image: circleci/ruby:1.4.2
    commands:
      dospecialthings:
        steps:
          - run: echo "We will now do special things"
    jobs:
      myjob:
        executor: specialthingsexecutor
        steps:
          - dospecialthings
          - codecov/upload:
              path: ~/tmp/results.xml

workflows:
  main:
    jobs:
      - my-orb/myjob
```
{% endraw %}

上記の例では、`my-orb` の中身はマップなので、`my-orb` の内容はインライン Orb として解決されます。一方、`codecov` の中身はスカラー値なので、これは Orb URI と見なされます。

### インライン テンプレートの例

Orb をオーサリングする場合、このサンプル テンプレートを使用すると、必要なすべてのコンポーネントを持つ新しい Orb をすばやく簡単に作成できます。 この例には、Orbs の 3 つのトップレベル コンセプトが含まれています。 どのような Orb もインライン Orb 定義で表現できますが、一般的には 1 つのインライン Orb を繰り返し使用し、`circleci config process .circleci/config.yml` によって Orb の使用方法が目的に合うかをチェックすると簡単です。

{% raw %}
```yaml
version: 2.1
description: これはインライン ジョブです

orbs:
  inline_example:
    jobs:
      my_inline_job:
        parameters:
          greeting_name:
            description: #わかりやすい説明
            type: string
            default: olleh
        executor: my_inline_executor
        steps:
          - my_inline_command:
              greeting_name: <<parameters.greeting_name>>
    commands:
      my_inline_command:
        parameters:
          greeting_name:
            type: string
        steps:
          - run: echo "hello <<parameters.greeting_name>>, from the inline command"
    executors:
      my_inline_executor:
        parameters:
          version:
            type: string
            default: "2.4"
        docker:
          - image: circleci/ruby:<<parameters.version>>

workflows:
  build-test-deploy:
    jobs:
      - inline_example/my_inline_job:
          name: mybuild # 各 Orb ジョブに名前を付けることをお勧めします
      - inline_example/my_inline_job:
          name: mybuild2
          greeting_name: world
```
{% endraw %}

## Orbs の使用例

_`examples` スタンザは、バージョン 2.1 以上の構成で使用可能です。_

Orb のオーサーとして、CircleCI の設定ファイルで Orb を使用する例をドキュメント化できます。これにより、新しいユーザーに入門ガイドを提供できるだけでなく、より複雑なユースケースの具体例を示すことができます。

Orb のオーサリングを完了し、パブリッシュすると、その Orb は [CircleCI Orb レジストリ](https://circleci.com/orbs/registry/)にパブリッシュされます。 以下のように、新しく作成された Orb が Orb レジストリに表示されます。

![Orbs レジストリの画像]({{ site.baseurl }}/assets/img/docs/orbs-registry.png)

### シンプルな例
以下は、使用可能な Orb の例です。

{% raw %}
```yaml
version: 2.1
description: A foo orb

commands:
  hello:
    description: ユーザーに丁寧にあいさつします
    parameters:
      username:
        type: string
        description: あいさつするユーザーの名前
    steps:
      - run: "echo Hello << parameters.username >>"
```
{% endraw %}

必要に応じて、以下に示す例のように、この Orb に `examples` スタンザを追加することができます。

{% raw %}
```yaml
version: 2.1

examples:
  simple_greeting:
    description: Anna という名前のユーザーにあいさつします
    usage:
      version: 2.1
      orbs:
        foo: bar/foo@1.2.3
      jobs:
        build:
          machine: true
          steps:
            - foo/hello:
                username: "Anna"
```
{% endraw %}

`examples` は、`simple_greeting` と同じレベルに複数のキーを持つことができ、複数の例を追加できることに注意してください。

### 期待される使用結果

オプションの `result` キーを使用して、上記の使用例を補完することができます。このキーは、これらのパラメーターで Orb を拡張した後の構成がどのようになるかを示します。

{% raw %}
```yaml
version: 2.1

examples:
  simple_greeting:
    description: Anna という名前のユーザーにあいさつします
    usage:
      version: 2.1
      orbs:
        foo: bar/foo@1.2.3
      jobs:
        build:
          machine: true
          steps:
            - foo/hello:
                username: "Anna"
    result:
      version: 2.1
      jobs:
        build:
          machine: true
          steps:
          - run:
              command: echo Hello Anna
      workflows:
        version: 2
        workflow:
          jobs:
          - build
```
{% endraw %}

### 使用例の構文
トップレベルの `examples` キーはオプションです。 その下にネストされた使用例マップは、以下のキーを持つことができます。

- **description:** 例の目的をユーザーにわかりやすく説明する文字列 (オプション)
- **usage:** Orb の使用例を含む有効な設定ファイルのマップ全体 (必須)
- **result:** 指定されたパラメーターで Orb を拡張した結果を具体的に示す有効な設定ファイルのマップ全体 (オプション)

## 次のステップ
{:.no_toc}

- 次に行うべき手順については、「[Orb のオーサリング – Orb のバリデーションとパブリッシュ]({{site.baseurl}}/2.0/orb-author-validate-publish/)」を参照してください。
