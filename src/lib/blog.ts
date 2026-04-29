export interface Article {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  category: string
  content: string
}

export const articles: Article[] = [
  {
    slug: 'how-to-write-effective-meeting-notes',
    title: 'How to Write Effective Meeting Notes That Actually Get Used',
    description: 'Most meeting notes end up forgotten. Learn the exact format that turns raw notes into decisions, tasks, and follow-ups your team will actually act on.',
    date: '2026-04-10',
    readTime: '5 min',
    category: 'Productivity',
    content: `
## Why most meeting notes are useless

The average professional sits in 15–20 hours of meetings per week. Yet most of the notes taken during those meetings disappear into a shared doc, never to be acted on.

The problem isn't that people don't take notes. It's that they take the **wrong kind** of notes.

Raw transcripts, bullet points without context, and vague action items like "follow up on pricing" are not useful notes. They're noise.

## The anatomy of effective meeting notes

Effective meeting notes have four components:

**1. Decisions made** — Not discussed, not proposed. Decisions that were actually made. "We decided to push the launch to May 2nd" is useful. "Launch date was discussed" is not.

**2. Action items with owners** — Every action item needs a person's name and a deadline. "Tom will send the feature list by Friday" is actionable. "Feature list needed" is not.

**3. Open questions** — Things that came up but weren't resolved. These become the agenda for your next meeting.

**4. Key context** — Any constraints, blockers, or assumptions that were mentioned. Future you (and your team) will thank present you for writing these down.

## The format that works

Here's a simple template:

\`\`\`
MEETING: [Title]
DATE: [Date]
ATTENDEES: [Names]

DECISIONS:
• [Decision 1]
• [Decision 2]

ACTIONS:
• [Person] → [Task] by [Date]
• [Person] → [Task] by [Date]

OPEN QUESTIONS:
• [Question 1]
• [Question 2]

CONTEXT:
• [Important constraint or context]
\`\`\`

## The follow-up is where most teams fail

Writing good notes is only half the battle. The other half is making sure they reach everyone who needs them — including people who weren't in the room.

A well-written follow-up email after a meeting should:
- Summarize the key decisions (2–3 lines max)
- List action items clearly with owners and deadlines
- Name the open questions that need follow-up
- Be sent within 30 minutes of the meeting ending

The longer you wait, the less useful the follow-up becomes.

## Automate the execution layer

If you're running multiple meetings a week, manually writing all of this takes 20–30 minutes per meeting. That adds up to 2–3 hours of admin work per week just for follow-ups.

Tools like MeetingFlash take your raw notes and automatically produce the decisions, action items, follow-up email, Slack message, and next agenda — in under 20 seconds. No prompts, no templates to fill in.

The goal isn't to replace thinking. It's to eliminate the part that's purely mechanical.
    `.trim(),
  },
  {
    slug: 'post-meeting-workflow-for-teams',
    title: 'The Post-Meeting Workflow That Keeps Teams Aligned',
    description: 'A clear post-meeting workflow can cut misalignment, missed deadlines, and "wait, what did we agree on?" moments by 80%. Here is how to build one.',
    date: '2026-04-05',
    readTime: '6 min',
    category: 'Team Collaboration',
    content: `
## The hidden cost of a bad post-meeting workflow

Your meeting ends. Everyone leaves. And then... nothing happens.

Sound familiar? You're not alone. Research consistently shows that more than 60% of action items from meetings are never completed. Not because people don't care, but because there's no system to ensure they do.

A post-meeting workflow solves this. It's the set of steps you follow every time a meeting ends to make sure nothing slips through the cracks.

## The 5-step post-meeting workflow

### Step 1: Capture decisions while they're fresh (during the meeting)

Assign one person to be the notes lead for every meeting. Their job isn't to transcribe everything — it's to capture decisions, action items, and open questions in real time.

### Step 2: Generate the Execution Pack (within 5 minutes)

Before anyone leaves the room, produce:
- A clean list of decisions made
- Action items with owners and deadlines
- Open questions for the next meeting
- A ready-to-send follow-up email

This is the hardest part to do manually, which is why many teams use tools to automate it.

### Step 3: Distribute within 30 minutes

The follow-up should reach everyone — attendees and non-attendees — within 30 minutes of the meeting ending. After that, people move on to their next task and context is lost.

### Step 4: Log in your project management tool (same day)

Action items should be in your task manager by end of day. Whether that's Linear, Jira, Notion, or a shared spreadsheet — they need to exist somewhere that's visible and trackable.

### Step 5: Open questions become the next agenda

Every open question from this meeting becomes a standing agenda item for the next one. This creates continuity and prevents the same issues from being discussed over and over without resolution.

## Why most workflows fail

Most post-meeting workflows fail for one reason: **they depend on human willpower**.

If the workflow requires a person to sit down and manually write a summary, create tasks in three different tools, and send an email — it will be skipped when things get busy. And things always get busy.

The most resilient workflows are the ones that are as automated as possible. The human's job should be to verify and approve, not to generate.

## Building a culture around the workflow

Tools help, but culture matters too. Teams that have strong post-meeting execution share a few traits:

- **Someone is always named as the notes lead** for each meeting
- **Action items are assigned in the room**, not after
- **The follow-up is expected** — not a nice-to-have but a commitment
- **No action item exists without an owner and a deadline**

The goal is to get to a place where your team leaves every meeting with total clarity: what was decided, who does what, and by when.
    `.trim(),
  },
  {
    slug: 'how-to-write-follow-up-email-after-meeting',
    title: 'How to Write a Professional Follow-Up Email After a Meeting',
    description: 'A great follow-up email after a meeting shows professionalism and keeps everyone accountable. Here is the exact structure — with examples.',
    date: '2026-03-28',
    readTime: '4 min',
    category: 'Communication',
    content: `
## Why the follow-up email matters

The follow-up email after a meeting is one of the highest-leverage things you can do as a professional. It:

- **Creates a written record** of what was agreed
- **Holds people accountable** to their commitments
- **Keeps absent stakeholders in the loop**
- **Signals professionalism** to clients and collaborators

Yet most people either don't send one, or send something so vague it's useless.

## The structure of a great follow-up email

A good follow-up email has five parts:

**Subject line:** "Follow-up: [Meeting title] — [Date]"

Keep it clear and searchable. "Quick follow-up" is too vague. "Follow-up: Product roadmap sync — April 15" is findable months later.

**Opening (1 sentence):** Thank attendees and recap the meeting in one line.

> "Thanks everyone for a productive session this morning. Here's a summary of what we covered."

**Decisions (bullet list):** Only confirmed decisions, not discussions.

> • Launch date confirmed for May 2nd
> • Q2 tool subscription budget frozen
> • New hire interviews start April 22nd

**Action items (bullet list):** Person → Task (by Deadline)

> • Tom → Feature list (by Friday, April 18)
> • Lisa → Press release draft (by Wednesday, April 16)
> • David → Budget projection (by Thursday, April 17)

**Open items / next steps:** What needs to be resolved before the next meeting.

> • Pricing model still under review — Sarah to bring updated proposal to next sync

**Closing:** Short and professional.

> Looking forward to seeing progress on all fronts. Next meeting: [Date/Time].

## Common mistakes to avoid

**Too much detail.** A follow-up email is not a transcript. If it takes more than 60 seconds to read, it's too long.

**Vague action items.** "Follow up on pricing" is not an action item. "Sarah → Send updated pricing proposal by Tuesday" is.

**No deadlines.** Every action item needs a deadline. "Soon" doesn't count.

**Waiting too long.** Send within 30 minutes of the meeting. After a few hours, the follow-up loses its urgency.

## How to write one in under 20 seconds

If you're running multiple meetings a day, manually writing follow-ups adds up fast. MeetingFlash takes your raw meeting notes and generates a complete, professional follow-up email automatically — along with the decision list, action items, Slack message, and next agenda.

Paste your notes. Get the email. Send it.
    `.trim(),
  },
  {
    slug: 'meeting-action-items-best-practices',
    title: 'Meeting Action Items: Why They Fail and How to Fix It',
    description: 'Over 60% of meeting action items are never completed. Here are the exact reasons why — and the simple fixes that change everything.',
    date: '2026-03-20',
    readTime: '5 min',
    category: 'Productivity',
    content: `
## The action item problem

Here's a scenario most teams know well:

Your meeting ends. You have a list of things to do. Two weeks later, in your next meeting, you discover half of those things never happened. Nobody is sure who was supposed to do what. Deadlines weren't clear. And now you're spending the first 20 minutes of your next meeting just catching up on last meeting's action items.

This is extremely common. Studies suggest more than 60% of action items from meetings are never completed.

The good news: this is a solvable problem.

## Why action items fail

**1. They have no owner.**
"We need to update the pricing page" is not an action item. It's a wish. An action item has a person's name attached: "Julia → Update the pricing page."

**2. They have no deadline.**
Without a deadline, an action item will be done "at some point" — which usually means never. Every action item needs a specific date: "Julia → Update the pricing page by Thursday."

**3. They're too vague.**
"Follow up with the client" could mean a hundred different things. The more specific the action item, the more likely it gets done: "Julia → Send revised proposal to client by EOD Thursday."

**4. They're not written down where people can see them.**
If action items only exist in the meeting notes doc, they'll be forgotten. They need to live somewhere that's part of the team's daily workflow — a task manager, a shared board, a Slack message.

**5. Nobody follows up.**
Action items without accountability loops die quietly. The most effective teams have a process for checking in on open items before the next meeting.

## The format that works

The most effective format for meeting action items is simple:

**[Person] → [Specific task] (by [Date])**

Examples:
- Tom → Send feature spec to engineering (by April 18)
- Sarah → Get legal approval on contract terms (by April 21)
- Marcus → Prepare Q2 budget slides (by April 25)

Notice what's in every one: a name, a concrete deliverable, and a date.

## How to track them

1. **Capture in the meeting** — don't wait until after. Someone should be writing action items as they're created.
2. **Share immediately** — in the follow-up email and/or Slack, within 30 minutes.
3. **Log in your task manager** — whatever your team uses. By end of day.
4. **Review at the start of the next meeting** — spend 5 minutes going through open items before diving into new topics.

## The role of automation

Manually extracting action items from notes takes time and attention. It's easy to miss one, or phrase it vaguely under time pressure.

Tools like MeetingFlash automatically extract action items from your raw meeting notes, format them with owners and deadlines, and include them in the follow-up email and Slack message — all in one step.

The less friction there is in capturing action items, the more likely they are to get done.
    `.trim(),
  },
  {
    slug: 'how-to-summarize-meeting-notes-with-ai',
    title: 'How to Summarize Meeting Notes with AI in 2026',
    description: 'AI changed how meetings end. Learn what AI meeting summarization actually does, the right way to use it, and the prompts (or zero prompts) that produce useful output.',
    date: '2026-04-26',
    readTime: '6 min',
    category: 'AI & Automation',
    content: `
## The shift from "transcript" to "execution"

For years, AI meeting tools focused on the wrong half of the meeting. They transcribed audio and dumped a wall of text into a doc. The reasoning: humans are bad at note-taking, AI is good at listening.

That solved the wrong problem. Nobody was struggling to capture words. Everyone was struggling to **act on words**. A 4,000-word transcript is no easier to act on than the meeting itself was.

The 2026 version of AI summarization is different. The goal is not to capture more — it is to capture less, and to structure what's left so it triggers action.

## What AI summarization should actually produce

A useful AI summary of a meeting is not a recap. It is an **execution layer** that sits on top of the meeting. From a 30-minute call, you should walk away with:

- The decisions that were made (not discussed — made)
- The action items, with owners and deadlines
- The open questions that didn't get resolved
- The risks or blockers that came up
- A draft follow-up email
- A draft Slack/Teams update
- A starting agenda for the next meeting

Anything less and you are still doing the work after the meeting.

## How to feed AI for the best summary

The single biggest mistake people make: they record the meeting and feed AI the raw audio.

Audio transcription is noisy. People interrupt, trail off, repeat themselves, talk over each other. The AI then has to summarize a low-signal input and the output reflects that.

A better approach:

1. Take quick **bullet-style notes** during the meeting — fragments are fine. "Sarah → launch April 28," "freeze tool subs Q2," "Tom unsure on pricing."
2. Paste those bullets into an AI tool. The AI fills in the structure.
3. Review the output and ship it.

Half-sentences and shorthand are exactly what good AI summarization is built to handle. You do not need to write full prose. You need to capture signal.

## The "zero-prompt" approach

The other big mistake: writing a long prompt every time you summarize a meeting. "Please summarize the following meeting and extract decisions, then write a follow-up email in a professional tone, then..."

That works once. By the third meeting of the day, you stop doing it.

The right architecture is the opposite — a tool that already knows what a meeting summary should look like, so you do nothing except paste your notes. That is what [MeetingFlash](/app) does. Paste raw notes, get a complete Execution Pack. No prompts, no setup.

## What about accuracy?

AI summarization is only as accurate as the notes you feed it. If your notes don't say a deadline, the AI should not invent one. If your notes mention a name once, the AI should not over-attribute action items to them.

The right tool will leave fields blank when the input doesn't support a confident answer. If you see a meeting summary tool that confidently fabricates owners or dates, it's hallucinating — and that's worse than no summary at all.

## When NOT to use AI for summarization

A few cases where AI summarization is the wrong tool:

- **Sensitive 1-on-1s** where the value is the conversation itself, not the artifact
- **Brainstorming sessions** where structure isn't the point
- **Legal or regulated meetings** where every word matters and you need a verified transcript

For everything else — discovery calls, status updates, retros, planning meetings, internal syncs — AI summarization is now the default. The 20 minutes you used to spend writing the recap is 20 minutes you get back.

## Try it on your last meeting

If you have notes from a recent meeting sitting in a doc somewhere, paste them into [MeetingFlash](/app). You'll have a complete Execution Pack — decisions, actions with owners, follow-up email, Slack message, next agenda — in 20 seconds. The first one is free, no signup needed.

For more on what to put in your raw notes so AI summarization works well, see [How to Write Effective Meeting Notes That Actually Get Used](/blog/how-to-write-effective-meeting-notes).
    `.trim(),
  },
  {
    slug: 'best-ai-meeting-recap-tools-for-agencies',
    title: 'Best AI Meeting Recap Tools for Agencies (2026 Guide)',
    description: 'Most AI meeting tools are built for sales teams or internal product squads. Agencies have different needs. Here is what to look for, and how to choose.',
    date: '2026-04-25',
    readTime: '7 min',
    category: 'Tools',
    content: `
## Why "AI meeting tool" is a misleading category

The market for AI meeting tools is dominated by transcription products built for sales teams: record the call, get a transcript, push it into Salesforce or HubSpot.

If you run an agency, that is not what you need. You need:

- A recap your client can read in 90 seconds
- A clear list of who owes what, by when
- A follow-up email that doesn't sound generic
- Memory across meetings on the same project, so call #4 doesn't restart from zero

Most "AI meeting tools" do not do any of those things well. Here is the framework to evaluate them.

## What agencies actually need from a recap tool

**1. Output that is client-ready, not internal-ready.**
Internal tools spit out raw transcripts and note dumps. Agencies need to send something polished — to a client who is paying $5k–$50k a month and expects competence.

**2. Owners and deadlines, attributed correctly.**
"Tom will follow up" is useless without a deadline. "Tom will send the SOW by Friday" is gold. The recap tool needs to extract these reliably from messy notes.

**3. A draft follow-up email — written, not stubbed.**
Half the post-meeting work is composing the email. If the tool gives you a template like "Hi [name], thanks for the call!" you have to rewrite it anyway. The whole email should be drafted using the actual decisions and actions from the meeting.

**4. Project memory across meetings.**
After 4 calls with a client, the tool should remember what was decided in calls 1–3 so call 4 builds on top of it. Most tools treat each meeting as standalone — so by call 4 you are paying a tool to give you the same surface-level summary you could write yourself.

**5. Multi-language output.**
Agencies serve clients in different markets. The tool should output in your client's language even if you took notes in yours.

**6. Speed.**
20 seconds, not 5 minutes. Recap tools that take 5 minutes to process force you to context-switch. Recap tools that finish in 20 seconds become part of the meeting itself.

## The categories of tools, briefly

**Transcription tools** (Otter.ai, Fireflies, Fathom): record the call, give you a searchable transcript and a generic summary. Good for compliance and review. Bad for agency execution — the output is not client-ready.

**Generic AI assistants** (ChatGPT, Claude.ai): can summarize anything, but require you to write a long prompt every time, and have no project memory. Powerful but high friction.

**Execution-first tools** ([MeetingFlash](/app)): paste raw notes, get a structured Execution Pack with decisions, actions, follow-up email, Slack message, and next agenda. Built around what agencies actually do after a meeting, not what an LLM can do with a transcript.

The right choice depends on what's broken in your workflow:

- If you struggle to capture what was said → transcription tool
- If you have flexibility and like writing custom prompts → generic AI assistant
- If you struggle with the **work after the meeting** (recaps, emails, follow-ups, ownership) → execution-first tool

For most agencies, the bottleneck is the post-meeting work, not the capture. That is the gap MeetingFlash was built for.

## A simple test before you commit

Before you choose a tool, run this test on it:

1. Take the messy bullet-point notes from your last discovery call
2. Paste them in
3. Look at the output

Ask yourself: **could I send this to the client right now without rewriting it?**

If the answer is no, the tool is not saving you time. It is just shifting the work into a different format.

## Try MeetingFlash on your last meeting

If you want to run that test on MeetingFlash, [paste your notes here](/app). The first pack is free, no signup needed. You'll see exactly what an Execution Pack looks like — and whether it would save you the 20 minutes of recap work after every call.

For a deeper look at what makes a good post-meeting workflow, see [The Post-Meeting Workflow That Keeps Teams Aligned](/blog/post-meeting-workflow-for-teams).
    `.trim(),
  },
  {
    slug: 'discovery-call-recap-template',
    title: 'Discovery Call Recap Template (with AI Assist)',
    description: 'The discovery call is where deals are won or lost. The recap email is where they are closed or stalled. Here is the exact template that works.',
    date: '2026-04-24',
    readTime: '5 min',
    category: 'Sales & Discovery',
    content: `
## The recap is part of the sale

Most agencies treat the discovery call recap as an afterthought. The call ends, you write a quick email, you send it later in the day or the next morning.

That is a mistake. The recap is part of the sale.

A great recap email does three things:

1. **Confirms you listened** — the client sees their own words and priorities reflected back
2. **Locks in commitments** — what was decided and who is doing what is now in writing
3. **Creates urgency** — the next step is clearly named with a date

If you wait until tomorrow to send it, you have lost the urgency. If your recap is a generic "thanks for the call!" you have wasted the opportunity to close.

## The template

Here is the structure that works for discovery call recaps:

**Subject line:** [Project name] — discovery call recap & next steps

**Opening (1 sentence):** Reference the conversation in human terms.
"Great speaking with you today, Sarah — really appreciated your candor on the timeline pressure."

**Confirmed scope (3-5 bullets):** Restate what was agreed, in their language.
- Project: e-commerce rebuild on Shopify Plus
- Timeline: 12 weeks, kickoff May 6
- Budget: $48k, paid in 3 milestones

**Owners and next steps (3-4 bullets, with names and dates):**
- You → SOW + first invoice by Monday
- Sarah → brand assets + access by Tuesday
- You → kickoff call agenda by Wednesday

**Open items (1-3 bullets):** Things you noted that aren't blockers but need answers.
- Confirm whether legacy product data needs migration
- Decide on analytics tooling (we recommended GA4 + Hotjar)

**Sign-off:** Plain, direct, with the next anchor.
"I'll send the SOW Monday morning. Looking forward to kickoff May 6."

That's it. Six blocks, around 200 words. It reads like you put thought into it because you did.

## Why most recaps fail

The two failure modes:

**Failure 1: Generic and templated.** "Hi {{name}}, thanks for the call! It was great to learn about your business..." Nobody reads past the first line. The client knows you sent the same template to four other prospects this week.

**Failure 2: Too long.** Three-paragraph essays summarizing every twist of the conversation. The client skims it for the action items, doesn't find them clearly listed, and shelves the email.

The structure above avoids both. It is specific to the call (because it references real decisions from your notes) and it is scannable (because every section is a few bullets, with owners and dates highlighted).

## How to write it in 60 seconds, not 20 minutes

The math on writing a discovery recap manually: 20 minutes per call, 5 discovery calls a week → 100 minutes / week of recap writing. 80+ hours a year. That's two full work weeks.

The fix: don't write it manually. While the call is happening, jot down decisions, owners, and dates as bullets — fragments are fine. After the call, paste those bullets into [MeetingFlash](/app) and you get a complete Execution Pack including a draft follow-up email that already follows this structure. Edit it, send it, done.

We've actually built a [discovery call template](/app) into the templates dropdown — so you have a starting structure for your notes too.

## A working example

Here is what the bullet input might look like:

> Sarah, Acme Corp. Wants Shopify Plus rebuild. Mentioned competitor launched migration last quarter, feels behind. Budget $48k, OK with milestone billing. Timeline 12 weeks, hard launch by Aug 1. Brand assets exist but scattered. Wants weekly status calls. Unsure about migrating 3 yrs of customer data. We recommended GA4 + Hotjar. Kickoff May 6. Tom on her side is decision-maker on technical stuff.

Pasted into MeetingFlash, that becomes a structured recap with the decisions, actions, owners, deadlines, follow-up email, Slack message for your team, and a next agenda — in 20 seconds.

## Send it before they finish their coffee

The single most underrated agency superpower: sending the recap email before the client has finished the coffee they grabbed after the call. It signals competence at a level no pricing tier can match.

[Try it on your last discovery call →](/app)

For more on follow-ups that actually convert, see [How to Write a Professional Follow-Up Email After a Meeting](/blog/how-to-write-follow-up-email-after-meeting).
    `.trim(),
  },
  {
    slug: 'sprint-retrospective-template',
    title: 'Sprint Retrospective Template That Drives Real Change',
    description: 'Most retros end with a list of complaints and zero changes. Here is the format that turns retros into actual sprint-over-sprint improvement.',
    date: '2026-04-23',
    readTime: '6 min',
    category: 'Agile & Product',
    content: `
## Why most retros change nothing

The standard retrospective format — what went well, what didn't, what to improve — was groundbreaking when it was introduced. It is now the default reason retros feel pointless.

The reason: the format produces a **list of feelings**, not a list of commitments. The team leaves the retro with three "what to improve" bullets and zero owners. By the next retro, the same three issues come up again.

A retro that drives change has two non-negotiable elements:

1. Every "improve" item ends with a **named owner** and a **deadline**
2. The next retro **starts** by reviewing whether the previous commitments shipped

If you do not do both of those, you are running a venting session, not a retrospective.

## The template

Here is the structure that consistently produces follow-through.

**1. Review last retro's commitments (5 minutes)**
Open by going through what was decided last time. For each item:
- Did it ship? (Yes/No/Partial)
- If no, why?
- Carry it forward or kill it.

This single change — putting last retro's commitments at the top of this retro — fixes 80% of why retros don't drive change.

**2. What worked (10 minutes)**
What should we keep doing? Not "what was good" — what was good is feelings. "What should we keep doing" is process.

Examples:
- Pairing on the auth refactor caught two bugs we would have shipped solo
- Daily 10-min standup vs the old 30-min one — kept us focused

Capture as bullets. Keep moving.

**3. What didn't work (10 minutes)**
What should we stop doing or change? Same rule — actions, not feelings.

Examples:
- Story points balloon mid-sprint because we don't break down stories enough up front
- We keep merging Friday afternoon and breaking prod over the weekend

Capture as bullets. Don't debate yet.

**4. Top 3 changes — with owners and deadlines (15 minutes)**
This is the part that matters. From the "didn't work" list, pick the top 3 (not 7, not 12). For each one:
- One sentence: what changes specifically
- One person owns it
- One deadline (usually next sprint)

Example:
- We will break down all stories ≥ 3 points before sprint planning. Owner: Maya. Start: next sprint planning.
- No merges to main after 3pm Friday. Owner: enforced by all (CI rule). Start: this Friday.
- We will run 1 hour of "tech debt" first thing Monday. Owner: rotating. Start: next sprint.

If you can't pick 3 with owners, you don't have commitments — you have a wishlist.

**5. Wrap (5 minutes)**
Recap the 3 commitments, by name. Confirm them on Slack so they are written down. Done.

Total: 45 minutes. Anything longer is rumination.

## Common retro failure modes (and fixes)

**Failure: "We need to communicate better."**
Vague. Owner-less. Means nothing. Fix: rewrite as a specific behavior change with one owner. "We will update the project channel every time a blocker is hit, by EOD same day. Owner: whoever hit the blocker."

**Failure: One person dominates the retro.**
Common. Fix: silent ideation first — every team member writes their bullets in a doc for 5 minutes before discussion. Reduces the "first mover" effect.

**Failure: Same issues come up retro after retro.**
The single biggest signal that the team is not driving change. Fix: make Step 1 (review last retro's commitments) the first agenda item, religiously. Public accountability drives follow-through faster than any process tweak.

**Failure: Retros run long and people get bored.**
The team is treating retro as therapy. Fix: enforce the time-boxes above. 45 minutes max. The discipline of a tight box forces the conversation toward decisions.

## Capture the retro in 20 seconds, not 20 minutes

The post-retro work is usually a recap email to the team plus an updated commitments doc. Both can be drafted automatically.

While the retro happens, jot down bullets in any format — fragments are fine. Then paste those notes into [MeetingFlash](/app). It produces:

- The structured "kept / stopped / committed" bullets
- A team Slack message with the 3 commitments and owners
- A next-sprint agenda starting with last retro's accountability check

That whole post-retro packaging that usually takes the scrum master 20 minutes — done in 20 seconds.

We've also built a [sprint retro template](/app) into the templates dropdown that prompts you to capture exactly the inputs above.

## The compounding effect

Retros that drive change compound. If your team ships even one process improvement per sprint, you are 26 improvements better in a year. Most teams ship zero, because they never close the loop.

The fix is not a fancier retro framework. It is making sure every retro ends with named owners and the next retro starts by checking on them.

For broader team workflow improvements, see [The Post-Meeting Workflow That Keeps Teams Aligned](/blog/post-meeting-workflow-for-teams).
    `.trim(),
  },
  {
    slug: 'client-status-update-email-template',
    title: 'Client Status Update Email Template (Agency Edition)',
    description: 'The weekly status email is where agency-client trust is built or destroyed. Here is the template that keeps clients calm and projects on track.',
    date: '2026-04-22',
    readTime: '5 min',
    category: 'Communication',
    content: `
## The weekly status email is leverage

For agencies, the weekly status update to a client is not admin. It is leverage.

A client who gets a clear, well-structured status email every Friday is calm. They don't email you on Tuesday asking "how are things going?" They don't escalate to your account director. They renew.

A client who gets vague "things are going well!" updates is anxious. They start asking for more meetings. They scrutinize the invoice. They don't renew.

The status email is the cheapest insurance you can buy on a retainer.

## The template

The structure that consistently produces calm clients:

**Subject line:** [Project] — week of [date] — status

(Yes, every week, same format. Predictability is the point.)

**1. TL;DR (1-2 lines)**
The one thing they need to know. If they only read this much, they should leave with the right impression.

Examples:
- "On track for the Aug 1 launch. Two open items — call out below if either is a blocker."
- "We hit a content delay this week — see Risks. Mitigated, but worth flagging early."

**2. What shipped this week (3-5 bullets)**
Specific, completed things. Not "made progress on X." Things that are done.

- Checkout flow live in staging
- Brand asset library handed off to design
- 3 of 4 product detail page templates approved

**3. What's next (3-5 bullets, with owners)**
What is happening next week. Owner where applicable.

- You → final approval on PDP template #4 (by Tuesday)
- Us → backend integration with Shopify checkout
- Us → preview environment for client review (by Friday)

**4. Decisions needed (1-3 bullets)**
Anything you need from them, called out clearly. This is where you protect your timeline.

- Which payment provider for international (Stripe / Adyen)? Needs answer by Wed
- Final logo variant for header — 3 options attached

**5. Risks / blockers (only if real)**
Honest. Specific. With mitigation.

- Content from external partner is 5 days late. Mitigation: we proceeded with placeholder copy so dev work isn't blocked. Will hard-block by next Wed.

**6. Time / budget tracker (1 line)**
A simple "X% of timeline elapsed, Y% of budget spent" reads as competence and avoids end-of-project surprises.

- Week 4 of 12 (33%). Budget: $16k of $48k spent (33%). On track.

**7. Sign-off**
Plain, friendly. If you've left a question in #4, repeat the deadline.

That is the whole template. ~250 words. Takes 30 seconds to read. Builds trust over weeks.

## What goes wrong with status emails

**Mistake 1: They are too long.**
Three pages of project minutiae. Clients skim and miss the actual asks. Discipline: 250 words, max.

**Mistake 2: They don't name decisions needed.**
The week passes, you didn't get the answer you needed, your Friday delivery slips. Always have a "decisions needed" section, even if empty.

**Mistake 3: They are inconsistent.**
Some weeks you send Friday morning, some weeks Monday afternoon, some weeks not at all. Client anxiety spikes the moment the rhythm breaks. Pick a slot (Friday 4pm is good) and never miss it.

**Mistake 4: They hide bad news.**
The single fastest way to destroy a retainer is letting a client discover a problem from elsewhere first. Surface risks early, with mitigations. Even if the mitigation is "we are still figuring it out, will update Wednesday."

## Writing the status email in 60 seconds

If you have your team's daily standups in a notes doc, paste the week's notes into [MeetingFlash](/app). It pulls out decisions, actions with owners, risks, and drafts a follow-up email that maps almost 1:1 to the structure above.

We've built a [client status update template](/app) into the templates dropdown that prompts you for exactly the inputs the template above needs — what shipped, what's next, decisions needed, risks, percentage tracker. Fill in the bullets, get a polished status email out the other end.

## Compounding trust

A client who gets 12 perfect status emails over a 12-week project will refer you. A client who gets 12 vague status emails will not, even if the work was great. The work doesn't speak for itself in a service business. The communication around the work does.

For more on follow-ups specifically after meetings (vs weekly cadence), see [How to Write a Professional Follow-Up Email After a Meeting](/blog/how-to-write-follow-up-email-after-meeting).
    `.trim(),
  },
]

export function getArticle(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug)
}

export function getRelatedArticles(slug: string, count = 3): Article[] {
  const current = getArticle(slug)
  if (!current) return articles.slice(0, count)
  // Same category first, then fill from the rest, never include current
  const sameCategory = articles.filter(a => a.slug !== slug && a.category === current.category)
  const others = articles.filter(a => a.slug !== slug && a.category !== current.category)
  return [...sameCategory, ...others].slice(0, count)
}
