---
layout: enterprise
section: enterprise
title: "Backing up CircleCI Data"
category: [advanced-config]
order: 8
description: "How to regularly back up CircleCI Enterprise"
sitemap: false
---

This document describes how to back up your CircleCI Enterprise application so that you can recover from accidental or unexpected loss of CircleCI data attached to the Services machine:

* TOC 
{:toc}

**Note:** If you are running CircleCI in an HA configuration, you must use standard backup mechanisms for the external datastores. See the [High Availability]({{site.baseurl}}/enterprise/high-availability/) document for more information.

## Backing up the Database

If you have **not** configured CircleCI for HA, the best practice for backing up your CircleCI data is to use VM snapshots of the virtual disk acting as the root volume for the Services machine. Backups may be performed without downtime as long the underlying virtual disk supports such an operation as is true with AWS EBS. There is a small risk, that varies by filesystem and distribution, that snapshots taken without a reboot may have some data corruption, but this is rare in practice. If zero downtime backups and robustness in the face of data corruption issues are required, then an [HA configuration]({{site.baseurl}}/enterprise/high-availability/) may be the best solution.

## Backing up Object Storage

Build artifacts, output, and caches are generally stored in object storage services like AWS S3. These services are considered highly redundant and are unlikely to require separate backup. An exception is if your instance is setup to store large objects locally on the Services machine, either directly on-disk or on an NFS volume. In this case, you must separately back these files up and ensure they are mounted back to the same location on restore.

## Snapshotting on AWS EBS

There are a few features of AWS EBS snapshots that make the backup process quite easy:

1. To take a manual backup, choose the instance in the EC2 console and select Actions > Image > Create Image. 

2. Select the No reboot option if you want to avoid downtime. 
An AMI that can be readily launched as a new EC2 instance for restore purposes is created. 

It is also possible to automate this process with the AWS API.  Subsequent AMIs/snapshots are only as large as the difference (changed blocks) since the last snapshot, such that storage costs are not necessarily larger for more frequent snapshots, see [Amazon's EBS snapshot billing](https://aws.amazon.com/premiumsupport/knowledge-center/ebs-snapshot-billing/) document for details.

## Restoring From Backup

When restoring testing backups or performing a restore in production, you may need to make a couple of changes on the newly launched instance if its public or private IP addresses have changed:

1. Launch a new VM using a previous root-volume backup.
2. Ensure that the hostname configured in the settings page at port 8800 reflects the correct address. If this hostname has changed, you will also need to change it in the corresponding GitHub OAuth application settings or create a new OAuth app to test the recovery and log in to the application.
3. Update any references to the backed-up instance's public and private IP addresses in `/etc/default/replicated` and `/etc/default/replicated-operator` on Debian/Ubuntu or `/etc/sysconfig/*` in RHEL/CentOS to the new IP addresses.

## Cleaning up Build Records

While filesystem-level data integrity issues are rare and preventable, there will likely be some data anomalies in a point-in-time backup taken while builds are running on the system. For example, a build that is only half-way finished at backup time may result in missing the latter half of its command output, and it may permanently show that it is in "Running" state in the application.

If you want to clean up any abnormal build records in your database after a recovery, you can delete them by running the following commands on the Services machine replacing the example build URL with an actual URL from your CircleCI application:

```
$ circleci dev-console
# Wait for console to load
user=> (admin/delete-build "https://my-circleci-hostname.com/gh/my-org/my-project/1234") 
```
