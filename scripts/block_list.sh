#!/usr/bin/env bash
set -uo pipefail

# This script greps for the use of blocklisted words.
# It can either:
# # a) grep proposed changes by looked at a git diff of proposed changes
# # b) grep recursively through a provided folder.
#
# NOTE:
# - if `git-diff` doesn't find anything it exits with an exit-code of 1;
#   since we want the script to continue, we are not using `set -e`

#   -- API --
#
#   Environment variables that determine how the script operates.
#
##  BL_BLOCKED_WORDS          - <string> - name of a .txt file where blocklisted words should be stored, one per line. Default blocklist.txt
##  BL_DISABLE_WORD_BLOCKLIST - <bool>   - determines whether the script fails (exit 1) on finding blocklisted words.
##  BL_PATH                   - <string> - path to recursively search. If used, the script will search by folder, not by git diff.
##  BL_GIT_DIFF               - <bool>   - causes script to search the git diff only.
##  TODO: restrict file types.

# Start by gathering the list of words that are on the blocklist and join them
# together to be used as a regex.
WORD_LIST=$(cat ${BL_BLOCKED_WORDS:-blocklist.txt} | tr -s '[:space:]' '|' | sed 's/|$//g')
# TODO - handle no word list found.


# search proposed changes for use of blocked words.
search_git_diff() {
    echo "Searching git diff for blocked words: ${WORD_LIST}"
    local SEARCH_RESULTS=`git diff --word-diff | grep -i -E '\{\+('${WORD_LIST}')\+\}'`

    if [ -z "$SEARCH_RESULTS" ]
    then
        echo "✅️ - No words in blocklist founds in git diff."  1>&2
        exit 0
    else
        if [ "${BL_DISABLE_WORD_BLOCKLIST:-false}" == "true" ]
        then
            printf "⚠️  Warning - Blocklisted words found in changes:\n" 1>&2
            echo "$SEARCH_RESULTS"
            exit 0
        else
            printf "❌ Blocklisted words found in changes:\n" 1>&2
            echo "$SEARCH_RESULTS"
            exit 1
        fi
    fi

}


# default case - get the count of instances of all blocked words found.
search_all() {
    printf "\nSearching ${BL_PATH} recursively for blocked words: ${WORD_LIST}...\n"
    # TODO: be able to provide your own path.
    # Recursively (-r) search the dir, prints only the matching (-o), with a regex based on the wordlist.
    local SEARCH_RESULTS=`grep -i -r -E -o '('${WORD_LIST}')' "${BL_PATH}"`

    if [ -z "$SEARCH_RESULTS" ]
    then
        echo "✅️ - No words in blocklist founds in ${BL_PATH}."  1>&2
        exit 0
    else
        if [ "${BL_DISABLE_WORD_BLOCKLIST:-false}" == "true" ]
        then
            echo "⚠️  Warning - Blocklisted words found:" 1>&2
            echo "$SEARCH_RESULTS"
            exit 0
        else
            echo "❌ Blocklisted words found:" 1>&2
            echo "$SEARCH_RESULTS"
            exit 1
        fi
    fi
}


main() {
    if [ "${BL_GIT_DIFF:-false}" == "true" ]
    then
        search_git_diff
    else
        search_all
    fi
}

main

# Basic use case:
# - a script that runs every build.
# - tell user what file you are using to run the block list script on.
# - tells me a list of blocked words in use and where on new content.
# - we always want to grep the entire project but only *warn* on it (so we'll always have a step that scans the whole repo)
# - we definitely grep a git diff and then could either
    # - a) fail on it
    # - b) warn on it.
