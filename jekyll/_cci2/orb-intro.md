---
layout: classic-docs
title: "Orbs Introduction"
short-title: "Orbs Introduction"
description: "Starting point for CircleCI Orbs"
categories: [getting-started]
order: 1
---

_Available on CircleCI Cloud with `version 2.1` config - not currently available on self-hosted installations_

CircleCI orbs are shareable packages of configuration elements, including jobs, commands, and executors. CircleCI provides certified orbs, along with 3rd-party orbs authored by CircleCI partners. It is best practice to first evaluate whether any of these existing orbs will help you in your configuration workflow. Refer to the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) for the complete list of certified orbs.

## Using CircleCI Orbs

If you have chosen to use CircleCI orbs in your workflows and jobs, there are several different ways that you use orbs. You may choose to either import an existing orb (CircleCI and partner-certified orbs) from the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/), or author your own orb for your specific workflow. Each of these approaches is described below.

### Importing an Existing Orb

To import an existing orb, perform the steps listed below.

1) Add a single line to your version 2.1 [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file for each orb, for example:

```yaml
version: 2.1
```

**Note:** If your project was added to CircleCI prior to 2.1, you must enable "pipelines" to use the `orbs` key.

2) Add the `orbs` stanza below your version, invoking the orb. For example:

```
orbs:
  slack: circleci/slack@0.1.0
  heroku: circleci/heroku@0.0.1
```

In the above example, the following two orbs are imported into your config:

- [Slack orb](https://circleci.com/orbs/registry/orb/circleci/slack) 
- [Heroku orb](https://circleci.com/orbs/registry/orb/circleci/heroku)

### Importing a Partner Orb

To import a partner orb, perform the steps listed below.

1) Import the `orbs` key in your `.circleci.yml/config.yml` file in your configuration. 

2) Replace the `<orb reference string>` value in the example shown below with the orb you wish to import from the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/). There are a large number of CircleCI-certified and Partner-certified orbs that you may choose from.

```yaml
version: 2.1

orbs:
  <orb reference string>
```

#### Example Partner Orbs from CircleCI Orbs Registry

The table below lists some of the many orbs you may select from the CircleCI Orbs Registry.

