import API from '../api';

export const getOne = id => API.get(`v1/videos/${id}`);