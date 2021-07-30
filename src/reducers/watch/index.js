/* eslint-disable import/no-anonymous-default-export */
const NAME = 'WATCH';

export const types = {
  GET_REQUEST: `${NAME}/GET_REQUEST`,
  POST_REQUEST: `${NAME}/POST_REQUEST`,
  POST_SUCCESS: `${NAME}/POST_SUCCESS`,
  SET_WATCH: `${NAME}/SET_WATCH`,
  ERROR: `${NAME}/ERROR`,
  SELECT_COURSE_REQUEST: `${NAME}/SELECT_COURSE_REQUEST`,
  SELECT_COURSE: `${NAME}/SELECT_COURSE`
};

export const actions = {
  getRequest: id => ({ type: types.GET_REQUEST, payload: id }),
  postRequest: (watchId, activity, sco) => ({ type: types.POST_REQUEST, payload: { watchId, activity, sco } }),
  postSuccess: (id, enrollment) => ({ type: types.POST_SUCCESS, payload: { id, enrollment } }),
  setWatch: (id, payload) => ({ type: types.SET_WATCH, payload: { ...payload, watchId: payload.id, id } }),
  error: error => ({ type: types.ERROR, error }),
  selectCourseRequest: (watchId, enrollmentId) => ({ type: types.SELECT_COURSE_REQUEST, payload: { watchId, enrollmentId } }),
  selectCourse: (id, enrollment) => ({
    type: types.SELECT_COURSE,
    payload: {
      id,
      enrollment
    }
  })
};

export const initialState = {
  byId: {},
  allIds: [],
  isFetching: false
};

export default (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case types.SELECT_COURSE_REQUEST:
    case types.GET_REQUEST:
    case types.POST_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case types.SET_WATCH: {
      const { id } = payload;
      const currentWatch = state.byId[id] || {};

      const { keepWatching, watchId, ...watchRest } = payload;
      if (watchRest?.type === 1) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [id]: {
              ...currentWatch,
              ...watchRest,
              course: {
                ...watchRest.course,
                keepWatching,
                watchId,
                progress: watchRest?.progress
              }
            }
          },
          isFetching: false
        };
      }
      if (watchRest?.type === 2) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [id]: {
              ...currentWatch,
              ...watchRest,
              track: {
                ...watchRest.track,
                keepWatching,
                watchId
              }
            }
          },
          isFetching: false
        };
      }
    }
      break;
    case types.POST_SUCCESS: {
      const { id, enrollment } = payload;
      const trackEnrollments = state.byId[id]?.track?.enrollments?.map((enroll) => (enroll.enrollmentId === enrollment.enrollmentId ? {
        ...enroll,
        enrollmentProgress: enrollment?.progress
      } : enroll));
      const courseModules = state.byId[id]?.course?.modules.map((module) => ({ ...module, lectures: module.lectures.map(lecture => (lecture.id === enrollment.contentId ? { ...lecture, watched: true } : lecture)) }));

      return {
        ...state,
        byId: {
          ...state.byId,
          [id]: {
            ...state.byId[id],
            course: {
              ...state.byId[id].course,
              modules: courseModules,
              progress: enrollment?.progress
            },
            track: { ...state.byId[id].track, enrollments: trackEnrollments }
          }
        },
        isFetching: false
      };
    }

    case types.ERROR: {
      return {
        ...state,
        ...payload,
        isFetching: false
      };
    }
    case types.SELECT_COURSE: {
      const { id, enrollment } = payload;
      return {
        ...state,
        byId: {
          ...state.byId,
          [id]: {
            ...state.byId[id],
            course: {
              progress: enrollment?.progress,
              watchId: enrollment?.id,
              ...enrollment?.course,
              keepWatching: enrollment?.keepWatching
            }
          }
        }
      };
    }
    default:
      return state;
  }
};
