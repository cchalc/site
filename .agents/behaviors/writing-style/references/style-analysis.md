# Style analysis: the three blogs Feather & Wire learns from

What the author likes about each blog, what to borrow, and what not to borrow.
Built in October 2026 from parallel reads of 15 posts. Every quote below was
checked word for word against the downloaded post text; quotes are short
excerpts for analysis, credited and linked.

Sources read:

- **Register Spill** (Thorsten Ball): [Two Types of Software Engineers](https://registerspill.thorstenball.com/p/two-types-of-software-engineers),
  [They all use it](https://registerspill.thorstenball.com/p/they-all-use-it),
  [Glad I did it in Go](https://registerspill.thorstenball.com/p/glad-i-did-it-in-go),
  [How I use git](https://registerspill.thorstenball.com/p/how-i-use-git),
  [Joy & Curiosity #100](https://registerspill.thorstenball.com/p/joy-and-curiosity-100),
  [#102](https://registerspill.thorstenball.com/p/joy-and-curiosity-102)
- **Xe Iaso**: [Crimes with Go Generics](https://xeiaso.net/blog/gonads-2022-04-24/),
  [Time is not a synchronization primitive](https://xeiaso.net/blog/nosleep/),
  [Anything can be a message queue](https://xeiaso.net/blog/anything-message-queue/),
  [MIME, RSS, and existential torment](https://xeiaso.net/blog/2024/fixing-rss-mailcap/),
  [Overengineering a blog preview site](https://xeiaso.net/blog/2024/overengineering-preview-site/)
- **Databricksters**: [Metrics Always Outlive Their Sources](https://www.databricksters.com/p/metrics-always-outlive-their-sources),
  [How to Flatten OpenTelemetry Metrics in Spark 4x faster](https://www.databricksters.com/p/how-to-flatten-opentelemetry-metrics),
  [Designing Domains and Subdomains in Unity Catalog](https://www.databricksters.com/p/designing-domains-and-subdomains),
  [How Engineers Are Quietly Building Multi-Tenant Services on Zerobus Ingest](https://www.databricksters.com/p/how-engineers-are-quietly-building)

## What all three share

These are the habits that make all three read as people, not press releases.
They're the core of the Feather & Wire voice.

1. **They start in the middle.** No context-setting paragraph. A moment, a
   problem, or a flat statement of fact comes first.
2. **First person, peer to peer.** The writer is a practitioner talking to
   other practitioners, never a teacher talking down or a vendor talking up.
3. **Specifics over adjectives.** Real tool names, real commands, real
   numbers, real error messages. Specific detail is also where much of the
   humor comes from.
4. **Takes are stated, then earned.** An opinion arrives plainly and the post
   shows the reasoning. Uncertainty, when it's real, is said out loud.
5. **Mixed sentence rhythm.** Long explanatory sentences next to very short
   ones that land the point.
6. **Endings stop.** No recap. A next step, a callback, or just the last
   useful line.

## Register Spill (Thorsten Ball)

**Feel:** thinking out loud with a friend. Curious, warm, a bit
self-mocking, and openly unsure when he is.

- **Openings** are personal and immediate:
  "Here's something I've been kicking around in my head for a few weeks, a
  tiny theory I have of how people think about software engineering." He'll
  even skip the intro when there isn't one: "At the airport, on my way to New
  York to meet the rest of the Amp team, so no big intro this week."
- **Uncertainty drives the essay** instead of weakening it: "I don't get it."
  appears and repeats as the spine of *They all use it*. He calls his own idea
  small and owns it: "I told you: tiny theory."
- **Humor is recognition and self-correction**, not punchlines: "You should
  ask Jev whether you should subscribe. No, actually, I know the answer: you
  should."
- **Vivid, plain images**: "It's like someone blew up a confetti bomb in the
  world of LLMs and now you realize how grey everything looked before."
- **Opinions with a shrug of proportion**: "I care about commit messages, but
  not too much."
- **Structure is light.** Essays often have no headings; the link roundups are
  bullets, each framed by his own reaction to the link. Bold and italics are
  sparing.
- **Endings are short**: "Until next week!"

**Borrow:** the anecdote-first opening, honest "I'm not sure" moments,
self-correction as humor, reacting to sources rather than summarizing them,
and short sign-offs.

**Don't borrow:** the occasional swear word (Feather & Wire is clean), and
leaning too hard on "imagine the reader's objection, then deflate it", which
can read as combative when it's overused.

## Xe Iaso

**Feel:** deadpan absurdity on top of serious engineering. Confident, very
specific, and willing to take a silly idea all the way to its conclusion.

- **Openings** are flat statements or a candid complaint: "Go 1.18 added
  generics to the language." / "Programming is so complicated."
- **Absurd escalation** for comedy: "There is an enemy out there that
  transcends time, space, logic, reason, and lemon-scented moist towelettes."
- **The serious bit stays serious.** In *Anything can be a message queue* the
  joke is the premise, and the joke lands because the cost maths and the code
  are real.
- **Casual phrasing inside technical prose**: "this can result in things that
  can troll you on accident".
- **Character conversations.** Most posts include dialogue snippets with
  recurring characters (Cadey, Mara, Aoi, Numa) who ask the reader's
  question, warn, or heckle. One breaks frame up front: "By reading this post
  you agree to never implement or use this accursed abomination."
- **Plain, matter-of-fact brag about a weird result**: "I successfully
  managed to send ping packets over Amazon S3."
- **Structure:** headings, code blocks and the conversation snippets break up
  long posts; jargon is used freely and explained only when it matters to the
  story.

**Borrow:** committing fully to a bit while keeping the engineering honest,
precise numbers and tool names as the source of comedy, a flat factual opening,
and casual phrasing in technical prose.

**Don't borrow:** the characters and stickers (they're Xe's personal brand, so
Feather & Wire doesn't reuse or imitate them), and the swearing that shows up
in some posts.

## Databricksters

**Feel:** a senior practitioner explaining a fix to a colleague. Dry,
direct, precise, and allergic to hype.

- **Openings name the problem as a law of nature**: "We build streaming jobs
  as if their inputs are permanent. They never are." / "Nested JSON never
  arrives flat."
- **Features arrive as fixes for a pain**, never as announcements: "Each of
  those is an architecture decision made to compensate for the engine."
- **Direct about limits**: "Let me be direct: Zerobus Ingest does not offer
  native transformations." Saying what a product doesn't do is what makes the
  rest believable.
- **Short, dry asides**: "You want that error." / "if your top-level domains
  read like a list of your ingestion connectors, start over"
- **Clear imperative advice**: "Name every source when creating the
  checkpoint, and plan for tombstoned names and retained state."
- **Ends on a principle plus next steps**: "And sometimes the best
  architecture isn't the most sophisticated — it's the one that solves your
  problem." followed by docs links.
- **Structure:** problem → why it matters → worked example with real config,
  code or output → rules → FAQ and documentation links. 1,200–3,000 words.

**Borrow (for Databricks posts especially):** problem-first framing,
features as the fix for a pain, honest limits and preview caveats, real
config and output, and docs links for every product claim.

**Don't borrow:** the heavier scaffolding (FAQ sections, long checklists,
"Phase 1/Phase 2" headings) except in posts that really are how-to guides,
and the low humor level. Feather & Wire posts can be just as precise and a lot
more fun.

## Corrections to the first-pass reports

The subagent reports that fed this analysis contained errors, corrected here
so nobody reintroduces them:

- One report said Xe uses no character dialogues. The posts are full of them.
- Reports claimed some posts were profanity-free when they weren't, and
  suggested a casual voice can "skip the caveats". Feather & Wire keeps the
  caveats and says them in a lighter voice.
- Several "verbatim" quotes were paraphrases or invented. Only quotes that
  matched the source text exactly are used above.
