import axios from 'axios';

// ─── API Base URL ─────────────────────────────────────────────────────────────
// In development:  set NEXT_PUBLIC_API_URL=http://localhost:5000/api in .env.local
// In production:   set NEXT_PUBLIC_API_URL=https://hostel-backend.vercel.app/api
//                  in your Vercel project environment variables dashboard.
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL,
  timeout: 10000,
});

// ─── Request Interceptor — attach JWT token ───────────────────────────────────
if (typeof window !== 'undefined') {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

// ─── Response Interceptor — surface errors cleanly ───────────────────────────
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (backend is unreachable)
    if (!error.response) {
      console.error('Network error — backend unreachable:', error.message);
      return Promise.reject(new Error('Cannot reach the server. Please check your connection.'));
    }

    // 401 Unauthorized — token expired or invalid
    if (error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to root so the user can log in again
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
