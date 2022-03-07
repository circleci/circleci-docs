---
layout: classic-docs
title: "Troubleshooting and Common Issues"
short-title: "Troubleshooting and Common Issues"
description: "Troubleshooting and Common Issues"
readtime: false
version:
- Cloud
---

# Category 1

<details markdown=block>

<summary>Deprecating Ubuntu 14.04 and 16.04 images: EOL 5/31/22</summary>

### Applies to: jobs using `machine: true` or specifying a `14.04 ubuntu` Machine image
{:.no_toc}

* **_Note:_** _Ubuntu 16.04 has reached the end of its LTS window as of April 2021 and will no longer be supported by Canonical. As a result, `ubuntu-1604:202104-01` is the final Ubuntu 16.04 image released by CircleCI. We suggest upgrading to the latest Ubuntu 20.04 image for continued releases and support past April 2021._  
    
Please contact [support@circleci.com ](mailto:support@circleci.com)or open a ticket in the [CircleCI Support Center](https://support.circleci.com/hc/en-us/requests/new) with any questions or issues that arise during migration.

If you don’t [specify a machine image](https://circleci.com/docs/2.0/configuration-reference/#available-machine-images), you are using the default image and you’ll need to take action. 

Currently, when using _`machine: true`_  builds are using a _`Ubuntu 14.04`_ image. If you do not specify an image, your build will be using the default image which will be _`Ubuntu 22.04`_ as of 31-May-2022\. This may lead to a breaking change. 

You can tell if you fall into this category if any of your jobs look like this:

```yaml
jobs:
  build:
    machine: true # This is using the default old machine image
    steps:
      - checkout
```

Or it may look like this which is an example of a 14.04 based image:

```yaml
jobs:
  build:
    machine:
      image: circleci/classic:201709-01 # This is a 14.04 based image
    steps:
      - checkout
```

The following options are available, [given the deprecation of older images](https://discuss.circleci.com/t/old-linux-machine-image-remote-docker-deprecation/37572 "https://discuss.circleci.com/t/old-linux-machine-image-remote-docker-deprecation/37572"), **our recommendation is to update your image following our guides:**

* [Migrating from Ubuntu 14.04 to Ubuntu 20.04](https://circleci.com/docs/2.0/images/linux-vm/14.04-to-20.04-migration/)
* [Migrating from Ubuntu 16.04 to Ubuntu 20.04](https://circleci.com/docs/2.0/images/linux-vm/16.04-to-20.04-migration/)

See our documentation update on our [newer machine images.](https://circleci.com/docs/2.0/configuration-reference/#available-machine-images "https://circleci.com/docs/2.0/configuration-reference/#available-machine-images")

### How to Locate Image Use using GitHub Search  
{:.no_toc}

_This does not find executors used via orbs - keep in mind if you are using an older version of an orb, it may have an executor using the Ubuntu 14.04 and 16.04 images_

### How to look for a Ubuntu 16.04 image
{:.no_toc}

`org:CircleCI-Public ubuntu-1604 path:.circleci filename:config.yml`

Replace `CircleCI-Public` with the org that needs to be search. This searches all projects in that orb that mention that image.   

### How to look for an Ubuntu 14.04 images
{:.no_toc}

`org:CircleCI-Public circleci/classic path:.circleci filename:config.yml`

</details>


<details markdown=block>
<summary>How To Use Caching With Runners</summary>

To utilize the caching feature on a runner, the data that needs to be cached should be placed in a common directory such as /tmp/.

When restoring the cache, the data will be restored in the same common folder.

```yaml
job1:  
    machine: true  
    resource_class: your-namespace/your-resource  
    steps:  
      - run: echo "sent to job 2" >> /tmp/cache.txt  
      - save_cache:  
          paths:  
            - /tmp/cache.txt  
          key: runner-cache-v1              
  
  job2:  
    machine: true  
    resource_class: your-namespace/your-resource  
    steps:  
      - restore_cache:  
          keys:  
            - runner-cache-v1  
      - run: cat /tmp/cache.txt
```

</details>


<details markdown=block>
<summary>How to determine if your build is under-provisioned?</summary>

Each build on CircleCI will be allocated specific vCPUs and memory, based on the [executor type](https://circleci.com/docs/2.0/executor-types/) selected.  
  
We have since [released the Resources tab](https://circleci.com/changelog/#docker-resource-utilization-graphs) on the build UI for builds using the [Docker executor](https://circleci.com/docs/2.0/executor-intro/#docker).  
This will allow developers to understand the CPU and memory utilization profile of their **Docker-executor** builds, especially if they are under-provisioned (or over-provisioned for that matter).  
  
![Under provisioned screenshot]({{site.baseurl }}/assets/img/docs/troubleshooting_images/under_provisioned.png)
  

**Note** that for Docker-executor jobs that [uses multiple images](https://circleci.com/docs/2.0/executor-types/#using-multiple-docker-images), note that this graph accounts for **all of the containers,** not just the primary container.  
In addition, the data points are captured at 15-seconds intervals, so if your job completes before 15 seconds, there would be no data points on the graph then.  
  
You can then provision a larger [resource class](https://circleci.com/docs/2.0/executor-types/#available-docker-resource-classes) to allocate resources accordingly.  
  
</details>

# Category 2

<details markdown=block>
<summary>How to estimate Network ingress and egress (bytes) within a build</summary>

You can view details of your organization's network transfer and storage usage on your Plan > Plan Usage screen. In addition, you can [find out more about how to manage your network and storage costs here](https://circleci.com/docs/2.0/persist-data/#managing-network-and-storage-use).  
  
However, you may like to determine the network transfer (ingress and egress) of a specific build. This may be useful for your team, in order to diagnose which processes in the build may be consuming high network transfer usage for instance.  
  
For Docker-based jobs, we can look at the [networking information, particularly from \`/proc/net/dev\`](https://www.kernel.org/doc/html/latest/filesystems/proc.html#id15), to figure out the network transfer, before and after a specific command.

`cat /proc/net/dev`

Extending on the method above, [here is an example Orb that will calculate the stats to readable format](https://circleci.com/developer/orbs/orb/nanophate/docker-profiling). We can see it in action with an example screenshot below:

![Fig_A.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/estimate_network_egress.png)


To illustrate how to use [the \`network\` command of this Orb](https://circleci.com/developer/orbs/orb/nanophate/docker-profiling#commands-network), you can configure your config like this, to see how much bytes are transmitted and received for a \`curl\` request, for example:

```yaml
version: '2.1'  
  
orbs:  
  profiling: nanophate/docker-profiling@0.3.0  
  
jobs:  
  build:  
    docker:  
      - image: cimg/base:stable  
  steps:  
    - checkout  
    - profiling/network  
```
  
  
**NOTE:** Your overall **Network Transfer** amount is not representative of your billable usage. Only certain actions will result in network egress, which in turn results in billable usage. For more information, do check out our guide here: <https://circleci.com/docs/2.0/persist-data/#overview-of-storage-and-network-transfer>

</details>

<details markdown=block>
<summary>How to Resolve Error: “block-unregistered-user”</summary>

#### **Overview**
{:.no_toc}

The following issue of having unregistered users spend your organization’s credits through unsanctioned builds can be resolved by enabling a plan usage feature that will disable unregistered users from using credits belonging to your organization.

#### **How to Enable Usage Control**
{:.no_toc}

To disable the ability of unregistered users to trigger builds and save credits you can follow these steps:

1\. Visit the Usage Control tab URL (also available on the left-hand column of the application landing page through the Plan tab): app.circleci.com/settings/plan/\[githubORbitbucket\]/\[OrganizationName\]/usage-controls
  
![Fig_A.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/block_unregistered_Fig_A.jpeg)

2\. Toggle on the usage control switch titled “Prevent unregistered user spend”. As noted in the example images below, upon a successful toggle the switch will turn blue.

![Fig_B.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/block_unregistered_Fig_B.jpeg)


![Fig_C.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/block_unregistered_Fig_C.jpeg)
  
  
#### **How to Confirm Usage Control is Enabled**
{:.no_toc}

Once the Usage Control is enabled the feature is effective immediately. Any GitHub/Bitbucket user who is not associated with your organization’s GitHub/Bitbucket account will be unable to trigger a build moving forward, and thus halts their ability to misuse credits.

Should an unregistered user trigger a build in your organization after the feature has been enabled, a failed build will occur in the Pipelines dashboard. Upon clicking into the job, one will note a message displaying “block-unregistered-user”, as noted in the image below:

![Fig_D.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/block_unregistered_Fig_D.jpeg)
  
#### How to Register a User
{:.no_toc}

In order to register a user, they can [sign up for CircleCI](https://circleci.com/signup/) with their respective GitHub or Bitbucket login. If they are part of your organization, they can [follow projects](https://circleci.com/docs/2.0/project-build/#add-projects-page) in order to view build history. 

Once registered they can then be included on the active user list on your Plan Usage page under the Users tab: app.circleci.com/settings/plan/\[githubORbitbucket\]/\[OrganizationName\]/usage

#### How to Turn Off Usage Control
{:.no_toc}

In order to disable the Usage Control and allow unregistered users to trigger builds, one can go into their Usage Controls section in the Plans tab and toggle the switch to an off position as noted in the images below.

Here is a direct link to the Usage Controls section: app.circleci.com/settings/plan/\[githubORbitbucket\]/\[OrganizationName\]/usage-controls

![Fig_C.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/block_unregistered_Fig_C.jpeg)

![Fig_B.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/block_unregistered_Fig_B.jpeg)

</details>


<details markdown=block>
<summary>CircleCI CLI - Running circleci local execute results in "not implemented for cgroup v2 unified hierarchy" error</summary>

When executing the command `circleci local execute`, you may get the following error if your version of Docker is using cgroupsv2:

Error:
Unexpected environment preparation error: error looking up cgroup: not implemented for cgroup v2 unified hierarchy

At this time, we do not support version 2 of cgroups. Please use cgroupsv1 when running the cli locally.

</details>


<details markdown=block>
<summary>Create a windows RAM disk</summary>

If you would like to create a ramdisk within CircleCI you can use the windows program `imdisk` which can be installed using the [chocolatey package manager](https://chocolatey.org/) which comes preinstalled with the Windows executor.

Below you will find an example config.yml which will install the `imdisk` software and then create a ramdisk within the executor.

The issue is that the ramdisk will not be persistent as it will be removed once the machine is stopped.

```yaml
version: 2.1

orbs:
  win: circleci/windows@2.2.0

jobs:
  build:
    executor:
      name: win/default
      shell: powershell.exe
    steps:
      - checkout
      - run: systeminfo
      - run:
          name: "Install imdisk"
          shell: powershell.exe
          command: |
            choco install imdisk
      - run:
          name: "Imdisk"
          command: |
            imdisk -a -s 512M -m X: -p "/fs:ntfs /q /y"
```

`choco install imdisk` will install the imdisk software.

A breakdown of the `imdisk` command from the config.yml is given below:

* \-a initializes the virtual disk.
* \-s 512M is the size, 512 MegaBytes.  
The full choices are b, k, m, g, t, K, M, G, or T.  
These denote a number of 512-byte blocks, thousand bytes, million bytes, billion bytes, trillion bytes, KB, MB, GB, and TB, respectively.
* \-m X: sets up the mount point a.k.a. the drive letter, X:.
* \-p "fs:ntfs /q /y" formats the drive.  
\-p's parameters are actually for Windows' format program.  
So, if you want the RAM disk in a different filesystem, just change ntfs to fat (FAT16) or fat32 (FAT32).

For more information on `imdisk` please see [this link](https://sourceforge.net/p/imdisk-toolkit/doc/Home/)

</details>


<details markdown=block>
<summary>Setup Workflows re-run from UI contains the continuation key error: {"message":"Key has expired."}</summary>

This error can be encountered if attempted to re-run the [Setup Workflow](https://circleci.com/docs/2.0/dynamic-config/) from the UI.  
  
For security and consistency reasons, continuation is allowed once per pipeline, and only for a certain amount of time after the setup phase started - if you see the the pipeline erroring instead of continuing it, please be aware this to prevent malicious continuing.

</details>


<details markdown=block>
<summary>Build Fails due to SSL Handshake</summary>

On **Tuesday November 16, 2021**, GitHub sunset their DSA SHA256 key. 

Details on this key sunset are here:

<https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints> 

This would cause a custom image that has not updated \`git\` before November 16, 2021 to fail with the following error while attempting to \`checkout\` from GitHub:

Either git or ssh (required by git to clone through SSH) is not installed in the image. Falling back to CircleCI's native git client but the behavior may be different from official git. If this is an issue, please use an image that has official git and ssh installed.
Cloning git repository

error cloning repository: ssh: handshake failed: knownhosts: key mismatch  
  
In this case, it will be necessary to update git on your custom image to utilize one of the recommended keys GitHub lists in the above documentation. 

</details>


<details markdown=block>
<summary>Getting Started with GitHub SSO</summary>

### Enable SSO for SSH Keys and Tokens
{:.no_toc}

To get set up with GitHub SSO, there are a couple of settings a user must configure on their account. Follow the below instructions; failure to do so may cause access issues with some GitHub functionality, such as project [deploy/user SSH keys](https://circleci.com/docs/2.0/gh-bb-integration/#deployment-keys-and-user-keys), ability to initiate pipelines and edit config, etc.

1. Log into GitHub and navigate to your user’s Settings → SSH and GPG keys ([direct link here](https://github.com/settings/keys)).
2. For each key used in one or more protected orgs, **Configure SSO** → **Authorize** the org(s) so that the key can access protected resources:  
![Github SSO screenshot]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/github_sso.png)

3. These SSH keys should now have access to the protected orgs. No further action within CircleCI is required.

### Enabling SSO for Tokens and Apps
{:.no_toc}

If using GitHub personal access tokens in your CircleCI pipelines, you’ll also need to **Enable SSO** for each token. Follow the same steps as above:

1. Go to Settings → Developer Settings → Personal access tokens
2. Follow the same steps as described above to enable protected org access for these tokens.

### Common Issues
{:.no_toc}

See our support article [here](/hc/en-us/articles/360043002793) for troubleshooting common SSO/SAML-related issues for user GitHub OAuth credentials (used for most interactions with CircleCI, including creating pipelines on new commits).

For troubleshooting issues with GitHub SSH keys and personal access tokens, see the above sections.

</details>


<details markdown=block>
<summary>Test split outputs warning: "Error reading historical timing data: file does not exist"</summary>

`circleci tests split` can output the following warning:

Error reading historical timing data: file does not exist

This can happen for several reasons including, but not limited to:

1. The [job parallelism](https://circleci.com/docs/2.0/configuration-reference/#parallelism) is set to 1\. Parallelism needs to be set to at least 2 to generate and attach historical timing data
2. The test splitting job has not had a successful test run that generated the appropriate JUnit XML or Cucumber JSON formatted test results file
3. The test results files are not stored via [store\_test\_results](https://circleci.com/docs/2.0/collect-test-data/)

</details>


<details markdown=block>
<summary>Unable to Override PATH or NVM_DIR environment variables with Ubuntu 20.04 Machine images</summary>

Ubuntu 20.04 images set `$BASH_ENV` in a way that they can not be overridden via the `environment` parameter.

For example, the following with not change the `$PATH`

```yaml
steps:
  - run:
      environment:
        PATH: /usr/local/bin

jobs:
  build:
    environment:
        PATH: /usr/local/bin
```

To work around this issue, customers can add an export step at the top of the `run` step where the environment variable is used

```yaml
- run: |
    export PATH=/usr/local/bin
    # additional commands
```

</details>


<details markdown=block>
<summary>"Max number of workflows exceeded." error</summary>

CircleCI Dynamic Configs, formally known as Setup Workflows, allows for a maximum of 1 workflows in the initial setup workflow. So if \`setup: true\` is set then the following config would be invalid:  
  
```yaml
workflows:
  one:
    jobs:
      - unit-tests
  two:
    jobs:
      - integration-tests
```
  
Customers can work around this by trying to combine both workflows into a single workflow:

```yaml
workflows:
  one:
    jobs:
      - unit-tests
      - inegration-tests
```

**Note**: More than one workflow can be defined within a dynamic config, and the above error can be avoided as long as conditional parameters are set so that only one workflow will be executed.

</details>


<details markdown=block>
<summary>Support for Scheduled Workflows in Dynamic Configs / Setup Workflows</summary>

Scheduled workflows are not currently supported with Dynamic Configs / Setup Workflows

At the moment you can utilize the following as a workaround:

<https://discuss.circleci.com/t/workaround-using-scheduled-workflows-with-dynamic-config/40344>

</details>


<details markdown=block>
<summary>Unable to follow project (HTTP Error 422)</summary>

If when you're **unable to follow a project** and see a pop-up error or if, in some instances, nothing happens.

1. Open your **browser console**.
2. Check if the **following errors** are present:

```
POST https://circleci.com/api/v1.1/project/gh/<yourorganization>/<yourproject>/follow 422 (Unprocessable Entity)
```

_**Note**: In the above error message, `<yourorganization>` will be replaced with your organization name and `<yourproject>` will be replaced by the name of the project you're trying to follow._

```
Uncaught (in promise) Error: {"message":"{\"message\":\"Validation Failed\",\"errors\":[{\"resource\":\"Hook\",\"code\":\"custom\",\"message\":\"Hook already exists on this repository\"}],\"documentation_url\":\"https://docs.github.com/rest/reference/repos#update—a—repository—webhook\"}"}
```

If you do see the above errors, this suggests the presence of multiple CircleCI webhooks in the related repository settings.

**To resolve the issue:**

1. Go to the **"Webhooks"** section of the corresponding **GitHub repository settings** > `https://github.com/<ORG>/<REPO>/settings/hooks`.

2. Delete any additional CircleCI webhook so that only one remains.

_**Important note**: the webhook we're referring to above is the CircleCI webhook in the GitHub repository settings. It is completely distinct from any webhook you configured in the CircleCI UI under Project Settings > Webhooks._

</details>


<details markdown=block>
<summary>Why am I seeing OOM (Out of Memory) 137 errors using Remote Docker?</summary>

You may be using a Docker resource class with a 16GB or higher memory limit. However, be mindful that Remote Docker is not using the resource class resources that you specify.

[Remote Docker containers have a **set limit of 8GB** memory](https://circleci.com/docs/2.0/building-docker-images/#specifications). Any instructions for the Remote Docker will be executed on the remote container with 8GB memory. As such you may hit an `OOM 137` error at 8GB regardless of the resources available to the Docker executor resource class you selected.

You may want to consider using an appropriately sized [machine executor](https://circleci.com/docs/2.0/executor-types/#using-machine) in place of Remote Docker. This way you will have control of the specifications of the executor you wish to build on.
</details>


<details markdown=block>
<summary>Scheduled workflows did not run</summary>

_**Note:** In an effort to provide more flexibility and control we have launched Scheduled Pipelines, with the ability to schedule your pipelines to run via the Project Settings or the API, which you can read more about here:_

_<https://circleci.com/docs/2.0/scheduled-pipelines/>_

### Scheduled workflows no longer running
{:.no_toc}

If you notice that scheduled workflows that were previously triggered according to the schedule specified in your `config.yml` suddenly stopped running, you'll need to check the last **non-scheduled** build attempt on the related branch (triggered by a push, a pull-request or via the CircleCI API).

If that build attempt resulted in a `Build Error` failure due to a `Config Processing Error` (which happens if the configuration file is invalid), **then all currently scheduled workflows will get unscheduled**.

To restore the schedule you'll need to trigger a new build (with a valid configuration file) on the related branch.

### Gap in the scheduled workflows runs
{:.no_toc}

In case you see a gap in the scheduled workflows runs (they stopped running for a period of time, and then started running again), this means that at some point a build was triggered with an invalid configuration file which caused the situation described above.

Then another build was subsequently triggered with a valid configuration file, and the schedule was restored.

</details>


<details markdown=block>
<summary>Jobs Making Use of Docker Layer Caching and --mount=type=cache fail with the error: no such file or directory</summary>

Jobs making use of `--mount=type=cache` running a `docker build` can fail with the following error:

```
failed to solve with frontend dockerfile.v0: failed to solve with frontend gateway.v0: rpc error: code = Unknown desc = failed to build LLB: executor failed running [/bin/sh -c test]: stat /var/lib/docker/overlay2/XXXXXXXXXXXXXXXX: no such file or directory
```

To solve this issue, increment the `id` field. Change:

```
--mount=type=cache,id=v1
```

to:

```
--mount=type=cache,id=v2
```

</details>

# Category 3

<details markdown=block>
<summary>Backtick (`) unable to be used in project level environment variables</summary>

If the value you need to store in an environment variable contains a backtick (i.e. `` ` ``) you will not be able to store it as a [project-level environment variable](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-project). However, you can store the variable and value instead at either the [context level](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-context) or within the [job itself](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-job). One note is that storing it at the job level is not secure and will expose the value within your configuration file.

</details>


<details markdown=block>
<summary>Forked private repositories do not show in project list</summary>

When forking a private repository to another organization, the repository will not show up on the projects list for the downstream organization unless the original organization grants permission.

As a workaround, you can recreate the repository under your organization. However, this will not allow you to pull down new changes from the original repository as it is not a fork.

</details>


<details markdown=block>
<summary>How to Run CircleCI CLI in Debug mode?</summary>

If you use **CircleCI CLI** to build locally and want to troubleshoot, then the `--debug` option could be of big help.

Please check the below example to know how to use the debug option:

**Examples**:

`circleci --debug config validate`

`circleci --debug diagnostic`

For more help, see the documentation here: <https://circleci.com/docs/2.0/local-cli/>

If you have any more questions, please submit a ticket to [Support](https://support.circleci.com/hc/en-us) or write to [support@circleci.com](mailto:support@circleci.com).

</details>


<details markdown=block>
<summary>CircleCI Runner fails with "We cannot run this job using the selected resource class." even though resource class is correct.</summary>

Customers may receive the following error when installing the CircleCI Runner

"We cannot run this job using the selected resource class. Please check your configuration and try again."

If you have verified that the namespace and resource class have been created correctly, the issue may be that the CircleCI Runner is not enabled for your plan.

You can verify that the namespace and resource class have been created correctly with the following command in the CircleCI CLI. Replace "namespace-name" with the name of your namespace. You should see your resource class listed in the response.

`circleci runner resource-class list namespace-name`

You can get in touch with our support team to help debug the issue by submitting a [support ticket](https://support.circleci.com/hc/en-us/requests/new).

</details>


<details markdown=block>
<summary>Troubleshooting Remote Docker via syslog and dmesg</summary>

The following can be added to assist in troubleshooting networking and other issues with Remote Docker. This should be added as the next steps immediately after [setup\_remote\_docker](https://circleci.com/docs/2.0/configuration-reference/#setup%5Fremote%5Fdocker)


```yaml
- run:  
    background: true  
    command: ssh remote-docker "sudo tail -f /var/log/dmesg"  
- run:  
    background: true  
    command: ssh remote-docker "sudo tail -f /var/log/syslog"
```

</details>


<details markdown=block>
<summary>Integers longer than 6 digits will be converted in job level environment variables</summary>

When setting a [job level environment variable](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-job), if the value is an integer and greater than 6 digits, we will convert it to an exponential number. As an example:

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      NUMBER: 7777777
```

The above would become instead `7.777777e+06` in the job. The reason for this conversion is how yaml interprets the value being passed. However, this can be avoided in a few different ways.

## Store value as a string
{:.no_toc}

Instead of setting the value as an integer instead set it as a string. So instead of `7777777` set it to `"7777777"` like this:

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      NUMBER: "7777777"
```

## Set the variable at the project level
{:.no_toc}

Instead of setting the variable in your `config.yml` directly, you can instead [set the variable at the project level](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-project) to utilize in jobs. This will ensure the value is protected and not automatically converted.

</details>

<details markdown=block>
<summary>Build "Not Running" due to concurrency limit but no other job is running</summary>

### Why is this happening?
{:.no_toc}

If a job is not starting and showing a status "**Not Running**" after you triggered a pipeline, it means that you have reached the **concurrency limit** of your plan.

This is most likely to happen to customers on our [Free Plan](https://circleci.com/pricing/), as they have access to use a single container at any one time (1x concurrency), therefore jobs will queue if that container is already in use.

However, customers on plans with a higher concurrency limit can also encounter this situation.

The delayed start of your job, and the fact it remains in a "Not Running" state before eventually starting, is due to the fact that other jobs are still running when the new job is triggered.

### Check for running SSH jobs
{:.no_toc}

We found that this situation frequently arises due to running SSH jobs; once you navigate away from a running SSH job it won't appear in the pipelines view, so one can assume that no jobs are running at the time.

SSH jobs, along with all jobs in a given project are listed in the "**legacy jobs view**":

`https://app.circleci.com/pipelines/{vcs}/{org}/{project}/jobs`

An SSH job will remain available for an SSH connection for **10 minutes after the job finishes** \- if SSH has not been accessed, then the job will **automatically end after 10 minutes**.

After you SSH into the job, the SSH connection will remain open for **up to two hours**. That's why we advise to always manually cancel SSH jobs after you have finished with them to make sure your build queue is as free as possible.

To do so, please follow instructions outlined in the Support article "[How to see running SSH jobs](https://support.circleci.com/hc/en-us/articles/360047125652-How-to-see-running-SSH-jobs)".

</details>


<details markdown=block>
<summary>Change SSH key formats during a job</summary>

Some tools can have issues with the newer key formats generated and used by CircleCI. In these situations it can be helpful to change the key format within the VM so that. older tools can communicate using them. For example, [JGit+JSch can fail](https://clojure.atlassian.net/browse/TDEPS-91?page=com.atlassian.jira.plugin.system.issuetabpanels%3Aall-tabpanel) on CircleCI when using the newer OpenSSH keys created by default. 

Using ssh-keygen, we can modify the key at run time to a RSA format.   
  
**ssh-keygen -p -f \~/.ssh/id\_rsa -m pem -q -N ""** 
  
This will reformat the key, and it can successfully be used for authentication.

</details>

# Category 4

<details markdown=block>
<summary>Speed up steps using a RAM disk</summary>

Tasks which are heavily dependent on disk IO can be sped up by performing those operations in memory, and avoiding the disk. This is especially true if you're using the Docker executor on CircleCI, and we have an in depth [blog post here](https://circleci.com/blog/the-issue-of-speed-and-determinism-in-ci/) about the issue.

### Docker Executor
{:.no_toc}

On the docker executor we have enabled an available RAM disk by default which you can use to dramatically increase step speeds. This is highly encouraged for steps like cache/workspace restores. You can read about configuring it [in our docs here](https://circleci.com/docs/2.0/executor-types/#ram-disks).

The short version is that you have access to a special directory, **/mnt/ramdisk**, which acts as any other directory. Files stored here will use the machines assigned resource class memory. For instance, you can set your entire working directory to be stored in memory with **working\_directory: /mnt/ramdisk** in your job configuration.

### Other executors  
{:.no_toc}

The RAM disk is not configured by default on other executors. It's less likely that you'll need it because they operate as isolated VMs, and avoid the issues outlined in the blog post mentioned above. You may still find that a RAM disk offer performance benefits over utilizing the hard disk. In other executors (Machine, MacOS, etc) you have far more control over the environment, so it's possible to configure a RAM disk yourself. Using instructions such as [this stack exchange answer](https://unix.stackexchange.com/questions/66329/creating-a-ram-disk-on-linux) for Linux based systems

#### Windows  
{:.no_toc}

To configure a RAM disk on windows please see our guide [linked here](https://support.circleci.com/hc/en-us/articles/4411520952091)

</details>


<details markdown=block>
<summary>Resolving "Failed to minify the bundle" Errors</summary>

The following error message is usually related to running out of memory during a job:

```
Failed to minify the bundle. Error: static/js/12.fb78ba11.chunk.js from Terser
Error: Call retries were exceeded
```

Webpack4 starts using `terser-webpack-plugin` to minify your JavaScript as default. The default parallel option in `terser-webpack-plugin` is set to the number of CPUs `(os.cpus().length - 1)`. It means the function references the actual VM's CPU count, and it's a bigger number of CPUs than the docker executor has. Therefore, Webpack will make more workers than the vCPU counts, and it causes this error.

  
To work around this, you will need to specify the parallel option to set to the same number as the vCPUs. For example:

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: 2,
      }),
    ],
  }
};

```

More information about this can be found at the links below:

<https://webpack.js.org/configuration/optimization/#optimizationminimizer>  
<https://webpack.js.org/plugins/terser-webpack-plugin/#parallel>

Also, if your project is created by [create-react-app](https://github.com/facebook/create-react-app), it needs to use \`eject\` or \`react-app-rewired\` to update webpack configuration.

If it doesn't solve the problem, there are a couple of options you can try:

* Increase the [resource class](https://circleci.com/docs/2.0/configuration-reference/#docker-executor) in use to provide more memory to the job
* [Adjust the "max\_old\_space\_size" for NodeJS to a suitable value](https://support.circleci.com/hc/en-us/articles/360009208393-How-can-I-increase-the-max-memory-for-Node-). For example, if you are using the medium resource class with 4GB of memory, then set this to 3GB.

For additional visibility on memory usage issues, consider [logging the maximum memory usage](https://support.circleci.com/hc/en-us/articles/360043994872-How-to-record-a-job-s-memory-usage) for the job.

</details>


<details markdown=block>
<summary>Add Timing Data to Each Output Line</summary>

Debugging where jobs spend most of their time can be useful to help optimise your pipeline, along with debugging spikes in job completion time.

Generally, logging timing data is up to the command that is being run at the time, but we can manually add this by using some bash scripting.

See the below example for how you can achieve this:

`- run: example_command | while read line ; do echo "$(date +"%T") > $line" ; done ;`

This will provide and output along the following lines:

```
21:15:46 > Some Output Line 1
21:16:12 > Some Output Line 2
21:17:41 > Some Output Line 3
```

The format of the timing data is in HH:MM:SS which provides granular information that will help in tracking down steps that are taking longer than expected.

</details>


<details markdown=block>
<summary>Debugging Docker Build Step Timings</summary>

When building a Docker image, depending on how large your Dockerfile is, a lot of commands are run sequentially during the build process. If you are running these often, you may have an idea of the average build time and when the build time deviates from this it can be difficult to find where this time is being lost as Docker does not provide timing information in the output.

This can be solved by piping the docker build output to bash line-by-line and pre-pending the time by using the date command:

- `run: docker build . | while read line ; do echo "$(date +"%T") > $line" ; done ;`

This will provide and output along the following lines:

```
21:15:46 > Status: Downloaded newer image for cimg/base:2020.11
21:15:46 > ---> 2b62242a26ae
21:15:46 > Step 2/14 : LABEL maintainer "CircleCI <circleci@example.com>"
21:15:47 > ---> Running in b829a27594ae
21:15:47 > ---> f0d09345055e
21:15:47 > Removing intermediate container b829a27594ae
```

The format of the timing data is in HH:MM:SS which provides granular information that will help in tracking down steps that are taking longer than expected.

</details>

