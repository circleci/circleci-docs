---
term: Pipeline
--- 

CircleCI pipelines are the most high-level unit of work, encompassing a project's full `.circleci/config.yml` file, including workflows, which coordinate jobs. Pipelines have a fixed, linear lifecycle, and are associated with a specific actor. Pipelines trigger when a change is pushed to a project that has a CircleCI configuration file included, and can also be scheduled, triggered manually through the CircleCI app, or using the API.

Pipelines are not available on installations of CircleCI server v2.x.