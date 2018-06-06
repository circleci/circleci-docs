---
layout: classic-docs
title: "Using the Static Installation Scripts"
category: [administration]
order: 1
description: "Using CircleCI 2.0 static installation scripts."
hide: true
---

# Installation Usage Statistics

This document is for System Administrators who want to automatically send some aggregate usage statistics to CircleCI.  This data enhances our visibility into CircleCI installations and is used to better support you and ensure a smooth transition off 1.0. 

You can Opt-In to this feature by going to settings#usage-statistics and checking the box labeled `Automatically send some usage statistics to CircleCI`.

![](./assets/img/docs/usage-statistics-setting.png)

## Detailed Usage Statistics

#### Weekly Account Usage

| **Name** | **Type**  | **Purpose** |
|  ------- | ------ | ------ |
| account_id | UUID	| _Uniquely identifies each vcs account_ | 
| usage_current_macos | minutes | _For each account, track weekly builds performed in minutes._ | 
| usage_legacy_linux | minutes |	 |  
| usage_current_macos | minutes |  | 
{: class="table table-striped"}

#### Weekly Job Activity
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

## Access
If you would like programatic access to this data in order to better understand your users please contact us.

### Disclaimer

Please reference exhibit C within your terms of contract and our standard license agreement for our complete security and privacy disclosures.
