# VoteBlock Admin Dashboard — Design Brief

## Objective
Design a comprehensive admin dashboard for VoteBlock, a blockchain-inspired voting platform built as a school project. The admin dashboard gives administrators full control over the platform: viewing reports, managing polls (create/close/delete), and managing users. Currently any authenticated user can create polls — the admin dashboard establishes that only admins should have this power.

## Target Audience
School administrators and project evaluators. The design should look professional and polished while being immediately understandable.

## Output
- **Format**: Self-contained `index.html` with embedded CSS and JS
- **Output path**: `/Users/apple/Documents/voteblock/frontend/mockups/admin-dashboard/`
- **File**: `index.html` (single file, all assets embedded/inline)

## Aesthetic Direction

### Must Match Existing App Style
The VoteBlock app uses a specific visual language that MUST be matched:

- **Primary gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` — used for logo, accent buttons, key highlights
- **Primary blue**: `#3b82f6` — used for links, active states, primary buttons
- **Background**: `#f8fafc` or `#f3f4f6` — light gray page backgrounds
- **Card backgrounds**: `#ffffff` with subtle shadow `0 1px 3px rgba(0,0,0,0.1)`
- **Text dark**: `#1e293b` or `#1f2937`
- **Text secondary**: `#64748b` or `#6b7280`
- **Borders**: `#e2e8f0` or `#e5e7eb`
- **Success green**: `#059669`, background `#dcfce7`
- **Error/danger red**: `#dc2626`, `#ef4444`, background `#fee2e2`
- **Warning amber**: `#f59e0b`, background `#fef3c7`
- **Font**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Border radius**: 8px for cards, 6px for buttons/inputs, 12-16px for larger containers
- **Transitions**: `all 0.2s` for hover effects

