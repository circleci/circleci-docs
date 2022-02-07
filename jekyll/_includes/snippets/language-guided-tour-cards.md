{::options parse_block_html="true" toc_levels="3..6" /}

<div id="cards">
<div class="card">

{% include snippets/language-card.md lang=include.lang %}

<div id="completion-time" class="card">
<img alt="Completion Time" src="{{ site.baseurl }}/assets/img/compass/git-commit.svg">
<span>{{ include.guide_completion_time }} min task</span>
</div>

* TOC
{:toc}
</div>
<div id="card-or-card-container">
OR
{: #card-or-card}
</div>
<div class="card">

![Explore Logo]({{ site.baseurl }}/assets/img/compass/bookmark.svg)
### Explore a sample app
{: #explore-a-sample-app}
{:.no_toc}

Check out a {{ include.lang }} sample app running on CircleCI.

<div id="completion-time" class="card">
<img alt="Completion Time" src="{{ site.baseurl }}/assets/img/compass/repo-forked.svg">
<span>{{ include.sample_completion_time }} min task</span>
</div>

* [View live {{include.lang}} sample app pipeline]({{site.cci_public_org_url}}/sample-{{include.demo_url_slug}}-cfd?branch={{include.demo_branch}}){:target="_blank"}{:rel="noopener noreferrer"}
* [View on GitHub]({{site.gh_public_org_url}}/sample-{{include.demo_url_slug}}-cfd){:target="_blank"}{:rel="noopener noreferrer"}
</div>
</div>
