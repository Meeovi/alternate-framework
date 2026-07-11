#!/usr/bin/env bash

##############################################################################
# Multi-Backend Authentication Test Script
# 
# Tests authentication (register + sign-in) across multiple backends
# (Directus and Magento) using the meeovi-frontend environment
#
# Usage:
#   ./scripts/test-auth-multi-backend.sh
#   BASE_URL=http://localhost:3002 ./scripts/test-auth-multi-backend.sh
#   BACKENDS="directus,magento" ./scripts/test-auth-multi-backend.sh
##############################################################################

set -euo pipefail

# Configuration
BASE_URL="${BASE_URL:-http://0.0.0.0:3011}"
BACKENDS="${BACKENDS:-directus,magento}"
TEST_EMAIL_PREFIX="${TEST_EMAIL_PREFIX:-test.auth}"
TEST_PASSWORD="${TEST_PASSWORD:-SecureTest123!@#}"
VERBOSE="${VERBOSE:-0}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

##############################################################################
# Helper Functions
##############################################################################

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
  ((PASSED_TESTS++))
}

log_error() {
  echo -e "${RED}[✗]${NC} $1"
  ((FAILED_TESTS++))
}

log_warning() {
  echo -e "${YELLOW}[⚠]${NC} $1"
}

log_test() {
  echo -e "${BLUE}[TEST]${NC} $1"
  ((TOTAL_TESTS++))
}

debug_response() {
  if [[ "$VERBOSE" == "1" ]]; then
    echo -e "${YELLOW}[DEBUG]${NC} $1"
  fi
}

##############################################################################
# Main Test Functions
##############################################################################

test_auth_endpoint_health() {
  log_test "Health check: Auth endpoint is accessible"
  
  local response
  response=$(curl --silent --show-error \
    -w "\n%{http_code}" \
    -o /tmp/health_body \
    "$BASE_URL/api/auth/adapter/session")
  
  local http_code=$(echo "$response" | tail -n1)
  
  if [[ "$http_code" == "200" ]]; then
    log_success "Auth endpoint health check passed (HTTP $http_code)"
    return 0
  elif [[ "$http_code" == "401" ]] || [[ "$http_code" == "403" ]]; then
    log_success "Auth endpoint responding (HTTP $http_code - expected for unauthenticated request)"
    return 0
  else
    log_error "Auth endpoint returned HTTP $http_code"
    debug_response "Response: $(cat /tmp/health_body)"
    return 1
  fi
}

test_register() {
  local backend="$1"
  local test_email="${TEST_EMAIL_PREFIX}.${backend}.$(date +%s)@example.com"
  local tmp_dir="/tmp/auth_test_$$"
  
  mkdir -p "$tmp_dir"
  
  log_test "Registration: ${backend} backend with email ${test_email}"
  
  local response_headers="$tmp_dir/register_headers_${backend}"
  local response_body="$tmp_dir/register_body_${backend}"
  
  debug_response "Attempting registration with backend: $backend"
  
  local http_code
  http_code=$(curl --silent --show-error \
    -w "%{http_code}" \
    -D "$response_headers" \
    -o "$response_body" \
    -H 'content-type: application/json' \
    -X POST "$BASE_URL/api/auth/adapter/sign-up" \
    --data "{\"email\":\"$test_email\",\"password\":\"$TEST_PASSWORD\"}" 2>&1 || echo "")
  
  debug_response "HTTP Code: $http_code"
  debug_response "Response headers: $(cat "$response_headers" 2>/dev/null || echo "N/A")"
  debug_response "Response body: $(cat "$response_body" 2>/dev/null || echo "N/A")"
  
  # Check for successful registration (200-299 range)
  if [[ "$http_code" =~ ^2[0-9]{2}$ ]]; then
    # Verify response contains user data
    if grep -q '"user"' "$response_body" 2>/dev/null || grep -q '"id"' "$response_body" 2>/dev/null; then
      log_success "Registration successful for ${backend} backend"
      
      # Save credentials for sign-in test
      echo "$test_email" > "$tmp_dir/email_${backend}"
      echo "$TEST_PASSWORD" > "$tmp_dir/password_${backend}"
      echo "$http_code" > "$tmp_dir/register_http_code_${backend}"
      
      return 0
    else
      log_error "Registration returned 2xx but response missing user data for ${backend}"
      return 1
    fi
  elif [[ "$http_code" == "400" ]]; then
    # Could be validation error or email already exists
    if grep -q 'already exists' "$response_body" 2>/dev/null || grep -q 'email' "$response_body" 2>/dev/null; then
      log_warning "Email might already be registered for ${backend} - using existing account for sign-in test"
      
      # Save credentials for sign-in test
      echo "$test_email" > "$tmp_dir/email_${backend}"
      echo "$TEST_PASSWORD" > "$tmp_dir/password_${backend}"
      
      return 0
    else
      log_error "Registration failed with validation error for ${backend}: HTTP $http_code"
      debug_response "Error response: $(cat "$response_body")"
      return 1
    fi
  else
    log_error "Registration failed for ${backend} backend: HTTP $http_code"
    debug_response "Error response: $(cat "$response_body")"
    return 1
  fi
}

