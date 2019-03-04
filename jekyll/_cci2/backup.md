---
layout: classic-docs
title: "Backing up CircleCI Data"
category: [administration]
order: 50
description: "How to regularly back up a CircleCI installation"
---

This document describes how to back up your CircleCI application so that you can recover from accidental or unexpected loss of CircleCI data on the Services machine:

* TOC 
{:toc}

**Note:** If you are running CircleCI with external databases configured, you must use separate standard backup mechanisms for those external datastores. 

## Backing up the Database

The best practice for backing up your CircleCI Services machine is to use VM snapshots of the virtual disk acting as the root volume for the Services machine. Backups may be performed without downtime as long the underlying virtual disk supports such an operation as is true with AWS EBS. 

## Backing up Object Storage

Build artifacts, output, and caches are generally stored in object storage services like AWS S3. These services are considered highly redundant and are unlikely to require separate backup. An exception is if your instance is set up to store large objects locally on the Services machine, either directly on-disk or on an NFS volume. In this case, you must separately back these files up and ensure they are mounted back to the same location on restore.

## Snapshotting on AWS EBS

There are a few features of AWS EBS snapshots that make the backup process quite easy:

1. To take a manual backup, choose the instance in the EC2 console and select Actions > Image > Create Image. 

2. Select the No reboot option if you want to avoid downtime. 
An AMI that can be readily launched as a new EC2 instance for restore purposes is created. 

It is also possible to automate this process with the AWS API.  Subsequent AMIs/snapshots are only as large as the difference (changed blocks) since the last snapshot, such that storage costs are not necessarily larger for more frequent snapshots, see [Amazon's EBS snapshot billing](https://aws.amazon.com/premiumsupport/knowledge-center/ebs-snapshot-billing/) document for details.

## Restoring From Backup

When restoring test backups or performing a restore in production, you may need to make a couple of changes on the newly launched instance if its public or private IP addresses have changed:

1. Launch a fresh EC2 instance using the newly generated AMI from the previous steps.
2. Stop the app in the Management Console (at port 8800) if it is already running.
2. Ensure that the hostname configured in the Management Console at port 8800 reflects the correct address. If this hostname has changed, you will also need to change it in the corresponding GitHub OAuth application settings or create a new OAuth app to test the recovery and log in to the application.
3. Update any references to the backed-up instance's public and private IP addresses in `/etc/default/replicated` and `/etc/default/replicated-operator` on Debian/Ubuntu or `/etc/sysconfig/*` in RHEL/CentOS to the new IP addresses.
4. From the root directory of the Services box, run `sudo rm -rf /opt/nomad`.
5. Restart the app in the Management Console at port 8800.

## Cleaning up Build Records

While filesystem-level data integrity issues are rare and preventable, there will likely be some data anomalies in a point-in-time backup taken while builds are running on the system. For example, a build that is only half-way finished at backup time may result in missing the latter half of its command output, and it may permanently show that it is in Running state in the application.

If you want to clean up any abnormal build records in your database after a recovery, you can delete them by running the following commands on the Services machine replacing the example build URL with an actual URL from your CircleCI application:

```
$ circleci dev-console
# Wait for console to load
user=> (admin/delete-build "https://my-circleci-hostname.com/gh/your-org/my-project/1234") 
```
