---
layout: classic-docs
title: "設定の概要"
description: "CircleCI 2.0 コンフィグのランディングページ"
---

このガイドでは、簡単なステップに沿って、CircleCI で作業の中心となる `config.yml` の概要を説明していきます。

- 目次
{:toc}

## CircleCI コンフィグ入門
{:.no_toc}

このガイドでは、CircleCI が `config.yml` をどのように見つけて実行するか、さまざまな作業にシェルコマンドをどのように使用できるかを説明します。次に、`config.yml` がどのようにコードとやり取りしてビルドを開始するかを概説します。さらに、Docker コンテナを使用して、必要とする環境で正確に実行する方法についても説明します。 最後に、ワークフローについて簡単に説明し、ビルド、テスト、セキュリティスキャン、承認ステップ、デプロイをオーケストレーションする方法について学びます。

CircleCI は *Configuration as Code* を貫いています。 そのため、ビルドからデプロイまでのデリバリープロセス全体が `config.yml` という 1つのファイルを通じてオーケストレーションされます。 `config.yml` ファイルは、プロジェクトの最上部にある `.circleci` というフォルダーに置かれます。 CircleCI のコンフィグでは YAML 構文を使用します。基本事項については、「[YAML の記述]({{ site.baseurl }}/ja/2.0/writing-yaml/)」を参照してください。

## パート 1：すべてはシェルから始まる

それでは、始めましょう。 CircleCI では、必要なあらゆる処理を実行できるオンデマンドのシェルを提供することで、強力なエクスペリエンスを実現しています。 パート 1 では、最初のビルドのセットアップとシェルコマンドの実行がどれほど簡単に行えるかを説明します。

1. まだ登録がお済みでない場合は、CircleCI にアクセスして登録し、GitHub または Bitbucket を選択してください。 GitHub Marketplace からの登録も可能です。
2. 管理するプロジェクトが追加されていることを確認します。
3. プロジェクトの master ブランチの最上部に `.circleci` フォルダーを追加します。 必要に応じて master 以外のブランチで試してみることも可能です。 フォルダー名は、必ずピリオドで始めてください。 これは .circleci 形式の特別なフォルダーです。
4. .circleci フォルダーに `config.yml` ファイルを追加します。
5. 以下の内容を `config.yml` ファイルに追加します。

{% highlight yaml linenos %} version: 2.1 jobs: build: docker:

      - image: alpine:3.7
    steps:
      - run:
          name: The First Step
          command: |
            echo 'Hello World!'
            echo 'This is the delivery pipeline'
{% endhighlight %}

Check-in the config and see it run. You can see the output of the job in the CircleCI app.

### 学習ポイント
{:.no_toc}

The CircleCI config syntax is very straight forward. The trickiest part is typically indentation. Make sure your indentation is consistent. This is the single most common error in config. Let’s go over the nine lines in details

- 行 1：使用している CircleCI プラットフォームのバージョンを示します。 `2.1` is the most recent version.
- 行 2、3：`jobs` レベルには、任意の名前が付いた子のコレクションが含まれます。 `build` は、`jobs` コレクション内の最初の名前付き子です。 この例では、`build` は唯一のジョブでもあります。
- 行 6、7：`steps` コレクションは、`run` ディレクティブの順序付きリストです。 各 `run` ディレクティブは、宣言された順に実行されます。
- 行 8：`name` 属性は、警告、エラー、出力などを返す際に便利な組織的情報を提供します。 `name` は、ビルドプロセス内のアクションとしてわかりやすいものにする必要があります。
- 行 9 ～ 11：ここで呪文を使います。 `command` 属性は、行う作業を表すシェルコマンドのリストです。 最初のパイプ `|` は、複数行のシェル コマンドがあることを示します。 行 10 はビルドシェルに「`Hello World!`」を出力し、行 11 は「`This is the delivery pipeline`」を出力します。

## パート 2：ビルドのための情報と準備

That was nice but let’s get real. Delivery graphs start with code. In this example we will add a few lines that will get your code and then list it. We will also do this in a second run.

1. まだパート 1 の手順を実行していない場合は、パート 1 を完了して、簡単な `.circleci/config.yml` ファイルをプロジェクトに追加してください。

