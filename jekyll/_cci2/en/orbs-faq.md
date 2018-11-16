---
layout: crwdns72594:0crwdne72594:0
title: "crwdns72596:0crwdne72596:0"
short-title: "crwdns72598:0crwdne72598:0"
description: "crwdns72600:0crwdne72600:0"
categories:
  - crwdns72602:0crwdne72602:0
order: e72604:00192918.77414407crwdns72604:0crwdne72604:0
---
crwdns72606:0crwdne72606:0

- crwdns72608:0{:toc}crwdne72608:0

### crwdns72610:0crwdne72610:0

crwdns72612:0{:.no_toc}crwdne72612:0

- crwdns72614:0crwdne72614:0

- crwdns72616:0crwdne72616:0 crwdns72618:0crwdne72618:0

    crwdns75316:0crwdne75316:0
    

crwdns72622:0crwdne72622:0 crwdns72624:0crwdne72624:0

    crwdns75318:0crwdne75318:0
    

crwdns72628:0crwdne72628:0 crwdns72630:0crwdne72630:0 crwdns72632:0crwdne72632:0

### crwdns72634:0crwdne72634:0

- crwdns72636:0crwdne72636:0

    crwdns75320:0crwdne75320:0
    

    crwdns75322:0crwdne75322:0
    

- crwdns72642:0crwdne72642:0 crwdns72644:0crwdne72644:0

### crwdns72646:0crwdne72646:0

- crwdns75324:0crwdne75324:0

    crwdns75326:0crwdne75326:0
    

- crwdns75328:0crwdne75328:0 crwdns75330:0crwdne75330:0 crwdns75332:0crwdne75332:0 crwdns75334:0crwdne75334:0

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

### crwdns75336:0crwdne75336:0

- crwdns75338:0crwdne75338:0 crwdns75340:0crwdne75340:0 crwdns75342:0crwdne75342:0

- crwdns75344:0crwdne75344:0 crwdns75346:0crwdne75346:0 crwdns75348:0crwdne75348:0

### crwdns75350:0crwdne75350:0

crwdns75352:0crwdne75352:0

crwdns75354:0crwdne75354:0 crwdns75356:0crwdne75356:0

## crwdns75358:0crwdne75358:0

- crwdns75360:0{{site.baseurl}}crwdne75360:0
- crwdns75362:0{{site.baseurl}}crwdne75362:0
- crwdns75364:0{{site.baseurl}}crwdne75364:0
- crwdns75366:0{{site.baseurl}}crwdne75366:0