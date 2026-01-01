import axios from "axios";

const mode = import.meta.env.VITE_MODE || import.meta.env.MODE || 'local';

let BACKEND_URL = import.meta.env.VITE_BACK_END_LOCAL || 'http://localhost:3300/api/v1/';

if (mode === 'prod') {
  BACKEND_URL = import.meta.env.VITE_BACK_END_PROD || 'http://localhost:3300/api/v1/';
} else if (mode === 'dev') {
  BACKEND_URL = import.meta.env.VITE_BACK_END_DEV || 'http://localhost:3300/api/v1/';
}

console.log('🔧 Mode:', mode);
console.log('🔗 Backend URL:', BACKEND_URL);
console.log('📦 All env vars:', {
  VITE_MODE: import.meta.env.VITE_MODE,
  MODE: import.meta.env.MODE,
  VITE_BACK_END_PROD: import.meta.env.VITE_BACK_END_PROD,
  VITE_BACK_END_DEV: import.meta.env.VITE_BACK_END_DEV,
  VITE_BACK_END_LOCAL: import.meta.env.VITE_BACK_END_LOCAL,
});

export default axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});
