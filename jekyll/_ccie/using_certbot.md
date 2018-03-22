---
layout: enterprise
section: enterprise
title: "Using Certbot to setup TLS/HTTPS on your Server Install"
category: [documentation]
order: 1
description: "Overview of using Certbot to configure TLS/HTTPS on your Server install."
---

## Using Certbot to setup TLS/HTTPS on CircleCI Server

This document provides instructions for setting up TLS/HTTPS on your Server install using Certbot.

Certbot generally relies on verifying the DNS record via either port 80 or 443, however we're not able to do that with the current Server install (as of 2.2.0) since this would require us to run this from within the Frontend container (would get destroyed every time the service box restarts unless we made a change to the code) or from the main box (would conflict with the Frontend docker container's access to port 80/443).

To get around this, you can use the Manual method described below.

## Overview

- Stop the service from within the Replicated console (hostname:8800)

- SSH into services box

- Install Certbot and generate certificates

```$ sudo apt-get update
$ sudo apt-get install software-properties-common
$ sudo add-apt-repository ppa:certbot/certbot
$ sudo apt-get update
$ sudo apt-get install certbot
$ certbot certonly --manual --preferred-challenges dns
```

- You'll be instructed to add a DNS TXT record.

If you're using Route 53 for your DNS records, adding a TXT record is straightforward. When you're creating a new record set, just make sure you select type -> TXT and provide the appropriate value (enclosed in quotes!).

- Once successfully generated, use `fullchain.pem` and `privkey.pem` in the Replicated console.

Because you generated the certificate and private keys *on* the services box, you won't be uploading the cert/private key per se...rather you'll specify the Server path pointing to the cert/private key. 

To do this, navigate to (hostname:8800/console/settings)

**NOT** (hostname:8800/settings)

Under "TLS Key & Cert", you'll have the option to specify the path pointing to your newly generated certificate and key.

- Enjoy!

### references

Reference: https://letsencrypt.readthedocs.io/en/latest/using.html#manual

### gotchas

Ensure the hostname is properly configured in the Replicated/management console ~ (hostname:8800/settings) **and** the hostname used matches the DNS records associated with the TLS certificates.

Make sure the auth callback url in Github/Github Enterprise matches the domain name pointing to the services box, including the protocol used e.g. **https**://info-tech.io/
