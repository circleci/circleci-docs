---
layout: classic-docs
title: "Troubleshooting CircleCI 2.0"
category: [administration]
order: 12
description: "Troubleshooting steps to take in CircleCI 2.0"
---
This document describes an initial set of troubleshooting steps to take if you are having problems with your CircleCI 2.0 installation on your private server or cloud. **Note:** It is generally a good idea to review the support bundle to check for problems first before beginning troubleshooting steps.


## Setting up ELB CERTS
CircleCI requires a few more steps to get ELB certs working as your primary certs. The steps on how to accomplish this are below.

**Note:** You'll only need HTTP below, if you plan on using HTTP requests, otherwise you can leave it out. 

1.) You'll need to following ports on your ELB

Load BalancerProtocol | Load Balancer Port | Instance Protocol | Instance Port | Cipher | SSL Certificate
----------|----------|----------|----------|----------|----------
SSL| 443 | SSL | 443 | Change | your-cert
HTTP | 80 | HTTP | 80 | N/A | N/A
HTTPS | 8800 | HTTPS | 8800| Change | your cert
SSL | 8081 | SSL | 8081 | Change | your cert
SSL | 3000 | SSL | 3000 | Change | your cert
SSL|8082| SSL| 8082 | Change | your cert

2.) You'll also need the following security group on your ELB

**Note:** The sources below are left open so that anybody can access the instance over these port ranges. If that if not what you want, then feel free to restrict them. That being said people will experience reduced functionality if your stakeholders are using ip's outside of the Source Range. 

Type | Protocol | Port Range | Source
----------|----------|----------|----------
SSH | TCP | 22 | 0.0.0.0
Custom TCP Rule | TCP | 8800 | 0.0.0.0
Custom TCP Rule | TCP | 64535-65535 | 0.0.0.0
HTTPS | TCP | 443 | 0.0.0.0

3.) Next, in the management console for CircleCI you'll need to upload dummy certs to the `Privacy` Section. These don't need to be real certs as the actual cert management is done at the ELB, but in order to use HTTPS requests, CircleCI requires knowledge of something. This is a bug that we're currently working on.

4.) If you've done the above correctly, then you'll be able to set your Github Authorization Callback to `https` rather than `http`.  





## Debugging Queuing Builds

If your Services component is fine, but builds are not running or all builds are queueing, follow the steps below.

1. Run `sudo docker logs dispatcher`. If the logs dispatcher container does not exist or is down, start it by running the `sudo docker start <container_name>` command and monitor the progress. The following output indicates that the logs dispatcher is up and running correctly:

```
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.run-queue dispatcher mode is on - no need for run-queue
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.usage-queue 5a4ea0047d560d00011682dc: GERey/realitycheck/37 -> forwarded to run-queue
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.usage-queue 5a4ea0047d560d00011682dc: publishing :usage-changed (:recur) event
Jan 4 22:38:39.069:+0000 INFO circle.backend.build.usage-queue got usage-queue event for 5a4ea0047d560d00011682dc (finished-build)
```

If you see errors or do not see the above output, investigate the stack traces because they inidicate that there is an issue with routing builds from 1.0 to 2.0. If there are errors in the output, then you may have a problem with routing builds to 1.0 or 2.0 builds. 

If you can run 1.0 builds, but not 2.0 builds, or if you can only run 2.0 builds and the log dispatcher is up and running, continue on to the next steps. 

1. Run the `sudo docker logs picard-dispatcher` command. A healthy picard-dispatcher should output the following: 

```
Jan 9 19:32:33.629:+0000 INFO picard-dispatcher.init Still running...
Jan 9 19:34:33.630:+0000 INFO picard-dispatcher.init Still running...
Jan 9 19:34:44.694:+0000 INFO picard-dispatcher.core taking build=GERey/realitycheck/38
Jan 9 19:34:45.001:+0000 INFO circle.http.builds project GERey/realitycheck at revision 2c6179654541ee3dc0abf46970551b4594986293 succcessfully fetched and parsed .circleci/config.yml
Jan 9 19:34:45.027:+0000 INFO picard-dispatcher.tasks build GERey/realitycheck/38 is using resource class {:cpu 2.0, :ram 4096, :class :medium}
Jan 9 19:34:45.027:+0000 INFO picard-dispatcher.tasks Computed tasks for build=GERey/realitycheck/38, stage=:write_artifacts, parallel=1
Jan 9 19:34:45.027:+0000 INFO picard-dispatcher.tasks build has matching jobs: build=GERey/realitycheck/38 parsed=:write_artifacts passed=:write_artifacts
```

