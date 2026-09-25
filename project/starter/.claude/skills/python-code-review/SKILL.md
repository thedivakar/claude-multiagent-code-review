---
description: Python-specific code review guidance covering idiomatic Python, common pitfalls, and maintainable patterns
---

# Python Code Review

Use this skill when reviewing Python code.

## Pythonic Patterns

Look for:

- Clear and readable Python code
- Appropriate use of list, dictionary, and set comprehensions
- Context managers for resource handling
- Iterators and generators where appropriate
- Functions with focused responsibilities
- Meaningful naming conventions
- Appropriate use of standard library features

## Type Hints

Prefer:

- Type hints for public functions and important interfaces
- `Optional` or union types when values may be absent
- Clear return types
- Typed collections
- Dataclasses or typed structures for structured data when appropriate

Avoid unnecessary or misleading type annotations.

## Error Handling

Check for:

- Specific exception handling
- Avoiding overly broad `except Exception`
- Meaningful error messages
- Proper resource cleanup
- Avoiding silently ignored exceptions

## Common Python Issues

Look for:

- Mutable default arguments
- Unnecessary global state
- Excessive nesting
- Duplicate code
- Inefficient loops
- Unused imports or variables
- Shadowing built-in names
- Unsafe use of `eval()` or `exec()`
- Incorrect exception handling
- Hardcoded secrets or credentials

## Security

Check for:

- Unsafe deserialization
- Command injection
- SQL injection
- Path traversal
- Hardcoded credentials
- Unsafe subprocess usage
- Untrusted input handling

## Maintainability

Recommend:

- Small focused functions
- Clear module boundaries
- Reusable helper functions
- Appropriate comments for non-obvious logic
- Consistent formatting
- Tests for important behavior

## Review Severity

- **Critical:** Severe correctness or security issue.
- **High:** Significant bug, security problem, or reliability issue.
- **Medium:** Maintainability or correctness concern.
- **Low:** Minor improvement or style suggestion.

## Output

For each issue, provide:

- File and line number
- Severity
- Category
- Description
- Why it matters
- Recommended improvement
