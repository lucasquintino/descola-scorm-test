import { combineReducers } from "redux";
import attachments from "./attachments";
import user from "./user";
import watch from "./watch";

const reducers = combineReducers({
  attachments,
  user,
  watch,
});

export default reducers;
