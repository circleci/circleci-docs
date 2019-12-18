---
layout: classic-docs
title: "設定"
short-title: "設定"
description: "設定の説明"
categories: [configuration]
order: 2
---

CircleCI の[設定構文]({{ site.baseurl }}/ja/2.0/configuration-reference/)は、構造化された [YAML]({{ site.baseurl }}/ja/2.0/writing-yaml/) です。最初に、バージョン、名前付きジョブ、およびそのジョブの [Executor タイプ]({{ site.baseurl }}/ja/2.0/executor-types/) (`docker`、`machine`、または `macos`) が指定されます。 以下のビデオでも説明されているとおり、CircleCI は便利なビルド済みの Docker イメージを提供しています。

<div class="video-wrapper">
<iframe width="560" height="315" src="https://www.youtube.com/embed/PgIwBzXBn7M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>
</div>

## シークレット、プライベートキー、トークン、スクリプト

プロジェクトのシークレットとプライベートキーを暗号化して格納するには、[環境変数]({{ site.baseurl }}/ja/2.0/env-vars/)または[コンテキスト]({{ site.baseurl }}/ja/2.0/contexts/)に関するドキュメントを参照してください。 設定でスクリプトを保護し、適切に [API トークンを管理]({{ site.baseurl }}/ja/2.0/managing-api-tokens/)するには、[シェル スクリプトの使用]({{ site.baseurl }}/ja/2.0/using-shell-scripts/)に関するベスト プラクティスを参照してください。

## 高度なテスト設定

CircleCI では、[テストの並列実行]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/)を利用して、効率性を最大限に高めることができます。 ブラウザーやデータベースを使用してテストすることも可能です。詳細については、「[ブラウザーテスト]({{ site.baseurl }}/ja/2.0/browser-testing/)」および「[データベースの設定]({{ site.baseurl }}/ja/2.0/databases/)」を参照してください。
