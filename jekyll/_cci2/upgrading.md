---
layout: classic-docs
title: "Upgrading from CircleCI 1.0 Enterprise Installation to 2.0"
category: [administration]
order: 11
description: "How to upgrade from CircleCI 1.0 Enterprise to CircleCI 2.0"
---

This document provides instructions for System Administrators upgrading an existing CircleCI 1.0 Enterprise installation to CircleCI 2.0 in the following sections:

* TOC
{:toc}

**Notes:**
- CircleCI 2.0 is only installable on AWS at this time.
- There is not currently an in-place upgrade mechanism. The upgrade process will require you to set up a new installation of CircleCI and import the existing data. This will require a downtime window.
- You must be running CircleCI v1.48.5 (the latest version of CircleCI 1.0) in order to upgrade.

## Perform Installation of CircleCI 2.0

Install CircleCI 2.0 using Terraform as described in the [Installing CircleCI 2.0 on Amazon Web Services with Terraform]({{ site.baseurl }}/2.0/aws/) document.

## Verify Your New Installation

Set up a new GitHub application and use a different hostname. After you have verified that the new installation works, you can cut over from your previous GitHub OAuth Application and subdomain name. 

Verify that your installation works by forking and running our [Reality Check](https://github.com/circleci/realitycheck) repository which exercises the basic functionality of CircleCI 2.0.

## Perform a Backup

Prior to beginning the data migration procedure, you should back up all of your data in the 1.0 installation as described in the [backup documentation]({{ site.baseurl }}/2.0/backup/).

## Export Existing Databases

CircleCI 2.0 runs MongoDB 3.2.11 and PostgreSQL 9.5. These are major upgrade versions compared to CircleCI 1.0 Enterprise. The upgrade process consists of the following steps:

1. Convert the data to be compatible with the updated versions of the database servers and export into a tarball.
2. Transfer the tarball to your new CircleCI 2.0 installation.
3. Import upgraded databases into the new installation.

This procedure uses `bash` scripts to perform all of the above steps and then it runs some basic sanity checks. The following steps should be performed on the existing CircleCI 1.0 Enterprise installation.

**Note:** The following steps are non-destructive and in the event of any failure in the upgrade process you will be able to revert back to the previous state. As with all major software changes, you should still create a backup just to be safe.

1. Log in to the Replicated console located at `https://<your-circleci-install>:8800/dashboard` and select Stop Now to shutdown CircleCI.
2. SSH in to the Services machine and switch to the `root` user with the `sudo su` command.
3. Confirm that the MongoDB and PostgreSQL containers have stopped by listing all running containers with the `docker ps` command.
4. Download and run the upgrade script using the commands below. The duration of the upgrade operation depends on the amount of stored data.

	```
	wget https://s3.amazonaws.com/release-team/scripts/circleci-database-upgrade
	chmod +x circleci-database-upgrade
	./circleci-database-upgrade
	```

5. After the upgrade process is complete, a `.tar.gz` file appears in the directory where you ran the script. You will use this file to import your data into your new CircleCI 2.0 installation in a subsequent step.

## Import Data

1. Copy the database export created in the first section to the new CircleCI 2.0 Services instance.
2. Remove the existing databases that were created during testing with `rm -rf /data/circle/postgres` and `rm -rf /data/circle/mongo`.
3. Download and run the import script using the commands below. The duration of the import operation depends on the amount of stored data.

  ```
  wget https://s3.amazonaws.com/release-team/scripts/circleci-database-import
  chmod +x circleci-database-import
  ./circleci-database-import $TAR_FILE
  ```

## Cut Over

Complete the following steps to cut over to the new installation:

1. Update S3 settings. In AWS, find the IAM role named "$prefix_role" created for your 2.0 installation and edit its in-line policy, replacing the S3 bucket entries with the S3 information from your 1.0 installation.

2. Update Replicated settings. In the Replicated management console, update the name of the S3 bucket to match the name that you used in your 1.0 installation, and populate the rest of the settings to match your original GitHub OAuth application.

3. Start the app and verify that all of your previous builds and project settings are available.

4. You can now update DNS settings to have your original hostname point to the new installation.

## Troubleshooting

If you run into any issues with the upgrade process contact [CircleCI support](https://support.circleci.com/hc/en-us) for assistance.
