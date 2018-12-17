---
layout: classic-docs
title: "Tips for Migrating to 2.0"
description: "Tips for Migrating from 1.0 to CircleCI 2.0 Config"
---


CircleCI is getting closer to the end of life for v1.0. If you haven't started the migration to 2.0 yet take a look through some of the tips and best practices aggregated below.

Remember **August 31st, 2018** is the last day for 1.0 builds. You need to make sure all of your projects are converted if you'd like them to continue building on CircleCI. You can read more about 1.0 end of life and find other helpful resources on our [sunsetting 1.0 page](https://circleci.com/sunset1-0/).

* TOC
{:toc}

## You Can Build the Same Project on Both CircleCI 1.0 and 2.0!

When starting to migrate to CircleCI 2.0 you don't have to migrate everything right away. Keep your project building on 1.0 and try 2.0 by doing the following:

- Create a new branch for testing 2.0.
- Remove `circle.yml` from that branch and add a `.circleci/config.yml` file.
- Write some minimal 2.0 config on that branch and push it until you get a green build.
- Add a little bit of config at a time so you can get feel for how it works - initially, just check out the code, then try installing dependencies, then try running your tests. Later you can start working out how to cache dependencies and use more advanced features like Workflows. Build up your config bit by bit.
- When you have everything working you can merge the branch with the new config into your main project.

## Tips for Setting Up CircleCI 2.0

- Commands listed in the `steps` may only be run in the first container listed in the `docker` section.
- Run builds frequently to test the config so if something breaks, you will know what changed since the last build.
- Don't add Workflows initially; wait until you have a functional build. If you do add Workflows, be sure to check the Workflows tab of the CircleCI app if your jobs aren't running. Incorrect Workflows config will prevent jobs from running and the errors with details about the problem appear on the Workflows page of the app.
- Build a config manually from scratch, but use the [`config-translation` endpoint]({{ site.baseurl }}/2.0/config-translation/) as a reference.
- You can't define environment variables in the `environment` section of the config.
	- The workaround is to echo the variables into `$BASH_ENV`.
		- Echo of variables into `$BASH_ENV` only works with `bash`, not `sh` (Alpine images only have `sh`).

- Conditionally run commands with `bash` `if` statements
	- `if [ $CIRCLE_BRANCH = `master` ] ; then ./ci.sh ; fi`
- Conditionally halt the build at that step with `circleci-agent step halt`
	- Allows you to use `setup_remote_docker` conditionally by halting
- The Timezone can be changed just by defining an environment variable
	- `TZ: /usr/share/zoneinfo/America/New_York`
- Running the build out of `/dev/shm` (for example, `/dev/shm/project`) can speed up certain projects
	- Some things like Ruby gems can't be loaded out of shared memory. They can be installed elsewhere in the system (for example, `~/vendor`) and symlinked in.
- Instead of prefixing a lot of commands with sudo, consider setting the shell to sudo for that `run`
	- `shell: sudo bash -eo pipefail`

- Docker builds and docker-compose should generally be run in the `machine`. However, if language-specific tools (Ruby, Node, PHP, etc.) are required beforehand, the remote environment may be  sufficient.
- Some tasks can be set to run in the background to save overall build time, but be careful of running out of resources.
- Different `resource_class` sizes can be beneficial and it is worth trying them to see their impact.
- The `$PATH` can be set to a string. If you don't know the `$PATH` for your Docker image, just run it and `echo $PATH` or take a look at the output of `env`.
- The `sha` of an image can be referenced under the `Spin up Environment` step. An image can be hardcoded to that `sha` value to make it immutable.

- Service containers can be run with custom flags
	- `command: [mysqld, --character-set-server=utf8mb4, --collation-server=utf8mb4_unicode_ci, --init-connect='SET NAMES utf8mb4;']`
