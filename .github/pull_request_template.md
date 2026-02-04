## Summary
- What changed and why

## Test Plan
- [ ] Unit tests pass (`pytest backend/tests/`)
- [ ] Integration tests pass
- [ ] Manual smoke test

## Checklist
- [ ] No secrets in code (passwords, API keys, tokens)
- [ ] Pydantic schemas for all request/response models
- [ ] Error handling — no bare `except:` or silent failures
- [ ] Tests added/updated for changed code
- [ ] `.env.template` updated if new env vars added
- [ ] No SQL in routers — repository layer only
- [ ] Input validation on user-facing endpoints
