const axios = require('axios');

const API_URL = 'http://localhost:3000';
let adminToken = '';
let providerToken = '';
let clientToken = '';
let cleanUpIds = { serviceId: '', bookingId: '', reviewId: '' };

const runVerification = async () => {
    try {
        console.log('--- Starting Reviews Verification ---');

        const timestamp = Date.now();
        const clientEmail = `client${timestamp}@test.com`;
        const providerEmail = `provider${timestamp}@test.com`;
        const password = 'password123';

        console.log('1. Registering users...');

        // Register Client
        try {
            await axios.post(`${API_URL}/users`, {
                email: clientEmail,
                password: password,
                name: 'Test Client',
                role: 'CLIENT'
            });
            console.log('   Client registered.');

            const loginRes = await axios.post(`${API_URL}/auth/login`, { email: clientEmail, password });
            clientToken = loginRes.data.data.token;
        } catch (e) {
            console.log('   Client registration/login failed:', e.response?.data || e.message);
            // If registration failed because user exists, try login
            try {
                const loginRes = await axios.post(`${API_URL}/auth/login`, { email: clientEmail, password });
                clientToken = loginRes.data.data.token;
            } catch (loginErr) {
                console.log('   Client login recovery failed:', loginErr.response?.data || loginErr.message);
            }
        }

        // Register Provider
        try {
            await axios.post(`${API_URL}/users`, {
                email: providerEmail,
                password: password,
                name: 'Test Provider',
                role: 'PROVIDER'
            });
            console.log('   Provider registered.');

            const loginRes = await axios.post(`${API_URL}/auth/login`, { email: providerEmail, password });
            providerToken = loginRes.data.data.token;
        } catch (e) {
            console.log('   Provider registration/login failed:', e.response?.data || e.message);
            try {
                const loginRes = await axios.post(`${API_URL}/auth/login`, { email: providerEmail, password });
                providerToken = loginRes.data.data.token;
            } catch (loginErr) {
                console.log('   Provider login recovery failed:', loginErr.response?.data || loginErr.message);
            }
        }

        if (!clientToken || !providerToken) {
            throw new Error("Failed to authenticate users for testing.");
        }

        // 2. Create Service
        console.log('2. Creating Service...');
        const serviceRes = await axios.post(`${API_URL}/services`, {
            title: `Test Service ${timestamp}`,
            description: 'A test service for reviews',
            category: 'cleaning',
            price: 50
        }, { headers: { Authorization: `Bearer ${providerToken}` } });

        cleanUpIds.serviceId = serviceRes.data.data.id;
        console.log('   Service created:', cleanUpIds.serviceId);

        // 3. Create Booking
        console.log('3. Creating Booking...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const bookingRes = await axios.post(`${API_URL}/bookings`, {
            serviceId: cleanUpIds.serviceId,
            scheduledDate: tomorrow.toISOString()
        }, { headers: { Authorization: `Bearer ${clientToken}` } });

        cleanUpIds.bookingId = bookingRes.data.data.id;
        console.log('   Booking created:', cleanUpIds.bookingId);

        // 4. Update Booking to COMPLETED
        console.log('4. Completing Booking...');

        await axios.patch(`${API_URL}/bookings/${cleanUpIds.bookingId}/status`, {
            status: 'ACCEPTED'
        }, { headers: { Authorization: `Bearer ${providerToken}` } });

        await axios.patch(`${API_URL}/bookings/${cleanUpIds.bookingId}/status`, {
            status: 'COMPLETED'
        }, { headers: { Authorization: `Bearer ${providerToken}` } });

        console.log('   Booking completed.');

        // 5. Create Review
        console.log('5. Creating Review...');
        const reviewRes = await axios.post(`${API_URL}/reviews`, {
            bookingId: cleanUpIds.bookingId,
            rating: 5,
            comment: 'Excellent service!'
        }, { headers: { Authorization: `Bearer ${clientToken}` } });

        cleanUpIds.reviewId = reviewRes.data.data.id;
        console.log('   Review created:', cleanUpIds.reviewId);

        // 6. Verify Service Stats
        console.log('6. Verifying Service Stats...');
        // Wait a bit for eventual consistency if needed, though transaction should be immediate
        const serviceCheckRes = await axios.get(`${API_URL}/services/${cleanUpIds.serviceId}`, { headers: { Authorization: `Bearer ${clientToken}` } });
        const serviceData = serviceCheckRes.data.data;

        if (serviceData.reviewsCount === 1 && serviceData.ratingAverage === 5) {
            console.log('   SUCCESS: Service stats updated correctly.');
        } else {
            console.error('   FAILURE: Service stats incorrect.', serviceData);
        }

        // 7. Test Duplicate Review (Should Fail)
        console.log('7. Testing Duplicate Review Prevention...');
        try {
            await axios.post(`${API_URL}/reviews`, {
                bookingId: cleanUpIds.bookingId,
                rating: 1,
                comment: 'Duplicate attempt'
            }, { headers: { Authorization: `Bearer ${clientToken}` } });
            console.error('   FAILURE: Duplicate review was allowed.');
        } catch (e) {
            if (e.response && e.response.status === 409) {
                console.log('   SUCCESS: Duplicate review prevented (409 Conflict).');
            } else {
                console.log('   Unexpected error for duplicate:', e.message);
            }
        }

        // 8. Test Reviews Retrieval
        console.log('8. Retrieving Reviews...');
        const reviewsListRes = await axios.get(`${API_URL}/reviews/services/${cleanUpIds.serviceId}`);
        const reviews = reviewsListRes.data.data;

        if (reviews.length === 1 && reviews[0].id === cleanUpIds.reviewId) {
            console.log('   SUCCESS: Reviews retrieved correctly.');
        } else {
            console.error('   FAILURE: Reviews retrieval incorrect.', reviews);
        }

        console.log('\n--- Verification Complete ---');

    } catch (err) {
        console.error('Verification Failed:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', err.response.data);
        }
    }
};

runVerification();
