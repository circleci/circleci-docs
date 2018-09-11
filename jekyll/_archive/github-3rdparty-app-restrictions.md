---
layout: classic-docs
title: Re-enabling CircleCI after enabling third-party application restrictions for a GitHub organization
description: Re-enabling CircleCI after enabling third-party application restrictions for a GitHub organization
last_updated: Jan 26, 2015
sitemap: false
---

## How to re-enable CircleCI

Go to https://github.com/settings/connections/applications/78a2ba87f071c28e65bb and in the "Organization access" section either:

* "Request access" if you are not an admin for the organization in question (an admin will have to approve the request) or
* "Grant access" if you are an admin

Once access is granted, CircleCI should behave normally again.

## Background information

GitHub recently added the ability to approve [third party application access on a per-organization level](https://help.github.com/articles/about-third-party-application-restrictions/). Before this change, any member of an organization could authorize an application (generating an OAuth token associated with their GitHub user account), and the application could use that OAuth token to act on behalf of the user via the API with whatever permissions were granted during the OAuth flow.

Now OAuth tokens will, by default, not have access to organization data when third party access restrictions are enabled. You must specifically request access on a per organization basis, either during the OAuth process or later, and an organization admin must approve the request.

You can enable third party access restrictions by visiting the organization settings page on GitHub, and clicking "Setup application access restrictions" button in the "Third-party application access policy" section.

If you enable these restrictions on an organization for which CircleCI has been running builds then we will stop receiving push event hooks from GitHub (thus not building new pushes), and API calls will be denied (causing, for instance, re-builds of old builds to fail the source checkout.) To get CircleCI working again you have to grant access to the CircleCI application.
