---
layout: classic-docs
title: Activating Web Notifications for Build Results
short-title: Activating Web Notifications
categories: [configuration-tasks]
description: How to activate web notifications for build results
order: 40
sitemap: false
---

## Turning On Build Notifications

Go to your [CircleCI account settings](https://circleci.com/account){:rel="nofollow"}. If you've
not yet granted CircleCI permission to send you web notifications, you should see
the following message at the bottom in the "Web Notifications" section:

![](  {{ site.baseurl }}/assets/img/docs/notification-default-message.png)

Click the link to turn on permissions and you should see something like the
screen below. Make sure you click "Allow".

![](  {{ site.baseurl }}/assets/img/docs/notification-allowing.png)

## Turning Notifications Permissions Back On

If you've previously denied CircleCI permission to send you web notifications
then you'll need to turn those permissions on in your browser, as CircleCI can't
request permission in this case. For Google Chrome, this looks like:

![](  {{ site.baseurl }}/assets/img/docs/notification-granting.gif)

While the process is similar for other browsers, please refer to their individual
documentation for handling web notifications.
