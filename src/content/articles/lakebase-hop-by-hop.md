---
title: "Lakebase hop by hop: I think Electric's a good bet"
description: "A dated hop-by-hop status map of Lakebase Postgres on Databricks Lakebase and Neon.com, and my labelled view that Electric is a good bet on Databricks' premise."
pubDate: 2026-11-02
tags: [lakebase, lakebase-series, postgres, databricks, electric, agents]
draft: true
---

*Lakebase, part 1 of 5.* My take, up front: I think Electric is a good bet for Databricks, on Databricks' own premise. The map that earns it follows, every hop dated.

Lakebase is managed Postgres on Databricks. Lakebase Postgres is one engine on two surfaces, [Databricks Lakebase and Neon.com](https://docs.databricks.com/aws/en/oltp/projects). Databricks says ["Lakebase Postgres is also available on the Neon.com platform"](https://docs.databricks.com/aws/en/oltp/projects). Databricks' agreement with Neon was [announced on 2025-05-14](https://www.databricks.com/blog/databricks-neon). Electric, which makes a Postgres sync engine and PGlite, [joined Databricks on 2026-08-11](https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes), and [Responsive](https://www.responsive.dev/) joined in October 2026. Everything below is as of 2026-10-19, from public sources that are almost all published by the vendors.

## The write lands

Say you commit one row to a Lakebase Postgres database, which Databricks describes as ["a fully managed Postgres database integrated into the Databricks platform"](https://docs.databricks.com/aws/en/oltp/projects). I want to follow it everywhere the public docs say it can go, and tag each hop with what the record says: documented, Beta or Preview, announced, or not documented in anything I read. I read the AWS docs.

## Durable before it reaches the lake

Databricks documents this hop for Lakebase on its [Lakebase architecture](https://docs.databricks.com/aws/en/oltp/projects/architecture) page. Postgres streams its write-ahead log (WAL) to safekeepers, the nodes that hold the log, and "A transaction commits when a quorum of safekeepers acknowledges the WAL record". The compute "owns no durable data". Pageservers, the storage servers, rebuild pages from that log and "asynchronously persist materialized pages to cloud object storage", so the commit never waits on a page write. Part 5 reads two open specs, Durable Streams and SlateDB, for what each one guarantees about durability.

## Copies off the trunk (fork or follow)

Because the storage is shared, the [architecture page](https://docs.databricks.com/aws/en/oltp/projects/architecture) describes Lakebase's copies as computes attached to that storage, not as copies of the data. A read replica is a read-only compute on the same storage, so "replicas need no data copies". A branch is "a copy-on-write metadata operation against shared storage". In [Neon's documented architecture](https://neon.com/docs/introduction/branching), creating one "does not increase load on the parent branch or affect it in any way".

The cost lives in the second verb. In [Neon's documented architecture](https://neon.com/docs/introduction/branching), a fork costs the delta storage it builds up as it diverges, inside Neon's history retention windows. A follower costs lag, because it replays the log to catch up. Postgres 19 even has a command for that gap: [`WAIT FOR LSN`](https://github.com/neondatabase/website/blob/main/content/postgresql/postgresql-19/monitoring-operations.md) blocks until replay reaches a commit you captured (LSN: log sequence number). That's a Postgres feature, not one I found documented for Lakebase, and I found no measured replica lag for Lakebase either.

Databricks' own worked example of a fork is a [Lakebase branch per coding agent](https://www.databricks.com/blog/lakebase-and-agentic-sdlc-branching-databases-coding-agents). Each Git worktree gets its own copy-on-write database branch. Branches "are not merged back to the main branch", and schema changes are promoted through migrations. These are coding agents in the development loop, and the post gives no release status for branching. Part 2 is about why the two verbs cost different things.

## Into the lakehouse

Here the row has choices, and the docs are honest about which ones are finished. The [LTAP overview](https://docs.databricks.com/aws/en/oltp/projects/ltap-overview) defines LTAP, Lake Transactional/Analytical Processing, as serving transactional and analytical workloads "from a unified data storage layer in the lake, under one governance model". Its status list is more modest than the definition.

The generally available (GA) arrows point into Postgres:

- Unity Catalog registration and synced tables, which copy Unity Catalog tables into Postgres: GA.
- LTAP Direct Writes for synced tables, on the same inward path: listed as Beta in the [Lakebase release notes](https://docs.databricks.com/aws/en/release-notes/lakebase).

(On Databricks, "sync" means those synced tables. It isn't the kind of sync Electric does.)

The ways out of Postgres are younger:

- Lakebase Change Data Feed: Public Preview.
- Lakehouse-side querying of Lakebase (Lakehouse//RT): listed as Private Preview.

The docs keep two more things apart, and so will I. Unity Catalog governance [applies today](https://docs.databricks.com/aws/en/oltp/projects/ltap-overview) to analytical access; transactional access is Postgres `GRANT` and `REVOKE`. And no source says which of these surfaces a given row takes, or how fresh it is when it arrives. Part 3 walks this properly.

## Out to an app, on Databricks Lakebase

If you're building an app on Databricks, you can [add a Lakebase database as an Apps resource](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/lakebase). Or you can call the [Data API](https://docs.databricks.com/aws/en/oltp/projects/data-api), a PostgREST-compatible HTTP (REST) interface for Autoscaling projects. The Data API answers when asked. It has no subscriptions and no push.

The other documented way out is [logical replication](https://docs.databricks.com/aws/en/oltp/projects/logical-replication), which streams row-level changes between a Lakebase database and another Postgres database. It runs on the primary compute, over public networking, and Private Link isn't supported. Logical replication arrived in a [release note dated 2026-10-15](https://docs.databricks.com/aws/en/release-notes/lakebase).

Electric describes its sync engine as ["a read-path sync engine for Postgres"](https://electric.ax/docs/intro) that syncs data out into local clients using a primitive called a [Shape](https://electric.ax/docs/guides/shapes), a filtered view of one table. It reads from Postgres logical replication, and its [deployment guide](https://electric.ax/docs/guides/deployment) lists the Postgres providers it supports. Neon is on that list. Lakebase isn't. Pointing Electric's open sync engine at Databricks Lakebase is not a documented pairing, as of 2026-10-19. I found no end-to-end freshness figure for any of these paths.

## A Postgres in the agent's sandbox, as announced

The last hop is the one Databricks has announced rather than documented. The 2026-08-11 post is titled ["Electric joins Databricks to bring WASM Postgres to AI agent sandboxes"](https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes), WASM being WebAssembly, and it describes three tiers in three sentences: "Lakebase delivers Postgres at production scale. PGlite brings WASM Postgres into the agent's own sandbox. Sync keeps the two consistent." It adds "centralizing control in Lakebase Postgres on cheap, durable object storage."

So the outer edge here isn't a browser or a content delivery network (CDN). It's a Postgres running where the agent runs, in Databricks' sense of "sandbox". The announcement's argument is about the agent's working loop: "That inner loop wants data in the same process; the results it produces belong in a durable store."

The pieces exist. PGlite, a WASM build of Postgres, is documented, and so is Electric's read-path sync. The announcement gives no product, date or stock-keeping unit (SKU), and I found none of it documented as a Databricks Lakebase feature, including in the 2026-10-08 branching post.

The way down to the sandbox is the undocumented pairing from the last section. The way up is open between two readings:

- [PGlite's sync docs](https://pglite.dev/docs/sync) say "We don't yet support local writes being synced out, or conflict resolution."
- Electric [documents writes going through the application's API](https://electric.ax/docs/guides/writes), in four patterns.

The announcement doesn't say which of these it means, and I don't know.

What Databricks documents for agents today is a central store: Lakebase-backed [checkpoints](https://docs.databricks.com/aws/en/oltp/projects/state-management) that let you "resume or fork conversations from any checkpoint", and [sessions and memory](https://docs.databricks.com/aws/en/agents/custom-agents/stateful-agents) backed by Lakebase. The branch per coding agent is a different kind of per-agent database, and nothing I read connects it to the sandbox tier.

## Why I think Electric is a good bet

This is my view, not a finding. I think Electric is a good bet for Databricks on Databricks' own premise, that an agent's inner loop wants data in the same process. Nobody outside the vendors tests that premise in anything I read, so it's a bet, and it's mine.

If the premise holds, Electric's pieces add a tier that the Databricks sources I read don't document: a database where the agent runs.

Here's why that appeals to me. In the announced design, PGlite brings "WASM Postgres into the agent's own sandbox", for an inner loop that "wants data in the same process". Lakebase stays the durable store at the centre, and sync keeps the two consistent. It's Postgres at both ends, one dialect from the agent's working copy to the central store. How the agent's writes get back up is still open, as above.

## Where that leaves Databricks in the market

Databricks calls branching ["a safe and flexible foundation for development teams working with coding agents"](https://www.databricks.com/blog/lakebase-and-agentic-sdlc-branching-databases-coding-agents). And many of the vendors in the sources I read describe themselves as "for agents", while the agent-demand figures going around have no independent method behind them that I could find.

My view: Databricks is positioning one engine as both the per-agent copy and the central store, with an announced sync tier between them. When most vendors say "for agents", demand statistics can't tell them apart. The thing I'd watch is the hop I marked in the app section, whether Electric's sync engine against Databricks Lakebase becomes a documented pairing. That's the hop I'll be checking, and Part 4 checks the rest of the stated case.

## Sources

1. Databricks docs, [Lakebase Postgres overview](https://docs.databricks.com/aws/en/oltp/projects)
2. Databricks docs, [Lakebase architecture](https://docs.databricks.com/aws/en/oltp/projects/architecture) (last updated 2026-07-27)
3. Databricks blog, [Neon agreement announcement](https://www.databricks.com/blog/databricks-neon) (2025-05-14)
4. Databricks blog, [Electric joins Databricks to bring WASM Postgres to AI agent sandboxes](https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes) (2026-08-11)
5. Responsive, [Responsive website](https://www.responsive.dev/)
6. Neon docs, [Branching](https://neon.com/docs/introduction/branching)
7. Neon website repository, [Postgres 19 monitoring operations (`WAIT FOR LSN`)](https://github.com/neondatabase/website/blob/main/content/postgresql/postgresql-19/monitoring-operations.md)
8. Databricks blog, [Lakebase and Agentic SDLC: Branching Databases for Coding Agents](https://www.databricks.com/blog/lakebase-and-agentic-sdlc-branching-databases-coding-agents) (2026-10-08)
9. Databricks docs, [LTAP overview](https://docs.databricks.com/aws/en/oltp/projects/ltap-overview)
10. Databricks docs, [Lakebase release notes](https://docs.databricks.com/aws/en/release-notes/lakebase)
11. Databricks docs, [Add a Lakebase resource to a Databricks app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/lakebase)
12. Databricks docs, [Lakebase Data API](https://docs.databricks.com/aws/en/oltp/projects/data-api)
13. Databricks docs, [Lakebase logical replication](https://docs.databricks.com/aws/en/oltp/projects/logical-replication)
14. Electric docs, [Intro](https://electric.ax/docs/intro)
15. Electric docs, [Deployment](https://electric.ax/docs/guides/deployment)
16. PGlite docs, [Sync](https://pglite.dev/docs/sync)
17. Electric docs, [Writes](https://electric.ax/docs/guides/writes)
18. Databricks docs, [Agent state and memory](https://docs.databricks.com/aws/en/oltp/projects/state-management)
19. Databricks docs, [Agent memory and sessions](https://docs.databricks.com/aws/en/agents/custom-agents/stateful-agents)
20. Electric docs, [Shapes](https://electric.ax/docs/guides/shapes)
