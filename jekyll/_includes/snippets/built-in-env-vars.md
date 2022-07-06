Variable | Type | Value
---|---|---
`CI`{:.env_var} | Boolean | `true` (represents whether the current environment is a CI environment)
`CIRCLECI`{:.env_var} | Boolean | `true` (represents whether the current environment is a CircleCI environment)
`CIRCLE_BRANCH`{:.env_var} | String | The name of the Git branch currently being built.
`CIRCLE_BUILD_NUM`{:.env_var} | Integer | The number of the current job. Job numbers are unique for each job.
`CIRCLE_BUILD_URL`{:.env_var} | String | The URL for the current job on CircleCI.
`CIRCLE_JOB`{:.env_var} | String | The name of the current job.
`CIRCLE_NODE_INDEX`{:.env_var} | Integer | For jobs that run with parallelism enabled, this is the index of the current parallel run. The value ranges from 0 to (`CIRCLE_NODE_TOTAL` - 1)
`CIRCLE_NODE_TOTAL`{:.env_var} | Integer | For jobs that run with parallelism enabled, this is the number of parallel runs. This is equivalent to the value of `parallelism` in your config file.
`CIRCLE_OIDC_TOKEN`{:.env_var} | String | An OpenID Connect token signed by CircleCI which includes details about the current job. Available in jobs that use a context.
`CIRCLE_PR_NUMBER`{:.env_var} | Integer | The number of the associated GitHub or Bitbucket pull request. Only available on forked PRs.
`CIRCLE_PR_REPONAME`{:.env_var} | String | The name of the GitHub or Bitbucket repository where the pull request was created. Only available on forked PRs.
`CIRCLE_PR_USERNAME`{:.env_var} | String | The GitHub or Bitbucket username of the user who created the pull request. Only available on forked PRs.
`CIRCLE_PREVIOUS_BUILD_NUM`{:.env_var} | Integer | The largest job number in a given branch that is less than the current job number. **Note**: The variable is not always set, and is not deterministic. It is also not set on runner executors. This variable is likely to be deprecated, and CircleCI recommends users to avoid using it.
`CIRCLE_PROJECT_REPONAME`{:.env_var} | String | The name of the repository of the current project.
`CIRCLE_PROJECT_USERNAME`{:.env_var} | String | The GitHub or Bitbucket username of the current project.
`CIRCLE_PULL_REQUEST`{:.env_var} | String | The URL of the associated pull request. If there are multiple associated pull requests, one URL is randomly chosen.
`CIRCLE_PULL_REQUESTS`{:.env_var} | List | Comma-separated list of URLs of the current build's associated pull requests.
`CIRCLE_REPOSITORY_URL`{:.env_var} | String | The URL of your GitHub or Bitbucket repository.
`CIRCLE_SHA1`{:.env_var} | String | The SHA1 hash of the last commit of the current build.
`CIRCLE_TAG`{:.env_var} | String | The name of the git tag, if the current build is tagged. For more information, see the [Git Tag Job Execution]({{site.baseurl}}/2.0/workflows/#executing-workflows-for-a-git-tag).
`CIRCLE_USERNAME`{:.env_var} | String | The GitHub or Bitbucket username of the user who triggered the pipeline (only if the user has a CircleCI account).
`CIRCLE_WORKFLOW_ID`{:.env_var} | String | A unique identifier for the workflow instance of the current job. This identifier is the same for every job in a given workflow instance.
`CIRCLE_WORKFLOW_JOB_ID`{:.env_var} | String | A unique identifier for the current job.
`CIRCLE_WORKFLOW_WORKSPACE_ID`{:.env_var} | String | An identifier for the [workspace]({{site.baseurl}}/2.0/glossary/#workspace) of the current job. This identifier is the same for every job in a given workflow.
`CIRCLE_WORKING_DIRECTORY`{:.env_var} | String | The value of the `working_directory` key of the current job.
`CIRCLE_INTERNAL_TASK_DATA`{:.env_var} | String | **Internal**. A directory where internal data related to the job is stored. We do not document the contents of this directory; the data schema is subject to change.
{: class="table table-striped"}
