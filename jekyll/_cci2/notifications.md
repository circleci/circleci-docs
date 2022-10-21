---
layout: classic-docs
title: Using Notifications
description: Learn how to use get CircleCI's job status through Slack, IRC, email, and web notifications.
order: 100
published: true
contentTags: 
  platform:
  - Cloud
---

* TOC
{:toc}

CircleCI offers integrated email and web notifications. IRC and Slack notifications can also be configured using orbs. Slack, email, and web notifications are delivered on the successful completion or failure of a [workflow]({{ site.baseurl }}/workflows/). IRC notifications are delivered for each job. Consider the minimal CircleCI config below:

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/base:2021.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: cimg/base:2021.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD
    steps:
      - checkout
      - run: <command>
workflows:
  version: 2.1
  build_and_test: # < Slack and email notifications are sent for workflows
    jobs:
    # IRC notifications are sent for each job.
      - build
      - test
```

## Setting and changing email notifications
{: #set-or-change-email-notifications }

To set or change your default email address, visit the [Notifications](https://app.circleci.com/settings/user/notifications){:rel="nofollow"} page of the CircleCI application. You can also configure your preferences here:

- **All builds in my projects** - you receive an email for every build in your project, whether it succeeds or fails.
- **My branches** - you receive an email when a build fails on a branch to which you have pushed changes.
- **None** - you receive no emails, other than administrative messages relating to your account.

![Screenshot showing how to change default email address and choose notifications]({{ site.baseurl }}/assets/img/docs/email-notifications.png)

If you are a member of multiple organizations, you can specify a different email address for each organization:

![Screenshot showing how to change email address for each organization]({{ site.baseurl }}/assets/img/docs/project-notifications.png)

Email notifications appear as follows:

![Example success email notification]({{ site.baseurl }}/assets/img/docs/notification-email-success.png)

![Example failure email notification]({{ site.baseurl }}/assets/img/docs/notification-email-failure.png)

## Enabling web notifications
{: #enable-web-notifications }

Perform the following steps to enable web notifications:

1. Go to your [CircleCI user settings](https://app.circleci.com/settings/user/notifications){:rel="nofollow"}. Enable the toggle for "Web Notifications" at the bottom of the page.

2. Your browser asks you to confirm that you want to allow notifications. Click **Allow**. See the screenshot below for additional details:

![Screenshots showing how to enable web notifications in your browser]({{ site.baseurl }}/assets/img/docs/notifications-enable-web.png)

If you have previously denied CircleCI permission to send you web notifications, you need to manually enable those permissions in your browser. In Google Chrome, you can do this by clicking the lock icon in the URL bar and re-enabling the notifications toggle.

![Screenshot showing how to enable web notifications in Google Chrome]({{ site.baseurl }}/assets/img/docs/enable-web-notifications.png)

Although the process is similar for other browsers, please refer to their documentation for handling web notifications.

## Sending notifications with orbs
{: #notifications-with-orbs }

You can use orbs to integrate notifications into your configuration. CircleCI offers a Slack orb and an IRC orb. Several third-party orbs are also available. Search the [orb registry](https://circleci.com/developer/orbs?query=notification&filterBy=all) to see what other orbs are available.

### Using the Slack orb
{: #using-the-slack-orb }

Using the [CircleCI Slack orb](https://circleci.com/developer/orbs/orb/circleci/slack), you can integrate and customize Slack notifications directly from your `config.yml` file. The following config is an example of notifying a Slack channel with a custom message:

```yaml
version: 2.1
orbs:
  slack: circleci/slack@4.9.3
jobs:
  notify:
    docker:
      - image: cimg/base:2021.04
        auth:
            username: mydockerhub-user
            password: $DOCKERHUB_PASSWORD
    steps:
      - slack/notify:
          custom: |
            {
              "blocks": [
                {
                  "type": "section",
                  "fields": [
                    {
                      "type": "plain_text",
                      "text": "*This is a text notification*",
                      "emoji": true
                    }
                  ]
                }
              ]
            }
          event: always
workflows:
  send-notification:
    jobs:
      - notify:
          context: slack-secrets
```

See [Using the Slack Orb]({{ site.baseurl }}/slack-orb-tutorial/) for a full tutorial with examples.

CircleCI's Slack orb can be used for other types of notification, including notifying a Slack channel of a pending approval. For more information and to view usage examples, see the [CircleCI Slack orb page](https://circleci.com/developer/orbs/orb/circleci/slack).

### Using the IRC orb
{: #using-the-irc-orb }

The [IRC orb](https://circleci.com/developer/orbs/orb/circleci/irc) is similar to the Slack orb, but only has one main feature: sending custom IRC notifications from CircleCI. Consider this example configuration:

```yaml
version: 2.1
orbs:
  irc: circleci/irc@0.2.0
jobs:
  build:
    docker:
      - image: <Docker image>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD
    steps:
      - checkout
      - irc/notify:
          server: <IRC-server-to-connect-to> # default: IRC_SERVER environment varible.
          port: <6667> # default: 6667 if left blank.
          channel: <the IRC server to post in> # required parameter
          nick: <Your IRC nickname> # default: `circleci-bot`
          message: <Build complete!> # default: "Your CircleCI Job has completed."
workflows:
  your-workflow:
    jobs:
      - build
```
Replace the values in brackets (<>) with your own details.

## See also

- [Orbs Introduction]({{ site.baseurl }}/orb-intro/)
- [Using the Slack Orb]({{ site.baseurl }}/slack-orb-tutorial/)