2. CircleCI では、簡略化されたコマンドが数多く提供されており、これらを使用すると複雑な操作がとても簡単になります。 ここでは、`checkout` コマンドを追加しましょう。 このコマンドは、後続のステップで使用するためのブランチコードを自動的に取得します。

3. 次に、2つ目の `run` ステップを追加し、`ls -al` を実行して、すべてのコードが利用可能であることを確認します。

{% highlight yaml linenos %} version: 2.1 jobs: build: docker:

      - image: alpine:3.7
    steps:
      - checkout
      - run:
          name: The First Step
          command: |
            echo 'Hello World!'
            echo 'This is the delivery pipeline'
      - run:
          name: Code Has Arrived
          command: |
            ls -al
            echo '^^^That should look familiar^^^'
{% endhighlight %}

### 学習ポイント

{:.no_toc} Although we’ve only made two small changes to the config, these represent significant organizational concepts.

- 行 7：`checkout` コマンドは、ジョブにコンテキストを与える、組み込みの予約語の一例です。 この例では、ビルドを開始できるように、このコマンドがコードをプルダウンします。
- 行 13 ～ 17：`build` ジョブの 2つ目の run は、チェックアウトの内容を (`ls -al` で) リストします。 これで、ブランチを操作できるようになります。

## パート 3：処理の追加

Every code base and project is different. That’s okay. We like diversity. This is one of the reasons we allow you to run in your machine or docker container of choice. In this case we will demonstrate running in a container with node available. Other examples might include macOS machines, java containers, or even GPU.

1. このセクションでは、パート 1、2 のコードをさらに発展させます。 前のパートがまだ完了していない場合は、少なくともパート 1 を完了し、ブランチに `config.yml` 作業ファイルを置いてください。

2. ここで行うのは、とてもシンプルですが、驚くほど強力な変更です。 ビルドジョブに使用する Docker イメージへの参照を追加します。

{% highlight yaml linenos %} version: 2.1 jobs: build: # pre-built images: https://circleci.com/docs/2.0/circleci-images/ docker:

      - image: circleci/node:10-browsers
    steps:
      - checkout
      - run:
          name: The First Step
          command: |
            echo 'Hello World!'
            echo 'This is the delivery pipeline'
      - run:
          name: Code Has Arrived
          command: |
            ls -al
            echo '^^^That should look familiar^^^'
      - run:
          name: Running in a Unique Container
          command: |
            node -v
{% endhighlight %}

We also added a small `run` block that demonstrates we are running in a node container.

### 学習ポイント
{:.no_toc}
The above two changes to the config significantly affect how you get work done. By associating a docker container to a job and then dynamically running the job in the container, you don’t need to perform special magic or operational gymnastics to upgrade, experiment or tune the environment you run in. With a small change you can dramatically upgrade a mongo environment, grow or shrink the base image, or even change languages.

- 行 4：yml のインラインコメントです。 どのようなコード単位でも同じですが、コンフィグが複雑になるほど、コメントは便利なツールになります。
- 行 5、6：ジョブに使用する Docker イメージを示します。 コンフィグには複数のジョブを含めることができるため (次のセクションで説明)、コンフィグの各部分をそれぞれ異なる環境で実行することも可能です。 たとえば、シン Java コンテナでビルドジョブを実行してから、ブラウザーがプリインストールされたコンテナを使用してテストジョブを実行できます。 この例では、ブラウザーや他の便利なツールが既に組み込まれている [CircleCI 提供のビルド済みコンテナ]({{ site.baseurl }}/ja/2.0/circleci-images/)を使用します。 
- 行 19 ～ 22：コンテナで使用できるノードのバージョンを返す run ステップを追加します。 CircleCI のビルド済みのコンビニエンスイメージにある別のコンテナや、Docker Hub のパブリックコンテナなどを使用して、いろいろ試してみてください。

## パート 4：開始の承認

