---
layout: enterprise
title: "AWS"
category: [enterprise]
order: 3
description: "How to install CircleCI Enterprise on Amazon Web Services (AWS)."
---

The following step-by-step instructions will guide you through the process of installing CircleCI Enterprise on AWS. If you have any questions as you go through these steps, please contact <enterprise-support@circleci.com>.

Prerequisites
==================

* AWS Access Key
* AWS Secret Key
* AWS Region 
	* For example: "us-west-2"
* AWS VPC ID
	* Ensure that your VPC has the setting [enableDNSSupport](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating) 
	set to true
	* Instructions if you have a [Private Subnet]({{site.baseurl}}/enterprise/aws-private-subnet/)
* AWS Subnet ID
* AWS S3 Bucket Name
* Services Instance Type
	* The type of aws resource for our CircleCI service 
* Builder Instance Type
	* The type of aws resource for our CircleCI builder
* Circle CI License .rli file.

Step One: Setup Terraform
==================

If you prefer to do this process manually or with different tools please see the [Manual Aws Instructions]({{site.baseurl}}/enterprise/aws-manual/)
  
  
Download the following repo: `git clone https://github.com/circleci/enterprise-setup ccie && cd ccie`


Open `terraform.tfvars` in your favorite text editor and input the 
prerequities stated above in the required fields. 
 
For Linux/Windows
------------------
Please install <a href="https://www.terraform.io/downloads.html">Terraform</a> yourself on Linux/Windows. Then run the command below.

For OSX
------------------

You can just run the command below.

`bin/terraform apply`

Configure Circle Ci Enterprise
==================
<li>Go To the URL output from Terraform
  <ol>
	  <li>Click "Get Started"</li>
	  <li>Trust the temporary SSL cert</li>
	  <li>Use a self-signed certificate ( or if you already have one feel free to use it here )</li>
	  <li>Upload your license</li>
	  <li>Secure the console with a password</li>
	  <li>Enter the current machine's IP address or a hostname that you have configured</li>
	  <li>Create a  <a href="https://github.com/settings/applications/new">Github Developer Application</a></li>
	  <ol type="a">
	  	<li>Set the homepage URL to <code>www.circleci.com</code> </li>
	  	<li>Set the callback URL to <code>&lt;circleci enterprise base url&gt;/auth/github</code></li>
	  </ol>
	  <li>Input the key and secret from GitHub back into the settings page</li>
	  <li>Either upload a valid SSL cert with intermediate certificates and key, or disable SSL (you can always add it later)</li>
	  <li>Save and start the app (all other default settings are fine for now). You will be redirected to the System Console Dashboard,
	      where you should soon see an indication that the app has started like below.</li>
      </ol>
      </li>

   <img src="{{site.baseurl}}/assets/img/docs/started.png" alt="Look For 'Open'" width="150" style="margin: 10px; margin-left: 200px">
  
Using Circle CI Enterprise 
==================

  <li>Try it out!
    <ol>
      <li>Click the "Open" link in the dashboard to go to the CircleCI Enterprise app. You may see a "Starting" page for a few minutes to indicate that the CircleCI
          application is booting up, but you will soon be automatically redirected to the homepage for your CircleCI Enterprise installation.</li>
      <li>Sign up and follow a <a href="/docs/enterprise/quick-start/">project</a></li>
      <li>The first build may remain queued while the build containers start. You can check the "Fleet State" by clicking on the wrench icon on the sidebar and selecting "Fleet State".
If no instances appear in the list, then the first builder is still starting. If there is a builder instance in the list but its state is "starting-up", then it is still downloading the build container image and starting its first build containers. Once this is all done, the first build should begin immediately. If there are no updates after about 15 minutes (remember to click the "refresh" button occasionally), please contact <a href="mailto:enterprise-support@circleci.com">CircleCI Enterprise support</a>.</li>
    </ol>
  </li>

