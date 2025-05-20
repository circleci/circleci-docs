---
layout: enterprise
section: enterprise
title: "Upgrading to GA"
category: [resources]
order: 0
description: "How to upgrade from a beta installation of CircleCI Enterprise to the General Availability (GA) version."
hide: true
sitemap: false
---

## Upgrading from Beta to GA
---

**If you encounter any problems, or would like help with the upgrade, please reach out to <idavis@circleci.com>.**

Once on the GA version, future updates to the newest release are simple to perform, with a single click. Moving from the Beta to the GA is a larger effort. It should only take an hour or two. To ensure there are no snafus that could lead to downtime for the team, we recommend setting up a parallel instance of CCIE, and making the cut over once it is fully validated.

### Will this update cause disruption of service?

Briefly, in two ways:

1. iOS builds will be down for approximately 10 minutes, up to an hour if there are any errors in reconnecting. 
2. This upgrade does not preserve user / project follow settings, so your end users will need to log back into the system once it is up and running and re-follow the projects the care about. All UI settings and configuration for those projects will be preserved (including environment variables). So once an admin of a particular GitHub Org refollows the project on CircleCI, the webhooks will reconnect and builds will start right where they left off. This can be done before killing the old installation, resulting in 0 downtime.

### Step 1. Preserving your settings

We have an import/export process that will preserve all your UI Settings, including env variables. You can find the full instructions at <https://enterprise-docs.circleci.com/resources/export-import-projects/>. Before doing anything else, you'll want to SSH into an existing builder and export your existing settings.

If you have iOS, you will also need access to the public/private key pair and IP Addresses of your iOS machine. If you don't have access to that information, please reach out and we can help you extract it from your current installation.

### Step 2. Setting up your new CircleCI

Next you'll want to setup a new installation of CircleCI, following the doc here: <https://enterprise-docs.circleci.com/getting-started/aws/>. In order to prevent downtime, we recommend setting up a new GitHub Application as well. 

If you have any iOS resources, you'll also want to launch an iOS builder (Step 1 of the iOS install process: <https://enterprise-docs.circleci.com/ios-install/>

### Step 3. Configure your new CircleCI

There are two things you need to do to get your new CircleCI back up and running:

1. Import the settings you exported in step 1: <https://enterprise-docs.circleci.com/resources/export-import-projects/>.
2. Migrate repos over. Have an admin for each project refollow the repo with the new CircleCI, so that the webhooks are reattached. Once they follow it on the new CircleCI, both installations will be submitting commit statuses. If you would like to prevent this, you can delete the webhook for the old CircleCI installation manually. ***If you do not want to deal with the possibility of the two CircleCI installations overwriting each other's commit statuses, you can perform this step after shutting down your old installation, but that will result in brief downtime***

### Step 4. [DOWNTIME] Destroy the old CircleCI and finish the iOS installation

Everything has now bee moved over to the new CircleCI, except for the iOS builds, so it is safe to shutdown the old installation. After that installation is safely shut down, it's time to complete the iOS installation process (Step 2 of the iOS installation: <https://enterprise-docs.circleci.com/ios-install/>). This will result in approximately 10-20 minutes of downtime for iOS only. It's technically possible to complete the iOS installation before shutting down the old installation, but if you do iOS builds will fail randomly on one installation or the other.
