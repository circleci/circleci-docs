{::options parse_block_html="true" toc_levels="3..6" /}

<div id="cards">
<div class="card">

{% include snippets/language-card.md lang=include.lang %}

<div id="completion-time" class="card">
<img alt="完了時間" src="{{ site.baseurl }}/assets/img/compass/git-commit.svg">
<span>{{ include.guide_completion_time }} min task</span>
</div>

* 目次
{:toc}
</div>
<div id="card-or-card-container">
または
{: #card-or-card}
</div>
<div class="card">

![Explore Logo]({{ site.baseurl }}/assets/img/compass/bookmark.svg)
### サンプルアプリを見てみましょう
{: #explore-a-sample-app}
{:.no_toc}

CircleCI で実行する{{ include.lang }}サンプルアプリを{{ include.lang }} チェックしてみましょう。

<div id="completion-time" class="card">
<img alt="完了時間" src="{{ site.baseurl }}/assets/img/compass/repo-forked.svg">
<span>{{ include.sample_completion_time }} min task</span>
</div>

* [{{include.lang}} サンプルアプリのパイプラインをライブで見る]({{site.cci_public_org_url}}/sample-{{include.demo_url_slug}}-cfd?branch={{include.demo_branch}}){:target="_blank"}{:rel="noopener noreferrer"}
* [GitHub で見る]({{site.gh_public_org_url}}/sample-{{include.demo_url_slug}}-cfd){:target="_blank"}{:rel="noopener noreferrer"}

</div>
</div>
