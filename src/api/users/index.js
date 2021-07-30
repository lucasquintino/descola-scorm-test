import API from '../api';

export const get = () => API.get('v1/categories');

export const postRegister = payload => API.post('v1/users', payload);

export const postLogin = payload => API.post('/oauth/token', payload);

export const postForgotPassword = payload => API.post('/v1/users/resetpassword/create', payload);

export const postForgotPasswordReset = payload => API.post('/v1/users/resetpassword/reset', payload);

export const patchChangePassword = payload => API.patch('/v1/users/password', payload);

export const patchChangeProfileImage = payload => API.patch('/v1/users/avatar', payload);

export const putChangeUserInfo = payload => API.put('/v1/users', payload);

export const getForgotPasswordValidity = token => API.get(`/v1/users/resetpassword/find/${token}`);

export const getUserInfo = () => API.get('v1/users/me');

export const setDateOfBirth = payload => API.patch('/v1/users/date-of-birth', payload);

export const setGender = payload => API.patch('/v1/users/gender', payload);

export const patchPreferences = payload => API.patch('/v1/users/preferences', payload);

export const jsonFormatRegister = formRegister => ({
  'first_name': formRegister.firstName,
  'last_name': formRegister.lastName,
  'email': formRegister.email,
  'password': formRegister.password,
  'password_confirmation': formRegister.passwordConfirmation
});

export const jsonFormatLogin = formLogin => ({
  'grant_type': 'password',
  'client_id': 1,
  'client_secret': process.env.REACT_APP_SECRET,
  'username': formLogin.email,
  'password': formLogin.password
});

export const jsonFormatPasswordReset = formPasswordReset => ({
  'token': formPasswordReset.token,
  'email': formPasswordReset.email,
  'password': formPasswordReset.password,
  'password_confirmation': formPasswordReset.passwordConfirmation
});

export const jsonFormatChangePassword = formChangePassword => ({
  'password': formChangePassword.password,
  'password_confirmation': formChangePassword.passwordConfirmation
});

export const jsonFormatPersonalInfo = formPersonalInfo => ({
  'document_number': formPersonalInfo.documentNumber,
  ddd: formPersonalInfo.ddd,
  'phone_number': formPersonalInfo.phoneNumber
});

export const jsonFormatPreferences = preferences => ({
  'video_speed': preferences.videoSpeed,
  'resolution_video': preferences.resolutionVideo
});
