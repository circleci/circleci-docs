#!/usr/bin/env bash
set -uo pipefail

# This script greps for the use of blocklisted words.
# It can either:
# # a) grep for blocked words in proposed changes (looks at git diff of proposed changes).
# # b) grep recursively through a provided folder.
#
# NOTE:
# - if `git-diff` doesn't find anything it exits with an exit-code of 1;
#   since we want the script to continue, we are not using `set -e`

#   -- Usage -------------------------------------------------------------------
#   Environment variables that determine how the script operates.
#
##  BL_BLOCKED_WORDS          - <string> - name of a .txt file where blocklisted words should be stored, one per line. Defaults: blocklist.txt
##  BL_DISABLE_WORD_BLOCKLIST - <bool>   - determines whether the script fails (exit 1) on finding blocklisted words.
##  BL_PATH                   - <string> - path to recursively search. If used, the script will search by folder, not by git diff.
##  BL_GIT_DIFF               - <bool>   - causes script to search the git diff only.
##
##  -- Examples --
##
##  # Search all files in ../Jekyll, assuming you have a 'blocklist.txt' file where the script is run:
##  BL_PATH=../jekyll block_list.sh
##
##  # Search the git diff of proposed changes, using 'my_block_list.txt'
##  BL_GIT_DIFF=true BL_BLOCKED_WORDS=my_block_list.txt block_list.sh


BL_PATH="${BL_PATH:=$(pwd)}"
COL_TEXT='\033[40;32m'
NC='\033[0m' # No Color

# Start by cat'ing the blocklist and joining all blockwords to be used as a regex.
# We ignore the output of cat if the blocklist is not found, as the following error message handles this.
{ WORD_LIST=$(cat ${BL_BLOCKED_WORDS:-blocklist.txt} | tr -s '[:space:]' '|' | sed 's/|$//g');   } 2>/dev/null

if [ "$?" == "1" ]
then
    printf "No blocklist file found."
    printf "Please set the 'BL_BLOCKED_WORDS' environment variables, \nor create a 'blocklist.txt' in the directory you run this script."
    exit 0
fi

print_search_results() {
    if [ "$#" -lt 1 ];
    then
        echo "✅️ - No words in blocklist founds in git diff."  1>&2
        exit 0
    else
        if [ "${BL_DISABLE_WORD_BLOCKLIST:-false}" == "true" ]
        then
            printf "\n⚠️  Warning - Blocklisted words found:\n\n" 1>&2
            for i in "$@"; do echo "$i"; done
            exit 0
        else
            printf "\n❌ Blocklisted words found:\n\n" 1>&2
            for i in "$@"; do echo "$i"; done
            exit 1
        fi
    fi
}


# search proposed changes for use of blocked words.
search_git_diff() {
    echo "Searching git diff for blocked words: ${WORD_LIST}"
    printf "\nSearching ${COL_TEXT}git diff${NC} for blocked words: ${WORD_LIST}...\n"
    local SEARCH_RESULTS=`git diff --word-diff | grep -i -E '\{\+('${WORD_LIST}')\+\}'`
    print_search_results $SEARCH_RESULTS
}

# Search specified BL_PATH for a list of files where any blocked words are found.
search_all() {
    printf "\nSearching ${COL_TEXT} ${BL_PATH} ${NC} recursively for blocked words: ${WORD_LIST}...\n"
    # Recursively (-r) search the dir, prints only the matching (-o), with a regex based on the wordlist.
    local SEARCH_RESULTS=`grep -i -r -E -o '('${WORD_LIST}')' "${BL_PATH}"`
    print_search_results $SEARCH_RESULTS
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

# Future updates
## - TODO: restrict file types.
## - TODO: ignore dir paths?
