---
layout: classic-docs
title: "CircleCI ドキュメントへようこそ"
description: "CircleCI ドキュメントへようこそ"
permalink: /ja/2.0/
redirect_from: /ja/
toc: false
page-type: index
---

ここに掲載されているチュートリアル、サンプル、how-to、そしてリファレンスからCircleCIについて学ぶことができます。 こちらからも入手可能です。

<hr class="hidden-xs" />

<div class="row loading-deferred">
  <div class="treatment col-xs-12">
    <span id="homepage-guide-links"><h2>設定例と解説</h2><img src="{{ site.baseurl }}/assets/img/compass/new.svg" alt="New"></span>
    <p>こちらの<a href="{{site.baseurl}}/2.0/tutorials/">チュートリアル</a>を参考に、設定してみましょう。サンプルアプリも用意しています。</p>
  </div>
  <div class="treatment col-xs-12 col-sm-6">
    <a class="no-external-icon col-sm-12" href="{{site.baseurl}}/ja/2.0/language-javascript/">
      <div class="card col-sm-12">
        {% capture node-js-card %}
          {% include snippets/language-card.md lang="Node.JS" anchor="true" %}
        {% endcapture %}
        {{ node-js-card | markdownify }}
      </div>
    </a>
  </div>
  <div class="treatment col-xs-12 col-sm-6">
    <a class="no-external-icon col-sm-12" href="{{site.baseurl}}/ja/2.0/language-python/">
      <div class="card col-sm-12">
        {% capture python-card %}
          {% include snippets/language-card.md lang="Python" anchor="true" %}
        {% endcapture %}
        {{ python-card | markdownify }}
      </div>
    </a>
  </div>
  <div class="treatment col-xs-12">
    <hr />
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>はじめよう</h2>
    <p>CircleCI でビルドの自動化を始めよう</p>
    <ul>
      <li><a href="{{ site.baseurl }}/ja/2.0/first-steps/">サインアップして始める</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/getting-started/">最初の成功ビルド</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/hello-world/">Hello World</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/faq/">よくあるご質問</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/orb-intro/">Orbs</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>サンプル集</h2>
    <p>人気のあるサンプルの一覧</p>
    <ul>
        <li><a href="{{ site.baseurl }}/ja/2.0/example-configs/">CircleCI を使用したオープンソース プロジェクト</a></li>
        <li><a href="{{ site.baseurl }}/ja/2.0/postgres-config/">データベース設定のサンプル</a></li>
        <li><a href="{{ site.baseurl }}/ja/2.0/sample-config/">config.yml のサンプル</a></li>
        <li><a href="{{ site.baseurl }}/ja/2.0/tutorials/">チュートリアルとサンプルアプリ</a></li>
        <li><a href="{{ site.baseurl }}/ja/2.0/orb-concepts/">Orbs を使う</a></li>
      </ul>
  </div>
  <div class="col-xs-12">
    <hr />
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>設定ファイル</h2>
    <p>ビルドの設定とデバッグ</p>
    <ul>
      <li><a href="{{ site.baseurl }}/ja/2.0/configuration-reference/">設定リファレンス</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/writing-yaml/">YAML を書く</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/env-vars/">環境変数を使う</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/ssh-access-jobs/">SSH デバッグ</a></li>
      <li id="full-config-example"><a href="{{ site.baseurl }}/ja/2.0/configuration-reference/#example-full-configuration">設定例</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>ワークフロー</h2>
    <p>ジョブのスケジューリングとシーケンシャルな実行</p>
    <ul>
      <li><a href="{{ site.baseurl }}/ja/2.0/workflows/">ワークフローを使用したジョブのスケジュール</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/workflows/#workflows-configuration-examples">ワークフローの構成例</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/workflows/#scheduling-a-workflow">ワークフローのスケジュール実行</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/workflows/#using-contexts-and-filtering-in-your-
      workflows">コンテキストとフィルターの使用</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/creating-orbs/">Orbs の作成</a></li>
    </ul>
  </div>
   <div class="col-xs-12">
    <hr />
  </div>
   <div class="col-xs-12 col-sm-6">
    <h2>クックブック</h2>
    <p>パイプラインの設定のヒントを集めたレシピ</p>
    <ul>
      <li><a href="{{ site.baseurl }}/ja/2.0/optimization-cookbook/">パイプラインを最適化する方法</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/configuration-cookbook">様々なユースケースでのベスト・プラクティス</a></li>
    </ul>
  </div>
</div>
