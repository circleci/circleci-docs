---
layout: classic-docs
title: "スタートガイド"
short-title: "スタートガイド"
description: "CircleCI を使用してはじめてビルドを成功させるためのチュートリアル"
categories:
  - はじめよう
order: 41
toc: false
---

{% capture content %}
継続的インテグレーションは、開発者がコードを共有リポジトリのメインブランチに迅速かつ頻繁に統合するための手法です。 開発者は皆、日々コミットしています。 各コミットにより自動テストとビルドがトリガーされます。 バグは数分以内に検出され、修復されます。
{% endcapture %}

{% include getting-started-section-header.html content=content %}


{% capture content1 %}
無料の CircleCI にユーザー登録する
{% endcapture %}

{% capture content2 %}
サインインし、バージョン管理システム (VCS) に接続する
{% endcapture %}

{% include getting-started-links.html title="Prerequisites" href1="https://circleci.com/signup" href2="https://circleci.com/docs/2.0/gh-bb-integration"  content1=content1 content2=content2 %}

{% capture content %}
継続的インテグレーションは、開発者がコードを共有リポジトリの main ブランチに迅速かつ頻繁に統合するための手法です。 開発者は皆、日々コミットしています。 各コミットにより自動テストとビルドがトリガーされます。 バグは数分以内に検出され、修復されます。
{% endcapture %}

