
{% assign cleaned_lang_name = include.lang | remove: "." | downcase %}
![{{include.lang}} Logo]({{ site.baseurl }}/assets/img/compass/{{cleaned_lang_name}}.svg)
## Setup your {{include.lang}} App
{: #setup-your-{{cleaned_lang_name}}-app}
{:.no_toc}

Learn to build, test, and deploy your {{include.lang}} app.
{% if include.anchor %}
<b>Get Started</b>
{% endif %}