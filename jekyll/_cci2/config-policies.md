---
layout: classic-docs
title: Config Policies
categories: []
description: How to leverage CircleCI containers
version:
- Cloud
- Beta
---

Hello world!

This is beta
{: class="alert alert-info"}

## Section 1
{: #section1 }

## CircleCI Rego Helpers
{: #section1 }

The `circle-policy-agent` package includes built-in functions for common config policy
use cases. All policies evaluated by the `policy-service`, the `circle-cli`, or the `circle-policy-agent`
will be able to access these functions. This also means the package name `circleci.config` is
reserved.

### `jobs`
{: #section2 }

`jobs` is a Rego object containing jobs that are present in the given CircleCI config file. It 
can be utilized by policies related to jobs.

#### Definition
{: #section3 }

```
jobs = []string
```

Example `jobs` object:
```
[
    "job-a",
    "job-b",
    "job-c"
]
```

#### Usage
{: #section3 }

```
package org
import future.keywords
import data.circleci.config

jobs := config.jobs
```


### `require_jobs`
{: #section2 }

This function requires a config to contain jobs based on the job names. Each job in the list of 
required jobs must be in at least one workflow within the config.

#### Definition
{: #section3 }

```
require_jobs([string])
returns { string }
```

#### Usage
{: #section3 }

```
package org
import future.keywords
import data.circleci.config
require_security_jobs = config.require_jobs(["security-check", "vulnerability-scan"])
enable_rule["require_security_jobs"]
hard_fail["require_security_jobs"] {
	require_security_jobs
}
```

### `orbs`
{: #section2 }

`orbs` is a Rego object containing orbs and versions present in the given config file. It 
can be utilized by policies related to orbs.

#### Definition
{: #section3 }

```
orbs[string] = string
```

Example `orbs` object:
```
{
    "circleci/security": "1.2.3",
    "circleci/foo": "3.2.1"
}
```

#### Usage
{: #section3 }
```
package org
import future.keywords
import data.circleci.config

my_orbs := config.orbs
```


### `require_orbs`
{: #section2 }

This function requires a config to contain orbs based on the orb names. Versions should not 
be included in the provided list of orbs.

#### Definition
{: #section3 }

```
require_orbs([string])
returns { string: string }
```

#### Usage
{: #section3 }

```
package org
import future.keywords
import data.circleci.config
require_security_orbs = config.require_orbs(["circleci/security", "foo/bar"])
enable_rule["require_security_orbs"]
hard_fail["require_security_orbs"] {
	require_security_orbs
}
```

### `require_orbs_version`
{: #section2 }

This function requires a policy to contain orbs based on the orb name and version.

#### Definition
{: #section3 }

```
require_orbs_version([string])
returns { string: string }
```

#### Usage
{: #section3 }

```
package org
import future.keywords
import data.circleci.config
require_orbs_versioned = config.require_orbs_version(["circleci/security@1.2.3", "foo/bar@4.5.6"])
enable_rule["require_orbs_versioned"]
hard_fail["require_orbs_versioned"] {
	require_orbs_versioned
}
```

### `ban_orbs`
{: #section2 }

This function violates a policy if a config includes orbs based on the orb name. Versions should not 
be included in the provided list of orbs.

#### Definition
{: #section3 }

```
ban_orbs_version([string])
returns { string: string }
```

#### Usage
{: #section3 }

```
package org
import future.keywords
import data.circleci.config
ban_orbs = config.ban_orbs(["evilcorp/evil"])
enable_rule["ban_orbs"]
hard_fail["ban_orbs"] {
	ban_orbs
}
```

### `ban_orbs_version`
{: #section2 }

This function violates a policy if a config includes orbs based on the orb name and version.

#### Definition
{: #section3 }

```
ban_orbs_version([string])
returns { string: string }
```

#### Usage
{: #section3 }

```
package org
import future.keywords
import data.circleci.config
ban_orbs_versioned = config.ban_orbs_version(["evilcorp/evil@1.2.3", "foo/bar@4.5.6"])
enable_rule["ban_orbs_versioned"]
hard_fail["ban_orbs_versioned"] {
	ban_orbs_versioned
}
```

## Leveraging the CLI for Config and Policy Development

### Developing Configs

The over arching goal of policies for circleci configs is to detect violations in configs and stop builds that do not comply
with your organization's policies. However this raises an issue for local development of circleci.yml files: modifications to your config.yml
may cause your pipeline to be blocked. This slows down development time and can be frustrating in certain situtations.

It is possible to run your config.yml against your organization's policies outside of CI using the CircleCI-CLI.

The following command will request a decision for the provided config input and return a Circle Decision containing the status of the decision
and any violations that may have occured. 

__Remote Decision Command__
```bash
circleci policy decide --owner-id $ORG_ID --input $PATH_TO_CONFIG
```

__Example Resulting Decision__
```json
{
    "status": "HARD_FAIL",
    "hard_failures": [
        {
            "rule": "custom_rule",
            "reason": "custom failure message"
        }
    ],
    "soft_failures": [
        {
            "rule": "other_rule",
            "reason": "other failure message"
        }
    ]
}
```

### Developing Policies

The CLI provides a language agnostic way of evaluating local policies against arbitrary config inputs. It is the recommended
way of developing and testing policies. It is similar to the previous command except that it provides a path to the local policies.
The path can be to a policy file, or to a directory of files. If it is a directory, files will be bundled into a policy non-recursively.

```bash
circleci policy decide --owner-id $ORG_ID --input $PATH_TO_CONFIG --policy $PATH_TO_POLICY_FILE_OR_DIR
```

It is recommened that user's build a test suite of policy/config combinations and running them locally or in CI before pushing them to their organization's active policies.


