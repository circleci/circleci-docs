---
layout: crwdns32912:0crwdne32912:0
title: "crwdns32913:0crwdne32913:0"
category:
  - crwdns32914:0crwdne32914:0
order: dne32915:0740a26.60559964crwdns32915:0crwdne32915:0
description: "crwdns32916:0crwdne32916:0"
---
crwdns32917:0crwdne32917:0 crwdns32918:0crwdne32918:0

- crwdns32919:0{:toc}crwdne32919:0

## crwdns32920:0crwdne32920:0

crwdns32921:0crwdne32921:0

- crwdns32922:0crwdne32922:0
- crwdns32923:0crwdne32923:0
- crwdns32924:0crwdne32924:0
- crwdns32925:0crwdne32925:0

## crwdns32926:0crwdne32926:0

crwdns32927:0crwdne32927:0

crwdns32928:0crwdne32928:0 crwdns32929:0crwdne32929:0 crwdns32930:0crwdne32930:0

### crwdns32931:0crwdne32931:0

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

<select id="ami-select" onchange="amiUpdateSelect()"> <option value="ap-northeast-1">crwdns32932:0crwdne32932:0</option> <option value="ap-northeast-2">crwdns32933:0crwdne32933:0</option> <option value="ap-southeast-1">crwdns32934:0crwdne32934:0</option> <option value="ap-southeast-2">crwdns32935:0crwdne32935:0</option> <option value="eu-central-1">crwdns32936:0crwdne32936:0</option> <option value="eu-west-1">crwdns32937:0crwdne32937:0</option> <option value="sa-east-1">crwdns32938:0crwdne32938:0</option> <option value="us-east-1" selected="selected">crwdns32939:0crwdne32939:0</option> <option value="us-east-2">crwdns32940:0crwdne32940:0</option> <option value="us-west-1">crwdns32941:0crwdne32941:0</option> <option value="us-west-2">crwdns32942:0crwdne32942:0</option> </select> <a id="ami-go" href="" class="btn btn-success" data-analytics-action="{{ site.analytics.events.go_button_clicked }}" target="_blank">crwdns32943:0crwdne32943:0</a>
<script>amiUpdateSelect();</script>

1. crwdns32944:0crwdne32944:0 
2. crwdns32945:0crwdne32945:0
3. crwdns32946:0crwdne32946:0 

crwdns32947:0{{site.baseurl}}crwdne32947:0 crwdns32948:0crwdne32948:0 crwdns32949:0crwdne32949:0 crwdns32950:0crwdne32950:0 crwdns32951:0{{site.baseurl}}crwdne32951:0 crwdns32952:0crwdne32952:0

### crwdns32953:0crwdne32953:0

1. crwdns32954:0crwdne32954:0 

crwdns32955:0{{site.baseurl}}crwdne32955:0 crwdns32956:0crwdne32956:0 crwdns32957:0crwdne32957:0 crwdns32958:0crwdne32958:0 crwdns32959:0crwdne32959:0 crwdns32960:0crwdne32960:0 crwdns32961:0crwdne32961:0 crwdns32962:0crwdne32962:0 crwdns32963:0crwdne32963:0 crwdns32964:0crwdne32964:0 crwdns32965:0crwdne32965:0 crwdns32966:0crwdne32966:0 crwdns32967:0crwdne32967:0 crwdns32968:0crwdne32968:0 crwdns32969:0crwdne32969:0 crwdns32970:0crwdne32970:0 crwdns32971:0crwdne32971:0 crwdns32972:0crwdne32972:0 crwdns32973:0crwdne32973:0 crwdns32974:0crwdne32974:0 crwdns32975:0crwdne32975:0 crwdns32976:0crwdne32976:0 crwdns32977:0crwdne32977:0 crwdns32978:0crwdne32978:0 crwdns32979:0crwdne32979:0 crwdns32980:0crwdne32980:0 crwdns32981:0crwdne32981:0 crwdns32982:0crwdne32982:0 crwdns32983:0crwdne32983:0 crwdns32984:0crwdne32984:0

<!---
## Installation in a Data Center

1. Launch a VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04. 

2. Open ports 22 and 8800 to administrators, open ports 80 and 443 to all users, and optionally open ports 64535-65535 to developers to SSH into builds.

3. Install Replicated, the tool used to package and distribute CircleCI, by running the  `curl https://get.replicated.com/docker | sudo bash` command. **Note:** Docker must not use the device mapper storage driver. Check this by running `sudo docker info | grep "Storage Driver"`.)

4. Visit port 8800 on the machine in a web browser to complete the guided installation process.

5. Complete the process by choosing an SSL certificate option, uploading the license, setting the admin password and hostnames,  enabling GitHub OAuth registration, and defining protocol settings. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete. 

6. Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 
-->