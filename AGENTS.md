# SineHub Project - Agent Instructions

## General Principles
- Write concise, readable, and maintainable **TypeScript** code throughout the Next.js application.
- Strictly follow the **Next.js App Router** conventions (e.g., using `page.tsx`, `layout.tsx`, and explicit `'use client'`/`'use server'` boundaries).
- Style with **Tailwind CSS v4** and use `clsx` + `tailwind-merge` for class compositions, especially in reusable components.
- Rely on `lucide-react` for application icons.

## Authentication & Route Protection
- We use **Supabase Auth** for robust session management.
- The system enforces access control via PostgreSQL **Row Level Security (RLS)**.
- **Admin Accounts**: Identified via an `is_admin()` database helper or admin list. Redirected to and operate within `/admin` routes.
- **Middleware**: A lightweight Next.js middleware is used for session refresh on every request and to determine whether a route needs protection.

## Database Management
- The application connects to **PostgreSQL** managed through **Supabase**.
- **Schema Changes & Migrations**: Do NOT edit the existing `supabase/schema.sql` or past migration files. When adding new tables, altering columns, or changing policies, you MUST create a new migration using the Supabase CLI: `supabase migration new <descriptive_name>`.
- Place your incremental SQL changes in the newly generated file under `supabase/migrations/`. This ensures the database schema remains version-controlled and allows for safe rollbacks.
- Manual data edits can be done via the Supabase Table Editor, but structural changes must be code-driven.

## UI Conventions
- Reusable UI blocks are constructed with **shadcn/ui** components for accessibility and logic. Ensure any `.tsx` primitive components follow the `class-variance-authority` (CVA) patterns for unified theming. Use `npx shadcn@latest add <component>` to add new components as needed.
- The project implements CSS variables for light/dark mode implementations when adding new custom Tailwind configs or inline styles.

## Type Conventions
- Entity types should be defined in a dedicated `types` directory/file (e.g., `types/index.ts`) and imported wherever needed.
- Do **not** define inline entity types inside components. If a new entity shape is needed, add it to the types file first.

## Code Formatting & Commenting
- **Comments**: Only add comments where there is genuinely complex logic that warrants explanation — not on every page, file, or component. Avoid line-by-line or inline comments. Do not add boilerplate block comments at the top of simple pages or layouts.

## Important Development Workflows
- **Commits**: Commit messages must follow the conventional syntax: `<type>(<optional scope>): <description>` (e.g., `feat(auth): implement new proxy middleware`).
- Keep PRs and commits focused on specific, atomic tasks (e.g., separating UI bug fixes from database additions).
- When investigating errors, check the locally running terminal commands: we commonly leave `npm run dev` actively monitoring background changes.
