---
layout: classic-docs
title: "Using npm login on CircleCI"
short-title: "npm login"
description: "How to get npm login to work in an environment like CircleCI."
sitemap: false
---

When using `npm` to install a private module in a continuous integration 
environment for the first time, a brick wall is quickly hit. The `npm login` 
command is designed to be used interactively. This causes an issue in CI, 
scripts, etc. Here's how to use `npm login` on CircleCI.

## Step 1 - Private Environment Variables

For reusability, we can set `npm login` info in environment variables (envar). 
While we can set [envars in `circle.yml`][1], this will appear in Git and thus 
be public. Instead, we can use [private envars via CircleCI.com][2] or the API. 
The following variables should be set (variable names can be changed, just stay consistent):

* `NPM_USER`
* `NPM_PASS`
* `NPM_EMAIL`

## Step 2 - The Actual Login Request

Various workarounds to get `npm login` working exists. Here is a 
fairly simple method that can be done in `circle.yml`:

```
dependencies:
  pre:
    - echo -e "$NPM_USER\n$NPM_PASS\n$NPM_EMAIL" | npm login
```


[1]:  {{ site.baseurl }}/1.0/configuration/#environment
[2]:  {{ site.baseurl }}/1.0/environment-variables/#setting-environment-variables-for-all-commands-without-adding-them-to-git
