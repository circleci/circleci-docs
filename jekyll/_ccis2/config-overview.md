---
layout: classic-docs
title: "Configuration"
short-title: "Configuration"
description: "Description of configuration"
categories: [configuration]
order: 2
---
CircleCI [configuration syntax]({{ site.baseurl }}/2.0/configuration-reference/) is structured [YAML]({{ site.baseurl }}/2.0/writing-yaml/) and starts with the version, a named job, and
an [executor type]({{ site.baseurl }}/2.0/executor-types/) for that job, either `docker`, `machine`, `windows` or `macos`. CircleCI provides prebuilt Docker images for your convenience as described in the following video.

<div class="video-wrapper">
<iframe width="560" height="315" src="https://www.youtube.com/embed/PgIwBzXBn7M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

## Secrets, Private Keys, Tokens, and Scripts

Encrypt and store secrets and private keys for your project by following the [environment variables]({{ site.baseurl }}/2.0/env-vars/) or [contexts]({{ site.baseurl }}/2.0/contexts/) documentation. Review the best practices for [using shell scripts]({{ site.baseurl }}/2.0/using-shell-scripts/) to secure scripts and properly [manage API tokens]({{ site.baseurl }}/2.0/managing-api-tokens/) in your configuration.  

## Advanced Test Configuration

CircleCI enables you to [parallelize your test runs]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) for greatest efficiency. It is also possible to test with browsers and databases, refer to the [Browser Testing]({{ site.baseurl }}/2.0/browser-testing/) and [Database Configuration]({{ site.baseurl }}/2.0/databases/) documents for details.
