---
layout: classic-docs
title: "Orb のパブリッシュ"
short-title: "Orb のパブリッシュ"
description: "Orb レジストリへの Orb のパブリッシュ"
categories:
  - はじめよう
order: 1
version:
  - クラウド
---

ここでは、Orb のパブリッシュ手順について説明します。

* 目次
{:toc}

## はじめに
{: #introduction }

オーサリングした Orb は、[セマンティック バージョン]({{site.baseurl}}/2.0/orb-concepts/#semantic-versioning) タグを付けてパブリッシュすることで、[Orb レジストリ](https://circleci.com/developer/ja/orbs)に公開できます。

![Orb のパブリッシュプロセス]({{ site.baseurl }}/assets/img/docs/orb-publishing-process.png)

## Orb 開発キット
{: #orb-development-kit }

[手動]({{site.baseurl}}/ja/2.0/orb-author-validate-publish)ではなく、[Orb 開発キット]({{site.baseurl}}/2.0/orb-author/#orb-development-kit)を使用して Orb をパブリッシュすると、次のセクションで説明する手順に従ってセマンティック リリースを簡単に行えます。 パブリッシュプロセスの簡単な概要については、オーサリング プロセスの開始時に `circleci orb init` コマンドで生成される [README.md](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/README.md) ファイルを参照してください。

### 新リリースの公開
{: #issue-a-new-release }

以下では、Orb の新しいセマンティックリリースを公開する方法について説明します。 `circleci orb init` コマンドでサンプルの Orb プロジェクトを生成すると、自動的に `alpha` ブランチに移行されます。 このブランチは、リポジトリの非デフォルトのブランチに新機能やバグ修正、パッチなどを作成するためのものであり、名前に深い意味はありません。 コードの追加や更新を行いリリースを公開する準備が整ったら、以下の手順を行います。

1. **デフォルトのブランチに新しいプルリクエストを作成します。** <br/>新しいリリースは、デフォルトのブランチへのマージ時にのみパブリッシュされます。 Orb の[パッケージ化]({{site.baseurl}}/2.0/orb-concepts/#orb-packing)、[テスト]({{site.baseurl}}/2.0/testing-orbs/)、パブリッシュは、サンプルに含まれる [`.circleci/config.yml` 設定ファイル](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml)により自動的に行われます。 この CI パイプラインでは、デフォルトで[インテグレーションテスト]({{site.baseurl}}/2.0/testing-orbs/#integration-testing)と[ユニットテスト]({{site.baseurl}}/2.0/testing-orbs/#unit-testing)が有効になっています。 Orb が正常に機能するかを確認するため、少なくともインテグレーションテストは有効にしておくことを強くお勧めします。 Orb でスクリプトを使用しない場合や、現時点ではユニットテストを有効にしたくない場合は、[bats/run](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L49) ジョブをコメントアウトしてください。

1. **すべてのテストが成功したか確認してください。**<br/>テスト結果は、GitHub 上においてプルリクエスト内で直接確認できます。 また、CircleCI.com ではパイプライン全体に対する詳細な結果を確認できます。 ![プルリクエストに対して GitHub Checks API から返された Orb のテスト結果レポート]({{site.baseurl}}/assets/img/docs/orb-dev-kit-gh-checks.png)

1. **プルリクエストのタイトルに特別なセマンティック バージョン タグを付けます。**<br/>含まれている CI 設定では、[semver ]({{site.baseurl}}/2.0/orb-concepts/#semantic-versioning)リリースで指定された正しいタグがコミットメッセージに含まれている場合、[ orb-tools Orb ](https://circleci.com/developer/orbs)を使用して、デフォルトブランチでテストに合格した Orb を自動的にパブリッシュします。<br/>タグテンプレートは、`[semver:<increment>]` のようになります。`<increment>` は、次のいずれかの値に置き換えられます。

    | increment の値 | 説明                             |
    | ------------ | ------------------------------ |
    | major        | リリースのバージョン番号を 1.0.0 だけ増やして公開する |
    | minor        | リリースのバージョン番号を x.1.0 だけ増やして公開する |
    | patch        | リリースのバージョン番号を x.x.1 だけ増やして公開する |
    | skip         | リリースを公開しない                     |
    {: class="table table-striped"}

    たとえば、`alpha` ブランチから Orb のメジャーバージョン リリースを初めて公開する場合は、プルリクエストのタイトルを `[semver:major] 初回 Orb リリース` のように設定します。 ![Orb の初回メジャー リリース - プル リクエスト]({{site.baseurl}}/assets/img/docs/orb_semver_release_pr.png)

1. **「スカッシュ」マージ**<br/>[スカッシュ](https://docs.github.com/ja/github/collaborating-with-issues-and-pull-requests/about-pull-request-merges#squash-and-merge-your-pull-request-commits) マージを行うと、デフォルトのブランチへのマージ時にブランチが 1 つのコミットにまとめられるだけでなく、プルリクエストのタイトルがコミットメッセージとして維持されます。

    マージする前に`[semver:<increment>]` が以下のように、コミットメッセージのサブジェクト/先頭行にあることを確認してください。 Bitbucket では、プルリクエストのタイトルがコミットメッセージのサブジェクト/先頭行ではなく本文に残っている場合があります。 ![プルリクエストをスカッシュマージして semver タイトルを保持する]({{site.baseurl}}/assets/img/docs/orb_semver_squash_merge.png)

1. **完了です！**<br/>[CircleCI アプリケーション](https://app.circleci.com/)にアクセスすると、Orb のパブリッシュ パイプラインの進捗状況を確認できます。 このパイプラインが完了したら、[Orb レジストリ](https://circleci.com/developer/ja/orbs) に Orb が公開されます。

### Orb のパブリッシュプロセス
{: #orb-publishing-process }

ここでは、Orb 開発キットについて掘り下げ、Orb のパブリッシュに関係するコンポーネントについて説明します。

[circleci orb init]({{site.baseurl}}/2.0/orb-author/#getting-started) コマンドは、最適な Orb 開発パイプラインで設計された定義済みの CircleCI 設定ファイルを含む [Orb テンプレートリポジトリ](https://github.com/CircleCI-Public/Orb-Project-Template)を、Orb 用にクローンします。

この中の [/.circleci](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/.circleci) ディレクトリに、サンプル ワークフローの詳細を示した README が含まれています。

Orb パイプラインは、次の 2 つのワークフローで実行されます。
* [test-pack](#test-pack)
* [integration-test_deploy](#integration-test_deploy)

#### test-pack
{: #test-pack }

2 つのワークフローのうち、[`test-pack`](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L40) が先に実行され、 このワークフローは、**いずれかの**ブランチのリポジトリにコードがコミットされるたびに実行されます。

この`test-pack` ワークフローでは、開発版の Orb のパブリッシュ前に行うすべてのテストを実行します。 インテグレーションテスト (次のワークフローで実施) は、開発版の Orb がパブリッシュされテストを実行可能になるまで実行できません。

[orb-tools/publish-dev](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L62) ジョブで開発版の Orb を作成するので、このジョブを実行するために、[制限付きコンテキスト](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L62)で保護されているパーソナルアクセス トークンへのアクセス権が必要になります。 ここで制限付きコンテキストを使用する理由は、トークンを環境変数として保存することで、ジョブをトリガーできるユーザーをこのコンテキストへのアクセス権を持つ人だけに制限し、パブリッシュステージを "保護" するためです。

このワークフローの実行内容は以下のとおりです。

* パーソナルアクセス トークンへの特別なアクセス権が不要なテストが実行されます。このステージは、オープンソースのプルリクエストから実行可能です。
* [orb-tools/publish-dev](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L62) ジョブにより、開発版の Orb が次のように 2 回パブリッシュされます。

    | パブリッシュされる開発タグ                                          | 説明                                         |
    | ------------------------------------------------------ | ------------------------------------------ |
    | `<namespace>/<orb>@dev:<branch>`     | ブランチ名にリンクされる開発タグです。 設定ファイルのテストを行う場合に使用します。 |
    | `<namespace>/<orb>@dev:${CIRCLE_SHA1:0:7}` | この SHA に固有の開発タグです。 次のワークフローで使用します。         |
    {: class="table table-striped"}

テストジョブの詳細については、[Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs)を参照してください。

#### integration-test_deploy
{: #integration-testdeploy }

CircleCI 製の Orb 開発パイプラインで実行されるワークフローは、次の [`integration-test_deploy`](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L78) で最後です。 このワークフローは、`test-pack` ワークフローの完了時に API から自動的にトリガーされます。 このワークフローには、`test-pack` ワークフローで独自に生成された[開発版]({{site.baseurl}}/2.0/orb-concepts/#orb-versions-development-vs-production-vs-inline)の Orb へのアクセス権が付与されています。

このパイプラインの第 2 ステージでは[インテグレーションテスト]({{site.baseurl}}/2.0/testing-orbs/#integration-testing)を実行し、開発版に追加およびパブリッシュされた新しい Orb の動作を確認します。

インテグレーションテストが完了すると、デフォルトのブランチでのみデプロイジョブが実行されます。 [orb-tools/dev-promote-prod-from-commit-subject](https://circleci.com/developer/ja/orbs/orb/circleci/orb-tools#commands-dev-promote-from-commit-subject) により、SHA 固有の開発版の Orb が取得され、セマンティックバージョン付きの公開バージョンにプロモートされます。

{% raw %}
```yml
      - orb-tools/dev-promote-prod-from-commit-subject:
          orb-name: <namespace>/<orb-name>
          context: <publishing-context>
          add-pr-comment: false
          fail-if-semver-not-indicated: true
          publish-version-tag: false
          requires:
            - integration-test-1
          filters:
            branches:
              only: <your default branch>
```
{% endraw %}

デフォルトでは、`fail-if-semver-not-indicated` パラメーターは true に設定されており、タイトルに適切な[セマンティック バージョン タグ](#issue-a-new-release)が含まれないコミットのビルドはすべて失敗します。

追加機能として、GitHub にバージョン タグをパブリッシュし、コメントからプルリクエストに新しいバージョンを自動で反映することなども可能です。

##### GitHub へのバージョンタグのパブリッシュ
{: #publish-version-tag-to-github }

パブリッシュした CircleCI Orb は、[Orb レジストリ](https://circleci.com/developer/ja/orbs)でホストおよび公開されます。 ただし、GitHub 上でリリースを追跡する必要がある場合は、CircleCI からバージョンタグを自動的にパブリッシュできます。

CircleCI から GitHub にタグをプッシュするには、[書き込みアクセス権のあるデプロイ キー]({{site.baseurl}}/ja/2.0/add-ssh-key/)が必要です。 リンク先の記事を参照して、デプロイキーを生成し追加してください。 追加が完了すると、そのキー用に生成された、`"SO:ME:FIN:G:ER:PR:IN:T"` のような "フィンガープリント" が表示されます。 この SSH フィンガープリントを、`orb-tools/dev-promote-prod-from-commit-subject` ジョブの `ssh-fingerprints` パラメーターに追加します。

{% raw %}
```yml
      - orb-tools/dev-promote-prod-from-commit-subject:
          publish-version-tag: true
          ssh-fingerprints: "SO:ME:FIN:G:ER:PR:IN:T"
```
{% endraw %}

利用可能なコマンド、ジョブ、パラメーターの一覧については、[Orb レジストリ](https://circleci.com/developer/ja/orbs/orb/circleci/orb-tools)の [orb-tools Orb](https://circleci.com/developer/ja/orbs/orb/circleci/orb-tools) を参照してください。
