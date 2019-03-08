---
layout: classic-docs
title: Using Containers
categories:
  - how-to
description: How to leverage CircleCI containers
---
このページでは、コンテナの基本について説明します。また、お使いのプランで提供されるコンテナを活用してジョブや Workflows の実行を高速化する方法についても解説します。

## 概要

VCS システムに変更がコミットされると、CircleCI はコードをチェックアウトし、独立した新しいコンテナをオンデマンドに用意して、その中で Workflows のジョブを実行します。このとき、該当するプランでは以下の処理が可能です。

- **同時処理** - 複数のコンテナを使用して、複数のビルドを同時に実行できます。 To take advantage of concurrency, configure your development workflow using the [Orchestrating Workflows document]({{ site.baseurl }}/2.0/workflows/) and run your jobs in parallel as shown in the [Sample 2.0 Config Files document]({{ site.baseurl }}/2.0/sample-config/#sample-configuration-with-parallel-jobs).

- **Parallelism** - Splitting tests across multiple containers, allowing you to dramatically speed up your test suite. Update your `.circleci/config.yml` file to run your tests in parallel as documented in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/#parallelism) document. Learn how to update your config file to parallelize and split tests to decrease your build time by reading the [Running Tests in Parallel]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) documentation.

## Getting Started

Linux plans start with the ability to run one workflow without parallelism at no charge. Open source projects include three additional free containers to run jobs in parallel. Purchasing a Linux plan enables you to use additional containers when you need them. Choose a paid or free plan during the signup process and change your plan in the CircleCI app Settings page later to meet changing business requirements. Most CircleCI customers use two to three containers per full-time developer. Increase the number of containers at any level of parallelism and concurrency as your team or the complexity of your workflow grows.

## Upgrading

Refer to the [FAQ about upgrading]({{ site.baseurl }}/2.0/faq/#how-do-i-upgrade-my-plan-with-more-containers-to-prevent-queuing) for step-by-step instructions about upgrading your plan.