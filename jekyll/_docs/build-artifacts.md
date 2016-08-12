---
layout: classic-docs
title: Build artifacts
categories: [reference]
description: Dealing with build artifacts
---

If your build produces persistent artifacts such as screenshots, coverage reports, or
deployment tarballs, we can automatically save and link them for you.

Before each build, we create an empty directory and export its path in the
read-only `$CIRCLE_ARTIFACTS`
[environment variable]({{site.baseurl}}/environment-variables/).

If you prefer, you can also
[configure directories and files whose contents will]({{site.baseurl}}/configuration/#artifacts)
be saved.

After the build finishes, everything in these directories is saved and linked to the build.

![]({{ site.baseurl }}/assets/img/docs/artifacts.png)

You'll find links to the artifacts at the top of the build page. You can also consume them via our [API]({{ site.baseurl }}/api/#build-artifacts).

You can also access your artifacts in your browser with the following url:

```
https://circleci.com/api/v1/project/:org/:repo/:build_num/artifacts/:container-index/path/to/artifact
```

You can also use `latest` in place of `:build_num` together with query parameters `branch` and `filter` to access the artifact from the latest build on a branch. `filter` can have a value of `completed`, `successful`, or `failed` and defaults to `completed`.

For example:

```
https://circleci.com/api/v1/project/circleci/mongofinil/63/artifacts/0/$CIRCLE_ARTIFACTS/hello.txt
```

That's all there is to it!

Feel free to [contact us](mailto:support@circleci.com)
if you have any questions or feedback!
