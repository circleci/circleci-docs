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

This document outlines the CircleCI Xcode release, update, and deprecation policy. CircleCI では、ベータ版イメージを含め、新しいイメージのリリースを切れ目なくスピーディかつ円滑に行うため、Xcode イメージについて明確なポリシーを定めています。

You will find the most up to date information on these images on the [CircleCI Developer Hub](https://circleci.com/developer/machine/image/macos) macOS machine image page.

## Xcode イメージの維持およびサポート終了
{: #xcode-image-retention-and-deprecation }

CircleCI では、Xcode のメジャー バージョンを 4 つまで維持し、新しいバージョンについては複数のイメージを提供することを目標とします。

For example, with Xcode 13 being the latest major version being released:

| Xcode のバージョン | 対応                                                            |
| ------------ | ------------------------------------------------------------- |
| Xcode 13     | すべての `major.minor` バージョンについて最新のパッチ バージョンを維持します                |
| Xcode 12     | すべての `major.minor` バージョンについて最新のパッチ バージョンを維持します                |
| Xcode 11     | 今後の Xcode 13 リリースの発表に応じて、過去の Xcode 11 バージョンに対するサポートを段階的に終了します |
| Xcode 10     | Xcode 10 の最新の安定版リリースとなるイメージ 1 つのみを維持します                       |
| Xcode 9      | 完全に削除されました                                                    |
{: class="table table-striped"}

今後、Xcode 14 のベータ版イメージがリリースされた場合の対応は次のようになります。

| Xcode のバージョン | 対応                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------- |
| Xcode 14     | ベータ イメージ ポリシーに従いベータ イメージをリリースおよび更新します                                                    |
| Xcode 13     | すべての `major.minor` バージョンについて最新のパッチ バージョンを維持します                                           |
| Xcode 12     | ベータ期間中はすべての `major.minor` バージョンについて最新のパッチ バージョンを維持し、Xcode 14 のリリース サイクル開始後はサポート終了の対象とします |
| Xcode 11     | Xcode 14 の GM 版がリリースされ次第、最終リリースを除くすべてのイメージをサポート終了対象とします                                  |
| Xcode 10     | Xcode 14 の GM 版がリリースされ次第、サポート終了対象とし、削除します                                                |
{: class="table table-striped"}

特定のイメージがサポート終了対象および削除対象となった場合、[CircleCI Discuss フォーラム](https://discuss.circleci.com/c/announcements/39)でお知らせするとともに、最近実行されたジョブでいずれかの廃止対象イメージをリクエストした開発者の方々にメールで通知します。 We will always aim to provide four weeks' notice.

We will never automatically redirect requests for images to different `major.minor` versions, so when one of these images is removed, jobs will start to fail if the `.circleci/config.yml` has not been updated.

## Xcode のパッチ
{: #xcode-patches }

CircleCI では、サポート対象の Xcode `major.minor` バージョンごとに最新のパッチ バージョンを維持します。 新しいパッチ バージョンがリリースされた場合、過去のパッチ バージョンのサポートを終了し、すべてのリクエストを新しいパッチにリダイレクトします。

通常、パッチには後方互換性が備わっているため、このリダイレクトは新パッチのリリースから 24 時間以内に開始されます。 深刻な問題が確認された場合には、ロールバック版を公開し、暫定的にどちらのバージョンも選択可能にします。

**例**

When Xcode `12.0.1` was released, we removed the previous patch version, `12.0.0`, and automatically redirected all requests for `12.0.0` to `12.0.1`.

## ベータ版イメージのサポート
{: #beta-image-support }

We aim to make beta Xcode versions available on the macOS executor as soon as we can, to allow developers to test their apps ahead of the next stable Xcode release.

ベータ イメージについては、安定版イメージ (更新が停止されたもの) と異なり、GM (安定版) イメージが公開され更新が停止するまでは、新規リリースのたびに既存のイメージが上書きされます。 現在ベータ版となっているバージョンの Xcode イメージを使用している場合、Apple が新しい Xcode ベータ版をリリースした場合に予告なく変更されることがあります。 This can include breaking changes in Xcode and associated tooling which are beyond our control.

ベータ版イメージに関する CircleCI のお客様サポート ポリシーについては、[サポート センターに関するこちらの記事](https://support.circleci.com/hc/ja-jp/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-)をご覧ください。

## Xcode イメージのリリース
{: #xcode-image-releases }

We closely track and monitor Apple’s Xcode releases and always aim to release new images as quickly as possible. We can not provide an official SLA turnaround time for this, as it is highly dependent on any changes made in Xcode and macOS.

New images are always announced on our [Discuss site](https://discuss.circleci.com/c/announcements/39) along with release notes, and will be added to the table of [Xcode versions in the documentation]({{site.baseurl}}/2.0/testing-ios/#supported-xcode-versions).

## macOS のバージョン
{: #macos-versions }

各 Xcode イメージは、macOS のクリーン インストールを基盤としています。 CircleCI では、macOS バージョンの更新を Xcode の必要最小バージョンが上がったときにのみ行い、できる限りバージョンを一定に保つことを目指します。 Xcode の必要最小バージョンが上がった場合は、macOS のバージョンを最新の安定版バージョンに更新します。

macOS の新しいメジャー バージョン (`11.0` や `12.0` など) がリリースされた場合、重大なバグや問題が発生した際に解決できるように、通常は Xcode のマイナー バージョンが 2 つ以上リリースされた後からそのバージョンの使用を開始します。 このリリースのタイミングは Apple のリリース サイクル次第ですが、必ず事前に [CircleCI Discuss フォーラム](https://discuss.circleci.com/c/announcements/39)で告知します。

## 例外
{: #exceptions }

At any time, we reserve the right to work outside of the information in this document if the circumstances require. In the event that we are required to make an exception to the policy, we will aim to provide as much notice and clarity as possible. こうした場合、[CircleCI Discuss フォーラム](https://discuss.circleci.com/c/announcements/39)に告知を掲載するとともに、可能であればメールなどでの通知も行います。
