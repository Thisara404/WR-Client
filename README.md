# Gather — Workshop Registration Client (`WR-Client`)

A modern, responsive, role-based single-page application built for community workshop registration management across multi-centre learning hubs.

- **Live Deployment:** [https://gather-seven-mocha.vercel.app/](https://gather-seven-mocha.vercel.app/)
- **Backend Repository:** [Thisara404/WR-Server](https://github.com/Thisara404/WR-Server)

---

## Overview

**Gather** provides an intuitive, high-contrast, accessible staff interface for managing community workshop registrations. It enforces strict role-based view isolation directly reflecting the backend security matrix.

### Role Perspectives
- **Admin:** Dedicated account provisioning workspace with full audit trails of staff accounts created. (Admins cannot access operational workshops to preserve separation of concerns).
- **Manager:** Complete catalogue control — create new workshops, edit capacity and schedules, inspect real-time attendee rosters, register attendees, and review comprehensive audit history.
- **Staff:** Front-desk workflow — view upcoming workshops, search and filter by date/location/seats, perform atomic attendee registrations, cancel bookings with confirmation reasons, and view booking history.

---

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7 (instant HMR, fast production bundling)
- **Styling:** Custom Vanilla CSS Design System (clean dark-navy & ivory theme, custom components, responsive mobile-friendly layouts, no bloated UI framework dependencies)
- **Deployment:** Vercel (seamless single-origin `/api` proxy rewrites preserving HttpOnly cookies without cross-origin cookie restrictions)

---

## Demonstration Credentials

Pre-configured demo accounts for assessment testing:

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@workshop.local` | `AdminPractice123!` | Create Manager & Staff accounts, view user audit logs |
| **Manager** | `manager@workshop.local` | `ManagerPractice123!` | Create/edit workshops, register attendees, cancel bookings, view audits |
| **Staff** | `staff@workshop.local` | `StaffPractice123!` | View workshops, register attendees, cancel bookings, view attendee rosters |

---

## Local Setup & Development

### 1. Prerequisites
- Node.js `v22.12.0` or higher
- Running instance of the backend API (see [WR-Server](https://github.com/Thisara404/WR-Server))

### 2. Installation
```bash
git clone https://github.com/Thisara404/WR-Client.git
cd WR-Client
npm install
```

### 3. Local Development
Start the local Vite development server:
```bash
npm run dev
```
The application runs at `http://localhost:5173`. In local development, Vite proxies all `/api/*` calls directly to the backend at `http://127.0.0.1:3001`.

### 4. Code Verification & Production Build
```bash
# Type check TypeScript without emitting files
npm run lint

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Key Frontend Features

1. **HttpOnly Cookie Authentication:** Sessions are maintained via secure, signed HttpOnly cookies. The frontend listens to global `session-expired` events and gracefully returns users to the login screen.
2. **Idempotency & Retry Safety:** Registration requests generate and reuse client UUID request IDs. Retrying a submission with the same input after a network blip replays the confirmed booking safely without charging double seats.
3. **Optimistic & Accurate Capacity Indicators:** Dynamic visual capacity bars clearly show available, low, and sold-out seats.
4. **Adaptive Role Views:** Navigation and operational controls automatically adapt to the logged-in user's role.
5. **Brand Assets & Favicons:** High-contrast ivory and navy branding assets (`gather-logo-on-navy.webp`, multi-size favicon suite) ensures crisp visual clarity across both dark and light browser tabs.

---

## Deployment Configuration

In production on Vercel, `vercel.json` rewrites all `/api/:path*` requests to the deployed backend server (`WR-Server`). This enables a same-site cookie model, preventing cross-site cookie blocking in modern browsers (Safari ITP, Chrome Privacy Sandbox).