- Configure your test runners to only spawn two threads or workers (or more if you're using `resource_class`) when running in CI. Sometimes they will optimize themselves based on incorrect values. [Check out this video with more info](https://www.youtube.com/watch?v=CKDVkqIMpHM).



## Tips for Migrating from 1.0 to 2.0

- Note that `$CIRCLE_ARTIFACTS` and `$CIRCLE_TEST_REPORTS` are not defined in 2.0
	- You can define them yourself, but be sure to `mkdir -p $CIRCLE_ARTIFACTS $CIRCLE_TEST_REPORTS` if you do.
- Migrating Linux & macOS in one repository (like React Native) should involve opening one branch for each Linux & macOS before combining the two configs into one workflow.
- You can't `sudo echo` - pipe it like this: `echo 192.168.44.44 git.example.com | sudo tee -a /etc/hosts`
- Fonts are different between Ubuntu and Debian systems.
- Apache 2.2 and 2.4 configs are fairly different - make sure to upgrade your 2.2 configs.
- Don't forget to migrate all of the commands inferred automatically by 1.0 and commands that were manually stored in the UI.


## Python
- Typically expects classnames and not filenames to run tests

## Ruby
- Ruby files can load in a different order than expected on AUFS
- Define `$RAILS_ENV` and `$RACK_ENV` as `test` (this was automatic in 1.0)


## Java
- Java (apps, tools, and services) will OOM (run out of memory) because it doesn't recognize how much RAM is available. An environment variable should be defined. If it's still running out of memory, a bigger container is necessary.
	- [CircleCI How to Handle OOM Errors blog](https://circleci.com/blog/how-to-handle-java-oom-errors/)
- Scala projects can have filenames that are too long, include the `-Xmax-classfile-name` flag.

	```
			    scalacOptions ++= Seq(
			      `-encoding`, `utf-8`,
			      `-target:jvm-1.8`,
			      `-deprecation`,
			      `-unchecked`,
			      `-Xlint`,
			      `-feature`,
			      `-Xmax-classfile-name`, `242` <= add here
			    ),
```


## Tips for Browser Testing
- Tests can sometimes be flaky and may appear to fail for no reason. You can re-run your failing browser tests automatically, however, this will corrupt the timing data.
- Take screenshots of failed tests to make debugging easier.
- VNC can be installed & used. The browser can be dragged around in VNC after installing `metacity`. Run this from one of our browsers images:
```
			ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901 # To connect via SSH
			sudo apt install vnc4server metacity
			vnc4server -geometry 1280x1024 -depth 24
			export DISPLAY=:1.0
			metacity &
			firefox &
```

## Tips for Docker

- Building a Docker image on a cron job has these benefits:
	- Build weekly, daily, or whenever you need
		- Make it possible to trigger a new Docker image build via the API easily
	- Including dependencies like `node_modules` in the image has these benefits:
		- Helps mitigate issues from a DNS outage
		- Keeps the dependencies version controlled
		- Even if a module disappears from the node repositories, the necessary dependencies to run the application are safe.
	- A private image can include private gems and private source cache

- There is no socket file for databases so the host variables need to be defined (`$PGHOST`, `$MYSQL_HOST`) to specify 127.0.0.1, forcing TCP
- Using CircleCI convenience or official Docker Hub images increases the chance of having your image cached on the host
	- Building off these images will reduce the number of image layers that need to be downloaded
- Using the `-ram` variation of a container will run the given daemon in `/dev/shm`
- Building custom images with everything pre-installed speeds up the build and adds reliability
	- This prevents a situation wherein Heroku (for example) pushes a bad update to their installer that breaks your builds
- The `dockerize` utility can be used to wait for service containers to be available before running tests
	- https://github.com/jwilder/dockerize
- ElasticSearch has their own Docker registry from which to pull
	- https://www.docker.elastic.co/
- Containers can have names. So, multiple containers of a given service can run on the same port with different hostnames.
- Privileged containers can be run in the remote environment and the `machine` executor.
- Volumes can't be mounted from the base Docker executor into the remote environment
	- `docker cp` can transfer files
	- Volumes referenced will be mounted from the within the remote environment into the container




## Fun Facts

- You are limited by your imagination in CircleCI 2.0
- The shell can be set to Python to just execute arbitrary Python in the YAML
```
			- run:
				shell: /usr/bin/python3
				command:
					import sys
					print(sys.version)
```
- You can be clever with bash to achieve whatever you need
			`for i in {1..5}; do curl -v $ENDPOINT_URL && break || sleep 10; done`
