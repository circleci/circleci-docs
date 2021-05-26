#!/bin/bash

OUT_DIR="release/tmp"

DATE=$(date +"%m/%d/%Y")

VERSION="3.0.1"

COMMENT="FINAL"

# Build Overview
echo "Building Server Overview..."
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${VERSION} -a revremark=${COMMENT} -a serverversion=${VERSION} -D ${OUT_DIR} -o CircleCI-Server-${VERSION}-Overview.pdf jekyll/_cci2/_server-3-overview.adoc
echo "Done!"

# Build Ops Guide
echo "Building Server Operations Guide..."
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${VERSION} -a revremark=${COMMENT} -a serverversion=${VERSION} -D ${OUT_DIR} -o CircleCI-Server-${VERSION}-Operations-Guide.pdf jekyll/_cci2/_server-3-ops-guide.adoc
echo "Done!"

# Build Install Guide
echo "Building Server Installation Guide..."
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme-install.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${VERSION} -a revremark=${COMMENT} -a serverversion=${VERSION} -D ${OUT_DIR} -o CircleCI-Server-${VERSION}-Installation-Guide.pdf jekyll/_cci2/_server-3-install-guide.adoc
echo "Done!"
