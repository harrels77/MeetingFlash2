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
]

export function getArticle(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug)
}
