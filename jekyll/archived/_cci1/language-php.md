---
layout: classic-docs
title: Continuous Integration and Continuous Deployment with PHP
short-title: PHP
categories: [languages]
description: Continuous Integration and Continuous Deployment with PHP
sitemap: false
---

CircleCI works seamlessly with all the tools and package managers that 
help PHP developers test and deploy their code. We can generally infer
most of your dependencies and test commands, but we also provide custom
configuration via a `circle.yml` file checked into your repo's root directory. 
The examples here referring to PHP filepaths are for the Ubuntu 14.04 and newer 
images. This image is not default but can be chosen in Project Settings -> 
Build Environment. For Ubuntu 12.04, replace `/opt/circleci/php` with 
`~/.phpenv/versions` in the examples.

## Version

We have many versions of PHP pre-installed on [Ubuntu 12.04]( {{ site.baseurl }}/1.0/build-image-precise/#php) and [Ubuntu 14.04]( {{ site.baseurl }}/1.0/build-image-trusty/#php) build images.

If you don't want to use the default, you can specify your version in `circle.yml`:

```
machine:
  php:
    version: 7.0.4
```

## Dependencies

CircleCI has the composer, pear, and pecl package managers installed.
If we find a composer.json file, then we'll automatically run `composer install`.

To install your dependencies with either `pear` or `pecl`,
you have to include [dependency commands]( {{ site.baseurl }}/1.0/configuration/#dependencies)
in your `circle.yml` file.
The following example shows how to install the MongoDB extension using `pecl`.

```
dependencies:
  pre:
    - pecl install mongo
```

You can also edit your PHP configuration from your `circle.yml`. For example, if you have a custom configuration file checked in to your repo, then you could do:

```
dependencies:
  pre:
    - cp config/custom.ini /opt/circleci/php/$(phpenv global)/etc/conf.d/
```

<span class='label label-info'>Note:</span>
`phpenv global` returns the PHP version that has been
specified in your `circle.yml` file.

Here's another example showing how you could adjust PHP settings in
a `.ini` file.

```
dependencies:
  pre:
    - echo "memory_limit = 64M" > /opt/circleci/php/$(phpenv global)/etc/conf.d/memory.ini
```

<span class='label label-info'>Note:</span>
you'll have to specify your PHP version in your `circle.yml` in order to edit PHP's configuration files.

### Databases

We have pre-installed more than a dozen databases and queues,
including PostgreSQL and MySQL. If needed, you have the option of
[manually setting up your test database]( {{ site.baseurl }}/1.0/manually/#dependencies).

## Using the Apache Webserver {#php-apache}

Apache2 is already installed on CircleCI containers but it needs to be
configured to host your PHP application.

To enable your site check a file containing your site configuration into your
repository and copy it to `/etc/apache2/sites-available/` during
your build.
Then enable the site with `a2ensite` and restart Apache.

An example configuration that uses PHP5 and sets up Apache to serve the PHP site from
`/home/ubuntu/MY-PROJECT/server-root` is:

```
Listen 8080

<VirtualHost *:8080>
  LoadModule php5_module /opt/circleci/php/PHP_VERSION/usr/lib/apache2/modules/libphp5.so 

  DocumentRoot /home/ubuntu/MY-PROJECT/server-root
  ServerName host.example.com
  <FilesMatch \.php$>
    SetHandler application/x-httpd-php
  </FilesMatch>
  
  # Other directives here
</VirtualHost>
```

Replace `MY-SITE` in with the name of your site configuration
file and `PHP_VERSION` with the version of PHP you configured
in your `circle.yml`.

Note: This is not supported for PHP7.

Then enable your site and restart Apache by adding the following to your `circle.yml`

```
dependencies:
  post:
    - sudo cp ~/MY-PROJECT/MY-SITE /etc/apache2/sites-available
    - sudo a2ensite MY-SITE
    - sudo service apache2 restart
```

## Testing

CircleCI always runs your tests on a fresh machine. If we find a `phpunit.xml` file in your repo, then we'll run `phpunit` for you. You can add custom test commands to the test section of your `circle.yml`:

```
test:
  override:
    - ./my_testing_script.sh
```

If you want CircleCI to show a test summary of your build see
[Metadata collection in custom test steps for PHPUnit]( {{ site.baseurl }}/1.0/test-metadata/#phpunit).

## Disable Xdebug {#xdebug}

Xdebug is installed for all versions of PHP, and is enabled by default on our 14.04 build image.

During the dependencies stage of PHP builds our inference runs `composer install` if required. In the build output you may see:

```
You are running composer with xdebug enabled. This has a major impact on runtime performance.
```

Since this is a CI environment and many of your dependencies will be cached, the performance hit is not major and you can safely ignore the warning.

If you would like to completely disable Xdebug on 14.04 you can add the following to your `circle.yml` file:

```
dependencies:
  pre:
    - rm /opt/circleci/php/$(phpenv global)/etc/conf.d/xdebug.ini
```

## Deployment

CircleCI offers first-class support for [deployment]( {{ site.baseurl }}/1.0/configuration/#deployment).
When a build is green, CircleCI will deploy your project as directed
in your `circle.yml` file. We can deploy to PaaS providers as well as to
physical servers under your control.

## Troubleshooting for PHP

If you run into problems, check out our [PHP troubleshooting]( {{ site.baseurl }}/1.0/troubleshooting-php/)
write-ups about these issues:

*   [Adding memcached with pecl on CircleCI]( {{ site.baseurl }}/1.0/php-memcached-compile-error/)
*   [Composer hitting GitHub API rate limits]( {{ site.baseurl }}/1.0/composer-api-rate-limit/)

