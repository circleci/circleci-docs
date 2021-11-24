---
term: Pipeline
--- 

A pipeline is an object that you may configure and run on the CircleCI platform. A pipeline can be triggered through webhooks when code is pushed to your git repository, or when you use the CircleCI API. The pipeline's configuration includes workflows and jobs that may be run with other elements like parameters and orbs. 

Note that each pipeline is run against a particular project by a specific actor.

the unit of triggered work in response to a change, comprising workflows and jobs.

Triggered in a project with a config.yml file. Contains workflows; has a fixed, linear lifecycle.

**Pipelines** represent the entire configuration that is run when you build your CircleCI projects. The entirety of a
`.circleci/config.yml` file is executed by a pipeline.

Pipelines are the most high-level unit of work, and contain zero or more workflows. A single git-push always triggers up to one pipeline. Pipelines can also be triggered manually through the API.
