---
layout: classic-docs
title: Frequently Asked Questions
short-title: FAQ
categories: [getting-started]
description: Frequently Asked Questions
---

## Authentication

### Do you support BitBucket or GitLab?
Currently we support authentication with GitHub and Bitbucket. We do look at feature requests on [Discuss](https://discuss.circleci.com/) if you want to show support for other version control systems.

### I can’t give CircleCI the access to all my private repositories. What do I do?
GitHub has only recently added the fine-grained permissions options, and
we are still working on supporting them.

In the meantime, the suggested workaround is to create an additional
user on GitHub with a limited set of permissions and use that account to
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
### Can I send HipChat / Slack / IRC notifications for specific branches only?
We don’t currently offer this kind of selective notifications, but the
functionality is in the works. Keep an eye on our
[changelog](https://circleci.com/changelog/) to be notified as soon as
this feature is available.

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
