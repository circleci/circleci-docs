---
layout: classic-docs
title: GitHub and Bitbucket Integration
description: Using GitHub or Bitbucket
categories: [migration]
Order: 60
---

This document provides an overview of using GitHub, GitHub Enterprise, or Bitbucket Cloud with CircleCI in the following sections:

* TOC
{:toc}

## Overview
{:.no_toc}

When you add a project to CircleCI, the following GitHub or Bitbucket Cloud settings are added to the repository using the permissions you gave CircleCI when you signed up:
- A **deploy key** that is used to check out your project from GitHub or Bitbucket Cloud.
- A **service hook (or "push hook")** that is used to notify CircleCI when you push to GitHub or Bitbucket Cloud.

CircleCI builds push hooks by default. So, builds are triggered for all push hooks for the repository and PUSH is the most common case of triggering a build.

There are some additional, less common cases where CircleCI uses hooks, as follows:
- CircleCI processes PR hooks (Pull Request Hooks) to store PR information for the CircleCI app. If the Only Build Pull Requests setting is set then CircleCI will only trigger builds when a PR is opened, or when there is a push to a branch for which there is an existing PR. Even if this setting is set we will always build all pushes to the project's default branch.
- If the Build Forked Pull Requests setting is set, CircleCI will trigger builds in response to PRs created from forked repos.

