/* eslint-disable import/no-anonymous-default-export */
const NAME = 'ATTACHMENTS';

export const types = {
  GET_ONE_REQUEST: `${NAME}/GET_ONE_REQUEST`,
  SET_ATTACHMENT: `${NAME}/SET_ATTACHMENT`,
  CLEAN_ATTACHMENT: `${NAME}/CLEAN_ATTACHMENT`,
  ERROR: `${NAME}/ERROR`
};

export const actions = {
  getOneRequest: payload => ({ type: types.GET_ONE_REQUEST, payload }),
  setAttachment: payload => ({ type: types.SET_ATTACHMENT, payload }),
  cleanAttachment: () => ({ type: types.CLEAN_ATTACHMENT }),
  error: payload => ({ type: types.ERROR, payload })
};

export const initialState = {
  attachment: null,
  message: null,
  isFetching: false
};

export default (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case types.GET_ONE_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case types.SET_ATTACHMENT:
      return {
        ...state,
        attachment: payload,
        isFetching: false
      };
    case types.CLEAN_ATTACHMENT:
      return {
        ...state,
        attachment: null,
        isFetching: false
      };
    case types.ERROR:
      return {
        ...state,
        ...payload,
        isFetching: false
      };
    default:
      return state;
  }
};
