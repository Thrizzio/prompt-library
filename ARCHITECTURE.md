# Architecture Documentation: Personal Prompt Library

## 1. Product Purpose and Scope
The Personal Prompt Library is a fast, responsive, and minimal web utility designed for individuals to store, categorize, retrieve, and copy AI prompts reliably. 

The application is tailored as an uncluttered personal tool:
- Fast client-side retrieval and instant search.
- Zero markdown execution risk (plain-text rendering).
- 100% reliable clipboard copying preserving exact whitespace.
- Secure persistence backed by Supabase PostgreSQL with strict Row Level Security (RLS).
- Responsive on all devices from 320px mobile screens to wide desktop monitors.

---

## 2. Technology Choices and Rationale

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript | Strict type safety, predictable state rendering, and robust component model. |
| **Build Tool** | Vite | Instant Hot Module Replacement (HMR), lightweight bundle size, and fast production builds. |
| **Styling** | Tailwind CSS | Utility-first CSS ensuring minimal runtime overhead, consistent design tokens, and rapid responsive adjustments. |
| **Icons** | Lucide React | Lightweight, clean, accessible SVG icons with zero bloat. |
| **Persistence & Auth** | Supabase (PostgreSQL + Auth + RLS) | Direct client queries secured via database policies, avoiding unnecessary custom backend boilerplates. |
| **Testing** | Vitest + React Testing Library | Blazing fast ESM-native test runner compatible with Vite configuration; contract and component behavior validation. |

---

## 3. High-Level Architecture

The application adopts a **Serverless 2-Tier Architecture**:

```
+-----------------------------------------------------------+
|                      Browser / Client                     |
|                                                           |
|  +-----------------------------------------------------+  |
|  |                 React UI Components                 |  |
|  |    (AppShell, PromptCard, PromptModal, SearchBar)   |  |
|  +---------------------------+-------------------------+  |
|                              |                            |
|  +---------------------------v-------------------------+  |
|  |             Custom Hooks / State Services           |  |
|  |       (useAuth, usePrompts, useCategories)         |  |
|  +---------------------------+-------------------------+  |
|                              |                            |
|  +---------------------------v-------------------------+  |
|  |        Supabase Client SDK + Local Validator        |  |
|  +---------------------------+-------------------------+  |
+------------------------------|----------------------------+
                               | HTTPS / WSS
                               | (Anon Key + JWT)
+------------------------------v----------------------------+
|                     Supabase Platform                     |
|                                                           |
|  +-----------------------+     +-----------------------+  |
|  |     Supabase Auth     |     |   PostgreSQL Database |  |
|  | (Session / JWT tokens)|     |   - prompts table     |  |
|  +-----------------------+     |   - categories table  |  |
|                                |   - Row Level Security|  |
|                                +-----------------------+  |
+-----------------------------------------------------------+
```

1. **Authentication Flow:** Supabase Auth manages sessions. JWT tokens are stored securely in localStorage and automatically attached to requests.
2. **Data Layer:** Direct PostgreSQL operations via the Supabase client.
3. **Authorization:** Row Level Security (RLS) guarantees data isolation at the database engine level.

---

## 4. Directory Structure

```text
.
├── .env.example
├── .gitignore
├── ARCHITECTURE.md
├── README.md
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── supabase/
│   └── migrations/
│       └── 20261024000000_init_prompt_library.sql
├── src/
│   ├── main.tsx             # Application entrypoint
│   ├── App.tsx              # Root app component & state provider
│   ├── index.css            # Tailwind directives & design tokens
│   ├── types/
│   │   ├── database.ts      # Database & domain models
│   │   └── prompt.ts        # UI contracts, filters, & form schemas
│   ├── lib/
│   │   ├── supabase.ts      # Validated Supabase client instance
│   │   ├── validation.ts    # Input length & formatting validators
│   │   └── clipboard.ts     # Resilient clipboard copy helper
│   ├── hooks/
│   │   ├── useAuth.ts       # Auth session & listener hook
│   │   ├── usePrompts.ts    # Prompts CRUD & optimistic filtering
│   │   └── useCategories.ts # Categories fetch & creation hook
│   ├── components/
│   │   ├── common/          # Button, Input, Modal, Badge, Toast
│   │   ├── auth/            # AuthModal / LoginForm / SignUpForm
│   │   ├── layout/          # Header, Sidebar, Navigation
│   │   └── prompts/         # PromptCard, PromptList, PromptModal, SearchFilter
│   └── tests/
│       ├── setup.ts         # Vitest DOM test environment
│       ├── clipboard.test.ts
│       ├── validation.test.ts
│       └── prompts.test.tsx
```

---

