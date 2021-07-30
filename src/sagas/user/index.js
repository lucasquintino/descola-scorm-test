import { call, put, takeEvery} from 'redux-saga/effects';
import { types, actions as userActions } from '../../reducers/user';

import {
  postLogin,
  getUserInfo,
  postForgotPassword,
  postForgotPasswordReset,
  getForgotPasswordValidity,
  patchChangePassword,
  jsonFormatChangePassword,
  patchChangeProfileImage,
  putChangeUserInfo,
  jsonFormatPersonalInfo,
  patchPreferences,
  jsonFormatPreferences,
  setGender,
  setDateOfBirth
} from '../../api/users';
import { saveState, loadState } from '../../utils/statePersistence';
import snakeToCamel from '../../utils/snakeToCamel';


function* login(action) {
  try {
    const formLogin = action.payload;
    const responseLogin = yield call(postLogin, formLogin);
    const { accessToken } = snakeToCamel(responseLogin?.data);
    saveState(accessToken, 'accessScormToken');
    const response = yield call(getUserInfo);
    window.dataLayer.push({
      'event': 'userLogged',
      'user': response?.data?.data
    });
    const user = snakeToCamel(response?.data.data);
    yield put(userActions.set(user));
    saveState(user, 'user');
   
   
  } catch (error) {
    yield put(userActions.error({ error: 'E-mail ou senha inválidos' }));
  }
}



function* forgotPassword(action) {
  try {
    const { email } = action.payload;
    yield call(postForgotPassword, { email });
    yield put(userActions.set({ forgotPasswordSuccess: 'Perfeito, enviamos para o seu email um link para recriar a senha.' }));
  } catch (error) {
    yield put(userActions.error({ forgotPassword: 'Não foi encontrado um usuário com esse e-mail.' }));
  }
}

function* checkValidityToken(action) {
  try {
    const { token } = action.payload;
    const response = yield call(getForgotPasswordValidity, token);
    const tokenValidity = snakeToCamel(response.data);
    yield put(userActions.set({ tokenValidity }));
  } catch (error) {
    yield put(userActions.error({ tokenValidity: { error: 'Token não é mais válido. Peça novamente o e-mail.' } }));
  }
}

function* resetPassword(action) {
  try {
    const { payload } = action;
    yield call(postForgotPasswordReset, payload);
    yield put(userActions.set({ tokenValidity: { success: 'Senha alterada com sucesso.' } }));
  } catch (error) {
    yield put(userActions.error(error));
  }
}

function* changePassword(action) {
  try {
    const { payload } = action;
    const response = yield call(patchChangePassword, jsonFormatChangePassword(payload));
    const { accessToken } = snakeToCamel(response.data?.data);
    saveState(accessToken, 'accessScormToken');
    yield put(userActions.set({ messagePasswordSuccess: 'Senha alterada com sucesso!' }));
  } catch (error) {
    yield put(userActions.error(error));
  }
}

function* changeEmail(action) {
  try {
    const { payload } = action;
    const response = yield call(putChangeUserInfo, payload);
    const user = snakeToCamel(response?.data.data);
    yield put(userActions.set({ ...user, messageEmailSuccess: 'E-mail alterado com sucesso.' }));
  } catch (error) {
    yield put(userActions.error(error));
  }
}

function* changeProfileImage(action) {
  try {
    const { payload } = action;
    yield call(patchChangeProfileImage, payload);
    yield put(userActions.changeProfileImageSuccess());
  } catch (error) {
    yield put(userActions.error(error));
  }
}


function* changeProfileData(action) {
  try {
    const { payload } = action;
    const { cpf: documentNumber, phone } = payload;
    const phoneNumber = phone.replace(/[^0-9]+/g, '');
    const ddd = phoneNumber.substr(0, 2);
    const number = phoneNumber.substr(2);
    const response = yield call(putChangeUserInfo, jsonFormatPersonalInfo({ documentNumber, ddd, phoneNumber: number }));
    const user = snakeToCamel(response?.data.data);
    yield put(userActions.set({ ...user, messageDataSuccess: 'Dados alterados com sucesso.' }));
    saveState(user, 'user');
  } catch (error) {
    yield put(userActions.error(error));
  }
}

function* changeSpeed(action) {
  try {
    const { payload } = action;
    const response = yield call(patchPreferences, jsonFormatPreferences({ videoSpeed: payload }));
    const preferences = snakeToCamel(response?.data);
    yield put(userActions.set({ preferences }));
    const user = loadState('user');
    user.preferences = preferences;
    saveState(user, 'user');
  } catch (error) {
    yield put(userActions.error(error));
    console.log('error', error);
  }
}

function* changeResolution(action) {
  try {
    const { payload } = action;
    const response = yield call(patchPreferences, jsonFormatPreferences({ resolutionVideo: payload }));
    const preferences = snakeToCamel(response?.data);
    yield put(userActions.set({ preferences }));
    const user = loadState('user');
    user.preferences = preferences;
    saveState(user, 'user');
  } catch (error) {
    yield put(userActions.error(error));
    console.log('error', error);
  }
}

function* setUserGender(action) {
  try {
    const { payload } = action;
    const response = yield call(setGender, payload);
    const user = snakeToCamel(response?.data.data);
    yield put(userActions.set(user));
    saveState(user, 'user');
  } catch (error) {
    yield put(userActions.error(error));
    console.log('error', error);
  }
}

function* setUserDateOfBirth(action) {
  try {
    const { payload } = action;
    const response = yield call(setDateOfBirth, payload);
    const user = snakeToCamel(response?.data.data);
    yield put(userActions.set(user));
    saveState(user, 'user');
  } catch (error) {
    yield put(userActions.error(error));
    console.log('error', error);
  }
}

export default function* watchUser() {

  yield takeEvery(types.LOGIN_REQUEST, login);

  yield takeEvery(types.FORGOT_PASSWORD_REQUEST, forgotPassword);
  yield takeEvery(types.TOKEN_VALIDITY_REQUEST, checkValidityToken);
  yield takeEvery(types.RESET_PASSWORD_REQUEST, resetPassword);
  yield takeEvery(types.CHANGE_PASSWORD_REQUEST, changePassword);
  yield takeEvery(types.CHANGE_EMAIL_REQUEST, changeEmail);
  yield takeEvery(types.CHANGE_PROFILE_IMAGE_REQUEST, changeProfileImage);
  yield takeEvery(types.CHANGE_PROFILE_DATA, changeProfileData);

  yield takeEvery(types.CHANGE_SPEED_REQUEST, changeSpeed);
  yield takeEvery(types.CHANGE_RESOLUTION_REQUEST, changeResolution);
  yield takeEvery(types.SET_USER_GENDER, setUserGender);
  yield takeEvery(types.SET_USER_DATE_OF_BIRTH, setUserDateOfBirth);
}
