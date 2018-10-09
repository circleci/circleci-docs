---
layout: classic-docs
title: Test with Solr
categories: [how-to]
description: How to test with Solr
sitemap: false
---

If your tests require a running solr instance, you will need to configure
and boot solr before they run in CircleCI.

## The Easy Way

In some cases, we can start solr automatically. In particular, if you're
using ruby and the sunspot_solr gem, we'll run
`rake sunspot:solr:start` by default, and it should Just Work.

## The Hard Way

Even if we aren't able to do things automatically, `solr {{ site.data.precise.versions.solr }}`
is installed on your build system. It will need to be configured with your
schema.xml, and booted via [circle.yml]( {{ site.baseurl }}/1.0/configuration/).
Here's an example of how to do so:

```
database:
  post:
    - cp -R /opt/solr-4.3.1 $HOME/solr
    - cp config/schema.xml $HOME/solr/example/solr/collection1/conf
    # optional: - cp config/solrconfig.xml $HOME/solr/example/solr/collection1/conf
    - cd $HOME/solr/example; java -jar start.jar >> $HOME/solr.log:
        background: true
```

This configuration does three things. You may need to fine-tune the exact commands
to match your needs, but they should:

1.  Copy a skeletal solr installation from `/opt/solr-4.3.1` into your home directory.

2.  Copy your configuration (`schema.xml` at least, and `solrconfig.xml` if you need it)
into place.

3.  Launch solr as a [background process]( {{ site.baseurl }}/1.0/background-process/).

Solr, when started this way, will be running under `http://localhost:8983/solr/`,
and logging to `$HOME/solr.log`.

