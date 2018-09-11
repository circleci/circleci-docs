---
layout: classic-docs
title: "Enabling Usage Statistics"
category: [administration]
order: 1
description: "Using CircleCI 2.0 static installation scripts."
hide: true
---

This document is for System Administrators who want to automatically send some aggregate usage statistics to CircleCI as described in the following sections:

* TOC
{:toc}

Usage statistics data enhances visibility into CircleCI installations and is used to better support you and ensure a smooth transition from CircleCI 1.0 to CircleCI 2.0. 

Opt-In to this feature by going to Settings > Usage Statistics on the management console in Replicated. Then, enable the radio button labeled Automatically send some usage statistics to CircleCI as shown in the following screenshot.

![](  {{ site.baseurl }}/assets/img/docs/usage-statistics-setting.png)

## Detailed Usage Statistics

The following sections provide information about the usage statistics CircleCI will gather when this setting is enabled.

### Weekly Account Usage

| **Name** | **Type**  | **Purpose** |
|  ------- | ------ | ------ |
| account_id | UUID	| _Uniquely identifies each vcs account_ | 
| usage_current_macos | minutes | _For each account, track weekly builds performed in minutes._ | 
| usage_legacy_macos | minutes |	 |  
| usage_current_linux | minutes |  | 
| usage_legacy_linux | minutes |  | 
{: class="table table-striped"}

### Weekly Job Activity

| **Name** | **Type**  | **Purpose** |
|  ------- | ------ | ------ |
| utc_week | date | 	_Identifies which week the data below applies to_ | 
| usage_oss_macos_legacy | 	minutes | 	_Track builds performed by week_ | 
| usage_oss_macos_current | 	minutes	  |  | 
| usage_oss_linux_legacy | 	minutes	  |  | 
| usage_oss_linux_current | 	minutes	  |  | 
| usage_private_macos_legacy | 	minutes	  |  | 
| usage_private_macos_current | 	minutes	  |  | 
| usage_private_linux_legacy | 	minutes	  |  | 
| usage_private_linux_current | 	minutes	  |  | 
| new_projects_oss_macos_legacy | 	sum	 | _Captures new Builds performed on 1.0. Observe if users are starting new projects on 1.0._ | 
| new_projects_oss_macos_current | 	sum	  |  | 
| new_projects_oss_linux_legacy | 	sum	  |  | 	 
| new_projects_oss_linux_current | 	sum	  |  | 	 
| new_projects_private_macos_legacy | 	sum	  |  | 	 
| new_projects_private_macos_current | 	sum	  |  |  
| new_projects_private_linux_legacy | 	sum	  |  |  
| new_projects_private_linux_current | 	sum	  |  |  
| projects_oss_macos_legacy | 	sum	  |  _Captures Builds performed on 1.0 and 2.0. Observe if users are moving towards 2.0 or staying with 1.0._ |
| projects_oss_macos_current | 	sum	  |  | 
| projects_oss_linux_legacy	 | 	sum	  |  | 
| projects_oss_linux_current | 	sum	  |  | 
| projects_private_macos_legacy | 	sum	  |  | 
| projects_private_macos_current | 	sum	  |  | 
| projects_private_linux_legacy | 	sum	  |  | 
| projects_private_linux_current | 	sum	  |  | 
{: class="table table-striped"}

## Accessing Usage Data
If you would like programatic access to this data in order to better understand your users you may run this command from the Services VM.

`docker exec usage-stats /src/builds/extract`

### Security and Privacy

Please reference exhibit C within your terms of contract and our [standard license agreement](https://circleci.com/outer/legal/enterprise-license-agreement.pdf) for our complete security and privacy disclosures.
