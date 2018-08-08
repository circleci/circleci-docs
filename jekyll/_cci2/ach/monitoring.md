---
layout: crwdns15980:0crwdne15980:0
title: "crwdns15981:0crwdne15981:0"
category:
  - crwdns15982:0crwdne15982:0
order: crwdns15983:0crwdne15983:0
---
crwdns15984:0crwdne15984:0

- crwdns15985:0{:toc}crwdne15985:0

## crwdns15986:0crwdne15986:0

crwdns15989:0crwdne15989:0 crwdns15990:0crwdne15990:0 ![crwdns15988:0crwdne15988:0](crwdns15987:0{{ site.baseurl }}crwdne15987:0)

### crwdns15991:0crwdne15991:0

crwdns15994:0crwdne15994:0![crwdns15993:0crwdne15993:0](crwdns15992:0{{ site.baseurl }}crwdne15992:0)

### crwdns15995:0crwdne15995:0

crwdns15996:0crwdne15996:0

- crwdns15999:0crwdne15999:0![crwdns15998:0crwdne15998:0](crwdns15997:0{{ site.baseurl }}crwdne15997:0)

- crwdns16002:0crwdne16002:0![crwdns16001:0crwdne16001:0](crwdns16000:0{{ site.baseurl }}crwdne16000:0)

crwdns16003:0crwdne16003:0

### crwdns16004:0crwdne16004:0

crwdns16005:0crwdne16005:0

crwdns16006:0crwdne16006:0

## crwdns16007:0crwdne16007:0

crwdns16008:0crwdne16008:0 crwdns16009:0crwdne16009:0 crwdns16010:0crwdne16010:0 crwdns16011:0crwdne16011:0

crwdns16012:0{{ site.baseurl }}crwdne16012:0

### crwdns16013:0crwdne16013:0

crwdns16014:0crwdne16014:0 crwdns16015:0crwdne16015:0

1. crwdns16016:0crwdne16016:0 crwdns16017:0crwdne16017:0 crwdns16018:0crwdne16018:0

2. crwdns16019:0crwdne16019:0 crwdns16020:0crwdne16020:0 crwdns16021:0crwdne16021:0

crwdns16022:0crwdne16022:0 crwdns16023:0crwdne16023:0

## crwdns16024:0crwdne16024:0

crwdns16025:0crwdne16025:0 crwdns16026:0crwdne16026:0 crwdns16027:0crwdne16027:0

### crwdns16028:0crwdne16028:0

crwdns16029:0crwdne16029:0 crwdns16030:0crwdne16030:0

crwdns16031:0crwdne16031:0 crwdns16032:0crwdne16032:0

### crwdns16033:0crwdne16033:0

crwdns16034:0crwdne16034:0

crwdns16035:0crwdne16035:0

- [crwdns16037:0crwdne16037:0](crwdns16036:0crwdne16036:0)
- [crwdns16039:0crwdne16039:0](crwdns16038:0crwdne16038:0)
- [crwdns16041:0crwdne16041:0](crwdns16040:0crwdne16040:0)
- [crwdns16043:0crwdne16043:0](crwdns16042:0crwdne16042:0)
- [crwdns16045:0crwdne16045:0](crwdns16044:0crwdne16044:0)

crwdns16046:0crwdne16046:0 crwdns16047:0crwdne16047:0

crwdns16048:0crwdne16048:0

    crwdns16049:0[general]crwdnd16049:0%Y/%m/%dcrwdnd16049:0%H:%M:%Scrwdnd16049:0{instance_id}crwdne16049:0
    

crwdns16050:0crwdne16050:0

### crwdns16051:0crwdne16051:0

crwdns16052:0crwdne16052:0 crwdns16053:0crwdne16053:0 crwdns16054:0crwdne16054:0

    crwdns16055:0crwdne16055:0
    

crwdns16056:0crwdne16056:0

crwdns16057:0crwdne16057:0 crwdns16058:0crwdne16058:0

crwdns16059:0crwdne16059:0 crwdns16060:0crwdne16060:0

<!---## Health Monitoring Metrics

CloudWatch integration enables the following custom metrics for health monitoring:

 * `ContainersReserved` gives you a view of usage over time for capacity planning and budget estimation.
 * `ContainersLeaked` should be 0 or close to 0, an increase indicates a potential infrastructure issue.
 * `ContainersAvailable` is used for Auto Scaling.  If the value is too high, consider shutting some machines down, if the value is too low, consider starting up machines.

 * `circle.run-queue.builds` and `circle.run-queue.containers` expresses the degree to which the system is under-provisioned  and number of queued builds that are not running.  Ideally, the ASG will account for this as well.  Values that are too high may indicate an outage or incident.

 * `circle.state.running-builds` provides a general insight into current usage.

 * Note that `circle.state.num-masters` includes the web server host in the Services machine that does **not** run any builds.  That means the following:
   * If the value is 0, there is an outage or system is in maintenance.  Risk of dropping some github hooks.
   * If the value is 1, there are no Builders, so web traffic and GitHub hooks are accepted, but not run.
   * If the value is 1 + n, there are n builders running and visible to the system. If this is less than the total number of builders launched through AWS, your builders are most likely not launching correctly. If builds are queueing, but this number says you have builders available to the system, you may need to launch more builders.
--->