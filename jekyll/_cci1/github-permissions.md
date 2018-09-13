---
layout: classic-docs
title: Why does CircleCI need all those permissions?
description: CircleCI permissions explanation 
last_updated: Feb 3, 2013
sitemap: false
---

We would love to ask for less permissions than we do, but
[GitHub only provides very coarse grained permissions](http://developer.github.com/v3/oauth/#scopes)
unfortunately.

CircleCI actually needs the following concrete permissions:

*   add deploy keys to a repo
*   add service hooks to a repo
*   get a list of a user's repos
*   get a user's email address
*   (in some cases) add an SSH key to a user's account

The first two obviously need write-permission to a repo.
Getting a list of a user's repos requires write-access because GitHub does not provide a way to ask for only read-access.
If that were possible, then we could delay asking for write-permission until we actually needed it.

We feel strongly about only asking for the permissions we need, and have asked GitHub to help a number of times.
If you also feel strongly, please reach out to GitHub and tell them it's important to you.