Partner Orb Registry Link | Orb Reference String
------------|-----------
[Alcide-io](https://circleci.com/orbs/registry/orb/alcideio/alcide-advisor) | `alcide: alcideio/alcide-advisor@1.0.3`
[Anchore](https://circleci.com/orbs/registry/orb/anchore/anchore-engine) | `anchore: anchore/anchore-engine@1.0.0`
[Aqua Security](https://circleci.com/orbs/registry/orb/aquasecurity/microscanner) | `aqua: aquasecurity/microscanner@0.0.1`
[AWS CLI](https://circleci.com/orbs/registry/orb/circleci/aws-cli) | `cli: circleci/aws-cli@0.1.13`
[AWS Code Deploy](https://circleci.com/orbs/registry/orb/circleci/aws-code-deploy) | `codedeploy: circleci/aws-code-deploy@0.0.9`
[Amazon ECR](https://circleci.com/orbs/registry/orb/circleci/aws-ecr) | `ecr: circleci/aws-ecr@4.0.1`
[Amazon ECS](https://circleci.com/orbs/registry/orb/circleci/aws-ecs) | `ecs: circleci/aws-ecs@0.0.11`
[Amazon EKS](https://circleci.com/orbs/registry/orb/circleci/aws-eks) | `eks: circleci/aws-eks@0.1.0`
[AWS Parameter Store](https://circleci.com/orbs/registry/orb/circleci/aws-parameter-store) | `awsparameter: circleci/aws-parameter-store@1.0.0`
[AWS S3](https://circleci.com/orbs/registry/orb/circleci/aws-s3) | `s3: circleci/aws-s3@1.0.11`
[Azure ACR](https://circleci.com/orbs/registry/orb/circleci/azure-acr) | `acr: circleci/azure-acr@0.1.1`
[Azure AKS](https://circleci.com/orbs/registry/orb/circleci/azure-aks) | `aks: circleci/azure-aks@0.1.0`
[Azure CLI](https://circleci.com/orbs/registry/orb/circleci/azure-cli) | `cli: circleci/azure-cli@1.1.0`
[Cloudsmith](https://circleci.com/orbs/registry/orb/cloudsmith/cloudsmith) | `cloudsmith: cloudsmith/cloudsmith@1.0.3`
[Codecov](https://circleci.com/orbs/registry/orb/codecov/codecov) | `codecov: codecov/codecov@1.0.1`
[CodeScene](https://circleci.com/orbs/registry/orb/empear/codescene-ci-cd) | `codescene: empear/codescene-ci-cd@1.0.0`
[ConfigCat](https://circleci.com/orbs/registry/orb/configcat/flag_reference_validator) | `configcat: configcat/flag_reference_validator@1.0.3`
[Contrast Security](https://circleci.com/orbs/registry/orb/contrastsecurity/verify) | `contrastsecurity: contrastsecurity/verify@0.1.2`
[Convox](https://circleci.com/orbs/registry/orb/convox/orb) | `convox: convox/orb@1.4.1`
[Cypress-io](https://circleci.com/orbs/registry/orb/cypress-io/cypress) | `cypress-io: cypress-io/cypress@1.0.0`
[Datree](https://circleci.com/orbs/registry/orb/datree/policy) | `datree: datree/policy@1.0.6`
[DeployHub](https://circleci.com/orbs/registry/orb/deployhub/deployhub-orb) | `deployhub: deployhub/deployhub-orb@1.2.0`
[Docker Hub](https://circleci.com/orbs/registry/orb/circleci/docker) | `dockerhub: circleci/docker@0.1.0`
[F0cal](https://circleci.com/orbs/registry/orb/f0cal/farm) | `f0cal: f0cal/farm@1.0.0`
[Fairwinds](https://circleci.com/orbs/registry/orb/fairwinds/rok8s-scripts) | `fairwinds: fairwinds/rok8s-scripts@9.4.0`
[Fortanix](https://circleci.com/orbs/registry/orb/fortanix/sdkms-cli) | `fortanix: fortanix/sdkms-cli@1.0.0`
[Fossa](https://circleci.com/orbs/registry/orb/fossa/cli) | `fossa: fossa/cli@0.0.3`
[Ghost Inspector](https://circleci.com/orbs/registry/orb/ghostinspector/test-runner) | `ghostinspector: ghostinspector/test-runner@1.0.0`
[GCP Bin Auth](https://circleci.com/orbs/registry/orb/circleci/gcp-binary-authorization) | `gcp: circleci/gcp-binary-authorization@0.5.2`
[Google Cloud CLI](https://circleci.com/orbs/registry/orb/circleci/gcp-cli) | `gcpcli: circleci/gcp-cli@1.8.2`
[Google Container Registry](https://circleci.com/orbs/registry/orb/circleci/gcp-gcr) | `gcr: circleci/gcp-gcr@0.0.7`
[Google Kubernetes Engine](https://circleci.com/orbs/registry/orb/circleci/gcp-gke) | `gke: circleci/gcp-gke@0.1.0`
[Happo](https://circleci.com/orbs/registry/orb/happo/happo) | `happo: happo/happo@1.0.1`
[Helm](https://circleci.com/orbs/registry/orb/circleci/helm) | `helm: circleci/helm@0.1.1`
[Honeybadger-io](https://circleci.com/orbs/registry/orb/honeybadger-io/deploy) | `honeybadger-io: honeybadger-io/deploy@1.1.1`
[Honeycomb](https://circleci.com/orbs/registry/orb/honeycombio/buildevents) | `buildevents: honeycombio/buildevents@0.1.1`
[JFrog](https://circleci.com/orbs/registry/orb/circleci/artifactory) | `jfrog: circleci/artifactory@1.0.0`
[Kublr](https://circleci.com/orbs/registry/orb/kublr/kublr-api) | `kublr: kublr/kublr-api@0.0.1`
[LambdaTest](https://circleci.com/orbs/registry/orb/lambdatest/lambda-tunnel) | `lambdatest: lambdatest/lambda-tunnel@0.0.1`
[LaunchDarkly](https://circleci.com/orbs/registry/orb/launchdarkly/ld-find-code-refs) | `launchdarkly: launchdarkly/ld-find-code-refs@1.2.0`
[LogDNA](https://circleci.com/orbs/registry/orb/logdna/logdna) | `logdna: logdna/logdna@0.0.1`
[Neocortix](https://circleci.com/orbs/registry/orb/neocortix/loadtest) | `neocortix: neocortix/loadtest@0.4.0`
[NeuVector](https://circleci.com/orbs/registry/orb/neuvector/neuvector-orb) | `neuvector: neuvector/neuvector-orb@1.0.0`
[Nirmata](https://circleci.com/orbs/registry/orb/nirmata/nirmata) | `nirmata: nirmata/nirmata@1.1.0`
[Nowsecure](https://circleci.com/orbs/registry/orb/nowsecure/ci-auto-orb) | `nowsecure: nowsecure/ci-auto-orb@1.0.5`
[Oxygen](https://circleci.com/orbs/registry/orb/cloudbeat/oxygen) | `oxygen: cloudbeat/oxygen@1.0.0`
[Packagecloud](https://circleci.com/orbs/registry/orb/packagecloud/packagecloud) | `packagecloud: packagecloud/packagecloud@0.1.0`
[Packtracker](https://circleci.com/orbs/registry/orb/packtracker/report) | `packtracker: packtracker/report@2.2.2`
[Pantheon](https://circleci.com/orbs/registry/orb/pantheon-systems/pantheon) | `pantheon: pantheon-systems/pantheon@0.1.0`
[Percy](https://circleci.com/orbs/registry/orb/percy/agent) | `percy: percy/agent@0.1.2`
[Postman](https://circleci.com/orbs/registry/orb/postman/newman) | `postman: postman/newman@0.0.1`
[Probely](https://circleci.com/orbs/registry/orb/probely/security-scan) | `probely: probely/security-scan@1.0.0`
[Provar](https://circleci.com/orbs/registry/orb/provartesting/provar) | `provar: provartesting/provar@1.9.10`
[Pulumi](https://circleci.com/orbs/registry/orb/pulumi/pulumi) | `pulumi: pulumi/pulumi@1.0.0`
[Quali](https://circleci.com/orbs/registry/orb/quali/cloudshell-colony) | `quali: quali/cloudshell-colony@1.0.4`
[realMethods](https://circleci.com/orbs/registry/orb/realmethods/appgen) | `realmethods: realmethods/appgen@1.0.1`
[Red Hat OpenShift](https://circleci.com/orbs/registry/orb/circleci/redhat-openshift) | `redhat: circleci/redhat-openshift@0.1.0`
[Rocro](https://circleci.com/orbs/registry/orb/rocro/inspecode) | `rocro: rocro/inspecode@1.0.0`
[Rollbar](https://circleci.com/orbs/registry/orb/rollbar/deploy) | `rollbar: rollbar/deploy@1.0.1`
[Rookout](https://circleci.com/orbs/registry/orb/rookout/rookout-node) | `rookout: rookout/rookout-node@0.0.2`
[Sauce Labs](https://circleci.com/orbs/registry/orb/saucelabs/sauce-connect) | `saucelabs: saucelabs/sauce-connect@1.0.1`
[Snyk](https://circleci.com/orbs/registry/orb/snyk/snyk) | `snyk: snyk/snyk@0.0.8`
[Sonatype](https://circleci.com/orbs/registry/orb/sonatype/nexus-platform-orb) | `sonatype: sonatype/nexus-platform-orb@1.0.2`
[Styra](https://circleci.com/orbs/registry/orb/styra/cli) | `styra: styra/cli@0.0.7`
[Sumo Logic](https://circleci.com/orbs/registry/orb/circleci/sumologic) | `sumologic: circleci/sumologic@1.0.0`
[Testim](https://circleci.com/orbs/registry/orb/testimio/runner) | `testim: testimio/runner@1.1.1`
[Twistlock](https://circleci.com/orbs/registry/orb/twistlock/twistcli-scan) | `twistlock: twistlock/twistcli-scan@1.0.4`
[Unmock](https://circleci.com/orbs/registry/orb/unmock/unmock) | `unmock: unmock/unmock@0.0.10`
[VMware Code Stream](https://circleci.com/orbs/registry/orb/vmware/codestream) | `vmware: vmware/codestream@1.0.0`
[WhiteSource](https://circleci.com/orbs/registry/orb/whitesource/whitesource-scan) | `whitesource: whitesource/whitesource-scan@18.10.2`
[WhiteSource Vulnerability Checker](https://circleci.com/orbs/registry/orb/whitesource/vulnerability-checker) | `whitesource: whitesource/vulnerability-checker@19.7.2`
[xMatters](https://circleci.com/orbs/registry/orb/xmatters/xmatters-orb) | `xmatters: xmatters/xmatters-orb@0.0.1`
{: class="table table-striped"}

**Note:**  As a prerequisite, you must enable use of 3rd-party orbs on the Settings > Security page for your org.


## Authoring Your Own Orb

If you find that there are no existing orbs that meet your needs, you may author your own orb to meet your specific environment or configuration requirements by using the [CircleCI CLI]({{ site.baseurl }}/2.0/local-cli/#overview) as shown in the `circleci orb help` output below. Although this is more time-consuming than using the import feature, authoring your own orb enables you to create a world-readable orb for sharing your configuration. See [Creating Orbs]({{ site.baseurl }}/2.0/creating-orbs/) for more information.

**Note:** To unlist your published orbs from the registry, use the `circleci orb unlist` CLI command. For details, refer to the [help page](https://circleci-public.github.io/circleci-cli/circleci_orb_unlist.html). Unlisted orbs remain world-readable when referenced by name but will not appear in the search results of the orb registry. Unlisted orbs can be listed again using the `circleci orb unlist <namespace/orb> false` command.

```
$ circleci orb help
Operate on orbs

Usage:
  circleci orb [command]

Available Commands:
  create      Create an orb in the specified namespace
  list        List orbs
  process     Validate an orb and print its form after all pre-registration processing
  publish     Publish an orb to the registry
  source      Show the source of an orb
  validate    Validate an orb.yml
```

**Note** When authoring an orb, you will agree to CircleCI's [Code Sharing Terms of Service](https://circleci.com/legal/code-sharing-terms/) when your organization opts-in to 3rd party orb use and authoring. CircleCI thereby licenses all orbs back to users under the MIT License agreement.

## See Also
- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/using-orbs/) for high-level information about CircleCI orbs.
- Refer to [Orbs FAQ]({{site.baseurl}}/2.0/orbs-faq/) for information on known issues and questions that have been addressed when using CircleCI orbs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) for information on how to test orbs you have created.
- Refer to [Orbs Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/) for information about how you can use CircleCI orb recipes in your configurations.
