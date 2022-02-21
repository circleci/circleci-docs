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

* **回答:** [現在のすべての料金プラン](https://circleci.com/pricing)で</strong>プライベート Orb</a> をご利用いただけます。

## コマンドとジョブの違いは？
{: #difference-between-commands-and-jobs }

* **質問:** コマンドとジョブの違いは何ですか？

* **回答:** [コマンド]({{site.baseurl}}/2.0/reusing-config/#the-commands-key)と[ジョブ]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs)はどちらも Orb 内で使用される要素です。 _コマンド_には、Orb のロジックを含む一つまたは複数の[ステップ]({{site.baseurl}}/2.0/configuration-reference/#steps)が含まれます。 コマンドは多くの場合シェルコード (バッシュ) を実行します。 _ジョブ_は、実行するステップやコマンドの定義であり、_そして_、ステップやコマンドを実行する [Executor]({{site.baseurl}}/2.0/reusing-config/#the-executors-key) です。 _コマンド_はジョブの中で呼び出されます。 _ジョブ_は、[ワークフロー]({{site.baseurl}}/2.0/workflows/#workflows-configuration-examples)</em>を使ってオーケストレーションされます。

## CircleCI Server での Orb の使用
{: #using-orbs-on-circleci-server }

* **質問: ** Orb はプライベートなインストール環境で使用できますか？

* **回答: ** Orb は、CircleCI Server v3 でご利用いただけます。 CircleCI Server での Orb のインポートと使用に関しては、[CircleCI Server v3.x の Orb ガイド]({{site.baseurl}}/2.0/server-3-operator-orbs/)を参照して下さい。

  CircleCI Server v2.19.x では Orb は使用できませんが、コミットの前に設定を処理すると、Orb を変換して使用できます。 コミット前の Git Hook の使用については、[サーバーでの Orb の使用](https://discuss.circleci.com/t/orbs-on-server-solution/36264)を参照して下さい。

## Orb に関する問題をレポートする
{: #report-an-issue-with-an-orb }

* **質問: ** Orb  に関するバグや問題をレポートする方法は？

* **回答: ** すべての Orb はオープンソースプロジェクトです。 問題やバグのレポートだけでなく、プルリクエストも Orb のGit リポジトリに対して行えます。 Orb のオーサーは、Orb レジストリ 上で Git リポジトリへのリンクを含めるかを選択できます。

  Git リポジトリへのリンクがない場合は、サポートまでご連絡ください。オーサーに連絡いたします。 または、その Orb をフォークして、独自のバージョンをパブリッシュしてはいかがでしょう。

## 未承認 Orb の使用
{: #using-uncertified-orbs }

* **質問: ** 未承認の Orb を使おうとするとエラーメッセージが出るのはなぜですか？

* **Answer:** To enable usage of _uncertified_ orbs, go to your organization's settings page, and click the _Security_ tab. Then, click yes to enable _Allow Uncertified Orbs_.

**Note:** _Uncertified orbs are not tested or verified by CircleCI. Currently, only orbs created by CircleCI are considered certified. Any other orbs, including partner orbs, and not certified._

## How to use the latest version of an orb
{: #how-to-use-the-latest-version-of-an-orb }

* **Question:** How do import an orb always at the latest version?

* **Answer:** Orbs utilize [semantic versioning](), meaning if you set the _major_ version (example: `3`), you will receive all _minor_ and _patch_ updates, where if you statically set the version (example: `3.0.0`), no updates will apply, this is the most deterministic and recommended method.

_**Note:** NOT RECOMMENDED - It is possible to use `@volatile` to receive the last published version of an orb. This is not recommended as breaking changes are expected._
{: class="alert alert-danger"}

## Build error when testing locally
{: #build-error-when-testing-locally }

* **Question:** Why do I get the following error when testing locally:

```
circleci build -c .circleci/jobs.yml --job test
```

```
Error:
You attempted to run a local build with version 2.1 of configuration.
```

* **Answer:** To resolve this error, run `circleci config process` on your configuration and then save that configuration to disk. You then should run `circleci local execute` against the processed configuration.

## 関連項目
{: #see-also }
- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/orb-concepts/) for high-level information about CircleCI orbs.
- Refer to [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/) for more detailed information about how you can use CircleCI orb recipes in your configurations.
