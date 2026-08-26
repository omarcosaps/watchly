---
name: product-specification
description: Transform a defined product direction into clear and testable requirements. Use when the problem, outcome, and scope are understood and the work needs product requirements, business rules, user flows, edge cases, or acceptance criteria.
---

# Product Specification

## Instructions

1. **Review the product context**
   - Understand the problem, target users, expected outcome, scope, non-goals, assumptions, and constraints.
   - Identify missing decisions that block reliable specification.
   - Do not silently invent missing product decisions.

2. **Define the user experience**
   - Describe the main user flow.
   - Identify relevant states, alternative paths, errors, and edge cases.
   - Preserve the approved product scope.
   - Flag UX decisions that require design validation.

3. **Define requirements**
   - Write clear and testable functional requirements.
   - Document relevant business rules and constraints.
   - Add non-functional requirements only when known or required.
   - Separate product requirements from technical implementation decisions.

4. **Define acceptance criteria**
   - Create verifiable acceptance criteria for relevant behaviors.
   - Cover the happy path and meaningful edge cases.
   - Use Given / When / Then when it improves clarity.
   - Avoid unnecessary implementation details.

5. **Identify delivery concerns**
   - Identify relevant dependencies and risks.
   - Consider analytics, permissions, migration, compatibility, security, and rollout when applicable.
   - Flag architecture, estimation, infrastructure, and other technical decisions that require engineering validation.

6. **Prepare for technical planning**
   - Ensure requirements are traceable to the approved product scope.
   - Create User Stories only when they improve execution clarity.
   - Keep stories traceable to requirements and acceptance criteria.
   - Make unresolved decisions explicit.

If missing information prevents reliable specification, return the blocking questions instead of inventing requirements.

## Template

When a Product Specification is needed, use only the relevant sections:

- Summary
- Product Context
- Scope
- Non-goals
- User Flow
- Functional Requirements
- Business Rules
- Acceptance Criteria
- Edge Cases
- Dependencies
- Risks
- Analytics
- Rollout
- Open Questions

## Validation

Before handing off to technical planning, verify:

- Requirements are clear and testable.
- Scope matches the approved product direction.
- Business rules are explicit.
- Relevant edge cases are covered.
- Acceptance criteria are verifiable.
- Dependencies and risks are visible.
- Technical decisions requiring engineering input are flagged.
- No important product decision was silently invented.

If blocking product decisions remain unresolved, return them to Product Manager before technical planning.