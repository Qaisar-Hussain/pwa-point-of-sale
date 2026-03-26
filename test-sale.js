const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!'
};

async function testRecordSale() {
  console.log('🧪 Testing Record Sale functionality...\n');

  try {
    // Create axios instance with cookie jar
    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('1. Testing login...');
    
    // Test login
    const loginResponse = await axiosInstance.post('/api/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    console.log('✅ Login successful');
    console.log('   Status:', loginResponse.status);

    // Test getting products
    console.log('\n2. Testing product retrieval...');
    const productsResponse = await axiosInstance.get('/api/products');
    console.log('✅ Products retrieved');
    console.log('   Products count:', productsResponse.data.length);

    if (productsResponse.data.length === 0) {
      console.log('❌ No products found in database');
      return;
    }

    const product = productsResponse.data[0];
    console.log('   First product:', product.name, '- Price:', product.price);

    // Test recording a sale
    console.log('\n3. Testing record sale...');
    
    const saleData = {
      cartItems: [
        {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: parseFloat(product.price),
          quantity: 2
        }
      ]
    };

    const saleResponse = await axiosInstance.post('/api/sales', saleData);
    console.log('✅ Sale recorded successfully');
    console.log('   Sale ID:', saleResponse.data.id);
    console.log('   Total Amount:', saleResponse.data.totalAmount);

    console.log('\n🎉 All tests passed! Record Sale functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testRecordSale();