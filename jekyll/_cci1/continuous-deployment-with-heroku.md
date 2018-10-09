---
layout: classic-docs
title: Continuous Deployment with Heroku
categories: [how-to]
description: Continuous Deployment with Heroku
sitemap: false
---

## Quick start videos

Watch these videos for a step-by-step walkthrough of setting up a continuous delivery
pipeline with CircleCI and Heroku:

### Part 1: Green builds and red builds

<div class="video-wrapper">
  <iframe class="embed-responsive-item" src='//www.youtube.com/embed/Hfs_1yuWDf4?rel=0' width='600' height='400' frameborder='0' allowfullscreen></iframe>
</div>

### Part 2: Multiple Environments

<div class="video-wrapper">
  <iframe class="embed-responsive-item" src='//www.youtube.com/embed/YtvKVfjKGWw?rel=0' width='600' height='400' frameborder='0' allowfullscreen></iframe>
</div>

You can also look at the GitHub repo used in the above videos
[here.](https://github.com/circleci/heroku-cd)

## Heroku Setup

You must supply or confirm some authentication settings before Heroku deployment.
CircleCI divides this setup work into three steps.

**Note**: Heroku authenticates using the API key set in your Heroku dashboard **Account** page;
this API key must be set before proceeding.

**Step 1:**
Enter the API key (if not autofilled) and click **Save**.

![](  {{ site.baseurl }}/assets/img/docs/heroku-step1.png)

If this key has already been added to your **Project Settings > Heroku settings** page,
CircleCI maintains security by displaying a shorten version of the existing API key
and masking the key when autofilling the **Set key** field.

**Note**: Heroku's architecture and security model require that you deploy as a particular user.
A member of your project&mdash;possibly you&mdash;needs to register as that user as the second step in this process.

**Step 2:**
Click the button to set the registered person as the Heroku deploy user
and to associate a Heroku SSH key with the deploy user's account.

![](  {{ site.baseurl }}/assets/img/docs/heroku-step2.png)

**Step 3:**
Specify the app using the
`appname`
key.

**Note:** the Heroku `appname` must not include upper case characters.

```
deployment:
  staging:
    branch: master
    heroku:
      appname: foo-bar-123 # appname must not include upper-case characters
```

You can now use the `git push` command.
Upon a successful build, we'll automatically deploy to the app in the section that matches the push, should there be one.

**Note**: If you are deploying several projects from CircleCI consider
using different keys for each one. Heroku enforces a rate-limit of 75 git
requests per hour per key.

<h2 id="pre-or-post">Heroku with pre- or post-deployment steps</h2>

If you'd like to run commands before or after deploying to Heroku, you'll have to use the 'normal' `deployment` syntax together with the Heroku CLI (pre-installed). This method does not pull in your Heroku creds that is set in the CircleCI UI. Instead, you'll need to set your Heroku API key via standard [private environment variables][doc-priv-envars]. In the following example, we set `HEROKU_EMAIL` and `HEROKU_TOKEN` as private environment variables.

[doc-priv-envars]: https://circleci.com/docs/1.0/environment-variables/#setting-environment-variables-for-all-commands-without-adding-them-to-git

```yaml
deployment:
  production:
    branch: production
    commands:
      - |
        cat >~/.netrc <<EOF
        machine api.heroku.com
          login $HEROKU_EMAIL
          password $HEROKU_TOKEN
        machine git.heroku.com
          login $HEROKU_EMAIL
          password $HEROKU_TOKEN
        EOF
      - chmod 600 ~/.netrc # Heroku cli complains about permissions without this
      - "[[ ! -s \"$(git rev-parse --git-dir)/shallow\" ]] || git fetch --unshallow"
      - git push git@heroku.com:foo-bar-123.git $CIRCLE_SHA1:refs/heads/master
      - heroku run rake db:migrate --app foo-bar-123:
          timeout: 400 # if your deploys take a long time
```

Note the 'git fetch --unshallow' command; we do shallow clones by default, which can't always push to Heroku.

<h2 id="maintenance-mode">Heroku's maintenance mode</h2>

When you are pushing new code that requires a database migration, your app will not be available.
To be  polite, you might want to treat your users to more than an enigmatic error page.

Heroku offers a built-in maintenance mode when you need to disable an app for some period of time.
This mode blocks all HTTP requests and displays a generic HTML page telling users that service is unavailable because of maintenance (more about customizing this 503 error message page below).

You enable maintenance mode with the `heroku maintenance:on` command.
Once your work is completed, you turn the mode off with the `heroku maintenance:off`
command.

Enabling and disabling maintenance mode is sufficient for most simple updating work such as adding a new graphic or making wording changes,
however, when you are performing a database migration Heroku suggests that you use the
`heroku scale` command to reduce the number of active Heroku's worker dynos.
To ensure that no background jobs are processed during migration, scale down all the workers.
Here is how to tweak the `deployment`
section of your `circle.yml` file to employ these commands.

```yaml
deployment:
  staging:
    commands:
      - |
        cat >~/.netrc <<EOF
        machine api.heroku.com
          login $HEROKU_EMAIL
          password $HEROKU_TOKEN
        machine git.heroku.com
          login $HEROKU_EMAIL
          password $HEROKU_TOKEN
        EOF
      - chmod 600 ~/.netrc # Heroku cli complains about permissions without this
      - heroku maintenance:on --app foo-bar-123
      - heroku scale worker=0 --app foo-bar-123
      - git push git@heroku.com:foo-bar-123.git $CIRCLE_SHA1:refs/heads/master
      - heroku run rake db:migrate --app foo-bar-123
      - heroku scale worker=x --app foo-bar-123
      - heroku maintenance:off --app foo-bar-123
```

### Custom maintenance page

As previously mentioned, Heroku displays a default "Application Offline for Maintenance" HTML page telling users that an application is currently unavailable and to check back later.
Should you wish, you can create a
[custom](http://devcenter.heroku.com/articles/error-pages#/customize-pages)
service unavailable page for your app.

<h2 id="migrations">Heroku and database migrations</h2>

After pushing new code, you may wish to run your database migration.
**Migration times will vary between apps because of data size and structure.**

The Rails `rake db:migrate` command invokes several tasks including
` db:schema:dump`, which updates the db/schema.rb file to match the database structure.
CircleCI supports such command-driven database migrations as well as database migrations performed manually.

Before migrating, Heroku recommends that you use the `heroku pgbackups`
command to
[capture a snapshot](http://devcenter.heroku.com/articles/migrate-heroku-postgres-with-pgbackups/#capture-source-snapshot)
so that you can easily revert the database back to its previous state.

### Migration guides

Here are migration-related articles that you might find useful.

*   [Rails](http://guides.rubyonrails.org/migrations.html)
*   [node.js](http://github.com/nearinfinity/node-db-migrate/#readme)
*   [Django (Python web framework)](http://djangopro.com/2011/01/django-database-migration-tool-south-explained)

<h2 id="caches">Clearing caches after a deployment</h2>

If you are using a caching add-on,
it is likely that you want to clear your caches after a deploy to avoid using out-of-date and possibly corrupt documents and/or data.
Heroku does not clear caching by default, but you can install an
[add-on](https://elements.heroku.com/addons#caching) that assists with cache management.

Add-ons include settings, such as expiration time settings for clearing cache pages,
as well as commands that can assist with such housekeeping.
MemCachier supports a `Flush` command that clears your entire cache.
You might want to write a standalone script that uses the memcache client to call
`Flush` and run the script at deployment.

### Related articles

Here are related articles that you might find useful.

*   [Memcachier documentation](http://devcenter.heroku.com/articles/memcachier/#getting-started)
*   [Redis documentation](http://redis.io/documentation)
*   [Django's cache framework documentation](http://docs.djangoproject.com/en/1.9/topics/cache)
