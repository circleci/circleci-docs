---
layout: classic-docs
title: "Orchestrating Workflows"
short-title: "Orchestrating Workflows"
description: "Orchestrating Workflows"
categories: [configuring-jobs]
order: 30
---

![header](  {{ site.baseurl }}/assets/img/docs/wf-header.png)

To increase the speed of your software development through faster feedback, shorter reruns, and more efficient use of resources, configure Workflows. This document describes the Workflows feature and provides example configurations in the following sections:

* TOC
{:toc}

## Overview

A workflow is a set of rules for defining a collection of jobs and their run order that shortens the feedback loop. For example, if only one job in your Workflow fails, you will know it is failing in real-time and you can rerun *just the failed job* instead of wasting time and resources waiting for the entire build to fail or rerunning the entire set of jobs. 

Schedule workflows at a specific time to make efficient use of your resources or to run jobs that should only run periodically. The Workflows feature supports very complex job orchestration using a simple set of new configuration keys with a powerful user interface to help you resolve failures sooner, for example:

- Run and troubleshoot jobs independently with fast status feedback as each job runs
- Fan-out to run multiple jobs in parallel for efficient testing of versions 
- Fan-in for deployment to separate platforms with increased speed

### Limitations

It is not possible to trigger a workflow with the API, projects that run by using the CircleCI API will ignore workflows and will require a job named `build`. That is, if you build a project with workflows using the API, the workflows are ignored, and CircleCI will build the project as if it's a normal build, which must have a `build` job. Refer to the [Workflows]({{ site.baseurl }}/2.0/faq) section of the Migration FAQ for additional limitations and information about features of 2.0 which are not yet supported with Workflows.

## Rerunning a Workflow from a Failed Job

When you use workflows to orchestrate parts of your build, you increase your ability to respond to failures rapidly. Click the Workflows icon in the app and select a workflow to see the status of each job as shown in the next screenshot. Click the Rerun button and select From failed to restart only the failed job and continue the workflow. Only jobs *after* the failure will run, saving time and resources.

![CircleCI Workflows Page]({{ site.baseurl }}/assets/img/docs/workflow_detail.png)

## Workflows Configuration Examples

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
	
The illustrated example workflow runs a common build Job, then fans-out to run a set of acceptance test Jobs in parallel, and finally fans-in to run a common deploy Job.

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

Workflows may be configured to wait for manual approval of a job before continuing by using the `type: approval` key. The `type: approval` key is a special job and type that is **only** added under in your `workflow` key. This enables you to configure a job with `type: approval` in the workflow before a set of parallel jobs that must all wait for manual approval. Jobs run in the order defined until the workflow processes a job with the `type: approval` key followed by a job on which it depends as in the following `config.yml` example:

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

In this example, the `deploy:` job will not run until you click the `hold` job in the Workflows page of the CircleCI app and then click Approve. Notice that the `hold` job must have a unique name that is not used by any other job. The workflow will wait with the status of On Hold until you click the job and Approve. After you approve the job with `type: approval`, the jobs which require the approval job will start.  In the example above, the purpose is to wait for approval to begin deployment. To configure this behavior, the `hold` job must be `type: approval` and the `deploy` job must require `hold`. The following screenshots show a workflow on hold waiting for approval of the `request-testing` job: 

![Approved Jobs in On Hold Workflow]({{ site.baseurl }}/assets/img/docs/approval_job.png)

Following is a screenshot of the Approval dialog box that appears when you click the `request-testing` job:

![Approval Dialog in On Hold Workflow]({{ site.baseurl }}/assets/img/docs/approval_job_dialog.png)

## Scheduling a Workflow

Workflows that are resource-intensive or that generate reports may be run on a schedule rather than on every commit. This feature is configured by adding a scheduled trigger to the configuration of the workflow. **Note:** The `triggers` key is not yet supported in CircleCI server.

