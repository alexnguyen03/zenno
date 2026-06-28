# Zenno — Roadmap

> A self-hosted, LAN-first internal collaboration ecosystem for teams.  
> Private by default. No data leaves your network.

---

## Vision

Replace Slack + Notion + Jira + Miro with a single, simple-to-deploy platform that runs entirely on your company's internal network. One `docker compose up`, everything works.

**Core principles:**
- **Private by default** — zero cloud dependencies, no telemetry, no external calls
- **Simple to deploy** — ≤3 Docker containers, runs on a spare PC or NAS
- **LAN-first** — designed for internal networks, remote access via VPN
- **Browser-based** — no client installation, works on any OS
- **Open source** — MIT license, community-driven

---

## Target Users

- SMBs (10–200 people) in Vietnam / Southeast Asia
- Industries with strict data privacy needs: healthcare, legal, finance, government
- Teams already using VPN for remote work
- Companies wanting to cut SaaS costs without sacrificing collaboration quality

---

## Phase 1 — MVP `v0.1`

> Goal: a working internal tool that covers daily communication and task tracking.

### Auth & Workspace
- [ ] User registration and login (email + password)
- [ ] Single workspace per deployment (one company = one instance)
- [ ] Teams — create groups within the workspace (e.g. Engineering, Marketing)
- [ ] Roles: `admin` and `member` at workspace level
- [ ] Team-level role: `team_admin` and `member`

### Chat
- [ ] Channels (team-scoped or public)
- [ ] Direct messages (1-on-1)
- [ ] @mention with in-app notification
- [ ] Emoji reactions
- [ ] File attachments in messages (upload + download + preview)
- [ ] Message edit and delete
- [ ] Online presence indicator

### Documents (Realtime Collaborative)
- [ ] Rich text editor (Tiptap + Yjs)
- [ ] Realtime co-editing with live cursors
- [ ] Visibility: private / team / workspace
- [ ] Nested pages (parent → child)

### Task Management
- [ ] Create tasks with title, description, assignee, due date
- [ ] Kanban board view (columns: Todo / In Progress / Done)
- [ ] Task comments
- [ ] Assign to team or individual

### Notifications
- [ ] In-app notification center
- [ ] Notify on: @mention, task assigned, task due date approaching

### File Storage
- [ ] Upload files (any type)
- [ ] Attach to messages, tasks, documents
- [ ] Browse uploaded files per team
- [ ] Local filesystem storage (no S3/MinIO required)

### Search
- [ ] Global search across: messages, documents, tasks, files
- [ ] Filter by type (doc / task / message)

### Admin Panel
- [ ] Invite / remove users
- [ ] Create / delete teams
- [ ] View storage usage

---

## Phase 2 — Collaboration Layer `v0.2`

> Goal: richer collaboration and visibility features.

- [ ] **Whiteboard** — Excalidraw embedded, realtime multi-user canvas
- [ ] **Document version history** — restore previous snapshots
- [ ] **Thread replies in chat** — keep context without cluttering channels
- [ ] **Read receipts** in direct messages
- [ ] **Calendar view** for tasks — see deadlines on a timeline
- [ ] **Document templates** — meeting notes, project brief, weekly report
- [ ] **Drag-and-drop file upload** everywhere

---

## Phase 3 — Power Features `v0.3`

> Goal: cover advanced use cases and integrations.

- [ ] **Spreadsheet** — realtime collaborative spreadsheet (Univer)
- [ ] **Video / Audio call** — self-hosted via Jitsi integration
- [ ] **Recurring tasks**
- [ ] **Task dependencies** (block / blocked by)
- [ ] **Audit logs** — who changed what, when
- [ ] **Public API** — REST endpoints for external integrations
- [ ] **Webhooks** — trigger on events (task created, message sent, etc.)
- [ ] **Export to PDF** for documents

---

## Phase 4 — Enterprise & Scale `v0.4`

> Goal: make Zenno viable for larger organizations.

- [ ] **SSO** — SAML 2.0 / LDAP / Active Directory integration
- [ ] **Org chart** — department hierarchy, manager visibility
- [ ] **Approval workflows** — request → manager approves
- [ ] **Data retention policies**
- [ ] **Multi-instance / federation** (multiple offices, each with own instance)
- [ ] **Mobile app** — React Native, works over VPN

---

## Tech Stack (Planned)

| Layer | Choice | Reason |
|---|---|---|
| Frontend | SvelteKit or Next.js | Fast, modern, good DX |
| Backend | Node.js (TypeScript) | Unified language with frontend |
| Realtime | Yjs + Hocuspocus | CRDT, proven in production |
| Rich text | Tiptap | Built on Yjs, extensible |
| Whiteboard | Excalidraw SDK | MIT, self-hostable |
| Spreadsheet | Univer | Open source, realtime-ready |
| Database | PostgreSQL | Single DB, no complexity |
| Auth | Better Auth or Lucia | Lightweight, self-hosted |
| File storage | Local filesystem | No MinIO/S3 dependency |
| Package mgr | pnpm workspaces | Monorepo, fast |
| Deploy | Docker Compose (≤3 containers) | Simple, one-command |

---

## Repo Structure (Planned)

```
zenno/
├── apps/
│   ├── web/          # Frontend (SvelteKit / Next.js)
│   └── server/       # Backend API + WebSocket server
├── packages/
│   ├── db/           # Prisma schema + migrations
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared UI components
├── docker-compose.yml
├── ROADMAP.md
└── README.md
```

---

## Deployment Model

```
Company LAN
┌─────────────────────────────────┐
│  Server (any spare machine)     │
│  ┌─────────────────────────┐    │
│  │  docker compose up      │    │
│  │  ├── zenno-app          │    │
│  │  ├── postgres           │    │
│  │  └── redis (optional)   │    │
│  └─────────────────────────┘    │
│  Accessible at: 192.168.x.x     │
└─────────────────────────────────┘
         ↑ LAN only
  Remote access via VPN (WireGuard / existing VPN)
```

---

## Permission Model

```
Workspace
├── admin     — manage users, teams, settings
└── member    — use all features

Team (within workspace)
├── team_admin  — manage team members
└── member

Content visibility
├── private   — creator only
├── team      — all team members
└── public    — everyone in workspace
```

---

*This roadmap is a living document. Features and priorities will evolve based on real usage and community feedback.*
