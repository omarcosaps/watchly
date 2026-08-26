---
name: technical-planning
description: Analyze a defined product specification and the existing codebase to produce an implementation-ready technical plan with ordered, actionable tasks, dependencies, risks, and validation.
---

# Technical Planning

## Instructions

1. **Understand the specification**
   - Review the problem, scope, requirements, business rules, acceptance criteria, and constraints.
   - Identify missing information that materially affects the technical solution.
   - Do not invent product decisions.

2. **Analyze the codebase**
   - Inspect the relevant architecture, modules, files, interfaces, data models, APIs, tests, and dependencies.
   - Trace the current behavior before proposing changes.
   - Identify existing patterns and conventions that should be reused.
   - Prefer consistency with the existing codebase.

3. **Assess impact**
   - Identify components and flows affected by the change.
   - Evaluate data, API, integration, security, performance, compatibility, and migration impacts when relevant.
   - Identify potential regressions and technical risks.

4. **Design the technical approach**
   - Propose the simplest solution consistent with the existing architecture.
   - Prefer reuse and extension before introducing new abstractions.
   - Avoid unnecessary dependencies and architectural changes.
   - When multiple viable approaches exist, explain relevant trade-offs and recommend one.

5. **Create implementation tasks**
   - Break the implementation into ordered, actionable tasks.
   - Each task must represent a coherent technical change with a clear objective and expected outcome.
   - Identify the files, modules, or components likely affected by each task.
   - Define dependencies between tasks.
   - Include the tests or validation required for each task.
   - Keep tasks small enough to implement and validate independently.
   - Do not create one task per file or unnecessary microtasks.

6. **Validate the plan**
   - Ensure planned changes trace back to product requirements.
   - Verify that acceptance criteria can be validated by the implementation.
   - Check task ordering and dependencies.
   - Check for unnecessary scope or complexity.
   - Make assumptions and unresolved technical decisions explicit.

Do not modify code while creating the technical plan.

If the repository does not provide enough evidence for a technical decision, state the uncertainty and request clarification instead of inventing architecture.

## Task Format

For each implementation task use:

### Task N — <title>

**Objective**
What this task must accomplish.

**Changes**
- Required technical changes.

**Affected Areas**
- Files, modules, components, APIs, models, or infrastructure likely affected.

**Dependencies**
- Previous tasks or prerequisites, or `None`.

**Validation**
- Tests, checks, or acceptance criteria that confirm the task is complete.

## Template

When a Technical Plan is needed, use only the relevant sections:

- Summary
- Current Architecture
- Proposed Approach
- Affected Components
- Data / API Changes
- Implementation Tasks
- Dependencies
- Risks
- Migration / Compatibility
- Open Technical Questions

## Validation

Before considering the plan ready for implementation, verify:

- The relevant code paths were inspected.
- The approach follows established project patterns.
- Requirements map to planned changes.
- Tasks are ordered and actionable.
- Task dependencies are explicit.
- Each task has a validation strategy.
- Relevant tests are planned.
- Risks and dependencies are visible.
- Unnecessary architectural changes were avoided.
- No product decision was silently invented.

If the technical approach cannot be justified from the specification and codebase, do not proceed to implementation.