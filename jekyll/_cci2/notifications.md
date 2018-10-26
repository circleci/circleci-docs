---
layout: classic-docs
title: "Using Notifications"
short-title: "Using Notifications"
categories: [configuring-jobs]
order: 100
published: true
---

CircleCI has integrated chat notifications, automated email notifications, and
web notifications. Notifications are delivered on the success or failure of a
[workflow]({{ site.baseurl }}/2.0/workflows/). Consider the minimal CircleCI config below:

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
  build_and_test: # < A notification will be visible for this workflow
    jobs:
      - build
      - test
```

Continue reading to learn how each notification type (chat, email, and web) is configurable.

## Enable Chat Notifications

CircleCI supports Slack, HipChat, Campfire, Flowdock and IRC notifications. Configure chat notifications on the Project Settings > Chat Notifications page of the CircleCI application using the in-app instructions and links for each chat app.

![]({{ site.baseurl }}/assets/img/docs/notification-chat.png)

Slack notifications will look like the following:

![]({{ site.baseurl }}/assets/img/docs/notification-chat-success.png)

![]({{ site.baseurl }}/assets/img/docs/notification-chat-fail.png)


## Set or Change Email Notifications
Use the [Notifications](https://circleci.com/account/notifications){:rel="nofollow"} page of the CircleCI application to set or change your default email address for notifications, to turn off email notifications, or get a notification email for every build.

Email notifications will look like the following:

![]({{ site.baseurl }}/assets/img/docs/notification-email-success.png)

![]({{ site.baseurl }}/assets/img/docs/notification-email-failure.png)

## Enable Web Notifications

1. Go to your [CircleCI user settings](https://circleci.com/account/notifications){:rel="nofollow"}. The link to turn on permissions is at the bottom in the Web Notifications section as shown in the screenshot:
![](  {{ site.baseurl }}/assets/img/docs/notification-default-message.png)

2. Click the link to turn on permissions. Your browser will ask you to confirm that you want to allow notifications from CircleCI. 

3. Click Allow as shown in the screenshot example.
![](  {{ site.baseurl }}/assets/img/docs/notification-allowing.png)

4. Select the radio button to show notifications for completed builds. **Note:** To select the radio button, you may need to reload the page. 

If you've previously denied CircleCI permission to send you web notifications
then you'll need to turn those permissions on in your browser, as CircleCI can't
request permission in this case. Use your browser settings to control notifications. In Google Chrome you can do this by clicking the lock icon in the URL bar and selecting Notifications from the Permissions Settings as shown in the following animation:
![](  {{ site.baseurl }}/assets/img/docs/notification-granting.gif)

While the process is similar for other browsers, please refer to their individual
documentation for handling web notifications.
