# 2.19.0 Nomad Client Launch Configuration Update

## IMPORTANT

* **THIS WILL REQUIRE DOWNTIME**.  Please schedule a maintenance window before proceeding.  
* This change is only compatible with CircleCI Server versions greater than or equal to 2.19.0 



### Sign in to AWS

1. Login to the AWS
2. Select the region that your CircleCI Server (Server) resides in
3. Select the `Services` tab and select `EC2`



### Find the Launch Configuration and Service Box IP address

1. Select `Auto Scaling Groups` located near the bottom of the left navigation pane
2. Select the auto scaling group configuration associated with your Server installation.  Typically resembles `*-ghe_nomad_clients_asg`
3. Make note of the name of `Launch Configuration` under the `Details` tab.  Typically resembles `terraform-20200114212820082700000001`
4. In the left navigation pane, select `Launch Configurations`
5. Locate the launch configuration that matches the one found in step 3.
6. In the bottom pane, select the `View User Data ` link
7. Scroll down or search for the `Creating config.hcl` section.  
8. Write down or copy the service box private IP address located in the client portion of the config located next to `servers = ["IP_ADDRESS:4647"]` You will need this in the next step.

```
...
...
client {
    enabled = true
    # Expecting to have DNS record for nomad server(s)
    servers = ["YOUR_SERVICES_BOX_IP_ADDRESS:4647"]  <==== YOU WILL NEED THIS IP ADDRESS
    node_class = "linux-64bit"
    options = {"driver.raw_exec.enable" = "1"}
}
...
```



### Create a New Launch Configuration 

1. Right-click the launch configuration and select `Copy Launch Configuration` 
2. At the top of the screen, select `3. Configure details `
3. Update the name to something meaningful and easy to identify IE `nomad-client-lc-20200117`
4. Select the `Advanced Details` dropdown
5. Below you will find the updated Nomad client configuration.  Replace the contents of the `User data` pane with the script below.  
6. **IMPORTANT:** Locate the section of code you found in step 8 above and replace the IP address with that of your services box. 
7. Select the `Skip to review` button at the bottom right of the screen
8. Select the `Create Launch Configuration` Button
9. Verify that the SSH key-pair name is correct and select `Create launch configuration` button



### Update the Auto Scaling group 

1. Return the `Auto Scaling Groups` page
2. Locate the auto scaling group we identified in the `Find the Launch Configuration and Service Box IP address` section above
3. Right-click the auto scaling group and select `Edit` from the menu
4. Select the launch configuration created in the previous section from the `Launch Configuration` drop-down menu.
5. Press the `Save` button



### Rolling the Nomad Client Instances

There are many strategies you can use the update the builders.  Some ideas include but are not limited to:

* Terminate all of the existing nomad client instances and allow the auto scaler to recreate them.
* Edit the auto scaling configuration and set the `Desired Capacity`  to 0.  Once the existing instances have terminated, set the `Desired Capacity` to the original number.

Please use whatever works best with your existing methods of auto scaling group management. 



### Verify the New Nomad Clients are Communicating with Nomad Server

1. SSH into the CircleCI Services Box

2. Enter the following command: `sudo docker exec -it nomad nomad node-status`. The output should resemble the following:

   ```
   ubuntu@govcloud-service-box:~$ sudo docker exec -it nomad nomad node-status
   sudo: unable to resolve host govcloud-service-box
   ID        DC         Name                 Class        Drain  Eligibility  Status
   0cf07b07  default    i-070fdad5f0edef4c8  linux-64bit  false  eligible     ready
   ec2ccc9d  us-east-1  i-0895ee505ec7e692c  linux-64bit  false  eligible     down
   ```

3. Verify that there are new builders containing the `default` DC name and they are in a `ready` state.



## Updated Nomad Client Launch Configuration Script

