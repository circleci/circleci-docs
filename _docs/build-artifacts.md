---
layout: classic-docs
title: Build artifacts
categories: [reference]
last_updated: August 1, 2014
---

If your build produces persistent artifacts such as screenshots, coverage reports, or
deployment tarballs, we can automatically save and link them for you.

Before each build, we create an empty directory and export its path in the
read-only `$CIRCLE_ARTIFACTS`
[environment variable](/docs/environment-variables).

If you prefer, you can also
[configure directories and files whose contents will](/docs/configuration#artifacts)
be saved.

After the build finishes, everything in these directories is saved and linked to the build.

![]({{ site.baseurl }}/assets/img/docs/artifacts.png)

You'll find links to the artifacts at the top of the build page. You can also consume them via our [API](/docs/api#build-artifacts).

That's all there is to it!

Feel free to [contact us](mailto:sayhi@circleci.com)
if you have any questions or feedback!
