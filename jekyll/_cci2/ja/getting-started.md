---
layout: classic-docs
title: "Getting Started Introduction"
short-title: "Getting Started Introduction"
description: "CircleCI で成功 (グリーン) ビルドを行うためのチュートリアル"
categories:
  - getting-started
order: 41
---
This document provides a step-by-step tutorial for getting your first successful (green) build on CircleCI 2.0.

* 目次
{:toc}

## Prerequisites for Running Your First Build
{:.no_toc}

* Git および既存の GitHub.com アカウント、またはアカウントの作成についての基本的な知識。 この手順では新しい GitHub リポジトリを使用しますが、CircleCI では Bitbucket の使用もサポートしています。
* ターミナルや `bash` についての基本的な知識。またコマンドラインの使用経験があれば役に立ちます。

## Creating a Repository

1. Navigate to your account on GitHub.com
  
  * **[Repositories]** タブに移動し、 **[New]** を選択するか、<https://github.com/new> に直接移動します。 ![]({{ site.baseurl }}/assets/img/docs/GH_Repo-New-Banner.png)

2. [Initialize this repository with a README] にチェックを入れて、[Create repository] ボタンをクリックします。![]({{ site.baseurl }}/assets/img/docs/create-repo-circle-101-initialise-readme.png)

## Adding a .yml File

CircleCI uses a [YAML](https://en.wikipedia.org/wiki/YAML) file to identify how you want your testing environment set up and what tests you want to run. CircleCI 2.0 では、`config.yml` というファイル名で、隠しフォルダである `.circleci` ディレクトリ配下に作成しておく必要があります。 On Mac, Linux, and Windows systems, files and folders whose names start with a period are treated as *system* files that are hidden from users by default.

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

1. Commit the file by entering comments and clicking the Commit New File button. ![]({{ site.baseurl }}/assets/img/docs/commit-new-file.png)

`- image: circleci/ruby:2.4.1` という部分は、プロジェクトをビルドする際にどの Docker イメージを使うか指定しているものです。 CircleCI は、イメージを使用して「コンテナ」を立ち上げます。コンテナとは、プロジェクトの実行に必要な言語、システムユーティリティ、依存関係、Web ブラウザー、ツールなどがインストールされる仮想コンピューティング環境です。

## Setting up Your Build on CircleCI

1. For this step, you will need a CircleCI account. CircleCI の[ユーザー登録ページ](https://circleci.jp/signup)を開き、[GitHub でログイン] をクリックします。 You will need to give CircleCI access to your GitHub account to run your builds. If you already have a CircleCI account then you can navigate to your [dashboard](https://circleci.com/dashboard).

2. 次に、CricleCI で既に構築され、自分がアクセス可能なプロジェクトを*フォローする*かどうかのオプションが表示されます (これは通常、会社や組織の GitHub アカウントを使用している開発者に表示されます)。 次の画面では、作成したリポジトリを、新しいプロジェクトとして CircleCI に追加できます。

3. To add your new repo, ensure that your GitHub account is selected in the dropdown in the upper-left, find the repository you just created below, and click the **Setup project** button next to it. ![]({{ site.baseurl }}/assets/img/docs/CircleCI-add-new-project-list.png)

4. さらに次の画面ではプロジェクトに関する設定が可能です。 Leave everything as-is for now and just click the **Start building** button a bit down the page on the right. ![]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png) ![]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-start-building.png)

## Running Your First CircleCI Build!

You should see your build start to run automatically—and pass! So, what just happened? Click on the green Success button on the CircleCI dashboard to investigate the following parts of the run:

1. **環境のスピンアップ :** CircleCI は、`circleci/ruby:2.4.1` Docker イメージを使用して、仮想コンピューティング環境をローンチしました。

2. **チェックアウトコード :** CircleCI は、GitHub リポジトリをチェックアウトし、手順 1 でローンチされた仮想環境に「クローン」しました。

