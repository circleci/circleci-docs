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

The over arching goal of policies for CircleCI configs is to detect violations in configs and stop builds that do not comply
with your organization's policies. However, this raises an issue for local development of circleci.yml files: modifications to your config.yml
may cause your pipeline to be blocked. This slows down development time and can be frustrating in certain situations.

It is possible to run your config.yml against your organization's policies outside of CI using the CircleCI-CLI.

The following command will request a decision for the provided config input and return a Circle Decision containing the status of the decision
and any violations that may have occurred. 

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

It is recommended that users build a test suite of policy/config combinations and running them locally or in CI before pushing them to their organization's active policies.

### Get Policy Decision Audit logs

Audit logs provide documentary evidence for a policy decision being performed at certain point of time.
These include the inputs which influenced the decision of the policy decision, as well as the outcome of the decision.

The CLI provides `policy logs` command to fetch the policy decision logs for your organization. 

Following is the output of this command when run with `--help` flag:

```shell
circleci logs --help

# Returns the following:
Get policy (decision) logs


Usage:
  circleci policy logs [flags]

Examples:
policy logs  --owner-id 462d67f8-b232-4da4-a7de-0c86dd667d3f --after 2022/03/14
--out output.json

Flags:
      --after string        filter decision logs triggered AFTER this datetime
      --before string       filter decision logs triggered BEFORE this datetime
      --branch string       filter decision logs based on branch name
  -h, --help                help for logs
      --out string          specify output file name
      --project-id string   filter decision logs based on project-id
```

- The organization ID information is required, which can be provided with `--owner-id` flag.
- The command currently accepts following filters for the logs: `--after`, `--before`, `--branch` and `--project-id`.
- These filters are optional. Also, any combination of filters can be used to suit your auditing needs.

#### output
- stdout - by default, the decision logs are printed as a list of logs to the standard output.
- file - output can be written to a file (instead of stdout). This can be done by providing filepath using `--out` flag

## Using the CLI Policy Management

The CircleCI-CLI can be leveraged as a tool to manage your organization's policies programmatically.

The commands to perform policy management are group under `policy` command. 
Following sub-commands are currently supported within the CLI for configuration policy management:
- `create` - creates a new policy
- `list` - fetches a list of all the policies within your org
- `get` - fetches a given policy along with the policy content
- `update` - updates (one of the attributes of) given policy
- `delete` - deletes the given policy

The above list are "sub-commands" in the CLI, which would be executed like so:

```shell
circleci policy list --help

# Returns the following:
List all policies

Usage:
  circleci policy list [flags]

Examples:
policy list --owner-id 516425b2-e369-421b-838d-920e1f51b0f5 --active=true

Flags:
      --active   (OPTIONAL) filter policies based on active status (true or false)
  -h, --help     help for list
```

- The organization ID information is required, which can be provided with `--owner-id` flag.
- As with most of the CLI's commands, you will need to have properly authenticated your version of the CLI with a token to enable performing context related actions.