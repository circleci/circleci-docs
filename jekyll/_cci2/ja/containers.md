---
layout: classic-docs
title: コンテナを使用する
categories:
  - how-to
description: CircleCI コンテナの使用方法
---

This document describes the basics of containers and how to leverage the containers in your plan to speed up your job and workflow runs. For more information on what containers are and why they are useful, see this [Docker overview](https://www.docker.com/resources/what-container).

## 概要

Every change committed to your version control system triggers CircleCI to checkout your code and run your job workflow inside a fresh, on-demand, isolated container with access to the following, depending on your plan:

- **同時処理** - 複数のコンテナを使用して、複数のビルドを同時に実行できます。 同時処理を行うには、[ジョブの実行を Workflow で制御する]({{ site.baseurl }}/ja/2.0/workflows/)のページを参考に開発 Workflows を設定し、[2.0 コンフィグファイルのサンプル]({{ site.baseurl }}/ja/2.0/sample-config/#sample-configuration-with-parallel-jobs)のページに示す方法でジョブを並列実行してください。

- **並列処理** - テストを複数のコンテナに分割することで、テスト全体のスピードを大幅に向上できます。 Update your `.circleci/config.yml` file to run your tests in parallel as described in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/#parallelism) document. コンフィグファイルを変更してテストの分割と並列処理を行い、ビルド時間を短縮する方法については、[テストを並列実行する]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/)のページをご覧ください。

## はじめよう

Linux plans start with the ability to run one workflow, without parallelism, at no charge. Purchasing a Linux plan enables you to use additional containers when you need them. Choose a paid or free plan during the signup process and change your plan in the CircleCI app Settings page later to meet changing business requirements.

Most CircleCI customers use two to three containers per full-time developer. Increase the number of containers to any level of parallelism and concurrency as your team or the complexity of your workflow grows.

Open source projects include three additional free containers to run jobs in parallel.

## アップグレード

Refer to the [FAQ about upgrading]({{ site.baseurl }}/2.0/faq/#how-do-i-upgrade-my-plan-with-more-containers-to-prevent-queuing) for step-by-step instructions to upgrade your plan.