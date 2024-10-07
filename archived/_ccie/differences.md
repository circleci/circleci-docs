---
layout: enterprise
section: enterprise
title: "Differences from circleci.com"
category: [documentation]
order: 1
description: "Here are the differences between CircleCI.com and CircleCI Enterprise."
hide: true
sitemap: false
---

Below is a list of some of the most significant differences between CircleCI Enterprise
and circleci.com. You'll want to keep these differences in mind if you are coming
to CircleCI Enterprise after using circleci.com, or if you are using circleci.com
[documentation](https://circleci.com/docs/) or [forum posts](https://discuss.circleci.com)
while working with your Enterprise installation.

- **Getting help:** If you are still having trouble after referring to this guide,
[the circleci.com docs](https://circleci.com/docs/), and the
[support forum](https://discuss.circleci.com), you can of course contact support
for more help. The best way to do this is to click the question mark ("?") in the
bottom-right corner of your CircleCI Enterprise web UI. You CircleCI administrator can
choose where questions here are directed, so you can be sure you're going to the right place.
If you're still not sure what to do, you can always reach out to
[CircleCI Enterprise support](https://support.circleci.com/hc/en-us).

<!-- TODO: update when we push circleci-precise-container_0.0.1551 -->
<ul><li><b>Build images:</b> The default build image on CircleCI Enterprise is very similar to
the one on circleci.com, but it's a little bit smaller to optimize the boot time of
builder machines. Additionally, CircleCI Enterprise administrators can customize the
image that builds run in. By default, almost all of the software
<a href="https://circleci.com/docs/1.0/environment/">listed here</a>
is available, except for more limited pre-installed versions of the following languages:
{% include versions.html %}
You can find a complete list of packages pre-installed by default <a href="/docs/assets/versions.txt">here</a>.
</li></ul>

- **Limitations:** Currently, CircleCI Enterprise installs can only run one Linux
image for builds.  This means that users on an enterprise install won't be able
to choose between Precise and Trusty build container images, or custom built
images, as on circleci.com.

- **VPN settings:** If your CircleCI Enterprise installation is not open to the internet, you may
need to connect to a VPN or take other special steps to access the CircleCI UI or SSH builds.
This can vary greatly depending on your organization's network setup, so ask your CircleCI
administrator if you have trouble connecting.

<!-- TODO: Check what the actual current behavior is on this -->

- **iOS/macOS:** The ability to run builds in macOS VMs is optional in CircleCI Enterprise, and not
available in all installations. Ask your administrator if you aren't sure whether your
installation supports macOS.

- **Authentication:** CircleCI Enterprise always uses GitHub (or GitHub Enterprise) for
authentication. In the case of GitHub Enterprise, this means your CircleCI account may
ultimately be connected to an LDAP or SAML identity provider. The SSH keys associated
with GitHub Enterprise (that you can use to access SSH builds on CircleCI), may also
ultimately come from one of these sources. If encounter any issues with authentication,
you will want to work with whomever manages your GitHub (Enterprise) credentials.

- **Fleet Capacity:** In CircleCI Enterprise installations, it is the responsibility
of the CircleCI Enterprise administrator(s) in your organization to ensure that there
are enough builder machines running to handle all the queued builds. If it seems like
your CircleCI cluster is out of capacity (builds are queueing for a long time) you
will need to contact your administrator and have them add more builder machines.
