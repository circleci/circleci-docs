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
- CircleCI 2.0 is only available on AWS. 
- There is not currently an in-place upgrade mechanism. The upgrade process will require you to set up a new installation of CircleCI and import the existing data. This will require a downtime window.
 
## Perform a Backup

Prior to beginning the upgrade procedure, you should back up all of your data as described in the [backup documentation]({{ site.baseurl }}/2.0/backup/).

## Export Existing Databases 

CircleCI 2.0 runs MongoDB 3.2.11 and PostgreSQL 9.5. These are major upgrade versions compared to CircleCI 1.0 Enterprise. The upgrade process consists of the following steps. 

1. Export existing databases. 
2. Convert the data to be compatible with the updated versions of the database servers. 
3. Import upgraded databases into your CircleCI 2.0 installation. 

This procedure uses a `bash` script to perform all of the above steps and then it runs some basic sanity checks. The following steps should be performed on the existing CircleCI 1.0 Enterprise installation. 

**Note:** The following steps are non-destructive and in the event of any failure in the upgrade process you will be able to revert back to the previous state. As with all major software changes, you should still create a backup just to be safe. 

1. Log into the Replicated console located at `https://<your-circleci-install>:8800/dashboard` and select "Stop Now" to shut down CircleCI. 
2. SSH into the Services machine and switch to the `root` user with the `sudo su` command.
3. Confirm that MongoDB and PostgreSQL containers have stopped by listing all running containers with the `docker ps` command.
4. Download and run the upgrade script using the commands below. The duration of the upgrade operation depends on the amount of stored data. 

	```
	wget https://s3.amazonaws.com/release-team/scripts/circleci-database-upgrade
	chmod +x circleci-database-upgrade
	./circleci-database-upgrade
	```

5. After the upgrade process is complete, a `.tar.gz` file appears in the directory where you ran the script. You will use this file to import your data into your new CircleCI 2.0 installation in a subsequent step. 

## Perform Installation of CircleCI 

After you have exported your databases, install CircleCI 2.0 using Terraform as described in the [Installing CircleCI 2.0 on Amazon Web Services with Terraform]({{ site.baseurl }}/2.0/aws/) document.

To test your new install, set up a new GitHub application and use a different subdomain. After you have verified that the new installation works, you can cut over from your previous GitHub OAuth Application and subdomain name. 

## Verify Your New Installation 

Verify that your installation works by forking and running our [Reality Check](https://github.com/circleci/realitycheck) repository which exercises the basic functionality of CircleCI 2.0. 

## Import Data 

1. Copy the database export created in the first section to the new CircleCI 2.0 Services instance. 
2. Download and run the import script using the commands below. The duration of the import operation depends on the amount of stored data. 

  ```
  wget https://s3.amazonaws.com/release-team/scripts/circleci-database-import
  chmod +x circleci-database-import
  ./circleci-database-import $TAR_FILE
  ```

## Cut Over

After you have restored the databases and verified that all of your previous builds and project settings are available you can safely change the GitHub OAuth application to the original one that you were using and update the DNS to have your previous subdomain point to the new installation. 

## Troubleshooting

If you run into any issues with the upgrade process contact [CircleCI support](mailto:enterprise-support@circleci.com) for assistance. 

