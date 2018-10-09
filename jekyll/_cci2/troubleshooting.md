---
layout: classic-docs
title: "Troubleshooting Server Installations"
category: [administration]
order: 12
description: "Troubleshooting steps to take for server installations of CircleCI"
---
This document describes
an initial set of troubleshooting steps to take
if you are having problems with your CircleCI installation on your private server.
If your issue is not addressed below,
please [generate a support bundle](https://help.replicated.com/docs/native/packaging-an-application/support-bundle/)
and contact our Support Engineers
by [opening a support ticket](https://support.circleci.com/hc/en-us/requests/new).

## Debugging Queuing Builds

If your Services component is fine, but builds are not running or all builds are queueing, follow the steps below.

1. Run `sudo docker logs dispatcher`, if you see log output that is free of errors you may continue on the next step.
If the logs dispatcher container does not exist or is down, start it by running the `sudo docker start <container_name>` command and monitor the progress. The following output indicates that the logs dispatcher is up and running correctly:

```
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.run-queue dispatcher mode is on - no need for run-queue
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.usage-queue 5a4ea0047d560d00011682dc: GERey/realitycheck/37 -> forwarded to run-queue
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.usage-queue 5a4ea0047d560d00011682dc: publishing :usage-changed (:recur) event
Jan 4 22:38:39.069:+0000 INFO circle.backend.build.usage-queue got usage-queue event for 5a4ea0047d560d00011682dc (finished-build)
```

If you see errors or do not see the above output, investigate the stack traces because they indicate that there is an issue with routing builds from 1.0 to 2.0. If there are errors in the output, then you may have a problem with routing builds to 1.0 or 2.0 builds.

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

As soon as you run a build, you should see the above message to indicate that it has been dispatched to the scheduler. If you do not see the above output or you have a stack trace in the picard-dispatcher container, contact CircleCI support.

If you run a 2.0 build and do not see a message in the picard-dispatcher log output, it often indicates that a job is getting lost between the dispatcher and the picard dispatcher. Stop and restart the CircleCI app to re-establish the connection between the two containers.


1. Run `sudo docker logs picard-scheduler` . The `picard-scheduler` schedules jobs and sends them to nomad through a direct connection. It does not actually handle queuing of the jobs in CircleCI.


1. Check to see if there are any nomad nodes by running the `nomad node-status -allocs` command and viewing the following output:

```
ID        DC         Name             Class        Drain  Status  Running Allocs
ec2727c5  us-east-1  ip-127-0-0-1     linux-64bit  false  ready   0
```

If you do not see any nomad clients listed, please consult our [nomad guide]({{site.baseurl}}/2.0/nomad/) for more detailed information on managing and troubleshooting the nomad server.

**Note:** DC in the output stands for datacenter and will always print us-east-1 and should be left as such. It doesn't affect or break anything. The things that are the most important are the Drain, Status, and Allocs columns.

- Drain - If `Drain` is `true` then CircleCI will **not** route jobs to that nomad client. It is possible to change this value by running the following command `nomad node-drain [options] <node>`. If you set Drain to `true`, it will finish the jobs that were currently running and then stop accepting builds. After the number of allocations reaches 0, it is safe to terminate instance. If `Drain` is set to `false` it means the node is accepting connections and should be getting builds.  

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
   - Run the `picard-output-processor` command to check those logs for specific errors.
