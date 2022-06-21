---
layout: classic-docs
title: "Configuration Overview"
description: "Overview of CircleCI configuration"
categories: [configuration]
order: 2
redirect_from: /2.0/config-start/
version:
- Cloud
- Server v3.x
- Server v2.x
---

CircleCI [configuration syntax]({{ site.baseurl }}/2.0/configuration-reference/) is structured [YAML]({{ site.baseurl }}/2.0/writing-yaml/) and starts with the version, a named job, and
an [executor type]({{ site.baseurl }}/2.0/executor-intro/) for that job, either `docker`, `machine`, `windows` or `macos`. CircleCI provides prebuilt Docker images for your convenience as described in the following video.

<div class="video-wrapper">
<iframe width="560" height="315" src="https://www.youtube.com/embed/PgIwBzXBn7M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

## Secrets, private keys, tokens, and scripts
{: #secrets-private-keys-tokens-and-scripts }

Encrypt and store secrets and private keys for your project by following the [environment variables]({{ site.baseurl }}/2.0/env-vars/) or [contexts]({{ site.baseurl }}/2.0/contexts/) documentation. Review the best practices for [using shell scripts]({{ site.baseurl }}/2.0/using-shell-scripts/) to secure scripts and properly [manage API tokens]({{ site.baseurl }}/2.0/managing-api-tokens/) in your configuration.

## Advanced test configuration
{: #advanced-test-configuration }

CircleCI enables you to [parallelize your test runs]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) for greatest efficiency. It is also possible to test with browsers and databases, refer to the [Browser Testing]({{ site.baseurl }}/2.0/browser-testing/) and [Database Configuration]({{ site.baseurl }}/2.0/databases/) documents for details.
