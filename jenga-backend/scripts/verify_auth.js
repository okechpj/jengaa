const axios = require('axios');

const API_URL = 'http://localhost:3000';

const runVerification = async () => {
    try {
        console.log('--- Starting Auth Refactor Verification ---');
        const timestamp = Date.now();
        const clientEmail = `client_${timestamp}@test.com`;
        const providerEmail = `provider_${timestamp}@test.com`;
        const password = 'password123';

        // 1. Test Public Registration (Client)
        console.log('1. Testing Client Registration (POST /auth/register)...');
        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                email: clientEmail,
                password,
                name: 'Test Client',
                role: 'CLIENT'
            });

            if (res.status === 201 && res.data.data.token && res.data.data.user.role === 'CLIENT') {
                console.log('   SUCCESS: Client registered and received token.');
            } else {
                console.error('   FAILURE: Unexpected response format', res.data);
            }
        } catch (e) {
            console.error('   FAILURE: Client registration failed', e.response?.data || e.message);
        }

        // 2. Test Public Registration (Provider)
        console.log('2. Testing Provider Registration (POST /auth/register)...');
        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                email: providerEmail,
                password,
                name: 'Test Provider',
                role: 'PROVIDER'
            });

            if (res.status === 201 && res.data.data.token && res.data.data.user.role === 'PROVIDER') {
                console.log('   SUCCESS: Provider registered and received token.');
            } else {
                console.error('   FAILURE: Unexpected response format', res.data);
            }
        } catch (e) {
            console.error('   FAILURE: Provider registration failed', e.response?.data || e.message);
        }

        // 3. Test Admin Registration via Public Endpoint (Should Fail)
        console.log('3. Testing Admin Registration via Public Endpoint (Should Fail)...');
        try {
            await axios.post(`${API_URL}/auth/register`, {
                email: `admin_${timestamp}@test.com`,
                password,
                name: 'Fake Admin',
                role: 'ADMIN'
            });
            console.error('   FAILURE: Admin registration was allowed!');
        } catch (e) {
            if (e.response && e.response.status === 403) {
                console.log('   SUCCESS: Admin registration prevented (403 Forbidden).');
            } else {
                console.error('   FAILURE: Unexpected status code', e.response?.status, e.response?.data);
            }
        }

        // 4. Test Protected User Creation (POST /users) (Should Fail without Auth)
        console.log('4. Testing Protected User Creation Route (POST /users) without Auth...');
        try {
            await axios.post(`${API_URL}/users`, {
                email: `hacker_${timestamp}@test.com`,
                password,
                name: 'Hacker',
                role: 'ADMIN'
            });
            console.error('   FAILURE: Protected route was accessible!');
        } catch (e) {
            if (e.response && e.response.status === 401) {
                console.log('   SUCCESS: Protected route rejected unauthenticated request (401 Unauthorized).');
            } else {
                console.error('   FAILURE: Unexpected status code', e.response?.status);
            }
        }

        console.log('\n--- Verification Complete ---');

    } catch (err) {
        console.error('Verification Script Error:', err.message);
    }
};

runVerification();
