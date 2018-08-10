---
layout: crwdns23799:0crwdne23799:0
title: "crwdns23800:0crwdne23800:0"
category:
  - crwdns23801:0crwdne23801:0
order: crwdns23802:0crwdne23802:0
---
crwdns23803:0crwdne23803:0

- crwdns23804:0{:toc}crwdne23804:0

## crwdns23805:0crwdne23805:0

crwdns23808:0crwdne23808:0 crwdns23809:0crwdne23809:0 ![crwdns23807:0crwdne23807:0](crwdns23806:0{{ site.baseurl }}crwdne23806:0)

### crwdns23810:0crwdne23810:0

crwdns23813:0crwdne23813:0![crwdns23812:0crwdne23812:0](crwdns23811:0{{ site.baseurl }}crwdne23811:0)

### crwdns23814:0crwdne23814:0

crwdns23815:0crwdne23815:0

- crwdns23818:0crwdne23818:0![crwdns23817:0crwdne23817:0](crwdns23816:0{{ site.baseurl }}crwdne23816:0)

- crwdns23821:0crwdne23821:0![crwdns23820:0crwdne23820:0](crwdns23819:0{{ site.baseurl }}crwdne23819:0)

crwdns23822:0crwdne23822:0

### crwdns23823:0crwdne23823:0

crwdns23824:0crwdne23824:0

crwdns23825:0crwdne23825:0

## crwdns23826:0crwdne23826:0

crwdns23827:0crwdne23827:0 crwdns23828:0crwdne23828:0 crwdns23829:0crwdne23829:0 crwdns23830:0crwdne23830:0

crwdns23831:0{{ site.baseurl }}crwdne23831:0

### crwdns23832:0crwdne23832:0

crwdns23833:0crwdne23833:0 crwdns23834:0crwdne23834:0

1. crwdns23835:0crwdne23835:0 crwdns23836:0crwdne23836:0 crwdns23837:0crwdne23837:0

2. crwdns23838:0crwdne23838:0 crwdns23839:0crwdne23839:0 crwdns23840:0crwdne23840:0

crwdns23841:0crwdne23841:0 crwdns23842:0crwdne23842:0

## crwdns23843:0crwdne23843:0

crwdns23844:0crwdne23844:0 crwdns23845:0crwdne23845:0 crwdns23846:0crwdne23846:0

### crwdns23847:0crwdne23847:0

crwdns23848:0crwdne23848:0 crwdns23849:0crwdne23849:0

crwdns23850:0crwdne23850:0 crwdns23851:0crwdne23851:0

### crwdns23852:0crwdne23852:0

crwdns23853:0crwdne23853:0

crwdns23854:0crwdne23854:0

- [crwdns23856:0crwdne23856:0](crwdns23855:0crwdne23855:0)
- [crwdns23858:0crwdne23858:0](crwdns23857:0crwdne23857:0)
- [crwdns23860:0crwdne23860:0](crwdns23859:0crwdne23859:0)
- [crwdns23862:0crwdne23862:0](crwdns23861:0crwdne23861:0)
- [crwdns23864:0crwdne23864:0](crwdns23863:0crwdne23863:0)

crwdns23865:0crwdne23865:0 crwdns23866:0crwdne23866:0

crwdns23867:0crwdne23867:0

    crwdns23868:0[general]crwdnd23868:0%Y/%m/%dcrwdnd23868:0%H:%M:%Scrwdnd23868:0{instance_id}crwdne23868:0
    

crwdns23869:0crwdne23869:0

### crwdns23870:0crwdne23870:0

crwdns23871:0crwdne23871:0 crwdns23872:0crwdne23872:0 crwdns23873:0crwdne23873:0

    crwdns23874:0crwdne23874:0
    

crwdns23875:0crwdne23875:0

crwdns23876:0crwdne23876:0 crwdns23877:0crwdne23877:0

crwdns23878:0crwdne23878:0 crwdns23879:0crwdne23879:0

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