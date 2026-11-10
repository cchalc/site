---
title: Why Electric for Lakebase, checked hop by hop
description: "Databricks' stated case for Electric, a Postgres in the agent's sandbox, checked hop by hop as of 2026-10-19. My labelled view: a good bet, not yet a product."
pubDate: 2026-11-23
tags: [lakebase, lakebase-series, postgres, databricks, electric, pglite, agents, sync]
draft: true
---

*Lakebase, part 4 of 5.* Databricks' stated architecture for agents, one arrow at a time. The way up has two honest readings, and I don't pick one.

Lakebase is managed Postgres on Databricks. Lakebase Postgres is one engine on two surfaces: Databricks Lakebase and Neon.com ([Databricks docs](https://docs.databricks.com/aws/en/oltp/projects)). Electric makes PGlite and a sync engine from Postgres out to clients. It joined Databricks on 2026-08-11: "Electric is now part of Databricks" ([Electric](https://electric.ax/blog/2026/08/11/electric-joining-databricks)). [Part 1](/articles/lakebase-hop-by-hop/) has the whole map; this part zooms into why Electric. Everything here is as of 2026-10-19, from public sources that are almost all vendor-published.

## What the announcement says it's building

Databricks' post about the deal has a title that is also an architecture: "Electric joins Databricks to bring WASM Postgres to AI agent sandboxes" ([Databricks](https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes)). The body draws three tiers: "Lakebase delivers Postgres at production scale. PGlite brings WASM Postgres into the agent's own sandbox. Sync keeps the two consistent."

In the same post, PGlite gives "every agent its own lightweight Postgres right where it runs", and Electric's sync engine "synchronizes distributed state back to a central Lakebase". Those are fragments of one longer passage. The post names no product, date or SKU (a sellable product line) for any of it (that's my reading of the page, not its words).

The premise is Databricks' too: an agent's "inner loop wants data in the same process; the results it produces belong in a durable store."

On Databricks, "sync" usually means synced tables, Unity Catalog tables copied into Lakebase ([Lakebase docs](https://docs.databricks.com/aws/en/oltp/projects)). Here it means Electric's sync engine.

## A Postgres where the agent runs

The agent tier exists. PGlite is the WASM (WebAssembly) Postgres in that sentence, it's published open source, and its docs describe an alpha sync plugin from Postgres into it ([PGlite](https://pglite.dev/docs/sync)). When Databricks says "sandbox" it means the place an agent runs, and PGlite puts a database there. Electric uses the word for something narrower. Databricks Sandbox (Beta) docs, published 2026-10-21, describe hosting agent sessions; as of 2026-10-24 they don't mention PGlite or Lakebase ([Sandbox docs](https://docs.databricks.com/aws/en/compute/serverless/sandbox)).

Databricks already documents a per-agent database, of another kind. Its 2026-10-08 post, "Lakebase and Agentic SDLC: Branching Databases for Coding Agents", describes how copy-on-write branching "gives every agent an isolated database" ([Databricks](https://www.databricks.com/blog/lakebase-and-agentic-sdlc-branching-databases-coding-agents)). Those are coding agents in the development loop, each with a remote Lakebase branch, and the branches "are not merged back to the main branch". That's not a Postgres in the agent's sandbox; [Part 2](/articles/fork-or-follow/) covers it. The in-sandbox tier is not documented in the sources read.

## The way up, two readings

This is the arrow I got stuck on. Say your agent writes to its local PGlite. How does that write get "back to a central Lakebase"? The sources allow two readings, and they don't say which one the announcement means.

**Reading one: nothing carries it yet.** PGlite's sync docs say "We don't yet support local writes being synced out, or conflict resolution" ([PGlite](https://pglite.dev/docs/sync)). Electric's writes guide says "Electric does not do write-path sync" ([Electric](https://electric.ax/docs/guides/writes)). On this reading, no documented component pushes a local write up, as of 2026-10-19.

What PGlite's sync docs do describe runs the other way. Electric "syncs data out of Postgres into local clients over HTTP using a primitive called a Shape" ([Electric](https://electric.ax/docs/intro)); a Shape stream is that flow of rows for one Shape. PGlite's `syncShapesToTables` applies each upstream Postgres transaction as one local transaction, and a `shapeKey` keeps the stream's place so sync can resume ([PGlite](https://pglite.dev/docs/sync)). So on this reading, the only documented arrow points down, from Postgres.

**Reading two: the write goes through your app.** That's Electric's documented pattern. Reads sync down; writes go to your API, which writes to Postgres. The writes guide lists four ways to do it, from plain online writes to optimistic ones with rollback ([Electric](https://electric.ax/docs/guides/writes)). Read this way, "back to a central Lakebase" describes a composed system: the agent's write goes to an API, and the result comes back down the read path.

This reading comes with a documented way to know a write has landed. TanStack DB, "the reactive client store for your API", implements it only in its Electric collection ([TanStack/db](https://github.com/TanStack/db)):

1. Your API does the write in a Postgres transaction.
2. It reads that transaction ID (txid) with `SELECT pg_current_xact_id()::xid::text as txid` and returns it.
3. Your client calls `awaitTxId(txid)`, which resolves when that ID shows up on the Shape stream (default timeout 15 seconds; [Electric collection docs](https://tanstack.com/db/latest/docs/collections/electric-collection)).

None of these steps runs through PGlite's sync.

Two caveats:

- It only confirms anything if the handler waits: "Completion proves backend confirmation only when the handler explicitly waited for that confirmation or read-back" ([TanStack DB](https://tanstack.com/db/latest/docs/guides/mutations)).
- It means seen on the stream, not saved locally. With SQLite persistence, `awaitTxId` "can resolve before the local SQLite write completes" ([TanStack DB](https://tanstack.com/db/latest/docs/collections/electric-collection)).

Those are two different stories about the same arrow, and I'm leaving both standing. Why you should care, in my view: whichever reading holds decides whether your app owns the write path.

## The way down, also undocumented on Lakebase

The other direction sounds easier: syncing out of Postgres is what Electric is for. It reads Postgres through logical replication, and its deployment guide asks for a role with the `REPLICATION` attribute and a direct replication connection ([Electric](https://electric.ax/docs/guides/deployment)).

Lakebase does document logical replication, but only "between a Lakebase database and another Postgres database" ([logical replication docs](https://docs.databricks.com/aws/en/oltp/projects/logical-replication)). A non-Postgres consumer like Electric isn't covered, and Databricks Lakebase isn't on Electric's provider list. So, as of 2026-10-19, the pairing is undocumented from both ends. [Part 3](/articles/one-lakebase-row-commit-to-app/) walks that seam.

## Lakebase at the centre

The middle box is the one with docs today. Lakebase "provides a fully managed Postgres backend for storing agent state and memory", through LangGraph checkpointers or the OpenAI Agents SDK on Databricks Apps, and checkpoints on Model Serving ([agent state docs](https://docs.databricks.com/aws/en/oltp/projects/state-management)). Agent sessions and memory are managed stores "backed by Lakebase and usable from agents built on any framework" ([agent memory docs](https://docs.databricks.com/aws/en/agents/custom-agents/stateful-agents)).

None of those pages mentions a database in the sandbox, PGlite or sync. I don't read that as a contradiction. It's a central store documented now, next to a three-tier design announced on 2026-08-11. And the announcement's own centre, "centralizing control in Lakebase Postgres on cheap, durable object storage", doesn't name a surface.

## Where should the agent's state live?

Electric's 2026-06-04 post says: "Managed agents don't belong in sandboxes. They belong in functions, with stateless agent logic, durability in the data layer and tool execution in backend systems" ([Electric](https://electric.ax/blog/2026/06/04/serverless-agents)). Its agent docs scope `ctx.sandbox` to tool execution ([Electric docs](https://electric.ax/docs/agents/usage/sandboxing.md)). Databricks' announcement puts the agent and a database in the sandbox.

I can read that three ways. The two texts:

- use "sandbox" at different layers,
- are about different agents (Electric's line is about managed ones), or
- really differ.

The sources don't settle it, and I won't either.

Where they line up: both keep durable state outside the agent. They name different stores. Electric's April post argues that "the moment you put agent state in Postgres, Redis, SQLite, or a file, you've chosen a substrate that's not multi-player by default", and makes the agent a durable stream ([Electric](https://electric.ax/blog/2026/04/29/introducing-electric-agents)). Databricks puts it in Lakebase Postgres. The announcement also doesn't say which copy wins when the local and central copies differ.

My view: the store matters more than the sandbox. Whatever platform you put an agent on, ask where its authoritative state lives.

## The three tiers are a good bet, not yet a product

That's my view, and it rests on Databricks' own premise, that an agent's inner loop wants its data where it runs. I haven't found an independent source that tests that premise, so it's a bet on the vendor's argument.

"Not yet a product" is about the architecture, not the parts: PGlite and Electric's sync engine are published open source today. In the Databricks sources I read, as of 2026-10-19, I didn't find the three tiers as a Databricks Lakebase feature. The per-agent database they do document is a remote branch per coding agent, not a local one.

## Named and documented, as of 2026-10-19

| Component | Named by | Open source | On Databricks (sources read) |
|---|---|---|---|
| PGlite | Databricks' announcement; Electric's list | Published open source | Not found |
| The sync engine | Databricks' announcement; Electric's list, as "Postgres Sync" (the same engine, on my reading) | Published open source | Not found |
| TanStack DB | Electric's list | Published open source (TanStack's repo, MIT; Electric listed as a "partner") | Not found |
| Durable Streams | Electric's list | Published open source | Not found |

"Electric's list" is the four projects Electric's joining post names as open source ([Electric](https://electric.ax/blog/2026/08/11/electric-joining-databricks)). Sources read: Databricks' AWS docs, the [Lakebase release notes](https://docs.databricks.com/aws/en/release-notes/lakebase) through 2026-10-15, and the 2026-10-08 post on branching databases for coding agents.

The Databricks announcement doesn't name Durable Streams.

Next: Reading the Durable Streams and SlateDB specs.

## Sources

1. Databricks, "Electric joins Databricks to bring WASM Postgres to AI agent sandboxes", 2026-08-11. https://www.databricks.com/blog/electric-joins-databricks-bring-wasm-postgres-ai-agent-sandboxes
2. Electric, "Electric is joining Databricks", 2026-08-11. https://electric.ax/blog/2026/08/11/electric-joining-databricks
3. Databricks docs, Lakebase Postgres overview. https://docs.databricks.com/aws/en/oltp/projects
4. Databricks, "Lakebase and Agentic SDLC: Branching Databases for Coding Agents", 2026-10-08. https://www.databricks.com/blog/lakebase-and-agentic-sdlc-branching-databases-coding-agents
5. PGlite docs, Sync. https://pglite.dev/docs/sync
6. Electric docs, Writes guide. https://electric.ax/docs/guides/writes
7. TanStack DB docs, Electric Collection. https://tanstack.com/db/latest/docs/collections/electric-collection
8. TanStack DB docs, Mutations guide. https://tanstack.com/db/latest/docs/guides/mutations
9. TanStack/db repository. https://github.com/TanStack/db
10. Electric docs, Intro. https://electric.ax/docs/intro
11. Electric docs, Deployment guide. https://electric.ax/docs/guides/deployment
12. Databricks docs, Lakebase logical replication. https://docs.databricks.com/aws/en/oltp/projects/logical-replication
13. Databricks docs, Agent state and memory. https://docs.databricks.com/aws/en/oltp/projects/state-management
14. Databricks docs, Agent memory and sessions. https://docs.databricks.com/aws/en/agents/custom-agents/stateful-agents
15. Electric, "Serverless agents", 2026-06-04. https://electric.ax/blog/2026/06/04/serverless-agents
16. Electric docs, Agents: Sandboxing. https://electric.ax/docs/agents/usage/sandboxing.md
17. Electric, "Introducing Electric Agents", 2026-04-29. https://electric.ax/blog/2026/04/29/introducing-electric-agents
18. Databricks, Lakebase release notes. https://docs.databricks.com/aws/en/release-notes/lakebase
19. Databricks docs, Databricks Sandbox (Beta), 2026-10-21. https://docs.databricks.com/aws/en/compute/serverless/sandbox
