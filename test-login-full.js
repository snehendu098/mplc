// Test login API properly (like browser would)
async function testLogin() {
  try {
    const response = await fetch('http://localhost:3005/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@srgg.com',
        password: 'Admin123!'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    const data = await response.json();
    console.log('\nResponse body:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('Token:', data.data.token.substring(0, 50) + '...');
      console.log('User:', data.data.user.email, '/', data.data.user.role);
    } else {
      console.log('\n❌ LOGIN FAILED:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testLogin();
