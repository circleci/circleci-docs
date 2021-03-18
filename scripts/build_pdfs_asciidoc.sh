#!/bin/bash

OUT_DIR="release/tmp"

DATE=$(date +"%m/%d/%Y")

VERSION="3.0.0"

COMMENT="FINAL"

echo "Building Ops Guide"

### -- Build the Ops Guide --
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${VERSION} -a revremark=${COMMENT} -a serverversion=${VERSION} -D ${OUT_DIR} -o CircleCI-Server-Operations-Guide.pdf jekyll/_cci2/_ops-guide.adoc

echo "Done!"

echo "Building Install Guide"

### -- Build the AWS Install Guide --
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme-install.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${VERSION} -a revremark=${COMMENT} -a serverversion=${VERSION} -D ${OUT_DIR} -o CircleCI-Server-Installation-Guide.pdf jekyll/_cci2/_install-guide.adoc

echo "Done!"
