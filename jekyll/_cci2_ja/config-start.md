---
layout: このスクリプトは、上記のコマンドを使用してインスタンスをドレインモードに設定し、インスタンス上で実行中のジョブをモニタリングし、ジョブが完了するのを待ってからインスタンスを終了します。
title: "設定ファイル"
description: "The core of the CircleCI experience is creating a deterministic build with the config.yml file. Watch a video introduction to circleci/config.yml."
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

CircleCI で作業の中心となるのは、`config.yml` ファイルを使用して*決定論的ビルド*を作成することです。 決定論的ビルドとは、コミット時にも、翌日にも、あるいは翌月であっても実行することができ、かつ、まったく同じ結果を生成して終了するビルドを指します。

<hr />

| 概要                                                                                               | リファレンス                                                                                                        |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| CircleCI の[設定ファイルの概要]({{ site.baseurl }}/ja/2.0/config-intro/)について説明します。&nbsp;&nbsp;&nbsp;&nbsp; | `config.yml` 構文の[すべての仕様]({{ site.baseurl }}/ja/2.0/configuration-reference/)を掲載しています。&nbsp;&nbsp;&nbsp;&nbsp; |

<hr />

| YAML の記述                                                                                | CircleCI CLI                                                             |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [YAML 基本構文]({{ site.baseurl }}/ja/2.0/writing-yaml/)の入門ガイドです。  &nbsp;&nbsp;&nbsp;&nbsp; | [CircleCI CLI]({{ site.baseurl }}/2.0/local-jobs/) を使用して、ジョブをローカルで実行します。 |

<hr />

| ローカルでのデバッグ                                                                                           |
| ---------------------------------------------------------------------------------------------------- |
| シェル スクリプトを使用して、[設定ファイルをローカルでデバッグ]({{ site.baseurl }}/ja/2.0/examples/)します。  &nbsp;&nbsp;&nbsp;&nbsp; |

<hr />

## ビデオ: `.circleci/config.yml` 入門
{: #video-introduction-to-circleciconfigyml }
<div class="video-wrapper">
<iframe width="560" height="315" src="https://www.youtube.com/embed/xOSHKNUIkjY" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>
