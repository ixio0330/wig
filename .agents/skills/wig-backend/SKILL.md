---
name: wig-backend
description: Use this skill when adding or changing WIG backend APIs, route handlers, services, storage code, validation, auth, or database-backed business rules. Trigger it for requests about API implementation, backend refactors, auth/session logic, storage changes, TDD-first backend work, or backend bug fixes in this repository.
---

# Wig Backend

## Overview

Use this skill for backend work in `src/app/api`, `src/domain`, `src/lib`, and related DB-backed logic.

Read only the files needed for the current task.

Start with:

1. `references/backend-rules.md`
2. the matching domain doc
3. `docs/dev/common/2026.03.09-database-schema.md` when the task adds a new feature or changes persisted data
4. the current implementation
5. related common docs only when needed

If docs conflict with code, verify the implementation and trust the current code path.

## WIG Backend Facts

- Auth currently uses the `wig_sid` session cookie in active code paths.
- Route handlers should use `withErrorHandler` from `src/lib/server/with-error-handler.ts`.
- Success and error responses should use `apiSuccess` and `apiError`.
- Input validation should use Zod.
- DB access should stay in `src/domain/*/storage`.
- Business logic should stay in `src/domain/*/services`.
- Auth-required routes should use `getSession`.
- SQL must use Prepared Statement patterns through Drizzle or binding.
- Keep backend date storage and API-facing canonical date values in UTC unless a domain doc explicitly says otherwise.
- When creating commits, follow `docs/planning/2026.04.09-commit-convention.md`. Prefer `feat|fix|docs|chore|refactor|style` with the format `<type>: <변경 요약>`.

For detailed file paths and doc priorities, read `references/backend-rules.md`.

## Workflow

### 1. Confirm the target domain

Open the matching domain doc and extract business rules, error cases, auth rules, and validation rules. Also inspect existing code in the same domain before changing structure.

If the task adds or changes an API, update `src/api-spec/openapi.yaml` first so the contract is explicit before implementation.

If the task is a new feature and needs new persisted data or changed relational rules, design the schema before backend implementation. That means reviewing `docs/dev/common/2026.03.09-database-schema.md`, `src/db/schema.ts`, related storage code, and the needed constraints before writing route/service code.

### 2. Design schema first when the feature needs it

For a new feature with new tables, columns, relations, or constraints, prefer this order:

1. domain rules
2. API contract when relevant
3. DB schema design
4. validation
5. service
6. storage
7. route handler

Schema design here includes:

- table and column shape
- nullable vs required fields
- unique constraints and indexes
- foreign keys and cascade behavior
- ownership and workspace boundaries implied by the data model

### 3. Start with tests when the change is backend behavior

Follow Red -> Green -> Refactor when feasible.

- add or update focused tests near the implementation
- default to `validation`, `service`, and `storage` tests for backend behavior
- prioritize business-rule coverage over incidental coverage
- add characterization tests before changing existing behavior when practical
- do not introduce `any` in tests; prefer typed mocks or narrow interfaces
- add route tests only when HTTP-layer behavior is part of the change
  - request parsing or response branching that is not trivial
  - cookie/header handling
  - file upload, streaming, redirects, or route-only integration behavior

### 4. Implement in the existing layers

Preferred flow:

1. OpenAPI contract
2. DB schema when needed
3. validation
4. service
5. storage
6. route handler
7. shared lib helpers only if needed

### 5. Keep repository conventions

- preserve Korean error messages and existing error codes
- match the documented response shapes
- use session-cookie auth checks consistently
- keep ownership checks in query conditions where possible

### 6. Run verification

Use the smallest useful verification set first, then broaden:

```bash
yarn test --run <changed-test-file>
yarn test
yarn tsc --noEmit
yarn lint
yarn eslint <changed-files>
```

If the task changes API contracts, also update:

```bash
yarn gen:api
```

If browser-based Storybook verification matters, run separately:

```bash
yarn test:storybook --run
```

### 7. Commit order

When backend work is committed in multiple steps, keep the repository commit format above and prefer this order:

1. API spec
2. schema
3. tests
4. implementation
5. docs

This does not change the implementation workflow above.
You should still design and write tests before or alongside implementation when the behavior change warrants it.
The rule here is about how to split and order commits so review stays clear.

## Backend Checklist

- If this is a new or changed API, was `src/api-spec/openapi.yaml` updated first?
- If this feature needs persisted data, was the schema designed before backend implementation?
- Does the change match the domain business rules?
- Is Zod validation present where request data enters?
- Are auth and ownership checks correct?
- Are `apiSuccess` and `apiError` used consistently?
- Is storage logic isolated from route code?
- Are prepared statements or Drizzle-safe bindings used?
- Did tests, types, and lint run for the change?

## When To Update Docs

Update the relevant docs when backend behavior or contracts changed materially:

- `src/api-spec/openapi.yaml`
- matching domain doc in `docs/dev/`
- `docs/onboarding.md` for backend process or architecture changes

## Next Step

After backend behavior is implemented and verified, move to `wig-frontend` to connect the user-facing flow to the finished backend path.
