---
layout: crwdns34076:0crwdne34076:0
title: "crwdns34077:0crwdne34077:0"
short-title: "crwdns34078:0crwdne34078:0"
description: "crwdns34079:0crwdne34079:0"
categories:
  - crwdns34080:0crwdne34080:0
order: 4081:0d286cef765.80570278crwdns34081:0crwdne34081:0
---
crwdns34082:0{{ site.baseurl }}crwdne34082:0

* crwdns34083:0{:toc}crwdne34083:0

## crwdns34084:0crwdne34084:0

crwdns34085:0{:.no_toc}crwdne34085:0

1. crwdns34086:0crwdne34086:0 crwdns34087:0{{ site.baseurl }}crwdne34087:0

2. crwdns34088:0{{ site.baseurl }}crwdne34088:0 crwdns34089:0crwdne34089:0

3. crwdns34090:0crwdne34090:0 crwdns34091:0crwdne34091:0

4. crwdns34092:0crwdne34092:0

crwdns34093:0crwdne34093:0

## crwdns34094:0crwdne34094:0

crwdns34095:0crwdne34095:0

* crwdns34096:0crwdne34096:0
* crwdns34097:0crwdne34097:0
* crwdns34098:0crwdne34098:0

crwdns34099:0crwdne34099:0

```yaml
crwdns34100:0crwdne34100:0
```

crwdns34101:0crwdne34101:0

## crwdns34102:0crwdne34102:0

crwdns34103:0{:.no_toc}crwdne34103:0

crwdns34104:0crwdne34104:0 crwdns34105:0crwdne34105:0 crwdns34106:0crwdne34106:0

crwdns34107:0crwdne34107:0

```yaml
crwdns34108:0crwdne34108:0
```

<!---
### Invoking Other Commands in Your Command
{:.no_toc}

Commands can use other commands in the scope of execution. 


For instance, if a command is declared inside your Orb it can use other commands in that orb. It can also use commands defined in other orbs that you have imported (for example `some-orb/some-command`).


## Built-In Commands

