# ST. MARY'S ENGLISH SCHOOL — IT CLUB PLATFORM
## Master System Architecture & Development Constitution
*Prompt 1 Foundation Deliverable*

---

### 1. Architectural Overview & Philosophy

The **St. Mary's English School (SMES) IT Club Platform** is a multi-tier, full-stack, cloud-connected academic organization application. It serves as:
1. **Public Digital Portal**: Showcases club leadership, student innovations, academic resources, previous question papers, achievements, event schedules, published notices, photo albums, and a public certificate verification system.
2. **Authenticated Member Portal**: Provides registered students and club members with a personalized dashboard, portfolio management, quiz/test participation, exam document downloads, personalized notifications, and verified credentials.
3. **Administrative Control Center (CMS)**: Enables faculty moderators, IT Club administrators, and club heads to manage content (members, notices, events, projects, resources, quizzes, certificates) with complete publishing workflows, role management, file storage, and audit logging—without editing source code.

---

### 2. Technology Stack & Framework Choices

| Layer | Technology | Rationale & Architectural Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Component-based, modern hooks, strict type safety across all domain entities. |
| **Build & Dev Tooling** | Vite 6 | High-speed ESM development and production build pipeline. |
| **Styling & UI System** | Tailwind CSS v4 | Mathematical spacing, modern design tokens, accessible mobile-first responsive utilities. |
| **Iconography** | Lucide React | Clean, consistent, accessible iconography. |
| **Cloud Database** | Supabase (PostgreSQL 15+) | Authoritative persistent single source of truth. ACID-compliant relational data modeling. |
| **Authentication** | Supabase Auth (GoTrue) | JWT-based sessions, secure cookie/storage tokens, zero plain-text passwords in app tables. |
| **Authorization** | PostgreSQL Row Level Security (RLS) | Server-authoritative data security enforced at the database level. Frontend roles are UX-only. |
| **Cloud File Storage** | Supabase Storage | High-durability object storage for media, PDF question papers, and certificate assets. |
| **Server Runtime** | Node.js / Express (Integrated) | Isolated server-side operations utilizing `SUPABASE_SERVICE_ROLE_KEY` strictly out of client reach. |

---

### 3. Core Architectural Rules (Development Constitution)