test_signin() {
  local backend="$1"
  local tmp_dir="/tmp/auth_test_$$"
  
  # Retrieve credentials from registration test
  if [[ ! -f "$tmp_dir/email_${backend}" ]] || [[ ! -f "$tmp_dir/password_${backend}" ]]; then
    log_error "Sign-in: Cannot find credentials for ${backend} from registration test"
    return 1
  fi
  
  local test_email=$(cat "$tmp_dir/email_${backend}")
  local test_password=$(cat "$tmp_dir/password_${backend}")
  
  log_test "Sign-in: ${backend} backend with email ${test_email}"
  
  local response_headers="$tmp_dir/signin_headers_${backend}"
  local response_body="$tmp_dir/signin_body_${backend}"
  local response_cookies="$tmp_dir/signin_cookies_${backend}"
  
  debug_response "Attempting sign-in with backend: $backend"
  
  local http_code
  http_code=$(curl --silent --show-error \
    -w "%{http_code}" \
    -D "$response_headers" \
    -o "$response_body" \
    -c "$response_cookies" \
    -H 'content-type: application/json' \
    -X POST "$BASE_URL/api/auth/adapter/sign-in" \
    --data "{\"email\":\"$test_email\",\"password\":\"$test_password\"}" 2>&1 || echo "")
  
  debug_response "HTTP Code: $http_code"
  debug_response "Response headers: $(cat "$response_headers" 2>/dev/null | head -5)"
  debug_response "Response body: $(cat "$response_body" 2>/dev/null)"
  
  # Check for successful sign-in (200-299 range)
  if [[ "$http_code" =~ ^2[0-9]{2}$ ]]; then
    # Verify response contains session data
    if grep -q '"session"' "$response_body" 2>/dev/null || grep -q '"user"' "$response_body" 2>/dev/null || grep -q '"token"' "$response_body" 2>/dev/null; then
      log_success "Sign-in successful for ${backend} backend"
      
      # Verify auth token cookie was set
      if grep -qi 'set-cookie: auth-token' "$response_headers" 2>/dev/null; then
        log_success "Auth token cookie set for ${backend} backend"
      else
        log_warning "Auth token cookie not found in response for ${backend} backend"
      fi
      
      return 0
    else
      log_error "Sign-in returned 2xx but response missing session/user data for ${backend}"
      return 1
    fi
  else
    log_error "Sign-in failed for ${backend} backend: HTTP $http_code"
    debug_response "Error response: $(cat "$response_body")"
    return 1
  fi
}

test_session_validation() {
  local backend="$1"
  local tmp_dir="/tmp/auth_test_$$"
  local response_cookies="$tmp_dir/signin_cookies_${backend}"
  
  log_test "Session validation: Verify session for ${backend} backend"
  
  if [[ ! -f "$response_cookies" ]]; then
    log_error "Session validation: Cannot find cookies from sign-in test"
    return 1
  fi
  
  local response_body="$tmp_dir/session_body_${backend}"
  local http_code
  
  http_code=$(curl --silent --show-error \
    -w "%{http_code}" \
    -o "$response_body" \
    -b "$response_cookies" \
    "$BASE_URL/api/auth/adapter/session" 2>&1 || echo "")
  
  debug_response "Session validation HTTP Code: $http_code"
  debug_response "Session response: $(cat "$response_body" 2>/dev/null)"
  
  if [[ "$http_code" =~ ^2[0-9]{2}$ ]]; then
    if grep -q '"user"' "$response_body" 2>/dev/null; then
      log_success "Session validation successful for ${backend} backend"
      return 0
    else
      log_error "Session validation returned 2xx but missing user data for ${backend}"
      return 1
    fi
  else
    log_error "Session validation failed for ${backend} backend: HTTP $http_code"
    return 1
  fi
}

##############################################################################
# Main Test Runner
##############################################################################

run_all_tests() {
  log_info "Starting multi-backend authentication test suite"
  log_info "Base URL: $BASE_URL"
  log_info "Backends: $BACKENDS"
  log_info "Verbose: $VERBOSE"
  echo ""
  
  # Health check
  log_info "Running health checks..."
  if ! test_auth_endpoint_health; then
    log_error "Auth endpoint is not accessible. Aborting tests."
    exit 1
  fi
  echo ""
  
  # Test each backend
  IFS=',' read -ra BACKEND_ARRAY <<< "$BACKENDS"
  
  for backend in "${BACKEND_ARRAY[@]}"; do
    backend=$(echo "$backend" | xargs) # Trim whitespace
    
    log_info "Testing backend: ${BLUE}${backend}${NC}"
    echo ""
    
    # Run registration test
    if ! test_register "$backend"; then
      log_warning "Registration test failed for ${backend}, skipping subsequent tests"
      echo ""
      continue
    fi
    echo ""
    
    # Run sign-in test
    if ! test_signin "$backend"; then
      log_warning "Sign-in test failed for ${backend}, skipping session validation"
      echo ""
      continue
    fi
    echo ""
    
    # Run session validation test
    if ! test_session_validation "$backend"; then
      log_warning "Session validation test failed for ${backend}"
      echo ""
      continue
    fi
    echo ""
  done
  
  # Print summary
  echo ""
  echo "═══════════════════════════════════════════════════════════════════════════"
  log_info "Test Summary"
  echo "Total Tests: $TOTAL_TESTS"
  echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
  echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
  echo "═══════════════════════════════════════════════════════════════════════════"
  
  if [[ $FAILED_TESTS -gt 0 ]]; then
    log_error "Some tests failed"
    exit 1
  else
    log_success "All tests passed!"
    exit 0
  fi
}

##############################################################################
# Script Entry Point
##############################################################################

# Ensure the script is executable
if [[ ! -x "$0" ]]; then
  chmod +x "$0"
fi

# Run all tests
run_all_tests
