import axios from 'axios';
import { getToken } from '../utils/statePersistence';
import { BASE_URL_API } from '../constants';

const api = axios.create({
  baseURL: BASE_URL_API,
  responseType: 'json'
});

api.interceptors.request.use(async config => {
  const token = getToken();
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  // eslint-disable-next-line no-param-reassign
  config.headers['Cache-Control'] = 'no-cache';
  return config;
});

export default api;
