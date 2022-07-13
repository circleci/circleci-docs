---
layout: classic-docs
title: コンテナを使用する
categories:
  - how-to
description: CircleCI コンテナの使用方法
version:
  - クラウド
---

コンテナベースプランは、2022 年 6 月 18 日をもって終了します。 従量課金制プランに移行する手順については、[Discuss の投稿 (英語)](https://discuss.circleci.com/t/migrating-from-a-container-paid-plan-to-a-usage-based-plan/42938/1) をご覧ください。
{: class="alert alert-warning"}

You can read about usage-based plans in detail [in this document]({{ site.baseurl }}/credits/).

## 概要
{: #overview }

バージョン管理システムに変更がコミットされると、CircleCI はコードをチェックアウトし、独立した新しいオンデマンドのコンテナまたは仮想マシンの中で、ワークフローのジョブを実行します。このとき、該当するプランでは以下の処理が可能です。

- **同時実行** - 複数のコンテナを使用して、複数のビルドを同時に実行できます。 To take advantage of concurrency, configure your development workflow using the [Orchestrating Workflows document]({{ site.baseurl }}/workflows/) and run your jobs in parallel as shown in the [Sample Config Files document]({{ site.baseurl }}/sample-config/#concurrent-workflow).

- **並列実行** - テストを複数のコンテナに分割することで、テスト全体のスピードを大幅に向上できます。 Update your `.circleci/config.yml` file to run your tests in parallel as described in the [Configuring CircleCI]({{ site.baseurl }}/configuration-reference/#parallelism) document. Learn how to update your config file to parallelize and split tests to decrease your build time by reading the [Running Tests in Parallel]({{ site.baseurl }}/parallelism-faster-jobs/) documentation.

## 従量課金制プランへの移行
{: #migrating-to-a-usage-based-plan }

プランの移行手順の詳細は、[Discuss の投稿](https://discuss.circleci.com/t/circleci/43635) をご覧いただくか、[カスタマーサポート](mailto:cs@circleci.com)にご連絡ください。
