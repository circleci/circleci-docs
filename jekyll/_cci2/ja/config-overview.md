---
layout: classic-docs
title: "設定ファイル"
short-title: "設定ファイル"
description: "設定ファイルの説明"
categories:
  - configuration
order: 2
version:
  - Cloud
  - Server v2.x
---

CircleCI の[設定ファイルの構文]({{ site.baseurl }}/2.0/configuration-reference/)は、構造化された [YAML]({{ site.baseurl }}/2.0/writing-yaml/) です。 最初に、バージョン、名前付きジョブ、およびそのジョブの [Executor タイプ]({{ site.baseurl }}/2.0/executor-types/) (`docker`、`machine`、`windows`、または `macos`) が指定されます。 以下のビデオでも説明されているとおり、CircleCI は便利なビルド済みの Docker イメージを提供しています。

<div class="video-wrapper">
<iframe width="560" height="315" src="https://www.youtube.com/embed/PgIwBzXBn7M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

## Secrets, private keys, tokens, and scripts
{: #secrets-private-keys-tokens-and-scripts }

Encrypt and store secrets and private keys for your project by following the [environment variables]({{ site.baseurl }}/2.0/env-vars/) or [contexts]({{ site.baseurl }}/2.0/contexts/) documentation. Review the best practices for [using shell scripts]({{ site.baseurl }}/2.0/using-shell-scripts/) to secure scripts and properly [manage API tokens]({{ site.baseurl }}/2.0/managing-api-tokens/) in your configuration.

## Advanced test configuration
{: #advanced-test-configuration }

CircleCI enables you to [parallelize your test runs]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) for greatest efficiency. It is also possible to test with browsers and databases, refer to the [Browser Testing]({{ site.baseurl }}/2.0/browser-testing/) and [Database Configuration]({{ site.baseurl }}/2.0/databases/) documents for details.
