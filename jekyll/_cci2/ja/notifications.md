---
layout: classic-docs
title: "通知の使用"
short-title: "通知の使用"
order: 100
published: true
version:
  - Cloud
---

* TOC
{:toc}


CircleCI has integrated chat, email, and web notifications. Slack and Email notifications are delivered on the success or failure of a [workflow]({{ site.baseurl }}/2.0/workflows/). IRC notifications are delivered for each job. 以下に、最小限の CircleCI 設定ファイルの例を示します。


```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

続いて、各通知タイプ (チャット、メール、Web) の設定方法について説明していきます。

## Set or change email notifications
{: #set-or-change-email-notifications }

Use the [Notifications](https://app.circleci.com/settings/user/notifications){:rel="nofollow"} page of the CircleCI application to set or change your default email address for notifications, to turn off email notifications, or get a notification email for every build.

Email notifications will look like the following:

![]({{ site.baseurl }}/assets/img/docs/notification-email-success.png)

![]({{ site.baseurl }}/assets/img/docs/notification-email-failure.png)

## Enable web notifications
{: #enable-web-notifications }

Perform the following steps to enable web notifications:

1. Go to your [CircleCI user settings](https://app.circleci.com/settings/user/notifications){:rel="nofollow"}. Enable the toggle for "Web Notifications" at the bottom of the document.

2. Your browser will ask you to confirm that you want to allow notifications. Click `Allow`. See the screenshot below for additional details:

![]({{ site.baseurl }}/assets/img/docs/notifications-enable-web.png)

If you've previously denied CircleCI permission to send you web notifications you will need to manually turn those permissions on in your browser, as CircleCI cannot request permission in this case. Use your browser settings to control notifications. In Google Chrome you can do this by clicking the lock icon in the URL bar and re-enabling notifications from the Permissions Settings.

While the process is similar for other browsers, please refer to their individual documentation for handling web notifications.

## Notifications with Orbs
{: #notifications-with-orbs }

You can use Orbs to integrate various kinds of notifications into your configuration; currently, CircleCI offers a Slack orb and an IRC orb, but several third-party orbs also exist. Consider searching the [orb registry](https://circleci.com/developer/orbs?query=notification&filterBy=all) for _notifications_ to see what is available.

### 前提条件
{: #prerequisites }

Before integrating an orb into your configuration, you will need to perform two steps:

1. Increment the `version` key in your config to `2.1` and;
2. {% include snippets/enable-pipelines.md %}

### Slack Orb の使用
{: #using-the-slack-orb }

Using the [CircleCI Slack orb](https://circleci.com/developer/orbs/orb/circleci/slack), you can integrate and customize Slack notifications directly from your configuration file. The following config is an example of notifying a Slack channel with a custom message:

```yaml
version: '2.1'
orbs:
  slack: circleci/slack@4.0
jobs:
  notify:
    docker:
      - image: 'cimg/base:stable'
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

CircleCI's Slack orb can be used to provide other types of notifications, including notifying a slack channel of a pending approval or sending a status alert at the end of a job based on success or failure. For more information and to view usage examples, see the [CircleCI Slack orb page](https://circleci.com/developer/orbs/orb/circleci/slack).

### IRC Orb の使用
{: #using-the-irc-orb }

The [IRC orb](https://circleci.com/developer/orbs/orb/circleci/irc) is similar to the Slack orb, but only has one main feature: sending custom IRC notifications from CircleCI. Consider this example configuration:

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: <docker image>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - irc/notify:
          server: 'IRC-server-to-connect-to' # default: IRC_SERVER environment varible.
          port: '6667' # デフォルト: 6667 (空白の場合)
          channel: 'the irc server to post in' # required parameter
          nick: 'Your IRC nick name' # default: `circleci-bot`
          message: webhook # default: "Your CircleCI Job has completed."
          orbs:
  irc: circleci/irc@x.y.z
version: 2.1
workflows:
  your-workflow:
    jobs:
      - build
```

## Third party tools
{: #third-party-tools }

### Chroma feedback
{: #chroma-feedback }

[Chroma Feedback](https://github.com/redaxmedia/chroma-feedback) is a command line tool in Python to turn your RGB powered hardware into an build indicator. The idea of such extreme visibility is to encourage developers to instantly repair their builds.
