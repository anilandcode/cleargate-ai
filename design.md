# ClearGate AI Design System

## Product Identity

ClearGate AI is an executive SaaS product for Shadow AI governance, AI risk triage, and audit-ready AI tool approval.

The product should feel like a serious security, procurement, and GRC workspace. It is not a landing page, consumer dashboard, or dark SOC console. The first screen must immediately communicate that users are reviewing unapproved AI tools, collecting live Bright Data evidence, and producing approval decisions.

Primary tagline:

> Shadow AI Governance powered by live-web evidence.

Core demo promise:

> ClearGate AI turns unapproved AI tools into audit-ready approval decisions using Band-powered agents for security, legal, finance, procurement, and compliance.

## Visual Direction

The UI follows a light executive SaaS style inspired by polished enterprise dashboards:

- soft blue-gray workspace background
- white content panels
- compact cards and tables
- subtle shadows
- thin borders
- restrained iconography
- premium but operational feel
- modal and right-drawer workflows
- professional audit-ready report surfaces

Avoid:

- dark hacker/security-console styling
- oversized marketing heroes
- decorative gradients or bokeh/orb backgrounds
- playful empty states
- card-inside-card clutter
- one-note saturated blue/purple palettes
- oversized headings inside dense product panels

## Design Tokens

### Color

Use a cool, clean, low-noise enterprise palette.

```txt
page-bg:        #F4F8FB
header-bg:      #EAF5FC
surface:        #FFFFFF
surface-soft:   #F8FBFD
border:         #DCE8F0
border-strong:  #C8D8E3
text-primary:   #1F2933
text-secondary: #52616F
text-muted:     #8493A3
primary:        #2F9BFF
primary-dark:   #0F72D8
primary-soft:   #E6F4FF
success:        #16A34A
success-soft:   #EAF8EF
warning:        #D97706
warning-soft:   #FFF7E6
danger:         #DC2626
danger-soft:    #FDECEC
neutral-pill:   #EEF3F7
```

Use red, amber, and green only for actual risk or decision states. Use blue for navigation, active controls, live Bright Data activity, and freshness indicators.

### Typography

- Font: Inter, system sans-serif fallback.
- Dashboard page title: 24-28px, 600 weight.
- Section heading: 16-18px, 600 weight.
- Card metric: 24-32px, 600 weight.
- Table text: 12-14px.
- Metadata: 11-12px.
- Letter spacing: 0.

Text must fit inside all cards, pills, buttons, and table cells. Use truncation only where a full value is accessible through hover, drawer, or detail view.

### Radius, Border, Shadow

- App panels: 8px radius.
- Buttons and pills: 6-8px radius.
- Inputs: 8px radius.
- Avoid large rounded blocks.
- Border: 1px solid `border`.
- Shadow: subtle and functional.

```txt
panel-shadow: 0 8px 24px rgba(31, 41, 51, 0.06)
drawer-shadow: 0 24px 64px rgba(31, 41, 51, 0.18)
```

### Spacing

- App shell gutter: 24px desktop, 16px tablet, 12px mobile.
- Card padding: 16px compact, 20px spacious.
- Table row height: 52-60px.
- KPI card min height: 104px.
- Detail header height: 124-156px.

## App Structure

### Global Shell

Use a professional product shell on every authenticated screen.

- Thin top bar:
  - workspace selector
  - global search
  - live data status
  - notifications
  - user avatar
- Left navigation rail:
  - Inbox
  - Reviews
  - Evidence
  - Policies
  - Reports
  - Settings
- Main content:
  - soft blue page header area
  - white dashboard panels
  - compact enterprise layout

Navigation should feel quiet and predictable. The user should be able to move from a high-level risk queue into a detailed review in one click.

### Primary Routes

```txt
/                 Shadow AI Inbox
/reviews/[id]     Vendor Review Detail
/policies         Policy Profiles
/reports/[id]     AI Vendor Passport / Approval Memo
/settings         Workspace Settings
```

## Core Screens

### 1. Shadow AI Inbox

Purpose: triage unapproved AI tools discovered through expense reports, browser logs, CASB exports, employee surveys, or manual intake.

Layout:

- page header with title, subtitle, import button, and run review button
- KPI strip:
  - Total AI tools
  - High-risk tools
  - Pending reviews
  - Blocked tools
  - Review hours saved
- main risk queue table
- right-side activity/review summary panel

Risk queue columns:

- Vendor
- Category
- Department
- Users
- Data Exposure
- Risk Level
- Evidence Freshness
- Current Decision
- Last Reviewed
- Actions

The table may use compact cards inside cells for vendor identity, but the overall surface must remain table-first and scannable.

Recommended demo seed vendors:

- ChatGPT
- Claude
- Perplexity
- Notion AI
- Fireflies
- Glean
- Cursor
- Gamma
- Midjourney
- Jasper

### 2. Vendor Review Detail

Purpose: review one AI tool and make an approval decision.

Top header:

- vendor logo/avatar placeholder
- vendor name
- domain
- category
- detected usage count
- current decision
- risk score
- freshness score
- evidence gap index

Tabs:

- Overview
- Evidence
- Policy Gate
- Memo
- ROI

Main layout:

- center/left: current tab content
- right: sticky decision sidebar

Decision sidebar:

- final decision
- blocking findings
- required conditions
- top missing evidence
- export memo button
- reviewer notes

### 3. Evidence Ledger

This is the signature UI moment.

Purpose: prove that the system is using live web evidence and Bright Data infrastructure, not vague LLM guesses.

