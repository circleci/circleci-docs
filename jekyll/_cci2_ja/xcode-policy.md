---
layout: classic-docs
title: Xcode イメージのリリース、更新、サポート終了に関する CircleCI のポリシーについて
short-title: Xcode イメージのリリース、更新、サポート終了に関する CircleCI のポリシーについて
categories:
  - プラットフォーム
description: Xcode イメージのリリース、更新、サポート終了に関する CircleCI のポリシーについて
order: 31
version:
  - クラウド
---

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

ここでは、Xcode のリリース、更新、サポート終了に関する CircleCI のポリシーについて説明します。 CircleCI では、ベータ版イメージを含め、新しいイメージのリリースを切れ目なくスピーディかつ円滑に行うため、Xcode イメージについて明確なポリシーを定めています。

これらのイメージに関する最新情報については、[CircleCI Developer Hub](https://circleci.com/developer/machine/image/macos) の、macOS マシンイメージのページをご覧ください。

## Xcode イメージの維持およびサポート終了
{: #xcode-image-retention-and-deprecation }

CircleCI では、Xcode のメジャー バージョンを 4 つまで維持し、新しいバージョンについては複数のイメージを提供することを目標とします。

例えば、Xcode 14 が最新のリリース済みメジャー バージョンである執筆時点では、次のようになります。

| Xcode のバージョン | 対応                                                                             |
| ------------ | ------------------------------------------------------------------------------ |
| Xcode 14     | We will retain all `major.minor` versions at the latest patch version          |
| Xcode 13     | We will retain the 4 latest `major.minor` versions at the latest patch version |
| Xcode 12     | Xcode 12 の最新の安定版リリースとなるイメージ 1 つのみを維持します                                        |
| Xcode 11     | Xcode 11 の最新の安定版リリースとなるイメージ 1 つのみを維持します                                        |
| Xcode 10     | 完全に削除されました                                                                     |
{: class="table table-striped"}

Future example, when Xcode 15 enters Beta:

| Xcode のバージョン | 対応                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Xcode 15     | ベータ版イメージ ポリシーに従いベータ版イメージをリリースおよび更新します。                                                                                                                              |
| Xcode 14     | The latest 4 `major.minor` versions will be retained at the latest patch version, older images will be flagged for deprecation and removed when Xcode 15 reaches RC |
| Xcode 13     | All images except for the final release will be flagged for deprecation and removed when Xcode 15 reaches RC                                                        |
| Xcode 12     | All images except for the final release will be flagged for deprecation and removed when Xcode 15 reaches RC                                                        |
| Xcode 11     | Flagged for deprecation, removed entirely when Xcode 15 reaches RC                                                                                                  |
{: class="table table-striped"}

イメージがサポート終了対象および削除対象となった場合、[CircleCI Discuss フォーラム](https://discuss.circleci.com/c/announcements/39)で告知し、最近実行したジョブでサポート終了対象イメージをリクエストした開発者の方々にはメールでも通知を行います。 We will always aim to provide four weeks' notice where possible.

イメージに対するリクエストが、自動で別の `major.minor` バージョンにリダイレクトされることはありません。 そのため、リクエストしたイメージのいずれかが削除された場合、`.circleci/config.yml` ファイルの更新を行わないと、ジョブが失敗するようになります。

## Xcode のパッチ
{: #xcode-patches }

CircleCI では、サポート対象の Xcode の `major.minor` バージョンごとに最新のパッチ バージョンを維持します。 Once a new patch version has been released, we will deprecate the previous patch version and automatically redirect all requests to the new patch version.

通常、パッチには後方互換性が備わっているため、このリダイレクトは新しいパッチのリリースから 24 時間以内に開始されます。 If any major issues are discovered, we retain the ability to issue a rollback and make both versions temporarily available.

**例**

Xcode `13.2.1` がリリースされた時点で、過去のパッチ バージョンである `13.2.0` を削除し、`13.2.0` に対するすべてのリクエストを `13.2.1` にリダイレクトします。

## ベータ版イメージのサポート
{: #beta-image-support }

Xcode の次の安定版がリリースされる前に開発者の方々がアプリのテストを行えるよう、可能な限り早期に macOS Executor で Xcode のベータ版をリリースできるよう尽力します。

Unlike our stable images (which are frozen once released and do not change), once a new beta image is released it will overwrite the previous beta image until an RC/Stable image is released, at which point the image is frozen and no longer updated. If you are requesting an image using an Xcode version that is currently in beta, please take into consideration that it will change when Apple releases a new Xcode beta with minimal notice. これには、CircleCI では制御できない Xcode および関連ツールに関する互換性を損なう変更が含まれる場合があります。 We do not recommend using beta images for production pipelines.

ベータ版イメージに関する CircleCI のお客様サポート ポリシーについては、[サポート センターに関する記事](https://support.circleci.com/hc/ja-jp/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-)をご覧ください。

## Xcode イメージのリリース
{: #xcode-image-releases }

CircleCI では Apple の Xcode のリリース状況を注意深く追跡し、常に可能な限り迅速に新しいイメージをリリースするよう努めています。 Typically we aim to support a new Xcode image within a couple of days, however please note that this is not an SLA. We can not, and do not, provide an official SLA turnaround time for new Xcode images.

新しいイメージがリリースされた際は必ず、[CircleCI の Discuss サイト](https://discuss.circleci.com/c/announcements/39)でリリース告知により通知します。 また、[こちらの Xcode バージョンの表]({{site.baseurl}}/2.0/testing-ios/#supported-xcode-versions)に追記します。

## macOS のバージョン
{: #macos-versions }

各 Xcode イメージは、macOS のクリーン インストールを基盤としています。 We aim to keep the macOS version reasonably up to date with the latest version available. Generally our images can be up to 2 minor/patch versions behind the latest stable version.

We aim to keep the macOS version aligned across our different macOS executors (for example, VM and Metal), however this may not always be the case. Please check the [Software Manifest]({{site.baseurl}}/2.0/testing-ios/#supported-xcode-versions) file for the image for the most accurate information.

When a new major version of macOS (for example, `12.0` or `13.0`) is released, we will usually start to use this version after a minimum of two minor Xcode releases have passed to allow for any major bugs and issues to be resolved. The release timing for this is entirely dependent on Apple’s own release cycle, but will always be announced on our [Discuss forum](https://discuss.circleci.com/c/announcements/39).

## 例外
{: #exceptions }

CircleCI は、どのような場合でも、状況に応じて本記事の説明内容とは異なる措置を講じる権利を保有しています。 本ポリシーの例外を適用する必要がある場合、可能な限り十分な告知を行い、透明性を維持するよう努めます。 こうした場合、[CircleCI Discuss フォーラム](https://discuss.circleci.com/c/announcements/39)に告知を掲載するとともに、可能であればメールなどでの通知も行います。
