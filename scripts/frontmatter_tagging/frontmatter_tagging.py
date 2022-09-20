#!/usr/bin/env python3

# This script iterates over our docs and converts the front matter to 
# tags and section tags format

import os
import glob
import sys
import frontmatter
from pathlib import Path
from editfrontmatter import EditFrontMatter

## Select desired markdown and adoc files
docs_paths = (
  '../../jekyll/_cci2/*.md',
  '../../jekyll/_cci2/*.adoc',
  '../../jekyll/_cci2_ja/*.md',
  '../../jekyll/_cci2_ja/*.adoc',
)

def iterate_docs():
    # make temp directory to pull new data from
    if not os.path.exists('tmp'):
      os.mkdir('tmp')

    files = []
    # iterate over selected folders
    for path in docs_paths:
        files.extend(glob.glob(path))

    for file in files:
      path = Path(file)
      post = frontmatter.load(path)
      keys = post.keys()
      
      version = None ### Test case version needs to be reset to not be version from previous run
      if post.get('version') is not None: ### Test case version will be deleted need to store it
        version = post['version']

      if not os.path.exists('tmp/' + str(path.parent.name)): ## Test case file directory could expand e.g _cci2_ko
        os.mkdir('tmp/' + str(path.parent.name))

      # location to store new versions of each file
      tmpPath = 'tmp/' + str(path.parent.name) + '/'+ str(Path(path).stem) + str(Path(path).suffix)

      if version is not None: ### Test case file has version frontmatter
        template_str = ''.join(open(os.path.abspath("frontmatter_template_tags.j2"), "r").readlines())
        proc = EditFrontMatter(file_path=path, template_str=template_str)
        proc.keys_toDelete = ['version']
        proc.run()
        proc.run({'addedVariable': version})
        with open(tmpPath, 'w') as f:
          print(proc.dumpFileData(), file=f)
      else: ### Test case file has no front matter and file does not have version frontmatter
        post.__setitem__('tags', None)
        post.__setitem__('sectionTags', None)
        with open(tmpPath, 'w') as f:
          print(frontmatter.dumps(post), file=f)

      # This is a work around of EditFrontMatter not encoding japanese characters properly
      # We rewrite the file with frontmatter that does encode japanese correctly
      post = frontmatter.load(tmpPath)
      with open(tmpPath, 'w') as f:
        print(frontmatter.dumps(post), file=f)


iterate_docs()
