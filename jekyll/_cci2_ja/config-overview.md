---
layout: classic-docs
title: "設定ファイルの概要"
description: "CircleCI の設定ファイルの概要を説明します。"
categories:
  - 設定
order: 2
redirect_from: /ja/2.0/config-start/
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

CircleCI の[設定ファイルの構文]({{ site.baseurl }}/ja/2.0/configuration-reference/)は、構造化された [YAML]({{ site.baseurl }}/ja/2.0/writing-yaml/) です。 最初に、バージョン、名前付きジョブ、およびそのジョブの [Executor タイプ]({{ site.baseurl }}/ja/2.0/executor-intro/) (`docker`、`machine`、`windows`、または `macos`) が指定されます。 以下のビデオでも説明されているとおり、CircleCI は便利なビルド済みの Docker イメージを提供しています。

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/PgIwBzXBn7M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

## シークレット、プライベート キー、トークン、スクリプト
{: #secrets-private-keys-tokens-and-scripts }

プロジェクトのシークレットとプライベート キーを暗号化して格納するには、[環境変数]({{ site.baseurl }}/ja/2.0/env-vars/)または[コンテキスト]({{ site.baseurl }}/ja/2.0/contexts/)に関するドキュメントを参照してください。 スクリプトを保護し、適切に [API トークンを管理]({{ site.baseurl }}/ja/2.0/managing-api-tokens/)できるよう構成するには、[シェル スクリプトの使用]({{ site.baseurl }}/ja/2.0/using-shell-scripts/)に関するベスト プラクティスを参照してください。

## 高度なテストの構成
{: #advanced-test-configuration }

CircleCI では、[テストの並列実行]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/)を利用して、効率性を最大限に高めることができます。 ブラウザーやデータベースを使用してテストすることも可能です。 詳細については、「[ブラウザー テスト]({{ site.baseurl }}/ja/2.0/browser-testing/)」および「[データベースの構成]({{ site.baseurl }}/ja/2.0/databases/)」を参照してください。
