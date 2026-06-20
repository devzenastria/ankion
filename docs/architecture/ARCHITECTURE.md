# Architecture

## Public Summary

ankion uses a mobile-first architecture with privacy-first backend principles. The product emphasizes voice-centered discovery, permission-based profile visibility, and server-side enforcement for sensitive access decisions.

## Public-Safe Principles

- Mobile app experience is the primary product surface.
- Backend services are responsible for sensitive access decisions.
- Public docs describe high-level architecture only.
- Client state is not authoritative for identity, visibility, or entitlement.

## Public / Private Documentation Boundary

Architecture documents in the public repository may describe:

- high-level product architecture
- broad privacy and safety principles
- generic server-side authorization principles
- general separation between client state and backend authority

Architecture documents in the public repository must not include:

- detailed internal security procedures
- private access-control matrices
- internal readiness or gate records
- detailed migration or deployment sequencing
- attacker-useful abuse or bypass checklists
- command transcripts or operational runbooks

Detailed architecture, security review records, test matrices, rollback plans, and implementation handoffs are maintained outside the public repository or in an approved private system.

## Non-Goals / Omitted Internal Details

Detailed schemas, internal security procedures, test matrices, private roadmaps, and deployment workflows are not published in this repository.

## Current Public Status

Architecture is documented at a summary level for public review.

## Security Note

Do not add private implementation detail, credential material, or operational procedures to this public file.

## Documentation Exposure Gate

Before committing documentation changes:

- Confirm changed paths are documentation-only or explicitly approved.
- Confirm no credentials or private environment values are present.
- Confirm no detailed internal security procedures are present.
- Confirm no private access-control matrix or runtime operation sequence is present.
- Confirm no internal sprint execution log or command transcript is present.
- Review `PROJECT_STATUS.md` and `CHANGELOG.md` separately.
- Obtain explicit approval before push.
