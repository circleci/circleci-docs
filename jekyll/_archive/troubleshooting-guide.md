---
layout: classic-docs
title: Troubleshooting guide
short-title: Troubleshooting guide
categories: [troubleshooting]
description: Troubleshooting guide
sitemap: false
---

### The build passes locally but fails on CircleCI

There are multiple potential causes for this behavior. Here is a
compilation of the ones we see most frequently:

- Different language version. Make sure that you are using the same
  version of the language on CircleCI and locally. Check out
  [this documentation
  page]( {{ site.baseurl }}/1.0/configuration/#ruby-version) for more
  details.
- Different versions of packages you rely on. Try explicitly specifying
  the versions for the packages you are using in your build in your
  `circle.yml`. See [the doc on installing custom
  software]( {{ site.baseurl }}/1.0/installing-custom-software/) for more
  information on how to accomplish that.
- Timezones. Some testing frameworks may have not timezone-aware
  modules, which in combination with unset machine timezone can deliver
  unexpected test failures. You can find an example for setting the
  timezone for your machine [in this doc
  section]( {{ site.baseurl }}/1.0/configuration/#machine).
- File ordering. Some filesystems maintain an ordered file structure for
  every directory, which means that all the files are read in a
  consistent order every time. The filesystem in our build containers is
  _not_ one of those. Therefore, if your tests rely on a certain autoload order,
  they may fail on CircleCI and pass locally. See [this documentation
  page]( {{ site.baseurl }}/1.0/file-ordering/) for more details.
- Out Of Memory errors. If a process in your build container uses too
  much memory, it can be killed by Linux’s OOM
  killer. Check out [this document]( {{ site.baseurl }}/1.0/oom/) to
  see how to deal with such errors.
- Dependencies. Applications like Elasticsearch and PostgreSQL
  can take more time to spin up on CircleCI than they do on your local
  machine, so if you see test failures indicating that a similar
  application is not available, this might be the reason. Adding a script
  that actively waits for a database to get online might be a good idea.
- Third parties. Your tests may assume that third-party services you are
  using are always up and running, which may not be the case. If you
  suspect this, it might be a good idea to check the status pages of the
  services you rely on.

### If none of these is the reason
You can SSH into your build container to debug interactively
while the build is still running. Consult [this guide on using SSH
access]( {{ site.baseurl }}/1.0/ssh-build/) to learn more.

Please feel free to suggest additional points for this list by [emailing
us](https://support.circleci.com/hc/en-us).
