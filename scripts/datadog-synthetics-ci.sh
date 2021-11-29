#!/usr/bin/env bash

# Datadog Synthetics CLI's Tunneling Feature which allows synthetic tests to be
# run on internal endpoints is still in beta as of version 0.17.8.

# Unfortunately, that means it appears to have a bug still that prevents it from
# returning an exit code once tests are finished (regardless of pass or fail). 
# This means our CI hangs on this step. 
# Note: this bug only occurs for the --tunnel flag.

# In this script, we simply read the test's output, parse for keywords that
# indicate if the tests were a success or failure and return an exit code
# manually. The job can then either stop itself from an exit code 1 or continue 
# to deployment (if in master or *-preview branch) from an exit code 0.

while read l1 ;do 
   echo $l1
   if [[ $l1 =~ "passed, 0 failed" ]];then     
      exit 0
   elif [[ $l1 =~ "failed" ]] && [[ $l1 =~ "passed," ]]; then 
      exit 1
   elif [[ $l1 =~ "Missing" ]] && [[ $l1 =~ "in your environment." ]]; then
      echo "WARNING: Missing Datadog API key or Datadog App Key. Skipping Datadog Synthetics…"
      exit 0
   fi
done < <(yarn datadog-synthetics-ci)
