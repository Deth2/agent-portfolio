@AGENTS.md

## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default 5 canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Architecture

Folder structure, `src/server`/`src/lib` layout, and where new code should go. See `docs/agents/architecture.md`.

### API conventions

tRPC-on-Hono call structure, with query/mutation examples and the convention for adding a new procedure. See `docs/agents/api-conventions.md`.

### Pages

The client-side page tree, i18n wiring, and the chat panel's hook/component split. See `docs/agents/pages.md`.

### Best practices

Testing, error-handling, config, and single-source-of-truth conventions already in force. See `docs/agents/best-practices.md`.

### Docs & AI workflow

How this repo's documentation cross-references itself, and how skills/commands are meant to use it. See `docs/agents/docs-and-ai-workflow.md`.
