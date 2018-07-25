---
layout: classic-docs
title: "Custom Certificate Authorities"
category: [resources]
order: 56
description: "Using a custom Root Certificate Authority (CA) with CircleCI."
categories: [administration]
---

## Supporting Custom Root CA

Some installation environments use internal root certificate authorities for encrypting and establishing trust between servers.  If using a root certificate, you will need to import and mark it as a trusted certificate at CircleCI Enterprise instances. CircleCI will respect such trust when communicating with GitHub and webhook API calls.

CA Certificates must be in a format understood by Java Keystore, and include the entire chain.

The following script provides the necessary steps.

```
GHE_DOMAIN=github.example.com

# Grab the CA chain from your GitHub Enterprise deployment.
openssl s_client -connect ${GHE_DOMAIN}:443 -showcerts < /dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /usr/local/share/ca-certificates/ghe.crt
```

Then navigate to the system console at port 8800 - now you can change the protocol to upgraded, you can change the protocol to "HTTPS (TLS/SSLEnabled)"setting and restart the services.  When trying "Test GitHub Authentication" you should get Success now rather than x509 related error.
