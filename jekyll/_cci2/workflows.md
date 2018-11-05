---
layout: classic-docs
title: "Using Workflows to Schedule Jobs"
short-title: "Using Workflows to Schedule Jobs"
description: "Using Workflows to Schedule Jobs"
categories: [configuring-jobs]
order: 30
---

![header](  {{ site.baseurl }}/assets/img/docs/wf-header.png)

To increase the speed of your software development through faster feedback, shorter reruns, and more efficient use of resources, configure Workflows. This document describes the Workflows feature and provides example configurations in the following sections:

* TOC
{:toc}

## Overview

A **workflow** is a set of rules for defining a collection of jobs and their run order. Workflows support complex job orchestration using a simple set of configuration keys to help you resolve failures sooner.

With workflows, you can:

- Run and troubleshoot jobs independently with real-time status feedback.
- Schedule workflows for jobs that should only run periodically.
- Fan-out to run multiple jobs in parallel for efficient version testing.
- Fan-in to quickly deploy to multiple platforms.

For example, if only one job in a workflow fails, you will know it is failing in real-time. Instead of wasting time waiting for the entire build to fail and rerunning the entire job set, you can rerun *just the failed job*.

### States
{:.no_toc}

Workflows may appear with one of the following states:

- RUNNING: Workflow is in progress
- NOT RUN: Workflow was never started
- CANCELLED: Workflow was cancelled before it finished
- FAILING: A Job in the workflow has failed
- FAILED: One or more jobs in the workflow failed
- SUCCESS: All jobs in the workflow completed successfully
- ON HOLD: A job in the workflow is waiting for approval
- NEEDS SETUP: A workflow stanza is not included or is incorrect in the [config.yml file]({{ site.baseurl }}/2.0/configuration-reference/) for this project

### Limitations
{:.no_toc}

Projects that have [Build Processing]({{ site.baseurl }}/2.0/build-processing/) enabled may use the CircleCI API to trigger workflows. Projects that do not enable build processing will run as if the workflows did not exist when triggered by the API. **Note:** Builds without workflows require a `build` job.

Refer to the [Workflows]({{ site.baseurl }}/2.0/faq) section of the FAQ for additional information and limitations.

## Workflows Configuration Examples

