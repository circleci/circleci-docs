---
layout: enterprise
title: "Configuring External Databases"
category: [advanced-config]
order: 8
description: "Configuring CircleCI Enterprise to work with external databases."
---

CircleCI Enterprise requires MongoDB and PostgreSQL. By default, these services are running inside Docker containers on the Services host (the host running Replicated). This will work well for most small to medium-sized installs. For larger installs or installs with heavy usage, externalizing the databases may be more effective.

**Disclaimer:** Please note that, while CircleCI Enterprise supports the use of external databases, the maintenance, availability, and security of the database servers are the responsibility of you and/or your organization.

## Backing Up Existing Data

**NOTE:** This process will require downtime.  Please schedule an outage window with your team.

1. SSH into the Services host
2. Download and run the backup script using the command below. This will backup both the MongoDB and PostgreSQL databases. This could take a while depending on the amount of data currently stored.
   ```shell
   curl -kL goo.gl/OHxS4x | sudo bash
   ```
3. Once the backup process is complete, you'll find the files located in the `/backup` directory.

## Restoring the Databases
**Note:** The process to restore the databases may vary based on your database setup.  Please use the following sections as a loose guide.

#### Restoring MongoDB
1. Untar the mongo backup file using:
    ```
    tar zxvf mongodump_X_X_X_X_X.tar.gz
    ```
1. Use `mongorestore` to restore the database:
    ```
    sudo mongorestore -u your_db_username -p your_db_password /PATH/TO/mongo_dump_raw
    ```

#### Restoring Postgresql
1. Login to your Postgresql server as the user you plan on using for CircleCI Enterprise.  This user should have administrative access to the database.
1. Restore the database using the following command:
    ```
    pg_restore -v -C /PATH/TO/pgdump_X_X_X_X_X.sql
    ```

## Configuring the Services host

**NOTE:** You should already have the external MongoDB and PostgreSQL databases created and configured. You will need this information to generate the URI files in the steps below.

Example URI's:

```
mongodb://your_db_username:secure_password_here@12.34.56.78:27017
postgres://your_db_username:secure_password_here@12.34.56.78:5432
```

1. Visit the dashboard (services_ip_or_domain:8800) and stop Circle using the `Stop Now` button.
2. Return to the services host terminal and create the following file: `/etc/circle-installation-customizations`.
3. Open the file above with your favorite text editor and paste the following. You may need to make adjustments to the URI based on your database configurations:
   ```
   MONGO_URI=REPLACE_THIS_WITH_MONGO_URI
   POSTGRES_URI=REPLACE_THIS_WITH_POSTGRES_URI
   
   export CIRCLE_SECRETS_MONGODB_MAIN_URI=$MONGO_URI/circle_ghe?authSource=admin
   export CIRCLE_SECRETS_MONGODB_ACTION_LOGS_URI=$MONGO_URI/circle_ghe?authSource=admin
   export CIRCLE_SECRETS_MONGODB_BUILD_STATE_URI=$MONGO_URI/build_state_dev_ghe?authSource=admin
   export CIRCLE_SECRETS_MONGODB_CONTAINERS_URI=$MONGO_URI/containers_dev_ghe?authSource=admin
   export CIRCLE_SECRETS_MONGODB_REMOTE_CONTAINERS_URI=$MONGO_URI/remote_containers_dev_ghe?authSource=admin
   export CIRCLE_SECRETS_POSTGRES_MAIN_URI=$POSTGRES_URI/circle
   ```
4. Access the dashboard once again and start Circle using the **Start Now** button.  After a few moments, the dashboard should report itself as "Started".

## Troubleshooting

### The Dashboard is stuck on `Waiting for app to report ready...`
It can take several minutes for CircleCI to start. However, if it seems to be stuck, it's typically the result of an issue with the URI for either MongoDB or PostgreSQL. Some examples include:

- A network issue between one of your database server(s) and the Services host
- A malformed URI
- Invalid credentials to access the database(s)
- Improper configuration settings for the database
- The database refusing connections from outside sources and restricted to localhost

You can gain more insight by checking the `circle.log` file on the frontend-service container. You can copy/paste the command below in the services host terminal to watch the log file for Java errors (assuming the containers are running).

```
docker exec -it $(docker ps | grep frontend | awk '{ print $1 }') tail -f /circle.log
```
