# SOLUTION.md

## Approach

I treated this as a real-world prototype — the kind you'd hand off to a team for further iteration. Rather than racing to tick off endpoints, I invested upfront in architecture (DDD layers, bounded contexts, CQRS-lite) so the codebase can grow without a rewrite. Small, incremental commits tracked each decision.

**Workflow:** Plan with an expensive model (Claude Opus 4.6), then switch to auto-mode for implementation. Focus was on working features over test coverage — for a production build, tests of all kinds (unit, integration, e2e) would be essential to maintain confidence after each change.

---

## Key Design Decisions (ADR-lite)

### ADR-1: PostgreSQL instead of MySQL

**Context:** The task specifies MySQL, but the provided template already had PostgreSQL configured (Docker, Prisma, better-auth).

**Decision:** Keep PostgreSQL.

**Rationale:** Switching databases would have been pure yak-shaving with zero functional benefit for the prototype. PostgreSQL is production-grade and the template's auth layer was already wired to it.

---

### ADR-2: Domain-Driven Design with Strict Layer Separation

**Context:** The task is a prototype, but the task doc asks for "what would you add with more time" — signalling that extensibility matters.

**Decision:** Full DDD with Presentation → Application → Domain → Infrastructure layering. Aggregates own all state changes and generate their own IDs via `randomUUID()`.

**Trade-off:** More files and ceremony than a flat CRUD approach. Worth it because the domain (songs, pitches, organisations, roles) has real invariants that would otherwise leak into controllers.

---

### ADR-3: Abstract Classes over Interfaces for Repository Contracts

**Context:** TypeScript interfaces are erased at runtime, so NestJS cannot use them as DI tokens without a separate `Symbol`/string constant.

**Decision:** Use `abstract class` for repository contracts (Song, Pitch, Organization modules). The older User module still uses `interface` + `string` token.

**Trade-off:** Slightly unconventional. Eliminates boilerplate `@Inject(TOKEN)` decorators and keeps the token co-located with the contract definition.

---

### ADR-4: CQRS-Lite (Read/Write Repository Split)

**Context:** List endpoints don't need full aggregate hydration. Reconstituting deep aggregates just to serialise them back to JSON is wasteful.

**Decision:** Write repositories live in the **domain** layer and return aggregates. Read repositories live in the **application** layer and return flat read-model types. Read repos use Prisma `select` for optimised queries.

**Trade-off:** Two repository abstractions per aggregate. The benefit is that reads are fast and decoupled from domain invariants; writes go through the aggregate root as DDD requires. For a full implementation, NestJS CQRS library (`@nestjs/cqrs`) with command/query buses would formalise this further.

---

### ADR-5: Bounded Context Isolation — Song Module Does Not Import Organization Module

**Context:** Songs belong to organisations. The naive approach is `SongModule.imports: [OrganizationModule]`.

