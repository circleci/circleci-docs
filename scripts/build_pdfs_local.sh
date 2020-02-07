#!/bin/bash

OUT_DIR="release/tmp"

DATE=$(date +"%m/%d/%Y")

VERSION="2.18.3"

COMMENT="TESTING-REUSABLE"

echo "Building Ops Guide"

### -- Build the Ops Guide --
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a revdate=${DATE} -a revnumber=${VERSION} -a revremark=${COMMENT} -a serverversion=${VERSION} -D ${OUT_DIR} -o CircleCI-Server-Operations-Guide.pdf jekyll/_cci2/_ops-guide.adoc

echo "Done!"

echo "Building AWS Install Guide"

### -- Build the AWS Install Guide --
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme-install.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a revdate=${DATE} -a revnumber=${VERSION} -a revremark=${COMMENT} -a serverversion=${VERSION} -D ${OUT_DIR} -o CircleCI-Server-AWS-Installation-Guide.pdf jekyll/_cci2/_aws-install.adoc

echo "Done!"
