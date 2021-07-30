/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import Iframe from "react-iframe";
import Vimeo from "@vimeo/player";
import { actions as attachmentsActions } from "../../reducers/attachments";
import { actions as watchActions } from "../../reducers/watch";
import { actions as userActions } from "../../reducers/user";
import api from "../../api/api";
import snakeToCamel from "../../utils/snakeToCamel";
import { trace } from "../../utils/userDataUtils";
import { postLogin } from "../../api/users";

import {
  TYPE_EBOOK,
  TYPE_TRACK_ON_WATCH,
  TYPE_COURSE_ON_WATCH,
  TYPE_POST_ACTIVITY_LECTURE,
  TYPE_POST_ACTIVITY_ATTACHMENT,
  TYPE_LECTURE_VIDEO,
  TYPE_LECTURE_SELF_HOSTED_VIDEO,
  TYPE_LECTURE_TEXT,
  TYPE_LECTURE_IFRAME,
  BASE_URL_CDN,
} from "../../constants";
import VideoPlayer from "../../components/VideoPlayer";
import HTMLContainer from "../../components/HTMLContainer";
import { withScorm } from "react-scorm-provider";

const ebook = `${BASE_URL_CDN}app/assets/images/ebook.svg`;

const Watch = (props) => {
  const client_id = process.env.REACT_APP_CLIENT_ID;
  const client_secret = process.env.REACT_APP_CLIENT_SECRET;
  const id = process.env.REACT_APP_COURSE_ID;
  const dispatch = useDispatch();
  const watch = useSelector((state) => state.watch.byId[id]);
  const currentUser = useSelector((state) => state.user);
  const attachment = useSelector((state) => state.attachments?.attachment);
  const [selectedLecture, setSelectedLecture] = useState();
  const [selectedTab, setSelectedTab] = useState(1);
  const [modulesState, setModulesState] = useState([]);
  const [player, setPlayer] = useState();
  const [isModuleOpen, setIsModuleOpen] = useState({});
  const [token, setToken] = useState();
  const watchCourseId = id;

  useEffect(() => {
    const onLoadPage = () => {
      window.scrollTo(0, 0);
      dispatch(
        watchActions.getRequest({
          id,
          sco: props.sco,
        })
      );
    };
    if (token) {
      onLoadPage();
    }
    trace("token", token);
    trace("scorm (init) - apiConnected:", props.sco.apiConnected.toString());
    trace("scorm (init) - student_id:", props.sco.get("cmi.core.student_id"));
    trace("scorm (init) - student_name:", props.sco.learnerName);
    trace(
      "scorm (init) - lesson_location:",
      props.sco.get("cmi.core.lesson_location:")
    );
    trace("scorm (init) - lesson_status:", props.sco.completionStatus);
  }, [
    token,
    props.sco.apiConnected,
    props.sco.get("cmi.core.lesson_location"),
  ]);

  useEffect(() => {
    trace("getting token");
    localStorage.removeItem("accessScormToken");
    const getAcessToken = async () => {
      const res = await postLogin({
        grant_type: "client_credentials",
        client_id: client_id,
        client_secret: client_secret,
      });

      const { accessToken } = snakeToCamel(res?.data);
      //saveState(accessToken, "accessScormToken");
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setToken(accessToken);
    };
    getAcessToken();
  }, []);

  const handleModuleOpenState = async (lectureId, openState) => {
    const module = _.find(modulesState, { lectures: [{ id: lectureId }] });
    if (module) {
      await setIsModuleOpen((old) => ({ ...old, [module.id]: openState }));
    }
  };

  const toggleModuleOpenState = async (moduleId) => {
    if (module) {
      await setIsModuleOpen((old) => ({
        ...old,
        [moduleId]: !old?.[moduleId],
      }));
    }
  };

  const {
    type,
    track = {},
    course: {
      progress,
      title,
      description,
      attachments = [],
      watchId,
      keepWatching: keepWatchingCourse = {},
    } = {},
  } = watch || {};

  const itemsRef = React.useRef(new Map());

  const pushWatchDataLayer = useCallback(
    (dataId) => {
      window?.dataLayer?.push({
        event: "watch",
        courseWatched: { slug: id, id: dataId, title, description },
      });
    },
    [id, title, description]
  );

  useEffect(() => {
    if (watchId) {
      pushWatchDataLayer(watchId);
    }
    // eslint-disable-next-line
  }, [watchId]);

  useEffect(() => {
    const onLoadAttachment = () => {
      if (attachment?.url) {
        window.open(attachment.url, "_blank");
        dispatch(attachmentsActions.cleanAttachment());
      }
    };
    onLoadAttachment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment]);

  const handleSetWatched = async (id, watched) => {
    if (!watched) {
      await setModulesState((currentState) =>
        currentState.map((item) => ({
          ...item,
          lectures: item.lectures.map((lecture) =>
            lecture.id === id ? { ...lecture, watched: true } : lecture
          ),
        }))
      );
      const activity = {
        enrollmentId: watchId,
        contentId: id,
        type: TYPE_POST_ACTIVITY_LECTURE,
        time: 1,
      };
      dispatch(watchActions.postRequest(watchCourseId, activity, props.sco));
    }
  };
  const handleSetAttachmentWatched = (id) => {
    const activity = {
      enrollmentId: watchId,
      contentId: id,
      type: TYPE_POST_ACTIVITY_ATTACHMENT,
      time: 1,
    };
    dispatch(watchActions.postRequest(watchCourseId, activity));
  };

  const handleDownloadFile = (id) => {
    dispatch(attachmentsActions.getOneRequest({ id }));
    handleSetAttachmentWatched(id);
  };

  const scrollToWithContainer = (itemId) => {
    const item = itemsRef.current.get(itemId);
    if (item) {
      item.focus();
    }
  };

  const handleScrollToSelectedLecture = async (lectureId) => {
    await handleModuleOpenState(lectureId, true);
    scrollToWithContainer(lectureId);
  };

  const handleSelectLecture = async (e, { id, content, watched, type }) => {
    if (e?.stopPropagation) {
      e.stopPropagation();
    }

    await setSelectedLecture({ id, content, watched, type });
  };
  const handleOnChangeCourse = (mdState) => {
    if (mdState?.length) {
      const module = _.find(mdState, {
        lectures: [{ id: keepWatchingCourse?.contentId }],
      });
      const currentModule = _.find(mdState, {
        lectures: [{ id: selectedLecture?.id }],
      });
      const lecture = _.find(module?.lectures, {
        id: keepWatchingCourse?.contentId,
      });
      if (currentModule && currentModule?.id === module?.id) {
        return;
      }

      if (lecture) {
        handleSelectLecture(null, {
          id: lecture.id,
          content: lecture.content,
          watched: lecture.watched,
          type: lecture.type,
        });
      } else {
        const firstLecture = mdState?.[0]?.lectures?.[0];

        handleSelectLecture(null, {
          id: firstLecture.id,
          content: firstLecture.content,
          watched: firstLecture.watched,
          type: firstLecture.type,
        });
      }
    }
  };

  useEffect(() => {
    const onLoadPage = () => {
      setModulesState(watch?.course?.modules || []);
      if (!selectedLecture) {
        handleOnChangeCourse(watch?.course?.modules || []);
      }
    };
    onLoadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const handleSelectCourse = (id, enrollmentId) => {
    dispatch(watchActions.selectCourseRequest(watchCourseId, enrollmentId));
    setSelectedTab(TYPE_COURSE_ON_WATCH);
  };

  useEffect(() => {
    if (type === TYPE_TRACK_ON_WATCH) {
      if (track?.keepWatching && !selectedLecture?.id) {
        handleSelectCourse(
          track?.keepWatching?.contentId,
          track?.keepWatching?.enrollmentId
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.keepWatching, type, selectedLecture]);

  const handleChangeSpeed = (videoSpeed) =>
    dispatch(userActions.changeSpeedRequest(videoSpeed));
  const handleChangeResolution = (resolution) =>
    dispatch(userActions.changeResolutionRequest(resolution));

  const handleVideoEnd = async (data) => {
    await handleSetWatched(selectedLecture?.id, selectedLecture?.watched);
    const module = _.find(modulesState, {
      lectures: [{ id: selectedLecture.id }],
    });
    const moduleIndex = _.findIndex(modulesState, {
      lectures: [{ id: selectedLecture.id }],
    });
    const index = _.findIndex(module?.lectures, { id: selectedLecture.id });
    if (index + 1 < module?.lectures?.length) {
      const nextLecture = module?.lectures?.[index + 1];
      if (nextLecture?.id) {
        const { id, content, watched, type } = nextLecture;
        handleSelectLecture(data, { id, content, watched, type });
      }
    } else if (modulesState?.length > moduleIndex + 1) {
      const nextLecture = modulesState[moduleIndex + 1].lectures[0];
      if (nextLecture?.id) {
        const { id, content, watched, type } = nextLecture;
        handleSelectLecture(data, { id, content, watched, type });
      }
    } else if (index + 1 >= module?.lectures?.length) {
      const nextLecture = module?.lectures?.[0];
      if (nextLecture?.id) {
        const { id, content, watched, type } = nextLecture;
        handleSelectLecture(data, { id, content, watched, type });
      }
    }
  };

  useEffect(() => {
    if (selectedLecture) {
      handleScrollToSelectedLecture(selectedLecture?.id);
    }
    // eslint-disable-next-line
  }, [selectedLecture]);

  useEffect(() => {
    const onChangeLecture = () => {
      if (selectedLecture?.type === TYPE_LECTURE_VIDEO) {
        if (!player) {
          const options = {
            id: selectedLecture?.content,
            autoplay: true,
            quality:
              (currentUser.preferences &&
                currentUser.preferences[0] &&
                currentUser.preferences[0].resolutionVideo) ||
              "auto",
            speed: 1,
          };

          setPlayer(new Vimeo("vimeo-video", options));
          return;
        }
        player.loadVideo(selectedLecture?.content);
        if (
          currentUser.preferences &&
          currentUser.preferences[0] &&
          currentUser.preferences[0].videoSpeed
        ) {
          player.setPlaybackRate(currentUser.preferences[0].videoSpeed);
        }

        player.off("ended");

        player.on("ended", (data) => {
          handleVideoEnd(data);
        });
      } else {
        setPlayer("");
      }
    };
    // make sure the div is loaded
    setTimeout(onChangeLecture(), 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLecture]);

  useEffect(() => {
    const onLoadPlayer = () => {
      if (player) {
        if (
          currentUser.preferences &&
          currentUser.preferences[0] &&
          currentUser.preferences[0].videoSpeed
        ) {
          player.setPlaybackRate(currentUser.preferences[0].videoSpeed);
        }

        player.off("ended");

        player.on("ended", (data) => {
          handleVideoEnd(data);
        });
        player.on("playbackratechange", (data) => {
          if (
            currentUser.preferences &&
            currentUser.preferences[0] &&
            currentUser.preferences[0].videoSpeed !== data.playbackRate
          ) {
            handleChangeSpeed(data.playbackRate);
          }
        });
      }
    };
    onLoadPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  return (
    <>
      <section className="banner">
        <div className="player">
          <div className="player__media">
            {selectedLecture?.content &&
              selectedLecture?.type === TYPE_LECTURE_SELF_HOSTED_VIDEO && (
                <VideoPlayer
                  content={selectedLecture?.content}
                  currentUser={currentUser}
                  handleChangeSpeed={handleChangeSpeed}
                  handleChangeResolution={handleChangeResolution}
                  handleVideoEnd={handleVideoEnd}
                />
              )}

            {selectedLecture?.content &&
              selectedLecture?.type === TYPE_LECTURE_VIDEO && (
                <div id="vimeo-video" data-vimeo-autoplay="true" />
              )}

            {selectedLecture?.content &&
              selectedLecture?.type === TYPE_LECTURE_TEXT && (
                <HTMLContainer
                  html={selectedLecture?.content}
                  onHandleOpen={() =>
                    handleSetWatched(
                      selectedLecture?.id,
                      selectedLecture?.watched
                    )
                  }
                />
              )}

            {selectedLecture?.content &&
              selectedLecture?.type === TYPE_LECTURE_IFRAME && (
                <Iframe
                  url={selectedLecture?.content}
                  onLoad={() =>
                    handleSetWatched(
                      selectedLecture?.id,
                      selectedLecture?.watched
                    )
                  }
                />
              )}
          </div>
          <div className="player__menu" id="playerMenu">
            <div className="player__menu__tabs">
              <button
                className={classNames("btn", {
                  "btn-dark": selectedTab === TYPE_TRACK_ON_WATCH,
                })}
                onClick={() => setSelectedTab(1)}
              >
                Conteúdo
              </button>
              {type === TYPE_TRACK_ON_WATCH && (
                <button
                  className={classNames("btn", {
                    "btn-dark": selectedTab === TYPE_COURSE_ON_WATCH,
                  })}
                  onClick={() => setSelectedTab(2)}
                >
                  Trilha
                </button>
              )}
            </div>
            {selectedTab === TYPE_COURSE_ON_WATCH && (
              <>
                <div className="player__menu__header">
                  <h2>
                    <span className="pre-title">Curso</span> {title}
                  </h2>
                  <div className="progress-box">
                    Progresso
                    <span>{progress || 0}%</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                {modulesState.length > 1 ? (
                  modulesState.map(({ id, title, lectures = [] }, index) => (
                    <div
                      key={id}
                      className={classNames("player__menu__module", {
                        "player__menu__module--open": isModuleOpen[id],
                        player__menu__module: !isModuleOpen[id],
                      })}
                      onClick={() => {
                        toggleModuleOpenState(id);
                      }}
                    >
                      <button className="player__menu__module__header">
                        <h3>
                          <span className="pre-title">
                            Módulo {index + 1}:{" "}
                          </span>
                          {title}
                        </h3>
                        <span className="text-xs">
                          {lectures.reduce(
                            (prev, curr) => prev + Number(curr.watched),
                            0
                          )}
                          /{lectures.length} concluídos
                        </span>
                        <span className="btn btn-arrow-b" />
                      </button>

                      <div className="player__menu__module__content" name={id}>
                        {lectures.map(
                          (
                            {
                              id,
                              title,
                              watched,
                              content,
                              duration,
                              type: lectureType,
                            },
                            index
                          ) => (
                            <button
                              tabIndex="0"
                              ref={(el) => itemsRef.current.set(id, el)}
                              key={id}
                              className={classNames(
                                "player__menu__module__item",
                                {
                                  complete: watched,
                                  started:
                                    watched ||
                                    content === selectedLecture?.content,
                                  active: content === selectedLecture?.content,
                                }
                              )}
                              onClick={(e) =>
                                handleSelectLecture(e, {
                                  id,
                                  content,
                                  watched,
                                  type: lectureType,
                                })
                              }
                            >
                              <p>
                                <strong>{index + 1}. </strong>
                                {title}
                              </p>
                              <span className="text-xs">{duration}</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="player__menu__module player__menu__module--single"
                    name={`module-${modulesState[0]?.id}`}
                  >
                    {modulesState[0]?.lectures?.map(
                      (
                        {
                          id,
                          title,
                          content,
                          duration,
                          watched,
                          type: lectureType,
                        },
                        index
                      ) => (
                        <button
                          tabIndex="0"
                          ref={(el) => itemsRef.current.set(id, el)}
                          key={id}
                          className={classNames("player__menu__module__item", {
                            complete: watched,
                            started:
                              watched || content === selectedLecture?.content,
                            active: content === selectedLecture?.content,
                          })}
                          onClick={(e) =>
                            handleSelectLecture(e, {
                              id,
                              content,
                              watched,
                              type: lectureType,
                            })
                          }
                        >
                          <p>
                            <strong>{index + 1}. </strong>
                            {title}
                          </p>
                          <span className="text-xs">{duration}</span>
                        </button>
                      )
                    )}
                  </div>
                )}
              </>
            )}
            {selectedTab === 2 && (
              <>
                <div className="player__menu__header">
                  <h2>
                    <span className="pre-title">Trilha</span> {track.title}
                  </h2>
                </div>
                {track.enrollments.map(
                  ({
                    enrollmentId,
                    courseTitle,
                    courseSubtitle,
                    enrollmentProgress,
                  }) => (
                    <div
                      onClick={() =>
                        handleSelectCourse(watchCourseId, enrollmentId)
                      }
                      key={enrollmentId}
                      className={classNames("player__menu__trail-item", {
                        started: enrollmentProgress > 0,
                        active: enrollmentId === watchId,
                      })}
                    >
                      <div className="player__menu__trail-item__title">
                        <h3>{courseTitle}</h3>
                        <span className="text-xs">{courseSubtitle}</span>
                      </div>
                      <div className="player__menu__trail-item__number">
                        {enrollmentProgress}%
                        <div className="text-xxs">concluído</div>
                      </div>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </section>
      <section className="mb-60">
        <div className="container">
          <div className="row">
            <div className="col-sm-7 col-md-8 col-lg-9">
              <h2 className="primary">{title}</h2>
              <p>{description}</p>
              {attachments.length > 0 && (
                <>
                  <h3>Recursos Adicionais</h3>
                  <div className="row">
                    <div className="col-md-6">
                      {attachments.map(({ id, title }, index) => (
                        <p key={id} className="material-link">
                          {index + 1}. {title}
                          <span
                            className="btn btn-link"
                            onClick={() => handleDownloadFile(id)}
                          >
                            Abrir
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="col-sm-5 col-md-4 col-lg-3">
              {attachments?.map(({ type, id, title }) =>
                type !== TYPE_EBOOK ? null : (
                  <React.Fragment key={id}>
                    {" "}
                    <span
                      className="btn btn-box"
                      onClick={() => handleDownloadFile(id)}
                    >
                      <div className="btn-box__img">
                        <img src={ebook} alt="" />
                      </div>

                      <p>Baixe o ebook do curso</p>
                      <p> {title}</p>
                    </span>
                  </React.Fragment>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
const ScoWatch = withScorm()(Watch);

export default ScoWatch;
