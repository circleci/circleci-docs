# Ignore ALL /docs/
ELEVENTY_IGNORE_DOCS=true

# Only ignore /docs/android/
ELEVENTY_IGNORE_ANDROID=true

# Only ignore /docs/apps/
ELEVENTY_IGNORE_APPS=true

# Only ignore /docs/devtools/
ELEVENTY_IGNORE_DEVTOOLS=true

# Only ignore /docs/extensions/
ELEVENTY_IGNORE_EXTENSIONS=true

# Only ignore /docs/handbook/
ELEVENTY_IGNORE_HANDBOOK=true

# Only ignore /docs/lighthouse/
ELEVENTY_IGNORE_LIGHTHOUSE=true

# Only ignore /docs/multidevice/
ELEVENTY_IGNORE_MULTIDEVICE=true

# Only ignore /docs/native-client/
ELEVENTY_IGNORE_NACL=true

# Only ignore /docs/privacy-sandbox/
ELEVENTY_IGNORE_PRIVACY_SANDBOX=true

# Only ignore /docs/versionhistory/
ELEVENTY_IGNORE_VERSIONHISTORY=true

# Only ignore /docs/webstore/
ELEVENTY_IGNORE_WEBSTORE=true

# Only ignore /docs/workbox/
ELEVENTY_IGNORE_WORKBOX=true

# Ignore BLOG /blog/
ELEVENTY_IGNORE_BLOG=true
