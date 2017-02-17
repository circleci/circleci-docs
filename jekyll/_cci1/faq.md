---
layout: classic-docs
title: Frequently Asked Questions
short-title: FAQ
categories: [getting-started]
description: Frequently Asked Questions
---

## How do I subscribe to CircleCI announcements and get updates about new features and changes?

We recommend that **all customers subscribe to the '[Announcements](https://discuss.circleci.com/c/announcements)' category** on our forums. You will get advance notice of important changes and new features.

You can **subscribe by email, RSS or JSON**. **[Follow these instructions](https://discuss.circleci.com/t/how-to-subscribe-to-announcements-and-notifications-from-circleci-email-rss-json/5616) to subscribe now.**

You may also like to follow our **[changelog](https://circleci.com/changelog/)** to see what has been released.

Our **[status page](http://status.circleci.com/)** gives information on current system status, outages and past incidents.

## Authentication

### Do you support Bitbucket or GitLab?

Currently we support authentication with GitHub and Bitbucket. Please vote on relevant [Feature Request](https://discuss.circleci.com/c/feature-request) if you want to show support for other version control systems.

### I can’t give CircleCI the access to all my private repositories. What do I do?

GitHub has only recently added the fine-grained permissions options, and
we are still working on supporting them.

In the meantime, the [suggested workaround]({{site.baseurl}}/github-security-ssh-keys/) is to create an additional user on GitHub with a limited set of permissions and use that account to
perform the builds on CircleCI.

### I updated my email address on GitHub, and it does not show up on CircleCI

We refresh GitHub information once a day to stay within GitHub’s API
limits, so check your profile page later – it will be right there.

## Billing & Plans

### Can I build more than one project if I only have one container?

Absolutely. In this case the builds will run one at a time, one after
another.

### How do I stop CircleCI from building a project?

If you get everyone who follows the project on CircleCI to unfollow it, we
will automatically stop building it.

## Integrations

### Can I get notifications to team chat applications?

CircleCI supports Slack, HipChat, Campfire, Flowdock and IRC notifications; you configure these notifications from your project’s **Project Settings > Notifications** page.

### Can I send Slack / HipChat / IRC notifications for specific branches only?

There is [experimental support for per branch chat notifications]({{site.baseurl}}/configuration/#per-branch-notifications). 

## Discover CircleCI's Public IP addresses

Currently CircleCI runs on multiple AWS Regions and utilizes many different
servers to perform the builds. As such there isn't a single IP, or even a small
range of IPs, that could be used to help identify that an incoming request is
from a build of your project.

Even if the IP range was known it would not be safe to trust the IP address as
we have thousands of builds running at any one time so multiple project's 
builds could all be making requests from the same IP address.

## Projects

### How can I delete my project?

You just need to unfollow the project in the project setting page. Once the last follower has stopped following the project, CircleCI will stop building.
Please [contact us](mailto:support@circleci.com) us if you want to purge the project data from our database.
