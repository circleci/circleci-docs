---

title: Use resources which are not in your repository
layout: doc
tags:
  - how-to

---

There are a number of techniques to do this:

*   CircleCI supports `git submodule`, and has advanced SSH key management to let you access multiple repositories from a single test suite.
    From your project's **Project Settings > Checkout SSH keys**
    page, you can add a "user key" with one-click, allowing you access code from multiple repositories in your test suite.
    Git submodules can be easily set up in your `circle.yml` file (see [example 1](/docs/configuration#checkout)).
*   CircleCI's VMs are connected to the internet. You can download dependencies directly while setting up your project, using
    `curl` or `wget`.
