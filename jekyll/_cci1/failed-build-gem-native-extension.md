---
layout: classic-docs
title: Failed to build gem native extension
description: Gem::Ext::BuildError Failed to build gem native extension
last_updated: May 6, 2017
sitemap: false
---

When your build is running during the `bundle install` step, you might see an error like this:

```
Gem::Ext::BuildError: ERROR: Failed to build gem native extension.

current directory:
/home/ubuntu/<your-project-name>/vendor/bundle/ruby/2.3.0/gems/unf_ext-0.0.7.2/ext/unf_ext
/opt/circleci/ruby/ruby-2.3.1/bin/ruby -r ./siteconf<some-long-id>.rb
extconf.rb
```

This often happens because the native extension gems from your bundle which were restored from cache were corrupted and need to be recompiled.

In order to resolve this, you can issue a "Rebuild without cache" and that should get you building again. Note that this option only cleans the cache for that particular build, and you will have to issue this for all affected branches. Please see our documentation on how cache works, and [clearing caches](https://circleci.com/docs/1.0/how-cache-works/#clearing-cache).

Please don't hesitate to give our [support team](https://support.circleci.com/hc/en-us) a shout should you have any difficulties!
