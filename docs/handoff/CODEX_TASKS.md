# CODEX_TASKS.md

## Purpose
This document defines how Codex must work on ankion.

Codex must not build the full app in one task. Codex will only receive small, isolated, reviewable tasks.

## Status
Draft Codex execution rules.

Implementation has not started.

## Core Rule
Codex is an implementation assistant, not the product owner.

ChatGPT and User define:
- product strategy
- architecture
- task slicing
- quality control
- continuity
- risk control

Codex executes:
- small isolated file changes
- scaffold tasks
- controlled setup tasks
- narrowly scoped implementation tasks

## Non-Negotiable Codex Rules

1. Codex must create a short task plan before editing files.
2. Codex must modify only explicitly requested files.
3. Codex must not build the whole app in one task.
4. Codex must not install packages unless explicitly approved.
5. Codex must not initialize frameworks unless explicitly approved.
6. Codex must not create package.json unless explicitly approved.
7. Codex must not create migrations unless explicitly approved.
8. Codex must not create RLS SQL unless explicitly approved.
9. Codex must update FILE_MAP.md when new files are added.
10. Codex must update PROJECT_STATUS.md after meaningful milestones.
11. Codex must preserve ankion product rules.
12. Codex must not bypass docs/design, docs/product, docs/security, or docs/testing decisions.

## Required Task Format

Every Codex task should include:

- Current project root
- Exact file or files to modify
- What to change
- What not to change
- Forbidden actions
- Expected output report

## Forbidden Large Tasks

Do not give Codex tasks like:

- Build the whole ankion app
- Implement all screens
- Create full backend
- Create all Supabase tables and RLS
- Build full mobile app
- Build full Test Lab
- Generate all components at once

These are too large and unsafe.

## Approved Task Size

Good Codex task examples:

- Fill one documentation file.
- Update PROJECT_STATUS.md and FILE_MAP.md.
- Create monorepo package setup only.
- Add one shared constants file.
- Add one design token file.
- Add one isolated component.
- Add one Test Lab card.
- Add one migration after database docs are approved.
- Add one RLS policy group after RLS docs are approved.

## First Future Implementation Task

When implementation is approved, the first task should be:

Create monorepo base setup only.

Possible future files:
- package.json
- pnpm-workspace.yaml
- turbo.json
- base tsconfig

But only after explicit approval.

Do not start this yet.

## Implementation Gate

Codex must not start implementation until these are approved:

- Product docs
- Design docs
- Architecture docs
- Database docs
- Security docs
- Testing docs
- QA checklist
- Codex task rules

## Output Requirement

After every task, Codex must report:

1. Files updated
2. Files not touched
3. Any files created
4. Confirmation that forbidden actions were not performed
5. Any uncertainty or skipped work

## Risk Controls

If Codex touches unrelated files, stop and review.

If Codex creates package/framework files early, revert and re-plan.

If Codex changes product rules, stop and correct.

If Codex starts implementation before docs are approved, stop.

## Notes
Codex must keep ankion modular, reviewable, and safe.

Small tasks protect the project from drift.
