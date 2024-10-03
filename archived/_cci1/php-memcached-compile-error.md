---
layout: classic-docs
title: Adding memcached with pecl on CircleCI
description: Adding memcached with pecl on CircleCI
last_updated: May 23, 2013
sitemap: false
---

CircleCI is built on Ubuntu 12.04, and PHP's memcached module clashes with this. If you try to run

```
pecl install memcached-stable
```

you may come across this error:

```
In file included from /tmp/pear/temp/memcached/php_memcached.h:22:0,
                 from /tmp/pear/temp/memcached/php_memcached.c:47:
/tmp/pear/temp/memcached/php_libmemcached_compat.h:5:40: fatal error: libmemcached-1.0/memcached.h: No such file or directory
compilation terminated.
make: *** [php_memcached.lo] Error 1
ERROR: `make' failed
```

The solution is to install an older version of memcached:

```
- sudo DEBIAN_FRONTEND=noninteractive apt-get install -y libmemcached10
- yes | pecl install -f memcached-2.1.0
```

See
[https://github.com/php-memcached-dev/php-memcached/issues/33](https://github.com/php-memcached-dev/php-memcached/issues/33)
for more details.

For Ubuntu 14.04 (Trusty), PHP's memcached module can be installed also using the older version of memcached:
```
machine:
  php:
    # php version is specified to make it possible to change php settings
    # see below php.ini is updated
    version: 5.6.17
dependencies:
  pre:
    # load memcached module
    - sudo apt-get update
    - sudo apt-get install libmemcached-dev
    - printf "\n" | pecl install -f memcached-2.1.0
    - echo "extension = memcached.so" >> /opt/circleci/php/$(phpenv global)/etc/php.ini
```

Installing the latest (for the moment) memcached-2.2.0 fails with error:
```
checking sasl/sasl.h usability... yes
checking sasl/sasl.h presence... yes
checking for sasl/sasl.h... yes
checking whether libmemcached supports sasl... no
configure: error: no, libmemcached sasl support is not enabled. Run configure with --disable-memcached-sasl to disable this check
ERROR: `/tmp/pear/temp/memcached/configure --with-php-config=/opt/circleci/php/5.6.17/bin/php-config --with-libmemcached-dir=no' failed
```
The reason is Ubuntu 14.04 provides libmemcached without supporting SASL, see [https://bugs.launchpad.net/ubuntu/+source/libmemcached/+bug/1389839](https://bugs.launchpad.net/ubuntu/+source/libmemcached/+bug/1389839).
It can be bypassed disabling SASL, so the "pecl install" line is changed to:
```
    - printf "no --disable-memcached-sasl\n" | pecl install memcached
```
