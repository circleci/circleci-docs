---

title: Skip code which should not run on your CI server
layout: doc
tags:
  - how-to

---

If there is code that should not be run on your CI server, you can wrap it in a conditional statement in your code base.
CircleCI has set the `CI` environment variable, which can be used from within your application.

```
if !ENV['CI']
  Debugger.initialize!
end
```
