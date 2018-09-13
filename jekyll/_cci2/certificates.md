---
layout: classic-docs
title: "Certificates"
short-title: "Certificates"
description: "How to set up certificates in your CircleCI installation"
categories: [administration]
order: 55
---

This document provides a script for using a custom Root Certifcate Authority and the process for using an Elastic Load Balancing certificate in the following sections:  

* TOC
{:toc}


## Using a Custom Root CA

This section describes how to use a custom Root Certificate Authority (CA).

Some installation environments use internal Root Certificate Authorities for encrypting and establishing trust between servers.  If you are using a Root certificate, you will need to import and mark it as a trusted certificate at CircleCI GitHub Enterprise instances. CircleCI will respect such trust when communicating with GitHub and webhook API calls.

CA Certificates must be in a format understood by Java Keystore, and include the entire chain.

The following script provides the necessary steps.

```
GHE_DOMAIN=github.example.com

# Grab the CA chain from your GitHub Enterprise deployment.
openssl s_client -connect ${GHE_DOMAIN}:443 -showcerts < /dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /usr/local/share/ca-certificates/ghe.crt
```

Then, navigate to the system console at port 8800 and change the protocol to upgraded. You can change the protocol to "HTTPS (TLS/SSLEnabled)" setting and restart the services.  When trying "Test GitHub Authentication" you should get Success now rather than x509 related error.


## Setting up ELB Certificates

CircleCI requires the following steps to get ELB (Elastic Load Balancing) certificates working as your primary certs. The steps to accomplish this are below. You will need certificates for the ELB and CircleCI Server as described in the following sections. 

**Note:** Opening the port for HTTP requests will allow CircleCI to return a HTTPS redirect.

1. Open the following ports on your ELB:

Load BalancerProtocol | Load Balancer Port | Instance Protocol | Instance Port | Cipher | SSL Certificate
----------|----------|----------|----------|----------|----------
HTTP | 80 | HTTP | 80 | N/A | N/A
SSL| 443 | SSL | 443 | Change | your-cert
SSL | 3000 | SSL | 3000 | Change | your-cert
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

3. Next, in the management console for CircleCI, upload a valid certificate and key file to the `Privacy` Section. These don't need to be externally signed or even current certs as the actual cert management is done at the ELB. But, to use HTTPS requests, CircleCI requires a certificate and key in which the "Common Name (FQDN)" matches the hostname configured in the admin console.

4. It is now possible to set your Github Authorization Callback to `https` rather than `http`.  

## Setting up TLS/HTTPS on CircleCI Server

You may use various solutions to generate valid SSL certificate and key file.  Two solutions are provided below.

### Using Certbot

This section describes setting up TLS/HTTPS on your Server install using Certbot by manually adding a DNS record set to the Services machine. Certbot generally relies on verifying the DNS record via either port 80 or 443, however this is not supported on CircleCI Server installations as of 2.2.0 because of port conflicts.


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


5. After the record is successfully generated, save `fullchain.pem` and `privkey.pem` locally.



If you're using Route 53 for your DNS records, adding a TXT record is straightforward. When you're creating a new record set, be sure to select type -> TXT and provide the appropriate value enclosed in quotes.

### Using Self-Signed Certificates

Because the ELB does not require a _current_ certificate, you may choose to generate a self-signed certificate with an arbitrary duration.

1. Generate the certificate and key using openssl command `openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 1 -out certificate.pem`

2. Provide the appropriate information to the prompts.  **NOTE:** The Common Name provided must match the host configured in CircleCI.

3. Save the certificate.pem and key.pem file locally.


### Adding the certificate to CircleCI Server

Once you have a valid certificate and key file in pem format, you must upload it to CircleCI Server.

1. To do so, navigate to `hostname:8800/console/settings`.

2. Under "Privacy" section, check the box for "SSL only (Recommened)"

3. Upload your newly generated certificate and key.

4. Click "Verify TLS Settings" to ensure everything is working.

5. Click "Save" at the bottom of the settings page and restart when prompted.

## References

Reference: https://letsencrypt.readthedocs.io/en/latest/using.html#manual

## Troubleshooting

Ensure the hostname is properly configured in the Replicated/management console ~ (hostname:8800/settings) **and** that the hostname used matches the DNS records associated with the TLS certificates.

Make sure the Auth Callback URL in Github/Github Enterprise matches the domain name pointing to the services box, including the protocol used, for example **https**://info-tech.io/.
