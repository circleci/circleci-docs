---
layout: classic-docs
title: Downgrading MySQL from 5.7 to 5.6
categories: [troubleshooting]
description: Our base image comes pre-installed with MySQL 5.7, here's how to downgrade
last_updated: Oct 16, 2017
sitemap: false
---

CircleCI updated the Ubuntu 14.04 Trusty [build image](https://circleci.com/docs/1.0/build-image-trusty/) to include MySQL 5.7, however you may still need MySQL 5.6.

If you're not already on [2.0](https://circleci.com/docs/2.0/), where you can choose your own version of MySQL using docker, this document describes how to downgrade on 1.0.

## Using Official MySQL Packages

The first option is to use the following script which purges the existing MySQL install, then downloads and installs official packages from MySQL.

The following `circle.yml` example runs the script in a "dependencies:pre" step to ensure the database is set up and installed, as well as cached properly before continuing.

```
machine:
  environment:
    DEBIAN_FRONTEND: noninteractive

dependencies:
  cache_directories:
    - .dependency-cache
  pre:
    - bash ./downgrade_mysql.sh

test:
  override:
    - mysql --version
    - mysql -u root -e 'select version();'
```

Next is the `downgrade_mysql.sh` script.

```

#!/bin/bash

# Downgrade MySQL from 5.7 to 5.6 in CircleCI
set -e
set -x
set -u

export MYSQL_DL_URL="http://downloads.mysql.com/archives/get/file"

mkdir -p .dependency-cache/mysql5.6

sudo apt-get remove --purge mysql-server mysql-client mysql-common libmysqlclient-dev
sudo apt-get autoremove
sudo apt-get clean
sudo rm -rf /etc/mysql /var/lib/mysql
sudo mkdir -p /var/lib/mysql

[ -e .dependency-cache/mysql5.6/mysql-common_5.6.23-1ubuntu14.04_amd64.deb ] \
  || wget $MYSQL_DL_URL/mysql-common_5.6.23-1ubuntu14.04_amd64.deb -P .dependency-cache/mysql5.6
[ -e .dependency-cache/mysql5.6/mysql-community-server_5.6.23-1ubuntu14.04_amd64.deb ] \
  || wget $MYSQL_DL_URL/mysql-community-server_5.6.23-1ubuntu14.04_amd64.deb -P .dependency-cache/mysql5.6
[ -e .dependency-cache/mysql5.6/mysql-community-client_5.6.23-1ubuntu14.04_amd64.deb ] \
  || wget $MYSQL_DL_URL/mysql-community-client_5.6.23-1ubuntu14.04_amd64.deb -P .dependency-cache/mysql5.6
[ -e .dependency-cache/mysql5.6/libmysqlclient18_5.6.23-1ubuntu14.04_amd64.deb ] \
  || wget $MYSQL_DL_URL/libmysqlclient18_5.6.23-1ubuntu14.04_amd64.deb -P .dependency-cache/mysql5.6
[ -e .dependency-cache/mysql5.6/libmysqlclient-dev_5.6.23-1ubuntu14.04_amd64.deb ] \
  || wget $MYSQL_DL_URL/libmysqlclient-dev_5.6.23-1ubuntu14.04_amd64.deb -P .dependency-cache/mysql5.6

sudo dpkg -i .dependency-cache/mysql5.6/mysql-common_5.6.23-1ubuntu14.04_amd64.deb
sudo dpkg -i .dependency-cache/mysql5.6/mysql-community-server_5.6.23-1ubuntu14.04_amd64.deb
sudo dpkg -i .dependency-cache/mysql5.6/mysql-community-client_5.6.23-1ubuntu14.04_amd64.deb
sudo dpkg -i .dependency-cache/mysql5.6/libmysqlclient18_5.6.23-1ubuntu14.04_amd64.deb
sudo dpkg -i .dependency-cache/mysql5.6/libmysqlclient-dev_5.6.23-1ubuntu14.04_amd64.deb
```

The [following build](https://circleci.com/gh/zzak/mysql-down/8#config/containers/0){:rel="nofollow"} demonstrates successfully downgrading MySQL to 5.6.

![](  {{ site.baseurl }}/assets/img/docs/downgrade-mysql-to-5.6.png)

## Using Docker

Alternatively, if you would rather use Docker to run the MySQL server, use the following configuration.

```
machine:
  services:
    - docker
dependencies:
  pre:
    - sudo apt-get remove mysql-community-server
    - docker run -e MYSQL_ALLOW_EMPTY_PASSWORD=1 -p 3306:3306 -d mysql:5.6
```