CircleCI has several built-in commands available to all [circleci.com](http://circleci.com) customers and available by default in CircleCI server installations. Examples of built-in commands are:

  * `checkout`
  * `setup_remote_docker`
  * `save_to_workspace`

**Note:** It is possible to override the built-in commands with a custom command.


## Examples

The following is a an example of part of an "s3tools" orb defining a command called "s3sync":

```yaml
# s3tools orb
commands:
  s3sync:
    description: "A simple encapsulation of doing an s3 sync"
    parameters:
      from:
        type: string
      to:
        type: string
      overwrite:
        default: false
        type: boolean
    steps:
      - run:
          name: Deploy to S3
          command: aws s3 sync << parameters.from >> << parameters.to >><<# parameters.overwrite >> --delete<</ parameters.overwrite >>"
```


Defining a command called "s3sync" is invoked in a 2.1 `.circleci/config.yml` file as:

```yaml
version: 2.1

orbs:
  s3tools: circleci/s3@1

workflows:
  build-test-deploy:
    jobs:
      - deploy2s3:
        steps:
          - s3tools/s3sync:
              from: .
              to: "s3://mybucket_uri"
              overwrite: true
```
--->

## crwdns34109:0crwdne34109:0

crwdns34110:0crwdne34110:0 crwdns34111:0crwdne34111:0 crwdns34112:0crwdne34112:0

crwdns34113:0crwdne34113:0

crwdns34114:0crwdne34114:0

* crwdns34115:0crwdne34115:0 
* `crwdns34116:0crwdne34116:0`
* `crwdns34117:0crwdne34117:0`
* `crwdns34118:0crwdne34118:0`
* `crwdns34119:0crwdne34119:0`

crwdns34120:0crwdne34120:0

```yaml
crwdns34121:0crwdne34121:0
```

crwdns34122:0crwdne34122:0

## crwdns34123:0crwdne34123:0

crwdns34124:0{:.no_toc}crwdne34124:0

crwdns34125:0crwdne34125:0

```yaml
crwdns34126:0crwdne34126:0
```

<!---
2. Allowing an orb to define the executor used by all of its commands. This allows users to execute the commands of that orb in the execution environment defined by the orb's author.
-->

### crwdns34127:0crwdne34127:0

crwdns34128:0{:.no_toc}crwdne34128:0

crwdns34129:0crwdne34129:0 crwdns34130:0crwdne34130:0

```yaml
crwdns34131:0crwdne34131:0
```

<!---
You can also refer to executors from other orbs. Users of an orb can invoke its executors. For example, `foo-orb` could define the `bar` executor:

```yaml
# yaml from foo-orb
executors:
  bar:
    machine: true
    environment:
      RUN_TESTS: foobar
```

`baz-orb` could define the `bar` executor too:
```yaml
# yaml from baz-orb
executors:
  bar:
    docker:
      - image: clojure:lein-2.8.1
```

A user could use either executor from their configuration file with:

```yaml
# config.yml
orbs:
  foo-orb: somenamespace/foo@1
  baz-orb: someothernamespace/baz@3.3.1
jobs:
  some-job:
    executor: foo-orb/bar  # prefixed executor
  some-other-job:
    executor: baz-orb/bar  # prefixed executor
```

Note that `foo-orb/bar` and `baz-orb/bar` are different executors. They
both have the local name `bar` relative to their orbs, but the are independent executors living in different orbs.

-->

### crwdns34132:0crwdne34132:0

crwdns34133:0{:.no_toc}crwdne34133:0

crwdns34134:0crwdne34134:0 crwdns34135:0crwdne34135:0

crwdns34136:0crwdne34136:0 crwdns34137:0crwdne34137:0 crwdns34138:0crwdne34138:0

```yaml
crwdns34139:0crwdne34139:0
```

crwdns34140:0crwdne34140:0

```yaml
crwdns34141:0crwdne34141:0
```

## crwdns34142:0crwdne34142:0

crwdns34143:0crwdne34143:0

crwdns34144:0crwdne34144:0

```yaml
crwdns34145:0crwdne34145:0
          crwdns34146:0crwdne34146:0
```

crwdns34147:0crwdne34147:0

### crwdns34148:0crwdne34148:0

crwdns34149:0{:.no_toc}crwdne34149:0

crwdns34150:0crwdne34150:0

crwdns71384:0crwdne71384:0 crwdns71386:0crwdne71386:0 crwdns71388:0crwdne71388:0 crwdns71390:0crwdne71390:0 crwdns71392:0crwdne71392:0 crwdns71394:0crwdne71394:0 crwdns71396:0crwdne71396:0

### crwdns34163:0crwdne34163:0

crwdns71398:0{:.no_toc}crwdne71398:0

crwdns71400:0crwdne71400:0

#### crwdns34172:0crwdne34172:0

crwdns71402:0{:.no_toc}crwdne71402:0

crwdns71404:0crwdne71404:0

```yaml
crwdns71406:0crwdne71406:0
```

crwdns71408:0crwdne71408:0 crwdns71410:0crwdne71410:0 crwdns71412:0crwdne71412:0 crwdns71414:0crwdne71414:0

#### crwdns34180:0crwdne34180:0

crwdns71416:0{:.no_toc}crwdne71416:0

crwdns71418:0crwdne71418:0

```yaml
crwdns71420:0crwdne71420:0
```

crwdns71422:0crwdne71422:0

* crwdns34185:0crwdne34185:0
* crwdns34186:0crwdne34186:0

crwdns71424:0crwdne71424:0

#### crwdns34188:0crwdne34188:0

crwdns71426:0{:.no_toc}crwdne71426:0

crwdns71428:0crwdne71428:0 crwdns71430:0crwdne71430:0

```yaml
crwdns71432:0crwdne71432:0
```

crwdns71434:0crwdne71434:0

```yaml
crwdns71436:0crwdne71436:0
```

crwdns71438:0crwdne71438:0

```yaml
crwdns71440:0crwdne71440:0
```

#### crwdns34197:0crwdne34197:0

crwdns71442:0{:.no_toc}crwdne71442:0

crwdns71444:0crwdne71444:0 crwdns71446:0crwdne71446:0 crwdns71448:0crwdne71448:0

```yaml
crwdns71450:0crwdne71450:0 crwdns71452:0crwdne71452:0
        crwdns71454:0crwdne71454:0
```

crwdns71456:0crwdne71456:0

```yaml
crwdns71458:0crwdne71458:0
```

#### crwdns71460:0crwdne71460:0

crwdns71462:0{:.no_toc}crwdne71462:0

crwdns71464:0crwdne71464:0

```yaml
crwdns71466:0crwdne71466:0
```

#### crwdns71468:0crwdne71468:0

crwdns71470:0{:.no_toc}crwdne71470:0

crwdns71472:0crwdne71472:0

```yaml
crwdns71474:0crwdne71474:0
```

## crwdns34217:0crwdne34217:0

crwdns71476:0crwdne71476:0 crwdns71478:0crwdne71478:0

crwdns71480:0crwdne71480:0

```yaml
crwdns71482:0crwdne71482:0
```

crwdns71484:0crwdne71484:0

<!---
### Jobs Defined in an orb

If a job is declared inside an orb it can use commands in that orb or the global commands. We do not currently allow calling commands outside the scope of declaration of the job.

**hello-orb**
```yaml
# partial yaml from hello-orb
jobs:
  sayhello:
    parameters:
      saywhat:
        description: "To whom shall we say hello?"
        default: "World"
        type: string
    machine: true
    steps:
      - say:
          saywhat: "<< parameters.saywhat >>"
commands:
  saywhat:
    parameters:
      saywhat:
        type: string
    steps:
      - run: echo "<< parameters.saywhat >>"
```

**Config leveraging hello-orb**
```yaml
# config.yml
version: 2.1
orbs:
  hello-orb: somenamespace/hello-orb@volatile
workflows:
  build:
    jobs:
      - hello-orb/sayhello:
          saywhat: Everyone
```
--->

### crwdns71486:0crwdne71486:0

crwdns71488:0{:.no_toc}crwdne71488:0

crwdns71490:0crwdne71490:0 crwdns71492:0crwdne71492:0

crwdns71494:0crwdne71494:0

#### crwdns71496:0crwdne71496:0

crwdns71498:0{:.no_toc}crwdne71498:0

```yaml
crwdns71500:0crwdne71500:0  
```

crwdns71502:0crwdne71502:0

```yaml
crwdns71504:0crwdne71504:0
```

### crwdns71506:0crwdne71506:0

crwdns34231:0{:.no_toc}crwdne34231:0

crwdns71508:0crwdne71508:0 crwdns71510:0crwdne71510:0 crwdns71512:0crwdne71512:0

```yaml
crwdns71514:0crwdne71514:0
```

### crwdns34223:0crwdne34223:0

crwdns71516:0{:.no_toc}crwdne71516:0

crwdns71518:0crwdne71518:0 crwdns71520:0crwdne71520:0

crwdns71522:0crwdne71522:0 crwdns71524:0crwdne71524:0

```yaml
crwdns71526:0crwdne71526:0
```

### crwdns34230:0crwdne34230:0

crwdns71528:0{:.no_toc}crwdne71528:0

crwdns71530:0crwdne71530:0 crwdns71532:0crwdne71532:0 crwdns71534:0crwdne71534:0

crwdns71536:0crwdne71536:0

### crwdns34236:0crwdne34236:0

crwdns71538:0{:.no_toc}crwdne71538:0

crwdns71540:0crwdne71540:0

```yaml
crwdns71542:0crwdne71542:0
```

crwdns71544:0crwdne71544:0

## crwdns34241:0crwdne34241:0

crwdns71546:0crwdne71546:0

<!---
For example, an orb could define a command that runs a set of steps *if* the
orb's user invokes it with `myorb/foo: { dostuff: true }`, but not
`myorb/foo: { dostuff: false }`.
-->

crwdns71548:0crwdne71548:0

crwdns71550:0crwdne71550:0

<!---
For example, an
orb author could define conditional steps in the `steps` key of a Job or a
Command.
-->

crwdns71552:0crwdne71552:0 crwdns71554:0crwdne71554:0 crwdns71556:0crwdne71556:0

crwdns71558:0crwdne71558:0 crwdns71560:0crwdne71560:0 crwdns71562:0crwdne71562:0

### crwdns34251:0crwdne34251:0

crwdns71564:0{:.no_toc}crwdne71564:0

```yaml
crwdns71566:0crwdne71566:0
```

crwdns71568:0crwdne71568:0