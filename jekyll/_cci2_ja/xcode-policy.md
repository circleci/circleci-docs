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

CircleCI では、Xcode のメジャーバージョンを 4 つまで維持し、新しいバージョンについてはそれ以上の数のイメージを提供することを目指しています。

例えば、Xcode 14 が最新のリリース済みメジャーバージョンである現時点では、次のようになります。

| Xcode のバージョン | 対応                                                 |
| ------------ | -------------------------------------------------- |
| Xcode 14     | すべての `major.minor` バージョンについて最新のパッチバージョンを維持します。     |
| Xcode 13     | 最新の 4 つの `major.minor` バージョンについて最新のパッチバージョンを維持します。 |
| Xcode 12     | Xcode 12 の最新の安定版リリースとなるイメージ 1 つのみを維持します。           |
| Xcode 11     | Xcode 11 の最新の安定版リリースとなるイメージ 1 つのみを維持します。           |
| Xcode 10     | 完全に削除されました。                                        |
{: class="table table-striped"}

今後、Xcode 15 のベータ版イメージがリリースされた場合の対応は次のようになります。

| Xcode のバージョン | 対応                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Xcode 15     | ベータ版イメージ ポリシーに従いベータ版イメージをリリースおよび更新します。                                                             |
| Xcode 14     | 最新の 4 つの `major.minor` バージョンについて最新のパッチバージョンを維持し、古いイメージはサポート終了対象となり、Xcode 15 が RC 版がリリースされ次第、削除します。 |
| Xcode 13     | Xcode 15 の RC 版がリリースされ次第、最終リリースを除くすべてのイメージをサポート終了対象とします。                                           |
| Xcode 12     | Xcode 15 の RC 版がリリースされ次第、最終リリースを除くすべてのイメージをサポート終了対象とします。                                           |
| Xcode 11     | サポート終了対象とし、Xcode 15 の RC 版がリリースされ次第、完全に削除します。                                                      |
{: class="table table-striped"}

イメージがサポート終了対象および削除対象となった場合、[CircleCI Discuss フォーラム](https://discuss.circleci.com/c/announcements/39)で告知し、最近実行したジョブでサポート終了対象イメージをリクエストした開発者の方々にはメールでも通知を行います。 弊社では可能な限り、 4 週間前に通知することを目指しています。

イメージに対するリクエストが、自動で別の `major.minor` バージョンにリダイレクトされることはありません。 そのため、リクエストしたイメージのいずれかが削除された場合、`.circleci/config.yml` ファイルの更新を行わないと、ジョブが失敗するようになります。

## Xcode のパッチ
{: #xcode-patches }

CircleCI では、サポート対象の Xcode の `major.minor` バージョンごとに最新のパッチ バージョンを維持します。 新しいパッチバージョンがリリースされた場合、過去のパッチバージョンのサポートを終了し、すべてのリクエストを新しいパッチにリダイレクトします。

通常、パッチには後方互換性が備わっているため、このリダイレクトは新しいパッチのリリースから 24 時間以内に開始されます。 深刻な問題が確認された場合には、ロールバック版を公開し、暫定的にどちらのバージョンも選択可能にします。

**例**

Xcode `13.2.1` がリリースされた時点で、過去のパッチ バージョンである `13.2.0` を削除し、`13.2.0` に対するすべてのリクエストを `13.2.1` にリダイレクトします。

## ベータ版イメージのサポート
{: #beta-image-support }

Xcode の次の安定版がリリースされる前に開発者の方々がアプリのテストを行えるよう、可能な限り早期に macOS Executor で Xcode のベータ版をリリースできるよう尽力します。

ベータ版イメージについては、安定版イメージ (リリース後は更新されない) とは異なり、RC (安定版) イメージがリリースされ更新が停止するまでは、新規リリースのたびに既存のイメージが上書きされます。 現在ベータ版となっているバージョンの Xcode イメージを使用している場合、Apple が新しい Xcode ベータ版をリリースした際、最小限の通知によりそのイメージに変更が加えられることがあることをご考慮ください。 これには、CircleCI では制御できない Xcode および関連ツールに関する互換性を損なう変更が含まれる場合があります。 本番環境のパイプラインでのベータ版イメージの使用は推奨していません。

ベータ版イメージに関する CircleCI のお客様サポート ポリシーについては、[サポート センターに関する記事](https://support.circleci.com/hc/ja-jp/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-)をご覧ください。

## Xcode イメージのリリース
{: #xcode-image-releases }

CircleCI では Apple の Xcode のリリース状況を注意深く追跡し、常に可能な限り迅速に新しいイメージをリリースするよう努めています。 通常、数日以内に新しい Xcode イメージをサポートすることを目指していますが、これはサービスレベルアグリーメント (SLA) としてではないのでご注意ください。 新しい Xcode イメージの SLA として所要時間を公式に定めることはいたしません。

New images are always announced on our [Discuss site](https://discuss.circleci.com/c/announcements/39) along with release notes, and will be added to the table of [Xcode versions in the documentation]({{site.baseurl}}/using-macos/#supported-xcode-versions).

## macOS のバージョン
{: #macos-versions }

各 Xcode イメージは、macOS のクリーンインストールを基盤としています。 CircleCI では、macOS バージョンを利用可能な最新バージョンに保つことを目指しています。 通常、CircleCI のイメージは、最新の安定版の最大で 2 マイナー/パッチバージョン前のイメージになる場合があります。

弊社では、macOS のバージョンを各 macOS Executor（VM や Metal など）に合わせることを目指していますが、常にこれが実現できるとは限りません。 Please check the [Software Manifest]({{site.baseurl}}/using-macos/#supported-xcode-versions) file for the image for the most accurate information.

macOS の新しいメジャーバージョン (`12.0` や `13.0` など) がリリースされた場合、重大なバグや問題の発生が解決されるように、通常は Xcode のマイナーバージョンが 2 つ以上リリースされた後、そのバージョンの使用を開始します。 このリリースのタイミングは Apple のリリースサイクル次第ですが、必ず事前に [CircleCI Discuss フォーラム](https://discuss.circleci.com/c/announcements/39)で告知します。

## 例外
{: #exceptions }

CircleCI は、どのような場合でも、状況に応じて本記事の説明内容とは異なる措置を講じる権利を保有しています。 本ポリシーの例外を適用する必要がある場合、可能な限り十分な告知を行い、透明性を維持するよう努めます。 こうした場合、[CircleCI Discuss フォーラム](https://discuss.circleci.com/c/announcements/39)に告知を掲載するとともに、可能な限りメールなどでの通知も行います。
