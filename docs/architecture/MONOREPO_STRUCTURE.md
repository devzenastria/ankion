# Monorepo Structure

## Public Summary

ankion uses a repository structure intended to separate application code, shared packages, documentation, and backend-related assets.

## Public-Safe Principles

- Public docs may describe broad folder purpose.
- Sensitive procedures and private implementation details are omitted.
- Credentials must not be stored in the repository.

## Public / Private Documentation Workflow

Public documentation belongs in tracked repo files only when it is safe for broad visibility. Internal documentation belongs outside the public repository or in an approved private system.

Public docs may include:

- high-level product summaries
- high-level architecture summaries
- public-safe release notes
- generic privacy and safety principles

Private/internal docs may include:

- detailed task logs
- private security review records
- internal implementation sequencing
- detailed test matrices
- rollback and deployment procedures
- sensitive team handoff notes

Assistant and Codex prompts must not place private operational detail into public docs by default. Any docs-heavy change should include a documentation exposure review before commit.

## Non-Goals / Omitted Internal Details

Detailed internal workflow, security procedures, and task sequencing are maintained privately.

## Current Public Status

This is a public-safe structure summary.

## Security Note

Do not add private operational workflow details here.
