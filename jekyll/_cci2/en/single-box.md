---
layout: crwdns113646:0crwdne113646:0
title: "crwdns113648:0crwdne113648:0"
category:
  - crwdns113650:0crwdne113650:0
order: 13652:0e8crwdns113652:0crwdne113652:0e094a828.2crwdns113652:0crwdne113652:0771941crwdns113652:0crwdne113652:0
description: "crwdns113654:0crwdne113654:0"
---
crwdns113656:0crwdne113656:0 crwdns113658:0crwdne113658:0

- crwdns113660:0{:toc}crwdne113660:0

## crwdns113662:0crwdne113662:0

crwdns113664:0crwdne113664:0

- crwdns113666:0crwdne113666:0
- crwdns113668:0crwdne113668:0
- crwdns113670:0crwdne113670:0
- crwdns113672:0crwdne113672:0 crwdns113674:0crwdne113674:0

## crwdns113676:0crwdne113676:0

crwdns113678:0crwdne113678:0

crwdns113680:0crwdne113680:0 crwdns113682:0crwdne113682:0 crwdns113684:0crwdne113684:0

### crwdns113686:0crwdne113686:0

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

<select id="ami-select" onchange="amiUpdateSelect()"> <option value="ap-northeast-1">crwdns113688:0crwdne113688:0</option> <option value="ap-northeast-2">crwdns113690:0crwdne113690:0</option> <option value="ap-southeast-1">crwdns113692:0crwdne113692:0</option> <option value="ap-southeast-2">crwdns113694:0crwdne113694:0</option> <option value="eu-central-1">crwdns113696:0crwdne113696:0</option> <option value="eu-west-1">crwdns113698:0crwdne113698:0</option> <option value="sa-east-1">crwdns113700:0crwdne113700:0</option> <option value="us-east-1" selected="selected">crwdns113702:0crwdne113702:0</option> <option value="us-east-2">crwdns113704:0crwdne113704:0</option> <option value="us-west-1">crwdns113706:0crwdne113706:0</option> <option value="us-west-2">crwdns113708:0crwdne113708:0</option> </select> <a id="ami-go" href="" class="btn btn-success" data-analytics-action="{{ site.analytics.events.go_button_clicked }}" target="_blank">crwdns113710:0crwdne113710:0</a>
<script>amiUpdateSelect();</script>

1. crwdns113712:0crwdne113712:0 
2. crwdns113714:0crwdne113714:0 crwdns113716:0crwdne113716:0
3. crwdns113718:0crwdne113718:0 

crwdns113720:0{{site.baseurl}}crwdne113720:0 crwdns113722:0crwdne113722:0 crwdns113724:0crwdne113724:0 crwdns113726:0crwdne113726:0 crwdns113728:0{{site.baseurl}}crwdne113728:0 crwdns113730:0crwdne113730:0

### crwdns113732:0crwdne113732:0

1. crwdns113734:0crwdne113734:0 crwdns113736:0crwdne113736:0 

crwdns113738:0{{site.baseurl}}crwdne113738:0 crwdns113740:0crwdne113740:0 crwdns113742:0crwdne113742:0 crwdns113744:0crwdne113744:0 crwdns113746:0crwdne113746:0 crwdns113748:0crwdne113748:0 crwdns113750:0crwdne113750:0 crwdns113752:0crwdne113752:0 crwdns113754:0crwdne113754:0 crwdns113756:0crwdne113756:0 crwdns113758:0crwdne113758:0 crwdns113760:0crwdne113760:0 crwdns113762:0crwdne113762:0 crwdns113764:0crwdne113764:0 crwdns113766:0crwdne113766:0 crwdns113768:0crwdne113768:0 crwdns113770:0crwdne113770:0 crwdns113772:0crwdne113772:0 crwdns113774:0crwdne113774:0 crwdns113776:0crwdne113776:0 crwdns113778:0crwdne113778:0 crwdns113780:0crwdne113780:0 crwdns113782:0crwdne113782:0 crwdns113784:0crwdne113784:0 crwdns113786:0crwdne113786:0 crwdns113788:0crwdne113788:0 crwdns113790:0crwdne113790:0 crwdns113792:0crwdne113792:0 crwdns113794:0crwdne113794:0 crwdns113796:0crwdne113796:0

<!---
## Installation in a Data Center

1. Launch a VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04. 

2. Open ports 22 and 8800 to administrators, open ports 80 and 443 to all users, and optionally open ports 64535-65535 to developers to SSH into builds.

3. Install Replicated, the tool used to package and distribute CircleCI, by running the  `curl https://get.replicated.com/docker | sudo bash` command. **Note:** Docker must not use the device mapper storage driver. Check this by running `sudo docker info | grep "Storage Driver"`.)

4. Visit port 8800 on the machine in a web browser to complete the guided installation process.

5. Complete the process by choosing an SSL certificate option, uploading the license, setting the admin password and hostnames,  enabling GitHub OAuth registration, and defining protocol settings. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete. 

6. Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 
-->