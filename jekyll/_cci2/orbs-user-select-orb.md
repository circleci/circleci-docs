---
layout: classic-docs
title: "Orb User - Selecting an Orb"
short-title: "Orb Registry Selection"
description: "Selectiing an orb to use with your configuration"
categories: [getting-started]
order: 1
---

## Introduction

Once you have configured your platform to work with CircleCI orbs, you should next select an orb to use for your workflows and configuration. The [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) contains a large number of CircleCI and Partner-certified orbs that can greatly simplify your workflows.

### Certified vs. 3rd-Party Orbs

Before selecting the orb you want to use, it is helpful to understand the difference between the orbs found in the Orbs Registry. CircleCI and its partners have made available a number of individual orbs that have been tested and certified to work with the platform, referred to as "CircleCI and Partner-certified orbs." These orbs will be treated as part of the platform and are fully-supported by CircleCI and its partners. 

There are also a number of 3rd party orbs that have been created to meet individual user needs. These orbs were created by individuals and organizations outside of CircleCI. Please note that by using these orbs, CircleCI may only be able to provide you with limited support on using these orbs within your configuration. 

**Note:** In order to use 3rd party orbs, your organization's administrator must opt-in to 3rd-party uncertified orb usage on the **Settings > Security** page for your org.

## Selecting an Orb from the Orb Registry

As was discussed in the above section, the CircleCI Org Registry contains a large number of CircleCI and Partner-certified orbs, in addition to a number of 3rd party orbs that you may also use in your configurations and workflows. Deciding which orb to use depends on your particular configuration and workflow.

To use the CircleCI Orbs Registry, follow the steps below.

1) Go to the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/). By default, Certified and Partner orbs are displayed.

2) Select the view you want displayed for the orbs listed. There are three different tabs you can select: **Certified and Partner**, **Popular**, and **All**. Depending on which of these tabs you select, the orbs for that view will be listed alphabetically.

3) Click on the orb you wish to use from the list. You will then be automatically taken to that orb's page.

4) On that orb's page, you will see detailed information about the orb, including the following information:

* Orb created - The date the orb was created.
* Version published - The date the latest version of the orb was published.
* Releases - a drop-down menu that enables you to select the specific version of the orb you wish to use.

5) Follow the instructions in the **Orbs Quick Start Guide** section to add the orb to your configuration. Notice that there is a **copy code** box that you can select to copy the code to your clipboard.

## See Also
{:.no_toc}

- Refer to [Orb Introduction] ({{site.baseurl}}/2.0/orb-intro/), for a high-level overview of CircleCI orbs.
- Refer to [Configure Your Platform to Work With Orbs] ({{site.baseurl}}/2.0/orbs-user-config/), for information on how to configure your platform to work with CircleCI orbs.
