---
layout: classic-docs
title: Git errors during pip install
description: Git errors during pip install
last_updated: Feb 3, 2013
sitemap: false
---

When your tests run, during the `pip install` step, you might see something like this:

```
Obtaining somerepo from git+ssh://git@github.com/someorg/somerepo.git#egg=somerepo (from -r requirements.txt (line 23))
Cloning ssh://git@github.com/someorg/somerepo.git to ./venv/src/somerepo
Complete output from command /usr/bin/git clone -q ssh://git@github.com/someorg/somerepo.git /home/ubuntu/someorg/venv/src/somerepo:

----------------------------------------
Command /usr/bin/git clone -q ssh://git@github.com/someorg/somerepo.git /home/ubuntu/somerepo/venv/src/somerepo failed with error code 128 in None
Storing complete log in /home/ubuntu/.pip/pip.log
ERROR: Repository not found.
fatal: The remote end hung up unexpectedly
```

This happens because you have a git repository listed as a dependency in your requirement.txt file:

```
git+git://github.com/someorg/somerepo.git
```

If the repository is public, just change the dependency to use a `http` url:

```
git+http://github.com/someorg/somerepo.git
```

If the repository is private, you will need to enable user keys
from your project's **Project settings > Checkout SSH keys**
page.
