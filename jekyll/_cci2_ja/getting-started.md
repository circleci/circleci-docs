---
layout: classic-docs
title: "入門ガイド"
short-title: "入門ガイド"
description: "CircleCI を使用して初めてのビルドを成功させるためのチュートリアル"
categories:
  - getting-started
order: 41
---

CircleCI 2.0 で初めてのビルドを成功させるためのステップについて詳しくご説明します。

* 目次
{:toc}

## 初回のビルド実行にあたっての前提条件
{:.no_toc}

* Git に関する基本知識を備えており、GitHub.com アカウントを持っている、またはアカウントを作成できること。 以下の説明では新しい GitHub リポジトリを使用しますが、CircleCI では Bitbucket の使用もサポートされています。
* ターミナルまたは `bash` に関する基本知識と、コマンド ラインの使用経験があると役立ちます。

## リポジトリを作成する

1. GitHub.com でお使いのアカウントに移動します。
  
  * **[Repositories (リポジトリ)]** タブに移動し、**[New (新規)]** を選択するか、直接 <https://github.com/new> に移動します。 ![]({{ site.baseurl }}/assets/img/docs/GH_Repo-New-Banner.png)

2. [Initialize this repository with a README (リポジトリを初期化し、README を添付する)] を選択し、[Create repository (リポジトリの作成)] ボタンをクリックします。![]({{ site.baseurl }}/assets/img/docs/create-repo-circle-101-initialise-readme.png)

## .yml ファイルを追加する

