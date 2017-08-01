---
layout: enterprise
title: "High Availability"
category: [advanced-config]
order: 8
description: "Configuring High Availability for CircleCI Enterprise"
---

## Contents 

1. [Overview](#overview)
2. [Exporting Existing Databases](#exporting-existing-databases)
3. [Administering MongoDB](#administering-mongodb)
4. [Administering PostgreSQL](#administering-postgresql)
5. [High Availibility Configuration](#high-availability-configuration)
6. [Troubleshooting](#troubleshooting)

## Overview

This document outlines the elements necessary to set up a high-availability CircleCI Enterprise installation. At a high level, this requires an auto-recovering "services box", for which we recommend using an AWS ASG (Auto Scaling Group) of one member, and external MongoDB and PostgreSQL databases to handle the persistent state. The sections below step through each of these elements in detail.


## Exporting Existing Databases

**Disclaimer:** Please note that, while CircleCI Enterprise supports the use of external databases, the maintenance, availability, and security of the database servers are the responsibility of your organization. 

**Note:** This process will require downtime. Please schedule an outage window with your team. 

1. Log into the Replicated console located at HTTPS://<YOUR_CIRCLE_URL>:8800/dashboard and select "Stop" to shut down the CircleCI application. 
2. SSH into the services box and switch to the root user with `sudo su`
3. Make sure that no other Mongo or PostgreSQL containers are running. You can see all of the containers that are running with `docker ps`. 
4. Download and run the export script using the commands below. This will export both the MongoDB and PostgreSQL databases. This could take a while depending on the amount of data that is currently stored. 
```shell
wget https://s3.amazonaws.com/release-team/scripts/circleci-database-export
chmod +x circleci-database-export
./circleci-database-export
```
5. Once the backup process is complete, you will find a tarball in the directory where you ran the script. 

### Restoring the Databases 

**Note:** The process to restore the datbases may vary based on your database configuration. Please use the following sections as general guidelines. 

Please run the following commands from the services box where you ran the backup scripts. This will ensure that the services box is able to communicate with your external database servers. You should untar the export files from the previous step before attempting to restore. `tar xf $EXPORT_FILE`. 

#### Restoring MongoDB

1. Use `mongorestore` to restore the database
```
sudo mongorestore -u $USERNAME -p $PASSWORD /$PATH/$TO/$MONGO_DUMP
```

#### Restoring PostgreSQL 

1. Use `psql` to restor the database 
```
psql -U $USERNAME $DBNAME < $EXPORTED_CIRCLECI.sql
```

## Administering MongoDB

This section provides a sample configuration for external Mongo databases with CircleCI.

CircleCI supports MongoDB version 3.2.x (currently 3.2.11) and uses WiredTiger 3.2 as the backend storage engine for the production SaaS application. 

To maximize performance, use hosts with more memory for MongoDB. Ideally size server RAM to fit all data  and indexes that will be accessed regularly. The r3 series is a good option for high memory within the AWS fleet.

Use mounted EBS volumes for MongoDB data, for example, Provisioned IOPs volumes at 10k-20k IOPs adjusted for your individual load. Configure each host the same way regardless of whether it is initially the primary or a secondary to avoid degradation when roles change.

Consider using TLS for all communication with MongoDB, for example, between clients and MongoDB and between members of the MongoDB replica set. It is also possible to use an internally generated CA to create certificates and to deploy the root certificate to all clients and MongoDB instances.

Following is a template for the configuration on each host in the replica set:

```
storage:
  dbPath: /mongo/data
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /mongo/logs/mongod.log
  logRotate: reopen
  timeStampFormat: iso8601-utc

replication:
  replSetName: <a string of your choosing>

security:
  authorization: enabled
  clusterAuthMode: x509

net:
  ssl:
    mode: requireSSL
    PEMKeyFile: /etc/mongodb/<cert name>.pem
    clusterFile: /etc/mongodb/<cert name>.pem
    CAFile: /etc/mongodb/<ca cert name>.pem
    allowConnectionsWithoutCertificates: true
```

**Note:** The members of the replica set authenticate using the client certificates. CircleCI connects to MongoDB using password authentication over an encrypted connection.

### Setting Up the MongoDB hosts

If you are brand new to MongoDB we suggest reviewing the [MongoDB on the AWS Cloud](https://docs.aws.amazon.com/quickstart/latest/mongodb/welcome.html) documentation which includes a ready to deploy CloudFormation configuration for you to use. 

1. Write the respective .pem SSL certificate file from above to each host in the location used in your config.
2. Add all three hosts to DNS.
3. On the host which will become the initial PRIMARY do the following: 
    * Comment out the SSL, auth, and replication sections in the configuration and restart.
    * Start the client by typing the mongo command followed by the use admin command.
4. Create a siteUserAdmin account to manage users according to the following example: 
    ```
    db.createUser({ user: "siteUserAdmin", pwd: '', 
                    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ] })
    ```
5.	Create a circle-admin account to manage the databases as follows: 
    ```
    db.createUser({ user: 'circle-admin', pwd: '',
                    roles: [{ role: 'root', db: 'admin' }, { role: 'dbAdmin', db: 'admin' }] })
    ```
    * Exit the client, uncomment the configuration, and restart.
    * Reconnect to client as circle-admin and run the rs.initiate() command.
	
    **Note:** If you are using AWS and the first hostname resolves to something that is AWS-internal and your PRIMARY adopts that as its name, you must rename your host before extending the replica set by following the instructions [here](https://docs.mongodb.com/v3.2/tutorial/change-hostnames-in-a-replica-set/#change-all-hostnames-at-the-same-time).

6. To add the remaining two hosts to the replica set, issue the following commands: 
    ```
    rs.add('<second hostname>')
    rs.add('<third hostname>')
    ```
    The MongoDB replica set is ready for use with CircleCI.

7. Create a CircleCI user for the actual application, which can be created with: 
    ```
    db.createUser({ user: "circle", pwd: '',
                    roles: [ { role: "readWrite", db: "circle_ghe" },
                             { role: "readWrite", db: "build_state_dev_ghe" },
                             { role: "readWrite", db: "containers_dev_ghe" } ] })
    ```

### MongoDB Backups

This section describes how to backup data mounted on EBS volumes.

1. To ensure that the disk is in a consistent state, stop the mongodb process (using `sudo service mongod stop` or another system-appropriate command) on one of the SECONDARY instances and wait for the process to completely stop. **NOTE:** stopping the replica outright has proven to be more reliable for consistent restores than using the db.fsyncLock() mechanism described in the mongo documentation. This is also an additional safeguard for consistent state on top of the journal files.
2. Use the AWS console or CLI to generate and complete a snapshot.
3. To rejoin the replica set as a SECONDARY, restart the mongodb  process with `sudo service mongod start`.
4. The SECONDARY begins serving traffic after replication catches up. 

## Administering PostgreSQL

It is assumed that users of the initial high-availability offering will use RDS on AWS, with multi-AZ mode and automated backups. Please let us know if any additional information is required for configuring and maintaining Postgres.

## High Availability Configuration

Making the services box automatically recover from failure means replacing it with an ASG of a single member, where the associated userdata entirely specifies how to install and configure Replicated and connect to the external databases.

A working example of this can be found at [https://github.com/circleci/enterprise-setup/blob/ha-test/circleci.tf](https://github.com/circleci/enterprise-setup/blob/ha-test/circleci.tf). Note in particular the userdata for the services box launch configuration: 

```
#!/bin/bash

set -ex

startup() {
  apt-get update; apt-get install -y python-pip
  pip install awscli
  aws s3 cp s3://ha-test-bucket-3f5b105a/settings.conf /etc/settings.conf
  aws s3 cp s3://ha-test-bucket-3f5b105a/replicated.conf /etc/replicated.conf
  aws s3 cp s3://ha-test-bucket-3f5b105a/license.rli /etc/license.rli
  aws s3 cp s3://ha-test-bucket-3f5b105a/circle-installation-customizations /etc/circle-installation-customizations
  curl https://get.replicated.com/docker | bash -s local_address=$(curl http://169.254.169.254/latest/meta-data/local-ipv4) no_proxy=1
}

time startup
``` 

The contents of the files pulled from S3 are as follows: 

circle-installation-customizations:
```
# Note that connection strings below should be modified as necessary

# Mongo DB
MONGO_BASE_URI=mongodb://circle:<password>@<hostname>:27017
export CIRCLE_SECRETS_MONGODB_MAIN_URI="$MONGO_BASE_URI/circle_ghe?authSource=admin"
export CIRCLE_SECRETS_MONGODB_ACTION_LOGS_URI="$MONGO_BASE_URI/circle_ghe?authSource=admin"
export CIRCLE_SECRETS_MONGODB_BUILD_STATE_URI="$MONGO_BASE_URI/build_state_dev_ghe?authSource=admin"
export CIRCLE_SECRETS_MONGODB_CONTAINERS_URI="$MONGO_BASE_URI/containers_dev_ghe?authSource=admin"

# Postgres DB
export CIRCLE_SECRETS_POSTGRES_MAIN_URI='postgres://circle:<password>@<hostname>:5432/circle'
```

replicated.conf:
```
{
  "DaemonAuthenticationType": "password",
  "DaemonAuthenticationPassword": "<password>",
  "TlsBootstrapType": "self-signed",
  "TlsBootstrapHostname": "<CircleCI hostname>",
  "LogLevel": "debug",
  "Channel": "stable",
  "LicenseFileLocation": "/etc/license.rli",
  "ImportSettingsFrom": "/etc/settings.conf",
  "BypassPreflightChecks": true
}
```

settings.conf:
```
{
 "hostname": {
   "value": "<CircleCI Hostname>"
 },
 "allow_cluster": {
   "value": "1"
 },
 "secret_passphrase": {
     "value": "<passphrase>"
 },
 "ghe_type": {
     "value": "github_type_public"
 },
 "ghe_client_id": {
     "value": "<id>"
 },
 "ghe_client_secret": {
     "value": "<secret>"
 },
 "storage_backend": {
     "value": "storage_backend_s3"
 },
 "aws_region": {
     "value": "us-east-1"
 },
 "s3_bucket": {
     "value": "<bucket name>"
 },
 "sqs_queue_url": {
     "value": "<queue url>"
 },
 "license_agreement":
 {
     "value": "license_agreement_agree"
 }
}
```

Note that you can dump the contents of settings.conf from an existing CircleCI installation by running `replicated app <app id> settings` on the services box. 

license.rli is the CircleCI Enterprise license file. 

## Troubleshooting

### Known Issues

* The various config files must be dropped in place on the host before Replicated is installed, so Replicated needs to be installed on demand. It may be possible to speed up the initial boot time by pre-pulling the CircleCI docker containers and baking them into the AMI. 
* The Replicated installation process will automatically pull the latest stable CircleCI release. To prevent inadvertantly upgrading CircleCI, it is possible for customer versions to be pinned by CircleCI on the license service. The ability to specify a specific version client-side is coming soon from Replicated. 

### Other Possible Issues

#### The Dashboard is stuck on `Waiting for app to report ready...`

It can take several minutes for CircleCI to start. However, if it seems to be stuck, it's typically the result of an issue with the URI for either MongoDB or PostgreSQL. Some examples include:

* A network issue between one of your database server(s) and the Services host
* A malformed URI
* Invalid credentials to access the database(s)
* Improper configuration settings for the database
* The database refusing connections from outside sources and restricted to localhost
	
You can gain more insight by checking the logs on the main CircleCI app container with the following command:

```
docker logs frontend
```
