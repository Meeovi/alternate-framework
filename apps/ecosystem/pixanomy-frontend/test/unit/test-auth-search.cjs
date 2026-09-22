#!/usr/bin/env node

/**
 * Test script for authentication and search functionality
 * Tests that users stay logged in across sessions using cookie-based auth
 * and that product search works with meeovi.com/graphql endpoint
 */

const http = require('http');

const API_URL = 'http://0.0.0.0:3005/api/graphql';
let authToken = null;

// Helper function to make GraphQL requests
function graphqlRequest(query, variables = {}, cookies = '') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables });
    
    const options = {
      hostname: '0.0.0.0',
      port: 3005,
      path: '/api/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(cookies && { Cookie: cookies })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      // Extract Set-Cookie headers
      const setCookies = res.headers['set-cookie'];
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ data: response, cookies: setCookies, statusCode: res.statusCode });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test 1: Login with test credentials
async function testLogin() {
  console.log('\n📝 Test 1: User Login (Magento Customer Token)');
  console.log('==========================================');
  
  // Using Magento's actual generateCustomerToken mutation
  const loginQuery = `
    mutation GenerateCustomerToken($email: String!, $password: String!) {
      generateCustomerToken(email: $email, password: $password) {
        token
      }
    }
  `;
  
  try {
    const response = await graphqlRequest(loginQuery, {
      email: 'test@example.com',
      password: 'Test@12345'
    });
    
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Check for auth token in cookies
    if (response.cookies) {
      console.log('\n✅ Cookies Set:');
      response.cookies.forEach(cookie => {
        console.log('  -', cookie);
        // Extract auth-token value
        if (cookie.startsWith('auth-token=')) {
          authToken = cookie.split(';')[0];
          console.log('\n✅ Auth token extracted:', authToken);
        }
      });
    }
    
    if (response.data.data?.generateCustomerToken?.token) {
      const token = response.data.data.generateCustomerToken.token;
      console.log('\n✅ Login Successful!');
      console.log('Magento Customer Token:', token.substring(0, 20) + '...');
      authToken = `auth-token=${token}`;
      return true;
    } else if (response.data.errors) {
      console.log('\n❌ Login Failed:', response.data.errors[0].message);
      return false;
    }
  } catch (error) {
    console.log('\n❌ Request Error:', error.message);
    return false;
  }
}

// Test 2: Verify session persistence by fetching current user
async function testSessionPersistence() {
  console.log('\n\n👤 Test 2: Session Persistence (Magento Customer Query)');
  console.log('==========================================');
  
  if (!authToken) {
    console.log('❌ No auth token found. Skipping test.');
    return false;
  }
  
  // Using Magento's customer query
  const meQuery = `
    query GetCustomer {
      customer {
        firstname
        lastname
        email
      }
    }
  `;
  
  try {
    console.log('Using auth token:', authToken.substring(0, 30) + '...');
    const response = await graphqlRequest(meQuery, {}, authToken);
    
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data?.customer) {
      console.log('\n✅ Session Persisted! User is still logged in.');
      console.log('Customer:', response.data.data.customer);
      return true;
    } else if (response.data.errors) {
      console.log('\n❌ Session Failed:', response.data.errors[0].message);
      return false;
    }
  } catch (error) {
    console.log('\n❌ Request Error:', error.message);
    return false;
  }
}

// Test 3: Product Search
async function testProductSearch() {
  console.log('\n\n🔍 Test 3: Product Search (Magento Products Query)');
  console.log('==========================================');
  
  // Using Magento's products query
  const searchQuery = `
    query SearchProducts($search: String!, $pageSize: Int, $currentPage: Int) {
      products(search: $search, pageSize: $pageSize, currentPage: $currentPage) {
        items {
          id
          uid
          name
          sku
          price_range {
            minimum_price {
              regular_price {
                value
                currency
              }
              final_price {
                value
                currency
              }
            }
          }
          small_image {
            url
            label
          }
        }
        page_info {
          current_page
          page_size
          total_pages
        }
        total_count
      }
    }
  `;
  
  try {
    console.log('Searching for "shirt"...');
    const response = await graphqlRequest(searchQuery, {
      search: 'shirt',
      pageSize: 10,
      currentPage: 1
    });
    
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data?.products?.items) {
      const results = response.data.data.products.items;
      const totalCount = response.data.data.products.total_count;
      console.log(`\n✅ Search Successful! Found ${totalCount} total products, showing ${results.length}.`);
      
      if (results.length > 0) {
        console.log('\nFirst Product:');
        console.log('  Name:', results[0].name);
        console.log('  SKU:', results[0].sku);
        console.log('  Price:', results[0].price_range?.minimum_price?.regular_price?.value);
      } else {
        console.log('\nNote: No products matched "shirt" in the Magento catalog.');
        console.log('This is not necessarily an error - the store may not have products matching this search.');
      }
      
      return true;
    } else if (response.data.errors) {
      console.log('\n❌ Search Failed:', response.data.errors[0].message);
      return false;
    }
  } catch (error) {
    console.log('\n❌ Request Error:', error.message);
    return false;
  }
}

// Test 4: Direct Magento GraphQL endpoint test
async function testMagentoDirectly() {
  console.log('\n\n🌐 Test 4: Direct Magento GraphQL Connection');
  console.log('==========================================');
  
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      query: `{
        products(search: "shirt", pageSize: 5) {
          items {
            id
            name
            sku
            price_range {
              minimum_price {
                regular_price {
                  value
                  currency
                }
              }
            }
          }
        }
      }`
    });
    
    const options = {
      hostname: 'meeovi.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log('Testing direct connection to https://meeovi.com/graphql...');
    
    const req = require('https').request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('Status Code:', res.statusCode);
          console.log('Response:', JSON.stringify(response, null, 2));
          
          if (response.data?.products?.items) {
            console.log(`\n✅ Direct Magento Connection Successful!`);
            console.log(`Found ${response.data.products.items.length} products.`);
            resolve(true);
          } else {
            console.log('\n❌ No products found or error occurred.');
            resolve(false);
          }
        } catch (error) {
          console.log('\n❌ Parse Error:', error.message);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('\n❌ Request Error:', error.message);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  🧪 Testing Auth & Search Functionality                      ║');
  console.log('║  Testing against: http://0.0.0.0:3005/api/graphql            ║');
  console.log('║  Magento Endpoint: https://meeovi.com/graphql                ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  const results = {
    login: false,
    sessionPersistence: false,
    search: false,
    magentoDirectly: false
  };
  
  // Test login
  results.login = await testLogin();
  
  // Test session persistence (only if login succeeded)
  if (results.login) {
    results.sessionPersistence = await testSessionPersistence();
  }
  
  // Test search
  results.search = await testProductSearch();
  
  // Test direct Magento connection
  results.magentoDirectly = await testMagentoDirectly();
  
  // Print summary
  console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  📊 Test Results Summary                                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('  Login:                 ', results.login ? '✅ PASSED' : '❌ FAILED');
  console.log('  Session Persistence:   ', results.sessionPersistence ? '✅ PASSED' : '❌ FAILED');
  console.log('  Product Search:        ', results.search ? '✅ PASSED' : '❌ FAILED');
  console.log('  Direct Magento:        ', results.magentoDirectly ? '✅ PASSED' : '❌ FAILED');
  console.log('\n');
  
  const allPassed = Object.values(results).every(r => r);
  if (allPassed) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please review the output above.');
  }
}

// Run the tests
runTests().catch(console.error);