_For a full specification of the_ `workflows` _key, see the [Workflows]({{ site.baseurl }}/2.0/configuration-reference/#workflows) section of the Configuring CircleCI document._

**Note:** Projects configured with Workflows often include multiple jobs that share syntax for Docker images, environment variables, or `run` steps. Refer the [YAML Anchors/Aliases](http://yaml.org/spec/1.2/spec.html#id2765878) documentation for information about how to alias and reuse syntax to keep your `.circleci/config.yml` file small. See the [Reuse YAML in the CircleCI Config](https://circleci.com/blog/circleci-hacks-reuse-yaml-in-your-circleci-config-with-yaml/) blog post for a summary.

To run a set of parallel jobs, add a new `workflows:` section to the end of your existing `.circleci/config.yml` file with the version and a unique name for the workflow. The following sample `.circleci/config.yml` file shows the default workflow orchestration with two parallel jobs. It is defined by using the `workflows:` key named `build_and_test` and by nesting the `jobs:` key with a list of job names. The jobs have no dependencies defined, therefore they will run in parallel.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test
```
See the [Sample Parallel Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml) for a full example.

### Sequential Job Execution Example
{:.no_toc}

The following example shows a workflow with four sequential jobs. The jobs run according to configured requirements, each job waiting to start until the required job finishes successfully as illustrated in the diagram. 

![Sequential Job Execution Workflow]({{ site.baseurl }}/assets/img/docs/sequential_workflow.png)

The following `config.yml` snippet is an example of a workflow configured for sequential job execution:

```
workflows:
  version: 2
  build-test-and-deploy:
    jobs:
      - build
      - test1:
          requires:
            - build
      - test2:
          requires:
            - test1
      - deploy:
          requires:
            - test2
```

The dependencies are defined by setting the `requires:` key as shown. The `deploy:` job will not run until the `build` and `test1` and `test2` jobs complete successfully. A job must wait until all upstream jobs in the dependency graph have run. So, the `deploy` job waits for the `test2` job, the `test2` job waits for the `test1` job and the `test1` job waits for the `build` job.

See the [Sample Sequential Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) for a full example.

### Fan-Out/Fan-In Workflow Example
{:.no_toc}

The illustrated example workflow runs a common build job, then fans-out to run a set of acceptance test jobs in parallel, and finally fans-in to run a common deploy job.

![Fan-out and Fan-in Workflow]({{ site.baseurl }}/assets/img/docs/fan_in_out.png)

The following `config.yml` snippet is an example of a workflow configured for fan-out/fan-in job execution:

```
workflows:
  version: 2
  build_accept_deploy:
    jobs:
      - build
      - acceptance_test_1:
          requires:
            - build
      - acceptance_test_2:
          requires:
            - build
      - acceptance_test_3:
          requires:
            - build
      - acceptance_test_4:
          requires:
            - build
      - deploy:
          requires:
            - acceptance_test_1
            - acceptance_test_2
            - acceptance_test_3
            - acceptance_test_4
```
In this example, as soon as the `build` job finishes successfully, all four acceptance test jobs start. The `deploy` job must wait for all four acceptance test jobs to complete successfully before it starts.

See the [Sample Fan-in/Fan-out Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/tree/fan-in-fan-out) for a full example.

## Holding a Workflow for a Manual Approval

Workflows may be configured to wait for manual approval of a job before continuing by using the `type: approval` key. `approval` is a special job type that is **only** added to jobs under the `workflow` key. This enables you to configure a job with `type: approval` in the workflow before a set of jobs that must all wait for manual approval. Jobs run in the order defined until the workflow processes a job with the `type: approval` key followed by a job on which it depends as in the following `config.yml` example:

```
workflows:
  version: 2
  build-test-and-approval-deploy:
    jobs:
      - build
      - test1:
          requires:
            - build
      - test2:
          requires:
            - test1
      - hold:
          type: approval
          requires:
           - test2
      - deploy:
          requires:
            - hold
```

In this example, the `deploy:` job will not run until you click the `hold` job in the Workflows page of the CircleCI app and then click Approve. Notice that the `hold` job must have a unique name that is not used by any other job. The workflow will wait with the status of On Hold until you click the job and Approve. After you approve the job with `type: approval`, the jobs which require the approval job will start.  In the example above, the purpose is to wait for approval to begin deployment. To configure this behavior, the `hold` job must be `type: approval` and the `deploy` job must require `hold`. 

The following screenshots show a workflow on hold waiting for approval of the `request-testing` job: 

![Approved Jobs in On Hold Workflow]({{ site.baseurl }}/assets/img/docs/approval_job.png)

Following is a screenshot of the Approval dialog box that appears when you click the `request-testing` job:

![Approval Dialog in On Hold Workflow]({{ site.baseurl }}/assets/img/docs/approval_job_dialog.png)

## Scheduling a Workflow

It can be inefficient and expensive
to run a workflow for every commit for every branch.
Instead,
you can schedule a workflow
to run at a certain time for specific branches.
This will disable commits from triggering jobs on those branches.

Consider running workflows that are resource-intensive or that generate reports on a schedule rather than on every commit by adding a `triggers` key to the configuration. The `triggers` key is **only** added under your `workflows` key. This feature enables you to schedule a workflow run by using `cron` syntax to represent Coordinated Universal Time (UTC) for specified branches. 

### Nightly Example
{:.no_toc}

By default,
a workflow is triggered on every `git push`.
To trigger a workflow on a schedule,
add the `triggers` key to the workflow
and specify a `schedule`.

In the example below, the `nightly` workflow is configured to run every day at 12:00am UTC. The `cron` key is specified using POSIX `crontab` syntax, see the [crontab man page](https://www.unix.com/man-page/POSIX/1posix/crontab/) for `cron` syntax basics. The workflow will be run on the `master` and `beta` branches.

```yaml
workflows:
  version: 2
  commit:
    jobs:
      - test
      - deploy
  nightly:
    triggers:
      - schedule:
          cron: "0 0 * * *"
          filters:
            branches:
              only:
                - master
                - beta
    jobs:
      - coverage
```

In the above example,
the `commit` workflow has no `triggers` key
and will run on every `git push`.
The `nightly` workflow has a `triggers` key
and will run on the specified `schedule`.

### Specifying a Valid Schedule
{:.no_toc}

A valid `schedule` requires
a `cron` key and a `filters` key.

The value of the `cron` key must be a [valid crontab entry](https://crontab.guru/).

**Note:**
Cron step syntax (for example, `*/1`, `*/20`) is **not** supported.

The value of the `filters` key must be a map
that defines rules for execution on specific branches.

For more details,
see the `branches` section of the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/#branches-1) document.

For a full configuration example,
see the [Sample Scheduled Workflows configuration](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/try-schedule-workflow/.circleci/config.yml).

## Using Contexts and Filtering in Your Workflows

The following sections provide example for using Contexts and filters to manage job execution.

### Using Job Contexts to Share Environment Variables
{:.no_toc}

The following example shows a workflow with four sequential jobs that use a context to share environment variables. See the [Contexts]({{ site.baseurl }}/2.0/contexts) document for detailed instructions on this setting in the application.

The following `config.yml` snippet is an example of a sequential job workflow configured to use the resources defined in the `org-global` context:

```
workflows:
  version: 2
  build-test-and-deploy:
    jobs:
      - build
      - test1:
          requires:
            - build
          context: org-global  
      - test2:
          requires:
            - test1
          context: org-global  
      - deploy:
          requires:
            - test2
```

The environment variables are defined by setting the `context` key as shown to the default name `org-global`. The `test1` and `test2` jobs in this workflows example will use the same shared environment variables when initiated by a user who is part of the organization. By default, all projects in an organization have access to contexts set for that organization.

### Branch-Level Job Execution
{:.no_toc}

The following example shows a workflow configured with jobs on three branches: Dev, Stage, and Pre-Prod. Workflows will ignore `branches` keys nested under `jobs` configuration, so if you use job-level branching and later add workflows, you must remove the branching at the job level and instead declare it in the workflows section of your `config.yml`, as follows:

![Branch-Level Job Execution]({{ site.baseurl }}/assets/img/docs/branch_level.png)

The following `config.yml` snippet is an example of a workflow configured for branch-level job execution:

```yaml
workflows:
  version: 2
  dev_stage_pre-prod:
    jobs:
      - test_dev:
          filters:  # using regex filters requires the entire branch to match
            branches:
              only:  # only branches matching the below regex filters will run
                - dev
                - /user-.*/
      - test_stage:
          filters:
            branches:
              only: stage
      - test_pre-prod:
          filters:
            branches:
              only: /pre-prod(?:-.+)?$/
```

For more information on regular expressions,
see the [Using Regular Expressions to Filter Tags And Branches](#using-regular-expressions-to-filter-tags-and-branches) section below.
For a full example of workflows,
see the [configuration file](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) for the Sample Sequential Workflow With Branching project.

### Executing Workflows for a Git Tag
{:.no_toc}

CircleCI does not run workflows for tags
unless you explicitly specify tag filters.
Additionally,
if a job requires any other jobs (directly or indirectly),
you must [use regular expressions](#using-regular-expressions-to-filter-tags-and-branches)
to specify tag filters for those jobs. Both lightweight and annotated tags are supported.

In the example below,
two workflows are defined:

- `untagged-build` runs the `build` job for all branches.
- `tagged-build` runs `build` for all branches **and** all tags starting with `v`.

```yaml
workflows:
  version: 2
  untagged-build:
    jobs:
      - build
  tagged-build:
    jobs:
      - build:
          filters:
            tags:
              only: /^v.*/
```

In the example below,
two jobs are defined within the `build-n-deploy` workflow:

- The `build` job runs for all branches and all tags.
- The `deploy` job runs for no branches and only for tags starting with 'v'.

```yaml
workflows:
  version: 2
  build-n-deploy:
    jobs:
      - build:
          filters:  # required since `deploy` has tag filters AND requires `build`
            tags:
              only: /.*/
      - deploy:
          requires:
            - build
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
```

In the example below,
three jobs are defined with the `build-test-deploy` workflow:

- The `build` job runs for all branches and only tags starting with 'config-test'.
- The `test` job runs for all branches and only tags starting with 'config-test'.
- The `deploy` job runs for no branches and only tags starting with 'config-test'.

```yaml
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - build:
          filters:  # required since `test` has tag filters AND requires `build`
            tags:
              only: /^config-test.*/
      - test:
          requires:
            - build
          filters:  # required since `deploy` has tag filters AND requires `test`
            tags:
              only: /^config-test.*/
      - deploy:
          requires:
            - test
          filters:
            tags:
              only: /^config-test.*/
            branches:
              ignore: /.*/
```

**Note:**
Webhook payloads from GitHub [are capped at 5MB](https://developer.github.com/webhooks/#payloads)
and [for some events](https://developer.github.com/v3/activity/events/types/#createevent) a maximum of 3 tags.
If you push several tags at once,
CircleCI may not receive all of them.

### Using Regular Expressions to Filter Tags and Branches
{:.no_toc}

CircleCI branch and tag filters support
the Java variant of regex pattern matching.
When writing filters,
CircleCI matches exact regular expressions.

For example,
`only: /^config-test/` only matches the `config-test` tag.
To match all tags starting with `config-test`,
use `only: /^config-test.*/` instead.
Using tags for semantic versioning is a common use case.
To match patch versions 3-7 of a 2.1 release,
you could write `/^version-2\.1\.[3-7]/`.

For full details on pattern-matching rules,
see the [java.util.regex documentation](https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html).

## Using Workspaces to Share Data Among Jobs

Each workflow has an associated workspace which can be used to transfer files to downstream jobs as the workflow progresses.
The workspace is an additive-only store of data. Jobs can persist data to the workspace. This configuration archives the data and creates a new layer in an off-container store. Downstream jobs can attach the workspace to their container filesystem. Attaching the workspace downloads and unpacks each layer based on the ordering of the upstream jobs in the workflow graph.

![workspaces data flow]( {{ site.baseurl }}/assets/img/docs/Diagram-v3-Workspaces.png)

Use workspaces to pass along data that is unique to this run and which is needed for downstream jobs. Workflows that include jobs running on multiple branches may require data to be shared using workspaces. Workspaces are also useful for projects in which compiled data are used by test containers. 

For example, Scala projects typically require lots of CPU for compilation in the build job. In contrast, the Scala test jobs are not CPU-intensive and may be parallelised across containers well. Using a larger container for the build job and saving the compiled data into the workspace enables the test containers to use the compiled Scala from the build job. 

A second example is a project with a `build` job that builds a jar and saves it to a workspace. The `build` job fans-out into the `integration-test`, `unit-test`, and `code-coverage` to run those tests in parallel using the jar.

To persist data from a job and make it available to other jobs, configure the job to use the `persist_to_workspace` key. Files and directories named in the `paths:` property of `persist_to_workspace` will be uploaded to the workflow's temporary workspace relative to the directory specified with the `root` key. The files and directories are then uploaded and made available for subsequent jobs (and re-runs of the workflow) to use. 

Configure a job to get saved data by configuring the `attach_workspace` key. The following `config.yml` file defines two jobs where the `downstream` job uses the artifact of the `flow` job. The workflow configuration is sequential, so that `downstream` requires `flow` to finish before it can start. 

```
# The following stanza defines a map named defaults with a variable that may be inserted using the YAML merge (<<: *) key 
# later in the file to save some typing. See http://yaml.org/type/merge.html for details.

defaults: &defaults
  working_directory: /tmp
  docker:
    - image: buildpack-deps:jessie

version: 2
jobs:
  flow:
    <<: *defaults
    steps:
      - run: mkdir -p workspace
      - run: echo "Hello, world!" > workspace/echo-output
      
      # Persist the specified paths (workspace/echo-output) into the workspace for use in downstream job. 
      - persist_to_workspace:
          # Must be an absolute path, or relative path from working_directory. This is a directory on the container which is 
	  # taken to be the root directory of the workspace.
          root: workspace
          # Must be relative path from root
          paths:
            - echo-output

  downstream:
    <<: *defaults
    steps:
      - attach_workspace:
          # Must be absolute path or relative path from working_directory
          at: /tmp/workspace

      - run: |
          if [[ `cat /tmp/workspace/echo-output` == "Hello, world!" ]]; then
            echo "It worked!";
          else
            echo "Nope!"; exit 1
          fi

workflows:
  version: 2

  btd:
    jobs:
      - flow
      - downstream:
          requires:
            - flow
```

**Note:** The `defaults:` key in this example is arbitrary. It is possible to name a new key and define it with an arbitrary `&name` to create a reusable set of configuration keys.

For a live example of using workspaces
to pass data between build and deploy jobs,
see the [`config.yml`](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml)
that is configured
to build the CircleCI documentation.
For additional conceptual information on using workspaces,
caching,
and artifacts,
refer to the [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) blog post.

## Rerunning a Workflow's Failed Jobs

When you use workflows, you increase your ability to rapidly respond to failures. To rerun only a workflow's **failed** jobs, click the **Workflows** icon in the app and select a workflow to see the status of each job, then click the **Rerun** button and select **Rerun from failed**.

![CircleCI Workflows Page]({{ site.baseurl }}/assets/img/docs/rerun-from-failed.png)

## Troubleshooting

This section describes common problems and solutions for Workflows.

### Workflows Not Starting
{:.no_toc}

When creating or modifying workflow configuration, if you don't see new jobs, you may have a configuration error in `config.yml`.

Oftentimes if you do not see your workflows triggering, a configuration error is preventing the workflow from starting.  As a result, the workflow does not start any jobs.

When setting up workflows, you currently have to check your Workflows page of the CircleCI app (*not* the Job page) to view the configuration errors.

A project's Job page URL looks like this:

`https://circleci.com/:VCS/:ORG/:PROJECT`

A Workflow page URL looks like this:

`https://circleci.com/:VCS/:ORG/workflows/:PROJECT`

Look for Workflows that have a yellow tag and "Needs Setup" for the text.

![Invalid workflow configuration example]({{ site.baseurl }}/assets/img/docs/workflow-config-error.png)

### Workflows Waiting for Status in GitHub
{:.no_toc}

If you have implemented Workflows on a branch in your GitHub repository, but the status check never completes, there may be  status settings in GitHub that you need to deselect. For example, if you choose to protect your branches, you may need to deselect the `ci/circleci` status key as this check refers to the default CircleCI 1.0 check, as follows:

![Uncheck GitHub Status Keys]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

Having the `ci/circleci` checkbox enabled will prevent the status from showing as completed in GitHub when using a workflow because CircleCI posts statuses to Github with a key that includes the job by name.

Go to Settings > Branches in GitHub and click the Edit button on the protected branch to deselect the settings, for example https://github.com/your-org/project/settings/branches.


## See Also
{:.no_toc}

- For procedural instructions on how to add Workflows your configuration as you are migrating from a 1.0 `circle.yml` file to a 2.0 `.circleci/config.yml` file, see the [Steps to Configure Workflows]({{ site.baseurl }}/2.0/migrating-from-1-2/) section of the Migrating from 1.0 to 2.0 document. 

- For frequently asked questions and answers about Workflows, see the [Workflows]({{ site.baseurl }}/2.0/faq) section of the  FAQ.

- For demonstration apps configured with Workflows, see the [CircleCI Demo Workflows](https://github.com/CircleCI-Public/circleci-demo-workflows) on GitHub.

- For troubleshooting a workflow with Waiting for Status in GitHub, see [Workflows Waiting for Status in GitHub]({{ site.baseurl }}/2.0/workflows-waiting-status).

## Video: Configure Multiple Jobs with Workflows
{:.no_toc}

<iframe width="560" height="315" src="https://www.youtube.com/embed/3V84yEz6HwA" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

### Video: How to Schedule Your Builds to Test and Deploy Automatically
{:.no_toc}

<iframe width="560" height="315" src="https://www.youtube.com/embed/FCiMD6Gq34M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
