# Claude.md — Build Rules for Swipe Game

## Product Intent
A Tinder-style swipe game for 70–100 concurrent users per room.
Players swipe through scenario cards without seeing guru branding.
After completion, show a reveal slideshow connecting scenarios to guru teachings.

---

## Non-Negotiables
### UI / UX
- Premium, modern design (shadcn/ui + Tailwind)
- Framer Motion for micro-interactions and swipe physics
- Mobile-first: one-handed usability
- Buttons + keyboard fallback

### Admin Editing
- Admin can:
  - Create/edit scenario sets
  - Add/edit/remove/reorder scenarios (drag & drop)
  - Create/edit/reorder reveal slides per set
- Edits must take effect immediately for new rooms (and optionally existing rooms if configured)

### Concurrency & Data Integrity
- Support 70–100 concurrent users in a room
- Answers must be idempotent (no double counting on refresh)
- Aggregates must stay correct even with undo
- Avoid heavy realtime subscriptions; use lightweight polling or minimal realtime updates

### Hosting / Cost
- Must be deployable with free services only (no paid plan required)
- Provide Cloudflare Pages + D1 default path (preferred) or alternative if needed

---


## Implementation Checklist
### Core
- Next.js App Router + TypeScript
- Tailwind + shadcn/ui + Framer Motion
- Swipe deck component with snap thresholds + stacked cards
- Anonymous users (or session-based identity) to track responses
- Rooms with scenario sets + aggregates
- Results screen + Reveal slideshow screen

### Admin
- /admin protected route
- CRUD scenario sets + scenarios
- CRUD reveal slides
- Drag & drop reorder

### Testing
- Scenario validator tests
- Idempotent answer upsert + aggregate update tests
- Room code generator tests

---

## Output Style
When implementing, always provide:
1) Approach summary
2) Exact files to edit
3) Complete runnable code blocks
4) Setup + deploy steps
5) Seed data and tests
