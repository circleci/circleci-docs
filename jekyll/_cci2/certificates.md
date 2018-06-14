---
layout: classic-docs
title: "Certificates"
short-title: "Certificates"
description: "How to set up certificates in your CircleCI installation"
categories: [administration]
order: 55
---

This document describes the process for using ELB certificates and for using Certbot with your CircleCI installation in the following sections:

* TOC
{:toc}

## Setting up ELB Certificates
CircleCI requires the following steps to get ELB (Elastic Load Balancing) certificates working as your primary certs. The steps to accomplish this are below.

**Note:** You only need HTTP below if you plan on using HTTP requests. 

1. Open the following ports on your ELB:

Load BalancerProtocol | Load Balancer Port | Instance Protocol | Instance Port | Cipher | SSL Certificate
----------|----------|----------|----------|----------|----------
HTTP | 80 | HTTP | 80 | N/A | N/A
SSL| 443 | SSL | 443 | Change | your-cert
SSL | 3000 | SSL | 3000 | Change | your-cert
TCP | 4647 | TCP | 4647 | Change | your-cert
HTTPS | 8800 | HTTPS | 8800| Change | your-cert
SSL | 8081 | SSL | 8081 | Change | your-cert
SSL|8082| SSL| 8082 | Change | your-cert
{: class="table table-striped"}

2. Add the following security group on your ELB:

**Note:** The sources below are left open so that anybody can access the instance over these port ranges. If that is not what you want, then feel free to restrict them. Users will experience reduced functionality if your stakeholders are using IP addresses outside of the Source Range. 

Type | Protocol | Port Range | Source
----------|----------|----------|----------
SSH | TCP | 22 | 0.0.0.0
HTTPS | TCP | 443 | 0.0.0.0
Custom TCP Rule | TCP | 8800 | 0.0.0.0
Custom TCP Rule | TCP | 64535-65535 | 0.0.0.0

{: class="table table-striped"}

3. Next, in the management console for CircleCI, upload dummy certs to the `Privacy` Section. These don't need to be real certs as the actual cert management is done at the ELB. But, to use HTTPS requests, CircleCI requires knowledge of at least a dummy cert.

4. It is now possible to set your Github Authorization Callback to `https` rather than `http`.  


## Using Certbot to setup TLS/HTTPS on CircleCI Server

This document provides instructions for setting up TLS/HTTPS on your Server install using Certbot by manually adding a DNS record set to the Services machine. Certbot generally relies on verifying the DNS record via either port 80 or 443, however this is not supported on CircleCI Server installations as of 2.2.0 because of port conflicts.

## Steps

1. Stop the Service from within the Replicated console (hostname:8800).

2. SSH into the Services machine.

3. Install Certbot and generate certificates using the following commands:

```
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install certbot
certbot certonly --manual --preferred-challenges dns
```

4. You'll be instructed to add a DNS TXT record.

If you're using Route 53 for your DNS records, adding a TXT record is straightforward. When you're creating a new record set, be sure to select type -> TXT and provide the appropriate value enclosed in quotes.

5. After the record is successfully generated, run `fullchain.pem` and `privkey.pem` in the Replicated console.

Because you generated the certificate and private keys *on* the services box, you need to specify the Server path pointing to the cert/private key. 

6. To do so, navigate to `hostname:8800/console/settings`.

7. Under "TLS Key & Cert", specify the path pointing to your newly generated certificate and key.

### References

Reference: https://letsencrypt.readthedocs.io/en/latest/using.html#manual

### Troubleshooting

Ensure the hostname is properly configured in the Replicated/management console ~ (hostname:8800/settings) **and** that the hostname used matches the DNS records associated with the TLS certificates.

Make sure the Auth Callback URL in Github/Github Enterprise matches the domain name pointing to the services box, including the protocol used, for example **https**://info-tech.io/.
