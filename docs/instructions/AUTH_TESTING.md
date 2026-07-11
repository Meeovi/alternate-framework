# Multi-Backend Authentication Testing Guide

This guide explains how to test authentication across multiple backends (Directus and Magento) in the Meeovi frontend application.

## Overview

The authentication system supports multiple backend adapters through a unified interface:
- **Better Auth Layer**: The core authentication middleware (`/layers/auth`)
- **Alternate SDK**: Backend adapter integration (`/packages/modules/alternate-sdk`)
- **Meeovi Frontend**: Test application with environment configuration

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
Database (Supabase PostgreSQL via Prisma)
```

### Backends Supported

- **Directus**: Headless CMS with user management API
- **Magento**: E-commerce platform with OAuth support
- **Email/Password**: Native better-auth authentication

## Running Tests

### 1. Shell Script Test (Quick Smoke Test)

The shell script performs basic health checks and registration/sign-in flows:

```bash
# Run with default settings
./scripts/test-auth-multi-backend.sh

# Run with custom base URL
BASE_URL=http://localhost:3011 ./scripts/test-auth-multi-backend.sh

# Run with custom backends
BACKENDS="directus,magento" ./scripts/test-auth-multi-backend.sh

# Enable verbose output
VERBOSE=1 ./scripts/test-auth-multi-backend.sh

# Custom test credentials
TEST_EMAIL_PREFIX=mytest TEST_PASSWORD="MyPass123!@#" ./scripts/test-auth-multi-backend.sh
```

**Features:**
- Health check: Verifies auth endpoint is accessible
- Registration test: Creates a new user account
- Sign-in test: Logs in with created credentials
- Session validation: Verifies session tokens and cookies
- Multi-backend: Tests each backend sequentially

### 2. Vitest Integration Tests

Comprehensive integration tests using Vitest framework:

```bash
# Run integration tests only
npm run test -- --project integration

# Run all tests
npm run test

# Run with watch mode
npm run test:watch -- --project integration

# Run specific backend test
npm run test -- --project integration --grep "Backend: directus"

# Run specific test suite
npm run test -- --project integration --grep "Sign-In"
```

**Features:**
- Parametrized tests for each backend
- Complete authentication flow testing
- Error handling and edge cases
- Cross-backend compatibility checks
- Session validation and cookie handling
- Parallel test execution

### 3. Running the Frontend Dev Server

Before running tests, ensure the dev server is running:

```bash
cd apps/ecosystem/meeovi-frontend

# Install dependencies (if needed)
npm install

# Start dev server (default: http://0.0.0.0:3011)
npm run dev

# Dev server will auto-shift port if 3011 is busy
# Check terminal output for actual port!
```

## Environment Configuration

### `.env` File Setup

The `.env` file in `meeovi-frontend` configures the authentication backends:

```bash
# ============================================
# Adapter Selection
# ============================================
MEEOVI_PROVIDER=directus                    # Primary content provider
NUXT_PUBLIC_AUTH_BACKEND=magento            # Auth backend (better-auth adapter)

# ============================================
# Better Auth Configuration
# ============================================
BETTER_AUTH_SECRET=<your-secret-key>
BETTER_AUTH_URL=http://0.0.0.0:3011
BETTER_AUTH_DATABASE_PROVIDER=prisma
BETTER_AUTH_PLUGINS=twoFactor,username,organization

# ============================================
# Database
# ============================================
NUXT_DATABASE_URL=postgresql://...          # Supabase PostgreSQL
DATABASE_PROVIDER=postgresql

# ============================================
# Directus Configuration
# ============================================
DIRECTUS_URL=https://cms.meeovicms.com
DIRECTUS_GRAPHQL=https://cms.meeovicms.com/graphql
DIRECTUS_STATIC_TOKEN=<your-token>

