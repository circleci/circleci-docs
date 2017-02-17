---
layout: classic-docs
page-type: index
title: "CircleCI 1.0 Documentation"
permalink: /1.0/index.html
---

{% for category in site.data.categories %}
{% if category.section == "cci1" %}

{% if category.index %}
	{% assign catFile = category.index %}
{% else %}
	{% assign catFile = category.slug %}
{% endif %}

<div class="category-section">
	<img src="{{ site.baseurl }}/assets/img/icons/{{ category.icon }}" class="logo" alt="Category Icon" />
	<h2>{{ category.name }}</h2>
	<ul class="list-unstyled">
	{% assign docs_found = 0 %}
	{% for doc in site.cci1 %}
		{% if doc.categories contains category.slug and doc.slug != catFile and doc.hide != True and doc.section == "cci1" %}
			{% assign docs_found = docs_found | plus: 1 %}
			{% if docs_found < 4 %}
				{% if doc.short-title %}
					<li class="{% if page.path contains doc.url %}active{% endif %}"><a href="{{ site.baseurl }}{{ doc.url }}">{{ doc.short-title }}</a></li>
				{% else %}
					<li><a href=" {{ site.baseurl }}{{ doc.url }}">{{ doc.title }}</a></li>
				{% endif %}
			{% endif %}
		{% endif %}
	{% endfor %}

	{% if docs_found > 3 %}
		{% assign more = docs_found | minus: 3 %}
		<li><em><a href="{{ site.baseurl }}/{{ catFile }}/">{{ more }} more</a></em></li>
	{% endif %}
	</ul>
</div>
{% endif %}
{% endfor %}