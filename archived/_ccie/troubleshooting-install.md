---
layout: enterprise
section: enterprise
title: Troubleshooting the Install
category: [troubleshooting]
order: 0
published: true
sitemap: false
---


#### "Test GitHub Authentication" is failing

This means that the GitHub Enterprise server is not returning the intermediate SSL certificates. Check your GitHub Enterprise instance with <https://www.ssllabs.com/ssltest/analyze.html> - it may report some missing intermediate certs. You can use tools like <https://whatsmychaincert.com/> to get the full certificate chain for your server.


#### Docker isn't working?

Please see [these instructions](https://circleci.com/docs/enterprise/docker-builder-config/#sharing-the-docker-socket) to use Docker.

If you are using single-box mode, note that you'll have to have

`export CIRCLE_DOCKER_RUN_ARGUMENTS="-v /var/run/docker.sock:/var/run/docker.sock"`

in `/etc/circle-installation-customizations` for it to work. You also won't need to have docker specified in the circle.yml as the container will have access to the docker socket in the background. That should get docker working in single-box mode.

#### Can I use a custom image in single box mode?

Yes! You can do this by adding the below export to a file called `/etc/circle-installation-customizations`:


```
export CIRCLE_CONTAINER_IMAGE_URI="docker://circleci/build-image:{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.build-image }}"
```

That'll give you the same image that is currently used on circleci.com, but you can replace the URI image with anything that is currently pulled unto the machine or exists in dockerhub. This works with [custom images](https://github.com/circleci/image-builder) as well. 

#### "Why isn't CircleCI using HTTPS?"

While we create a self-signed cert when starting up, that certificate only applies to the management console and not the CircleCI product itself. If you want to use HTTPS, you'll have to give us certificates to use under the `Privacy` section of the settings in the management console.

#### "Why doesn't terraform destroy every resource"

We set the services box to have termination protection in AWS. We also write to an s3 bucket. If you want terraform to destroy every resource, you'll have to either manually delete the instance, or turn off termination protection in the circleci.tf file. You'll also need to empty the s3 bucket that was created as part of the terraform install.'

#### "How do I backup CircleCI?"

As of 1.48.0 we've enabled you to take snapshots right in the management console, and follow the steps below:

1: On the management console, https://services_ip:8800, create a snapshot

2: After it completes, backup the full snapshots directory `/var/lib/replicated/snapshots`, including the json file, to something safe.

3: Take down the services box and rebuild it, but do not run the setup wizard yet.

4: Copy the snapshots directory to the services box. I recommend `/home/ubuntu/ so to avoid permissions issues.

5: Run the startup. When it asks for the licence, instead click `restore from a snapshot` 

6: Enter the path ie: `/home/ubuntu/snapshots` and click browse.

7: Select the snapshot and choose restore.

8: Restore the full snapshot and that will return your licence, console passphrase and databases.

#### "How do I upgrade builder instances"

The builder instances take their binaries directly from the services box when they initialize. Thus in order to update the builder boxes you'll need update the services box first, then create a new builder fleet ( or roll the builder fleet using an autoscaling group). During this start-up phase the builders will take the new update from the services machines, and things will be up-to-date.


#### "Do the builders store any state?"

They can be torn down without worry as they don't persist any data. The builders will cache docker images if you've shared the docker socket.



#### "Verify TLS Settings" is failing

Make sure that your keys are in unencrypted PEM format, and that the certificate includes the entire chain of trust as follows:

```
-----BEGIN CERTIFICATE-----
your_domain_name.crt
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
intermediate 1
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
intermediate 2
-----END CERTIFICATE-----
...
```
