---
layout: classic-docs
title: "Orchestrating Workflows"
short-title: "Orchestrating Workflows"
description: "Orchestrating Workflows"
categories: [configuring-jobs]
order: 30
---

This section describes the Workflows feature and provides examples for parallel, sequential, fan-in, fan-out, and branch-level workflows. To enable Workflows, you must first split the single job in your `config.yml` file into multiple jobs, if you have not already done so. Job names must be unique within a `config.yml` file. 
 
## Overview

A workflow is a set of rules for defining a collection of jobs and their run order. The Workflows feature is designed with a flexible algorithm to support very complex job scheduling and orchestration using a simple set of new configuration keys. Consider configuring workflows if you need to meet any of the following requirements:
 
- Run and troubleshoot jobs independently
- Fan-out to run multiple jobs in parallel for testing various versions  
- Fan-in for deployment to separate platforms with automated triggers 
- Branch-level job execution with artifact sharing

For example, you might want to run acceptance tests independently from integration tests and deployment. Use workflows to orchestrate parts of your build and to increase your ability to respond to failures. Scheduled jobs appear in the Workflows tab of the CircleCI app, so you have an integrated view of the status of every individual workflow as shown in the following screenshot. 

![CircleCI Workflows Page]({{ site.baseurl }}/assets/img/docs/workflow_landing.png)

Select the Failed workflow to see the status of each job as shown in the next screenshot. Click the Rerun button and select From beginning to restart a failed workflow or select From failed to restart a failed job.

![CircleCI Workflows Page]({{ site.baseurl }}/assets/img/docs/workflow_detail.png)

## Parallel Job Execution Example

The basic Workflows configuration runs all jobs in parallel. That is, jobs listed in the `workflows` section without additional keys will run at the same time. The blue icons indicate the Running status.

![Parallel Job Execution Workflow]({{ site.baseurl }}/assets/img/docs/parallel_jobs.png) 

To run a set of parallel jobs, add a new `workflows:` section to the end of your existing configuration file with the version and a unique name for the workflow. The following `.circleci/config.yml` file snippet shows an example workflow with four parallel jobs. It is defined by using the `workflows:` key named `build-and-test` and by nesting the `jobs:` key with a list of job names. The jobs have no dependencies defined, therefore they will run in parallel.

```
workflows:
  version: 2
  build-and-test:
    jobs:
      - build
      - test1
      - test2
      - test3
```

## Sequential Job Execution Example

The following example shows a workflow with four sequential jobs. The jobs run according to configured  requirements, each job waiting to start until the required job finishes successfully as illustrated in the diagram. 

![Sequential Job Execution Workflow]({{ site.baseurl }}/assets/img/docs/sequntial_workflow.png)

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

The dependencies are defined by setting the `requires:` key as shown. The `deploy:` job will not run until the `build` and `test` jobs complete successfully. A job must wait until all upstream jobs in the dependency graph have run. So, the `deploy` job waits for the `test2` job, the `test2` job waits for the `test1` job and the `test1` job waits for the `build` job.
 
The Workflows feature also enables you to limit the job execution to a branch with the `filters` key. See the Branch-Level Job Execution section for instructions.
 
## Running a Workflow from a Failed Job

It is possible to rerun a job that failed in the middle of a workflow and continue the rest of the workflow using the Rerun button on the Workflows page of the CircleCI application.

![Rerunning a Workflow from a Failed Job]({{ site.baseurl }}/assets/img/docs/restart_from_failed.png) 

To rerun a workflow from the failed job:

1. From the Builds page, select the project name. 
2. Click the Workflows tab to display workflows for your project.  
3. Select a workflow from the list to see all jobs in the workflow. 
4. Click Rerun and select from failed to rerun the job and continue the workflow. 

## Fan-Out/Fan-In Workflow Example
	
The illustrated example workflow runs a common build Job, then fans-out to run a set of acceptance test Jobs in parallel, and finally fans-in to run a common deploy Job.

![Fan-out and Fan-in Workflow]({{ site.baseurl }}/assets/img/docs/fan_in_out.png) 

The following `config.yml` snippet is an example of a workflow configured for sequential job execution:

``` 
workflows:
  version: 2
  build_accept_deploy:
    jobs:
      - build:
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
 
## Branch-Level Job Execution
The following example shows a workflow configured with jobs on three branches: Dev, Stage, and Pre-Prod. 

![Branch-Level Job Execution]({{ site.baseurl }}/assets/img/docs/branch_level.png) 

The following `config.yml` snippet is an example of a workflow configured for branch-level job execution:

```
workflows:
  version:2
  dev_stage_pre-prod_master_deploy:
    jobs:
      - test_dev:
          filters:
            branches:
              only: dev
      - test_stage:
          filters:
            branches:
              only: stage
      - test_pre-prod:
          filters:
            branches:
              only: pre-prod
```

## Workspaces

Workflows that include jobs running on multiple branches may require artifacts to be shared using workspaces. To persist an artifact from a job and make it available to other jobs, configure the job to use the `persist_to_workspace` key where the value is a directory inside the project’s working directory. Artifacts of the job will be saved to this directory until the job is rerun and new artifacts are created.

Configure a job to get a saved artifact by configuring the `attach_workspace` key where the value of the `at:` option is the directory defined in the `persist_to_workspace` key. The following `config.yml` file defines two jobs where the `downstream` job uses the artifact of the `flow` job. The workflow configuration is sequential, so that `downstream` requires `flow` to finish before it can start. 
 
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
          root: workspace
          paths:
            - echo-output

  downstream:
    <<: *defaults
    steps:
      - attach_workspace:
          at: /tmp/workspace

      - run: |
          if [[ `cat workspace/echo-output` == "Hello, world!" ]]; then
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

## See Also

- For procedural instructions on how to add Workflows your configuration as you are migrating from a 1.0 `circle.yml` file to a 2.0 `.circelci/config.yml` file, see the [Steps to Configure Workflows]({{ site.baseurl }}/2.0/migrating-from-1-2/) section of the Migrating from 1.0 to 2.0 document. 

- For details about the `workflows:` key requirements, see the [Workflows]({{ site.baseurl }}/2.0/configuration-reference/#workflows) section of the Writing Jobs with Steps document.

- For frequently asked questions and answers about Workflows, see the [Workflows]({{ site.baseurl }}/2.0/faq) section of the Migration FAQ.
