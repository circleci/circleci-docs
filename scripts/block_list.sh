#!/usr/bin/env bash
set -euo pipefail

# gather the list of words that are on the bocklist and join them together to be
# used as a regex.


WORD_LIST=$(cat ${BLOCKED_WORDS:-words.txt} | tr -s '[:space:]' '|' | sed 's/|$//g')


# search proposed changes for use of blocked words.
search_git_diff() {
    # TODO: can we make the grep case-insensitive?
    echo "Searching proposed changes for blocked words..."
    git diff --word-diff | grep -i -E '\{\+('${WORD_LIST}')\+\}'

    if [ $? = 0 ] && [ ${DISABLE_WORD_BLOCKLIST:-false} == "true" ]
    then
        echo "\n⚠️ Warning - Blocklist words found in changes."  1>&2
    else
        echo "\n❌ Failing - Blocklist words found in changes." 1>&2
        exit 1
    fi
}


# default case - get the count of instances of blocked words found.
search_all() {
    echo "Searching project for blocked words: ${WORD_LIST}"
    # TODO: be able to provide your own path.
    SEARCH_RESULTS=`grep -i -r -E -o '('${WORD_LIST}')' ../jekyll | wc -l`
    # echo `grep -i -r -E -o '('${WORD_LIST}')' ../jekyll | wc -l`

    if [ "$SEARCH_RESULTS" -gt '0' ]
    then
        echo "${SEARCH_RESULTS} found."
    fi

    if [ $? = 0 ]
    then
        echo "\n⚠️ Warning - Blocklist words found in changes..." 1>&2
    fi
}

echo "Searching for occurrences of blocked words in changes...\n"
#TODO: print out "Looking for instances of blocked words as provided from ${BLOCKED_WORDS}"

# TODO: enable choosing which function to run (git diff vs entire code base.)
# search_git_diff
search_all


## TODO:
# - Document what the environment variables are (what the API is)
# NEXT:
# - make it possible so there is a (option) flag that makes it so that the script
#   just runs locally printing to the console the instances of each word.
# - use grep -o
#
# Basic use case:
# - a script that runs every build.
# - tell user what file you are using to run the block list script on.
# - tells me a list of blocked words in use and where on new content.
# - we always want to grep the entire project but only *warn* on it (so we'll always have a step that scans the whole repo)
# - we definitely grep a git diff and then could either
# - a) fail on it
# - b) warn on it.
