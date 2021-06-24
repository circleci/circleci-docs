---
layout: classic-docs
title: コンテナを使用する
categories:
  - how-to
description: CircleCI コンテナの使用方法
version:
  - Cloud
---

また、お使いのプランで提供されるコンテナを活用してジョブやワークフローの実行を高速化する方法についても解説します。 なお、CircleCI には新たに[従量課金制プラン](https://circleci.com/ja/pricing/usage/)が導入されており、コンテナベースのプランはまもなく廃止となりますのでご注意ください。 現在、コンテナベースのプランを利用してビルドの待機時間が発生している場合は、CircleCI の従量課金制プランへの移行を検討してください。待機時間を短縮できる以外にも、さまざまなメリットが期待できます。

新しい従量課金制プランの詳細については、[こちらのドキュメント]({{ site.baseurl }}/2.0/credits/)を参照してください。

## 概要
{: #overview }

Every change committed to your version control system triggers CircleCI to checkout your code and run your job workflow inside a fresh, on-demand, isolated container with access to the following, depending on your plan:

- **Concurrency** - Utilizing multiple containers to run multiple builds at the same time. To take advantage of concurrency, configure your development workflow using the [Orchestrating Workflows document]({{ site.baseurl }}/2.0/workflows/) and run your jobs in parallel as shown in the [Sample Config Files document]({{ site.baseurl }}/2.0/sample-config/#concurrent-workflow).

- **Parallelism** - Splitting tests across multiple containers, allowing you to dramatically speed up your test suite. テストを並列で実行するには、[CircleCI の構成に関するドキュメント]({{ site.baseurl }}/2.0/configuration-reference/#parallelism)で説明されているように `.circleci/config.yml` ファイルを変更します。 設定ファイルを変更してテストの分割と並列処理を行い、ビルド時間を短縮する方法については、[テストの並列実行に関するドキュメント]({{ site.baseurl }}/2.0/parallelism-faster-jobs/)をご覧ください。

## Getting started
{: #getting-started }

Linux plans start with the ability to run one workflow, without concurrency, at no charge. Purchasing a Linux plan enables you to use additional containers when you need them. Choose a paid or free plan during the signup process and change your plan in the CircleCI app Settings page later to meet changing business requirements.

Most CircleCI customers use two to three containers per full-time developer. Increase the number of containers to any level of parallelism and concurrency as your team or the complexity of your workflow grows.

Open source projects include three additional free containers to run jobs concurrently.

## アップグレード
{: #upgrading }

Refer to the [FAQ about upgrading]({{ site.baseurl }}/2.0/faq/#how-do-i-upgrade-my-container-plan-with-more-containers-to-prevent-queuing) for step-by-step instructions to upgrade your plan.
