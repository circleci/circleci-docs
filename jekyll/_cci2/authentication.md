---
layout: classic-docs
title: "Authentication"
short-title: "Authentication"
description: "Configuring LDAP Authentication"
categories: [administration]
order: 9
---

This document describes how to enable, configure, and test CircleCI to authenticate users with OpenLDAP or Active Directory credentials.

## Prerequisites

- Install and configure your LDAP server and Active Directory.
- GitHub Enterprise must be configured and is the source of organizations and projects to which users have access.
- Install a new instance of CircleCI 2.0 with no existing users using the [Installing CircleCI 2.0 on Amazon Web Services with Terraform]({{ site.baseurl }}/2.0/aws/) document. **Note:** LDAP is not supported with existing installations, only clean installations may use LDAP. 
- Contact [CircleCI support](https://support.circleci.com) and file a feature request for CircleCI installed on your own servers.

**Note:** After completing this configuration, all users must log in to CircleCI with their LDAP credentials. After logging in to CircleCI, each user will then click the Connect button on the Accounts page to connect and authenticate their GitHub account.

## Configure LDAP Authentication 

This section provides the steps to configure LDAP in the management console (Replicated).

1. Log in to the management console for a newly installed CircleCI 2.0 instance as the `admin` user.
2. Check the LDAP button on the Settings page.
- Select OpenLDAP or Active Directory
3. Fill in you LDAP instance Hostname and port number.
4. Select the encryption type (plain text is not recommended).
5. Fill in the Search user field with the LDAP admin username using the format `cn=<admin>,dc=<example>,dc=<org>` replacing `admin`, `example`, and `org` with appropriate values for your datacenter.
6. Fill in the Search password field with the LDAP admin password.
7. Fill in the User search DN field with an approrpiate value using the format `ou=<users>` replacing `users` with the value used in your LDAP instance.
8. Fill in the Username field with an approriate unique identifier used for your users, for example, `mail`.
9. Fill in the Group Membership field with an appropriate value. By default, the value is `uniqueMember` for OpenLDAP and `member` for Active Directory. This field will list member `dn` for a group.
10. Fill in the Group Object Class field with an approrpiate value. By default, the value is `groupOfUniqueNames` for OpenLDAP and `group` for Active Directory. The value of the `objectClass` field indicates a `dn` is a group.
11. (Optional) Fill in the Test username and Test password fields with a test email and password for an LDAP user you want to test.
12. Save the settings.

A user who logs in will be redirected to the Accounts page of the CircleCI application with a Connect button that they must use to connect their GitHub account. After they click Connect, an LDAP section with their user information (for example, their email) on the page will appear and they will be directed to authenticate their GitHub account. After authenticating their GitHub account users are directed to the **Job page** to use CircleCI.

**Note:** A user who has authenticated with LDAP and is then removed from LDAP/AD will be able to access CircleCI as long as they stay logged in (because of cookies). As soon as the user logs out or the cookie expires, they will not be able to log back in. A users' ability to see projects or to run builds is defined by their GitHub permissions. Therefore, if GitHub permissions are synced with LDAP/AD permissions, a removed LDAP/AD user will automatically lose authorization to view or access CircleCI as well.
