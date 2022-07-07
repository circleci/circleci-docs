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