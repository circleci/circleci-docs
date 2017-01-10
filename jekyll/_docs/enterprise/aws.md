---
layout: enterprise
title: "AWS AMI Install"
category: [installation]
order: 3
description: "How to install CircleCI Enterprise on Amazon Web Services (AWS)."
---


The following step-by-step instructions will guide you through the process of installing CircleCI Enterprise on AWS. If you have any questions as you go through these steps, please contact <enterprise-support@circleci.com>.

<ol>
  <li>Launch resources on AWS using Terraform (see <a href="{{site.baseurl}}/enterprise/aws-manual/">here</a> for advanced instructions if you prefer to set up resources manually or using different tools):
  <pre>
git clone https://github.com/circleci/enterprise-setup ccie && cd ccie

# Ensure that <a href="https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating">DNS is enabled for your VPC</a>.
# Specifically, enableDnsSupport must be true.
# If this is not enabled, then you must otherwise ensure that DNS is configured correctly on your instances
# IMPORTANT: See [additional instructions if you are using a private subnet]({{site.baseurl}}/enterprise/aws-private-subnet/).

vi terraform.tfvars # Edit variables as appropriate with your favorite editor

# Launch AWS resources with the Terraform wrapper script
# (This script requires OSX. Please <a href="https://www.terraform.io/downloads.html">install Terraform</a> yourself on Linux/Windows.)

bin/terraform apply</pre>
  </li>
  <li>Fill out the settings form in the web UI:
    <ol type="a">
      <li>Go to the URL output from Terraform, click "Get Started", then click on "Advanced", "Add exception...", or whatever mechanism your browser provides to trust the temporary  SSL cert</li>
      <li>Use a self-signed certificate, upload your license, and secure the console with a password</li>
      <li>Enter the current machine's IP address or a hostname that you have configured</li>
      <li>Create a GitHub developer application at <code>&lt;github base url&gt;/settings/applications/new</code>, set the callback URL to <code>&lt;circleci enterprise base url&gt;/auth/github</code>, and input the key and secret back in the settings page</li>
      <li>Either upload a valid SSL cert with intermediate certificates and key, or disable SSL (you can always add it later)</li>
      <li>Save and start the app (all other default settings are fine for now). You will be redirected to the System Console Dashboard,
          where you should soon see an indication that the app has started like this: <br /> <img src="{{site.baseurl}}/assets/img/docs/started.png" alt="Look For 'Open'" width="150" style="margin: 10px; margin-left: 200px">
	  </li>
    </ol>
  </li>
  <li>Try it out!
    <ol type="a">
      <li>Click the "Open" link in the dashboard to go to the CircleCI Enterprise app. You may see a "Starting" page for a few minutes to indicate that the CircleCI
          application is booting up, but you will soon be automatically redirected to the homepage for your CircleCI Enterprise installation.</li>
      <li>Sign up and follow a <a href="/docs/enterprise/quick-start/">project</a></li>
      <li>The first build may remain queued while the build containers start. You can check the "Fleet State" by clicking on the wrench icon on the sidebar and selecting "Fleet State".
If no instances appear in the list, then the first builder is still starting. If there is a builder instance in the list but its state is "starting-up", then it is still downloading the build container image and starting its first build containers. Once this is all done, the first build should begin immediately. If there are no updates after about 15 minutes (remember to click the "refresh" button occasionally), please contact <a href="mailto:enterprise-support@circleci.com">CircleCI Enterprise support</a>.</li>
    </ol>
  </li>
</ol>
