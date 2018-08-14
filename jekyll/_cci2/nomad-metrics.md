---
layout: classic-docs
title: "Working with Nomad Metrics"
category: [administration]
order: 9
description: "Working with Nomad Metrics"
---

# Configuring Nomad Metrics

Nomad Metrics is a helper service used to collect metrics data from the [Nomad server and clients](https://circleci.com/docs/2.0/nomad/) running on the Services and Builder hosts respectively.  Metrics are collected and sent using the [DogStatsD](https://docs.datadoghq.com/developers/dogstatsd/) protocol and sent to the

## Nomad Metrics Server

The Nomad Metrics container is run on the services host in server mode and requires no additional configuration.

## Nomad Metrics Client

TBD

## Metrics

## --server

Name                                      | Type  | Description
------------------------------------------|-------|-------------
`circle.nomad.server_agent.poll_failure`  | Gauge | 1 if the last poll of the Nomad agent failed; 0 otherwise.  This gauge is set independent of `circle.nomad.client_agent.poll_failure` when nomad-metrics is operating in `--client` and `--server` modes simultaneously.
`circle.nomad.server_agent.jobs.pending`  | Gauge | Total number of pending jobs across the cluster.
`circle.nomad.server_agent.jobs.running`  | Gauge | Total number of running jobs across the cluster.
`circle.nomad.server_agent.jobs.complete` | Gauge | Total number of complete jobs across the cluster.
`circle.nomad.server_agent.jobs.dead`     | Gauge | Total number of dead jobs across the cluster.

- The number of jobs in a terminal state (`complete` and `dead`) will typically increase until Nomad garbage-collects the jobs from its state.

## --client

Name                                                   | Type  | Description
-------------------------------------------------------|-------|-------------
`circle.nomad.client_agent.poll_failure`               | Gauge | 1 if the last poll of the Nomad agent failed; 0 otherwise.
`circle.nomad.client_agent.resources.total.cpu`        | Gauge | (See below)
`circle.nomad.client_agent.resources.used.cpu`         | Gauge | (See below)
`circle.nomad.client_agent.resources.available.cpu`    | Gauge | (See below)
`circle.nomad.client_agent.resources.total.memory`     | Gauge | (See below)
`circle.nomad.client_agent.resources.used.memory`      | Gauge | (See below)
`circle.nomad.client_agent.resources.available.memory` | Gauge | (See below)
`circle.nomad.client_agent.resources.total.disk`       | Gauge | (See below)
`circle.nomad.client_agent.resources.used.disk`        | Gauge | (See below)
`circle.nomad.client_agent.resources.available.disk`   | Gauge | (See below)
`circle.nomad.client_agent.resources.total.iops`       | Gauge | (See below)
`circle.nomad.client_agent.resources.used.iops`        | Gauge | (See below)
`circle.nomad.client_agent.resources.available.iops`   | Gauge | (See below)

- CPU resources are reported in units of MHz.  Memory resources are reported in units of MB.  Disk (capacity) resources are reported in units of MB.
- Resource metrics are scoped to the Nomad node that nomad-metrics has been configured to poll.  Figures from a single nomad-metrics job operating in `--client` mode are _not_ representative of the entire cluster (Though these timeseries may be aggregated by an external mechanism to arrive at a cluster-wide view.)
- All metrics in the `circle.nomad.client_agent.resources` namespace will be accompanied with the following tags when writing to DogStatsD:
  - `drain`: `true` if the Nomad node has been marked as drained; `false`
    otherwise.
  - `status`: One of `initializing`, `ready`, or `down`.
