---
layout: classic-docs
title: "Connect Jira with CircleCI"
description: "Connecting Jira with CircleCI"
contentTags:
  platform:
  - Cloud
---

Integrate your CI/CD build and deployment status notifications directly into your Jira cards. Connect your CircleCI jobs with Jira Cloud using the following:

* The [CircleCI for Jira](https://marketplace.atlassian.com/apps/1215946/circleci-for-jira) Atlassian Forge application
* The [circleci/jira](https://circleci.com/developer/orbs/orb/circleci/jira) orb

## Installation steps
{: #installation-steps }

### Install the CircleCI for Jira app
{: #install-the-circleci-for-jira-app }

1. Install the [CircleCI for Jira](https://marketplace.atlassian.com/apps/1215946/circleci-for-jira) app from the Atlassian Marketplace in the appropriate Jira Cloud instance. To do this you must be a [Jira Admin](https://support.atlassian.com/jira-software-cloud/docs/manage-atlassian-marketplace-apps-in-team-managed-projects/)![Select organization and confirm app installation]({{ site.baseurl }}/assets/img/docs/jira_install_app.png)

1. Navigate to the [configuration page](https://confluence.atlassian.com/upm/viewing-installed-apps-273875714.html). To find the configuration page, navigate to [admin.atlassian.com](https://admin.atlassian.com/), select the appropriate organization, and then on the appropriate Jira instance, click the three-dot menu, and then click **Manage Jira apps**.![manage apps menu]({{ site.baseurl }}/assets/img/docs/jira_manage_apps.png)

1. From the **Manage apps** page, click on the **CircleCI for Jira** app under **User-installed apps** to expand the app details and click **Configure**.![Expand App Details]({{ site.baseurl }}/assets/img/docs/jira_expand_app_details.png)

1. To display the app fully, it is essential that you grant it permission to access Atlassian products on your behalf. Click **Allow access** to authorize.![Allow the app access to Atlassian on your behalf]({{ site.baseurl }}/assets/img/docs/jira_allow_app_access.png)

1. For the initial setup you will need to provide your CircleCI Organization ID, which you can find by navigating to **Organization Settings > Overview** in the [CircleCI application](https://app.circleci.com/).![Get CircleCI Organization ID]({{ site.baseurl }}/assets/img/docs/jira_get_org_id.png)

1. This integration authenticates via [OpenID Connect (OIDC)](/docs/openid-connect-tokens/). By default, the organization ID provided is used for audience validation, but this can be modified, or more can be added.

1. Once you have provided your CircleCI Organization ID and optionally modified the allowed audiences, click **Submit** to save your changes.![Set the Organization ID on the app Configure page]({{ site.baseurl }}/assets/img/docs/jira_set_organization_id.png)

1. Now copy your **Webhook URL** for use in the next section.![Click on button to copy the Webtrigger URL]({{ site.baseurl }}/assets/img/docs/jira_copy_webtrigger_url.png)


### Configure the Jira orb
{: #configure-the-jira-orb }

The [circleci/jira](https://circleci.com/developer/orbs/orb/circleci/jira) orb is responsible for relaying information about your build or deployment to the CircleCI Jira application.

1. Begin by saving the **Webhook URL** from the previous section as an _environment variable_. This could be added as a [Project Environment Variable](/docs/set-environment-variable/#set-an-environment-variable-in-a-project) or within a [Context](/docs/set-environment-variable/#set-an-environment-variable-in-a-context). We recommend naming the variable `JIRA_WEBHOOK_URL`.
1. Next, import the Jira orb into your `.circleci/config.yml` file and implement the `jira/notify` command at the _end_ of your build and deployment jobs. Detailed and up-to-date configuration examples can be found on the [orb page](https://circleci.com/developer/orbs/orb/circleci/jira#usage-examples).

## View build and deploy statuses in Jira
{: #view-build-and-deploy-statuses-in-jira }

The [circleci/jira](https://circleci.com/developer/orbs/orb/circleci/jira) orb automatically detects the Jira ticket number from the branch name or commit message. The build or deployment status is then posted to the appropriate Jira ticket. You can view build and deployment information, natively, in the right sidebar of any Jira ticket.

![Jira build status]({{ site.baseurl }}/assets/img/docs/jira_ticket_sidebar.png)

From this sidebar menu you can click into the build or deployment information to view the full CircleCI job details.

![Jira builds tab]({{ site.baseurl }}/assets/img/docs/jira_builds_tab.png)