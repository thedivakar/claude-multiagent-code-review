---
description: TypeScript-specific code review guidance covering type safety, advanced patterns, and common type issues
---

# TypeScript Patterns

Use this skill when reviewing TypeScript code.

## Type Safety Best Practices

- Prefer explicit types for public APIs and function parameters.
- Avoid `any` unless there is a clear justification.
- Use `unknown` when the type is not known and narrow it safely.
- Use strict null checks and handle `undefined` and `null` explicitly.
- Avoid unsafe type assertions when type guards or proper typing can be used.
- Prefer union types over loosely typed values.
- Use interfaces or type aliases to describe structured data clearly.

## Advanced TypeScript Patterns

- Use generics when the same logic should work with multiple types.
- Use discriminated unions for related states or result types.
- Use utility types such as `Partial`, `Pick`, `Omit`, and `Record` when appropriate.
- Use type guards to safely narrow `unknown` or union types.
- Prefer readonly properties and arrays when values should not be mutated.
- Keep complex types understandable and avoid unnecessary type-level complexity.

## Common Type Issues

Look for:

- Excessive use of `any`
- Unsafe type assertions
- Missing null/undefined handling
- Incorrect generic constraints
- Functions returning overly broad types
- Inconsistent interfaces
- Type duplication
- Unnecessary non-null assertions (`!`)
- Incorrect use of optional properties
- Runtime assumptions that are not represented in the types

## Review Severity

- **Critical:** Type issue can cause serious runtime failures or unsafe behavior.
- **High:** Significant type-safety problem likely to cause bugs.
- **Medium:** Maintainability or correctness concern.
- **Low:** Minor improvement or style suggestion.

## Output

For each TypeScript issue, provide:

- File and line number
- Severity
- Description of the problem
- Why it matters
- Suggested improvement