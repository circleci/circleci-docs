---
layout: classic-docs
title: "Deployment Integrations"
short-title: "Deployment Integrations"
categories: [deploying]
order: 11
---

This document describes using OpenVpn with CircleCI :


## VPN Support

It is possible to deploy to your own secure servers behind your firewires from the SaaS product. You may remember we published this [blog post] (https://circleci.com/blog/vpns-and-why-they-don-t-work/) saying that it wasn't possible, but thanks to 2.0 we can now accomplish this. First go through a regular workflow, the only thing that changes is our deploy step as we'll need to use a machine executor in order to gain permissions to create a network tunnel. 




```YAML
defaults: &defaults
  working_directory: /tmp

version: 2
jobs:
  flow:
    <<: *defaults
    docker:
      - image: buildpack-deps:jessie
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
    machine: true
    steps:      
      - run: sudo apt-get update
      - run: sudo apt-get install openvpn
      - run: sudo cp /usr/share/doc/openvpn/examples/sample-config-files/client.conf /etc/openvpn/
      - attach_workspace:
          # Must be absolute path or relative path from working_directory
          at: /tmp/workspace

      - run: |
          if [[ `cat /tmp/workspace/echo-output` == "Hello, world!" ]]; then
            echo "It worked!";
          else
            echo "Nope!"; exit 1
          fi
          
      # example curl call to send file over the tunnel interface
      - run: curl --interface tun0 -F `@=file` <ip-address>
workflows:
  version: 2

  btd:
    jobs:
      - flow
      - downstream:
          requires:
            - flow

```

Note: That if you're using specific certificates you'll want to include those in your dockerfile and transfer them in the workspace as well. Happy Deploying!
