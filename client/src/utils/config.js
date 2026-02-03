// Base URL for the backend server
// Uses environment variable in production, falls back to localhost for development
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
export const API_URL = import.meta.env.VITE_API_URL || `${SERVER_URL}/api`;
