---
layout: classic-docs
title: "Orb オーサリングに関するよくあるご質問"
short-title: "Orb オーサリングに関するよくあるご質問"
description: "Orb オーサリングに関してよく寄せられるご質問。"
order: 20
version:
  - クラウド
---

よく寄せられるご質問や技術的な問題など、Orbs のオーサリングに役立つ情報をまとめました。

* 目次
{:toc}

## 名前空間の要求または Orb のパブリッシュに伴うエラー

* 質問: 名前空間を要求または安定版 Orb をパブリッシュしようとするとエラーが発生します。

* 回答: 組織オーナーまたは管理者でない可能性があります。

組織が要求できる名前空間は 1 つだけです。 組織の名前空間を要求するには、認証中のユーザーがその組織内でオーナーまたは管理者の権限を持っている必要があります。

必要な権限レベルがない場合、下記のようなエラーが表示されることがあります。

```
Error: Unable to find organization YOUR_ORG_NAME of vcs-type GITHUB: Must have member permission.: the organization 'YOUR_ORG_NAME' under 'GITHUB' VCS-type does not exist. Did you misspell the organization or VCS?
```

詳細については、[Orb CLI の権限の一覧表]({{site.baseurl}}/2.0/orb-author-intro/#%E6%A8%A9%E9%99%90%E3%81%AE%E4%B8%80%E8%A6%A7%E8%A1%A8)を参照してください。

## API トークンの保護

* 質問: ユーザーの API トークンなどの機密情報を保護するにはどうしたらよいですか。

* 回答: API キーのパラメーターとして `env_var_name` パラメーター型を使用してください。 このパラメーター型は、有効な POSIX 環境変数名の文字列のみを入力値として受け入れます。 パラメーターの説明で、この環境変数を追加するようにユーザーに指示してください。

詳細については、以下を参照してください。
* [環境変数名]({{site.baseurl}}/2.0/reusing-config/#環境変数名)
* [Orb のベスト プラクティス]({{site.baseurl}}/2.0/orbs-best-practices/)

## 環境変数

* 質問: ユーザーに環境変数の追加を求めるにはどうしたらよいですか。

* 回答: 環境変数名のパラメーターを作成してください。_変更できない_静的な名前を持つ環境変数でも同じように対応します。 そして、そのパラメーターに正しいデフォルト値を割り当てます。 変更できない環境変数の場合は、その旨をパラメーターの説明に記載します。 また、変更できる環境変数かどうかを問わず、API キーの取得方法をユーザーに示してください。

必須の環境変数はバリデーションすることをお勧めします。 詳細については、「[Orb のオーサリングのベスト プラクティス]({{site.baseurl}}/2.0/orbs-best-practices/#%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89)」を参照してください。

詳細については、以下を参照してください。
* [環境変数名パラメーター型]({{site.baseurl}}/2.0/reusing-config/#環境変数名)
* [Orb のベスト プラクティス]({{site.baseurl}}/2.0/orbs-best-practices/)

## サポートされているプログラミング言語

* 質問: Orb の記述にはどの言語を使用できますか。

* 回答: Orb は [CircleCI YAML 設定ファイル]({{site.baseurl}}/2.0/configuration-reference/)をパッケージ化したものです。

CircleCI Orbs では、再利用可能な CircleCI 設定ファイル</a>をパッケージ化します。たとえば、[コマンド]({{site.baseurl}}/2.0/reusing-config/#%E5%86%8D%E5%88%A9%E7%94%A8%E5%8F%AF%E8%83%BD%E3%81%AA%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%AE%E3%82%AA%E3%83%BC%E3%82%B5%E3%83%AA%E3%83%B3%E3%82%B0)は、特定の [Executor]({{site.baseurl}}/2.0/executor-intro/) 内で実行できますが、その Executor は、
カスタム ジョブで_コマンド_を使用する場合はユーザー、[再利用可能なジョブ]({{site.baseurl}}/2.0/orb-concepts/#%E3%82%B8%E3%83%A7%E3%83%96)を使用する場合は Orb オーサーによって定義されます。 ロジックが実行される環境に応じて、使用する言語を決定してください。</p> 

* 質問: コマンド ロジックの記述にはどのプログラミング言語を使用できますか。

* 回答: 移植性と汎用性に最も優れているのは、POSIX 準拠の bash です。 Orb を共有する予定であれば、この言語を使用することをお勧めします。 ただし、Orb は高い柔軟性を誇り、他のプログラミング言語やツールも自由に実行できます。

**bash**

bash は、すべての Executor において最もよく使用されているため、お勧めの言語です。 bash は、ネイティブの [run]({{site.baseurl}}/2.0/configuration-reference/#run) コマンドを使用して直接、簡単に記述できます (この方法が推奨されます)。 MacOS と Linux のデフォルトのシェルは bash になる予定です。

**対話型インタープリター (Python など)**

ユースケースによっては、Orb が特定の環境にしか存在しないことがあります。 たとえば、Orb が一般的な Python ユーティリティとして使用される場合は、Python を Orb の依存関係として要求した方が合理的です。 [run]({{site.baseurl}}/2.0/configuration-reference/#run) コマンドの shell パラメーターを、次のように変更して使用してください。



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




## コマンドとジョブの比較

* 質問: コマンドとジョブのどちらを作成するべきですか。

* 回答: どちらでもかまいません。ただし、実行したいタスクに大きく依存します。

Orb の[コマンド]({{site.baseurl}}/2.0/orb-concepts/#%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89)は、ユーザーか Orb 開発者がジョブ内で何らかのアクションを実行するために使用します。 コマンド自体は、自身が含まれているジョブを認識しません。ユーザーは自由自在にコマンドを使用できます。 コマンドは、CLI アプリケーションを自動的にインストールしたり、インストールと認証を実行したりする場合などに便利です。

[ジョブ]({{site.baseurl}}/2.0/orb-concepts/#%E3%82%B8%E3%83%A7%E3%83%96)は、特定の実行環境内のステップやジョブの集まりを定義したものです。 ジョブでは通常、実行環境と実行対象のステップを指定するので、自由度はあまりありません。 ジョブは、デプロイなどのタスクを自動化する場合に便利です。 デプロイ ジョブでは、_Python_ などの一般的な実行プラットフォームを選択するだけで、ユーザー コードのチェックアウト、CLI のインストール、デプロイ コマンドの実行を自動的に完了できます。ユーザーが追加の構成を行う必要はほとんど、あるいはまったくありません。

詳細については、以下を参照してください。

* [CircleCI 設定ファイル言語の概要]({{site.baseurl}}/2.0/config-intro/)
* [再利用可能な設定ファイル リファレンス ガイド]({{site.baseurl}}/2.0/reusing-config/)




## 関連項目

- [Orb のオーサリングのベスト プラクティス]({{site.baseurl}}/2.0/orbs-best-practices): 安定版 Orb のオーサリングに関する推奨事項
- [Orb のコンセプト]({{site.baseurl}}/2.0/orb-concepts/): CircleCI Orbs の基本的な概念
- [Orb のパブリッシュ]({{site.baseurl}}/2.0/creating-orbs/): ワークフローやジョブに使用する Orb のパブリッシュ プロセス
- [再利用可能な設定ファイル リファレンス ガイド]({{site.baseurl}}/2.0/reusing-config/): 再利用可能な Orb、コマンド、パラメーター、および Executors の例
- [Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs/): 自分で作成した Orb をテストする方法
- [CircleCI 構成クックブック]({{site.baseurl}}/2.0/configuration-cookbook/): CircleCI Orbs のレシピを構成に使用する詳しい方法
