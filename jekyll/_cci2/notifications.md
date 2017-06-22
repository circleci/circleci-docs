---
layout: classic-docs
title: "Enabling Web and Email Notifications"
short-title: "Enabling Web and Email Notifications"
categories: [configuring-jobs]
order: 100
published: true
---
Use the [Notifications](https://circleci.com/account/notifications) page of the CircleCI application to set or change your default email address for notifications, to turn off email notifications, or get a notification email for every build.

## Enabling Web Notifications

1. Go to your [CircleCI user settings](https://circleci.com/account/notifications). The link to turn on permissions is at the bottom in the Web Notifications section as shown in the screenshot:

![](  {{ site.baseurl }}/assets/img/docs/notification-default-message.png)

2. Click the link to turn on permissions. Your browser will ask you to confirm that you want to allow notifications from CircleCI. 

3. Click Allow as shown in the screeshot example.

![](  {{ site.baseurl }}/assets/img/docs/notification-allowing.png)

4. Select the radio button to show notifications for completed builds. **Note:** To select the radio button, you may need to reload the page. 

If you've previously denied CircleCI permission to send you web notifications
then you'll need to turn those permissions on in your browser, as CircleCI can't
request permission in this case. Use your browser settings to control notifications. In Google Chrome you can do this by clicking the lock icon in the URL bar and selecting Notifications from the Permissions Settings as shown in the following animation:

![](  {{ site.baseurl }}/assets/img/docs/notification-granting.gif)

While the process is similar for other browsers, please refer to their individual
documentation for handling web notifications.
