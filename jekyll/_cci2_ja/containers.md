---
layout: classic-docs
title: コンテナを使用する
categories:
  - how-to
description: CircleCI コンテナの使用方法
contentTags:
  platform:
    - クラウド
---

コンテナベースプランは、2022 年 6 月 18 日をもって終了します。 従量課金制プランに移行する手順については、[Discuss の投稿 (英語)](https://discuss.circleci.com/t/migrating-from-a-container-paid-plan-to-a-usage-based-plan/42938/1) をご覧ください。
{: class="alert alert-warning"}

従量課金制プランの詳細については、[こちらのドキュメント]({{ site.baseurl }}/ja/credits/)を参照してください。

## 概要
{: #overview }

バージョン管理システムに変更がコミットされると、CircleCI はコードをチェックアウトし、独立した新しいオンデマンドのコンテナまたは仮想マシンの中で、ワークフローのジョブを実行します。このとき、該当するプランでは以下の処理が可能です。

- **同時実行** - 複数のコンテナを使用して、複数のジョブを同時に実行できます。 同時実行を行うには、[ワークフローのオーケストレーション]({{site.baseurl}}/ja/workflows/)を参考に開発ワークフローを設定し、[設定ファイルのサンプル]({{site.baseurl}}/ja/sample-config/#concurrent-workflow)に示す方法でジョブを並列実行してください。

- **並列実行** - テストを複数のコンテナに分割することで、テスト全体のスピードを大幅に向上できます。 テストを並列で実行するには、[CircleCI の構成に関するドキュメント]({{ site.baseurl }}/ja/configuration-reference/#parallelism)で説明されているように `.circleci/config.yml` ファイルを変更します。 設定ファイルを変更してテストの分割と並列実行を行い、ビルド時間を短縮する方法については、[テストの並列実行に関するドキュメント]({{site.baseurl}}/ja/parallelism-faster-jobs/)をご覧ください。

## 従量課金制プランへの移行
{: #migrating-to-a-usage-based-plan }

プランの移行手順の詳細は、[Discuss の投稿](https://discuss.circleci.com/t/circleci/43635) をご覧いただくか、[カスタマーサポート](mailto:cs@circleci.com)にご連絡ください。
