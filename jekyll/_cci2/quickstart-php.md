---
layout: classic-docs
title: "Quickstart Guide: PHP"
short-title: "PHP"
categories: [quickstart-guides]
order: 3
---

This guide should help get you started with a PHP project on CircleCI 2.0. This walkthrough will be pretty thorough and will explain why we need each piece of configuration. If you’re just looking for a sample `config.yml` file, then just skip to the end.

If you want to follow along, fork our [example Lumen app](https://github.com/circle/cci-demo-php) and add the project through CircleCI. Once you’ve done that, create an empty `.circleci/config.yml` in your project’s root.

Enough talk, let's get started!

---

We always start with the version.

```yaml
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy (BTD) process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. In this sample config, we’ll use Apache's default DocumentRoot so its vhost can serve the PHP project.

```yaml
version: 2
jobs:
  build:
    working_directory: /var/www/html
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we’ll specify container images for this build’s pod. A pod is a group of combined containers that is treated as a single container.

We'll pull in the 7.0-apache image from the official PHP repository on Docker Hub along with MariaDB. Both images have their own `environment` settings.

```yaml
jobs:
  build:
    working_directory: /var/www/html
    pod:
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

```yaml
jobs:
  build:
    working_directory: /var/www/html
    pod:
      ...
    steps:
      - shell:
          name: Install System Packages
          command: apt-get update && apt-get -y install git unzip zlib1g-dev
```

Now we can actually check out our code, which we’ll put in the working directory we specified earlier.

```yaml
      - checkout:
          path: /var/www/html
```

Next, we're going to run a pre-installed script called `docker-php-ext-install`. This script comes from the Docker image and was designed to install PHP extensions for anything that isn't available by default.

We'll be using it to get ZIP support for Composer and PHP talking to MariaDB. Normally, we'd use the `RUN` command in a `Dockerfile`, but in this case, we have to run it manually:

```yaml
      - shell:
          name: Install PHP Extensions
          command: docker-php-ext-install pdo pdo_mysql zip
```

We're going to be using Composer to install project dependencies, so let's install that next. Forgive the verbosity, but these are the official install instructions.

```yaml
      - shell:
          name: Install Composer
          command: |
            php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
            php -r "if (hash_file('SHA384', 'composer-setup.php') === 'aa96f26c2b67226a324c27919f1eb05f21c248b987e6195cad9690d5c1ff713d53020a02ac8c217dbf90a7eacc9d141d') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
            php composer-setup.php
            php -r "unlink('composer-setup.php');"
```

Now that Composer has been installed, let's use it to install the project's dependencies, located in `composer.json`.

```yaml
      - shell:
          name: Install Project Dependencies
          command: php composer.phar install
```

Next, let's initialize required database (DB) tables and seed it with initial data.

```yaml
      - shell:
          name: Initialize Database
          command: |
            php artisan migrate:refresh
            php artisan db:seed
```

Finally, let's run our tests using PHPUnit.

```yaml
      - shell:
          name: Run Tests
          command: vendor/bin/phpunit
```

And we're done! Let's see what the whole `circle.yml` looks like now:

```yaml
version: 2
jobs:
  build:
    working_directory: /var/www/html
    pod:
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
    steps:
      - shell:
          name: Install System Packages
          command: apt-get update && apt-get -y install git unzip zlib1g-dev
      - shell:
          name: Install PHP Extensions
          command: docker-php-ext-install pdo pdo_mysql zip
      - shell:
          name: Install Composer
          command: |
            php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
            php -r "if (hash_file('SHA384', 'composer-setup.php') === 'aa96f26c2b67226a324c27919f1eb05f21c248b987e6195cad9690d5c1ff713d53020a02ac8c217dbf90a7eacc9d141d') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
            php composer-setup.php
            php -r "unlink('composer-setup.php');"
      - shell:
          name: Install Project Dependencies
          command: php composer.phar install
      - shell:
          name: Initialize Database
          command: |
            php artisan migrate:refresh
            php artisan db:seed
      - shell:
          name: Run Tests
          command: vendor/bin/phpunit
```

Nice! You just set up CircleCI for a Lumen app. Check out our project’s corresponding build on CircleCI [here](https://circleci.com/gh/circleci/cci-demo-php).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