1. **Single Source of Truth**: Supabase is the sole authoritative repository of data. Browser storage (`localStorage`, `sessionStorage`), in-memory state, or hardcoded arrays must NEVER be treated as the database.
2. **Database-First Design**: Every persistent feature corresponds to an explicit database table, primary key, foreign key relationship, and status lifecycle.
3. **Security by Default & Zero-Trust Client**: The client is never trusted for authorization. Hiding UI elements is UX, not security. Every protected action must be backed by database RLS and server authorization.
4. **Separation of Authentication & Authorization**: Authentication verifies *who* the user is; authorization determines *what* roles and capabilities (`visitor`, `member`, `admin`, `super_admin`) they are permitted to execute.
5. **Strict Credential Isolation**:
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`: Client-safe public credentials injected by Vite.
   - `SUPABASE_SERVICE_ROLE_KEY`: Server-only credential. **Strictly forbidden** from client bundles, browser JavaScript, public HTML, or Git tracking.
6. **No Hard-Coded Business Data**: Members, notices, events, projects, resources, quizzes, and certificates must all be database-driven and manageable via the Admin CMS.
7. **Graceful Empty States**: An empty database table is an ordinary initial state, not an error. The UI must render clear empty state guidance rather than failing or reporting connection loss.
8. **Reversible Lifecycles**: Content transitions through `draft` → `published` → `archived`. Deletions should prefer soft-delete or archiving with confirmation to prevent accidental loss.

---

### 4. Application Directory Structure

```text
/
├── .env.example                     # Declared environment variables (no secrets)
├── ARCHITECTURE.md                  # This foundational master specification
├── index.html                       # HTML5 entry point with synchronized school metadata
├── metadata.json                    # Application metadata & frame permissions
├── package.json                     # Dependencies & build scripts
├── public/                          # Static assets and school branding
├── src/
│   ├── components/                  # Modular Presentation Layer
│   │   ├── auth/                    # Auth providers, login modals, route guards
│   │   │   ├── AuthProvider.tsx     # Context & session management
│   │   │   └── ProtectedRoute.tsx   # Tier & role boundary guard
│   │   ├── layout/                  # Navigation, Header, Footer, Sidebars
│   │   ├── ui/                      # Shared Primitive UI Components
│   │   │   ├── Badge.tsx            # Status pills & tags
│   │   │   ├── Button.tsx           # Accessible buttons with loading states
│   │   │   ├── Card.tsx             # Standard container with mathematically correct radii
│   │   │   ├── EmptyState.tsx       # Standardized empty collection notices
│   │   │   ├── Input.tsx            # Accessible form inputs with validation labels
│   │   │   ├── Modal.tsx            # Accessible modal dialogs
│   │   │   └── SkeletonLoader.tsx   # Loading placeholders for async queries
│   │   └── ArchitectureDashboard.tsx# Prompt 1 System visualization & foundation verification
│   ├── constants/                   # Constants & Design Tokens
│   │   ├── branding.ts              # St. Mary's English School colors, motto, pillars
│   │   └── routes.ts                # Public, Member, and Admin route registry
│   ├── lib/                         # Core Libraries & Utilities
│   │   ├── errorHandler.ts          # Centralized error sanitization & user-safe reporting
│   │   ├── supabaseClient.ts        # Client-side Supabase SDK instance & connection checker
│   │   └── validation.ts            # Input validation, formatters, and file safety checks
│   ├── server/                      # Server-Only Isolation Layer
│   │   └── supabaseAdmin.ts         # Secure server-side Supabase admin client (service-role)
│   ├── services/                    # Data Access Layer (DAL)
│   │   ├── authService.ts           # Authentication & profile management
│   │   ├── baseService.ts           # Common query execution & pagination wrappers
│   │   └── dataServices.ts          # Typed contracts for notices, members, projects, etc.
│   ├── types/                       # Global TypeScript Domain Models
│   │   └── index.ts                 # Authoritative TypeScript types for all 18 domains
│   ├── App.tsx                      # Root application component & tier coordinator
│   ├── index.css                    # Tailwind CSS v4 entry point
│   └── main.tsx                     # React DOM initialization
├── tsconfig.json                    # TypeScript compiler settings
└── vite.config.ts                   # Vite build configuration
```

---

### 5. Multi-Tier Role & Authorization Matrix

| Domain Feature | Public Visitor | Club Member | Club Admin | Super Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse Public Home, About, Team | Read | Read | Read | Read |
| View Published Projects & Events | Read | Read | Read | Read |
| View Public Notices & News | Read | Read | Read | Read |
| Download Public Question Papers | Read | Read | Read | Read |
| Verify Certificate by Code | Verify Only | Verify Only | Verify & Inspect | Full Audit |
| Submit Contact Message | Create | Create | Review/Manage | Review/Manage |
| Authenticate / Manage Own Profile | ❌ | Read/Update Own | Read/Update Own | Read/Update All |
| Receive Targeted Notifications | ❌ | Read Own | Read Own | Read/Send All |
| Attempt Online Quizzes & Tests | ❌ | Participate | Review/Test | Manage All |
| View Exam Results & Transcripts | ❌ | View Own | Grade/Publish | Grade/Publish |
| Download Member-Only Resources | ❌ | Read | Read/Manage | Read/Manage |
| Admin CMS (Create/Publish/Archive) | ❌ | ❌ | Full Access | Full Access |
| Manage User Roles & Permissions | ❌ | ❌ | ❌ | Full Access |
| View Security & Audit Logs | ❌ | ❌ | ❌ | Full Access |

---

### 6. Client vs. Server Secret Separation

```
+-------------------------------------------------------------------------------+
| BROWSER / CLIENT LAYER (Vite SPA)                                              |
|                                                                               |
|  - Uses: import.meta.env.VITE_SUPABASE_URL                                    |
|  - Uses: import.meta.env.VITE_SUPABASE_ANON_KEY                               |
|  - Instantiated via: src/lib/supabaseClient.ts                                |
|  - Scope: PostgREST queries subject to Postgres Row Level Security (RLS)     |
|  - CANNOT bypass RLS or view unauthorized records                             |
+-------------------------------------------------------------------------------+
                                      |
                                      v [Network / HTTPS API]
