# Personal Prompt Library

A fast, responsive, clean, and minimal single-user web application and public showcase for organizing, retrieving, and copying AI prompts. 

Built as a lightweight personal tool and portfolio showcase:
- **Zero Authentication for Visitors:** Anyone can visit the site, browse categories, search across prompts, and copy exact prompt text with 1 click.
- **Owner Mode with Passkey:** Only you can add, edit, duplicate, and delete prompts by entering a secret passkey.
- **Self-Hostable:** Anyone can clone the repository, connect their own Supabase database, set a passkey, and host their personal library.

---

## Features

- **Instant Search & Retrieval:** Real-time client-side filtering across prompt titles, content, and tags without artificial debounce delays.
- **Flawless Clipboard Integration:** Copies raw prompt text with strict whitespace, indentation, and newline preservation. Includes fallback copy mechanisms and clear visual status indicators.
- **Categorization & Tags:** Organize prompts with custom categories (e.g., Coding, Writing, Productivity) and lightweight tags.
- **Favorites & Duplication:** Star frequently used prompts for instant access; duplicate existing prompts with a single click.
- **Safe Editing & Deletion:** Intuitive modal editor with live character counting, length validation, and inline deletion safeguards.
- **Owner Mode:** Protected by `VITE_ADMIN_PASSKEY` — unlocks creation, editing, deletion, and category management.
- **Responsive & Accessible:** Fluid layouts adapted for screens from 320px mobile devices to wide desktop monitors, accessible dialogs, semantic markup, and minimum 44px mobile touch targets.

---

## Technology Stack

- **Frontend:** React 18, TypeScript (strict mode enabled), Vite
- **Styling:** Tailwind CSS, Lucide React icons
- **Backend & Database:** Supabase PostgreSQL, Row Level Security (RLS)
- **Testing:** Vitest, React Testing Library, JSDOM

---

## Prerequisites

- **Node.js:** v18.0.0 or later (v20+ or v24+ recommended)
- **npm:** v9.0.0 or later
- **Supabase Account:** Free project on [supabase.com](https://supabase.com) (or local Supabase CLI)

---

## Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Thrizzio/prompt-library.git
   cd prompt-library
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

## Environment Variable Setup

Copy the sample environment file to create your local `.env`:

```bash
cp .env.example .env
```

Populate `.env` with your Supabase credentials and secret owner passkey:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
VITE_ADMIN_PASSKEY=your-secret-owner-passkey
```

- When visiting the application, click **Owner Unlock** in the header and enter `your-secret-owner-passkey` to activate editing mode.
- Public visitors will see all prompts and can copy them freely, but will not see creation or deletion controls.

---

## Supabase Database Configuration & Migrations

The database schema is version-controlled in [`supabase/migrations/20261024000000_init_prompt_library.sql`](supabase/migrations/20261024000000_init_prompt_library.sql).

### Applying via Supabase Web Dashboard:
1. Navigate to your Supabase project dashboard at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** from the left navigation.
3. Open or paste the contents of `supabase/migrations/20261024000000_init_prompt_library.sql`.
4. Click **Run** to execute the migration.

The migration sets up:
- `public.categories` and `public.prompts` tables.
- Public read access (`SELECT`) enabled for all visitors (`anon` and `authenticated`).
- Default categories (`Coding`, `Writing`, `Research`, `Productivity`, `Learning`, `Other`).

---

## Development and Build Scripts

- **Start Local Dev Server:**
  ```bash
  npm run dev
  ```
  Opens at `http://localhost:5173`.

- **Type Check & Production Build:**
  ```bash
  npm run build
  ```
  Builds optimized static assets into the `dist/` directory.

- **Preview Production Build:**
  ```bash
  npm run preview
  ```

- **Run Automated Tests:**
  ```bash
  npm test
  ```
  Runs Vitest unit and integration test suites with zero warnings.

---

## Deployment Instructions

Deployable to any static hosting service (Vercel, Cloudflare Pages, Netlify, or GitHub Pages):

1. Set the build command to `npm run build` and publish directory to `dist`.
2. Add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PASSKEY`
