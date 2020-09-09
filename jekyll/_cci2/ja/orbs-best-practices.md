---
layout: classic-docs
title: "Orb のベスト プラクティス"
short-title: "Orb のベスト プラクティス"
description: "Orb のベスト プラクティス ガイド"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

Orb のオーサリングに関するベスト プラクティスと戦略についてまとめます。 CircleCI の Orb とは、ジョブ、コマンド、Executor などの構成要素をまとめた共有可能なパッケージです。

## ガイドライン

### メタデータ

- すべてのコマンド、ジョブ、Executor、パラメーターに詳細な説明文を付記します。
- Provide a `source_url`, and if available, `home_url` [via the `display` key]({{ site.baseurl }}/2.0/orb-author/#describing-your-orb).
- Define any prerequisites such as obtaining an API key in the description.
- Be consistent and concise in naming your orb elements. For example, don't mix "kebab case" and "snake case."


### 例

- Must have at least 1 [usage example]({{ site.baseurl }}/2.0/orb-author/#providing-usage-examples-of-orbs).
- 例の中で Orb のバージョンは `x.y` と表記します (パッチ バージョンは省略可能)。
- 例には、ジョブが含まれない場合に最上位のジョブや他の基本的な要素を呼び出す、最も汎用的でシンプルなユースケースを使用します。
- If applicable, you may want to showcase the use of [pre and post steps]({{ site.baseurl }}/2.0/reusing-config/#using-pre-and-post-steps) in conjunction with an orb’s job.

### コマンド

- 一般に、すべての Orb には少なくとも 1 つのコマンドが必要です。
- 例外として、Executor を提供することのみを目的にした Orb を作成する場合があります。
- 1 つ以上のパラメーター化可能ステップを組み合わせて、タスクを簡略化します。
- ユーザーは 1 つのタスクを完了するコマンドのみを使用できます。 単独では実行できない、他のコマンドの一部として実行することのみを目的としたコマンドは作成しないでください。
- すべての CLI コマンドを Orb コマンドに変換する必要はありません。 また、パラメーターを持たない 1 行のコマンドに必ずしも Orb コマンド エイリアスを指定する必要はありません。
- Orb で指定された Executor 以外でコマンドを実行する場合は特に、コマンドの説明文に依存関係や前提条件を明記する必要があります。
- It is a good idea to check for the existence of required parameters, environment variables or other dependencies as a part of your command.

以下に例を示します。
```
if [ -z "$<<parameters.SECRET_API_KEY>>" ]; then
  echo "Error: The parameter SECRET_API_KEY is empty. Please ensure the environment variable <<parameters.SECRET_API_KEY>> has been added."
  exit 1
fi
```

### パラメーター

- ユーザー入力が必要な場合を除き、パラメーターには可能な限りデフォルト値を使用します。
- Utilize the [“env_var_name” parameter type]({{ site.baseurl }}/2.0/reusing-config/#environment-variable-name) to secure API keys, webhook urls or other sensitive data.
- [Injecting steps as a parameter]({{ site.baseurl }}/2.0/reusing-config/#steps) is a useful way to run user defined steps within a job between your orb-defined steps.Good for if you need to perform an action both before and after user-defined tasks - for instance, you could run user-provided steps between your caching logic inside the command.

**バイナリとツールのインストール**
  - install-path パラメーターを設定し (/usr/local/bin のデフォルト値が理想的)、このパラメーター化された場所にバイナリをインストールします。 This may often avoid the issue of needing `root` privileges in environments where the user may not have root.
  - `root` が必要なユースケースでは、事前チェックを追加して、ユーザーが root 権限を持っているかどうかを確認し、ユーザーに適切な権限が必要な場合にはその旨を明確なエラー メッセージでユーザーに警告します。
  - Add the binary to the user's path via `$BASH_ENV` so the user may call the binary from a separate [run]({{ site.baseurl }}/2.0/configuration-reference/#run) statement. デフォルト以外のパスにインストールするときにはこの方法で実行する必要があります。 以下に例を示します。
```
echo `export PATH="$PATH:<<parameters.install-path>>"` >> $BASH_ENV
```


### ジョブ

 - ジョブは、Orb 内で定義されたコマンドを使用して、その Orb の一般的なユース ケースをオーケストレーションする必要があります。
 - 柔軟性を考慮します。
 - ユーザーが事後ステップ、事前ステップ、パラメーターとしてのステップをどのように利用できるかを考慮します。
 - パススルー パラメーターの作成を検討します。
 - パラメーターを受け入れる Executor またはコマンドを使用するジョブで、Executor またはコマンドにパラメーターを渡すには、ジョブにもそれらのパラメーターが必要です。
- Executor をハードコーディングしてはなりません。 イメージまたはタグを上書きできるパラメーター化可能な Executor を使用します (‘default’ など)。

### Executor

- サポートされている OS (MacOs、Windows、Docker、VM) ごとに少なくとも 1 つの Executor が必要です。
- Must include one executor named `default`.
- 含まれているイメージに問題が発生した場合に、ユーザーがバージョンやタグを上書きできるよう、Executor をパラメーター化する必要があります。

### インポートする Orb

- 変更不可の完全なセマンティック バージョンの Orb をインポートする必要があります。 こうすることで、ロック ファイルなど、依存関係のある Orb への変更による影響から Orb を保護できます。
- [パートナーのみ] - 承認済みおよびパートナーの名前空間、または同じ名前空間の Orb のみをインポートする必要があります。

### 保全性

- [Orb スターター キット (ベータ版)](https://github.com/CircleCI-Public/orb-starter-kit) を使用して、完全に自動化されたビルド > テスト > デプロイのワークフローで Orb の CI/CD をデプロイします。 これで、以降のすべてが処理されます。
- オプション: Orb をパターンに分解して使用すると、個別の Orb コンポーネントのメンテナンスがさらに簡単になります。

### Sample Data

- Sample data neccesary for testing your Orb in CI/CD pipelines should be kept as small as possible, e.g a single `composer.json` or `package.json` file with minimal dependencies.
- Sample data should live under the `sample/` directory in the orb's repository, when possible.

### Deployment

#### バージョニング

- Utilize [semver versioning](https://semver.org/) (x.y.z)
- Major: Incompatible changes
- Minor: Add new features (backwards compatible)
- Patch: Minor bug fixes, metadata updates, or other safe actions.

Orb のデプロイに関するベスト プラクティス ガイドを参照してください (近日追加予定)。

このセクションは、Orb スターター キットによって自動的に処理されます。

### GitHub/Bitbucket

GitHub では、"_topics_" でリポジトリにタグ付けできます。 トピックは GitHub 検索でデータポイントとして使用されます。さらに、GitHub の [Explore] ページでは、このタグを使用してリポジトリがグループ化されます。 Orb を格納するリポジトリには、`circleci-orbs` のトピックを使用することをお勧めします。 CircleCI Orb、パートナー Orb、コミュニティ Orb のどれであっても、このトピックを使用することで、Orb レポジトリが[こちらのページ](https://github.com/topics/circleci-orbs)に掲載されます。

[トピックでリポジトリを分類する](https://help.github.com/en/articles/classifying-your-repository-with-topics)
