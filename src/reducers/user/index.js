/* eslint-disable import/no-anonymous-default-export */
const NAME = 'USER';

export const types = {
  REGISTER_REQUEST: `${NAME}/REGISTER_REQUEST`,
  LOGIN_REQUEST: `${NAME}/LOGIN_REQUEST`,
  LOGIN_SOCIAL_REQUEST: `${NAME}/LOGIN_SOCIAL_REQUEST`,
  LOGIN_PARTNERS: `${NAME}/LOGIN_PARTNERS`,
  FORGOT_PASSWORD_REQUEST: `${NAME}/FORGOT_PASSWORD_REQUEST`,
  TOKEN_VALIDITY_REQUEST: `${NAME}/TOKEN_VALIDITY_REQUEST`,
  RESET_PASSWORD_REQUEST: `${NAME}/RESET_PASSWORD_REQUEST`,
  CHANGE_PASSWORD_REQUEST: `${NAME}/CHANGE_PASSWORD_REQUEST`,
  CHANGE_EMAIL_REQUEST: `${NAME}/CHANGE_EMAIL_REQUEST`,
  CHANGE_PROFILE_IMAGE_REQUEST: `${NAME}/CHANGE_PROFILE_IMAGE_REQUEST`,
  CHANGE_PROFILE_IMAGE_SUCCESS: `${NAME}/CHANGE_PROFILE_IMAGE_SUCCESS`,
  CHANGE_PROFILE_DATA: `${NAME}/CHANGE_PROFILE_DATA`,
  SET: `${NAME}/SET`,
  LOGOUT_REQUEST: `${NAME}/LOGOUT_REQUEST`,
  LOGOUT: `${NAME}/LOGOUT`,
  CHANGE_SPEED_REQUEST: `${NAME}/CHANGE_SPEED_REQUEST`,
  CHANGE_RESOLUTION_REQUEST: `${NAME}/CHANGE_RESOLUTION_REQUEST`,
  SET_USER_DATE_OF_BIRTH: `${NAME}/SET_USER_DATE_OF_BIRTH`,
  SET_USER_GENDER: `${NAME}/SET_USER_GENDER`,
  ERROR: `${NAME}/ERROR`
};

export const actions = {
  registerRequest: user => ({ type: types.REGISTER_REQUEST, payload: user }),
  loginRequest: user => ({ type: types.LOGIN_REQUEST, payload: user }),
  loginSocialRequest: accessToken => ({ type: types.LOGIN_SOCIAL_REQUEST, payload: accessToken }),
  loginPartners: payload => ({ type: types.LOGIN_PARTNERS, payload }),
  forgotPasswordRequest: email => ({ type: types.FORGOT_PASSWORD_REQUEST, payload: email }),
  tokenValidityRequest: token => ({ type: types.TOKEN_VALIDITY_REQUEST, payload: token }),
  resetPasswordRequest: payload => ({ type: types.RESET_PASSWORD_REQUEST, payload }),
  changePasswordRequest: payload => ({ type: types.CHANGE_PASSWORD_REQUEST, payload }),
  changeEmailRequest: payload => ({ type: types.CHANGE_EMAIL_REQUEST, payload }),
  changeProfileImageRequest: payload => ({ type: types.CHANGE_PROFILE_IMAGE_REQUEST, payload }),
  changeProfileImageSuccess: () => ({ type: types.CHANGE_PROFILE_IMAGE_SUCCESS }),
  changeProfileDataRequest: payload => ({ type: types.CHANGE_PROFILE_DATA, payload }),
  set: user => ({ type: types.SET, payload: user }),
  logoutRequest: history => ({ type: types.LOGOUT_REQUEST, payload: { history } }),
  logout: () => ({ type: types.LOGOUT }),
  changeSpeedRequest: payload => ({ type: types.CHANGE_SPEED_REQUEST, payload }),
  changeResolutionRequest: payload => ({ type: types.CHANGE_RESOLUTION_REQUEST, payload }),
  setUserDateOfBirth: payload => ({ type: types.SET_USER_DATE_OF_BIRTH, payload }),
  setUserGender: payload => ({ type: types.SET_USER_GENDER, payload }),
  error: payload => ({ type: types.ERROR, payload })
};

const initialState = {
  user: '',
  forgotPassword: '',
  forgotPasswordSuccess: '',
  tokenValidity: {},
  messagePasswordSuccess: '',
  messageEmailSuccess: '',
  messageDataSuccess: '',
  messageAddressSuccess: '',
  isFetching: false,
  fetchingImageProfile: false
};

export default (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case types.CHANGE_PROFILE_DATA:
    case types.REGISTER_REQUEST:
    case types.CHANGE_PASSWORD_REQUEST:
    case types.CHANGE_EMAIL_REQUEST:
      return {
        ...state,
        messagePasswordSuccess: '',
        messageEmailSuccess: '',
        messageDataSuccess: '',
        messageAddressSuccess: '',
        isFetching: true
      };
    case types.CHANGE_PROFILE_IMAGE_REQUEST:
      return {
        ...state,
        fetchingImageProfile: true
      };
    case types.CHANGE_PROFILE_IMAGE_SUCCESS:
      return {
        ...state,
        fetchingImageProfile: false
      };
    case types.LOGIN_REQUEST:
      return {
        ...state,
        error: '',
        forgotPasswordSuccess: '',
        messagePasswordSuccess: '',
        messageEmailSuccess: '',
        messageDataSuccess: '',
        messageAddressSuccess: '',
        isFetching: true
      };
    case types.LOGIN_SOCIAL_REQUEST:
      return {
        ...state,
        forgotPasswordSuccess: '',
        messagePasswordSuccess: '',
        messageEmailSuccess: '',
        messageDataSuccess: '',
        messageAddressSuccess: '',
        isFetching: true
      };
    case types.FORGOT_PASSWORD_REQUEST:
      return {
        ...state,
        forgotPasswordSuccess: '',
        forgotPassword: '',
        messagePasswordSuccess: '',
        messageEmailSuccess: '',
        messageDataSuccess: '',
        messageAddressSuccess: '',
        isFetching: true
      };
    case types.TOKEN_VALIDITY_REQUEST:
      return {
        ...state,
        tokenValidity: {},
        forgotPasswordSuccess: '',
        messagePasswordSuccess: '',
        messageEmailSuccess: '',
        messageDataSuccess: '',
        messageAddressSuccess: '',
        isFetching: true
      };
    case types.RESET_PASSWORD_REQUEST:
      return {
        ...state,
        forgotPasswordSuccess: '',
        messagePasswordSuccess: '',
        messageEmailSuccess: '',
        messageDataSuccess: '',
        messageAddressSuccess: '',
        isFetching: true
      };
    case types.SET:
      return {
        ...state,
        ...payload,
        isFetching: false
      };
    case types.LOGOUT_REQUEST:
      return {
        ...state,
        forgotPasswordSuccess: '',
        messagePasswordSuccess: '',
        messageEmailSuccess: '',
        messageDataSuccess: '',
        messageAddressSuccess: '',
        isFetching: true
      };
    case types.LOGOUT:
      return {
        ...initialState,
        isFetching: false
      };
    case types.ERROR: {
      return {
        ...state,
        forgotPasswordSuccess: '',
        messagePasswordSuccess: '',
        messageEmailSuccess: '',
        messageDataSuccess: '',
        messageAddressSuccess: '',
        ...payload,
        isFetching: false
      };
    }
    default:
      return state;
  }
};