Configure a workflow to run on a set schedule by using the `triggers:` key with the `schedule` option. The `triggers` key is **only** added under your `workflow` key. This feature enables you to schedule a workflow run by using `cron` syntax to represent Coordinated Universal Time (UTC/GMT) for specified branches. 

In the example below, the `nightly` workflow is configured to run every day at 12:00am UTC. The `cron` key is specified using POSIX `crontab` syntax, see the [crontab man page](http://pubs.opengroup.org/onlinepubs/7908799/xcu/crontab.html) for `cron` syntax basics. The workflow will be run on the `master` and `beta` branches. The `commit` workflow has no scheduled trigger configured, so it will run on the push of every commit. 

**Note:** Step syntax (for example, `*/1`, `*/20`) is **not** supported.

```
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

See the [Sample Scheduled Workflows configuration](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/try-schedule-workflow/.circleci/config.yml) for a full example.

## Using Contexts and Filtering in Your Workflows

The following sections provide example for using Contexts and filters to manage job execution.

### Using Job Contexts to Share Environment Variables

The following example shows a workflow with four sequential jobs that use shared environment variables. 

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

See the [Contexts]({{ site.baseurl }}/2.0/contexts) document for detailed instructions on this setting in the application.

### Branch-Level Job Execution
The following example shows a workflow configured with jobs on three branches: Dev, Stage, and Pre-Prod. Workflows will ignore `branches` keys nested under `jobs` configuration, so if you use job-level branching and later add workflows, you must remove the branching at the job level and instead declare it in the workflows section of your `config.yml`, as follows:

![Branch-Level Job Execution]({{ site.baseurl }}/assets/img/docs/branch_level.png)

The following `config.yml` snippet is an example of a workflow configured for branch-level job execution:

```
workflows:
  version: 2
  dev_stage_pre-prod:
    jobs:
      - test_dev:
          filters:
            branches:
              only:
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

In the example, `filters` is set with the `branches` key and the `only` key with the branch name. Any branches that match the value of `only` will run the job. Branches matching the value of `ignore` will not run the job. See the [Sample Sequential Workflow config with Branching](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) for a full example.

### Git Tag Job Execution

CircleCI treats tag and branch filters differently when deciding whether a job should run.

1. For a branch push unaffected by any filters, CircleCI runs the job.
2. For a tag push unaffected by any filters, CircleCI skips the job.

Item two above means that a job **must** have a `filters` `tags` section to run as a part of a tag push and all its transitively dependent jobs **must** also have a `filters` `tags` section. 

The following `build` job example will run for all branches, and all tags, except those starting with `testing-`.

```
workflows:
  version: 2
  build-workflow:
    jobs:
      - build:
          filters:
            tags:
              ignore: /^testing-.*/
```

The following example runs 

1. `build` job for all branches, and all tags.
2. `deploy` job for **no** branches, and all tags starting with `config-test`.

```
workflows:
  version: 2
  build-n-deploy:
    jobs:
      - build:
          filters:
            tags:
              only: /.*/
      - deploy:
          requires:
            - test
          filters:
            tags:
              only: /^config-test.*/
            branches:
              ignore: /.*/
```

**Note:** The `build` job **must** also have a `filters` `tags` section, as it is a transient dependency of the `deploy` job.

The following example runs

1. `build` and `test` jobs for all branches and only `config-test.*` tags.
2. `deploy` only for `config-test.*` tags.

```
workflows:
  version: 2
  build-n-deploy:
    jobs:
      - build:
          filters:
            tags:
              only: /^config-test.*/
      - test:
          requires:
            - build
          filters:
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

**Note:** Webhook payloads from GitHub [are capped at 5MB](https://developer.github.com/webhooks/#payloads) and [for some events](https://developer.github.com/v3/activity/events/types/#createevent) a maximum of 3 tags. This means that if you push a lot of tags we may not receive all of them.

## Using Workspaces to Share Data Among Jobs

Each workflow has an associated workspace which can be used to transfer files to downstream jobs as the workflow progresses.
The workspace is an additive-only store of data. Jobs can persist data to the workspace. This configuration archives the data and creates a new layer in an off-container store. Downstream jobs can attach the workspace to their container filesystem. Attaching the workspace downloads and unpacks each layer based on the ordering of the upstream jobs in the workflow graph.

Use workspaces to pass along data that is unique to this run and which is needed for downstream jobs. Workflows that include jobs running on multiple branches may require data to be shared using workspaces. Workspaces are also useful for projects in which compiled data are used by test containers. 

For example, Scala projects typically require lots of CPU for compilation in the build job. In contrast, the Scala test jobs are not CPU-intensive and may be parallelised across containers well. Using a larger container for the build job and saving the compiled data into the workspace enables the test containers to use the compiled Scala from the build job. 

A second example is a project with a `build` job that builds a jar and saves it to a workspace. The `build` job fans-out into the `integration-test`, `unit-test`, and `code-coverage` to run those tests in parallel using the jar.

To persist data from a job and make it available to other jobs, configure the job to use the `persist_to_workspace` key. Files and directories named in the `paths:` property of `persist_to_workspace` will be uploaded to the workflow's temporary workspace and made available for subsequent jobs (and re-runs of the workflow) to use. 

Configure a job to get saved data by configuring the `attach_workspace` key. The following `config.yml` file defines two jobs where the `downstream` job uses the artifact of the `flow` job. The workflow configuration is sequential, so that `downstream` requires `flow` to finish before it can start. 

```
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

      - persist_to_workspace:
          # Must be an absolute path, or relative path from working_directory
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

## Troubleshooting

This section describes common problems and solutions for Workflows.

### Workflows Not Starting
When creating or modifying workflow configuration, if you don't see new jobs, you may have a configuration error in `config.yml`.

Oftentimes if you do not see your workflows triggering, a configuration error is preventing the workflow from starting.  As a result, the workflow does not start any jobs.

When setting up workflows, you currently have to check your Workflows page of the CircleCI app (*not* the Jobs page) to view the configuration errors.

A project's Job page URL looks like this:

`https://circleci.com/:VCS/:ORG/:PROJECT`

A Workflow page URL looks like this:

`https://circleci.com/:VCS/:ORG/workflows/:PROJECT`

Look for Workflows that have a yellow tag and "Needs Setup" for the text.

![Invalid workflow configuration example]({{ site.baseurl }}/assets/img/docs/workflow-config-error.png)

### Workflows Waiting for Status in GitHub

If you have implemented Workflows on a branch in your GitHub repository, but the status check never completes, there may be  status settings in GitHub that you need to deselect. For example, if you choose to protect your branches, you may need to deselect the `ci/circleci` status key as this check refers to the default CircleCI 1.0 check, as follows:

![Uncheck GitHub Status Keys]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

Having the `ci/circleci` checkbox enabled will prevent the status from showing as completed in GitHub when using a workflow because CircleCI posts statuses to Github with a key that includes the job by name.

Go to Settings > Branches in GitHub and click the Edit button on the protected branch to deselect the settings, for example https://github.com/your-org/project/settings/branches.


## See Also

- For procedural instructions on how to add Workflows your configuration as you are migrating from a 1.0 `circle.yml` file to a 2.0 `.circleci/config.yml` file, see the [Steps to Configure Workflows]({{ site.baseurl }}/2.0/migrating-from-1-2/) section of the Migrating from 1.0 to 2.0 document. 

- For details about the `workflows:` key requirements, see the [Workflows]({{ site.baseurl }}/2.0/configuration-reference/#workflows) section of the Configuration Reference document.

- For frequently asked questions and answers about Workflows, see the [Workflows]({{ site.baseurl }}/2.0/faq) section of the  FAQ.

- For demonstration apps configured with Workflows, see the [CircleCI Demo Workflows](https://github.com/CircleCI-Public/circleci-demo-workflows) on GitHub.

- For troubleshooting a workflow with Waiting for Status in GitHub, see [Workflows Waiting for Status in GitHub]({{ site.baseurl }}/2.0/workflows-waiting-status).
