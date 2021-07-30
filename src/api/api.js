import axios from 'axios';
import { matchPath } from 'react-router-dom';

import { BASE_URL_API } from '../constants';

// axios.defaults.withCredentials = true;

const noChacheControlEndpoints = [
  { method: 'get', endpoint: 'v1/carts/:id' },
  { method: 'get', endpoint: 'v1/carts/:id/coupon/:id/validate' },
  { method: 'get', endpoint: 'v1/courses/:id/watch' },
  { method: 'get', endpoint: 'v1/students/:id' },
  { method: 'get', endpoint: 'v1/enrollments/:id' },
  { method: 'get', endpoint: 'v1/orders/:id' },
  { method: 'get', endpoint: 'v1/attachments/:id' },
  { method: 'get', endpoint: 'v1/users/me' }
];

const matchesRoute = ({ url, method }, endpoints) => {
  const matchesMethod = endpoints.some(route => route.method === method);
  const matchesURL = endpoints.some(
    route =>
      matchPath(url, {
        path: route.endpoint,
        exact: true,
        strict: false
      })
    // eslint-disable-next-line function-paren-newline
  );

  return !!(matchesMethod && matchesURL);
};

const api = axios.create({
  baseURL: BASE_URL_API,
  responseType: 'json'
});

api.interceptors.request.use(async config => {
  // CACHE CONTROL
  const noCache = matchesRoute({ url: config.url, method: config.method }, noChacheControlEndpoints);
  if (noCache) {
    // eslint-disable-next-line no-param-reassign
    config.headers['Cache-Control'] = 'no-cache';
  }
  return config;
});

// api.interceptors.response.use(response => response,
//   error => Promise.reject({ ...error }));

export default api;
