"use client";
import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/facemesh";
import Webcam from "react-webcam";
import { drawMesh } from "../utilities";
import { CiLocationArrow1 } from "react-icons/ci";

export default function FaceDitection() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [leftvalue, setLeftValue] = useState(0);
  const [rightvalue, setRightValue] = useState(0);
  const [faceAngle, setFaceAngle] = useState(0);
  const [audioCtx, setAudioCtx] = useState(null);
  const [panNode, setPanNode] = useState(null);
  const [panControlValue, setPanControlValue] = useState(0);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);

  useEffect(() => {
    const audioElt = document.querySelector("audio");

    const setupAudioContext = () => {
      if (!audioCtx) {
        const newAudioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
        setAudioCtx(newAudioCtx);
      }
    };

    const setupPanningNode = () => {
      if (audioCtx && !panNode) {
        const source = audioCtx.createMediaElementSource(audioElt);
        const newPanNode = audioCtx.createStereoPanner();
        setPanNode(newPanNode);

        source.connect(newPanNode);
        newPanNode.connect(audioCtx.destination);
      }
    };

    setupAudioContext();
    setupPanningNode();

    return () => {
      audioElt.removeEventListener("play", handlePlay);
    };
  }, [audioCtx]);

  useEffect(() => {
    if (panNode) {
      panNode.pan.value = panControlValue || 0;
    }
  }, [panNode, panControlValue]);

  const handlePlay = () => {
    setAudioIsPlaying(true);
    if (audioCtx.state !== "running") {
      audioCtx.resume().then(() => {
        console.log("Playback resumed successfully");
      });
    }
  };

  const handlePause = () => {
    setAudioIsPlaying(false);
  };

  useEffect(() => {
    const audioElt = document.querySelector("audio");

    audioElt.addEventListener("play", handlePlay);
    audioElt.addEventListener("pause", handlePause);

    return () => {
      audioElt.removeEventListener("play", handlePlay);
      audioElt.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    if (audioIsPlaying && audioCtx) {
      const audioElt = document.querySelector("audio");
      audioElt.play();
    }
  }, [audioIsPlaying, audioCtx]);

  const runFacemesh = async () => {
    const net = await facemesh.load({
      inputResolution: { width: 1280, height: 720 },
      maxFaces: 1,
      scale: 0.8,
    });

    setInterval(() => {
      detect(net);
    }, 10);
  };

  const initialXRef = useRef(null);

  const calculateYawAndPitch = (landmarks) => {
    if (initialXRef.current === null) {
      initialXRef.current = landmarks[0][0];
    }

    const currentX = landmarks[0][0];
    const deltaX = currentX - initialXRef.current;

    const yawRotation = mapTo180Degrees(deltaX);
    setFaceAngle(yawRotation);
    return yawRotation;
  };

  const mapTo180Degrees = (x) => {
    const scalingFactor = 90 / 100;
    const degrees = x * scalingFactor;
    return Math.min(Math.max(90 - degrees, 0), 180);
  };

  const audioBalancerUI = (yaw) => {
    const normalizedYaw = yaw - 90;
    const normalizedValue = normalizedYaw / 180;

    const rightVolume = Math.max(0.5 - normalizedValue, 0) + 0.1;
    const leftVolume = Math.max(0.5 + normalizedValue, 0) + 0.1;

    setLeftValue(leftVolume.toFixed(3));
    setRightValue(rightVolume.toFixed(3));
    setPanControlValue(parseFloat(normalizedValue * -2));
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const face = await net.estimateFaces(video);
      var yaw;
      try {
        yaw = calculateYawAndPitch(face[0].scaledMesh);
      } catch (e) {}

      audioBalancerUI(yaw);

      const ctx = canvasRef.current.getContext("2d");
      requestAnimationFrame(() => {
        drawMesh(face, ctx);
      });
    }
  };

  useEffect(() => {
    runFacemesh();
  }, []);

  return (
    <>
      <div className="flex justify-center gap-10 ">
        <div>
          <div className="flex flex-col bg-gray-900 justify-center items-center w-52 h-80 rounded-2xl gap-7">
            <h3> Audio Channels Gain </h3>

            <div className="flex gap-12">
              <div className="items-center">
                <h3 className="text-center text-slate-400"> Left</h3>

                <div className="w-8 h-48 ml-4 bg-green-500 rounded-full overflow-hidden mt-2">
                  <div
                    style={{
                      height: `${(1 - leftvalue) * 100}%`,
                      transitionTimingFunction: "ease-in-out",
                      transition: "0.2s",
                    }}
                    className="h-full bg-gray-800"
                  ></div>
                </div>
              </div>

              <div className="items-center">
                <h3 className="text-center text-slate-400"> Right</h3>

                <div className="w-8 h-48 ml-4 bg-green-500 rounded-full overflow-hidden mt-2">
                  <div
                    style={{
                      height: `${(1 - rightvalue) * 100}%`,
                      transitionTimingFunction: "ease-in-out",
                      transition: "0.2s",
                    }}
                    className="h-full bg-gray-800"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-col mt-5 bg-gray-900 justify-center items-center flex w-52 h-52 rounded-2xl gap-2">
            <h3> Face Rotation </h3>
            <CiLocationArrow1
              size={100}
              style={{
                rotate: `${-135 + faceAngle}deg`,
                transitionTimingFunction: "ease-in-out",
                transition: "0.2s",
              }}
              className="mt-4"
            />
            <h4 className="text-center text-slate-400">
              {" "}
              {Math.round(faceAngle)}°
            </h4>
          </div>{" "}
        </div>
        <div>
          <div className="relative">
            {" "}
            <Webcam
              ref={webcamRef}
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zIndex: 9,
                width: 640,
                height: 480,
                borderRadius: 20,
              }}
              mirrored={true}
            />
            <canvas
              ref={canvasRef}
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: -480,
                left: 0,
                right: 0,
                textAlign: "center",
                zIndex: 9,
                width: 640,
                height: 480,
                transform: "scaleX(-1)", // Apply horizontal mirroring
              }}
            />
          </div>

          <div className="flex justify-center mt-5">
            <audio
              controls
              style={{
                width: "100%",
              }}
              onClick={() => {
                if (!audioCtx) {
                  const newAudioCtx = new (window.AudioContext ||
                    window.webkitAudioContext)();
                  setAudioCtx(newAudioCtx);
                }
              }}
            >
              <source src="/resources/audio.ogg" type="audio/ogg" />
              <source src="/resources/audio.mp3" type="audio/mp3" />
            </audio>
          </div>
          <div className=" justify-center flex items-center mt-2">
            <p className=" text-slate-400">
              {" "}
              Audio From :{" "}
              <a
                href="https://www.youtube.com/watch?v=XQkvG0W8xEs"
                target="_blank"
              >
                {" "}
                Yaxer - Gajaga Wannama EDM Remix{" "}
              </a>
            </p>
          </div>
          <div className=" mt-10">
            <h2> About the project </h2>
            <p className="text-slate-400 mt-5">
              {" "}
              This is an experimental website for spatial audio using
              TensorflowJS Face-Landmarks-Detection. <br />
              Curruntly the yaw rotation of the face is used to control the
              audio panning. <br />
              <br />
              <b>
                Google Chrome and Headphones/Buds are recommended for the best
                experience. <br/>
              </b>
              We do not store any data from the user. All the renderings are happening on the client side.

            </p>
          </div>
        </div>
      </div>
    </>
  );
}
