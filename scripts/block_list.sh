#!/usr/bin/env bash
set -euo pipefail

# gather the list of words that are on the bocklist and join them together to be
# used as a regex.


export WORD_LIST=$(cat ${BLOCKED_WORDS:-words.txt} | tr -s '[:space:]' '|' | sed 's/|$//g')


# search proposed changes for use of blocked words.
search_git_diff() {
    # TODO: can we make the grep case-insensitive?
    git diff --word-diff | grep -E '\{\+('${WORD_LIST}')\+\}'

    if [ $? = 0 ] && [ ${DISABLE_WORD_BLOCKLIST:-false} == "true" ]
    then
        echo "\n⚠️ Warning - Blocklist words found in changes."
        exit 0
    else
        echo "\n❌ Failing - Blocklist words found in changes."
        exit 1
    fi
}


# search existing content for blocked words.
# search_all() {
#     echo "Searching entire folder for blocked words..."
#     # TODO
# }


echo "Searching for occurrences of blocked words in changes...\n"
search_git_diff


## Possible options / flags
# - warn on existing content
# - enable feeding a custom word list into the file

