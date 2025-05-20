---
term: Docker Layer Caching
---

The CircleCI Docker Layer Caching feature allows builds to reuse Docker image layers from previous builds. Image layers are stored in separate volumes in the cloud and are not shared between projects. Layers may only be used by builds from the same project. For additional information about how the secure environment is created, see the [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching/) and [Running Docker Commands]({{ site.baseurl }}/2.0/building-docker-images/) documents. 
