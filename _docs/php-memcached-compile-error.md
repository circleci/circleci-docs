---

title: Adding memcached with pecl on CircleCI
layout: doc
tags:
  - troubleshooting
  - php

---

CircleCI is built on Ubuntu 12.04, and PHP's memcached module clashes with this. If you try to run

<pre>
pecl install memcached-stable
</pre>

you may come across this error:

<pre>
In file included from /tmp/pear/temp/memcached/php_memcached.h:22:0,
                 from /tmp/pear/temp/memcached/php_memcached.c:47:
/tmp/pear/temp/memcached/php_libmemcached_compat.h:5:40: fatal error: libmemcached-1.0/memcached.h: No such file or directory
compilation terminated.
make: *** [php_memcached.lo] Error 1
ERROR: `make' failed
</pre>

The solution is to install an older version of memcached:

<pre>
pecl install -f memcached-2.0.1
</pre>

See
[https://github.com/php-memcached-dev/php-memcached/issues/33](https://github.com/php-memcached-dev/php-memcached/issues/33)
for more details.
