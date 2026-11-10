---
title: Reading the Durable Streams and SlateDB specs
description: I read the Durable Streams DRAFT and SlateDB's specs separately, for what each guarantees and what it leaves to implementers. I'm excited by SlateDB's specs.
pubDate: 2026-11-30
tags: [lakebase, lakebase-series, durable-streams, slatedb, electric]
draft: true
---

*Lakebase, part 5 of 5.* Two close reads, kept apart: what a DRAFT protocol guarantees versus what it only permits, and why I'm excited by SlateDB's specs.

Lakebase is managed Postgres on Databricks. Lakebase Postgres is one engine on two surfaces, Databricks Lakebase and Neon.com ([Databricks docs](https://docs.databricks.com/aws/en/oltp/projects)). Electric, which makes a Postgres sync engine and PGlite, is now part of Databricks ([Electric, 2026-08-11](https://electric.ax/blog/2026/08/11/electric-joining-databricks)). Everything is as of 2026-10-19, and [Part 1](/articles/lakebase-hop-by-hop/) has the whole map.

Durable Streams is an open project from Electric ([GitHub](https://github.com/durable-streams/durable-streams)). SlateDB is an open project that stays under the Commonhaus Foundation, with Responsive among its listed adopters ([SlateDB README](https://github.com/slatedb/slatedb)). Responsive joined Databricks in October 2026 ([Responsive](https://www.responsive.dev/)). They're separate projects, and I read them separately.

## A log with a URL

Electric's post calls a Durable Stream "a persistent, addressable, append-only log with its own URL", delivered over standard HTTP ([Electric, 2026-04-08](https://electric.ax/blog/2026/04/08/data-primitive-agent-loop)). The protocol spec says it more plainly. A stream is "A URL-addressable, append-only byte stream", and its bytes are "durable and immutable by position" ([PROTOCOL.md](https://github.com/durable-streams/durable-streams/blob/main/PROTOCOL.md)). You append to a URL, and you read from the same URL.

I should say exactly what I read, because it limits everything below. The spec labels itself DRAFT, Version 1.0, dated "2025-01-XX". I read the producer, offset, fork and retention sections on the main branch, on 2026-10-19, and not the whole file. It isn't a description of any one server.

The Databricks pages I retrieved up to 2026-10-19 don't name Durable Streams as a Lakebase component ([the Databricks announcement](https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes) names PGlite and Electric's sync engine), so I'm reading it as a protocol on its own terms. I'm not reading it as Lakebase's agent-state layer or as its change feed.

The spec has its own idea of what it's for. It calls itself a "foundation for higher-level abstractions such as event sourcing, database synchronization, collaborative editing, AI conversation histories".

## Where it came from, in Electric's words

Electric's post gives the motive in its own words: "[W]e found ourselves wanting to write directly into the back of a shape... What if we could strip out the database" ([Electric, 2026-04-08](https://electric.ax/blog/2026/04/08/data-primitive-agent-loop)). A shape is Electric's unit of sync: one table, with an optional where clause and an optional set of columns ([Electric docs](https://electric.ax/docs/guides/shapes)).

When Electric joined Databricks, it wrote: "Everything Electric has previously open sourced stays open source: Postgres Sync, PGlite, TanStack DB, Durable Streams" ([Electric, 2026-08-11](https://electric.ax/blog/2026/08/11/electric-joining-databricks)). Postgres Sync is Electric's sync engine, and TanStack DB is a client-side data store. That's a licensing statement.

So Durable Streams is an open project of a team now part of Databricks, published open source ([GitHub](https://github.com/durable-streams/durable-streams)).

## What it promises, and what it only permits

Start with offsets. An offset is "An opaque, lexicographically sortable token", unique and strictly increasing ([PROTOCOL.md](https://github.com/durable-streams/durable-streams/blob/main/PROTOCOL.md)). You can sort offsets, but you can't read meaning into them. They are "Persistent... until deletion or expiration", and servers "MAY implement retention policies". The capitals are the spec's keywords:

- MUST is a requirement.
- SHOULD is a strong recommendation a server can still skip.
- MAY is optional.

So "immutable by position" means the bytes at an offset don't change while they exist. Retention can still take them away.

Exactly-once appends are opt-in. The producer rules:

- Your producer sends a producer ID and sequence numbers in headers.
- The server answers a duplicate with `204` (HTTP's "No Content": it already has that append).
- It answers a gap in the sequence with `409` (HTTP's "Conflict").
- A plain `POST` append carries no dedupe guarantee.

The guarantee also depends on the store underneath. Servers "SHOULD commit producer state updates and log appends atomically", and a store that doesn't drops to "at least once across crashes".

That's the protocol. The project's own file-backed store is a separate matter. Its docs say that store doesn't commit the two atomically, and that "The likely failure mode is a false `409`... not duplicate data" ([Durable Streams docs](https://durablestreams.com/deployment)). I like that they wrote that down.

A fork starts from an offset on a source stream and inherits its data up to that offset. How it does that "is an implementation detail" ([PROTOCOL.md](https://github.com/durable-streams/durable-streams/blob/main/PROTOCOL.md)). Forks "MUST NOT inherit idempotent producer state", and "Cross-service forking is not supported".

Storage is the implementation's choice too. The docs list Postgres among the possible backends ([Durable Streams docs](https://durablestreams.com/building-a-server)).

## Why I'm watching the spec

I'd watch Durable Streams, and the reason is in its spec alone. This is my view, from the DRAFT sections I read. A stream has its own URL. Its offsets are tokens you can read from again. Dedupe is opt-in, with a stated condition and a stated fallback. That's a small primitive with clear edges, and the spec is careful to separate what it guarantees from what it leaves to whoever builds a server.

It also left me with three questions I'd now ask of anything that holds an agent's history. Where do I read from after a crash? What does dedupe cover? What can retention take away? Watching it is my interest in a spec, not a forecast of what anyone builds with it.

---

## What I'm excited about in SlateDB's specs

I'm excited by SlateDB, and the reason is in its specs alone. SlateDB says it "ensures a single writer" but "supports multiple readers", and it keeps its data on plain object storage ([slatedb.io](https://slatedb.io/)). My reading is that this leaves no consensus cluster for me to run. Readers and clones start from metadata, without copying data. A writer epoch, a number in that metadata that marks which writer is current, fences out a stale writer. It ships bindings under semantic versioning (SemVer). And it stays under the Commonhaus Foundation. All of this comes from public specs, with no inside information, and I haven't seen performance data.

## One writer, many readers, nothing to run

SlateDB is "an OSS embedded key-value database and LSM-engine built on object storage" ([slatedb.io](https://slatedb.io/)). OSS means open source, and an LSM-engine is a log-structured merge-tree storage engine. Embedded means it's a library inside your process, not a server you deploy. Writes land in an in-memory MemTable, which is flushed to object storage as sorted string table files (SSTs). It also supports transactions, snapshots and optimistic concurrency control, under Apache 2.0 ([GitHub](https://github.com/slatedb/slatedb)).

One process writes. Any number of readers can open the same database. A reader attaches to a snapshot by reading the manifest, which is metadata, so attaching copies no data ([RFC 0001](https://raw.githubusercontent.com/slatedb/slatedb/main/rfcs/0001-manifest.md)). A clone starts from a checkpoint of the source database, without copying its data files ([clones design](https://slatedb.io/docs/design/clones/)).

The manifest is where the writer epoch lives, and that is what fences out a zombie writer: an old process that hasn't noticed a newer writer has taken over ([RFC 0001](https://raw.githubusercontent.com/slatedb/slatedb/main/rfcs/0001-manifest.md)). Having no consensus cluster to run is the part I find most appealing (my view).

## What ships, and who's behind it

The core is Rust, with bindings for Go, Java, Node.js and Python. Releases come about every two months, under SemVer. The README guarantees storage-format compatibility between adjacent versions, but not API compatibility yet ([GitHub](https://github.com/slatedb/slatedb)).

As for who: Responsive, which SlateDB lists among its adopters ([SlateDB README](https://github.com/slatedb/slatedb)), joined Databricks in October 2026, and Responsive's announcement says SlateDB stays under the Commonhaus Foundation ([Responsive](https://www.responsive.dev/)). How SlateDB relates to Lakebase, if it does, I can't tell you. Nothing I read says. Commonhaus is a fiscal host for open-source projects, and it describes its own model as "minimum viable governance" ([Commonhaus Foundation](https://github.com/commonhaus/foundation)). I haven't read SlateDB's own governance documents, so "stays under the Commonhaus Foundation" is as far as I can go on who decides.

## Where a SlateDB commit counts

When is a write durable? And what stops an old writer from writing again? I'd keep those two apart.

In Databricks' Lakebase docs, the compute streams its write-ahead log to a group of safekeepers, the servers that hold the log, and "A transaction commits when a quorum of safekeepers acknowledges the WAL record". Pageservers, the servers that turn that log into pages the compute can read, then "asynchronously persist materialized pages to cloud object storage" ([Databricks docs](https://docs.databricks.com/aws/en/oltp/projects/architecture)). [Part 2](/articles/fork-or-follow/) has more on that storage layer.

SlateDB's specs describe a different arrangement. Durability is the object store's. A writer epoch in the manifest fences out a stale writer.

So, two questions:

| Question | Lakebase (Databricks architecture docs) | SlateDB's specs |
|---|---|---|
| Who holds the bytes when a commit is acknowledged? | A quorum of safekeepers | The object store |
| Who keeps a stale writer out? | The Databricks page I read doesn't say | The writer epoch |

I have no latency or throughput figures for either system, so this is about where a commit counts, not how fast. I'm not ranking the two designs.

What I want to read next is how SlateDB's current manifest fencing works on each object store it supports, starting from SlateDB's manifest design document, [RFC 0001](https://raw.githubusercontent.com/slatedb/slatedb/main/rfcs/0001-manifest.md). If you read one thing after this, make it that RFC.

What would you check first?

## Sources

1. Databricks docs, [Lakebase Postgres overview](https://docs.databricks.com/aws/en/oltp/projects)
2. Electric, [Electric is joining Databricks](https://electric.ax/blog/2026/08/11/electric-joining-databricks), 2026-08-11
3. Responsive, [Responsive is joining Databricks](https://www.responsive.dev/), 2026-10-09
4. Electric, [Durable Streams, the data primitive for the agent loop](https://electric.ax/blog/2026/04/08/data-primitive-agent-loop), 2026-04-08
5. Durable Streams, [Protocol specification (PROTOCOL.md), DRAFT](https://github.com/durable-streams/durable-streams/blob/main/PROTOCOL.md), read 2026-10-19
6. Databricks blog, [Electric joins Databricks to bring WASM Postgres to AI agent sandboxes](https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes), 2026-08-11
7. Electric docs, [Shapes](https://electric.ax/docs/guides/shapes)
8. Durable Streams, [GitHub repository](https://github.com/durable-streams/durable-streams)
9. Durable Streams docs, [Building a server](https://durablestreams.com/building-a-server) and [Deployment](https://durablestreams.com/deployment)
10. SlateDB, [slatedb.io](https://slatedb.io/)
11. SlateDB, [GitHub repository and README](https://github.com/slatedb/slatedb)
12. SlateDB, [RFC 0001, manifest design](https://raw.githubusercontent.com/slatedb/slatedb/main/rfcs/0001-manifest.md)
13. SlateDB docs, [Clones (design)](https://slatedb.io/docs/design/clones/)
14. Commonhaus Foundation, [foundation repository](https://github.com/commonhaus/foundation)
15. Databricks docs, [Lakebase architecture](https://docs.databricks.com/aws/en/oltp/projects/architecture), last updated 2026-07-27