It is possible to edit the webhooks in GitHub or Bitbucket Cloud to restrict events that trigger a build. Editing the webhook settings lets you change which hooks get sent to CircleCI, but doesn't change the types of hooks that trigger builds. CircleCI will always build push hooks and will build on PR hooks (depending on settings), but if you remove push hooks from the webhook settings CircleCI won't build. Refer to the [GitHub Edit a Hook document](https://developer.github.com/v3/repos/hooks/#edit-a-hook) or the [Atlassian Manage Webhooks document](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html) for details.

Refer to CircleCI documentation of [Workflows filters]({{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-workflows) for how to build tag pushes. 

### Add a .circleci/config.yml File
{:.no_toc}

After you create and commit a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file to your GitHub or Bitbucket Cloud repository CircleCI immediately checks your code out and runs your first job along with any configured tests. For example, if you are working on a Rails project using Postgres specifications and features you might configure the following job run step:

```yaml
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4.1-jessie
    steps:
      - run: |
          bundle install
          bundle exec rake db:schema:load
          bundle exec rspec spec
          bundle exec cucumber
```
        
CircleCI runs your tests on a clean container every time so that your code is never accessible to other users and the tests are fresh each time you push. Watch your tests update in real-time on [your dashboard](https://circleci.com/dashboard){:rel="nofollow"} or get status when CircleCI sends you a notification email after the job finishes. Status badges also appear on GitHub or Bitbucket Cloud as shown in the following screenshot for a commit from user keybits:

![Status Badge After Commit]({{ site.baseurl }}/assets/img/docs/status_badge.png)

Integrated status also appears on the pull request screen, to show that all tests have passed:

![Status Badge After PR]({{ site.baseurl }}/assets/img/docs/status_check.png)

## Enable Your Project to Check Out Additional Private Repositories

If your testing process refers to multiple repositories, CircleCI will need a
GitHub user key in addition to the deploy key because each deploy key is valid
for only _one_ repository while a GitHub user key has access to _all_ of your
GitHub repositories. Refer to the [adding ssh keys]({{ site.baseurl }}/2.0/add-ssh-key) document to learn more.

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

## Controlling Access Via a Machine User

For fine-grained access to multiple repositories,
consider creating a machine user
for your CircleCI projects.
A [machine user](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) is a GitHub user
that you create for running automated tasks.
By using the SSH key of a machine user,
you allow anyone with repository access
to build, test, and deploy the project.
Creating a machine user also reduces
the risk of losing credentials linked to a single user.

To use the SSH key of a machine user,
follow the steps below.

**Note:**
To perform these steps,
the machine user must have admin access.
When you have finished adding projects,
you can revert the machine user to read-only access.

1. Create a machine user
by following the [instructions on GitHub](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users).

2. Log in to GitHub as the machine user.

3. [Log in to CircleCI](https://circleci.com/login).
When GitHub prompts you
to authorize CircleCI,
click the **Authorize application** button.

4. On the [Add Projects](https://circleci.com/add-projects){:rel="nofollow"} page,
follow all projects
you want the machine user to have access to.

5. On the **Project Settings > Checkout SSH keys** page,
click the **Authorize With GitHub** button.
This gives CircleCI permission
to create and upload SSH keys to GitHub
on behalf of the machine user.

6. Click the **Create and add XXXX user key** button.

Now, CircleCI will use the machine user's SSH key
for any Git commands
that run during your builds.

## Permissions Overview

CircleCI requests the following permissions from your VCS provider,
as defined by the [GitHub permissions model](http://developer.github.com/v3/oauth/#scopes)
and the [Bitbucket permissions model](https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html#OAuthonBitbucketCloud-Scopes).

**Read Permission**
- Get a user's email address

**Write Permissions**
- Add deploy keys to a repo
- Add service hooks to a repo
- Get a list of a user's repos
- Add an SSH key to a user's account

**Note:**
CircleCI only asks for
permissions that are absolutely necessary.
However, CircleCI is constrained
by the specific permissions each VCS provider chooses to supply.
For example, getting a list of a user's repos from GitHub requires write access
because GitHub does not provide a read-only permission.

If you feel strongly about reducing the number of permissions CircleCI uses,
consider contacting your VCS provider to communicate your concerns.

### Permissions for Team Accounts
{:.no_toc}

This section provides an overview of the possible team and individual account choices available to meet various business needs:

1. If an individual has a personal GitHub account, they will use it to log in to CircleCI and follow the project on CircleCI. Each 'collaborator' on that repository in GitHub is also able to follow the project and build on CircleCI when they push commits. Due to how GitHub and Bitbucket store collaborators, the CircleCI Team page may not show a complete list. For an accurate list of contributors, please refer to your GitHub or Bitbucket project page.

2. If an individual upgrades to a GitHub Team account they can add team members and may give admin permissions on the repo to those who run builds. The owner of the team GitHub account (org) must go to the CircleCI [Add Project](https://circleci.com/add-projects){:rel="nofollow"}, click the link to GitHub's application permissions screen, and select Authorize CircleCI to enable members of the org to follow the project from their account. A team account with two members is $25 per month instead of $7 per month for a personal account.

3. An individual Bitbucket account is free for private repos for teams of up to five. An individual may create a Bitbucket team, add members and give out admin permissions on the repo as needed to those who need to build. This project would appear in CircleCI for members to follow without additional cost.

### How to Re-enable CircleCI for a GitHub Organization
{:.no_toc}

This section describes how to re-enable CircleCI after enabling third-party application restrictions for a GitHub organization. Go to [GitHub Settings](https://github.com/settings/connections/applications/78a2ba87f071c28e65bb) and in the "Organization access" section either:

* "Request access" if you are not an admin for the organization in question (an admin will have to approve the request) or
* "Grant access" if you are an admin

After access is granted, CircleCI should behave normally again.

GitHub recently added the ability to approve [third party application access on a per-organization level](https://help.github.com/articles/about-third-party-application-restrictions/). Before this change, any member of an organization could authorize an application (generating an OAuth token associated with their GitHub user account), and the application could use that OAuth token to act on behalf of the user via the API with whatever permissions were granted during the OAuth flow.

Now OAuth tokens will, by default, not have access to organization data when third party access restrictions are enabled. You must specifically request access on a per organization basis, either during the OAuth process or later, and an organization admin must approve the request.

You can enable third party access restrictions by visiting the organization settings page on GitHub, and clicking "Setup application access restrictions" button in the "Third-party application access policy" section.

If you enable these restrictions on an organization for which CircleCI has been running builds then we will stop receiving push event hooks from GitHub (thus not building new pushes), and API calls will be denied (causing, for instance, re-builds of old builds to fail the source checkout.) To get CircleCI working again you have to grant access to the CircleCI application.

The account and permissions system we use is not as clear as we would like and as mentioned we have a much improved system in development with users as first class citizens in CircleCI.

## Deployment Keys and User Keys

**What is a deploy key?**

When you add a new project, CircleCI creates a deployment key on the web-based
VCS (GitHub or Bitbucket) for your project. A deploy key is a repo-specific SSH
key. If you are using GitHub as your VCS then GitHub has the public key, and
CircleCI  stores the private key. The deployment key gives CircleCI access to a single repository.
To prevent CircleCI from pushing to your repository, this deployment key is read-only.

If you want to push to the repository from your builds, you will need a deployment key with write access (user key). The steps to create a user key depend on your VCS.

**What is a user key?**

A user key is a user-specific SSH key. Your VCS has the public key, and CircleCI stores the private key. Possession of the private key gives the ability to act as that user, for purposes of 'git' access to projects.

### Creating a GitHub User Key
{:.no_toc}

In this example,
the GitHub repository is `https://github.com/you/test-repo`,
and the CircleCI project is [https://circleci.com/gh/you/test-repo](https://circleci.com/gh/you/test-repo){:rel="nofollow"}.

1. Create an SSH key pair by following the [GitHub instructions](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/).
When prompted to enter a passphrase,
do **not** enter one.

**Caution:** Recent updates in `ssh-keygen` don't generate the key in PEM format by default. If your private key does not start with `-----BEGIN RSA PRIVATE KEY-----`, enforce PEM format by generating the key with `ssh-keygen -m PEM -t rsa -C "your_email@example.com"`

2. Go to `https://github.com/you/test-repo/settings/keys`,
and click "Add deploy key".
Enter a title in the "Title" field,
then copy and paste the key you created in step 1.
Check "Allow write access",
then click "Add key".

3. Go to [https://circleci.com/gh/you/test-repo/edit#ssh](https://circleci.com/gh/you/test-repo/edit#ssh){:rel="nofollow"},
and add the key you created in step 1.
In the "Hostname" field,
enter "github.com",
and press the submit button.

4. In your config.yml,
add the fingerprint using the `add_ssh_keys` key:

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

When you push to your GitHub repository from a job,
CircleCI will use the SSH key you added.

### Creating a Bitbucket User Key
{:.no_toc}

Bitbucket does not currently provide CircleCI with an API
to create user keys.
However, it is still possible to create a user key
by following this workaround:

1. In the CircleCI application,
go to your project's settings.

2. Navigate to the **Checkout SSH Keys** page.

3. Right-click the **Create `<username>` user key** button
and select the **Inspect** option to open the browser inspector.![]( {{ site.baseurl }}/assets/img/docs/bb_user_key.png)

4. In the developer console,
select the **Network** tab.![]( {{ site.baseurl }}/assets/img/docs/bb_user_key2.png)

6. In the developer console,
click the `checkout-key` with a 201 status
and copy the `public_key` to your clipboard.

7. Add the key to Bitbucket
by following Bitbucket's guide on [setting up SSH keys](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html).

8. In your `.circleci/config.yml`,
add the fingerprint using the `add_ssh_keys` key:

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

### How are these keys used?

When CircleCI builds your project, the private key is installed into the `.ssh`
directory and SSH is subsequently configured to communicate with your version
control provider. Therefore, the private key is used for:

- checking out the main project
- checking out any GitHub-hosted submodules
- checking out any GitHub-hosted private dependencies
- automatic git merging/tagging/etc.

For this reason, a deploy key isn't sufficiently powerful for projects with additional private dependencies.

### What about security?

The private keys of the checkout keypairs CircleCI generates never leave the CircleCI systems (only the public key is transmitted to GitHub) and are safely encrypted in storage. However, since they are installed into your build containers, any code that you run in CircleCI can read them.

**Isn't there a difference between deploy keys and user keys?**

Deploy keys and user keys are the only key types that GitHub supports. Deploy
keys are globally unique (for example, no mechanism exists to make a deploy key with
access to multiple repositories) and user keys have no notion of _scope_
separate from the user associated with them.

To achieve fine-grained access to more than one repo, consider creating what GitHub calls a machine user. Give this user exactly the permissions your build requires, and then associate its user key with your project on CircleCI.