**Decision:** The Song module defines its own `OrgMembershipPort` (abstract class in Song's application layer). An `OrgMembershipAdapter` in Song's infrastructure layer queries the `organization_member` table directly via Prisma — no import of any Organisation domain class.

**Trade-off:** Guard logic is duplicated across bounded contexts (Song has its own `SongMembershipGuard` and `SongRoleGuard`). This duplication is intentional — it keeps bounded contexts deployable independently. A future improvement is a shared **Authorization module** consumed by both.

---

### ADR-6: PitchTargetArtist as Free-Text Strings

**Context:** Pitches target specific artists. Options: (a) free-text strings, (b) JSON array column + GIN index, (c) dedicated `Artist` catalog table with FK.

**Decision:** Separate `PitchTargetArtist` table with a `name` string column (option a+c hybrid — normalised but no catalog).

**Rationale:** The separate table gives data integrity, easy querying, and Prisma type-safety without the overhead of a full Artist catalog. A future improvement would be promoting `PitchTargetArtist.name` into a proper `Artist` entity — enabling consistent identity across pitches, autocomplete, rename propagation, and analytics. Alternatively, artists could even be users of the system, allowing them to review pitches via deep-link access.

---

### ADR-7: Domain Service for Cross-Aggregate Invariants

**Context:** "A songwriter can only be a member of an organisation once" is a business rule, but enforcing it requires a repository query — something an aggregate cannot do on its own.

**Decision:** `OrganizationMembershipDomainService` checks uniqueness via the repository and throws `DuplicateResourceError`. It's wired via `useFactory` to stay framework-agnostic.

**Rationale:** DDD prescribes domain services for invariants that span multiple aggregates or require infrastructure access while still being business rules — not orchestration.

---

### ADR-8: Transactions via @nestjs-cls/transactional

**Context:** Use cases that write multiple aggregates (e.g., creating an org + adding the creator as a member) need atomicity.

**Decision:** All write use cases are decorated with `@Transactional()`. Repositories inject `TransactionHost` and use `this.txHost.tx` to participate in the ambient transaction.

**Trade-off:** Adds a CLS (continuation-local storage) dependency. Cleaner than manually passing `tx` through every method signature.

---

### ADR-9: Tags as a Separate Table vs JSON Array

**Context:** Pitches have tags. Options: (a) JSON string array column on `Pitch`, (b) normalised `Tag` table with M:N join.

**Decision:** Separate `Tag` table with a many-to-many relation to `Pitch`.

**Rationale:**
- **Queryability** — `WHERE tag.name = 'pop'` is a simple indexed join; querying inside a JSON array requires database-specific operators and is harder to optimise.
- **Uniqueness & consistency** — Prevents duplicates like `"Pop"` vs `"pop"` at the database level; future case-normalisation is trivial.
- **Analytics** — Tag frequency, trending tags, and cross-pitch queries become straightforward `GROUP BY` operations.
- **Reusability** — Tags can later be shared across other entities (e.g., songs, artists) without duplication.

**Trade-off:** More joins and a slightly more complex write path (`connectOrCreate`) compared to a simple JSON column. The normalised model better demonstrates domain thinking and scales without migration pain.

---

## Database Design

```
User ──< OrganizationMember >── Organization
                                     │
                                     └──< Song ──< Pitch ──< PitchTargetArtist
                                                     │
                                                     └──<>── Tag (M:N)
```

**Key decisions:**

- **`OrganizationMember`** is a join table with `role` (MANAGER | SONGWRITER) and a composite unique constraint on `(organizationId, userId)`.
- **`Song`** belongs to both an Organisation and the User who uploaded it. Indexed on `organizationId` and `uploadedById`.
- **`Pitch`** has a `status` enum (DRAFT → SUBMITTED → ACCEPTED → REJECTED) modelling the lifecycle even though status transitions aren't fully implemented yet — this shows domain thinking beyond MVP.
- **`Tag`** has a unique name and a M:N relation with Pitch. Tags are reused across pitches via `connectOrCreate`.
- **`PitchTargetArtist`** is a normalised 1:N from Pitch — see ADR-6.

The schema models the **complete domain** including entities and relationships not fully implemented in the API (e.g., `PitchStatus` transitions, Tag-based filtering).

---

## AI Usage

### Tools Used

- **GitHub Copilot (Claude Opus 4.6)** — primary tool for planning, architecture decisions, and code generation
- **Agent mode (auto)** — used for implementation once a plan was established

### What Worked Well

- **Planning with expensive models first**: Using Opus 4.6 for architecture planning and then switching to auto for code generation was highly effective. Expensive models make fewer mistakes in code generation too.
- **Tests as a future lever**: While testing was not the focus for this prototype, the architecture is designed to be highly testable — pure domain entities, injected repository abstractions, and thin use cases all lend themselves to unit testing. In a production setting, AI-assisted test generation would be a key part of the workflow to keep confidence high after each change.
- **Copilot instructions file**: The `.github/copilot-instructions.md` with DDD conventions significantly improved code generation quality — AI followed the established patterns consistently.
- **Establishing patterns early**: Going slower at the start — manually building the first module end-to-end with proper DDD layering — paid off significantly. Once reference code existed in the repo, the agent could pattern-match against it and generate subsequent modules (Song, Pitch) with far fewer corrections. The upfront investment in a clean first example became the template for everything that followed.
- **Small-batch workflow**: Committing in small increments meant AI-generated code was always reviewed in digestible chunks.

### What Didn't Work Well

- **Commit messages**: AI-generated commit messages were poor until specific instructions were added to the copilot config.
- **Transactions**: AI initially injected Prisma transactional dependencies directly into application-layer use cases, violating the DDD layer boundary. Required manual refactoring to push `TransactionHost` down into repository implementations so the application layer stays infrastructure-agnostic.
- **Verbose comments**: AI tends to add excessive inline comments. Would remove most of them in a real codebase — code should be self-documenting, with comments reserved for "why", not "what".
- **Instruction portability**: The copilot instructions are GitHub Copilot-specific. For a real team, these would need to be tool-agnostic to work across Cursor, Cline, Windsurf, etc.

---


## Improvements With More Time

1. **Comprehensive Test Suite** — Unit tests for domain entities and use cases, integration tests for repositories, and e2e tests with Testcontainers. The architecture is already test-friendly (pure domain, injected abstractions); it just needs the tests written.
2. **Shared Authorisation Module** — Extract org-membership checks into an independent module consumed by both Song and Organisation, eliminating guard duplication.
3. **Artist Catalog** — Promote target artists from free text to a first-class `Artist` entity with deduplication, autocomplete, and analytics support. Optionally allow artists to be platform users who can review pitches.
4. **NestJS CQRS Library** — Replace manual use-case classes with `CommandBus` / `QueryBus` for cleaner separation of concerns and event-driven side effects.
5. **Event Sourcing for Pitch Aggregate** — The Pitch lifecycle (DRAFT → SUBMITTED → ACCEPTED/REJECTED) is a natural fit for event sourcing. Store domain events (`PitchCreated`, `PitchSubmitted`, `PitchAccepted`, etc.) in an event store table and project them to the current read model (the existing `pitch` table) within the same transaction. This gives a full audit trail of pitch state transitions while keeping reads fast.
6. **Domain Events & Integration Events** — Introduce domain events on all aggregates (sourced or not). Aggregates would collect events internally and emit them after persistence. Within a bounded context, domain events enable reactive side effects (e.g., `SongUploaded` triggers a notification). Across bounded contexts, integration events would replace direct queries — e.g., the Song context publishes `SongUploaded`, and the Organisation context reacts without tight coupling.
7. **Pitch Status State Machine** — Enforce valid transitions (DRAFT → SUBMITTED → ACCEPTED/REJECTED) with domain logic, not just an enum.
8. **Update/Delete Operations** — CRUD completeness for songs, pitches, and organisation members.
9. **Song Filtering & Search** — Filter by title, artist, tags, date range; full-text search.
10. **Dependency Version Bumps** — Bump NestJS, Prisma, better-auth, and other packages to latest stable before building features. Starting green on dependencies means fewer surprises mid-development, access to latest bug fixes and security patches, and less upgrade overhead. Ideally, automated dependency updates via GitHub Dependabot (or Renovate) would keep packages current continuously without manual effort.
11. **AI Instruction Portability** — Make the coding conventions file tool-agnostic so it works across GitHub Copilot, Cursor, Cline, and other AI assistants.

---

## Challenges

- **Transaction wiring**: AI-generated code initially injected Prisma-related transactional dependencies directly into application-layer use cases, breaking the DDD layer boundary (application layer must not depend on infrastructure). Fixing this required moving `TransactionHost` usage into the repository implementations and ensuring use cases only interact with abstract repository contracts. Understanding `@nestjs-cls/transactional` internals was necessary to get the ambient transaction propagation working correctly across layers.
- **Bounded context boundary**: Deciding where Song and Organisation contexts should communicate required deliberate design. The ACL/port pattern added files but prevented the tight coupling that would make the modules hard to evolve independently.
- **Balancing DDD rigour with prototype speed**: Full DDD is heavy for a take-home. The compromise was strict layers but simplified aggregates (no deep value objects or domain events). The architecture is real; the domain model is deliberately thin.

---

## Assumptions

- **PostgreSQL over MySQL** — The provided template was pre-wired to PostgreSQL (Docker, Prisma, better-auth). Switching to MySQL would have been pure yak-shaving with no functional gain. See ADR-1.
- **Single role per membership** — A user has one role per organisation (MANAGER or SONGWRITER), enforced at the `OrganizationMember` level. A user could theoretically hold different roles in different organisations.
- **Direct member linking, no invites** — Per the task spec ("no email invite system needed — assume direct linking"), managers add existing users to organisations by email. The user must already be registered.
- **No audio transcoding or metadata extraction** — Songs are stored as-is on the local filesystem. No duration detection, format conversion, or waveform analysis. Duration is optionally provided by the uploader.
- **File storage is ephemeral** — Local filesystem inside the Docker container. Acceptable for a prototype only; production would require S3 or equivalent with CDN.
- **Session-based auth, not JWT** — better-auth manages sessions via cookies. No bearer token flow; API consumers must maintain a cookie jar.
- **Song belongs to exactly one organisation** — No cross-org sharing. A songwriter uploads to the org they belong to, and the song lives there.
- **Pitch status transitions are not enforced** — The `PitchStatus` enum (DRAFT → SUBMITTED → ACCEPTED → REJECTED) exists in the schema, but the API only creates pitches in DRAFT. Transition endpoints and state-machine validation are deferred (see Improvements).

---

## Trade-offs

| Decision | Chose | Over | Reason |
|----------|-------|------|--------|
| **Architecture** | Full DDD layers (Presentation → Application → Domain → Infrastructure) | Flat CRUD | Demonstrates design thinking; supports real invariants in the domain. More files, but each has a single responsibility. |
| **Database** | PostgreSQL (existing template) | MySQL (task spec) | Avoided expensive migration of template plumbing for zero functional benefit. |
| **Repository contracts** | Abstract classes as DI tokens | Interface + Symbol token | Eliminates `@Inject(TOKEN)` boilerplate; NestJS resolves the class directly. Less conventional but less noise. |
| **Read/Write split (CQRS-lite)** | Separate read repositories returning flat DTOs | Single repository returning aggregates for all operations | List endpoints skip aggregate reconstruction; writes still go through domain. Two abstractions per aggregate, but reads are fast and decoupled from invariants. |
| **Bounded context isolation** | ACL port (`OrgMembershipPort`) in Song module | Direct import of Organization module | Prevents tight coupling; Song and Org evolve independently. Duplicates guard logic — acceptable trade-off for deployability. |
| **Tags** | Normalised `Tag` table with M:N join | JSON array column on Pitch | Queryable, deduplicated, indexable. Slightly more complex writes (`connectOrCreate`), but scales without migration. |
| **Target artists** | Separate `PitchTargetArtist` table (1:N) | JSON array or full Artist entity | Type-safe and queryable without the overhead of a catalog entity. Easy to promote to a first-class `Artist` later. |
| **File storage** | Local filesystem (`./uploads/songs/`) | Cloud object storage (S3) | Task specifies local storage. Simple for Docker prototype; production would use S3 + CDN. |
| **Testing** | AI-generated tests, not reviewed | Fully curated test suite | Tests were scaffolded by the agent alongside feature code but not reviewed for quality or usefulness. The DDD architecture makes tests easy to add and refine; the priority was working features over test curation. |
| **Transactions** | `@nestjs-cls/transactional` (ambient CLS) | Manual `tx` parameter threading | Cleaner API; repositories read from ambient context. Adds CLS dependency but avoids `tx` in every method signature. |
| **Auth** | better-auth (session cookies) | Passport + JWT | Task requirement. Passport + JWT would be stateless (no session DB lookups, horizontal scaling is trivial), NestJS-native (`@nestjs/passport`), and easier to test via curl/Postman (just send a Bearer header). However, better-auth ships with built-in org/member management — directly mapping to the task's core domain — so the trade-off of session cookies for free org primitives was worth it for a time-boxed prototype. |

---

## What I'd Do Differently

- **Update SOLUTION.md incrementally** — I wrote this document at the end, reconstructing decisions from memory and commit history. In hindsight, I'd update it as I go — capturing each ADR and trade-off at the moment the decision is made. That way the rationale is fresh, nothing gets lost, and the document stays in sync with the code throughout development.
