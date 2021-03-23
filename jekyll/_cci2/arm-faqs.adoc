---
version:
- Cloud
---
= CircleCI Arm FAQs
:page-layout: classic-docs
:page-liquid:
:icons: font
:toc: macro
:toc-title:

NOTE: CircleCI Arm support is currently in "preview" mode, and therefore has limited functionality. 

This page answers frequently asked questions for CircleCI Arm support.

toc::[]

=== How do I get access to the Arm preview?

To receive access to the CircleCI Arm preview, complete the [Arm Program Request Form](https://form.asana.com/?k=S8EKGU3o66ld_qYXsdOQww&d=5374345383152).

=== What Arm architectures are currently supported?

CircleCI currently only supports Arm 64-bit architectures.

=== What Arm resources are available in the CircleCI preview?

There are two Arm resources available:

* arm.medium - arm64 architecture, 2 vCPU, 8GB RAM
* arm.large - arm64 architecture, 4 vCPU, 16GB RAM

=== Can I use an 'arm.large' resource if I am on the Free Plan?

No, you must be on a Performance or Scale plan in order to use an 'arm.large' resource.

=== Can I use orbs with Arm?

Yes, you can use orbs with Arm, with the exception of Orbs that have executables.

