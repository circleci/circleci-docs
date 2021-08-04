# Persist Data: The difference between Workspaces and Caching

CircleCi offers multiple options for manipulating previously used data. One of those options are workspaces. Workspaces move data between jobs in a single workflow. Another option is caching, which persists data between the same job in different workflow builds. Knowing which task to use (and when) will help speed up your builds, improve repeatability, and enhance efficiency.

## Workspaces

 When workspaces are declared in jobs, unique data like files and directories can be added. In turn, the workspace can pass along this unique data to other jobs in the workflow. Each additional data point creates a new layer and can ultimately be used in downstream jobs for its own needs or it can add an additional layer on top.

Workspaces are only stored for up to 15 days and cannot be shared by pipeline runs. After a pipeline has run, workspaces can only be accessed during a workflow rerun within the 15 day period.

A common approach to using workspaces is to pass generated version numbers from a build job to a deploy job. However, be specific about what persists in work data to avoid storing it in subsequent jobs you don't need.

<img src="https://github.com/coro121/croberson-circleci/blob/main/Media/reusingworkspaces.png?raw=true" alt="Workspaces strategy workflow" height="500" width="800">

## Caching

Caching persists data between the same job in different workflow builds. It allows you to reuse data from expensive fetch operations from previously ran jobs. After the initial job run, future instances will perform faster because they will not need to redo the work.

For example, package dependencies managers do not have to re-download everything on every build. It will only need to download new dependencies. Keep in mind that caching is global within a project. If it is saved on a branch, make sure it is safe to run on other branches.

<img src="https://github.com/coro121/croberson-circleci/blob/main/Media/cachingstrategy.png?raw=true" alt="caching strategy workflow" height="500" width="800" />

## Additional Information

Before you reduce data usage, consider whether it's providing enough value to be kept. When deciding between using workspaces or caches for persist data, consider the distinctions below:

| Type       | Lifetime             | Use                                                                                        | Example                                                                                                                                                                                                                                                                  |
|------------|----------------------|--------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Workspaces | Duration of workflow | Attach the workspace in a downstream container with the ```attach_workspace:``` step.   | The ```attach_workspace``` copies and re-creates the entire workspace content when it runs.                                                                                                                                                                      |
| Caches     | Months               | Store non-vital data that may help the job run faster, <br>for example npm or Gem packages | The ```save_cache``` job step with a ```path``` to a list of directories<br>to add and a ```key``` to uniquely identify the cache <br>(for example, the branch, build number, or revision). Restore the cache with <br>```restore_cache``` and the appropriate ```key``` |
