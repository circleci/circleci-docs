### I thought pipeline parameters could only be used with the API?
{: #pipeline-parameters-API }

Previously, this was true. With the dynamic configuration feature, you can now set pipeline parameters dynamically, before the pipeline is executed (triggered from either the API or a webhook—a push event to your VCS).

### Can I use a custom executor?
{: #can-i-use-a-custom-executor }

Custom executors can be used, but require certain dependencies to be installed for the continuation step to work (currently: `curl`, `jq`).

### What is the `continuation` orb?
{: #what-is-the-continuation-orb }

The `continuation` orb assists you in managing the pipeline continuation process. The
`continuation` orb wraps an API call to [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline). Refer to the [`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation) orb
documentation for more information.

### Is it possible to not use the continuation orb?
{# possible-to-not-use-continuation-orb }

If you have special requirements not covered by the continuation orb, you can implement the same functionality in other ways. Refer to the [orb source code](https://circleci.com/developer/orbs/orb/circleci/continuation#orb-source) to learn how the continuation functionality is implemented with the orb.