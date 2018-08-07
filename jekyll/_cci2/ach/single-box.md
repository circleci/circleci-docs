---
layout: crwdns19763:0crwdne19763:0
title: "crwdns19764:0crwdne19764:0"
category:
  - crwdns19765:0crwdne19765:0
order: crwdns19766:0crwdne19766:0
description: "crwdns19767:0crwdne19767:0"
---
crwdns19768:0crwdne19768:0 crwdns19769:0crwdne19769:0

- crwdns19770:0{:toc}crwdne19770:0

## crwdns19771:0crwdne19771:0

crwdns19772:0crwdne19772:0

- crwdns19773:0crwdne19773:0
- crwdns19774:0crwdne19774:0
- crwdns19775:0crwdne19775:0
- crwdns19776:0crwdne19776:0

## crwdns19777:0crwdne19777:0

crwdns19778:0crwdne19778:0

crwdns19779:0crwdne19779:0 crwdns19780:0crwdne19780:0 crwdns19781:0crwdne19781:0

### crwdns19782:0crwdne19782:0

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

<select id="ami-select" onchange="amiUpdateSelect()"> <option value="ap-northeast-1">crwdns19783:0crwdne19783:0</option> <option value="ap-northeast-2">crwdns19784:0crwdne19784:0</option> <option value="ap-southeast-1">crwdns19785:0crwdne19785:0</option> <option value="ap-southeast-2">crwdns19786:0crwdne19786:0</option> <option value="eu-central-1">crwdns19787:0crwdne19787:0</option> <option value="eu-west-1">crwdns19788:0crwdne19788:0</option> <option value="sa-east-1">crwdns19789:0crwdne19789:0</option> <option value="us-east-1" selected="selected">crwdns19790:0crwdne19790:0</option> <option value="us-east-2">crwdns19791:0crwdne19791:0</option> <option value="us-west-1">crwdns19792:0crwdne19792:0</option> <option value="us-west-2">crwdns19793:0crwdne19793:0</option> </select> <a id="ami-go" href="" class="btn btn-success" data-analytics-action="{{ site.analytics.events.go_button_clicked }}" target="_blank">crwdns19794:0crwdne19794:0</a>
<script>amiUpdateSelect();</script>

1. crwdns19795:0crwdne19795:0 
2. crwdns19796:0crwdne19796:0
3. crwdns19797:0crwdne19797:0 

crwdns19798:0{{site.baseurl}}crwdne19798:0 crwdns19799:0crwdne19799:0 crwdns19800:0crwdne19800:0 crwdns19801:0crwdne19801:0 crwdns19802:0{{site.baseurl}}crwdne19802:0 crwdns19803:0crwdne19803:0

### crwdns19804:0crwdne19804:0

1. crwdns19805:0crwdne19805:0 

crwdns19806:0crwdne19806:0 crwdns19807:0crwdne19807:0 crwdns19808:0{{site.baseurl}}crwdne19808:0 crwdns19809:0crwdne19809:0 crwdns19810:0crwdne19810:0 crwdns19811:0crwdne19811:0 crwdns19812:0crwdne19812:0 crwdns19813:0crwdne19813:0 crwdns19814:0crwdne19814:0 crwdns19815:0crwdne19815:0 crwdns19816:0crwdne19816:0 crwdns19817:0crwdne19817:0 crwdns19818:0crwdne19818:0 crwdns19819:0crwdne19819:0 crwdns19820:0crwdne19820:0 crwdns19821:0crwdne19821:0 crwdns19822:0crwdne19822:0 crwdns19823:0crwdne19823:0 crwdns19824:0crwdne19824:0 crwdns19825:0crwdne19825:0 crwdns19826:0crwdne19826:0 crwdns19827:0crwdne19827:0 crwdns19828:0crwdne19828:0 crwdns19829:0crwdne19829:0 crwdns19830:0crwdne19830:0 crwdns19831:0crwdne19831:0 crwdns19832:0crwdne19832:0 crwdns19833:0crwdne19833:0 crwdns19834:0crwdne19834:0 crwdns19835:0crwdne19835:0 crwdns19836:0crwdne19836:0 crwdns19837:0crwdne19837:0

<!---
## Installation in a Data Center

1. Launch a VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04. 

2. Open ports 22 and 8800 to administrators, open ports 80 and 443 to all users, and optionally open ports 64535-65535 to developers to SSH into builds.

3. Install Replicated, the tool used to package and distribute CircleCI, by running the  `curl https://get.replicated.com/docker | sudo bash` command. **Note:** Docker must not use the device mapper storage driver. Check this by running `sudo docker info | grep "Storage Driver"`.)

4. Visit port 8800 on the machine in a web browser to complete the guided installation process.

5. Complete the process by choosing an SSL certificate option, uploading the license, setting the admin password and hostnames,  enabling GitHub OAuth registration, and defining protocol settings. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete. 

6. Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 
-->