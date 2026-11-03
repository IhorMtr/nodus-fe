# Nodus Frontend

Nodus is a team communication platform that brings workspaces, channels, direct
conversations and announcements together in one focused place. This repository
contains the web client: a Next.js application that talks to the Nodus backend
over a REST API and Socket.IO.

## Features

- **Authentication** — registration, login, logout and silent session refresh.
  The refresh token is kept in an HTTP-only cookie managed by Next.js route
  handlers; API requests use a short-lived JWT Bearer token.
- **Workspaces** — onboarding, creation, renaming and deletion, plus switching
  between workspaces.
- **Members and invitations** — member list with roles (Owner, Admin, Member),
  role changes, member removal, and invite links.
- **Channels** — channel creation, renaming and deletion, with real-time
  messaging, message editing and deletion, unread counters and read state.
- **Direct conversations** — one-to-one messaging with read receipts.
- **Presence** — online, away, do-not-disturb and offline statuses, updated in
  real time.
- **Notifications** — real-time notification center with read tracking.
- **Announcements** — workspace announcements with optional scheduled
  publication.
- **Search** — message search within a channel, with navigation to the message
  in its surrounding context.
- **Overview** — workspace dashboard with activity metrics for managers.
- **Personal settings** — account details, light and dark themes, and language
  selection, available as a modal or a standalone page.
- **Localization** — Ukrainian (default) and English.

## Tech stack

| Area            | Technology                                              |
| --------------- | ------------------------------------------------------- |
| Framework       | Next.js 16 (App Router), React 19                       |
| Language        | TypeScript (strict mode)                                |
| UI components   | Mantine 9, Lucide icons                                 |
| Styling         | SCSS Modules, CSS custom properties as design tokens    |
| Server state    | TanStack Query 5                                        |
| Client state    | Zustand                                                 |
| Forms           | React Hook Form, Yup                                    |
| HTTP            | Axios                                                   |
| Real time       | Socket.IO client                                        |
| Localization    | next-intl                                               |
| Dates           | date-fns                                                |
| Testing         | Vitest, Testing Library, MSW, jsdom                     |
| Code quality    | ESLint (Next.js config), Prettier                       |

## Project structure

The source code follows a domain-oriented, layered architecture:

```text
src/
  app/       Next.js routing, layouts, route handlers and scoped providers
  views/     Route-specific screens with their page hooks and sections
  widgets/   Reusable application-level UI, such as the workspace shell
  domains/   Business areas: API access, queries, mutations, types, domain UI
  shared/    Domain-neutral UI primitives, HTTP, i18n, theme and design tokens
messages/    Translation files for each locale (en, uk)
public/      Static assets and product images
```

Dependencies flow in one direction: `app → views → widgets → domains → shared`.
The full set of rules is described in
[docs/architecture.md](docs/architecture.md).

## Getting started

### Requirements

- Node.js 24
- npm 11 or newer
- A running instance of the Nodus backend

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example` and point it to the backend:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

   Set `NEXT_PUBLIC_SOCKET_DEBUG=true` to log real-time events in the browser
   console.

3. Start the development server:

   ```bash
   npm run dev
   ```

## Scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Start the development server        |
| `npm run build`        | Create a production build           |
| `npm run start`        | Serve the production build          |
| `npm run test`         | Run unit tests once                 |
| `npm run test:watch`   | Run unit tests in watch mode        |
| `npm run lint`         | Lint the project with ESLint        |
| `npm run format`       | Format the project with Prettier    |
| `npm run format:check` | Check formatting without writing it |
