
{% assign cleaned_lang_name = include.lang | remove: "." | downcase %}
![{{include.lang}} ロゴ]({{ site.baseurl }}/assets/img/compass/{{cleaned_lang_name}}.svg)
### {{include.lang}}{% unless include.anchor %} アプリをセットアップする{% endunless %}
{: #setup-your-{{cleaned_lang_name}}-app}
{:.no_toc}

{{include.lang}} アプリをビルド、テスト、デプロイする方法を紹介します。
{% if include.anchor %}
**はじめよう**
{% endif %}