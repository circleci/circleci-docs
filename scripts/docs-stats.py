#!/usr/bin/env python3

### Docs Stats --

# This script iterates over our docs and checks the last time each file was updated.
# On completion, it should print out a table of files from least-recently updated to most recently.

import os
import glob
from pathlib import Path

updated_docs_metadata = []

docs_paths = (
    '../jekyll/_cci2/*.md',
    '../jekyll/_cci2/*.adoc',
    '../jekyll/_cci2_ja/*.md',
    '../jekyll/_cci2_ja/*.adoc',
)

def create_document_metadata(file_name, last_updated, last_updated_ts, file_path, file_dir):
    """Create a dict of metadata for each file; 
    a list of these dict are stored in updated_docs_metadata"""
    f = {
        "last_updated": last_updated,
        "last_updated_ts": last_updated_ts,
        "file_name": file_name,
        "file_path": file_path,
        "file_dir": file_dir

    }
    return f


def iterate_docs():
    """retrieve data on each doc using git and store in a global list."""
    print("Checking last time updated...")
    # for file in list(glob.glob('../jekyll/**/*.md')): # figure out why **/ glob is not working.
    files = []
    for path in docs_paths:
        files.extend(glob.glob(path))


    for file in files:
        relative_date = os.popen('git log -1 --date=relative --format="%ad" -- ' + file).read()
        epoch_date    = os.popen('git log -1 --format="%ct" -- ' + file).read()
        fpath         = Path(file)
        file_name     = str(fpath.stem)
        file_dir      = str(fpath.parent.name)
        name          = file_name + str(fpath.suffix)
        doc_data      = create_document_metadata(name, relative_date, epoch_date, file, file_dir)

        updated_docs_metadata.append(doc_data)


def print_docs_table():
    print ("{:<4} | {:<9} | {:<50} | {:<20}".format('#', 'Dir', 'File','Last Updated'))
    print ("----------------------------------------------------------------------------------")
    for index, doc in enumerate(updated_docs_metadata):
        print ("{:<4} | {:<9} | {:<50} | {:<20}".format(index, doc['file_dir'], doc["file_name"], doc["last_updated"].rstrip()))

def sort_by_date():
    updated_docs_metadata.sort(key = lambda i: (i['file_dir'], i['last_updated_ts']))


# -------

iterate_docs()
sort_by_date()
print_docs_table()
