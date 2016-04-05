---
layout: classic-docs
title: Adding memcached with pecl on CircleCI
description: Adding memcached with pecl on CircleCI
last_updated: May 23, 2013
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
