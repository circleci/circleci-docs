---
layout: enterprise
section: enterprise
title: "Failover and Backup"
category: [advanced-config]
order: 4.0
description: "This document covers preparing for and recovering from catastrophic events that bring down your instance of CircleCI Enterprise."
published: false
sitemap: false
---

This document covers preparing for and recovering from catastrophic events that bring down your instance of CircleCI Enterprise.
In particular, you will learn how to backup and restore the Services box, and how to
design a failover system.

## Context

CircleCI Enterprise is a distributed system, with two components: a single
Services box and elastic fleet of builder machines.  The builder machines are
ephemeral - they can be terminated and restarted without disruption to the
entire system.  The Services box is currently a single point of failure, and it
contains the datastores that all builders use.

As Services box operation is critical to the availability of the system, it
should be monitored closely - with typical monitoring techniques (e.g.
monitoring available free disk, RAM/CPU utilization and alerting on unexpected
values).

Our current disaster recovery answer is to recover the Services box from backup
or use an out-of-band replication technique.  With automation, this can bring
fail over to under 15 minutes (often much better than that).

If you require a true high-availability setup contact
us to discuss advanced deployment options for the Services box.

In a disaster recovery, there are four stages that this document outlines:

## 1. Outage and unavailability detection

In broad strokes, you can use CloudWatch to monitor the health of the app.  In particular, two classes of metrics are useful:

* Service instance health metrics: e.g. CPU/RAM usage, free disk space usage, etc.  Anything that indicates the server is down or out of capacity signals a problem.  The solution might be a simple rebooting of machine, scale up the machine, or recovering from a backup.

* Entire fleet statistics: With our CloudWatch integration we publish general
cluster health and build capacity. The
[CloudWatch document]({{site.baseurl}}/enterprise/cloudwatch/) specifies the
metrics that should be monitored.  Unexpected values may point to networking or
builder issues.  Those can be handled by examining your networking, AWS setup,
individual builder health, and Services box behavior.

The proper response depends on the failure.  In the cases where the Services Box is
down, e.g. EC2 region is down or AWS killed the instance, you may need
to recover from backups or rely on cold failover.

## 2a. Recovery procedure: Backup and Restore

In the event where the Services box gets in a corrupt, unrecoverable state, recovering from a backup with a good known state is useful.  We have never heard any reports of this to date, but theoretical causes include EBS corruption issue, malicious users changing project settings for many users, etc.

The recovery process for such esoteric outages expects you to have a continuous, recurring backup process in a cronjob.  You can backup frequently and at some significant events (e.g. upon upgrading versions, changing Terraform/Cloudformation scripts). Note that any configuration in circle.yml files lives in source code and will not be affected by an unexpected outage, however any build history or settings configured in the CircleCI UI **after** the recovery point will be lost when recovering from that backup, so your tolerance for data loss will determine the frequency of your backups.

### Backup

#### Backup with EBS
When running in AWS, the best backup strategy is making EBS volume snapshots on a frequent basis according to any internal policy you may have.  EBS volumes can be managed by the AWS CLI or API and triggered by a cronjob.

Here is a sample bash script for performing EBS volume backup:

```bash
# Find instance_id, you can hardcode it, or look it up dynamically
SERVICES_INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=circleci_services" --output text --query 'Reservations[0].Instances[0].InstanceId')
echo "Found Services box: $SERVICES_INSTANCE_ID"

VOLUME_ID=$(aws ec2 describe-instances --instance-id $SERVICES_INSTANCE_ID --output text --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId')
echo "Found volume id: $VOLUME_ID"

aws ec2 create-snapshot --volume-id $VOLUME_ID --description "CircleCI Services box Backup taken at $(date)"

# Also, saving the private address simplify restore significantly -- please save it
SERVICES_PRIVATE_IP=$(aws ec2 describe-instances --instance-id $SERVICES_INSTANCE_ID --output text --query 'Reservations[0].Instances[0].PrivateIpAddress')
echo "Found private IP address: $SERVICES_PRIVATE_IP"
```
You can expect an output like the following:

```
Found Services box: i-b657c36c
Found volume id: vol-ba131d5c
{
    "Description": "CircleCI Services box Backup taken at Thu Jan 21 08:48:33 EST 2016",
    "Encrypted": false,
    "VolumeId": "vol-ba131d5c",
    "State": "pending",
    "VolumeSize": 30,
    "Progress": "",
    "StartTime": "2016-01-21T13:48:34.000Z",
    "SnapshotId": "snap-cb1a238d",
    "OwnerId": "833371238208"
}
Found private IP address: 172.31.1.147
```

