import axios from 'axios';
import { store } from '../store/store';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
