import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import ClientDashboard from '../views/ClientDashboard.vue';
import ProviderDashboard from '../views/provider/ProviderDashboard.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/login',
            name: 'login',
            component: AuthView
        },
        {
            path: '/signup',
            name: 'signup',
            component: AuthView
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: ClientDashboard,
            meta: { requiresAuth: true }
        },
        {
            path: '/booking/:serviceId', // Client Booking Page
            name: 'book-service',
            component: () => import('../views/booking/BookingPage.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/provider/booking/:bookingId', // Provider Action Page
            name: 'provider-booking',
            component: () => import('../views/provider/ProviderBookingPage.vue'),
            meta: { requiresAuth: true, role: 'PROVIDER' }
        },
        {
            path: '/booking/track/:bookingId', // Tracking Page
            name: 'track-booking',
            component: () => import('../views/booking/TrackingPage.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/bookings/:id',
            name: 'booking-details',
            component: () => import('../views/BookingDetails.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/provider/dashboard',
            name: 'provider-dashboard',
            component: ProviderDashboard,
            meta: { requiresAuth: true, role: 'PROVIDER' }
        },
        // Placeholders for sidebar links
        {
            path: '/bookings', // My Bookings Page
            name: 'client-bookings',
            component: () => import('../views/ClientBookings.vue'),
            meta: { requiresAuth: true }
        },
        { path: '/profile', redirect: '/dashboard' },
        { path: '/help', redirect: '/dashboard' }
    ],
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        }
        return { top: 0 }
    }
});

// Navigation Guard
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');

    let user = {};
    try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined') {
            user = JSON.parse(userStr);
        }
    } catch (error) {
        console.error('Error parsing user data in router:', error);
    }

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!token) {
            next('/login');
        } else {
            // Role check
            if (to.meta.role && user.role !== to.meta.role) {
                // Redirect based on actual role
                if (user.role === 'PROVIDER') next('/provider/dashboard');
                else next('/dashboard');
            } else {
                next();
            }
        }
    } else {
        next();
    }
});

export default router
