---
layout: classic-docs
title: Setting up parallelism
categories: [parallelism]
description: Setting up parallelism
order: 20
sitemap: false
---

This guide assumes you already have a green build without parallelism. If you haven't set up your project yet, check out [getting started guide]({{ site.baseurl }}/1.0/getting-started/).

Head to [your dashboard](https://circleci.com/dashboard){:rel="nofollow"} and locate the project you'd like to adjust parallelism for. Click the gear icon to the right, and you'll be treated to the settings for that project.

Now click **Adjust Parallelism** in the "Build Settings" section. Simply choose the number of parallel containers you want to use for each build.

CircleCI can automatically split your tests across multiple containers for many test runners, including RSpec, Cucumber, minitest, Django, Nose, and more. For the most popular frameworks, we support optimizing the distribution depending on how long each test takes to run; read more about this feature in our doc discussing [test metadata]({{ site.baseurl }}/1.0/test-metadata/).

Otherwise, we'll evenly divide files or test classes across containers, which usually provides a good balance. However, if our inferred parallel test commands don't work, or if you want to do custom test splitting, see our guide on [manually setting up parallelism]({{ site.baseurl }}/1.0/parallel-manual-setup/).
