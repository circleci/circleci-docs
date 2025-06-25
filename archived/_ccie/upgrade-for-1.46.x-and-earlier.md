---
layout: enterprise
section: enterprise
title: "Upgrading from version 1.46.x and earlier"
category: [resources]
order: 99
description: "Special instructions if upgrading from versions prior to 1.47.0"
hide: true
sitemap: false
---

## Note for Admins
Moving from versions prior to 1.47.0 to the newest requires more attention than other upgrades you may have done in the past. Highlights of operational considerations for running this upgrade include:

* You will need to upgrade Replicated to run this release (see below).
* You will need to run a database migration, requiring bringing down your Services box and fully cycling your build fleet (downtime on the order of 1 hour should be planned)
* We have changed our security policy for the underlying Mongo database - for most installations this will not require any additional work, but if you have enabled your own authentication on the underlying Mongo database please speak with us before running this upgrade.
* We strongly recommend taking a full snapshot backup of your Services box before running this upgrade because you will be performing a non-trivial migration on your database. While we have taken great pains to ensure the migration accounts for all potential states of data, this will be the first such migration deployed to our Enterprise installations. 

## Process for Upgrading to Current Version from 1.46.5 or Earlier
NOTE: You should plan for downtime during the upgrade process. It should not take more than an hour. We recommend you plan to turn off your build fleet as well, as you will need to cycle it after the upgrade.

1. Backup your Services box - we recommend a full snapshot of your VM as the simplest way to accomplish this.
2. Upgrade Replicated. You will need your Replicated console password and the private IP of your Services box. We'll be referencing this doc for precise replicated instructions https://circleci.com/docs/enterprise/debugging-replicated/.
    - First you'll need to login to your services box.
    - Second gain root access and log into (https://circleci.com/docs/enterprise/debugging-replicated/#trying-to-login-replicated) replicated. 
    - Third If you get an error about not having a etc/replicated.conf file, then create one using these instructions: https://circleci.com/docs/enterprise/debugging-replicated/#config-file-etcreplicatedconf-not-found
    - Fourth upgrade Replicated, see:  <https://www.replicated.com/docs/kb/supporting-your-customers/upgrading-to-replicated-2/>
3. Once your Replicated has been upgraded to 2.x, run `source /etc/replicated.alias` on the Services box to make sure the Replicated shell aliases work.
4. Go to your replicated console (usually available on port 8800 via HTTP at the IP or domain you use to access the CircleCI web UI) to finish the upgrade, then download and install the latest update from inside the Replicated console.
5. After starting up the app, run the following command on the command line on your Services box: `circleci run-migrations`
6. Cycle your build fleet.


