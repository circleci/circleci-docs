---
layout: classic-docs
title: Getting Started with CircleCI 1.0
categories: [getting-started]
description: Getting Started with CircleCI
order: 20
sitemap: false
---

Setting up CircleCI usually takes only three mouse clicks:

1.  [Sign up with CircleCI](https://circleci.com/signup/)
2.  Give CircleCI permission to access GitHub or Bitbucket on your behalf
3.  Click on a project

It really is that easy for about 90 percent of our users.

The reason it's so easy is that we automatically infer your settings from your code.
We expect you to have a project that roughly follows best practices for your platform.
If you do, your tests will be up and running in a flash.
Add
your [first project](https://circleci.com/dashboard){:rel="nofollow"} now!

### When the magic doesn't work?

Of course, life is not always sunshine and daisies.
Sometimes your tests will fail, CircleCI won't infer your custom setup, or our inference won't be aware of your test suite.
Here are some common issues and where you can find their fixes.

*   If we didn't run an important step or omitted some tests,
    [add a `circle.yml` file]( {{ site.baseurl }}/1.0/configuration/)
    to tweak your test run.
*   If we didn't infer anything, you can [set up your project manually]( {{ site.baseurl }}/1.0/manually/).
*   Sometimes, your tests will fail on our server even though they work locally.
    Read our list of [common problems]( {{ site.baseurl }}/1.0/troubleshooting/) and their solutions.

## What next?

### Add your colleagues

Testing is no fun if you're the only one playing.
To add your colleagues, simply ask them to join CircleCI.
We use GitHub or Bitbucket permissions for all projects, so if they have access to your project on GitHub or Bitbucket, they'll have access on CircleCI, too.

One of the best things about CircleCI's design is that you have your own account, which in turn enables CircleCI to send you personalized emails only for the branches you use.

### Add and follow more projects

No matter if you commit to a project only once a month or if a project is just getting started, adding it to CircleCI will help keep it on track. 

Adding a project refers to the first time the project is setup on CircleCI.
(**Related: &nbsp;**[What happens when you add a project?]( {{ site.baseurl }}/1.0/what-happens/))
Add projects by clicking the Add Projects button on the Project page in the CircleCI app.

Following a project subscribes you to email notifications and adds the project into your dashboard's project/branch picker. CircleCI users that push to a new project get automatically followed to the project. You can control which projects you follow (including following projects that you do not push to!) from the Projects > Add projects page.


### I can't find my project to add

If you're not seeing a project you'd like to build and it's not currently building on CircleCI, you should check your org in the top left corner of the CircleCI UI.  For instance, if the top left shows your user `myUser`, only Github projects belonging to `myUser` will be available under `Add Projects`.  If you want to build the Github project `myOrg/orgProject`, you would have to change your org on the UI to `myOrg`.
