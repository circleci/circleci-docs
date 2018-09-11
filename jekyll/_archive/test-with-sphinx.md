---
layout: classic-docs
title: Test with Sphinx
categories: [how-to]
description: How to test with Sphinx
sitemap: false
---

If your tests require a running Sphinx server you will need to configure and
start Sphinx before they run in CircleCI.

Sphinx {{ site.data.precise.versions.sphinx }} is installed on your build system. It will need
to be configured with your `sphinx.conf`, and started via
[circle.yml]( {{ site.baseurl }}/1.0/configuration/).  Here's an example of how to do so:

```
database:
  post:
    - sudo cp path/to/your/sphinx.conf /etc/sphinxsearch/sphinx.conf
    - sudo sed -i -e 's,START=no,START=yes,' /etc/default/sphinxsearch
    - service sphinxsearch start
```

In your data source configuration in your test `sphinx.conf` you can use the
MySQL or PostgreSQL servers already in place on the build system. For example,
for MySQL:

```
source src1
{
  type     = mysql

  sql_host = localhost
  sql_user = ubuntu
  sql_pass =
  sql_db   = circle_test
  sql_port = 3306

  ...
```

Please [contact us](https://support.circleci.com/hc/en-us) and let us know if you're using
Sphinx this way! Your feedback helps us keep our documentation up to date, and
our services as useable as possible.