Presentation:

- live-updating table or timeline
- source rows animate in during investigation
- each source shows a Bright Data product label
- timestamp and freshness should be visible
- policy mapping should be visible per extracted claim

Required columns:

- Source
- Source Type
- Bright Data Product
- Fetched At
- Extracted Claim
- Confidence
- Policy Clause
- Freshness
- Status

Source types:

- Privacy Policy
- Terms
- Trust Center
- Security Page
- Subprocessors
- Documentation
- News
- Review / Community
- Pricing / Enterprise Page
- Search Result

Bright Data product labels:

- SERP API
- Web Unlocker
- Scraping Browser
- Web Scraper API
- Cached Replay

Evidence statuses:

- Fresh Evidence
- Missing Evidence
- Needs Review
- Conflicting Source
- Stale Source

### 4. Policy Gate

Purpose: map evidence to AI governance controls and produce an actionable decision.

Control groups:

- Data Handling
- Privacy and Retention
- Enterprise Security
- Compliance and Trust
- Agent / Tool Access
- Business Continuity
- Public Risk Signals

Control states:

- Pass
- Fail
- Unknown
- Needs Review

Decision states:

- Approve
- Approve With Conditions
- Escalate
- Block

The UI should make missing evidence visible. Unknown or missing controls are not empty; they are risk signals.

### 5. AI Vendor Passport / Approval Memo

Purpose: generate a one-page memo that security, GRC, procurement, or legal can attach to Jira, ServiceNow, Zip, Coupa, or a procurement ticket.

Memo sections:

- Vendor summary
- Requested use case
- Data exposure level
- Final decision
- Top findings
- Required approval conditions
- Evidence freshness score
- Evidence gap index
- Evidence appendix
- Reviewer notes
- Generated timestamp
- Evidence hash chain ID

Visual style:

- clean white document
- structured sections
- compact badges
- no decorative graphics
- print/export friendly

### 6. ROI Panel

Purpose: make market value explicit for judges.

Metrics:

- manual review hours avoided
- security questionnaire work reduced
- audit-prep time saved
- approval backlog compressed
- estimated review cost avoided

All ROI values should be based on visible assumptions, such as:

- reviews per month
- average manual review hours
- reviewer hourly cost
- percent of tools auto-triaged

Do not present universal ROI claims as facts.

## Component Rules

### Cards

- White surface.
- 8px radius.
- Single-level only; do not nest full cards inside cards.
- Use compact headers and clear metrics.
- Keep card labels short.

### Tables

- Dense and sortable.
- Header row should be subtle.
- Rows should have clear hover states.
- Use row actions as icon buttons where possible.
- Long URLs and claims should truncate with a drawer/detail view.

### Buttons

- Primary: blue fill for main actions.
- Secondary: white with border.
- Destructive: red only for block/delete decisions.
- Icon buttons for search, filter, export, settings, refresh.
- Buttons must not resize when labels or loading states change.

### Status Pills

Use pills for review states and evidence states:

- Approved
- Conditional
- Escalate
- Blocked
- Missing Evidence
- Fresh Evidence
- Needs Review
- Live Fetch
- Cached Replay

Pills should be small, readable, and color-coded only by meaning.

### Charts

Use charts sparingly.

Allowed:

- small trend bars
- risk distribution bar
- review backlog line chart
- evidence freshness meter

Avoid:

- decorative dashboards
- misleading precision
- chart overload

### Drawers and Modals

Use right-side drawers for:

- add AI tool
- import CSV
- source detail
- policy clause detail
- reviewer notes
- edit policy profile

Use modals only for high-focus actions like export confirmation or blocking a vendor.

## Investigation Loading Flow

The live investigation should show clear steps:

```txt
Discovering Sources
Unlocking Pages
Extracting Evidence
Mapping Controls
Generating Memo
```

Each step should show progress, elapsed time, and the Bright Data product involved where relevant.

During the demo, the Evidence Ledger should visibly populate while the investigation runs.

## Responsive Behavior

Desktop is the primary judging experience.

Desktop:

- persistent top bar and left rail
- full tables
- split detail page with sticky decision sidebar

Tablet:

- collapsible left rail
- preserve table where possible
- decision sidebar can stack below content

Mobile:

- collapse navigation
- replace dense tables with review cards
- keep decision buttons sticky at the bottom

Across all breakpoints:

- no text overlap
- no clipped buttons
- no horizontal scroll except controlled data tables
- no hero-scale type inside product panels

## Accessibility and UX Quality

- Maintain strong text contrast.
- All icon-only controls need accessible labels/tooltips.
- Focus states must be visible.
- Status must not rely only on color.
- Loading states should explain what is happening without marketing copy.
- Empty states should offer clear actions.

## Demo Acceptance Criteria

The demo is successful when a judge can understand the product in 30 seconds:

1. This is a queue of unapproved AI tools.
2. Some tools may touch sensitive company data.
3. Bright Data is collecting live public web evidence.
4. Evidence maps to AI governance policy controls.
5. The system produces an approval decision.
6. The final memo is audit-ready and exportable.

The signature screen is the Evidence Ledger. It must look credible, current, and tied to Bright Data.

## Implementation Defaults

Frontend:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react icons
- Inter or system sans-serif

Recommended UI primitives:

- Button
- Card
- Table
- Tabs
- Badge
- Sheet
- Dialog
- Tooltip
- Dropdown Menu
- Progress
- Separator
- Scroll Area

Use this file as the source of truth for UI decisions before implementation begins.