3. **echo :** これは、`config.yml` に含まれる唯一の他の命令です。CircleCI は echo コマンドを実行し、「A first hello」という入力を与えました ([echo](https://linux.die.net/man/1/echo) コマンドは、入力された文字列をそのまま出力します)。

今のところはリポジトリにソースコードが含まれておらず、`config.yml` 内にもテストに関わる設定が含まれていませんが、CircleCI はビルドに「成功」したものとして扱います ([exit コード](https://en.wikipedia.org/wiki/Exit_status)としては 0 を返しているため)。 Most projects are far more complicated, oftentimes with multiple Docker images and multiple steps, including a large number of tests. `config.yml` ファイルに記述できる全てのステップの詳細については、[CircleCI の設定方法](https://circleci.com/docs/ja/2.0/configuration-reference)を参照してください。

### Breaking Your Build!
{:.no_toc}

単純化のため、GitHub エディターで `config.yml` ファイルを編集し、`echo "A first hello"` を `notacommand` に置き換えます。 Click the **Commit change** button in the GitHub editor. CircleCI の {% comment %} TODO: Jobs {% endcomment %}Builds ページに戻ると、新しいビルドがトリガーされています。 This build will fail with a red Failed button and will send you a notification email of the failure.

### Using the Workflows Functionality
{:.no_toc}

1. Workflows の動作を見るには、`.circleci/config.yml` ファイルを編集します。 ブラウザーのウィンドウでファイルを編集モードにしてから、ファイル内で `build` とそれ以後のテキストを選択し、コピー＆ペーストし、そのセクションを複製します。 That should look similar to the code block below:

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

1. Next, rename your two jobs so that they have different names. この例では、`one` と `two` という名前にします。 echo コマンドの部分も別のものに変更します。 {% comment %} TODO: Job {% endcomment %}ビルドの実行に必要な時間をあえて長くするため、システムの `sleep` コマンドを追加します。

2. `config.yml` ファイルに `workflows` セクションを追加します。 The workflows section can be placed anywhere in the file. Typically it is found either at the top or the bottom of the file.

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

1. Commit these changes to your repository and navigate back over to the CircleCI dashboard. ![]({{ site.baseurl }}/assets/img/docs/workflows-circle-101-running.png)

2. Click on the link for your workflow to see that these two jobs run in parallel. ![]({{ site.baseurl }}/assets/img/docs/inside-workflows-circle-101-running.png)

Workflows の詳細については「[Workflows の制御](https://circleci.com/docs/ja/2.0/workflows/#overview)」ドキュメントを参照してください。

### Adding Some Changes to use the Workspaces Functionality
{:.no_toc}

Each workflow has an associated workspace which can be used to transfer files to downstream jobs as the workflow progresses. You can use workspaces to pass along data that is unique to this run and which is needed for downstream jobs. `config.yml` を次のように書き換えてみてください。

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

*Note that you will need to add your SSH keys to your GitHub account: <https://help.github.com/articles/connecting-to-github-with-ssh/>*.

![]({{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)

![]({{ site.baseurl }}/assets/img/docs/SSH-build-terminal-string.png)

ビルドの SSH の有効化セクションから、`ssh` の接続先をコピーします。 ターミナルを開き、`ssh` の接続先を貼り付けます。

Using some of the following commands, see if you can find and view the contents of the file you created using workspaces:

    pwd     # print what directory の略で、現在のディレクトリがファイルシステムのどこなのかを確認できます
    ls -al   # list の略で、現在のディレクトリに存在するファイルとディレクトリを一覧表示します
    cd <directory_name>    # ディレクトリを <directory_name> ディレクトリに変更します
    cat <file_name>    # <file_name> で指定したファイルの内容を表示します
    

## See Also
{:.no_toc}

Git フックでのコミットごとに CircleCI の `config.yml` をバリデーションする方法については[こちらのブログ](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/)で紹介しています。

### CircleCI に関する資料
{:.no_toc}

* The CircleCI blog and how to follow it 
  * <https://circleci.com/blog/>
* Relevant blog post  
  * <https://circleci.com/blog/what-is-continuous-integration/>
* Our other social media and GitHub 
  * <https://github.com/circleci>
  * <https://twitter.com/circleci>
  * <https://www.facebook.com/circleci>

### Continuous Integration
{:.no_toc}

* <https://martinfowler.com/articles/continuousIntegration.html>
* [https://en.wikipedia.org/wiki/Continuous_integration#Best_practices](https://en.wikipedia.org/wiki/Continuous_integration#Best_practices)

### YAML
{:.no_toc}

* <https://en.wikipedia.org/wiki/YAML#Advanced_components>