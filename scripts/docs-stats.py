#!/usr/bin/env python3

### Docs Stats --

# This script iterates over our docs and checks the last time each file was updated.
# On completion, it should print out a table of files from least-recently updated to most recently.

import os
import glob
from pathlib import Path

updated_docs_metadata = []


def create_document_metadata(file_name, last_updated, last_updated_ts, file_path):
    """Create a dict of metadata for each file; 
    a list of these dict are stored in updated_docs_metadata"""
    f = {
       "last_updated": last_updated,
       "last_updated_ts": last_updated_ts,
       "file_name": file_name,
       "file_path": file_path
    }
    return f


def iterate_docs():
    """retrieve data on each doc using git and store in a global list."""
    print("Checking last time updated...")
    for file in list(glob.glob('../jekyll/_cci2/*.md')): # figure out why **/ glob is not working.
        relative_date = os.popen('git log -1 --date=relative --format="%ad" -- ' + file).read()
        epoch_date    = os.popen('git log -1 --format="%ct"' + file).read()
        file_name     = Path(file).stem
        doc_data      = create_document_metadata(file_name, relative_date, epoch_date, file)

        updated_docs_metadata.append(doc_data)


def print_docs_table():
    for doc in updated_docs_metadata:
        print ("{:<40} {:<20}".format(doc["file_name"], doc["last_updated"].rstrip()))

## --

iterate_docs()
print_docs_table()