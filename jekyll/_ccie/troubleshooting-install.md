---
layout: enterprise
section: enterprise
title: Troubleshooting the Install
category: [troubleshooting]
order: 0
published: true
---


#### "Test GitHub Authentication" is failing

This means that the GitHub Enterprise server is not returning the intermediate SSL certificates. Check your GitHub Enterprise instance with <https://www.ssllabs.com/ssltest/analyze.html> - it may report some missing intermediate certs. You can use tools like <https://whatsmychaincert.com/> to get the full certificate chain for your server.


#### "Verify TLS Settings" is failing

Make sure that your keys are in unencrypted PEM format, and that the certificate includes the entire chain of trust as follows:

```
-----BEGIN CERTIFICATE-----
your_domain_name.crt
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
intermediate 1
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
intermediate 2
-----END CERTIFICATE-----
...
```
