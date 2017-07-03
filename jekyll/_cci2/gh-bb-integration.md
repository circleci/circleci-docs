---
layout: classic-docs
title: GiHub and Bitbucket Integration
description: GiHub and Bitbucket Integration
categories: [migration]
Order: 60
---

This document provides an overview of the process of checking out your code from GitHub or Bitbucket and running your configuration. After you add a project to CircleCI, the following GitHub or Bitbucket settings are added to the repository using the permissions you gave CircleCI when you signed up::
- A **deploy key** that is used to check out your project from GitHub or Bitbucket.
- A **service hook** that is used to notify CircleCI when you push to GitHub or Bitbucket.

## Overview

After you create and commit a `.circleci/config.yml` file to your GitHub or Bitbucket repository CircleCI immediately checks your code out and runs your first job along with any configured tests. For example, if you are working on a Rails project using Postgres specifications and features you might configure the following job run step:

```
jobs:
  steps:
    - run: |
        bundle install
        bundle exec rake db:schema:load
        bundle exec rspec spec
        bundle exec cucumber
```
        
CircleCI runs your tests on a clean container every time so that your code is never accessible to other users and the tests are fresh each time you push. Watch your tests update in real-time on [your dashboard](https://circleci.com/dashboard) or get status when CircleCI sends you a notification email after the job finishes. Status badges also appear on GitHub or Bitbucket as shown in the following screenshot for a commit from user keybits:

![Status Badge After Commit]({{ site.baseurl }}/assets/img/docs/status_badge.png)

Integrated status also appears on the pull request screen, to show that all tests have passed:

![Status Badge After PR]({{ site.baseurl }}/assets/img/docs/status_check.png)

## Enable Your Project to Check Out Additional Private Repositories

If your testing process refers to multiple repositories, CircleCI will need a GitHub user key in addition to the deploy key because each deploy key is valid for only _one_ repository while a GitHub user key has access to _all_ of your GitHub repositories.

Provide CircleCI with a GitHub user key on your project's
**Project Settings > Checkout SSH keys** page.
CircleCI creates and associates this new SSH key with your GitHub user account
for access to all your repositories.

<h2 id="security">User key security</h2>

CircleCI will never make your SSH keys public.

Remember that SSH keys should be shared only with trusted users and that anyone that is a GitHub collaborator on a project employing user keys
can access your repositories, so only entrust a user key to someone with whom you would entrust your source code.

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


<h2 id="machine-user-keys">Machine user keys</h2>

Consider using a machine user's SSH key instead of a regular user's key for automated tasks that may have restricted access to required repos. A [machine user](https://developer.github.com/guides/managing-deploy-keys/#machine-users) is a GitHub user which you create only for automated tasks.  Add a machine user's SSH key to your projects on CircleCI and use that key as the *Checkout SSH key* for these projects, instead of using deploy keys or your own SSH keys.

Here are the steps to set a machine user's SSH key as a checkout key for your project.

1. Log in to GitHub as the machine user.

2. Go to <https://circleci.com> and log in. GitHub will ask you to authorize CircleCI to access the machine user's account, so click on the **Authorize application** button.

3. Go to <https://circleci.com/add-projects> and follow the projects you want the machine user to have access to.

4. Go to the **Project Settings > Checkout SSH keys** page and then click on the ***Authorize w/GitHub*** button to give CircleCI permission to create and upload SSH keys to GitHub on behalf of the machine user.

5. Click the ***Create and add XXXX user key*** button on the same page.

CircleCI will use the machine user's SSH key for any git commands run during your builds.

## Permissions

CircleCI requests permissions as required by the 
[GitHub permissions model](http://developer.github.com/v3/oauth/#scopes) and [Bitbucket permission model](https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html#OAuthonBitbucketCloud-Scopes) as follows:

*   add deploy keys to a repo
*   add service hooks to a repo
*   get a list of a user's repos
*   get a user's email address
*   (in some cases) add an SSH key to a user's account

The first two permissions require write-permission to a repo.

## Permissions for Team Accounts

This section provides an overview of the possible team and individual account choices available to meet various business needs:

1. If an individual has a personal GitHub account, they will use it to log in to CircleCI and follow the project on CircleCI. Each 'collaborator' on that repository in GitHub is also able to follow the project and build on CircleCI when they push commits.

2. If an individual upgrades to a GitHub Team account they can add team members and may give admin permissions on the repo to those who run builds. The owner of the team GitHub account (org) must go to the CircleCI [Add Project](https://circleci.com/add-projects), click the link to GitHub's application permissions screen, and select Authorize CircleCI to enable members of the org to follow the project from their account. A team account with two members is $25 per month instead of $7 per month for a personal account.

3. An individual Bitbucket account is free for private repos for teams of up to five. An individual may create a Bitbucket team, add members and give out admin permissions on the repo as needed to those who need to build. This project would appear in CircleCI for members to follow without additional cost.

## How to re-enable CircleCI after enabling third-party application restrictions for a GitHub organization

Go to [GttHub Settings](https://github.com/settings/connections/applications/78a2ba87f071c28e65bb) and in the "Organization access" section either:

* "Request access" if you are not an admin for the organization in question (an admin will have to approve the request) or
* "Grant access" if you are an admin

Once access is granted, CircleCI should behave normally again.

### Background information

GitHub recently added the ability to approve [third party application access on a per-organization level](https://help.github.com/articles/about-third-party-application-restrictions/). Before this change, any member of an organization could authorize an application (generating an OAuth token associated with their GitHub user account), and the application could use that OAuth token to act on behalf of the user via the API with whatever permissions were granted during the OAuth flow.

Now OAuth tokens will, by default, not have access to organization data when third party access restrictions are enabled. You must specifically request access on a per organization basis, either during the OAuth process or later, and an organization admin must approve the request.

You can enable third party access restrictions by visiting the organization settings page on GitHub, and clicking "Setup application access restrictions" button in the "Third-party application access policy" section.

If you enable these restrictions on an organization for which CircleCI has been running builds then we will stop receiving push event hooks from GitHub (thus not building new pushes), and API calls will be denied (causing, for instance, re-builds of old builds to fail the source checkout.) To get CircleCI working again you have to grant access to the CircleCI application.

The account and permissions system we use is not as clear as we would like and as mentioned we have a much improved system in development with users as first class citizens in CircleCI.

## Adding Read/Write Deployment Keys to GitHub or Bitbucket

When you add a new project, CircleCI creates a deployment key on the web-based VCS (GitHub or Bitbucket) for your project. The deployment key is read-only, to prevent CircleCI from pushing to your repository. However, sometimes you may want push to the repository from your builds and you cannot do this with a read-only deployment key. It is possible to manually add a read/write deployment key with the following steps.

In this example, the GitHub repository is `https://github.com/you/test-repo` and the project on CircleCI is `https://circleci.com/gh/you/test-repo`.

1. Create a ssh key pair by following the [GitHub instructions](https://help.github.com/articles/generating-ssh-keys/)
  Note: when asked "Enter passphrase (empty for no passphrase)", do ***not*** enter a passphrase.
2. Go to `https://github.com/you/test-repo/settings/keys` on GitHub and click **Add deploy key**. Enter any title in the **Title** field, then copy and paste the public key you just created. Make sure to check **Allow write access**, then click **Add key**.
3. Go to `https://circleci.com/gh/you/test-repo/edit#ssh` on CircleCI and add the private key that you just created. Enter `github.com` in the **Hostname** field and press the submit button.
4. In you config.yml, you can refer to the key with the following:
```
steps:
  - add-ssh-keys:
      fingerprints:
        - "SO:ME:FIN:G:ER:PR:IN:T"
```
That's it! Now, when you push to your GitHub repository from a job run, the read/write key that you added will be used.



