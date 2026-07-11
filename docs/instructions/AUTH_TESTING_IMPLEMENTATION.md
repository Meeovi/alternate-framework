# Authentication Testing Implementation Summary

## Overview

A comprehensive multi-backend authentication testing suite has been created for the Meeovi frontend application. The suite tests authentication flows across multiple backends (Directus and Magento) using the Better Auth layer.

## Files Created

### 1. **Bash Smoke Test Script**
📄 `apps/ecosystem/meeovi-frontend/scripts/test-auth-multi-backend.sh`

**Purpose**: Quick health check and smoke testing for authentication endpoints
- Framework: Bash with curl
- No external dependencies
- Tests: Registration, Sign-in, Session validation
- Output: Color-coded test results with summary

**Usage**:
```bash
./scripts/test-auth-multi-backend.sh
VERBOSE=1 ./scripts/test-auth-multi-backend.sh
BACKENDS="directus,magento" ./scripts/test-auth-multi-backend.sh
```

### 2. **Vitest Integration Tests**
📄 `apps/ecosystem/meeovi-frontend/test/integration/auth-multi-backend.test.ts`

**Purpose**: Comprehensive integration testing with parametrized backend tests
- Framework: Vitest
- Coverage: Registration, Sign-in, Sessions, Sign-out, Error handling
- Scope: Unit + Integration testing for auth flows
- Test Count: 40+ test cases across multiple suites

**Usage**:
```bash
npm run test:auth:integration
npm run test -- --project integration
npm run test:watch -- test/integration/auth-multi-backend.test.ts
```

**Test Suites**:
- Health Check: Endpoint accessibility
- Registration: Valid/invalid email, password requirements
- Sign-In: Valid/invalid credentials, session creation
- Session Validation: Token handling, cookie management
- Sign-Out: Session termination, cookie clearing
- Cross-Backend Compatibility: Multi-backend scenarios

### 3. **Updated Vitest Configuration**
📝 `apps/ecosystem/meeovi-frontend/vitest.config.ts`

**Changes**:
- Added `integration` test project
- 30-second timeout for HTTP requests
- Node environment for integration tests

### 4. **Package.json Scripts**
📝 `apps/ecosystem/meeovi-frontend/package.json`

**New Scripts**:
```json
{
  "test:auth:bash": "bash ./scripts/test-auth-multi-backend.sh",
  "test:auth:integration": "vitest run --project integration",
  "test:auth": "npm run test:auth:bash && npm run test:auth:integration",
  "test": "vitest",
  "test:watch": "vitest watch"
}
```

### 5. **Documentation**

#### Full Guide
📄 `apps/ecosystem/meeovi-frontend/docs/AUTH_TESTING.md`

**Sections**:
- Overview and architecture
- Step-by-step running tests
- Environment configuration
- API endpoint reference with examples
- 4 main test scenarios with commands
- Troubleshooting guide with common issues
- Debugging tips and individual endpoint testing
- CI/CD integration example
- References and next steps

#### Quick Start
📄 `apps/ecosystem/meeovi-frontend/QUICKSTART_AUTH_TESTS.md`

**Sections**:
- 30-second setup guide
- Common commands reference table
- Test coverage summary
- Common issues with solutions
- Environment variable reference
- Quick links to resources

## Architecture

### Auth Flow
```
Frontend (meeovi-frontend)
    ↓
Nuxt API Routes (/server/api/auth/*)
    ↓
Better Auth Layer (/layers/auth)
    ↓
Backend Adapters (Directus, Magento)
    ↓
Database (Supabase PostgreSQL)
```

### Tested Endpoints
- `POST /api/auth/adapter/sign-up` - Register new user
- `POST /api/auth/adapter/sign-in` - Authenticate user
- `GET /api/auth/adapter/session` - Retrieve current session
- `POST /api/auth/adapter/sign-out` - Logout and invalidate session

## Test Coverage

### Bash Script Coverage
- ✅ Endpoint health check
- ✅ Multi-backend registration
- ✅ Multi-backend sign-in
- ✅ Session validation
- ✅ Cookie handling
- ✅ HTTP status code verification
- ✅ JSON response validation

### Integration Test Coverage
- ✅ Registration flow (valid email, invalid email, weak password)
- ✅ Sign-in flow (valid credentials, invalid credentials, missing users)
- ✅ Session management (token creation, retrieval, termination)
- ✅ Sign-out functionality
- ✅ Error handling and edge cases
- ✅ Cross-backend compatibility
- ✅ Cookie and header verification
- ✅ Concurrent requests across backends

## Key Features

### 1. Multi-Backend Support
Tests can run against multiple backends sequentially or in parallel:
- Directus (CMS/User Management)
- Magento (E-commerce)
- Built-in Email/Password

