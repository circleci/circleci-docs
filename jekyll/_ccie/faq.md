---
layout: enterprise
section: enterprise
title: Operational FAQ
category: [resources]
order: 2
description: "CircleCI Frequently Asked Questions (FAQs)."
published: true
---


#### Can I monitor available build containers?

Yes, basic reporting on the state of your build fleet is available in the Admin UI. We welcome your input on what tools or data would be most useful to you in managing your build resources, so let us know at <enterprise-support@circleci.com>

#### How do I provision admin users?

The first user who logs in will automatically be designated an admin user. UI Tools for designating additional admin users can be found under the Users page in the Admin section (normally found at `https://[domain-to-your-installation]/admin/users`).

#### Oops - lost my builder instructions?  How can I get the passphrase and private ip address?

SSH into into the services box, and run the following:

```
$ # To get the passphrase
$ grep PASSPHRASE /etc/circle/generated
CIRCLE_SECRET_PASSPHRASE=xxxxxxxxxxxxxxxxxxxx
$
$ # To get private ip address
$ ifconfig eth0 | grep "inet addr"
          inet addr:10.0.0.235  Bcast:10.0.0.255  Mask:255.255.255.0
```

#### How can I change my passphrase?

First, you need to change your passphrase from the system console (services box port 8800) settings page and restart your app.

Then, you need to update `CIRCLE_SECRET_PASSPHRASE` in the init script that you are using to add builder boxes to your fleet.

Now new builder boxes joining the fleet will use the new passphrase. Existing builder boxes with old passphrase also continue functioning without any real problems but we recommend rolling these box as soon as you can
just in order to use the consistent passphrase in your fleet.


#### How can I gracefully shutdown an instance

<!-- TODO: Document API call -->

SSH into the builder box you are ready to shutdown and run:

```
$ echo '(circle.backend.system/graceful-shutdown)` | lein repl :connect 6005
```

#### Can I run iOS/OS X builds like on circleci.com?

We currently provide limited, early access for iOS builds on CircleCI Enterprise that run on our own cloud of OS X machines. Contact <enterprise-support@circleci.com> for more information.
