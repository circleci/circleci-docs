HUGO_VERSION=0.16
HUGO_DOWNLOAD=hugo_${HUGO_VERSION}_linux-64bit.tgz

set -x
set -e

# Install Hugo if not already cached or upgrade an old version.
if [ ! -e ~/bin/hugo ] || ! [[ `hugo version` =~ v${HUGO_VERSION} ]]; then
  wget https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/${HUGO_DOWNLOAD}
  tar xvzf ${HUGO_DOWNLOAD} -C ~/bin/
fi
