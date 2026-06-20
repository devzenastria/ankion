# ankion

ankion is a privacy-first, voice-first mobile social discovery product.

Users start with privacy by default, connect through voice-centered interactions, and reveal real profile information only through explicit permission and server-side checks.

## Product Direction

- Mobile-native experience.
- Voice-first social discovery.
- Permission-based profile visibility.
- Privacy and safety by default.
- Server-side enforcement for sensitive access decisions.

## Repository Contents

This public repository contains public-safe documentation and project groundwork.

Detailed operational security procedures, internal implementation sequencing, private test matrices, and deployment notes are intentionally not published here.

## Security Posture

- Credentials and private environment values must not be committed.
- Client state is not a source of authority for identity, profile visibility, access, or entitlement.
- Sensitive backend and security implementation details are maintained privately.

## Documentation Safety

Public documentation in this repository is limited to high-level product direction, architecture principles, and release-style summaries.

Detailed operational procedures, private implementation sequencing, security review records, deployment notes, and internal test matrices must be kept outside the public repository or in an approved private system.

Before any documentation commit:

- Review `PROJECT_STATUS.md` separately as a public-safe status file.
- Review `CHANGELOG.md` as a release-style public summary.
- Confirm changed documentation contains no credentials or private environment values.
- Confirm changed documentation does not include internal gate records, detailed security procedures, private test matrices, or operational runbooks.
- Confirm push has explicit owner approval.

## Development Status

The project is under active development. Public documentation may describe broad direction, but detailed work planning and security review artifacts are handled outside the public repository.
