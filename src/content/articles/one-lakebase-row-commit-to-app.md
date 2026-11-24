---
title: "One Lakebase row, from commit to warehouse to app"
description: "I follow one Lakebase row to the warehouse and out to an app, on Databricks Lakebase and Neon.com, and ask who checks each read. Status as of 2026-11-24."
pubDate: 2026-11-24
tags: [lakebase, lakebase-series, postgres, databricks, neon, unity-catalog, logical-replication]
draft: false
blygId: 4gfc5q43h099kz73rwm3yswr94
---

*Lakebase, part 3 of 5.* I commit one row. Where does it go, and who checks each read?

Lakebase is managed Postgres on Databricks: one engine, Lakebase Postgres, on two surfaces, Databricks Lakebase and Neon.com. [Part 1](/articles/lakebase-hop-by-hop/) drew the whole map. This part follows a single row across it, the way you'd trace one ray from source to receiver instead of staring at the whole gather. Status claims are as of 2026-11-24.

## Where the commit lands

The row's first stop isn't a disk. The compute doesn't write its write-ahead log (WAL) to a local filesystem. It streams the WAL to a storage layer, and the transaction commits when a quorum of safekeepers, the storage nodes that hold and replicate the WAL, acknowledge the record. No single machine's fsync counts ([Lakebase architecture](https://docs.databricks.com/aws/en/oltp/projects/architecture)).

That's also why a read replica *follows* this storage instead of copying it, which is all of [Part 2](/articles/fork-or-follow/).

## Three arrows to and from the warehouse

A naming trap first. On Databricks, "sync" means synced tables, which copy Unity Catalog data into Postgres. It has nothing to do with Electric's sync engine.

- **In, generally available (GA).** Synced tables bring Unity Catalog tables into Postgres ([LTAP overview](https://docs.databricks.com/aws/en/oltp/projects/ltap-overview)).
- **Out, Beta and Preview.** Lakehouse Sync went Beta on 2026-03-12, continuously replicating Lakebase Postgres tables into Unity Catalog Delta tables with change data capture (CDC). Lakebase Change Data Feed went Public Preview on 2026-05-12 ([Lakebase release notes](https://docs.databricks.com/aws/en/release-notes/lakebase)). Nothing says whether that's one feature or two. I think it's one link under two names, and I count it once.
- **In again, now GA.** LTAP Direct Writes speeds up synced-table loads by writing straight to storage. It went Beta on 2026-08-25 and GA on 2026-11-18. It runs lake to Postgres only, so it isn't on my row's way out.

So both GA arrows point into Postgres, and the one that carries my row out is still Preview. No arrow has a published freshness figure. Lakehouse//RT, in Private Preview, reads registered Lakebase data from the warehouse side: it reads the columnar copy, asks Postgres for the current log sequence number (LSN), and merges recent changes from the pageserver. That's a query path, not an arrow, so I leave it off the list.

LTAP (Lake Transactional/Analytical Processing) serves both workloads "from a unified data storage layer in the lake, under one governance model", as a single logical copy. As I read it, that's one logical dataset in two physical forms: Postgres pages for transactional reads, Parquet for analytical engines. Storage transcodes the rows into Parquet's columnar layout as they land in the lake. I found no separate release status for that step.

LTAP also removes the CDC, replication and transformation pipelines teams usually maintain, and "There is no pipeline for you to build". Meanwhile, the out arrow is CDC-based replication. My take: read it as no pipelines *you* build.

Jack Vanlightly's critique of a neighbouring design, zero-copy Kafka-to-Iceberg, belongs here: "You can't sort or cluster the table twice without making a copy of it" ([Vanlightly's post](https://jack-vanlightly.com/blog/2025/10/15/why-im-not-a-fan-of-zero-copy-apache-kafka-apache-iceberg)). Whether that carries over to Postgres pages plus Parquet is open. If it does, two questions follow: who controls the layout of the second form, and where the cost of producing it lands. I'd ask the first one first.

## Out to an app on Databricks Lakebase

On Databricks Lakebase, the documented way to an app is pull. The [Data API](https://docs.databricks.com/aws/en/oltp/projects/data-api) is a PostgREST-compatible REST interface. You send a request, you get rows back, and nothing subscribes or pushes.

The other way a change leaves the database is [logical replication](https://docs.databricks.com/aws/en/oltp/projects/logical-replication), which arrived on 2026-10-15. It:

- streams row-level changes between a Lakebase database and another Postgres database;
- runs over public networking, with no Private Link in either direction;
- runs on the primary compute, not on read replicas.

No consumer other than Postgres is documented.

Electric joined Databricks on 2026-08-11 with an architecture attached: agents in sandboxes with their own Postgres, next to a central Lakebase, and "Sync keeps the two consistent" ([Electric joins Databricks](https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes)). Part 4 checks that architecture hop by hop.

Electric's sync engine runs on Postgres logical replication. It wants a direct connection rather than a pooled one, and a role with the `REPLICATION` attribute. It takes any standard Postgres from version 14, and its provider list names Supabase, Neon, AWS, GCP, DigitalOcean and Crunchy ([Electric deployment guide](https://electric.ax/docs/guides/deployment)). Lakebase isn't on the list, though the list is examples, not a whitelist.

So each piece is documented, and the joint between them isn't. Electric's open sync engine pointed at Databricks Lakebase is not a documented pairing. I found no write-up on whether that direct, `REPLICATION`-role connection works through Lakebase's connection path, and no end-to-end freshness figure.

## Same engine, on Neon.com

On Neon.com, the same engine has live queries. Neon launched Realtime as a public beta on 2026-10-15 ([Neon's launch post](https://neon.com/blog/neon-now-has-realtime)). It's a Neon.com feature: I found it in no Databricks Lakebase doc or release note, and I don't know whether or when it comes to Databricks Lakebase.

Turning Realtime on installs an incremental live-query engine inside Lakebase Postgres. The engine consumes logical replication, and results reach clients over a WebSocket API called Live SQL ([how it works](https://neon.com/docs/realtime/how-it-works)). The incremental work runs on a replica so the primary's write latency, throughput and compute aren't touched. What kind of replica isn't specified.

If the engine sits on a replica, is that replica's replay in front of the logical-replication consumer, between my commit and the live query? Neon doesn't say, and it isn't publishing benchmarks yet.

The writer is covered: `awaitTxId()` uses transaction IDs and the server's progress between batches to know a write has synced. How fresh the row is for every other subscriber isn't documented.

My take: running the work on a replica is a sensible way to protect the primary, and a live-query beta still owes readers a commit-to-view number.

## Who checks each hop

On Neon.com, a backend seals each live query so it can't be forged or modified, and anything holding the sealed query can subscribe: a browser tab, another server, an agent. The beta has no row-level security yet. Sealed queries are short-lived, and clients fetch fresh ones from the backend, but I found no lifetime written down. Is holding a sealed query the same as being allowed to read it? And for how long?

On Databricks Lakebase, "Unity Catalog governance applies today to *analytical* access", meaning external compute such as Change Data Feed reading registered Lakebase data. It "does not yet govern individual Postgres tables directly". Apps that connect to Postgres go through ordinary Postgres `GRANT` and `REVOKE`. Signing in is a separate layer, and OAuth tokens expire after one hour ([Lakebase API guide](https://docs.databricks.com/aws/en/oltp/projects/api-usage)).

My take: the definition says "one governance model", and the status list beside it describes two checks today. Believe the status list. Which check governs an app reading a synced table? From that split I'd expect a Postgres grant, but that's my inference. And who enforces on a query that joins both sides? I couldn't find it written down.

## What I'd test before trusting it

Three things, all on the Databricks side.

1. The out arrow. Change Data Feed and Lakehouse Sync are Preview and Beta, with no published semantics or freshness. Before you build on them, measure commit-to-Delta yourself. I would.
2. The replication path to anything that isn't Postgres: primary compute, public network, and a consumer nobody documents. Test that one end to end before you draw it on a diagram.
3. The crossings between the Postgres side and the Unity Catalog side. Read one synced table as a Postgres role and through Unity Catalog, revoking the Postgres `GRANT` and the Unity Catalog grant one at a time. Then run a query that joins both sides as a user holding only one of them. Whichever grant refuses a read governs it.

From the outside, I can't tell whether the undocumented hops are where the engineering bets sit, or whether the docs are running behind Beta and Preview surfaces. Both readings fit what's published. The docs do carry their own staging words: governance applies "today" to analytical access and "does not yet" reach Postgres tables. So my next step is to watch that status list on the LTAP overview, and walk this row again when "today" changes.

## Sources

1. Databricks docs, Lakebase Postgres overview: https://docs.databricks.com/aws/en/oltp/projects
2. Databricks blog, Databricks + Neon (2025-05-14): https://www.databricks.com/blog/databricks-neon
3. Databricks blog, Electric joins Databricks to bring WASM Postgres to AI agent sandboxes (2026-08-11): https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes
4. Databricks docs, Lakebase architecture (last updated 2026-07-27): https://docs.databricks.com/aws/en/oltp/projects/architecture
5. Databricks docs, LTAP overview (last updated 2026-11-20): https://docs.databricks.com/aws/en/oltp/projects/ltap-overview
6. Databricks, Lakebase release notes: https://docs.databricks.com/aws/en/release-notes/lakebase
7. Jack Vanlightly, Why I'm not a fan of zero-copy Apache Kafka-Apache Iceberg (2025-10-15): https://jack-vanlightly.com/blog/2025/10/15/why-im-not-a-fan-of-zero-copy-apache-kafka-apache-iceberg
8. Databricks docs, Lakebase Data API: https://docs.databricks.com/aws/en/oltp/projects/data-api
9. Databricks docs, Lakebase logical replication: https://docs.databricks.com/aws/en/oltp/projects/logical-replication
10. Electric docs, deployment guide: https://electric.ax/docs/guides/deployment
11. Neon blog, Neon now has realtime (2026-10-15): https://neon.com/blog/neon-now-has-realtime
12. Neon docs, Realtime: how it works: https://neon.com/docs/realtime/how-it-works
13. Databricks docs, Lakebase API usage and authentication: https://docs.databricks.com/aws/en/oltp/projects/api-usage
