---
layout: classic-docs
title: "Using the Static Installation Scripts"
category: [administration]
order: 1
description: "Using CircleCI 2.0 static installation scripts."
hide: true
---

This document provides System Administrators with a list of ports for the machines in their CircleCI 2.0 installation:

|  **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** |
|  ------ | ------ | ------ | ------ | ------ | ------ | ------ |
|  **Services Machine** | 80 | TCP | Inbound | End users | HTTP web app traffic |  |
|   | 443 | TCP | Inbound | End users | HTTPS web app traffic |  |
|   | 7171 | TCP | Inbound | End users | Artifacts access |  |
|   | 8081 | TCP | Inbound | End users | Artifacts access |  |
|   | 22 | TCP | Inbound | Administrators | SSH |  |
|   | 8800 | TCP | Inbound | Administrators | Admin console |  |
|   | 8125 | UDP | Bi-directional | Nomad Clients | Metrics |  |
|   | 8125 | UDP | Bi-directional | Nomad Servers | Metrics | Only if using externalised Nomad Servers |
|   | 8125 | UDP | Bi-directional | All Database Servers | Metrics | Only if using externalised databases |
|   | 4647 | TCP | Bi-directional | Nomad Clients | Internal communication |  |
|   | 8585 | TCP | Bi-directional | Nomad Clients | Internal communication |  |
|   | 7171 | TCP | Bi-directional | Nomad Clients | Internal communication |  |
|   | 3001 | TCP | Bi-directional | Nomad Clients | Internal communication |  |
|   | 80 | TCP | Bi-directional | GitHub Enterprise / GitHub.com (whichever applies) | Webhooks / API access |  |
|   | 443 | TCP | Bi-directional | GitHub Enterprise / GitHub.com (whichever applies) | Webhooks / API access |  |
|   | 80 | TCP | Outbound | AWS API endpoints | API access | Only if running on AWS |
|   | 443 | TCP | Outbound | AWS API endpoints | API access | Only if running on AWS |
|   | 5432 | TCP | Outbound | PostgreSQL Servers | PostgreSQL database connection | Only if using externalised databases. Port is user-defined, assuming the default PostgreSQL port. |
|   | 27017 | TCP | Outbound | MongoDB Servers | MongoDB database connection | Only if using externalised databases. Port is user-defined, assuming the default MongoDB port. |
|   | 5672 | TCP | Outbound | RabbitMQ Servers | RabbitMQ connection | Only if using externalised RabbitMQ |
|   | 6379 | TCP | Outbound | Redis Servers | Redis connection | Only if using externalised Redis |
|   | 4647 | TCP | Outbound | Nomad Servers | Nomad Server connection | Only if using externalised Nomad Servers |
|   | 443 | TCP | Outbound | CloudWatch Endpoints | Metrics | Only if using AWS CloudWatch |
|  **Nomad Clients** | 64535-65535 | TCP | Inbound | End users | SSH into builds feature |  |
|   | 80 | TCP | Inbound | Administrators | CircleCI Admin API access |  |
|   | 443 | TCP | Inbound | Administrators | CircleCI Admin API access |  |
|   | 22 | TCP | Inbound | Administrators | SSH |  |
|   | 22 | TCP | Outbound | GitHub Enterprise / GitHub.com (whichever applies) | Download Code From Github. |  |
|   | 4647 | TCP | Bi-directional | Services Machine | Internal communication |  |
|   | 8585 | TCP | Bi-directional | Services Machine | Internal communication |  |
|   | 7171 | TCP | Bi-directional | Services Machine | Internal communication |  |
|   | 3001 | TCP | Bi-directional | Services Machine | Internal communication |  |
|   | 443 | TCP | Outbound | Cloud Storage Provider | Artifacts storage | Only if using external artifacts storage |
|   | 53 | UDP | Outbound | Internal DNS Server | DNS resolution | This is to make sure that your jobs can resolve all DNS names that are needed for their correct operation |
|  **GitHub Enterprise / GitHub.com (whichever applies)** | 22 | TCP | Inbound | Services Machine | Git access |  |
|   | 22 | TCP | Inbound | Nomad Clients | Git access |  |
|   | 80 | TCP | Inbound | Nomad Clients | API access |  |
|   | 443 | TCP | Inbound | Nomad Clients | API access |  |
|   | 80 | TCP | Bi-directional | Services Machine | Webhooks / API access |  |
|   | 443 | TCP | Bi-directional | Services Machine | Webhooks / API access |  |
|  **PostgreSQL Servers** | 5432 | TCP | Inbound | Services Machine | PostgreSQL database connection | Only if using externalised databases. Port is user-defined, assuming the default PostgreSQL port. |
|   | 5432 | TCP | Bi-directional | PostgreSQL Servers | PostgreSQL replication | Only if using externalised databases. Port is user-defined, assuming the default PostgreSQL port. |
|  **MongoDB Servers** | 27017 | TCP | Inbound | Services Machine | MongoDB database connection | Only if using externalised databases. Port is user-defined, assuming the default MongoDB port. |
|   | 27017 | TCP | Bi-directional | MongoDB Servers | MongoDB replication | Only if using externalised databases. Port is user-defined, assuming the default MongoDB port. |
|  **RabbitMQ Servers** | 5672 | TCP | Inbound | Services Machine | RabbitMQ connection | Only if using externalised RabbitMQ |
|   | 5672 | TCP | Bi-directional | RabbitMQ Servers | RabbitMQ mirroring | Only if using externalised RabbitMQ |
|  **Redis Servers** | 6379 | TCP | Inbound | Services Machine | Redis connection | Only if using externalised Redis |
|   | 6379 | TCP | Bi-directional | Redis Servers | Redis replication | Only if using externalised Redis and using Redis replication (optional) |
|  **Nomad Servers** | 4646 | TCP | Inbound | Services Machine | Nomad Server connection | Only if using externalised Nomad Servers |
|   | 4647 | TCP | Inbound | Services Machine | Nomad Server connection | Only if using externalised Nomad Servers |
|   | 4648 | TCP | Bi-directional | Nomad Servers | Nomad Servers internal communication | Only if using externalised Nomad Servers |
{: class="table table-striped"}
