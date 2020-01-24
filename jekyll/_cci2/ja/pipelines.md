---
layout: classic-docs
title: "パイプラインの表示"
short-title: "パイプラインの表示"
description: "パイプラインの概要"
categories:
  - getting-started
order: 1
---

CircleCI アプリケーションの [Pipelines (パイプライン)] ページについて概説すると共に、CircleCI ユーザー インターフェイスの変更について説明します。

## 概要

最近 CircleCI の Web インターフェイスの一部が変更されたことにお気付きかと思います。 ビルドをグループ化する方法と、その情報を表示するユーザー インターフェイスに関して、いくつかの変更を行いました。

まず、**パイプライン**についてご説明しましょう。

パイプラインとは、CircleCI を使用するプロジェクトで作業をトリガーするときに実行される構成全体を指す言葉です。 `.circleci/config.yml` ファイルの全体が 1 つのパイプラインによって実行されます。

これまでサイドバーの [`JOBS` (ジョブ)] が表示されていた場所に、[`Pipelines (パイプライン)`] が表示されるようになりました。

![]({{ site.baseurl }}/assets/img/docs/pipelines-jobs-to-pipelines.png)

**メモ:** 新しい UI には当面継続的に改善を加えていくため、その間は一時的に新しい UI の使用をオプトアウトして、引き続き従来の UI を使用することが可能です。

![]({{ site.baseurl }}/assets/img/docs/pipelines-opt-out-1.png)

## ジョブ、テスト、アーティファクト

パイプラインはワークフローで構成され、ワークフローはジョブで構成されます。 パイプライン中のいずれかのジョブに移動すると、ジョブ出力、テスト結果、アーティファクトに各タブからアクセスできます。

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-step-test-artifact.png)

さらに、それぞれのジョブからの出力は、一意のリンクを持つ新しいタブ (未加工またはフォーマット済みの形式) で開くことができ、チーム メンバー間で共有できます。

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-output.png)
