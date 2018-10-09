---
layout: classic-docs
title: Unexpected Timeouts During `cabal test`
description: What to do during unexpected time outs
sitemap: false
---

By default, CircleCI times out tests if they have not produced output for 600
seconds. `cabal test`, even with `--show-details=always`,
only produces output as each test suite completes, so it may be necessary
to
[set a higher timeout for commands that run it:](/docs/1.0/configuration/#modifiers)

```
test:
  override:
    - cabal test:
        timeout: 900
```

This is only necessary if you expect your cabal test suite to take longer than
10 minutes.
