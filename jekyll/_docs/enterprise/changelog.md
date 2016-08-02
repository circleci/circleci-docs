---
layout: enterprise
title: "Changelog"
category: [enterprise]
order: 10
description: "CircleCI Enterprise Changelog. These changes don't apply to CircleCI.com."
---

**NOTE:** The following are changes specific to CircleCI Enterprise. For general changes to CircleCI see our [public Changelog](https://circleci.com/changelog/).

### 2016-07-26: Release 0.2.44

Bug fix: We've fixed a bug that "--branch" option was missing when "--single-branch" is used.

### 2016-07-26: Release 0.2.43

New Feature: The maximum size of files that you can upload for caching during builds has been fixed to 5G. The size is now bumped 20G by default on CircleCI Enterprise and customers can also override the default value to even larger size.

To override the default value, you need to run the following in a REPL of Service Box.

```
(settings/set {:max-file-cache-bytes <max-size-by-bytes>})
```

To unset the overridden value and use default, run the following.

```
(settings/unset! [:max-file-cache-bytes])
```

### 2016-07-14: Release 0.2.42

New Feature: Custom base URL for version control webhooks. When a new project is added, CircleCI will add a webhook to the GitHub repository of the project. With this new feature, you can override the default webhook base URL from the System Settings page under the Admin tools (available to designated administrative users). This feature is useful when your instance is behind firewall or other proxy and cannot directly receive webhooks from GitHub.

### 2016-07-7: Release 0.2.41

This release fixes a bug in the URL structure used to serve build artifacts.

The artifact URL format was recently changed to handle security concerns related to CircleCI's hosted offering. The security concerns do not affect CircleCI Enterprise customers, but the change caused issues fetching build artifacts in CircleCI Enterprise installations. This release reverts the CircleCI Enterprise artifact format and resolves the issue.

### 2016-07-01: Builder AMI updates

We've updated the builder AMIs to include fixes for CVE-2016-4997 and CVE-2016-4998.

You can always see the newest recommended AMIs [on the AWS installation page]({{site.baseurl}}/enterprise/aws-manual/#builder).

### 2016-06-30: Release 0.2.38
* **Please Note:** If you are using OS X builds you will need to run a manual migration as part of this release. After upgrading you will need to run this in a REPL: `(circle.backend.model.esxi-vm/run-migrations!)`. Please talk with your account manager if you need further instructions.
* The Admin Users page now has links to the builds of each user.
* The API has a new endpoint `/api/v1/admin/licensing` that returns information about the number of seats available, number being used, when the license will expire, and how many inactive users there are in the system.
* Fixed a bug where links to the documentation broke.
* Various small bug fixes and UI improvements.

### 2016-05-12: Release 0.2.36
<!-- Built with https://circleci.com/gh/circleci/circle/141556 -->
<!-- Based on https://github.com/circleci/circle/commit/3ae5f47c15561373135881b314d5ccbada6e10a2 -->

Please make sure that you are using the latest
`provision-builder.sh` and `init-builder-0.2.sh` before you upgrade to this release:

<https://s3.amazonaws.com/circleci-enterprise/provision-builder.sh>

<https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh>

As part of this release we're changing the behavior of artifacts to
only serve a whitelisted set of content-types. This means we won't
serve .html files as text/html. This is a security risk on CircleCI
Enterprise since artifacts are served on the same domain as the rest
of the site -- as a result, any user or malicious code used as part of
your build can push a specially-crafted artifact and gain control of
another user's account.

If this is an issue, you can override this behavior by setting
"Serve artifacts with unsafe content-types" in the admin console. We don't
recommend this, but we're providing it for backwards compatibility.

This release also includes some changes to container
networking. Containers now each use a /24 in the subnet 172.16.1.0/16
by default.

If this conflicts with your private network, or if you were editing lxc-net
manually in order to fix a prior conflict, you can now use
`CIRCLE_CONTAINERS_SUBNET` and `CIRCLE_CONTAINERS_SUBNET_NETMASK_LENGTH`
on the builders to configure those. See "Adjusting Builder Networking" in the
[configuration section]({{site.baseurl}}/enterprise/config/).

### 2016-03-04: Release 0.2.26
<!-- Built with https://circleci.com/gh/circleci/circle/138331 -->
<!-- Based on https://github.com/circleci/circle/commit/7c507867b44ae0a5f14f7a27ed03e591dcb79f81 -->

* permit node-to-node ssh feature
* show number of licensed and active users
* faster test results processing
* disallow all bots in /robots.txt by default

Published a new build container images with glibc vulnerability fix.  The new precise image will be activated by default by 2016-03-11.  You can activate it earlier, or test it, by specifying the image id in builder launch configuration:

```
curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
    CIRCLE_CONTAINER_IMAGE_ID=circleci-precise-container_0.0.1551 \
    SERVICES_PRIVATE_IP=<private ip address of services box> \
    CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
    bash
```

Also, published a new trusty image with container id: `circleci-trusty-container_0.0.312`.

### 2016-03-01: Release 0.2.25
<!-- Built with https://circleci.com/gh/circleci/circle/137950 -->
<!-- Based on https://github.com/circleci/circle/commit/226d5671809c6c20ae95fceaf4dfd91fab4b48d1 -->

* disable anonymous access to public projects by default.
* add an option to clear source caching on a project
* reuse ports 80/443 for websockets.  You may remove port 8081 rule from security groups
* support using the AWS AutoScalingGroup lifecycle hooks for graceful shutdown
* make S3 as an optional dependency
* fixed favicon issue causing users not to have build progress favicon indicator

### 2016-02-17: Release 0.2.24
<!-- Built with https://circleci.com/gh/circleci/circle/135539 -->
<!-- Based on https://github.com/circleci/circle/commit/c4951ff964b27da30104220c8ae7d54c3962952d -->

Patched glibc security vulnerability.
Please also make sure you patch the following places:
1. Run `apt-get update && apt-get install -y libc6` on your Services box, and restart.
2. Update the AMI for your builder machine. Our AWS install doc contains the latest AMI image ids, as well as updated terraform / cloudformation templates: <{{site.baseurl}}/enterprise/aws/>
3. If you are using a custom container image, you will also want to update that.


### 2016-01-19: Release 0.2.17
<!-- Built with https://circleci.com/gh/circleci/circle/135539 -->
<!-- Based on https://github.com/circleci/circle/commit/c4951ff964b27da30104220c8ae7d54c3962952d -->
* New look and feel for the UI
* Switching to privileged LXC by default, paving the way for you to use the latest version of vanilla Docker instead of the fork we use on circleci.com.
* CLI command `circle-shutdown` is added for gracefully shutting down builders.  Once invoked on a builder machine, the builder will finish executing all currently running builds, and shutdown gracefully.
* Health check tool for diagnosing infrastructure failures.  You can run `circle-diagnostic` on any machine you want to inspect.
* Misc. stability and UI feature improvements, particularly around navigation and Insights

### 2015-12-22: Release 0.2.16
<!-- Built with https://circleci.com/gh/circleci/circle/134830 -->
<!-- Based on https://github.com/circleci/circle/commit/51451c41c516412407ef2d2291bc85c36029d33f -->
* Base support HTTP Proxy setups
* Support for custom images built with new Docker flow
* Speed up builder initialization process and pin builder versions to Services Box (rather than being automatically upgraded)

### 2015-12-18: Release 0.2.15
<!-- Built with https://circleci.com/gh/circleci/circle/134672 -->
<!-- Based on https://github.com/circleci/circle/commit/eabd8f6d31c7071945d33e9d9e8f2055c2d7d3f5 -->
* Support custom email servers

### 2015-12-04: Release 0.2.14
<!-- Built with https://circleci.com/gh/circleci/circle/133940 -->
<!-- Based on https://github.com/circleci/circle/commit/a7b03bda3cf781e15cf40f76570498775de1255a -->
* More graceful handling when build parallelism is too high
* Supporting GitHub Enterprise 0.11 release

### 2015-11-30: Release 0.2.13
<!-- Built with https://circleci.com/gh/circleci/circle/133665 -->
<!-- Based on https://github.com/circleci/circle/commit/7bbdb845121c10fbc8a3cb5412c088e3d6c4bdb5 -->
Many changes
* Cloudwatch Integration
* better graceful handling when builders aren't available yet.  If a build requires more parallelism than containers in fleet, the build will be skipped with a message indicating the cause.
* improvements to fleet state management

### 2015-11-20: Release 0.2.12
<!-- Built with https://circleci.com/gh/circleci/circle/133088 -->
<!-- Based on https://github.com/circleci/circle/commit/6de59f4ecb5689fc31c090fda3b21d077823109e -->
* Include build-insights features
* Support for Custom Root CA
* improved admin views
* fix some email sending failures

### 2015-11-10: Release 0.2.11
<!-- Built with https://circleci.com/gh/circleci/circle/132510 -->
<!-- Based on https://github.com/circleci/circle/commit/13991bb6818aba7d12af1631c67fd5078a6c8782 -->
* More license and fleet management capabilities

### 2015-10-29: Release 0.2.10
<!-- Built with https://circleci.com/gh/circleci/circle/132013 -->
<!-- Based on https://github.com/circleci/circle/commit/e8d7fe16981bccb3dd14eda8a42c212c8b734ba8 -->
* Fix a regression preventing presentation of test metadata

### 2015-10-27: Release 0.2.9
<!-- Built with https://circleci.com/gh/circleci/circle/132013 -->
<!-- Based on https://github.com/circleci/circle/commit/e8d7fe16981bccb3dd14eda8a42c212c8b734ba8 -->
* Various UI improvements

### 2015-10-18: Release 0.2.8
<!-- Built with https://circleci.com/gh/circleci/circle/131642 -->
<!-- Based on https://github.com/circleci/circle/commit/d8135e5745db157cf195c67c46c82f05b841bc4e -->
New update is released for both the services and builder boxes.  This is a significant upgrade.  You can upgrade the services box through the System Management console,
and start new builder machines.

It includes the following changes:

* Show all organization repositories in Add Projects page.  Previous versions may not show all organization repositories if running against GitHub Enterprise 2.2 or earlier
* Recycle build containers more reliably and utilize builder machines more effectively
* Fix artifacts storage when running with Instance Profile permissions
* Fix some issues with using S3 buckets in non-US Standard region.  Previously, some unexpected browser errors occur when S3 virtual bucket DNS record didn't propagate correctly.

### 2015-09: Releases 0.2

This is a placeholder for many releases:

In CircleCI Enterprise 0.2 release line, The service box deployment has changed.  The upgrade process is via a custom System Management console, served at port 8800.

The releases contain the following changes:

* Smoother installation management via CloudFormation and Terraform
* System Management console to allow to reconfigure CircleCI, change domains, SSL certs, and other settings
* Introduce license management and enforcement
* Support Instance Profile and IAM Roles for managing AWS S3
* Fix issues related to using private subnets

If you are on the 0.1 line, please contact us to upgrade.

### 2015-08-18: Release 0.1.235

* New update is released for the services box.  To upgrade your services box, run the following in an SSH session:

```
sudo service circle stop; sudo apt-get update; sudo apt-get install --upgrade circle
```

This release contains the following changes:

* Fix setup with auto-created self-signed certificate
* Avoid javascript loading from CDN or having any external dependency
* Added ability to reconfigure CircleCI values
* Various improvements tracking circleci.com changes

### 2015-08-03: Release 0.1.197

* New update is released for the services box.  To upgrade your services box, run the following in an SSH session:

```
sudo apt-get update; sudo apt-get install --upgrade circle
```

This release contains the following changes:

* Added capability to control build container resources
* Added capability to use user custom container images
* Many UI improvements through out the main app

### 2015-07-22: Release 0.1.177

* New update is released for the services box.  To upgrade your services box, run the following in an SSH session:

```
sudo apt-get update; sudo apt-get install --upgrade circle
```

This release contains lots of changes:

* Support for self-signed certificates: CCIE can accommodate (and auto-generate) self-signed certificates, and have it work out of box with GitHub Enterprise.
* First initial users will automatically be treated as admins
* Admins can see some basic fleet state to see how utilized their build state is
* [Bug fixes] admins on earlier releases may view artifacts now
* Support for smaller r3 instances (e.g. r3.xlarge) instances and arbitrary disk types

Some hidden capabilities with coming soon documentations:

* More robust backup/restore -- restores are no longer sensitive to private ip address
* Builders support graceful shutdown mode -- where they can be automatically shutdown when builds finished running