```bash
#!/bin/bash

set -exu

export http_proxy=""
export https_proxy=""
export no_proxy=""
export aws_instance_metadata_url="http://169.254.169.254"
export DEBIAN_FRONTEND=noninteractive
UNAME="$(uname -r)"

echo "-------------------------------------------"
echo "     Performing System Updates"
echo "-------------------------------------------"
apt-get update && apt-get -y upgrade

echo "--------------------------------------"
echo "        Installing NTP"
echo "--------------------------------------"
apt-get install -y ntp

# Use AWS NTP config for EC2 instances and default for non-AWS
if [ -f /sys/hypervisor/uuid ] && [ `head -c 3 /sys/hypervisor/uuid` == ec2 ]; then
cat <<EOT > /etc/ntp.conf
driftfile /var/lib/ntp/ntp.drift
disable monitor
restrict default ignore
restrict 127.0.0.1 mask 255.0.0.0
restrict 169.254.169.123 nomodify notrap
server 169.254.169.123 prefer iburst
EOT
else
  echo "USING DEFAULT NTP CONFIGURATION"
fi

service ntp restart

echo "--------------------------------------"
echo "        Installing Docker"
echo "--------------------------------------"
apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get install -y "linux-image-$UNAME"
apt-get update
apt-get -y install docker-ce=5:18.09.9~3-0~ubuntu-xenial

# force docker to use userns-remap to mitigate CVE 2019-5736
apt-get -y install jq
mkdir -p /etc/docker
[ -f /etc/docker/daemon.json ] || echo '{}' > /etc/docker/daemon.json
tmp=$(mktemp)
cp /etc/docker/daemon.json /etc/docker/daemon.json.orig
jq '.["userns-remap"]="default"' /etc/docker/daemon.json > "$tmp" && mv "$tmp" /etc/docker/daemon.json

sudo echo 'export http_proxy=""' >> /etc/default/docker
sudo echo 'export https_proxy=""' >> /etc/default/docker
sudo echo 'export no_proxy=""' >> /etc/default/docker
sudo service docker restart
sleep 5

echo "--------------------------------------"
echo "         Installing nomad"
echo "--------------------------------------"
apt-get install -y zip
curl -o nomad.zip https://releases.hashicorp.com/nomad/0.9.3/nomad_0.9.3_linux_amd64.zip
unzip nomad.zip
mv nomad /usr/bin

echo "--------------------------------------"
echo "      Creating config.hcl"
echo "--------------------------------------"
export PRIVATE_IP="$(/sbin/ifconfig ens3 | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1}')"
export INSTANCE_ID="$(curl $aws_instance_metadata_url/latest/meta-data/instance-id)"
mkdir -p /etc/nomad
cat <<EOT > /etc/nomad/config.hcl
log_level = "DEBUG"
name = "$INSTANCE_ID"
data_dir = "/opt/nomad"
datacenter = "default"
advertise {
    http = "$PRIVATE_IP"
    rpc = "$PRIVATE_IP"
    serf = "$PRIVATE_IP"
}
client {
    enabled = true
    # Expecting to have DNS record for nomad server(s)
    servers = ["REPLACE_ME_WITH_SERVICE_BOX_IP:4647"]
    node_class = "linux-64bit"
    options = {"driver.raw_exec.enable" = "1"}
}
EOT

echo "--------------------------------------"
echo "      Creating nomad.conf"
echo "--------------------------------------"
cat <<EOT > /etc/systemd/system/nomad.service
[Unit]
Description="nomad"
[Service]
Restart=always
RestartSec=30
TimeoutStartSec=1m
ExecStart=/usr/bin/nomad agent -config /etc/nomad/config.hcl
[Install]
WantedBy=multi-user.target
EOT

echo "--------------------------------------"
echo "   Creating ci-privileged network"
echo "--------------------------------------"
docker network create --driver=bridge --opt com.docker.network.bridge.name=ci-privileged ci-privileged

echo "--------------------------------------"
echo "      Starting Nomad service"
echo "--------------------------------------"
service nomad restart
```