### Dashboard-Specific Enhancements
While matching the existing palette, the admin dashboard should feel more **data-dense and professional**:
- Use the gradient sparingly — for sidebar header/logo and key CTAs only
- Tables should be clean with alternating row backgrounds
- Stats cards should use subtle colored left borders or top accents to differentiate metrics
- Charts should use the same color palette (#667eea, #764ba2, #3b82f6, #059669, #f59e0b)

## Content Structure

### Layout
- **Fixed sidebar** (260px wide) on the left with navigation
- **Scrollable main content area** on the right
- The sidebar should have:
  - VoteBlock logo at top with gradient text effect
  - Admin badge/label
  - Nav items with icons (use simple Unicode/emoji icons): Dashboard, Polls, Users, Reports
  - Active nav item highlighted
  - Logout button at bottom
  - Admin user info section

### Page 1: Dashboard Overview (Default View)
This is the main landing page when admin logs in.

**Stats Row (4 cards in a row):**
1. Total Users — icon: people — value: "1,247" — subtitle: "+23 this week" — accent: blue
2. Total Polls — icon: ballot — value: "89" — subtitle: "12 active" — accent: purple
3. Total Votes — icon: check — value: "15,832" — subtitle: "+342 today" — accent: green
4. Active Polls — icon: live — value: "12" — subtitle: "3 closing soon" — accent: amber

**Charts Section (2 charts side by side):**
1. **Voting Activity** (last 7 days) — Bar chart showing daily vote counts. Use CSS-only bars (no chart library). Days: Mon through Sun with varying heights.
2. **Poll Status Distribution** — Donut/pie chart showing Open vs Closed vs Expired polls. Use CSS conic-gradient or similar technique.

**Recent Activity Feed:**
A compact list showing the last 5-8 platform events:
- "New user 'john_doe' registered" — 2 min ago
- "Poll 'Best Programming Language' received 15 new votes" — 15 min ago
- "Poll 'Campus Event Theme' was closed by admin" — 1 hour ago
- "New poll 'Student Council Election' created" — 3 hours ago
- "User 'jane_smith' changed password" — 5 hours ago

### Page 2: Poll Management
**Header area:**
- Page title "Poll Management"
- "Create New Poll" button (gradient background, white text)
- Search/filter input

**Polls Table:**
| Title | Status | Options | Votes | Created By | Created | Actions |
|-------|--------|---------|-------|------------|---------|---------|
| Student Council Election | Open (green badge) | 4 | 234 | admin | May 15, 2026 | Close / Delete |
| Best Programming Language | Open (green badge) | 6 | 189 | admin | May 14, 2026 | Close / Delete |
| Campus Event Theme | Closed (gray badge) | 3 | 156 | admin | May 10, 2026 | Delete |
| Library Hours Survey | Closed (gray badge) | 4 | 98 | admin | May 8, 2026 | Delete |
| Cafeteria Menu Vote | Open (green badge) | 5 | 67 | admin | May 12, 2026 | Close / Delete |

- Table should have hover states on rows
- Status shown as colored badges (green for Open, gray for Closed)
- Action buttons: "Close" (amber/warning), "Delete" (red/danger) — small, clean buttons
- Pagination or "showing X of Y" at bottom

### Page 3: User Management
**Header area:**
- Page title "User Management"
- Search input for filtering users
- Total user count badge

**Users Table:**
| Username | Email | Registered | Polls Created | Votes Cast | Status |
|----------|-------|------------|---------------|------------|--------|
| admin | admin@voteblock.edu | Jan 1, 2026 | 12 | 0 | Active (green) |
| john_doe | john@university.edu | Mar 15, 2026 | 0 | 23 | Active (green) |
| jane_smith | jane@university.edu | Mar 20, 2026 | 0 | 18 | Active (green) |
| mike_wilson | mike@university.edu | Apr 2, 2026 | 0 | 15 | Active (green) |
| sarah_jones | sarah@university.edu | Apr 10, 2026 | 0 | 31 | Active (green) |
| alex_chen | alex@university.edu | May 1, 2026 | 0 | 8 | Active (green) |

- Clean table with alternating row colors
- Searchable
- User avatars as colored circles with initials

### Page 4: Reports
**Header area:**
- Page title "Reports & Analytics"
- Date range selector (visual only — "Last 7 days", "Last 30 days", "All time" buttons)

**Report Cards (full width, stacked):**

1. **Voting Activity Over Time**
   - Large bar chart showing votes per day over the last 14 days
   - CSS-only implementation
   - Bars use gradient color

2. **Top Polls by Participation**
   - Horizontal bar chart showing top 5 polls by vote count
   - Poll names on y-axis, vote counts as horizontal bars

3. **User Registration Trend**
   - Simple area/line representation showing monthly registrations
   - Jan: 12, Feb: 18, Mar: 34, Apr: 45, May: 28 (so far)

4. **Quick Stats Grid (3 columns):**
   - Average votes per poll: 178
   - Most active day: Wednesday
   - Voter turnout rate: 73%

## Typography Direction
- Match existing app: system font stack
- Dashboard numbers/stats should be large and bold (32-40px, weight 800)
- Table text should be 14px, readable
- Section headers: 20-24px, weight 700
- Use proper hierarchy with clear visual weight differences

## Color Direction
Strictly match existing VoteBlock palette (listed above). The gradient (#667eea → #764ba2) is the brand signature — use it for:
- Sidebar header/logo
- Primary CTA buttons
- Chart accents
- Stat card subtle accents

## What Makes It Memorable
The **sidebar with gradient logo + the stats cards row** should create an immediate "admin control center" feeling. The charts being pure CSS (no library) should demonstrate technical skill for a school project. The blockchain verification aesthetic from the main app should subtly carry into the admin space.

## Interactive Elements (JavaScript)
Since this is a mockup, add JS for:
1. **Sidebar navigation** — clicking nav items shows/hides the corresponding page section (Dashboard, Polls, Users, Reports). Use display toggle, no page reloads.
2. **Table row hover effects**
3. **Search filtering** — typing in search boxes filters table rows in real-time
4. **Active nav item highlighting** — updates when clicking nav items
5. **Confirm dialogs** — clicking Delete shows a simple confirm prompt
6. **Animated stat counters** — numbers count up on page load

## Image Needs
None required. Use Unicode symbols/emoji for icons, CSS gradients for visual flair, and CSS shapes for charts. No external images needed.

## Constraints
- Single self-contained HTML file
- No external dependencies (no CDN links, no external CSS/JS)
- Must work when opened directly in browser (file:// protocol)
- Responsive: should look good at 1280px+ widths (admin dashboards are typically used on desktop)
- All charts implemented with pure CSS (conic-gradient for pie, flexbox for bars)
- Professional polish level — this is for a school project evaluation
