---
layout: classic-docs
title: "Enabling GitHub Checks"
short-title: "Enabling GitHub Checks"
description: "How to enable GitHub Checks for CircleCI"
categories: [getting-started]
order: 1
---

This document describes how to enable the GitHub Checks CircleCI Setting and authorize the CircleCI Checks app to report workflow status to the GitHub app.

## Overview

GitHub Checks provides your workflow status messages on the GitHub Checks page and enables you to rerun a workflow from the GitHub Checks page. 

After checks are enabled, CircleCI workflow and job status is reported under the checks tab on GitHub. 

![CircleCI Checks]( {{ site.baseurl }}/assets/img/docs/checks_tab.png)

## To Enable GitHub Checks

To use the CircleCI Check integration, you first need to navigate to the Org Setting, then authenticate the repository to use CircleCI Checks as follows:

### Prerequisites

- Your project must be using CircleCI 2.0 with [Workflows]( {{ site.baseurl }}/2.0/workflows/).
- You must be an Admin on your GitHub repository to authorize installation of the CircleCI Checks integration.

### Steps

1. Click the Settings tab in the CircleCI app main menu.
2. Select VCS. 
3. Click the Manage GitHub Checks button. ![CircleCI VCS Settings Page]( {{ site.baseurl }}/assets/img/docs/checks_setting.png)
4. Select the repositories that should utilize checks and click the Install button. ![CircleCI VCS Settings Page]( {{ site.baseurl }}/assets/img/docs/checks_install.png)
After installation completes, the Checks tab in GitHub will be populated with workflow run status information. 


## Checks Status Reporting

CircleCI reports the status of workflows and all corresponding jobs under the Checks tab on GitHub. Additionally, Checks provides a button to rerun each workflow from GitHub Checks tab. 

After the rerun is initiated, CircleCI reruns the workflow from beginning and reposts the status on the Checks tab. To navigate to the CircleCI app from GitHub, click the View more details on CircleCI Checks link. 

**Note:** Your project will stop receiving job level status after GitHub Checks is turned on. You can change this in the GitHub Status updates section of the Project Settings > Advanced Settings page. 

## To Disable GitHub Checks for a Project

To disable the CircleCI Check integration, navigate to the Org Settings Page, then remove the repositories using CircleCI Checks as follows:

### Steps

1. Click the Settings tab in the CircleCI app main menu.
2. Select VCS. 
3. Click the Manage GitHub Checks button. The Update CircleCI Checks repository access page appears. ![CircleCI VCS Settings Page]( {{ site.baseurl }}/assets/img/docs/checks_update.png)
4. Deselect the repository to uninstall the Checks integration.

## To Uninstall Checks for the Organization

1. Click the Settings tab in the CircleCI app main menu.
2. Select VCS.
3. Click the Manage GitHub Checks button.
4. Scroll down and click the Uninstall button to uninstall the GitHub Checks app.


