import React, { useRef, useState, useEffect, useMemo } from "react";
import videojs from "video.js";
import "./index.css";
import { getOne } from "../../api/video";
import {
  selectQuality,
  connectionSpeed,
  getSources,
  interceptRequest,
} from "./utils";
import "video.js/dist/video-js.css";
import "videojs-hls-quality-selector/dist/videojs-hls-quality-selector.css";
import "videojs-resolution-switcher/lib/videojs-resolution-switcher.css";
import "@silvermine/videojs-quality-selector/dist/css/quality-selector.css";
import "videojs-contrib-quality-levels";
import "videojs-http-source-selector";

const ptBR = require("../../../node_modules/video.js/dist/lang/pt-BR.json");

const VideoPlayer = ({
  files,
  videoTracks,
  content,
  handleVideoEnd,
  currentUser,
  handleChangeSpeed,
  handleChangeResolution,
}) => {
  const [src, setSrc] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolutions, setResolutions] = useState([
    "1080p",
    "720p",
    "540p",
    "360p",
    "240p",
  ]);
  const [autoSrc, setAutoSrc] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayerRef = useRef(null);

  //translate player to portuguese
  videojs.addLanguage("pt-br", ptBR);

  //change the connection info according to the browser
  const connection = useMemo(() => {
    var defaultSpeed = false,
      navigator = window.navigator,
      connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection ||
        null;
    if (connection) {
      defaultSpeed = connectionSpeed(connection);
    }
    return defaultSpeed;
  }, []);

  const [currentBandwidth, setBandwidth] = useState(
    selectQuality(connection, resolutions)
  );

  //set initial resolution according to the connection
  useEffect(() => {
    const quality = selectQuality(connection, resolutions);
    setBandwidth(quality);
  }, [connection, resolutions]);

  //initial video configurations
  const videoJSOptions = {
    fluid: true,
    controls: true,
    autoplay: true,
    userActions: { hotkeys: true },
    playbackRates: [0.5, 1, 1.5, 2],
    html5: {
      vhs: {
        cacheEncryptionKeys: true,
      },
    },
    plugins: {
      videoJsResolutionSwitcher: {
        default: currentUser?.preferences
          ? currentUser?.preferences[0]?.resolutionVideo
          : "high",
        dynamicLabel: true,
      },
      httpSourceSelector: {
        default: "auto",
      },
    },
    textTrackSettings: false,
    language: "pt-br",
  };

  //initializing the sources
  useEffect(() => {
    const onLoadPlayer = async () => {
      setLoading(true);
      //identify that is passing the files by props
      if (!files) {
        const response = await getOne(content);
        var { mp4sources, streamSources } = getSources(
          response?.data?.data?.files
        );
        setTracks(response?.data?.data?.tracks);
      } else {
        // eslint-disable-next-line no-redeclare
        var { mp4sources, streamSources } = getSources(files);
        setTracks(videoTracks);
      }

      setStream(streamSources);
      setSrc(mp4sources);
      const qualitys = mp4sources.map((item) => {
        return item.label;
      });
      setResolutions(qualitys);
      setLoading(false);
    };
    onLoadPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, files]);

  //defining which source will be used
  useEffect(() => {
    let auto;
    //identify if has auto src
    auto = src?.find((item) => item.label === currentBandwidth);

    //check if player apresented errors

    const playerWithError = localStorage.getItem("playerWithError");

    if (!loading)
      if (stream && window.MediaSource && !playerWithError) {
        //case has stream source and browser support MSE
        //case browser support connection funcionality
        connection
          ? auto &&
            setAutoSrc([
              stream,
              {
                src: auto?.src,
                type: auto?.type,
                label: `auto`,
              },
              ...src,
            ])
          : setAutoSrc([stream, ...src]);
      } else if (src) {
        setStream(null);
        //case browser support connection funcionality
        if (connection)
          auto &&
            setAutoSrc([
              {
                src: auto?.src,
                type: auto?.type,
                label: `auto`,
              },
              ...src,
            ]);
        //case not set default resolution on 540p
        else {
          videoJSOptions.plugins = {
            videoJsResolutionSwitcher: {
              default: currentUser?.preferences
                ? currentUser?.preferences[0]?.resolutionVideo
                : "540",
              dynamicLabel: true,
            },
            httpSourceSelector: {
              default: "auto",
            },
          };
          setAutoSrc([...src]);
        }
      }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, stream, content, currentBandwidth, loading]);
  useEffect(() => {
    if (videoPlayerRef && autoSrc && !loading) {
      if (window) window.videojs = videojs;
      require("@xiaoyexiang/videojs-resolution-switcher-v7");

      //creating the player
      var player = videojs(videoPlayerRef.current, videoJSOptions, () => {
        //disable click event on progress bar
        if (process.env.REACT_APP_DISABLE_PROGRESS_CONTROL)
          player.controlBar.progressControl.disable();

        player.src(autoSrc);

        player.ready(function () {
          if (player.currentType() === "video/mp4") setStream(null);

          if (
            currentUser?.preferences &&
            currentUser?.preferences[0] &&
            currentUser?.preferences[0].videoSpeed
          ) {
            player.playbackRate(currentUser?.preferences[0].videoSpeed);
          }
          //initialize player withoufullscreen
          player.playsinline(true);

          var promise = player.play();

          player.bigPlayButton.hide();

          if (promise !== undefined) {
            player.currentTime(0);
            promise.then(function () {
              player.play();
              setLoading(true);
            });
            promise.catch(function () {
              player.play();
              setLoading(true);
            });
          }

          //Intercepts requests made by videojs to add a authentication
          interceptRequest(this.tech().vhs);
        });

        //generating subtitles
        var oldTracks = player.remoteTextTracks();
        var l = oldTracks.length;
        while (l--) {
          player.removeRemoteTextTrack(oldTracks[l]);
        }
        tracks.map((track) => {
          return player.addRemoteTextTrack({
            id: track?.id,
            src: track?.url,
            kind: "captions",
            srclang: track?.language_code,
            label: track?.language,
          });
        });

        player.on("pause", function () {
          player.bigPlayButton.show();
        });

        //change resolution preference
        player.on("loadeddata", function (event) {
          if (handleChangeResolution) {
            if (
              player.currentSource().res &&
              player.currentSource().res !==
                currentUser?.preferences[0]?.resolutionVideo
            ) {
              handleChangeResolution(player.currentSource().res);
            }
          } else {
            if (player.currentSource().res)
              localStorage.setItem("preferences", player.currentSource().res);
          }
        });
        //change video speed preference
        player.on("ratechange", (data) => {
          const playbackRate = player.playbackRate();
          if (
            currentUser?.preferences &&
            currentUser?.preferences[0] &&
            currentUser?.preferences[0].videoSpeed !== playbackRate
          ) {
            handleChangeSpeed(playbackRate);
          }
        });

        //only mp4
        if (!stream) {
          player.updateSrc(autoSrc);

          player.currentTime(currentTime);

          player.on("timeupdate", () => {
            setCurrentTime(player.currentTime());
          });
          player.on("waiting", () => {
            const connection =
              navigator.connection ||
              navigator.mozConnection ||
              navigator.webkitConnection ||
              null;
            if (connection) {
              var defaultSpeed = connectionSpeed(connection);
              const quality = selectQuality(defaultSpeed, resolutions);

              setBandwidth(quality);
            }
          });
          //only http-streaming
        } else {
          player.qualityLevels();
          //Adds a quality selector for the hls source to the player
          player.httpSourceSelector();
        }
        //verify that error happens and then change to mp4 source
        player.on("error", function () {
          if (player.error()) {
            //check if browser has local storage
            if (typeof Storage !== "undefined") {
              setStream(null);
              //set a flag to identify player that show errors
              localStorage.setItem("playerWithError", true);
            } else {
              setStream(null);
            }
          }
        });

        player.off("ended");
        player.on("ended", (data) => {
          setCurrentTime(0);
          handleVideoEnd(data);
        });
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSrc, content, currentBandwidth, loading]);

  return (
    <div>
      <video
        className="vjs-descola video-js vjs-show-big-play-button-on-pause"
        crossorigin="anonymous"
        ref={videoPlayerRef}
      ></video>
    </div>
  );
};

export default VideoPlayer;
