---
layout: classic-docs
title: CircleCI does not recognize the Ruby version
description: Why does CircleCI not recognize the Ruby version
sitemap: false
---

We infer your Ruby version from your `.rvmrc` file, `.ruby-version` file, or Gemfile.
You can also specify it in your [circle.yml](/docs/1.0/configuration/#ruby-version)
file.
If you don't do any of the above, we'll use Ruby `{{ site.data.precise.versions.default_ruby }}`
or `{{ site.data.precise.versions.old_ruby }}`, whichever we think is best.
You can [control the version](/docs/1.0/configuration/#ruby-version)
if we got it wrong.
