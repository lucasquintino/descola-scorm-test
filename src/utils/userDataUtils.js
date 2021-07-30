/* eslint-disable array-callback-return */
import { TYPE_POST_ACTIVITY_LECTURE } from "../constants";

//save user data at localStorage
export const saveLocalStorage = (enrollment, student_id, lesson_status) => {
  const localUserData = {
    lesson_status: lesson_status ? lesson_status : "",
    lesson_location: enrollment,
    student_id: student_id,
  };
  const item = JSON.stringify(localUserData);
  localStorage.setItem("localUserData", item);
};

//create a query to make a request with enrollment_id and student_id
export const userDataToQuery = (userData) => {
  var query = "";
  if (userData) {
    const { lesson_location, student_id } = userData;
    trace("scorm (userDataToQuery) - getting variables to send at request");
    trace("scorm (userDataToQuery) - lesson_location:", lesson_location);
    trace("scorm (userDataToQuery) - student_id:", student_id);
    query = lesson_location
      ? student_id
        ? `?enrollment_id=${lesson_location}&student_id=${student_id}`
        : `?enrollment_id=${lesson_location}`
      : "";
  }
  trace("scorm (userDataToQuery) - query:", query);
  return query;
};

//save user data at localStorage and scorm
export const saveUserData = (sco, enrollment_id, student_id, lesson_status) => {
  if (!localStorage.getItem("localUserData") || student_id) {
    saveLocalStorage(enrollment_id, student_id, lesson_status);
  }
  if (sco.apiConnected && !sco.get("cmi.core.lesson_location")) {
    trace("scorm (saveUserData) - saving lesson_location scorm");
    if (localStorage.getItem("localUserData")) {
      trace(
        "scorm (saveUserData) - saving lesson_location scorm using data from localStorage"
      );
      const userData = JSON.parse(localStorage.getItem("localUserData"));
      const { lesson_location } = userData;
      trace("scorm (saveUserData) - enrollment_id:", lesson_location);
      sco.set("cmi.core.lesson_location", `${enrollment_id}`);
      trace(
        "scorm (saveUserData) - lesson_location:",
        sco.get("cmi.core.lesson_location")
      );
    } else {
      trace(
        "scorm (saveUserData) - saving lesson_location scorm using data from response watch"
      );
      sco.set("cmi.core.lesson_location", `${enrollment_id}`);
      trace("scorm (saveUserData) - enrollment_id:", enrollment_id);
      trace(
        "scorm (saveUserData) - lesson_location:",
        sco.get("cmi.core.lesson_location")
      );
    }
  }
};

//save status at localStorage and scorm
export const setStatus = (sco, status) => {
  const local = JSON.parse(localStorage.getItem("localUserData"));
  local.lesson_status = status;
  saveLocalStorage(
    local.lesson_location,
    local.student_id,
    local.lesson_status
  );
  if (sco.apiConnected) {
    trace("scorm (setStatus) - setting sco status:", status);
    sco.setStatus(status);
    trace("scorm (setStatus) - sco status:", sco.completionStatus);
  }
};

export const trace = (msg, data) => {
  if (process.env.REACT_APP_DEBUG) {
    if (data) {
      console.log(msg, data);
      return;
    }
    console.log(msg);
  }
};

export const adjustLessonLocation = (sco, modules) => {
  const lessonLocation = JSON.parse(sco.get("cmi.core.lesson_location"));
  const entries = Object.entries(lessonLocation);
  var allLectures = [];
  var activities = [];
  trace("scorm (adjustLessonLocation) - entries", entries);
  modules.map((module) => (allLectures = allLectures.concat(module.lectures)));
  trace("scorm (adjustLessonLocation) - all lectures", allLectures);

  entries.map((item) => {
    if (item[1] === 1) {
      const userData = JSON.parse(localStorage.getItem("localUserData"));
      const { lesson_location } = userData;
      const contentId = allLectures[item[0]].id;
      const activity = {
        enrollmentId: lesson_location,
        contentId: contentId,
        type: TYPE_POST_ACTIVITY_LECTURE,
        time: 1,
      };
      trace("scorm (adjustLessonLocation) - activity", activity);
      activities.push(activity);
      return { activities };
    }
  });
  return { activities };
};