# ============================================
# Magento Configuration  
# ============================================
# Set in your Magento store settings
MAGENTO_CLIENT_ID=<your-client-id>
MAGENTO_CLIENT_SECRET=<your-client-secret>
```

## API Endpoints

All auth endpoints are at `/api/auth/adapter/*`:

### Registration
```bash
POST /api/auth/adapter/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!@#"
}

Response:
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "emailVerified": false,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  },
  "session": {
    "token": "auth-token",
    "expiresAt": 1704067200000
  }
}
```

### Sign-In
```bash
POST /api/auth/adapter/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!@#"
}

Response:
{
  "session": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "emailVerified": true
    },
    "token": "auth-token",
    "expiresAt": 1704067200000
  }
}

Headers:
Set-Cookie: auth-token=...; Max-Age=604800; Path=/; HttpOnly; Secure
```

### Get Session
```bash
GET /api/auth/adapter/session
Cookie: auth-token=...

Response (authenticated):
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "emailVerified": true
  },
  "token": "auth-token"
}

Response (unauthenticated):
{
  "user": null
}
```

### Sign-Out
```bash
POST /api/auth/adapter/sign-out
Cookie: auth-token=...

Response:
{
  "success": true
}

Headers:
Set-Cookie: auth-token=; Max-Age=0; Path=/; HttpOnly; Secure
```

## Test Scenarios

### 1. Basic Registration and Sign-In

**Goal**: Verify that a user can register and then sign in with their credentials.

```bash
BACKENDS="directus" npm run test -- --project integration --grep "Registration|Sign-In"
```

**What it tests:**
1. Registration with valid email/password
2. Sign-in with registered credentials
3. Session validation after sign-in

### 2. Multi-Backend Registration

**Goal**: Verify that registration works across all configured backends.

```bash
BACKENDS="directus,magento" npm run test -- --project integration --grep "Cross-Backend"
```

**What it tests:**
1. Simultaneous registration attempts on multiple backends
2. Backend adapter switching
3. Unified session handling

### 3. Error Handling

**Goal**: Verify that invalid inputs are properly rejected.

```bash
npm run test -- --project integration --grep "invalid|reject|wrong"
```

**What it tests:**
1. Invalid email format rejection
2. Weak password rejection
3. Incorrect password rejection
4. Non-existent user rejection
5. Duplicate email handling

### 4. Session Management

**Goal**: Verify that session tokens and cookies are properly handled.

```bash
npm run test -- --project integration --grep "Session|Cookie|Token"
```

**What it tests:**
1. Auth token cookie generation
2. Session retrieval with valid cookie
3. Session invalidation after sign-out
4. Token expiration handling

## Troubleshooting

### Issue: "Auth endpoint is not accessible"

**Cause**: Dev server not running or wrong port

**Solution**:
```bash
# Check if server is running
curl http://0.0.0.0:3011/api/auth/adapter/session

# If not running, start it
cd apps/ecosystem/meeovi-frontend
npm run dev

# Check the actual port from output (may auto-shift to 3012, 3013, etc.)
```

### Issue: "Registration failed with validation error"

**Cause**: 
- Email already exists
- Password doesn't meet requirements
- Email format invalid

**Solution**:
```bash
# Use unique email prefix
TEST_EMAIL_PREFIX="test.$(date +%s)" ./scripts/test-auth-multi-backend.sh

# Use stronger password
TEST_PASSWORD="SecureTest123!@#" ./scripts/test-auth-multi-backend.sh
```

### Issue: "Magento backend returns 401"

**Cause**: 
- OAuth credentials not configured
- Magento store URL incorrect
- Client ID/Secret invalid

**Solution**:
```bash
# Verify environment variables
grep MAGENTO_ apps/ecosystem/meeovi-frontend/.env

# Test Magento directly
curl https://your-magento-store.com/rest/V1/customers/me \
  -H "Authorization: Bearer <token>"
```

### Issue: "Directus backend returns 401"

**Cause**:
- Static token expired
- Token doesn't have correct permissions
- Directus URL incorrect

**Solution**:
```bash
# Verify Directus connection
curl https://cms.meeovicms.com/graphql \
  -H "Authorization: Bearer <token>" \
  -X POST \
  -d '{"query": "{ users { id email } }"}'
```

### Issue: "Database connection error"

**Cause**:
- Supabase connection string invalid
- Database permissions insufficient
- Network connectivity issue

**Solution**:
```bash
# Verify DATABASE_URL format
grep DATABASE_URL apps/ecosystem/meeovi-frontend/.env

# Test connection
psql "$NUXT_DATABASE_URL" -c "SELECT version();"
```

## Debugging

### Enable Verbose Logging

```bash
# Bash script verbose mode
VERBOSE=1 ./scripts/test-auth-multi-backend.sh

# Vitest debug output
DEBUG=* npm run test -- --project integration
```

### Check Auth Layer Logs

```bash
# View auth layer generation
cd layers/auth
npx auth generate --config ./server/utils/auth.ts

# Check generated auth files
ls -la ./.auth/
```

### Test Individual Endpoints

```bash
# Registration
curl -X POST http://0.0.0.0:3011/api/auth/adapter/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Sign-in
curl -X POST http://0.0.0.0:3011/api/auth/adapter/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Session
curl http://0.0.0.0:3011/api/auth/adapter/session \
  -H "Cookie: auth-token=your-token"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Auth Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      
      - name: Start Dev Server
        run: npm run dev &
      
      - name: Wait for Server
        run: sleep 5
      
      - name: Run Auth Tests
        env:
          BASE_URL: http://localhost:3011
          BACKENDS: directus,magento
        run: npm run test -- --project integration
```

## Next Steps

1. **OAuth Setup**: Configure Google/GitHub OAuth for social authentication
2. **2FA Implementation**: Add TOTP authenticator support (better-auth plugin)
3. **Email Verification**: Set up email verification flows
4. **Password Reset**: Implement password recovery flows
5. **Rate Limiting**: Configure authentication rate limiting
6. **Monitoring**: Set up auth event logging and monitoring

## References

- [Better Auth Documentation](https://better-auth.com)
- [Alternate SDK Auth Module](../../packages/modules/alternate-sdk/src/auth)
- [Auth Layer](../../layers/auth)
- [Directus API Documentation](https://docs.directus.io)
- [Magento REST API](https://devdocs.magento.com/guides/v2.4/rest/bk-rest.html)
