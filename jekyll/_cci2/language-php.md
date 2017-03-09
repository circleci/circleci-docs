---
layout: classic-docs
title: "Language Guide: PHP"
short-title: "PHP"
categories: [language-guides]
order: 5
---

## Overview

This guide will help you get started with a PHP project on CircleCI. If you’re in a rush, just copy the sample configuration below into `.circleci/config.yml` in your project’s root directory and start building.

Otherwise, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

## Sample Configuration

```YAML
version: 2
jobs:
  build:
    docker:
      - image: php:7.0-apache
        environment:
          APP_ENV: local
          APP_DEBUG: true
          APP_KEY: kjcndjjksddwdwdw
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: testdb
          DB_USERNAME: root
          DB_PASSWORD: password
          CACHE_DRIVER: memcached
          QUEUE_DRIVER: sync
      - image: mariadb:5.5
        environment:
          MYSQL_DATABASE: testdb
          MYSQL_ROOT_PASSWORD: password
    working_directory: /var/www/html
    steps:
      - run:
          name: Install System Packages
          command: apt-get update && apt-get -y install git unzip zlib1g-dev
      - checkout
      - run:
          name: Install PHP Extensions
          command: docker-php-ext-install pdo pdo_mysql zip
      - run:
          name: Install Composer
          command: |
            php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
            php -r "if (hash_file('SHA384', 'composer-setup.php') === 'aa96f26c2b67226a324c27919f1eb05f21c248b987e6195cad9690d5c1ff713d53020a02ac8c217dbf90a7eacc9d141d') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
            php composer-setup.php
            php -r "unlink('composer-setup.php');"
      - run:
          name: Install Project Dependencies
          command: php composer.phar install
      - run:
          name: Initialize Database
          command: |
            php artisan migrate:refresh
            php artisan db:seed
      - run:
          name: Run Tests
          command: vendor/bin/phpunit
```

## Get the Code

The configuration above is from a demo Go app, which you can access at [https://github.com/circleci/cci-demo-lumen](https://github.com/circleci/cci-demo-lumen).

Fork the project and download it to your machine. Then, [add the project]({{ site.baseurl }}/2.0/first-steps/#adding-projects) through CircleCI. Finally, delete everything in `.circleci/config.yml`.

Now we’re ready to build a `config.yml` from scratch.

---

## Config Walkthrough

We always start with the version.

```YAML
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy (BTD) process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. In this sample config, we’ll use Apache's default DocumentRoot so its vhost can serve the PHP project.

```YAML
...
jobs:
  build:
    working_directory: /var/www/html
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we’ll specify container images for this build in `docker`.

We'll pull in the 7.0-apache image from the official PHP repository on Docker Hub along with MariaDB. Both images have their own `environment` settings.

```YAML
...
    docker:
      - image: php:7.0-apache
        environment:
          APP_ENV: local
          APP_DEBUG: true
          APP_KEY: kjcndjjksddwdwdw
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: testdb
          DB_USERNAME: root
          DB_PASSWORD: password
          CACHE_DRIVER: memcached
          QUEUE_DRIVER: sync
      - image: mariadb:5.5
        environment:
          MYSQL_DATABASE: testdb
          MYSQL_ROOT_PASSWORD: password
```

That’s a lot of environment variables! Let's explain a few:

`DB_HOST: 127.0.0.1`

If we specified the hostname `localhost` here, PHP would assume that we wanted to use a local socket file along with MySQL/MariaDB. But that wouldn't work because the DB isn't running in the same container as PHP, so we use TCP/IP instead.

`MYSQL_DATABASE: testdb`

If the Docker image sees this, it will create it and start up MariaDB; otherwise, the DB wouldn't even be started.

`MYSQL_ROOT_PASSWORD: password`

This sets a (horrible) root password so we can access the DB.

Next, we'll add `steps` to the job. Normally, we’d check out our project's code first, but the Docker image we chose doesn’t include Git. Since we need to install Git anyway, we'll also install other system/distribution packages that we'll need.

```YAML
...
    steps:
      - run:
          name: Install System Packages
          command: apt-get update && apt-get -y install git unzip zlib1g-dev
```

Now we can actually check out our code, which will go in the working directory we specified earlier.

```YAML
...
      - checkout
```

Next, we're going to run a pre-installed script called `docker-php-ext-install`. This script comes from the Docker image and was designed to install PHP extensions for anything that isn't available by default.

We'll be using it to get ZIP support for Composer and PHP talking to MariaDB. Normally, we'd use the `RUN` command in a `Dockerfile`, but in this case, we have to run it manually:

```YAML
...
      - run:
          name: Install PHP Extensions
          command: docker-php-ext-install pdo pdo_mysql zip
```

We're going to be using Composer to install project dependencies, so let's install that next. Forgive the verbosity, but these are the official install instructions.

```YAML
...
      - run:
          name: Install Composer
          command: |
            php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
            php -r "if (hash_file('SHA384', 'composer-setup.php') === 'aa96f26c2b67226a324c27919f1eb05f21c248b987e6195cad9690d5c1ff713d53020a02ac8c217dbf90a7eacc9d141d') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
            php composer-setup.php
            php -r "unlink('composer-setup.php');"
```

Now that Composer has been installed, let's use it to install the project's dependencies, located in `composer.json`.

```YAML
...
      - run:
          name: Install Project Dependencies
          command: php composer.phar install
```

Next, let's initialize required database (DB) tables and seed it with initial data.

```YAML
...
      - run:
          name: Initialize Database
          command: |
            php artisan migrate:refresh
            php artisan db:seed
```

Finally, let's run our tests using PHPUnit.

```YAML
...
      - run:
          name: Run Tests
          command: vendor/bin/phpunit
```

Nice! You just set up CircleCI for a Lumen app. Check out our [project’s build page](https://circleci.com/gh/circleci/cci-demo-lumen).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
