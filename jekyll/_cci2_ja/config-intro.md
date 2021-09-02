---
layout: classic-docs
title: "設定ファイルの概要"
description: "CircleCI 2.0 設定ファイルのランディング ページ"
version:
  - Cloud
  - Server v2.x
---

このガイドでは、簡単なステップに沿って、CircleCI で作業の中心となる `config.yml` の概要を説明していきます。

* 目次
{:toc}

## CircleCI 設定ファイル入門
CircleCI を設定する
{:.no_toc}

このガイドでは、初めに CircleCI が `config.yml` をどのように見つけて実行するか、さまざまな作業にシェル コマンドをどのように使用できるかを説明します。 次に、`config.yml` がどのようにコードとやり取りしてビルドを開始するかを概説します。 さらに、Docker コンテナを使用して、必要とする環境で正確に実行する方法についても説明します。 最後に、ワークフローについて簡単に説明し、ビルド、テスト、セキュリティ スキャン、承認ステップ、デプロイをオーケストレーションする方法について学びます。

CircleCI は *Configuration as Code* を貫いています。  そのため、ビルドからデプロイまでのデリバリー プロセス全体が `config.yml` という 1 つのファイルを通じてオーケストレーションされます。  `config.yml` ファイルは、プロジェクトの最上部にある `.circleci` というフォルダーに置かれます。  CircleCI の設定ファイルでは YAML 構文を使用します。 基本事項については、「[YAML の記述]({{ site.baseurl }}/ja/2.0/writing-yaml/)」を参照してください。


