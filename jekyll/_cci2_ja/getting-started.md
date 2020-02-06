---
layout: classic-docs
title: "はじめに"
short-title: "はじめに"
description: "CircleCI で成功 (グリーン) ビルドを行うためのチュートリアル"
categories: [getting-started]
order: 41
---

このドキュメントでは、CircleCI 2.0 で成功 (グリーン) ビルドを行うための詳しい手順を説明します。

* 目次
{:toc}

## ビルドにあたっての前提条件
{:.no_toc}

* Git および既存の GitHub.com アカウント、またはアカウントの作成についての基本的な知識。 この手順では新しい GitHub リポジトリを使用しますが、CircleCI では Bitbucket の使用もサポートしています。
* ターミナルや `bash` についての基本的な知識。またコマンドラインの使用経験があれば役に立ちます。

## リポジトリの作成
1. GitHub.com で自分のアカウントに移動します。
  * **[Repositories]** タブに移動し **[New]** を選択するか、<https://github.com/new> に直接移動します。 ![]({{ site.baseurl }}/assets/img/docs/GH_Repo-New-Banner.png)

2. [Initialize this repository with a README] にチェックを入れて、[Create repository] ボタンをクリックします。![]({{ site.baseurl }}/assets/img/docs/create-repo-circle-101-initialise-readme.png)

## .yml ファイルの追加

CircleCI は、テスト環境の構築方法や実行するテスト内容の定義に [YAML](https://en.wikipedia.org/wiki/YAML) ファイルを使います。
CircleCI 2.0 では、`config.yml` というファイル名で、隠しフォルダである `.circleci` ディレクトリ配下に作成しておく必要があります。macOS、Linux、Windows においては、ピリオドから始まるファイルやフォルダは、デフォルトで隠し属性のある*システム*ファイルとして扱われますので、ご注意ください。

1. GitHub でファイルやフォルダを作成するには、リポジトリページの **[Create new file]** ボタンをクリックし、`.circleci/config.yml` と入力します。 空の `config.yml` ファイルが `.circleci` フォルダ内に作成されます。

2. 単純な `config.yml` から始めたいときは、下記の内容を GitHub の編集画面にコピーしてください。

```yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4.1
    steps:
      - checkout
      - run: echo "A first hello"
```

3. コメントを入力してから、[Commit New File] ボタンをクリックしてファイルをコミットします。![]({{ site.baseurl }}/assets/img/docs/commit-new-file.png)

`- image: circleci/ruby:2.4.1` という部分は、プロジェクトをビルドする際にどの Docker イメージを使うか指定しているものです。 CircleCI は、イメージを使用して「コンテナ」を立ち上げます。コンテナとは、プロジェクトの実行に必要な言語、システムユーティリティ、依存関係、Web ブラウザー、ツールなどがインストールされる仮想コンピューティング環境です。

## CircleCI 上でのビルドの準備

1. この手順を実行するには、CircleCI アカウントが必要です。 CircleCI の[ユーザー登録ページ](https://circleci.jp/signup)を開き、[GitHub でログイン] をクリックします。 ビルドを実行するには、GitHub アカウントに CircleCI へのアクセスを許可する必要があります。 CircleCI アカウントを既に持っている場合は、[ダッシュボード](https://circleci.com/dashboard)にアクセスします。

2. 次に、CricleCI で既に構築され、自分がアクセス可能なプロジェクトを*フォローする*かどうかのオプションが表示されます (これは通常、会社や組織の GitHub アカウントを使用している開発者に表示されます)。 次の画面では、作成したリポジトリを、新しいプロジェクトとして CircleCI に追加できます。

3. 自分の新しいリポジトリを追加するには、左上のドロップダウンで自分の GitHub アカウントが選択されていることを確認してから、作成したリポジトリを下で見つけ、横にある **[Set Up Project]** ボタンをクリックします。 ![]({{ site.baseurl }}/assets/img/docs/CircleCI-add-new-project-list.png)

4. さらに次の画面ではプロジェクトに関する設定が可能です。 この時点では設定はそのままでもかまいません。右下にある **[Start building]** ボタンをクリックしてください。 ![]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png) ![]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-start-building.png)

