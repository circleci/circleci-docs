---
layout: classic-docs
title: Can I test projects with unusual requirements?
categories: [getting-started]
description: How to test projects with unusual requirements?
last_updated: April 29, 2013
---

CircleCI is completely configurable.
We have a simple setup for projects that follow established conventions, but we also support many variations on the theme.

*   You can [ run tests from a subdirectory of your repository]({{ site.baseurl }}/configuration/#example-running-phpunit-on-a-special-directory).
*   You can [override every single phase of your tests]({{ site.baseurl }}/configuration/)
    with custom settings or minor tweaks.
*   Though you'll rarely need it, you can tweak your code to
    [avoid certain behaviours]({{ site.baseurl }}/dont-run/) during your CI builds.
