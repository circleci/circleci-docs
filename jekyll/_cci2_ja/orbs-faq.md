---
layout: classic-docs
title: "Orb に関するよくあるご質問"
short-title: "Orb に関するよくあるご質問"
description: "Orb に関するよくあるご質問"
order: 20
version:
  - クラウド
  - Server v3.x
---

よく寄せられるご質問や技術的な問題など、Orb の使用時に役立つ情報をまとめました。

## プライベート Orb
{: #private-orbs }

* **質問:** Orb はプライベートにできますか？

* **回答:** [現在のすべての料金プラン](https://circleci.com/ja/pricing/)で[プライベート Orb]({{site.baseurl}}/ja/orb-intro/#private-orbs) をご利用いただけます。

## コマンドとジョブの違い
{: #difference-between-commands-and-jobs }

* **質問:** コマンドとジョブの違いは何ですか？

* **回答:** [コマンド]({{site.baseurl}}/ja/reusing-config/#the-commands-key)と[ジョブ]({{site.baseurl}}/ja/reusing-config/#authoring-parameterized-jobs)はどちらも Orb 内で使用される要素です。 _コマンド_ には、Orb のロジックを含む一つまたは複数の[ステップ]({{site.baseurl}}/ja/configuration-reference/#steps)が含まれます。 コマンドは多くの場合、シェルコード (バッシュ) を実行します。 _ジョブ_ は、実行するステップやコマンドの定義であり、 _かつ_、 ステップやコマンドを実行する [Executor]({{site.baseurl}}/ja/reusing-config/#the-executors-key) です。 _コマンド_は、ジョブ内で呼び出されます。 _ジョブ_ は、 _[ワークフロー]({{site.baseurl}}/ja/workflows/#workflows-configuration-examples)_ を使ってオーケストレーションされます。

## CircleCI Server での Orb の使用
{: #using-orbs-on-circleci-server }

* **質問: ** Orb はプライベートなインストール環境で使用できますか？

* **回答: ** Orb は、CircleCI Server v3 でご利用いただけます。 CircleCI Server での Orb のインポートと使用に関しては、[CircleCI Server v3.x の Orb ガイド]({{site.baseurl}}/ja/server-3-operator-orbs/)を参照して下さい。

  CircleCI Server v2.19.x では Orb は使用できませんが、コミットの前に設定を処理すると、Orb を変換して使用できます。 コミット前の Git Hook の使用については、[サーバーでの Orb の使用](https://discuss.circleci.com/t/orbs-on-server-solution/36264)を参照して下さい。

## Orb に関する問題をレポートする
{: #report-an-issue-with-an-orb }

* **質問: ** Orb  に関するバグや問題をレポートする方法は？

* **回答: ** すべての Orb はオープンソースプロジェクトです。 問題やバグのレポートだけでなく、プルリクエストも Orb の Git リポジトリに対して行えます。 Orb オーサーは、Orb レジストリ 上で Git リポジトリへのリンクを含めるかを選択できます。

  Git リポジトリへのリンクがない場合は、サポートまでご連絡ください。オーサーに連絡いたします。 または、その Orb をフォークして、独自のバージョンをパブリッシュしてはいかがでしょう。

## 未承認 Orb の使用
{: #using-uncertified-orbs }

* **質問: ** 未承認 Orb を使用しようとするとエラーメッセージが出るのはなぜですか？

* **回答:** _未承認_ Orb の使用を有効にするには、お客様の組織の設定ページから_Security_ タブをクリックします。 その後、yes をクリックして_未承認 Orb を許可する_を有効にします。

**注: **_CircleCI では、未承認 Orb のテストや検証は行っていません。 現在、CircleCI が作成した Orb のみが承認されています。 それ以外の Orb (パートナーの Orb を含む) は、未承認です。_

## Orb の最新バージョンを使いたい
{: #how-to-use-the-latest-version-of-an-orb }

* **質問:** どうすれば常に最新バージョンの Orb をインポートできますか？

* **回答:** Orb には[セマンティックバージョニング]()が使用されています。つまり、_メジャー_バージョンを設定すると (例:`3` )、_マイナー_と_パッチ_のすべてのアップデートを受け取ります。静的にバージョンを設定すると(例:`3.0.0` )、アップデートは適用されません。これが最も決定論的で推奨される方法です。

_**注: **<非推奨> `@volatile` を使って最新バージョンの Orb を受け取ることも可能です。 これは互換性を損なう変更が含まれる場合があるため推奨していません。_
{: class="alert alert-danger"}

## ローカルテストでのビルドエラー
{: #build-error-when-testing-locally }

* **質問:** ローカルでのテストで以下のエラーが表示されるのはなぜですか？

```bash
circleci build -c .circleci/jobs.yml --job test
```

```bash
Error:
You attempted to run a local build with version 2.1 of configuration.
```

* **回答:** このエラーを解決するには、設定で `circleci config process` を実行し、その設定をディスクに保存します。 次に、処理された設定に対して `circleci local execute` を実行します。

## 関連項目
{: #see-also }
- [Orb のコンセプト]({{site.baseurl}}/ja/orb-concepts/): CircleCI Orb に関するハイレベルな情報
- [Orb のパブリッシュ プロセス]({{site.baseurl}}/ja/creating-orbs/): ワークフローやジョブで使用する Orb に関する情報
- [Orb リファレンスガイド]({{site.baseurl}}/ja/reusing-config/): 再利用可能な Orb、コマンド、パラメーター、および Executor の例
