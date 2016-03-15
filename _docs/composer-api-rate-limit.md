---
layout: classic-docs
title: Composer hitting GitHub API rate limits
last_updated: May 23, 2013
---

_Note that this only applies when setting up your composer step manually -
CircleCI's built-in PHP support knows how to workaround this issue._

Composer uses the GitHub API to download dependencies.
Unfortunately, GitHub has strict API rate limits, which can cause your builds to fail when fetching dependencies.
This causes an error that looks like this:

```
Could not fetch https://api.github.com/repos/username/repo/v1.2.3, enter your GitHub credentials to go over the API rate limit
The credentials will be swapped for an OAuth token stored in /home/ubuntu/.composer/config.json, your password will not be stored
To revoke access to this token you can visit https://github.com/settings/applications
Username:
```

To get around this, tell composer to use git to fetch dependencies instead:

```
composer install --prefer-source --no-interaction
```

### API rate limits and custom repositories

Composer tries to discover every available version of every package in a repository.
For GitHub repositories it uses the GitHub API to do this, even when you have `--prefer-source` set.

You can avoid this version discovery if you commit your `composer.lock` into your repo.
That tells Composer exactly which package versions to fetch from the custom repository.

Committing your `composer.lock` is also a best practise, even if you don't have this problem.
It means your local environment, CircleCI, and your production environment all use the exact same versions of your dependencies.
This adds extra confidence to your tests; you're testing exactly the same code that you deploy to production.
