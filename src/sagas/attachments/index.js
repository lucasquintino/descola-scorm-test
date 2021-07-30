import { call, put, takeEvery } from 'redux-saga/effects';

import { types, actions as attachmentsActions } from '../../reducers/attachments';
import { getOne } from '../../api/attachments';
import snakeToCamel from '../../utils/snakeToCamel';
import { PAGE_HOME, UNAUTHORIZED } from '../../constants';

function* getAttachment(action) {
  try {
    const {
      payload: { id }
    } = action;
    const response = yield call(getOne, id);
    const attachment = snakeToCamel(response?.data?.data);
    yield put(attachmentsActions.setAttachment({ ...attachment }));
  } catch (error) {
    if (error?.response?.status === UNAUTHORIZED) {
      yield put(attachmentsActions.error({ message: snakeToCamel(error?.response?.data?.message) }));
    } else {
      const {
        payload: { history }
      } = action;
      history.push(PAGE_HOME);
    }
  }
}

export default function* watchAttachments() {
  yield takeEvery(types.GET_ONE_REQUEST, getAttachment);
}
