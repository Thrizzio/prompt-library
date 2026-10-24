# Architecture Documentation: Personal Prompt Library

## 1. Product Purpose and Scope
The Personal Prompt Library is a fast, responsive, clean, and minimal single-user web utility designed as a **public prompt showcase and personal toolkit**. 

- **Frictionless Public Access:** Visitors can instantly view, search, filter, and copy all curated prompts to their clipboard with zero authentication.
- **Single-User Owner Controls:** The repository owner (or self-hoster) unlocks editing, creation, duplication, and deletion via a simple passkey (`VITE_ADMIN_PASSKEY`) stored in `.env`.
- **Zero HTML Injection Risk:** Prompts are rendered strictly as raw text (`white-space: pre-wrap`).
- **Exact Whitespace Preservation:** Copying preserves all spaces, indentation, and line breaks.
- **Self-Hostable Simplicity:** Anyone can clone the repository, connect their own Supabase database, set a passkey, and host their personal prompt library.

---

## 2. Technology Choices and Rationale

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript | Strict type safety, predictable rendering, and clean component isolation. |
| **Build Tool** | Vite | Instant HMR, lightweight bundle size, and fast production builds. |
| **Styling** | Tailwind CSS | Utility-first CSS ensuring minimal runtime overhead, consistent tokens, and rapid responsive adjustments. |
| **Icons** | Lucide React | Lightweight, clean, accessible SVG icons with zero bloat. |
| **Persistence** | Supabase (PostgreSQL + RLS) | Simple, managed PostgreSQL instance supporting public read and passkey-guarded client mutations. |
| **Testing** | Vitest + React Testing Library | Fast ESM-native runner validating component contracts, clipboard behaviors, and input constraints. |

---

## 3. High-Level Architecture

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
|  |              Custom Hooks / Local State             |  |
|  |      (useAdmin, usePrompts, useCategories)          |  |
|  +---------------------------+-------------------------+  |
|                              |                            |
|  +---------------------------v-------------------------+  |
|  |        Supabase Client SDK + Local Validator        |  |
|  +---------------------------+-------------------------+  |
+------------------------------|----------------------------+
                               | HTTPS / WSS
                               | (Anon Key)
+------------------------------v----------------------------+
|                     Supabase Platform                     |
|                                                           |
|  +-----------------------------------------------------+  |
|  |                 PostgreSQL Database                 |  |
|  |   - prompts table (Public read, indexed)            |  |
|  |   - categories table (Public read, indexed)         |  |
|  |   - Row Level Security (RLS)                        |  |
|  +-----------------------------------------------------+  |
+-----------------------------------------------------------+
```

1. **Visitor Mode:** All visitors see all prompts, categories, tags, search bar, list/grid toggle, and copy buttons. No sign in or register modal exists.
2. **Owner Mode:** Unlocked via an inconspicuous owner key button. Entering the secret passkey unlocks "New Prompt", "Edit", "Duplicate", "Delete", and category addition actions.

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
│   │   ├── useAdmin.ts      # Owner passkey verification & state
│   │   ├── usePrompts.ts    # Prompts CRUD & optimistic filtering
│   │   └── useCategories.ts # Categories fetch & creation hook
│   ├── components/
│   │   ├── common/          # Button, Input, Modal, Badge, Toast, EmptyState
│   │   ├── admin/           # AdminModal (Owner passkey prompt)
│   │   ├── layout/          # Header, Sidebar, AppShell
│   │   └── prompts/         # PromptCard, PromptList, PromptModal, SearchFilter
│   └── tests/
│       ├── setup.ts         # Vitest DOM test environment
│       ├── admin.test.tsx
│       ├── clipboard.test.ts
│       ├── validation.test.ts
│       ├── prompts.test.tsx
│       └── shell.test.tsx
```

---

## 5. Data Model and Relationships

### PostgreSQL Schema

#### 1. `categories` Table
Stores categories for organizing prompts.

```sql
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_categories_name ON public.categories(name);
```

#### 2. `prompts` Table
Stores prompts authored by the owner.

```sql
CREATE TABLE public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_prompts_category_id ON public.prompts(category_id);
CREATE INDEX idx_prompts_is_favorite ON public.prompts(is_favorite);
CREATE INDEX idx_prompts_created_at ON public.prompts(created_at DESC);
```

---

## 6. Access Control & Passkey Strategy

- **Public Read Access:** Visitors can browse, search, and copy prompts without login.
- **Owner Passkey:** Configured via `VITE_ADMIN_PASSKEY` in `.env`. Entering the passkey unlocks mutation tools in the browser (persisted in `localStorage`).
- **No Complex Identity Provider:** Eliminates the friction of email verifications, passwords, session expirations, and multi-tenant databases.

---

## 7. Data Validation and Error-Handling Strategy

- **Validation Rules:**
  - `title`: Required, trimmed, 1–150 characters.
  - `content`: Required, preserved exact whitespace, 1–50,000 characters.
  - `tags`: Array of alphanumeric words (max 10 tags, max 30 chars per tag).
  - `category_id`: Valid UUID or null.
- **XSS & Output Safety:** Prompt content is rendered strictly as plain text (CSS `white-space: pre-wrap`) inside `<pre>`. `dangerouslySetInnerHTML` is strictly avoided.
- **Error Handling:** Client presents user-friendly feedback via toasts and preserves form inputs when recoverable errors arise.

---

## 8. Search and Clipboard Behavior

### Search & Filtering
- Instant client-side filtering across `title`, `content`, and `tags`.
- Zero latency for personal libraries (< 10,000 items).
- Filter controls: Category selector, "Favorites only" toggle, and keyword matching.

### Clipboard Action
- Uses modern `navigator.clipboard.writeText()` with fallback to a hidden textarea mechanism.
- Strict whitespace preservation (no trimming of prompt indentation or line breaks).
- Visual status feedback (`Copied` badge) lasting 2 seconds.

---

## 9. Responsive Design Strategy

- **Mobile First (< 640px):** Single column, sticky top search header, touch targets $\ge 44 \times 44\text{px}$, responsive drawer.
- **Desktop (>= 1024px):** Persistent sidebar navigation, top search bar, multi-column grid/list view toggle.
