---
layout: classic-docs
title: Does parallelism really work?
categories: [parallelism]
description: A look at parallelism
last_updated: Feb 2, 2013
---

If you've ever tried a parallel testing solution, you've probably had a bad experience.
Most attempt to run multiple tests within the same language runtime, or within multiple processes on the same system.

CircleCI doesn't do that.
We split your tests up and run them on completely different machines, which share no memory, processes or databases.
This fixes the vast majority of the problems that people experience with parallel testing.

Parallelism works if tests do not share any state.
Occasionally tests share state by accident, for example through
[file-ordering bugs](/docs/1.0/file-ordering/)
or by using the same remote 3rd-party APIs.
Fortunately, both problems are relatively easy to solve.
