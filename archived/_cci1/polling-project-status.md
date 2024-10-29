---
layout: classic-docs
title: Polling project status using CCMenu, CCTray, etc.
categories: [reference]
description: Polling project status using CCMenu, CCTray, etc.
last_updated: Feb 2, 2013
sitemap: false
---

If you would prefer to poll the status of your projects' builds, rather than rely on
notifications, CircleCI offers an implementation of the
[Multiple Project Summary Reporting Standard](https://github.com/erikdoe/ccmenu/wiki/Multiple-Project-Summary-Reporting-Standard),
which is the format (originally from CruiseControl) consumed by common CI monitoring tools.

### Configuration

Make sure to use an account api token, which you can find or create in your [user settings page](https://circleci.com/account/api){:rel="nofollow"}

It should be possible to use any of these tools to poll your CircleCI builds, by
configuring them with a URL of the form:
`https://circleci.com/cc.xml?circle-token=:circle-token`

Or, if you only care about a subset of your projects, you can use per-project URLs:
`https://circleci.com/gh/:owner/:repo.cc.xml?circle-token=:circle-token`

You can also use per-branch URLs:
`https://circleci.com/gh/:owner/:repo/tree/:branch.cc.xml?circle-token=:circle-token`

### Access Control

We recommend creating specific, narrowly scoped API tokens. In fact, we created a whole
class of tokens just for this purpose: tokens which give read-only access to the build
status of a single project, and nothing else. You can create and manage these tokens from
the **Project settings &gt; API Tokens** page of any project.

If you prefer, it is also possible to use a user's API token as the circle-token. These
tokens are very powerful, so only do that in a trusted environment!

### Tools

Here are some of the desktop tools we support through this standard:

*   [CCMenu](http://ccmenu.sourceforge.net/):
an macOS menu bar plugin.

*   [BuildNotify](https://bitbucket.org/Anay/buildnotify/wiki/Home):
a GNU/Linux system tray plugin.

*   [CCTray](http://ccnet.sourceforge.net/CCNET/CCTray.html):
a Windows system tray plugin.

And browser plugins we support through this plugin:

*   [CruiseControl Monitor](https://addons.mozilla.org/en-US/firefox/addon/cruisecontrol-monitor/):
a Firefox plugin.

### Notes

If you're using CCMenu, you may have to append `&ccmenu=cc.xml`
(or anything that ends with xml) to the end of your url.

If you run into trouble configuring these, or are using a different tool not on this list,
please [contact us](https://support.circleci.com/hc/en-us).
