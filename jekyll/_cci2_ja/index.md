---
layout: classic-docs
title: "CircleCI ドキュメントへようこそ"
description: "CircleCI ドキュメントへようこそ"
permalink: /ja/
redirect_from:
        - /ja/2.0/
toc: false
page-type: index
---

CircleCI について理解を深めていただけるよう、チュートリアルやサンプル、ハウツーといった参考情報をまとめました。 こちらからも入手可能です。

<hr class="hidden-xs" />

<div class="row loading-deferred">
  <div class="treatment col-xs-12">
    <span id="homepage-guide-links"><h2>Examples and Guides</h2><img src="{{ site.baseurl }}/assets/img/compass/new.svg" alt="ニュース"></span>
    <p>Get started quickly: follow step-by-step <a href="{{site.baseurl}}/2.0/tutorials/">guides</a> or explore a sample app.</p>
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
    <p>CircleCI でビルドの自動化を始めましょう。</p>
    <ul>
      <li><a href="{{ site.baseurl }}/ja/2.0/first-steps/">ユーザー登録とトライアル</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/getting-started/">初回ビルドの前提条件</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/hello-world/">Hello World</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/faq/">よくあるご質問</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/orb-intro/">Orbs</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>サンプル</h2>
    <p>人気のサンプルをチェックしましょう。</p>
    <ul>
        <li><a href="{{ site.baseurl }}/ja/2.0/example-configs/">CircleCI を使用したオープンソース プロジェクト</a></li>
        <li><a href="{{ site.baseurl }}/ja/2.0/postgres-config/">データベースの構成例</a></li>
        <li><a href="{{ site.baseurl }}/ja/2.0/sample-config/">config.yml のサンプル ファイル</a></li>
        <li><a href="{{ site.baseurl }}/ja/2.0/tutorials/">チュートリアルとサンプル アプリ</a></li>
        <li><a href="{{ site.baseurl }}/ja/2.0/orb-concepts/">Orb の使用</a></li>
      </ul>
  </div>
  <div class="col-xs-12">
    <hr />
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>設定ファイル</h2>
    <p>ビルド構成のセットアップとデバッグについて解説します。</p>
    <ul>
      <li><a href="{{ site.baseurl }}/ja/2.0/configuration-reference/">リファレンス</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/writing-yaml/">YAML の記述</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/env-vars/">環境変数の使用</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/ssh-access-jobs/">SSH を使用したデバッグ</a></li>
      <li id="full-config-example"><a href="{{ site.baseurl }}/ja/2.0/configuration-reference/#example-full-configuration">設定例</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>ワークフロー</h2>
    <p>CircleCI のワークフロー機能によってジョブのスケジュール実行と順次実行が構成できます。</p>
    <ul>
      <li><a href="{{ site.baseurl }}/ja/2.0/workflows/">ワークフローを使用したジョブのスケジュール</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/workflows/#workflows-configuration-examples">ワークフローの構成例</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/workflows/#scheduling-a-workflow">ワークフローのスケジュール実行</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/workflows/#using-contexts-and-filtering-in-your-
      workflows">ワークフローにおけるコンテキストとフィルターの使用</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/creating-orbs/">Orbs の作成</a></li>
    </ul>
  </div>
   <div class="col-xs-12">
    <hr />
  </div>
   <div class="col-xs-12 col-sm-6">
    <h2>クックブック</h2>
    <p>パイプラインの設定を支援し、インスピレーションを与えるレシピ。</p>
    <ul>
      <li><a href="{{ site.baseurl }}/ja/2.0/optimization-cookbook/">パイプラインを最適化する方法</a></li>
      <li><a href="{{ site.baseurl }}/ja/2.0/configuration-cookbook">様々なユースケースに対応したベスト・プラクティス</a></li>
    </ul>
  </div>
</div>
