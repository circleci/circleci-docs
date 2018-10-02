---
layout: crwdns34076:0crwdne34076:0
title: "crwdns34077:0crwdne34077:0"
short-title: "crwdns34078:0crwdne34078:0"
description: "crwdns34079:0crwdne34079:0"
categories:
  - crwdns34080:0crwdne34080:0
order: dne34081:0c3ee96.43868636crwdns34081:0crwdne34081:0
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

| crwdns34151:0crwdne34151:0 | crwdns34152:0crwdne34152:0 | crwdns34153:0crwdne34153:0 |
| -------------------------- | -------------------------- | -------------------------- |
| crwdns34154:0crwdne34154:0 | crwdns34155:0crwdne34155:0 | crwdns34156:0crwdne34156:0 |
| crwdns34157:0crwdne34157:0 | crwdns34158:0crwdne34158:0 | crwdns34159:0crwdne34159:0 |
| crwdns34160:0crwdne34160:0 | crwdns34161:0crwdne34161:0 | crwdns34162:0crwdne34162:0 |

### crwdns34163:0crwdne34163:0

crwdns34164:0{:.no_toc}crwdne34164:0

crwdns34165:0crwdne34165:0

### crwdns34166:0crwdne34166:0

crwdns34167:0{:.no_toc}crwdne34167:0

crwdns34168:0crwdne34168:0 crwdns34169:0crwdne34169:0 crwdns34170:0crwdne34170:0

```yaml
crwdns34171:0crwdne34171:0
```

#### crwdns34172:0crwdne34172:0

crwdns34173:0{:.no_toc}crwdne34173:0

crwdns34174:0crwdne34174:0

```yaml
crwdns34175:0crwdne34175:0
```

crwdns34176:0crwdne34176:0 crwdns34177:0crwdne34177:0 crwdns34178:0crwdne34178:0 crwdns34179:0crwdne34179:0

#### crwdns34180:0crwdne34180:0

crwdns34181:0{:.no_toc}crwdne34181:0

crwdns34182:0crwdne34182:0

```yaml
crwdns34183:0crwdne34183:0
```

crwdns34184:0crwdne34184:0

* crwdns34185:0crwdne34185:0
* crwdns34186:0crwdne34186:0

crwdns34187:0crwdne34187:0

#### crwdns34188:0crwdne34188:0

crwdns34189:0{:.no_toc}crwdne34189:0

crwdns34190:0crwdne34190:0 crwdns34191:0crwdne34191:0

```yaml
crwdns34192:0crwdne34192:0
```

crwdns34193:0crwdne34193:0

```yaml
crwdns34194:0crwdne34194:0
```

crwdns34195:0crwdne34195:0

```yaml
crwdns34196:0crwdne34196:0
```

#### crwdns34197:0crwdne34197:0

crwdns34198:0{:.no_toc}crwdne34198:0

crwdns34199:0crwdne34199:0 crwdns34200:0crwdne34200:0 crwdns34201:0crwdne34201:0

```yaml
crwdns34202:0crwdne34202:0 crwdns34203:0crwdne34203:0
        crwdns34204:0crwdne34204:0
```

crwdns34205:0crwdne34205:0

```yaml
crwdns34206:0crwdne34206:0
```

### crwdns34207:0crwdne34207:0

crwdns34208:0{:.no_toc}crwdne34208:0

crwdns34209:0crwdne34209:0 crwdns34210:0crwdne34210:0

crwdns34211:0crwdne34211:0

#### crwdns34212:0crwdne34212:0

crwdns34213:0{:.no_toc}crwdne34213:0

```yaml
crwdns34214:0crwdne34214:0  
```

crwdns34215:0crwdne34215:0

```yaml
crwdns34216:0crwdne34216:0
```

## crwdns34217:0crwdne34217:0

crwdns34218:0crwdne34218:0 crwdns34219:0crwdne34219:0

crwdns34220:0crwdne34220:0

```yaml
crwdns34221:0crwdne34221:0
```

crwdns34222:0crwdne34222:0

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

### crwdns34223:0crwdne34223:0

crwdns34224:0{:.no_toc}crwdne34224:0

crwdns34225:0crwdne34225:0 crwdns34226:0crwdne34226:0

crwdns34227:0crwdne34227:0 crwdns34228:0crwdne34228:0

```yaml
crwdns34229:0crwdne34229:0
```

### crwdns34230:0crwdne34230:0

crwdns34231:0{:.no_toc}crwdne34231:0

crwdns34232:0crwdne34232:0 crwdns34233:0crwdne34233:0 crwdns34234:0crwdne34234:0

crwdns34235:0crwdne34235:0

### crwdns34236:0crwdne34236:0

crwdns34237:0{:.no_toc}crwdne34237:0

crwdns34238:0crwdne34238:0

```yaml
crwdns34239:0crwdne34239:0
```

crwdns34240:0crwdne34240:0

## crwdns34241:0crwdne34241:0

crwdns34242:0crwdne34242:0

<!---
For example, an orb could define a command that runs a set of steps *if* the
orb's user invokes it with `myorb/foo: { dostuff: true }`, but not
`myorb/foo: { dostuff: false }`.
-->

crwdns34243:0crwdne34243:0

crwdns34244:0crwdne34244:0

<!---
For example, an
orb author could define conditional steps in the `steps` key of a Job or a
Command.
-->

crwdns34245:0crwdne34245:0 crwdns34246:0crwdne34246:0 crwdns34247:0crwdne34247:0

crwdns34248:0crwdne34248:0 crwdns34249:0crwdne34249:0 crwdns34250:0crwdne34250:0

### crwdns34251:0crwdne34251:0

crwdns34252:0{:.no_toc}crwdne34252:0

```yaml
crwdns34253:0crwdne34253:0
```

crwdns34254:0crwdne34254:0