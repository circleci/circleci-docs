---
layout: classic-docs
title: "Enabling GitHub Checks"
short-title: "Enabling GitHub Checks"
description: "How to enable GitHub Checks for CircleCI"
categories: [getting-started]
order: 1
contentTags: 
  platform:
  - Cloud
---

This document describes how to enable the GitHub Checks feature and authorize CircleCI to report workflow status to the GitHub app. **The GitHub checks integration feature is not currently available on CircleCI server**.

## GitHub Check and GitHub status updates
{: #github-check-and-github-status-updates }

GitHub Checks should not be confused with GitHub status updates:

* GitHub Checks are administered from the GitHub UI, and are reported in the GitHub UI per _workflow_.
* GitHub status updates are the default way status updates from your builds are reported in the GitHub UI, and they are reported per _job_.

If both these features are enabled, in a GitHub PR view the Checks tab will show workflow status and the Checks section in the PR conversation view will show job status.

## Overview
{: #overview }

GitHub Checks provides you with workflow status messages and gives the option to rerun workflows from the GitHub Checks page.

After GitHub Checks is enabled, CircleCI workflow status is reported under the checks tab on GitHub.

![CircleCI Checks]( {{ site.baseurl }}/assets/img/docs/checks_tab.png)

**Note:** GitHub does not currently provide a granular way for you to rerun workflows. Because CircleCI uses checks that are mapped to workflows (e.g. a single configuration may have one or more workflows), when you select the Re-run checks button, you will automatically re-run all checks, regardless of whether you selected "re-run failed checks" or "rerun all checks" from the Re-run checks button.

## To enable GitHub Checks
{: #to-enable-github-checks }

To use the CircleCI Check integration, you first need to navigate to your **Organization Settings**, then authenticate the repository to use Checks as follows:

### Prerequisites
{: #prerequisites }

- You must be using the cloud-hosted version of CircleCI.
- Your project must be using [Workflows]( {{ site.baseurl }}/workflows/).
- You must be an Admin on your GitHub repository to authorize installation of the CircleCI Checks integration.

### Steps
{: #steps }

1. In the CircleCI app sidebar, select **Organization Settings**.
2. Select **VCS**.
3. Click the **Manage GitHub Checks** button. ![CircleCI VCS Settings Page]( {{ site.baseurl }}/assets/img/docs/screen_github_checks_new_ui.png)
4. Select the repositories that should utilize checks and click the Install button.

After installation completes, the Checks tab when viewing a PR in GitHub will be populated with workflow status information, and from here you can rerun workflows or navigate to the CircleCI app to view further information.

## Checks status reporting
{: #checks-status-reporting }

CircleCI reports the status of workflows and all corresponding jobs under the Checks tab on GitHub. Additionally, Checks provides a button to rerun all workflows configured for your project.

After a rerun is initiated, CircleCI reruns the workflows from the start and reports the status in the Checks tab. To navigate to the CircleCI app from GitHub, click the **View more details on CircleCI Checks** link.

**Note:** Your project will stop receiving job level status after GitHub Checks is turned on. You can re-enable this in the GitHub Status updates section of the **Project Settings** > **Advanced Settings** page in the CircleCI app.

## To disable GitHub Checks for a project
{: #to-disable-github-checks-for-a-project }

To disable the GitHub checks integration, navigate to the **Organization Settings** page in the CircleCI app, then remove the repositories using GitHub Checks, as follows:

### Steps
{: #steps }

1. Click the **Organization Settings** option in the CircleCI sidebar.
2. Select VCS.
3. Click the Manage GitHub Checks button. The Update CircleCI Checks repository access page appears.
4. Deselect the repository to uninstall the Checks integration. Click Save. - If you are removing GitHub checks from the only repo you have it installed on, you will need to either Suspend or Uninstall CircleCI Checks.
5. Confirm that GitHub status updates have been enabled on your project so you will see job level status within PRs in GitHub: Go to the CircleCI app and navigate to **Project Settings** > **Advanced Settings** > Confirm that the setting `GitHub Status Updates` is set to `on`.

![CircleCI VCS Settings Page]( {{ site.baseurl }}/assets/img/docs/screen_github_checks_disable_new_ui.png)

## To uninstall Checks for the organization
{: #to-uninstall-checks-for-the-organization }

1. Click the **Organization Settings** option in the CircleCI sidebar.
2. Select VCS.
3. Click the Manage GitHub Checks button.
4. Scroll down and click the Uninstall button to uninstall the GitHub Checks app.


## Troubleshooting – GitHub Checks waiting for status in GitHub
{: #troubleshooting-github-checks-waiting-for-status-in-github }

`ci/circleci:build — Waiting for status to be reported`

If you have enabled GitHub Checks in your GitHub repository, but the status check never completes on GitHub Checks tab, there may be status settings in GitHub that you need to deselect. For example, if you choose to protect your branches, you may need to deselect the `ci/circleci:build` status key as this check refers to the job status from CircleCI, as follows:

![Uncheck GitHub Job Status Keys]({{ site.baseurl }}/assets/img/docs/github_job_status.png)

Having the `ci/circleci:build` checkbox enabled will prevent the status from showing as completed in GitHub when using a GitHub Check because CircleCI posts statuses to GitHub at a workflow level rather than a job level.

Go to **Settings** > **Branches** in GitHub and click the **Edit** button on the protected branch to deselect the settings, for example `https://github.com/your-org/project/settings/branches`.

