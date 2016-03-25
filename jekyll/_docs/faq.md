---
layout: classic-docs
title: Frequently Asked Questions
short-title: FAQ
categories: [getting-started]
description: Frequently Asked Questions
last_updated: February 23, 2015
---

## Authentication

### Do you support BitBucket or GitLab?
Currently we only support authentication with GitHub, sorry about that.

### I can’t give CircleCI the access to all my private repositories.

### What do I do?
GitHub has only recently added the fine-grained permissions options, and
we are still working on supporting them.

In the meantime, the suggested workaround is to create an additional
user on GitHub with a limited set of permissions and use that account to
perform the builds on CircleCI.

### I updated my email address on GitHub, and it does not show up on

### CircleCI
We refresh GitHub information once a day to stay within GitHub’s API
limits, so check your profile page later – it will be right there.

## Billing & Plans

### Can I build more than one project if I only have one container?
Absolutely. In this case the builds will run one at a time, one after
another.

### How do I stop CircleCI from building a project?
If you get everyone who follows the project on CircleCI to unfollow it, we
will automatically stop building it.

## Integrations

### Can I send HipChat / Slack / IRC notifications for specific branches only?
We don’t currently offer this kind of selective notifications, but the
functionality is in the works. Keep an eye on our
[changelog](https://circleci.com/changelog) to be notified as soon as
this feature is available.

## Discover CircleCI's Public IP addresses

Currently CircleCI runs on multiple AWS Regions and utilitizes many different
servers to perform the builds. As such there isn't a single IP, or even a small
range of IPs, that could be used to help identify that an incoming request is
from a build of your project.

Even if the IP range was known it would not be safe to trust the IP address as
we have thousands of builds running at any one time so multiple project's 
builds could all be making requests from the same IP address.

## Dependencies

### How do I use postgres 9.3?
PostgreSQL 9.3 is currently not shipped with our build containers by
default, but you can install it manually by adding the following to your
`circle.yml`:

```
dependencies:
  pre:
    - sudo service postgresql stop && sudo apt-get remove -y
      postgresql-9.4 && sudo apt-get update; sudo apt-get install -y
      postgresql-9.3 postgresql-contrib-9.3
    - sudo sed -i "s/\port = 5433/port = 5432/"
      /etc/postgresql/9.3/main/postgresql.conf
    - sudo cp /etc/postgresql/9.4/main/pg_hba.conf
      /etc/postgresql/9.3/main/pg_hba.conf
    - sudo service postgresql restart
    - sudo -u postgres createuser ubuntu -d --superuser
    - createdb circle_test
    - createdb ubuntu
```

### How do I use mysql 5.6?
MySQL 5.6 is not in our build containers yet, but you can install it
manually as well by putting the next inctructions into your
`circle.yml`:

```
dependencies:
  pre:
    - sudo apt-add-repository -y 'deb
      http://ppa.launchpad.net/ondrej/mysql-experimental/ubuntu precise
      main'
    - sudo apt-get update; sudo DEBIAN_FRONTEND=noninteractive apt-get
      install -y mysql-server-5.6
```

### How do I use Docker 1.5
Running Docker 1.5 in our environment requires custom patches, and we
need to test the patched version thoroughly before making it available
in our containers. Keep an eye on our
[changelog](https://circleci.com/changelog) to be notified as soon as
Docker 1.5 starts shipping with our build containers by default.

## Projects

### How can I delete my project?
You just need to unfollow the project in the project setting page. Once the last follower has stopped following the project, CircleCI will stop building.
Please [contact us](mailto:sayhi@circleci.com) us if you want to purge the project data from our database.
