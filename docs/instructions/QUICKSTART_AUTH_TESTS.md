# Quick Start: Auth Testing

This is a quick reference guide to get started with authentication testing.

## 30-Second Setup

### 1. Start the dev server
```bash
cd apps/ecosystem/meeovi-frontend
npm run dev
# Server starts at http://0.0.0.0:3011 (or next available port)
```

### 2. Run the bash smoke test (in another terminal)
```bash
cd apps/ecosystem/meeovi-frontend
./scripts/test-auth-multi-backend.sh
```

### 3. Run comprehensive integration tests
```bash
cd apps/ecosystem/meeovi-frontend
npm run test:auth:integration
```

## Common Commands

```bash
# Test authentication (both bash + integration tests)
npm run test:auth

# Test only with bash script
npm run test:auth:bash

# Test only with Vitest
npm run test:auth:integration

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Test specific backend
BACKENDS="directus" npm run test:auth:bash
BACKENDS="magento" npm run test:auth:bash

# Enable verbose output
VERBOSE=1 npm run test:auth:bash

# Custom base URL (if server on different port)
BASE_URL=http://localhost:3012 npm run test:auth:bash
```

## What Gets Tested

### Bash Script Tests (`npm run test:auth:bash`)
- ✅ Auth endpoint health check
- ✅ User registration with valid credentials
- ✅ User sign-in with registered account
- ✅ Session validation and cookie handling
- ✅ Multi-backend registration/sign-in

**Duration**: ~10 seconds

### Integration Tests (`npm run test:auth:integration`)
- ✅ Registration (valid/invalid email, weak password)
- ✅ Sign-in (correct/incorrect credentials)
- ✅ Session management (token, cookie, validation)
- ✅ Sign-out and session termination
- ✅ Error handling and edge cases
- ✅ Cross-backend compatibility

**Duration**: ~30 seconds

## Test Results

### Success Output
```
Test Summary
Total Tests: 24
Passed: 24
Failed: 0
═══════════════════════════════════════════════════════════════════════════
[✓] All tests passed!
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Auth endpoint is not accessible" | Start dev server with `npm run dev` |
| "Port 3011 already in use" | Dev server auto-shifts to 3012, 3013, etc. Check startup logs |
| "Email already exists" | Tests use timestamp in email, shouldn't happen unless tests run <1s apart |
| "Connection refused" | Check `BASE_URL` matches server port (default http://0.0.0.0:3011) |
| "Database connection error" | Verify `NUXT_DATABASE_URL` in `.env` is valid |

## Environment Variables

```bash
# Override in test commands
BASE_URL=http://localhost:3012              # Auth server URL
BACKENDS="directus,magento"                 # Comma-separated backends to test
TEST_EMAIL_PREFIX="test.auth"               # Email prefix for test accounts
TEST_PASSWORD="SecureTest123!@#"            # Password for test accounts
VERBOSE=1                                   # Enable detailed output
```

## Monitoring Tests

### Watch test file changes
```bash
npm run test:watch -- test/integration/auth-multi-backend.test.ts
```

### Filter tests
```bash
npm run test -- --grep "Sign-In"            # Only sign-in tests
npm run test -- --grep "directus"           # Only directus backend tests
npm run test -- --grep "error"              # Only error handling tests
```

### Get more details
```bash
VERBOSE=1 ./scripts/test-auth-multi-backend.sh  # Bash script verbose
npm run test -- --reporter=verbose              # Vitest verbose
DEBUG=* npm run test:auth:integration           # Full debug output
```

## Full Documentation

For detailed documentation on:
- Architecture overview
- API endpoint reference
- Troubleshooting guide
- CI/CD integration
- Advanced scenarios

See: [docs/AUTH_TESTING.md](../docs/AUTH_TESTING.md)

## Next Steps

1. **Verify Tests Pass**: Run `npm run test:auth` and ensure all pass
2. **Check Logs**: Look for any warnings or errors in terminal output
3. **Debug Failures**: Use `VERBOSE=1` or `DEBUG=*` flags
4. **Read Full Guide**: Open [docs/AUTH_TESTING.md](../docs/AUTH_TESTING.md) for detailed troubleshooting
5. **Setup CI/CD**: Add tests to GitHub Actions (see Full Documentation)

## Quick Links

- 📖 [Full Auth Testing Guide](../docs/AUTH_TESTING.md)
- 🔐 [Auth Layer Implementation](../../layers/auth)
- 🔌 [SDK Auth Adapter](../../packages/modules/alternate-sdk/src/auth)
- 🛠 [Backend Adapters](../../packages/adapters)
