---
name: feature-specification
description: Transforms a defined product decision into an implementation-ready specification. Use when a Product Brief is available and the codebase must be analyzed to define feature behavior, assess technical impact, and create implementation tasks.
---

# Feature Specification

## Instructions

1. **Understand the product decision**
   - Review the problem, users, expected outcome, product decision, scope, and open questions.
   - Preserve the intent and scope established during discovery.
   - Do not redefine product decisions without explicit justification.
   - If a required product decision is missing, raise the question instead of inventing an answer.

2. **Analyze the codebase**
   - Inspect the relevant architecture, modules, components, models, APIs, tests, and dependencies.
   - Understand the current behavior before proposing changes.
   - Identify existing patterns and conventions that should be reused.
   - Review relevant project decisions and learnings when available.

3. **Define the solution**
   - Translate the product decision into clear and implementable behavior.
   - Define relevant flows, states, rules, and edge cases.
   - Identify affected components, data, APIs, integrations, and other areas.
   - Consider security, compatibility, migration, and performance when relevant.
   - Prefer the simplest solution consistent with the existing architecture.
   - Avoid introducing new abstractions or dependencies without a clear need.
   - When relevant technical alternatives exist, present the trade-offs and recommend an approach.

4. **Define validation**
   - Create verifiable acceptance criteria for relevant behaviors.
   - Define the tests required to validate the implementation.
   - Cover the main flow and meaningful edge cases.
   - Ensure acceptance criteria trace back to the product decision and scope.

5. **Create implementation tasks**
   - Break the solution into ordered and actionable tasks.
   - Each task should represent a coherent technical change with a clear objective.
   - Identify the areas of the codebase likely to be affected.
   - Record dependencies between tasks when relevant.
   - Include the expected validation for each task.
   - Avoid unnecessary microtasks or creating one task per file.

6. **Validate the specification**
   - Verify that the solution satisfies the product decision.
   - Verify that the approach follows existing project patterns.
   - Verify that tasks are ordered and implementation-ready.
   - Make relevant risks, assumptions, and technical questions explicit.
   - Do not modify code while creating the specification.

If the Product Brief or codebase does not provide enough information for a reliable decision, record the open question instead of inventing requirements or architecture.

## Feature Specification

Use only the relevant sections:

- Summary
- Current Behavior
- Proposed Behavior
- Technical Approach
- Affected Areas
- Acceptance Criteria
- Implementation Tasks
- Risks / Open Questions

Keep the specification proportional to the complexity of the change. Do not create unnecessary documentation for simple features.

## Task Format

For each implementation task:

### Task N — <title>

**Objective**
What this task must accomplish.

**Changes**
- Required changes.

**Affected Areas**
- Relevant files, modules, components, APIs, models, or infrastructure.

**Validation**
- Tests or checks that confirm the task is complete.

## Final Validation

Before considering the specification ready for implementation, verify:

- The relevant codebase was analyzed.
- The solution respects the product decision and scope.
- The approach follows existing project patterns.
- Relevant behaviors are specified.
- Acceptance criteria are verifiable.
- Tasks are ordered and actionable.
- Each task has a validation strategy.
- Relevant risks and technical questions are explicit.
- No product decision was invented.
- No code was modified during specification.

If these conditions are not met, the specification is not ready for implementation.