## CircleCI での初めてのビルド

ビルドが開始され、自動的に正しく実行されるはずです。 実行結果を確認します。 CircleCI ダッシュボードに表示される緑色の [SUCCESS] ボタンをクリックすると、実行の次の部分を調べることができます。

1. **環境のスピンアップ :** CircleCI は、`circleci/ruby:2.4.1` Docker イメージを使用して、仮想コンピューティング環境をローンチしました。

2. **チェックアウトコード :** CircleCI は、GitHub リポジトリをチェックアウトし、手順 1 でローンチされた仮想環境に「クローン」しました。

3. **echo :** これは、`config.yml` に含まれる唯一の他の命令です。CircleCI は echo コマンドを実行し、「A first hello」という入力を与えました ([echo](https://linux.die.net/man/1/echo) コマンドは、入力された文字列をそのまま出力します)。

今のところはリポジトリにソースコードが含まれておらず、`config.yml` 内にもテストに関わる設定が含まれていませんが、CircleCI はビルドに「成功」したものとして扱います ([exit コード](https://en.wikipedia.org/wiki/Exit_status)としては 0 を返しているため)。 ほとんどのプロジェクトは、これよりはるかに複雑で、多くの場合は複数の Docker イメージと複数のステップが存在し、多くのテストも含まれます。 `config.yml` ファイルに記述できる全てのステップの詳細については、[CircleCI の設定方法](https://circleci.com/docs/ja/2.0/configuration-reference)を参照してください。

### ビルドを意図的に失敗させる
{:.no_toc}

単純化のため、GitHub エディターで `config.yml` ファイルを編集し、`echo "A first hello"` を `notacommand` に置き換えます。 GitHub エディターの **[Commit change]** ボタンをクリックします。 CircleCI の {% comment %} TODO: Jobs {% endcomment %}Builds ページに戻ると、新しいビルドがトリガーされています。 このビルドは失敗し、赤色の [FAILED] ボタンが表示され、失敗を通知するためのメールが送信されます。


### Workflows 機能の使用
{:.no_toc}

1. Workflows の動作を見るには、`.circleci/config.yml` ファイルを編集します。 ブラウザーのウィンドウでファイルを編集モードにしてから、ファイル内で `build` とそれ以後のテキストを選択し、コピー＆ペーストし、そのセクションを複製します。 コードブロックは次のようになります。

```yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4.1
    steps:
      - checkout
      - run: echo "A first hello"
  build:
    docker:
      - image: circleci/ruby:2.4.1
    steps:
      - checkout
      - run: echo "A first hello"      
```

1. 次に、2 つのジョブを別々の名前に変更します。 この例では、`one` と `two` という名前にします。 echo コマンドの部分も別のものに変更します。 {% comment %} TODO: Job {% endcomment %}ビルドの実行に必要な時間をあえて長くするため、システムの `sleep` コマンドを追加します。

2. `config.yml` ファイルに `workflows` セクションを追加します。 workflows セクションは、ファイルのどこにでも配置できます。 通常は、ファイルの先頭または末尾に配置します。


```yml
version: 2
jobs:
  one:
    docker:
      - image: circleci/ruby:2.4.1
    steps:
      - checkout
      - run: echo "A first hello"
      - run: sleep 25
  two:
    docker:
      - image: circleci/ruby:2.4.1
    steps:
      - checkout
      - run: echo "A more familiar hi"
      - run: sleep 15
workflows:
  version: 2
  one_and_two:
    jobs:
      - one
      - two
```

4. これらの変更をリポジトリにコミットしてから、CircleCI のダッシュボードに戻ります。![]({{ site.baseurl }}/assets/img/docs/workflows-circle-101-running.png)

5. Workflow のリンクをクリックすると、2 つのジョブが並列実行されていることを確認できます。![]({{ site.baseurl }}/assets/img/docs/inside-workflows-circle-101-running.png)

Workflows の詳細については「[Workflows の制御](https://circleci.com/docs/ja/2.0/workflows/#overview)」ドキュメントを参照してください。

### Workspaces 機能を使ってみる
{:.no_toc}

各 Workflow には Workspace が割り当てられています。Workspace は、Workflow の進行につれてダウンストリームのジョブにファイルを転送するために使用されます。 Workspaces を使用して、その実行に固有のダウンストリームのジョブで必要となるデータを渡すことができます。 `config.yml` を次のように書き換えてみてください。

```yml
version: 2
jobs:
  one:
    docker:
      - image: circleci/ruby:2.4.1
    steps:
      - checkout
      - run: echo "A first hello"
      - run: mkdir -p my_workspace
      - run: echo "Trying out workspaces" > my_workspace/echo-output
      - persist_to_workspace:
          # 絶対パス、または working_directory からの相対パスにする必要があります
          root: my_workspace
          # root からの相対パスにする必要があります
          paths:
            - echo-output      
  two:
    docker:
      - image: circleci/ruby:2.4.1
    steps:
      - checkout
      - run: echo "A more familiar hi"  
      - attach_workspace:
          # 絶対パス、または working_directory からの相対パスにする必要があります
          at: my_workspace

      - run: |
          if [[ $(cat my_workspace/echo-output) == "Trying out workspaces" ]]; then
            echo "It worked!";
          else
            echo "Nope!"; exit 1
          fi
workflows:
  version: 2
  one_and_two:
    jobs:
      - one
      - two:
          requires:
            - one
```

Workspaces の詳細については、[こちら](https://circleci.com/docs/ja/2.0/workflows/#using-workspaces-to-share-data-among-jobs)を参照してください。

### SSH での{% comment %} TODO: Job {% endcomment %}ビルドへの接続
{:.no_toc}

![]({{ site.baseurl }}/assets/img/docs/SSH-screen.png)

ターミナルの操作に慣れている場合、SSH enabled オプションで{% comment %} TODO: Job {% endcomment %}ビルドを再実行することで、CircleCI のジョブに SSH で直接接続してビルドのトラブルシューティングを行えます。

*この場合、GitHub アカウントに SSH キーを追加する必要があることに注意してください。詳細については下記のリンクを参照してください。
<https://help.github.com/articles/connecting-to-github-with-ssh/>*


{:.tab.switcher.Cloud}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)


ビルドの SSH の有効化セクションから、`ssh` の接続先をコピーします。 ターミナルを開き、`ssh` の接続先を貼り付けます。

以下のコマンドのいくつかを使用すると、Workspaces を使用して作成したファイルの内容を検索し、表示できます。

```
pwd     # print what directory の略で、現在のディレクトリがファイルシステムのどこなのかを確認できます
ls -al   # list の略で、現在のディレクトリに存在するファイルとディレクトリを一覧表示します
cd <directory_name>    # ディレクトリを <directory_name> ディレクトリに変更します
cat <file_name>    # <file_name> で指定したファイルの内容を表示します
```    

## 関連情報
{:.no_toc}

Git フックでのコミットごとに CircleCI の `config.yml` をバリデーションする方法については[こちらのブログ](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/)で紹介しています。

### CircleCI に関する資料
{:.no_toc}

* CircleCI のブログとフォロー方法 
  * <https://circleci.com/blog/>
* 関連するブログ投稿  
  * <https://circleci.com/blog/what-is-continuous-integration/>
* CircleCI の SNS アカウントと GitHub アカウント 
  * <https://github.com/circleci>
  * <https://twitter.com/circlecijapan>
  * <https://www.facebook.com/circleci>

### 継続的インテグレーション
{:.no_toc}

* <https://martinfowler.com/articles/continuousIntegration.html>
* [https://en.wikipedia.org/wiki/Continuous_integration#Best_practices](https://en.wikipedia.org/wiki/Continuous_integration#Best_practices)

### YAML
{:.no_toc}

* <https://en.wikipedia.org/wiki/YAML#Advanced_components>
