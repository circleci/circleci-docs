---
layout: crwdns27582:0crwdne27582:0
title: "crwdns27583:0crwdne27583:0"
category:
  - crwdns27584:0crwdne27584:0
order: rwdne27585:0fcrwdns27585:0crwdne27585:069.42612914crwdns27585:0crwdne27585:0
description: "crwdns27586:0crwdne27586:0"
---
crwdns27587:0crwdne27587:0 crwdns27588:0crwdne27588:0

- crwdns27589:0{:toc}crwdne27589:0

## crwdns27590:0crwdne27590:0

crwdns27591:0crwdne27591:0

- crwdns27592:0crwdne27592:0
- crwdns27593:0crwdne27593:0
- crwdns27594:0crwdne27594:0
- crwdns27595:0crwdne27595:0

## crwdns27596:0crwdne27596:0

crwdns27597:0crwdne27597:0

crwdns27598:0crwdne27598:0 crwdns27599:0crwdne27599:0 crwdns27600:0crwdne27600:0

### crwdns27601:0crwdne27601:0

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
  "us-west-1": "ami-4fc8ee2f",
  "us-west-2": "ami-c24a2fa2"
  };

  var amiUpdateSelect = function() {
    var s = document.getElementById("ami-select");
    var region = s.options[s.selectedIndex].value;
    document.getElementById("ami-go").href = "https://console.aws.amazon.com/ec2/v2/home?region=" + region + "#LaunchInstanceWizard:ami=" + amiIds[region];
  };
  </script>

<select id="ami-select" onchange="amiUpdateSelect()"> <option value="ap-northeast-1">crwdns27602:0crwdne27602:0</option> <option value="ap-northeast-2">crwdns27603:0crwdne27603:0</option> <option value="ap-southeast-1">crwdns27604:0crwdne27604:0</option> <option value="ap-southeast-2">crwdns27605:0crwdne27605:0</option> <option value="eu-central-1">crwdns27606:0crwdne27606:0</option> <option value="eu-west-1">crwdns27607:0crwdne27607:0</option> <option value="sa-east-1">crwdns27608:0crwdne27608:0</option> <option value="us-east-1" selected="selected">crwdns27609:0crwdne27609:0</option> <option value="us-east-2">crwdns27610:0crwdne27610:0</option> <option value="us-west-1">crwdns27611:0crwdne27611:0</option> <option value="us-west-2">crwdns27612:0crwdne27612:0</option> </select> <a id="ami-go" href="" class="btn btn-success" data-analytics-action="{{ site.analytics.events.go_button_clicked }}" target="_blank">crwdns27613:0crwdne27613:0</a>
<script>amiUpdateSelect();</script>

1. crwdns27614:0crwdne27614:0 
2. crwdns27615:0crwdne27615:0
3. crwdns27616:0crwdne27616:0 

crwdns27617:0{{site.baseurl}}crwdne27617:0 crwdns27618:0crwdne27618:0 crwdns27619:0crwdne27619:0 crwdns27620:0crwdne27620:0 crwdns27621:0{{site.baseurl}}crwdne27621:0 crwdns27622:0crwdne27622:0

### crwdns27623:0crwdne27623:0

1. crwdns27624:0crwdne27624:0 

crwdns27625:0crwdne27625:0 crwdns27626:0crwdne27626:0 crwdns27627:0{{site.baseurl}}crwdne27627:0 crwdns27628:0crwdne27628:0 crwdns27629:0crwdne27629:0 crwdns27630:0crwdne27630:0 crwdns27631:0crwdne27631:0 crwdns27632:0crwdne27632:0 crwdns27633:0crwdne27633:0 crwdns27634:0crwdne27634:0 crwdns27635:0crwdne27635:0 crwdns27636:0crwdne27636:0 crwdns27637:0crwdne27637:0 crwdns27638:0crwdne27638:0 crwdns27639:0crwdne27639:0 crwdns27640:0crwdne27640:0 crwdns27641:0crwdne27641:0 crwdns27642:0crwdne27642:0 crwdns27643:0crwdne27643:0 crwdns27644:0crwdne27644:0 crwdns27645:0crwdne27645:0 crwdns27646:0crwdne27646:0 crwdns27647:0crwdne27647:0 crwdns27648:0crwdne27648:0 crwdns27649:0crwdne27649:0 crwdns27650:0crwdne27650:0 crwdns27651:0crwdne27651:0 crwdns27652:0crwdne27652:0 crwdns27653:0crwdne27653:0 crwdns27654:0crwdne27654:0 crwdns27655:0crwdne27655:0 crwdns27656:0crwdne27656:0

<!---
## Installation in a Data Center

1. Launch a VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04. 

2. Open ports 22 and 8800 to administrators, open ports 80 and 443 to all users, and optionally open ports 64535-65535 to developers to SSH into builds.

3. Install Replicated, the tool used to package and distribute CircleCI, by running the  `curl https://get.replicated.com/docker | sudo bash` command. **Note:** Docker must not use the device mapper storage driver. Check this by running `sudo docker info | grep "Storage Driver"`.)

4. Visit port 8800 on the machine in a web browser to complete the guided installation process.

5. Complete the process by choosing an SSL certificate option, uploading the license, setting the admin password and hostnames,  enabling GitHub OAuth registration, and defining protocol settings. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete. 

6. Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 
-->