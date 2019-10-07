---
layout: classic-docs
title: "Migration"
short-title: "Migration"
description: "CircleCI 2.0 Migration Introduction"
categories: [migration]
order: 1
---

Our migration guides cover two main areas:

* Migrating to CircleCI from other CI/CD providers.
  * [Migrating from Travis CI]({{ site.baseurl }}/2.0/migrating-from-travis/)
  * [Migrating from Jenkins]({{ site.baseurl }}/2.0/migrating-from-jenkins/)
  * [Migrating from GitLab]({{ site.baseurl }}/2.0/migrating-from-gitlab/)
* Migrating your projects from our 1.0 architecture to CircleCI 2.0



If you're here to learn about migrating from CircleCI 1.0 to 2.0, get started by reviewing tips and tricks for migrating to 2.0, learning about the config-translator, and getting specific tutorials for your platform.

<hr>

Config Intro | Scripts
------------------------|------------------
Get an introduction to [CircleCI 2.0 Config]({{ site.baseurl }}/2.0/config-intro/) `.circleci/config.yml`. |  Get the [script to find projects still using 1.0](https://github.com/CircleCI-Public/find-circle-yml) or to [generate a 2.0 config from your project](https://github.com/CircleCI-Public/circleci-config-generator).
|   
**Tips for Migrating**       | **Config Translation**
Get the list of [tips and tricks]({{ site.baseurl }}/2.0/migration/) for migrating from CircleCI 1.0 to 2.0 and check out the [FAQ]({{ site.baseurl }}/2.0/faq/).  |   Use the [config-translation]({{ site.baseurl }}/2.0/config-translation/) endpoint to get started with migrating to 2.0.
| 
**iOS Migration** | **Linux Migration**
Get an introduction to [migrating your iOS project]({{ site.baseurl }}/2.0/ios-migrating-from-1-2/) `circle.yml` to `.circleci/config.yml` for applications that build on macOS. |  Get the basics of [migrating your Linux application]({{ site.baseurl }}/2.0/migrating-from-1-2/) `circle.yml` to `.circleci/config.yml`.

<hr>

![CircleCI about image]( {{ site.baseurl }}/assets/img/docs/migrate.png)

