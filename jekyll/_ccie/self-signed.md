---
layout: enterprise
section: enterprise
title: Using Self-Signed SSL Certificates
category: [advanced-config]
order: 4.5
published: true
hide: true
sitemap: false
---

By default, all machines in a CircleCI Enterprise installation verify SSL
certs for the GitHub Enterprise instance. If you're using a self-signed cert,
or using a custom CA root, you can select the
"HTTPS (with self-signed certificate)" option in the System Console at port 8800.
You also need to export `CIRCLE_IGNORE_CERT_HOST=insecure-ghe.example.com` on builder machines
(replacing `insecure-ghe.example.com` below with the host of your GitHub Enterprise instance).

See [this doc]({{site.baseurl}}/enterprise/docker-builder-config/) for details on setting builder machine
environment variables.
