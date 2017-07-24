---
layout: enterprise
section: enterprise
title: "CircleCI 2.0 Behind The Firewall - Preview Release"
category: [advanced-config]
order: 0
description: "Pre-release access to CircleCI 2.0 functionality behind your firewall"
hide: true
---

# Introducing CircleCI Enterprise 2.0
CircleCI 2.0 is our new infrastructure that provides a number of new valuable options for your development teams, including:
* New configuration paradigm with any number of jobs and workflows to orchestrate them. 
* Custom images for execution on a per-job basis.
* Fine-grained performance with custom caching & per-job CPU/memory allocation.

Having completed an alpha trial, starting in July 2017 we will be offering a preview release to an expanding set of customers. To participate, contact your Account team.

## Current Phase: "Private Preview"
Preview customers will set up a separate trial of the new platform with the expectation that they will update frequently (daily releases) and provide active feedback on the installation process, performance profile of their  installation, and any other issues that arise.

The Preview will have the following constraints:

* Requires setting up a fresh installation that will be entirely disposable (no ability to migrate data from an Alpha install to your existing CircleCI Installation).
* Only available on AWS.
* Requires teams to build a new CircleCI 2.0 configuration in their repositories. 
* Limited documentation -- support from your account team will be available.
* HTTP only for internal communications between workers and the output processor (HTTPS coming soon), so only should be run on a trusted network.
* Only IAM User Authentication is currently supported (no instance profiles yet)
* If you choose to NOT run a "1.0" fleet you may see some odd UI behaviors during the Preview. This will be addressed soon.

## Coming Soon: "General Availability"
Later this year, all customers with CircleCI Enterprise installed will be able to get access to CircleCI 2.0 features on their current installation with no restrictions under their current agreement and support level.

-----

# Installation of the Preview
Once you have received a Preview license from your account team, the following instructions will help you set up your trial installation.

## Installation with Terraform
* Fill vars in `terraform.tfvars` file in <https://github.com/circleci/enterprise-setup/tree/ccie2>
* Apply Terraform scripts (`terraform apply`)
* Go to provided URL at the end of Terraform output and follow instruction
* Enter your license
* In the `Storage` section:
  * **Only AWS S3 is currently supported**
  * **Only IAM User Authentication is currently supported**
  * Following permissions are required for an IAM User:
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
 * vm-service configuration:
   * The AWS User need to have the following permissions. It might be the same user as for S3, but then it needs to have both sets of permissions.
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
   * region/subnet/sercurity group will be filled automatically

## Manual installation

### Service-box instance

* Type: At least `m4.xlarge` (better `m4.2xlarge`).
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


### 1.0 Builders

No changes, the same process as for the CCIE 1.0 (https://circleci.com/docs/enterprise/aws-manual/)

### 2.0 Builders

#### Cluster Mode

* Terraform script: https://github.com/circleci/enterprise-setup/blob/ccie2/nomad/nomad-cluster.tf
* Instance Type: At least `m4.xlarge` (better `m4.4xlarge`)


### Installation and configuration

* SSH into service-box
* `curl https://get.replicated.com/docker | sudo bash`
* Go to provided at the end of the previous step URL
* Use a special Alpha license
* Storage:
  * **Only AWS S3 is currently supported**
  * **Only IAM User Authentication is currently supported**
  * Following permissions are required for an IAM User:
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
 * vm-service configuration:
   * AWS User need to have this permissions. It might be the same user as for S3, but then it needs to have both set of permissions.
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
   * EC2 security group should have these rules:

     | Protocol | Port Range | Source  |
     | -------- | ---------- | ------- |
     | TCP      | 22         | 0.0.0.0 |
     | TCP      | 2376       | 0.0.0.0 |
     | TCP      | 32768-61000| 0.0.0.0 |



