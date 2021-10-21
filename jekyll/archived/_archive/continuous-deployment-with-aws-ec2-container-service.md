---
layout: classic-docs
title: Continuous Deployment with AWS EC2 Container Service
short-title: Continuous Deployment with AWS ECS
categories: [how-to]
description: "How to continuously deploy your application using AWS EC2 Container Service, AWS Container Registry, and CircleCI."
sitemap: false
---

Go (Golang) is an increasing popular language for scalable webapps. In that 
spirit we're going to show you how to build, test, and deploy a Go webapp to 
AWS's EC2 Container Service using their EC2 Container Registry to store our 
Docker images.

We'll have some code snippets along the way but you're more than welcome to 
check the 
[example project out on GitHub](https://github.com/circleci/go-ecs-ecr) as 
well.

## Amazon Web Services (AWS) Infrastructure
There are entire series of guides on how to set up the various AWS tools and 
services you might want to use. Instead of explaining all of that here, we'll 
simply link to the official guides and provide some high-level tips.

### AWS EC2 Container Service (ECS) Setup
An ECS cluster is needed to get going. If this isn't already set up, Amazon's 
[ECS Getting Started Guide](https://aws.amazon.com/ecs/getting-started/) is a 
good place to start.

*Cluster* - Your ECS cluster will pool underlying resources (namely EC2 instances and any 
attached storage) into one single unit on which you can run your containerized 
applications. If you are not going to be using the default cluster (named 
"default") then you'll want to make sure to set your custom cluster name when 
[Launching a Container Instance](http://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_container_instance.html#instance-launch-user-data-step).

*Task Definition* - The task definition determines what containers make up your 
app and how much resources (on the cluster) to use for each container. We will 
define this via YAML later. The task definition name we set is referred 
to as the family name in the AWS CLI. Same thing. Each time we update the task 
definition, say to tell a container to use a newer version of an image, a new 
revision for the task definition will be created.

*Service* - A "service" handles the logic of running tasks on the cluster. This 
includes managing which revision of which task to run, how many copies of a 
task to run, and managing the start/shutdown/updating processes of each task. 
Take note of the service name as it will be used in the deployment script.

### AWS EC2 Container Registry (ECR) Setup
The AWS ECR is a replacement for Docker Hub. You can push and pull images via 
a Docker client. A registry for the image that contains our webapp will be 
needed. If this isn't already set up, Amazon's 
[ECR Getting Started Guide](https://aws.amazon.com/ecr/getting-started/) is a 
good place to start.

The basic concept is to create a new repository, in which AWS will give you a 
URL to use just for that repo. The URL is prefixed with your AWS Account ID. 
While not technically a "secret" bit of information, we're going to inject that 
into our deployment process via environment variables anyway.

*Permission* - The ECS Container agent(s) need to have access to your 
repository. Make sure the underlying EC2 instances are allowed to access the 
repo. Their inherited policies should allow for "ecr:GetAuthorizationToken" at 
minimum".

## Docker
This is a pretty barebones example and as such, we have a very barebones 
Dockerfile.

```
# Building on top of Ubuntu 14.04. The best distro around.
FROM ubuntu:14.04

COPY ./go-ecs-ecr /opt/
EXPOSE 8080

ENTRYPOINT ["/opt/go-ecs-ecr"]
```

Basically we're taking the executable that CircleCI will build for us, slapping 
it on Ubuntu 14.04, and exposing port 8080 so that the app can receive traffic 
outside the container.

## CircleCI - The Magic That Makes Everything Happen
By default, CircleCI can take a project, determine if it's written in Go, and 
run the built-in test suite `go test`. Still, we create a `circle.yml` to 
enable more advanced features.

```
machine:
  services:
    - docker

dependencies:
  post:
    - docker build -t $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/go-sample-webapp:$CIRCLE_SHA1 .

test:
  post:
    - docker run -d -p 8080:8080 --name sample-go-webapp $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/go-sample-webapp:$CIRCLE_SHA1; sleep 10
    - curl --retry 10 --retry-delay 5 localhost:8080 | grep "Hello World!"

deployment:
  prod:
    branch: master
    commands:
      - ./deploy.sh
```

For CircleCI we:

1. Start Docker
1. Build an image as the last dependency step
1. Run `go test` (done automatically)
1. Run the created Docker image in a container
1. Test the container with curl for the expected output
1. On a successful build, run deploy.sh

## deploy.sh
Here we do the meat of deployment. This script mainly does three things. 
Configure the AWS CLI for us to use, update our image on ECR, and then deploy to 
ECS.

### Configure AWS CLI
The `configure_aws_cli` function sets our default AWS region and output type. 
There's actually three more bits of information that we set for the CLI however 
you won't find it in the repo due to privacy reasons. We set the environment 
variables `AWS_ACCOUNT_ID`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`. 
The latter two variables will be automatically picked up by the CLI and used to 
grant us access to our AWS resources. The account ID will be used as a prefix 
for our private Docker repository URL.

### Pushing The New Docker Image To ECR
Anyone familiar with Docker will know that to push to a private repository, even 
on Docker Hub, you'll need to run `docker login` first. Instead of providing us 
credentials outright, ECR generates login tokens that we can use for the 
registry. These tokens expire within 12 hours so not very convenient for a 
script. This is why we generate that login token on the fly within `deploy.sh` 
by calling the AWS CLI to retrieve the token, then running that output with 
Bash.

A `docker push` to our ECR repository (prefixed with an environment variable 
set in CircleCI) is the final step to getting our image into AWS and ready for 
deployment.

### Deploying to ECS
This is the final stretch for our build, test, and deploy process. The 
`deploy_cluster` function does three main task:

1. First we create a new revision of our task definition. Each revision 
(created on each deploy) only differs by the image tag we specify. We update 
the task family with the new task revision.
1. Update the running service to use the new task definition revision.
1. Wait. Based on how the service was configured, it will smartly stop & start 
task to update everything to the newest revision. Once the script sees the new 
task definition running, it's considered a success and ends.

## Wrap-up
The [example project](https://github.com/circleci/go-ecs-ecr) we made for 
this guide takes about 2 and a half minutes total to build, test, and deploy via 
CircleCI. That's with the script specifically waiting for everything to be done 
on AWS's end. If we were to leave that part out, everything is completed within 
a mere minute and a half.

The power of CircleCI allows a developer to run through all the steps in this 
guide on each push, automatically. Failed builds get alerted so you can work on 
fix while passing builds get deployed with no hassle.
