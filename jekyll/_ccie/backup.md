---
layout: enterprise
section: enterprise
title: "Backing up CircleCI Enterprise"
category: [advanced-config]
order: 8
description: "How to regularly back up CircleCI Enterprise"
---

This document will describe how to back up your CircleCI Enterprise application so that you can recover from accidental or unexpected loss of the VM containing all of your persistent CircleCI data (the services box) in the following sections:

* TOC 
{:toc}

## Backing up DB data

The primary, recommended mechanism for backing up your CircleCI data is to use VM snapshots of the virtual disk acting as the root volume for the services box (the machine that serves up the end-user-facing CircleCI UI).

**Note:** If you are running CircleCI Enterprise in an HA configuration, you must use standard backup mechanisms for the external datastores. See the [High Availability]({{site.baseurl}}/enterprise/high-availability/) document for more information.

These backups can be performed without downtime as long the underlying virtual disk supports such an operation (this is true with AWS EBS for example). There is a small risk (that varies by filesystem/distro) that snapshots taken without a reboot may have some data corruption, but this is rare in practice. If zero downtime backups and robustness in the face of data corruption issues are required, then an [HA configuration]({{site.baseurl}}/enterprise/high-availability/) may be the best solution.

## Backing up object storage

Build artifacts, output, and caches are generally stored in object storage services like AWS S3. These services are generally considered highly redundant and unnecessary to backup for backup/recovery purposes. An exception is if your instance is setup to store large objects locally on the services box, either directly on-disk or on an NFS volume. In this case, you will need to separately back these files up and ensure they're mounted back to the same location on restore.

## Restoring

Restoring from a backup primarily consists of launching a new VM using a previous root-volume backup. When testing backups or performing a restore in production, you may need to make a couple of changes on the newly launched instance if its public/private IP addresses have changed:

1. Ensure that the hostname configured in the settings page at port 8800 reflects the correct. If this hostname has changed, you will also need to change it in the corresponding GitHub OAuth application settings (or create a new app to test the recovery) to be able to log into the app.
2. Update any references to the backed-up instance's public/private IP addresses in `/etc/default/replicated` and `/etc/default/replicated-operator` (on Debian/Ubuntu) or `/etc/sysconfig/*` (in RHEL/CentOS) to the new ones.

## Notes on AWS EBS snapshots

There are a few features of AWS' EBS snapshots that make this backup process quite easy:

1. To take a manual backup, you can just select the instance in the EC2 console and select Actions > Image > Create Image. Select the "No reboot" option if you want to avoid downtime. This will create an AMI that can be readily launched as a new EC2 instance for restore purposes. It is also easy to automated this process with the AWS API.

2. If you take frequent snapshots this way, subsequent AMIs/snapshots will only be as large as the difference (changed blocks) since the last snapshot, meaning [storage cost](https://aws.amazon.com/premiumsupport/knowledge-center/ebs-snapshot-billing/) is not necessarily much larger for more frequent snapshots.

## Data integrity considerations

While filesystem-level data integrity issues are rare and preventable, there will likely be some data anomalies in a point-in-time backup taken while builds are running on the system. For example, a build that is only half-way finished at backup time may wind up missing the latter half of its command output, and it may permanently show that it is in "Running" state in the UI.

If you want to clean up any abnormal build records in your database after a recovery, you can delete them by running the following commands on the services box (replace the example build URL with an actual URL from your CircleCI UI):

```
$ circleci dev-console
# Wait for console to load
user=> (admin/delete-build "https://my-circleci-hostname.com/gh/my-org/my-project/1234") 
```
