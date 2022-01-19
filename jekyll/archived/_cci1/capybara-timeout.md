---
layout: classic-docs
title: "unable to obtain stable firefox connection in 60 seconds"
description: Firefox connection issues
last_updated: Feb 2, 2013
sitemap: false
---

This is an issue with the selenium-webdriver gem.
As Firefox updates to newer revisions, the interface used by selenium-webdriver can break.
Fortunately, the fix is pretty easy.

Update to a new version of the selenium-webdriver gem in your Gemfile, if
possible to the [latest version](http://rubygems.org/gems/selenium-webdriver).

## Unable to upgrade?

If you are unable to upgrade to the newest version of `selenium-webdriver` you will need to downgrade Firefox in order for the two to be compatible.

First, you will need to figure out which exact version of Firefox is compatible for you. The [CHANGELOG](https://github.com/SeleniumHQ/selenium/blob/master/rb/CHANGES) is a good start.

Essentially, you will need to replace the `firefox` command on the server to go to the old version.

This YML is a good start

```
dependencies:
  pre:
    - mkdir ../firefox-20
    - wget -O firefox-20.0.tar.bz2 'https://archive.mozilla.org/pub/firefox/releases/20.0/linux-x86_64/en-US/firefox-20.0.tar.bz2';tar xjf firefox-20.0.tar.bz2;firefox_cmd=`which firefox`;sudo rm -f $firefox_cmd;sudo ln -s `pwd`/firefox/firefox $firefox_cmd:
        pwd: ../firefox-20
```

You will need to replace the version here with your compatible version. [Browse the releases](https://archive.mozilla.org/pub/firefox/releases/) to get your URL.

