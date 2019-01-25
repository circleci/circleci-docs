---
layout: enterprise
section: enterprise
title: "Enabling CloudWatch Monitoring"
category: [advanced-config]
order: 4.0
description: "How to enable and monitor CloudWatch for CircleCI Enterprise."
sitemap: false
---

To enable Cloudwatch support, check and add `cloudwatch:*` to the IAM policy permission.  Installations completed after November, 2015 will have it enabled by default.  Prior installations may require modifications.  The actual mechanism for change depends on how it was installed, for example using Terraform/CloudFormation or manually.  Refer to the best practice IAM policy at <https://enterprise-docs.circleci.com/assets/aws/circleci-iam-policy.json>.

You can enable the setting by going to: Replicated Admin > Settings > Monitoring > Enable Cloudwatch. **Note:** CloudWatch does **not** support monitoring of macOS containers.

## Component Monitoring

CloudWatch already monitors the health and basic checks for the EC2 instances, for example, CPU, memory, disk space, and basic counts with alerts. Consider upgrading machine types for the Services instance or decrease the number of containers per container if CPU or memory become a bottleneck.

CloudWatch integration enables the following custom metrics for health monitoring:

 * `ContainersReserved` gives you a view of usage over time for capacity planning and budget estimation.
 * `ContainersLeaked` should be 0 or close to 0, an increase indicates a potential infrastructure issue.
 * `ContainersAvailable` is used for Auto Scaling.  If the value is too high, you can shut some machines down, if the value is too low, you can start up machines.

 * `circle.run-queue.builds` and `circle.run-queue.containers` expresses the degree to which the system is under-provisioned  and number of queued builds that are not running.  Ideally, the ASG will account for this as well.  Values that are too high may indicate an outage or incident.

 * `circle.state.running-builds` provides a general insight into current usage.

 * Note that `circle.state.num-masters` includes the web server host in the Services machine that does **not** run any builds.  That means the following:
   * If the value is 0, there is an outage or system is in maintenance.  Risk of dropping some github hooks.
   * If the value is 1, there are no Builders, so web traffic and GitHub hooks are accepted, but not run.
   * If the value is 1 + n, there are n builders running and visible to the system. If this is less than the total number of builders launched through AWS, your builders are most likely not launching correctly. If builds are queueing, but this number says you have builders available to the system, you may need to launch more builders.
