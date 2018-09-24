---
layout: crwdns33218:0crwdne33218:0
title: "crwdns33219:0crwdne33219:0"
category:
  - crwdns33220:0crwdne33220:0
order: rwdne33221:0ac9.44437619crwdns33221:0crwdne33221:0
---
crwdns33222:0crwdne33222:0

- crwdns33223:0{:toc}crwdne33223:0

## crwdns33224:0crwdne33224:0

crwdns33227:0crwdne33227:0 crwdns33228:0crwdne33228:0 ![crwdns33226:0crwdne33226:0](crwdns33225:0{{ site.baseurl }}crwdne33225:0)

### crwdns33229:0crwdne33229:0

crwdns33232:0crwdne33232:0![crwdns33231:0crwdne33231:0](crwdns33230:0{{ site.baseurl }}crwdne33230:0)

### crwdns33233:0crwdne33233:0

crwdns33234:0crwdne33234:0

- crwdns33237:0crwdne33237:0![crwdns33236:0crwdne33236:0](crwdns33235:0{{ site.baseurl }}crwdne33235:0)

- crwdns33240:0crwdne33240:0![crwdns33239:0crwdne33239:0](crwdns33238:0{{ site.baseurl }}crwdne33238:0)

crwdns33241:0crwdne33241:0

### crwdns33242:0crwdne33242:0

crwdns33243:0crwdne33243:0

crwdns33244:0crwdne33244:0

crwdns33245:0crwdne33245:0

## crwdns33246:0crwdne33246:0

crwdns33247:0crwdne33247:0 crwdns33248:0crwdne33248:0 crwdns33249:0crwdne33249:0 crwdns33250:0crwdne33250:0

crwdns33251:0{{ site.baseurl }}crwdne33251:0

### crwdns33252:0crwdne33252:0

crwdns33253:0crwdne33253:0 crwdns33254:0crwdne33254:0

1. crwdns33255:0crwdne33255:0 crwdns33256:0crwdne33256:0 crwdns33257:0crwdne33257:0

2. crwdns33258:0crwdne33258:0 crwdns33259:0crwdne33259:0 crwdns33260:0crwdne33260:0

crwdns33261:0crwdne33261:0 crwdns33262:0crwdne33262:0

## crwdns33263:0crwdne33263:0

crwdns33264:0crwdne33264:0 crwdns33265:0crwdne33265:0 crwdns33266:0crwdne33266:0

### crwdns33267:0crwdne33267:0

crwdns33268:0crwdne33268:0 crwdns33269:0crwdne33269:0

crwdns33270:0crwdne33270:0 crwdns33271:0crwdne33271:0

### crwdns33272:0crwdne33272:0

crwdns33273:0crwdne33273:0

crwdns33274:0crwdne33274:0

- [crwdns33276:0crwdne33276:0](crwdns33275:0crwdne33275:0)
- [crwdns33278:0crwdne33278:0](crwdns33277:0crwdne33277:0)
- [crwdns33280:0crwdne33280:0](crwdns33279:0crwdne33279:0)
- [crwdns33282:0crwdne33282:0](crwdns33281:0crwdne33281:0)
- [crwdns33284:0crwdne33284:0](crwdns33283:0crwdne33283:0)

crwdns33285:0crwdne33285:0 crwdns33286:0crwdne33286:0

crwdns33287:0crwdne33287:0

    crwdns33288:0[general]crwdnd33288:0%Y/%m/%dcrwdnd33288:0%H:%M:%Scrwdnd33288:0{instance_id}crwdne33288:0
    

crwdns33289:0crwdne33289:0

### crwdns33290:0crwdne33290:0

crwdns33291:0crwdne33291:0 crwdns33292:0crwdne33292:0 crwdns33293:0crwdne33293:0

    crwdns33294:0crwdne33294:0
    

crwdns33295:0crwdne33295:0

crwdns33296:0crwdne33296:0 crwdns33297:0crwdne33297:0

crwdns33298:0crwdne33298:0 crwdns33299:0crwdne33299:0

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