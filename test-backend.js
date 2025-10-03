// Test script to verify backend connectivity
const axios = require('axios');

async function testBackend() {
  const backendUrl = 'https://mcan-national-website.onrender.com/api/v1';
  
  try {
    console.log('Testing backend connectivity...');
    console.log('Backend URL:', backendUrl);
    
    // Test if backend is responding
    const response = await axios.get(`${backendUrl}/auth/test`, {
      timeout: 10000
    });
    
    console.log('✅ Backend is responding');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Backend connection failed');
    console.log('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('Backend server is not running');
    } else if (error.code === 'ENOTFOUND') {
      console.log('Backend URL is not found');
    } else if (error.response) {
      console.log('Backend responded with error:', error.response.status);
    }
  }
}

testBackend();
