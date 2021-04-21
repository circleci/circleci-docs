---
layout: classic-docs
title: "はじめてのビルドの成功（グリーンビルド）"
short-title: "はじめてのビルドの成功"
description: "CircleCI を使用してはじめてビルドを成功させるためのチュートリアル"
categories:
  - getting-started
order: 41
---

CircleCI ではじめてビルドを成功（グリーンビルド）させるためのステップについて詳しくご説明します。

* 目次
{:toc}

## 初回のビルド実行にあたっての前提条件
{:.no_toc}

* Git の基礎知識
* ログイン済みの GitHub または Bitbucket アカウント。 このガイドでは GitHub を使用しますが、必要に応じて同じプロセスを Bitbucket で実行してもかまいません。
* CircleCI のアカウント
* ターミナルまたは `bash` に関する基本知識と、コマンド ラインの使用経験があると役立ちます。

## リポジトリを作成する

最初に、GitHub でリポジトリを新規作成します。 既存のリポジトリを使用する場合は、このセクションをスキップしても問題ありません。

1. GitHub に移動して、[新規リポジトリを作成](https://github.com/new)します。
1. リポジトリの名前に (ここでは "hello-world") を入力して、[Initialize this repository with: (リポジトリを初期化し次を実行:)] セクションで **[Add a README file (README ファイルを追加)]** を選択します 最後に、**[Create repository (リポジトリを作成)]** をクリックします。

![リポジトリを作成する]( {{ site.baseurl }}/assets/img/docs/getting-started--new-repo.png){:.img--bordered}

## CircleCI をセットアップする

CircleCI アカウントをまだお持ちでない場合は、[ユーザー登録ページ](https://circleci.com/ja/signup/)に移動し、**[GitHub でログイン]** をクリックしてアカウントを作成します。

1. CircleCI の[プロジェクト ページ](https://app.circleci.com/projects/)に移動します。
1. 組織の下に新しいリポジトリを作成した場合は、CircleCI へのログイン時にその組織名を選択する必要があります。
1. プロジェクト ページに移動したら、使用するプロジェクト (今回の例では `hello-world`) を探し、**[Set Up Project (プロジェクトのセットアップ)]** をクリックします。

1. 次の画面で、ドロップダウンから言語を選択して、プロジェクト向けの推奨ベスト プラクティスがあらかじめ記述されている config.yml ファイルを取得します。 この例では、空のリポジトリを用意したので、リスト下部にある `Hello World` 構成サンプルを使用します。

    ![サンプル構成を取得する]( {{ site.baseurl }}/assets/img/docs/getting-started--sample-config.png){:.img--bordered}

    **注:** 選択した言語に応じて、参考ドキュメントが画面右側のサイドバーに表示されます。

1. **[Commit and Run (コミットして実行)]** をクリックします。 リポジトリのルートで、`circleci-project-setup` という名前の新規ブランチに `.circleci/config.yml` ファイルが作成されます。 この設定で問題がなければ、後にメインブランチにマージする、もしくは引き続き変更を行うことができます。

## 最初のパイプラインを掘り下げる

ここまでの手順を終えると、自動的にパイプラインの実行が開始され、成功するのを確認できます。 実行結果を確認します。 パイプラインの緑色の **[Success (成功)]** ボタンをクリックして、実行について以下の部分を確認しましょう。

![最初のパイプライン実行の成功]( {{ site.baseurl }}/assets/img/docs/getting-started--first-success.png)

1. **実行されたワークフローを確認する**: **[Success (成功)]** をクリックすると、実行されたジョブの一覧ページに移動します。 初めてのビルドであれば、(**1 つのワークフロー**内で自動的に実行される) **1 つのジョブ** だけが実行されています。  この例では、`welcome/run` という名前のジョブだけが実行されました。 [`welcome/run`] をクリックして、ジョブのステップを調査してみましょう。

   ![ビルドを調査する]( {{ site.baseurl }}/assets/img/docs/getting-started--first-success-workflow.png)


1. **環境をスピンアップする:** このプロジェクトのデフォルト設定には、[Orb](https://circleci.com/ja/orbs) が利用されています。 Orb を使用すると、よく使用する構成にすばやくアクセスできます。 この例では、ユーザーに単純なあいさつをする "構築済み" ジョブを実行する `circleci/welcome-orb@0.4.1` を使用しています。

1. **ステップの結果を表示する:** どのジョブも、一連のステップから構成されています。[`checkout`]({{site.baseurl}}/2.0/configuration-reference/#checkout) など、一部のステップは、CircleCI で予約されている特別なコマンドです。 他のステップは、ユーザーがそれぞれの目的に合わせて指定します。 `welcome` Orb を使用しているので、カスタム ステップは表示されません。カスタム ステップは Orb 内で構成されているからです。 しかし、問題ありません。 [Orb のソース](https://circleci.com/ja/developer/orbs/orb/circleci/welcome-orb)はオンラインで確認できます。

リポジトリに実際のソース コードがなく、`config.yml` に実際のテストが構成されていなくても、すべてのステップが問題なく完了したため ([終了コード](https://ja.wikipedia.org/wiki/%E7%B5%82%E4%BA%86%E3%82%B9%E3%83%86%E3%83%BC%E3%82%BF%E3%82%B9) 0 が返されたため)、CircleCI はビルドが "成功した" と見なします。 実際のプロジェクトは、これよりもはるかに複雑で、複数の Docker イメージと複数のステップを使用し、膨大な数のテストを行います。 `config.yml` ファイルで使用できるすべてのステップの詳細については、「[CircleCI を設定する](https://circleci.com/ja/docs/2.0/configuration-reference)」を参照してください。

### ビルドを意図的に失敗させる
{:.no_toc}

もう少し複雑なことをしてみましょう。 `.circleci/config.yml` ファイルを編集してみます。 ファイルの編集は、GitHub で直接行うことができます。 以下の URL のリポジトリ名とユーザー名 (`{ }` で囲まれたテキスト) を自分のものに置き換えて、ブラウザーに貼り付けます。 Git に慣れている方は、テキスト エディターを使用し、変更を Git にプッシュしてもかまいません。

`https://github.com/{username}/{repo}/edit/circleci-project-setup/.circleci/config.yml`

今回は、[Node Orb](https://circleci.com/ja/developer/orbs/orb/circleci/node) を使用してみましょう。 以下の内容を `config.yml` に貼り付けます。

```yaml
version: 2.1
orbs:
  node: circleci/node@1.1
jobs:
  build:
    executor:
      name: node/default
      tag: '10.4'
    steps:
      - checkout
      - node/with-cache:
          steps:
            - run: npm install
      - run: npm run test
```


次に、GitHub のエディターで変更をコミットし、CircleCI のプロジェクト ページに戻ります。 新しいパイプラインが実行され失敗することが確認できます。 何が起こったのでしょうか。

Node Orb は、一般的な Node タスクを実行します。 今回は空のリポジトリで Node スクリプト `npm run test` を実行したので、構成が失敗したのです。  修正するには、 リポジトリで Node プロジェクトをセットアップする必要があります。その方法は、別のチュートリアルで説明します。 参考として、[デモ アプリケーション]({{site.baseurl}}/2.0/demo-apps/)で、さまざまな言語とフレームワークで CircleCI をセットアップする方法をご覧ください。

## ワークフロー機能を使用する
{:.no_toc}

CircleCI を使用する際には、必ずしも Orb を使用する必要はありません。 次の例では、カスタム設定ファイルの作成方法を説明します。この例でも、CircleCI の[ワークフロー機能]({{site.baseurl}}/2.0/workflows)を使用します。

1. 以下のコード ブロックと付記されているコメントを読み進めます。 面倒だとしても、どのような処理をしているのかを理解しないままコードをコピー & ペーストするのはやめてください。 読み終えたら、ワークフローの動作を確認するために、`.circleci/config.yml` ファイルを編集して以下のテキストをコピー & ペーストします。

   ```yaml
   version: 2
   jobs: # 今回は 2 つのジョブを用意し、ワークフロー機能でジョブの調整を行います
     one: # 1 つ目のジョブ
       docker: # Docker Executor を使用します
         - image: circleci/ruby:2.4.1 # Ruby 2.4.1 を含む Docker イメージを指定します
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
       # ステップは、上記の Docker コンテナ内で実行するコマンドのリストです
       steps:
         - checkout # GitHub からコードをプルします
         - run: echo "A first hello" # "A first hello" を stdout に出力します
         - run: sleep 25 # 25 秒間スリープするようにジョブに指示するコマンド
     two: # 2 つ目のジョブ
       docker: # 前述と同様に Docker イメージ内で実行します
         - image: circleci/ruby:2.4.1
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
       steps:
         - checkout
         - run: echo "A more familiar hi" # 前述のコマンドに類似した echo コマンドを実行します
         - run: sleep 15 # 15 秒間スリープします
   # workflows 以下でマッピングを行い、上記で定義した 2 つのジョブを調整します
   workflows:
     version: 2
     one_and_two: # ワークフローの名前
       jobs: # 実行するジョブをここにリストします
         - one
         - two
   ```


1. この変更をリポジトリにコミットし、CircleCI パイプライン ページに戻ります。 CircleCI パイプラインが実行中であると表示されます。

1. 実行中のパイプラインをクリックし、作成したワークフローを表示します。 2 つのジョブが同時に実行された (または現在実行されている) ことがわかります。

ワークフローの詳細については、[こちらのドキュメント](https://circleci.com/ja/docs/2.0/workflows/#%E6%A6%82%E8%A6%81)を参照してください。

### 変更を追加してワークスペース機能を使用する
{:.no_toc}

各ワークフローには 1 つのワークスペースが関連付けられ、ワークフローの進行に伴って後続のジョブにファイルを転送するために使用されます。 ワークスペースを使用して、後続のジョブに必要な、実行ごとに固有のデータを渡すことができます。 `config.yml` を以下のように更新してみます。

```yml
version: 2
jobs:
  one:
    docker:
      - image: circleci/ruby:2.4.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  #  コンテキスト/プロジェクト UI 環境変数の参照
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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  #  コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: echo "A more familiar hi"  
      - attach_workspace:
          # 絶対パスまたは working_directory からの相対パスでなければなりません
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

ワークスペースの詳細については、[こちら](https://circleci.com/ja/docs/2.0/workflows/#%E3%83%AF%E3%83%BC%E3%82%AF%E3%82%B9%E3%83%9A%E3%83%BC%E3%82%B9%E3%81%AB%E3%82%88%E3%82%8B%E3%82%B8%E3%83%A7%E3%83%96%E9%96%93%E3%81%AE%E3%83%87%E3%83%BC%E3%82%BF%E5%85%B1%E6%9C%89)を参照してください。

### {% comment %} todo: job {% endcomment %}ビルドに SSH 接続する
{:.no_toc}

ターミナルの操作に慣れている場合は、CircleCI に直接 SSH 接続し、SSH 対応のオプション付きで{% comment %} TODO: Job {% endcomment %}ビルドを実行して、ビルドに関する問題のトラブルシューティングを行うことができます。

*SSH 公開鍵を GitHub アカウントに登録する必要があることにご注意ください。詳細は[こちら](https://help.github.com/articles/connecting-to-github-with-ssh/)。*


{:.tab.switcher.Cloud}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)


ビルドの SSH 有効化セクションから `ssh` の接続先をコピーします。 ターミナルを開き、`ssh` の接続先を貼り付けます。

以下のコマンドを使用して、ワークスペースで作成したファイルの内容を表示できるかどうかを確認します。

```
pwd                  #  "print what directory" の略で、ファイル システム内のどこにいるかを確認できます
ls -al               # 現在のディレクトリに含まれるファイルとディレクトリを一覧表示します
cd <directory_name>  # 現在のディレクトリを <directory_name> ディレクトリに変更します
cat <file_name>      # ファイル <file_name> の内容を表示します
```

## チームメイトと協力する

チームメイトやコラボレーターは、簡単にプロジェクトを閲覧したりフォローしたりできます。 チームメイトは、コードをまったくコミットしていないとしても、いつでも無料の CircleCI アカウントを作成してパイプラインを閲覧できます。

## 関連項目
{:.no_toc}

Git フックを使用してコミットごとに CircleCI `config.yml` をバリデーションする方法については、[こちらのブログ記事](https://circleci.com/ja/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/)を参照してください。

### CircleCI
{:.no_toc}

* [CircleCI ブログ](https://circleci.com/ja/blog/)
* [継続的インテグレーションとは](https://circleci.com/blog/what-is-continuous-integration/)
* CircleCI のアカウント: [GitHub](https://github.com/circleci) (英語)、[Twitter](https://twitter.com/circleci) (英語)、[Facebook](https://www.facebook.com/circleci) (英語)

### 継続的インテグレーション
{:.no_toc}

* [Martin Fowler 氏 - Continuous Integration (継続的インテグレーション) (英語)](https://martinfowler.com/articles/continuousIntegration.html)
* [ベスト プラクティス](https://ja.wikipedia.org/wiki/継続的インテグレーション)

### YAML
{:.no_toc}

* [Advanced components (高度なコンポーネント) (英語)](https://en.wikipedia.org/wiki/YAML#Advanced_components)
