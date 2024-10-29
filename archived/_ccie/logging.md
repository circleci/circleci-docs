---
layout: enterprise
section: enterprise
title: "Using Centralized Logging"
category: [advanced-config]
order: 4.0
description: "How to use centralized logging with CircleCI."
sitemap: false
---

Collecting and centralizing logs is an essential component of monitoring.  The
logs provide audit trails as well as debugging information for infrastructure
failures.  This document describes how you can integrate CircleCI Enterprise
with your logging solution in the following sections:

* TOC
{:toc}

## Installing Logging Appliance Agents

CircleCI Builders store logs in `/var/log/**/*.log` except for Docker, which stores logs in 
`/var/lib/docker/containers/**/*-json.log`.

Logging appliances generally require
installation of a custom agent on each machine and configuration that collects logs and
forwards them to a service, for example [LogDNA](https://logdna.com/), [Logstash](https://www.elastic.co/products/logstash),
[Splunk](http://www.splunk.com/), [Graylog](https://www.graylog.org/), and
[Amazon Cloudwatch Logs](https://aws.amazon.com/cloudwatch/details/#log-monitoring).

Configure the agent according to the environment, the
authentication mechanisms, and centralized logging service discovery
mechanism.  You can reuse your current practices for setting up the agent and
configuration.

If you are using CircleCI Terraform/CloudFormation templates, you can modify
the launch configuration to add the hook to install the agent and run it as follows:

```
#!/usr/bin/bash


#### Log configuration - using Amazon CloudWatch as an example

# Install the agent, using Amazon CloudWatch as an example
wget https://s3.amazonaws.com/aws-cloudwatch/downloads/latest/awslogs-agent-setup.py

# Configure agent
cat <<EOF >/root/awslogs.conf
[general]
state_file = /var/awslogs/state/agent-state

[/var/log/circle-builder/circle.log]
datetime_format = %Y/%m/%d %H:%M:%S
file = /var/log/circle-builder/circle.log
buffer_duration = 5000
log_stream_name = {instance_id}
initial_position = end_of_file
log_group_name = /var/log/circle-builder/circle.log
EOF


## Run agent
python ./awslogs-agent-setup.py --region us-west-2 --non-interactive --configfile=/root/awslogs.conf

#### Run CircleCI Builder as typical

curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
    SERVICES_PRIVATE_IP=<private ip address of services box> \
    CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
    bash
```

If you are using an orchestration tool, for example Chef, Puppet, or SaltStack, it is possible to apply the appropriate recipe or cookbook to the builder instances.

## Integrating With Syslog

CircleCI Builders integrate with the `syslog` facility.  `Syslog` is a widely used standard for logging, and most agents integrate with it seamlessly.  Configure the builder machines to emit logs to the `syslog` facility by setting `CIRCLE_LOG_TO_SYSLOG` to `true` in the launch configuration:

```
#!/bin/bash
curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
    CIRCLE_LOG_TO_SYSLOG=true \
    SERVICES_PRIVATE_IP=<private ip address of services box> \
    CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
    bash
```

Then, configure `syslog` to forward logging to a centralized `rsyslog` server, or configure a local logging agent to monitor the `syslog` rather than monitor files.

The Services machine uses Docker.  It is possible to customize the Docker daemon to route logs to your desired supported destination,  see the [Docker documentation on logging drivers](https://docs.docker.com/engine/reference/logging/overview/) for details.

**Note:** Many tools default to file-based logging, and _using the
syslog facility as the only mode of logging may accidentally ignore important
logging info_.  Configuring custom agents to watch all of `/var/log/**/*` will result in
capturing most logging files including `syslog`.
