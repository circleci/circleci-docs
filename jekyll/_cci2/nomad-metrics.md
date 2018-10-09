---
layout: classic-docs
title: "Installing and Configuring Nomad Metrics"
category: [administration]
order: 9
description: "Installing and Configuring Nomad Metrics"
---

# Configuring Nomad Metrics

Nomad Metrics is a helper service used to collect metrics data from the [Nomad server and clients](https://circleci.com/docs/2.0/nomad/) running on the Services and Nomad Client hosts respectively.  Metrics are collected and sent using the [DogStatsD](https://docs.datadoghq.com/developers/dogstatsd/) protocol and sent to the Services host.

## Nomad Metrics Server

The Nomad Metrics container is run on the services host using the server flag and requires no additional configuration.

## Nomad Metrics Client

The Nomad Metrics client is installed and run on all Nomad Client instances.  You will need to update your AWS Launch Configuration in order to install and configure it.  Additionally, you will have to modify the AWS security group to ensure that UDP port 8125 is open on the Services Host.  

##### Before You Begin

- In order to complete this process, you will need to terminate the old Nomad Client instances. This will terminate any builds running on those clients. Ideally, this should be performed during off hours and/or inside a maintenace window. Please plan accordingly.
- You should be logged into the EC2 Service section of the AWS Console.  Make sure that you logged into the region you use to run CircleCI Server.

### Updating the Services Host Security Group

1. Select the `Instances` link located under the Instances group in the left sidebar.
2. Select the Services Box Instance.  The name tag typically resembles `circleci_services`.
3. In the description box at the bottom, select the users security group link located next to the `Security Groups` section.  It typically resembles `*_users_sg`.
4. This will take you straight to the Security Group page highlighting the users security group.  In the description box at the bottom, select the `Inbound` tab followed by the `Edit` button.
5. Select the `Add Rule` button.  From the drop-down, select `Custom UDP Rule`.  In the Port Range field enter `8125`.  
6. The source field gives you a few options.  However, this ultimately depends on how you have configured the VPC and subnet.  Below are some more common scenarios.  
   1. (Suggested) Allow traffic from the nomad client subnet.  You can usually match the entries used for ports 4647 or 3001.  For example, `10.0.0.0/24`.
   2. Allow all traffic to UDP port 8125 using `0.0.0.0/0`.
7. Click the `Save Button`

### Updating the AWS Launch Configuration

#### Prerequisites

##### AWS EC2 Launch Configuration ID

1. Select the `Auto Scaling Groups` (ASG) link in the the sidebar on the left.
2. Locate the ASG with a name tag similar to`*_nomad_clients_asg`
3. The Launch Configuration name is next to the ASG name IE `terraform-20180814231555427200000001`

##### AWS EC2 Services Box Private IP Address

1. Select the `Instances` link located under the Instances group in the left sidebar
2. Select the Services Box Instance.  The name tag typically resembles `circleci_services`
3. In the description box at the bottom of the page, make note of the private IP address.

#### Updating the Launch Configuration

1. Select the `Launch Configurations` link located under `Auto Scaling` in the sidebar to the left.  Select the Launch Configuration you retrieved in the previous steps.
2. In the description pane at the bottom, select the `Copy launch configuration` button.
3.  Once the configuration page opens, select `3. Configure details` link located at the top of the page.
4. Update the `Name` field to something meaningful IE `nomad-client-with-metrics-lc-DATE`.
5. Select the `Advanced Details` drop down.
6. Copy and paste the launch configuration script from below in the text field next to `User data`.
7. **IMPORTANT:** Enter the private IP address of the services box at Line 10. For example, `export SERVICES_PRIVATE_IP="192.168.1.2"`.
8. Select the `Skip to review` button and then`Create launch configuration` button.
9. Select an existing key pair or create a new set when prompted 

```bash
#! /bin/sh

set -exu

export http_proxy=""
export https_proxy=""
export no_proxy=""
export CONTAINER_NAME="nomad_metrics"
export CONTAINER_IMAGE="circleci/nomad-metrics:0.1.90-1448fa7"
export SERVICES_PRIVATE_IP="<YOUR_SERVICES_PRIVATE_IP>"
export NOMAD_METRICS_PORT="8125"

echo "-------------------------------------------"
echo "     Performing System Updates"
echo "-------------------------------------------"
apt-get update && apt-get -y upgrade

echo "--------------------------------------"
echo "        Installing Docker"
echo "--------------------------------------"
apt-get install -y linux-image-extra-$(uname -r) linux-image-extra-virtual
apt-get install -y apt-transport-https ca-certificates curl
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get -y install docker-ce=17.03.2~ce-0~ubuntu-trusty cgmanager

sudo echo 'export http_proxy=""' >> /etc/default/docker
sudo echo 'export https_proxy=""' >> /etc/default/docker
sudo echo 'export no_proxy=""' >> /etc/default/docker
sudo service docker restart
sleep 5

echo "--------------------------------------"
echo "         Installing nomad"
echo "--------------------------------------"
apt-get install -y zip
curl -o nomad.zip https://releases.hashicorp.com/nomad/0.5.6/nomad_0.5.6_linux_amd64.zip
unzip nomad.zip
mv nomad /usr/bin

echo "--------------------------------------"
echo "      Creating config.hcl"
echo "--------------------------------------"
export PRIVATE_IP="$(/sbin/ifconfig eth0 | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1}')"
mkdir -p /etc/nomad
cat <<EOT > /etc/nomad/config.hcl
log_level = "DEBUG"

data_dir = "/opt/nomad"
datacenter = "us-east-1"

advertise {
    http = "$PRIVATE_IP"
    rpc = "$PRIVATE_IP"
    serf = "$PRIVATE_IP"
}

client {
    enabled = true

    # Expecting to have DNS record for nomad server(s)
    servers = ["$SERVICES_PRIVATE_IP:4647"]
    node_class = "linux-64bit"
    options = {"driver.raw_exec.enable" = "1"}
}

telemetry {
    publish_node_metrics = true
    statsd_address = "$SERVICES_PRIVATE_IP:8125"
}
EOT

echo "--------------------------------------"
echo "      Creating nomad.conf"
echo "--------------------------------------"
cat <<EOT > /etc/init/nomad.conf
start on filesystem or runlevel [2345]
stop on shutdown

script
    exec nomad agent -config /etc/nomad/config.hcl
end script
EOT

echo "--------------------------------------"
echo "   Creating ci-privileged network"
echo "--------------------------------------"
docker network create --driver=bridge --opt com.docker.network.bridge.name=ci-privileged ci-privileged

echo "--------------------------------------"
echo "      Starting Nomad service"
echo "--------------------------------------"
service nomad restart

echo "--------------------------------------"
echo "      Setting up Nomad metrics"
echo "--------------------------------------"
docker pull $CONTAINER_IMAGE
docker rm -f $CONTAINER_NAME || true

# Not using --detach so that upstart can perform log management and process
# monitoring
docker run -d --name $CONTAINER_NAME \
    --rm \
    --net=host \
    --userns=host \
    $CONTAINER_IMAGE \
    start --nomad-uri=http://localhost:4646 --statsd-host=$SERVICES_PRIVATE_IP --statsd-port=$NOMAD_METRICS_PORT --client

```

#### Updating the Auto Scaling Group

1. Select the `Auto Scaling Groups` (ASG) link in the the sidebar on the left.
2. Select the ASG with a name tag similar to`*_nomad_clients_asg`
3. In the Details box at the bottom, select the `Edit` button
4. Select the newly created Launch Configuration from the drop-down.
5. Press the `Save` button.

#### Final Steps
You will need to terminate the existing Nomad Client instances in order for instances with the new Launch Configuration to be created.  Ideally, this should only be done during off-hours or inside of a maintenance window as it could prematurely terminate running jobs.


## StatsD Metrics

## --server

Name                                      | Type  | Description
------------------------------------------|-------|-------------
`circle.nomad.server_agent.poll_failure`  | Gauge | 1 if the last poll of the Nomad agent failed; 0 otherwise.  This gauge is set independent of `circle.nomad.client_agent.poll_failure` when nomad-metrics is operating in `--client` and `--server` modes simultaneously.
` circle.nomad.server_agent.poll_time`    | Timing| Amount of time taken to record a poll. 
`circle.nomad.server_agent.jobs.pending`  | Gauge | Total number of pending jobs across the cluster.
`circle.nomad.server_agent.jobs.running`  | Gauge | Total number of running jobs across the cluster.
`circle.nomad.server_agent.jobs.complete` | Gauge | Total number of complete jobs across the cluster.
`circle.nomad.server_agent.jobs.dead`     | Gauge | Total number of dead jobs across the cluster.
{: class="table table-striped"}

- The number of jobs in a terminal state (`complete` and `dead`) will typically increase until Nomad garbage-collects the jobs from its state.

## --client

Name                                                   | Type  | Description
-------------------------------------------------------|-------|-------------
`circle.nomad.client_agent.poll_failure`               | Gauge | 1 if the last poll of the Nomad agent failed; 0 otherwise.
`circle.nomad.client_agent.resources.total.cpu`        | Gauge | (See below)
`circle.nomad.client_agent.resources.used.cpu`         | Gauge | (See below)
`circle.nomad.client_agent.resources.available.cpu`    | Gauge | (See below)
`circle.nomad.client_agent.resources.total.memory`     | Gauge | (See below)
`circle.nomad.client_agent.resources.used.memory`      | Gauge | (See below)
`circle.nomad.client_agent.resources.available.memory` | Gauge | (See below)
`circle.nomad.client_agent.resources.total.disk`       | Gauge | (See below)
`circle.nomad.client_agent.resources.used.disk`        | Gauge | (See below)
`circle.nomad.client_agent.resources.available.disk`   | Gauge | (See below)
`circle.nomad.client_agent.resources.total.iops`       | Gauge | (See below)
`circle.nomad.client_agent.resources.used.iops`        | Gauge | (See below)
`circle.nomad.client_agent.resources.available.iops`   | Gauge | (See below)
{: class="table table-striped"}

- CPU resources are reported in units of MHz.  Memory resources are reported in units of MB.  Disk (capacity) resources are reported in units of MB.
- Resource metrics are scoped to the Nomad node that nomad-metrics has been configured to poll.  Figures from a single nomad-metrics job operating in `--client` mode are _not_ representative of the entire cluster (Though these timeseries may be aggregated by an external mechanism to arrive at a cluster-wide view.)
- All metrics in the `circle.nomad.client_agent.resources` namespace will be accompanied with the following tags when writing to DogStatsD:
  - `drain`: `true` if the Nomad node has been marked as drained; `false`
    otherwise.
  - `status`: One of `initializing`, `ready`, or `down`.