So far so good? Let’s spend a moment on orchestration. In this example, we will spend more time doing analysis than step-by-step modification. The CircleCI workflow model is based on the orchestration of predecessor jobs. This is why the reserved word used for workflow definition is `requires`. Jobs initiation is always defined in terms of the successful completion of prior jobs. For example, a job vector such as [A, B, C] would be implemented with jobs B and C each requiring the job prior. Job A would not have a requires block because it starts immediately. For example, job A starts immediately; B requires A; C requires B.

In the example below, an event triggering a build will cause `Hello-World` to start immediately. The remainder of the jobs will wait. When `Hello-World` completes, both `I-Have-Code` and `Run-With-Node` will start. That is because both `I-Have-Code` and `Run-With-Node` require `Hello-World` to complete successfully before they can start. Next, the approval job called `Hold-For-Approval` will become available when both `I-Have-Code` and `Run-With-Node` complete. The `Hold-For-Approval` job is slightly different from the others. It represents a manual intervention to allow the workflow to continue. While the workflow is waiting for a user (through the CircleCI UI or API) to approve the job, all state is preserved based on the original triggering event. CircleCI understands that Approval jobs may take hours or even days before completing - although we suggest hours over days. Once `Hold-For-Approval` completes through a manual intervention, the final job `Now-Complete` will run.

All of the job names are arbitrary. This allows you to create workflows as complex as you need while staying meaningful and clear to the next developer that reads the `config.yml`.

{% highlight yaml linenos %} version: 2.1 jobs: Hello-World: docker:

      - image: alpine:3.7
    steps:
      - run:
          name: Hello World
          command: |
            echo 'Hello World!'
            echo 'This is the delivery pipeline'
    

I-Have-Code: docker: - image: alpine:3.7 steps: - checkout - run: name: Code Has Arrived command: | ls -al echo '^^^That should look familiar^^^' Run-With-Node: docker: - image: circleci/node:10-browsers steps: - run: name: Running In A Container With Node command: | node -v Now-Complete: docker: - image: alpine:3.7 steps: - run: name: Approval Complete command: | echo 'Do work once the approval has completed'

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
{:.no_toc}

We now know how to create a workflow including a manual gate that you can use to protect promotion of expensive interactions.

- 行 3：`Hello World!` を出力するコマンドが、「Hello-World」という名前の 1つの完全なジョブになっています。
- 行 12：コードを取得するコマンドは、`I-Have-Code` というジョブになっています。
- 行 22：CircleCI のビルド済みイメージを使用するノードの例は、`Run-With-Node` と名付けられています。
- 行 30：ここに追加されているジョブの動作内容は `Hello-World` と同じですが、ワークフロースタンザの行 57 で指定されているとおり、承認が完了するまで実行されません。
- 行 39 ～ 57：コンフィグにワークフローが追加されています。 ここまでの例で CircleCI エンジンは、コンフィグには単一ジョブのワークフローが含まれているものとして解釈していました。 ここでは、明確さを維持するために、実行するワークフローを記述しています。 このワークフローには、いくつかの便利な機能が使用されています。 `requires` ステートメントは、そのジョブが開始する前に正常に完了していなければならない先行ジョブのリストを示します。 この例では、`Hold-For-Approval` がアクティブになるには、その前に `I-Have-Code` と `Run-With-Node` の両方が完了する必要があります。 また、`I-Have-Code` と `Run-With-Node` はどちらも `Hello-World` に依存していますが、相互には依存していません。 つまり、この 2つのジョブは、`Hello-World` が完了するとすぐに、並列して実行されます。 直接相互依存していない複数のジョブがあり、実時間を短縮したい場合に、便利な機能です。
- 行 50、51：ほとんどのジョブは汎用です。 しかし、このジョブにはタイプがあります。 この場合、タイプは `approval` で、ユーザーが CircleCI API または UI からビルドを完了させるためのアクションを行うことを要求します。 承認ジョブを間に挟むことで、ダウンストリームジョブの実行に先立って承認または管理する必要があるゲートを作成できます。

The examples above were designed to provide a quick starter to the areas of functionality available through CircleCI config. There remains a lot more. Take a look at the rest of the documentation. You will find that scheduled jobs, workspaces, artifacts, and more are all simple variations on the concepts you’ve learned here. Now go forth and automate your CI/CD world!

## 関連項目
{:.no_toc}

[Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/)