#### Backup with tarballs

Alternatively, you can backup with zero-downtime backup tool, `circleci-backup` - which emits a backup tarball.  You can trigger the backup script in a cronjob and upload the file to S3 or any backup storage.

To backup, you run `circleci-backup` with a path to a destination directory and it will create a tarball on the directory named `circleci-data-export.tar.bz2`.

```
$ # you must specify a directory
$ circleci-backup /tmp/backup-2016-04-13_1
$ # the tarball will be present in `/tmp/backup-2016-04-13_1/circleci-data-export.tar.bz2
```

NOTE: The script assume that you have enough disk space (including for scratch temp purposes) at the directory.  If space is scarse, consider attaching an additional volume.

### Restore

#### Restore from EBS
If a restore is warranted, you need to find the appropriate latest snapshot to restore from.  This is a standard AWS EC2 operation: [http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-launch-snapshot.html](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-launch-snapshot.html).

You can find a list of the available snapshots from the EC2 console or by using `aws ec2 describe-snapshots` as below:

```bash
$ aws ec2 describe-snapshots  --filters "Name=description,Values=CircleCI*"
{
    "Snapshots": [
        {
            "Description": "CircleCI Services box Backup taken at Thu Jan 21 08:34:33 EST 2016",
            "Encrypted": false,
            "VolumeId": "vol-ba131d5c",
            "State": "completed",
            "VolumeSize": 30,
            "Progress": "100%",
            "StartTime": "2016-01-21T13:34:33.000Z",
            "SnapshotId": "snap-52c52a11",
            "OwnerId": "833371238208"
        }
    ]
}
```

In AWS EC2, to start from a snapshot, you would need to convert the snapshot to an AMI and then launch the instance.  The following is a sample script:

```bash
$ aws ec2 register-image --name "CircleCI-restore-$(date '+%s')"  --description "CircleCI Services Box restored from snapshot-id $SNAPSHOT_ID" --architecture x86_64 --root-device-name '/dev/sda1' --block-device-mappings "[{\"DeviceName\": \"/dev/sda1\", \"Ebs\": {\"SnapshotId\": \"$SNAPSHOT_ID\"}}]"
{
    "ImageId": "ami-<ami-id>"
}
```

Now you can start the AMI.  If you are using Terraform or CloudFormation you can substitute the image-id of the services box with the one you just created.  If you used the manual process, then you need to create the Services box with the same SecurityGroups.

NOTE: After restore occurrs, if CircleCI doesn't launch automatically you may need to go to the administrative console at https://ccie.example.com:8800/ (replacing "ccie.example.com" with the appropriate hostname) and start the app manually.  We are adding automation for this step, but older versions may require manual intervention.

#### Restore from a tarball

If you are using the tarball backup strategy, you can restore backup tarball with using `circleci-restore`:


```bash
$ # Download tarball as appropriate
$ aws s3 cp s3://path/to/tarball/in/s3.tar.bz2 ./backup.tar.bz2
$ # Restore
$ circleci-restore ./backup.tar.bz2
```

The script assumes running on a clean install (or a clean AMI).  If you are
running with a running CircleCI instance, the existing data will be moved to
`/data/circleci-restore-*` directory.  You can delete the directory if the
restore is successful and you confirmed that you didn't unintentionally droped
data.

## 2b. Recovery procedure: Cold Fail-over [Advanced Topic]

This is a useful technique if the cause of the outage is external, e.g. AWS EC2 availability zone outage, a machine getting destroyed accidentally, etc.  For simple cases where a single machine is destroyed accidentally, a simple restore process of the EBS volume that is left is sufficient.  This section prepares you to recover from an availability zone outage with limited downtime, but it's very involved and advised only for users with significant availability requirements.

The process relies on users setting up their own NFS or filesystem replication infrastructure.  We are considering offering an automatic first-class fail-over mechanism, but at this point we would rely on your own infrastructure.

Since the instructions are heavily dependent on the environment and filesystems of choice, we will stay relatively high-level here and expect to work with you directly to help set up for your particular environment.  In essence, we want to build replicas of the datastores involved.  In our experience, we find it may be better for users to build their own AMIs of the Services box that has some config and filesystem tools baked in (or use orchestration and config management tools for managing them).  At a high level, these are the steps that need to be taken:

1. Start a brand new services box with our provided AMI, with the following:
   1. Install your network filesystem and/or replication tool, e.g. drbd, glusterfs, nfs, flocker.  Many of these tools operate on the block level, you would need to attach a new block device (typically an EBS volume), and format it, add it to `fstab`, and mount it to `/data`.  Configure `/var/lib/replicated` be a symlink to `/data/replicated` too.
   2. Configure the CircleCI instance from the Management Console (available, by default, in your browser on port 8800).
   3. Configure Replicated CLI by running `sudo replicated login`.
   4. Create an AMI out of the current running instance.
   5. Start a new replica instance using the AMI you just created with a similar EBS setup in another availability zone.  Ensure that the network filesystem is configured to be a replica of the active machine.
   6. To speed up recovery time it will be useful to recreate the replica node, e.g. primarily after upgrades or adding more configuration to the initial node.

2. When a step down is required:
   1. Ensure that the initial machine actually is dead.
   2. Re-associate the private IP address of original node to replica node.  See [here](http://docs.aws.amazon.com/cli/latest/reference/ec2/assign-private-ip-addresses.html) or the follow up discovery section for details and alternatives
   3. Start the CircleCI Enterprise processes in the new node by running `sudo replicated app $(sudo replicated apps | grep Enterprise | awk '{print $1;}') start`

Once the service is up, builders will discover the new Service and you should be back to an operating state.

## 3. Discovery and Re-association of Builders

For Services box discovery we currently rely on the private IP address of the Services box, and builders are configured with the private IP of the Services box at startup.  AWS allows setting a private IP address when launching a machine, as part of network configuration.  Keeping the same IP address has many nice advantages: simplifies DNS configuration, avoids reconfiguration, and ensures that only a single Services box is in operation at any given time.  If using the AWS CLI RunInstance command for starting from backup, use the  [`--private-ip-address` option](http://docs.aws.amazon.com/cli/latest/reference/ec2/run-instances.html) to set the primary private IP address.

Also, you can use the [secondary IP address](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/MultipleIP.html) `allow-reassociation` feature, so the newly designated Services box will have the private IP address.

However, there are some cases when spinning up new machines with the same private IP address is cumbersome.  In the default configuration, the builders will lose connection to the Services box and may require you to rotate all builders, extending recovery time.

Alternatively, you can use other more stable discovery mechanisms: You can use a load balancer with stable hostname in `SERVICES_PRIVATE_IP` value.  NOTE: The load balancer needs to proxy ports 80, 443, and 4434 as TCP connections.

We discourage using private hostnames instead of private IP addresses.  Private IP address changes propagate instantaneously.  DNS records have propagation delay, and many tools (particularly Java) aren't very good at honoring TTL and may cache resolution much longer than expected.

When using changing private ip addresses, you may need to pass additional environment variable to the launch configuration of builders: `CIRCLE_SECRET_PASSPHRASE`.  The value is initialized at initial boot up time.  You can retrieve it by running `sudo replicated admin get-secret-token` on the Services Box:

```bash
ubuntu@ip-172-31-0-135:~$ sudo replicated admin get-secret-token
export CIRCLE_SECRET_PASSPHRASE='300c61ca5e1551167f73612a3f0845c54cdb3c27'
```

You can add `CIRCLE_SECRET_PASSPHRASE` alond side `SERVICES_PRIVATE_IP`.


## 4. Recovery from outage

Once the Services box is recovered you can monitor builds and the builder machine state.  The builder machines should reconnect automatically to the newly designated Services box and recover and pick up any builds queued during the outage.  Builds that were running at the beginning of the outage may be considered unhealthy and get retried.  Typically, we recommend adding capacity to the fleet, so you can catch up with demand and retry builds, but that will depend on the volume of builds you are experiencing and the length of the outage.

GitHub Enterprise hooks during the outage will be dropped.  GitHub Enterprise may also attempt to redeliver the webhooks, but it's not guaranteed and beyond the control of CircleCI.  Users may use the API to trigger new builds.

Also, the longer the outage the more likely the builder machines are to be in a bad or stale state.  While they may be operating well coming out of an outage and start picking up builds, we highly recommend rotating the fleet at your earliest convenience.
