import axios, { AxiosInstance } from "axios";
import { auth } from '@/src/lib/firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include Firebase auth token in headers
let tokenPromise: Promise<string> | null = null;

apiClient.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      // Prevent multiple concurrent getIdToken calls
      if (!tokenPromise) {
        tokenPromise = auth.currentUser.getIdToken();
      }
      try {
        const token = await tokenPromise;
        config.headers.Authorization = `Bearer ${token}`;
      } finally {
        tokenPromise = null;
      }
    }
    return config;
  },
  (error) => {
    tokenPromise = null;
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or handle auth error
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
