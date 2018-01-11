---
layout: classic-docs
title: "Troubleshooting CircleCI 2.0"
category: [administration]
order: 12
description: "Troubleshooting steps to take in CircleCI 2.0"
---

## Debugging Queuing builds.

If your services box is fine, but don't have builds running or all of your builds are queueing then follow the steps below. It is generally a good idea to go a look through the support bundle to see if something obvious isn't standing out.

If in the process of collecting logs, the container doesn't exist. It might have crashed. You can start the docker container by doing a `sudo docker start <container_name>`. Only do that if any of the following containers are down. 

1. Run `sudo docker logs dispatcher`. If this container does not exist or is down. Then please start it and monitor the progress. What you want to see is the following:

	```
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.run-queue dispatcher mode is on - no need for run-queue
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.usage-queue 5a4ea0047d560d00011682dc: GERey/realitycheck/37 -> forwarded to run-queue
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.usage-queue 5a4ea0047d560d00011682dc: publishing :usage-changed (:recur) event
Jan 4 22:38:39.069:+0000 INFO circle.backend.build.usage-queue got usage-queue event for 5a4ea0047d560d00011682dc (finished-build)
```
	If you see errors or don't see the above, you should investigate those stack traces as they mean that there is an issue when we are routing builds from 1.0 to 2.0. If there are errors here then you might have issue routing builds to 1.0 or 2.0 builds. If you can run 1.0 builds, but not 2.0 builds , then continue on. If you only run 2.0 but your dispatcher looks fine, then continue on.  

1. Run ` sudo docker logs picard-dispatcher ` . A healthy picard-dispatcher should look like this: 

	```
Jan 9 19:32:33.629:+0000 INFO picard-dispatcher.init Still running...
Jan 9 19:34:33.630:+0000 INFO picard-dispatcher.init Still running...
Jan 9 19:34:44.694:+0000 INFO picard-dispatcher.core taking build=GERey/realitycheck/38
Jan 9 19:34:45.001:+0000 INFO circle.http.builds project GERey/realitycheck at revision 2c6179654541ee3dc0abf46970551b4594986293 succcessfully fetched and parsed .circleci/config.yml
Jan 9 19:34:45.027:+0000 INFO picard-dispatcher.tasks build GERey/realitycheck/38 is using resource class {:cpu 2.0, :ram 4096, :class :medium}
Jan 9 19:34:45.027:+0000 INFO picard-dispatcher.tasks Computed tasks for build=GERey/realitycheck/38, stage=:write_artifacts, parallel=1
Jan 9 19:34:45.027:+0000 INFO picard-dispatcher.tasks build has matching jobs: build=GERey/realitycheck/38 parsed=:write_artifacts passed=:write_artifacts
```
and it should be filled with the above. If it is a slow day and builds are not happening very often, you'll mostly just see

	```
Jan 9 19:32:33.629:+0000 INFO picard-dispatcher.init Still running...
```
, but as soon as you run a build you should be able to see the above and that tells us that its been dispatched to the scheduler. If you don't see the above or you have a stack trace in this container, then you'll want to reach out to us. If you run a 2.0 build and don't see it here, it often means that the builds is getting lost between the dispatcher and the picard dispatcher. Its worth just stopping and starting the CircleCI app in order to re-establish the connection between the two containers.


1. Run `sudo docker logs picard-scheduler` . The picard scheduler schedules our builds and sends them to nomad. It makes the direct connection and just takes things and pushes it to nomad. It somewhat confusingly doesn't actually schedule the builds in CircleCI w.r.t to the queue. 


1. Check to see if there are any nomad nodes. Run `nomad node-status -allocs`. This should look like the following:

	```
ID        DC         Name             Class        Drain  Status  Running Allocs
ec2727c5  us-east-1  ip-127-0-0-1     linux-64bit  false  ready   0
```

	There are a few things that should be explained above. DC stands for datacenter. At the moment this will always say us-east-1 no matter what. Just leave it like that. It doesn't affect or break anything. We will eventually fix that...probably. 

	The things that are the most important are the last three. If `Drain` is set to `true` then CircleCI will NOT route builds to that nomad client. This can be accomplished with the following command `nomad node-drain [options] <node>` . If you set Drain to `true` , it will finish the builds that were currently running and then stop accepting builds. Once the number of allocations is 0, then it is safe to terminate instance. If `Drain` is set to `false` it means the node is accepting connections and should be getting builds.  

	The second field that is important is Status. If status is set to `ready` then that means that it is ready to accept builds and should be wired up correctly. If not wired up correctly it will not say ready and that should be investigated as a node that it not ready will not be accepting builds.  The last thing to note is allocs. Allocations are what we call builds. So the number of allocations is the number of builds running on a single node. This tells us whether builds are routing. If all the builders have alloced builds, but your job is still queued that means you don't have enough capacity and need to add more builders to your fleet. If you see the above but your builds are still queued then you'll need to go to the next step. 


1. Run (`sudo docker exec -it nomad nomad status`) .This will show us the jobs that are currently being processed. It should show the status of each job as well as the id of the job. Sample output is shown below. 

	```
ID                                                      Type   Priority  Status
5a4ea06b7d560d000116830f-0-build-GERey-realitycheck-1   batch  50        dead
5a4ea0c9fa4f8c0001b6401b-0-build-GERey-realitycheck-2   batch  50        dead
5a4ea0cafa4f8c0001b6401c-0-build-GERey-realitycheck-3   batch  50        dead
```

	Once a job has completed we set it to dead. This is a regular state for jobs. If the status shows `running`, then that means we're currently running the job. This should be updated in the UI. If it is not then there might be a problem with the output-processor `docker logs picard-output-processor` and it is worth checking the logs there for any obvious stack traces. 


1. If the job is in a constant `pending` state with no allocations being made, run the following command  (`sudo docker exec -it nomad nomad status JOB_ID`) . This will show you where nomad is stuck. Generally you can google the issue as we use nomad in a pretty standard way.
1. If the job is running/dead but UI shows nothing:
   - check nomad job logs (`sudo docker exec -it nomad nomad logs --stderr --job JOB_ID`) ( note the use of --stderr to see if anything specific has happened ) 
   - check `picard-output-processor` logs