CircleCI は、テスト環境のセットアップ方法や実行するテストを識別するために、[YAML](https://ja.wikipedia.org/wiki/YAML) ファイルを使用します。 CircleCI 2.0 では、このファイルは `config.yml` という名前で、`.circleci` という名前の非表示のフォルダーに置く必要があります。 Mac、Linux、および Windows のシステムでは、ピリオドで始まる名前を持つファイルやフォルダーは*システム* ファイルとして扱われ、デフォルトではユーザーに対して非表示になっています。

1. GitHub でこのファイルとフォルダーを作成するには、リポジトリ ページで **[Create new file (ファイルの新規作成)]** ボタンをクリックし、`.circleci/config.yml` と入力します。 これで、`.circleci` フォルダーに空の `config.yml` ファイルが作成されて表示されます。

2. 最初は単純な `config.yml` を作成するために、GitHub のファイル編集ウィンドウに以下のテキストをコピーします。

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

3. コメントを入力し、[Commit new file (新規ファイルのコミット)] ボタンをクリックしてファイルをコミットします。![]({{ site.baseurl }}/assets/img/docs/commit-new-file.png)

`- image: circleci/ruby:2.4.1` というテキストは、プロジェクトのビルド時に使用する Docker イメージを CircleCI に指示します。 CircleCI は、このイメージを使用して「コンテナ」と呼ばれる仮想コンピューティング環境を起動し、プロジェクトの実行に必要な言語、システム ユーティリティ、依存関係、Web ブラウザー、およびツールをそこにインストールします。

## CircleCI でビルドを準備する

1. このステップでは、CircleCI アカウントが必要です。 既に CircleCI アカウントをお持ちの場合は、[ダッシュボード](https://circleci.com/dashboard)に移動します。または、CircleCI Server をお使いの場合は、ホスト名を `https://<your-circleci-hostname>.com/dashboard` に置き換えます。 まだアカウントをお持ちでない場合は、CircleCI の[登録ページ](https://circleci.com/ja/signup)に移動し、[GitHub でログイン] をクリックします。 ビルドを実行するには、CircleCI に GitHub アカウントへのアクセスを許可する必要があります。

2. 次に、既に CircleCI でビルド中のプロジェクトがあり、自分がアクセスできる場合は、それらを*フォロー*するためのオプションが表示されます (通常、会社または組織の GitHub アカウントに接続している開発者が該当します)。 次の画面では、先ほど作成したリポジトリを CircleCI の新しいプロジェクトとして追加できます。

3. 新しいリポジトリを追加する前に、左上のドロップダウンで自分の GitHub アカウントが選択されていることを確認します。[Add Projects (プロジェクトの追加)] ページを選択し、先ほど作成したリポジトリをリストで見つけたら (検索もできます)、その横にある **[Set Up Project (プロジェクトのセットアップ)]** ボタンをクリックします。 ![]({{ site.baseurl }}/assets/img/docs/CircleCI-add-new-project-list.png)

4. 次の画面で、ドロップダウンから言語を選択して、プロジェクト向けに推奨されるベスト プラクティスがあらかじめ記述されている config.yml ファイルを取得します。 使用している言語がリストにない場合は、リスト下部にある [Use Hello World] ボタンをクリックします。 表示される YAML 構成をコピーし、リポジトリのディレクトリのルートにある `.circleci` というフォルダーに「config.yml」という名前で保存します。 ![]({{ site.baseurl }}/assets/img/docs/CircleCI-add-new-project-list-2.png)

5. 新しい `config.yml` ファイルを VCS に git push します。 これで、ビルドを開始する準備ができました。 [Start Building] ボタンをクリックし、リポジトリのビルド準備が完了したことを確認するモーダルに同意します。

## 初めての CircleCI ビルドを実行する

ここまでの手順を終えると、自動的にビルドの実行が開始され、成功するはずです。 さて、何が起こったのでしょうか。 CircleCI ダッシュボードで緑色の [Success (成功)] ボタンをクリックすると、実行について以下の部分を確認できます。

1. **環境のスピンアップ:** CircleCI は `circleci/ruby:2.4.1` Docker イメージを使用して仮想コンピューティング環境をローンチしました。

2. **コードのチェック アウト:** CircleCI は、GitHub リポジトリを検査し、ステップ 1 でローンチした仮想環境内に「クローン」を作成しました。

3. **echo:** これがこの `config.yml` ファイル内の唯一の命令でした。CircleCI は入力「A first hello」を使用して echo コマンドを実行しました ([echo](https://linux.die.net/man/1/echo) とは文字どおり「こだま」のように、指定された文字列をそのまま表示させるコマンドです)。

リポジトリに実際のソース コードがなく、`config.yml` に実際のテストが構成されていなくても、すべてのステップが問題なく完了したため ([終了コード](https://ja.wikipedia.org/wiki/終了ステータス) 0 が返されたため)、CircleCI はビルドが「成功した」と見なします。 実際のプロジェクトは、これよりもはるかに複雑で、複数の Docker イメージと複数のステップを使用し、膨大な数のテストを行います。 `config.yml` ファイルで使用できるすべてのステップの詳細については、「[CircleCI を設定する](https://circleci.com/ja/docs/2.0/configuration-reference)」を参照してください。

### ビルドを意図的に失敗させる
{:.no_toc}

GitHub のエディタで `config.yml` ファイルを簡単に編集して、`echo "A first hello"` を `notacommand` に書き換えてみましょう。 GitHub のエディタで **[Commit change (変更のコミット)]** ボタンをクリックします。 CircleCI の {% comment %} TODO: Jobs {% endcomment %}[Build (ビルド)] ページに戻ると、新しいビルドがトリガーされています。 このビルドは失敗して、赤色の [Failed (失敗)] ボタンが表示され、失敗を通知するメールが送信されます。

### ワークフロー機能を使用する
{:.no_toc}

1. ワークフローの動作を確認するために、`.circleci/config.yml` ファイルを編集します。 ブラウザー ウィンドウでファイルを編集モードにしたら、ファイルの `build` 以降のテキストを選択し、そのセクションをコピーして貼り付けます。 コード ブロックは以下のようになります。

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

2. 次に、2 つのジョブの名前を、それぞれ異なる名前に変更します。 この例では、`one` と `two` という名前を使用します。 echo コマンドの内容を変更します。 {% comment %} TODO: Job {% endcomment %}ビルドの時間を長引かせるために、システムの `sleep` コマンドを追加します。

3. `config.yml` ファイルに `workflows` セクションを追加します。 workflows セクションは、ファイル内のどこに配置してもかまいません。 通常は、ファイルの先頭または末尾に配置されます。

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

4. この変更をリポジトリにコミットし、CircleCI ダッシュボードに戻ります。![]({{ site.baseurl }}/assets/img/docs/workflows-circle-101-running.png)

5. ワークフローのリンクをクリックすると、この 2 つのジョブが並列に実行されていることがわかります。![]({{ site.baseurl }}/assets/img/docs/inside-workflows-circle-101-running.png)

ワークフローの詳細については、[こちらのドキュメント](https://circleci.com/ja/docs/2.0/workflows/#概要)を参照してください。

### 変更を追加してワークスペース機能を使用する
{:.no_toc}

各ワークフローには 1 つのワークスペースが関連付けられ、ワークフローの進行に伴ってダウンストリーム ジョブにファイルを転送するために使用されます。 ワークスペースを使用して、ダウンストリーム ジョブに必要な、実行ごとに固有のデータを渡すことができます。 `config.yml` を以下のように更新してみます。

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
          # 絶対パスまたは working_directory からの相対パスでなければなりません
          root: my_workspace
          # ルートからの相対パスでなければなりません
          paths:
            - echo-output      
  two:
    docker:
      - image: circleci/ruby:2.4.1
    steps:
      - checkout
      - run: echo "A more familiar hi"  
      - attach_workspace:
          # 絶対パスであるか、working_directory からの相対パスでなければなりません
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

ワークスペースの詳細については、[こちら](https://circleci.com/ja/docs/2.0/workflows/#ワークスペースによるジョブ間のデータ共有)を参照してください。

### {% comment %} TODO: Job {% endcomment %}ビルドに SSH 接続する
{:.no_toc}

![]({{ site.baseurl }}/assets/img/docs/SSH-screen.png)

ターミナルの操作に慣れている場合は、CircleCI に直接 SSH 接続し、SSH 対応のオプション付きで{% comment %} TODO: Job {% endcomment %}ビルドを実行して、ビルドに関する問題のトラブルシューティングを行うことができます。

*GitHub アカウントに SSH キーを追加する必要があります。詳細については、<https://help.github.com/ja/github/authenticating-to-github/connecting-to-github-with-ssh> を参照してください。*


{:.tab.switcher.Cloud}
![SSH でのリビルド]({{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server}
![SSH でのリビルド]({{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)

ビルドの SSH 有効化セクションから `ssh` の接続先をコピーします。 ターミナルを開き、`ssh` の接続先を貼り付けます。

以下のコマンドを使用して、ワークスペースで作成したファイルの内容を表示できるかどうかを確認します。

    pwd                  #  "print what directory" の略で、ファイル システム内のどこにいるかを確認できます
    ls -al               # 現在のディレクトリに含まれるファイルとディレクトリを一覧表示します
    cd <directory_name>  # 現在のディレクトリを <directory_name> ディレクトリに変更します
    cat <file_name>      # ファイル <file_name> の内容を表示します
    

## 関連項目
{:.no_toc}

Git フックを使用してコミットごとに CircleCI `config.yml` をバリデーションする方法については、[こちらのブログ記事](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/)を参照してください。

### CircleCI
{:.no_toc}

* CircleCI ブログ (購読できます) 
  * <https://circleci.com/blog/>
* CircleCI ブログの関連記事  
  * <https://circleci.com/blog/what-is-continuous-integration/>
* CircleCI に関する他のソーシャル メディアと GitHub 
  * <https://github.com/circleci>
  * <https://twitter.com/circlecijapan>
  * <https://www.facebook.com/groups/CircleCIJP/>

### 継続的インテグレーション
{:.no_toc}

* <https://martinfowler.com/articles/continuousIntegration.html>
* <https://ja.wikipedia.org/wiki/継続的インテグレーション>

### YAML
{:.no_toc}

* <https://en.wikipedia.org/wiki/YAML#Advanced_components>