# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack
npm run dev:daemon   # Start dev server in background (logs to logs.txt)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest test suite
npm run db:reset     # Reset SQLite database (destructive)
```

> **Important:** Do NOT run `npm audit fix` — dependencies are pinned to specific compatible versions.

## Environment Variables

- `ANTHROPIC_API_KEY` — Required for real AI generation; falls back to a mock provider if absent
- `JWT_SECRET` — Session signing key (defaults to `"development-secret-key"` in dev)

## Architecture

UIGen is a Next.js 15 App Router application where users chat with Claude to generate live-previewed React components.

### Request Flow

```
User message → /api/chat (POST)
  → Claude (claude-haiku-4-5) via Vercel AI SDK streamText
    → str_replace_editor / file_manager tools
      → VirtualFileSystem (in-memory)
        → Preview panel re-renders
          → onFinish: project saved to SQLite via Prisma
```

### Key Directories

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js pages and API routes |
| `src/app/api/chat/route.ts` | Main AI chat endpoint — tool dispatch, streaming |
| `src/actions/` | Server Actions for auth and project CRUD |
| `src/lib/file-system.ts` | `VirtualFileSystem` class — in-memory FS, serializes to JSON |
| `src/lib/provider.ts` | Returns Claude or mock language model based on env |
| `src/lib/tools/` | Claude tool definitions (`str_replace_editor`, `file_manager`) |
| `src/lib/prompts/` | System prompts for component generation |
| `src/lib/contexts/` | React contexts for FileSystem and Chat state |
| `src/components/preview/` | Live preview rendering JSX via Babel standalone |
| `src/components/editor/` | Monaco Editor + file tree |
| `src/components/chat/` | Chat UI and message rendering |
| `prisma/` | SQLite schema (`User`, `Project`) and migrations

### Database

The database schema is defined in `prisma/schema.prisma`. Reference it for any data structure questions — it is the authoritative source for all models and their fields.

### Generated Components Convention

- All generated React apps must expose `/App.jsx` as the root entry point
- Components use Tailwind CSS for styling (no hardcoded styles)
- Import alias `@/` maps to `src/`
- JSX is transpiled client-side via Babel standalone in the preview iframe

### Authentication

- JWT sessions stored in HTTP-only cookies (7-day expiry)
- Bcrypt password hashing (10 salt rounds)
- Anonymous use is supported — `userId` is optional on `Project`

### AI Integration Details

- Streaming via `streamText` from Vercel AI SDK
- Prompt caching enabled with `ephemeral` cache control headers
- Max tokens: 10,000 — Max steps: 40 (4 for mock provider)
- The mock provider is used automatically when `ANTHROPIC_API_KEY` is not set

### UI Layout

Resizable panels via `react-resizable-panels`:
- Left (35%): Chat interface
- Right (65%): Preview tab / Code tab (file tree 30% + Monaco editor 70%)

### Testing

Tests use Vitest with `jsdom` and React Testing Library. Run a single test file:

```bash
npx vitest run src/path/to/file.test.ts
```

## Code Style

- Use comments sparingly. Only comment complex code where the reasoning is non-obvious.