### 2. Configuration
```bash
# Environment Variables
BASE_URL                  # Auth server URL (default: http://0.0.0.0:3011)
BACKENDS                  # Comma-separated backends (default: directus,magento)
TEST_EMAIL_PREFIX         # Email prefix for test accounts
TEST_PASSWORD             # Password for test accounts
VERBOSE                   # Enable detailed output
```

### 3. Flexible Execution
- **Bash Script**: Works without installing Node packages, instant feedback
- **Integration Tests**: Comprehensive testing, can be run in CI/CD
- **Watch Mode**: Real-time test execution during development
- **Filtered Tests**: Run specific backend or test type

### 4. Detailed Reporting
- Color-coded output (Green/Red/Yellow/Blue)
- Test counters (Total/Passed/Failed)
- HTTP status codes and response validation
- Verbose mode for debugging
- Debug response logging

## Running the Tests

### Quick Start (Bash Only)
```bash
cd apps/ecosystem/meeovi-frontend

# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests
./scripts/test-auth-multi-backend.sh
```

### Full Test Suite (Requires Vitest)
```bash
# Install vitest (if not installed)
npm install --save-dev vitest @nuxt/test-utils

# Run all tests
npm run test:auth

# Or run individually
npm run test:auth:bash        # Bash script only
npm run test:auth:integration # Vitest only
```

### Custom Configuration
```bash
# Test only one backend
BACKENDS="directus" ./scripts/test-auth-multi-backend.sh

# Test with custom password
TEST_PASSWORD="MyPass123!@#" npm run test:auth:bash

# Enable debugging
VERBOSE=1 npm run test:auth:bash
DEBUG=* npm run test:auth:integration

# Different server
BASE_URL=http://localhost:3012 npm run test:auth:bash
```

## Troubleshooting

### Issue: "Auth endpoint is not accessible"
**Solution**: Ensure dev server is running
```bash
# Check if running
curl http://0.0.0.0:3011/api/auth/adapter/session

# Start if not running
npm run dev
```

### Issue: "Vitest command not found"
**Solution**: Install Vitest locally or globally
```bash
npm install --save-dev vitest @nuxt/test-utils
# or
npm install -g vitest
```

### Issue: Database connection error
**Solution**: Verify DATABASE_URL in .env
```bash
grep DATABASE_URL .env
psql "$NUXT_DATABASE_URL" -c "SELECT version();"
```

### Issue: Backend authentication fails
**Solution**: Check backend configuration
```bash
# For Directus
curl https://cms.meeovicms.com/graphql \
  -H "Authorization: Bearer $DIRECTUS_STATIC_TOKEN"

# For Magento
curl https://your-magento-store.com/oauth/authorize
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Install dependencies
  run: npm install

- name: Run auth tests
  env:
    BASE_URL: http://localhost:3011
  run: |
    npm run dev &
    sleep 5
    npm run test:auth
```

## Dependencies

### Bash Script
- curl
- bash (any recent version)
- grep, sed (standard Unix tools)

### Integration Tests
- vitest (optional, for comprehensive testing)
- @nuxt/test-utils (optional)
- Node.js 18+

## Next Steps

1. **Install Vitest** (Optional):
   ```bash
   npm install --save-dev vitest @nuxt/test-utils
   ```

2. **Run Initial Tests**:
   ```bash
   ./scripts/test-auth-multi-backend.sh
   ```

3. **Review Results**: Check terminal output for test results

4. **Setup CI/CD**: Add to GitHub Actions or other CI system

5. **Extend Tests**: Add more test cases as needed

6. **Monitor**: Set up logging and monitoring for auth failures

## References

### Documentation
- [Full Auth Testing Guide](docs/AUTH_TESTING.md)
- [Quick Start Guide](QUICKSTART_AUTH_TESTS.md)
- [Better Auth Documentation](https://better-auth.com)

### Code
- [Auth Layer](/layers/auth)
- [Auth Server Utils](/layers/auth/server/utils/auth.ts)
- [SDK Auth Module](/packages/modules/alternate-sdk/src/auth)
- [Backend Adapters](/packages/adapters)

### Environment
- [Meeovi Frontend Env](.env)
- [Supabase PostgreSQL](https://supabase.com)
- [Directus CMS](https://directus.io)
- [Magento E-commerce](https://magento.com)

## Summary

A complete authentication testing framework has been established for the Meeovi frontend. The suite supports:

✅ Multiple backends (Directus, Magento)
✅ Complete auth flows (Registration → Sign-in → Sessions)
✅ Error handling and edge cases
✅ Easy execution via bash or Node.js
✅ Comprehensive documentation
✅ CI/CD ready
✅ No external dependencies (bash version)

The tests can be run with a single command and provide clear feedback on authentication health across all configured backends.
