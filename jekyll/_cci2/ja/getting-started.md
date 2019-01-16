---
layout: classic-docs
title: "Getting Started Introduction"
short-title: "Getting Started Introduction"
description: "A tutorial for getting your first green CircleCI build"
categories:
  - getting-started
order: 41
---
このドキュメントでは、CircleCI 2.0 で成功 (グリーン) ビルドを行うための詳しい手順を説明します。

* TOC {:toc}

## ビルドにあたっての前提条件

{:.no_toc}

* Some basic knowledge of Git and an existing GitHub.com account or the ability to create one. This procedure uses a new GitHub repository, but CircleCI also supports the use of Bitbucket.
* `bash` をはじめとするターミナル、シェルの基礎的な知識があること。コマンドライン操作に慣れていると理解がスムーズです。

## リポジトリの作成

1. GitHub.com にログインし、下記の通り操作します。
  
  * **New repositories** ボタンをクリックするか、<https://github.com/new>{:target="_blank"} に直接アクセスします ![]({{ site.baseurl }}/assets/img/docs/GH_Repo-New-Banner.png)

2. 「Initialize this repository with a README」にチェックを入れて、**Create repository** ボタンをクリックします。![]({{ site.baseurl }}/assets/img/docs/create-repo-circle-101-initialise-readme.png)

## .YML ファイルの追加

CircleCI は、テスト環境の構築方法や実行するテスト内容の定義に [YAML](https://en.wikipedia.org/wiki/YAML) ファイルを使います。 CircleCI 2.0 では、`config.yml` というファイル名で、隠しフォルダである `.circleci` ディレクトリ配下に作成しておく必要があります。 macOS、Linux、Windows においては、ピリオドから始まるファイルやフォルダは、デフォルトで隠し属性のある*システム*ファイルとして扱われますので、ご注意ください。

1. GitHub でファイルやフォルダを作成するには、リポジトリページの **Create new file** ボタンをクリックし、`.circleci/config.yml` と入力します。 すると、空の `config.yml` ファイルが `.circleci` フォルダ内に作成されます。

2. 単純な `config.yml` から始めたいときは、下記の内容を GitHub の編集画面にコピー＆ペーストしてください。

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

1. 任意でコメントを入力してから、**Commit New File** ボタンをクリックしてファイルをコミットします。![]({{ site.baseurl }}/assets/img/docs/commit-new-file.png)

The `- image: circleci/ruby:2.4.1` text tells CircleCI what Docker image to use when it builds your project. CircleCI will use the image to boot up a "container" — a virtual computing environment where it will install any languages, system utilities, dependencies, web browsers, and tools, that your project might need to run.

## CircleCI 上でのビルドの準備

1. この手順は CircleCI アカウントを持っていることが前提となります。 [ユーザー登録](https://circleci.jp/signup/) ページにアクセスして「GitHub でログイン」ボタンをクリックしてください。 このとき、GitHub アカウントに対して CircleCI からのアクセスを許可することで正しくビルドできるようになります。 CircleCI アカウントを既に持っている場合は、[ダッシュボード](https://circleci.com/dashboard)にアクセスします。

2. ダッシュボードでは、CircleCI で管理しているもののうち自身が*フォロー*しているプロジェクトの一覧が表示されます (これは企業・組織の GitHub アカウントにひもづけられた開発者個人の画面での一般的な見え方です)。 次の画面では、CircleCI 上で新規プロジェクトとして作成したリポジトリを追加できます。

3. 新規リポジトリを追加するには、画面左上のプルダウンリストで正しい GitHub アカウントが選択されていることと、その下に作成したリポジトリが表示されていることを確認します。その後、横にある **Setup project** ボタンをクリックします。 ![]({{ site.baseurl }}/assets/img/docs/CircleCI-add-new-project-list.png)

4. さらに次の画面ではプロジェクトに関する設定が可能です。 この時点では設定はそのままでもかまいません。右下にある **Start building** ボタンをクリックしてください。 ![]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png) ![]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-start-building.png)

## CircleCI での初めてのビルド

You should see your build start to run automatically—and pass! So, what just happened? Click on the green Success button on the CircleCI dashboard to investigate the following parts of the run:

1. **Spin up environment:** CircleCI used the `circleci/ruby:2.4.1` Docker image to launch a virtual computing environment.

2. **Checkout code**  
  GitHub のリポジトリを精査し、その内容を上記の仮想環境内に「クローニング」したことを表すログを表示しています。

