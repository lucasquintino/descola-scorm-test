/* eslint-disable import/no-anonymous-default-export */
import { all, fork } from "redux-saga/effects";
import watchAttachments from "./attachments";
import watchUser from "./user";
import watchWatch from "./watch";

export default function* () {
  yield all([fork(watchAttachments), fork(watchUser), fork(watchWatch)]);
}
