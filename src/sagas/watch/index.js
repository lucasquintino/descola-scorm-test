import { call, put, takeEvery, all } from "redux-saga/effects";
import { types, actions as watchActions } from "../../reducers/watch";
import {
  getOne,
  postActivities,
  jsonFormatActivity,
  getEnrollment,
} from "../../api/watch";
import snakeToCamel from "../../utils/snakeToCamel";
import {
  setStatus,
  userDataToQuery,
  saveUserData,
  trace,
  adjustLessonLocation,
} from "../../utils/userDataUtils";

function* getWatch(action) {
  try {
    const {
      payload: { id, sco },
    } = action;

    var userData;
    //verify that scorm api is connected and has enrollment_id
    if (
      sco.apiConnected &&
      sco.get("cmi.core.lesson_location") &&
      typeof JSON.parse(sco.get("cmi.core.lesson_location")) === "number"
    ) {
      trace("scorm (getWatch)");
      trace("scorm (getWatch) - getting variables from api");
      var student_id = sco.get("cmi.core.student_id");
      var lesson_location = sco.get("cmi.core.lesson_location");
      var lesson_status = sco.completionStatus;
      trace("scorm (getWatch) - lesson_location:", lesson_location);
      trace("scorm (getWatch) - student_id:", student_id);
      trace("scorm (getWatch) - lesson_status:", lesson_status);
      userData = {
        lesson_location,
        student_id,
        lesson_status,
      };
      //in case of not connected at api get info from localStorage
    } else userData = JSON.parse(localStorage.getItem("localUserData"));

    //create a query to make a request with enrollment_id and student_id
    const query = userDataToQuery(userData);
    const response = yield call(getOne, id, query);
    const data = response?.data?.data;
    const { id: enrollment_id, progress, course } = data;

    //save user data at localStorage and scorm
    saveUserData(sco, enrollment_id, student_id, lesson_status, progress);
    if (
      sco.get("cmi.core.lesson_location") &&
      !(typeof JSON.parse(sco.get("cmi.core.lesson_location")) === "number")
    ) {
      trace("scorm (getWatch) - previous lesson_location", sco.get("cmi.core.lesson_location"));
      const { activities } = adjustLessonLocation(sco, course.modules);
      trace("scorm (getWatch) - activities", activities);
      yield all(
        activities.map((item) => {
          return call(postWatch, {
            payload: { watchId: id, activity: item, sco: sco },
          });
        })
      );
      sco.set("cmi.core.lesson_location", `${enrollment_id}`);
      trace(
        "scorm (getWatch) - adjusted lesson_location",
        sco.get("cmi.core.lesson_location")
      );
    }

    //save status at localStorage and scorm
    if (progress > 0) {
      const local = JSON.parse(localStorage.getItem("localUserData"));
      if (!local.lesson_status) {
        setStatus(sco, "incomplete");
      }
      if (sco.apiConnected && sco.completionStatus === "unknown") {
        trace("scorm (getWatch) - setting sco status incomplete");
        setStatus(sco, "incomplete");
      }
    }
    //verify if course is finished and save status at localStorage and scorm
    if (progress === 100) {
      trace("scorm (getWatch) - setting sco status complete");
      setStatus(sco, "completed");
    }

    const watch = snakeToCamel(response?.data?.data);
    yield put(watchActions.setWatch(id, { ...watch }));
  } catch (error) {
    yield put(watchActions.error(error));
  }
}

function* postWatch(action) {
  try {
    const { watchId, activity, sco } = action.payload;
    trace("scorm (postWatch) - activity", activity);
    const response = yield call(postActivities, jsonFormatActivity(activity));
    trace("scorm (postWatch) - response", response);
    const enrollment = snakeToCamel(response?.data?.data);
    const { progress } = response?.data?.data;

    //verify if course is finished and save status at localStorage and scorm
    if (progress === 100) {
      trace("scorm (postWatch) - setting sco status complete");
      setStatus(sco, "completed");
    }

    //save status at localStorage and scorm
    const local = JSON.parse(localStorage.getItem("localUserData"));
    if (!local.lesson_status) {
      setStatus(sco, "incomplete");
    }
    if (sco.apiConnected && sco.completionStatus === "unknown") {
      trace("scorm (postWatch) - setting sco status incomplete");
      setStatus(sco, "incomplete");
    }

    yield put(watchActions.postSuccess(watchId, enrollment));
  } catch (error) {
    yield put(watchActions.error(error));
  }
}

function* selectCourseWatch(action) {
  try {
    const { watchId, enrollmentId } = action.payload;
    const response = yield call(getEnrollment, enrollmentId);
    const watch = snakeToCamel(response?.data?.data);
    yield put(watchActions.selectCourse(watchId, watch));
  } catch (error) {
    yield put(watchActions.error(error));
  }
}

export default function* watchWatch() {
  yield takeEvery(types.GET_REQUEST, getWatch);
  yield takeEvery(types.POST_REQUEST, postWatch);
  yield takeEvery(types.SELECT_COURSE_REQUEST, selectCourseWatch);
}