## パート 1: すべてはシェルから始まる
{: #part-one-hello-its-all-about-the-shell }
それでは、始めましょう。  CircleCI では、必要なあらゆる処理を実行できるオンデマンドのシェルを提供することで、強力なエクスペリエンスを実現しています。  パート 1 では、最初のビルドのセットアップとシェル コマンドの実行が簡単に行えることを説明します。

1. まだ登録がお済みでない場合は、CircleCI にアクセスして登録し、GitHub または Bitbucket を選択してください。 GitHub Marketplace からの登録も可能です。
2. 管理するプロジェクトが追加されていることを確認します。
3. プロジェクトの master ブランチの最上部に `.circleci` フォルダーを追加します。  必要に応じて master 以外のブランチで試してみることも可能です。  フォルダー名は、必ずピリオドで始めてください。  これは .circleci 形式の特別なフォルダーです。
4. .circleci フォルダーに `config.yml` ファイルを追加します。
5. 以下の内容を `config.yml` ファイルに追加します。

{% highlight yaml linenos %}
version: 2.1 jobs: build: docker: - image: alpine:3.7 steps: - checkout - run: name: The First Step command: | echo 'Hello World!' echo 'This is the delivery pipeline'
{% endhighlight %}

設定ファイルをチェックインし、実行を確認します。  ジョブの出力は、CircleCI アプリケーションで確認できます。

### 学習ポイント
{: #learnings }
{:.no_toc}

CircleCI 設定ファイルの構文はとても明快です。  特につまづきやすいポイントと言えば、インデントでしょう。  インデントの設定は必ず統一するように注意してください。  設定ファイルでよくある間違いはこれだけです。  それぞれの行について詳しく見ていきましょう。

- 行 1: 使用している CircleCI プラットフォームのバージョンを示します。 `2.1` が最新のバージョンです。
- 行 2、3: `jobs` レベルには、任意の名前が付いた子のコレクションが含まれます。  `build` は、`jobs` コレクション内の最初の名前付き子です。  この例では、`build` は唯一のジョブでもあります。
- 行 6、7: `steps` コレクションは、`run` ディレクティブの順序付きリストです。  各 `run` ディレクティブは、宣言された順に実行されます。
- 行 8: `name` 属性は、警告、エラー、出力などを返す際に便利な組織的情報を提供します。  `name` は、ビルド プロセス内のアクションとしてわかりやすいものにする必要があります。
- 行 9 ～ 11: ここで特別なコードを使います。  `command` 属性は、行う作業を表すシェル コマンドのリストです。  最初のパイプ `|` は、複数行のシェル コマンドがあることを示します。  行 10 はビルド シェルに「`Hello World!`」を出力し、行 11 は「`This is the delivery pipeline`」を出力します。

## パート 2: ビルドのための情報と準備
{: #part-two-info-and-preparing-to-build }
That was nice but let’s get real.  Delivery graphs start with code.  In this example we will add a few lines that will get your code and then list it.  We will also do this in a second run.

1. まだパート 1 の手順を実行していない場合は、パート 1 を完了して、簡単な `.circleci/config.yml` ファイルをプロジェクトに追加してください。

2. CircleCI では、簡略化されたコマンドが数多く提供されており、これらを使用すると複雑な操作がとても簡単になります。  ここでは、`checkout` コマンドを追加しましょう。  このコマンドは、後続のステップで使用するためのブランチ コードを自動的に取得します。

3. 次に、2 つ目の `run` ステップを追加し、`ls -al` を実行して、すべてのコードが利用可能であることを確認します。


{% highlight yaml linenos %}
image: alpine:3.7 steps: - run: name: Hello World command: | echo 'Hello World!' echo 'This is the delivery pipeline'

      - run:
          name: Code Has Arrived
          command: |
            ls -al
            echo '^^^That should look familiar^^^'
{% endhighlight %}

### 学習ポイント
{: #learnings }
{:.no_toc}
Although we’ve only made two small changes to the config, these represent significant organizational concepts.

- 行 7: `checkout` コマンドは、ジョブにコンテキストを与える、組み込みの予約語の一例です。  この例では、ビルドを開始できるように、このコマンドがコードをプル ダウンします。
- 行 13 ～ 17: `build` ジョブの 2 つ目の run は、チェックアウトの内容を (`ls -al` で) リストします。  これで、ブランチを操作できるようになります。

## パート 3: 処理の追加
{: #part-three-thats-nice-but-i-need }
コード ベースやプロジェクトは 1 つひとつ異なります。  それは問題ではありません。  多様性を認めています。  そうした理由から、CircleCI ではユーザーが好みのマシンや Docker コンテナを使用できるようにしています。  ここでは、ノードを利用可能にしたコンテナで実行する例を示します。  他にも macOS マシン、java コンテナ、GPU を利用するケースが考えられます。

1. このセクションでは、パート 1、2 のコードをさらに発展させます。  前のパートがまだ完了していない場合は、少なくともパート 1 を完了し、ブランチに作業中の `config.yml` ファイルを置いてください。

2. ここで行うのはとてもシンプルですが、驚くほど強力な変更です。  ビルド ジョブに使用する Docker イメージへの参照を追加します。


{% highlight yaml linenos %}
image: alpine:3.7 steps: - run: name: 最初のステップ command: | echo 'Hello World!' echo 'This is the delivery pipeline'

      run:
      name: 独自コンテナでの実行
      command: |
        node -v
{% endhighlight %}

We also added a small `run` block that demonstrates we are running in a node container.

### 学習ポイント
{: #learnings }
{:.no_toc}

設定ファイルに加えた上記の 2 つの変更は、作業をどのように実行するかに大きな影響を与えます。  実行環境をアップグレード、実験、または調整するために特別なコードやアクロバティックな操作は必要なく、Docker コンテナをジョブに関連付けてから、コンテナでジョブを動的に実行するだけです。  小さな変更を行うだけで、Mongo 環境を劇的にアップグレードしたり、基本イメージを拡大・縮小したり、さらには言語を変更することもできます。

- 行 4: yml のインライン コメントです。  どのようなコード単位でも同じですが、設定ファイルが複雑になるほど、コメントの利便性が高くなります。
- 行 5、6: ジョブに使用する Docker イメージを示します。  設定ファイルには複数のジョブを含めることができるため (次のセクションで説明)、設定ファイルの各部分をそれぞれ異なる環境で実行することも可能です。  たとえば、シン Java コンテナでビルド ジョブを実行してから、ブラウザーがプリインストールされたコンテナを使用してテスト ジョブを実行できます。 この例では、ブラウザーや他の便利なツールが既に組み込まれている [CircleCI 提供のビルド済みコンテナ]({{ site.baseurl }}/2.0/circleci-images/)を使用します。
- 行 19 ～ 22: コンテナで使用できるノードのバージョンを返す run ステップを追加します。 CircleCI のビルド済みのコンビニエンス イメージにある別のコンテナや、Docker Hub のパブリック コンテナなどを使用して、いろいろ試してみてください。

## パート 4: 開始の承認
{: #part-four-approved-to-start }
ここまでは問題ありませんね。  少し時間を取って、オーケストレーションについてご説明しましょう。  この例では、1 つずつの変更ではなく、分析に時間をかけます。 CircleCI のワークフロー モデルは、先行ジョブのオーケストレーションに基づいています。  ワークフローの定義に使用される予約語が `requires` であるのはこのためです。  ジョブの開始は、常に、先行するジョブが正常に完了することで定義されます。  たとえば、[A, B, C] のようなジョブ ベクトルは、ジョブ B およびジョブ C がそれぞれ先行するジョブを必要とすることで実装されます。  ジョブ A は直ちに開始されるため、requires ブロックを持ちません。 たとえば、ジョブ A は直ちに開始されますが、B には A が必要であり、C には B が必要です。

以下の例では、ビルドをトリガーするイベントは、`Hello-World` を直ちに開始します。  残りのジョブは待機します。  `Hello-World` が完了すると、`I-Have-Code` と `Run-With-Node` の両方が開始します。  `I-Have-Code` と `Run-With-Node` はいずれも、開始前に `Hello-World` が正常に完了することが求められているためです。  次に、`I-Have-Code` と `Run-With-Node` の両方が完了すると、`Hold-For-Approval` という承認ジョブが利用可能になります。  `Hold-For-Approval` ジョブは、他のジョブとは少し異なります。  このジョブは、ワークフローの続行を許可するための手動操作を示しています。  ユーザーが (CircleCI UI または API から) ジョブを承認するまでワークフローが待機している間、すべての状態は、元のトリガー イベントに基づいて維持されます。  承認ジョブは早めに完了することが推奨されますが、実際には数時間、長いときは数日かかってしまう場合もあります。 手動操作によって `Hold-For-Approval` が完了すると、最後のジョブ `Now-Complete` が実行されます。

ジョブ名はすべて任意です。  このため、複雑なワークフローを作成する必要がある場合にも、他の開発者が `config.yml` のワークフローの内容を理解しやすいよう、単純明快な名前を付けておくことができます。


{% highlight yaml linenos %}
image: alpine:3.7 steps: - checkout - run: name: 最初のステップ command: | echo 'Hello World!' echo 'This is the delivery pipeline' - run: name: コードの取得 command: | ls -al echo '^^^That should look familiar^^^'

workflows: version: 2 Example_Workflow: jobs:

     - Hello-World
     - I-Have-Code:
         requires:
    
           - Hello-World
     - Run-With-Node:
         requires:
    
           - Hello-World
     - Hold-For-Approval:
         type: approval
         requires:
    
           - Run-With-Node
           - I-Have-Code
     - Now-Complete:
         requires:
    
           - Hold-For-Approval

{% endhighlight %}

### 学習ポイント
{: #learnings }
{:.no_toc}

これで、手動ゲートを含むワークフローを作成して手間のかかる部分を管理する方法を理解できました。

- 行 3: `Hello World!` を出力するコマンドが、「Hello-World」という名前の 1 つの完全なジョブになっています。
- 行 12: コードを取得するコマンドは、`I-Have-Code` というジョブになっています。
- 行 22: CircleCI のビルド済みイメージを使用するノードの例は、`Run-With-Node` と名付けられています。
- 行 30: ここに追加されているジョブの動作内容は `Hello-World` と同じですが、ワークフロー スタンザの行 57 で指定されているとおり、承認が完了するまで実行されません。
- 行 39 ～ 57: 設定ファイルにワークフローが追加されています。  ここまでの例で CircleCI エンジンは、設定ファイルには単一ジョブのワークフローが含まれているものとして解釈していました。  ここでは、明確さを維持するために、実行するワークフローを記述しています。 このワークフローには、いくつかの便利な機能が使用されています。 `requires` ステートメントは、そのジョブが開始する前に正常に完了していなければならない先行ジョブのリストを示します。  この例では、`Hold-For-Approval` がアクティブになるには、その前に `I-Have-Code` と `Run-With-Node` の両方が完了する必要があります。  また、`I-Have-Code` と `Run-With-Node` はどちらも `Hello-World` に依存していますが、相互には依存していません。 つまり、この 2 つのジョブは、`Hello-World` が完了するとすぐに、並列して実行されます。  直接相互依存していない複数のジョブがあり、実時間を短縮したい場合に、便利な機能です。
- 行 50、51: ほとんどのジョブは汎用です。  しかし、このジョブにはタイプがあります。  この場合、タイプは `approval` で、ユーザーが CircleCI API または UI からビルドを完了させるためのアクションを行うことを要求します。 承認ジョブを間に挟むことで、ダウンストリーム ジョブの実行に先立って承認または管理する必要があるゲートを作成できます。


上記の例は、CircleCI 設定ファイルから利用できるいくつかの機能について、初心者向けのガイドを提供することを目的としたものです。  この他にも多くの機能が提供されています。  ドキュメントの他のページを参照してください。  スケジュールされたジョブ、ワークスペース、アーティファクトなどにはすべて、このページで説明した概念が応用されていることがおわかりいただけると思います。  さらに理解を深めて、CI/CD の自動化を進めていきましょう。

## 関連項目
{: #see-also }
{:.no_toc}

[Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/)
