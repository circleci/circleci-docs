---
layout: classic-docs
title: "Orb のパブリッシュ"
short-title: "Orb のパブリッシュ"
description: "Orb レジストリへの Orb のパブリッシュ"
categories:
  - getting-started
order: 1
version:
  - クラウド
---

ここでは、Orb のパブリッシュ手順について説明します。

* 目次
{:toc}

## はじめに

オーサリングした Orb は、[セマンティック バージョン]({{site.baseurl}}/2.0/orb-concepts/#orbs-%E3%81%A7%E3%81%AE%E3%82%BB%E3%83%9E%E3%83%B3%E3%83%86%E3%82%A3%E3%83%83%E3%82%AF-%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0) タグを付けてパブリッシュすることで、[Orb レジストリ](https://circleci.com/developer/ja/orbs)に公開できます。

![Orb のパブリッシュ プロセス]({{ site.baseurl }}/assets/img/docs/orb-publishing-process.png)

## Orb development kit

[手動]({{site.baseurl}}/2.0/orb-author-validate-publish)ではなく、[Orb 開発キット]({{site.baseurl}}/2.0/orb-author/#orb-development-kit)を使用して Orb をパブリッシュすると、次のセクションで説明する手順に従ってセマンティック リリースを簡単に行えます。 パブリッシュ プロセスの簡単な概要については、オーサリング プロセスの開始時に `circleci orb init` コマンドで生成される [README.md](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/README.md) ファイルを参照してください。

### Issue a new release

以下では、Orb の新しいセマンティック リリースを公開する方法について説明します。 `circleci orb init` コマンドでサンプルの Orb プロジェクトを生成すると、自動的に `alpha` ブランチに移行されます。 このブランチは、リポジトリの非デフォルトのブランチに新機能やバグ修正、パッチなどを作成するためのものであり、名前に深い意味はありません。 コードの追加や更新を行いリリースを公開する準備が整ったら、以下の手順を行います。

1. **デフォルト ブランチに対して新しいプル リクエストを作成します。**   
    新しいリリースは、デフォルト ブランチへのマージ時にのみパブリッシュされます。 Orb の[パッケージ化]({{site.baseurl}}/2.0/orb-concepts/#orb-packing)、[テスト]({{site.baseurl}}/2.0/testing-orbs/)、パブリッシュは、サンプルに含まれる [`.circleci/config.yml` 設定ファイル](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml)により自動的に行われます。 この CI パイプラインでは、デフォルトで[結合テスト]({{site.baseurl}}/2.0/testing-orbs/#integration-testing)と[単体テスト]({{site.baseurl}}/2.0/testing-orbs/#unit-testing)が有効になっています。 Orb が正常に機能するかを確認するため、少なくとも結合テストは有効にしておくことを強くお勧めします。 Orb でスクリプトを使用しない場合や、現時点では単体テストを有効にしたくない場合は、[bats/run](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L49) ジョブをコメントアウトしてください。

2. **すべてのテストに合格したことを確認します。**   
    テスト結果は、GitHub 上においてプル リクエスト内で直接確認できます。また、CircleCI.com ではパイプライン全体に対する詳細な結果を確認できます。 ![プル リクエストに対して GitHub Checks API から返された Orb のテスト結果レポート]({{site.baseurl}}/assets/img/docs/orb-dev-kit-gh-checks.png)

3. **プル リクエストのタイトルに特別なセマンティック バージョン タグを付けます。**   
    コミット メッセージに目的の[セマンティック バージョン]({{site.baseurl}}/2.0/orb-concepts/#orbs-%E3%81%A7%E3%81%AE%E3%82%BB%E3%83%9E%E3%83%B3%E3%83%86%E3%82%A3%E3%83%83%E3%82%AF-%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0) リリースを指すタグを適切に設定すると、サンプルに含まれる CI 設定ファイルの [orb-tools orb](https://circleci.com/developer/ja/orbs) により、テストに合格した Orb がデフォルト ブランチに自動でパブリッシュされます。  
    タグの書式は `[semver:<increment>]` です。ここで、`<increment>` は次のいずれかの値に置き換えます。
    
    | increment の値 | 説明                             |
    | ------------ | ------------------------------ |
    | major        | リリースのバージョン番号を 1.0.0 だけ増やして公開する |
    | minor        | リリースのバージョン番号を x.1.0 だけ増やして公開する |
    | patch        | リリースのバージョン番号を x.x.1 だけ増やして公開する |
    | skip         | リリースを公開しない                     |
    {: class="table table-striped"}

    たとえば、`alpha` ブランチから Orb のメジャー バージョン リリースを初めて公開する場合は、プル リクエストのタイトルを `[semver:major] 初回 Orb リリース` のように設定します。 ![Orb の初回メジャー リリース - プル リクエスト]({{site.baseurl}}/assets/img/docs/orb_semver_release_pr.png)

4. **"スカッシュ" マージを行います。**   
    [スカッシュ](https://docs.github.com/ja/github/collaborating-with-issues-and-pull-requests/about-pull-request-merges#squash-and-merge-your-pull-request-commits) マージを行うと、デフォルト ブランチへのマージ時にブランチが 1 つのコミットにまとめられるだけでなく、プル リクエストのタイトルがコミット メッセージとして維持されます。 ![プル リクエストをスカッシュ マージして semver タイトルを保持する]({{site.baseurl}}/assets/img/docs/orb_semver_squash_merge.png)

5. **お疲れさまでした。**   
    [CircleCI アプリケーション](https://app.circleci.com/)にアクセスすると、Orb のパブリッシュ パイプラインの進捗状況を確認できます。 このパイプラインが完了したら、[Orb レジストリ](https://circleci.com/developer/ja/orbs) に Orb が公開されます。

### Orb publishing process

ここでは、Orb 開発キットについて掘り下げ、Orb のパブリッシュに関係するコンポーネントについて説明します。

[circleci orb init]({{site.baseurl}}/2.0/orb-author/#getting-started) コマンドは、Orb 開発パイプラインに最適な CircleCI 製設定ファイルなどを含む [Orb テンプレート リポジトリ](https://github.com/CircleCI-Public/Orb-Project-Template)を、Orb 用にクローンします。

この中の [/.circleci](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/.circleci) ディレクトリに、サンプル ワークフローの詳細を示した README が含まれています。

Orb パイプラインには次の 2 つのワークフローがあります。

* [test-pack](#test-pack)
* [integration-test_deploy](#integration-test_deploy)

#### test-pack

2 つのワークフローのうち、実行順が先であるのは [`test-pack`](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L40) です。このワークフローは、**いずれかの**ブランチのリポジトリにコードがコミットされるたびに実行されます。

`test-pack` ワークフローでは、開発版の Orb のパブリッシュ前に行うすべてのテストを実行します。 結合テスト (次のワークフローで実施) は、開発版の Orb がパブリッシュされテストを実行可能になるまで実行できません。

[orb-tools/publish-dev](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L62) ジョブで開発版の Orb を作成するので、このジョブを実行するために、[制限付きコンテキスト]({{site.baseurl}}/2.0/contexts/#%E3%82%B3%E3%83%B3%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%81%AE%E5%88%B6%E9%99%90)で保護されているパーソナル アクセス トークンへのアクセス権が必要になります。 ここで制限付きコンテキストを使用する理由は、トークンを環境変数として保存することで、ジョブをトリガー可能なユーザーをこのコンテキストにアクセス可能な人だけに制限し、パブリッシュ ステージを "保護" するためです。

このワークフローの実行内容は以下のとおりです。

* パーソナル アクセス トークンへの特別なアクセス権が不要なテストが実行されます。このステージは、オープン ソースのプル リクエストから実行可能です。
* ワークフローが[保留](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L54)状態になり、[手動での承認]({{site.baseurl}}/2.0/workflows/#%E6%89%8B%E5%8B%95%E6%89%BF%E8%AA%8D%E5%BE%8C%E3%81%AB%E5%87%A6%E7%90%86%E3%82%92%E7%B6%9A%E8%A1%8C%E3%81%99%E3%82%8B%E3%83%AF%E3%83%BC%E3%82%AF%E3%83%95%E3%83%AD%E3%83%BC)を求められます。 ![開発版 Orb のパブリッシュを手動で承認する]({{site.baseurl}}/assets/img/docs/orb-publish-approval.png) CircleCI アプリケーションにアラート プロンプトが表示され、ボタンをクリックするまでワークフローは保留状態になります。 
* 手動承認によって認証が行われると、以降のジョブも自動的に認証され、制限付きコンテキストへのアクセス権が付与されます。 このようにすることで、オープンソースのプル リクエストによる Orb に対するビルドを可能にしながら、悪意のあるコードを防止しています。
* ワークフローが承認されると、[orb-tools/publish-dev](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L62) ジョブにより、開発版の Orb が次のように 2 回パブリッシュされます。
    
    | パブリッシュされる開発タグ                                          | 説明                                         |
    | ------------------------------------------------------ | ------------------------------------------ |
    | `<namespace>/<orb>@dev:<branch>`     | ブランチ名にリンクされる開発タグです。 設定ファイルのテストを行う場合に使用します。 |
    | `<namespace>/<orb>@dev:${CIRCLE_SHA1:0:7}` | この SHA に固有の開発タグです。 次のワークフローで使用します。         |
    {: class="table table-striped"}

テスト ジョブの詳細については、「[Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs)」を参照してください。

#### integration-test_deploy

CircleCI 製の Orb 開発パイプラインで実行されるワークフローは、次の [`integration-test_deploy`](https://github.com/CircleCI-Public/Orb-Project-Template/blob/0354adde8405564ee7fc77e21335090a080daebf/.circleci/config.yml#L78) で最後です。 このワークフローは、`test-pack` ワークフローの完了時に API から自動的にトリガーされます。 このワークフローには、`test-pack` ワークフローで独自に生成された[開発版]({{site.baseurl}}/2.0/orb-concepts/#orb-versions-development-vs-production-vs-inline)の Orb へのアクセス権が付与されています。

このパイプラインの第 2 ステージでは[結合テスト]({{site.baseurl}}/2.0/testing-orbs/#integration-testing)を実行し、開発版に追加およびパブリッシュされた新しい Orb の動作を確認します。

結合テストが完了すると、デフォルト ブランチでのみデプロイ ジョブが実行されます。 [orb-tools/dev-promote-prod-from-commit-subject](https://circleci.com/developer/ja/orbs/orb/circleci/orb-tools#commands-dev-promote-from-commit-subject) により、SHA 固有の開発版の Orb が取得され、セマンティック バージョン付きの公開バージョンにプロモートされます。

{% raw %}
<br />      - orb-tools/dev-promote-prod-from-commit-subject:
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
{% endraw %}

デフォルトでは、`fail-if-semver-not-indicated` パラメーターは true に設定されており、タイトルに適切な[セマンティック バージョン タグ](#issue-a-new-release)が含まれないコミットのビルドはすべて失敗します。

追加機能として、GitHub にバージョン タグをパブリッシュし、コメントからプル リクエストに新しいバージョンを自動で反映することなども可能です。

##### Publish version tag to GitHub

パブリッシュした CircleCI Orb は、[Orb レジストリ](https://circleci.com/developer/ja/orbs)でホストおよび公開されます。ただし、GitHub 上でリリースを追跡する必要がある場合は、CircleCI からバージョン タグを自動的にパブリッシュできます。

CircleCI から GitHub にタグをプッシュするには、[書き込みアクセス権のあるデプロイ キー]({{site.baseurl}}/2.0/add-ssh-key/#circleci-cloud)が必要です。 リンク先の記事を参照して、デプロイ キーを生成し追加してください。 追加が完了すると、そのキー用に生成された、`"SO:ME:FIN:G:ER:PR:IN:T"` のような "フィンガープリント" が表示されます。 この SSH フィンガープリントを、`orb-tools/dev-promote-prod-from-commit-subject` ジョブの `ssh-fingerprints` パラメーターに追加します。

{% raw %}
<br />      - orb-tools/dev-promote-prod-from-commit-subject:
              publish-version-tag: true
              ssh-fingerprints: "SO:ME:FIN:G:ER:PR:IN:T"
{% endraw %}

利用可能なコマンド、ジョブ、パラメーターの一覧については、[Orb レジストリ](https://circleci.com/developer/ja/orbs/orb/circleci/orb-tools) の[orb-tools orb](https://circleci.com/developer/ja/orbs/orb/circleci/orb-tools) を参照してください。