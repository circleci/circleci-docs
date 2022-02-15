---
layout: classic-docs
title: "はじめてのビルドの成功（グリーンビルド）"
short-title: "はじめてのビルドの成功"
description: "CircleCI を使用してはじめてビルドを成功させるためのチュートリアル"
categories:
  - はじめよう
order: 41
---

CircleCI ではじめてビルドを成功 (グリーンビルド) させるためのステップについて詳しくご説明します。

* 目次
{:toc}

## はじめてのビルド実行に必要な前提条件
{: #prerequisites-for-running-your-first-build }
{:.no_toc}

* Git の基礎知識
* ログイン済みの GitHub または Bitbucket アカウント。 このガイドでは GitHub を使用しますが、必要に応じて同じプロセスを Bitbucket で実行してもかまいません。
* CircleCI のアカウント
* ターミナルまたは `bash` に関する基本知識と、コマンド ラインの使用経験があると役立ちます。

## リポジトリを作成する
CircleCI アカウントをまだお持ちでない場合は、[ユーザー登録ページ](https://circleci.com/ja/signup/)に移動し、**[GitHub でログイン]** をクリックしてアカウントを作成します。

最初に、GitHub でリポジトリを新規作成します。 既存のリポジトリを使用する場合は、このセクションをスキップしてください。

1. GitHub に移動して、[新規リポジトリを作成](https://github.com/new)します。
1. リポジトリの名前 (ここでは "hello-world") を入力して、README ファイルを使ってリポジトリを初期化するを選択します。 最後に、**[Create repository (リポジトリを作成)]** をクリックします。

## CircleCI をセットアップする
{: #setting-up-circleci }

CircleCI アカウントをまだお持ちでない場合は、[ユーザー登録ページ](https://circleci.com/ja/signup/)に移動し、**[GitHub で登録]** をクリックしてアカウントを作成します。

1. CircleCI の [Project ページ](https://app.circleci.com/projects/)に移動します。
1. 組織の下に新しいリポジトリを作成した場合は、CircleCI へのログイン時にその組織名を選択する必要があります。
1. Project ページで、使用するプロジェクトを選択します (今回は、`hello-world`)。
1. config.yml のスターターテンプレートの使用を選択し、**[Set Up Project]**をクリックします。
1. 次に、設定サンプルリストから言語を選択して、プロジェクト向けの推奨ベストプラクティスがあらかじめ記述されている config.yml ファイルを取得します。 この例では、空のリポジトリを用意したので、リスト下部にある `Hello World` 設定サンプルを使用します。

    **注:** 選択した言語に応じて、参考ドキュメントが画面右側のサイドバーに表示されます。
1. **[Commit and Run]** をクリックします。 リポジトリのルートで、`circleci-project-setup` という名前の新規ブランチに `.circleci/config.yml` ファイルが作成されます。 この設定で問題がなければ、後にメインブランチにマージする、もしくは引き続き変更を行うことができます。

## はじめて作成したパイプラインを掘り下げる
{: #digging-into-your-first-pipeline }

ここまでの手順を終えると、自動的にパイプラインの実行が開始され、成功するのを確認できます。 実行結果を確認しましょう。 パイプラインの緑色の **[Success]** ボタンをクリックして、実行について以下の部分を確認しましょう。

1. **実行されたワークフローを確認する**: **[Success]** をクリックすると、実行されたジョブの一覧ページに移動します。 はじめてのビルドであれば、**1 つのジョブ** だけが実行されているはずです (**1 つのワークフロー**内で自動的に実行されます) 。  今回は、 `say-hello`という名前のジョブだけが実行されました。 `say-hello` をクリックして、ジョブのステップを調査してみましょう。

1. **ステップの結果を表示する:** どのジョブも、一連のステップから構成されています。 [`checkout`]({{site.baseurl}}/2.0/configuration-reference/#checkout) などの一部のステップは、CircleCI で指定されている特別なコマンドです。 他のステップは、ユーザーがそれぞれの目的に合わせて指定します。 この Hello World のサンプル設定では、`checkout` と [`run`]({{site.baseurl}}/2.0/configuration-reference/#run) の両方を使います。

リポジトリに実際のソースコードがなく、`config.yml` に実際のテストが設定されていなくても、すべてのステップが問題なく完了したため ([終了コード](https://en.wikipedia.org/wiki/Exit_status) 0 が返されたため)、CircleCI はビルドが "成功した" と見なします。 実際のプロジェクトは、これよりもはるかに複雑で、複数の Docker イメージと複数のステップを使用し、膨大な数のテストを行います。 `config.yml` ファイルで使用できるすべてのステップの詳細については、[設定のリファレンス](https://circleci.com/docs/2.0/configuration-reference)を参照してください。

### ビルドを意図的に失敗させる
{: #breaking-your-build }
{:.no_toc}

もう少し複雑なことをしてみましょう。 `.circleci/config.yml` ファイルを編集してみます。 ファイルの編集は、GitHub で直接行うことができます。 以下の URL のリポジトリ名とユーザー名 (`{ }` で囲まれたテキスト) を自分のものに置き換えて、ブラウザーに貼り付けます。 Git に慣れている方は、テキスト エディターを使用し、変更を Git にプッシュしてもかまいません。

`https://github.com/{username}/{repo}/edit/circleci-project-setup/.circleci/config.yml`

今回は、[Node Orb](https://circleci.com/ja/developer/orbs/orb/circleci/node) を使用してみましょう。 以下の内容を `config.yml` に貼り付けます。

```yaml
version: 2.1
orbs:
  node: circleci/node@4.7.0
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


次に、GitHub のエディターで変更をコミットし、CircleCI の Projects ページに戻ります。 新しいパイプラインが実行され失敗することが確認できます。 何が起こったのでしょうか。

Node Orb は、一般的な Node タスクを実行します。 今回は空のリポジトリで Node スクリプト `npm run test` を実行したので、設定が失敗したのです。  修正するには、 リポジトリで Node プロジェクトをセットアップする必要があります。その方法は、別のチュートリアルで説明します。 参考として、[デモ アプリケーション]({{site.baseurl}}/2.0/demo-apps/)で、さまざまな言語とフレームワークで CircleCI をセットアップする方法をご覧ください。

## ワークフロー機能を使用する
{: #using-the-workflows-functionality }
{:.no_toc}

CircleCI を使用する際には、必ずしも Orb を使用する必要はありません。 次の例では、カスタム設定ファイルの作成方法を説明します。この例でも、CircleCI の[ワークフロー機能]({{site.baseurl}}/2.0/workflows)を使用します。

1. 以下のコードブロックと付記されているコメントを読み進めます。 面倒だとしても、どのような処理をしているのかを理解しないままコードをコピー & ペーストするのはやめてください。 読み終えたら、ワークフローの動作を確認するために、`.circleci/config.yml` ファイルを編集して以下のテキストをコピー & ペーストします。

   ```yaml
   version: 2
   jobs: # 今回は 2 つのジョブを用意し、ワークフロー機能でジョブの調整を行います。
     one: # 1 つ目のジョブ
       docker: # Docker Executor を使用します。
         - image: circleci/ruby:2.4.1 # Ruby 2.4.1 を含む Docker イメージを指定します。
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
       # ステップは、上記の Docker コンテナ内で実行するコマンドのリストです
       steps:
         - checkout # GitHub からコードをプルします
         - run: echo "A first hello" # "A first hello" を stdout に出力します
         - run: sleep 25 # 25 秒間スリープするようにジョブに指示するコマンドです。
     two: # 2 つ目のジョブ
       docker: # 前述と同様に Docker イメージ内で実行します。
         - image: circleci/ruby:2.4.1
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
       steps:
         - checkout
         - run: echo "A more familiar hi" # 前述のコマンドに類似した echo コマンドを実行します。
         - run: sleep 15 # 15 秒間スリープします
   # このワークフローでは、マッピングを行い、上記で定義した 2 つのジョブを調整することができます。
   workflows:
     version: 2
     one_and_two: # ワークフローの名前
       jobs: # 実行するジョブをここにリストします
         - one
         - two
   ```


1. この変更をリポジトリにコミットし、CircleCI パイプライン ページに戻ります。 CircleCI パイプラインが実行中であると表示されます。

1. 実行中のパイプラインをクリックし、作成したワークフローを表示します。 2 つのジョブが同時に実行された (または現在実行されている) ことがわかります。

ワークフローの詳細については、[ワークフローのオーケストレーション](https://circleci.com/docs/2.0/workflows/#overview)を参照してください。

### 変更を追加してワークスペース機能を使用する
{: #adding-some-changes-to-use-the-workspaces-functionality }
{:.no_toc}

各ワークフローには 1 つのワークスペースが関連付けられ、ワークフローの進行に伴って後続のジョブにファイルを転送するために使用されます。 ワークスペースを使用して、後続のジョブに必要な、実行ごとに固有のデータを渡すことができます。 試しに下記に `config.yml` を書き換えてみてください。

```yaml
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
          # 絶対パスまたは working_directory からの相対パスでなければなりません。
          root: my_workspace
          # ルートからの相対パスでなければなりません。
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
          # 絶対パスまたは working_directory からの相対パスでなければなりません。
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

Workspace については[こちら](https://circleci.com/docs/2.0/workflows/#using-workspaces-to-share-data-among-jobs)でより詳しく説明しています。

### SSH での{% comment %}TODO: Job {% endcomment %}ビルドへの接続
{: #ssh-into-your-percent-comment-percent-todo-job-percent-endcomment-percentbuild }
{:.no_toc}

ターミナルの操作に慣れている場合は、CircleCI に直接 SSH 接続し、SSH 対応のオプション付きで{% comment %} TODO: Job {% endcomment %}ビルドを実行して、ビルドに関する問題のトラブルシューティングを行うことができます。

*SSH 公開鍵を GitHub アカウントに登録する必要があることにご注意ください。詳細は[こちら](https://help.github.com/articles/connecting-to-github-with-ssh/)。*


{:.tab.switcher.Cloud}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server_3}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server_2}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)


ビルドの SSH 有効化セクションから `ssh` の接続先をコピーします。 ターミナルを開き、`ssh` の接続先を貼り付けます。

以下のコマンドを使用して、ワークスペースで作成したファイルの内容を表示できるかどうかを確認します。

```
pwd                  #  "print what directory" の略で、ファイル システム内のどこにいるかを確認できます。
ls -al               # 現在のディレクトリに含まれるファイルとディレクトリを一覧表示します。
cd <directory_name>  # 現在のディレクトリを <directory_name> ディレクトリに変更します。
cat <file_name>      # ファイル <file_name> の内容を表示します。
```
**注:** `rerun job with ssh`を実行するには、 [ジョブにSSHキーを追加する](https://circleci.com/docs/2.0/add-ssh-key/#adding-ssh-keys-to-a-job)という手順が必要です。

## チームメイトと協力する
{: #collaborating-with-teammates }

チームメイトやコラボレーターは、簡単にプロジェクトを閲覧したりフォローしたりできます。 チームメイトは、コードをまったくコミットしていないとしても、いつでも無料の CircleCI アカウントを作成してパイプラインを閲覧できます。

## 関連項目
{: #see-also }
{:.no_toc}

Git フックを使用してコミットごとに CircleCI `config.yml` を検証する方法については、[こちらの Blog 記事](https://circleci.com/ja/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/)を参照してください。

### CircleCI
{: #circleci }
{:.no_toc}

* [CircleCI Blog](https://circleci.com/blog/)
* [継続的インテグレーションとは](https://circleci.com/blog/what-is-continuous-integration/)
* CircleCI のアカウント: [GitHub](https://github.com/circleci) (英語)、[Twitter](https://twitter.com/circleci) (英語)、[Facebook](https://www.facebook.com/circleci) (英語)

### 継続的インテグレーション
{: #continuous-integration }
{:.no_toc}

* [Martin Fowler 氏 - Continuous Integration (継続的インテグレーション) (英語)](https://martinfowler.com/articles/continuousIntegration.html)
* [ベストプラクティス](https://en.wikipedia.org/wiki/Continuous_integration#Best_practices)

### YAML
{: #yaml }
{:.no_toc}

* [より詳しい概念 (英語)](https://en.wikipedia.org/wiki/YAML#Advanced_components)
