---
layout: classic-docs
title: Install a custom version of Elasticsearch
description: Installing a custom version of Elasticsearch
sitemap: false
---

To enable Elasticsearch, add the following to your `circle.yml`:

```
machine:
  services:
    - elasticsearch
```

The default version of Elasticsearch is {{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.elasticsearch }}.
If you need a custom version, you can download and start it from your build. To install 2.4.3, add the following to your `circle.yml`:

```
dependencies:
  post:
    - wget https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/2.4.3/elasticsearch-2.4.3.tar.gz
    - tar -xvf elasticsearch-2.4.3.tar.gz
    - elasticsearch-2.4.3/bin/elasticsearch: {background: true}
    # Make sure that Elasticsearch is up before running tests:
    - sleep 10 && wget --waitretry=5 --retry-connrefused -v http://127.0.0.1:9200/
```

<span class='label label-info'>Note:</span>
remember to remove elasticsearch from [`machine: services:`]( {{ site.baseurl }}/1.0/configuration/#services) if you install it manually.

## Install an Elasticsearch plugin

It's simple to install a plugin from a URL! Just add a command to install the plugin before you start Elasticsearch:

```
dependencies:
  post:
    - wget https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/2.4.3/elasticsearch-2.4.3.tar.gz
    - tar -xvf elasticsearch-2.4.3.tar.gz
    - elasticsearch-2.4.3/bin/plugin --url https://example.com/plugin.zip --install example-plugin
    - elasticsearch-2.4.3/bin/elasticsearch: {background: true}
    - sleep 10 && wget --waitretry=5 --retry-connrefused -v http://127.0.0.1:9200/
```

## Caching

Downloading Elasticsearch can take time, making your build longer.
To reduce the time spent installing dependencies, CircleCI can cache them between builds.
You can add arbitrary directories to the cache, allowing you to avoid the overhead of building your custom software during the build.

Tell CircleCI to save a cached copy using the
[`cache_directories` settings in your `circle.yml` file](/docs/1.0/configuration/#cache-directories).
Then check for the directory before you download Elasticsearch:

```
dependencies:
  cache_directories:
    - elasticsearch-2.4.3 # relative to the build directory
  post:
    - if [[ ! -e elasticsearch-2.4.3 ]]; then wget https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/2.4.3/elasticsearch-2.4.3.tar.gz && tar -xvf elasticsearch-2.4.3.tar.gz; fi
    - elasticsearch-2.4.3/bin/elasticsearch: {background: true}
    - sleep 10 && wget --waitretry=5 --retry-connrefused -v http://127.0.0.1:9200/
```