{%- capture header-banner-1 -%}
{{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/quick-start--first-step.svg
{%- endcapture -%}

{% include getting-started-section-header.html title="01 Connect to your code" content=content imagePath=header-banner-1 %}

{%- capture github-icon -%}
  {{ site.baseurl }}/assets/img/icons/companies/github-alt.svg
{%- endcapture -%}

{%- capture bitbucket-icon -%}
  {{ site.baseurl }}/assets/img/icons/companies/bitbucket-alt.svg
{%- endcapture -%}

{% include vcs-banner.html githubPath=github-icon bitbucketPath=bitbucket-icon %}

GitHub または Bitbucket で “hello-world” というリポジトリを作成します。 次に左側のメニューで、<a  href="https://app.circleci.com/projects">プロジェクト</a>を選択します。 リポジトリを探し、Set Up Project をクリックします。 リポジトリが見つからない場合は、 左上にある Orb Selector を使って正しい組織を見つけます。
{% endcapture %}

{%- capture select-project -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/select-project.png
{%- endcapture -%}

{% include two-up.html title="1. Select a project" content=content imageURL=select-project imageAlt="Select Projects" %}

{% capture content %}
“Select your <a class="no-external-icon" href="https://circleci.com/docs/2.0/config-start/">config.yml</a> file” モーダルで、 <b>Fast</b> を選択し、<b>Set Up Project</b> をクリックします。 サンプル設定ファイルの Hello World を選択します。
{% endcapture %}

{%- capture select-config -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/select-config.png
{%- endcapture -%}

{% include two-up.html title="2. Select a config.yml" content=content imageURL=select-config imageAlt="Choose Config" %}


{% capture content %}
これは  <a class="no-external-icon" href="https://circleci.com/docs/ja/2.0/config-editor/#getting-started-with-the-circleci-config-editor">CircleCI 設定ファイルエディター</a>で、config.yml のサンプルファイルが挿入されています。 <b>Commit and Run をクリックします。</b>

<br>
<br>
リポジトリのルートで、“circle-ci-setup” という名前の新規ブランチに .circleci/config.yml ファイルが作成されます。
{% endcapture %}

{%- capture CCI-config-editor -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/CCI-config-editor.png
{%- endcapture -%}

{% include two-up.html title="3. CircleCI config editor" content=content imageURL=CCI-config-editor imageAlt="Config Editor" %}

{% capture content %}
はじめてのパイプラインの成功 (グリーンビルド) です。 この設定で問題がなければ、メインブランチにマージする、または引き続き変更を加えることができます。{% endcapture %}

{%- capture congrats-first-green-pipeline -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/congrats-first-green-pipeline.png
{%- endcapture -%}

{% include two-up.html title="4. Congratulations 🎉" content=content imageURL=congrats-first-green-pipeline imageAlt="Green Pipeline Build" %}

{% capture content %}ここまでの手順を終えると、自動的にパイプラインの実行が開始され、成功するのを確認できます。 {% endcapture %}

{%- capture header-banner-2 -%}
{{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/quick-start--second-step.svg
{%- endcapture -%}

{% include getting-started-section-header.html title="02 Dig into your first pipeline" content=content imagePath=header-banner-2 %}

{% capture content %}
緑色の Success ボタンをクリックし、ワークフローの詳細を確認します。 hello-world の<a class="no-external-icon" href="https://circleci.com/docs/ja/2.0/concepts/#pipelines">パイプライン</a>が<a class="no-external-icon" href="https://circleci.com/docs/ja/2.0/concepts/#workflows">ワークフロー</a>内で <b>say-hello</b> というジョブを実行しました。 ジョブをクリックし、実行されたステップを確認します。
{% endcapture %}

{%- capture what-just-happened -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/what-just-happened.png
{%- endcapture -%}

{% include two-up.html title="1. 何が起きたのでしょうか？" content=content imageURL=what-just-happened imageAlt="Green Success Button" %}


{% capture content %}
<b>say-hello</b>  <a class="no-external-icon" href="https://circleci.com/docs/2.0/concepts/#jobs">ジョブ</a>をクリックし、このジョブの<a class="no-external-icon" href="https://circleci.com/docs/2.0/concepts/#steps">ステップ</a>を確認します。
<ul>
<li>環境のスピンアップ</li>
<li>環境変数の準備</li>
<li>コードのチェックアウト</li>
<li>Say hello</li>
</ul>
{% endcapture %}

{%- capture view-results -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/view-results.png
{%- endcapture -%}

{% include two-up.html title="2. 結果を確認する" content=content imageURL=view-results imageAlt="Steps in Pipeline Job" %}

{% capture content %}
チームメイトやコラボレーターは、簡単にプロジェクトを閲覧したりフォローすることができます。 チームメイトは、コードをまったくコミットしていないとしても、いつでも無料の CircleCI アカウントを作成してパイプラインを閲覧できます。
{% endcapture %}

{%- capture collab-with-team -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/collab-with-team.png
{%- endcapture -%}

{% include two-up.html title="3. Collaborate with teammates" content=content imageURL=collab-with-team imageAlt="Add Team Members" %}


{% capture content %} We recommend inviting your teammates to join you, for free. By collaborating, you can troubleshoot, get pull requests approved, and build and test faster. You can also: {% endcapture %}

{%- capture header-banner-3 -%}
{{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/quick-start--third-step.svg
{%- endcapture -%}

{% include getting-started-section-header.html title="03 What's next" content=content imagePath=header-banner-3 %}

{% capture content %}
Try editing your config.yml file. On CircleCI, you can edit files directly and then commit them to your VCS.
<br>
<br>
On the <a  href="https://app.circleci.com/projects/">Projects</a> page, click the ••• buttons to view your configuration file. Make any change and save it. You should see a new pipeline run and likely fail. This is a primary benefit of CircleCI: identifying failures early.
{% endcapture %}

{%- capture break-your-build -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/break-your-build.png
{%- endcapture -%}

{% include two-up.html title="1. Break your build" content=content imageURL=break-your-build imageAlt="Failed Job in Pipeline" %}

{% capture content %}
In your Dashboard, click into the <b>say-hello-world</b> workflow. Can you find the four steps that ran? Hint: step 1 is <b>Spin up environment</b>.
<br>
<br>
A <a class="no-external-icon" href="https://circleci.com/docs/2.0/workflows/">workflow</a> is a set of rules that defines a collection of jobs and their run order. Workflows support complex job orchestration using a simple set of configuration keys to help you quickly resolve failures.
{% endcapture %}

{%- capture explore-workflows -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/explore-workflows.png
{%- endcapture -%}

{% include two-up.html title="2. Explore the workflows function" content=content imageURL=explore-workflows imageAlt="Explore Your Workflow" %}

{% capture content %}
On a failed pipeline, you can <a class="no-external-icon" href="https://circleci.com/docs/2.0/ssh-access-jobs/">SSH directly into your CircleCI jobs</a> and automatically troubleshoot issues. This feature reruns your pipeline and often finds and fixes errors.
{% endcapture %}

{%- capture SSH-into-build -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/SSH-into-build.png
{%- endcapture -%}

{% include two-up.html title="3. SSH into your build" content=content imageURL=SSH-into-build imageAlt="Rerun Job with SSH" %}

{% capture content %}
That’s a wrap! We hope you’re up and running and more confident using CircleCI. To continue your progress, check out the resources below or <a  class="no-external-icon" href="https://support.circleci.com/hc/en-us/">ask for help</a>.
{% endcapture %}

{% include getting-started-section-header.html title="04 Recommended learning" content=content %}

{% capture content3 %}On-demand free developer training{% endcapture %}

{% capture content4 %}CircleCI foundation videos{% endcapture %}

{% capture content5 %}Introduction to configuration{% endcapture %}

{% capture content6 %}CircleCI concepts{% endcapture %}

{% capture content7 %}Benefits of CircleCI free plan{% endcapture %}

{% include getting-started-links.html title="Developer resources" href3="https://circleci.com/training" href4="https://www.youtube.com/playlist?list=PL9GgS3TcDh8wqLRk-0mDz7purXh-sNu7r" href5="https://circleci.com/docs/2.0/config-intro/" href6="https://circleci.com/docs/2.0/concepts/" href7="https://circleci.com/docs/2.0/plan-free/"  content3=content3 content4=content4 content5=content5 content6=content6 content7=content7 %}
