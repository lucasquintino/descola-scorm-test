import API from '../api';

export const get = () => API.get('v1/attachments');

export const getOne = id => API.get(`v1/attachments/${id}`);
