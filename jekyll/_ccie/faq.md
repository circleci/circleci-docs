---
layout: enterprise
section: enterprise
title: FAQ
category: [documentation]
order: 2
description: "CircleCI Frequently Asked Questions (FAQs)."
published: true
sitemap: false
---

* TOC
{:toc}

#### Can I monitor available build containers?

Yes, basic reporting on the state of your build fleet is available in the CircleCI Admin application. Refer to the  [CloudWatch Monitoring]({{site.baseurl}}/enterprise/cloudwatch/) document for how to enable additional container monitoring for AWS.

#### How do I provision admin users?

The first user who logs in to the CircleCI application will automatically be designated an admin user. Options for designating additional admin users are found under the Users page in the Admin section at `https://[domain-to-your-installation]/admin/users`.

#### How can I retrieve the passphrase and private IP address if it is lost?

SSH into into the services box, and run the following:

```
$ # To get the passphrase
$ circleci get-secret-token
CIRCLE_SECRET_PASSPHRASE=xxxxxxxxxxxxxxxxxxxx
$
$ # To get private ip address
$ ifconfig eth0 | grep "inet addr"
          inet addr:10.0.0.235  Bcast:10.0.0.255  Mask:255.255.255.0
```

#### How can I change my passphrase?

1. Change your passphrase on the system console (services box port 8800) settings page.

2. Restart the application.

3. Update `CIRCLE_SECRET_PASSPHRASE` in the `init` script that you use to add builder boxes to your fleet.

New builder boxes joining the fleet will use the new passphrase. Existing builder boxes with the old passphrase will also continue functioning. But, it is best practice to restart these boxes as soon as you can to use the consistent passphrase across your fleet.


#### How can I gracefully shutdown a Builder instance?

1. Get an admin token from `/etc/circle-bot/.circle-bot-token` on the services box.

2. Run the following command, replacing *builder IP* with the IP address of the builder you want to shutdown and using the token from Step 1:

```
curl -k -X POST "https://<builder ip>/api/v1/admin/system/shutdown?circle-token=$TOKEN&unstoppable=true"
```