3. **echo**  
  `config.yml` ファイル内で指定された実行内容を表示しています。ここでは「CircleCI を始めました」という入力内容が、echo コマンドにより出力されています ([echo](https://linux.die.net/man/1/echo) コマンドは入力したテキストをそのまま出力します)。

今のところはリポジトリにソースコードが含まれておらず、`config.yml` 内にもテストに関わる設定が含まれていませんが、CircleCI はビルドに「成功」したものとして扱います ([exit コード](https://en.wikipedia.org/wiki/Exit_status)としては 0 を返しているため)。 通常は複数の Docker とビルド手順、そして数多くのテストから構成される、もっと複雑なコードを含むプロジェクトになっているはずです。 You can learn more about all the possible steps one may put in a `config.yml` file in the [Configuration Reference](https://circleci.com/docs/2.0/configuration-reference).

### ビルドをいったん停止する

{:.no_toc}

GitHub エディターで `config.yml` ファイルを編集し、`echo "CircleCI を始めました"`の部分をひとまず `notacommand` に置き換えます。 続けて **Commit changes** ボタンをクリックしてください。 When you navigate back to the {% comment %} TODO: Jobs {% endcomment %}Builds page in CircleCI, you will see that a new build was triggered. この場合はビルドが失敗し、Failed と表示された赤いボタンが表示されるとともに、失敗したことを通知するメールが届くことになります。

### Workflows を使用する

{:.no_toc}

1. `.circleci/config.yml` ファイルのカスタマイズを通じて Workflows の仕組みを理解してみましょう。 まずは GitHub エディターの編集画面で、既存の `build` 以降をコピーし、そのまま末尾にペーストします。 貼り付け後の `config.yml` ファイル全体は以下のようになっているはずです。

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

1. 次に、2 つのジョブを別々の名前にします。 例えば、 最初のジョブである `build` を `one` に、もう 1 つのジョブである `build` を `two` に変えることにします。 echo コマンドの出力も違う内容に変えましょう。 To make the {% comment %} TODO: Job {% endcomment %}build take a longer period of time we can add a system `sleep` command.

2. Add a `workflows` section to your `config.yml` file. The workflows section can be placed anywhere in the file. Typically it is found either at the top or the bottom of the file.

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

1. リポジトリに今回の変更をコミットしてから CircleCI のダッシュボードに戻って確認します。![]({{ site.baseurl }}/assets/img/docs/workflows-circle-101-running.png)

2. Workflows ページで実行中を表す青いボタンをクリックすると、2 つのジョブが並行して処理されていることがわかります。![]({{ site.baseurl }}/assets/img/docs/inside-workflows-circle-101-running.png)

Read more about workflows in the [Orchestrating Workflows](https://circleci.com/docs/2.0/workflows/#overview) documentation.

### Workspace を使ってみる

{:.no_toc}

Each workflow has an associated workspace which can be used to transfer files to downstream jobs as the workflow progresses. You can use workspaces to pass along data that is unique to this run and which is needed for downstream jobs. Try updating `config.yml` to the following:

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
          # Must be an absolute path, or relative path from working_directory
          root: my_workspace
          # Must be relative path from root
          paths:
            - echo-output      
  two:
    docker:
      - image: circleci/ruby:2.4.1
    steps:
      - checkout
      - run: echo "A more familiar hi"  
      - attach_workspace:
          # Must be absolute path or relative path from working_directory
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

Read more about workspaces [here](https://circleci.com/docs/2.0/workflows/#using-workspaces-to-share-data-among-jobs).

### SSH into Your {% comment %} TODO: Job {% endcomment %}Build

{:.no_toc}

![]({{ site.baseurl }}/assets/img/docs/SSH-screen.png)

If you are comfortable with the terminal, you can SSH directly into your CircleCI jobs to troubleshoot issues with your builds by rerunning your {% comment %} TODO: Job {% endcomment %}build with the SSH enabled option.

*Note that you will need to add your SSH keys to your GitHub account: <https://help.github.com/articles/connecting-to-github-with-ssh/>*.

![]({{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)

![]({{ site.baseurl }}/assets/img/docs/SSH-build-terminal-string.png)

Copy the `ssh` string from the enabling SSH section of your build. Open a terminal and paste in the `ssh` string.

Using some of the following commands, see if you can find and view the contents of the file you created using workspaces:

    pwd     #  print what directory, find out where you are in the file system
    ls -al   # list what files and directories are in the current directory
    cd <directory_name>    # change directory to the <directory_name> directory
    cat <file_name>    # show me the contents of the file <file_name>
    

## See Also

{:.no_toc}

[Blog post](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/) on how to validate the CircleCI `config.yml` on every commit with a git hook.

### CircleCI に関する資料

{:.no_toc}

* CircleCI 公式ブログ 
  * <https://circleci.com/blog/>
* 関連するブログ投稿  
  * <https://circleci.com/blog/what-is-continuous-integration/>
* 公式の SNS アカウントと GitHub アカウント 
  * <https://github.com/circleci>
  * <https://twitter.com/circleci>
  * <https://www.facebook.com/circleci>

### 継続的インテグレーションに関する資料

{:.no_toc}

* <https://martinfowler.com/articles/continuousIntegration.html>
* [https://en.wikipedia.org/wiki/Continuous_integration#Best_practices](https://en.wikipedia.org/wiki/Continuous_integration#Best_practices)

### YAML に関する資料

{:.no_toc}

* <https://en.wikipedia.org/wiki/YAML#Advanced_components>