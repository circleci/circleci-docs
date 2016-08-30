---
layout: enterprise
title: "Using Centralized Logging to Collect CircleCI Enterprise logs"
category: [resources]
order: 4.0
description: "How to use centralized logging with CircleCI Enterprise."
---

Collecting and centralizing logs is an essential component of monitoring.  The
logs provide audit trails as well as debugging information for infrastructural
failures.  This document describes how you can integrate CircleCI Enterprise
with your logging solution.

## Logging appliances, e.g. Logstash/Splunk/etc

Most logging appliances (e.g. [Logstash](https://www.elastic.co/products/logstash),
[Splunk](http://www.splunk.com/), [Graylog](https://www.graylog.org/), and
[Amazon Cloudwatch Logs](https://aws.amazon.com/cloudwatch/details/#log-monitoring)), require
installing a custom agent on each box and configuring it to collect logs and
forward it to the service.

CircleCI Enterprise builder boxes use common conventions for where to store logs, with all logs stored in `/var/log/**/*.log` (except for Docker, which stores logs in:
`/var/lib/docker/containers/**/*-json.log`).

Configuring the agents are highly specific to the environment, the
authentication mechanisms, and centralized logging server service discovery
mechanism.  You can reuse your current practices for setting up the agent and
configuration.

Assuming you are using our Terraform/CloudFormation templates, you can modify
the launch configuration to add the hook to install the agent and run it:

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

If you are using an orchestration tool, e.g. Chef/Puppet/SaltStack, you can apply the appropriate recipe/cookbook to the builder instances.

We are looking into providing first class support to integrate with Amazon CloudWatch Logs and Logstash. Please let us know if you are interested in having that integration.

## Integrating with Syslog

CirclecI Builders integrate with the `syslog` facility.  `Syslog` is a widely used standard for logging, and most agents integrate with it out of the box.  You can configure the builder machines to emit logs to the `syslog` facility by setting `CIRCLE_LOG_TO_SYSLOG` to `true` in the launch configuration:

```
#!/bin/bash
curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
    CIRCLE_LOG_TO_SYSLOG=true \
    SERVICES_PRIVATE_IP=<private ip address of services box> \
    CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
    bash
```

You may then configure `syslog` to forward logging to a centralized rsyslog server, or you can configure a local logging agent to monitor the syslog rather than monitor files.

The Services box uses Docker.  You can customize tbe Docker daemon to route logs to your desired supported destination.  For more details see the [Docker documentation on logging drivers](https://docs.docker.com/engine/reference/logging/overview/).

While syslog support is quite popular, we find most users prefer file-based
agent configuration.  Many tools default to file-based logging, and _using the
syslog facility as the only mode of logging may accidentally ignore important
logging info_.  Configuring custom agents to watch all of `/var/log/**/*` will end up
capturing most logging files including syslog.