## 5. Data Model and Relationships

### PostgreSQL Schema

#### 1. `categories` Table
Stores user-specific categories for organizing prompts.

```sql
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)
);
```

#### 2. `prompts` Table
Stores prompts authored by users.

```sql
CREATE TABLE public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX idx_prompts_category_id ON public.prompts(category_id);
CREATE INDEX idx_prompts_is_favorite ON public.prompts(user_id, is_favorite);
CREATE INDEX idx_prompts_created_at ON public.prompts(user_id, created_at DESC);
```

---

## 6. Authentication and Authorization Strategy

- **Supabase Auth** is used for email/password and magic-link authentication.
- **Session Lifecycle:** Managed with `supabase.auth.onAuthStateChange`. Session state is synchronized in React context (`useAuth`).
- **Unauthenticated State:** Prompts cannot be viewed or modified without an active authenticated session. A clean, non-intrusive authentication modal or landing view allows sign-in / registration.

---

## 7. Database Security and Row Level Security (RLS)

All public tables enforce strict RLS:

```sql
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Categories RLS
CREATE POLICY "Users can manage their own categories"
ON public.categories
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Prompts RLS
CREATE POLICY "Users can manage their own prompts"
ON public.prompts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

Cross-tenant data leakage is fundamentally prevented by PostgreSQL evaluating `auth.uid() = user_id`. Even with malicious client queries, unauthorized records cannot be fetched, created, or mutated.

---

## 8. Environment Variable Requirements

Required client environment variables (validated upon startup):
- `VITE_SUPABASE_URL`: HTTPS endpoint for the Supabase project.
- `VITE_SUPABASE_ANON_KEY`: Safe public/anonymous client key protected by RLS.

*Note:* Service role keys are never exposed in frontend code.

---

## 9. Data Validation and Error-Handling Strategy

- **Validation Rules:**
  - `title`: Required, trimmed, 1–150 characters.
  - `content`: Required, preserved exact whitespace, 1–50,000 characters.
  - `tags`: Array of alphanumeric words (max 10 tags, max 30 chars per tag).
  - `category_id`: Valid UUID or null.
- **XSS & Output Safety:** Prompt content is rendered strictly as plain text (CSS `white-space: pre-wrap`) inside `<pre>` or `<div>`. `dangerouslySetInnerHTML` is prohibited.
- **Error Handling:** Client presents user-friendly feedback via unobtrusive toasts and preserves form inputs when network or validation errors arise.

---

## 10. Search and Clipboard Behavior

### Search & Filtering
- Client-side real-time filtering across `title`, `content`, and `tags`.
- Zero latency for personal libraries (< 10,000 items).
- Filter controls: Category selector, "Favorites only" toggle, and full-text keyword matching.
- Clear button to quickly reset active filters.

### Clipboard Action
- Uses modern `navigator.clipboard.writeText()` with fallback to a hidden textarea copy mechanism for older contexts.
- Strict whitespace preservation (no trimming of prompt indentation or line breaks).
- Visual status feedback (checkmark toast / icon swap) lasting 2 seconds.
- Accurate error signaling if clipboard permissions are denied.

---

## 11. Responsive Design Strategy

- **Mobile First (< 640px):** Single column, sticky top search/filter header, floating or header action buttons, touch targets >= 44x44px, bottom-sheet or full-screen prompt modal.
- **Tablet (640px – 1024px):** 2-column prompt grid with compact filters.
- **Desktop (>= 1024px):** Sidebar navigation for categories and tags, top search bar, multi-column grid / list toggle, and quick keyboard shortcuts (e.g., `Esc` to close modals, `/` to focus search).

---

## 12. Testing Strategy

1. **Unit Tests:**
   - Input validation functions (`validatePromptInput`).
   - Resilient clipboard utility (`copyToClipboard`).
2. **Component & Integration Tests:**
   - Prompt creation, editing, and deletion confirmation flows.
   - Filtering and search state transitions.
   - Authentication conditional rendering.
3. **Database Security Verification:**
   - RLS policy audits verifying isolation across user IDs.

---

## 13. Deployment Assumptions

- Static single-page application (SPA) build produced by Vite (`dist/`).
- Deployable to static hosting platforms (Vercel, Cloudflare Pages, Netlify, or Supabase Hosting).
- Database hosted on Supabase PostgreSQL with migrations applied.

---

## 14. Explicit Non-Goals and Deferred Features

The initial release intentionally defers:
- AI prompt completion, evaluation, or generation APIs.
- Public prompt sharing / marketplace features.
- Vector database embeddings and semantic search.
- Rich text / WYSIWYG formatting (prompts must remain exact raw text).
- Multi-user team workspaces and RBAC.
