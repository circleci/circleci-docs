#!/bin/bash

OUT_DIR="release/tmp"

DATE=$(date +"%m/%d/%Y")

SERVERVERSION="4.0"
TERRAFORMVERSION="0.15.4"
KUBECTLVERSION="1.19"
HELMVERSION="3.4.0"

COMMENT="FINAL"

# Build Overview
echo "Building Server Overview..."
asciidoctor-pdf -v
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${SERVERVERSION} -a revremark=${COMMENT} -a serverversion=${SERVERVERSION} -a terraformversion=${TERRAFORMVERSION} -a kubectlversion=${KUBECTLVERSION} -a helmversion=${HELMVERSION} -D ${OUT_DIR} -o CircleCI-Server-${VERSION}-Overview.pdf jekyll/_cci2/server/_server-4-overview.adoc
echo "Done!"

# Build Ops Guide
echo "Building Server Operations Guide..."
asciidoctor-pdf -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${SERVERVERSION} -a revremark=${COMMENT} -a serverversion=${SERVERVERSION} -a terraformversion=${TERRAFORMVERSION} -a kubectlversion=${KUBECTLVERSION} -a helmversion=${HELMVERSION} -D ${OUT_DIR} -o CircleCI-Server-${VERSION}-Operations-Guide.pdf jekyll/_cci2/server/_server-4-ops-guide.adoc
echo "Done!"

# Build Install Guide for GCP
echo "Building Server Installation Guide for GCP..."
asciidoctor-pdf -a env-gcp=true -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme-install.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${SERVERVERSION} -a revremark=${COMMENT} -a serverversion=${SERVERVERSION} -a terraformversion=${TERRAFORMVERSION} -a kubectlversion=${KUBECTLVERSION} -a helmversion=${HELMVERSION} -D ${OUT_DIR} -o CircleCI-Server-${VERSION}-GCP-Installation-Guide.pdf jekyll/_cci2/server/_server-4-install-guide-gcp.adoc
echo "Done!"

# Build Install Guide for AWS
echo "Building Server Installation Guide for AWS..."
asciidoctor-pdf -a env-aws=true -a pdf-style=jekyll/_cci2/_release-pdf/circle-theme-install.yml -a pdf-fontsdir=jekyll/_cci2/_release-pdf/fonts -a skip-front-matter -a pdf=true -a revdate=${DATE} -a revnumber=${SERVERVERSION} -a revremark=${COMMENT} -a serverversion=${SERVERVERSION} -a terraformversion=${TERRAFORMVERSION} -a kubectlversion=${KUBECTLVERSION} -a helmversion=${HELMVERSION} -D ${OUT_DIR} -o CircleCI-Server-${VERSION}-AWS-Installation-Guide.pdf jekyll/_cci2/server/_server-4-install-guide-aws.adoc
echo "Done!"