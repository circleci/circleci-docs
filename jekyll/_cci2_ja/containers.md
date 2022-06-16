---
layout: classic-docs
title: コンテナを使用する
categories:
  - how-to
description: CircleCI コンテナの使用方法
version:
  - Cloud
---

Container-based plans will be deprecated from July 18th 2022. For steps to migrate to a usage-based plan, see this [Discuss post](https://discuss.circleci.com/t/migrating-from-a-container-paid-plan-to-a-usage-based-plan/42938/1).
{: class="alert alert-warning"}

You can read about usage-based plans in detail [in this document]({{ site.baseurl }}/2.0/credits/).

## 概要
{: #overview }

Every change committed to your version control system triggers CircleCI to checkout your code and run your job workflow inside a fresh, on-demand, isolated container or virtual machine with access to the following, depending on your plan:

- **同時実行** - 複数のコンテナを使用して、複数のビルドを同時に実行できます。 同時実行を行うには、[ワークフローのオーケストレーション]({{ site.baseurl }}/ja/2.0/workflows/)を参考に開発ワークフローを設定し、[設定ファイルのサンプル]({{ site.baseurl }}/ja/2.0/sample-config/#concurrent-workflow)に示す方法でジョブを並列実行してください。

- **並列実行** - テストを複数のコンテナに分割することで、テスト全体のスピードを大幅に向上できます。 テストを並列で実行するには、[CircleCI の構成に関するドキュメント]({{ site.baseurl }}/ja/2.0/configuration-reference/#parallelism)で説明されているように `.circleci/config.yml` ファイルを変更します。 設定ファイルを変更してテストの分割と並列実行を行い、ビルド時間を短縮する方法については、[テストの並列実行に関するドキュメント]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/)をご覧ください。

## Migrating to a usage-based plan
{: #migrating-to-a-usage-based-plan }

Refer to [this Discuss posts](https://discuss.circleci.com/t/migrating-from-a-container-paid-plan-to-a-usage-based-plan/42938/1) for step-by-step instructions to migrate your plan, or [contact customer support](mailto:cs@circleci.com).
