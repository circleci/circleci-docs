---
layout: enterprise
title: "CircleCI Enterprise Installation Overview"
category: [enterprise]
order: 1
description: "High-level overview of the CircleCI Enterprise Installation process."
---

This article provides a platform-independant overview of CircleCI Enterprise. CircleCI Enterprise matches the experience of <https://circleci.com> but runs behind your organization's firewall, allowing your code, builds, and production hosts to be inaccessible outside of your network.

We are constantly working on making the installation process as smooth as possible and expanding the administrative tooling.  We appreciate your feedback on ways to make CircleCI Enterprise easier and more valuable for you and your team, so please contact us at <enterprise-support@circleci.com> with any suggestions.


## Prerequisites

To setup CircleCI, please have the following handy:

* Domain name and associated DNS Records: GitHub requires applications to register their domains and authentication paths.  For the purposes of this document, we will use `https://circleci.example.com/`

* GitHub application client id/secret info: CircleCI must be registered with
  GitHub as an app.  You can create a new app by visiting <http://github-enterprise.example.com/applications/new> to create an app that you own, or
<http://github-enterprise.example.com/organizations/exampple-org/settings/applications/new> to create an app owned by an organization (in this case `example-org`).
  The authorization callback should use the url set earlier followed with
  /auth/github (eg. `https://circleci.example.com/auth/github`).

* SSL Key and Certificate for the domain: To secure the domain and enable GitHub enterprise webhooks, the service must be secured with SSL. The server requires an appropriate SSL private key and chained certificate files.

### Installation Steps

Once you have all of the prerequisites in place, you can [follow the detailed
installation steps for AWS]({{site.baseurl}}/enterprise/aws/). We are currently beta testing CircleCI on non-AWS environments. Please reach out to <enterprise@circleci.com> if you would like access.


## Architecture

At a high level, CircleCI Enteprise has two kinds of instances that it needs in order to run: the services box and builder boxes.

![A Diagram of the CircleCI Architecture]({{site.baseurl}}/assets/img/docs/enterprise-network-diagram.png)

#### The Services Box
---

The first is a services box which contains the CircleCI frontend and all internal resources we use to store data and run the service. This machine should not be restarted, and should be backed up regularly using our [backup and restore process]({{site.baseurl}}/enterprise/failover/). You should have DNS resolution point to this machine's IP.

| Source                      | Ports                   | Use                    |
|-----------------------------|-------------------------|------------------------|
| End Users                   | 80, 443                 | HTTP/HTTPS Traffic     |
| Administrators              | 22                      | SSH                    |
| Administrators              | 8800                    | Admin Console          |
| Builder Boxes               | all traffic / all ports | Internal Communication |
| Github (Enterprise or .com) | 80, 443                 | Incoming Webhooks      |

#### The Builder Boxes
---

Our Builder Boxes handle running your builds, and store no state themselves. Each builder machine reserves 2CPU/4G for coordinating builds, and then uses the remaining space to create build containers. The larger machine, the more containers it will run. See our [configuration doc]({{site.baseurl}}/enterprise/config/) for more information about how many containers a particular machine can run. Since they store no state, they can be scaled up or down at will. When shutting machines down, be sure to use the `circle-shutdown` command to a gracefully shut down the machine.

| Source                           | Ports                   | Use                                                            |
|----------------------------------|-------------------------|----------------------------------------------------------------|
| End Users                        | 64535-65535             | [SSH into builds feature](https://circleci.com/docs/ssh-build) |
| Administrators                   | 80, 443                 | CircleCI API Access (graceful shutdown, etc)                   |
| Administrators                   | 22                      | SSH                                                            |
| Services Box                     | all traffic / all ports | Internal Communication                                         |
| Builder Boxes (including itself) | all traffic / all ports | Internal Communication                                         |

#### Github
---

| Source        | Ports   | Use          |
|---------------|---------|--------------|
| Services Box  | 22      | Git Access   |
| Services Box  | 80, 443 | API Access   |
| Builder Boxes | 22      | Git Access   |
| Builder Boxes | 80, 443 | API Access   |
