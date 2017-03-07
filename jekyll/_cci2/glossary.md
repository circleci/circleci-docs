---
layout: classic-docs2
title: "Glossary"
short-title: "Glossary"
categories: [configuring-jobs]
order: 5000
---

### **executor**
Defines an underlying technology to run a build. Can be `docker` or `machine`. [Learn more]({{ site.baseurl }}/2.0/executor-types).

### **job space**
All the containers (VMs) running by an [executor](#executor) for a current job.

### **main container**
A place where build commands executes for Docker Executor (first image listed in config).

### **Remote Docker**
Feature enabling building, running and pushing images into Docker Registries within a Docker [executor](#executor). [Learn more]({{ site.baseurl }}/2.0/remote-docker).
