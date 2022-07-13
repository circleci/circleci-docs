---
layout: classic-docs
title: "CircleCI ドキュメントへようこそ"
description: "CircleCI ドキュメントへようこそ"
permalink: /ja/
redirect_from: /
toc: false
page-type: index
---

ここに掲載されているチュートリアル、サンプル、how-to、そしてリファレンスからCircleCIについて学ぶことができます。


<!--Do not translate: Experiment Code for https://circleci.atlassian.net/browse/DD-455 -->
<!-- we need to use "capture" because we can't use `{{site.baseurl}}` in includes. -->
{% capture nodeLink %}{{site.baseurl}}/language-javascript{% endcapture %}
{% capture nodeLogo %}{{site.baseurl}}/assets/img/compass/nodejs.svg{% endcapture %}
{% capture cciLink %}{{site.baseurl}}/getting-started{% endcapture %}
{% capture cciLogo %}{{site.baseurl}}/assets/img/compass/circle-logo.svg{% endcapture %}
{% capture pyLink %}{{site.baseurl}}/language-python{% endcapture %}
{% capture pyLogo %}{{site.baseurl}}/assets/img/compass/python.svg{% endcapture %}
{% capture dotLink %}{{site.baseurl}}/examples-and-guides-overview{% endcapture %}
{% capture dotLogo %}{{site.baseurl}}/assets/img/compass/more.svg{% endcapture %}

<div class="getting-started-experiment-badges">
  <h2> 設定例とガイド</h2>
    <p>Get started quickly: follow step-by-step <a href="{{site.baseurl}}/examples-and-guides-overview/">guides</a> or explore a sample app.</p>
    <div class="flex mb-2">
      {% include badge.html name="スタートガイド" icon=cciLogo new=true  link=cciLink%}
      {% include badge.html name="Node" icon=nodeLogo  link=nodeLink%}
  </div>
  <div class="flex">
      {% include badge.html name="Python" icon=pyLogo link=pyLink %}
      {% include badge.html name="すべてのガイド" icon=dotLogo link=dotLink %}
  </div>
</div>
<!-- End: Experiment code. -->

<div class="row loading-deferred">
  <div class="treatment col-xs-12">
    <hr />
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>はじめよう</h2>
    <p>CircleCI でビルドの自動化を始めよう</p>
    <ul>
      <li><a href="{{ site.baseurl }}/first-steps/">サインアップして始める</a></li>
      <li><a href="{{ site.baseurl }}/getting-started/">最初の成功ビルド</a></li>
      <li><a href="{{ site.baseurl }}/hello-world/">Hello World</a></li>
      <li><a href="{{ site.baseurl }}/faq/">よくあるご質問</a></li>
      <li><a href="{{ site.baseurl }}/orb-intro/">Orbs</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>サンプル集</h2>
    <p>人気のあるサンプルの一覧</p>
    <ul>
        <li><a href="{{ site.baseurl }}/example-configs/">CircleCI を使用したオープンソース プロジェクト</a></li>
        <li><a href="{{ site.baseurl }}/postgres-config/">データベース設定のサンプル</a></li>
        <li><a href="{{ site.baseurl }}/sample-config/">config.yml のサンプル</a></li>
        <li><a href="{{ site.baseurl }}/examples-and-guides-overview/">言語ガイドとサンプルアプリ</a></li>
        <li><a href="{{ site.baseurl }}/orb-concepts/">Orbs を使う</a></li>
      </ul>
  </div>
  <div class="col-xs-12">
    <hr />
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>設定ファイル</h2>
    <p>ビルドの設定とデバッグ</p>
    <ul>
      <li><a href="{{ site.baseurl }}/configuration-reference/">設定リファレンス</a></li>
      <li><a href="{{ site.baseurl }}/writing-yaml/">YAML を書く</a></li>
      <li><a href="{{ site.baseurl }}/env-vars/">環境変数を使う</a></li>
      <li><a href="{{ site.baseurl }}/ssh-access-jobs/">SSH デバッグ</a></li>
      <li id="full-config-example"><a href="{{ site.baseurl }}/configuration-reference/#example-full-configuration">設定例</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>ワークフロー</h2>
    <p>ジョブのスケジューリングとシーケンシャルな実行</p>
    <ul>
      <li><a href="{{ site.baseurl }}/workflows/">ワークフローを使用したジョブのスケジュール</a></li>
      <li><a href="{{ site.baseurl }}/workflows/#workflows-configuration-examples">ワークフローの構成例</a></li>
      <li><a href="{{ site.baseurl }}/workflows/#scheduling-a-workflow">ワークフローのスケジュール実行</a></li>
      <li><a href="{{ site.baseurl }}/workflows/#using-contexts-and-filtering-in-your-
      workflows">コンテキストとフィルターの使用</a></li>
      <li><a href="{{ site.baseurl }}/creating-orbs/">Orbs の作成</a></li>
    </ul>
  </div>
   <div class="col-xs-12">
    <hr />
  </div>
</div>
