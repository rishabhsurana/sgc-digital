# SGC Portal - Design Documentation

## Project Overview

The **Solicitors General Chambers (SGC) Portal** is a comprehensive government document management system designed for tracking, managing, and processing correspondence and contracts across various Ministries, Departments, and Agencies (MDAs).

---

## Table of Contents

1. [Design System](#design-system)
2. [Landing Page](#landing-page)
3. [Management Portal](#management-portal)
4. [Ask Rex AI Assistant](#ask-rex-ai-assistant)
5. [Component Library](#component-library)
6. [Navigation & Breadcrumbs](#navigation--breadcrumbs)

---

## Design System

### Color Palette

| Token | Usage | Value |
|-------|-------|-------|
| `--primary` | Primary brand color, buttons, links | Deep blue |
| `--secondary` | Secondary elements | Muted blue |
| `--accent` | Highlights, badges, notifications | Gold/Amber |
| `--background` | Page backgrounds | Light gray |
| `--foreground` | Primary text | Dark gray/black |
| `--card` | Card backgrounds | White |
| `--muted` | Muted text, borders | Light gray |
| `--destructive` | Error states, delete actions | Red |

### Typography

- **Headings**: System font stack (Geist Sans)
- **Body**: System font stack with relaxed line-height
- **Monospace**: Geist Mono for reference numbers and codes

### Spacing & Layout

- Uses Tailwind CSS v4 spacing scale
- Flexbox-first layout approach
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`
- Consistent padding: `p-4`, `p-6` for containers
- Gap utilities: `gap-4`, `gap-6` for spacing

---

## Landing Page

**Route:** `/`

### Hero Section
- Full-width hero with gradient background
- Government emblem/logo display
- Main headline: "Solicitors General Chambers Portal"
- Subheadline describing the portal's purpose
- Call-to-action buttons for login/registration

### Features Section
- Three-column grid showcasing key features:
  - Correspondence Management
  - Contracts Register
  - MDA Tracking

### Screenshot Placeholder
```
[Insert screenshot of landing page here]
Path: /docs/screenshots/landing-page.png
```

---

## Management Portal

**Route:** `/management`

### Layout Structure

The management portal uses a persistent layout with:

1. **Sidebar Navigation** (Left)
   - Logo and portal branding
   - Navigation menu items:
     - Dashboard
     - Correspondence Register
     - Contracts Register
     - Reports & Analytics
     - MDA Management
     - User Management
     - Settings
   - Collapsible on mobile (hamburger menu)
   - User profile section at bottom

2. **Header** (Top)
   - Search functionality
   - Notification bell
   - User dropdown menu
   - Logout option

3. **Breadcrumbs** (Below header)
   - Shows current location in portal hierarchy
   - Home > Dashboard > [Current Page]
   - Clickable navigation links

4. **Main Content Area**
   - Dynamic content based on current route
   - Consistent padding and spacing

### Screenshot Placeholder
```
[Insert screenshot of management dashboard here]
Path: /docs/screenshots/management-dashboard.png
```

---

### Dashboard Page

**Route:** `/management`

#### Statistics Cards
- Total Correspondence (with trend indicator)
- Pending Items
- Approved Items
- Total Contracts

#### Recent Activity
- List of recent correspondence and contracts
- Quick status indicators
- Action buttons for each item

#### Charts & Analytics
- Weekly submission trends
- Status distribution pie chart
- MDA activity breakdown

### Screenshot Placeholder
```
[Insert screenshot of dashboard with statistics here]
Path: /docs/screenshots/dashboard-stats.png
```

---

### Correspondence Register

**Route:** `/management/correspondence-register`

#### Features
- **Data Table** with columns:
  - File Number
  - Date Received
  - Originating MDA
  - Subject
  - Category
  - Status
  - Actions

- **Filtering Options**:
  - Search by subject or file number
  - Filter by status (Pending, Approved, Under Review)
  - Filter by MDA
  - Date range picker

- **Actions**:
  - View details
  - Edit record
  - Download attachments
  - Change status

### Screenshot Placeholder
```
[Insert screenshot of correspondence register here]
Path: /docs/screenshots/correspondence-register.png
```

---

### Contracts Register

**Route:** `/management/contracts-register`

#### Features
- **Data Table** with columns:
  - Contract Number
  - Date Received
  - Originating MDA
  - Subject
  - Nature of Contract
  - Category
  - Contract Type
  - Status/Stage

- **Contract Types**:
  - New
  - Renewal
  - Supplemental
  - Amendment

- **Nature Categories**:
  - Goods
  - Works
  - Consultancy/Services

### Screenshot Placeholder
```
[Insert screenshot of contracts register here]
Path: /docs/screenshots/contracts-register.png
```

---

### Reports & Analytics

**Route:** `/management/reports`

#### Features
- Generate custom reports
- Export to PDF/Excel
- Date range selection
- MDA filtering
- Visual analytics with charts

### Screenshot Placeholder
```
[Insert screenshot of reports page here]
Path: /docs/screenshots/reports-analytics.png
```

---

### MDA Management

**Route:** `/management/mda`

#### Features
- List of all registered MDAs
- MDA statistics (contracts, correspondence counts)
- Add new MDA functionality
- Edit MDA details
- Contact information management

### Screenshot Placeholder
```
[Insert screenshot of MDA management here]
Path: /docs/screenshots/mda-management.png
```

---

### User Management

**Route:** `/management/users`

#### Features
- User list with roles
- Add new users
- Edit user permissions
- Role assignment (Admin, Reviewer, Viewer)
- Activity logs

### Screenshot Placeholder
```
[Insert screenshot of user management here]
Path: /docs/screenshots/user-management.png
```

---

### Settings

**Route:** `/management/settings`

#### Tabs
1. **General** - Portal name, logo, timezone
2. **Notifications** - Email alerts, in-app notifications
3. **Security** - Password policies, session timeout
4. **System** - Backup, maintenance mode

### Screenshot Placeholder
```
[Insert screenshot of settings page here]
Path: /docs/screenshots/settings.png
```

---

## Ask Rex AI Assistant

### Overview
"Ask Rex" is an AI-powered assistant integrated into the management portal. It appears as a floating button in the top-right corner of all management pages.

### Visual Design

#### Closed State
- Floating button with green gradient (`emerald-500` to `green-600`)
- "Ask Rex" label badge
- Bot icon with sparkle effect
- Position: Top-right corner (`top-20 right-6`)

#### Open State
- Chat panel: 400px width, 550px height
- Green gradient header with Rex branding
- Chat message area with scroll
- Input field with send button
- Voice input support (microphone button)
- Text-to-speech support (speaker button)

### Screenshot Placeholder
```
[Insert screenshot of Ask Rex closed state here]
Path: /docs/screenshots/ask-rex-button.png

[Insert screenshot of Ask Rex open/chat state here]
Path: /docs/screenshots/ask-rex-chat.png
```

### Capabilities

#### Report Generation
- Contracts reports with full table display
- Correspondence reports with detailed columns
- Combined reports
- Filtered by period, MDA, status

#### Search Functions
- Search correspondence records
- Search contracts
- Filter by various criteria

#### Statistics
- Portal-wide statistics
- MDA-specific analytics
- Status breakdowns

#### Help & Guidance
- Portal navigation help
- Feature explanations
- Quick action suggestions

### Message Display

#### User Messages
- Right-aligned
- Primary color background
- White text

#### Rex Messages
- Left-aligned
- Light background with emerald accent
- Tool results displayed in formatted cards/tables

### Tool Result Displays

#### Contracts Table
- Emerald-themed header
- Columns: Date Received, Originating MDA, Subject, Nature, Category, Contract #, Type, Status
- Color-coded status badges

#### Correspondence Table
- Blue-themed header
- Columns: Date Received, Originating MDA, Subject, Reference #, Category, Type, Status, Date Completed
- Color-coded status badges

#### Statistics Cards
- Grid layout (3 columns)
- Total, Approved, Pending counts
- Color-coded values

### Screenshot Placeholder
```
[Insert screenshot of Rex displaying a report here]
Path: /docs/screenshots/ask-rex-report.png
```

---

## Component Library

### UI Components Used

| Component | Usage |
|-----------|-------|
| `Button` | Actions, form submissions |
| `Card` | Content containers, statistics |
| `Input` | Form fields, search |
| `Badge` | Status indicators |
| `Table` | Data display |
| `Dialog` | Modals, confirmations |
| `DropdownMenu` | User menu, actions |
| `Sheet` | Mobile navigation |
| `Breadcrumb` | Navigation hierarchy |
| `ScrollArea` | Scrollable containers |
| `Tabs` | Settings organization |

### Custom Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AskRex` | `/components/ask-rex.tsx` | AI chat assistant |
| `ManagementLayout` | `/app/management/layout.tsx` | Portal layout wrapper |

---

## Navigation & Breadcrumbs

### Breadcrumb Configuration

```typescript
const breadcrumbConfig = {
  "/management": { label: "Dashboard" },
  "/management/registers": { label: "Registers", parent: "/management" },
  "/management/correspondence-register": { label: "Correspondence Register", parent: "/management/registers" },
  "/management/contracts-register": { label: "Contracts Register", parent: "/management/registers" },
  "/management/reports": { label: "Reports & Analytics", parent: "/management" },
  "/management/users": { label: "User Management", parent: "/management" },
  "/management/mda": { label: "MDA Management", parent: "/management" },
  "/management/settings": { label: "Settings", parent: "/management" },
}
```

### Breadcrumb Display
- Always shows "Home" link to landing page
- Hierarchical navigation path
- Current page displayed as non-clickable text
- Separator: Chevron right icon

### Screenshot Placeholder
```
[Insert screenshot of breadcrumb navigation here]
Path: /docs/screenshots/breadcrumbs.png
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 768px | Sidebar hidden, hamburger menu, full-width content |
| Tablet | 768px - 1024px | Collapsible sidebar, adjusted spacing |
| Desktop | > 1024px | Full sidebar, optimal layout |

### Mobile Adaptations
- Sidebar becomes Sheet (slide-out drawer)
- Tables become scrollable horizontally
- Cards stack vertically
- Ask Rex button repositions appropriately

---

## File Structure

```
/app
  /management
    layout.tsx          # Management portal layout with sidebar & breadcrumbs
    page.tsx            # Dashboard
    /correspondence-register
      page.tsx          # Correspondence listing
    /contracts-register
      page.tsx          # Contracts listing
    /reports
      page.tsx          # Reports & analytics
    /mda
      page.tsx          # MDA management
    /users
      page.tsx          # User management
    /settings
      page.tsx          # Portal settings
  /api
    /rex
      route.ts          # Ask Rex API endpoint

/components
  ask-rex.tsx           # Ask Rex AI assistant component
  /ui
    (shadcn components)
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | Initial | Landing page, basic management layout |
| v2.0 | - | Added correspondence and contracts registers |
| v3.0 | - | Implemented Ask Rex AI assistant |
| v4.0 | - | Added breadcrumbs navigation |
| v5.0 | - | Enhanced Rex with report generation |
| Current | - | Full feature implementation |

---

## Adding Screenshots

To add screenshots to this documentation:

1. Navigate to each page in the portal
2. Take a screenshot (use browser dev tools for consistent sizing)
3. Save screenshots to `/docs/screenshots/` directory
4. Update the placeholder paths in this document with actual image references

### Recommended Screenshot Sizes
- Full page: 1920x1080 or 1440x900
- Component close-ups: 800x600
- Mobile views: 375x812 (iPhone size)

---

## Contact

For questions about this design documentation, please contact the development team.
