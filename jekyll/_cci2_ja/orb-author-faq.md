---
layout: classic-docs
title: "Orbオーサリングに関するよくあるご質問"
short-title: "Orbオーサリングに関するよくあるご質問"
description: "Orbオーサリングに関するよくあるご質問"
order: 20
---

よく寄せられるご質問や技術的な問題など、Orbs のオーサリングに役立つ情報をまとめました。

* 目次
{:toc}



## 名前空間の要求または Orb のパブリッシュに伴うエラー

* 質問: 名前空間を要求または安定版 Orb をパブリッシュしようとするとエラーが発生します。

* 回答: 組織オーナーまたは管理者でない可能性があります。

組織が要求できる名前空間は 1 つだけです。 組織の名前空間を要求するには、認証中のユーザーがその組織に対するオーナーまたは管理者の権限を持っている必要があります。

適切な権限がない場合、以下のエラー メッセージが表示されます。


> Error: Unable to find organization YOUR_ORG_NAME of vcs-type GITHUB: Must have member permission.: the organization 'YOUR_ORG_NAME' under 'GITHUB' VCS-type does not exist. Did you misspell the organization or VCS?


詳細については、「[Orb クイックスタート]({{site.baseurl}}/ja/2.0/orb-author/#orb-クイックスタート)」を参照してください。


## API トークンの保護

* 質問: ユーザーの API トークンなどの機密情報を保護するにはどうしたらよいですか。

* 回答: API キーのパラメーターとして `env_var_name` パラメーター型を使用します。 このパラメーター型は、有効な POSIX 環境変数名の文字列のみを有効な入力値として受け入れます。 パラメーターの説明で、この環境変数を追加するようにユーザーに指示してください。

詳細については、以下を参照してください。
* [環境変数名]({{site.baseurl}}/ja/2.0/reusing-config/#環境変数名)
* [Orb のベスト プラクティス]({{site.baseurl}}/ja/2.0/orbs-best-practices/)

## 環境変数

* 質問: ユーザーに環境変数の追加を求めるにはどうしたらよいですか。
* 回答: 環境変数名のパラメーターを作成してください。_変更できない_静的な名前を持つ環境変数でも同じように対応します。 そして、そのパラメーターに正しいデフォルト値を割り当てます。 変更できない環境変数の場合は、その旨をパラメーターの説明に記載します。 また、変更できる環境変数かどうかを問わず、API キーを取得できる場所をユーザーに示す必要があります。

必須の環境変数はバリデーションすることをお勧めします。 [こちらのドキュメント]({{site.baseurl}}/ja/2.0/orbs-best-practices/#コマンド)でも取り上げています。

詳細については、以下を参照してください。
* [環境変数名パラメーター型]({{site.baseurl}}/ja/2.0/reusing-config/#環境変数名)
* [Orb のベスト プラクティス]({{site.baseurl}}/ja/2.0/orbs-best-practices/)

## サポートされているプログラミング言語

* 質問: Orb の記述にはどの言語を使用できますか。
* 回答: Orb は [CircleCI 構成の YAML ファイル]({{site.baseurl}}/ja/2.0/configuration-reference/)の言語パッケージです。

CircleCI Orbs は、[再利用可能な CircleCI 設定ファイル]({{site.baseurl}}/ja/2.0/reusing-config/)をパッケージ化します。たとえば、[コマンド]({{site.baseurl}}/ja/2.0/reusing-config/#再利用可能なコマンドのオーサリング)は、特定の [Executor]({{site.baseurl}}/ja/2.0/executor-intro/) 内で実行できますが、その Executor は、カスタム ジョブ内で _command_ を使用する場合はユーザー、[再利用可能ジョブ]({{site.baseurl}}/ja/2.0/orb-author-intro/#ジョブ)を使用する場合は Orb オーサーによって定義されます。 ロジックが実行される環境に応じて、使用する言語を決定してください。

* 質問: コマンド ロジックの記述にはどのプログラミング言語を使用できますか。
* 回答: 移植可能性と汎用性に最も優れているのは、POSIX 準拠の Bash です。 Orb を共有する予定であれば、この言語を使用することをお勧めします。 ただし、Orb は高い柔軟性を誇り、他のプログラミング言語やツールでも自由に実行できます。

**Bash**

Bash は、すべての Executor において最もよく使用されているため、お勧めの言語です。 Bash は、ネイティブの [run]({{site.baseurl}}/ja/2.0/configuration-reference/#run) コマンドを使用して直接、簡単に記述できます (そしてそれが推奨されます)。 MacOS と Linux のデフォルトのシェルは Bash になる予定です。

**対話型インタープリター (Python など)**

ユース ケースによっては、Orb が特定の環境にしか存在しないことがあります。 たとえば、Orb が一般的な Python ユーティリティとして使用される場合は、Python を Orb の依存関係として要求した方が合理的です。 シェル パラメーターを変更して [run]({{site.baseurl}}/ja/2.0/configuration-reference/#run) コマンドを使用できます。

```yaml
steps:
  - run:
    shell: /usr/bin/python3
    command: |
      place = "World"
      print("Hello " + place + "!")
```

**バイナリ**

このオプションは、可能な限り使用しないことを強くお勧めします。 時に、CLI ツールなどのリモート バイナリ ファイルをフェッチしなければならない場合があります。 これらのバイナリは、パッケージ マネージャーからフェッチするか、可能な場合は GitHub リリースなどの VCS でホスティングする必要があります。

Homebrew を [AWS Serverless Orb](https://circleci.com/developer/ja/orbs/orb/circleci/aws-serverless#commands-install) の一部としてインストールする例を以下に示します。

```yaml
steps:
  - run:
    command: >
      curl -fsSL
      "https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh" | bash
      /home/linuxbrew/.linuxbrew/bin/brew shellenv >> $BASH_ENV
    name: Homebrew のインストール (Linux 向け)
```




## 関連項目
- [Orb のベスト プラクティス]({{site.baseurl}}/ja/2.0/orbs-best-practices): 安定版 Orb の作成に関する推奨事項
- [Orb のコンセプト]({{site.baseurl}}/ja/2.0/using-orbs/): CircleCI Orbs の基本的な概念
- [Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/): ワークフローやジョブに使用する Orb のパブリッシュ プロセス
- [Orbs リファレンス ガイド]({{site.baseurl}}/ja/2.0/reusing-config/): 再利用可能な Orbs、コマンド、パラメーター、および Executors の例
- [Orb のテスト手法]({{site.baseurl}}/ja/2.0/testing-orbs/): 独自に作成した Orbs のテスト方法
- [CircleCI 構成クックブック]({{site.baseurl}}/ja/2.0/configuration-cookbook/#構成レシピ): CircleCI Orbs のレシピを構成に使用する詳しい方法
