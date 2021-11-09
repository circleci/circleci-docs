---
layout: enterprise
section: enterprise
title: "CircleCI 2.0 Behind The Firewall - Preview Release"
category: [advanced-config]
order: 0
description: "Pre-release access to CircleCI 2.0 functionality behind your firewall"
hide: true
sitemap: false
---

CircleCI 2.0 provides new infrastructure that includes the following improvements:
* New configuration paradigm with any number of jobs and workflows to orchestrate them.
* Custom images for execution on a per-job basis.
* Fine-grained performance with custom caching and per-job CPU or memory allocation.

To participate in the preview release, contact your Account team.

## Private Preview Limitations
Set up a trial of the new platform with the expectation that it will update frequently (daily releases) and that you will be asked to provide regular feedback on the installation process, the performance profile of your installation, and any other issues that arise.

The 2.0 preview release has the following constraints:

* Requires setting up a fresh installation that will be entirely disposable with no option to migrate data from an Alpha install to your existing CircleCI Installation.
* Available only on AWS.
* Requires teams to build a new CircleCI 2.0 configuration in their repositories.
* Limited documentation -- support from your account team is available.
* HTTP only for internal communications between workers and the output processor (HTTPS is coming soon). Must be run on a trusted network.
* Only IAM User Authentication is currently supported (instance profiles are coming soon).
* If you choose to NOT run a 1.0 fleet you may see some odd UI behaviors during the Preview. This will be addressed soon.

Later this year, when General Availability (GA) is announced, all customers with CircleCI Enterprise installed will be able to get access to CircleCI 2.0 features on their current installation with no restrictions under their current agreement and support level.

## Installing the Preview Release
After you have received a Preview license from your account team, use the following instructions to set up your trial installation.

## Prerequisites
Have available the following information and policies before starting the Preview Release installation:

* If you use network proxies, contact your Account team before attempting to install the Preview Release.
* Access to provision at least two AWS instances, one for the Services and one for your first set of Builders. Best practice is to use an `m4.2xlarge` instance with 8 CPUs and 32GB RAM for the Services.
* AWS instances must have outbound access to pull docker containers and to verify your license.
* See the table below for required port configuration.
* Put in place the following AWS IAM policy required by the CircleCI terraform file and communicate any concerns with this policy to your Account team for assistance or clarifications:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:*"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::circleci-*",
                "arn:aws:s3:::circleci-*/*",
                "arn:aws:s3:::*"
            ]
        },
        {
            "Action": [
                "autoscaling:*",
                "sqs:*",
                "iam:*",
                "ec2:StartInstances",
                "ec2:RunInstances",
                "ec2:Describe*",
                "ec2:CreateTags",
                "ec2:AuthorizeSecurityGroupEgress",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:CreateSecurityGroup",
                "ec2:DeleteSecurityGroup",
                "ec2:DescribeInstanceAttribute",
                "ec2:DescribeInstanceStatus",
                "ec2:DescribeInstances",
                "ec2:DescribeNetworkAcls",
                "ec2:DescribeSecurityGroups",
                "ec2:RevokeSecurityGroupEgress",
                "ec2:RevokeSecurityGroupIngress",
                "cloudwatch:*",
                "autoscaling:DescribeAutoScalingGroups",
                "iam:GetUser"
            ],
            "Resource": [
                "*"
            ],
            "Effect": "Allow"
        }
    ]
}
```

## Installation with Terraform

Use the following procedure to install with Terraform, skip to the next section for manual installation steps.

1. Clone the [Enterprise Setup](https://github.com/circleci/enterprise-setup) repository.
2. Checkout the `ccie2` branch with `git fetch && git checkout ccie2`.
3. Run `make init` to copy `terraform.tfvars.template` to `terraform.tfvars`.
4. Fill out the required variables in `terraform.tfvars`, you can view the [README](https://github.com/circleci/enterprise-setup/blob/ccie2/README.md) for the full list of variables. Be sure to set `enable_nomad=1` in order to use docker builders.
5. Apply Terraform scripts using `terraform apply`.
6. Go to the provided URL at the end of Terraform output and follow the instructions.
7. Enter your license.
8. Complete the `Storage` section. **Only AWS S3 with IAM User Authentication is currently supported**. Use the following permissions for the IAM User:
     ```JSON
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Effect": "Allow",
                 "Action": [
                     "ec2:RunInstances",
                     "ec2:TerminateInstances",
                     "ec2:Describe*",
                     "ec2:CreateTags",
                     "iam:GetUser",
                     "cloudwatch:*",
                     "sts:GetFederationToken"
                 ],
                 "Resource": [
                     "*"
                 ]
             },
             {
                 "Effect": "Allow",
                 "Action": [
                     "s3:*"
                 ],
                 "Resource": [
                     "arn:aws:s3:::YOUR-BUCKET-HERE",
                     "arn:aws:s3:::YOUR-BUCKET-HERE/*"
                 ]
             }
         ]
     }
     ```
9. Configure the vm-service as follows. The AWS User needs to have the following permissions. It might be the same user as for S3, if so, it needs to have both sets of permissions. The region/subnet/security group will be filled automatically.
     ``` JSON
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Action": [
                     "ec2:RunInstances",
                     "ec2:CreateTags"
                 ],
                 "Effect": "Allow",
                 "Resource": "arn:aws:ec2:HERE-IS-REGION-OR-*:*"
             },
             {
                 "Action": [
                     "ec2:Describe*"
                 ],
                 "Effect": "Allow",
                 "Resource": "*"
             },
             {
                 "Action": [
                     "ec2:TerminateInstances"
                 ],
                 "Effect": "Allow",
                 "Resource": "arn:aws:ec2:HERE-IS-REGION-OR-*:*:instance/*",
                 "Condition": {
                     "StringEquals": {
                         "ec2:ResourceTag/ManagedBy": "circleci-vm-service"
                     }
                 }
             }
         ]
     }
     ```
10. From the Management Console, click Start to start the application. It will take a few minutes to download all of the necessary docker containers. If the Management Console reports that `Failure reported from operator: no such image` click Start again and it should continue.
11. After the application has started, log in to CircleCI and start running 2.0 builds!

## Manual Installation

Have available the following resources before beginning manual installation of the Preview Release.

* The Services instance must meet the following requirements:
    * Type: At least `m4.xlarge` or `m4.2xlarge`
    * Storage: 100 GB, General Purpose SSD
    * Security groups:

  | Protocol | Port Range | Source  |
  | -------- | ---------- | ------- |
  | TCP      | 22         | 0.0.0.0 |
  | TCP      | 80         | 0.0.0.0 |
  | TCP      | 443        | 0.0.0.0 |
  | TCP      | 8800       | 0.0.0.0 |
  | TCP      | 8585       | vpc     |
  | TCP      | 4647       | vpc     |
  {: class="table table-striped"}
* 1.0 Builders - No changes, the same process as for the CCIE 1.0 <https://circleci.com/docs/enterprise/aws-manual/>
* 2.0 Builders - Instance type should be at least `m4.xlarge` or `m4.4xlarge` installated with the following Terraform script: <https://github.com/circleci/enterprise-setup/blob/ccie2/nomad-cluster.tf>.

### Manual Installation Steps

1. SSH into the Services instance.
2. Run `curl https://get.replicated.com/docker | sudo bash`.
3. Go to the provided URL at the end of the previous step.
4. Use a special Alpha license
5. Configure storage. **Only AWS S3 with IAM User Authentication is currently supported**. Use the following permissions for the IAM User:
     ```JSON
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Effect": "Allow",
                 "Action": [
                     "ec2:RunInstances",
                     "ec2:TerminateInstances",
                     "ec2:Describe*",
                     "ec2:CreateTags",
                     "iam:GetUser",
                     "cloudwatch:*",
                     "sts:GetFederationToken"
                 ],
                 "Resource": [
                     "*"
                 ]
             },
             {
                 "Effect": "Allow",
                 "Action": [
                     "s3:*"
                 ],
                 "Resource": [
                     "arn:aws:s3:::YOUR-BUCKET-HERE",
                     "arn:aws:s3:::YOUR-BUCKET-HERE/*"
                 ]
             }
         ]
     }
     ```
