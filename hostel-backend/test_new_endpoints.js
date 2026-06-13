const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  try {
    console.log('🔑 Logging in as admin...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hostel.com',
        password: 'admin123'
      })
    });
    const loginJson = await loginRes.json();

    if (!loginJson.success) {
      console.error('❌ Login failed:', loginJson);
      process.exit(1);
    }

    const token = loginJson.data.token;
    console.log('✅ Login successful. Token obtained.');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('🔍 Testing GET /admin/rooms...');
    const roomsRes = await fetch(`${BASE_URL}/admin/rooms`, { headers });
    const roomsJson = await roomsRes.json();
    if (roomsJson.success) {
      console.log(`✅ Success! Received ${roomsJson.data.length} rooms.`);
    } else {
      console.error('❌ GET /admin/rooms failed:', roomsJson);
    }

    console.log('🔍 Testing GET /admin/report...');
    const reportRes = await fetch(`${BASE_URL}/admin/report`, { headers });
    const reportJson = await reportRes.json();
    if (reportJson.success) {
      const { students, fees, complaints, leaves, gateLogs } = reportJson.data;
      console.log('✅ Success! Received report data:');
      console.log(`- Students: ${students?.length}`);
      console.log(`- Fees: ${fees?.length}`);
      console.log(`- Complaints: ${complaints?.length}`);
      console.log(`- Leaves: ${leaves?.length}`);
      console.log(`- Gate Logs: ${gateLogs?.length}`);
    } else {
      console.error('❌ GET /admin/report failed:', reportJson);
    }

  } catch (err) {
    console.error('❌ Test execution encountered error:', err.message);
  }
}

runTests();
