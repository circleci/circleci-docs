Class | vCPUs | RAM
---|---|---
medium | 4 @ 2.7 GHz | 8GB
macos.x86.medium.gen2 | 4 @ 3.2 GHz | 8GB
large | 8 @ 2.7 GHz | 16GB
macos.x86.metal.gen1 | 12 @ 3.2 GHz | 32GB
macos.m1.large.gen1 | 8 | 12GB
{: class="table table-striped"}

The `medium` and `large` resource classes are being deprecated on October 2, 2023. See our [announcement](https://discuss.circleci.com/t/macos-resource-deprecation-update/46891) for more details.
{: class="alert alert-warning"}
The `macos.x86.metal.gen1` resource requires a minimum 24-hour lease. See the [Dedicated Host for macOS]({{ site.baseurl }}/dedicated-hosts-macos) page to learn more about this resource class.
<br />
<br />
The `large` and `macos.m1.large.gen1` resource classes are only available for customers with an annual contract. [Open a support ticket](https://support.circleci.com/hc/en-us/requests/new) if you would like to learn more about our annual plans.
{: class="alert alert-info"}