6. Configure the vm-service. The AWS user needs to have these permissions. It might be the same user as for S3, if so, it needs to have both sets of permissions.
     ``` JSON
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Action": [
                     "ec2:RunInstances",
                     "ec2:CreateTags"
                 ],
                 "Effect": "Allow",
                 "Resource": "arn:aws:ec2:HERE-IS-REGION-OR-*:*"
             },
             {
                 "Action": [
                     "ec2:Describe*"
                 ],
                 "Effect": "Allow",
                 "Resource": "*"
             },
             {
                 "Action": [
                     "ec2:TerminateInstances"
                 ],
                 "Effect": "Allow",
                 "Resource": "arn:aws:ec2:HERE-IS-REGION-OR-*:*:instance/*",
                 "Condition": {
                     "StringEquals": {
                         "ec2:ResourceTag/ManagedBy": "circleci-vm-service"
                     }
                 }
             }
         ]
     }
     ```
7. Configure the EC2 security group to have the following rules:

     | Protocol | Port Range | Source  |
     | -------- | ---------- | ------- |
     | TCP      | 22         | 0.0.0.0 |
     | TCP      | 2376       | 0.0.0.0 |
     | TCP      | 32768-61000| 0.0.0.0 |
     {: class="table table-striped"}

## Upgrading MongoDB

CircleCI Enterprise 2.0 runs MongoDB 3.2.11 which uses WiredTiger as the storage engine. If you are upgrading an existing database from your existing 1.0 installation or any Preview version from `Preview3` or older, you must use the following steps to upgrade your Mongo database:

1. Stop CircleCI from the Replicated console.
2. SSH into the Services instance.
3. Download and execute the Mongo upgrade script.
     ```
     wget https://s3.amazonaws.com/release-team/scripts/upgrade-mongo
     chmod +x upgrade-mongo
     sudo ./upgrade-mongo
     ```

## Upgrading PostgreSQL

CircleCI Enterprise 2.0 runs PostgreSQL 9.5. If you are upgrading an existing database from your 1.0 installation or any Preview from `Preview 7` or older, you must use the following steps to upgrade your PostgreSQL database:

1. Stop CircleCI from the Replicated Console.
2. SSH into the Services Instance.
3. Download and execute the PostgreSQL upgrade script.
    ```
    wget https://s3.amazonaws.com/release-team/scripts/upgrade-postgres
    chmod +x upgrade-postgres
    sudo ./upgrade-postgres
    ```

You can now start CircleCI from the replicated console and you will be running Mongo 3.2.11 and Postgres 9.5.
