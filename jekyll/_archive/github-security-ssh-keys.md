---
layout: classic-docs
title: GitHub security and SSH keys
description: GitHub security and SSH keys
last_updated: May 1, 2013
sitemap: false
---

GitHub has two different SSH keys&mdash;a _deploy_ key and a _user_ key.
When you add a GitHub repository to CircleCI, we automatically add a deploy
key that references this repository.
For most customers, this is all CircleCI needs to run their tests.

Each deploy key is valid for only _one_ repository.
In contrast, a GitHub user key has access to _all_ of your GitHub repositories.

If your testing process refers to multiple repositories
(for example, if you have a Gemfile that points at a  private `git` repository),
CircleCI will be unable to check out such repositories with only a deploy key.
When testing requires access to different repositories, CircleCI will need a GitHub user key.

You can provide CircleCI with a GitHub user key on your project's
**Project Settings > Checkout SSH keys** page.
CircleCI creates and associates this new SSH key with your GitHub user account
and then has access to all your repositories.

<h2 id="security">User key security</h2>

CircleCI is serious when it comes to security.
We will never make your SSH keys public.

Remember that SSH keys should be shared only with trusted users.
Anyone that is a GitHub collaborator on a project employing user keys
can access your repositories as you.
Beware of someone stealing your code.

<h2 id="machine-user-keys">Machine user keys</h2>

A [machine user](https://developer.github.com/guides/managing-deploy-keys/#machine-users) is a GitHub user which you create only for automated tasks. Machine user accounts are not intended to be used by a human.

You can add a machine user's SSH key to your projects on CircleCI and use that key as the *Checkout SSH key* for these projects, instead of using deploy keys or your own SSH keys.

The main benefit of using a machine user's SSH key instead of a regular user's key is that you can lock down the machine user's access to just the repos that it _needs_ to access.

Here are the steps to set a machine user's SSH key as a checkout key for your project.  We recommend doing this in an incognito window, as you will have to sign out of your normal user's GitHub and CircleCI accounts.

- First, you need to login to GitHub as the machine user.

- Go to <https://circleci.com> and log in. GitHub will ask you to authorize CircleCI to access the machine user's account, so click on the **Authorize application** button.

- Click on "Projects" on the left and follow the projects you want the machine user to have access to.

- Once followed, go to the **Project Settings > Checkout SSH keys** page and then click on the ***Authorize w/GitHub*** button. That gives us permission to create and upload SSH keys to GitHub on behalf of the machine user.

- Finally, click the ***Create and add XXXX user key*** button on the same page.

That's it. Now CircleCI will use the machine user's SSH key for any git commands run during your builds.

<h2 id="error-messages">User key access-related error messages</h2>

Here are common errors that indicate you need to add a user key.

**Python**: During the `pip install` step:

```
ERROR: Repository not found.
```

**Ruby**: During the `bundle install` step:

```
Permission denied (publickey).
```