The output should be filled with the above messages. If it is a slow day and builds are not happening very often, the output will appear as follows:

```
Jan 9 19:32:33.629:+0000 INFO picard-dispatcher.init Still running...
```

As soon as you run a build, you should see the above message to inidicate that it has been dispatched to the scheduler. If you do not see the above output or you have a stack trace in the picard-dispatcher container, contact CircleCI support. 

If you run a 2.0 build and do not see a message in the picard-dispatcher log output, it often indicates that the build is getting lost between the dispatcher and the picard dispatcher. Stop and restart the CircleCI app to re-establish the connection between the two containers.


1. Run `sudo docker logs picard-scheduler` . The `picard-scheduler` schedules builds and sends them to nomad through a direct connection. It does not actually handle queuing of the builds in CircleCI. 


1. Check to see if there are any nomad nodes by running the `nomad node-status -allocs` command and viewing the following output:

```
ID        DC         Name             Class        Drain  Status  Running Allocs
ec2727c5  us-east-1  ip-127-0-0-1     linux-64bit  false  ready   0
```

**Note:** DC in the output stands for datacenter and will always print us-east-1 and should be left as such. It doesn't affect or break anything. The things that are the most important are the Drain, Status, and Allocs columns. 

- Drain - If `Drain` is `true` then CircleCI will **not** route builds to that nomad client. It is possible to change this value by running the following command `nomad node-drain [options] <node>`. If you set Drain to `true`, it will finish the builds that were currently running and then stop accepting builds. After the number of allocations reaches 0, it is safe to terminate instance. If `Drain` is set to `false` it means the node is accepting connections and should be getting builds.  

- Status - If Status is `ready` then it is ready to accept builds and should be wired up correctly. If it is not wired up correctly it will not show `ready` and it should be investigated because a node that is not showing `ready` in the Status will not accept builds.

- Allocs - Allocs is a term used to refer to builds. So, the number of Running Allocs is the number of builds running on a single node. This number inidicates whether builds are routing. If all of the Builders have Running Allocs, but your job is still queued, that means you do not have enough capacity and you need to add more Builders to your fleet. 

If you see output like the above, but your builds are still queued, then continue to the next step. 


1. Run the `sudo docker exec -it nomad nomad status` command to view the jobs that are currently being processed. It should list the status of each job as well as the ID of the job, as follows:

```
ID                                                      Type   Priority  Status
5a4ea06b7d560d000116830f-0-build-GERey-realitycheck-1   batch  50        dead
5a4ea0c9fa4f8c0001b6401b-0-build-GERey-realitycheck-2   batch  50        dead
5a4ea0cafa4f8c0001b6401c-0-build-GERey-realitycheck-3   batch  50        dead
```

After a job has completed, the Status shows `dead`. This is a regular state for jobs. If the status shows `running`, the job is currently running. This should appear in the CircleCI app builds dashboard. If it is not appearing in the app, there may be a problem with the output-processor. Run the  `docker logs picard-output-processor` command and check the logs for any obvious stack traces. 


1. If the job is in a constant `pending` state with no allocations being made, run the `sudo docker exec -it nomad nomad status JOB_ID` command to see where Nomad is stuck and then refer to standard Nomad Cluster error documentation for information.
1. If the job is running/dead but the CircelCI app shows nothing:
   - Check the Nomad job logs by running the `sudo docker exec -it nomad nomad logs --stderr --job JOB_ID` command. **Note:** The use of `--stderr` is to print the specific error if one exists. 
   - Run the `picard-output-processor` command to check those logs for specifc errors.
