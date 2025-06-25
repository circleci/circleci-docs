---
layout: enterprise
section: enterprise
title: "Using Private Subnets on AWS"
category: [advanced-config]
order: 3
description: "Information on private subnets in AWS"
hide: true
sitemap: false
---

Private subnets on AWS are supported, but please make sure to use the following settings:

  - The private subnet for builder boxes need either a NAT instance or internet gateway configured for the outbound traffic to the internet.
  - Enable [VPC Endpoint for S3](https://aws.amazon.com/blogs/aws/new-vpc-endpoint-for-amazon-s3/).  This should significantly improve S3 operations for CircleCI and other nodes within your subnet
  - Ensure that your NAT is adequately powered for heavy network operations.  Highly parallel builds using Docker and external network resources can strain your NATs.  This is very deployment-specific - but if you notice slowness in network and cache operations later, it's time to upgrade your NATs.
  - If you are integrating with https://github.com/, ensure that your network ACL whitelists github.com webhooks.  When integrating with GitHub, we recommend setting up CircleCI in a public subnet, or setup a public load balancer to forward github.com traffic.
  - Ensure that [DNS is enabled for your VPC](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating). Specifically, `enableDnsSupport` must be enabled, or you must otherwise ensure that DNS is configured correctly on your instances.
