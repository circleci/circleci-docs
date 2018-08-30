---
layout: classic-docs
title: Skip code which should not run on your CI server
categories: [configuration-tasks]
description: Skip code which should not run on your CI server
last_updated: Feb 2, 2013
order: 60
sitemap: false
---

If there is code that should not be run on your CI server, you can wrap it in a conditional statement in your code base.
CircleCI has set the `CI` environment variable, which can be used from within your application.

```
if !ENV['CI']
  Debugger.initialize!
end
```
