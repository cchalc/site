---
title: Harnesses are cheap. The config is the factory.
description: I ran one prompt through four coding harnesses on Omnigent, sent SQL to Qwen and planning to Gemini through Databricks AI Gateway, and built a router agent. The layers of config are what made it repeatable.
pubDate: 2026-11-12
tags: [omnigent, databricks, ai-gateway, agents, routing]
draft: true
---

I sent the same prompt through four harnesses in an afternoon. The answers weren't the interesting part. The interesting part was that I changed harness with one flag and nothing else moved.

That's Omnigent's trick. It's a meta-harness: it wraps Claude Code, Codex, pi, Antigravity and a dozen others, and supplies what none of them ship with, which is sessions, policies, credentials, and a place to put an agent definition. My take is that the harness is the least important thing in the stack now. The layers of configuration around it are the whole factory.

## What I actually ran

One tagged prompt per harness on a managed Omnigent server (Beta on Databricks): pi, claude-sdk, codex, and Antigravity. Three of them answered. Antigravity needed a different path, because the SDK harness wants a raw Gemini key and I wanted it going through Databricks. The native agy route solved that, with one gotcha that cost me a while: the `--model` flag is silently dropped on the version I'm running, so you pick the model with `/model` inside the session.

Codex was the other surprise. The reply came back fine, but the call landed on my laptop's organization gateway, not the workspace I was testing. Same output, wrong ledger. If you only check the answer, you'd never know.

## SQL to Qwen, planning to Gemini

Through AI Gateway I set up model services as a bundle: a Gemini router split 80/20 between two Flash versions, and a separate service for Qwen. A small classifier labels each prompt, and SQL goes to Qwen while planning and organizing go to Gemini. A keyword fallback catches the classifier's bad days.

The thing I'd tell anyone copying this: the model that served a call is `destination_model` in the gateway's usage table. It isn't the service name. My own demo recipes print the model I configured, which is exactly the number I shouldn't trust. A 16/4 split on a 20-call run looked right and proved nothing until I read the table, an hour or so later.

## A router agent with a gate

I wrapped that routing in a custom agent, Rory, with two workers: Codex for review and deploy, Qwen for SQL. The part I care about is the deploy gate. Rory can plan an infrastructure change, but anything that relays an approval stops at a CEL policy and asks a human. There's no auto-approve anywhere. I haven't watched that policy fire yet, so I call it the intended gate, not a proven one.

## Set up, not yet run

Some of this is built and waiting. The environment is ready for a Sandbox run, for reading traces and usage in AI Gateway, for a per-user budget, and for gateway-level governance. Smart Routing (Beta) answers on the workspace and its preview picks are recorded. I haven't run a live session through it. I'd rather say that than pretend.

## Why I think the config is the point

Omnigent layers its configuration: server, user, project, and the agent bundle. In the project layer only the harness choice merges, so a lean repo can say "use this harness" without dragging along anyone's credentials. The agent bundle carries its own guardrails, so the rules travel with the agent. The server-level policy sits above both and can't be edited away. On the managed server that's built-in and CEL policies only, not custom Python.

That separation is the factory. A new teammate gets the repo and their own environment file, and they can reproduce the same routing, the same agents, the same gates. Swap the harness and nothing downstream notices.

I wrote the whole sequence up as a replayable walkthrough, with the commands, the expected output, and a fallback for each step, in the [omnigent-talk repo](https://github.com/cchalc/omnigent-talk). Some chapters show real output and some show only the setup. Each one says which.

## Sources

1. Omnigent docs, [supported harnesses](https://omnigent.ai/docs/build/harnesses/supported)
2. Databricks docs, [Unity Gateway coding-agent model selection](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-model-selection)
3. Omnigent 0.22.0.dev0 package source, read for the harness registry, config merge and policy composition
