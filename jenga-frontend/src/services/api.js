import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
    },
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getServices = (params) => api.get('/services', { params });
export const getProviderServices = (providerId) => api.get(`/services/provider/${providerId}`);

export const getProviderBookings = (userId) => api.get(`/bookings/user/${userId}`);
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const updateBookingStatus = (bookingId, status) => api.patch(`/bookings/${bookingId}/status`, { status });
export const createReview = (data) => api.post('/reviews', data);

export const acceptBooking = (id) => api.patch(`/bookings/${id}/accept`);
export const declineBooking = (id) => api.patch(`/bookings/${id}/decline`);
export const updateProviderLocation = (id, location) => api.patch(`/bookings/${id}/location`, location);

export const createService = (data) => api.post('/services', data);

export default api;
