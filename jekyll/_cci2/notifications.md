---
layout: classic-docs
title: "Using Notifications"
short-title: "Using Notifications"
categories: [configuring-jobs]
order: 100
published: true
---

* TOC
{:toc}


CircleCI has integrated chat, email, and web notifications. Slack and Email notifications are delivered on the success or failure of a [workflow]({{ site.baseurl }}/2.0/workflows/). IRC notifications are delivered for each job. Consider the minimal CircleCI config below:


```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
workflows:
  version: 2
  build_and_test: # < Slack and Email notifications will be delivered for workflows
    jobs:
    # IRC integrations will receive notification for each job.
      - build
      - test
```

Continue reading to learn how each notification type (chat, email, and web) is configurable.

## Set or Change Email Notifications

Use the [Notifications](https://app.circleci.com/settings/user/notifications){:rel="nofollow"} page of the CircleCI application to set or change your default email address for notifications, to turn off email notifications, or get a notification email for every build.

Email notifications will look like the following:

![]({{ site.baseurl }}/assets/img/docs/notification-email-success.png)

![]({{ site.baseurl }}/assets/img/docs/notification-email-failure.png)

## Enable Web Notifications

Perform the following steps to enable web notifications:

1. Go to your [CircleCI user settings](https://circleci.com/account/notifications){:rel="nofollow"}. Enable the toggle for "Web Notifications" at the bottom of the document.

2. Your browser will ask you to confirm that you want to allow notifications. Click `Allow`. See the screenshot below for additional details:

![]({{ site.baseurl }}/assets/img/docs/notifications-enable-web.png)

If you've previously denied CircleCI permission to send you web notifications
you will need to manually turn those permissions on in your browser, as CircleCI cannot
request permission in this case. Use your browser settings to control notifications. In Google Chrome you can do this by clicking the lock icon in the URL bar and re-enabling notifications from the Permissions Settings.

While the process is similar for other browsers, please refer to their individual
documentation for handling web notifications.

## Notifications with Orbs

You can use Orbs to integrate various kinds of notifications into your configuration; currently, CircleCI offers a Slack orb and an IRC orb, but several third-party orbs also exist. Consider searching the [orb registry](https://circleci.com/orbs/registry/?query=notification&filterBy=all) for _notifications_ to see what is available.

### Prerequisites

Before integrating an orb into your configuration, you will need to perform two steps: 

1. Increment the `version` key in your config to `2.1` and; 
2. {% include snippets/enable-pipelines.md %}

### Using the Slack Orb

Using the [CircleCI Slack Orb](https://circleci.com/orbs/registry/orb/circleci/slack), you can integrate and customize Slack notifications directly from your configuration file. The following config is an example of notifying a Slack channel with a custom message:

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: <docker image>
    steps:
      - slack/notify:
          color: '#42e2f4'
          mentions: 'USERID1,USERID2,'
          message: This is a custom message notification
          webhook: webhook
orbs:
  slack: circleci/slack@x.y.z
version: 2.1
workflows:
  your-workflow:
    jobs:
      - build
```

It is also possible to use the Slack Orb to provide other types of notifications, including notifying a slack channel of a pending approval or sending a status alert at the end of a job based on success or failure. To view such usage examples, consult the [CircleCI Slack Orb page](https://circleci.com/orbs/registry/orb/circleci/slack).

### Using the IRC Orb

The [IRC orb](https://circleci.com/orbs/registry/orb/circleci/irc) is similar to the Slack orb, but only has one main feature: sending custom IRC notifications from CircleCI. Consider this example configuration:

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: <docker image>
    steps:
      - irc/notify:
          server: 'IRC-server-to-connect-to' # default: IRC_SERVER environment varible.
          port: '6667' # default: 6667 if left blank.
          channel: 'the irc server to post in' # required parmater
          nick: 'Your IRC nick name' # default: `circleci-bot`
          message: webhook # default: "Your CircleCI Job has completed."
orbs:
  slack: circleci/irc@x.y.z
version: 2.1
workflows:
  your-workflow:
    jobs:
      - build
```

## Third Party Tools

### Chroma Feedback

[Chroma Feedback](https://github.com/redaxmedia/chroma-feedback) is a command line tool in Python to turn your RGB powered hardware into an build indicator. The idea of such extreme visibility is to encourage developers to instantly repair their builds.
