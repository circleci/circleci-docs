#!/usr/bin/env bash
set -euo pipefail

# gather the list of words that are on the bocklist and join them together to be
# used as a regex.
export WORD_LIST=$(cat words.txt | tr -s '[:space:]' '|' | sed 's/|$//g')

# run a git diff on all changed words, and grep for anything that might be on WORD_LIST
git diff --word-diff | grep -E '\{\+('${WORD_LIST}')\+\}'


if [ $? = 0 ]; then exit 1; fi

# Next steps

# have a flag to print warning instead of failing
# (also, build a "failure"), right now it's just echoing "FAILURE" -> should exit N
# status quo: run an exit with the last command's output ?

## Possible options / flags

# - warn on existing content
# - enable feeding a custom word list into the file
