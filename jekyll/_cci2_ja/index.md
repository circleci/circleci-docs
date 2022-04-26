---
layout: classic-docs
title: "CircleCI ドキュメントへようこそ"
description: "CircleCI ドキュメントへようこそ"
permalink: /ja/
redirect_from: /ja/2.0/
toc: false
page-type: index
---

ここに掲載されているチュートリアル、サンプル、how-to、そしてリファレンスからCircleCIについて学ぶことができます。


<!--Do not translate: Experiment Code for https://circleci.atlassian.net/browse/DD-455 -->
<!-- we need to use "capture" because we can't use `{{site.baseurl}}` in includes. -->
{% capture nodeLink %}{{site.baseurl}}/2.0/language-javascript{% endcapture %}
{% capture nodeLogo %}{{site.baseurl}}/assets/img/compass/nodejs.svg{% endcapture %}
{% capture cciLink %}{{site.baseurl}}/2.0/getting-started{% endcapture %}
{% capture cciLogo %}{{site.baseurl}}/assets/img/compass/circle-logo.svg{% endcapture %}
{% capture pyLink %}{{site.baseurl}}/2.0/language-python{% endcapture %}
{% capture pyLogo %}{{site.baseurl}}/assets/img/compass/python.svg{% endcapture %}
{% capture dotLink %}{{site.baseurl}}/2.0/tutorials{% endcapture %}
{% capture dotLogo %}{{site.baseurl}}/assets/img/compass/more.svg{% endcapture %}

<div class="getting-started-experiment-badges">
  <h2> Example and Guides</h2>
    <p>こちらの<a href="{{site.baseurl}}/2.0/tutorials/">チュートリアル</a>を参考に、設定してみましょう。サンプルアプリも用意しています。</p>
    <div class="flex mb-2">
      {% include badge.html name="Quickstart Guide" icon=cciLogo new=true  link=cciLink%}
      {% include badge.html name="Node" icon=nodeLogo  link=nodeLink%}
  </div>
  <div class="flex">
      {% include badge.html name="Python" icon=pyLogo link=pyLink %}
      {% include badge.html name="All guides" icon=dotLogo link=dotLink %}
  </div>
</div>
<!-- End: Experiment code. -->

<div class="row loading-deferred">
  <div class="treatment col-xs-12">
    <hr />
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>はじめよう</h2>
    <p>CircleCI でビルドの自動化を始めましょう。</p>
    <ul>
      <li><a href="{{ site.baseurl }}/2.0/first-steps/">ユーザー登録とトライアル</a></li>
      <li><a href="{{ site.baseurl }}/2.0/getting-started/">初回ビルドの前提条件</a></li>
      <li><a href="{{ site.baseurl }}/2.0/hello-world/">Hello World</a></li>
      <li><a href="{{ site.baseurl }}/2.0/faq/">FAQ</a></li>
      <li><a href="{{ site.baseurl }}/2.0/orb-intro/">Orbs</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>例</h2>
    <p>人気のサンプルをチェックしましょう。</p>
    <ul>
        <li><a href="{{ site.baseurl }}/2.0/example-configs/">CircleCI を使用したオープンソース プロジェクト</a></li>
        <li><a href="{{ site.baseurl }}/2.0/postgres-config/">データベースの構成例</a></li>
        <li><a href="{{ site.baseurl }}/2.0/sample-config/">config.yml のサンプル ファイル</a></li>
        <li><a href="{{ site.baseurl }}/2.0/tutorials/">チュートリアルとサンプル アプリ</a></li>
        <li><a href="{{ site.baseurl }}/2.0/orb-concepts/">Orbs を使う</a></li>
      </ul>
  </div>
  <div class="col-xs-12">
    <hr />
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>設定ファイル</h2>
    <p>ビルド構成のセットアップとデバッグについて解説します。</p>
    <ul>
      <li><a href="{{ site.baseurl }}/2.0/configuration-reference/">設定ファイル リファレンス</a></li>
      <li><a href="{{ site.baseurl }}/2.0/writing-yaml/">YAML の記述</a></li>
      <li><a href="{{ site.baseurl }}/2.0/env-vars/">環境変数の使用</a></li>
      <li><a href="{{ site.baseurl }}/2.0/ssh-access-jobs/">SSH を使用したデバッグ</a></li>
      <li id="full-config-example"><a href="{{ site.baseurl }}/2.0/configuration-reference/#example-full-configuration">設定例</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>ワークフロー</h2>
    <p>CircleCI のワークフロー機能によってジョブのスケジュール実行と順次実行が構成できます。</p>
    <ul>
      <li><a href="{{ site.baseurl }}/2.0/workflows/">ワークフローを使用したジョブのスケジュール</a></li>
      <li><a href="{{ site.baseurl }}/2.0/workflows/#workflows-configuration-examples">サンプル設定ファイル</a></li>
      <li><a href="{{ site.baseurl }}/2.0/workflows/#scheduling-a-workflow">ワークフローのスケジュール実行</a></li>
      <li><a href="{{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-
      workflows">ワークフローにおけるコンテキストとフィルターの使用</a></li>
      <li><a href="{{ site.baseurl }}/2.0/creating-orbs/">Orbs の作成</a></li>
    </ul>
  </div>
   <div class="col-xs-12">
    <hr />
  </div>
   <div class="col-xs-12 col-sm-6">
    <h2>クックブック</h2>
    <p>パイプラインの設定を支援し、インスピレーションを与えるレシピ。</p>
    <ul>
      <li><a href="{{ site.baseurl }}/2.0/optimization-cookbook/">パイプラインを最適化する方法</a></li>
      <li><a href="{{ site.baseurl }}/2.0/configuration-cookbook">様々なユースケースに対応したベスト・プラクティス</a></li>
    </ul>
  </div>
</div>
