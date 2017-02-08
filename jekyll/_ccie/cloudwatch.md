---
layout: enterprise
section: enterprise
title: "CloudWatch Monitoring"
category: [advanced-config]
order: 4.0
description: "How to enable and monitor CloudWatch for CircleCI Enteprise."
---


_NOTE: CloudWatch does not currently work to monitor macOS containers_


## Enabling

* CloudWatch Support has been added in version 0.2.11 (released on Monday, Nov 31, 2015).  You should upgrade on Replicated to get the benefit. There is no need to cycle / update your builder machines.

* Users should check and add `cloudwatch:*` to the IAM policy permission.  New installations (since that date) will have it by default.  Prior installations may require modifications.  The actual mechanism for change depends on how they installed it, e.g. using Terraform/CloudFormation or manual.  The new recommended IAM policy is at <https://enterprise-docs.circleci.com/assets/aws/circleci-iam-policy.json>.

You can enable the setting by going to: **Replicated Admin > Settings > Monitoring > Enable Cloudwatch**.

## What to Monitor

Note that CloudWatch already monitors the health and basic checks for the EC2 instances (e.g. CPU/memory/disk space/basic count).
These values are useful for basic monitoring and alerting.  If RAM/CPU is frequently pigged, considered upgrading machine types for services box or decreasing number of containers per container

With CloudWatch integration, there will be new custom metrics to monitor CCIE Health:

 * `ContainersReserved` gives you a hint of their usage over time.  Good for capacity planning and budget estimation.
 * `ContainersLeaked` should be 0 or close to 0.  If it jumps up, that means there is a potential infrastructure issue.
 * `ContainersAvailable` can be used for AutoScaling.  If it's too high, you can shut some machines down, if it's too low, you can start up machines.

 * `circle.run-queue.builds` and `circle.run-queue.containers` express how backed up and under-provisioned the system is, with builds that aren't running.  Ideally, the ASG will account for this as well.  If the values are too high, it's probably an outage/incident.

 * `circle.state.running-builds` can give you a general insight into current usage.

 * Note that `circle.state.num-masters` include the web server host in Services box that doesn't run any builds.  That means the following:
   * if the value is 0 -- there is an outage or system is in maintenance.  Risk of dropping some github hooks
   * If the value is 1 -- means no builders - i.e. we accept web traffic and git hub hooks but not running them
   * If the value is 1 + n -- there are n builders running and visible to the system. If this is less than the total number of builders launched through AWS, your builders are most likely not launching correctly. If builds are queueing, but this number says you have builders available to the system, you mostly likely need to launch more.
