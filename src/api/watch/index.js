import API from "../api";

export const getOne = (id, query) =>
  query
    ? API.get(`v1/courses/${id}/watch${query}`)
    : API.get(`v1/courses/${id}/watch`);

export const getEnrollment = (id) => API.get(`v1/enrollments/${id}`);

export const postActivities = (activity) => API.post("v1/activities", activity);

export const jsonFormatActivity = (activity) => ({
  enrollment_id: activity.enrollmentId,
  content_id: activity.contentId,
  type: activity.type,
  time: activity.time,
});
