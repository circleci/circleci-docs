---
layout: crwdns130090:0crwdne130090:0
title: "crwdns130092:0crwdne130092:0"
category:
  - crwdns130094:0crwdne130094:0
order: s130096:0crwdne130096:04218crwdns130096:0crwdne130096:0
description: "crwdns130098:0crwdne130098:0"
---
crwdns130100:0crwdne130100:0 crwdns130102:0crwdne130102:0

- crwdns130104:0
{:toc}

crwdne130104:0

## crwdns130106:0crwdne130106:0

crwdns130108:0crwdne130108:0

- crwdns130110:0crwdne130110:0
- crwdns130112:0crwdne130112:0
- crwdns130114:0crwdne130114:0
- crwdns130116:0crwdne130116:0 crwdns130118:0crwdne130118:0

## crwdns130120:0crwdne130120:0

crwdns130122:0crwdne130122:0

crwdns130124:0crwdne130124:0 crwdns130126:0crwdne130126:0 crwdns130128:0crwdne130128:0

### crwdns130130:0crwdne130130:0

<script>
  var amiIds = {
  "ap-northeast-1": "ami-32e6d455",
  "ap-northeast-2": "ami-2cef3242",
  "ap-southeast-1": "ami-7f22a71c",
  "ap-southeast-2": "ami-21111b42",
  "eu-central-1": "ami-7a2ef015",
  "eu-west-1": "ami-ac1a14ca",
  "sa-east-1": "ami-70026d1c",
  "us-east-1": "ami-cb6f1add",
  "us-east-2": "ami-57c7e032",
  "us-west-1": "ami-059b818564104e5c6",
  "us-west-2": "ami-c24a2fa2"
  };

  var amiUpdateSelect = function() {
    var s = document.getElementById("ami-select");
    var region = s.options[s.selectedIndex].value;
    document.getElementById("ami-go").href = "https://console.aws.amazon.com/ec2/v2/home?region=" + region + "#LaunchInstanceWizard:ami=" + amiIds[region];
  };
  </script>

<select id="ami-select" onchange="amiUpdateSelect()"> <option value="ap-northeast-1">crwdns130132:0crwdne130132:0</option> <option value="ap-northeast-2">crwdns130134:0crwdne130134:0</option> <option value="ap-southeast-1">crwdns130136:0crwdne130136:0</option> <option value="ap-southeast-2">crwdns130138:0crwdne130138:0</option> <option value="eu-central-1">crwdns130140:0crwdne130140:0</option> <option value="eu-west-1">crwdns130142:0crwdne130142:0</option> <option value="sa-east-1">crwdns130144:0crwdne130144:0</option> <option value="us-east-1" selected="selected">crwdns130146:0crwdne130146:0</option> <option value="us-east-2">crwdns130148:0crwdne130148:0</option> <option value="us-west-1">crwdns130150:0crwdne130150:0</option> <option value="us-west-2">crwdns130152:0crwdne130152:0</option> </select> <a id="ami-go" href="" class="btn btn-success" data-analytics-action="{{ site.analytics.events.go_button_clicked }}" target="_blank">crwdns130154:0crwdne130154:0</a>
<script>amiUpdateSelect();</script>

1. crwdns130156:0crwdne130156:0 
2. crwdns130158:0crwdne130158:0 crwdns130160:0crwdne130160:0
3. crwdns130162:0crwdne130162:0 

crwdns130164:0{{site.baseurl}}crwdne130164:0 crwdns130166:0crwdne130166:0 crwdns130168:0crwdne130168:0 crwdns130170:0crwdne130170:0 crwdns130172:0{{site.baseurl}}crwdne130172:0 crwdns130174:0crwdne130174:0

### crwdns130176:0crwdne130176:0

1. crwdns130178:0crwdne130178:0 crwdns130180:0crwdne130180:0 

crwdns130182:0{{site.baseurl}}crwdne130182:0 crwdns130184:0crwdne130184:0 crwdns130186:0crwdne130186:0 crwdns130188:0crwdne130188:0 crwdns130190:0crwdne130190:0 crwdns130192:0crwdne130192:0 crwdns130194:0crwdne130194:0 crwdns130196:0crwdne130196:0 crwdns130198:0crwdne130198:0 crwdns130200:0crwdne130200:0 crwdns130202:0crwdne130202:0 crwdns130204:0crwdne130204:0 crwdns130206:0crwdne130206:0 crwdns130208:0crwdne130208:0 crwdns130210:0crwdne130210:0 crwdns130212:0crwdne130212:0 crwdns130214:0crwdne130214:0 crwdns130216:0crwdne130216:0 crwdns130218:0crwdne130218:0 crwdns130220:0crwdne130220:0 crwdns130222:0crwdne130222:0 crwdns130224:0crwdne130224:0 crwdns130226:0crwdne130226:0 crwdns130228:0crwdne130228:0 crwdns130230:0crwdne130230:0 crwdns130232:0crwdne130232:0 crwdns130234:0crwdne130234:0 crwdns130236:0crwdne130236:0 crwdns130238:0crwdne130238:0 crwdns130240:0crwdne130240:0

<!---
## Installation in a Data Center

1. Launch a VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04. 

2. Open ports 22 and 8800 to administrators, open ports 80 and 443 to all users, and optionally open ports 64535-65535 to developers to SSH into builds.

3. Install Replicated, the tool used to package and distribute CircleCI, by running the  `curl https://get.replicated.com/docker | sudo bash` command. **Note:** Docker must not use the device mapper storage driver. Check this by running `sudo docker info | grep "Storage Driver"`.)

4. Visit port 8800 on the machine in a web browser to complete the guided installation process.

5. Complete the process by choosing an SSL certificate option, uploading the license, setting the admin password and hostnames,  enabling GitHub OAuth registration, and defining protocol settings. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete. 

6. Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 
-->