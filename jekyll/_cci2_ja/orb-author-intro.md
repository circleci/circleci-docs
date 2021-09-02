---
layout: classic-docs
title: "Orb オーサリングの概要"
short-title: "Orb オーサリングの概要"
description: "Orb のオーサリング方法に関する入門ガイド"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

* 目次
{:toc}

## クイック スタート
{: #quick-start }

Orbs take [reusable configuration]({{site.baseurl}}/2.0/orb-concepts/#orb-configuration-elements) and package it in a way that can be published to the [Orb Registry](https://circleci.com/developer/orbs) and imported into multiple configuration files. If you manage multiple, similar projects, consider abstracting out your config with orbs.

Before authoring an orb, it is recommended that you become familiar with the [CircleCI config]({{site.baseurl}}/2.0/config-intro/) and authoring [parameterized reusable config elements]({{site.baseurl}}/2.0/reusing-config/) pages.

Orbs consist of three main elements:

* [コマンド]({{site.baseurl}}/2.0/orb-concepts/#commands)
* [ジョブ]({{site.baseurl}}/2.0/orb-concepts/#executors)
* [Executor]({{site.baseurl}}/2.0/orb-concepts/#jobs)

Practice with [inline orbs]({{site.baseurl}}/2.0/reusing-config/#writing-inline-orbs). Inline orbs can be defined within a single config file for easy and quick testing.

Orb authors automatically agree to the CircleCI [Code Sharing Terms of Service](https://circleci.com/legal/code-sharing-terms/). All published orbs are made available publicly on the Orb Registry under the [MIT License agreement](https://opensource.org/licenses/MIT). For more information, see [Orb Licensing](https://circleci.com/developer/orbs/licensing).
{: class="alert alert-success"}

## 作業を開始する
{: #getting-started }

### Orb CLI
{: #orb-cli }

To begin creating orbs, you will need to [set up the CircleCI CLI]({{site.baseurl}}/2.0/local-cli/#installation) on your local machine, with a [personal access token](https://app.circleci.com/settings/user/tokens). For a full list of orb-related commands inside the CircleCI CLI, visit [CircleCI CLI help](https://circleci-public.github.io/circleci-cli/circleci_orb.html).

### 権限の一覧表
{: #permissions-matrix }

Orb CLI commands are scoped to different user permission levels, set by your VCS. You are the owner of your own organization. If you are authoring or publishing orbs for a namespace owned by another organization, you may require assistance from your organization admin:

| Orb Command                                | Permission Scope |
| ------------------------------------------ | ---------------- |
| `circleci namespace create`                | Owner            |
| `circleci orb init`                        | Owner            |
| `circleci orb create`                      | Owner            |
| `circleci orb publish` development version | Member           |
| `circleci orb publish` production version  | Owner            |
{: class="table table-striped"}

### 名前空間の登録
{: #register-a-namespace }

Every organization registered on CircleCI is able to claim **one** unique [namespace]({{site.baseurl}}/2.0/orb-concepts/#namespaces). This includes your personal organization and any organization you are a member of. As each organization is limited to a single namespace, in order to register the namespace for an organization you must be the _owner_ of the organization.

Enter the following command to claim your namespace, if you have not yet claimed one:
```sh
circleci namespace create <name> <vcs-type> <org-name> [flags]
```

where `name` is the namespace you wish to claim, `vcs-type` is the type of your version control system (i.e. `github` or `bitbucket`), and `org-name` is the name of your organization.

### 次のステップ
{: #next-steps }

Continue on to the  [Orb Authoring Process]({{site.baseurl}}/2.0/orb-author/) guide for information on developing your orb.


## 関連項目
{: #see-also }
{:.no_toc}

- [Orb のオーサリング]({{site.baseurl}}/2.0/orb-author/)
- [Orb のコンセプト]({{site.baseurl}}/2.0/orb-concepts/)
- [Orb オーサリングに関するよくあるご質問]({{site.baseurl}}/2.0/orb-author-faq/)
