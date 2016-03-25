---
layout: classic-docs
title: CircleCI does not recognize the Ruby version
description: Why does CircleCI not recognize the Ruby version
last_updated: Feb 3, 2013
---

We infer your Ruby version from your `.rvmrc` file, `.ruby-version` file, or Gemfile.
You can also specify it in your [circle.yml](/docs/configuration/#ruby-version)
file.
If you don't do any of the above, we'll use Ruby `{{ versions.default_ruby }}`
or `{{ versions.old_ruby }}`, whichever we think is best.
You can[control the version](/docs/configuration/#ruby-version)
if we got it wrong.
