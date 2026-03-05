import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Persistent login: validate stored token on app start
import api from './services/api';

const validateAuth = async () => {
	const token = localStorage.getItem('token');
	if (!token) return;
	try {
		const res = await api.get('/auth/me');
		if (res && res.data && res.data.success && res.data.data) {
			// ensure local user is up-to-date
			localStorage.setItem('user', JSON.stringify(res.data.data));
		} else {
			// invalid token response
			localStorage.removeItem('token');
			localStorage.removeItem('user');
		}
	} catch (err) {
		// on auth failure, clear stored credentials
		console.warn('Auth validation failed on startup', err.message || err);
		localStorage.removeItem('token');
		localStorage.removeItem('user');
	}
};

validateAuth();
