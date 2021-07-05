#!/bin/bash

OUT_DIR="release/tmp"

DATE=$(date +"%m/%d/%Y")

SERVERVERSION="3.1.0"
TERRAFORMVERSION="0.15.4"
KUBECTLVERSION="1.19"
HELMVERSION="3.4.0"
KOTSVERSION="1.44.1"

COMMENT="FINAL"

# Build Overview
echo "Building Server Overview..."
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${VERSION} -a revremark=${COMMENT} -a serverversion=${SERVERVERSION} -a terraformversion=${TERRAFORMVERSION} -a kubectlversion=${KUBECTLVERSION} -a helmversion=${HELMVERSION} -a kotsversion=${KOTSVERSION}  -D ${OUT_DIR} -o CircleCI-Server-${VERSION}-Overview.pdf jekyll/_cci2/_server-3-overview.adoc
echo "Done!"

# Build Ops Guide
echo "Building Server Operations Guide..."
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${VERSION} -a revremark=${COMMENT} -a serverversion=${VERSION} -a terraformversion=${TERRAFORMVERSION} -a kubectlversion=${KUBECTLVERSION} -a helmversion=${HELMVERSION} -a kotsversion=${KOTSVERSION} -D ${OUT_DIR} -o CircleCI-Server-${VERSION}-Operations-Guide.pdf jekyll/_cci2/_server-3-ops-guide.adoc
echo "Done!"

# Build Install Guide
echo "Building Server Installation Guide..."
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme-install.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${VERSION} -a revremark=${COMMENT} -a serverversion=${VERSION} -a terraformversion=${TERRAFORMVERSION} -a kubectlversion=${KUBECTLVERSION} -a helmversion=${HELMVERSION} -a kotsversion=${KOTSVERSION} -D ${OUT_DIR} -o CircleCI-Server-${VERSION}-Installation-Guide.pdf jekyll/_cci2/_server-3-install-guide.adoc
echo "Done!"
