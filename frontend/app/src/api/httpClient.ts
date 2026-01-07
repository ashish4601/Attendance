import { ENV } from '@/app/src/config/env';
import axios from 'axios';


export const http = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});


 // Set Authorization header with access token
 
export function setAccessToken(token: string | null) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common.Authorization;
  }
}


 // Remove Authorization header

export function clearAccessToken() {
  delete http.defaults.headers.common.Authorization;
}
