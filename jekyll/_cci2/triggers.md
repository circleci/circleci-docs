---
layout: classic-docs
title: "Triggers"
short-title: "Triggers"
description: "Description of triggers"
categories: [builds]
order: 2
---


There are a few great tricks for triggering and scheduling builds in the following snippets!

## Skip Builds 

By default, CircleCI automatically builds a project whenever you push changes to a version control system (VCS). You can override this behavior by adding a [ci skip] or [skip ci] tag anywhere in a commit’s title or description. 


## Trigger a Job Using curl and Your API Token

```
curl -u ${CIRCLE_API_USER_TOKEN}: \
     -d build_parameters[CIRCLE_JOB]=deploy_docker \
     https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/<branch>
```

## Scheduled Builds 

```
workflows:
  version: 2
  commit:
    jobs:
      - test
      - deploy
  nightly:
    triggers: #use the triggers key to indicate a scheduled build
      - schedule:
          cron: "0 0 * * *" # use cron syntax to set the schedule
          filters:
            branches:
              only:
                - master
                - beta
    jobs:
      - coverage
```      

## Manual Approval

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
          type: approval # requires that an in-app button be clicked by an appropriate member of the project to continue.
          requires:
           - test2
      - deploy:
          requires:
            - hold
```

## Trigger Docker Builds in Dockerhub

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:10.0-browsers # < an arbitrarily chosen docker image.
    steps:
      - checkout
      - run:
          # example curl request from dockerhub documentation
          name: Trigger docker remotely
          command: curl --data build=true -X POST https://registry.hub.docker.com/u/svendowideit/testhook/trigger/be579c82-7c0e-11e4-81c4-0242ac110020/
```

## See Also

[Workflows]({{ site.baseurl }}/2.0/workflows/)
