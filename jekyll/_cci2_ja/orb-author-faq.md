---
layout: classic-docs
title: "Orb オーサリングに関するよくあるご質問"
short-title: "Orb オーサリングに関するよくあるご質問"
description: "Orb オーサリングに関してよく寄せられるご質問。"
order: 20
version:
  - Cloud
  - Server v3.x
---

よく寄せられるご質問や技術的な問題など、Orb のオーサリングに役立つ情報をまとめました。

* 目次
{:toc}

## 名前空間を要求または Orb をパブリッシュする際にエラー
{: #errors-claiming-namespace-or-publishing-orbs }

* 質問: 名前空間を要求または安定版 Orb をパブリッシュしようとするとエラーが発生します。

* 回答: お客様は組織オーナーまたは管理者でない可能性があります。

組織が要求できる名前空間は 1 つだけです。 組織の名前空間を要求するには、認証を行うユーザーがその組織内でオーナーまたは管理者の権限を持っている必要があります。

必要な権限レベルがない場合、下記のようなエラーが表示されることがあります。

```
Error: Unable to find organization YOUR_ORG_NAME of vcs-type GITHUB: Must have member permission.: the organization 'YOUR_ORG_NAME' under 'GITHUB' VCS-type does not exist. Did you misspell the organization or VCS?
```

詳細については、[Orb CLI の権限リスト]({{site.baseurl}}/2.0/orb-author-intro/#permissions-matrix)を参照してください。

## Orb の削除
{: #deleting-orbs }

* 作成した Orb を削除できますか？

* 回答: 削除できません。 Orb はデフォルトで公開されており、１つのバージョンの Orb をパブリッシュした後、変更することはできません。 これにより、ユーザーは既知のバージョンの Orb がすべての実行において同じ動作をすると想定することができます。 Orb を削除すると、ユーザーのプロジェクトにおけるパイプラインの失敗につながる恐れがあります。

ただし、Orb を[ Orb レジストリ](https://circleci.com/developer/orbs)から除外することは可能です。 除外した Orb は、API または CLI からは見つけられますが、Orb レジストリの検索結果には表示されません。 これは、例えば現在はメンテナンスを行っていない Orb などに適しています。

```
circleci orb unlist <namespace>/<orb> <true|false> [flags]
```

**プライベート Orb をレジストリから除外する際はご注意ください。**
<br/>
Currently the `orb source` CircleCI CLI command does not work for _any_ Private Orbs, regardless if they are listed or unlisted. そのため、プライベート Orb 名が除外前にどこにも記載されていない場合、その Orb を Orb レジストリや CircleCI CLI で見つけることはできません。 この問題が発生したと思われる場合は、 [サポートチケット](https://support.circleci.com/hc/en-us)を作成してください。
{: class="alert alert-warning"}

## API トークンの保護
{: #secure-api-tokens }

* 質問: ユーザーの API トークンなどの機密情報を保護するにはどうしたらよいですか。

* 回答: API キーのパラメーターとして `env_var_name` パラメーター型を使用してください。 このパラメーター型は、有効な POSIX 環境変数名の文字列のみを入力値として受け入れます。 パラメーターの説明で、この環境変数を追加するようにユーザーに指示してください。

詳細はこちら:
* [環境変数名]({{site.baseurl}}/2.0/reusing-config/#environment-variable-name)
* [ベストプラクティス]({{site.baseurl}}/2.0/orbs-best-practices/)

## 環境変数
{: #environment-variables }

* 質問: ユーザーに環境変数の追加を求めるにはどうしたらよいですか。

* 回答: 環境変数名のパラメーターを作成してください。 _変更できない_静的な名前を持つ環境変数でも同じように対応します。 そして、そのパラメーターに正しいデフォルト値を割り当てます。 変更できない環境変数の場合は、その旨をパラメーターの説明に記載します。 また、変更できる環境変数かどうかを問わず、API キーの取得方法をユーザーに示してください。

必須の環境変数はバリデーションすることをお勧めします。 詳細については、[Orb のオーサリングのベストプラクティス]({{site.baseurl}}/2.0/orbs-best-practices/#commands)」を参照してください。

詳細はこちら:
* [環境変数名パラメーター型]({{site.baseurl}}/2.0/reusing-config/#environment-variable-name)
* [ベストプラクティス]({{site.baseurl}}/2.0/orbs-best-practices/)

## サポートされているプログラミング言語
{: #supported-programming-languages }

* 質問: Orb の記述にはどの言語を使用できますか。

* 回答: Orb は [CircleCI YAML 設定ファイル]({{site.baseurl}}/2.0/configuration-reference/)をパッケージ化したものです。

CircleCI Orb では、再利用可能な CircleCI 設定ファイル</a>をパッケージ化しています。 例えば、[コマンド]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands) は特定の [Executor]({{site.baseurl}}/2.0/executor-intro/) 内で実行できますが、その Executor は、カスタムジョブで_コマンド_を使用する場合はユーザーによって、[再利用可能なジョブ]({{site.baseurl}}/2.0/orb-concepts/#%E3%82%B8%E3%83%A7%E3%83%96)を使用する場合は Orb オーサーによって定義されます。 ロジックが実行される環境に応じて、使用する言語を決定してください。

* 質問: コマンド ロジックの記述にはどのプログラミング言語を使用できますか。

* 回答: 移植性と汎用性に最も優れているのは、POSIX 準拠の Bash です。 Orb を共有する予定であれば、この言語を使用することをお勧めします。 ただし、Orb は高い柔軟性を誇り、他のプログラミング言語やツールも自由に実行できます。

**Bash**

Bash は、すべての Executor において最もよく使用されており、お勧めの言語です。 Bash は、ネイティブの [run]({{site.baseurl}}/2.0/configuration-reference/#run) コマンドを使用して直接、簡単に記述できます。 MacOS と Linux のデフォルトのシェルは Bash になります。

**Interactive Interpreter (for example, Python)**

ユースケースによっては、Orb が特定の環境にしか存在しないことがあります。 たとえば、Orb が一般的な Python ユーティリティとして使用される場合は、Python を Orb の依存関係として要求した方が合理的です。 [run]({{site.baseurl}}/2.0/configuration-reference/#run) コマンドの シェルパラメーターを、次のように変更して使用してください。

```yaml
steps:
  - run:
    shell: /usr/bin/python3
    command: |
      place = "World"
      print("Hello " + place + "!")
```

**バイナリ**

このオプションは、可能な限り使用しないことを強くお勧めします。 時に、CLI ツールなどのリモート バイナリ ファイルをフェッチしなければならない場合があります。 これらのバイナリは、パッケージ マネージャーからフェッチするか、可能な場合は GitHub リリースなどの VCS でホスティングする必要があります。 Homebrew を [AWS Serverless Orb](https://circleci.com/developer/ja/orbs/orb/circleci/aws-serverless#commands-install) の一部としてインストールする例を以下に示します。

```yaml
steps:
  - run:
    command: >
      curl -fsSL
      "https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh" | bash
      /home/linuxbrew/.linuxbrew/bin/brew shellenv >> $BASH_ENV
    name: Homebrew のインストール (Linux 向け)
```

## コマンド/ジョブ
{: #command-vs-job }

* 質問: コマンドとジョブのどちらを作成するべきですか。

* 回答: どちらでもかまいませんが、実行したいタスクによリます。

Orb の[コマンド]({{site.baseurl}}/2.0/orb-concepts/#commands)は、ユーザーか Orb 開発者がジョブ内で何らかのアクションを実行するために使用します。 コマンド自体は、自身が含まれているジョブを認識しませんが、ユーザーは自由自在にコマンドを使用できます。 コマンドは、CLI アプリケーションを自動的にインストールしたり、インストールと認証を実行したりする場合などに便利です。

[ジョブ]({{site.baseurl}}/2.0/orb-concepts/#jobs)は、特定の実行環境内のステップやジョブの集まりを定義したものです。 ジョブでは通常、実行環境と実行対象のステップを指定するので、自由度はあまりありません。 ジョブは、デプロイなどのタスクを自動化する場合に便利です。 デプロイ ジョブでは、_Python_ などの一般的な実行プラットフォームを選択するだけで、ユーザー コードのチェックアウト、CLI のインストール、デプロイ コマンドの実行を自動的に完了できます。ユーザーが追加の設定を行う必要はほとんど、あるいはまったくありません。

詳細はこちら:
* [CircleCI 設定ファイル言語の概要]({{site.baseurl}}/2.0/config-intro/)
* [再利用可能な設定ファイル リファレンス ガイド]({{site.baseurl}}/2.0/reusing-config/)


## 関連項目
{: #see-also }
- [Orb のベストプラクティス]({{site.baseurl}}/2.0/orbs-best-practices): 安定版 Orb の作成に関する推奨事項
- [Orb のコンセプト]({{site.baseurl}}/2.0/orb-concepts/): CircleCI Orb に関するハイレベルな情報
- [Orb のパブリッシュ プロセス]({{site.baseurl}}/2.0/creating-orbs/): ワークフローやジョブで使用する Orb に関する情報
- [Orb リファレンス ガイド]({{site.baseurl}}/2.0/reusing-config/): 再利用可能な Orb、コマンド、パラメーター、および Executor の例
- [Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs/): 自分で作成した Orb をテストする方法
