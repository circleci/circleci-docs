---
layout: enterprise
title: "Single-Box Install"
category: [installation]
order: 1
description: "How to install CircleCI Enterprise on a single VM"
---

CircleCI Enterprise is a scalable CI/CD tool that supports clusters
of tens or hundreds of build machines. However, it is often useful
in trials and small installations to run the whole system on a single
VM. The instructions below show how to install a single-box CircleCI
Enterprise. (Note: This option is currently only available on AWS.)

### Step 1
Find the AMI for your region (make sure to use an instance type with at least 8G of RAM):<br>

<script>
var amiIds = {
"ap-northeast-1": "ami-bd4133da",
"ap-northeast-2": "ami-1b70a675",
"ap-southeast-1": "ami-f808a09b",
"ap-southeast-2": "ami-d1f7f2b2",
"eu-central-1": "ami-6713de08",
"eu-west-1": "ami-d70e26a4",
"sa-east-1": "ami-8c9802e0",
"us-east-1": "ami-b6b455a0",
"us-east-2": "ami-c86144ad",
"us-west-1": "ami-3c194a5c",
"us-west-2": "ami-13df6d73"
};

var amiUpdateSelect = function() {
  var s = document.getElementById("ami-select");
  var region = s.options[s.selectedIndex].value;
  document.getElementById("ami-go").href = "https://console.aws.amazon.com/ec2/v2/home?region=" + region + "#LaunchInstanceWizard:ami=" + amiIds[region];
};
</script>

<select id="ami-select" onchange="amiUpdateSelect()">
<option value="ap-northeast-1">ap-northeast-1</option>
<option value="ap-northeast-2">ap-northeast-2</option>
<option value="ap-southeast-1">ap-southeast-1</option>
<option value="ap-southeast-2">ap-southeast-2</option>
<option value="eu-central-1">eu-central-1</option>
<option value="eu-west-1">eu-west-1</option>
<option value="sa-east-1">sa-east-1</option>
<option value="us-east-1" selected="selected">us-east-1</option>
<option value="us-east-2">us-east-2</option>
<option value="us-west-1">us-west-1</option>
<option value="us-west-2">us-west-2</option>
</select>
<a id="ami-go" href="" class="btn btn-success" target="_blank">Go!</a>

<script>amiUpdateSelect();</script>

### Step 2
Make sure that ports 22,80,443, and 8800 are open when you get to the "Configure Security Group" step.
You will also need to open ports 64535-65535 to let developers optionally SSH into builds.

### Step 3
Go to the public (or private) IP address or hostname for the VM once launched and complete the rest of the guided install process.
(Note: Final startup of the app can sometime as the "circleci/build-image" Docker image is downloaded.)
