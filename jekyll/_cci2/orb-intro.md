---
layout: classic-docs
title: "Orbs Introduction"
short-title: "Orbs Introduction"
description: "Starting point for CircleCI Orbs"
categories: [getting-started]
order: 1
---

_Available on CircleCI with `version 2.1` config. Not currently available on self-hosted installations of CircleCI Server_

CircleCI orbs are shareable packages of configuration elements, including jobs, commands, and executors. CircleCI provides certified orbs, along with 3rd-party orbs authored by CircleCI partners. Refer to the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) for the complete list of certified orbs.

## Using CircleCI Orbs

To use CircleCI orbs in your pipeline, simply choose the orb you require from the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) and import the orb into your `version: 2.1` config file to get access to the orb's elements. If you choose to use a 3rd party orb (not certified by CircleCI) you will also need to opt in to use 3rd part orbs. If you are looking for information on authoring your own orb, head to our [Orb Authoring guide]({{ site.baseurl }}/2.0/orb-author-intro/).

### Importing Orbs

To import orbs into your [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/), use `version 2.1` followed by the `orbs` stanza under which you can invoke any orbs you wish to use. For example:

```yaml
version: 2.1

orbs:
  slack: circleci/slack@0.1.0
  heroku: circleci/heroku@0.0.1
```

In the above example, the following two orbs are imported into the config, giving access to all orb elements: jobs, commands and executors:

- [Slack orb](https://circleci.com/orbs/registry/orb/circleci/slack) 
- [Heroku orb](https://circleci.com/orbs/registry/orb/circleci/heroku)

## Why use Orbs?

Using orbs can greatly simplify your configuration. To illustrate this, take a look at the following example of testing a Node application and deploying to Heroku:

{:.tab.nodeheroku.Orbs}
```yaml
version: 2.1

orbs:
  heroku: circleci/heroku@x.y
  node: circleci/node@x.y

workflows:
  test-and-deploy:
    jobs:
      - node/test
      - heroku/deploy-via-git:
          filters:
            branches:
              only:
                - master
          requires:
            - node/test
```

{:.tab.nodeheroku.Without-Orbs}
```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: image-name-tag
    steps:
  test:
    docker:
      - image: image-name-tag
    steps:
  deploy:
    docker:
      - image: image-name-tag
    steps:

workflows:
  test-and-deploy:
    jobs:
      - build
      - test:
          requires:
            - build
      - deploy:
          filters:
            branches:
              only:
                - master
          requires:
            - test
```

## See Also
- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/using-orbs/) for high-level information about CircleCI orbs.
- Refer to [Orbs FAQ]({{site.baseurl}}/2.0/orbs-faq/) for information on known issues and questions that have been addressed when using CircleCI orbs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) for information on how to test orbs you have created.
- Refer to [Orbs Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/) for information about how you can use CircleCI orb recipes in your configurations.