---
layout: enterprise
section: enterprise
title: "Configuring External Databases"
category: [advanced-config]
order: 8
description: "Configuring CircleCI Enterprise to work with external databases."
hide: false
---

CircleCI Enterprise relies on the use of MongoDB and Postgresql. By default, these services are running inside Docker containers on the Services host (the host that is running Replicated). This is will work well for most small to medium sized installs. For larger installs or installs with heavy usage, externalizing the databases may be advantageous.

**Disclaimer:**  Please note that while CircleCI Enterprise does support the use of external databases; the maintenance, availability, and security of the database servers are the responsibility of your organization.

## Backing Up Existing Data
**Note:** This process will require downtime.  Please schedule an outage window with your team.    

1. SSH into the Services host  
1. Download and run the backup script using the command below.  This will backup both the MongoDB and Postgresql databases.  This could take quite a while depending on the amount of data currently stored.
   ```shell
   curl PATH_TO_SCRIPT | bash
   ```
1. Once the backup process has been completed, you can find the files located in the `/backup` directory.

## Configuring the Services host
1. Create the following file: `/etc/circle-installation-customizations`
1. Open the file above with your favorite text editor and paste the following:
```
# Mongo DB

        MONGO_URI=`mongodb://{{repl ConfigOption "MONGO_USER"}}:{{repl ConfigOption "MONGO_PASSWORD"}}@{{repl ThisHostPrivateIpAddress }}:27017`
        POSTGRES_URI=`postgres://{{repl ConfigOption "POSTGRES_USER"}}:{{repl ConfigOption "POSTGRES_PASSWORD"}}@{{repl ThisHostPrivateIpAddress }}:5432`

        export CIRCLE_SECRETS_MONGODB_MAIN_URI=$MONGO_URI/circle_ghe?authSource=admin
        export CIRCLE_SECRETS_MONGODB_ACTION_LOGS_URI=$MONGO_URI/circle_ghe?authSource=admin
        export CIRCLE_SECRETS_MONGODB_BUILD_STATE_URI=$MONGO_URI/build_state_dev_ghe?authSource=admin
        export CIRCLE_SECRETS_MONGODB_CONTAINERS_URI=$MONGO_URI/containers_dev_ghe?authSource=admin
        export CIRCLE_SECRETS_MONGODB_REMOTE_CONTAINERS_URI='mongodb://{{repl ConfigOption "MONGO_USER"}}:{{repl ConfigOption "MONGO_PASSWORD"}}@{{repl ThisHostPrivateIpAddress }}:27017/remote_containers_dev_ghe?authSource=admin'

# Postgres DB
export CIRCLE_SECRETS_POSTGRES_MAIN_URI='/{{repl ConfigOption "POSTGRES_USER"}}'
``` 