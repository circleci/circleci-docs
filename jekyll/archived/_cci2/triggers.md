---
layout: classic-docs
title: "Triggers"
short-title: "Triggers"
description: "Description of triggers"
categories: [builds]
order: 2
version:
- Cloud
- Server v3.x
- Server v2.x
---


There are a few great tricks for triggering and scheduling builds in the following snippets!

## Skip builds
{: #skip-builds }

By default, CircleCI automatically builds a project whenever you push changes to a version control system (VCS). You can override this behavior by adding a [ci skip] or [skip ci] tag anywhere in a commit’s title or description.


## Trigger a job using curl and your API token
{: #trigger-a-job-using-curl-and-your-api-token }

```shell
curl -u ${CIRCLE_API_USER_TOKEN}: \
     -d 'build_parameters[CIRCLE_JOB]=deploy_docker' \
     https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/<branch>
```

## Scheduled builds
{: #scheduled-builds }

```yml
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

## Manual approval
{: #manual-approval }

```yml
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

## Trigger Docker builds in Dockerhub
{: #trigger-docker-builds-in-dockerhub }

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cimg/node:16.13.1-browsers # < an arbitrarily chosen docker image.
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          # example curl request from dockerhub documentation
          name: Trigger docker remotely
          command: curl --data build=true -X POST https://registry.hub.docker.com/u/svendowideit/testhook/trigger/be579c82-7c0e-11e4-81c4-0242ac110020/
```

## See also
{: #see-also }

[Workflows]({{ site.baseurl }}/workflows/)
