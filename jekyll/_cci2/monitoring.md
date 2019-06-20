---
layout: classic-docs
title: "Server Settings, Auto Scaling, and Monitoring"
category: [administration]
order: 30
---

This document is for System Administrators who are setting environment variables for installed Nomad Clients, scaling their cluster, gathering metrics for monitoring their CircleCI installation, and viewing logs:

* TOC
{:toc}

## Advanced System Monitoring

Enable the ability to forward system and Docker metrics to supported platforms by going to Replicated Admin > Settings and enabling the provider of your choice, for example `https://example.com:8800/settings#cloudwatch_metrics`.

### Metrics Details

Services VM Host and Docker metrics are forwarded via [Telegraf](https://github.com/influxdata/telegraf), a plugin-driven server agent for collecting and reporting metrics.

Following are the metrics that are enabled:

* [CPU](https://github.com/influxdata/telegraf/blob/master/plugins/inputs/cpu/README.md#cpu-time-measurements)
* [Disk](https://github.com/influxdata/telegraf/blob/master/plugins/inputs/disk/README.md#metrics)
* [Memory](https://github.com/influxdata/telegraf/blob/master/plugins/inputs/mem/README.md#metrics)
* [Networking](https://github.com/influxdata/telegraf/blob/master/plugins/inputs/net/NET_README.md#measurements--fields)
* [Docker](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/docker#metrics)

#### Nomad Job Metrics

In addition to the metrics above, [Nomad job metrics](https://www.nomadproject.io/docs/telemetry/metrics.html) are enabled and emitted by the Nomad Server agent. Five types of metrics are reported:

`circle.nomad.server_agent.poll_failure`: Returns 1 if the last poll of the Nomad agent failed, otherwise it returns 0.
`circle.nomad.server_agent.jobs.pending`: Returns the total number of pending jobs across the cluster.
`circle.nomad.server_agent.jobs.running`: Returns the total number of running jobs across the cluster.
`circle.nomad.server_agent.jobs.complete`: Returns the total number of complete jobs across the cluster.
`circle.nomad.server_agent.jobs.dead`: Returns the total number of dead jobs across the cluster.

When the Nomad Metrics container is running normally, no output will be written to standard output or standard error. Failures will elicit a message to standard error.

### Supported Platform(s)

There are two built-in platforms; AWS CloudWatch and DataDog.

#### AWS CloudWatch

Click `Enable' under AWS CloudWatch to begin configuration.
![AWS CloudWatch](  {{ site.baseurl }}/assets/img/docs/metrics_aws_cloudwatch1.png)

##### Configuration

There are two options for configuration:

* Use the IAM Instance Profile of the services box and configure your custom region and namespace.

    ![Configuration IAM](  {{ site.baseurl }}/assets/img/docs/metrics_aws_cloudwatch2a.png)

* Alternatively, you may use your AWS Access Key and Secret Key along with your custom region and namespace.

    ![Configuration Alt](  {{ site.baseurl }}/assets/img/docs/metrics_aws_cloudwatch2b.png)

After saving you can *verify* that metrics are forwarding by going to the AWS CloudWatch console.

#### DataDog

Click `Enable' under DataDog Metrics to begin configuration.

![DataDog](  {{ site.baseurl }}/assets/img/docs/metrics_datadog1.png)

##### Configuration

Enter your DataDog API Key.

![DataDog](  {{ site.baseurl }}/assets/img/docs/metrics_datadog2.png)

After saving you can *verify* that metrics are forwarding by going to the DataDog metrics summary.

#### Custom Metrics

Custom Metrics via Telegraf configuration file is an alternative to the predefined CloudWatch and Datadog metric sections above. It can also be used instead of those sections for more fine grained control.

![Custom](  {{ site.baseurl }}/assets/img/docs/metrics-custom.png)

##### Configuration

Configuration options are based on Telegraf's documented output plugins. See their documentation [here](https://github.com/influxdata/telegraf#output-plugins).

For example, if you would like to use the InfluxDB Output Plugin you would need to follow these steps;
1. SSH into the Servics Machine
2. cd `/etc/circleconfig/telegraf/influxdb.conf`
3. Adding the desired ouputs, for example
```
[[output.influxdb]]
  url = "http://52.67.66.155:8086"
  database = "testdb"
```
4. Run `docker restart telegraf` to restart the container to load or reload any changes.

You may check the logs by running `docker logs -f telegraf` to confirm your output provider (e.g. influx) is listed in the configured outputs.

Additionally, if you would like to ensure that all metrics in an installation are tagged against an environment you could place the following code in your config:
```
[global_tags]
Env="<staging-circleci>"
```

Please see the InfluxDB [documentation](https://github.com/influxdata/influxdb#installation) for default and advanced installation steps.

Note: Any changes to the config will require a restart of the system.

## Scheduled Scaling

By default, an Auto Scaling Group (ASG) is created on your AWS account. Go to your EC2 Dashboard and select Auto Scaling Groups from the left side menu. Then, in the Instances tab, set the Desired and Minimum number to define the number Nomad Clients to spin up and keep available. Use the Scaling Policy tab of the Auto Scaling page to scale up your group automatically only at certain times, see below for best practices for defining policies.

Refer to the Shutting Down a Nomad Client section of the [Nomad]({{ site.baseurl }}/2.0/nomad/#shutting-down-a-nomad-client) document for instructions on draining and scaling down the Nomad Clients.

### Auto Scaling Policy Best Practices

There is a [blog post series](https://circleci.com/blog/mathematical-justification-for-not-letting-builds-queue/)
 wherein CircleCI engineering spent time running simulations of cost savings for the purpose of developing a general set of best practices for Auto Scaling. Consider the following best practices when setting up AWS Auto Scaling:

1. In general, size your cluster large enough to avoid queueing builds. That is, less than one second of queuing for most workloads and less than 10 seconds for workloads run on expensive hardware or at highest parallellism. Sizing to reduce queuing to zero is best practice because of the high cost of developer time, it is difficult to create a model in which developer time is cheap enough for under-provisioning to be cost-effective.

2. Create an Auto Scaling group with a Step Scaling policy that scales up during the normal working hours of the majority of developers and scales back down at night. Scaling up during the weekday normal working hours and back down at night is the best practice to keep queue times down during peak development without over provisioning at night when traffic is low. Looking at millions of builds over time, a bell curve during normal working hour emerges for most data sets.

This is in contrast to auto scaling throughout the day based on traffic fluctuations because modeling revealed that boot times are actually too long to prevent queuing in real time. Use [Amazon's Step Policy](http://docs.aws.amazon.com/autoscaling/latest/userguide/as-scaling-simple-step.html) instructions to set this up along with Cloudwatch Alarms.

## Logging For 1.0

Collecting and centralizing logs is an essential component of monitoring.  The
logs provide audit trails as well as debugging information for infrastructure
failures.  This document describes how you can integrate CircleCI
with your logging solution in the following sections:

### Basic System Monitoring with CloudWatch

Enable CloudWatch by going to Replicated Admin > Settings > Enhanced AWS Integration (1.0 Only) > Enable Cloudwatch, for example, `https://example.com:8800/settings#enhanced_aws`. **Note:** CloudWatch does **not** support monitoring of macOS containers.

CloudWatch already monitors the health and basic checks for EC2 instances, for example, CPU, memory, disk space, and basic counts with alerts. Consider upgrading machine types for the Services instance or decrease the number of CPUs per container if CPU or memory become a bottleneck.

### Installing Logging Appliance Agents

CircleCI 1.0 Builders store logs in `/var/log/**/*.log` except for Docker, which stores logs in
`/var/lib/docker/containers/**/*-json.log`.

Logging appliances generally require
installation of a custom agent on each machine and configuration that collects logs and
forwards them to a service.
Some available logging appliances are:

* [Amazon Cloudwatch Logs](https://aws.amazon.com/cloudwatch/details/#log-monitoring)
* [Graylog](https://www.graylog.org/)
* [LogDNA](https://logdna.com/)
* [Logstash](https://www.elastic.co/products/logstash)
* [Splunk](http://www.splunk.com/)

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

### Integrating With Syslog

CircleCI 1.0 Builders integrate with the `syslog` facility.  `Syslog` is a widely used standard for logging, and most agents integrate with it seamlessly.  Configure the builder machines to emit logs to the `syslog` facility by setting `CIRCLE_LOG_TO_SYSLOG` to `true` in the launch configuration:

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

<!---## Health Monitoring Metrics

CloudWatch integration enables the following custom metrics for health monitoring:

 * `ContainersReserved` gives you a view of usage over time for capacity planning and budget estimation.
 * `ContainersLeaked` should be 0 or close to 0, an increase indicates a potential infrastructure issue.
 * `ContainersAvailable` is used for Auto Scaling.  If the value is too high, consider shutting some machines down, if the value is too low, consider starting up machines.

 * `circle.run-queue.builds` and `circle.run-queue.containers` expresses the degree to which the system is under-provisioned  and number of queued builds that are not running.  Ideally, the ASG will account for this as well.  Values that are too high may indicate an outage or incident.

 * `circle.state.running-builds` provides a general insight into current usage.

 * Note that `circle.state.num-masters` includes the web server host in the Services machine that does **not** run any builds.  That means the following:
   * If the value is 0, there is an outage or system is in maintenance.  Risk of dropping some github hooks.
   * If the value is 1, there are no Builders, so web traffic and GitHub hooks are accepted, but not run.
   * If the value is 1 + n, there are n builders running and visible to the system. If this is less than the total number of builders launched through AWS, your builders are most likely not launching correctly. If builds are queueing, but this number says you have builders available to the system, you may need to launch more builders.
--->
