---
title: Fork or follow, the two verbs under Lakebase
description: "Lakebase branches, restores and read replicas all start as new compute on existing storage; fork or follow sets the cost. From Databricks' architecture docs."
pubDate: 2026-11-09
tags: [lakebase, lakebase-series, postgres, neon, branching, agents]
draft: true
---

*Lakebase, part 2 of 5.* Branch a Lakebase database, restore it or add a read replica, and by Databricks' own architecture docs you get the same trick three times.

Lakebase is managed Postgres on Databricks. Lakebase Postgres is one engine on two surfaces, Databricks Lakebase and Neon.com ([Lakebase Postgres overview](https://docs.databricks.com/aws/en/oltp/projects)). Databricks' agreement with Neon was announced on 2025-05-14 ([Neon agreement announcement](https://www.databricks.com/blog/databricks-neon)). Status claims here are as of 2026-10-19. [Part 1 has the whole map](/articles/lakebase-hop-by-hop/); this is its storage paragraph, at length.

## New compute pointed at old storage

Databricks says Lakebase can "branch an entire database in under a second, regardless of its size" ([Databricks' branching post, 2026-10-08](https://www.databricks.com/blog/lakebase-and-agentic-sdlc-branching-databases-coding-agents)). The category post says "even petabyte-scale databases can be copied in seconds" ([What is a Lakebase?](https://www.databricks.com/blog/what-is-a-lakebase)). Those are vendor claims, and I haven't timed either one.

Nothing gets copied, and that matters more than the speed. Lakebase branches use copy-on-write, so they "share the parent branch data but only consume additional storage as they diverge" ([branching post](https://www.databricks.com/blog/lakebase-and-agentic-sdlc-branching-databases-coding-agents)). Databricks' architecture page calls branching "a copy-on-write metadata operation against shared storage" and says read replicas "need no data copies" because they read from the same storage layer ([Lakebase architecture](https://docs.databricks.com/aws/en/oltp/projects/architecture)).

A copy that isn't a copy has to be something else. On Lakebase, a copy is new compute on old storage: "Multiple compute instances can attach to the same storage layer" ([Lakebase architecture](https://docs.databricks.com/aws/en/oltp/projects/architecture)). What that compute does next decides what it costs.

## The attach, as Databricks documents it

Databricks documents these internals for Lakebase on its [architecture page](https://docs.databricks.com/aws/en/oltp/projects/architecture) (last updated 2026-07-27), so this section cites it. All my sources in this post are vendor docs and vendor blogs. That makes the account checkable, not independently confirmed.

Three pieces matter here:

1. **Writes.** The Postgres compute is stateless. It streams its write-ahead log (WAL), the record of every change, to safekeepers, the servers that hold the log. "A transaction commits when a quorum of safekeepers acknowledges the WAL record". Pages get written afterwards, off the commit path.
2. **Storage.** Pageservers are the servers that turn that WAL into pages the compute can read. They rebuild a page at any requested log sequence number (LSN), which is a position in the log, and persist pages to object storage.
3. **Reads.** A compute looks in memory first, then in a local disk cache, then asks a pageserver. "Queries don't reach object storage directly" ([Lakebase architecture](https://docs.databricks.com/aws/en/oltp/projects/architecture)).

Put those pieces together and storage can answer "what did this page look like at LSN X?" for any position it still keeps. So a new compute can start at a log position on storage that already exists, and branches, restores and replicas all start that way. Calling that one operation is my summary, not the docs' wording, and it covers those three, nothing wider.

Durability is decided below all of this, at the quorum ack. Part 5 reads a spec that decides it somewhere else.

## Fork (branches and restores)

A fork is a new compute at a log position that can write. In Neon's documented architecture, a branch "simply references existing storage layers up to that point" ([Neon's restore deep dive](https://neon.com/blog/pitr-deep-dive)). Neon's branching docs say "Writes to a branch are saved as a delta" and that creating a branch "does not increase load on the parent branch or affect it in any way" ([Neon branching docs](https://neon.com/docs/introduction/branching)). That last claim is one I found no measurement for.

A point-in-time restore is the same move pointed backwards. Databricks describes instant restore as "a new branch from any point in time within your history window" ([Lakebase Postgres overview](https://docs.databricks.com/aws/en/oltp/projects)), and compute attaching to a past point "without copying data back into place" ([Lakebase architecture](https://docs.databricks.com/aws/en/oltp/projects/architecture)). How far back you can go depends on how much history storage keeps. On Neon.com that window is a plan setting: 6 hours on Free, 1 day on paid plans, configurable up to 7 to 30 days ([branching docs](https://neon.com/docs/introduction/branching)). I didn't find the Lakebase window's length in what I read.

On Databricks Lakebase, idle branches "can scale-to-zero, meaning idle branches incur no compute cost" ([Databricks' branching post](https://www.databricks.com/blog/lakebase-and-agentic-sdlc-branching-databases-coding-agents)). And a fork stays a fork: "Lakebase branches are not merged back to the main branch." Schema changes live in code and are "promoted to the parent branch through migrations" (same post).

So a fork's bill is its drift (the delta it writes) plus the history window that bounds where it can start. Cheap to make and cheap to leave lying around.

## Follow (replicas and HA secondaries)

A follower is a new compute that attaches at the primary's current position and stays read-only: a read replica or a high-availability (HA) secondary. Creating one copies nothing. Neon also says a replica can scale to zero "without introducing lag", and that one waking up is "up to date with your primary read-write compute almost instantly" ([Neon read replica docs](https://neon.com/docs/introduction/read-replicas)). That's the vendor's wording, and here's where it gets slippery.

A follower keeps replaying the primary's WAL to stay current, and in Postgres generally an asynchronous replica can trail the primary.

So there are two layers: no data copy at creation, and replay lag for freshness. Neon's line is about a replica waking up. How far a running replica trails the primary stays open: I found no measurement of replay lag on Lakebase.

Upstream Postgres 19 adds `WAIT FOR LSN`, which blocks until replay reaches a commit's LSN ([Neon's `WAIT FOR LSN` page](https://neon.com/postgresql/postgresql-19/monitoring-operations)). Postgres 19 is a release candidate, with general availability planned for 2026-11-19 ([PostgreSQL 19 RC 1 announcement](https://www.postgresql.org/about/news/postgresql-19-rc-1-released-3409/)). It is not a Lakebase feature, but it waits on exactly that gap.

HA is the same verb with a job attached. Databricks' docs describe one primary with one to three secondaries in different availability zones, and separate standalone read replicas ([Lakebase HA docs](https://docs.databricks.com/aws/en/oltp/projects/high-availability)):

| | Sizing | Reads | Failover |
|---|---|---|---|
| HA secondaries | Sized with the primary | Optional, through the primary's `-ro` connection string | Promoted on failure |
| Standalone read replicas | Own sizing | Own endpoint | Don't take part |

The HA docs say Lakebase "monitors primary compute health continuously", triggers failover automatically, and "preserves all committed transactions"; apps with retry logic "reconnect automatically within seconds" ([Lakebase HA docs](https://docs.databricks.com/aws/en/oltp/projects/high-availability)). The architecture page says failover promotes a secondary "that attaches to the existing storage, with no data to move" ([Lakebase architecture](https://docs.databricks.com/aws/en/oltp/projects/architecture)).

My view: the second verb is where the cost lives. A fork costs you what it writes. A follower costs you what it takes to keep up, plus, for a secondary, a standby sized like the primary.

## When a follower keeps compute awake

The frame has an edge, and Databricks documents it. On Lakebase, an active logical-replication subscriber blocks scale-to-zero, and an inactive replication slot is removed after about 40 hours ([Lakebase logical replication docs](https://docs.databricks.com/aws/en/oltp/projects/logical-replication-publication)). That subscriber follows the database in the everyday sense, through a link to something outside, and the link sets the cost: your compute stays up because someone downstream is listening.

Features that move data, like logical replication and synced tables, sit outside the attach frame. Part 3 follows those paths.

## A branch per coding agent

Databricks has one worked use of the fork, in a 2026-10-08 post by Thibaut Gourdel ([Databricks' branching post](https://www.databricks.com/blog/lakebase-and-agentic-sdlc-branching-databases-coding-agents)). Parallel coding agents each get a Git worktree, so their code doesn't collide locally. A post-checkout hook then gives each worktree "its own database branch". In continuous integration (CI), a GitHub Actions workflow uses the Lakebase command-line interface (CLI) to:

1. create a branch "like pr-123";
2. run Drizzle migrations;
3. deploy a preview app on Databricks Apps;
4. post a schema diff.

The hook and the workflows are example-repository code, not product features, and the post gives no release status. The agents are coding agents in the development loop: the checkout is local, the database is a remote Lakebase branch, and nothing merges back.

The post concludes that "database branching provides a safe and flexible foundation for development teams working with coding agents." That's Databricks' positioning, in its words.

My take: I'd give a coding agent a branch before I'd give it a fresh database, because a branch starts from real data and costs only its delta. The other answer is a fresh, empty database per agent, kept small and suspended when idle. I have nothing that ranks the two, so that's a preference, not a finding.

A branch suits a CI run or a developer testing a migration just as well; nothing I read shows it's specific to agents.

The Databricks announcement of the Neon agreement cites agent-created databases on Neon's platform rising from 30% to over 80% (May 2025), but it doesn't define "agent-created" and I found no method, so I'm not using it.

This is a per-agent database of one kind: a remote branch per coding agent. Part 4 is about a different place a database can live: where the agent runs.

When a new feature shows up, I ask where its compute attaches, and whether it forks or follows. If the answer is "neither, it's a link", I go looking for the subscriber, the way Part 3 does for one Lakebase row.

## Sources

1. Databricks docs, [Lakebase Postgres overview](https://docs.databricks.com/aws/en/oltp/projects)
2. Databricks docs, [Lakebase architecture](https://docs.databricks.com/aws/en/oltp/projects/architecture) (last updated 2026-07-27)
3. Databricks blog, [announcement of the Neon agreement](https://www.databricks.com/blog/databricks-neon) (2025-05-14)
4. Databricks blog, [What is a Lakebase?](https://www.databricks.com/blog/what-is-a-lakebase) (2025-06-12, updated 2026-02-24)
5. Databricks blog, [Lakebase and Agentic SDLC: Branching Databases for Coding Agents](https://www.databricks.com/blog/lakebase-and-agentic-sdlc-branching-databases-coding-agents) (2026-10-08)
6. Neon blog, [A Deep Dive Into Neon's Instant PITR](https://neon.com/blog/pitr-deep-dive)
7. Neon docs, [Branching](https://neon.com/docs/introduction/branching)
8. Neon docs, [Read replicas](https://neon.com/docs/introduction/read-replicas)
9. Neon, [PostgreSQL 19 monitoring operations (`WAIT FOR LSN`)](https://neon.com/postgresql/postgresql-19/monitoring-operations)
10. PostgreSQL Global Development Group, [PostgreSQL 19 RC 1 Released!](https://www.postgresql.org/about/news/postgresql-19-rc-1-released-3409/) (2026-10-15)
11. Databricks docs, [High availability](https://docs.databricks.com/aws/en/oltp/projects/high-availability)
12. Databricks docs, [Logical replication publication](https://docs.databricks.com/aws/en/oltp/projects/logical-replication-publication)
