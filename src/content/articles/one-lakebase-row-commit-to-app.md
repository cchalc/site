---
title: "One Lakebase row, from commit to warehouse to app"
description: "One Lakebase row followed to the warehouse and to apps on Databricks Lakebase and Neon.com, each hop dated 2026-10-19, with the check that governs each read."
pubDate: 2026-11-16
tags: [lakebase, lakebase-series, postgres, databricks, neon, unity-catalog, logical-replication]
draft: true
---

*Lakebase, part 3 of 5.* I commit one row. Where does it go, and who checks each read?

Lakebase is managed Postgres on Databricks. Lakebase Postgres is one engine on two surfaces: Databricks Lakebase and Neon.com ([Databricks docs](https://docs.databricks.com/aws/en/oltp/projects)). The Neon agreement was announced on 2025-05-14 ([Databricks + Neon announcement](https://www.databricks.com/blog/databricks-neon)). Electric, which makes a Postgres sync engine and PGlite (Postgres compiled to WebAssembly), joined Databricks on 2026-08-11 ([Electric joins Databricks](https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes)). Everything below is as of 2026-10-19. This part follows one row out of [Part 1](/articles/lakebase-hop-by-hop/)'s map.

## Where the commit lands

Where does it go first?

Databricks documents this hop for Lakebase. The compute doesn't flush its write-ahead log (WAL) to a local disk. It "streams the WAL to the storage layer", and "A transaction commits when a quorum of safekeepers acknowledges the WAL record, not when a single machine finishes a local fsync" ([Lakebase architecture](https://docs.databricks.com/aws/en/oltp/projects/architecture)). Safekeepers are the storage nodes that hold the WAL and replicate it across a quorum.

In that architecture, a read replica *follows* this storage rather than copying it, which is what [Part 2](/articles/fork-or-follow/) is about.

## Three arrows to and from the warehouse

On Databricks, "sync" means synced tables, Unity Catalog data copied into Postgres. It has nothing to do with Electric's sync engine.

- **In, generally available (GA).** Synced tables bring Unity Catalog tables into Postgres. The LTAP (Lake Transactional/Analytical Processing) overview lists them as GA ([LTAP overview](https://docs.databricks.com/aws/en/oltp/projects/ltap-overview)).
- **Out, Beta then Preview.** Lakehouse Sync went Beta on 2026-03-12, described as continuously replicating Lakebase Postgres tables into Unity Catalog Delta tables using change data capture (CDC). Lakebase Change Data Feed went Public Preview on 2026-05-12 ([Lakebase release notes](https://docs.databricks.com/aws/en/release-notes/lakebase)). The docs don't say whether these are one feature or two. I think they're probably one link under two names, and count it once.
- **In again, Beta.** LTAP Direct Writes went Beta on 2026-08-25. It speeds up synced-table loads by writing directly to storage ([Lakebase release notes](https://docs.databricks.com/aws/en/release-notes/lakebase)). It runs lake→Postgres only, so it isn't on my row's way out.

So the only GA arrow points into Postgres, and the arrow that carries my row out is Preview, as of 2026-10-19. Lakehouse//RT, in Private Preview, reads registered Lakebase data from the warehouse side: it reads the columnar copy, asks Postgres for the current log sequence number (LSN) and merges recent changes from the pageserver ([LTAP overview](https://docs.databricks.com/aws/en/oltp/projects/ltap-overview), updated 2026-10-21), so it's a query path, not an arrow, and I leave it off the list. No arrow has a published freshness figure.

Databricks defines LTAP as serving both workloads "from a unified data storage layer in the lake, under one governance model", and the same page promises "a single logical copy" ([LTAP overview](https://docs.databricks.com/aws/en/oltp/projects/ltap-overview)). As I read it, that's one logical dataset kept in two physical forms: Postgres pages for transactional reads, and Parquet for analytical engines. The page says Lakebase storage "transcodes the row-oriented Postgres data into Parquet's columnar layout as the data lands in the lake" ([LTAP overview](https://docs.databricks.com/aws/en/oltp/projects/ltap-overview)). I found no separate release status for that step.

The LTAP page says it "removes the change data capture (CDC), replication, and transformation pipelines that teams traditionally maintain" ([LTAP overview](https://docs.databricks.com/aws/en/oltp/projects/ltap-overview)). Databricks' own release note describes the out arrow as CDC-based replication, though the LTAP page also says "There is no pipeline for you to build". My take: read it as no pipelines *you* build.

Jack Vanlightly's critique of a neighbouring design, zero-copy Kafka-to-Iceberg, belongs next to this: "You can't sort or cluster the table twice without making a copy of it" ([Vanlightly's post](https://jack-vanlightly.com/blog/2025/10/15/why-im-not-a-fan-of-zero-copy-apache-kafka-apache-iceberg)). Whether that transfers to Postgres pages plus Parquet is unresolved. If it does, two questions follow: who controls the layout of the second form, and where the cost of producing it lands. I'd ask the first one first.

## Out to an app on Databricks Lakebase

On Databricks Lakebase, the documented path to an app is pull. The Data API is "a PostgREST-compatible RESTful interface" ([Data API](https://docs.databricks.com/aws/en/oltp/projects/data-api)). You send a request, you get rows back, and nothing on that page subscribes or pushes.

The other way a change leaves the database is logical replication, in a release note dated 2026-10-15 ([Lakebase release notes](https://docs.databricks.com/aws/en/release-notes/lakebase)). The [logical replication docs](https://docs.databricks.com/aws/en/oltp/projects/logical-replication) say it:

- "streams row-level changes between a Lakebase database and another Postgres database";
- "runs over public networking", with no Private Link;
- "runs on the primary compute, not on read replicas".

It documents no consumer that isn't Postgres.

Databricks' Electric announcement describes agents with their own Postgres in a sandbox, next to a central Lakebase, and says "Sync keeps the two consistent" ([Electric joins Databricks](https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes)). Part 4 checks that architecture hop by hop.

Electric's sync engine uses Postgres logical replication. Its deployment guide asks for a direct connection rather than a pooled one, and a role with the `REPLICATION` attribute. Its provider list names Supabase, Neon, AWS, GCP, DigitalOcean and Crunchy ([Electric deployment guide](https://electric.ax/docs/guides/deployment)). Lakebase isn't on that list.

So each part is documented, and the joint between them isn't. Electric's open sync engine pointed at Databricks Lakebase is not a documented pairing, as of 2026-10-19. I found no write-up on whether that direct, `REPLICATION`-role connection works through Lakebase's connection path, and no end-to-end freshness figure.

## Same engine, on Neon.com

On Neon.com, the same engine has a live-query feature. Neon launched Realtime as a public beta on 2026-10-15 ([Neon's launch post](https://neon.com/blog/neon-now-has-realtime)). As of 2026-10-19, it's a Neon.com feature: the launch post introduces it as "live queries for Neon apps", and I found it in no Databricks Lakebase doc or release note. I don't know whether or when Realtime comes to Databricks Lakebase.

On Neon.com, "Enabling Realtime installs an incremental live query engine inside Lakebase Postgres." That engine consumes logical replication, and results reach clients through the Live SQL API, which "is a WebSocket API" ([Neon, how it works](https://neon.com/docs/realtime/how-it-works)). The launch post adds that "the incremental work runs on a replica, so your primary's write latency, write throughput, and compute aren't affected". It doesn't say what kind of replica.

If the engine sits on a replica, is that replica's replay in front of the logical-replication consumer, between my commit and the live query? Neon doesn't say, and it is "not publishing benchmarks yet" ([launch post](https://neon.com/blog/neon-now-has-realtime)).

The writer is covered: `awaitTxId()` uses transaction IDs "along with the server's progress between batches, to know that your write has synced" ([Neon, how it works](https://neon.com/docs/realtime/how-it-works)). How fresh the row is for every other subscriber isn't documented.

My take: running the work on a replica is a sensible way to protect the primary, and a live-query beta still owes readers a commit-to-view number.

## Who checks each hop

On Neon.com, a backend seals each live query, and "a sealed query can't be forged or modified". Then: "Anything that receives the sealed query can subscribe to it, whether that's a browser tab, another server, or an agent" ([launch post](https://neon.com/blog/neon-now-has-realtime)). The beta also lists "No row-level security yet". Is holding a sealed query the same as being allowed to read it, and how does one expire?

On Databricks Lakebase, "Unity Catalog governance applies today to *analytical* access", meaning external compute such as Change Data Feed reading registered Lakebase data. It "does not yet govern individual Postgres tables directly". Apps that connect to Postgres go through "standard Postgres privileges (`GRANT` and `REVOKE`)" ([LTAP overview](https://docs.databricks.com/aws/en/oltp/projects/ltap-overview)). Signing in is a separate layer: OAuth tokens expire after one hour ([Lakebase API guide](https://docs.databricks.com/aws/en/oltp/projects/api-usage)).

My take: the definition says "one governance model", and the status list beside it describes two checks today. Read the status list. Which check governs an app reading a synced table? From the page's own split I'd expect a Postgres grant, but that's my inference. And who enforces on a query that joins both sides? I couldn't find it written down.

## What I'd test before trusting it

Three things, all on the Databricks side.

1. The out arrow. Change Data Feed and Lakehouse Sync are Preview, with no published semantics or freshness. Before you build on them, measure commit-to-Delta yourself. I would.
2. The replication path to anything that isn't Postgres: primary compute, public network, and a consumer the docs don't describe. Test that one end to end before you draw it on a diagram.
3. The crossings between the Postgres side and the Unity Catalog side. Read one synced table as a Postgres role and through Unity Catalog, revoking the Postgres `GRANT` and the Unity Catalog grant one at a time, then run a query that joins both sides as a user holding only one of them. Whichever grant refuses a read governs it.

I can't tell from the outside whether the undocumented hops are where the engineering bets sit, or whether the documentation is running behind Beta and Preview surfaces. Both readings fit what's published, and I can't separate them. The docs carry their own staging words: Unity Catalog governance applies "today" to analytical access and "does not yet" reach Postgres tables. So my next step: watch that status list on the [LTAP overview](https://docs.databricks.com/aws/en/oltp/projects/ltap-overview), and walk this row again when "today" changes.

## Sources

1. Databricks docs, Lakebase Postgres overview: https://docs.databricks.com/aws/en/oltp/projects
2. Databricks blog, Databricks + Neon (2025-05-14): https://www.databricks.com/blog/databricks-neon
3. Databricks blog, Electric joins Databricks to bring WASM Postgres to AI agent sandboxes (2026-08-11): https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes
4. Databricks docs, Lakebase architecture (last updated 2026-07-27): https://docs.databricks.com/aws/en/oltp/projects/architecture
5. Databricks docs, LTAP overview (last updated 2026-10-21): https://docs.databricks.com/aws/en/oltp/projects/ltap-overview
6. Databricks, Lakebase release notes: https://docs.databricks.com/aws/en/release-notes/lakebase
7. Jack Vanlightly, Why I'm not a fan of zero-copy Apache Kafka-Apache Iceberg (2025-10-15): https://jack-vanlightly.com/blog/2025/10/15/why-im-not-a-fan-of-zero-copy-apache-kafka-apache-iceberg
8. Databricks docs, Lakebase Data API: https://docs.databricks.com/aws/en/oltp/projects/data-api
9. Databricks docs, Lakebase logical replication: https://docs.databricks.com/aws/en/oltp/projects/logical-replication
10. Electric docs, deployment guide: https://electric.ax/docs/guides/deployment
11. Neon blog, Neon now has realtime (2026-10-15): https://neon.com/blog/neon-now-has-realtime
12. Neon docs, Realtime: how it works: https://neon.com/docs/realtime/how-it-works
13. Databricks docs, Lakebase API usage and authentication: https://docs.databricks.com/aws/en/oltp/projects/api-usage
