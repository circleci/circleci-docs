---

title: Getting started with CircleCI
layout: doc
tags:
  - getting-started

---

Setting up CircleCI usually takes only three mouse clicks:

1.  Sign up with CircleCI.
2.  Give CircleCI permission to access GitHub on your behalf.
3.  Click on a project.

It really is that easy for about 90 percent of our users.

The reason it's so easy is that we automatically infer your settings from your code.
We expect you to have a project that roughly follows best practices for your platform.
If you do, your tests will be up and running in a flash.
Add
your [first project](/) now!

(**Related: &nbsp;**[What happens when you add a project?](/docs/what-happens))

### When the magic doesn't work?

Of course, life is not always sunshine and daisies.
Sometimes your tests will fail, CircleCI won't infer your custom setup, or our inference won't be aware of your test suite.
Here are some common issues and where you can find their fixes.

*   If we didn't run an important step or omitted some tests,
    [add a `circle.yml` file](/docs/configuration)
    to tweak your test run.
*   If we didn't infer anything, you can [set up your project manually](/docs/manually).
*   Sometimes, your tests will fail on our server even though they work locally.
    Read our list of [common problems](/docs/troubleshooting) and their solutions.

## What next?

### Add your colleagues

Testing is no fun if you're the only one playing.
To add your colleagues, simply ask them to join CircleCI.
We use GitHub permissions for all projects, so if they have access to your project on GitHub, they'll have access on CircleCI, too.

One of the best things about CircleCI's design is that you have your own account, which in turn enables CircleCI to send you personalized emails only for the branches you use.

### Add more projects

No matter if you commit to a project only once a month or if a project is just getting started, adding it to CircleCI will help keep it on track.
Add projects from the
[dashboard](/).
