---
layout: classic-docs
title: Unexpected Timeouts During `cabal test`
description: What to do during unexpected time outs
---

By default, Circle times out tests if they have not produced output for 180
seconds. `cabal test`, even with `--show-details=always`,
only produces output as each test suite completes, so it may be necessary
to
[set a higher timeout for commands that run it:](/docs/configuration/#modifiers)

```
test:
  override:
    - cabal test:
        timeout: 300
```

Note that inferred `cabal test` commands are already set to time
out only after 10 minutes without output, so this is only necessary if
you override the inferred commands, run `cabal test` elsewhere,
or have a particular cabal test suite that you expect to take longer than
10 minutes.
