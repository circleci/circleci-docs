---
layout: classic-docs
title: "Adding External Database Hosts for High Availability"
category: [administration]
order: 20
description: "Configuring High Availability for CircleCI 2.0"
---

High availability gives you the ability to replicate your CircleCI data and automate recovery from a single database instance failure, without downtime or service disruption.

This document describes how to to set up a highly available CircleCI 2.0 installation in the following sections:

* TOC
{:toc}

## Prerequisites

Before you configure an existing CircleCI installation for high availability, you must update your license by contacting our account team or by [opening a support ticket](https://support.circleci.com/hc/en-us/requests/new). Configuring an existing CircleCI installation for HA without updating the license through the CircleCI customer success team is **not** supported.

The steps in this document also assume you have an existing CircleCI 2.0 Services machine and Builders in use. To configure your existing CircleCI 2.0 installation for high availability, you must export the databases currently in use on the Services machine to new AWS instances. This procedure uses three instances for the MongoDB replica set and a new AWS Auto Scaling group for PostgreSQL.

## MongoDB Instance Requirements

CircleCI supports MongoDB version 3.2.x (currently 3.2.11) and uses WiredTiger 3.2 as the backend storage engine. Consider the following when setting up your external database hosts:
- To maximize performance, use hosts with more memory for MongoDB. Ideally size server RAM to fit all data and indexes that will be accessed regularly. The AWS R3 series is a good option for high memory within the AWS fleet.
- Use mounted EBS volumes for MongoDB data, for example, provision IOPs volumes at 10k-20k IOPs adjusted for your individual load. Configure each host the same way regardless of whether it is initially the primary or a secondary to avoid degradation when roles change.
- Consider using TLS for all communication with MongoDB, for example, between clients and MongoDB and between members of the MongoDB replica set. It is also possible to use an internally generated CA to create certificates and to deploy the root certificate to all clients and MongoDB instances.

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

If you are brand new to MongoDB, see the [MongoDB on the AWS Cloud](https://docs.aws.amazon.com/quickstart/latest/mongodb/welcome.html) documentation which includes a ready to deploy CloudFormation configuration for you to use.

1. Write the respective `.pem` SSL certificate file from above to each host in the location used in your configuration.
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

    **Note:** If you are using AWS and the first hostname resolves to something that is AWS-internal and your PRIMARY adopts that as its name, you must rename your host before extending the replica set by following the instructions [Change All Hostnames in a Replica Set](https://docs.mongodb.com/v3.2/tutorial/change-hostnames-in-a-replica-set/#change-all-hostnames-at-the-same-time) article.

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

## Setting up PostgreSQL Hosts

It is best practice to set up PostgreSQL 9.5 or later using Amazon Relational Database Service (Amazon RDS) with multi Availability Zone (multi-AZ) mode for automated backups and failover. Refer to the [Amazon RDS Multi-AZ Deployments](https://aws.amazon.com/rds/details/multi-az/) documentation for details.

Five databases are required for 2.0 services:

* `vms`
* `conductor_production` with extension `uuid-ossp` enabled
* `contexts_service_production` with extension `uuid-ossp` enabled
* `cron_service_production`
* `circle` with extensions `pgcrypto` and `uuid-ossp` enabled

## Exporting Existing Databases

**Note:** This process will require downtime. Please schedule an outage window with CircleCI users.

1. Log in to the Replicated console located at https://<YOUR_CIRCLE_URL>:8800/dashboard and select Stop to shut down the CircleCI application.
2. SSH in to the Services machine and switch to the `root` user with the `sudo su` command.
3. Confirm that all MongoDB and PostgreSQL containers have stopped by listing all running containers with the `docker ps` command.
4. Download and run the export script using the commands below. The duration of the export operation depends on the amount of stored data.
     ```shell
     wget https://s3.amazonaws.com/release-team/scripts/circle-database-export-2.0
     chmod +x circle-database-export-2.0
     ./circle-database-export-2.0
     ```
     Both the MongoDB and PostgreSQL databases are exported.

5. After the backup process is complete, a `.tar` file appears in the directory where you ran the script.

## Restoring the Databases on the New Hosts

**Note:** The process to restore the databases may vary based on your database configuration. Use the following sections as general guidelines. This process ensures that the Services machine is able to communicate with your external database servers.

### Restoring MongoDB and PostgreSQL

1. Untar the exported database files.

     ```
     tar xf $EXPORT_FILE
     ```

1. On the Services machine where you ran the export script, use the following `mongorestore` command to restore the database replacing the variables with the circle-admin user credentials and the location of the new MongoDB hosts.
     ```
     sudo mongorestore -u $USERNAME -p $PASSWORD /$PATH/$TO/$MONGO_DUMP
     ```

1. On the Services machine where you ran the export script, use the following `psql` command to restore the databases, replacing the variables with the appropriate user credentials and the name of the PostgreSQL database.

     ```
     psql -U $USERNAME $DBNAME < $EXPORTED_CIRCLECI_DBNAME.sql
     ```

## Configuring Automatic Recovery

To enable the Services machine to automatically recover from failure, replace it with an AWS Auto Scaling Group (ASG) containing a single member. Then, configure the associated userdata for this member to specify how to install and configure Replicated and connect to the external databases as shown in the following file snippets.

Refer to the [https://github.com/circleci/enterprise-setup/blob/ha-test/circleci.tf](https://github.com/circleci/enterprise-setup/blob/ha-test/circleci.tf) for a complete example. The userdata for the Services machine launch configuration describes the set of files in the following sections.

```
#!/bin/bash

set -ex

startup() {
  apt-get update; apt-get install -y python-pip
  pip install awscli
  aws s3 cp s3://ha-test-bucket-3f5b105a/settings.conf /etc/settings.conf
  aws s3 cp s3://ha-test-bucket-3f5b105a/replicated.conf /etc/replicated.conf
  aws s3 cp s3://ha-test-bucket-3f5b105a/license.rli /etc/license.rli
  curl https://get.replicated.com/docker | bash -s local_address=$(curl http://169.254.169.254/latest/meta-data/local-ipv4) no_proxy=1
}

time startup
```

Following is the content of the `replicated.conf` file:
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

Following is the content of the `settings.conf` file:
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

It is also possible to retrieve the contents of `settings.conf` from an existing CircleCI installation by running `replicated app <app id> settings` on the Services machine. The `license.rli` is the CircleCI Enterprise license file.

### Troubleshooting

* The various configuration files must be added to the Services machine before Replicated is installed. It may be possible to speed up the initial boot time by pre-pulling the CircleCI docker containers and adding them into the AMI.
* The Replicated installation process will automatically pull the latest stable CircleCI release. To prevent inadvertantly upgrading CircleCI, it is possible for your versions to be pinned by CircleCI on the license service.

It can take several minutes for CircleCI to start. However, if it seems to be stuck, check the URI for either MongoDB or PostgreSQL. Some examples of common issues related to the URI include:

* A network issue between one of your database server(s) and the Services host
* A malformed URI
* Invalid credentials to access the database(s)
* Improper configuration settings for the database
* The database refusing connections from outside sources and restricted to localhost

Additionally, check the logs on the main CircleCI app container with the following command:

```
docker logs -f frontend
```

## Backups

### Backing Up MongoDB

Regularly backup data mounted on EBS volumes using the following steps:

1. To ensure that the disk is in a consistent state, stop the mongodb process (using `sudo service mongod stop` or another system-appropriate command) on one of the SECONDARY instances and wait for the process to completely stop. **Note:** stopping the replica outright has proven to be more reliable for consistent restores than using the db.fsyncLock() mechanism described in the mongo documentation. This is also an additional safeguard for consistent state on top of the journal files.
2. Use the AWS console or CLI to generate and complete a snapshot.
3. To rejoin the replica set as a SECONDARY, restart the mongodb  process with `sudo service mongod start`.
4. The SECONDARY begins serving traffic after replication catches up.

### Backing Up Encryption Keys

If you are running `1.48.4` or later, you must backup encryption keys. The encryption keys are stored in the Service machine and are used to encrypt various sensitive data.

**Note:** Losing the encryption keys may lead to the unrecoverable data inconsistency because CircleCI does not decrypt  data without the correct keys.

The encryption keys are plain text files for easy backup from the `/data/circle/circleci-encryption-keys/` directory and should then be stored it in a secure place.

Restore the directory to the same location **before** starting up CircleCI.

### Vault Requirements

Vault is required for the `contexts-service` to securely encrypt and decrypt shared contexts.

Vault should be setup as follows:

* Vault version `0.7` is the only version currently supported
* It is highly recommended that Vault be configured with TLS enabled
* There must be a `transit` mount available
* A token must be provided with permissions to manage keys and encrypt/decrypt data for the mounted `transit` backend


## Configuring Replicated

To securely pass Mongodb, Postgresql and Vault connection settings to services running in Replicated, use of customization files is required.

Following are the customization files neccesary for HA:

### `/etc/circle-installation-customizations`

```
# Note that connection strings below should be modified as necessary

MONGO_BASE_URI=mongodb://circle:<password>@<hostname>:27017
export CIRCLE_SECRETS_MONGODB_MAIN_URI="$MONGO_BASE_URI/circle_ghe?ssl=true&authSource=admin"
export CIRCLE_SECRETS_MONGODB_ACTION_LOGS_URI="$MONGO_BASE_URI/circle_ghe?ssl=true&authSource=admin"
export CIRCLE_SECRETS_MONGODB_BUILD_STATE_URI="$MONGO_BASE_URI/build_state_dev_ghe?ssl=true&authSource=admin"
export CIRCLE_SECRETS_MONGODB_CONTAINERS_URI="$MONGO_BASE_URI/containers_dev_ghe?ssl=true&authSource=admin"
export CIRCLE_SECRETS_MONGODB_REMOTE_CONTAINERS_URI="$MONGO_BASE_URI/remote_containers_dev_ghe?ssl=true&authSource=admin"
```

### `/etc/circleconfig/shared/postgresql`

```
export POSTGRES_HOST="<hostname>"
export POSTGRES_PORT="5432"
export POSTGRES_PASSWORD="<password>"
export POSTGRES_USER="circle"
```

### `/etc/circleconfig/shared/vault`

```
export VAULT__SCHEME="https"
export VAULT__HOST="<vault-hostname>"
export VAULT__PORT="<vault-port>"
export VAULT__CLIENT_TOKEN="<vault-client-token>"
export VAULT__TRANSIT_MOUNT="<vaut-transit-mount>"
```

## Transport Layer Security (TLS)

When signing Mongodb, Postgresql or Vault TLS Certificates with a custom Certificate Authority (CA), a copy of the CA certificate must be saved on Service machine in `/usr/local/share/ca-certificates` with file extension `.crt`.
