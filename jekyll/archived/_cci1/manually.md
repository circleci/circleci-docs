---
layout: classic-docs
title: Overview
categories: [configuration-tasks]
description: Overview of manual build setup
order: 1
sitemap: false
---

CircleCI is designed to set up most tests automatically because we infer your settings from your code.
However, if you have an unusual setup or work in a framework that has no idiomatic way to set up your project, you'll need to set it up manually.

* Contents
{:toc}

Fortunately, this is a pretty straightforward procedure.
If you follow this guide, you should be running your tests in 20 minutes or less.

<h2 id="standard">Standard projects not inferred</h2>

Before we get into the details of a manual setup, here is a quick fix to a common problem first-timers can experience.
If you have a standard project and received a "no test" status, it is probably because the project is in a subdirectory.
This is easy to fix: add a file named `circle.yml` on the project repo pointing to build directory and
CircleCI will run your tests from that subdirectory.  For example, to set the build directory to `api`
sub-directory, you can use the following `circle.yml`

```
general:
  build_dir: api
```

<h2 id="yml">The circle.yml file</h2>

From here, we'll assume that you're manually setting up your tests.

The first thing to do is to add an empty `circle.yml` file to the root
directory of your repository. We recommend adding this upfront on a branch to
keep you and your colleagues on the same page.

We have provided a
[full reference for the `circle.yml` file]( {{ site.baseurl }}/1.0/configuration/)
but you won't need that for now&mdash;
we'll guide you through a simple setup and you can check out the comprehensive docs later.

<h2 id="build-overview">The anatomy of a CircleCI build</h2>

For testing purposes, most applications and libraries require five to six standard phases that are run sequentially:

*   Configure the test machine
*   Check out your code
*   Set up your test dependencies
*   Set up your test databases
*   Run your tests
*   (Optionally) [deploy your code]({{ site.baseurl }}/1.0/configuration/#deployment)

Each phase consists of a list of bash commands.
Normally, these commands are inferred by CircleCI, but if you are reading this, you will likely be manually adding some commands to the
`circle.yml` file.
You can modify which&mdash;and in what order&mdash;commands are run by adding `override`,
`pre`, and/or `post` when needed.
Take a look at the aforementioned [reference guide]( {{ site.baseurl }}/1.0/configuration/)
should you want to learn more details.

Failing commands (those with a non-zero exit code) will cause the whole build to fail, and you'll receive a notification.

<h2 id="machine">Configuring your test machine</h2>

For the most part, there is nothing that you have to add to configure the test machine.
We have already installed the most common libraries, languages, browsers, and databases that you'll need.
See [Ubuntu 12.04]( {{ site.baseurl }}/1.0/build-image-precise/) and [Ubuntu 14.04]( {{ site.baseurl }}/1.0/build-image-trusty/) build image pages for a comprehensive list of what we have installed.

The [machine section]( {{ site.baseurl }}/1.0/configuration/#machine)
of the `circle.yml` file is the place where you can tweak common settings, such as timezone, language version used, and
`/etc/hosts` contents.

<h2 id="checkout">Checking out code</h2>

CircleCI will check out your code from your GitHub repository.
Currently, we don't check out submodules.
If your project requires that, add the appropriate commands.

```
checkout:
  post:
    - git submodule sync
    - git submodule update --init
```

If you have any files in your repositories that need to be moved, now is a good time.
Here is an example of how to do that.

```
checkout:
  post:
    - cp ./ci-server/config.yml ./app-server/config.yml
```

<h2 id="dependencies">Setting up your dependencies</h2>

In all likelihood, you'll have a list of libraries and dependencies that your app requires.
CircleCI automatically detects Ruby's Gemfile, Python's requirements.txt, Clojure's project.clj, and Node's package.json, and then runs the appropriate commands to install the dependencies.
CircleCI also supports PHP's Composer.
When needed, you can modify which dependencies-related commands are run using `override`,
`pre`, and/or `post` here.

```
dependencies:
  post:
    - python ./install-packages
```

<h2 id="databases">Setting up your test databases</h2>

At this point, you'll want to create your database, load it with your schema, and (possibly) preload it with data.
If you use MySQL or Postgres, you can use the `circle_test`
database and the `ubuntu` user rather than creating the database yourself.
No password is required for any database.

```
database:
  override:
    - mysql -u ubuntu circle_test < my-database-setup.sql
```

<h2 id="tests">Running your tests</h2>

Now that everything is prepared, add your test commands to the
`circle.yml` file so that you can run your tests.

```
test:
  override:
    - php ./test-suite/run.php --unit-tests
```

Depending on the structure of your tests, you may need to start your application server first.

```
test:
  override:
    - php ./app/run-server.php --daemon
    - php ./test-suite/run.php --unit-tests
```

You should be good to go. Happy testing!

<h2 id="next">Next steps</h2>

If your tests fail and you need to fix something, CircleCI has a
[list of common problems and their solutions]( {{ site.baseurl }}/1.0/troubleshooting/)
that can help you debug many issues.
You might also like to know that we allow you to [SSH in during your builds]( {{ site.baseurl }}/1.0/ssh-build/).
This lets you check out how CircleCI works and facilitates nimble and efficient debugging.
