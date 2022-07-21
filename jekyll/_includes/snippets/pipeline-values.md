Variable | Type | Value
---|---|---
`pipeline.id`{:.env_var} | String | A [globally unique id](https://en.wikipedia.org/wiki/Universally_unique_identifier) representing for the pipeline
`pipeline.number`{:.env_var} | Integer | A project unique integer id for the pipeline
`pipeline.project.git_url`{:.env_var} | String | The URL where the current project is hosted. For example, `https://github.com/circleci/circleci-docs`
`pipeline.project.type`{:.env_var} | String | The lower-case name of the VCS provider, E.g. “github”, “bitbucket”.
`pipeline.git.tag` | String | The name of the git tag that was pushed to trigger the pipeline. If the pipeline was not triggered by a tag, then this is the empty string.
`pipeline.git.branch`{:.env_var} | String | The name of the git branch that was pushed to trigger the pipeline.
`pipeline.git.revision`{:.env_var} | String | The long (40-character) git SHA that is being built.
`pipeline.git.base_revision`{:.env_var} | String | The long (40-character) git SHA of the build prior to the one being built. **Note:** While in most cases  `pipeline.git.base_revision` will be the SHA of the pipeline that ran before your currently running pipeline, there are some caveats. When the build is the first build for a branch, the variable will not be present. In addition, if the build was triggered via the API, the variable will not be present.
`pipeline.in_setup`{:.env_var} | Boolean | True if the pipeline is in the setup phase, i.e. running a [setup workflow]({{ site.baseurl }}/dynamic-config/).
`pipeline.trigger_source`{:.env_var} | String | The source that triggers the pipeline, current values are `webhook`, `api`, `scheduled_pipeline`
`pipeline.schedule.name`{:.env_var} | String | The name of the schedule if it is a scheduled pipeline. Value will be empty string if the pipeline is triggerd by other sources
`pipeline.schedule.id`{:.env_var} | String | The unique id of the schedule if it is a scheduled pipeline. Value will be empty string if the pipeline is triggerd by other sources
{: class="table table-striped"}
