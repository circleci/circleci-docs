---
layout: enterprise
title: FAQ
category: [enterprise]
order: 4
description: "CircleCI Frequently Asked Questions (FAQs)."
published: true
---



## Installation Questions

#### I submitted the installation form but got an SSL error reported with my GitHub Enterprise installation...

This means that the GitHub Enterprise server is not returning the intermediate SSL certificates. Check your Github Enterprise instance with <https://www.ssllabs.com/ssltest/analyze.html> - it may report some missing intermediate certs. You can use tools like <https://whatsmychaincert.com/> to get the full certificate chain for your server.

#### I started a builder box, but builds are not running...

Builder boxes can take a long time to boot - somewhere on the order of 15-25 minutes, depending on the size of the image.  When they are ready, you should see some directories in `/mnt` (e.g. `/mnt/box5`).  If you go for an hour without your build box being available send us `/home/ubuntu/circle/circle.log`, and we can debug it for you.  It should not contain any sensitive information. You can look for errors related to `btrfs` or `container_fs`.

Common causes:

<!-- TODO: link to supported instance type doc -->

* The box has no attached instance storage
* The box was started on unsupported instance type

Admin users can view the state of their build fleet inside of the CircleCI Enterprise UI.


#### Builder boxes are up, I see `/mnt/boxNN` folders, but builds are not running

Check that your network configuration allows for the services box and builder
boxes to communicate with each other on all ports.

You can confirm that this is the issue by looking for non-localhost traffic in `/var/log/nginx/access.log`.  In a healthy installation, you should see some traffic from the services box's private IP address.

#### Can I use Terraform? CloudFormation? ARM templates? Custom AMIs with Puppet?

Support for various provisioning tools is in the works. Contact <enterprise-support@circleci.com> with specific requests.

#### Can I use AWS Auto Scaling Groups to manage my builder boxes?

Yes! You can configure your ASG with your preferred time-based scaling configuration, and the following instance user data:

```
curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
    SERVICES_PRIVATE_IP=<private ip address of services box> \
    CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
    bash
```

#### My GitHub Enterprise installation doesn't use SSL or uses a self-signed certificate.

When setting up CircleCI Enterprise, the installation wizard has the option to
select the GitHub Enterprise protocol. GitHub Enterprise using HTTP should work out of the box.

If you're using a self-signed cert, or using a custom CA root, you can select the
"HTTPS (with self-signed certificate)" option.  You would also need to
export `CIRCLE_IGNORE_CERT_HOST` to be the GHE domain.  So the builder
initialization command is (replacing `insecure-ghe.example.com` below with the host of your GitHub Enterprise instance):

```
curl https://s3.amazonaws.com/circleci-enterprise/init-builder.sh | \
    SERVICES_PRIVATE_IP=<private ip address of services box> \
    CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
    CIRCLE_IGNORE_CERT_HOST=insecure-ghe.example.com \
    bash
```

#### Can I use HTTP without SSL for webhooks and other communication with CircleCI Enterprise?

We strongly discourage using HTTP and suggest using HTTPS.  You may use
self-signed certificates (and the installer wizard auto-creates a self signed
as well if you wish.

## Operations
---

#### Can I monitor available build containers?

Yes, basic reporting on the state of your build fleet is available in the Admin UI. We welcome your input on what tools or data would be most useful to you in managing your build resources, so let us know at <enterprise-support@circleci.com>

#### How do I provision admin users?

The first user who logs in will automatically be designated an admin user. UI Tools for designating additional admin users can be found under the Users page in the Admin section (normally found at `https://[domain-to-your-installation]/admin/users`).

#### How do I back up and restore all of the data in my installation?

Backup utilities are coming soon. We would love to get some feedback on how you like to maintain backups.  We are planning to provide a CLI tool to generate a backup dump, which you can then upload to your preferred backup storage.  The CLI tool would have a restore option as well.  If you have an alternative preferred workflow, let us know at <enterprise-support@circleci.com>.

Starting with releases in 0.1.x, the following manual mechanism is available:

Backup:

1. Take an EBS snapshot
2. Backup `/etc/circle` independently (this contains sensitive data) in your favorite place

Restore:

1. Start a new version from the AMI
2. Attach the EBS volume
3. Restore `/etc/circle` content
4. Reboot machine

The process works for releases prior to `0.1.0` as well, however, it
requires that the new instance reuse the same private ip address of previous
installation.

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
#### I want to change my settings?  Can I do that?

Yes!  Take a back up of `/etc/circle` -- edit the values in `/etc/circle/user`
appropriately and run `circle-update-settings`.

For changing ssl cert, you can place them in `/etc/circle/ssl/ssl.key` and
`/etc/circle/ssl/ssl.crt` in the services box.

#### How can I gracefully shutdown an instance

<!-- TODO: Document API call -->

SSH into the builder box you are ready to shutdown and run:

```
$ echo '(circle.backend.system/graceful-shutdown)` | lein repl :connect 6005
```

#### Can I run iOS/OS X builds like on circleci.com?

We currently provide limited, early access for iOS builds from CircleCI Enterprise that run on our own cloud of OS X machines. Contact <enterprise-support@circleci.com> for more information.

## General CircleCI Questions
---

#### Do you support "build matrices" (e.g. running a build for each of several different ruby versions)

CircleCI does not support build matrices. There are ways to do this with a fair amount of manual configuration, but such a workaround is incompatible with inferred commands and automatic parallelism support.

#### Can I automatically create and configure projects based on some standard template?

You can use the [API](https://circleci.com/docs/api).  If you need to export settings from CircleCI, let us know - we have an experimental export tool that we can share with you.
