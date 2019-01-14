---
layout: crwdns103450:0crwdne103450:0
title: "crwdns103452:0crwdne103452:0"
short-title: "crwdns103454:0crwdne103454:0"
description: "crwdns103456:0crwdne103456:0"
categories:
  - crwdns103458:0crwdne103458:0
order: s103460:0crwdne103460:0421crwdns103460:0crwdne103460:0
---
crwdns103462:0crwdne103462:0

- crwdns103464:0{:toc}crwdne103464:0

### crwdns103466:0crwdne103466:0

crwdns103468:0{:.no_toc}crwdne103468:0

- crwdns103470:0crwdne103470:0

- crwdns103472:0crwdne103472:0 crwdns103474:0crwdne103474:0

    crwdns103476:0crwdne103476:0
    

crwdns103478:0crwdne103478:0 crwdns103480:0crwdne103480:0

    crwdns103482:0crwdne103482:0
    

crwdns103484:0crwdne103484:0 crwdns103486:0crwdne103486:0 crwdns103488:0crwdne103488:0

### crwdns103490:0crwdne103490:0

- crwdns103492:0crwdne103492:0

    crwdns103494:0crwdne103494:0
    

    crwdns103496:0crwdne103496:0
    

- crwdns103498:0crwdne103498:0 crwdns103500:0crwdne103500:0

### crwdns103502:0crwdne103502:0

- crwdns103504:0crwdne103504:0

    crwdns103506:0crwdne103506:0
    

- crwdns103508:0crwdne103508:0 crwdns103510:0crwdne103510:0 crwdns103512:0crwdne103512:0 crwdns103514:0crwdne103514:0

<!---
### Environment Variables Not Being Passed at Runtime

Occasionally, when you try to convert a configuration to a 2.0 compatible format, environment variables may not be passed at runtime. For example, if you create a simple configuration in your GitHub repository (for example `https://github.com/yourusername/circle-auto/blob/master/.circleci/echo.yml`) and then call the config using:

```export AUTO_FILE=/Users/yourusername/Desktop/apkpure_app_887.apk
export AUTO_DIR=.
circleci build -c .circleci/echo.yml --job test
```

The config shows:

```#!bin/bash -eo pipefail
echo file $(AUTO_FILE) dir $(AUTO_DIR)
file directlySuccess!
```
Upon execution, you may see the following response:

.circleci/echo.yml

```version: 2
jobs:
  build:
    docker:
    - image: circleci/openjdk:8-jdk
    steps:
    - checkout
  test:
    docker:
    - image: circleci/openjdk:8-jdk
    environment:
    - TERM: dumb
    steps:
    - checkout
    - run:
        command: "echo file ${AUTO_FILE} dir ${AUTO_DIR}"
workflows:
  version: 2
  workflow:
    jobs:
    - build
    - test```

yourusername/circle-autoAdded by GitHub
```
--->

### crwdns103516:0crwdne103516:0

- crwdns103518:0crwdne103518:0 crwdns103520:0crwdne103520:0 crwdns103522:0crwdne103522:0

- crwdns103524:0crwdne103524:0 crwdns103526:0crwdne103526:0 crwdns103528:0crwdne103528:0

### crwdns103530:0crwdne103530:0

- crwdns103532:0crwdne103532:0

- crwdns103534:0crwdne103534:0 crwdns103536:0crwdne103536:0

### crwdns103538:0crwdne103538:0

- crwdns103540:0crwdne103540:0

- crwdns103542:0crwdne103542:0 crwdns103544:0crwdne103544:0

### crwdns103546:0crwdne103546:0

- crwdns103548:0crwdne103548:0

- crwdns103550:0crwdne103550:0 crwdns103552:0crwdne103552:0

crwdns103554:0{% raw %}crwdne103554:0

    crwdns103556:0crwdne103556:0
    

crwdns103558:0{% endraw %}crwdne103558:0

### crwdns103560:0crwdne103560:0

- crwdns103562:0crwdne103562:0

- crwdns103564:0crwdne103564:0 crwdns103566:0crwdne103566:0

    crwdns103568:0crwdne103568:0 crwdns103570:0crwdne103570:0
    

crwdns103572:0crwdne103572:0 crwdns103574:0crwdne103574:0

crwdns103576:0crwdne103576:0

crwdns103578:0crwdne103578:0 crwdns103580:0crwdne103580:0

## crwdns103582:0crwdne103582:0

- crwdns103584:0{{site.baseurl}}crwdne103584:0
- crwdns103586:0{{site.baseurl}}crwdne103586:0
- crwdns103588:0{{site.baseurl}}crwdne103588:0
- crwdns103590:0{{site.baseurl}}crwdne103590:0