+-------------------------------------------------------------------------------+
| SUPABASE CLOUD (Managed PostgreSQL + Auth + Storage + RLS)                    |
|                                                                               |
|  - Evaluates user JWT against auth.uid()                                      |
|  - Enforces table-level and row-level policies                                |
+-------------------------------------------------------------------------------+
                                      ^
                                      | [Direct Internal Call]
+-------------------------------------------------------------------------------+
| SERVER-SIDE ISOLATION LAYER (Node.js / Express Runtime)                       |
|                                                                               |
|  - Uses: process.env.SUPABASE_SERVICE_ROLE_KEY                                 |
|  - Instantiated via: src/server/supabaseAdmin.ts                              |
|  - Scope: System audits, automated result computations, administrative sync  |
|  - NEVER sent or bundled to browser JavaScript                                |
+-------------------------------------------------------------------------------+
```

---

### 7. Data Access Layer (DAL) Architecture

Components never call raw SQL or construct ad-hoc queries with magic strings.
All data interactions flow through dedicated service modules:

```text
[ React Component / UI View ]
             ↓ (invokes typed action)
[ Service Layer (e.g., noticeService.getPublishedNotices) ]
             ↓ (applies filters, pagination, validation)
[ Supabase Client / PostgREST ]
             ↓ (authenticated with session JWT)
[ PostgreSQL + RLS Policy Engine ]
             ↓ (returns typed dataset or sanitized PostgrestError)
[ Error Handler (sanitizes database internals into user-safe notice) ]
             ↓
[ Component Renders Loading / Success / Empty / Error State ]
```

---

### 8. Storage Architecture & Privacy Boundaries

File storage in Supabase is partitioned into segregated buckets with dedicated policies:

1. **`public-assets`** (Public Read):
   - School crest, IT club banners, published event photos, approved project screenshots.
2. **`member-portfolios`** (Public Read / Owner Write):
   - Member profile avatars, member project attachments.
3. **`academic-documents`** (Public/Member Read / Admin Write):
   - Question papers, model answer keys, curriculum syllabi, worksheets.
4. **`certificates`** (Restricted Access):
   - Generated certificate PDFs, lookup verification records.
5. **`admin-archives`** (Admin-Only):
   - Internal audit reports, database backups, administrative documentation.

---

### 9. Prompt Roadmap & Execution Progression

- **Prompt 1 (Current)**: Master Architecture, Constitution, Project Foundation, Client/Server Boundaries.
- **Prompt 2**: Database Schema, Relations, Constraints & Migration Baseline.
- **Prompt 3**: Authentication, Role Claims, Session Management & RLS Security Policies.
- **Prompt 4**: Supabase Storage, Bucket Configuration & File Management.
- **Prompt 5**: School Design System, Typography & Branding Token Foundation.
- **Prompt 6**: Public Portal Global Layout & Navigation Architecture.
- **Prompt 7**: Member Directory, Leadership Profiles & Individual Portfolios.
- **Prompt 8**: Authenticated Member Dashboard & Personal Workspace.
- **Prompt 9**: Admin CMS Control Center & Content Management Workflows.
- **Prompt 10**: Notice Board, In-App Popups & Targeted Notifications.
- **Prompt 11**: Projects, Events, Achievements & Media Gallery CMS.
- **Prompt 12**: Academic Learning Hub & Resource Document Management.
- **Prompt 13**: Interactive Quiz & Online Assessment Engine.
- **Prompt 14**: Question Papers, Model Answers & Examination Results.
- **Prompt 15**: Verified Certificate Generation & Public Lookup Engine.
- **Prompt 16**: Unified Cross-System Search & Filter Architecture.
- **Prompt 17**: Security Hardening, Edge-Case Auditing & Error Handling.
- **Prompt 18**: Full Production Integration, Performance Optimization & Verification.
