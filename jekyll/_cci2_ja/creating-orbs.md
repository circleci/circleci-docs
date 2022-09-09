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

オーサリングした Orb は、[セマンティックバージョン]({{site.baseurl}}/ja/orb-concepts/#semantic-versioning) タグを付けてパブリッシュすることで、[Orb レジストリ](https://circleci.com/ja/developer/orbs)に公開できます。

**注:**プライベート Orb の場合、Orb レジストリでは検索できません。 しかし、その Orb の認証ユーザーは URL にアクセスすることができます。
{: class="alert alert-warning"}

![Orb のパブリッシュプロセス]({{ site.baseurl }}/assets/img/docs/orb-publishing-process.png)

[手動]({{site.baseurl}}/ja/orb-author-validate-publish)ではなく、[Orb 開発キット]({{site.baseurl}}/ja/orb-author/#orb-development-kit)を使用して Orb をパブリッシュすると、セマンティックリリースがこのセクションで説明する手順で簡単に行えます。 パブリッシュプロセスの概説は、オーサリングプロセスの開始時に `circleci orb init` コマンドで生成される [README.md](https://github.com/CircleCI-Public/Orb-Template/blob/main/README.md) ファイルを参照してください。

## Orb 開発キットを使った新リリースの公開
{: #issue-a-new-release-with-the-orb-development-kit }

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/ujpEwDJJQ7I" title="YouTube Video Player
" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

以下では、Orb の新しいセマンティックリリースを公開する方法について説明します。

`circleci orb init` コマンドでサンプルの Orb プロジェクトを生成すると、自動的に `alpha` ブランチに移行されます。 ブランチ名は任意で構いませんが、デフォルト以外のブランチで変更することをお勧めします。

変更したら、コミットしブランチにプッシュします。 コミットメッセージには、[Conventional Commits](https://www.conventionalcommits.org/ja) を使用することを強くお勧めします。

下記の手順に従って変更から新しいリリースを作成します。

1. **新しいプルリクエストをデフォルトのブランチに作成します**。`./circleci` ディレクトリに含まれる`config.yml` ファイルと `test-deploy.yml` ファイルは、CircleCI Web アプリで Orb の変更を自動的に
リント、[シェルチェック]({{site.baseurl}}/ja/testing-orbs/#shellcheck)、[レビュー]({{site.baseurl}}/ja/testing-orbs/#review)、[テスト]({{site.baseurl}}/ja/testing-orbs/#integration-testing)します。</p></li> 
   
   1 **すべてのテストが成功したか確認してください。**<br/>テスト結果は、GitHub 上のプルリクエストで直接確認できます。 また、CircleCI Web アプリではパイプライン全体に対する詳細な結果を確認できます。 ワークフローが 2 つあり、`lint-pack` が先に実行され、リント、シェルチェック、レビューを含まれており、2 つ目のワークフローでテストするよう開発版をパブリッシュします。 この `test-deploy` には結合テストが含まれており、準備が整い次第 Orb の安定版をパブリッシュできます。 ![プルリクエストに対して GitHub Checks API から返された Orb のテスト結果レポート]({{site.baseurl}}/assets/img/docs/orbtools-11-checks.png)

1 **"スカッシュ" マージ** <br/> 変更が完了したら、[Conventional Commit メッセージ](https://www.conventionalcommits.org/ja) を使って変更を一つのコミットに "[スカッシュマージ](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#squash-and-merge-your-pull-request-commits)" することをお勧めします（必須ではありません）。
  
  例：
  
        - `fix: x-command parameter from string to integer`
      - `feat: added new x parameter to y command`
1 **タグとリリース**<br/> 変更がデフォルトのブランチにマージされましたが、[ Orb レジストリ](https://circleci.com/ja/developer/orbs)をチェックすると、新しいバージョンはパブリッシュされていません。</ol> 

新しいバージョンの Orb をパブリッシュするには、リリースのタグ付けが必要です。 タグは手動で作成し、プッシュできますが、[GitHub.com のリリース機能](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release)の使用をお勧めします。

GitHub のリリース機能を使うとリリースノートをパブリッシュできます。これはOrb の更新履歴として機能します。

GitHub のドキュメントに従って新しいリリースを作成します。

   1. タグの選択を求められたら、今回のリリースでパブリッシュされる新しいタグを指定します。 Orb の現在のバージョンを [Orb レジストリ](https://circleci.com/developer/ja/orbs)で再度確認します。 どのような変更を行っているかわからない場合は、この後修正することができます。 タグの形式が `vX.Y.Z` であることを確認してください。
   2. [+ Auto-generate release notes] ボタンをクリックします。 変更点のまとめが作成されます。これには前回のリリース以降にマージされたすべてのプルリクエストが含まれます。 [Conventional Commit メッセージ](https://www.conventionalcommits.org/ja) を使用したことがあれば、セマンティックインクリメントの変更タイプはコミットメッセージにより簡単に分かります。 たとえば、前に "fix:" がついた 2 つのコミットがある場合、セマンティックバージョンが "patch" レベルでインクリメントすることが予想されます。
   3. タイトルを追加して、リリースをパブリッシュします。
   4. 完了です！

リリースがパブリッシュされると、タグが作成され、CircleCI パイプラインが最終的にトリガーされます。 この最終的なパイプラインは、以前と同じすべてのステップと追加された最終ジョブ１つを実行します。これにより、新しいバージョンの Orb が作成され、Orbレジストリにパブリッシュされます。

最終的な `orb-tools/publish` ジョブを見ると、Publishing Orb Release ステップで、次のようなメッセージが表示されます。



```shell
Your orb has been published to the CircleCI Orb Registry.
You can view your published orb on the CircleCI Orb Registry at the following link:
https://circleci.com/developer/orbs/orb/circleci/orb-tools?version=11.1.2
```


この例は、[こちらの ](https://app.circleci.com/pipelines/github/CircleCI-Public/orb-tools-orb/947/workflows/342ea92a-4c3d-485b-b89f-8511ebabd12f/jobs/5798)orb-tools Orb からご覧いただけます。

